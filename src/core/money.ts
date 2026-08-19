export const CURRENCY = "NGN";
export const TIMEZONE = "Africa/Lagos";

export function toCents(value: string | number) {
  const trimmed = String(value).trim();
  const negative = trimmed.startsWith("-");
  const [wholeRaw, fracRaw = ""] = trimmed.replace("-", "").split(".");
  const whole = wholeRaw === "" ? "0" : wholeRaw;
  const frac = (fracRaw + "00").slice(0, 2);
  const cents = BigInt(whole) * 100n + BigInt(frac);
  return negative ? -cents : cents;
}

export function fromCents(cents: bigint) {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const whole = abs / 100n;
  const frac = (abs % 100n).toString().padStart(2, "0");
  return `${negative ? "-" : ""}${whole.toString()}.${frac}`;
}

export function moneyString(value: string | number) {
  return fromCents(toCents(value));
}

export function addMoney(values: Array<string | number>) {
  return fromCents(values.reduce((acc, value) => acc + toCents(value), 0n));
}

export function subMoney(a: string | number, b: string | number) {
  return fromCents(toCents(a) - toCents(b));
}

export function moneyCmp(a: string | number, b: string | number) {
  const left = toCents(a);
  const right = toCents(b);
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function formatNaira(value: string | number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(Number(moneyString(value)));
}

export function formatNairaCompact(value: string | number) {
  const n = Number(moneyString(value));
  if (Math.abs(n) >= 1_000_000) {
    return `₦${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `₦${(n / 1_000).toFixed(0)}K`;
  }
  return formatNaira(value);
}

export function startOfTodayLagos(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${parts}T00:00:00+01:00`);
}
