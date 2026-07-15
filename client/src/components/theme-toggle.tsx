import { useEffect, useState, useCallback } from "react";
import { Sun, Moon } from "lucide-react";

type Mode = "light" | "dark";

function readTheme(): Mode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(next: Mode) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(next);
  try { window.localStorage.setItem("bt-theme", next); } catch { /* private mode */ }
  // Broadcast so any component that renders theme-derived assets (e.g. the
  // logo which swaps light/dark PNGs) can re-render without extra state wiring.
  window.dispatchEvent(new CustomEvent("bt-theme-change", { detail: next }));
}

export function ThemeToggle({ compact = false }: { compact?: boolean } = {}) {
  const [mode, setMode] = useState<Mode>(readTheme);

  // Cross-tab / cross-component sync
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Mode | undefined;
      if (detail && detail !== mode) setMode(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bt-theme" && (e.newValue === "light" || e.newValue === "dark") && e.newValue !== mode) {
        applyTheme(e.newValue);
        setMode(e.newValue);
      }
    };
    window.addEventListener("bt-theme-change", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bt-theme-change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [mode]);

  const toggle = useCallback(() => {
    const next: Mode = mode === "light" ? "dark" : "light";
    applyTheme(next);
    setMode(next);
  }, [mode]);

  const size = compact ? "h-8 w-8" : "h-9 w-9";
  const label = mode === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-testid="button-theme-toggle"
      className={`inline-flex items-center justify-center rounded-lg ${size} text-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors`}
    >
      {mode === "light"
        ? <Moon className="h-4 w-4" aria-hidden="true" />
        : <Sun className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

// Alias kept for any callers still importing the older name.
export const BrandThemeToggle = ThemeToggle;
