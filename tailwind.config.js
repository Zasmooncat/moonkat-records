/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
        'zen': ['"Zen Dots"', 'cursive'],
        'bebas': ['"Bebas Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}