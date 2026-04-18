import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans-claude': ['SpaceGrotesk', 'sans-serif'],
        'serif-claude': ['SourceSerif', 'serif'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
}