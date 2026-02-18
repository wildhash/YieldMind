/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-lime': '#39FF14',
        'dark-bg': '#0a0a0a',
        'dark-panel': '#1a1a1a',
        'dark-border': '#2a2a2a',
      },
      boxShadow: {
        'neon': '0 0 5px #39FF14, 0 0 20px #39FF14',
        'neon-lg': '0 0 10px #39FF14, 0 0 40px #39FF14',
      },
    },
  },
  plugins: [],
}
