import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");

function secret() {
  return process.env.STORAGE_SECRET ?? "dev-storage-secret";
}

export function signFileKey(fileKey: string, expiresAt: number) {
  const payload = `${fileKey}:${expiresAt}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${expiresAt}.${sig}`;
}

export function verifySignedUrl(fileKey: string, token: string) {
  const [expiresRaw, sig] = token.split(".");
  const expiresAt = Number(expiresRaw);
  if (!expiresAt || !sig || Date.now() > expiresAt) return false;
  const expected = signFileKey(fileKey, expiresAt);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function signedDownloadPath(fileKey: string, ttlMs = 15 * 60 * 1000) {
  const expiresAt = Date.now() + ttlMs;
  const token = signFileKey(fileKey, expiresAt);
  return `/api/files/${encodeURIComponent(fileKey)}?token=${encodeURIComponent(token)}`;
}

export async function putLocalObject(fileKey: string, bytes: Buffer) {
  const dest = path.join(STORAGE_DIR, fileKey);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, bytes);
}

export async function readLocalObject(fileKey: string) {
  const dest = path.join(STORAGE_DIR, fileKey);
  return fs.readFile(dest);
}
