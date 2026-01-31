
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        // Background
        'bg-deep': 'var(--bg-deep)',
        'bg-base': 'var(--bg-base)',
        
        // Surfaces
        'surface-primary': 'var(--surface-primary)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-hover': 'var(--surface-hover)',
        
        // Strokes
        'stroke-hairline': 'var(--stroke-hairline)',
        'stroke-subtle': 'var(--stroke-subtle)',
        'stroke-medium': 'var(--stroke-medium)',
        
        // Accents
        'accent-cyan': 'var(--accent-cyan)',
        'accent-cyan-dim': 'var(--accent-cyan-dim)',
        'accent-violet': 'var(--accent-violet)',
        'accent-violet-dim': 'var(--accent-violet-dim)',
        'accent-teal': 'var(--accent-teal)',
        'accent-teal-dim': 'var(--accent-teal-dim)',
        
        // Semantic
        'success': 'var(--success)',
        'success-dim': 'var(--success-dim)',
        'warning': 'var(--warning)',
        'warning-dim': 'var(--warning-dim)',
        'danger': 'var(--danger)',
        'danger-dim': 'var(--danger-dim)',
        'info': 'var(--info)',
        'info-dim': 'var(--info-dim)',
        
        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-quaternary': 'var(--text-quaternary)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '18px' }],
        'base': ['15px', { lineHeight: '22px' }],
        'lg': ['17px', { lineHeight: '24px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '38px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.5), 0 8px 10px rgba(0, 0, 0, 0.4)',
        'glow-cyan': '0 0 20px rgba(69, 215, 255, 0.3), 0 0 40px rgba(69, 215, 255, 0.1)',
        'glow-violet': '0 0 20px rgba(122, 92, 255, 0.3), 0 0 40px rgba(122, 92, 255, 0.1)',
        'glow-teal': '0 0 20px rgba(30, 242, 198, 0.3), 0 0 40px rgba(30, 242, 198, 0.1)',
        'inner-highlight': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      },
      backdropBlur: {
        'xs': '4px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      transitionDuration: {
        'fast': '120ms',
        'base': '180ms',
        'slow': '240ms',
      },
      transitionTimingFunction: {
        'out': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 180ms ease-out forwards',
        'slide-up': 'slideUp 240ms ease-out forwards',
        'slide-down': 'slideDown 240ms ease-out forwards',
        'slide-in-right': 'slideInRight 240ms ease-out forwards',
        'scale-in': 'scaleIn 180ms ease-out forwards',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
