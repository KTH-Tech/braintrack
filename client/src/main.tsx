import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force cosmic-night-neon dark mode globally — no light theme.
(() => {
  const root = document.documentElement;
  root.classList.remove("light");
  root.classList.add("dark");
  try { window.localStorage.setItem("bt-theme", "dark"); } catch {}
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
