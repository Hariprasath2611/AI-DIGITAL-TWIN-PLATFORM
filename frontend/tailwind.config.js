/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0B1120',
        electricCyan: '#06B6D4',
        neonPurple: '#8B5CF6',
        darkGlass: 'rgba(15, 23, 42, 0.45)',
        borderGlass: 'rgba(255, 255, 255, 0.08)',
      },
      boxShadow: {
        glowCyan: '0 0 20px rgba(6, 182, 212, 0.35)',
        glowPurple: '0 0 20px rgba(139, 92, 246, 0.35)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
