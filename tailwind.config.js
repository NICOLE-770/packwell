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
          50: "#F9F7F3",
          100: "#F3EFE8",
          200: "#E8DFD4",
          300: "#DCCEBD",
        },
        ink: {
          DEFAULT: "#3F4642",
          soft: "#5A635E",
        },
        moss: {
          DEFAULT: "#96BE96",
          light: "#A8CCAB",
          deep: "#7AA37A",
        },
        ochre: {
          DEFAULT: "#DCCEBD",
          light: "#E8DFD4",
          deep: "#C9BBA8",
        },
        teal: {
          DEFAULT: "#96BE96",
          light: "#A8CCAB",
          deep: "#7AA37A",
        },
        sun: {
          DEFAULT: "#DCCEBD",
          light: "#E8DFD4",
          deep: "#C9BBA8",
        },
        lavender: {
          DEFAULT: "#B8A8B8",
          light: "#CAB9CA",
          deep: "#A08EA0",
        },
        stamp: "#B85A5A",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"Spectral"', "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        tag: "12px",
      },
      boxShadow: {
        paper: "0 2px 0 rgba(63,70,66,0.04), 0 8px 28px -16px rgba(63,70,66,0.2)",
        stamp: "0 2px 0 rgba(150,190,150,0.18)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 20%, rgba(150,190,150,0.08) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(220,206,189,0.08) 0, transparent 45%)",
        "dashed-line":
          "repeating-linear-gradient(to right, #DCCEBD 0 6px, transparent 6px 12px)",
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
