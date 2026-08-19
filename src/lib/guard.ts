import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { ForbiddenError, NotFoundError } from "@/core/errors";
import { assertProjectAccess, type AccessResource, type MembershipSnapshot } from "@/core/access";
import type { Capability, ProjectRole } from "@/core/permissions";
import { AUDIT_ACTIONS, type AuditAction } from "@/core/audit";
import { Prisma } from "@prisma/client";

export async function authSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await authSession();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function loadMembership(userId: string, projectId: string): Promise<MembershipSnapshot | null> {
  const row = await prisma.projectMembership.findFirst({
    where: { projectId, userId, status: "ACTIVE" },
    include: { scopes: true },
  });
  if (!row) return null;
  return {
    userId,
    projectId,
    role: row.role as ProjectRole,
    status: row.status,
    scopes: row.scopes.map((s) => ({ estateId: s.estateId, developmentId: s.developmentId })),
  };
}

export async function requireCapability(
  userId: string,
  projectId: string,
  capability: Capability,
  resource?: AccessResource,
) {
  const membership = await loadMembership(userId, projectId);
  assertProjectAccess(membership, capability, resource);
  return membership!;
}

export async function writeAuditLog(input: {
  projectId: string;
  recordType: string;
  recordId: string;
  action: AuditAction | string;
  changedBy: string;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
}) {
  await prisma.statusActivityLog.create({
    data: {
      projectId: input.projectId,
      recordType: input.recordType,
      recordId: input.recordId,
      action: input.action,
      changedBy: input.changedBy,
      oldValue: input.oldValue ?? Prisma.JsonNull,
      newValue: input.newValue ?? Prisma.JsonNull,
    },
  });
}

export { AUDIT_ACTIONS, ForbiddenError, NotFoundError };
