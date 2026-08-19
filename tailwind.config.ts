import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--brand-canvas) / <alpha-value>)",
        paper: "rgb(var(--brand-paper) / <alpha-value>)",
        forest: {
          DEFAULT: "rgb(var(--brand-forest) / <alpha-value>)",
          dark: "var(--brand-forest-dark)",
          ink: "rgb(var(--brand-forest-ink) / <alpha-value>)",
          mint: "var(--brand-forest-mint)",
          soft: "var(--brand-forest-soft)",
        },
        "forest-ink": "rgb(var(--brand-forest-ink) / <alpha-value>)",
        "forest-dark": "var(--brand-forest-dark)",
        "forest-soft": "var(--brand-forest-soft)",
        "forest-mint": "var(--brand-forest-mint)",
        on: {
          forest: "rgb(var(--brand-on-forest) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "#F4EDE3",
          dim: "#E0D4C4",
          bright: "#F4EDE3",
          lowest: "#ffffff",
          low: "#F3EBE0",
          container: "#EDE3D4",
          high: "#E8DCCB",
          highest: "#E2D4C2",
          gray: "#EFE6D8",
        },
        ink: {
          DEFAULT: "rgb(var(--brand-ink) / <alpha-value>)",
          muted: "rgb(var(--brand-ink-muted) / <alpha-value>)",
          inverse: "#eff0f6",
        },
        outline: {
          DEFAULT: "#8A7D6E",
          variant: "#E0D4C4",
          subtle: "#E8DCCB",
        },
        precision: {
          DEFAULT: "var(--brand-forest-dark)",
          navy: "var(--brand-forest-dark)",
          container: "rgb(var(--brand-forest) / <alpha-value>)",
          tint: "#7A6A55",
          inverse: "#E8D5B8",
          950: "rgb(var(--brand-forest-ink) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--brand-forest) / <alpha-value>)",
          600: "rgb(var(--brand-forest) / <alpha-value>)",
          container: "var(--brand-forest-mint)",
          on: "rgb(var(--brand-forest-ink) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "#C4A574",
          on: "#6B542E",
        },
        critical: {
          DEFAULT: "#C45C5C",
          error: "#B42318",
          container: "#F8E4E4",
        },
        chart: {
          beige: "#E4D4B8",
          blue: "#D8CFC0",
          purple: "#E2D3C4",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-financial": ["36px", { lineHeight: "44px", letterSpacing: "-0.03em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
        "mono-data": ["13px", { lineHeight: "18px", fontWeight: "400" }],
      },
      borderRadius: {
        DEFAULT: "1rem",
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      maxWidth: {
        container: "1440px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(80, 55, 30, 0.06)",
        modal: "0 20px 50px rgba(92, 58, 28, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
