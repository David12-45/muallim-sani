/** @type {import('tailwindcss').Config} */

// Дизайн-система «Изумрудная ночь / пергамент».
// Нейтральная шкала slate перекрашена в тёплые чернильно-зелёные оттенки,
// emerald — в глубокий изумруд, amber — в античное золото.
const ink = {
  50:  '#F5F3EC',
  100: '#EBE8DD',
  200: '#D6D2C2',
  300: '#B4B0A0',
  400: '#8C8A7D',
  500: '#6B6B60',
  600: '#52534B',
  700: '#3D403A',
  800: '#292C27',
  900: '#1B1E1B',
  950: '#0F1210',
};

const emerald = {
  50:  '#EDF7F1',
  100: '#D6EFE3',
  200: '#AADFCD',
  300: '#71C8AC',
  400: '#3BAD8B',
  500: '#178F6F',
  600: '#0F7359',
  700: '#0E5C48',
  800: '#0E4A3B',
  850: '#0B3D31',
  900: '#0C322A',
  950: '#06231D',
};

const gold = {
  50:  '#FBF7EA',
  100: '#F5ECCF',
  200: '#EBD9A0',
  300: '#E0C274',
  400: '#D4AB52',
  500: '#C79538',
  600: '#A87A28',
  700: '#855E1F',
  800: '#684817',
  900: '#4E3611',
  950: '#33230B',
};

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
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Unbounded"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fluid-sm': 'clamp(0.82rem, 0.78rem + 0.2vw, 0.92rem)',
        'fluid-lg': 'clamp(1.05rem, 0.95rem + 0.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.3rem, 1.05rem + 1.2vw, 1.85rem)',
        'fluid-2xl': 'clamp(1.6rem, 1.2rem + 2vw, 2.5rem)',
      },
      colors: {
        slate: ink,
        emerald,
        gold,
        amber: gold,
        ink,
      },
      letterSpacing: {
        kicker: '0.14em',
      },
      boxShadow: {
        'glow-gold': '0 0 0 1px rgba(212,171,82,0.35), 0 8px 30px -6px rgba(199,149,56,0.35)',
        'lift': '0 1px 2px rgba(15,18,16,0.05), 0 12px 32px -8px rgba(15,18,16,0.14)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
