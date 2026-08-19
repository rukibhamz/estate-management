"use client";

import { SessionProvider } from "next-auth/react";
import { BrandingProvider } from "./BrandingProvider";
import type { PublicBranding } from "@/core/branding";
import type { ReactNode } from "react";

export function Providers({
  branding,
  children,
}: {
  branding: PublicBranding;
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <BrandingProvider value={branding}>{children}</BrandingProvider>
    </SessionProvider>
  );
}
