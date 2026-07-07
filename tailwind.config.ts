import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ネイビー基調 — B2B・金融レベルの信頼感 (要件定義書9章)
        navy: {
          50: "#f0f3fa",
          100: "#dbe3f2",
          200: "#b7c7e4",
          300: "#8ba3d0",
          400: "#5c78b0",
          500: "#3d5690",
          600: "#2b3f70",
          700: "#1e2c54",
          800: "#16203e",
          900: "#0f1730",
        },
        // エメラルド系アクセント — 「削減・利益」の色
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        ink: {
          DEFAULT: "#101425",
          soft: "#38405a",
          muted: "#6b7290",
          faint: "#9aa0b8",
        },
        surface: {
          DEFAULT: "#ffffff",
          sunken: "#f6f7fb",
          border: "#e4e7f1",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Hiragino Kaku Gothic ProN",
          "Meiryo",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,48,0.04), 0 4px 16px -8px rgba(15,23,48,0.10)",
        pop: "0 10px 30px rgba(15,23,48,0.14)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-pulse": {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "count-pulse": "count-pulse 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
