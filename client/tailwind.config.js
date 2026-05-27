/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F5C518',
        primaryDark: '#E6B800',
        primaryLight: '#FDF3C0',
        accent: '#1A1A1A',
        accentSoft: '#2D2D2D',
        surface: '#F7F7F2',
        surfaceAlt: '#FFFDF0',
        textPrimary: '#1A1A1A',
        textSecondary: '#555555',
        textMuted: '#888888',
        border: '#EEEEEE',
        borderStrong: '#DDDDDD',
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      maxWidth: {
        container: '1200px',
      },
      spacing: {
        nav: '72px',
      },
      height: {
        nav: '72px',
        input: '52px',
      },
      borderRadius: {
        card: '20px',
        input: '12px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.08)',
        cardHover: '0 8px 40px rgba(0,0,0,0.12)',
        nav: '0 2px 12px rgba(0,0,0,0.06)',
        btn: '0 4px 16px rgba(245,197,24,0.4)',
        btnHover: '0 8px 24px rgba(245,197,24,0.5)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      fontSize: {
        hero: 'clamp(48px, 7vw, 80px)',
      },
      letterSpacing: {
        hero: '-0.03em',
        label: '0.08em',
      },
      lineHeight: {
        hero: '1.05',
        body: '1.7',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
