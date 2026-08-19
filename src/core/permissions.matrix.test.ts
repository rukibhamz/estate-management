import { describe, expect, it } from "vitest";
import { CAPABILITIES, PROJECT_ROLES, enumeratePermissionCases } from "./permissions";
import { assertProjectAccess, type MembershipSnapshot } from "./access";
import { ForbiddenError } from "./errors";

function membership(role: MembershipSnapshot["role"], scopes: MembershipSnapshot["scopes"] = []): MembershipSnapshot {
  return {
    userId: "user-1",
    projectId: "p1",
    role,
    status: "ACTIVE",
    scopes,
  };
}

describe("Spec §4.6 permission matrix", () => {
  const cases = enumeratePermissionCases();

  it("covers every capability × role cell", () => {
    expect(cases.length).toBe(CAPABILITIES.length * PROJECT_ROLES.length);
  });

  it.each(cases)("$role × $capability => $allowed", ({ role, capability, allowed }) => {
    const run = () => assertProjectAccess(membership(role), capability);
    if (allowed) {
      expect(run).not.toThrow();
    } else {
      expect(run).toThrow(ForbiddenError);
    }
  });

  it("denies inactive memberships even when the role would allow", () => {
    const inactive = { ...membership("OWNER_ADMIN"), status: "REMOVED" as const };
    expect(() => assertProjectAccess(inactive, "estate.write")).toThrow(ForbiddenError);
  });

  it("enforces Site Manager assigned scope", () => {
    const scoped = membership("SITE_MANAGER", [{ estateId: "e1", developmentId: null }]);
    expect(() =>
      assertProjectAccess(scoped, "unit.write", { estateId: "e1" }),
    ).not.toThrow();
    expect(() =>
      assertProjectAccess(scoped, "unit.write", { estateId: "e2" }),
    ).toThrow(ForbiddenError);
  });
});
