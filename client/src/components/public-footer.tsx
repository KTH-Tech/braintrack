import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";

const SUPPORT_EMAIL = "learn@kth-tech.com";

const COPY = {
  en: {
    tagline: "Grade 12 Matric prep for South Africa.",
    copyright: "© 2026 BrainTrack™ · KTH Projects (Pty) Ltd",
    popia: "POPIA-compliant · Built in SA 🇿🇦",
    legal: [
      { href: "/privacy-policy",    label: "Privacy",  color: "#6FA8FF" },
      { href: "/terms-of-service",  label: "Terms",    color: "#93FFB8" },
      { href: "/refund-policy",     label: "Refunds",  color: "#FFC48F" },
    ],
    nav: [
      { href: "/research",  label: "Research",  color: "#7FEFFF" },
      { href: "/features",  label: "Features",  color: "#C6A4FF" },
      { href: "/subscribe", label: "Pricing",   color: "#FF9FE5" },
    ],
  },
  af: {
    tagline: "Graad 12-matriekvoorbereiding vir Suid-Afrika.",
    copyright: "© 2026 BrainTrack™ · KTH Projects (Pty) Ltd",
    popia: "POPIA-nakoming · Trots SA 🇿🇦",
    legal: [
      { href: "/privacy-policy",    label: "Privaatheid",  color: "#6FA8FF" },
      { href: "/terms-of-service",  label: "Bepalings",    color: "#93FFB8" },
      { href: "/refund-policy",     label: "Terugbetalings", color: "#FFC48F" },
    ],
    nav: [
      { href: "/research",  label: "Navorsing", color: "#7FEFFF" },
      { href: "/features",  label: "Kenmerke",  color: "#C6A4FF" },
      { href: "/subscribe", label: "Pryse",     color: "#FF9FE5" },
    ],
  },
} as const;

export function PublicFooter() {
  const { language } = useLanguage();
  const t = COPY[language];
  const isAf = language === "af";

  return (
    <footer
      className="relative"
      data-testid="footer-public"
      aria-label="Site footer"
      style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.10)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* Legal links only (Research/Features/Pricing removed) */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {t.legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-testid={`footer-link-${l.href.replace(/^\//, "")}`}
                className="text-[12px] font-medium text-white transition-colors hover:text-[#7FEFFF]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Support section */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
              {isAf ? "Ondersteuning" : "Support"}
            </span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              data-testid="footer-email-support"
              className="text-[12px] font-bold transition-colors"
              style={{ color: "#7FEFFF" }}
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        {/* Micro line */}
        <div className="mt-5 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[11px] text-white">{t.copyright}</span>
          <span className="text-[11px] text-white">{t.popia}</span>
        </div>
      </div>
    </footer>
  );
}
