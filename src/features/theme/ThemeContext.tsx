"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemePreference = "light" | "dark" | "system";
type Theme = "light" | "dark";

interface ThemeContextValue {
  /** The resolved, rendered theme — always "light" or "dark", even when `preference` is "system". */
  theme: Theme;
  /** What the user actually picked — includes "system" per the Branding/Preferences "Theme Preference" control. */
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "calixo-theme";

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return systemPrefersDark() ? "dark" : "light";
  });
  const [theme, setThemeState] = useState<Theme>(() => (preference === "system" ? (systemPrefersDark() ? "dark" : "light") : preference));
  const [mounted] = useState(() => {
    if (typeof window === "undefined") return false;
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Reacts live to OS theme changes only while "system" is selected.
  useEffect(() => {
    if (preference !== "system" || typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setThemeState(e.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setTheme = useCallback((newPreference: ThemePreference) => {
    setPreferenceState(newPreference);
    localStorage.setItem(STORAGE_KEY, newPreference);
    const resolved = newPreference === "system" ? (systemPrefersDark() ? "dark" : "light") : newPreference;
    setThemeState(resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}