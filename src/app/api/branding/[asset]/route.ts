import { NextResponse } from "next/server";
import { getSystemBranding } from "@/server/branding";
import { readLocalObject } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ asset: string }> },
) {
  const { asset } = await context.params;
  if (asset !== "logo" && asset !== "favicon") {
    return new NextResponse("Not found", { status: 404 });
  }
  const branding = await getSystemBranding();
  const fileKey = asset === "logo" ? branding.logoFileKey : branding.faviconFileKey;
  const mime = asset === "logo" ? branding.logoMime : branding.faviconMime;

  if (!fileKey) {
    if (asset === "favicon") {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="${branding.colorPrimary}"/>
  <path fill="#fff" d="M16 4.2 18.2 12.4 27 12.8 20.6 17.8 23 26.2 16 21.8 9 26.2 11.4 17.8 5 12.8 13.8 12.4z"/>
</svg>`;
      return new NextResponse(svg, {
        headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-cache" },
      });
    }
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const bytes = await readLocalObject(fileKey);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": mime || "application/octet-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
