import { useState, useEffect } from "react"

export type ThemeMode =
  | "blanc"
  | "coastal"
  | "terracotta"
  | "dopamine"
  | "vaporwave"
  | "obsidian"
  | "dusk"
  | "golden-hour"
  | "holographic"
  | "velvet"
  | "midnight"
  | "coquette"
  | "thunder"
  | "lemonade"
  | "bubblegum"
  | "glitter"
  | "ocean"
  | "solar"

const VALID_THEMES: ThemeMode[] = [
  "blanc", "coastal", "terracotta", "dopamine",
  "vaporwave", "obsidian", "dusk", "golden-hour", "holographic",
  "velvet", "midnight", "coquette", "thunder", "lemonade",
  "bubblegum", "glitter", "ocean", "solar",
]

const ALL_THEME_CLASSES = [
  "theme-coastal", "theme-terracotta", "theme-dopamine",
  "theme-vaporwave", "theme-obsidian", "theme-dusk", "theme-golden-hour", "theme-holographic",
  "theme-velvet", "theme-midnight", "theme-coquette", "theme-thunder", "theme-lemonade",
  "theme-bubblegum", "theme-glitter", "theme-ocean", "theme-solar",
]

// Default is "blanc" — the sentinel that applies NO palette overlay so our
// two brand themes (dark + light) via bt-theme own the surface. Users who
// unlocked a paid palette in the rewards store still get their unlock applied
// on top. Any other legacy value migrates to blanc so we don't fight the toggle.
function migrateStoredTheme(stored: string | null): ThemeMode {
  if (!stored) return "blanc"
  if ((VALID_THEMES as string[]).includes(stored)) return stored as ThemeMode
  return "blanc"
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    migrateStoredTheme(
      typeof window !== "undefined" ? localStorage.getItem("braintrack-theme") : null
    )
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(...ALL_THEME_CLASSES)
    if (theme !== "blanc") {
      root.classList.add(`theme-${theme}`)
    }
    localStorage.setItem("braintrack-theme", theme)
  }, [theme])

  const setTheme = (t: ThemeMode) => setThemeState(t)
  return { theme, setTheme }
}
