// BrainTrack features — rebuilt to pixel-match the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, FEATURES section),
// then elevated per docs/design-guidelines.md (owner "wow" pass): scroll
// reveals (landing's Reveal pattern), floating pastel orbs (research.tsx
// signature), richer card hover blooms, bolder animated headline, marker
// underline swash, chip pops. Structure, copy and testids unchanged.
// Bilingual EN/AF.
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

const CTA_GRADIENT =
  "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const HEADLINE_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5,#9FD8FF)";
const RAINBOW =
  "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)";

// Pastel accent cycle for the subject chips.
const CHIP_COLORS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];

const COPY = {
  en: {
    tResearch: "Research",
    tEnter: "Enter the app →",
    eyebrow: "the full toolkit",
    head1: "One ecosystem. ",
    headAccent: "Every subject.",
    sub:
      "A CAPS-aligned study plan built from 10 years of real NSC papers, weak-spot tracking, an AI tutor, and parent reports — plus optional power-ups and rescue packs for exam crunch-time.",
    subjects: [
      "Mathematics", "Mathematical Literacy", "Physical Sciences", "Life Sciences",
      "Accounting", "Business Studies", "Economics", "Geography", "History",
      "English HL/FAL", "Afrikaans HL/EAT", "Life Orientation", "CAT", "IT",
    ],
    features: [
      { icon: "📘", color: "#9FF5E8", chipBg: "rgba(159,245,232,.14)", glow: "rgba(159,245,232,.25)", tilt: -1, title: "CAPS-Aligned Content", body: "100% curriculum-aligned questions and lessons. No fluff, no filler — only what matters for your exams." },
      { icon: "📝", color: "#9FD8FF", chipBg: "rgba(159,216,255,.14)", glow: "rgba(159,216,255,.25)", tilt: 1, title: "Real Exam-Style Questions", body: "Practice with questions built from 10 years of historical exam patterns. Know exactly what to expect." },
      { icon: "📅", color: "#FFB7E5", chipBg: "rgba(255,183,229,.14)", glow: "rgba(255,183,229,.25)", tilt: -1, title: "Personalised Daily Study Plans", body: "A smart study plan generated just for you, every day. Focus on what you need most." },
      { icon: "🎯", color: "#C5B3FF", chipBg: "rgba(197,179,255,.14)", glow: "rgba(197,179,255,.25)", tilt: 1, title: "Weak-Area Detection", body: "Pinpoints your gaps and builds a targeted improvement roadmap so you get stronger where it counts." },
      { icon: "🤖", color: "#FFE29A", chipBg: "rgba(255,226,154,.14)", glow: "rgba(255,226,154,.25)", tilt: -1, title: "Rizz — Smart Support Agent", body: "Rizz helps you navigate the platform, explains your next steps, and keeps you on track. Rizz is your support guide — not an academic tutor." },
      { icon: "🏆", color: "#94F7C5", chipBg: "rgba(148,247,197,.14)", glow: "rgba(148,247,197,.25)", tilt: 1, title: "Gamified Progress", body: "Earn XP, level up, and collect achievement badges. Stay motivated with every session." },
    ],
    cta: "Start your 14-day trial",
    ctaLoggedIn: "Go to My Classroom",
  },
  af: {
    tResearch: "Navorsing",
    tEnter: "Betree die app →",
    eyebrow: "die volle gereedskapstel",
    head1: "Een ekosisteem. ",
    headAccent: "Elke vak.",
    sub:
      "'n KABV-belynde studieplan gebou uit 10 jaar se regte NSS-vraestelle, swakpuntspoor, 'n KI-tutor, en ouerverslae — plus opsionele krag-opgraderings en reddingspakke vir eksamen-crunchtyd.",
    subjects: [
      "Wiskunde", "Wiskundige Geletterdheid", "Fisiese Wetenskappe", "Lewenswetenskappe",
      "Rekeningkunde", "Besigheidstudies", "Ekonomie", "Geografie", "Geskiedenis",
      "Engels HT/EAT", "Afrikaans HT/EAT", "Lewensoriëntering", "RTT", "IT",
    ],
    features: [
      { icon: "📘", color: "#9FF5E8", chipBg: "rgba(159,245,232,.14)", glow: "rgba(159,245,232,.25)", tilt: -1, title: "KABV-Belynde Inhoud", body: "100% kurrikulum-belynde vrae en lesse. Geen nonsens nie — net wat saak maak vir jou eksamens." },
      { icon: "📝", color: "#9FD8FF", chipBg: "rgba(159,216,255,.14)", glow: "rgba(159,216,255,.25)", tilt: 1, title: "Regte Eksamen-Styl Vrae", body: "Oefen met vrae gebou uit 10 jaar se vorige eksamenpatrone. Weet presies wat om te verwag." },
      { icon: "📅", color: "#FFB7E5", chipBg: "rgba(255,183,229,.14)", glow: "rgba(255,183,229,.25)", tilt: -1, title: "Persoonlike Daaglikse Studieplanne", body: "'n Slim studieplan wat elke dag net vir jou gemaak word. Fokus op wat jy die meeste nodig het." },
      { icon: "🎯", color: "#C5B3FF", chipBg: "rgba(197,179,255,.14)", glow: "rgba(197,179,255,.25)", tilt: 1, title: "Swak-Area Opsporing", body: "Spot jou gapings en bou 'n gerigte verbeteringsplan sodat jy sterker word waar dit tel." },
      { icon: "🤖", color: "#FFE29A", chipBg: "rgba(255,226,154,.14)", glow: "rgba(255,226,154,.25)", tilt: -1, title: "Rizz — Slim Ondersteuningsagent", body: "Rizz help jou om die platform te navigeer, verduidelik jou volgende stappe, en hou jou op koers. Rizz is jou ondersteuningsgids — nie 'n akademiese tutor nie." },
      { icon: "🏆", color: "#94F7C5", chipBg: "rgba(148,247,197,.14)", glow: "rgba(148,247,197,.25)", tilt: 1, title: "Spel-agtige Vordering", body: "Verdien XP, bereik nuwe vlakke, en ontsluit prestasiekentekens. Bly gemotiveerd met elke sessie." },
    ],
    cta: "Begin jou 14-dae proeftydperk",
    ctaLoggedIn: "My Klaskamer",
  },
} as const;

const featuresBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.co.za/" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://braintrack.co.za/features" },
  ],
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fires once when the element first enters the viewport (landing.tsx pattern). */
function useInView<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px 25% 0px" },
    );
    io.observe(el);
    // Fail-safe: nothing may ever stay invisible.
    const failSafe = window.setTimeout(() => setInView(true), 4000);
    return () => { io.disconnect(); window.clearTimeout(failSafe); };
  }, []);
  return [ref, inView];
}

/**
 * Scroll-reveal wrapper. Inline `animation: bt-fadeup …` so it survives the
 * global animation kill-switch in index.css; prefers-reduced-motion users get
 * the finished state immediately.
 */
function Reveal({
  delay = 0,
  style,
  className,
  children,
}: {
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={
        inView
          ? { ...style, animation: `bt-fadeup .85s cubic-bezier(.22,.75,.3,1) ${delay}ms both` }
          : { ...style, opacity: 0 }
      }
    >
      {children}
    </div>
  );
}

export default function FeaturesPage() {
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();
  const t = COPY[language];
  const en = language === "en";

  useSEO({
    title: "Features | BrainTrack™ CAPS Study Plan & NSC Past Papers",
    description:
      "Explore BrainTrack™ features: CAPS weekly study plan, NSC past papers with memos, gap detection, Rizz AI tutor, gamified progress & parent dashboard. R169/month.",
    canonical: "https://braintrack.co.za/features",
    ogTitle: "BrainTrack™ Features — CAPS Plan, NSC Past Papers & AI Tutor",
    ogDescription:
      "CAPS-aligned study plan, 10 years of NSC past papers with memos, gap detection, Rizz AI tutor, and progress tracking for Grade 12 Matric. Try free for 14 days.",
    ogUrl: "https://braintrack.co.za/features",
    jsonLd: featuresBreadcrumb,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#050508", overflowX: "hidden", color: "#fff" }}>
      <style>{`
        .btf-nav-link { color:#fff; cursor:pointer; transition:color .2s; }
        .btf-nav-link:hover { color:#9FD8FF; }
        .btf-nav-cta { transition: transform .2s; }
        .btf-nav-cta:hover { transform: translateY(-2px); }
        .btf-cta { transition: transform .2s, box-shadow .2s; }
        .btf-cta:hover { transform: translateY(-3px) rotate(-1deg); }
        .btf-feature {
          position: relative; overflow: hidden; height: 100%; box-sizing: border-box;
          transition: transform .38s cubic-bezier(.22,.75,.3,1), box-shadow .38s ease,
                      border-color .38s ease, background .38s ease;
        }
        /* accent top-edge highlight */
        .btf-feature::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1.5px;
          background: linear-gradient(90deg, transparent, var(--c), transparent);
          opacity: .4; transition: opacity .38s ease;
        }
        /* accent bloom that swells from the top-left on hover */
        .btf-feature::after {
          content: ""; position: absolute; top: -55%; left: -20%; width: 90%; height: 90%;
          background: radial-gradient(closest-side, var(--glow), transparent 72%);
          opacity: 0; transition: opacity .45s ease; pointer-events: none; z-index: 0;
        }
        .btf-feature > * { position: relative; z-index: 1; }
        .btf-feature:hover {
          transform: translateY(-10px) rotate(var(--tilt, 0deg)) scale(1.012);
          box-shadow: 0 26px 64px var(--glow);
          border-color: var(--c) !important;
          background: linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.02)) !important;
        }
        .btf-feature:hover::before { opacity: 1; }
        .btf-feature:hover::after { opacity: 1; }
        .btf-fchip { transition: transform .38s cubic-bezier(.22,.75,.3,1), box-shadow .38s ease; }
        .btf-feature:hover .btf-fchip { transform: translateY(-3px) scale(1.07); }
        .btf-chip { transition: transform .25s, box-shadow .25s; }
        .btf-chip:hover { transform: translateY(-3px) rotate(-1deg); }
        .btf-logo-img { transition: transform .25s; }
        .btf-logo-img:hover { transform: scale(1.15) rotate(-4deg); }
        @media (max-width: 860px) {
          .btf-nav-links { display: none !important; }
          .btf-head { font-size: 38px !important; letter-spacing: -1px !important; }
          .btf-grid3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .btf-nav { padding: 12px 10px !important; gap: 6px !important; }
          .btf-nav-left { gap: 6px !important; }
          .btf-nav-left img { width: 34px !important; height: 34px !important; }
          .btf-nav-left .bt-wordmark { font-size: 17px !important; }
          .btf-nav-right { gap: 6px !important; }
          .btf-nav-right [data-testid="lang-toggle"] span { padding: 5px 7px !important; }
          .btf-nav-cta { padding: 8px 12px !important; font-size: 12px !important; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <div
        className="btf-nav"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, padding: "16px 48px", position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,5,8,.82)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Link href="/">
          <div className="btf-nav-left" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", minWidth: 0, flex: "none" }}>
            <img src={iconTransparent} alt="BrainTrack" className="btf-logo-img" style={{ width: 56, height: 56, objectFit: "contain", flex: "none" }} />
            <span className="bt-wordmark" style={{ fontSize: 22, letterSpacing: "-.5px" }}>BrainTrack</span>
          </div>
        </Link>
        <div className="btf-nav-right" style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 14, fontWeight: 600, flex: "none" }}>
          <span className="btf-nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Link href="/research"><span className="btf-nav-link">{t.tResearch}</span></Link>
          </span>
          <span
            onClick={toggleLanguage}
            data-testid="lang-toggle"
            style={{
              display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 800,
              border: "1.5px solid rgba(255,255,255,.2)", borderRadius: 8,
              overflow: "hidden", cursor: "pointer", userSelect: "none", flex: "none",
            }}
          >
            <span style={{ padding: "6px 10px", background: en ? "#9FF5E8" : "transparent", color: en ? "#050508" : "#fff" }}>EN</span>
            <span style={{ padding: "6px 10px", background: en ? "transparent" : "#9FF5E8", color: en ? "#fff" : "#050508" }}>AF</span>
          </span>
          <a href="/signin" style={{ flex: "none" }}>
            <button
              className="btf-nav-cta"
              data-testid="button-nav-enter"
              style={{
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14,
                color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                animation: "bt-rainbow 6s linear infinite", border: "none",
                borderRadius: 10, padding: "11px 24px", whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {t.tEnter}
            </button>
          </a>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px 100px", textAlign: "center", position: "relative" }}>
        {/* Floating pastel orbs — signature moment (research.tsx pattern). */}
        <div aria-hidden style={{ position: "absolute", top: -40, left: "8%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(159,216,255,.35),transparent 70%)", filter: "blur(50px)", pointerEvents: "none", animation: "bt-float 9s ease-in-out infinite" }} />
        <div aria-hidden style={{ position: "absolute", top: 120, right: "4%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,183,229,.3),transparent 70%)", filter: "blur(55px)", pointerEvents: "none", animation: "bt-float 11s ease-in-out infinite reverse" }} />
        <div aria-hidden style={{ position: "absolute", top: 60, left: "44%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(197,179,255,.28),transparent 70%)", filter: "blur(50px)", pointerEvents: "none", animation: "bt-glowpulse 6s ease-in-out infinite" }} />

        <Reveal style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8", fontSize: 18, transform: "rotate(-2deg)" }}>
            {t.eyebrow}
          </div>
          <div
            role="heading"
            aria-level={1}
            className="btf-head"
            data-testid="text-features-title"
            style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-2.2px", lineHeight: 1.08, margin: "10px 0 0", fontFamily: "'Poppins',sans-serif", color: "#fff" }}
          >
            {t.head1}
            <span
              style={{
                background: HEADLINE_GRADIENT, backgroundSize: "200% 100%",
                animation: "bt-rainbow 7s linear infinite",
                WebkitBackgroundClip: "text", backgroundClip: "text",
                color: "transparent", WebkitTextFillColor: "transparent",
              }}
            >
              {t.headAccent}
            </span>
          </div>
          {/* Marker underline swash beneath the headline. */}
          <div
            aria-hidden
            style={{
              width: 190, height: 5, margin: "16px auto 0", borderRadius: 999,
              background: RAINBOW, backgroundSize: "200% 100%",
              animation: "bt-rainbow 7s linear infinite", opacity: 0.85,
              transform: "rotate(-1.2deg)",
            }}
          />
          <div
            data-testid="text-features-subtitle"
            style={{ fontSize: 17, color: "#fff", opacity: 0.942, maxWidth: 640, margin: "18px auto 20px", lineHeight: 1.6 }}
          >
            {t.sub}
          </div>
        </Reveal>

        {/* Subject chips */}
        <Reveal delay={120} style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 52 }}>
            {t.subjects.map((name, i) => {
              const c = CHIP_COLORS[i % CHIP_COLORS.length];
              return (
                <span
                  key={name}
                  className="btf-chip"
                  style={{ fontSize: 13.5, fontWeight: 700, color: c, border: `1.5px solid ${c}`, borderRadius: 999, padding: "8px 16px" }}
                >
                  {name}
                </span>
              );
            })}
          </div>
        </Reveal>

        {/* Feature cards */}
        <div className="btf-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, textAlign: "left", position: "relative", zIndex: 2 }}>
          {t.features.map((f, i) => (
            <Reveal key={f.title} delay={i * 90} style={{ display: "flex" }}>
              <div
                className="btf-feature"
                data-testid={`card-feature-${i}`}
                style={{
                  "--tilt": `${f.tilt}deg`, "--glow": f.glow, "--c": f.color,
                  background: "linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.015))",
                  border: "1px solid rgba(255,255,255,.09)", borderRadius: 22,
                  padding: 28, cursor: "default", width: "100%",
                } as React.CSSProperties}
              >
                <div className="btf-fchip" style={{ width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: f.chipBg, marginBottom: 18, fontSize: 24 }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#fff" }}>{f.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#fff", opacity: 0.942 }}>{f.body}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Final CTA */}
        <Reveal delay={140} style={{ position: "relative", zIndex: 2 }}>
          <Link href={isAuthenticated ? "/dashboard" : "/subscribe"}>
            <button
              className="btf-cta"
              data-testid="button-features-cta"
              style={{
                marginTop: 52, fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16,
                color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                animation: "bt-rainbow 5s linear infinite", border: "none",
                borderRadius: 10, padding: "16px 40px", whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {isAuthenticated ? t.ctaLoggedIn : t.cta}
            </button>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
