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
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },
        success: {
          50: 'var(--success-50)',
          100: 'var(--success-100)',
          300: 'var(--success-300)',
          500: 'var(--success-500)',
          700: 'var(--success-700)', 
          900: 'var(--success-900)',
        },
        warning: {
          50: 'var(--warning-50)',
          100: 'var(--warning-100)',
          300: 'var(--warning-300)',
          500: 'var(--warning-500)',
          700: 'var(--warning-700)',
          900: 'var(--warning-900)',
        },
        error: {
          50: 'var(--error-50)',
          100: 'var(--error-100)',
          300: 'var(--error-300)',
          500: 'var(--error-500)',
          700: 'var(--error-700)',
          900: 'var(--error-900)',
        },
        info: {
          50: 'var(--info-50)',
          100: 'var(--info-100)',
          300: 'var(--info-300)',
          500: 'var(--info-500)',
          700: 'var(--info-700)',
          900: 'var(--info-900)',
        },
      }
    },
  },
  plugins: [],
}
