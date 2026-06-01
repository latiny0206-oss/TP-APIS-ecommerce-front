/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    'bg-alpenglow/15', 'text-alpenglow', 'border-alpenglow/30',
    'bg-pine/15', 'text-pine-300', 'border-pine/30',
    'bg-blue-500/15', 'text-blue-300', 'border-blue-500/30',
    'bg-pine/20', 'border-pine/40',
    'bg-red-500/15', 'text-red-300', 'border-red-500/30',
    'bg-rock/80', 'border-ivory/10',
    'bg-pine', 'border-pine',
    'bg-alpenglow', 'border-alpenglow',
    'bg-ivory', 'text-rock', 'border-ivory',
    'bg-rock', 'border-rock',
    'border-alpenglow/40',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Archivo"', 'sans-serif'],
        narrow: ['"Archivo Narrow"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        rock: {
          DEFAULT: '#1C1C1A',
          900: '#0F0F0E',
          800: '#26261F',
          700: '#33332B',
          600: '#454338',
          500: '#5C594B',
        },
        ivory: {
          DEFAULT: '#FBF9F0',
          200: '#F0EBDC',
          300: '#E2DAC4',
          400: '#C9C0A8',
        },
        pine: {
          DEFAULT: '#2E5F3A',
          700: '#234A2D',
          600: '#2A5635',
          400: '#3F7A4D',
          300: '#5A9A6A',
        },
        alpenglow: {
          DEFAULT: '#D9701A',
          700: '#B85C0F',
          600: '#C2640F',
          400: '#E58A45',
          300: '#EFA46B',
        },
        dust: { DEFAULT: '#8A8475', 700: '#6F685D' },
        status: {
          pending: '#D9701A',
          confirmed: '#2E5F3A',
          delivered: '#1F5BA8',
          cancelled: '#9B3A3A',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
        'widest-2': '0.22em',
      },
    },
  },
  plugins: [],
}
