/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'utpl-blue': {
          DEFAULT: '#003366',
          light: '#004080',
          dark: '#002244',
        },
        'utpl-gold': {
          DEFAULT: '#FDB913',
          light: '#FDCA3B',
          dark: '#E5A812',
        },
      },
    },
  },
  plugins: [],
}
