/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Scheherazade New"', '"Noto Naskh Arabic"', '"Amiri"', 'Traditional Arabic', 'Tahoma', 'serif'],
        quran: ['"Scheherazade New"', '"Amiri Quran"', '"Amiri"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      colors: {
        emerald: {
          850: '#064e3b',
          950: '#022c22'
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        }
      }
    },
  },
  plugins: [],
}
