import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-body-md" : "h-10 px-4 text-body-md",
        variant === "primary" &&
          "bg-precision text-white hover:bg-precision-950 border-b border-black/20",
        variant === "secondary" &&
          "bg-transparent text-precision border border-precision hover:bg-surface-low",
        variant === "ghost" && "bg-transparent text-ink-muted hover:bg-surface-low hover:text-ink",
        variant === "danger" && "bg-critical-error text-white hover:bg-critical",
        className,
      )}
      {...props}
    />
  );
}
