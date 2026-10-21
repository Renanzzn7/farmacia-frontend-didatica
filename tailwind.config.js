/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f1115',
        surface: '#171a21',
        raised: '#1f232c',
        line: '#2a2f3a',
        ink: { DEFAULT: '#e6e8ee', muted: '#9aa3b2', faint: '#6b7280' },
        brand: { DEFAULT: '#5b9dff', hover: '#7db1ff' },
        success: { DEFAULT: '#4fd1a5', soft: '#0d3b2e' },
        warn: '#f2c14e',
        danger: '#f2766f',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(255 255 255 / 0.03) inset, 0 10px 28px -14px rgb(0 0 0 / 0.7)',
      },
    },
  },
  plugins: [],
}
