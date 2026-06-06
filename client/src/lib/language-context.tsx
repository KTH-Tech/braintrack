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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("braintrack-language");
    if (stored === "en" || stored === "af") {
      setLanguageState(stored);
    } else {
      setLanguageState("en");
    }
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
