/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // B2B Monochromatic Professional Palette - Light Mode
        slate: {
          950: '#0f1419',
          900: '#1a1f2e',
          850: '#232936',
          800: '#2d333f',
          750: '#373d49',
          700: '#4a5568',
          600: '#64748b',
          500: '#94a3b8',
          400: '#cbd5e1',
          300: '#e2e8f0',
          200: '#f1f5f9',
          100: '#f8fafc',
          50: '#fcfcfd',
        },
        // Dark mode specific colors
        dark: {
          bg: {
            primary: '#0a0e14',
            secondary: '#12161f',
            tertiary: '#1a1f2e',
            elevated: '#232936',
          },
          border: {
            primary: '#232936',
            secondary: '#2d333f',
          },
        },
        // Minimal accent for data points
        accent: {
          primary: '#3b82f6',   // Blue for primary actions
          success: '#059669',   // Green for success
          warning: '#d97706',   // Amber for warnings
          error: '#dc2626',     // Red for errors
          info: '#0891b2',      // Cyan for info
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'panel': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'panel-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'dark-panel': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'dark-panel-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
      },
      backgroundImage: {
        'grid-sm': 'linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
        'dot-pattern': 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-sm': '20px 20px',
        'dot-pattern': '16px 16px',
      },
    },
  },
  plugins: [],
}
