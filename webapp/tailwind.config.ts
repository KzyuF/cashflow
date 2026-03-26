import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#06060e",
          card: "#0e0e1a",
        },
        accent: {
          primary: "#00d2ff",
          green: "#00ffcc",
          red: "#ff6b6b",
          purple: "#6c5ce7",
          pink: "#f368e0",
          gold: "#ffd700",
          orange: "#f7931a",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
