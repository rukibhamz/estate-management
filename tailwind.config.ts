import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#f8f9ff",
          dim: "#d8dae0",
          bright: "#f8f9ff",
          lowest: "#ffffff",
          low: "#f2f3f9",
          container: "#eceef3",
          high: "#e7e8ee",
          highest: "#e1e2e8",
        },
        ink: {
          DEFAULT: "#191c20",
          muted: "#44474e",
          inverse: "#eff0f6",
        },
        outline: {
          DEFAULT: "#75777f",
          variant: "#c5c6cf",
          subtle: "#E2E8F0",
        },
        precision: {
          DEFAULT: "#031635",
          navy: "#031635",
          container: "#081b3a",
          tint: "#4e5e81",
          inverse: "#b6c6ee",
          950: "#0F172A",
        },
        success: {
          DEFAULT: "#059669",
          600: "#059669",
          container: "#9af2c5",
          on: "#0c714d",
        },
        warning: {
          DEFAULT: "#F59E0B",
          on: "#92400E",
        },
        critical: {
          DEFAULT: "#EF4444",
          error: "#ba1a1a",
          container: "#ffdad6",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-financial": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        "mono-data": ["13px", { lineHeight: "18px", fontWeight: "400" }],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      maxWidth: {
        container: "1440px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(3, 22, 53, 0.04)",
        modal: "0 16px 40px rgba(3, 22, 53, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
