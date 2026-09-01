/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: {
          DEFAULT: "#121212",
          elevated: "#181818",
          subtle: "#1F1F1F",
        },
        accent: {
          gold: "#C5A880",
          "gold-hover": "#D4B890",
          "gold-dark": "#A88B63",
          "gold-subtle": "rgba(197, 168, 128, 0.12)",
        },
        border: {
          subtle: "#262626",
          strong: "#3A3A3A",
          gold: "#C5A880",
        }
      },
    },
  },
  plugins: [],
};
