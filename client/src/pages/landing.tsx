// BrainTrack landing — rebuilt to pixel-match the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, LANDING section).
// Near-black #050508 ground, rainbow wordmark, graffiti mural hero with
// Permanent Marker scatter, marquee, neon feature cards, ecosystem split,
// XP strip, Meet-Rizz strip, footer. Bilingual EN/AF.
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { useRolePromptNav } from "@/components/role-prompt-modal";
import iconTransparent from "@/assets/handoff/icon-transparent.png";
import muralTransparent from "@/assets/handoff/mural-transparent.png";
import rizzAvatar from "@/assets/handoff/rizz-avatar.png";

const RAINBOW =
  "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)";
const CTA_GRADIENT =
  "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const HEADLINE_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)";

const COPY = {
  en: {
    tFeatures: "Features",
    tResearch: "Research",
    tSubjects: "Subjects",
    tPricing: "Pricing",
    tEnter: "Enter BrainTrack",
    heroHead1: "The learning platform that ",
    heroAccent: "doesn't feel like school",
    heroTail: ".",
    heroSub:
      "Not another quiz app. A CAPS-aligned matric readiness ecosystem — DBE-data diagnostics, dynamic study plans, parent visibility and school fundraising in one.",
    ctaStart: "Start free — 14 days",
    marquee: [
      { text: "CAPS-aligned ✦", color: "#9FF5E8" },
      { text: "10 years of DBE data ★", color: "#FFB7E5" },
      { text: "EN + AF ⚡", color: "#FFE29A" },
      { text: "real NSC papers ✦", color: "#9FD8FF" },
      { text: "AI tutor 24/7 ★", color: "#C5B3FF" },
      { text: "parent reports ⚡", color: "#94F7C5" },
      { text: "streaks + XP ✦", color: "#FFB7E5" },
      { text: "school fundraising ★", color: "#9FF5E8" },
      { text: "weak-spot radar ⚡", color: "#FFE29A" },
      { text: "matric ready ✦", color: "#9FD8FF" },
    ],
    tDrop: "the full toolkit",
    tDropHead1: "Everything you need to ",
    tDropHead2: "move real marks",
    features: [
      { icon: "📅", color: "#9FF5E8", chipBg: "rgba(159,245,232,.14)", glow: "rgba(159,245,232,.25)", tilt: -1, title: "Dynamic study plans", body: "A weekly CAPS roadmap rebuilt daily around what you actually got wrong — not a static timetable." },
      { icon: "📊", color: "#9FD8FF", chipBg: "rgba(159,216,255,.14)", glow: "rgba(159,216,255,.25)", tilt: 1, title: "DBE-data diagnostics", body: "Ten years of NSC exam trends show exactly where matrics lose marks — and where you will." },
      { icon: "📝", color: "#FFB7E5", chipBg: "rgba(255,183,229,.14)", glow: "rgba(255,183,229,.25)", tilt: -1, title: "Real past papers + memos", body: "Verbatim DBE questions with marking memos, drilled by topic until the marks stick." },
      { icon: "🤖", color: "#C5B3FF", chipBg: "rgba(197,179,255,.14)", glow: "rgba(197,179,255,.25)", tilt: 1, title: "Rizz — your AI tutor", body: "CAPS-aligned help in English and Afrikaans, 24/7. Explains it until it clicks." },
      { icon: "👀", color: "#FFE29A", chipBg: "rgba(255,226,154,.14)", glow: "rgba(255,226,154,.25)", tilt: -1, title: "Parent visibility", body: "Weekly executive reports parents actually read — progress, risks, next steps." },
      { icon: "🏆", color: "#94F7C5", chipBg: "rgba(148,247,197,.14)", glow: "rgba(148,247,197,.25)", tilt: 1, title: "XP, streaks & rewards", body: "Confetti when you nail a paper. Crowns when you hold a streak. Dopamine, but productive." },
    ],
    tPosEye: "one ecosystem",
    tPosHead1: "Stop juggling apps. ",
    tPosHead2: "BrainTrack connects it all",
    tOtherTools: "Other tools",
    tOtherRows: [
      { a: "Quiz apps", b: "drills without diagnosis" },
      { a: "Past-paper PDFs", b: "no memos, no tracking" },
      { a: "Tutor WhatsApps", b: "expensive, unaccountable" },
      { a: "School reports", b: "arrive when it's too late" },
      { a: "Study guides", b: "generic, not CAPS-precise" },
      { a: "Spreadsheet plans", b: "abandoned by week 2" },
    ],
    tFragmented: "fragmented. expensive. too late.",
    tConnects: "BrainTrack connects",
    tAskLine:
      "Ask one question: does your matric tool know which topics cost South African learners the most marks last November? BrainTrack does — verbatim, per subject, in both languages.",
    tQuote:
      "“BrainTrack is not a quiz app. It is a matric readiness ecosystem built on ten years of real DBE outcomes — designed so that no learner walks into the NSC exams blind.”",
    xpEye: "dopamine, but productive",
    xpHead1: "Every session drops ",
    xpHead2: "XP, streaks",
    xpHead3: " and reward reveals",
    xpBody:
      "Confetti when you nail a paper. Crowns when you hold a streak. And while you put in the work, parents and schools get clean, executive reports.",
    xpStats: [
      { value: "+120", label: "XP / session", color: "#9FF5E8", glow: "rgba(159,245,232,.25)" },
      { value: "21🔥", label: "day streak", color: "#FFB7E5", glow: "rgba(255,183,229,.25)" },
      { value: "12", label: "crowns", color: "#FFE29A", glow: "rgba(255,226,154,.25)" },
    ],
    rizzEye: "meet rizz 🤖",
    rizzHead: "Try our AI study buddy — free, right now",
    rizzBody:
      "Parents, test-drive Rizz before you sign up. Ask about CAPS subjects, exam tips or how BrainTrack works. Afrikaans toggle included. 💬",
    rizzCta: "Chat with Rizz →",
    footMade: "© 2026 — Made in South Africa",
    footPrivacy: "Privacy",
    footTerms: "Terms",
    footPopia: "POPIA",
    footBilling: "Billing",
    footSafeguarding: "Safeguarding",
    footAskRizz: "Ask Rizz 🤖",
  },
  af: {
    tFeatures: "Funksies",
    tResearch: "Navorsing",
    tSubjects: "Vakke",
    tPricing: "Pryse",
    tEnter: "Betree BrainTrack",
    heroHead1: "Die leerplatform wat ",
    heroAccent: "nie soos skool voel nie",
    heroTail: ".",
    heroSub:
      "Nie nog 'n vasvra-app nie. 'n KABV-belynde matriekgereedheid-ekosisteem — DBE-datadiagnostiek, dinamiese studieplanne, ouersigbaarheid en skoolfondsinsameling in een.",
    ctaStart: "Begin gratis — 14 dae",
    marquee: [
      { text: "KABV-belyn ✦", color: "#9FF5E8" },
      { text: "10 jaar DBE-data ★", color: "#FFB7E5" },
      { text: "AF + EN ⚡", color: "#FFE29A" },
      { text: "regte NSS-vraestelle ✦", color: "#9FD8FF" },
      { text: "KI-tutor 24/7 ★", color: "#C5B3FF" },
      { text: "ouerverslae ⚡", color: "#94F7C5" },
      { text: "reekse + XP ✦", color: "#FFB7E5" },
      { text: "skoolfondsinsameling ★", color: "#9FF5E8" },
      { text: "swakplek-radar ⚡", color: "#FFE29A" },
      { text: "matriek gereed ✦", color: "#9FD8FF" },
    ],
    tDrop: "die volle gereedskapstel",
    tDropHead1: "Alles wat jy nodig het om ",
    tDropHead2: "regte punte te skuif",
    features: [
      { icon: "📅", color: "#9FF5E8", chipBg: "rgba(159,245,232,.14)", glow: "rgba(159,245,232,.25)", tilt: -1, title: "Dinamiese studieplanne", body: "'n Weeklikse KABV-padkaart wat daagliks herbou word rondom wat jy verkeerd gekry het." },
      { icon: "📊", color: "#9FD8FF", chipBg: "rgba(159,216,255,.14)", glow: "rgba(159,216,255,.25)", tilt: 1, title: "DBE-datadiagnostiek", body: "Tien jaar se NSS-eksamenneigings wys presies waar matrieks punte verloor — en waar jy sal." },
      { icon: "📝", color: "#FFB7E5", chipBg: "rgba(255,183,229,.14)", glow: "rgba(255,183,229,.25)", tilt: -1, title: "Regte vraestelle + memo's", body: "Woordelikse DBE-vrae met nasienmemo's, per onderwerp gedril totdat die punte vassit." },
      { icon: "🤖", color: "#C5B3FF", chipBg: "rgba(197,179,255,.14)", glow: "rgba(197,179,255,.25)", tilt: 1, title: "Rizz — jou KI-tutor", body: "KABV-belynde hulp in Afrikaans en Engels, 24/7. Verduidelik totdat dit klik." },
      { icon: "👀", color: "#FFE29A", chipBg: "rgba(255,226,154,.14)", glow: "rgba(255,226,154,.25)", tilt: -1, title: "Ouersigbaarheid", body: "Weeklikse uitvoerende verslae wat ouers regtig lees — vordering, risiko's, volgende stappe." },
      { icon: "🏆", color: "#94F7C5", chipBg: "rgba(148,247,197,.14)", glow: "rgba(148,247,197,.25)", tilt: 1, title: "XP, reekse & belonings", body: "Konfetti as jy 'n vraestel klop. Krone as jy 'n reeks hou. Dopamien, maar produktief." },
    ],
    tPosEye: "een ekosisteem",
    tPosHead1: "Hou op om apps te jongleer. ",
    tPosHead2: "BrainTrack verbind alles",
    tOtherTools: "Ander gereedskap",
    tOtherRows: [
      { a: "Vasvra-apps", b: "drille sonder diagnose" },
      { a: "Vraestel-PDF's", b: "geen memo's, geen naspoor" },
      { a: "Tutor-WhatsApps", b: "duur, onverantwoordbaar" },
      { a: "Skoolverslae", b: "kom wanneer dit te laat is" },
      { a: "Studiegidse", b: "generies, nie KABV-presies nie" },
      { a: "Sigblad-planne", b: "teen week 2 laat vaar" },
    ],
    tFragmented: "gefragmenteer. duur. te laat.",
    tConnects: "BrainTrack verbind",
    tAskLine:
      "Vra een vraag: weet jou matriekhulpmiddel watter onderwerpe Suid-Afrikaanse leerders verlede November die meeste punte gekos het? BrainTrack weet — woordeliks, per vak, in albei tale.",
    tQuote:
      "“BrainTrack is nie 'n vasvra-app nie. Dit is 'n matriekgereedheid-ekosisteem gebou op tien jaar se regte DBE-uitkomste — ontwerp sodat geen leerder blind by die NSS-eksamens instap nie.”",
    xpEye: "dopamien, maar produktief",
    xpHead1: "Elke sessie laat val ",
    xpHead2: "XP, reekse",
    xpHead3: " en beloningsonthullings",
    xpBody:
      "Konfetti as jy 'n vraestel klop. Krone as jy 'n reeks hou. En terwyl jy die werk insit, kry ouers en skole skoon, uitvoerende verslae.",
    xpStats: [
      { value: "+120", label: "XP / sessie", color: "#9FF5E8", glow: "rgba(159,245,232,.25)" },
      { value: "21🔥", label: "dae-reeks", color: "#FFB7E5", glow: "rgba(255,183,229,.25)" },
      { value: "12", label: "krone", color: "#FFE29A", glow: "rgba(255,226,154,.25)" },
    ],
    rizzEye: "ontmoet rizz 🤖",
    rizzHead: "Probeer ons KI-studiemaat — gratis, nou dadelik",
    rizzBody:
      "Ouers, toets Rizz voordat julle inteken. Vra oor KABV-vakke, eksamenwenke of hoe BrainTrack werk. Afrikaanse skakel ingesluit. 💬",
    rizzCta: "Gesels met Rizz →",
    footMade: "© 2026 — Gemaak in Suid-Afrika",
    footPrivacy: "Privaatheid",
    footTerms: "Bepalings",
    footPopia: "POPIA",
    footBilling: "Betaling",
    footSafeguarding: "Beskerming",
    footAskRizz: "Vra Rizz 🤖",
  },
} as const;

// Permanent Marker scatter marks around the hero — positions from the comp.
const SCATTER: Array<{
  glyph: string; color: string; size: number; rotate: number;
  style: React.CSSProperties;
}> = [
  { glyph: "★", color: "rgba(255,226,154,.85)", size: 38, rotate: -14, style: { top: 38, left: "7%" } },
  { glyph: "⚡", color: "rgba(159,245,232,.85)", size: 34, rotate: 10, style: { top: 110, right: "8%" } },
  { glyph: "✦", color: "rgba(197,179,255,.85)", size: 30, rotate: 8, style: { bottom: 230, left: "5%" } },
  { glyph: "☻", color: "rgba(255,183,229,.85)", size: 30, rotate: -8, style: { bottom: 150, right: "6%" } },
  { glyph: "👑", color: "rgba(159,216,255,.85)", size: 28, rotate: -6, style: { top: 200, left: "12%" } },
  { glyph: "🔥", color: "rgba(255,183,229,.8)", size: 32, rotate: 12, style: { top: 300, right: "13%" } },
  { glyph: "✏", color: "rgba(148,247,197,.8)", size: 24, rotate: -10, style: { top: 70, left: "26%" } },
  { glyph: "⚡", color: "rgba(255,226,154,.8)", size: 26, rotate: 6, style: { bottom: 120, left: "22%" } },
  { glyph: "★", color: "rgba(197,179,255,.8)", size: 22, rotate: -14, style: { top: 150, right: "24%" } },
  { glyph: "✦", color: "rgba(159,245,232,.75)", size: 24, rotate: 9, style: { bottom: 260, right: "18%" } },
  { glyph: "✱", color: "rgba(255,183,229,.75)", size: 22, rotate: -4, style: { top: 250, left: "4%" } },
  { glyph: "↗", color: "rgba(159,216,255,.8)", size: 26, rotate: -12, style: { bottom: 80, right: "9%" } },
];

function RainbowWordmark({ size = 24 }: { size?: number }) {
  return (
    <span
      className="bt-wordmark"
      style={{ fontSize: size, letterSpacing: "-.5px" }}
    >
      BrainTrack
    </span>
  );
}

export default function LandingPage() {
  const { language, toggleLanguage } = useLanguage();
  const t = COPY[language];
  const { handleCta, modal } = useRolePromptNav();
  const en = language === "en";

  useSEO({
    title: "BrainTrack™ | Grade 12 Matric Past Papers, Memos & AI Tutor — South Africa",
    description:
      "Pass Matric with confidence. 10 years of NSC past papers + memos, CAPS-aligned weekly study plan, AI tutor and parent reports. Built for SA Grade 12. R169/month — 14 days free.",
    canonical: "https://braintrack.co.za/",
    ogTitle: "Matric Past Papers, Memos & AI Tutor for Grade 12 SA | BrainTrack™",
    ogDescription:
      "10 years of NSC past papers + memos, CAPS-aligned weekly revision, AI tutor and parent reports. R169/month — 14 days free.",
  });

  const openRizz = () => {
    window.dispatchEvent(new CustomEvent("bt:rizz-toggle"));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050508", overflowX: "hidden" }}>
      <style>{`
        .btl-nav-link { color:#fff; cursor:pointer; transition:color .2s; }
        .btl-nav-link:hover { color: var(--h, #9FF5E8); }
        .btl-cta { transition: transform .2s; }
        .btl-cta:hover { transform: translateY(-3px) rotate(-1deg); }
        .btl-nav-cta:hover { transform: translateY(-2px); }
        .btl-feature { transition: transform .25s, box-shadow .25s, border-color .25s; }
        .btl-feature:hover { transform: translateY(-8px) rotate(var(--tilt, 0deg)); box-shadow: 0 20px 50px var(--glow); border-color: var(--c) !important; }
        .btl-logo-img { transition: transform .25s; }
        .btl-logo-img:hover { transform: scale(1.15) rotate(-4deg); }
        .btl-foot-link { color:#fff; cursor:pointer; transition:color .2s; }
        .btl-foot-link:hover { color: var(--h, #9FD8FF); }
        @media (max-width: 860px) {
          .btl-nav-links { display: none !important; }
          .btl-hero-head { font-size: 38px !important; letter-spacing: -1px !important; }
          .btl-grid3 { grid-template-columns: 1fr !important; }
          .btl-grid2 { grid-template-columns: 1fr !important; }
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
          <img src={iconTransparent} alt="BrainTrack" className="btl-logo-img" style={{ width: 56, height: 56, objectFit: "contain" }} />
          <RainbowWordmark size={24} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 14, fontWeight: 600, flex: "none" }}>
          <span className="btl-nav-links" style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Link href="/features"><span className="btl-nav-link" style={{ "--h": "#9FF5E8" } as React.CSSProperties}>{t.tFeatures}</span></Link>
            <Link href="/research"><span className="btl-nav-link" style={{ "--h": "#9FD8FF" } as React.CSSProperties}>{t.tResearch}</span></Link>
            <Link href="/features"><span className="btl-nav-link" style={{ "--h": "#FFB7E5" } as React.CSSProperties}>{t.tSubjects}</span></Link>
            <Link href="/subscribe"><span className="btl-nav-link" style={{ "--h": "#FFE29A" } as React.CSSProperties}>{t.tPricing}</span></Link>
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
              className="btl-nav-cta"
              data-testid="button-nav-enter"
              style={{
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14,
                color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                animation: "bt-rainbow 6s linear infinite", border: "none",
                borderRadius: 10, padding: "11px 26px", whiteSpace: "nowrap",
                cursor: "pointer", boxShadow: "0 0 12px rgba(255,183,229,.22)",
                transition: "transform .2s",
              }}
            >
              {t.tEnter}
            </button>
          </a>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 24px 40px", textAlign: "center" }}>
        <div
          aria-hidden
          style={{
            position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
            width: 900, height: 520, maxWidth: "100vw",
            background: "radial-gradient(ellipse,rgba(255,183,229,.07),rgba(159,216,255,.04) 55%,transparent 75%)",
            filter: "blur(30px)", pointerEvents: "none",
            animation: "bt-glowpulse 5s ease-in-out infinite",
          }}
        />
        {SCATTER.map((s, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              position: "absolute", fontFamily: "'Permanent Marker',cursive",
              fontSize: s.size, color: s.color, transform: `rotate(${s.rotate}deg)`,
              zIndex: 1, pointerEvents: "none", ...s.style,
            }}
          >
            {s.glyph}
          </span>
        ))}
        <img
          src={muralTransparent}
          alt="BrainTrack graffiti mural"
          style={{
            width: "min(920px,94vw)", position: "relative", zIndex: 2,
            animation: "bt-float 7s ease-in-out infinite",
            filter: "drop-shadow(0 24px 44px rgba(255,110,199,.12))",
          }}
        />
        <div style={{ maxWidth: 760, marginTop: 28, position: "relative", zIndex: 2 }}>
          <div
            role="heading"
            aria-level={1}
            className="btl-hero-head"
            data-testid="hero-title"
            style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px", margin: 0, fontFamily: "'Poppins',sans-serif", color: "#fff" }}
          >
            {t.heroHead1}
            <span
              style={{
                background: HEADLINE_GRADIENT,
                WebkitBackgroundClip: "text", backgroundClip: "text",
                color: "transparent", WebkitTextFillColor: "transparent",
              }}
            >
              {t.heroAccent}
            </span>
            {t.heroTail}
          </div>
          <div style={{ marginTop: 18, fontSize: 17, lineHeight: 1.65, color: "#fff", maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
            {t.heroSub}
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32 }}>
            <button
              onClick={handleCta}
              className="btl-cta"
              data-testid="button-hero-cta"
              style={{
                fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16,
                color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                animation: "bt-rainbow 5s linear infinite", border: "none",
                borderRadius: 10, padding: "16px 36px", whiteSpace: "nowrap",
                cursor: "pointer", boxShadow: "0 0 16px rgba(255,183,229,.28)",
              }}
            >
              {t.ctaStart}
            </button>
          </div>
        </div>
      </div>

      {/* ── Marquee ─────────────────────────────────────────── */}
      <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "14px 0", margin: "40px 0 0" }}>
        <div
          style={{
            display: "flex", gap: 48, width: "max-content",
            animation: "bt-marquee 22s linear infinite",
            fontFamily: "'Permanent Marker',cursive", fontSize: 18, whiteSpace: "nowrap",
          }}
        >
          {[...t.marquee, ...t.marquee].map((mq, i) => (
            <span key={i} style={{ color: mq.color }}>{mq.text}</span>
          ))}
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "90px auto 0", padding: "0 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFB7E5", fontSize: 16, transform: "rotate(-2deg)" }}>{t.tDrop}</div>
          <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px" }}>
            {t.tDropHead1}
            <span style={{ color: "#9FD8FF" }}>{t.tDropHead2}</span>
          </div>
        </div>
        <div className="btl-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}>
          {t.features.map((f) => (
            <div
              key={f.title}
              className="btl-feature"
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
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: "#fff" }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Positioning: the ecosystem ──────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "100px auto 0", padding: "0 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8", fontSize: 16, transform: "rotate(-2deg)" }}>{t.tPosEye}</div>
          <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px" }}>
            {t.tPosHead1}
            <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>{t.tPosHead2}</span>
          </div>
        </div>
        <div className="btl-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 26, alignItems: "stretch" }}>
          <div style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, padding: 30 }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 18, color: "#9FD8FF" }}>{t.tOtherTools}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 15 }}>
              {t.tOtherRows.map((r) => (
                <div key={r.a} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid rgba(255,255,255,.06)", paddingBottom: 10 }}>
                  <span style={{ fontWeight: 700, color: "#fff" }}>{r.a}</span>
                  <span style={{ color: "#C5B3FF" }}>{r.b}</span>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", marginTop: 20, transform: "rotate(-1.5deg)" }}>{t.tFragmented}</div>
          </div>
          <div style={{ background: "linear-gradient(150deg,rgba(159,216,255,.1),rgba(255,183,229,.08))", border: "1.5px solid rgba(159,216,255,.3)", borderRadius: 22, padding: 30, boxShadow: "0 0 18px rgba(159,216,255,.08)" }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 18 }}>{t.tConnects}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { l: "CAPS", c: "#9FF5E8" },
                { l: "NSC data", c: "#9FD8FF" },
                { l: "10 years of DBE trends", c: "#FFB7E5" },
                { l: en ? "Dynamic study plans" : "Dinamiese studieplanne", c: "#C5B3FF" },
                { l: en ? "Exam readiness" : "Eksamengereedheid", c: "#FFE29A" },
                { l: en ? "Parent visibility" : "Ouersigbaarheid", c: "#9FF5E8" },
                { l: en ? "School reporting" : "Skoolverslae", c: "#FFB7E5" },
                { l: en ? "Cohort analytics" : "Kohort-analise", c: "#9FD8FF" },
                { l: en ? "Fundraising" : "Fondsinsameling", c: "#FFE29A" },
                { l: en ? "Gamification" : "Spelifisering", c: "#C5B3FF" },
                { l: en ? "Referral growth" : "Verwysingsgroei", c: "#9FF5E8" },
                { l: "Afrikaans + English", c: "#FFB7E5" },
                { l: en ? "POPIA-aware reporting" : "POPIA-bewuste verslae", c: "#9FD8FF" },
              ].map((chip) => (
                <span key={chip.l} style={{ fontSize: 13.5, fontWeight: 700, color: chip.c, border: `1.5px solid ${chip.c}`, borderRadius: 8, padding: "8px 14px" }}>
                  {chip.l}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 22, fontSize: 15, lineHeight: 1.7, color: "#fff" }}>{t.tAskLine}</div>
          </div>
        </div>
        <div style={{ marginTop: 26, background: "rgba(255,255,255,.025)", borderLeft: "3px solid #9FD8FF", borderRadius: "0 16px 16px 0", padding: "24px 30px", fontSize: 16, lineHeight: 1.75, fontStyle: "italic", color: "#fff" }}>
          {t.tQuote}
        </div>
      </div>

      {/* ── XP strip ────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "100px auto 0", padding: "0 32px" }}>
        <div style={{ background: "linear-gradient(120deg,rgba(255,183,229,.1),rgba(159,216,255,.09),rgba(197,179,255,.1))", border: "1px solid rgba(255,255,255,.1)", borderRadius: 28, padding: 48, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 480 }}>
            <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8", fontSize: 16, transform: "rotate(-2deg)" }}>{t.xpEye}</div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.2, marginTop: 6 }}>
              {t.xpHead1}<span style={{ color: "#9FD8FF" }}>{t.xpHead2}</span>{t.xpHead3}
            </div>
            <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.65, color: "#fff" }}>{t.xpBody}</div>
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {t.xpStats.map((s) => (
              <div key={s.label} style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${s.color}`, borderRadius: 20, padding: "22px 26px", textAlign: "center", minWidth: 110, boxShadow: `0 0 26px ${s.glow}`, animation: "bt-wiggle 6s ease-in-out infinite" }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "1.5px", color: "#fff", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Meet Rizz strip ─────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "100px auto 0", padding: "0 32px" }}>
        <div style={{ background: "linear-gradient(120deg,rgba(179,136,255,.14),rgba(255,126,198,.1))", border: "1.5px solid rgba(179,136,255,.3)", borderRadius: 24, padding: "34px 40px", display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
          <img src={rizzAvatar} alt="Rizz" style={{ width: 84, height: 84, borderRadius: 20, objectFit: "cover", border: "2px solid #B388FF", boxShadow: "0 0 26px rgba(179,136,255,.45)" }} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#C5B3FF", transform: "rotate(-2deg)" }}>{t.rizzEye}</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.5px", marginTop: 4 }}>{t.rizzHead}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: "#fff", opacity: 0.72, marginTop: 6 }}>{t.rizzBody}</div>
          </div>
          <button
            onClick={openRizz}
            data-testid="button-rizz-cta"
            className="btl-nav-cta"
            style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15, color: "#050508", background: "linear-gradient(100deg,#B388FF,#FF7EC6)", border: "none", borderRadius: 12, padding: "15px 30px", whiteSpace: "nowrap", cursor: "pointer", boxShadow: "0 0 24px rgba(179,136,255,.4)", transition: "transform .2s" }}
          >
            {t.rizzCta}
          </button>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div style={{ marginTop: 110, borderTop: "1px solid rgba(255,255,255,.08)", padding: "44px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={iconTransparent} alt="" style={{ width: 52, height: 52, objectFit: "contain" }} />
          <RainbowWordmark size={16} />
          <span style={{ fontSize: 14, color: "#fff", marginLeft: 10 }}>{t.footMade}</span>
        </div>
        <div style={{ display: "flex", gap: 26, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
          <Link href="/privacy-policy"><span className="btl-foot-link" style={{ "--h": "#9FD8FF" } as React.CSSProperties}>{t.footPrivacy}</span></Link>
          <Link href="/terms-of-service"><span className="btl-foot-link" style={{ "--h": "#FFB7E5" } as React.CSSProperties}>{t.footTerms}</span></Link>
          <Link href="/privacy-policy"><span className="btl-foot-link" style={{ "--h": "#C5B3FF" } as React.CSSProperties}>{t.footPopia}</span></Link>
          <Link href="/refund-policy"><span className="btl-foot-link" style={{ "--h": "#FFE29A" } as React.CSSProperties}>{t.footBilling}</span></Link>
          <Link href="/terms-of-service"><span className="btl-foot-link" style={{ "--h": "#94F7C5" } as React.CSSProperties}>{t.footSafeguarding}</span></Link>
          <span onClick={openRizz} className="btl-foot-link" style={{ color: "#C5B3FF", cursor: "pointer", fontWeight: 800, "--h": "#FF7EC6" } as React.CSSProperties}>{t.footAskRizz}</span>
        </div>
      </div>

      {modal}
    </div>
  );
}
