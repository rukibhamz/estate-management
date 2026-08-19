import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--brand-canvas) / <alpha-value>)",
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
          DEFAULT: "#F2F1EC",
          dim: "#d8dae0",
          bright: "#F2F1EC",
          lowest: "#ffffff",
          low: "#F7F6F2",
          container: "#eceef3",
          high: "#e7e8ee",
          highest: "#e1e2e8",
          gray: "#EEEEE9",
        },
        ink: {
          DEFAULT: "rgb(var(--brand-ink) / <alpha-value>)",
          muted: "rgb(var(--brand-ink-muted) / <alpha-value>)",
          inverse: "#eff0f6",
        },
        outline: {
          DEFAULT: "#75777f",
          variant: "#DDDDD6",
          subtle: "#E8E8E2",
        },
        precision: {
          DEFAULT: "var(--brand-forest-dark)",
          navy: "var(--brand-forest-dark)",
          container: "rgb(var(--brand-forest) / <alpha-value>)",
          tint: "#4e5e81",
          inverse: "#b6c6ee",
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
          blue: "#C9D7EA",
          purple: "#D5CBE8",
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
        card: "0 10px 30px rgba(15, 36, 28, 0.04)",
        modal: "0 18px 50px rgba(15, 36, 28, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
