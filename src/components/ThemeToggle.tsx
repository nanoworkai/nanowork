import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4.22 1.78a1 1 0 0 1 1.42 1.42l-.7.7a1 1 0 0 1-1.42-1.42l.7-.7ZM18 9a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1Zm-1.78 5.78a1 1 0 0 1-1.42 1.42l-.7-.7a1 1 0 0 1 1.42-1.42l.7.7ZM11 17a1 1 0 1 1-2 0v-1a1 1 0 1 1 2 0v1Zm-5.78-.78a1 1 0 0 1-1.42-1.42l.7-.7a1 1 0 0 1 1.42 1.42l-.7.7ZM3 11a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2H3Zm1.78-6.22a1 1 0 0 1 1.42-1.42l.7.7A1 1 0 0 1 5.48 5.48l-.7-.7ZM10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z" />
        </svg>
      )}
    </button>
  );
}
