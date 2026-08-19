import { TIMEZONE } from "./money";

/** Deterministic Lagos clock — same string on server and browser. */
export function formatLagosDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
