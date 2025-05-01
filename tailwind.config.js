/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {
      colors: {
        "primary-50": "#E6EEF8",
        "primary-100": "#C2D5EC",
        "primary-200": "#9EBBE0",
        "primary-300": "#7AA1D4",
        "primary-400": "#5687C8",
        "primary-500": "#326DBC",
        "primary-600": "#1A4FA0",
        "primary-700": "#003B95",
        "primary-800": "#00327D",
        "primary-900": "#001C47",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
        montserrat: ["Montserrat", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
