const { nextui } = require('@nextui-org/react/tailwind');

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Add other directories with content as needed
  ],
  theme: {
    extend: {},
  },
  plugins: [nextui()],
};