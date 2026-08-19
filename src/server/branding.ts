import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { putLocalObject } from "@/lib/storage";
import { ForbiddenError } from "@/core/errors";
import {
  BRANDING_ID,
  DEFAULT_BRANDING,
  FAVICON_TYPES,
  LOGO_TYPES,
  assertHexColor,
  inferImageMime,
  type PublicBranding,
} from "@/core/branding";

export const getSystemBranding = cache(async () => {
  const existing = await prisma.systemBranding.findUnique({ where: { id: BRANDING_ID } });
  if (existing) return existing;
  return prisma.systemBranding.create({
    data: { id: BRANDING_ID, ...DEFAULT_BRANDING },
  });
});

export function toPublicBranding(row: Awaited<ReturnType<typeof getSystemBranding>>): PublicBranding {
  const v = row.updatedAt.getTime();
  return {
    appName: row.appName,
    colorPrimary: row.colorPrimary,
    colorCanvas: row.colorCanvas,
    colorInk: row.colorInk,
    logoUrl: row.logoFileKey ? `/api/branding/logo?v=${v}` : null,
    faviconUrl: `/api/branding/favicon?v=${v}`,
    updatedAt: v,
  };
}

export async function isSystemAdmin(userId: string) {
  const row = await prisma.projectMembership.findFirst({
    where: { userId, status: "ACTIVE", role: "OWNER_ADMIN" },
    select: { id: true },
  });
  return Boolean(row);
}

export async function requireSystemAdmin(userId: string) {
  if (!(await isSystemAdmin(userId))) {
    throw new ForbiddenError("Only an Owner/Admin can change system branding.");
  }
}

export async function updateSystemBranding(
  userId: string,
  input: {
    appName: string;
    colorPrimary: string;
    colorCanvas: string;
    colorInk: string;
    logo?: { bytes: Buffer; mime: string; name: string };
    favicon?: { bytes: Buffer; mime: string; name: string };
    removeLogo?: boolean;
    removeFavicon?: boolean;
  },
) {
  await requireSystemAdmin(userId);
  const appName = input.appName.trim() || DEFAULT_BRANDING.appName;
  assertHexColor(input.colorPrimary, "Brand color");
  assertHexColor(input.colorCanvas, "Background color");
  assertHexColor(input.colorInk, "Text color");

  const current = await getSystemBranding();
  let logoFileKey = current.logoFileKey;
  let logoMime = current.logoMime;
  let faviconFileKey = current.faviconFileKey;
  let faviconMime = current.faviconMime;

  if (input.removeLogo) {
    logoFileKey = null;
    logoMime = null;
  }
  if (input.removeFavicon) {
    faviconFileKey = null;
    faviconMime = null;
  }
  if (input.logo) {
    const mime = inferImageMime(input.logo.mime, input.logo.name);
    if (!LOGO_TYPES.includes(mime as (typeof LOGO_TYPES)[number])) {
      throw new Error("Logo must be PNG, JPG, WEBP, or SVG.");
    }
    if (input.logo.bytes.length > 2 * 1024 * 1024) throw new Error("Logo must be under 2MB.");
    const ext = extensionFor(mime, input.logo.name);
    logoFileKey = `branding/logo-${Date.now()}${ext}`;
    logoMime = mime;
    await putLocalObject(logoFileKey, input.logo.bytes);
  }
  if (input.favicon) {
    const mime = inferImageMime(input.favicon.mime, input.favicon.name);
    if (!FAVICON_TYPES.includes(mime as (typeof FAVICON_TYPES)[number])) {
      throw new Error("Favicon must be PNG, ICO, SVG, JPG, or WEBP.");
    }
    if (input.favicon.bytes.length > 512 * 1024) throw new Error("Favicon must be under 512KB.");
    const ext = extensionFor(mime, input.favicon.name);
    faviconFileKey = `branding/favicon-${Date.now()}${ext}`;
    faviconMime = mime;
    await putLocalObject(faviconFileKey, input.favicon.bytes);
  }

  return prisma.systemBranding.update({
    where: { id: BRANDING_ID },
    data: {
      appName,
      colorPrimary: input.colorPrimary.toUpperCase(),
      colorCanvas: input.colorCanvas.toUpperCase(),
      colorInk: input.colorInk.toUpperCase(),
      logoFileKey,
      logoMime,
      faviconFileKey,
      faviconMime,
      updatedBy: userId,
    },
  });
}

function extensionFor(mime: string, fileName: string) {
  const fromName = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  if (fromName.length >= 2 && fromName.length <= 5) return fromName.toLowerCase();
  if (mime === "image/svg+xml") return ".svg";
  if (mime === "image/png") return ".png";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/webp") return ".webp";
  if (mime.includes("icon")) return ".ico";
  return "";
}
