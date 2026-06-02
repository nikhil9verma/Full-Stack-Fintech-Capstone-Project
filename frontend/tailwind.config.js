/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          900: '#030712',
          800: '#0a0f1e',
          700: '#0d1529',
          600: '#111827',
          500: '#1a2234',
          400: '#1e293b',
          300: '#263348',
        },
        accent: {
          cyan:    '#06b6d4',
          teal:    '#0d9488',
          blue:    '#3b82f6',
          purple:  '#8b5cf6',
          green:   '#10b981',
          yellow:  '#f59e0b',
          orange:  '#f97316',
          red:     '#ef4444',
        },
      },
      backgroundImage: {
        'glow-cyan':   'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.15) 0%, transparent 70%)',
        'glow-blue':   'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
        'card-glass':  'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(6,182,212,0.25)',
        'glow-md':  '0 0 24px rgba(6,182,212,0.3)',
        'glow-lg':  '0 0 48px rgba(6,182,212,0.2)',
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'fade-in':      'fadeIn 0.4s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },                  to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
