const { join } = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, './playground/**/*.{js,jsx,ts,tsx}'),
    join(__dirname, './src/**/*.{js,jsx,ts,tsx}'),
  ],
  theme: {},
  plugins: [],
}
