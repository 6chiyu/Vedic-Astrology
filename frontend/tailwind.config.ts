import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        saffron: "#C66A1B",
        teal: "#126E66",
        lotus: "#A83F62",
        paper: "#F7F3EA",
      },
    },
  },
  plugins: [],
};

export default config;
