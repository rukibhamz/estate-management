import { startOfTodayLagos } from "./money";

export const STALE_PROGRESS_DAYS = Number(process.env.STALE_PROGRESS_DAYS ?? 7);

export function isMilestoneOverdue(input: {
  status: string;
  targetDate: Date | null;
  now?: Date;
}) {
  if (input.status !== "PENDING" || !input.targetDate) return false;
  return input.targetDate.getTime() < startOfTodayLagos(input.now).getTime();
}

export function isProgressStale(lastUpdate: Date | null, now = new Date(), days = STALE_PROGRESS_DAYS) {
  if (!lastUpdate) return true;
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return lastUpdate.getTime() < cutoff;
}
