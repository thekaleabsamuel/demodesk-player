import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        window: {
          bg: "hsl(var(--window-bg))",
          chrome: "hsl(var(--window-chrome))",
          border: "hsl(var(--window-border))",
        },
        traffic: {
          red: "hsl(var(--traffic-red))",
          yellow: "hsl(var(--traffic-yellow))",
          green: "hsl(var(--traffic-green))",
        },
        itunes: {
          gradient: {
            start: "hsl(var(--itunes-gradient-start))",
            end: "hsl(var(--itunes-gradient-end))",
          },
          sidebar: "hsl(var(--itunes-sidebar))",
          accent: "hsl(var(--itunes-accent))",
          text: "hsl(var(--itunes-text))",
          muted: "hsl(var(--itunes-text-muted))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        window: "10px",
      },
      fontFamily: {
        system: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Segoe UI", "Roboto", "sans-serif"],
      },
      backgroundImage: {
        "itunes-gradient": "linear-gradient(to bottom, hsl(var(--itunes-gradient-start)), hsl(var(--itunes-gradient-end)))",
        "menubar": "linear-gradient(to bottom, hsl(0 0% 100% / 0.9), hsl(0 0% 95% / 0.85))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
