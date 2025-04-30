/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cursor: {
          bg: 'var(--cursor-bg)',
          sidebar: 'var(--cursor-sidebar)',
          accent: 'var(--cursor-accent)',
          text: 'var(--cursor-text)',
          border: 'var(--cursor-border)',
          hover: 'var(--cursor-hover)',
          active: 'var(--cursor-active)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cursor': '0 0 0 1px var(--cursor-border)',
      },
    },
  },
  plugins: [],
};
