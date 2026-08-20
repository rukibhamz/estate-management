import crypto from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, NotFoundError, ConflictError, DomainError } from "@/core/errors";
import type { OrganizationType, TenantRole } from "@prisma/client";
import { tenantRoleCanInvite, tenantRoleToProjectRole } from "@/core/tenant";
import { sendOrganizationInviteEmail } from "@/server/email";

export async function loadActiveOrgMembership(userId: string, organizationId: string) {
  return prisma.organizationMembership.findFirst({
    where: { userId, organizationId, status: "ACTIVE" },
  });
}

export async function requireOrgAdmin(userId: string, organizationId: string) {
  const membership = await loadActiveOrgMembership(userId, organizationId);
  if (!membership || !tenantRoleCanInvite(membership.role)) {
    throw new ForbiddenError("Only an organization owner or admin can do that.");
  }
  return membership;
}

export async function listUserOrganizations(userId: string) {
  return prisma.organization.findMany({
    where: { members: { some: { userId, status: "ACTIVE" } } },
    orderBy: { name: "asc" },
    include: {
      subscription: true,
      _count: { select: { members: true, projects: true } },
      members: {
        where: { status: "ACTIVE" },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getPrimaryOrganization(userId: string) {
  const orgs = await listUserOrganizations(userId);
  return orgs[0] ?? null;
}

export async function createOrganizationForUser(
  userId: string,
  input: { name: string; type: OrganizationType },
) {
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 14);

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: input.name.trim(), type: input.type },
    });
    await tx.organizationMembership.create({
      data: {
        organizationId: organization.id,
        userId,
        role: "OWNER",
        status: "ACTIVE",
      },
    });
    await tx.subscription.create({
      data: {
        organizationId: organization.id,
        plan: "TRIAL",
        status: "TRIALING",
        seats: 5,
        currentPeriodEnd: periodEnd,
      },
    });
    return organization;
  });
}

async function syncProjectMemberships(organizationId: string, userId: string, tenantRole: TenantRole) {
  const projectRole = tenantRoleToProjectRole(tenantRole);
  const projects = await prisma.project.findMany({
    where: { organizationId },
    select: { id: true },
  });
  for (const project of projects) {
    const existing = await prisma.projectMembership.findFirst({
      where: { projectId: project.id, userId, status: { in: ["ACTIVE", "PENDING"] } },
    });
    if (!existing) {
      await prisma.projectMembership.create({
        data: { projectId: project.id, userId, role: projectRole, status: "ACTIVE" },
      });
    }
  }
}

export async function inviteOrganizationMember(
  actorId: string,
  organizationId: string,
  input: { email: string; role: TenantRole },
) {
  await requireOrgAdmin(actorId, organizationId);
  const email = input.email.toLowerCase().trim();
  if (!email) throw new DomainError("Email is required", "BAD_EMAIL");

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { subscription: true, members: { where: { status: "ACTIVE" } } },
  });
  if (!org) throw new NotFoundError();

  const seats = org.subscription?.seats ?? 1;
  const pendingInvites = await prisma.organizationInvitation.count({
    where: { organizationId, acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  if (org.members.length + pendingInvites >= seats) {
    throw new DomainError("No seats available on this plan. Upgrade seats or remove a member.", "NO_SEATS");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const member = await prisma.organizationMembership.findFirst({
      where: { organizationId, userId: existingUser.id, status: "ACTIVE" },
    });
    if (member) throw new ConflictError("User is already in this organization");
  }

  const duplicateInvite = await prisma.organizationInvitation.findFirst({
    where: {
      organizationId,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (duplicateInvite) throw new ConflictError("An invite is already pending for this email");

  if (existingUser) {
    await prisma.organizationMembership.create({
      data: {
        organizationId,
        userId: existingUser.id,
        role: input.role,
        status: "ACTIVE",
      },
    });
    await syncProjectMemberships(organizationId, existingUser.id, input.role);
    return { immediate: true as const, userId: existingUser.id };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.organizationInvitation.create({
    data: {
      organizationId,
      email,
      role: input.role,
      tokenHash,
      invitedById: actorId,
      expiresAt,
    },
  });

  await sendOrganizationInviteEmail({
    email,
    organizationName: org.name,
    role: input.role,
    token,
  });

  return { immediate: false as const };
}

export async function acceptOrganizationInvite(token: string, userId: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invite = await prisma.organizationInvitation.findUnique({
    where: { tokenHash },
    include: { organization: true },
  });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    throw new DomainError("Invite link is invalid or expired", "INVITE_INVALID");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new ForbiddenError("Sign in with the invited email address to accept.");
  }

  const existing = await prisma.organizationMembership.findFirst({
    where: { organizationId: invite.organizationId, userId, status: "ACTIVE" },
  });
  if (existing) {
    await prisma.organizationInvitation.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
    return invite.organization;
  }

  await prisma.$transaction([
    prisma.organizationMembership.create({
      data: {
        organizationId: invite.organizationId,
        userId,
        role: invite.role,
        status: "ACTIVE",
      },
    }),
    prisma.organizationInvitation.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  await syncProjectMemberships(invite.organizationId, userId, invite.role);
  return invite.organization;
}

export async function getInviteByToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invite = await prisma.organizationInvitation.findUnique({
    where: { tokenHash },
    include: { organization: true },
  });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) return null;
  return invite;
}

export async function listPlatformOrganizations(actorId: string, query?: string) {
  const { requirePlatformAdmin } = await import("@/server/platform");
  await requirePlatformAdmin(actorId);
  const q = query?.trim();
  return prisma.organization.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { members: { some: { user: { OR: [{ email: { contains: q } }, { name: { contains: q } }] } } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      _count: { select: { projects: true, members: true } },
      members: {
        where: { status: "ACTIVE" },
        include: { user: { select: { id: true, name: true, email: true, isPlatformAdmin: true, createdAt: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function changeOrganizationMemberRole(
  actorId: string,
  organizationId: string,
  membershipId: string,
  role: TenantRole,
) {
  await requireOrgAdmin(actorId, organizationId);
  const membership = await prisma.organizationMembership.findFirst({
    where: { id: membershipId, organizationId, status: "ACTIVE" },
  });
  if (!membership) throw new NotFoundError();
  if (membership.role === "OWNER" && role !== "OWNER") {
    const owners = await prisma.organizationMembership.count({
      where: { organizationId, role: "OWNER", status: "ACTIVE" },
    });
    if (owners <= 1) throw new DomainError("Organization must keep at least one owner", "LAST_OWNER");
  }
  const updated = await prisma.organizationMembership.update({
    where: { id: membershipId },
    data: { role },
  });
  if (updated.userId) {
    await syncProjectMemberships(organizationId, updated.userId, role);
  }
  return updated;
}

export async function removeOrganizationMember(
  actorId: string,
  organizationId: string,
  membershipId: string,
) {
  await requireOrgAdmin(actorId, organizationId);
  const membership = await prisma.organizationMembership.findFirst({
    where: { id: membershipId, organizationId, status: "ACTIVE" },
  });
  if (!membership) throw new NotFoundError();
  if (membership.userId === actorId) {
    throw new ForbiddenError("You cannot remove yourself. Transfer ownership first.");
  }
  if (membership.role === "OWNER") {
    const owners = await prisma.organizationMembership.count({
      where: { organizationId, role: "OWNER", status: "ACTIVE" },
    });
    if (owners <= 1) throw new DomainError("Organization must keep at least one owner", "LAST_OWNER");
  }
  await prisma.organizationMembership.update({
    where: { id: membershipId },
    data: { status: "REMOVED" },
  });
  if (membership.userId) {
    await prisma.projectMembership.updateMany({
      where: { userId: membership.userId, project: { organizationId }, status: "ACTIVE" },
      data: { status: "REMOVED" },
    });
  }
}

export async function registerWithOrganization(input: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  organizationType: OrganizationType;
}) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError("Email already registered");

  const passwordHash = await hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name.trim(), email, passwordHash },
  });

  await createOrganizationForUser(user.id, {
    name: input.organizationName.trim(),
    type: input.organizationType,
  });

  await acceptPendingInvites(user.id, email);
  await acceptPendingProjectInvites(user.id, email);

  return user;
}

async function acceptPendingInvites(userId: string, email: string) {
  const invites = await prisma.organizationInvitation.findMany({
    where: { email, acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  for (const invite of invites) {
    await prisma.organizationMembership.create({
      data: {
        organizationId: invite.organizationId,
        userId,
        role: invite.role,
        status: "ACTIVE",
      },
    });
    await prisma.organizationInvitation.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
    await syncProjectMemberships(invite.organizationId, userId, invite.role);
  }
}

async function acceptPendingProjectInvites(userId: string, email: string) {
  const pending = await prisma.projectMembership.findMany({
    where: { invitedEmail: email, userId: null, status: { in: ["ACTIVE", "PENDING"] } },
  });
  for (const invite of pending) {
    await prisma.projectMembership.update({
      where: { id: invite.id },
      data: { userId, status: "ACTIVE" },
    });
  }
}
