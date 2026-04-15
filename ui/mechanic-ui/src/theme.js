export const setTheme = (theme) => {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

export const initTheme = () => {
  const saved = localStorage.getItem("theme") || "light";
  setTheme(saved);
};