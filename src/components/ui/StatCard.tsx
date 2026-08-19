import { formatNaira } from "@/core/money";
import { Card, CardBody } from "./Card";

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
  return (
    <Card>
      <CardBody>
        <p className="text-label-sm uppercase text-ink-muted">{label}</p>
        <p className="mt-2 font-sans text-display-financial text-precision tabular-nums">
          {money ? formatNaira(value) : value}
        </p>
        {hint ? <p className="mt-1 text-body-md text-ink-muted">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}
