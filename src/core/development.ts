import { DomainError } from "./errors";

export function rollupDevelopmentProgress(
  phases: Array<{ weight?: number | null; progressPct: number }>,
) {
  if (phases.length === 0) return 0;
  let weighted = 0;
  let weights = 0;
  for (const phase of phases) {
    const weight = phase.weight == null ? 1 : phase.weight;
    weighted += weight * phase.progressPct;
    weights += weight;
  }
  if (weights === 0) return 0;
  return Math.round(weighted / weights);
}

export function remainingUnitsToGenerate(plannedUnitCount: number | null | undefined, existing: number) {
  if (plannedUnitCount == null || plannedUnitCount < 1) {
    throw new DomainError("plannedUnitCount must be >= 1 to complete", "PLANNED_UNITS_REQUIRED");
  }
  return Math.max(0, plannedUnitCount - existing);
}

export function computeBudgetVariance(approvedBudget: string | number | null, spend: string | number) {
  const budget = Number(approvedBudget ?? 0);
  const spent = Number(spend);
  const variance = budget - spent;
  return {
    variance,
    isOverrun: spent > budget && budget > 0,
    spent,
    budget,
  };
}
