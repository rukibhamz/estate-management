import { DomainError, ForbiddenError } from "./errors";

export type CommercialStatus = "RESERVED" | "ALLOCATED" | "SOLD" | "CANCELLED";
export type UnitStatus =
  | "UNDER_CONSTRUCTION"
  | "AVAILABLE"
  | "RESERVED"
  | "ALLOCATED"
  | "SOLD"
  | "UNDER_MAINTENANCE";
export type LandStatus = "HELD_OWNED" | "AVAILABLE" | "RESERVED" | "UNDER_DEVELOPMENT" | "SOLD";

const ALLOWED: Record<CommercialStatus, CommercialStatus[]> = {
  RESERVED: ["ALLOCATED", "CANCELLED"],
  ALLOCATED: ["SOLD", "CANCELLED"],
  SOLD: ["RESERVED", "ALLOCATED", "CANCELLED"],
  CANCELLED: ["RESERVED"],
};

export function assertSaleAssetXor(unitId?: string | null, landId?: string | null) {
  const hasUnit = Boolean(unitId);
  const hasLand = Boolean(landId);
  if (hasUnit === hasLand) {
    throw new DomainError("Sale must link to exactly one of unitId or landId", "SALE_ASSET_XOR");
  }
}

export function assertCommercialTransition(input: {
  from: CommercialStatus;
  to: CommercialStatus;
  actorIsOwnerAdmin: boolean;
  reason?: string | null;
}) {
  if (input.from === input.to) return;
  if (!ALLOWED[input.from].includes(input.to)) {
    throw new DomainError(
      `Cannot transition ${input.from} → ${input.to}`,
      "INVALID_SALE_TRANSITION",
    );
  }
  if (input.from === "SOLD") {
    if (!input.actorIsOwnerAdmin) {
      throw new ForbiddenError("Only Owner/Admin can reopen a SOLD sale");
    }
    if (!input.reason?.trim()) {
      throw new DomainError("Reason required to leave SOLD", "REASON_REQUIRED");
    }
  }
  if (input.to === "CANCELLED" && !input.reason?.trim()) {
    throw new DomainError("Cancellation reason is required", "REASON_REQUIRED");
  }
}

export function inventoryOnHold(kind: "UNIT", commercial: CommercialStatus): UnitStatus;
export function inventoryOnHold(kind: "LAND", commercial: CommercialStatus): LandStatus;
export function inventoryOnHold(kind: "UNIT" | "LAND", commercial: CommercialStatus) {
  if (kind === "LAND") return "RESERVED" as LandStatus;
  return (commercial === "ALLOCATED" ? "ALLOCATED" : "RESERVED") as UnitStatus;
}

export function restoreInventoryStatus<T extends string>(previous: T | null, fallback: T): T {
  return previous ?? fallback;
}
