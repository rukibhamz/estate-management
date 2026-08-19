export const BRANDING_ID = "default";

export const DEFAULT_BRANDING = {
  appName: "EstateFlow",
  colorPrimary: "#1F6B4A",
  colorCanvas: "#F4EDE3",
  colorInk: "#1F1B16",
} as const;

const HEX = /^#[0-9A-Fa-f]{6}$/;

export function isHexColor(value: string) {
  return HEX.test(value);
}

export function assertHexColor(value: string, label: string) {
  if (!isHexColor(value)) {
    throw new Error(`${label} must be a 6-digit hex color like #1F6B4A`);
  }
}

export type PublicBranding = {
  appName: string;
  colorPrimary: string;
  colorCanvas: string;
  colorInk: string;
  logoUrl: string | null;
  faviconUrl: string;
  updatedAt: number;
};

const WHITE = "#FFFFFF";
const INK = DEFAULT_BRANDING.colorInk;

export function brandingCssVars(input: {
  colorPrimary: string;
  colorCanvas: string;
  colorInk: string;
}) {
  const canvas = input.colorCanvas;
  const ink = readableOn(canvas, input.colorInk);
  const forestInk = darkenToContrast(input.colorPrimary, WHITE);
  const muted = darkenToContrast(mixHex(ink, canvas, 0.68), WHITE, 4.5);
  const paper = WHITE;
  const cream = "#F6EFE4";
  return `:root{--brand-canvas:${hexToRgb(canvas)};--brand-paper:${hexToRgb(paper)};--brand-forest:${hexToRgb(input.colorPrimary)};--brand-on-forest:${hexToRgb(onColor(input.colorPrimary))};--brand-forest-dark:color-mix(in srgb,rgb(var(--brand-forest)) 72%,#3d2914);--brand-forest-ink:${hexToRgb(forestInk)};--brand-forest-soft:color-mix(in srgb,rgb(var(--brand-forest)) 14%,${cream});--brand-forest-mint:color-mix(in srgb,rgb(var(--brand-forest)) 20%,${cream});--brand-ink:${hexToRgb(ink)};--brand-ink-muted:${hexToRgb(muted)};}`;
}

export function hexToRgb(hex: string) {
  const [r, g, b] = parseHex(hex);
  return `${r} ${g} ${b}`;
}

function parseHex(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function mixHex(a: string, b: string, amountA: number) {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const t = amountA;
  return toHex(Math.round(ar * t + br * (1 - t)), Math.round(ag * t + bg * (1 - t)), Math.round(ab * t + bb * (1 - t)));
}

function channelLuminance(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(a: string, b: string) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function onColor(background: string) {
  return relativeLuminance(background) > 0.55 ? INK : WHITE;
}

export function readableOn(background: string, preferred: string) {
  if (isHexColor(preferred) && contrastRatio(preferred, background) >= 4.5) return preferred;
  return onColor(background);
}

export function darkenToContrast(color: string, background: string, min = 4.5) {
  let current = color;
  for (let i = 0; i < 14; i++) {
    if (contrastRatio(current, background) >= min) return current;
    current = mixHex(current, "#000000", 0.72);
  }
  return onColor(background);
}

export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
export const FAVICON_TYPES = [
  "image/png",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/svg+xml",
  "image/jpeg",
  "image/webp",
] as const;

export function inferImageMime(mime: string, fileName: string) {
  if (mime && mime !== "application/octet-stream") return mime;
  const name = fileName.toLowerCase();
  if (name.endsWith(".svg")) return "image/svg+xml";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".ico")) return "image/x-icon";
  return mime;
}
