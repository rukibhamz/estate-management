import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
  className,
  accent,
  children,
}: {
  className?: string;
  accent?: "blue" | "green" | "amber" | "none";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded bg-white border border-outline-subtle shadow-card",
        accent === "blue" && "border-l-4 border-l-precision",
        accent === "green" && "border-l-4 border-l-success",
        accent === "amber" && "border-l-4 border-l-warning",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
