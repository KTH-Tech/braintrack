import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Cookie, X, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";

const STORAGE_KEY = "btk_cookie_consent";
const PREF_KEY = "cookieConsent";

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
}

export function getCookiePreferences(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    if (stored === "accepted") return { essential: true, analytics: true, marketing: true };
    if (stored === "declined") return { essential: true, analytics: false, marketing: false };
    const parsed = JSON.parse(stored);
    if (typeof parsed === "object" && parsed !== null && "essential" in parsed) {
      return { essential: true, analytics: !!parsed.analytics, marketing: !!parsed.marketing };
    }
    return null;
  } catch {
    return null;
  }
}

function savePreferences(prefs: CookiePreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

async function fetchCookieConsentPref(): Promise<CookiePreferences | null> {
  try {
    const res = await fetch("/api/user/preferences", { credentials: "include" });
    if (!res.ok) return null;
    const serverPrefs = await res.json();
    if (serverPrefs && typeof serverPrefs === "object" && serverPrefs[PREF_KEY]) {
      const v = serverPrefs[PREF_KEY];
      if (v === "accepted") return { essential: true, analytics: true, marketing: true };
      if (v === "declined") return { essential: true, analytics: false, marketing: false };
      if (typeof v === "object" && "essential" in v) {
        return { essential: true, analytics: !!v.analytics, marketing: !!v.marketing };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function saveCookieConsentPref(prefs: CookiePreferences): Promise<void> {
  try {
    await fetch("/api/user/preferences", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [PREF_KEY]: prefs }),
    });
  } catch {
    // Silently ignore — localStorage is the fallback
  }
}

export function CookieConsentBanner() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const { user, isLoading: authLoading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [serverChecked, setServerChecked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const localPrefs = getCookiePreferences();

    if (user) {
      // Logged-in user: always reconcile with the server
      fetchCookieConsentPref().then((serverPrefs) => {
        if (serverPrefs) {
          // Server is authoritative — sync to localStorage, suppress banner
          savePreferences(serverPrefs);
        } else if (localPrefs) {
          // Guest made a choice before logging in — backfill the server
          saveCookieConsentPref(localPrefs);
        } else {
          // No preference anywhere — show the banner
          setVisible(true);
        }
        setServerChecked(true);
      });
    } else {
      // Unauthenticated: localStorage fast-path only
      if (!localPrefs) {
        setVisible(true);
      }
      setServerChecked(true);
    }
  }, [authLoading, user]);

  function handleAcceptAll() {
    const prefs: CookiePreferences = { essential: true, analytics: true, marketing: true };
    savePreferences(prefs);
    setVisible(false);
    if (user) saveCookieConsentPref(prefs);
  }

  function handleDecline() {
    const prefs: CookiePreferences = { essential: true, analytics: false, marketing: false };
    savePreferences(prefs);
    setVisible(false);
    if (user) saveCookieConsentPref(prefs);
  }

  function handleSavePreferences() {
    const prefs: CookiePreferences = { essential: true, analytics, marketing };
    savePreferences(prefs);
    setVisible(false);
    if (user) saveCookieConsentPref(prefs);
  }

  if (!serverChecked || !visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
      role="dialog"
      aria-label={isAf ? "Koekietoestemmingskennisgewing" : "Cookie consent notice"}
      data-testid="cookie-consent-banner"
    >
      <div
        className="max-w-3xl mx-auto rounded-xl text-white"
        style={{
          background: "#0a0b12",
          border: "2px solid #7FEFFF",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#000", border: "1px solid #7FEFFF" }}
            >
              <Cookie className="w-4 h-4" style={{ color: "#7FEFFF" }} />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold leading-snug text-white">
                {isAf ? "Ons gebruik koekies" : "We use cookies"}
              </p>
              <p className="text-xs text-white leading-relaxed">
                {isAf
                  ? "BrainTrack gebruik noodsaaklike koekies en opsionele koekies vir analise. Lees ons "
                  : "BrainTrack uses essential cookies and optional cookies for analytics. Read our "}
                <Link
                  href="/cookie-policy"
                  className="underline underline-offset-2 font-bold"
                  style={{ color: "#7FEFFF" }}
                  data-testid="link-cookie-policy-banner"
                >
                  {isAf ? "Koekiebeleid" : "Cookie Policy"}
                </Link>
                {isAf ? " vir meer inligting." : " for more details."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs font-bold text-white flex items-center gap-1 underline underline-offset-2"
              data-testid="button-cookie-manage"
              aria-expanded={expanded}
            >
              {isAf ? "Voorkeure" : "Manage preferences"}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-bold rounded-xl text-white"
              style={{ background: "#000", border: "1px solid #fff" }}
              data-testid="button-cookie-decline"
            >
              {isAf ? "Weier" : "Decline"}
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-bold rounded-xl"
              style={{ background: "#93FFB8", color: "#000" }}
              data-testid="button-cookie-accept"
            >
              {isAf ? "Aanvaar alles" : "Accept all"}
            </button>
            <button
              onClick={handleDecline}
              className="ml-1 text-white"
              aria-label={isAf ? "Sluit" : "Close"}
              data-testid="button-cookie-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div
            className="px-4 py-4 space-y-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
            data-testid="cookie-preferences-panel"
          >
            <p className="text-xs text-white">
              {isAf
                ? "Kies watter kategorieë koekies jy wil toelaat. Noodsaaklike koekies is altyd aan."
                : "Choose which cookie categories you want to allow. Essential cookies are always on."}
            </p>

            <div>
              <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white">
                      {isAf ? "Noodsaaklike koekies" : "Essential cookies"}
                    </p>
                    <Lock className="w-3 h-3" style={{ color: "#93FFB8" }} />
                  </div>
                  <p className="text-xs text-white">
                    {isAf
                      ? "Vereis vir aanmelding en kernplatformfunksies. Kan nie gedeaktiveer word nie."
                      : "Required for login and core platform functions. Cannot be disabled."}
                  </p>
                </div>
                <Switch
                  checked={true}
                  disabled
                  aria-label={isAf ? "Noodsaaklike koekies (altyd aan)" : "Essential cookies (always on)"}
                  data-testid="toggle-cookie-essential"
                />
              </div>

              <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <div className="space-y-0.5 flex-1">
                  <p className="text-xs font-bold text-white">
                    {isAf ? "Analitiese koekies" : "Analytics cookies"}
                  </p>
                  <p className="text-xs text-white">
                    {isAf
                      ? "Help ons om te verstaan hoe die platform gebruik word sodat ons dit kan verbeter (bv. verwysingskanaaldata)."
                      : "Help us understand how the platform is used so we can improve it (e.g. referral channel data)."}
                  </p>
                </div>
                <Switch
                  checked={analytics}
                  onCheckedChange={setAnalytics}
                  aria-label={isAf ? "Analitiese koekies" : "Analytics cookies"}
                  data-testid="toggle-cookie-analytics"
                />
              </div>

              <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <div className="space-y-0.5 flex-1">
                  <p className="text-xs font-bold text-white">
                    {isAf ? "Bemarkingskoekies" : "Marketing cookies"}
                  </p>
                  <p className="text-xs text-white">
                    {isAf
                      ? "Gebruik vir gepersonaliseerde kommunikasie en promosieaanbiedinge. Tans nie in gebruik nie."
                      : "Used for personalised communications and promotional offers. Not currently in use."}
                  </p>
                </div>
                <Switch
                  checked={marketing}
                  onCheckedChange={setMarketing}
                  aria-label={isAf ? "Bemarkingskoekies" : "Marketing cookies"}
                  data-testid="toggle-cookie-marketing"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm font-bold rounded-xl"
                style={{ background: "#93FFB8", color: "#000" }}
                data-testid="button-cookie-save-preferences"
              >
                {isAf ? "Stoor voorkeure" : "Save preferences"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
