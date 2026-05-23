import { create } from "zustand";

export type Theme = "light" | "dark";

const STORAGE_KEY = "ict_admin_theme";

function getInitialTheme(): Theme {
  return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getInitialTheme();
  // Keep the DOM in sync at store creation (covers HMR / late mounts; the
  // inline script in index.html handles the very first paint).
  applyTheme(initial);

  const commit = (theme: Theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  };

  return {
    theme: initial,
    setTheme: commit,
    toggleTheme: () => commit(get().theme === "dark" ? "light" : "dark"),
  };
});
