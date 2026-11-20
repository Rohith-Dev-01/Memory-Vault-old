/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F5F1E8',
        forest: '#29483B',
        'forest-50': '#E8EFEB',
        'forest-100': '#C9D8CF',
        'forest-600': '#1E3829',
        terracotta: '#C77C61',
        'terracotta-600': '#B5664A',
        sand: '#E8E3D8',
        border: '#DDD8CA',
        'primary-text': '#29352F',
        'secondary-text': '#777B70',
        success: '#64856C',
        warning: '#C28B4B',
        error: '#B65F55',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(41,53,47,0.04), 0 4px 16px rgba(41,53,47,0.06)',
        card: '0 1px 3px rgba(41,53,47,0.05), 0 8px 30px rgba(41,53,47,0.07)',
        lift: '0 2px 6px rgba(41,53,47,0.06), 0 14px 40px rgba(41,53,47,0.10)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};
