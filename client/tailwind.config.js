/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        board: '#1a3a2a',
        'board-border': '#2d5a3e',
        'tile-bg': '#f5deb3',
        'tile-dark': '#c8a46e',
        'tile-text': '#2c1810',
        'tw-sq': '#8b0000',
        'dw-sq': '#7b4066',
        'tl-sq': '#1a3a6b',
        'dl-sq': '#1a5c5c',
        accent: '#c8a46e',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        tile: ['"IM Fell English"', 'Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
