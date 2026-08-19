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
        "rounded-2xl bg-white shadow-card",
        accent === "blue" && "ring-1 ring-chart-blue/80",
        accent === "green" && "ring-1 ring-forest-mint",
        accent === "amber" && "ring-1 ring-chart-beige",
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
