"use client";

import type { ReactNode } from "react";
import { actionUpdateBranding } from "@/app/actions";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ColorField } from "@/components/ui/ColorField";
import { Field, Input } from "@/components/ui/Field";

export function BrandingForm({
  appName,
  colorPrimary,
  colorCanvas,
  colorInk,
  logoUrl,
  faviconUrl,
  hasCustomFavicon,
}: {
  appName: string;
  colorPrimary: string;
  colorCanvas: string;
  colorInk: string;
  logoUrl: string | null;
  faviconUrl: string;
  hasCustomFavicon: boolean;
}) {
  return (
    <form action={actionUpdateBranding} className="space-y-5">
      <Card>
        <CardBody className="p-0">
          <div
            className="flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ background: colorCanvas, color: colorInk }}
          >
            <div className="flex items-center gap-4">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-14 w-14 object-contain" />
              ) : (
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-white/10"
                  style={{ color: colorPrimary }}
                >
                  <BrandMark className="h-8 w-8" />
                </span>
              )}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-60">Preview</p>
                <p className="mt-1 text-headline-md">{appName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[colorPrimary, colorCanvas, colorInk].map((hex) => (
                <span
                  key={hex}
                  className="h-9 w-9 rounded-full ring-2 ring-black/10"
                  style={{ background: hex }}
                  title={hex}
                />
              ))}
              <span
                className="ml-2 rounded-full px-4 py-2 text-body-md font-medium text-white"
                style={{ background: colorPrimary }}
              >
                Primary
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <SectionTitle title="Identity" hint="Shown in the sidebar, login, and browser tab." />
          <Field label="Product name">
            <Input name="appName" defaultValue={appName} required />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <SectionTitle title="Palette" hint="Brand fill, page background, and body text." />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Brand color">
              <ColorField name="colorPrimary" defaultValue={colorPrimary} />
            </Field>
            <Field label="Background">
              <ColorField name="colorCanvas" defaultValue={colorCanvas} />
            </Field>
            <Field label="Text">
              <ColorField name="colorInk" defaultValue={colorInk} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <SectionTitle title="Marks" hint="PNG, SVG, JPG, or WEBP. Logo up to 2MB, favicon up to 512KB." />
          <div className="grid gap-4 sm:grid-cols-2">
            <UploadSlot
              name="logo"
              label="Logo"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              preview={
                logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Current logo" className="h-12 w-12 object-contain" />
                ) : (
                  <BrandMark className="h-12 w-12 text-forest" />
                )
              }
              caption={logoUrl ? "Replace current logo" : "Default star mark"}
              removeName={logoUrl ? "removeLogo" : undefined}
              removeLabel="Remove custom logo"
            />
            <UploadSlot
              name="favicon"
              label="Favicon"
              accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/jpeg,image/webp"
              preview={
                // eslint-disable-next-line @next/next/no-img-element
                <img src={faviconUrl} alt="Current favicon" className="h-12 w-12 object-contain" />
              }
              caption={hasCustomFavicon ? "Replace current favicon" : "Default workspace icon"}
              removeName={hasCustomFavicon ? "removeFavicon" : undefined}
              removeLabel="Restore default favicon"
            />
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save branding</Button>
      </div>
    </form>
  );
}

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="text-headline-md text-ink">{title}</h2>
      <p className="mt-1 text-body-md text-ink-muted">{hint}</p>
    </div>
  );
}

function UploadSlot({
  name,
  label,
  accept,
  preview,
  caption,
  removeName,
  removeLabel,
}: {
  name: string;
  label: string;
  accept: string;
  preview: ReactNode;
  caption: string;
  removeName?: string;
  removeLabel?: string;
}) {
  return (
    <div className="rounded-2xl bg-canvas p-4 ring-1 ring-black/[0.04]">
      <p className="mb-3 text-label-sm uppercase text-ink-muted">{label}</p>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-black/[0.05] dark:bg-white/10">
          {preview}
        </span>
        <p className="text-body-md text-ink-muted">{caption}</p>
      </div>
      <Input name={name} type="file" accept={accept} />
      {removeName ? (
        <label className="mt-3 flex items-center gap-2 text-body-md text-ink-muted">
          <input type="checkbox" name={removeName} value="1" />
          {removeLabel}
        </label>
      ) : null}
    </div>
  );
}
