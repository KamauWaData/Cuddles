/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        colors: {
        pinkPrimary: '#F5C0F0',
        pinkAccent: '#E48DDE',
        darkText: '#1A1A1A',
      },
      
    },
  },
  plugins: [],
}
