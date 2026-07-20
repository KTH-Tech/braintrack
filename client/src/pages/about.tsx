// BrainTrack about — restyled to the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp. Sticky blur nav (per features.tsx),
// marker eyebrow, gradient headline, neon panels, own footer per the comp.
// Bilingual EN/AF. RESTYLE ONLY — copy, testids and routes preserved.
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";
import {
  BookOpen,
  Brain,
  Target,
  Shield,
  ArrowRight,
  BarChart3,
  Users,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import { Link } from "wouter";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

const CTA_GRADIENT =
  "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const HEADLINE_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)";

const t = {
  en: {
    title: "About BrainTrack",
    tagline: "South Africa's Grade 12 Platform",
    heroSub: "Smarter Learning. Real Results.",
    p1: "BrainTrack™ is a South African Grade 12 Matric exam preparation platform designed for CAPS-aligned revision. It combines NSC past exam papers, official-style memos, and a structured weekly revision plan to help learners track progress, find content gaps, and improve exam technique.",
    p2: "Whether you’re preparing for Matric prelims or final NSC exams, BrainTrack™ provides a clear path from “not sure” to “exam-ready.” Every question, every lesson, and every study plan is designed to prepare learners for exactly what they will face in their exams.",
    p3: "We believe every South African learner deserves access to smart, affordable exam preparation. That is why Brain Boost — our core learning engine — is available for just R169/month, with no long-term commitment. Parents can track their child’s progress, and schools can partner with us through our Future Ready Schools programme.",
    missionTitle: "Our Mission",
    missionDesc: "To empower South African learners with strategic, science-backed study tools that turn effort into results. We are building the future of exam preparation — one learner at a time.",
    f1Title: "Learning Science",
    f1Desc: "Every feature is grounded in proven educational research. Spaced repetition, adaptive difficulty, and targeted revision — all working together.",
    f2Title: "Real Exam Patterns",
    f2Desc: "We study 10 years of NSC exam data to identify what gets tested, how it gets tested, and where learners commonly lose marks.",
    f3Title: "CAPS-Aligned Only",
    f3Desc: "100% curriculum coverage. No guessing, no off-topic content. Every question maps directly to CAPS assessment standards.",
    f4Title: "South African Focus",
    f4Desc: "Built specifically for the South African education system. Available in English and Afrikaans, designed for local learners.",
    whyTitle: "What Makes BrainTrack Different",
    why1: "Built on 10 years of real exam pattern data",
    why2: "Powered by learning science, not just content delivery",
    why3: "Personalised study plans that adapt daily",
    why4: "Instant marking with clear, actionable feedback",
    why5: "Gamified progress with XP, levels, and badges",
    why6: "Rizz — a smart support agent to keep learners on track",
    why7: "Mobile-first, teen-friendly design with theme options",
    why8: "Affordable at R169/month with optional power-ups",
    schoolsTitle: "Future Ready Schools",
    schoolsDesc: "We partner with schools across South Africa to boost exam performance, track learner progress digitally, and support targeted intervention. Smarter learners, stronger results.",
    popia: "Your data is protected under POPIA (Protection of Personal Information Act, 2013). We only collect information necessary for learning and never share it with third parties.",
    cta: "Start Learning Smarter",
    ctaLoggedIn: "Go to My Classroom",
    tResearch: "Research",
    tEnter: "Enter the app →",
    privacyTitle: "Privacy & Security",
    footMade: "© 2026 — Made in South Africa",
    footPrivacy: "Privacy",
    footTerms: "Terms",
    footPopia: "POPIA",
    footBilling: "Billing",
  },
  af: {
    title: "Oor BrainTrack",
    tagline: "Suid-Afrika se Graad 12 Platform",
    heroSub: "Slimmer Leer. Regte Resultate.",
    p1: "BrainTrack™ is 'n Suid-Afrikaanse Graad 12 Matriek eksamenvoorbereidingsplatform vir KABV-belynde hersiening. Dit kombineer NSC vorige eksamenvraestelle, memo-ondersteuning en 'n gestruktureerde weeklikse hersieningsplan om leerders te help om vordering te volg, inhoud-leemtes te identifiseer, en eksamentegniek te verbeter.",
    p2: "Of dit nou vir voorlopige eksamens of die finale NSC is — BrainTrack™ gee 'n duidelike, praktiese pad na beter punte. Elke vraag, elke les, en elke studieplan is ontwerp om leerders voor te berei vir presies wat hulle in hul eksamens sal teekom.",
    p3: "Ons glo elke Suid-Afrikaanse leerder verdien toegang tot slim, bekostigbare eksamenvoorbereiding. Daarom is Brain Boost — ons kern leer-enjin — beskikbaar vir slegs R169/maand, sonder langtermyn-verpligting. Ouers kan hul kind se vordering volg, en skole kan met ons vennoot deur ons Future Ready Schools-program.",
    missionTitle: "Ons Missie",
    missionDesc: "Om Suid-Afrikaanse leerders te bemagtig met strategiese, wetenskaplik-ondersteunde studiegereedskap wat inspanning in resultate omskep. Ons bou die toekoms van eksamenvoorbereiding — een leerder op 'n slag.",
    f1Title: "Leerwetenskap",
    f1Desc: "Elke kenmerk is gegrond op bewese opvoedkundige navorsing. Gespasieerde herhaling, aanpasbare moeilikheidsgraad, en geteikende hersiening — alles werk saam.",
    f2Title: "Regte Eksamenpatrone",
    f2Desc: "Ons bestudeer 10 jaar se NSC-eksamendata om te identifiseer wat getoets word, hoe dit getoets word, en waar leerders algemeen punte verloor.",
    f3Title: "Slegs KABV-Belyn",
    f3Desc: "100% kurrikulum-dekking. Geen raaiwerk, geen irrelevante inhoud nie. Elke vraag karteer direk na KABV-assesseringstandaarde.",
    f4Title: "Suid-Afrikaanse Fokus",
    f4Desc: "Spesifiek gebou vir die Suid-Afrikaanse onderwysstelsel. Beskikbaar in Engels en Afrikaans, ontwerp vir plaaslike leerders.",
    whyTitle: "Wat Maak BrainTrack Anders",
    why1: "Gebou op 10 jaar se werklike eksamenpatroondata",
    why2: "Aangedryf deur leerwetenskap, nie net inhoudlewering nie",
    why3: "Persoonlike studieplanne wat daagliks aanpas",
    why4: "Onmiddellike nasien met duidelike, uitvoerbare terugvoer",
    why5: "Spelagtige vordering met XP, vlakke en kentekens",
    why6: "Rizz — 'n slim ondersteuningsagent om leerders op koers te hou",
    why7: "Mobiel-eerste, tienervriendelike ontwerp met tema-opsies",
    why8: "Bekostigbaar teen R169/maand met opsionele krag-opgradings",
    schoolsTitle: "Future Ready Schools",
    schoolsDesc: "Ons vennoot met skole regoor Suid-Afrika om eksamenprestasie te verhoog, leerdervordering digitaal te volg, en geteikende ingryping te ondersteun. Slimmer leerders, sterker resultate.",
    popia: "Jou data word beskerm volgens die POPIA-wet (Wet op Beskerming van Persoonlike Inligting, 2013). Ons versamel slegs inligting wat nodig is vir leer en deel dit nooit met derde partye nie.",
    cta: "Begin Slimmer Leer",
    ctaLoggedIn: "My Klaskamer",
    tResearch: "Navorsing",
    tEnter: "Betree die app →",
    privacyTitle: "Privaatheid & Sekuriteit",
    footMade: "© 2026 — Gemaak in Suid-Afrika",
    footPrivacy: "Privaatheid",
    footTerms: "Bepalings",
    footPopia: "POPIA",
    footBilling: "Betaling",
  },
};

// Pastel accent cycle per the comp.
const pillars = [
  { icon: Brain,     titleKey: "f1Title" as const, descKey: "f1Desc" as const, color: "#9FF5E8", chipBg: "rgba(159,245,232,.14)", glow: "rgba(159,245,232,.25)", tilt: -1 },
  { icon: BarChart3, titleKey: "f2Title" as const, descKey: "f2Desc" as const, color: "#9FD8FF", chipBg: "rgba(159,216,255,.14)", glow: "rgba(159,216,255,.25)", tilt: 1 },
  { icon: BookOpen,  titleKey: "f3Title" as const, descKey: "f3Desc" as const, color: "#94F7C5", chipBg: "rgba(148,247,197,.14)", glow: "rgba(148,247,197,.25)", tilt: -1 },
  { icon: Target,    titleKey: "f4Title" as const, descKey: "f4Desc" as const, color: "#FFB7E5", chipBg: "rgba(255,183,229,.14)", glow: "rgba(255,183,229,.25)", tilt: 1 },
];

const WHY_COLORS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5", "#9FF5E8", "#FFB7E5"];

const whyPoints = ["why1", "why2", "why3", "why4", "why5", "why6", "why7", "why8"] as const;

const aboutBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.co.za/" },
    { "@type": "ListItem", "position": 2, "name": "About", "item": "https://braintrack.co.za/about" },
  ],
};

// Executive panel chrome shared by the content cards.
const panelStyle: React.CSSProperties = {
  background: "linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.015))",
  border: "1px solid rgba(255,255,255,.09)",
  borderRadius: 22,
  padding: 28,
  textAlign: "left",
};

export default function AboutPage() {
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();
  useSEO({
    title: "About BrainTrack™ | Grade 12 CAPS Matric Revision Platform",
    description: "BrainTrack™ is South Africa's Grade 12 Matric exam prep platform — CAPS-aligned weekly plans, 10 years of NSC past papers with memos, AI tutor, and progress tracking.",
    canonical: "https://braintrack.co.za/about",
    ogTitle: "About BrainTrack™ — South Africa's Grade 12 Matric Prep Platform",
    ogDescription: "BrainTrack™ combines CAPS-aligned weekly plans, 10 years of NSC past papers, AI tutor Rizz, and progress tracking to help Grade 12 learners improve Matric marks.",
    ogUrl: "https://braintrack.co.za/about",
    jsonLd: aboutBreadcrumb,
  });
  const c = t[language];
  const en = language === "en";

  const ctaHref = isAuthenticated ? "/classroom" : "/subscribe";
  const ctaLabel = isAuthenticated ? c.ctaLoggedIn : c.cta;

  return (
    <div style={{ minHeight: "100vh", background: "#050508", overflowX: "hidden", color: "#fff" }}>
      <style>{`
        .bta-nav-link { color:#fff; cursor:pointer; transition:color .2s; }
        .bta-nav-link:hover { color:#9FD8FF; }
        .bta-nav-cta { transition: transform .2s; }
        .bta-nav-cta:hover { transform: translateY(-2px); }
        .bta-cta { transition: transform .2s; }
        .bta-cta:hover { transform: translateY(-3px); }
        .bta-panel { transition: transform .25s, box-shadow .25s, border-color .25s; }
        .bta-panel:hover { transform: translateY(-8px) rotate(var(--tilt, 0deg)); box-shadow: 0 20px 50px var(--glow); border-color: var(--c) !important; }
        .bta-logo-img { transition: transform .25s; }
        .bta-logo-img:hover { transform: scale(1.15) rotate(-4deg); }
        .bta-foot-link { color:#fff; cursor:pointer; transition:color .2s; }
        .bta-foot-link:hover { color: var(--h, #9FD8FF); }
        @media (max-width: 860px) {
          .bta-nav-links { display: none !important; }
          .bta-head { font-size: 38px !important; letter-spacing: -1px !important; }
          .bta-grid2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .bta-nav { padding: 12px 14px !important; gap: 10px !important; }
          .bta-nav-left { gap: 8px !important; }
          .bta-nav-left img { width: 40px !important; height: 40px !important; }
          .bta-nav-right { gap: 10px !important; }
          .bta-nav-cta { padding: 9px 16px !important; font-size: 13px !important; }
        }
      `}</style>

      {/* ── Nav (per features.tsx) ──────────────────────────── */}
      <div
        className="bta-nav"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, padding: "16px 48px", position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,5,8,.82)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Link href="/">
          <div className="bta-nav-left" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", minWidth: 0, flex: "none" }}>
            <img src={iconTransparent} alt="BrainTrack" className="bta-logo-img" style={{ width: 56, height: 56, objectFit: "contain", flex: "none" }} />
            <span className="bt-wordmark" style={{ fontSize: 22, letterSpacing: "-.5px" }}>BrainTrack</span>
          </div>
        </Link>
        <div className="bta-nav-right" style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 14, fontWeight: 600, flex: "none" }}>
          <span className="bta-nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Link href="/research"><span className="bta-nav-link">{c.tResearch}</span></Link>
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
              className="bta-nav-cta"
              data-testid="button-nav-enter"
              style={{
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14,
                color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                animation: "bt-rainbow 6s linear infinite", border: "none",
                borderRadius: 10, padding: "11px 24px", whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {c.tEnter}
            </button>
          </a>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <main style={{ position: "relative", maxWidth: 980, margin: "0 auto", padding: "64px 32px 40px" }}>
        <div
          aria-hidden
          style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 860, height: 420, maxWidth: "100vw",
            background: "radial-gradient(ellipse,rgba(255,183,229,.07),rgba(159,216,255,.04) 55%,transparent 75%)",
            filter: "blur(30px)", pointerEvents: "none",
          }}
        />

        {/* Hero */}
        <div style={{ position: "relative", textAlign: "center", marginBottom: 52 }}>
          <div
            data-testid="text-about-tagline"
            style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8", fontSize: 18, transform: "rotate(-2deg)" }}
          >
            {c.tagline}
          </div>
          <div
            role="heading"
            aria-level={1}
            className="bta-head"
            data-testid="text-about-title"
            style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", margin: "8px 0 14px", fontFamily: "'Poppins',sans-serif", color: "#fff" }}
          >
            <span
              style={{
                background: HEADLINE_GRADIENT,
                WebkitBackgroundClip: "text", backgroundClip: "text",
                color: "transparent", WebkitTextFillColor: "transparent",
              }}
            >
              {c.title}
            </span>
          </div>
          <div data-testid="text-about-hero-sub" style={{ fontSize: 17, color: "#fff", opacity: 0.94, maxWidth: 640, margin: "0 auto", lineHeight: 1.6, fontWeight: 500 }}>
            {c.heroSub}
          </div>
        </div>

        {/* Story */}
        <section data-testid="card-about-description" style={{ ...panelStyle, marginBottom: 26, overflow: "hidden", position: "relative" }}>
          <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: CTA_GRADIENT }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15.5, lineHeight: 1.7, color: "#fff" }}>
            <p data-testid="text-about-p1" style={{ margin: 0 }}>{c.p1}</p>
            <p data-testid="text-about-p2" style={{ margin: 0 }}>{c.p2}</p>
            <p data-testid="text-about-p3" style={{ margin: 0 }}>{c.p3}</p>
          </div>
        </section>

        {/* Mission */}
        <section data-testid="card-mission" style={{ ...panelStyle, marginBottom: 26, textAlign: "center", background: "linear-gradient(150deg,rgba(159,216,255,.1),rgba(255,183,229,.08))", border: "1.5px solid rgba(159,216,255,.3)", boxShadow: "0 0 18px rgba(159,216,255,.08)" }}>
          <GraduationCap style={{ width: 34, height: 34, color: "#9FF5E8", margin: "0 auto 10px", display: "block" }} />
          <div role="heading" aria-level={2} data-testid="text-mission-title" style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.5px", marginBottom: 10 }}>
            <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
              {c.missionTitle}
            </span>
          </div>
          <p data-testid="text-mission-desc" style={{ fontSize: 15.5, lineHeight: 1.7, color: "#fff", maxWidth: 640, margin: "0 auto" }}>
            {c.missionDesc}
          </p>
        </section>

        {/* Pillars */}
        <div className="bta-grid2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24, marginBottom: 26 }}>
          {pillars.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bta-panel"
                data-testid={`card-pillar-${i}`}
                style={{
                  "--tilt": `${f.tilt}deg`, "--glow": f.glow, "--c": f.color,
                  ...panelStyle, cursor: "default",
                } as React.CSSProperties}
              >
                <div style={{ width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: f.chipBg, boxShadow: `0 0 22px ${f.glow}`, marginBottom: 18 }}>
                  <Icon style={{ width: 24, height: 24, color: f.color }} />
                </div>
                <div role="heading" aria-level={3} data-testid={`text-pillar-title-${i}`} style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#fff" }}>
                  {c[f.titleKey]}
                </div>
                <div data-testid={`text-pillar-desc-${i}`} style={{ fontSize: 13.5, lineHeight: 1.6, color: "#fff", opacity: 0.94 }}>
                  {c[f.descKey]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Why different */}
        <section data-testid="card-why-different" style={{ ...panelStyle, marginBottom: 26 }}>
          <div role="heading" aria-level={2} data-testid="text-why-title" style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-.5px", textAlign: "center", marginBottom: 22 }}>
            <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
              {c.whyTitle}
            </span>
          </div>
          <div className="bta-grid2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {whyPoints.map((key, i) => (
              <div key={i} data-testid={`text-why-point-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <CheckCircle style={{ width: 20, height: 20, color: WHY_COLORS[i % WHY_COLORS.length], flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: "#fff", fontWeight: 500, fontSize: 14.5, lineHeight: 1.55 }}>{c[key as keyof typeof c]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Schools */}
        <section data-testid="card-schools" style={{ ...panelStyle, marginBottom: 26, display: "flex", alignItems: "flex-start", gap: 18, borderLeft: "3px solid #9FD8FF" }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(159,216,255,.14)", boxShadow: "0 0 22px rgba(159,216,255,.25)", flexShrink: 0 }}>
            <Users style={{ width: 22, height: 22, color: "#9FD8FF" }} />
          </div>
          <div>
            <p data-testid="text-schools-title" style={{ fontWeight: 800, fontSize: 17, color: "#9FD8FF", margin: "0 0 6px" }}>{c.schoolsTitle}</p>
            <p data-testid="text-schools-desc" style={{ fontSize: 14.5, lineHeight: 1.65, color: "#fff", margin: 0 }}>{c.schoolsDesc}</p>
          </div>
        </section>

        {/* POPIA */}
        <section data-testid="card-popia-notice" style={{ ...panelStyle, marginBottom: 40, display: "flex", alignItems: "flex-start", gap: 18, borderLeft: "3px solid #94F7C5" }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(148,247,197,.14)", boxShadow: "0 0 22px rgba(148,247,197,.25)", flexShrink: 0 }}>
            <Shield style={{ width: 22, height: 22, color: "#94F7C5" }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 17, color: "#94F7C5", margin: "0 0 6px" }}>{c.privacyTitle}</p>
            <p data-testid="text-popia-notice" style={{ fontSize: 14.5, lineHeight: 1.65, color: "#fff", margin: 0 }}>{c.popia}</p>
          </div>
        </section>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <Link href={ctaHref} data-testid="link-signup-child">
            <button
              className="bta-cta"
              style={{
                fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16,
                color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                animation: "bt-rainbow 5s linear infinite", border: "none",
                borderRadius: 10, padding: "16px 40px", whiteSpace: "nowrap",
                cursor: "pointer", boxShadow: "0 0 30px rgba(255,183,229,.4)",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              {ctaLabel}
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </Link>
        </div>
      </main>

      {/* ── Footer (own footer per the comp) ────────────────── */}
      <div style={{ marginTop: 70, borderTop: "1px solid rgba(255,255,255,.08)", padding: "44px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={iconTransparent} alt="" style={{ width: 52, height: 52, objectFit: "contain" }} />
          <span className="bt-wordmark" style={{ fontSize: 16, letterSpacing: "-.5px" }}>BrainTrack</span>
          <span style={{ fontSize: 14, color: "#fff", marginLeft: 10 }}>{c.footMade}</span>
        </div>
        <div style={{ display: "flex", gap: 26, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
          <Link href="/privacy-policy"><span className="bta-foot-link" style={{ "--h": "#9FD8FF" } as React.CSSProperties}>{c.footPrivacy}</span></Link>
          <Link href="/terms-of-service"><span className="bta-foot-link" style={{ "--h": "#FFB7E5" } as React.CSSProperties}>{c.footTerms}</span></Link>
          <Link href="/privacy-policy"><span className="bta-foot-link" style={{ "--h": "#C5B3FF" } as React.CSSProperties}>{c.footPopia}</span></Link>
          <Link href="/refund-policy"><span className="bta-foot-link" style={{ "--h": "#FFE29A" } as React.CSSProperties}>{c.footBilling}</span></Link>
        </div>
      </div>
    </div>
  );
}
