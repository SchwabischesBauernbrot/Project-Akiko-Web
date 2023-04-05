/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {      
      backgroundColor: {
        'selected-color': '#your-color-code', // Replace #your-color-code with the color you want
      },
      textColor: {
        'selected-text-color': '#your-color-code', // Replace #your-color-code with the color you want
      },},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
