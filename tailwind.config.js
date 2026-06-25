/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sanad-blue': '#4c6cd0',
        'bright-gold': '#ffc57e',
        'deep-navy': '#1e293b',
        'cloud-white': '#faf8f4',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
