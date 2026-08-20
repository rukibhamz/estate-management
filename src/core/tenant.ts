import type { ProjectRole, TenantRole } from "@prisma/client";

export const TENANT_ROLES: TenantRole[] = ["OWNER", "ADMIN", "MEMBER", "CUSTOMER", "VIEWER"];

export const TENANT_ROLE_LABELS: Record<TenantRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  CUSTOMER: "Customer",
  VIEWER: "Viewer",
};

export function tenantRoleCanInvite(role: TenantRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function tenantRoleToProjectRole(role: TenantRole): ProjectRole {
  switch (role) {
    case "OWNER":
    case "ADMIN":
      return "OWNER_ADMIN";
    case "MEMBER":
      return "PROJECT_MANAGER";
    case "CUSTOMER":
    case "VIEWER":
    default:
      return "VIEWER";
  }
}
