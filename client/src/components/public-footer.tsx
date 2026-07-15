import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";

// Minimal footer — one row of essentials, nothing more.
// Anything else lives in the header nav or a dedicated page.

const SUPPORT_EMAIL = "learn@kth-tech.com";

const COPY = {
  en: {
    tagline: "Grade 12 Matric prep for South Africa.",
    copyright: "© 2026 BrainTrack™ · KTH Projects (Pty) Ltd",
    popia: "POPIA-compliant · Built in SA 🇿🇦",
    legal: [
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms-of-service", label: "Terms" },
      { href: "/refund-policy", label: "Refunds" },
    ],
  },
  af: {
    tagline: "Graad 12-matriekvoorbereiding vir Suid-Afrika.",
    copyright: "© 2026 BrainTrack™ · KTH Projects (Pty) Ltd",
    popia: "POPIA-nakoming · Trots SA 🇿🇦",
    legal: [
      { href: "/privacy-policy", label: "Privaatheid" },
      { href: "/terms-of-service", label: "Bepalings" },
      { href: "/refund-policy", label: "Terugbetalings" },
    ],
  },
} as const;

export function PublicFooter() {
  const { language } = useLanguage();
  const t = COPY[language];

  return (
    <footer
      className="relative border-t border-white/10 bg-black"
      data-testid="footer-public"
      aria-label="Site footer"
    >
      {/* thin rainbow rule — the only decoration */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: "linear-gradient(90deg,#006BFF,#00E5FF,#22FF66,#FFE600,#FF8A00,#FF2BD6,#8A2BFF)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[12px]">
        {/* Left: wordmark + one-line tagline */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/"
            data-testid="footer-logo"
            className="gradient-text font-bold tracking-tight leading-none text-base"
          >
            BrainTrack
          </Link>
          <span className="text-white/95">{t.tagline}</span>
        </div>

        {/* Right: legal links + support email */}
        <div className="flex items-center gap-4 flex-wrap text-white">
          {t.legal.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-testid={`footer-link-${l.href.replace(/^\//, "")}`}
              className="hover:text-[#00E5FF] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            data-testid="footer-email-support"
            className="hover:text-[#00E5FF] transition-colors"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>

      {/* Micro-line: copyright + POPIA. Two facts, one line. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[10.5px] text-white">
        <span>{t.copyright}</span>
        <span>{t.popia}</span>
      </div>
    </footer>
  );
}
