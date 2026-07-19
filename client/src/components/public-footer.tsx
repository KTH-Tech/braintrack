import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";

const SUPPORT_EMAIL = "learn@kth-tech.com";

const COPY = {
  en: {
    tagline: "Grade 12 Matric prep for South Africa.",
    copyright: "© 2026 BrainTrack™ · KTH Projects (Pty) Ltd",
    popia: "POPIA-compliant · Built in SA 🇿🇦",
    legal: [
      { href: "/privacy-policy",    label: "Privacy",  color: "#9FD8FF" },
      { href: "/terms-of-service",  label: "Terms",    color: "#94F7C5" },
      { href: "/refund-policy",     label: "Refunds",  color: "#FFE29A" },
    ],
    nav: [
      { href: "/research",  label: "Research",  color: "#6EE7F9" },
      { href: "/features",  label: "Features",  color: "#C5B3FF" },
      { href: "/subscribe", label: "Pricing",   color: "#FFB7E5" },
    ],
  },
  af: {
    tagline: "Graad 12-matriekvoorbereiding vir Suid-Afrika.",
    copyright: "© 2026 BrainTrack™ · KTH Projects (Pty) Ltd",
    popia: "POPIA-nakoming · Trots SA 🇿🇦",
    legal: [
      { href: "/privacy-policy",    label: "Privaatheid",  color: "#9FD8FF" },
      { href: "/terms-of-service",  label: "Bepalings",    color: "#94F7C5" },
      { href: "/refund-policy",     label: "Terugbetalings", color: "#FFE29A" },
    ],
    nav: [
      { href: "/research",  label: "Navorsing", color: "#6EE7F9" },
      { href: "/features",  label: "Kenmerke",  color: "#C5B3FF" },
      { href: "/subscribe", label: "Pryse",     color: "#FFB7E5" },
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
                className="text-[12px] font-medium text-white transition-colors hover:text-[#6EE7F9]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Support section — no raw email shown; Contact Us mailto instead */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
              {isAf ? "Ondersteuning" : "Support"}
            </span>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                data-testid="footer-email-support"
                className="text-[12px] font-bold transition-colors hover:text-white"
                style={{ color: "#6EE7F9" }}
              >
                {isAf ? "Kontak Ons" : "Contact Us"}
              </a>
              <a
                href="https://www.linkedin.com/company/kth-tech"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-linkedin"
                className="text-[12px] font-bold transition-colors hover:text-white"
                style={{ color: "#9FD8FF" }}
              >
                LinkedIn
              </a>
              <Link
                href="/partner-schools"
                data-testid="footer-partners"
                className="text-[12px] font-bold transition-colors hover:text-white"
                style={{ color: "#94F7C5" }}
              >
                {isAf ? "Vennote" : "Partners"}
              </Link>
            </div>
          </div>
        </div>

        {/* Micro line + Powered by KTH Tech */}
        <div className="mt-5 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[11px] text-white">{t.copyright}</span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white">{t.popia}</span>
            <a
              href="https://kth-tech.com"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-kth-logo"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white hover:text-white transition-opacity opacity-90 hover:opacity-100"
              aria-label="Powered by KTH Tech"
            >
              <img src="/kth-tech-logo.svg" alt="" className="w-4 h-4" />
              <span>{isAf ? "Aangedryf deur KTH Tech" : "Powered by KTH Tech"}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
