/** @type {import('tailwindcss').Config} */

// Дизайн-система «Современный минимализм (Apple / Notion style)».
// Чистая нейтральная шкала slate/zinc, современный изумрудный акцент,
// благородный янтарь для достижений и мягкие многослойные тени.
const slate = {
  50:  '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
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
  800: '#065F46',
  850: '#064E3B',
  900: '#064E3B',
  950: '#022C22',
};

const gold = {
  50:  '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
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
        'apple-xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'apple-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'apple-xl': '0 20px 40px -6px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'glow-emerald': '0 0 0 1px rgba(16,185,129,0.3), 0 8px 24px -4px rgba(16,185,129,0.25)',
        'lift': '0 1px 3px rgba(0,0,0,0.04), 0 14px 30px -8px rgba(0,0,0,0.08)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
