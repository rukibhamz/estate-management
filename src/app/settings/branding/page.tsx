import { requireUser } from "@/lib/guard";
import { getSystemBranding, toPublicBranding } from "@/server/branding";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ColorField } from "@/components/ui/ColorField";
import { actionUpdateBranding } from "@/app/actions";

export default async function BrandingSettingsPage() {
  await requireUser();
  const branding = await getSystemBranding();
  const pub = toPublicBranding(branding);

  return (
    <div className="mb-6 max-w-2xl">
      <p className="mb-6 text-body-md text-ink-muted">
        These options apply across the whole workspace: login, sidebar, favicon, and theme colors.
      </p>
      <Card>
        <CardBody>
          <form action={actionUpdateBranding} className="space-y-5">
            <Field label="Product name">
              <Input name="appName" defaultValue={branding.appName} required />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Brand color">
                <ColorField name="colorPrimary" defaultValue={branding.colorPrimary} />
              </Field>
              <Field label="Background">
                <ColorField name="colorCanvas" defaultValue={branding.colorCanvas} />
              </Field>
              <Field label="Text">
                <ColorField name="colorInk" defaultValue={branding.colorInk} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Logo (PNG, SVG, JPG, WEBP)">
                {pub.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pub.logoUrl} alt="Current logo" className="mb-3 h-12 w-12 object-contain" />
                ) : (
                  <p className="mb-3 text-body-md text-ink-muted">Using the default star mark.</p>
                )}
                <Input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
                {pub.logoUrl ? (
                  <label className="mt-2 flex items-center gap-2 text-body-md text-ink-muted">
                    <input type="checkbox" name="removeLogo" value="1" />
                    Remove custom logo
                  </label>
                ) : null}
              </Field>
              <Field label="Favicon (PNG, ICO, SVG)">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pub.faviconUrl} alt="Current favicon" className="mb-3 h-10 w-10 object-contain" />
                <Input
                  name="favicon"
                  type="file"
                  accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/jpeg,image/webp"
                />
                {branding.faviconFileKey ? (
                  <label className="mt-2 flex items-center gap-2 text-body-md text-ink-muted">
                    <input type="checkbox" name="removeFavicon" value="1" />
                    Restore default favicon
                  </label>
                ) : null}
              </Field>
            </div>

            <Button type="submit">Save branding</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
