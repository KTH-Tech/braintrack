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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
