import { useEffect } from "react";

export function BrandThemeToggle(_: { compact?: boolean } = {}) {
  return null;
}

export function ThemeToggle(_: { compact?: boolean }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    try { window.localStorage.setItem("bt-theme", "dark"); } catch {}
  }, []);
  return null;
}
