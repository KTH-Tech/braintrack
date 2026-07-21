import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "af";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

function syncLanguageToProfile(language: Language): void {
  fetch("/api/user/language", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ language }),
  }).catch(() => {});
}

/**
 * Read the persisted language synchronously.
 *
 * This MUST be a lazy useState initialiser rather than an effect. Previously
 * the provider started at "en" and only read localStorage in useEffect, so the
 * entire first render — including every React Query fetch that fires on mount
 * and bakes `lang=` into its URL and queryKey — ran as English for an
 * Afrikaans learner. That is a direct cause of content "jumping back to
 * English" on load and after navigation.
 */
function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem("braintrack-language");
    return stored === "af" ? "af" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("braintrack-language", language);
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (mounted) {
      syncLanguageToProfile(newLanguage);
    }
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const next = prev === "en" ? "af" : "en";
      if (mounted) syncLanguageToProfile(next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider"
    );
  }
  return context;
}
