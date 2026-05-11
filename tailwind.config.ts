import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#f8faf9",
          dim: "#d8dada",
          bright: "#f8faf9",
        },
        "surface-container": {
          lowest: "#ffffff",
          low: "#f2f4f3",
          DEFAULT: "#eceeed",
          high: "#e6e9e8",
          highest: "#e1e3e2",
        },
        "on-surface": {
          DEFAULT: "#191c1c",
          variant: "#414844",
        },
        "inverse-surface": "#2e3131",
        "inverse-on-surface": "#eff1f0",
        outline: {
          DEFAULT: "#717973",
          variant: "#c1c8c2",
        },
        "surface-tint": "#3f6653",
        primary: {
          "50": "#f0fdf4",
          "100": "#dcfce7",
          "200": "#bbf7d0",
          "300": "#86efac",
          "400": "#4ade80",
          "500": "#006c48",
          "600": "#16a34a",
          "700": "#15803d",
          "800": "#012d1d",
          "900": "#14532d",
          "950": "#052e16",
          DEFAULT: "#012d1d",
        },
        "on-primary": "#ffffff",
        "primary-container": {
          DEFAULT: "#1b4332",
        },
        "on-primary-container": "#86af99",
        "inverse-primary": "#a5d0b9",
        secondary: {
          DEFAULT: "#006c48",
        },
        "on-secondary": "#ffffff",
        "secondary-container": "#92f7c3",
        "on-secondary-container": "#00734d",
        tertiary: {
          DEFAULT: "#002d1a",
        },
        "on-tertiary": "#ffffff",
        "tertiary-container": "#1a432e",
        "on-tertiary-container": "#84b095",
        "primary-fixed": {
          DEFAULT: "#c1ecd4",
          dim: "#a5d0b9",
        },
        "on-primary-fixed": {
          DEFAULT: "#002114",
          variant: "#274e3d",
        },
        "secondary-fixed": {
          DEFAULT: "#92f7c3",
          dim: "#75daa8",
        },
        "on-secondary-fixed": {
          DEFAULT: "#002113",
          variant: "#005235",
        },
        "tertiary-fixed": {
          DEFAULT: "#c0edd0",
          dim: "#a4d1b4",
        },
        "on-tertiary-fixed": {
          DEFAULT: "#002112",
          variant: "#264f39",
        },
        error: {
          DEFAULT: "#ba1a1a",
        },
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        background: "#f8faf9",
        "on-background": "#191c1c",
        "surface-variant": "#e1e3e2",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontSize: {
        "headline-xl": [
          "48px",
          {
            lineHeight: "56px",
            letterSpacing: "-0.02em",
            fontWeight: "700",
          },
        ],
        "headline-lg": [
          "32px",
          {
            lineHeight: "40px",
            letterSpacing: "-0.01em",
            fontWeight: "700",
          },
        ],
        "headline-md": [
          "24px",
          {
            lineHeight: "32px",
            fontWeight: "600",
          },
        ],
        "body-lg": [
          "18px",
          {
            lineHeight: "28px",
            fontWeight: "400",
          },
        ],
        "body-md": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: "400",
          },
        ],
        "label-md": [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0.01em",
            fontWeight: "600",
          },
        ],
        "label-sm": [
          "12px",
          {
            lineHeight: "16px",
            letterSpacing: "0.02em",
            fontWeight: "500",
          },
        ],
      },
      borderRadius: {
        "2xl": "1.5rem",
        xl: "1.5rem",
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      fontWeight: {
        bold: "700",
        semibold: "600",
        medium: "500",
        regular: "400",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
