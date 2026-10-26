import { useLayoutEffect } from "react";

import { ThemeIcon } from "@/components/ui-icons";

const storageKey = "ybrary-theme";

export function ThemeToggle() {
  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(storageKey, next);
  }

  return (
    <button className="theme-button" type="button" aria-label="색상 테마 전환" onClick={toggleTheme}>
      <ThemeIcon />
    </button>
  );
}
