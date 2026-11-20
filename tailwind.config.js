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
        sans: ['"Onest"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      // Более спокойная типографика: вместо сплошных 800/900 — 650/700
      fontWeight: {
        extrabold: '650',
        black: '700'
      },
      // Мягче скругления: единая шкала вместо «пузырей»
      borderRadius: {
        '2xl': '0.875rem',
        '3xl': '1.25rem'
      },
      colors: {
        // Нейтральная шкала с лёгким зелёным оттенком (светлая и тёмная тема)
        slate: {
          50: '#f6f8f7',
          100: '#edf0ee',
          200: '#dde2df',
          300: '#c2cac6',
          400: '#8e9a95',
          500: '#65726c',
          600: '#4a5651',
          700: '#343e3a',
          800: '#1e2724',
          900: '#141b19',
          950: '#0b1110'
        },
        // Глубокий изумрудный — основной цвет бренда
        emerald: {
          500: '#16976f',
          600: '#0f7a5c',
          700: '#0c6249',
          800: '#0a4d3a',
          850: '#083f31',
          900: '#07372b',
          950: '#04241b'
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
