import { Link } from "wouter";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { useLanguage } from "@/lib/language-context";

const SUPPORT_EMAIL = "learn@kth-tech.com";

const COPY = {
  en: {
    tagline: "Grade 12 Matric prep for South Africa.",
    copyright: "© 2026 BrainTrack™ · KTH Projects (Pty) Ltd",
    popia: "POPIA-compliant · Built in SA 🇿🇦",
    legal: [
      { href: "/privacy-policy",    label: "Privacy",  color: "#006BFF" },
      { href: "/terms-of-service",  label: "Terms",    color: "#22FF66" },
      { href: "/refund-policy",     label: "Refunds",  color: "#FF8A00" },
    ],
    nav: [
      { href: "/research",  label: "Research",  color: "#00E5FF" },
      { href: "/features",  label: "Features",  color: "#8A2BFF" },
      { href: "/subscribe", label: "Pricing",   color: "#FF2BD6" },
    ],
  },
  af: {
    tagline: "Graad 12-matriekvoorbereiding vir Suid-Afrika.",
    copyright: "© 2026 BrainTrack™ · KTH Projects (Pty) Ltd",
    popia: "POPIA-nakoming · Trots SA 🇿🇦",
    legal: [
      { href: "/privacy-policy",    label: "Privaatheid",  color: "#006BFF" },
      { href: "/terms-of-service",  label: "Bepalings",    color: "#22FF66" },
      { href: "/refund-policy",     label: "Terugbetalings", color: "#FF8A00" },
    ],
    nav: [
      { href: "/research",  label: "Navorsing", color: "#00E5FF" },
      { href: "/features",  label: "Kenmerke",  color: "#8A2BFF" },
      { href: "/subscribe", label: "Pryse",     color: "#FF2BD6" },
    ],
  },
} as const;

function FooterDrips() {
  // Paint running DOWN from the footer's top edge: each drip starts full-width
  // at the rule, tapers as it falls, and ends in a rounded bead. No floating
  // lollipop heads.
  const drips = [
    { color: "#8A2BFF", x: 40,  w: 12, h: 34 },
    { color: "#006BFF", x: 190, w: 14, h: 44 },
    { color: "#00E5FF", x: 330, w: 9,  h: 22 },
    { color: "#22FF66", x: 450, w: 16, h: 52 },
    { color: "#FFE600", x: 580, w: 10, h: 28 },
    { color: "#FF8A00", x: 690, w: 13, h: 46 },
    { color: "#FF2BD6", x: 810, w: 9,  h: 24 },
    { color: "#8A2BFF", x: 920, w: 11, h: 38 },
  ];
  return (
    <div
      aria-hidden
      style={{ position: "absolute", top: 0, left: 0, right: 0, height: 56, pointerEvents: "none", overflow: "visible" }}
    >
      <svg viewBox="0 0 1000 56" preserveAspectRatio="none" style={{ width: "100%", height: 56, overflow: "visible", display: "block" }}>
        {drips.map((d, i) => {
          const midX = d.x + d.w / 2;
          const tipW = d.w * 0.42;
          const tipY = d.h - tipW / 2;
          return (
            <g key={i}>
              {/* tapering body: full width at the top rule, narrowing downward */}
              <path
                d={`M${d.x} 0 L${d.x + d.w} 0 L${midX + tipW / 2} ${tipY} L${midX - tipW / 2} ${tipY} Z`}
                fill={d.color}
              />
              {/* rounded bead at the tip */}
              <circle cx={midX} cy={tipY} r={tipW / 2 + 0.5} fill={d.color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function PublicFooter() {
  const { language } = useLanguage();
  const t = COPY[language];

  return (
    <footer
      className="relative"
      data-testid="footer-public"
      aria-label="Site footer"
      style={{
        background: "#000",
        borderTop: "3px solid transparent",
        borderImage: "linear-gradient(90deg,#8A2BFF,#FF2BD6,#FF8A00,#FFE600,#22FF66,#00E5FF,#006BFF) 1",
      }}
    >
      <FooterDrips />

      {/* Rainbow tag rule — thicker, glowing */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg,#006BFF,#00E5FF,#22FF66,#FFE600,#FF8A00,#FF2BD6,#8A2BFF)",
        boxShadow: "0 0 20px rgba(0,229,255,0.5), 0 0 40px rgba(255,43,214,0.3)",
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8">

          {/* Brand column — the logo lives here now, not in the header */}
          <div>
            <Link
              href="/"
              data-testid="footer-logo"
              className="inline-flex items-center gap-3 mb-2"
              style={{ textDecoration: "none" }}
            >
              <BrainTrackLogo className="h-10 w-10" />
              <span className="font-black text-2xl tracking-tight leading-none rainbow-text">
                BrainTrack
              </span>
            </Link>
            <p className="text-white text-sm font-semibold mt-1">{t.tagline}</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              data-testid="footer-email-support"
              className="inline-block mt-3 text-[12px] font-bold transition-all hover:scale-105"
              style={{ color: "#00E5FF" }}
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          {/* Nav links as sticker chips */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-3">
              Navigate
            </p>
            <div className="flex flex-wrap gap-2">
              {t.nav.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all hover:scale-105 hover:brightness-110"
                  style={{
                    background: `${l.color}18`,
                    color: l.color,
                    border: `1.5px solid ${l.color}`,
                    boxShadow: `0 0 10px ${l.color}33`,
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal chips */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-3">
              Legal
            </p>
            <div className="flex flex-wrap gap-2">
              {t.legal.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  data-testid={`footer-link-${l.href.replace(/^\//, "")}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all hover:scale-105 hover:brightness-110"
                  style={{
                    background: `${l.color}18`,
                    color: l.color,
                    border: `1.5px solid ${l.color}`,
                    boxShadow: `0 0 10px ${l.color}33`,
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <span className="text-[11px] font-bold text-white">{t.copyright}</span>
          <span className="text-[11px] font-bold text-white">{t.popia}</span>
        </div>
      </div>
    </footer>
  );
}
