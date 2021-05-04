const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: {
    content: ['./src/**/*.html', './src/**/*.js', './src/**/*.tsx'],
    options: {
      safelist: [/^grid-cols/]
    }
  },
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
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text'),
            a: {
              color: theme('colors.text'),
              '&:hover': {
                color: theme('colors.blue'),
              },
              code: { 
                color: theme('colors.pink.light'),
                border: 'none',
              },
            },
            code: {
              color: theme('colors.pink.light'),
              backgroundColor: theme('colors.gray.100'),
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingTop: '2px',
              paddingBottom: '2px',
              borderRadius: theme('rounded'),
              border: 'none'
            },
            'code:before': {
              content: 'none',
            },
            'code:after': {
              content: 'none',
            },
            '> ul > li > *:first-child': {
              marginTop: '0',
            },
            blockquote: {
              p: {
                fontStyle: 'normal',
                margin: '0',
              }
            }
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.200'),
            strong: { color: theme('colors.gray.100') },
            h1: { color: theme('colors.gray.100') },
            h2: { color: theme('colors.gray.100') },
            h3: { color: theme('colors.gray.100') },
            h4: { color: theme('colors.gray.100') },
            h5: { color: theme('colors.gray.100') },
            h6: { color: theme('colors.gray.100') },
            blockquote: {
              color: theme('colors.gray.100'),
            },
          }
        }
      })
    },
  },
  variants: {
    typography: ['dark'],
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}