/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      colors: {
        app: {
          950: "#080b10",
          900: "#0b0f15",
          850: "#10151d",
          800: "#151b24",
          750: "#1a212c"
        },
        accent: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(59, 130, 246, 0.08)",
        card: "0 10px 35px rgba(0, 0, 0, 0.18)"
      }
    }
  },
  plugins: []
};