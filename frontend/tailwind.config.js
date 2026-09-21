module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        kiaan: {
          pink: "#af0532",
          deep: "#79001d",
          soft: "#ffe1e3",
          cream: "#fff6f3",
          gold: "#D69B55",
          ink: "#231717"
        }
      },
      fontFamily: {
        sans: ["Poppins", "Arial", "Helvetica", "sans-serif"],
        serif: ["\"Playfair Display\"", "Georgia", "serif"]
      },
      boxShadow: {
        kiaan: "0 12px 35px rgba(175,5,50,.14)"
      }
    }
  },
  plugins: []
};
