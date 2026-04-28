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
        heart: { DEFAULT: '#DC2D2B', soft: '#F4D5D4', deep: '#A81E1C' },
        state: {
          done:           '#2F8746',
          'done-bg':      '#C7E7CE',
          'done-ink':     '#154A1E',
          partial:        '#C98B14',
          'partial-bg':   '#FBE6A3',
          'partial-ink':  '#5E430A',
          none:           '#7FAA92',
          'none-bg':      '#E4EADD',
          'none-ink':     '#1E4434',
        },
        action: {
          bg:     '#D7E4D6',
          border: '#6E927C',
          ink:    '#1E4434',
        },
        surface: '#F4F1EA',
        card:    '#FBF8F1',
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
