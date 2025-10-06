module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#A8E6CF',
          DEFAULT: '#5CDB95',
          dark: '#379683',
        },
        secondary: {
          light: '#FFE156',
          DEFAULT: '#F9C74F',
          dark: '#F94144',
        },
      },
      gradientColorStops: theme => ({
        ...theme('colors'),
        'eco-gradient': ['#A8E6CF', '#5CDB95', '#379683'],
      }),
      boxShadow: {
        'eco': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}