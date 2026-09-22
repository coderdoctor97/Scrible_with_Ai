/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        app: "var(--bg)",
        panel: {
          DEFAULT: "var(--panel)",
          soft: "var(--panel-soft)",
        },
        "input-bg": "var(--input-bg)",
        main: "var(--text)",
        muted: "var(--text-muted)",
        faint: "var(--text-faint)",
        "accent-ink": "var(--accent-ink)",
        ink: "#0F1419",
        paper: "#FFFBF5",
        "paper-soft": "#FFF4E6",
        border: {
          DEFAULT: "var(--border)",
          ink: "var(--border-ink)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          subtle: "var(--primary-subtle)",
          ring: "var(--primary)",
        },
        teal: {
          DEFAULT: "var(--teal)",
          ink: "var(--teal-ink)",
          subtle: "var(--teal-subtle)",
        },
        danger: {
          DEFAULT: "var(--danger)",
        },
        success: {
          DEFAULT: "var(--success)",
        },
      },
      boxShadow: {
        subtle: "var(--shadow)",
        elevated: "var(--shadow-lg)",
        specular: "0 0 0 1px rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.25), 0 12px 28px rgba(0, 0, 0, 0.35)",
        bento: "0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 24px -4px rgba(0, 0, 0, 0.06)",
        "bento-dark": "0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.4)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        pulse: "pulse 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
    },
  },
  plugins: [],
}
