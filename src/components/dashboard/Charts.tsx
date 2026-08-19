import { formatNairaCompact } from "@/core/money";

const BAR_MAX = 200;

export function SalesBarChart({
  series,
}: {
  series: Array<{ label: string; amount: number }>;
}) {
  const max = Math.max(...series.map((s) => s.amount), 1);
  const peakIndex = series.reduce((best, row, index) => (row.amount > series[best].amount ? index : best), 0);

  return (
    <div className="flex items-end gap-2 sm:gap-3">
      {series.map((row, index) => {
        const ratio = row.amount <= 0 ? 0.08 : Math.max(0.14, row.amount / max);
        const barH = Math.round(BAR_MAX * ratio);
        const active = index === peakIndex && row.amount > 0;
        return (
          <div key={row.label} className="flex min-w-0 flex-1 flex-col items-center justify-end">
            {active ? (
              <div className="mb-2 w-max rounded-xl bg-forest px-2.5 py-1.5 text-center text-[11px] leading-tight text-white shadow-modal">
                {formatNairaCompact(row.amount)}
              </div>
            ) : (
              <div className="mb-2 h-[30px]" aria-hidden />
            )}
            <div
              className={
                active
                  ? "w-full rounded-t-full bg-forest"
                  : "w-full rounded-t-full bg-[#E8E8E2]"
              }
              style={{
                height: barH,
                backgroundImage: active
                  ? "repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0 8px, transparent 8px 16px)"
                  : undefined,
              }}
            />
            <span className="mt-3 text-label-sm text-ink-muted">{row.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function CostDonut({
  slices,
}: {
  slices: Array<{ label: string; color: string; amount: number }>;
}) {
  const total = slices.reduce((sum, s) => sum + s.amount, 0) || 1;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#F2F1EC" strokeWidth="18" />
          {slices.map((slice) => {
            const len = (slice.amount / total) * circ;
            const dash = `${len} ${circ - len}`;
            const el = (
              <circle
                key={slice.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="18"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-label-sm text-ink-muted">Total</p>
          <p className="text-headline-md tabular-nums text-ink">{formatNairaCompact(total)}</p>
        </div>
      </div>
      <ul className="w-full space-y-3 text-body-md">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} />
              <span className="text-ink-muted">{slice.label}</span>
            </span>
            <span className="tabular-nums text-ink">{formatNairaCompact(slice.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
