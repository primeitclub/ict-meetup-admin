import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../store/theme.store";
import Tooltip from "../../shared/design-components/tooltip/Tooltip";

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <Tooltip content={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="inline-flex items-center justify-center p-2 rounded-md border border-border bg-surface text-foreground hover:bg-surface-2 transition-colors"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </Tooltip>
  );
}
