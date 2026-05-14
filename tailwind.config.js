/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ededed',
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          hover: '#4f46e5',   // indigo-600
        },
        accent: {
          DEFAULT: '#a855f7', // purple-500
          hover: '#9333ea',   // purple-600
        },
        surface: {
          DEFAULT: '#18181b', // zinc-900
          hover: '#27272a',   // zinc-800
          elevated: '#27272a',
        },
        border: {
          DEFAULT: '#3f3f46', // zinc-700
          light: '#52525b',   // zinc-600
        },
      },
    },
  },
  plugins: [],
}