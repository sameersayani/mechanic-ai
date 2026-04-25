import { useState, useEffect } from "react";
import { setTheme } from "../theme";

export default function ThemeToggle() {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setThemeState(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 border rounded-lg text-sm"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}