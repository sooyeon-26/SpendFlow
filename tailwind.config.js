/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#171939",
        aqua: "#20b8f2",
        mint: "#78e4d3",
        foam: "#ecfbff",
        warning: "#f4b23e",
        danger: "#ef6262"
      },
      boxShadow: {
        glass: "0 22px 60px rgba(40, 130, 180, 0.18)",
        soft: "0 14px 36px rgba(46, 112, 152, 0.14)"
      },
      fontFamily: {
        sans: ["Inter", "Pretendard", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
