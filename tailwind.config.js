/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFF8EC',
        ink: '#3B3660',
        sun:   { DEFAULT: '#FFC53D', dark: '#E3A312', soft: '#FFF0C7' },
        coral: { DEFAULT: '#FF7B6B', dark: '#DE5646', soft: '#FFE3DD' },
        mint:  { DEFAULT: '#3ECF8E', dark: '#22A76B', soft: '#D9F5E7' },
        sky:   { DEFAULT: '#4FB3FF', dark: '#2E8FDB', soft: '#DDEEFF' },
        grape: { DEFAULT: '#9D7BFF', dark: '#7A55E0', soft: '#ECE4FF' },
        candy: { DEFAULT: '#FF8FB8', dark: '#E06693', soft: '#FFE4EE' },
      },
      fontFamily: {
        display: ['Unbounded', 'Nunito', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: { blob: '28px' },
      keyframes: {
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(.7)' },
          '70%': { transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'screen-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-7px)' } },
        wiggle: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        'star-rise': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(.6)' },
          '100%': { opacity: '0', transform: 'translateY(-90px) scale(1.6)' },
        },
        toast: {
          '0%': { opacity: '0', transform: 'translateY(-16px) scale(.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'pop-in': 'pop-in .35s cubic-bezier(.34,1.56,.64,1) both',
        'screen-in': 'screen-in .3s ease-out both',
        float: 'float 3.5s ease-in-out infinite',
        wiggle: 'wiggle 2.2s ease-in-out infinite',
        shake: 'shake .4s ease-in-out',
        'star-rise': 'star-rise .9s ease-out forwards',
        toast: 'toast .3s ease-out both',
      },
    },
  },
  plugins: [],
};