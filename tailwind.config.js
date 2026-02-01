/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	// Tailwind 4 uses automatic content detection, no content config needed
	darkMode: 'class',
	theme: {
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			black: '#000',
			white: '#fff',
			gray: {
				50: '#f9fafb',
				100: '#f3f4f6',
				200: '#e5e7eb',
				300: '#d1d5db',
				400: '#9ca3af',
				500: '#6b7280',
				600: '#4b5563',
				700: '#374151',
				800: '#1f2937',
				900: '#111827',
				950: '#030712',
				darkbg: '#35414a',
			},
			text: {
				DEFAULT: '#1d1d40',
			},
			darkbg: {
				DEFAULT: '#35414a',
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
			red: {
				DEFAULT: '#c92222',
			},
		},
		extend: {
			fontFamily: {
				sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
				mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
