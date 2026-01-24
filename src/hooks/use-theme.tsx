"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    const initialTheme = (localStorage.getItem("theme") as Theme) || "dark";
    setTheme(initialTheme);
    root.classList.remove("light", "dark");
    root.classList.add(initialTheme);
  }, []);

  const setThemeValue = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setThemeValue(newTheme);
  };

  return { theme, setTheme: setThemeValue, toggleTheme };
}
