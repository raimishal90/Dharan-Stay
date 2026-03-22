/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2B7A3B',
          50: '#F0F9F1',
          100: '#DCF0DE',
          200: '#BBE2C0',
          300: '#8CCC95',
          400: '#5BB368',
          500: '#2B7A3B',
          600: '#236B32',
          700: '#1D5729',
          800: '#1A4724',
          900: '#163B1F',
        },
        accent: {
          DEFAULT: '#F5A623',
          50: '#FFF8EB',
          100: '#FEECC7',
          200: '#FDDB8A',
          300: '#F5A623',
          400: '#E8951A',
          500: '#D17D0E',
        },
        forest: {
          DEFAULT: '#1c3a28',
          mid: '#2d5a3d',
        },
        cream: '#f7f2e9',
        card: '#fffdf8',
        terra: '#c4622d',
        gold: '#c8922a',
        ink: '#2a1f14',
        muted: '#7a6a55',
        border: '#e5dcc8',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.1)',
        'elevated': '0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.12)',
        'nav': '0 1px 3px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
