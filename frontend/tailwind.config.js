/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
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
        display: ['"Playfair Display"', 'serif'],
        body: ['"Crimson Pro"', 'serif'],
      },
    },
  },
  plugins: [],
};
