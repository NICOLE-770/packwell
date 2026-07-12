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
          50: "#FFF8F5",
          100: "#FFF0EA",
          200: "#FFE4D6",
          300: "#FFD0BC",
        },
        ink: {
          DEFAULT: "#2D3047",
          soft: "#6B6D8A",
        },
        moss: {
          DEFAULT: "#FF6B6B",
          light: "#FF8787",
          deep: "#E85555",
        },
        ochre: {
          DEFAULT: "#FFA952",
          light: "#FFBE7A",
          deep: "#E88C2E",
        },
        teal: {
          DEFAULT: "#4ECDC4",
          light: "#6FD8D0",
          deep: "#3AB8B0",
        },
        sun: {
          DEFAULT: "#FFE66D",
          light: "#FFEE8A",
          deep: "#F0D440",
        },
        lavender: {
          DEFAULT: "#C490E4",
          light: "#D4A5ED",
          deep: "#A66FD0",
        },
        stamp: "#E85555",
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
        paper: "0 2px 0 rgba(45,48,71,0.04), 0 8px 28px -16px rgba(45,48,71,0.2)",
        stamp: "0 2px 0 rgba(255,107,107,0.18)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 20%, rgba(255,107,107,0.08) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(78,205,196,0.08) 0, transparent 45%)",
        "dashed-line":
          "repeating-linear-gradient(to right, #FFD0BC 0 6px, transparent 6px 12px)",
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
