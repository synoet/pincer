/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-background": "#272831",
        "lighter-background": "#373946",
      }
    },
  },
  plugins: [],
};
