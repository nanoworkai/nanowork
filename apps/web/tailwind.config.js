/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Monochromatic base - pure blacks and grays only
        surface: {
          0: "#000000",     // Pure black background
          1: "#0a0a0a",     // Slightly lifted surface
          2: "#111111",     // Card background
          3: "#1a1a1a",     // Elevated card
          4: "#242424",     // Hover state
        },
        // Minimal accent - used only for active states and CTAs
        accent: {
          DEFAULT: "#ffffff", // Primary actions are white on black
          muted: "#666666",   // Secondary elements
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      animation: {
        // Minimal, purposeful motion only
        "fade-in": "fadeIn 0.3s cubic-bezier(0.2, 0, 0.2, 1)",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Depth through precise shadows - creates tactile card feeling
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'card-lg': '0 4px 16px 0 rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'card-xl': '0 8px 32px 0 rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        // Inner shadow for depth
        'inner': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
      },
    },
  },
  plugins: [],
};

