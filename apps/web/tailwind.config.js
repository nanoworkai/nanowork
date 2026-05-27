/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Bright, layered surface system - clean and inviting
        surface: {
          0: "#FAFBFC",     // Main background - soft white with warmth
          1: "#FFFFFF",     // Slightly lifted surface - pure white
          2: "#FFFFFF",     // Card background - pure white
          3: "#F5F7FA",     // Hover state - subtle gray
          4: "#EEF2F6",     // Active/pressed state
        },
        // Professional fintech blue - trust and confidence
        accent: {
          DEFAULT: "#0066FF", // Primary fintech blue
          hover: "#0052CC",   // Darker on hover
          light: "#E6F0FF",   // Light background tint
          muted: "#6B7280",   // Secondary text
        },
        // Additional fintech colors
        fintech: {
          blue: "#0066FF",
          green: "#00C853",   // Success, positive values
          red: "#FF3B30",     // Errors, negative values
          amber: "#FFB020",   // Warnings, alerts
          navy: "#1E293B",    // Text and strong elements
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
        // Modern elevation shadows - subtle depth on light backgrounds
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        // Subtle inner shadow for inputs
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};

