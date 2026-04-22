import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          950: '#0A1F0F',
          900: '#122A18',
          800: '#1A3D22',
          700: '#2E6B40',
          600: '#3A8A52',
          500: '#52A86E',
          400: '#7EC498',
          200: '#B4DEC4',
          100: '#DCF0E4',
          50:  '#F0FAF4',
        },
        citrus: '#D4E832',
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        surface: '#FFFDF5',
        ink: {
          DEFAULT: '#1C1409',
          muted:   '#3D2E1E',
          soft:    '#7A6558',
          faint:   '#C0A882',
        },
        border: '#EDE5D8',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}

export default config
