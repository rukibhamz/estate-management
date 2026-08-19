import { describe, expect, it } from "vitest";
import { assertHexColor, brandingCssVars, isHexColor } from "./branding";

describe("branding", () => {
  it("accepts 6-digit hex", () => {
    expect(isHexColor("#1F6B4A")).toBe(true);
    expect(isHexColor("#fff")).toBe(false);
    expect(isHexColor("1F6B4A")).toBe(false);
  });

  it("throws a labeled error", () => {
    expect(() => assertHexColor("blue", "Brand color")).toThrow(/Brand color/);
  });

  it("emits CSS variables", () => {
    const css = brandingCssVars({
      colorPrimary: "#1F6B4A",
      colorCanvas: "#F2F1EC",
      colorInk: "#1A1C19",
    });
    expect(css).toContain("--brand-forest:31 107 74");
    expect(css).toContain("--brand-canvas:242 241 236");
    expect(css).toContain("--brand-on-forest:255 255 255");
  });

  it("uses dark text on a light brand color", () => {
    const css = brandingCssVars({
      colorPrimary: "#F2F1EC",
      colorCanvas: "#FFFFFF",
      colorInk: "#FFFFFF",
    });
    expect(css).toContain("--brand-on-forest:26 28 25");
    expect(css).toContain("--brand-ink:26 28 25");
  });
});
