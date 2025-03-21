/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false, // Disable dark mode completely
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e9f9f8",  // aqua-spring
          100: "#ccecec", // jagged-ice
          200: "#a3e0dc",
          300: "#6dceca",
          400: "#2cbcac", // shamrock
          500: "#14d4d4", // bright-turquoise
          600: "#04ac9c", // persian-green
          700: "#04b4a4", // persian-green variant
          800: "#08aca4", // niagara
          900: "#037a73",
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        }
      }
    },
  },
  plugins: [],
}
