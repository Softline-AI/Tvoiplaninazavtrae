/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'noir': {
          'black': '#0a0a0a',
          'dark': '#1a1a1a',
          'gray': '#2a2a2a',
          'light-gray': '#3a3a3a',
          'white': '#ffffff',
          'off-white': '#f8f8f8',
          'accent': '#4a4a4a',
        },
        'blue-main': '#3b82f6',
        'blue-bright': '#60a5fa',
        'gray-25': '#fafafa',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-in-out',
        'noir-fade-in': 'noir-fade-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'noir-slide-in': 'noir-slide-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'noir-glow': 'noir-glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'noir-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'noir-slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'noir-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 255, 255, 0.2)' },
        }
      },
      fontFamily: {
        'noir': ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        'noir': '20px',
      }
    },
  },
  plugins: [],
}