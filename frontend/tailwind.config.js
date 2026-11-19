/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#03030c',
        darkCard: 'rgba(10, 10, 26, 0.6)',
        accentCyan: '#06b6d4',
        accentPurple: '#8b5cf6',
        accentBlue: '#3b82f6',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
