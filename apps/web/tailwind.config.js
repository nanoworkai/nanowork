/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light, warm, inviting backgrounds
        background: {
          DEFAULT: "#fafaf9",    // Warm off-white base
          elevated: "#ffffff",   // Pure white for cards
          subtle: "#f5f5f4",     // Soft hover states
          muted: "#e7e5e4",      // Subtle borders
        },
        // Readable text hierarchy
        content: {
          primary: "#1c1917",    // Near-black headlines
          secondary: "#57534e",  // Body text
          tertiary: "#78716c",   // Labels
          muted: "#a8a29e",      // Hints
          inverse: "#fafaf9",    // For dark sections
        },
        // Friendly, accessible accents
        accent: {
          primary: "#0ea5e9",    // Sky blue - trustworthy
          secondary: "#8b5cf6",  // Purple - premium
          success: "#10b981",    // Emerald - friendly
          warning: "#f59e0b",    // Amber - attention
          danger: "#ef4444",     // Red - errors
        },
        // Soft borders
        border: {
          DEFAULT: "#e7e5e4",    // Light neutral
          medium: "#d6d3d1",     // Medium contrast
          strong: "#a8a29e",     // Strong emphasis
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',      // 6px
        DEFAULT: '0.5rem',   // 8px
        md: '0.625rem',      // 10px
        lg: '0.75rem',       // 12px
        xl: '1rem',          // 16px
        '2xl': '1.5rem',     // 24px
        full: '9999px',
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.2, 0, 0.2, 1)",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scroll": "scroll 60s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Soft, gentle shadows for depth
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

