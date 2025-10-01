/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        primary: '#FFFFFF',
        secondary: '#808080',
        'blue-main': '#3b82f6',
        'blue-bright': '#60a5fa',
        'gray-25': '#fafafa',
        // Black theme colors
        'black-bg': '#000000',
        'black-card': '#222222',
        'black-border': '#333333',
        'black-text': '#ffffff',
        'black-text-muted': '#aaaaaa',
        'black-text-secondary': '#888888',
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-in-out',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}