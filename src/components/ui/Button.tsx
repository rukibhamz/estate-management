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
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50",
        size === "sm" ? "h-9 px-4 text-body-md" : "h-11 px-5 text-body-md",
        variant === "primary" && "bg-forest text-white hover:bg-forest-dark",
        variant === "secondary" && "bg-white text-forest-ink ring-1 ring-outline-subtle hover:bg-forest-soft",
        variant === "ghost" && "bg-transparent text-ink-muted hover:bg-white hover:text-ink",
        variant === "danger" && "bg-critical-container text-critical-error hover:bg-critical/20",
        className,
      )}
      {...props}
    />
  );
}
