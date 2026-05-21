import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        sentiment: {
          bullish: "#22c55e",
          bearish: "#ef4444",
          neutral: "#eab308",
          unknown: "#9ca3af",
        },
        impact: {
          high: "#22c55e",
          medium: "#eab308",
          low: "#9ca3af",
          none: "#d1d5db",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
