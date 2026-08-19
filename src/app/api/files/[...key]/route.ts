import { NextRequest, NextResponse } from "next/server";
import { readLocalObject, verifySignedUrl } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key } = await context.params;
  const fileKey = key.map(decodeURIComponent).join("/");
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!verifySignedUrl(fileKey, token)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  try {
    const bytes = await readLocalObject(fileKey);
    return new NextResponse(bytes, {
      headers: { "Content-Type": "application/octet-stream" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
