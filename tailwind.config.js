/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./component/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ✅ Use 'class' strategy for manual toggle
  theme: {
    extend: {},
  },
  plugins: [],
}
