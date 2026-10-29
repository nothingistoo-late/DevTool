import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: ["dark", "light", "dim", "dracula"],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  }
};
