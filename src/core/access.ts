import { ForbiddenError } from "./errors";
import {
  type Capability,
  type ProjectRole,
  SCOPED_ROLES,
  roleAllows,
} from "./permissions";

export type ScopeRow = {
  estateId: string | null;
  developmentId: string | null;
};

export type AccessResource = {
  estateId?: string | null;
  developmentId?: string | null;
};

export type MembershipSnapshot = {
  userId: string;
  projectId: string;
  role: ProjectRole;
  status: "ACTIVE" | "REMOVED" | "PENDING";
  scopes: ScopeRow[];
};

export function isResourceInScope(scopes: ScopeRow[], resource?: AccessResource) {
  if (scopes.length === 0) return true;
  if (!resource) return true;
  return scopes.some((scope) => {
    if (scope.estateId && resource.estateId && scope.estateId === resource.estateId) {
      return true;
    }
    if (
      scope.developmentId &&
      resource.developmentId &&
      scope.developmentId === resource.developmentId
    ) {
      return true;
    }
    return false;
  });
}

export function assertProjectAccess(
  membership: MembershipSnapshot | null,
  capability: Capability,
  resource?: AccessResource,
) {
  if (!membership || membership.status !== "ACTIVE") {
    throw new ForbiddenError("No active membership for this project");
  }
  if (!roleAllows(membership.role, capability)) {
    throw new ForbiddenError(`Role ${membership.role} cannot ${capability}`);
  }
  if (SCOPED_ROLES.includes(membership.role) && membership.scopes.length > 0) {
    if (!isResourceInScope(membership.scopes, resource)) {
      throw new ForbiddenError("Outside assigned estate/development scope");
    }
  }
}
