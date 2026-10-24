/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        orbi: {
          bg: "#080614",
          card: "#120e26",
          cardHover: "#1b1538",
          border: "#262047",
          borderLight: "#383060",
          primary: "#8b5cf6",
          primaryDark: "#6d28d9",
          glow: "#a855f7",
          text: "#f8fafc",
          textMuted: "#94a3b8",
        },
      },
    },
  },
  plugins: [],
};
