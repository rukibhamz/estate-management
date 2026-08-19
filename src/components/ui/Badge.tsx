import { cn } from "@/lib/cn";
import { labelize } from "@/lib/cn";

const TONES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success-on",
  SOLD: "bg-success/10 text-success-on",
  COMPLETE: "bg-success/10 text-success-on",
  DONE: "bg-success/10 text-success-on",
  FULL_PAYMENT: "bg-success/10 text-success-on",
  ALLOCATED: "bg-forest-soft text-forest-ink",
  IN_PROGRESS: "bg-forest-soft text-forest-ink",
  RESERVED: "bg-warning/10 text-warning-on",
  DELAYED: "bg-warning/10 text-warning-on",
  PART_PAYMENT: "bg-warning/10 text-warning-on",
  ON_HOLD: "bg-warning/10 text-warning-on",
  CANCELLED: "bg-critical/10 text-critical-error",
  OVERDUE: "bg-critical/10 text-critical-error",
  MILESTONE_OVERDUE: "bg-critical/10 text-critical-error",
  BUDGET_OVERRUN: "bg-warning/10 text-warning-on",
  STALE_PROGRESS: "bg-warning/10 text-warning-on",
  ARCHIVED: "bg-surface-high text-ink-muted",
};

export function Badge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm",
        TONES[status] ?? "bg-surface-low text-ink-muted",
        className,
      )}
    >
      {labelize(status)}
    </span>
  );
}
