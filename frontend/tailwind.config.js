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
          DEFAULT: '#0f172a', // Slate 900 - Deep Business Navy
          light: '#334155',    // Slate 700
          dark: '#020617',     // Slate 950
        },
        'utpl-gold': {
          DEFAULT: '#d97706', // Amber 600 - Muted Gold
          light: '#fbbf24',   // Amber 400
          dark: '#b45309',    // Amber 700
        },
        'brand': {
          primary: '#0f172a',
          secondary: '#d97706',
          accent: '#0ea5e9',  // Sky 500 for links/highlights
          background: '#f8fafc', // Slate 50
          surface: '#ffffff',
          text: {
            primary: '#1e293b', // Slate 800
            secondary: '#64748b', // Slate 500
            muted: '#94a3b8',   // Slate 400
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
