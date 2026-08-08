/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        xs: '380px',
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe7fe',
          500: '#3b6fed',
          600: '#2f5bd6',
          700: '#2547a8',
        },
      },
    },
  },
  plugins: [],
}
