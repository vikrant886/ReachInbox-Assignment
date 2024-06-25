/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'cards': ' 0.1px 0.1px 30px #bebebe',
        'darkcards' : 'inset 10px 10px 22px #101010,inset -10px -10px 22px #262626',
      },
    },
  },
  plugins: [],
}