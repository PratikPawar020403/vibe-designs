import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'paper-white': 'rgb(var(--color-paper-white) / <alpha-value>)',
        'ink-black': 'rgb(var(--color-ink-black) / <alpha-value>)',
        'electric-blue': 'rgb(var(--color-electric-blue) / <alpha-value>)',
        'rani-pink': 'rgb(var(--color-rani-pink) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-clash)'],
        body: ['var(--font-switzer)'],
        mono: ['var(--font-ibm-plex-mono)'],
      }
    },
  },
  plugins: [],
};
export default config;
