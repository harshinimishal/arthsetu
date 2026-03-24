/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#9f402d",
        "secondary-container": "#fe9832",
        tertiary: "#006972",
        surface: "#f9f7f4",
        "on-surface": "#1c1b1f",
        "on-surface-variant": "#49454f",
        outline: "#79747e",
        "surface-container": "#f3f0eb",
        "surface-container-high": "#ece7e0",
        "surface-container-highest": "#e6e1d9",
      },
      fontFamily: {
        sans: ['"Lexend"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}