"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  applyTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);

  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    setResolvedTheme(resolveTheme(nextTheme));
  }, []);

  const toggleTheme = useCallback(() => {
    const nextResolved = resolveTheme(theme) === "dark" ? "light" : "dark";
    setTheme(nextResolved);
  }, [setTheme, theme]);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
    setResolvedTheme(resolveTheme(stored));

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
        setResolvedTheme(resolveTheme("system"));
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
