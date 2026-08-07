// Shared chrome for the BrainTrack legal pages — rebuilt to the Claude Design
// handoff "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, LEGAL
// PAGES section). Near-black #050508 ground, sticky nav with icon + rainbow
// wordmark + back link, ~800px content column, white 15px/1.75 body text,
// accent section headings, version/date chip, legal cross-nav pills.
// Presentation only — pages keep their legal copy verbatim.
import type { ReactNode } from "react";
import { Link } from "wouter";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

const LEGAL_LINKS = [
  { href: "/privacy-policy", en: "Privacy", af: "Privaatheid", accent: "#9FD8FF" },
  { href: "/terms-of-service", en: "Terms", af: "Bepalings", accent: "#FFB7E5" },
  { href: "/cookie-policy", en: "Cookies", af: "Koekies", accent: "#FFE29A" },
  { href: "/refund-policy", en: "Refunds", af: "Terugbetalings", accent: "#94F7C5" },
] as const;

export function LegalSection({
  accent,
  title,
  children,
  testId,
}: {
  accent: string;
  title: ReactNode;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section
      data-testid={testId}
      style={{
        background: "#0e0d12",
        border: "1px solid #1b1922",
        borderRadius: 16,
        padding: "22px 26px",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10, color: accent }}>
        {title}
      </div>
      <div className="bt-legal-body">{children}</div>
    </section>
  );
}

export function LegalShell({
  title,
  titleTestId,
  updated,
  language,
  onToggleLanguage,
  activeHref,
  backTestId,
  lead,
  children,
}: {
  title: ReactNode;
  titleTestId?: string;
  /** Verbatim "Last updated …" line from the page's legal copy. */
  updated: ReactNode;
  language: "en" | "af";
  onToggleLanguage: () => void;
  activeHref: string;
  backTestId?: string;
  /** Optional intro copy rendered between the chip and the sections. */
  lead?: ReactNode;
  children: ReactNode;
}) {
  const isAf = language === "af";
  const en = language === "en";
  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif" }}>
      <style>{`
        .bt-legal-body { font-size: 15px; line-height: 1.75; color: #fff; }
        .bt-legal-body p, .bt-legal-body li, .bt-legal-body td, .bt-legal-body th { font-size: 15px; line-height: 1.75; color: #fff; }
        .bt-legal-body table { font-size: 13px; }
        .bt-legal-body td, .bt-legal-body th { font-size: 13px; line-height: 1.6; }
        .bt-legal-back { color: #9FD8FF; cursor: pointer; transition: color .2s; }
        .bt-legal-back:hover { color: #9FF5E8; }
        .bt-legal-pill { transition: border-color .2s, color .2s; }
        .bt-legal-pill:hover { border-color: #9FD8FF !important; }
        .bt-legal-logo { transition: transform .25s; }
        .bt-legal-logo:hover { transform: scale(1.12) rotate(-4deg); }
      `}</style>

      {/* ── Sticky nav ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 24px", position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,5,8,.85)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid #1b1922",
        }}
      >
        <Link href="/">
          <img
            src={iconTransparent}
            alt="BrainTrack"
            className="bt-legal-logo"
            style={{ width: 52, height: 52, objectFit: "contain", cursor: "pointer" }}
          />
        </Link>
        <span className="bt-wordmark" style={{ fontSize: 18 }}>BrainTrack</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <span
            onClick={onToggleLanguage}
            data-testid="button-language-toggle"
            style={{
              display: "flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 800,
              border: "1.5px solid #1b1922", borderRadius: 8,
              overflow: "hidden", cursor: "pointer", userSelect: "none",
            }}
          >
            <span style={{ padding: "5px 9px", background: en ? "#9FF5E8" : "transparent", color: en ? "#050508" : "#fff" }}>EN</span>
            <span style={{ padding: "5px 9px", background: en ? "transparent" : "#9FF5E8", color: en ? "#fff" : "#050508" }}>AF</span>
          </span>
          <Link href="/">
            <span className="bt-legal-back" data-testid={backTestId} style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
              ← {isAf ? "Terug na werf" : "Back to site"}
            </span>
          </Link>
        </span>
      </div>

      {/* ── Content column ─────────────────────────────────── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 90px" }}>
        <div
          role="heading"
          aria-level={1}
          data-testid={titleTestId}
          style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 12, color: "#fff" }}
        >
          {title}
        </div>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 12.5, fontWeight: 700, color: "#fff", opacity: 0.94,
            border: "1px solid #1b1922", borderRadius: 999,
            padding: "6px 14px", marginBottom: 20,
          }}
        >
          KTH Tech (Pty) Ltd · {updated}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
          {LEGAL_LINKS.map((l) => {
            const active = l.href === activeHref;
            return (
              <Link key={l.href} href={l.href}>
                <span
                  className="bt-legal-pill"
                  style={{
                    display: "inline-block", fontSize: 12.5, fontWeight: 700,
                    padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                    color: active ? "#050508" : l.accent,
                    background: active ? l.accent : "transparent",
                    border: `1.5px solid ${l.accent}`,
                  }}
                >
                  {isAf ? l.af : l.en}
                </span>
              </Link>
            );
          })}
        </div>

        {lead && (
          <div className="bt-legal-body" style={{ marginBottom: 30 }}>
            {lead}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
