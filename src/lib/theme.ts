import { useState, useEffect, useCallback } from "react";
import { storage } from "./storage";

export type ThemeMode = "dark" | "light";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  const applyThemeToDOM = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    storage.get("theme").then((saved) => {
      const resolved: ThemeMode = saved === "light" ? "light" : "dark";
      setThemeState(resolved);
      applyThemeToDOM(resolved);
    });
  }, [applyThemeToDOM]);

  const toggleTheme = useCallback(async () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    applyThemeToDOM(next);
    await storage.set("theme", next);
  }, [theme, applyThemeToDOM]);

  return { theme, toggleTheme };
}
