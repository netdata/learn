const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.html', './src/**/*.js', './src/**/*.tsx'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.coolGray,
      text: {
        DEFAULT: '#1d1d40'
      },
      green: {
        lighter: '#75D54A',
        light: '#00CB51',
        DEFAULT: '#00AB44',
      },
      pink: {
        lighter: '#CFB4EF',
        light: '#EF37D6',
        DEFAULT: '#D400B9',
      },
      blue: {
        lighter: '#9ED0FF',
        light: '#64ADFF',
        DEFAULT: '#5790FF',
      },
      amber: {
        lighter: '#FFE182',
        light: '#FFD74F',
        DEFAULT: '#FFC300',
      },
    },
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
        mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}