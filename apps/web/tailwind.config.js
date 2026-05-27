/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // High-end fintech surface system
        surface: {
          0: "#FAFAFA",     // Main background - near white
          1: "#FFFFFF",     // Cards and elevated surfaces
          2: "#FFFFFF",     // Pure white
          3: "#F5F5F5",     // Hover state
          4: "#E5E5E5",     // Active state
          5: "#E0E0E0",     // Strong borders
        },
        // Enterprise fintech blue - trust and authority
        accent: {
          DEFAULT: "#0055FF", // Strong primary blue
          hover: "#0043CC",   // Darker on hover
          light: "#F0F5FF",   // Subtle background tint
          muted: "#71717A",   // Secondary text (zinc)
          dark: "#002B80",    // Dark variant
        },
        // Professional fintech colors
        fintech: {
          blue: "#0055FF",
          green: "#059669",   // Success - more muted
          red: "#DC2626",     // Errors - more serious
          amber: "#D97706",   // Warnings
          navy: "#18181B",    // Text - darker (zinc-900)
          slate: "#52525B",   // Secondary text (zinc-600)
          border: "#D4D4D8",  // Border color (zinc-300)
          divider: "#E4E4E7", // Light dividers (zinc-200)
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
        // Sophisticated elevation shadows - crisp and minimal
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-xl': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        // Subtle inner shadow for inputs
        'inner': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

