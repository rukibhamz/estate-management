import { formatNairaCompact } from "@/core/money";
import { Building2, Handshake, Landmark, MoreHorizontal } from "lucide-react";
import { Card, CardBody } from "./Card";

const ICONS = {
  property: Landmark,
  sales: Handshake,
  value: Building2,
} as const;

export function KpiCard({
  label,
  value,
  hint,
  delta,
  money,
  icon = "property",
}: {
  label: string;
  value: string | number;
  hint?: string;
  delta?: { pct: number; label: string };
  money?: boolean;
  icon?: keyof typeof ICONS;
}) {
  const Icon = ICONS[icon];
  const up = (delta?.pct ?? 0) >= 0;
  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-soft text-forest">
            <Icon size={18} />
          </span>
          <span className="text-ink-muted/50" aria-hidden>
            <MoreHorizontal size={18} />
          </span>
        </div>
        <p className="mt-5 text-body-md text-ink-muted">{label}</p>
        <p className="mt-1 truncate text-[32px] font-bold leading-none tracking-tight text-ink tabular-nums">
          {money ? formatNairaCompact(value) : value}
        </p>
        {delta ? (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-body-md text-ink-muted">
            <span
              className={
                up
                  ? "rounded-full bg-forest-soft px-2 py-0.5 text-label-sm text-forest"
                  : "rounded-full bg-critical-container px-2 py-0.5 text-label-sm text-critical-error"
              }
            >
              {up ? "+" : ""}
              {delta.pct}%
            </span>
            {delta.label}
          </p>
        ) : hint ? (
          <p className="mt-3 text-body-md text-ink-muted">{hint}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  hint,
  money,
}: {
  label: string;
  value: string | number;
  hint?: string;
  money?: boolean;
}) {
  return <KpiCard label={label} value={value} hint={hint} money={money} />;
}
