import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply persisted theme before React mounts to avoid a light→dark flash on
// dark-preferring users. Defaults to dark (BrainTrack's brand hero). Toggle
// lives in the header (ThemeToggle) and persists to localStorage.
(() => {
  const root = document.documentElement;
  let stored: string | null = null;
  try { stored = window.localStorage.getItem("bt-theme"); } catch {}
  const theme = stored === "light" ? "light" : "dark";
  root.classList.remove("light", "dark");
  root.classList.add(theme);
})();

// Service worker ONLY in production. In dev it aggressively caches and serves
// stale bundles (edits appear not to land even after hard-refresh), so we skip
// registration locally and proactively tear down any SW/caches a previous dev
// session left behind.
if (import.meta.env.PROD) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
} else if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});
  if (window.caches) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(<App />);
