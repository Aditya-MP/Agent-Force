/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#050505',
        'glass-dark': 'rgba(10, 10, 10, 0.6)',
        'neon-cyan': '#00f3ff',
        'neon-purple': '#bc13fe',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.15) 0%, rgba(15, 23, 42, 0) 50%)',
      }
    },
  },
  plugins: [],
}
