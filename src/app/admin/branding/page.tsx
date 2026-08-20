import { requireUser } from "@/lib/guard";
import { getSystemBranding, toPublicBranding } from "@/server/branding";
import { BrandingForm } from "@/components/settings/BrandingForm";

export default async function AdminBrandingPage() {
  await requireUser();
  const branding = await getSystemBranding();
  const pub = toPublicBranding(branding);

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <BrandingForm
        appName={branding.appName}
        colorPrimary={branding.colorPrimary}
        colorCanvas={branding.colorCanvas}
        colorInk={branding.colorInk}
        logoUrl={pub.logoUrl}
        faviconUrl={pub.faviconUrl}
        hasCustomFavicon={Boolean(branding.faviconFileKey)}
      />
    </div>
  );
}
