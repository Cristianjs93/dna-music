/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dna: {
          bg: '#0a0a0a',
          surface: '#141414',
          border: '#2a2a2a',
          muted: '#a3a3a3',
          gold: '#fdb913',
          'gold-dark': '#d99b0f',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
