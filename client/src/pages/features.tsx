// BrainTrack features — rebuilt to pixel-match the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, FEATURES section).
// Sticky blur nav, marker eyebrow, 52px headline with gradient accent,
// subject chip wall, 3-col neon feature grid, rainbow trial CTA. Bilingual EN/AF.
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

const CTA_GRADIENT =
  "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const HEADLINE_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)";

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
        .btf-cta { transition: transform .2s; }
        .btf-cta:hover { transform: translateY(-3px); }
        .btf-feature { transition: transform .25s, box-shadow .25s, border-color .25s; }
        .btf-feature:hover { transform: translateY(-8px) rotate(var(--tilt, 0deg)); box-shadow: 0 20px 50px var(--glow); border-color: var(--c) !important; }
        .btf-logo-img { transition: transform .25s; }
        .btf-logo-img:hover { transform: scale(1.15) rotate(-4deg); }
        @media (max-width: 860px) {
          .btf-nav-links { display: none !important; }
          .btf-head { font-size: 38px !important; letter-spacing: -1px !important; }
          .btf-grid3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, padding: "16px 48px", position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,5,8,.82)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Link href="/">
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <img src={iconTransparent} alt="BrainTrack" className="btf-logo-img" style={{ width: 56, height: 56, objectFit: "contain" }} />
            <span className="bt-wordmark" style={{ fontSize: 22, letterSpacing: "-.5px" }}>BrainTrack</span>
          </div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 14, fontWeight: 600, flex: "none" }}>
          <span className="btf-nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Link href="/research"><span className="btf-nav-link">{t.tResearch}</span></Link>
          </span>
          <span
            onClick={toggleLanguage}
            data-testid="lang-toggle"
            style={{
              display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 800,
              border: "1.5px solid rgba(255,255,255,.2)", borderRadius: 8,
              overflow: "hidden", cursor: "pointer", userSelect: "none",
            }}
          >
            <span style={{ padding: "6px 10px", background: en ? "#9FF5E8" : "transparent", color: en ? "#050508" : "#fff" }}>EN</span>
            <span style={{ padding: "6px 10px", background: en ? "transparent" : "#9FF5E8", color: en ? "#fff" : "#050508" }}>AF</span>
          </span>
          <a href="/api/login">
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
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px 100px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8", fontSize: 18, transform: "rotate(-2deg)" }}>
          {t.eyebrow}
        </div>
        <div
          role="heading"
          aria-level={1}
          className="btf-head"
          data-testid="text-features-title"
          style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", margin: "8px 0 14px", fontFamily: "'Poppins',sans-serif", color: "#fff" }}
        >
          {t.head1}
          <span
            style={{
              background: HEADLINE_GRADIENT,
              WebkitBackgroundClip: "text", backgroundClip: "text",
              color: "transparent", WebkitTextFillColor: "transparent",
            }}
          >
            {t.headAccent}
          </span>
        </div>
        <div
          data-testid="text-features-subtitle"
          style={{ fontSize: 17, color: "#fff", opacity: 0.942, maxWidth: 640, margin: "0 auto 20px", lineHeight: 1.6 }}
        >
          {t.sub}
        </div>

        {/* Subject chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 52 }}>
          {t.subjects.map((name, i) => {
            const c = CHIP_COLORS[i % CHIP_COLORS.length];
            return (
              <span
                key={name}
                style={{ fontSize: 13.5, fontWeight: 700, color: c, border: `1.5px solid ${c}`, borderRadius: 999, padding: "8px 16px" }}
              >
                {name}
              </span>
            );
          })}
        </div>

        {/* Feature cards */}
        <div className="btf-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, textAlign: "left" }}>
          {t.features.map((f, i) => (
            <div
              key={f.title}
              className="btf-feature"
              data-testid={`card-feature-${i}`}
              style={{
                "--tilt": `${f.tilt}deg`, "--glow": f.glow, "--c": f.color,
                background: "linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.015))",
                border: "1px solid rgba(255,255,255,.09)", borderRadius: 22,
                padding: 28, cursor: "default",
              } as React.CSSProperties}
            >
              <div style={{ width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: f.chipBg, boxShadow: `0 0 22px ${f.glow}`, marginBottom: 18, fontSize: 24 }}>
                {f.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#fff" }}>{f.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#fff", opacity: 0.942 }}>{f.body}</div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <Link href={isAuthenticated ? "/dashboard" : "/subscribe"}>
          <button
            className="btf-cta"
            data-testid="button-features-cta"
            style={{
              marginTop: 52, fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16,
              color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
              animation: "bt-rainbow 5s linear infinite", border: "none",
              borderRadius: 10, padding: "16px 40px", whiteSpace: "nowrap",
              cursor: "pointer", boxShadow: "0 0 30px rgba(255,183,229,.4)",
            }}
          >
            {isAuthenticated ? t.ctaLoggedIn : t.cta}
          </button>
        </Link>
      </div>
    </div>
  );
}
