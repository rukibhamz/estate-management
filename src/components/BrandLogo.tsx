"use client";

import { BrandMark } from "./BrandMark";
import { useBranding } from "./BrandingProvider";
import { cn } from "@/lib/cn";

export function BrandLogo({
  className,
  markClassName,
  nameClassName,
  showName = false,
  stacked = false,
}: {
  className?: string;
  markClassName?: string;
  nameClassName?: string;
  showName?: boolean;
  stacked?: boolean;
}) {
  const branding = useBranding();
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-2 text-forest-ink",
        stacked && "flex-col",
        className,
      )}
    >
      {branding.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={branding.logoUrl}
          alt=""
          className={cn("h-8 w-8 shrink-0 object-contain", markClassName)}
        />
      ) : (
        <BrandMark className={cn("h-8 w-8 shrink-0", markClassName)} />
      )}
      {showName ? (
        <span className={cn("truncate text-[18px] font-semibold text-ink", nameClassName)}>
          {branding.appName}
        </span>
      ) : null}
    </span>
  );
}

export function BrandName({ className }: { className?: string }) {
  const branding = useBranding();
  return <span className={className}>{branding.appName}</span>;
}
