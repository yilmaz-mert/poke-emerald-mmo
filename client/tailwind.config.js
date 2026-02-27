/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Emerald color palette
        emerald: {
          bg: '#e0f8d0',
          light: '#88c070',
          dark: '#34441c',
          deep: '#081820',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px rgba(8, 24, 32, 1)',
        'pixel-hover': '2px 2px 0px 0px rgba(8, 24, 32, 1)',
        'pixel-in': 'inset 4px 4px 0px 0px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}