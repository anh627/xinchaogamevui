/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        game: {
          uno: '#E63946',
          chess: '#2A9D8F',
          card: '#F4A261',
        }
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'],
        display: ['Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}