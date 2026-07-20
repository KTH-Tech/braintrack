// BrainTrack research — rebuilt to pixel-match the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, RESEARCH section).
// Sticky blur nav, floating radial orbs, evidence badge, animated rainbow
// headline, stat cards, mark-loss bars, quote, four pillar cards and the
// research model flow. Bilingual EN/AF.
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

const CTA_GRADIENT =
  "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const HEADLINE_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)";
const RAINBOW_ANIM =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5,#FFE29A)";
const FLOW_GRADIENT =
  "linear-gradient(90deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)";

const COPY = {
  en: {
    tFeatures: "Features",
    tEnter: "Enter the app →",
    badge: "🔬 Evidence-based · peer-reviewed principles",
    eyebrow: "the receipts",
    head1: "Built on ",
    headAccent: "10 years of DBE data",
    sub:
      "We analysed official National Senior Certificate diagnostic reports from 2015–2025 to find exactly where learners lose marks — and built the platform around fixing it.",
    stats: [
      { value: "80%", label: "Long-term recall with spaced practice vs 20% cramming", color: "#9FF5E8", glow: "rgba(159,245,232,.25)" },
      { value: "3×", label: "Better retention from active recall vs re-reading", color: "#FFB7E5", glow: "rgba(255,183,229,.25)" },
      { value: "0.73", label: "Feedback effect size — Hattie & Timperley (2007)", color: "#FFE29A", glow: "rgba(255,226,154,.25)" },
      { value: "10 yrs", label: "Of NSC papers and DBE diagnostic reports, 2015–2025", color: "#9FD8FF", glow: "rgba(159,216,255,.25)" },
    ],
    barsTitle: "Where matrics lose the most marks",
    barsSub: "Aggregated from DBE Diagnostic Reports, 2015–2025 · illustrative",
    loseLabel: "lose marks here",
    bars: [
      { topic: "Euclidean geometry", pct: 62, color: "#FFB7E5", color2: "#C5B3FF", glow: "rgba(255,183,229,.35)" },
      { topic: "Stoichiometry", pct: 57, color: "#9FF5E8", color2: "#9FD8FF", glow: "rgba(159,245,232,.35)" },
      { topic: "Essay structure", pct: 48, color: "#FFE29A", color2: "#FFB7E5", glow: "rgba(255,226,154,.35)" },
      { topic: "Map calculations", pct: 44, color: "#9FD8FF", color2: "#C5B3FF", glow: "rgba(159,216,255,.35)" },
      { topic: "Financial statements", pct: 41, color: "#94F7C5", color2: "#9FF5E8", glow: "rgba(148,247,197,.35)" },
    ],
    quote:
      "“Most platforms use generic content. BrainTrack targets the exact topics the DBE flags year after year — so revision time goes where it actually moves the mark.”",
    sciEyebrow: "the science",
    sciHead1: "Four disciplines, ",
    sciAccent: "one ecosystem",
    sciSub:
      "The strength isn't any one feature — it's how evidence-based learning science, behavioural psychology, data analytics and school partnership work together.",
    pillars: [
      {
        emoji: "🧠", color: "#9FF5E8", chipBg: "rgba(159,245,232,.14)", glow: "rgba(159,245,232,.18)",
        tag: "Learning science", title: "Study methods that stick",
        body: "Spaced practice beats cramming (80% vs 20% recall) and testing yourself beats re-reading 3× over. Every drill, plan and review cycle is built on these peer-reviewed principles.",
        chips: ["Spaced repetition", "Retrieval practice", "Interleaving", "Worked examples"],
      },
      {
        emoji: "🎮", color: "#FFB7E5", chipBg: "rgba(255,183,229,.14)", glow: "rgba(255,183,229,.18)",
        tag: "Behavioural psychology", title: "Dopamine, but productive",
        body: "Streaks build daily habits, XP makes progress visible, and reward reveals keep teens coming back. The same mechanics games use — pointed at matric marks.",
        chips: ["Streaks", "XP", "Variable rewards", "Loss aversion"],
      },
      {
        emoji: "📊", color: "#9FD8FF", chipBg: "rgba(159,216,255,.14)", glow: "rgba(159,216,255,.18)",
        tag: "Data analytics", title: "Diagnosis before drills",
        body: "Ten years of DBE diagnostics show where marks are lost nationally; your own answers show where you lose them. The plan targets the overlap.",
        chips: ["DBE diagnostics", "Weak-spot detection", "Cohort trends", "Predictive rating"],
      },
      {
        emoji: "🏫", color: "#C5B3FF", chipBg: "rgba(197,179,255,.14)", glow: "rgba(197,179,255,.18)",
        tag: "School partnership", title: "Built with schools, not around them",
        body: "Teachers see cohort weak spots, schools get clean reports and fundraising tools, and parents get weekly visibility — all POPIA-aware by design.",
        chips: ["Teacher dashboards", "Cohort reports", "Fundraising", "POPIA"],
      },
    ],
    modelTitle: "The BrainTrack research model",
    inputs: [
      { label: "10 yrs DBE diagnostics", color: "#9FD8FF", glow: "rgba(159,216,255,.25)" },
      { label: "CAPS curriculum", color: "#9FF5E8", glow: "rgba(159,245,232,.25)" },
      { label: "Real NSC papers", color: "#FFE29A", glow: "rgba(255,226,154,.25)" },
      { label: "Learning science", color: "#FFB7E5", glow: "rgba(255,183,229,.25)" },
      { label: "Behavioural design", color: "#C5B3FF", glow: "rgba(197,179,255,.25)" },
    ],
    outputs: [
      { label: "Personal study plan", c1: "#9FD8FF", c2: "#9FF5E8" },
      { label: "Weak-spot drills", c1: "#FFB7E5", c2: "#C5B3FF" },
      { label: "Parent reports", c1: "#FFE29A", c2: "#FFB7E5" },
      { label: "School dashboards", c1: "#9FF5E8", c2: "#94F7C5" },
      { label: "Exam readiness", c1: "#C5B3FF", c2: "#9FD8FF" },
    ],
  },
  af: {
    tFeatures: "Funksies",
    tEnter: "Betree die app →",
    badge: "🔬 Bewysgebaseer · eweknie-beoordeelde beginsels",
    eyebrow: "die bewyse",
    head1: "Gebou op ",
    headAccent: "10 jaar se DBE-data",
    sub:
      "Ons het amptelike Nasionale Senior Sertifikaat-diagnostiese verslae van 2015–2025 ontleed om presies te vind waar leerders punte verloor — en die platform gebou om dit reg te maak.",
    stats: [
      { value: "80%", label: "Langtermyn-herroeping met gespasieerde oefening vs 20% inkramming", color: "#9FF5E8", glow: "rgba(159,245,232,.25)" },
      { value: "3×", label: "Beter retensie deur aktiewe herroeping vs herlees", color: "#FFB7E5", glow: "rgba(255,183,229,.25)" },
      { value: "0.73", label: "Terugvoer-effekgrootte — Hattie & Timperley (2007)", color: "#FFE29A", glow: "rgba(255,226,154,.25)" },
      { value: "10 jr", label: "Se NSS-vraestelle en DBE-diagnostiese verslae, 2015–2025", color: "#9FD8FF", glow: "rgba(159,216,255,.25)" },
    ],
    barsTitle: "Waar matrieks die meeste punte verloor",
    barsSub: "Saamgestel uit DBE-diagnostiese verslae, 2015–2025 · illustratief",
    loseLabel: "verloor hier punte",
    bars: [
      { topic: "Euklidiese meetkunde", pct: 62, color: "#FFB7E5", color2: "#C5B3FF", glow: "rgba(255,183,229,.35)" },
      { topic: "Stoïgiometrie", pct: 57, color: "#9FF5E8", color2: "#9FD8FF", glow: "rgba(159,245,232,.35)" },
      { topic: "Opstelstruktuur", pct: 48, color: "#FFE29A", color2: "#FFB7E5", glow: "rgba(255,226,154,.35)" },
      { topic: "Kaartberekeninge", pct: 44, color: "#9FD8FF", color2: "#C5B3FF", glow: "rgba(159,216,255,.35)" },
      { topic: "Finansiële state", pct: 41, color: "#94F7C5", color2: "#9FF5E8", glow: "rgba(148,247,197,.35)" },
    ],
    quote:
      "“Die meeste platforms gebruik generiese inhoud. BrainTrack teiken die presiese onderwerpe wat die DBE jaar na jaar uitwys — sodat hersieningstyd gaan waar dit werklik die punt skuif.”",
    sciEyebrow: "die wetenskap",
    sciHead1: "Vier dissiplines, ",
    sciAccent: "een ekosisteem",
    sciSub:
      "Die krag is nie enige een funksie nie — dit is hoe bewysgebaseerde leerwetenskap, gedragsielkunde, data-analise en skoolvennootskap saamwerk.",
    pillars: [
      {
        emoji: "🧠", color: "#9FF5E8", chipBg: "rgba(159,245,232,.14)", glow: "rgba(159,245,232,.18)",
        tag: "Leerwetenskap", title: "Studiemetodes wat vassit",
        body: "Gespasieerde oefening klop inkramming (80% vs 20% herroeping) en jouself toets klop herlees 3× oor. Elke oefening, plan en hersieningsiklus is op hierdie eweknie-beoordeelde beginsels gebou.",
        chips: ["Gespasieerde herhaling", "Herroepingsoefening", "Afwisseling", "Uitgewerkte voorbeelde"],
      },
      {
        emoji: "🎮", color: "#FFB7E5", chipBg: "rgba(255,183,229,.14)", glow: "rgba(255,183,229,.18)",
        tag: "Gedragsielkunde", title: "Dopamien, maar produktief",
        body: "Reekse bou daaglikse gewoontes, XP maak vordering sigbaar, en beloningsonthullings hou tieners aan die kom. Dieselfde meganika wat speletjies gebruik — gemik op matriekpunte.",
        chips: ["Reekse", "XP", "Wisselende belonings", "Verliesvermyding"],
      },
      {
        emoji: "📊", color: "#9FD8FF", chipBg: "rgba(159,216,255,.14)", glow: "rgba(159,216,255,.18)",
        tag: "Data-analise", title: "Diagnose voor drille",
        body: "Tien jaar se DBE-diagnostiek wys waar punte nasionaal verloor word; jou eie antwoorde wys waar jy hulle verloor. Die plan teiken die oorvleueling.",
        chips: ["DBE-diagnostiek", "Swakplek-opsporing", "Kohort-neigings", "Voorspellende gradering"],
      },
      {
        emoji: "🏫", color: "#C5B3FF", chipBg: "rgba(197,179,255,.14)", glow: "rgba(197,179,255,.18)",
        tag: "Skoolvennootskap", title: "Gebou saam met skole, nie om hulle nie",
        body: "Onderwysers sien kohort-swakplekke, skole kry skoon verslae en fondsinsamelingsgereedskap, en ouers kry weeklikse sigbaarheid — alles POPIA-bewus van ontwerp.",
        chips: ["Onderwyser-paneelborde", "Kohortverslae", "Fondsinsameling", "POPIA"],
      },
    ],
    modelTitle: "Die BrainTrack-navorsingsmodel",
    inputs: [
      { label: "10 jr DBE-diagnostiek", color: "#9FD8FF", glow: "rgba(159,216,255,.25)" },
      { label: "KABV-kurrikulum", color: "#9FF5E8", glow: "rgba(159,245,232,.25)" },
      { label: "Regte NSS-vraestelle", color: "#FFE29A", glow: "rgba(255,226,154,.25)" },
      { label: "Leerwetenskap", color: "#FFB7E5", glow: "rgba(255,183,229,.25)" },
      { label: "Gedragsontwerp", color: "#C5B3FF", glow: "rgba(197,179,255,.25)" },
    ],
    outputs: [
      { label: "Persoonlike studieplan", c1: "#9FD8FF", c2: "#9FF5E8" },
      { label: "Swakplek-drille", c1: "#FFB7E5", c2: "#C5B3FF" },
      { label: "Ouerverslae", c1: "#FFE29A", c2: "#FFB7E5" },
      { label: "Skool-paneelborde", c1: "#9FF5E8", c2: "#94F7C5" },
      { label: "Eksamengereedheid", c1: "#C5B3FF", c2: "#9FD8FF" },
    ],
  },
} as const;

export default function ResearchPage() {
  const { language, toggleLanguage } = useLanguage();
  const t = COPY[language];
  const en = language === "en";

  useSEO({
    title: "Research | BrainTrack™ Learning Science Behind Grade 12 Matric Prep",
    description: "BrainTrack™ is built on spaced repetition, active recall and 10 years of real NSC exam patterns. Discover the learning science powering CAPS-aligned Matric preparation.",
    canonical: "https://braintrack.co.za/research",
    ogTitle: "The Science Behind BrainTrack™ — Why It Improves Matric Marks",
    ogDescription: "Spaced repetition, active recall, and 10 years of NSC exam data power every BrainTrack feature. Learn the research behind South Africa's Grade 12 prep platform.",
    ogUrl: "https://braintrack.co.za/research",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.co.za/" },
        { "@type": "ListItem", "position": 2, "name": "Research", "item": "https://braintrack.co.za/research" },
      ],
    },
  });

  return (
    <div style={{ minHeight: "100vh", background: "#050508", overflowX: "hidden", color: "#fff" }}>
      <style>{`
        @keyframes bt-flow { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        .btr-nav-link { color:#fff; cursor:pointer; transition:color .2s; }
        .btr-nav-link:hover { color:#9FF5E8; }
        .btr-nav-cta { transition: transform .2s; }
        .btr-nav-cta:hover { transform: translateY(-2px); }
        .btr-stat { transition: transform .25s; }
        .btr-stat:hover { transform: translateY(-8px) scale(1.03); }
        .btr-pillar { transition: transform .25s; }
        .btr-pillar:hover { transform: translateY(-8px); }
        .btr-logo-img { transition: transform .25s; }
        .btr-logo-img:hover { transform: scale(1.15) rotate(-4deg); }
        @media (max-width: 860px) {
          .btr-nav-links { display: none !important; }
          .btr-head { font-size: 40px !important; letter-spacing: -1.5px !important; }
          .btr-grid4 { grid-template-columns: repeat(2,1fr) !important; }
          .btr-grid2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .btr-nav { padding: 12px 10px !important; gap: 6px !important; }
          .btr-nav-left { gap: 6px !important; }
          .btr-nav-left img { width: 34px !important; height: 34px !important; }
          .btr-nav-left .bt-wordmark { font-size: 17px !important; }
          .btr-nav-right { gap: 6px !important; }
          .btr-nav-right [data-testid="lang-toggle"] span { padding: 5px 7px !important; }
          .btr-nav-cta { padding: 8px 12px !important; font-size: 12px !important; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <div
        className="btr-nav"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, padding: "16px 48px", position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,5,8,.82)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Link href="/">
          <div className="btr-nav-left" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", minWidth: 0, flex: "none" }}>
            <img src={iconTransparent} alt="BrainTrack" className="btr-logo-img" style={{ width: 56, height: 56, objectFit: "contain", flex: "none" }} />
            <span className="bt-wordmark" style={{ fontSize: 22, letterSpacing: "-.5px" }}>BrainTrack</span>
          </div>
        </Link>
        <div className="btr-nav-right" style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 14, fontWeight: 600, flex: "none" }}>
          <span className="btr-nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Link href="/features"><span className="btr-nav-link">{t.tFeatures}</span></Link>
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
              className="btr-nav-cta"
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
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 32px 100px", position: "relative" }}>
        {/* Floating orbs */}
        <div aria-hidden style={{ position: "absolute", top: -40, left: "8%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(159,216,255,.35),transparent 70%)", filter: "blur(50px)", pointerEvents: "none", animation: "bt-float 9s ease-in-out infinite" }} />
        <div aria-hidden style={{ position: "absolute", top: 120, right: "4%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,183,229,.3),transparent 70%)", filter: "blur(55px)", pointerEvents: "none", animation: "bt-float 11s ease-in-out infinite reverse" }} />
        <div aria-hidden style={{ position: "absolute", top: 60, left: "44%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(197,179,255,.28),transparent 70%)", filter: "blur(50px)", pointerEvents: "none", animation: "bt-glowpulse 6s ease-in-out infinite" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52, position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9FF5E8", border: "1.5px solid rgba(159,245,232,.4)", borderRadius: 999, padding: "8px 18px", marginBottom: 18 }}>
            {t.badge}
          </div>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FD8FF", fontSize: 18, transform: "rotate(-2deg)" }}>{t.eyebrow}</div>
          <div
            role="heading"
            aria-level={1}
            className="btr-head"
            data-testid="text-research-title"
            style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1.02, margin: "8px 0 16px", fontFamily: "'Poppins',sans-serif", color: "#fff" }}
          >
            {t.head1}
            <span
              style={{
                background: RAINBOW_ANIM, backgroundSize: "200% 100%",
                animation: "bt-rainbow 5s linear infinite",
                WebkitBackgroundClip: "text", backgroundClip: "text",
                color: "transparent", WebkitTextFillColor: "transparent",
              }}
            >
              {t.headAccent}
            </span>
          </div>
          <div data-testid="text-research-subtitle" style={{ fontSize: 18, color: "#fff", opacity: 0.94, maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
            {t.sub}
          </div>
        </div>

        {/* Stat cards */}
        <div className="btr-grid4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 44, position: "relative", zIndex: 2 }}>
          {t.stats.map((rs, i) => (
            <div
              key={rs.value}
              className="btr-stat"
              data-testid={`card-stat-${i}`}
              style={{
                background: "linear-gradient(160deg,rgba(255,255,255,.06),rgba(5,5,8,.5))",
                border: `1.5px solid ${rs.color}`, borderRadius: 20,
                padding: "26px 20px", textAlign: "center", boxShadow: `0 10px 34px ${rs.glow}`,
              }}
            >
              <div style={{ fontSize: 44, fontWeight: 900, color: rs.color }}>{rs.value}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", opacity: 0.94, lineHeight: 1.4, marginTop: 6 }}>{rs.label}</div>
            </div>
          ))}
        </div>

        {/* Mark-loss bars */}
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, padding: 32, position: "relative", zIndex: 2 }}>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6, color: "#fff" }}>{t.barsTitle}</div>
          <div style={{ fontSize: 13.5, color: "#fff", opacity: 0.94, marginBottom: 22 }}>{t.barsSub}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {t.bars.map((rb) => (
              <div key={rb.topic}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                  <span style={{ color: "#fff" }}>{rb.topic}</span>
                  <span style={{ color: rb.color }}>{rb.pct}% {t.loseLabel}</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%", width: `${rb.pct}%`, borderRadius: 999,
                      background: `linear-gradient(90deg,${rb.color},${rb.color2})`,
                      transition: "width 1.1s cubic-bezier(.2,.8,.2,1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div style={{ marginTop: 26, background: "linear-gradient(120deg,rgba(159,245,232,.08),rgba(159,216,255,.07))", borderLeft: "3px solid #9FD8FF", borderRadius: "0 16px 16px 0", padding: "24px 30px", fontSize: 16, lineHeight: 1.75, fontStyle: "italic", color: "#fff", position: "relative", zIndex: 2 }}>
          {t.quote}
        </div>

        {/* The science */}
        <div style={{ textAlign: "center", margin: "80px 0 40px", position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFB7E5", fontSize: 18, transform: "rotate(-2deg)" }}>{t.sciEyebrow}</div>
          <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1.5px", color: "#fff" }}>
            {t.sciHead1}
            <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
              {t.sciAccent}
            </span>
          </div>
          <div style={{ fontSize: 16, color: "#fff", opacity: 0.94, maxWidth: 620, margin: "12px auto 0", lineHeight: 1.6 }}>{t.sciSub}</div>
        </div>

        {/* Pillar cards */}
        <div className="btr-grid2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 22, position: "relative", zIndex: 2 }}>
          {t.pillars.map((rp, i) => (
            <div
              key={rp.tag}
              className="btr-pillar"
              data-testid={`card-pillar-${i}`}
              style={{
                background: "linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.015))",
                border: `1px solid ${rp.color}`, borderRadius: 22, padding: 30,
                boxShadow: `0 10px 34px ${rp.glow}`, position: "relative", overflow: "hidden",
                animation: "bt-fadeup .6s ease-out both",
              }}
            >
              <div aria-hidden style={{ position: "absolute", top: -30, right: -10, fontSize: 120, fontWeight: 900, color: rp.color, opacity: 0.08, lineHeight: 1, pointerEvents: "none" }}>
                {rp.emoji}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, flex: "none", borderRadius: 16, background: rp.chipBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                  {rp.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: rp.color }}>{rp.tag}</div>
                  <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-.5px", color: "#fff" }}>{rp.title}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.65, color: "#fff", opacity: 0.9, marginBottom: 16 }}>{rp.body}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {rp.chips.map((pc) => (
                  <span key={pc} style={{ fontSize: 12, fontWeight: 700, color: rp.color, border: `1.5px solid ${rp.color}`, borderRadius: 999, padding: "6px 12px" }}>
                    {pc}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Research model */}
        <div style={{ marginTop: 56, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: 36, textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-.5px", marginBottom: 26, color: "#fff" }}>{t.modelTitle}</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 24 }}>
            {t.inputs.map((ri, i) => (
              <span key={ri.label} style={{ display: "contents" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: ri.color, border: `1.5px solid ${ri.color}`, borderRadius: 10, padding: "10px 16px" }}>
                  {ri.label}
                </span>
                {i < t.inputs.length - 1 && (
                  <span style={{ color: "#fff", opacity: 0.5, fontWeight: 900, fontSize: 16 }}>+</span>
                )}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 26, color: "#9FF5E8", fontWeight: 900, marginBottom: 20 }}>↓</div>
          <div style={{ height: 6, borderRadius: 999, background: FLOW_GRADIENT, backgroundSize: "300% 100%", animation: "bt-flow 4s linear infinite", marginBottom: 24 }} />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {t.outputs.map((ro) => (
              <span key={ro.label} style={{ fontSize: 13.5, fontWeight: 800, color: "#050508", background: `linear-gradient(100deg,${ro.c1},${ro.c2})`, borderRadius: 999, padding: "10px 18px" }}>
                {ro.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
