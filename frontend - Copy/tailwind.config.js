/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(151 64% 53%)',
          dark: 'hsl(151 64% 43%)',
          light: 'hsl(151 64% 95%)',
          foreground: 'hsl(0 0% 100%)',
        },
        secondary: {
          DEFAULT: 'hsl(0 0% 98%)',
          foreground: 'hsl(151 50% 20%)',
        },
        muted: {
          DEFAULT: 'hsl(151 20% 96%)',
          foreground: 'hsl(151 10% 46%)',
        },
        // Add other colors from your CSS variables here
      },
    },
  },
  plugins: [],
}
