import { cn } from "@/lib/cn";
import { labelize } from "@/lib/cn";

const TONES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success-on",
  SOLD: "bg-success/10 text-success-on",
  COMPLETE: "bg-success/10 text-success-on",
  DONE: "bg-success/10 text-success-on",
  FULL_PAYMENT: "bg-success/10 text-success-on",
  ALLOCATED: "bg-precision/10 text-precision",
  IN_PROGRESS: "bg-precision/10 text-precision",
  RESERVED: "bg-warning/10 text-warning-on",
  DELAYED: "bg-warning/10 text-warning-on",
  PART_PAYMENT: "bg-warning/10 text-warning-on",
  ON_HOLD: "bg-warning/10 text-warning-on",
  CANCELLED: "bg-critical/10 text-critical-error",
  OVERDUE: "bg-critical/10 text-critical-error",
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
        "inline-flex items-center rounded-lg px-2 py-0.5 text-label-sm uppercase",
        TONES[status] ?? "bg-surface-low text-ink-muted",
        className,
      )}
    >
      {labelize(status)}
    </span>
  );
}
