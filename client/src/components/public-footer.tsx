import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";

const SUPPORT_EMAIL = "learn@kth-tech.com";

const COPY = {
  en: {
    // Kinetic marquee tape — the head-to-head brand banner that runs the width.
    marquee: ["BrainTrack", "Grade 12 Matric", "CAPS-aligned", "Real NSC Papers", "24/7 AI Tutor", "🇿🇦"],
    copyright: "© 2026 BrainTrack™ · KTH Tech · POPIA 🇿🇦",
    legal: [
      { href: "/privacy-policy",   label: "Privacy" },
      { href: "/terms-of-service", label: "Terms" },
      { href: "/refund-policy",    label: "Refunds" },
    ],
    contact: "Contact",
  },
  af: {
    marquee: ["BrainTrack", "Graad 12 Matriek", "KABV-belyn", "Regte NSS-Vraestelle", "24/7 KI-Tutor", "🇿🇦"],
    copyright: "© 2026 BrainTrack™ · KTH Tech · POPIA 🇿🇦",
    legal: [
      { href: "/privacy-policy",   label: "Privaatheid" },
      { href: "/terms-of-service", label: "Bepalings" },
      { href: "/refund-policy",    label: "Terugbetalings" },
    ],
    contact: "Kontak",
  },
} as const;

const WORDMARK = "linear-gradient(95deg,#9FD8FF,#94F7C5,#FFE29A,#FFB7E5,#C5B3FF)";

export function PublicFooter() {
  const { language } = useLanguage();
  const t = COPY[language];

  // Duplicated so the marquee loops seamlessly under bt-marquee (-50%).
  const tape = [...t.marquee, ...t.marquee, ...t.marquee, ...t.marquee];

  return (
    <footer data-testid="footer-public" aria-label="Site footer" style={{ background: "#050508" }}>
      {/* ── Row 1: Kinetic marquee ribbon (kept — founder likes it) ───────
          Full-width gradient banner, slight tilt. bt-marquee is a
          kill-switch-exempt keyframe (index.css); prefers-reduced-motion
          is honoured by the global media rule that pauses [style*="bt-marquee"]. */}
      <div
        aria-hidden
        style={{
          overflow: "hidden",
          background: WORDMARK,
          borderTop: "2px solid #050508",
          borderBottom: "2px solid #050508",
          padding: "9px 0",
          transform: "rotate(-0.6deg)",
          margin: "10px 0",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            whiteSpace: "nowrap",
            willChange: "transform",
            animation: "bt-marquee 26s linear infinite",
          }}
        >
          {tape.map((word, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Bebas Neue', system-ui, sans-serif",
                fontSize: 16,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#050508",
                padding: "0 16px",
              }}
            >
              {word}<span style={{ paddingLeft: 16 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Row 2: minimal sign-off — wordmark + copyright · legal links ──── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-x-6 gap-y-3">
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            <span
              style={{
                fontFamily: "'Bebas Neue', system-ui, sans-serif",
                fontSize: 19,
                letterSpacing: 1,
                textTransform: "uppercase",
                backgroundImage: WORDMARK,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              BrainTrack
            </span>
            <span className="text-[11.5px] font-medium text-white" data-testid="footer-copyright">
              {t.copyright}
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {t.legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-testid={`footer-link-${l.href.replace(/^\//, "")}`}
                className="text-[12.5px] font-semibold text-white transition-colors hover:text-[#9FF5E8]"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              data-testid="footer-email-support"
              className="text-[12.5px] font-semibold text-white transition-colors hover:text-[#9FF5E8]"
            >
              {t.contact}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
