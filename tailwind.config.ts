import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1d4ed8',
        secondary: '#475569',
        accent: '#f59e0b',
        background: '#ffffff',
        foreground: '#111111',
      },
      backgroundColor: {
        primary: '#2563eb',
        'primary-dark': '#1d4ed8',
        secondary: '#475569',
      },
      textColor: {
        primary: '#2563eb',
        'primary-dark': '#1d4ed8',
        secondary: '#475569',
      },
    },
  },
  plugins: [],
} satisfies Config;
