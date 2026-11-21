/** @type {import('tailwindcss').Config} */

// Дизайн-система «Восточная рукопись» (Ivory Manuscript / Emerald & Gold).
// Тёплая песочно-графитовая нейтральная шкала (вместо холодного синего slate),
// глубокий изумрудный акцент, благородное золото, мягкие тёплые тени.
const slate = {
  50:  '#F8F6F0',
  100: '#EFECE2',
  200: '#DFD9C8',
  300: '#C6BFAA',
  400: '#9C9683',
  500: '#78725F',
  600: '#5B5646',
  700: '#433F33',
  800: '#2F2C24',
  900: '#1E1C16',
  950: '#131208',
};

const emerald = {
  50:  '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',
  600: '#059669',
  700: '#047857',
  750: '#06513D',
  800: '#065F46',
  850: '#05452F',
  900: '#05372A',
  950: '#02241C',
};

const gold = {
  50:  '#FBF7EA',
  100: '#F6ECCB',
  200: '#EDD98F',
  300: '#E3C25C',
  400: '#D9AC35',
  500: '#C9962B',
  600: '#A97721',
  700: '#8A5C1E',
  800: '#6F4A1D',
  900: '#5C3D1C',
  950: '#38230E',
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
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fluid-sm': 'clamp(0.82rem, 0.78rem + 0.2vw, 0.92rem)',
        'fluid-lg': 'clamp(1.05rem, 0.95rem + 0.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.3rem, 1.05rem + 1.2vw, 1.85rem)',
        'fluid-2xl': 'clamp(1.6rem, 1.2rem + 2vw, 2.5rem)',
      },
      colors: {
        slate,
        emerald,
        gold,
        amber: gold,
        ink: slate,
      },
      letterSpacing: {
        kicker: '0.12em',
      },
      boxShadow: {
        'apple-xs': '0 1px 2px rgba(67, 48, 16, 0.05)',
        'apple-sm': '0 1px 3px rgba(67, 48, 16, 0.06), 0 1px 2px rgba(67, 48, 16, 0.04)',
        'apple-md': '0 4px 8px -2px rgba(67, 48, 16, 0.07), 0 2px 4px -1px rgba(67, 48, 16, 0.04)',
        'apple-lg': '0 12px 28px -6px rgba(67, 48, 16, 0.10), 0 4px 10px -2px rgba(67, 48, 16, 0.05)',
        'apple-xl': '0 24px 48px -8px rgba(67, 48, 16, 0.14), 0 8px 16px -4px rgba(67, 48, 16, 0.06)',
        'glow-emerald': '0 0 0 1px rgba(16,185,129,0.3), 0 8px 24px -4px rgba(16,185,129,0.25)',
        'glow-gold': '0 0 0 1px rgba(217, 172, 53, 0.35), 0 6px 18px -4px rgba(201, 150, 43, 0.30)',
        'lift': '0 1px 3px rgba(67,48,16,0.05), 0 14px 30px -8px rgba(67,48,16,0.12)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
