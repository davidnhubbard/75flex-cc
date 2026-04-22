import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          950: '#06120D',
          900: '#0C1F17',
          800: '#132E22',
          700: '#1E4434',
          600: '#2F5443',
          500: '#4A7A62',
          400: '#7FAA92',
          200: '#B2C8B0',
          100: '#D2E0C4',
          50:  '#E4EADD',
        },
        ember: '#E87F2A',
        amber: {
          DEFAULT: '#E87F2A',
          light:   '#F6E4CF',
        },
        surface: '#F4F1EA',
        ink: {
          DEFAULT: '#14170F',
          muted:   '#2F3326',
          soft:    '#6E6858',
          faint:   '#A8A292',
        },
        border: '#D7D2C2',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans:    ['var(--font-sans)',    'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}

export default config
