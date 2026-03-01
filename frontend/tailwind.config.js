/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f5fa',
          100: '#d7dfec',
          200: '#adc1d4',
          300: '#84a3bc',
          400: '#5a85a5',
          500: '#31678d',
          600: '#2a597a',
          700: '#244b67',
          800: '#1d3d54',
          900: '#172f41',
          950: '#0f232f',
        },
      },
    },
  },
  plugins: [],
}
