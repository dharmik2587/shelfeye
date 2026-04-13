import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        "18": "72px",
        "22": "88px",
        "26": "104px",
        "30": "120px",
      },
      borderRadius: {
        "3xl": "24px",
      },
      colors: {
        primary: "#0ea5e9",
        healthy: "#10b981",
        warning: "#f59e0b",
        critical: "#f43f5e",
        accent: "#8b5cf6",
      },
      boxShadow: {
        volumetric: "0 25px 60px -20px rgb(99 102 241 / 0.2)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Satoshi", "Avenir Next", "sans-serif"],
        display: ["Satoshi", "var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.012)" },
        },
        orbPulse: {
          "0%, 100%": { opacity: "0.65", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
      },
      animation: {
        breathe: "breathe 8s ease-in-out infinite",
        "orb-pulse": "orbPulse 2.8s ease-in-out infinite",
      },
      backdropBlur: {
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};

export default config;
