// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(0, 25%, 3%)",
        card: "hsl(0, 0%, 100%)",
        "card-foreground": "hsl(0, 25%, 3%)",
        popover: "hsl(0, 0%, 100%)",
        "popover-foreground": "hsl(0, 25%, 3%)",
        primary: {
          DEFAULT: "hsl(239, 40%, 26%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        secondary: {
          DEFAULT: "hsl(143, 22%, 72%)",
          foreground: "hsl(0, 25%, 3%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 85%, 60%)",
          foreground: "hsl(0, 25%, 3%)",
        },
        muted: {
          DEFAULT: "hsl(0, 0%, 20%)",
          foreground: "hsl(0, 25%, 70%)",
        },
        accent: {
          DEFAULT: "hsl(187, 79%, 29%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        border: "hsl(0, 0%, 90%)",
        input: "hsl(0, 0%, 20%)",
        ring: "hsl(187, 79%, 40%)",
        lightBlue: {
          DEFAULT: "#e0f7fa",
        },
      },
      borderRadius: {
        lg: 12,
        md: 8,
        sm: 4,
      },
      fontFamily: {
        rubik: ["Rubik-Regular", "sans-serif"],
      },
      backgroundImage: {
        pattern:
          "url('data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='8' height='8' fill='none' stroke='rgb(0 0 0 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e')",
      },
      keyframes: {
        astronaut: {
          from: { transform: "translateY(-50px) rotate(0deg)" },
          to: { transform: "translateY(10px) rotate(2deg)" },
        },
      },
      animation: {
        astronaut: "astronaut infinite 3.4s alternate ease-in-out",
      },
      screens: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        "2xl": 1400,
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
