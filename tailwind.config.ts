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
        neoYellow: "#ffe17c",
        neoCharcoal: "#171e19",
        neoSage: "#b7c6c2",
        neoCanvas: "#f4f4f5",
        neoDark: "#272727",
        neoDivider: "#e4e4e7",
        neoBorder: "#000000",
        statusGreen: "#28c840",
        statusAmber: "#febc2e",
        statusRed: "#ff5f57",
      },
      boxShadow: {
        "neo-sm": "2px 2px 0 0 #000000",
        neo: "4px 4px 0 0 #000000",
        "neo-lg": "8px 8px 0 0 #000000",
        "neo-xl": "12px 12px 0 0 #000000",
        "neo-pressed": "0 0 0 0 #000000",
      },
      fontFamily: {
        heading: ["'Cabinet Grotesk'", "system-ui", "sans-serif"],
        body: ["'Satoshi'", "system-ui", "sans-serif"],
      },
      borderWidth: {
        "2": "2px",
        "3": "3px",
      },
      borderRadius: {
        btn: "10px",
        card: "14px",
        mockup: "16px",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [],
};

export default config;

