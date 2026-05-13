import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      keyframes: {
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.15s ease-out',
      },
      colors: {
        primary: {
          DEFAULT: '#0046B4',
          hover: '#003A96',
        },
        disabled: {
          DEFAULT: '#B0B8C1',
          bg: '#F2F4F6',
        },
        error: '#E53E3E',
        success: '#38A169',
        text: {
          primary: '#191F28',
          secondary: '#4E5968',
          disabled: '#8B95A1',
        },
        bg: {
          default: '#FFFFFF',
          subtle: '#F9FAFB',
        },
        border: '#E5E8EB',
        overlay: 'rgba(0,0,0,0.48)',
      },
    },
  },
  plugins: [],
}

export default config
