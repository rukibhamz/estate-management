import { hash, compare } from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireUser, writeAuditLog } from "@/lib/guard";
import { AUDIT_ACTIONS } from "@/core/audit";
import { ConflictError, DomainError, NotFoundError, ForbiddenError } from "@/core/errors";
import type { ProjectRole } from "@/core/permissions";
import { registerWithOrganization, getPrimaryOrganization, loadActiveOrgMembership } from "@/server/organizations";
import { sendPasswordResetEmail } from "@/server/email";
import type { OrganizationType } from "@prisma/client";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  organizationType: OrganizationType;
}) {
  return registerWithOrganization(input);
}

export async function requestPasswordReset(email: string) {
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) return;
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  await sendPasswordResetEmail(user.email, token);
  return token;
}

export async function resetPassword(token: string, password: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    throw new DomainError("Reset link is invalid or expired", "RESET_INVALID");
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: await hash(password, 12) },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

export async function updateProfile(userId: string, input: { name: string; password?: string; currentPassword?: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError();
  const data: { name: string; passwordHash?: string } = { name: input.name.trim() };
  if (input.password) {
    if (!input.currentPassword || !(await compare(input.currentPassword, user.passwordHash))) {
      throw new DomainError("Current password is incorrect", "BAD_PASSWORD");
    }
    data.passwordHash = await hash(input.password, 12);
  }
  return prisma.user.update({ where: { id: userId }, data });
}

export async function createProject(userId: string, input: {
  name: string;
  description?: string;
  location?: string;
  coverImage?: string;
}) {
  const org = await getPrimaryOrganization(userId);
  if (!org) throw new ForbiddenError("Join or create an organization before creating projects.");
  await loadActiveOrgMembership(userId, org.id);

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        organizationId: org.id,
        ownerId: userId,
        name: input.name.trim(),
        description: input.description,
        location: input.location,
        coverImage: input.coverImage,
      },
    });
    await tx.projectMembership.create({
      data: { projectId: created.id, userId, role: "OWNER_ADMIN", status: "ACTIVE" },
    });
    return created;
  });
  await writeAuditLog({
    projectId: project.id,
    recordType: "Project",
    recordId: project.id,
    action: AUDIT_ACTIONS.PROJECT_CREATE,
    changedBy: userId,
    newValue: { name: project.name },
  });
  return project;
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: { name?: string; description?: string; location?: string; coverImage?: string },
) {
  await requireCapability(userId, projectId, "project.update");
  const project = await prisma.project.update({
    where: { id: projectId },
    data: input,
  });
  await writeAuditLog({
    projectId,
    recordType: "Project",
    recordId: projectId,
    action: AUDIT_ACTIONS.PROJECT_UPDATE,
    changedBy: userId,
    newValue: input,
  });
  return project;
}

export async function archiveProject(userId: string, projectId: string) {
  await requireCapability(userId, projectId, "project.archive");
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: "ARCHIVED" },
  });
  await writeAuditLog({
    projectId,
    recordType: "Project",
    recordId: projectId,
    action: AUDIT_ACTIONS.PROJECT_ARCHIVE,
    changedBy: userId,
    oldValue: { status: "ACTIVE" },
    newValue: { status: "ARCHIVED" },
  });
  return project;
}

export async function listProjects(userId: string) {
  const orgIds = await prisma.organizationMembership.findMany({
    where: { userId, status: "ACTIVE" },
    select: { organizationId: true },
  });
  const ids = orgIds.map((row) => row.organizationId);
  if (ids.length === 0) return [];

  return prisma.project.findMany({
    where: {
      organizationId: { in: ids },
      memberships: { some: { userId, status: "ACTIVE" } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { id: true, name: true } },
      _count: { select: { units: true, lands: true, sales: true } },
    },
  });
}

export async function inviteMember(
  userId: string,
  projectId: string,
  input: { email: string; role: ProjectRole },
) {
  await requireCapability(userId, projectId, "member.invite");
  const email = input.email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  const duplicate = await prisma.projectMembership.findFirst({
    where: {
      projectId,
      status: { in: ["ACTIVE", "PENDING"] },
      OR: [{ userId: existingUser?.id }, { invitedEmail: email }],
    },
  });
  if (duplicate) throw new ConflictError("Member already invited");
  const membership = await prisma.projectMembership.create({
    data: {
      projectId,
      userId: existingUser?.id,
      invitedEmail: email,
      role: input.role,
      status: existingUser ? "ACTIVE" : "PENDING",
    },
  });
  await writeAuditLog({
    projectId,
    recordType: "ProjectMembership",
    recordId: membership.id,
    action: AUDIT_ACTIONS.MEMBER_INVITE,
    changedBy: userId,
    newValue: { email, role: input.role },
  });
  return membership;
}

async function activeOwnerCount(projectId: string) {
  return prisma.projectMembership.count({
    where: { projectId, role: "OWNER_ADMIN", status: "ACTIVE" },
  });
}

export async function changeMemberRole(
  userId: string,
  projectId: string,
  membershipId: string,
  role: ProjectRole,
) {
  await requireCapability(userId, projectId, "member.roleChange");
  const membership = await prisma.projectMembership.findFirst({
    where: { id: membershipId, projectId },
  });
  if (!membership) throw new NotFoundError();
  if (membership.role === "OWNER_ADMIN" && role !== "OWNER_ADMIN") {
    const owners = await activeOwnerCount(projectId);
    if (owners <= 1) throw new DomainError("Project must retain at least one Owner/Admin", "LAST_OWNER");
  }
  const updated = await prisma.projectMembership.update({
    where: { id: membershipId },
    data: { role },
  });
  await writeAuditLog({
    projectId,
    recordType: "ProjectMembership",
    recordId: membershipId,
    action: AUDIT_ACTIONS.MEMBER_ROLE_CHANGE,
    changedBy: userId,
    oldValue: { role: membership.role },
    newValue: { role },
  });
  return updated;
}

export async function removeMember(userId: string, projectId: string, membershipId: string) {
  await requireCapability(userId, projectId, "member.remove");
  const membership = await prisma.projectMembership.findFirst({
    where: { id: membershipId, projectId },
  });
  if (!membership) throw new NotFoundError();
  if (membership.role === "OWNER_ADMIN") {
    const owners = await activeOwnerCount(projectId);
    if (owners <= 1) throw new DomainError("Cannot remove the last Owner/Admin", "LAST_OWNER");
  }
  const updated = await prisma.projectMembership.update({
    where: { id: membershipId },
    data: { status: "REMOVED" },
  });
  await writeAuditLog({
    projectId,
    recordType: "ProjectMembership",
    recordId: membershipId,
    action: AUDIT_ACTIONS.MEMBER_REMOVE,
    changedBy: userId,
    oldValue: { status: membership.status },
    newValue: { status: "REMOVED" },
  });
  return updated;
}

export async function transferOwnership(userId: string, projectId: string, newOwnerUserId: string) {
  await requireCapability(userId, projectId, "ownership.transfer");
  const target = await prisma.projectMembership.findFirst({
    where: { projectId, userId: newOwnerUserId, status: "ACTIVE" },
  });
  if (!target) throw new NotFoundError("Target user is not an active member");
  await prisma.$transaction(async (tx) => {
    await tx.project.update({ where: { id: projectId }, data: { ownerId: newOwnerUserId } });
    await tx.projectMembership.update({
      where: { id: target.id },
      data: { role: "OWNER_ADMIN" },
    });
  });
  await writeAuditLog({
    projectId,
    recordType: "Project",
    recordId: projectId,
    action: AUDIT_ACTIONS.OWNERSHIP_TRANSFER,
    changedBy: userId,
    newValue: { ownerId: newOwnerUserId },
  });
}

export { requireUser };
