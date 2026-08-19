import { describe, expect, it } from "vitest";
import { rollupDevelopmentProgress, remainingUnitsToGenerate, computeBudgetVariance } from "./development";
import { recalculatePaymentStatus, assertRefundNote } from "./payments";
import { assertCommercialTransition, assertSaleAssetXor } from "./sales";
import { DomainError, ForbiddenError } from "./errors";

describe("rollupDevelopmentProgress", () => {
  it("matches the Phase 3 QA fixture (weights 1,2,3)", () => {
    expect(
      rollupDevelopmentProgress([
        { weight: 1, progressPct: 100 },
        { weight: 2, progressPct: 0 },
        { weight: 3, progressPct: 0 },
      ]),
    ).toBe(17);
    expect(
      rollupDevelopmentProgress([
        { weight: 1, progressPct: 100 },
        { weight: 2, progressPct: 50 },
        { weight: 3, progressPct: 0 },
      ]),
    ).toBe(33);
    expect(
      rollupDevelopmentProgress([
        { weight: 1, progressPct: 100 },
        { weight: 2, progressPct: 50 },
        { weight: 3, progressPct: 0 },
      ]),
    ).toBe(33);
  });
});

describe("remainingUnitsToGenerate", () => {
  it("creates only the remainder", () => {
    expect(remainingUnitsToGenerate(5, 2)).toBe(3);
    expect(remainingUnitsToGenerate(12, 0)).toBe(12);
  });
});

describe("computeBudgetVariance", () => {
  it("flags overrun", () => {
    const result = computeBudgetVariance("1000.00", "1500.00");
    expect(result.isOverrun).toBe(true);
    expect(result.variance).toBeLessThan(0);
  });
});

describe("recalculatePaymentStatus", () => {
  it("follows the sale lifecycle including overpay", () => {
    expect(recalculatePaymentStatus({ agreedValue: "100000.00", amounts: [] })).toMatchObject({
      paymentStatus: "NOT_APPLICABLE",
      isOverpaid: false,
      totalPaid: "0.00",
    });
    expect(
      recalculatePaymentStatus({ agreedValue: "100000.00", amounts: ["40000.00"] }),
    ).toMatchObject({ paymentStatus: "PART_PAYMENT", totalPaid: "40000.00", outstanding: "60000.00" });
    expect(
      recalculatePaymentStatus({ agreedValue: "100000.00", amounts: ["40000.00", "60000.00"] }),
    ).toMatchObject({ paymentStatus: "FULL_PAYMENT", isOverpaid: false });
    expect(
      recalculatePaymentStatus({
        agreedValue: "100000.00",
        amounts: ["40000.00", "60000.00", "1.00"],
      }),
    ).toMatchObject({
      paymentStatus: "FULL_PAYMENT",
      isOverpaid: true,
      totalPaid: "100001.00",
    });
  });
});

describe("sales guards", () => {
  it("requires asset XOR", () => {
    expect(() => assertSaleAssetXor(null, null)).toThrow(DomainError);
    expect(() => assertSaleAssetXor("u1", "l1")).toThrow(DomainError);
    expect(() => assertSaleAssetXor("u1", null)).not.toThrow();
  });

  it("blocks IM from reopening SOLD", () => {
    expect(() =>
      assertCommercialTransition({
        from: "SOLD",
        to: "ALLOCATED",
        actorIsOwnerAdmin: false,
        reason: "oops",
      }),
    ).toThrow(ForbiddenError);
  });

  it("requires a refund note", () => {
    expect(() => assertRefundNote("-100", "")).toThrow(DomainError);
    expect(() => assertRefundNote("-100", "buyer withdrew")).not.toThrow();
  });
});
