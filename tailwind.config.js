/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#53BDEB',
          50: '#EFF9FE',
          100: '#D6F1FC',
          200: '#ADE3F9',
          300: '#7DD3F5',
          400: '#53BDEB',
          500: '#2BA8DB',
          600: '#1E8BB8',
          700: '#186F94',
          800: '#155A78',
          900: '#144B64',
        },
        sidebar: '#0F172A',
        surface: '#FFFFFF',
        muted: {
          DEFAULT: '#64748B',
          bg: '#F8FAFC',
          border: '#E2E8F0',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)',
        'card-md': '0 4px 6px -1px rgb(15 23 42 / 0.07), 0 2px 4px -2px rgb(15 23 42 / 0.07)',
      },
    },
  },
  plugins: [],
};
