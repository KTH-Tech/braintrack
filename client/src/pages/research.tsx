// BrainTrack research — pure-black street-graffiti evidence page.
// Learner-first: the proof that BrainTrack targets the exact topics the DBE
// flags, so a matric can trust every drill, plan and memo. Shared PublicNav +
// PublicFooter shell, sticker stat/evidence cards, hard-offset shadows only,
// no grey text, no glow. Bilingual EN/AF (AF preserved).
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const WORDMARK_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#94F7C5,#FFE29A,#FFB7E5,#C5B3FF)";
const FLOW_GRADIENT =
  "linear-gradient(90deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)";

const COPY = {
  en: {
    badge: "🔬 Evidence-based · peer-reviewed principles",
    head1: "Built on ",
    headAccent: "10 years of real DBE exams",
    sub:
      "We analysed a decade of official NSC papers (2015–2025) and mapped every question to its CAPS topic — so we know exactly which topics get examined again and again, and built every drill, plan and memo around them.",
    stats: [
      { value: "80%", label: "Long-term recall with spaced practice vs 20% cramming", color: "#9FF5E8" },
      { value: "3×", label: "Better retention from active recall vs re-reading", color: "#FFB7E5" },
      { value: "160k+", label: "Real NSC exam questions mapped to CAPS topics", color: "#FFE29A" },
      { value: "10 yrs", label: "Of real NSC papers analysed, 2015–2025", color: "#9FD8FF" },
    ],
    barsTitle: "Exam patterns repeat",
    barsSub: "Relative exam-frequency of recurring CAPS topics, from a decade of real NSC papers — the high-frequency topics BrainTrack trains you on first.",
    bars: [
      { topic: "Functions & graphs — Maths", freq: "Every paper, every year", pct: 100, color: "#FFB7E5", color2: "#C5B3FF" },
      { topic: "Financial statements — Accounting", freq: "Every year", pct: 94, color: "#94F7C5", color2: "#9FF5E8" },
      { topic: "Electrochemistry — Physical Sciences", freq: "Almost every year", pct: 88, color: "#9FF5E8", color2: "#9FD8FF" },
      { topic: "Essay & comprehension — Languages", freq: "Every paper", pct: 96, color: "#FFE29A", color2: "#FFB7E5" },
      { topic: "Data handling — Maths", freq: "Most years", pct: 80, color: "#9FD8FF", color2: "#C5B3FF" },
    ],
    rizz: {
      eyebrow: "meet rizz",
      title: "Rizz — your AI tutor",
      body: "Rizz is BrainTrack's AI tutor: fluent in English and Afrikaans, awake 24/7. Grounded in 10 years of real NSC exam patterns, Rizz doesn't just hand you the answer — it explains what the examiner is actually asking for, walks you through it until it clicks, and keeps adapting to the exact topics where you keep slipping.",
      chips: ["Bilingual EN + AF", "24/7", "Grounded in real exam patterns", "Explains examiner intent", "Adapts to your weak spots"],
    },
    quote:
      "“Most apps hand you generic content. BrainTrack targets the exact topics the DBE flags year after year — so every minute you revise goes where it actually moves your mark.”",
    sciEyebrow: "the science",
    sciHead1: "Four disciplines, ",
    sciAccent: "one ecosystem",
    sciSub:
      "The magic isn't any one feature — it's how proven learning science, game-style motivation, real exam data and examiner intent pull together behind every question you practise.",
    pillars: [
      {
        emoji: "🧠", color: "#9FF5E8",
        tag: "Learning science", title: "Study methods that stick",
        body: "Spaced practice beats cramming (80% vs 20% recall) and testing yourself beats re-reading 3× over. Every drill, plan and review cycle is built on these peer-reviewed principles.",
        chips: ["Spaced repetition", "Retrieval practice", "Interleaving", "Worked examples"],
      },
      {
        emoji: "🎮", color: "#FFB7E5",
        tag: "Behavioural psychology", title: "Dopamine, but productive",
        body: "Streaks build daily habits, XP makes progress visible, and reward reveals keep you coming back. The same mechanics games use — pointed straight at your matric marks.",
        chips: ["Streaks", "XP", "Variable rewards", "Loss aversion"],
      },
      {
        emoji: "📊", color: "#9FD8FF",
        tag: "Data analytics", title: "Diagnosis before drills",
        body: "Ten years of DBE diagnostics show where marks are lost nationally; your own answers show where you lose them. Your plan targets the overlap — with real examiner intent baked in.",
        chips: ["DBE diagnostics", "Weak-spot detection", "Cohort trends", "Examiner intent"],
      },
      {
        emoji: "🏫", color: "#C5B3FF",
        tag: "Parents & schools", title: "Backed by the people around you",
        body: "Parents get weekly visibility, teachers see cohort weak spots, and your school gets clean reports — all POPIA-aware by design, so the support around you actually shows up.",
        chips: ["Parent reports", "Teacher dashboards", "Cohort insights", "POPIA"],
      },
    ],
    modelTitle: "The BrainTrack research model",
    inputs: [
      { label: "10 yrs DBE diagnostics", color: "#9FD8FF" },
      { label: "CAPS curriculum", color: "#9FF5E8" },
      { label: "Real NSC papers", color: "#FFE29A" },
      { label: "Learning science", color: "#FFB7E5" },
      { label: "Behavioural design", color: "#C5B3FF" },
    ],
    outputs: [
      { label: "Personal study plan", c1: "#9FD8FF", c2: "#9FF5E8" },
      { label: "Weak-spot drills", c1: "#FFB7E5", c2: "#C5B3FF" },
      { label: "Parent reports", c1: "#FFE29A", c2: "#FFB7E5" },
      { label: "Exam readiness", c1: "#C5B3FF", c2: "#9FD8FF" },
    ],
    ctaHead: "Ready to put the evidence to work?",
    ctaBtn: "See plans — from R169",
  },
  af: {
    badge: "🔬 Bewysgebaseer · eweknie-beoordeelde beginsels",
    head1: "Gebou op ",
    headAccent: "10 jaar se regte DBE-eksamens",
    sub:
      "Ons het 'n dekade se amptelike NSS-vraestelle (2015–2025) ontleed en elke vraag aan sy KABV-onderwerp gekoppel — so weet ons presies watter onderwerpe keer op keer geëksamineer word, en het elke oefening, plan en memo daarom gebou.",
    stats: [
      { value: "80%", label: "Langtermyn-herroeping met gespasieerde oefening vs 20% inkramming", color: "#9FF5E8" },
      { value: "3×", label: "Beter retensie deur aktiewe herroeping vs herlees", color: "#FFB7E5" },
      { value: "160k+", label: "Regte NSS-eksamenvrae aan KABV-onderwerpe gekoppel", color: "#FFE29A" },
      { value: "10 jr", label: "Se regte NSS-vraestelle ontleed, 2015–2025", color: "#9FD8FF" },
    ],
    barsTitle: "Die patrone herhaal",
    barsSub: "Relatiewe eksamenfrekwensie van herhalende KABV-onderwerpe, uit 'n dekade se regte NSS-vraestelle — die hoëfrekwensie-onderwerpe waarop BrainTrack jou eerste oefen.",
    bars: [
      { topic: "Funksies & grafieke — Wiskunde", freq: "Elke vraestel, elke jaar", pct: 100, color: "#FFB7E5", color2: "#C5B3FF" },
      { topic: "Finansiële state — Rekeningkunde", freq: "Elke jaar", pct: 94, color: "#94F7C5", color2: "#9FF5E8" },
      { topic: "Elektrochemie — Fisiese Wetenskappe", freq: "Byna elke jaar", pct: 88, color: "#9FF5E8", color2: "#9FD8FF" },
      { topic: "Opstel & begrip — Tale", freq: "Elke vraestel", pct: 96, color: "#FFE29A", color2: "#FFB7E5" },
      { topic: "Datahantering — Wiskunde", freq: "Meeste jare", pct: 80, color: "#9FD8FF", color2: "#C5B3FF" },
    ],
    rizz: {
      eyebrow: "ontmoet rizz",
      title: "Rizz — jou KI-tutor",
      body: "Rizz is BrainTrack se KI-tutor: vlot in Engels én Afrikaans, wakker 24/7. Gegrond in 10 jaar se regte NSS-eksamenpatrone, gee Rizz jou nie sommer net die antwoord nie — dit verduidelik wat die eksaminator werklik vra, lei jou daardeur totdat dit klik, en pas gedurig aan by die presiese onderwerpe waar jy bly struikel.",
      chips: ["Tweetalig EN + AF", "24/7", "Gegrond in regte eksamenpatrone", "Verduidelik eksaminatorbedoeling", "Pas aan by jou swakplekke"],
    },
    quote:
      "“Die meeste apps gee jou generiese inhoud. BrainTrack teiken die presiese onderwerpe wat die DBE jaar na jaar uitwys — sodat elke minuut wat jy hersien gaan waar dit werklik jou punt skuif.”",
    sciEyebrow: "die wetenskap",
    sciHead1: "Vier dissiplines, ",
    sciAccent: "een ekosisteem",
    sciSub:
      "Die towerkrag is nie enige een funksie nie — dit is hoe bewese leerwetenskap, speletjie-styl motivering, regte eksamendata en eksaminatorbedoeling saam agter elke vraag wat jy oefen intrek.",
    pillars: [
      {
        emoji: "🧠", color: "#9FF5E8",
        tag: "Leerwetenskap", title: "Studiemetodes wat vassit",
        body: "Gespasieerde oefening klop inkramming (80% vs 20% herroeping) en jouself toets klop herlees 3× oor. Elke oefening, plan en hersieningsiklus is op hierdie eweknie-beoordeelde beginsels gebou.",
        chips: ["Gespasieerde herhaling", "Herroepingsoefening", "Afwisseling", "Uitgewerkte voorbeelde"],
      },
      {
        emoji: "🎮", color: "#FFB7E5",
        tag: "Gedragsielkunde", title: "Dopamien, maar produktief",
        body: "Reekse bou daaglikse gewoontes, XP maak vordering sigbaar, en beloningsonthullings hou jou aan die kom. Dieselfde meganika wat speletjies gebruik — reguit op jou matriekpunte gemik.",
        chips: ["Reekse", "XP", "Wisselende belonings", "Verliesvermyding"],
      },
      {
        emoji: "📊", color: "#9FD8FF",
        tag: "Data-analise", title: "Diagnose voor drille",
        body: "Tien jaar se DBE-diagnostiek wys waar punte nasionaal verloor word; jou eie antwoorde wys waar jy hulle verloor. Jou plan teiken die oorvleueling — met regte eksaminatorbedoeling ingebak.",
        chips: ["DBE-diagnostiek", "Swakplek-opsporing", "Kohort-neigings", "Eksaminatorbedoeling"],
      },
      {
        emoji: "🏫", color: "#C5B3FF",
        tag: "Ouers & skole", title: "Gerugsteun deur die mense om jou",
        body: "Ouers kry weeklikse sigbaarheid, onderwysers sien kohort-swakplekke, en jou skool kry skoon verslae — alles POPIA-bewus van ontwerp, sodat die ondersteuning om jou werklik opdaag.",
        chips: ["Ouerverslae", "Onderwyser-paneelborde", "Kohort-insig", "POPIA"],
      },
    ],
    modelTitle: "Die BrainTrack-navorsingsmodel",
    inputs: [
      { label: "10 jr DBE-diagnostiek", color: "#9FD8FF" },
      { label: "KABV-kurrikulum", color: "#9FF5E8" },
      { label: "Regte NSS-vraestelle", color: "#FFE29A" },
      { label: "Leerwetenskap", color: "#FFB7E5" },
      { label: "Gedragsontwerp", color: "#C5B3FF" },
    ],
    outputs: [
      { label: "Persoonlike studieplan", c1: "#9FD8FF", c2: "#9FF5E8" },
      { label: "Swakplek-drille", c1: "#FFB7E5", c2: "#C5B3FF" },
      { label: "Ouerverslae", c1: "#FFE29A", c2: "#FFB7E5" },
      { label: "Eksamengereedheid", c1: "#C5B3FF", c2: "#9FD8FF" },
    ],
    ctaHead: "Gereed om die bewyse aan die werk te sit?",
    ctaBtn: "Sien planne — vanaf R169",
  },
} as const;

export default function ResearchPage() {
  const { language } = useLanguage();
  const t = COPY[language];

  useSEO({
    title: "Research | BrainTrack™ Learning Science Behind Grade 12 Matric Prep",
    description: "BrainTrack™ is built on spaced repetition, active recall and 10 years of real NSC exam patterns. Discover the learning science powering CAPS-aligned Matric preparation.",
    canonical: "https://braintrack.tech/research",
    ogTitle: "The Science Behind BrainTrack™ — Why It Improves Matric Marks",
    ogDescription: "Spaced repetition, active recall, and 10 years of NSC exam data power every BrainTrack feature. Learn the research behind South Africa's Grade 12 prep platform.",
    ogUrl: "https://braintrack.tech/research",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Research", "item": "https://braintrack.tech/research" },
      ],
    },
  });

  return (
    <div className="min-h-screen" style={{ background: "#050508", color: "#fff", overflowX: "hidden" }} data-testid="page-research">
      <PublicNav />

      <main style={{ paddingTop: 64 }}>
        <style>{`
          @keyframes bt-flow { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
          .btr-sticker { transition: transform .18s ease; }
          .btr-sticker:hover { transform: translate(-3px,-3px); }
          .btr-grid4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
          .btr-grid2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
          @media (max-width: 820px) {
            .btr-grid4 { grid-template-columns: repeat(2,1fr); }
            .btr-grid2 { grid-template-columns: 1fr; }
          }
        `}</style>

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px 96px" }}>

          {/* ── Header ─────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div
              style={{
                display: "inline-block", fontSize: 12, fontWeight: 900,
                letterSpacing: "1px", textTransform: "uppercase", color: "#050508",
                background: "#94F7C5", border: "2.5px solid #050508",
                boxShadow: "5px 5px 0 0 #94F7C5", borderRadius: 999,
                padding: "9px 18px", marginBottom: 22, transform: "rotate(-1deg)",
              }}
            >
              {t.badge}
            </div>
            <h1
              data-testid="text-research-title"
              style={{
                fontSize: "clamp(34px,8vw,64px)", fontWeight: 900,
                letterSpacing: "-2px", lineHeight: 1.03, margin: "10px 0 16px",
                fontFamily: "'Poppins',sans-serif", color: "#fff",
              }}
            >
              {t.head1}
              <span
                style={{
                  backgroundImage: WORDMARK_GRADIENT,
                  WebkitBackgroundClip: "text", backgroundClip: "text",
                  color: "transparent", WebkitTextFillColor: "transparent",
                }}
              >
                {t.headAccent}
              </span>
            </h1>
            <p data-testid="text-research-subtitle" style={{ fontSize: "clamp(15px,2.4vw,18px)", color: "#fff", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
              {t.sub}
            </p>
          </div>

          {/* ── Stat sticker cards ─────────────────────────────── */}
          <div className="btr-grid4" style={{ marginBottom: 48 }}>
            {t.stats.map((rs, i) => (
              <div
                key={rs.value}
                className="btr-sticker"
                data-testid={`card-stat-${i}`}
                style={{
                  background: "#050508", border: `2.5px solid ${rs.color}`,
                  boxShadow: `6px 6px 0 0 ${rs.color}`, borderRadius: 18,
                  padding: "24px 18px", textAlign: "center",
                }}
              >
                <div style={{ fontSize: "clamp(34px,6vw,44px)", fontWeight: 900, color: rs.color, fontFamily: "'Poppins',sans-serif" }}>{rs.value}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginTop: 8 }}>{rs.label}</div>
              </div>
            ))}
          </div>

          {/* ── Recurring exam-pattern bars ────────────────────── */}
          <section
            data-testid="section-patterns"
            style={{
              background: "#050508", border: "2.5px solid #FFB7E5",
              boxShadow: "6px 6px 0 0 #FFB7E5", borderRadius: 20,
              padding: "clamp(22px,4vw,32px)",
            }}
          >
            <h2 style={{ fontWeight: 900, fontSize: "clamp(20px,4vw,26px)", margin: 0, color: "#fff", letterSpacing: "-.5px" }}>{t.barsTitle}</h2>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FFE29A", margin: "8px 0 22px", lineHeight: 1.5 }}>{t.barsSub}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {t.bars.map((rb) => (
                <div key={rb.topic}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, fontWeight: 800, marginBottom: 7 }}>
                    <span style={{ color: "#fff" }}>{rb.topic}</span>
                    <span style={{ color: rb.color, whiteSpace: "nowrap" }}>{rb.freq}</span>
                  </div>
                  <div style={{ height: 14, borderRadius: 999, background: "#141418", border: "2px solid #050508", overflow: "hidden" }}>
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
          </section>

          {/* ── Quote sticker ──────────────────────────────────── */}
          <div
            style={{
              marginTop: 26, background: "#9FD8FF", color: "#050508",
              border: "2.5px solid #050508", boxShadow: "6px 6px 0 0 #9FD8FF",
              borderRadius: 16, padding: "24px 28px", fontSize: "clamp(15px,2.6vw,18px)",
              lineHeight: 1.6, fontWeight: 700, transform: "rotate(-.5deg)",
            }}
          >
            {t.quote}
          </div>

          {/* ── Rizz — AI tutor ────────────────────────────────── */}
          <section
            data-testid="section-rizz"
            style={{
              marginTop: 26, background: "#050508", border: "2.5px solid #94F7C5",
              boxShadow: "6px 6px 0 0 #94F7C5", borderRadius: 22,
              padding: "clamp(24px,4vw,36px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, flex: "none", borderRadius: 16, background: "#050508", border: "2.5px solid #94F7C5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                🤖
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#94F7C5", fontSize: 18, transform: "rotate(-2deg)" }}>{t.rizz.eyebrow}</div>
                <div style={{ fontWeight: 900, fontSize: "clamp(20px,4vw,28px)", letterSpacing: "-.5px", color: "#fff" }}>{t.rizz.title}</div>
              </div>
            </div>
            <p style={{ fontSize: "clamp(14.5px,2.4vw,16px)", lineHeight: 1.6, color: "#fff", margin: "0 0 16px" }}>{t.rizz.body}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {t.rizz.chips.map((rc) => (
                <span key={rc} style={{ fontSize: 12, fontWeight: 800, color: "#94F7C5", border: "2px solid #94F7C5", borderRadius: 999, padding: "6px 12px" }}>
                  {rc}
                </span>
              ))}
            </div>
          </section>

          {/* ── The science ────────────────────────────────────── */}
          <div style={{ textAlign: "center", margin: "80px 0 40px" }}>
            <div style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#FFB7E5", fontSize: 20, transform: "rotate(-2deg)" }}>{t.sciEyebrow}</div>
            <h2 style={{ fontSize: "clamp(28px,6vw,40px)", fontWeight: 900, letterSpacing: "-1px", color: "#fff", margin: "6px 0 0" }}>
              {t.sciHead1}
              <span style={{ backgroundImage: WORDMARK_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
                {t.sciAccent}
              </span>
            </h2>
            <p style={{ fontSize: "clamp(15px,2.4vw,17px)", color: "#fff", maxWidth: 640, margin: "14px auto 0", lineHeight: 1.6 }}>{t.sciSub}</p>
          </div>

          {/* ── Pillar sticker cards ───────────────────────────── */}
          <div className="btr-grid2">
            {t.pillars.map((rp, i) => (
              <div
                key={rp.tag}
                className="btr-sticker"
                data-testid={`card-pillar-${i}`}
                style={{
                  background: "#050508", border: `2.5px solid ${rp.color}`,
                  boxShadow: `6px 6px 0 0 ${rp.color}`, borderRadius: 20, padding: 26,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 54, height: 54, flex: "none", borderRadius: 14, background: "#050508", border: `2.5px solid ${rp.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {rp.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.5px", textTransform: "uppercase", color: rp.color }}>{rp.tag}</div>
                    <div style={{ fontWeight: 900, fontSize: "clamp(18px,3.4vw,21px)", letterSpacing: "-.5px", color: "#fff" }}>{rp.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#fff", margin: "0 0 16px" }}>{rp.body}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {rp.chips.map((pc) => (
                    <span key={pc} style={{ fontSize: 12, fontWeight: 800, color: rp.color, border: `2px solid ${rp.color}`, borderRadius: 999, padding: "6px 12px" }}>
                      {pc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Research model flow ────────────────────────────── */}
          <section
            style={{
              marginTop: 56, background: "#050508", border: "2.5px solid #C5B3FF",
              boxShadow: "6px 6px 0 0 #C5B3FF", borderRadius: 22,
              padding: "clamp(24px,4vw,36px)", textAlign: "center",
            }}
          >
            <h2 style={{ fontWeight: 900, fontSize: "clamp(20px,4vw,24px)", letterSpacing: "-.5px", margin: "0 0 24px", color: "#fff" }}>{t.modelTitle}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 22 }}>
              {t.inputs.map((ri, i) => (
                <span key={ri.label} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: ri.color, border: `2px solid ${ri.color}`, borderRadius: 10, padding: "9px 15px" }}>
                    {ri.label}
                  </span>
                  {i < t.inputs.length - 1 && (
                    <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>+</span>
                  )}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 26, color: "#9FF5E8", fontWeight: 900, marginBottom: 18 }}>↓</div>
            <div style={{ height: 6, borderRadius: 999, background: FLOW_GRADIENT, backgroundSize: "300% 100%", animation: "bt-flow 4s linear infinite", marginBottom: 24 }} />
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
              {t.outputs.map((ro) => (
                <span key={ro.label} style={{ fontSize: 13.5, fontWeight: 900, color: "#050508", background: `linear-gradient(100deg,${ro.c1},${ro.c2})`, border: "2px solid #050508", borderRadius: 999, padding: "10px 18px" }}>
                  {ro.label}
                </span>
              ))}
            </div>
          </section>

          {/* ── CTA sticker ────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginTop: 64 }}>
            <h2 style={{ fontSize: "clamp(22px,5vw,34px)", fontWeight: 900, letterSpacing: "-1px", color: "#fff", margin: "0 0 24px" }}>{t.ctaHead}</h2>
            <Link href="/subscribe">
              <button
                className="pub-btn"
                data-testid="button-research-cta"
              >
                {t.ctaBtn}
              </button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
