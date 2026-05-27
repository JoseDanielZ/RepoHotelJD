/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf8ec',
          100: '#faeecb',
          200: '#f5db8f',
          300: '#f0c54d',
          400: '#e9ae25',
          500: '#C9A840',
          600: '#a8870f',
          700: '#86690e',
          800: '#6e5312',
          900: '#5e4614',
        },
        navy: {
          50:  '#eff3fb',
          100: '#d8e2f5',
          200: '#b8cded',
          300: '#87aade',
          400: '#5081cc',
          500: '#2d5fb8',
          600: '#1C3361',
          700: '#1a2e56',
          800: '#192849',
          900: '#19243f',
        },
        kairos: {
          bg: '#F9F7F3',
          card: '#FFFFFF',
          border: '#E8E2D8',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
