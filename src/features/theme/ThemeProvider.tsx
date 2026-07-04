"use client";
import { useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "calixo-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [mounted] = useState(() => {
    if (typeof window === "undefined") return false;
    document.documentElement.classList.toggle("dark", theme === "dark");
    return true;
  });

  const _toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) return <>{children}</>;

  return (
    <div data-theme={theme}>
      {children}
    </div>
  );
}

export function useTheme() {
  return { theme: typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light", toggleTheme: () => {} };
}
