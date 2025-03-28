/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        background: '#f8f9fa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Open Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      transitionTimingFunction: {
        'custom': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '300': '300ms',
      },
      backdropBlur: {
        'custom': '10px',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"],
  },
}