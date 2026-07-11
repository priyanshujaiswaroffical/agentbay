/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tahoma: ['Tahoma', 'Verdana', 'Segoe UI', 'sans-serif'],
        verdana: ['Verdana', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
