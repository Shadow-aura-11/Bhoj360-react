export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        agency: { bg: '#0f1117', accent: '#3b82f6', card: '#1a1d27' },
        admin: { bg: '#0f172a', accent: '#6366f1', card: '#1e293b' },
        waiter: { bg: '#1c0a00', accent: '#f59e0b', card: '#292013' },
        counter: { bg: '#1a0000', accent: '#ef4444', card: '#2a1010' },
        customer: { bg: '#f0fdf4', accent: '#16a34a', card: '#ffffff' },
        status: {
          available: '#22c55e',
          occupied: '#ef4444',
          pending: '#eab308',
          preparing: '#f97316',
          ready: '#a855f7',
          reserved: '#3b82f6',
          inactive: '#6b7280',
        },
      },
      keyframes: {
        'pulse-ready': {
          '0%, 100%': { transform: 'scale(1)', borderColor: '#a855f7' },
          '50%': { transform: 'scale(1.02)', borderColor: '#c084fc' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-top': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pulse-ready': 'pulse-ready 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-top': 'slide-in-top 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
