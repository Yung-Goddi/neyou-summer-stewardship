/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Pulled from Neyou's mascot reference sheet color palette, used
        // for the child-facing screens (src/child) to feel warmer and
        // more consistent with the character art once it's added.
        neyou: {
          brownDark: '#6B4226',
          brown: '#9C6B3F',
          tan: '#D9A566',
          gold: '#F4B942',
          teal: '#2FADA0',
          purple: '#7B5EA7',
          pink: '#F28FA3',
          cream: '#FBF1DD',
        },
      },
    },
  },
  plugins: [],
}
