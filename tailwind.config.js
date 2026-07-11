/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        sand: {
          50: "#FBF6EE",
          100: "#F4ECE0",
          200: "#EBDFCB",
          300: "#D9CDB8",
        },
        ink: {
          DEFAULT: "#3A2E22",
          soft: "#6B5A47",
        },
        moss: {
          DEFAULT: "#2F4A3C",
          light: "#3E5E4D",
          deep: "#243A2F",
        },
        ochre: {
          DEFAULT: "#C8643A",
          light: "#D87E50",
          deep: "#A24E29",
        },
        stamp: "#A23B2A",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"Spectral"', "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        tag: "8px",
      },
      boxShadow: {
        paper: "0 1px 0 rgba(58,46,34,0.06), 0 8px 24px -16px rgba(58,46,34,0.25)",
        stamp: "0 2px 0 rgba(162,59,42,0.18)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 20%, rgba(58,46,34,0.04) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(200,100,58,0.05) 0, transparent 45%)",
        "dashed-line":
          "repeating-linear-gradient(to right, #D9CDB8 0 6px, transparent 6px 12px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "stamp-press": {
          "0%": { transform: "scale(1.2) rotate(-8deg)", opacity: "0" },
          "60%": { transform: "scale(0.95) rotate(-8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
        "slide-in": "slide-in 0.3s ease-out both",
        "slide-up": "slide-up 0.3s ease-out both",
        "stamp-press": "stamp-press 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
