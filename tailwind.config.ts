import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C9A84C",
          l: "#E8C97A",
          ll: "#F5E4B0",
          d: "#8B6914",
        },
        teal: {
          DEFAULT: "#0D3D3A",
          m: "#0A2E2C",
        },
        navy: {
          DEFAULT: "#0D1B2A",
          d: "#070F18",
          dd: "#040C14",
        },
        ink: {
          text: "#E8DCC8",
          muted: "#9A8B75",
          dim: "#5A5040",
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', "serif"],
        serif: ['"Cinzel"', "serif"],
        sans: ['"Raleway"', "sans-serif"],
      },
      borderColor: {
        gld: "rgba(201,168,76,.15)",
        gldh: "rgba(201,168,76,.4)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(26px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        ptrise: {
          "0%": { opacity: "0", transform: "translateY(100vh) rotate(0)" },
          "15%": { opacity: ".6" },
          "85%": { opacity: ".2" },
          "100%": { opacity: "0", transform: "translateY(-50px) rotate(720deg)" },
        },
        orbDrift: {
          "0%,100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(40px,-30px)" },
        },
      },
      animation: {
        fadeUp: "fadeUp .8s both",
        orbDrift: "orbDrift ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
