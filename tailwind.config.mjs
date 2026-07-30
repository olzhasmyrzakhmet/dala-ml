/** @type {import('tailwindcss').Config} */
export default{
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dala: {
          bg: '#12140F',
          surface: '#1B1E17',
          text: '#EDEAE2',
          muted: '#9A9B90',
          gold: '#D9A441',
          water: '#3FA9A0',
          alert: '#D9614C',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
