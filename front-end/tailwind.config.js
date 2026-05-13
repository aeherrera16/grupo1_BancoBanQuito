/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        banker: {
          navy: '#1a365d',
          blue: '#2c5aa0',
          gold: '#d4a574',
          light: '#f8f9fa',
          dark: '#2d3748',
          gray: '#718096',
        }
      }
    },
  },
  plugins: [],
}
