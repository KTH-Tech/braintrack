// BrainTrack landing — rebuilt to pixel-match the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, LANDING section).
// Near-black #050508 ground, rainbow wordmark, graffiti mural hero with
// Permanent Marker scatter, marquee, neon feature cards, ecosystem split,
// XP strip, Meet-Rizz strip, footer. Bilingual EN/AF.
import { useEffect, useRef, useState } from "react";
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
    proofEye: "the receipts",
    proofHead1: "Not claims. ",
    proofHead2: "Counted.",
    proofSub:
      "Every figure below is what is already loaded inside BrainTrack — indexed, verified and searchable by topic. No rounding up, no roadmap promises.",
    proofFoot: "Counted from the BrainTrack question bank — not estimated.",
    proof: [
      { value: 14068, suffix: "", label: "verbatim DBE questions", detail: "typed word-for-word from the real papers", color: "#9FF5E8", glow: "rgba(159,245,232,.28)" },
      { value: 59, suffix: "", label: "subjects covered", detail: "mapped across the CAPS curriculum", color: "#FFB7E5", glow: "rgba(255,183,229,.28)" },
      { value: 10, suffix: "", label: "years of papers", detail: "2015 – 2025, sitting by sitting", color: "#9FD8FF", glow: "rgba(159,216,255,.28)" },
      { value: 10, suffix: "", label: "languages", detail: "English + Afrikaans + 8 African languages", color: "#C5B3FF", glow: "rgba(197,179,255,.28)" },
      { value: 118, suffix: "", label: "examiner profiles", detail: "profiled across the DBE archive", color: "#FFE29A", glow: "rgba(255,226,154,.28)" },
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
    footAdmin: "Admin",
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
    proofEye: "die bewyse",
    proofHead1: "Nie beloftes nie. ",
    proofHead2: "Getel.",
    proofSub:
      "Elke syfer hieronder is wat reeds in BrainTrack gelaai is — geïndekseer, geverifieer en per onderwerp deursoekbaar. Niks opgerond nie, geen padkaart-beloftes nie.",
    proofFoot: "Getel uit die BrainTrack-vraebank — nie geskat nie.",
    proof: [
      { value: 14068, suffix: "", label: "woordelikse DBE-vrae", detail: "woord-vir-woord uit die regte vraestelle getik", color: "#9FF5E8", glow: "rgba(159,245,232,.28)" },
      { value: 59, suffix: "", label: "vakke gedek", detail: "gekarteer oor die KABV-kurrikulum", color: "#FFB7E5", glow: "rgba(255,183,229,.28)" },
      { value: 10, suffix: "", label: "jaar se vraestelle", detail: "2015 – 2025, sitting vir sitting", color: "#9FD8FF", glow: "rgba(159,216,255,.28)" },
      { value: 10, suffix: "", label: "tale", detail: "Engels + Afrikaans + 8 Afrikatale", color: "#C5B3FF", glow: "rgba(197,179,255,.28)" },
      { value: 118, suffix: "", label: "eksaminatorprofiele", detail: "geprofileer oor die DBE-argief", color: "#FFE29A", glow: "rgba(255,226,154,.28)" },
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
    footAdmin: "Admin",
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

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fires once when the element first enters the viewport. */
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Scroll-reveal wrapper. Uses an inline `animation: bt-fadeup …` so it survives
 * the global animation kill-switch in index.css; prefers-reduced-motion users
 * get the finished state immediately (no opacity:0 flash, no motion).
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

const groupDigits = (n: number, sep: string) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);

/** Big pastel numeral that counts up the first time it scrolls into view. */
function ProofStat({
  value, suffix, label, detail, color, glow, sep, delay,
}: {
  value: number; suffix: string; label: string; detail: string;
  color: string; glow: string; sep: string; delay: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [shown, setShown] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    const duration = 1500;
    const startAt = performance.now() + delay;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - startAt) / duration));
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, value, delay]);

  return (
    <div
      ref={ref}
      className="btl-proof-cell"
      style={{
        position: "relative",
        padding: "30px 22px 28px",
        textAlign: "center",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,.09)",
        background: "linear-gradient(170deg,rgba(255,255,255,.055),rgba(255,255,255,.012))",
        animation: inView ? `bt-fadeup .8s cubic-bezier(.22,.75,.3,1) ${delay}ms both` : undefined,
        opacity: inView ? undefined : 0,
        "--c": color,
        "--glow": glow,
      } as React.CSSProperties}
    >
      <div
        className="btl-proof-num"
        style={{
          fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: "-2.5px",
          color, textShadow: `0 0 34px ${glow}`, fontVariantNumeric: "tabular-nums",
        }}
      >
        {groupDigits(shown, sep)}{suffix}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, fontWeight: 800, letterSpacing: "1.6px", textTransform: "uppercase", color: "#fff" }}>
        {label}
      </div>
      <div style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.55, color: "#fff", opacity: 0.82 }}>
        {detail}
      </div>
    </div>
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
        .btl-feature {
          position: relative; overflow: hidden; height: 100%; box-sizing: border-box;
          transition: transform .38s cubic-bezier(.22,.75,.3,1), box-shadow .38s ease,
                      border-color .38s ease, background .38s ease;
        }
        /* accent top-edge highlight */
        .btl-feature::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1.5px;
          background: linear-gradient(90deg, transparent, var(--c), transparent);
          opacity: .4; transition: opacity .38s ease;
        }
        /* accent bloom that swells from the top-left on hover */
        .btl-feature::after {
          content: ""; position: absolute; top: -55%; left: -20%; width: 90%; height: 90%;
          background: radial-gradient(closest-side, var(--glow), transparent 72%);
          opacity: 0; transition: opacity .45s ease; pointer-events: none; z-index: 0;
        }
        .btl-feature > * { position: relative; z-index: 1; }
        .btl-feature:hover {
          transform: translateY(-10px) rotate(var(--tilt, 0deg)) scale(1.012);
          box-shadow: 0 26px 64px var(--glow);
          border-color: var(--c) !important;
          background: linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.02)) !important;
        }
        .btl-feature:hover::before { opacity: 1; }
        .btl-feature:hover::after { opacity: 1; }
        .btl-fchip { transition: transform .38s cubic-bezier(.22,.75,.3,1), box-shadow .38s ease; }
        .btl-feature:hover .btl-fchip { transform: translateY(-3px) scale(1.07); }
        .btl-proof-cell { transition: transform .35s cubic-bezier(.22,.75,.3,1), border-color .35s, box-shadow .35s; }
        .btl-proof-cell:hover { transform: translateY(-6px); border-color: var(--c) !important; box-shadow: 0 18px 46px var(--glow); }
        .btl-eco-chip { transition: transform .25s, box-shadow .25s, background .25s; }
        .btl-eco-chip:hover { transform: translateY(-2px); box-shadow: 0 0 18px var(--cg); }
        .btl-logo-img { transition: transform .25s; }
        .btl-logo-img:hover { transform: scale(1.15) rotate(-4deg); }
        .btl-foot-link { color:#fff; cursor:pointer; transition:color .2s, opacity .2s; }
        .btl-foot-link:hover { color: var(--h, #9FD8FF); }
        @media (max-width: 860px) {
          .btl-nav-links { display: none !important; }
          .btl-hero-head { font-size: 38px !important; letter-spacing: -1px !important; }
          .btl-grid3 { grid-template-columns: 1fr !important; }
          .btl-grid2 { grid-template-columns: 1fr !important; }
          .btl-proof-grid { grid-template-columns: repeat(2,1fr) !important; gap: 14px !important; }
          .btl-proof-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
          .btl-proof-num { font-size: 40px !important; letter-spacing: -1.5px !important; }
          .btl-proof-cell { padding: 24px 14px 22px !important; }
          .btl-sec { margin-top: 68px !important; padding-left: 20px !important; padding-right: 20px !important; }
          .btl-sec-head { font-size: 28px !important; letter-spacing: -.6px !important; }
          .btl-sec-sub { font-size: 15px !important; }
          .btl-xp-card { padding: 30px 22px !important; border-radius: 22px !important; gap: 26px !important; }
          .btl-xp-head { font-size: 25px !important; }
          .btl-xp-stats { gap: 12px !important; width: 100%; }
          .btl-xp-stats > * { flex: 1 1 30%; min-width: 0 !important; padding: 18px 10px !important; }
          .btl-rizz-card { padding: 26px 22px !important; text-align: center; justify-content: center; }
          .btl-rizz-card > button { width: 100%; }
          .btl-rizz-head { font-size: 21px !important; }
          .btl-quote { font-size: 15px !important; padding: 20px 22px !important; }
          .btl-foot { padding: 36px 22px !important; flex-direction: column; align-items: flex-start !important; }
          .btl-foot-links { gap: 16px 18px !important; }
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
          <a href="/signin">
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
      <div className="btl-sec" style={{ maxWidth: 1100, margin: "104px auto 0", padding: "0 32px" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 58 }}>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFB7E5", fontSize: 17, letterSpacing: ".5px", transform: "rotate(-2deg)" }}>{t.tDrop}</div>
          <div className="btl-sec-head" style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1.4px", lineHeight: 1.12, marginTop: 10 }}>
            {t.tDropHead1}
            <span style={{ color: "#9FD8FF" }}>{t.tDropHead2}</span>
          </div>
        </Reveal>
        <div className="btl-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}>
          {t.features.map((f, i) => (
            <Reveal key={f.title} delay={i * 90} style={{ display: "flex" }}>
              <div
                className="btl-feature"
                style={{
                  "--tilt": `${f.tilt}deg`, "--glow": f.glow, "--c": f.color,
                  background: "linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.015))",
                  border: "1px solid rgba(255,255,255,.09)", borderRadius: 22,
                  padding: 28, cursor: "default", width: "100%",
                } as React.CSSProperties}
              >
                <div className="btl-fchip" style={{ width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: f.chipBg, boxShadow: `0 0 22px ${f.glow}`, marginBottom: 18, fontSize: 24 }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 800, fontSize: 18.5, letterSpacing: "-.2px", marginBottom: 9 }}>{f.title}</div>
                <div style={{ fontSize: 15, lineHeight: 1.62, color: "#fff", opacity: 0.9 }}>{f.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Proof band: the receipts ────────────────────────── */}
      <div className="btl-sec" style={{ maxWidth: 1100, margin: "112px auto 0", padding: "0 32px" }}>
        <div
          style={{
            position: "relative", overflow: "hidden", borderRadius: 30,
            border: "1px solid rgba(255,255,255,.1)",
            background: "linear-gradient(150deg,rgba(159,245,232,.055),rgba(197,179,255,.05) 48%,rgba(255,183,229,.055))",
            padding: "56px 40px 48px",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute", top: -140, left: "50%", width: 720, height: 320,
              transform: "translateX(-50%)", pointerEvents: "none",
              background: "radial-gradient(ellipse,rgba(159,216,255,.13),transparent 70%)",
              filter: "blur(24px)", animation: "bt-glowpulse 6s ease-in-out infinite",
            }}
          />
          <Reveal style={{ position: "relative", textAlign: "center", maxWidth: 720, margin: "0 auto 46px" }}>
            <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8", fontSize: 17, letterSpacing: ".5px", transform: "rotate(-2deg)" }}>{t.proofEye}</div>
            <div className="btl-sec-head" style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-1.6px", lineHeight: 1.1, marginTop: 10 }}>
              {t.proofHead1}
              <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>{t.proofHead2}</span>
            </div>
            <div className="btl-sec-sub" style={{ marginTop: 16, fontSize: 16.5, lineHeight: 1.68, color: "#fff", opacity: 0.9 }}>{t.proofSub}</div>
          </Reveal>
          <div
            className="btl-proof-grid"
            data-testid="proof-band"
            style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 18 }}
          >
            {t.proof.map((p, i) => (
              <ProofStat
                key={p.label}
                value={p.value}
                suffix={p.suffix}
                label={p.label}
                detail={p.detail}
                color={p.color}
                glow={p.glow}
                sep={en ? "," : " "}
                delay={i * 110}
              />
            ))}
          </div>
          <Reveal delay={260} style={{ position: "relative", textAlign: "center", marginTop: 34 }}>
            <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFE29A", display: "inline-block", transform: "rotate(-1.2deg)" }}>
              {t.proofFoot}
            </span>
          </Reveal>
        </div>
      </div>

      {/* ── Positioning: the ecosystem ──────────────────────── */}
      <div className="btl-sec" style={{ maxWidth: 1100, margin: "116px auto 0", padding: "0 32px" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 58 }}>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8", fontSize: 17, letterSpacing: ".5px", transform: "rotate(-2deg)" }}>{t.tPosEye}</div>
          <div className="btl-sec-head" style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1.4px", lineHeight: 1.12, marginTop: 10 }}>
            {t.tPosHead1}
            <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>{t.tPosHead2}</span>
          </div>
        </Reveal>
        <div className="btl-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 26, alignItems: "stretch" }}>
          <Reveal style={{ display: "flex" }}>
          <div style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, padding: 30 }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 18, color: "#9FD8FF" }}>{t.tOtherTools}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 15 }}>
              {t.tOtherRows.map((r) => (
                <div key={r.a} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid rgba(255,255,255,.06)", paddingBottom: 10 }}>
                  <span style={{ fontWeight: 700, color: "#fff" }}>{r.a}</span>
                  <span style={{ color: "#C5B3FF" }}>{r.b}</span>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", marginTop: 22, transform: "rotate(-1.5deg)" }}>{t.tFragmented}</div>
          </div>
          </Reveal>
          <Reveal delay={140} style={{ display: "flex" }}>
          <div style={{ width: "100%", boxSizing: "border-box", background: "linear-gradient(150deg,rgba(159,216,255,.1),rgba(255,183,229,.08))", border: "1.5px solid rgba(159,216,255,.3)", borderRadius: 22, padding: 30, boxShadow: "0 0 18px rgba(159,216,255,.08)" }}>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-.2px", marginBottom: 18 }}>{t.tConnects}</div>
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
                <span key={chip.l} className="btl-eco-chip" style={{ fontSize: 13.5, fontWeight: 700, color: chip.c, border: `1.5px solid ${chip.c}`, borderRadius: 8, padding: "8px 14px", "--cg": `${chip.c}55` } as React.CSSProperties}>
                  {chip.l}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 24, fontSize: 15.5, lineHeight: 1.72, color: "#fff", opacity: 0.94 }}>{t.tAskLine}</div>
          </div>
          </Reveal>
        </div>
        <Reveal delay={120}>
          <div className="btl-quote" style={{ marginTop: 28, background: "linear-gradient(100deg,rgba(159,216,255,.06),rgba(255,255,255,.015))", borderLeft: "3px solid #9FD8FF", borderRadius: "0 18px 18px 0", padding: "28px 34px", fontSize: 17, lineHeight: 1.78, fontStyle: "italic", color: "#fff" }}>
            {t.tQuote}
          </div>
        </Reveal>
      </div>

      {/* ── XP strip ────────────────────────────────────────── */}
      <div className="btl-sec" style={{ maxWidth: 1100, margin: "116px auto 0", padding: "0 32px" }}>
        <Reveal>
          <div className="btl-xp-card" style={{ background: "linear-gradient(120deg,rgba(255,183,229,.1),rgba(159,216,255,.09),rgba(197,179,255,.1))", border: "1px solid rgba(255,255,255,.1)", borderRadius: 28, padding: 52, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 44, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 490 }}>
              <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8", fontSize: 17, letterSpacing: ".5px", transform: "rotate(-2deg)" }}>{t.xpEye}</div>
              <div className="btl-xp-head" style={{ fontSize: 35, fontWeight: 900, letterSpacing: "-1.2px", lineHeight: 1.16, marginTop: 10 }}>
                {t.xpHead1}<span style={{ color: "#9FD8FF" }}>{t.xpHead2}</span>{t.xpHead3}
              </div>
              <div style={{ marginTop: 14, fontSize: 16, lineHeight: 1.68, color: "#fff", opacity: 0.92 }}>{t.xpBody}</div>
            </div>
            <div className="btl-xp-stats" style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {t.xpStats.map((s) => (
                <div key={s.label} style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${s.color}`, borderRadius: 20, padding: "24px 28px", textAlign: "center", minWidth: 116, boxShadow: `0 0 26px ${s.glow}`, animation: "bt-wiggle 6s ease-in-out infinite" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", color: s.color, textShadow: `0 0 24px ${s.glow}` }}>{s.value}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "1.6px", color: "#fff", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Meet Rizz strip ─────────────────────────────────── */}
      <div className="btl-sec" style={{ maxWidth: 1100, margin: "116px auto 0", padding: "0 32px" }}>
        <Reveal>
          <div className="btl-rizz-card" style={{ position: "relative", overflow: "hidden", background: "linear-gradient(120deg,rgba(179,136,255,.14),rgba(255,126,198,.1))", border: "1.5px solid rgba(179,136,255,.3)", borderRadius: 26, padding: "38px 44px", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", boxShadow: "0 0 40px rgba(179,136,255,.1)" }}>
            <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: "linear-gradient(90deg,transparent,#C5B3FF,#FFB7E5,transparent)", opacity: 0.7 }} />
            <img src={rizzAvatar} alt="Rizz" style={{ width: 92, height: 92, borderRadius: 22, objectFit: "cover", border: "2px solid #B388FF", boxShadow: "0 0 30px rgba(179,136,255,.5)", animation: "bt-float 7s ease-in-out infinite" }} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#C5B3FF", letterSpacing: ".5px", transform: "rotate(-2deg)" }}>{t.rizzEye}</div>
              <div className="btl-rizz-head" style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.8px", lineHeight: 1.2, marginTop: 6 }}>{t.rizzHead}</div>
              <div style={{ fontSize: 15, lineHeight: 1.62, color: "#fff", opacity: 0.9, marginTop: 8 }}>{t.rizzBody}</div>
            </div>
            <button
              onClick={openRizz}
              data-testid="button-rizz-cta"
              className="btl-nav-cta"
              style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15, color: "#050508", background: "linear-gradient(100deg,#B388FF,#FF7EC6)", border: "none", borderRadius: 12, padding: "16px 32px", whiteSpace: "nowrap", cursor: "pointer", boxShadow: "0 0 24px rgba(179,136,255,.4)", transition: "transform .2s" }}
            >
              {t.rizzCta}
            </button>
          </div>
        </Reveal>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="btl-foot" style={{ position: "relative", marginTop: 120, borderTop: "1px solid rgba(255,255,255,.08)", padding: "52px 48px 46px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, background: "linear-gradient(180deg,rgba(255,255,255,.022),transparent 70%)" }}>
        <div
          aria-hidden
          style={{
            position: "absolute", top: -1, left: 0, right: 0, height: 1.5,
            background: RAINBOW, backgroundSize: "200% 100%",
            animation: "bt-rainbow 9s linear infinite", opacity: 0.55,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={iconTransparent} alt="" className="btl-logo-img" style={{ width: 52, height: 52, objectFit: "contain" }} />
          <RainbowWordmark size={16} />
          <span style={{ fontSize: 14, color: "#fff", opacity: 0.92, marginLeft: 10 }}>{t.footMade}</span>
        </div>
        <div className="btl-foot-links" style={{ display: "flex", gap: 26, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
          <Link href="/privacy-policy"><span className="btl-foot-link" style={{ "--h": "#9FD8FF" } as React.CSSProperties}>{t.footPrivacy}</span></Link>
          <Link href="/terms-of-service"><span className="btl-foot-link" style={{ "--h": "#FFB7E5" } as React.CSSProperties}>{t.footTerms}</span></Link>
          <Link href="/privacy-policy"><span className="btl-foot-link" style={{ "--h": "#C5B3FF" } as React.CSSProperties}>{t.footPopia}</span></Link>
          <Link href="/refund-policy"><span className="btl-foot-link" style={{ "--h": "#FFE29A" } as React.CSSProperties}>{t.footBilling}</span></Link>
          <Link href="/terms-of-service"><span className="btl-foot-link" style={{ "--h": "#94F7C5" } as React.CSSProperties}>{t.footSafeguarding}</span></Link>
          <span onClick={openRizz} className="btl-foot-link" style={{ color: "#C5B3FF", cursor: "pointer", fontWeight: 800, "--h": "#FF7EC6" } as React.CSSProperties}>{t.footAskRizz}</span>
          {/* Owner shortcut — the sign-in page grants admin via the
              ADMIN_EMAILS allowlist, so this is just a convenient door. */}
          <Link href="/signin?returnTo=/learn/admin"><span className="btl-foot-link" data-testid="link-footer-admin" style={{ "--h": "#FFE29A" } as React.CSSProperties}>{t.footAdmin}</span></Link>
        </div>
      </div>

      {modal}
    </div>
  );
}
