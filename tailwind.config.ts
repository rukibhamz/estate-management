import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F2F1EC",
        forest: {
          DEFAULT: "#1F6B4A",
          dark: "#163D2C",
          ink: "#0F241C",
          mint: "#D8EBDD",
          soft: "#EAF4EE",
        },
        "forest-ink": "#0F241C",
        "forest-dark": "#163D2C",
        "forest-soft": "#EAF4EE",
        "forest-mint": "#D8EBDD",
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
          DEFAULT: "#1A1C19",
          muted: "#6B706A",
          inverse: "#eff0f6",
        },
        outline: {
          DEFAULT: "#75777f",
          variant: "#DDDDD6",
          subtle: "#E8E8E2",
        },
        precision: {
          DEFAULT: "#163D2C",
          navy: "#163D2C",
          container: "#1F6B4A",
          tint: "#4e5e81",
          inverse: "#b6c6ee",
          950: "#0F241C",
        },
        success: {
          DEFAULT: "#1F6B4A",
          600: "#1F6B4A",
          container: "#D8EBDD",
          on: "#163D2C",
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
