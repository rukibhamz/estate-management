"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicBranding } from "@/core/branding";
import { DEFAULT_BRANDING } from "@/core/branding";

const FALLBACK: PublicBranding = {
  ...DEFAULT_BRANDING,
  logoUrl: null,
  faviconUrl: "/api/branding/favicon",
  updatedAt: 0,
};

const BrandingContext = createContext<PublicBranding>(FALLBACK);

export function BrandingProvider({
  value,
  children,
}: {
  value: PublicBranding;
  children: ReactNode;
}) {
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
