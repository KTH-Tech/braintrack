import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Timer, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const SESSION_KEY = "trial_ending_banner_dismissed";

const translations = {
  en: {
    hoursLeft: (h: number) => h === 1 ? "1 hour left in your free trial" : `${h} hours left in your free trial`,
    hoursMinutesLeft: (h: number, m: number) => {
      const hPart = h === 1 ? "1 hour" : `${h} hours`;
      const mPart = m === 1 ? "1 minute" : `${m} minutes`;
      return `${hPart} ${mPart} left in your free trial`;
    },
    minutesLeft: (m: number) => m === 1 ? "1 minute left in your free trial" : `${m} minutes left in your free trial`,
    lessThanMinute: "Less than a minute left in your free trial",
    upgrade: "Upgrade now",
    dismiss: "Dismiss",
  },
  af: {
    hoursLeft: (h: number) => h === 1 ? "1 uur oor in jou gratis proeftydperk" : `${h} uur oor in jou gratis proeftydperk`,
    hoursMinutesLeft: (h: number, m: number) => {
      const hPart = h === 1 ? "1 uur" : `${h} uur`;
      const mPart = m === 1 ? "1 minuut" : `${m} minute`;
      return `${hPart} ${mPart} oor in jou gratis proeftydperk`;
    },
    minutesLeft: (m: number) => m === 1 ? "1 minuut oor in jou gratis proeftydperk" : `${m} minute oor in jou gratis proeftydperk`,
    lessThanMinute: "Minder as 'n minuut oor in jou gratis proeftydperk",
    upgrade: "Opgradeer nou",
    dismiss: "Versteek",
  },
};

interface TrialEndingBannerProps {
  trialEndsAt: string | null;
}

export function TrialEndingBanner({ trialEndsAt }: TrialEndingBannerProps) {
  const { language } = useLanguage();
  const t = translations[language as "en" | "af"] ?? translations.en;

  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (dismissed || !trialEndsAt) return;
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, [dismissed, trialEndsAt]);

  if (dismissed || !trialEndsAt) return null;

  const endsAt = new Date(trialEndsAt);
  const msLeft = endsAt.getTime() - now;
  const hoursLeft = msLeft / (1000 * 60 * 60);

  if (hoursLeft > 48) return null;

  const totalMinutes = Math.max(0, Math.floor(msLeft / (1000 * 60)));
  const hoursPart = Math.floor(totalMinutes / 60);
  const minutesPart = totalMinutes % 60;

  let label: string;
  if (hoursLeft < 2) {
    if (totalMinutes <= 0) {
      label = t.lessThanMinute;
    } else if (hoursPart === 0) {
      label = t.minutesLeft(minutesPart);
    } else {
      label = t.hoursMinutesLeft(hoursPart, minutesPart);
    }
  } else {
    label = t.hoursLeft(Math.floor(hoursLeft));
  }

  const hex = "#FFB7E5";

  function handleDismiss() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setDismissed(true);
  }

  return (
    <div
      data-testid="trial-ending-banner"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5"
      style={{
        background: `linear-gradient(135deg, ${hex}18 0%, transparent 60%), #000`,
        border: `1px solid ${hex}66`,
        boxShadow: `0 0 22px ${hex}28`,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Timer className="w-4 h-4 shrink-0" style={{ color: hex }} />
        <span className="text-sm font-semibold truncate" style={{ color: hex }}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/subscribe">
          <button
            className="rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all"
            style={{
              background: hex,
              color: "#000",
              boxShadow: `0 0 12px ${hex}66`,
            }}
          >
            {t.upgrade}
          </button>
        </Link>
        <button
          aria-label={t.dismiss}
          onClick={handleDismiss}
          className="rounded-full p-1 transition-opacity opacity-60 hover:opacity-100"
          style={{ color: hex }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
