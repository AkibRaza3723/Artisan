/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Artisans' Canvas Brand Palette ──────────────────────────
        sandlewood: {
          DEFAULT: "rgb(var(--color-sandlewood) / <alpha-value>)",
          light: "rgb(var(--color-sandlewood-light) / <alpha-value>)",
          dark: "rgb(var(--color-sandlewood-dark) / <alpha-value>)",
        },
        almond: {
          DEFAULT: "rgb(var(--color-almond) / <alpha-value>)",
          light: "rgb(var(--color-almond-light) / <alpha-value>)",
          dark: "rgb(var(--color-almond-dark) / <alpha-value>)",
        },
        plum: {
          DEFAULT: "rgb(var(--color-plum) / <alpha-value>)",
          light: "rgb(var(--color-plum-light) / <alpha-value>)",
          dark: "rgb(var(--color-plum-dark) / <alpha-value>)",
        },
        carbon: {
          DEFAULT: "rgb(var(--color-carbon) / <alpha-value>)",
          light: "rgb(var(--color-carbon-light) / <alpha-value>)",
          dark: "rgb(var(--color-carbon-dark) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-brand": "var(--gradient-brand)",
        "gradient-gold": "var(--gradient-gold)",
      },
      boxShadow: {
        "brand-sm": "0 2px 8px rgb(var(--color-plum) / 0.3)",
        "brand-md": "0 4px 20px rgb(var(--color-plum) / 0.4)",
        "brand-lg": "0 8px 40px rgb(var(--color-plum) / 0.5)",
        "gold-glow": "0 0 20px rgb(var(--color-sandlewood) / 0.4)",
      },
    },
  },
  plugins: [],
};
