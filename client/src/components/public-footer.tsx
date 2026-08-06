import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { KthMark } from "@/components/kth-mark";

const SUPPORT_EMAIL = "learn@kth-tech.com";
const SHARE_URL = "https://braintrack.tech";

const COPY = {
  en: {
    // Kinetic marquee tape — the head-to-head brand banner that runs the width.
    marquee: ["BrainTrack", "Grade 12 Matric", "CAPS-aligned", "Real NSC Papers", "24/7 AI Tutor", "🇿🇦"],
    copyright: "© 2026 BrainTrack™ · KTH Tech",
    popia: "POPIA-compliant · Built in SA 🇿🇦",
    share: "Share",
    shareMsg:
      "BrainTrack — Grade 12 matric prep with real NSC past papers, memos and a 24/7 AI tutor. Try it free:",
    referral: "Refer a friend — you both earn rewards.",
    getLink: "Get your link →",
    legal: [
      { href: "/privacy-policy",   label: "Privacy" },
      { href: "/terms-of-service", label: "Terms" },
      { href: "/refund-policy",    label: "Refunds" },
    ],
    nav: [
      { href: "/research",  label: "Research" },
      { href: "/features",  label: "Features" },
      { href: "/subscribe", label: "Pricing" },
      { href: "/partner-schools", label: "Partners" },
    ],
    contact: "Contact",
  },
  af: {
    marquee: ["BrainTrack", "Graad 12 Matriek", "KABV-belyn", "Regte NSS-Vraestelle", "24/7 KI-Tutor", "🇿🇦"],
    copyright: "© 2026 BrainTrack™ · KTH Tech",
    popia: "POPIA-nakoming · Trots SA 🇿🇦",
    share: "Deel",
    shareMsg:
      "BrainTrack — Graad 12-matriekvoorbereiding met regte NSS-vraestelle, memo's en 'n 24/7 KI-tutor. Probeer dit gratis:",
    referral: "Verwys 'n vriend — julle albei verdien belonings.",
    getLink: "Kry jou skakel →",
    legal: [
      { href: "/privacy-policy",   label: "Privaatheid" },
      { href: "/terms-of-service", label: "Bepalings" },
      { href: "/refund-policy",    label: "Terugbetalings" },
    ],
    nav: [
      { href: "/research",  label: "Navorsing" },
      { href: "/features",  label: "Kenmerke" },
      { href: "/subscribe", label: "Pryse" },
      { href: "/partner-schools", label: "Vennote" },
    ],
    contact: "Kontak",
  },
} as const;

const WORDMARK = "linear-gradient(95deg,#9FD8FF,#94F7C5,#FFE29A,#FFB7E5,#C5B3FF)";

export function PublicFooter() {
  const { language } = useLanguage();
  const t = COPY[language];
  const isAf = language === "af";

  // Social policy: WhatsApp + LinkedIn only.
  const shareLinks = [
    { label: "WhatsApp", color: "#94F7C5", testid: "footer-share-whatsapp", href: `https://wa.me/?text=${encodeURIComponent(`${t.shareMsg} ${SHARE_URL}`)}` },
    { label: "LinkedIn", color: "#9FD8FF", testid: "footer-share-linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}` },
  ];

  // Duplicated once so the marquee loops seamlessly under bt-marquee (-50%).
  const tape = [...t.marquee, ...t.marquee, ...t.marquee, ...t.marquee];

  return (
    <footer data-testid="footer-public" aria-label="Site footer" style={{ background: "#050508" }}>
      {/* ── Kinetic marquee tape ─────────────────────────────────
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
                fontFamily: "'Bebas Neue','Arial Black',Impact,sans-serif",
                fontSize: 16,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#050508",
                padding: "0 16px",
              }}
            >
              {word}<span style={{ opacity: 0.5, paddingLeft: 16 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-6">
        {/* Link row + share */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-6 gap-y-4">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {t.nav.map((l) => (
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

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white mr-1">{t.share}</span>
            {shareLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={s.testid}
                className="text-[11px] font-bold rounded-full px-3 py-1 transition-transform hover:-translate-y-0.5"
                style={{ color: s.color, border: `1.6px solid ${s.color}` }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Referral + legal row */}
        <div
          className="mt-4 pt-4 flex flex-col sm:flex-row sm:items-center gap-x-5 gap-y-2 flex-wrap"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          data-testid="footer-share-row"
        >
          <span className="text-[11.5px] text-white" data-testid="footer-referral-line">
            {t.referral}{" "}
            <Link href="/signin" data-testid="footer-referral-signin" className="font-bold" style={{ color: "#9FF5E8" }}>
              {t.getLink}
            </Link>
          </span>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:ml-auto">
            {t.legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-testid={`footer-link-${l.href.replace(/^\//, "")}`}
                className="text-[11.5px] font-medium text-white transition-colors hover:text-[#9FF5E8]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/partner-schools"
              data-testid="footer-partners"
              className="text-[11.5px] font-medium text-white transition-colors hover:text-[#9FF5E8]"
            >
              {isAf ? "Vennote" : "Partners"}
            </Link>
          </nav>
        </div>

        {/* Sign-off — real KTH Tech roundel */}
        <div
          className="mt-4 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="text-[11px] text-white">
            {t.copyright} <span className="mx-1 opacity-40">·</span> {t.popia}
          </span>
          <a
            href="https://kth-tech.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="footer-kth-logo"
            className="inline-flex items-center gap-2 text-[12px] font-bold text-white opacity-90 hover:opacity-100 transition-opacity"
            aria-label="KTH Tech"
          >
            <KthMark size={40} />
            <span>KTH Tech</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
