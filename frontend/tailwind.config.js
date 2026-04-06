/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        surface: 'var(--color-surface)',
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'surface-container-lowest': 'var(--color-surface-container-lowest)',
        'surface-container-low': 'var(--color-surface-container-low)',
        'surface-container-highest': 'var(--color-surface-container-highest)',
        'primary-container': 'var(--color-primary-container)',
        'secondary-container': 'var(--color-secondary-container)',
        'on-secondary-container': 'var(--color-on-secondary-container)',
        error: 'var(--color-error)',
        'on-error': 'var(--color-on-error)',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}