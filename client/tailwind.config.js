/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3b3dc0",
        "primary-container": "#5558d9",
        "on-primary": "#ffffff",
        "on-primary-container": "#e8e6ff",
        "primary-fixed": "#e1e0ff",
        "primary-fixed-dim": "#c0c1ff",
        secondary: "#006c47",
        "secondary-container": "#90f4c0",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#00714b",
        "secondary-fixed": "#93f6c3",
        tertiary: "#6f4800",
        "tertiary-container": "#8f5e00",
        "tertiary-fixed": "#ffddb2",
        "on-tertiary-fixed": "#291800",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        surface: "#fbf8ff",
        "surface-dim": "#d9d9e7",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f2ff",
        "surface-container": "#ededfb",
        "surface-container-high": "#e7e7f5",
        "surface-container-highest": "#e1e1f0",
        "on-surface": "#191b25",
        "on-surface-variant": "#464554",
        outline: "#767585",
        "outline-variant": "#c7c5d6",
        background: "#fbf8ff",
        "on-background": "#191b25"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Geist", "sans-serif"],
        display: ["Geist", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      }
    },
  },
  plugins: [],
};
