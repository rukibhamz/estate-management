import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { getSystemBranding, toPublicBranding } from "@/server/branding";
import { DEFAULT_BRANDING, brandingCssVars, type PublicBranding } from "@/core/branding";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const FALLBACK_PUBLIC: PublicBranding = {
  ...DEFAULT_BRANDING,
  logoUrl: null,
  faviconUrl: "/api/branding/favicon",
  updatedAt: 0,
};

async function loadBranding() {
  try {
    const row = await getSystemBranding();
    return { public: toPublicBranding(row), css: brandingCssVars(row) };
  } catch {
    return { public: FALLBACK_PUBLIC, css: brandingCssVars(DEFAULT_BRANDING) };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { public: branding } = await loadBranding();
  return {
    title: branding.appName,
    description: "Estate, land, and development inventory for project teams.",
    icons: { icon: branding.faviconUrl },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { public: branding, css } = await loadBranding();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${jetbrains.variable} font-sans antialiased`} suppressHydrationWarning>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <Providers branding={branding}>{children}</Providers>
      </body>
    </html>
  );
}
