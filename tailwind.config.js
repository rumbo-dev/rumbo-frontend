/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        rumbo: {
          navy: '#12284C',
          coral: '#E8856A',
          green: '#0EA874',
          red: '#E54A41',
          amber: '#F59E0B',
          light: '#F8F9FA',
          border: '#E5E7EB',
        }
      }
    },
  },
  plugins: [],
}
