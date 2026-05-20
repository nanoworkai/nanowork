import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

// Simplified theme context - always light mode
interface ThemeContextValue {
  theme: "light";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Set meta theme color for light mode
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", "#fafaf9");
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
