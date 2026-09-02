import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens ligados às CSS vars (tripletos RGB) — trocam com o tema
        // ([data-theme="dark"] em globals.css). Suportam alpha: bg-bg-card/50.
        bg: {
          primary: "rgb(var(--bg-base) / <alpha-value>)",
          secondary: "rgb(var(--bg-alt) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
          base: "rgb(var(--bg-base) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          light: "rgb(var(--accent-light) / <alpha-value>)",
          deep: "rgb(var(--accent-deep) / <alpha-value>)",
          dark: "rgb(var(--accent-contrast) / <alpha-value>)",
          pale: "rgb(var(--accent-pale) / <alpha-value>)",
          glow: "rgb(var(--accent) / 0.4)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          strong: "rgb(var(--border-strong) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "accent-gradient":
          "linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-deep)) 100%)",
      },
      boxShadow: {
        "accent-glow": "0 0 60px -10px rgb(var(--accent) / 0.5)",
        "accent-glow-sm": "0 0 30px -5px rgb(var(--accent) / 0.4)",
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "blob-float": "blob-float 14s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 30px -5px rgb(var(--accent) / 0.4)" },
          "50%": { boxShadow: "0 0 60px -5px rgb(var(--accent) / 0.7)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "blob-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(20px, -24px) scale(1.06)" },
          "66%": { transform: "translate(-18px, 14px) scale(0.96)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;