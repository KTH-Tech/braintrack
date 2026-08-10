// BrainTrack landing — rebuilt to pixel-match the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, LANDING section).
// Near-black #050508 ground, rainbow wordmark, graffiti mural hero with
// Bebas display scatter, marquee, neon feature cards, ecosystem split,
// XP strip, share row, footer. Bilingual EN/AF. Rizz has no landing-page
// presence (owner decision) — the bot lives in signed-in areas only.
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  CalendarClock,
  BarChart3,
  ClipboardCheck,
  Bot,
  Eye,
  Trophy,
  ScrollText,
  Target,
  FileCheck,
  Globe2,
  Brain,
  Flame,
  Crown,
  Zap,
  Sparkles,
  ArrowRight,
  Rocket,
  Layers,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { useRolePromptNav } from "@/components/role-prompt-modal";
import iconTransparent from "@/assets/handoff/icon-transparent.png";
import heroGraffiti from "@/assets/hero-graffiti.png";
import { KthMark } from "@/components/kth-mark";
import { PublicFooter } from "@/components/public-footer";
import { RizzDemo } from "@/components/landing/rizz-demo";

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
    tForSchools: "For Schools",
    tEnter: "Log on",
    predictorBadge: "We don't guess what's on your paper — we've read 10 years of them.",
    heroHead1: "The learning platform that ",
    heroAccent: "doesn't feel like school",
    heroTail: ".",
    heroSub:
      "A CAPS-aligned matric ecosystem — diagnostics, study plans and parent visibility, all in one.",
    ctaStart: "Start now",
    ctaPlans: "See plans",
    heroAlt: "BrainTrack — Grade 12 matric, study smarter not harder",
    // Compact trust strip under the primary CTA — R169 anchor, cancel-anytime
    // risk reducer and POPIA-alignment. Keeps the hero copy tight while adding
    // the specificity search + conversion research says converts SA edtech.
    trustPrice: "R169/month",
    trustCancel: "Cancel anytime",
    trustPopia: "POPIA-compliant",
    trustSecure: "Paystack secure billing",
    marquee: [
      { text: "CAPS-aligned ✦", color: "#9FF5E8" },
      { text: "10 years of DBE data ★", color: "#FFB7E5" },
      { text: "EN + AF ⚡", color: "#FFE29A" },
      { text: "exam-style drills ✦", color: "#9FD8FF" },
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
      { icon: "📅", color: "#9FF5E8", chipBg: "rgba(159,245,232,.14)", glow: "rgba(159,245,232,.25)", tilt: -1, title: "Dynamic study plans", body: "Rebuilt daily around what you actually got wrong." },
      { icon: "📊", color: "#9FD8FF", chipBg: "rgba(159,216,255,.14)", glow: "rgba(159,216,255,.25)", tilt: 1, title: "DBE-data diagnostics", body: "Ten years of NSC trends — where matrics lose marks." },
      { icon: "📝", color: "#FFB7E5", chipBg: "rgba(255,183,229,.14)", glow: "rgba(255,183,229,.25)", tilt: -1, title: "Exam-style papers + memos", body: "Exam-style questions with worked memos, drilled by topic." },
      { icon: "🤖", color: "#C5B3FF", chipBg: "rgba(197,179,255,.14)", glow: "rgba(197,179,255,.25)", tilt: 1, title: "Rizz — your AI tutor", body: "EN + AF, 24/7. Explains it until it clicks." },
      { icon: "👀", color: "#FFE29A", chipBg: "rgba(255,226,154,.14)", glow: "rgba(255,226,154,.25)", tilt: -1, title: "Parent visibility", body: "Weekly reports parents actually read." },
      { icon: "🏆", color: "#94F7C5", chipBg: "rgba(148,247,197,.14)", glow: "rgba(148,247,197,.25)", tilt: 1, title: "XP, streaks & rewards", body: "Confetti for a nailed paper. Crowns for a streak." },
    ],
    proofEye: "the receipts",
    proofHead1: "Not claims. ",
    proofHead2: "Evidence.",
    proofSub:
      "Loaded in BrainTrack — indexed, verified, searchable by topic.",
    proof: [
      { icon: "📜", title: "A decade of NSC exam trends", detail: "2015 – 2025, studied sitting by sitting", color: "#9FF5E8", glow: "rgba(159,245,232,.28)" },
      { icon: "🎯", title: "Every CAPS subject covered", detail: "mapped across the full curriculum", color: "#FFB7E5", glow: "rgba(255,183,229,.28)" },
      { icon: "📝", title: "Modelled on real DBE exams", detail: "questions written to match the official format", color: "#9FD8FF", glow: "rgba(159,216,255,.28)" },
      { icon: "🌍", title: "EN + AF, always", detail: "with African-language support built in", color: "#C5B3FF", glow: "rgba(197,179,255,.28)" },
      { icon: "🧠", title: "Examiner patterns studied", detail: "profiled across the DBE archive", color: "#FFE29A", glow: "rgba(255,226,154,.28)" },
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
      "Which topics cost matrics the most marks last November? BrainTrack knows.",
    tQuote:
      "“Not a quiz app — matric readiness built on a decade of DBE exam patterns. No learner walks in blind.”",
    xpEye: "dopamine, but productive",
    xpHead1: "Every session drops ",
    xpHead2: "XP, streaks",
    xpHead3: " and reward reveals",
    xpBody:
      "Put in the work — parents and schools get clean, executive reports.",
    xpStats: [
      { value: "+120", label: "XP / session", color: "#9FF5E8", glow: "rgba(159,245,232,.25)" },
      { value: "21🔥", label: "day streak", color: "#FFB7E5", glow: "rgba(255,183,229,.25)" },
      { value: "12", label: "crowns", color: "#FFE29A", glow: "rgba(255,226,154,.25)" },
    ],
    proofVerify: "6 months of testing and verification behind every question",
    shareEye: "spread the word",
    shareHead: "Share BrainTrack",
    shareMsg:
      "BrainTrack — Grade 12 matric prep: past papers, memos, a 24/7 AI tutor. Try it:",
    referralLine: "Refer a friend — you both earn rewards.",
    referralCta: "Get your referral link →",
    footMade: "© 2026 — Made in South Africa",
    footPrivacy: "Privacy",
    footTerms: "Terms",
    footPopia: "POPIA",
    footBilling: "Billing",
    footSafeguarding: "Safeguarding",
    footAdmin: "Admin",
    footPowered: "KTH Tech",
    // ── Minimal gravity-wall footer (owner mid-task redirect) ─────────────
    // Brand-first, not a link farm. 4 links max in the centre cluster.
    footTagline: "Grade 12 Matric prep for South Africa.",
    footLegalLine:
      "© 2026 KTH Projects (Pty) Ltd · Reg 2025/627290/07 · Charges appear as KTH-TECH · braintrack.tech",
    footMinLinks: [
      { href: "/terms-of-service",              label: "Terms" },
      { href: "/privacy-policy",                label: "Privacy" },
      { href: "/refund-policy",                 label: "Refunds" },
      { href: "mailto:hello@braintrack.tech",   label: "Contact" },
    ],
    // ── BrainTrack vs. other matric sites — animated split-screen ─────────
    compareEye: "head-to-head",
    compareHead1: "BrainTrack vs. ",
    compareHead2: "other matric sites",
    compareSub:
      "PDFs and generic drills stop at the download. BrainTrack keeps going — memos in the learner's voice, weakness-first practice, reports parents read.",
    cmpOther: "Other matric sites",
    cmpUs: "BrainTrack",
    cmpRows: [
      { criterion: "Past papers",                    other: "Yes",                        otherIcon: "✓", otherColor: "#9FF5E8", us: "Yes — with real examiner intent" },
      { criterion: "Answer memos",                   other: "Sometimes",                  otherIcon: "~", otherColor: "#FFE29A", us: "Every question, in your voice" },
      { criterion: "Adaptive practice",              other: "No",                         otherIcon: "✗", otherColor: "#FFB7E5", us: "Weakness-first, updated daily" },
      { criterion: "Bilingual (EN + Afrikaans)",     other: "Rare",                       otherIcon: "~", otherColor: "#FFE29A", us: "Every subject" },
      { criterion: "Parent progress view",           other: "No",                         otherIcon: "✗", otherColor: "#FFB7E5", us: "Weekly summary + WhatsApp nudge" },
      { criterion: "Costs",                          other: "Free (with ads) or R100s",   otherIcon: "~", otherColor: "#FFE29A", us: "R169/month · cancel anytime" },
      { criterion: "School reporting",               other: "No",                         otherIcon: "✗", otherColor: "#FFB7E5", us: "Per-school dashboard" },
    ],
    compareCta: "Start now — R169/month, cancel anytime",
  },
  af: {
    tFeatures: "Funksies",
    tResearch: "Navorsing",
    tSubjects: "Vakke",
    tPricing: "Pryse",
    tForSchools: "Vir Skole",
    tEnter: "Meld aan",
    predictorBadge: "Ons raai nie wat op jou vraestel is nie — ons het 10 jaar s'n gelees.",
    heroHead1: "Die leerplatform wat ",
    heroAccent: "nie soos skool voel nie",
    heroTail: ".",
    heroSub:
      "'n KABV-belynde matriek-ekosisteem — diagnostiek, studieplanne en ouersigbaarheid, alles in een.",
    ctaStart: "Begin nou",
    ctaPlans: "Sien planne",
    heroAlt: "BrainTrack — Graad 12-matriek, leer slimmer nie harder nie",
    trustPrice: "R169/maand",
    trustCancel: "Kanselleer enige tyd",
    trustPopia: "POPIA-nakomend",
    trustSecure: "Paystack veilige betaling",
    marquee: [
      { text: "KABV-belyn ✦", color: "#9FF5E8" },
      { text: "10 jaar DBE-data ★", color: "#FFB7E5" },
      { text: "AF + EN ⚡", color: "#FFE29A" },
      { text: "eksamenstyl-drille ✦", color: "#9FD8FF" },
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
      { icon: "📅", color: "#9FF5E8", chipBg: "rgba(159,245,232,.14)", glow: "rgba(159,245,232,.25)", tilt: -1, title: "Dinamiese studieplanne", body: "Daagliks herbou rondom wat jy verkeerd gekry het." },
      { icon: "📊", color: "#9FD8FF", chipBg: "rgba(159,216,255,.14)", glow: "rgba(159,216,255,.25)", tilt: 1, title: "DBE-datadiagnostiek", body: "Tien jaar se NSS-neigings — waar matrieks punte verloor." },
      { icon: "📝", color: "#FFB7E5", chipBg: "rgba(255,183,229,.14)", glow: "rgba(255,183,229,.25)", tilt: -1, title: "Eksamenstyl-vraestelle + memo's", body: "Eksamenstyl-vrae met uitgewerkte memo's, per onderwerp gedril." },
      { icon: "🤖", color: "#C5B3FF", chipBg: "rgba(197,179,255,.14)", glow: "rgba(197,179,255,.25)", tilt: 1, title: "Rizz — jou KI-tutor", body: "AF + EN, 24/7. Verduidelik totdat dit klik." },
      { icon: "👀", color: "#FFE29A", chipBg: "rgba(255,226,154,.14)", glow: "rgba(255,226,154,.25)", tilt: -1, title: "Ouersigbaarheid", body: "Weeklikse verslae wat ouers regtig lees." },
      { icon: "🏆", color: "#94F7C5", chipBg: "rgba(148,247,197,.14)", glow: "rgba(148,247,197,.25)", tilt: 1, title: "XP, reekse & belonings", body: "Konfetti vir 'n geklopte vraestel. Krone vir 'n reeks." },
    ],
    proofEye: "die bewyse",
    proofHead1: "Nie beloftes nie. ",
    proofHead2: "Bewyse.",
    proofSub:
      "In BrainTrack gelaai — geïndekseer, geverifieer, per onderwerp deursoekbaar.",
    proof: [
      { icon: "📜", title: "'n Dekade se NSS-eksamenneigings", detail: "2015 – 2025, sitting vir sitting bestudeer", color: "#9FF5E8", glow: "rgba(159,245,232,.28)" },
      { icon: "🎯", title: "Elke KABV-vak gedek", detail: "gekarteer oor die volle kurrikulum", color: "#FFB7E5", glow: "rgba(255,183,229,.28)" },
      { icon: "📝", title: "Op regte DBE-eksamens gemodelleer", detail: "vrae geskryf om by die amptelike formaat te pas", color: "#9FD8FF", glow: "rgba(159,216,255,.28)" },
      { icon: "🌍", title: "AF + EN, altyd", detail: "met Afrikataal-ondersteuning ingebou", color: "#C5B3FF", glow: "rgba(197,179,255,.28)" },
      { icon: "🧠", title: "Eksaminatorpatrone bestudeer", detail: "geprofileer oor die DBE-argief", color: "#FFE29A", glow: "rgba(255,226,154,.28)" },
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
      "Watter onderwerpe het matrieks verlede November die meeste punte gekos? BrainTrack weet.",
    tQuote:
      "“Nie 'n vasvra-app nie — matriekgereedheid gebou op 'n dekade se DBE-eksamenpatrone. Geen leerder stap blind in nie.”",
    xpEye: "dopamien, maar produktief",
    xpHead1: "Elke sessie laat val ",
    xpHead2: "XP, reekse",
    xpHead3: " en beloningsonthullings",
    xpBody:
      "Sit die werk in — ouers en skole kry skoon, uitvoerende verslae.",
    xpStats: [
      { value: "+120", label: "XP / sessie", color: "#9FF5E8", glow: "rgba(159,245,232,.25)" },
      { value: "21🔥", label: "dae-reeks", color: "#FFB7E5", glow: "rgba(255,183,229,.25)" },
      { value: "12", label: "krone", color: "#FFE29A", glow: "rgba(255,226,154,.25)" },
    ],
    proofVerify: "6 maande se toetsing en verifikasie agter elke vraag",
    shareEye: "sprei die woord",
    shareHead: "Deel BrainTrack",
    shareMsg:
      "BrainTrack — Graad 12-matriekvoorbereiding: vraestelle, memo's, 'n 24/7 KI-tutor. Probeer dit:",
    referralLine: "Verwys 'n vriend — julle albei verdien belonings.",
    referralCta: "Kry jou verwysingskakel →",
    footMade: "© 2026 — Gemaak in Suid-Afrika",
    footPrivacy: "Privaatheid",
    footTerms: "Bepalings",
    footPopia: "POPIA",
    footBilling: "Betaling",
    footSafeguarding: "Beskerming",
    footAdmin: "Admin",
    footPowered: "KTH Tech",
    // ── Minimale muur-graffiti-voetskrif (eienaar-redigering) ─────────────
    footTagline: "Graad 12-matriekvoorbereiding vir Suid-Afrika.",
    footLegalLine:
      "© 2026 KTH Projects (Pty) Ltd · Reg 2025/627290/07 · Bedrae verskyn as KTH-TECH · braintrack.tech",
    footMinLinks: [
      { href: "/terms-of-service",              label: "Bepalings" },
      { href: "/privacy-policy",                label: "Privaatheid" },
      { href: "/refund-policy",                 label: "Terugbetalings" },
      { href: "mailto:hello@braintrack.tech",   label: "Kontak" },
    ],
    // ── BrainTrack teen ander matriekwerwe — geanimeerde geskeide skerm ──
    compareEye: "kop-teen-kop",
    compareHead1: "BrainTrack teen ",
    compareHead2: "ander matriekwerwe",
    compareSub:
      "PDF's en generiese drille eindig by die aflaai. BrainTrack gaan verder — memo's in die leerder se stem, swakplek-eerste oefening, verslae wat ouers lees.",
    cmpOther: "Ander matriekwerwe",
    cmpUs: "BrainTrack",
    cmpRows: [
      { criterion: "Vraestelle",                       other: "Ja",                           otherIcon: "✓", otherColor: "#9FF5E8", us: "Ja — met regte eksamenbedoeling" },
      { criterion: "Antwoordmemo's",                   other: "Soms",                         otherIcon: "~", otherColor: "#FFE29A", us: "Elke vraag, in jou stem" },
      { criterion: "Aanpasbare oefening",              other: "Nee",                          otherIcon: "✗", otherColor: "#FFB7E5", us: "Swakplek-eerste, daagliks bygewerk" },
      { criterion: "Tweetalig (EN + Afrikaans)",       other: "Skaars",                       otherIcon: "~", otherColor: "#FFE29A", us: "Elke vak" },
      { criterion: "Ouer-vorderingsuitsig",            other: "Nee",                          otherIcon: "✗", otherColor: "#FFB7E5", us: "Weeklikse opsomming + WhatsApp-stoot" },
      { criterion: "Koste",                            other: "Gratis (met advertensies) of R100e", otherIcon: "~", otherColor: "#FFE29A", us: "R169/maand · kanselleer enige tyd" },
      { criterion: "Skoolverslaggewing",               other: "Nee",                          otherIcon: "✗", otherColor: "#FFB7E5", us: "Per-skool-dashbord" },
    ],
    compareCta: "Begin nou — R169/maand, kanselleer enige tyd",
  },
} as const;

// Feature-card icons (Lucide) — index-aligned with COPY.<lang>.features so the
// icon stays consistent across EN/AF without duplicating JSX inside COPY.
// Keeping this outside COPY lets us swap emoji-only strings for real vector
// icons while preserving the `as const` typing of the copy tables.
const FEATURE_ICONS = [
  <CalendarClock size={26} strokeWidth={2.2} aria-hidden />,
  <BarChart3 size={26} strokeWidth={2.2} aria-hidden />,
  <ClipboardCheck size={26} strokeWidth={2.2} aria-hidden />,
  <Bot size={26} strokeWidth={2.2} aria-hidden />,
  <Eye size={26} strokeWidth={2.2} aria-hidden />,
  <Trophy size={26} strokeWidth={2.2} aria-hidden />,
];

// Proof-band icons (Lucide) — index-aligned with COPY.<lang>.proof.
const PROOF_ICONS = [
  <ScrollText size={30} strokeWidth={2.2} aria-hidden />,
  <Target size={30} strokeWidth={2.2} aria-hidden />,
  <FileCheck size={30} strokeWidth={2.2} aria-hidden />,
  <Globe2 size={30} strokeWidth={2.2} aria-hidden />,
  <Brain size={30} strokeWidth={2.2} aria-hidden />,
];

// XP-strip stat icons — index-aligned with COPY.<lang>.xpStats.
const XP_ICONS = [
  <Zap size={22} strokeWidth={2.4} aria-hidden />,
  <Flame size={22} strokeWidth={2.4} aria-hidden />,
  <Crown size={22} strokeWidth={2.4} aria-hidden />,
];

// Display-font scatter marks around the hero — positions from the comp.
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
    // Fail-safe FIRST — set unconditionally, before any early return. Nothing
    // may ever stay invisible: not if the ref never attaches, not if the
    // observer never fires (throttled tab, odd embed, exotic browser). A blank
    // section is a launch bug; a slightly-early reveal is not.
    const failSafe = window.setTimeout(() => setInView(true), 1500);
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return () => window.clearTimeout(failSafe);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      // Reveal EARLY: any sliver of the element within 25% below the viewport
      // triggers it. The old 12%-visible/-8% margin made sections fade in only
      // once well inside the viewport, so fast scrollers (and short mobile
      // viewports) saw stretches of blank page.
      { threshold: 0.01, rootMargin: "0px 0px 25% 0px" },
    );
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(failSafe); };
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
          // bt-rise is a real, defined keyframe (bt-fadeup never existed, so the
          // old animation was a no-op and the ONLY effect was opacity:0-until-JS).
          ? { ...style, animation: `bt-rise .85s cubic-bezier(.22,.75,.3,1) ${delay}ms both` }
          // Visible by default — a failed / never-firing scroll observer costs the
          // entrance motion, never the content. No opacity:0 void can occur.
          : { ...style }
      }
    >
      {children}
    </div>
  );
}

/** BrainTrack vs. other matric sites — the animated head-to-head wall.
 *  Copy lives in COPY.cmpRows (EN+AF, written when this section was first
 *  designed; the section itself was never rendered until now). Scroll-triggered
 *  via the file's useInView: headers slam in from opposite sides, the VS badge
 *  pops with overshoot, rows stagger up 110ms apart. All keyframes bt- prefixed
 *  (kill-switch exempt) and fully disabled under prefers-reduced-motion. */
function CompareWall({ t, language }: { t: any; language: string }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`btl-sec ${inView ? "bt-cmp-in" : ""}`}
      style={{ maxWidth: 1020, margin: "104px auto 0", padding: "0 32px" }}
      data-testid="section-compare"
    >
      <style>{`
        /* Entrance is TRANSFORM-ONLY — content is NEVER hidden by default, so a
           failed/never-firing scroll observer can only cost the animation, never
           the content. (A prior opacity:0-by-default version left the whole
           table invisible when the reveal didn't fire — an ~800px black void.) */
        .bt-cmp-in .bt-cmp-head-l { animation: bt-cmp-left .5s cubic-bezier(.22,.75,.3,1) both; }
        .bt-cmp-in .bt-cmp-head-r { animation: bt-cmp-right .5s cubic-bezier(.22,.75,.3,1) both; }
        .bt-cmp-in .bt-cmp-vs { animation: bt-cmp-pop .55s cubic-bezier(.34,1.56,.64,1) .22s both; }
        .bt-cmp-in .bt-cmp-row { animation: bt-cmp-up .5s cubic-bezier(.22,.75,.3,1) both; animation-delay: calc(.18s + var(--i) * .11s); }
        @keyframes bt-cmp-left  { from { transform: translateX(-48px); } to { transform: none; } }
        @keyframes bt-cmp-right { from { transform: translateX(48px); }  to { transform: none; } }
        @keyframes bt-cmp-pop   { 0% { transform: scale(.3) rotate(-16deg); } 70% { transform: scale(1.18) rotate(4deg); } 100% { transform: scale(1) rotate(-2deg); } }
        @keyframes bt-cmp-up    { from { transform: translateY(24px); } to { transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .bt-cmp-row, .bt-cmp-vs, .bt-cmp-head-l, .bt-cmp-head-r { animation: none !important; }
        }
        .bt-cmp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 14px; }
        .bt-cmp-crit { grid-column: 1 / -1; }
        @media (max-width: 700px) { .bt-cmp-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 34 }}>
        <span style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: 16, color: "#FFB7E5", transform: "rotate(-2deg)", display: "inline-block" }}>
          {t.compareEye}
        </span>
        <div className="btl-sec-head" style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1.2px", lineHeight: 1.14, marginTop: 10, color: "#fff" }}>
          {t.compareHead1}
          <span style={{ background: "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
            {t.compareHead2}
          </span>
        </div>
        <p className="btl-sec-sub" style={{ marginTop: 12, fontSize: 15.5, lineHeight: 1.6, color: "#fff", maxWidth: 640, margin: "12px auto 0" }}>
          {t.compareSub}
        </p>
      </div>

      {/* Split headers + VS badge */}
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div
          className="bt-cmp-head-l"
          style={{
            background: "#050508", border: "2px solid #9FD8FF", borderRadius: 14,
            padding: "12px 16px", textAlign: "center", transform: "rotate(-.5deg)",
            fontFamily: "'Bebas Neue', system-ui, sans-serif",
            fontSize: 19, letterSpacing: 2.5, textTransform: "uppercase", color: "#fff",
          }}
        >
          {t.cmpOther}
        </div>
        <div
          className="bt-cmp-head-r"
          style={{
            background: "#94F7C5", border: "2.5px solid #050508", borderRadius: 14,
            boxShadow: "5px 5px 0 0 #94F7C5",
            padding: "12px 16px", textAlign: "center", transform: "rotate(.5deg)",
            fontFamily: "'Bebas Neue', system-ui, sans-serif",
            fontSize: 19, letterSpacing: 2.5, textTransform: "uppercase", color: "#050508", fontWeight: 800,
          }}
        >
          {t.cmpUs}
        </div>
        <span
          className="bt-cmp-vs"
          aria-hidden
          style={{
            position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
            background: "#FFE29A", color: "#050508", border: "3px solid #050508",
            borderRadius: 999, width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: 20, zIndex: 2,
            boxShadow: "3px 3px 0 0 rgba(0,0,0,.85)",
          }}
        >
          VS
        </span>
      </div>

      {/* Rows — other (muted) vs BrainTrack (mint sticker), staggered reveal */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {(t.cmpRows as Array<{ criterion: string; other: string; otherIcon: string; otherColor: string; us: string }>).map((r, i) => (
          <div key={r.criterion} className="bt-cmp-row" style={{ ["--i" as string]: i }}>
            <p
              className="bt-cmp-crit"
              style={{
                fontFamily: "'Bebas Neue', system-ui, sans-serif",
                fontSize: 14, letterSpacing: 2.5, textTransform: "uppercase",
                color: "#9FD8FF", margin: "0 0 7px",
              }}
            >
              {r.criterion}
            </p>
            <div className="bt-cmp-grid">
              <div
                style={{
                  background: "#050508", border: "1.5px solid #9FD8FF", borderRadius: 12,
                  padding: "12px 15px", display: "flex", alignItems: "center", gap: 10,
                  color: "#fff", fontSize: 14, transform: "rotate(-.3deg)",
                }}
              >
                <span style={{ color: r.otherColor, fontWeight: 900, fontSize: 16, flex: "none" }}>{r.otherIcon}</span>
                <span>{r.other}</span>
              </div>
              <div
                style={{
                  background: "#050508", border: "2.5px solid #94F7C5", borderRadius: 12,
                  boxShadow: "4px 4px 0 0 #94F7C5",
                  padding: "12px 15px", display: "flex", alignItems: "center", gap: 10,
                  color: "#fff", fontSize: 14, fontWeight: 700, transform: "rotate(.3deg)",
                }}
              >
                <span style={{ color: "#94F7C5", fontWeight: 900, fontSize: 16, flex: "none" }}>✓</span>
                <span>{r.us}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 34 }}>
        <a
          href="/subscribe"
          className="pub-btn"
          data-testid="compare-cta"
          style={{ display: "inline-block", textDecoration: "none" }}
        >
          {t.compareCta}
        </a>

        {/* Share the head-to-head — WhatsApp is THE SA share channel; the
            og-image.jpg preview renders on the receiving side. */}
        <div style={{ marginTop: 16 }}>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              (language === "af"
                ? "BrainTrack vs ander matriekwebwerwe — kyk self na die vergelyking 🎓 "
                : "BrainTrack vs other matric sites — see the head-to-head for yourself 🎓 ") +
              "https://braintrack.tech/",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="compare-share-whatsapp"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#25D366", color: "#fff",
              border: "2.5px solid #050508", borderRadius: 10,
              boxShadow: "4px 4px 0 0 rgba(37,211,102,.45)",
              padding: "11px 22px", fontWeight: 800, fontSize: 14,
              textDecoration: "none", transform: "rotate(.4deg)",
            }}
          >
            {language === "af" ? "Deel op WhatsApp" : "Share on WhatsApp"}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { language, toggleLanguage } = useLanguage();
  const t = COPY[language];
  const { handleCta, modal } = useRolePromptNav();
  const en = language === "en";

  // FAQPage JSON-LD — five highest-intent SA matric-parent questions.
  // Kept short + literal so Google can lift them into rich-result FAQ blocks
  // on the SERP. Update copy here rather than duplicating a landing FAQ block.
  const landingJsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is BrainTrack aligned with the South African CAPS curriculum?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. Every subject, weekly plan and practice paper on BrainTrack is built to the official DBE CAPS curriculum for Grade 12, including English HL/FAL, Afrikaans HL/EAT, Mathematics, Physical Sciences, Life Sciences, Accounting, Business Studies, Economics, Geography, History, Life Orientation, CAT and IT.",
          },
        },
        {
          "@type": "Question",
          name: "How much does BrainTrack cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "BrainTrack is R169 per learner per month, charged at signup. Billing is handled securely by Paystack in South African Rand. You can cancel any time from the parent dashboard — no lock-in.",
          },
        },
        {
          "@type": "Question",
          name: "Does BrainTrack cover the NSC 2026 past papers and memos?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "BrainTrack indexes ten years of NSC past papers and official memos (2015–2025) across every CAPS subject, plus exam-style practice questions written by BrainTrack examiners in the DBE format for NSC 2026 preparation.",
          },
        },
        {
          "@type": "Question",
          name: "Is BrainTrack available in Afrikaans as well as English?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. The full platform — content, AI tutor, parent reports and past-paper library — is bilingual in English and Afrikaans, with a language toggle on every page.",
          },
        },
        {
          "@type": "Question",
          name: "Is BrainTrack safe for learners and POPIA-compliant?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. BrainTrack is POPIA-compliant. Learner accounts under 18 require a parent-consent step where the parent completes payment at signup, no card details are ever stored by BrainTrack, and parents receive a weekly progress report.",
          },
        },
      ],
    },
  ];

  useSEO({
    title: "BrainTrack™ | Grade 12 Matric Past Papers, Memos & AI Tutor — South Africa",
    description:
      "Pass Matric with confidence. 10 years of NSC past papers + memos, CAPS-aligned weekly study plan, AI tutor and parent reports. Built for SA Grade 12. R169/month — cancel anytime.",
    canonical: "https://braintrack.tech/",
    ogTitle: "Matric Past Papers, Memos & AI Tutor for Grade 12 SA | BrainTrack™",
    ogDescription:
      "10 years of NSC past papers + memos, CAPS-aligned weekly revision, AI tutor and parent reports. R169/month — cancel anytime.",
    jsonLd: landingJsonLd,
  });

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
          background: #0e0d12 !important;
        }
        .btl-feature:hover::before { opacity: 1; }
        .btl-feature:hover::after { opacity: 1; }
        .btl-fchip { transition: transform .38s cubic-bezier(.22,.75,.3,1), box-shadow .38s ease; }
        .btl-feature:hover .btl-fchip { transform: translateY(-3px) scale(1.07); }
        .btl-proof-cell { transition: transform .35s cubic-bezier(.22,.75,.3,1), border-color .35s, box-shadow .35s; }
        .btl-proof-cell:hover { transform: translateY(-6px); border-color: var(--c) !important; box-shadow: 0 18px 46px var(--glow); }
        .btl-eco-chip { transition: transform .25s, box-shadow .25s, background .25s; }
        .btl-eco-chip:hover { transform: translateY(-2px); }
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
          .btl-proof-cell { padding: 24px 14px 22px !important; }
          .btl-sec { margin-top: 68px !important; padding-left: 20px !important; padding-right: 20px !important; }
          .btl-sec-head { font-size: 28px !important; letter-spacing: -.6px !important; }
          .btl-sec-sub { font-size: 15px !important; }
          .btl-xp-card { padding: 30px 22px !important; border-radius: 22px !important; gap: 26px !important; }
          .btl-xp-head { font-size: 25px !important; }
          .btl-xp-stats { gap: 12px !important; width: 100%; }
          .btl-xp-stats > * { flex: 1 1 30%; min-width: 0 !important; padding: 18px 10px !important; }
          .btl-quote { font-size: 15px !important; padding: 20px 22px !important; }
          .btl-foot { padding: 36px 22px !important; flex-direction: column; align-items: flex-start !important; }
          .btl-foot-links { gap: 16px 18px !important; }
          .btl-foot-row-min { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 22px !important; }
          .btl-foot-row-min > * { justify-content: center !important; text-align: center !important; }
          .btl-foot-left-cluster { flex-direction: column !important; text-align: center !important; align-items: center !important; }
          .btl-foot-links-min { justify-content: center !important; gap: 14px 20px !important; }
        }
        @media (max-width: 480px) {
          .btl-nav { padding: 12px 10px !important; gap: 6px !important; }
          .btl-nav-left { gap: 6px !important; }
          .btl-nav-left img { width: 34px !important; height: 34px !important; }
          .btl-nav-left .bt-wordmark { font-size: 17px !important; }
          .btl-nav-right { gap: 6px !important; }
          .btl-nav-right [data-testid="lang-toggle"] span { padding: 5px 7px !important; }
          .btl-nav-cta { padding: 8px 12px !important; font-size: 12px !important; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <div
        className="btl-nav"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, padding: "16px 48px", position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,5,8,.82)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid #C5B3FF",
        }}
      >
        <div className="btl-nav-left" style={{ display: "flex", alignItems: "center", gap: 10, flex: "none", minWidth: 0 }}>
          <img src={iconTransparent} alt="BrainTrack" className="btl-logo-img" style={{ width: 56, height: 56, objectFit: "contain", flex: "none" }} />
          <RainbowWordmark size={24} />
        </div>
        <div className="btl-nav-right" style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 14, fontWeight: 600, flex: "none" }}>
          <span className="btl-nav-links" style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Link href="/features"><span className="btl-nav-link" style={{ "--h": "#9FF5E8" } as React.CSSProperties}>{t.tFeatures}</span></Link>
            <Link href="/research"><span className="btl-nav-link" style={{ "--h": "#9FD8FF" } as React.CSSProperties}>{t.tResearch}</span></Link>
            <Link href="/features"><span className="btl-nav-link" style={{ "--h": "#FFB7E5" } as React.CSSProperties}>{t.tSubjects}</span></Link>
            <Link href="/subscribe"><span className="btl-nav-link" style={{ "--h": "#FFE29A" } as React.CSSProperties}>{t.tPricing}</span></Link>
            <Link href="/for-schools"><span className="btl-nav-link" style={{ "--h": "#C5B3FF" } as React.CSSProperties}>{t.tForSchools}</span></Link>
          </span>
          <span
            onClick={toggleLanguage}
            data-testid="lang-toggle"
            style={{
              display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 800,
              border: "1.5px solid #9FD8FF", borderRadius: 8,
              overflow: "hidden", cursor: "pointer", userSelect: "none", flex: "none",
            }}
          >
            <span style={{ padding: "6px 10px", background: en ? "#9FF5E8" : "transparent", color: en ? "#050508" : "#fff" }}>EN</span>
            <span style={{ padding: "6px 10px", background: en ? "transparent" : "#9FF5E8", color: en ? "#fff" : "#050508" }}>AF</span>
          </span>
          <a href="/signin" style={{ flex: "none" }}>
            <button
              className="pub-btn pub-btn-sm btl-nav-cta"
              data-testid="button-nav-enter"
            >
              {t.tEnter}
            </button>
          </a>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px 36px", textAlign: "center" }}>
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
              position: "absolute", fontFamily: "'Bebas Neue', system-ui, sans-serif",
              fontSize: s.size, color: s.color,
              // Floating graffiti: each mark bobs + sways on a staggered cycle so
              // the tags drift independently. --mr carries the mark's own rotation
              // so the float keyframe keeps it. transform below is the resting
              // fallback if the animation is ever blocked (kill-switch / reduced
              // motion) — the mark stays rotated in place, never a bare glyph.
              ["--mr" as string]: `${s.rotate}deg`,
              transform: `rotate(${s.rotate}deg)`,
              animation: `bt-heromark ${(3.6 + (i % 4) * 0.7).toFixed(1)}s ease-in-out ${(i * 0.25).toFixed(2)}s infinite`,
              willChange: "transform",
              zIndex: 1, pointerEvents: "none", ...s.style,
            }}
          >
            {s.glyph}
          </span>
        ))}
        <div style={{ maxWidth: 1040, width: "100%", marginTop: 8, position: "relative", zIndex: 2 }}>
          {/* Exam Predictor teaser — the hero differentiator, one tight honest
              line. Sells the 10-year corpus without bloating the trimmed hero. */}
          <div
            data-testid="hero-predictor-badge"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              margin: "0 auto 16px", padding: "8px 16px", borderRadius: 999,
              border: "1.5px solid #9FF5E8", background: "rgba(159,245,232,.08)",
              fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13.5,
              color: "#fff", letterSpacing: ".2px",
            }}
          >
            <Target size={16} strokeWidth={2.6} style={{ color: "#9FF5E8" }} aria-hidden />
            {t.predictorBadge}
          </div>
          {/* Hero centerpiece — founder's final pick (2026-08-10): the graffiti
              art hero from the launch deploy. The transparent PNG's black
              linework vanished on the near-black ground before, so the art now
              sits on a light "concrete wall" panel (every stroke visible) with
              a slow float (bt-heromark @ --mr:0deg = pure bob, exempt from the
              reduced-motion kill-switch via its own media rule). */}
          <div
            style={{
              background: "#FBF7ED",
              border: "2.5px solid #050508",
              borderRadius: 24,
              padding: "14px 14px 8px",
              maxWidth: 1040,
              margin: "0 auto",
              boxShadow: "8px 8px 0 0 #C5B3FF",
              animation: "bt-heromark 7s ease-in-out infinite",
              ["--mr" as any]: "0deg",
            }}
          >
            <img
              src={heroGraffiti}
              alt={t.heroAlt}
              data-testid="hero-title"
              style={{ display: "block", width: "100%", height: "auto", objectFit: "contain" }}
            />
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
            <button
              onClick={handleCta}
              className="pub-btn"
              data-testid="button-hero-cta"
              style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
            >
              <Rocket size={18} strokeWidth={2.6} aria-hidden />
              {t.ctaStart}
              <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
            </button>
            <a href="/subscribe" style={{ flex: "none", textDecoration: "none" }}>
              <button
                className="pub-btn-outline"
                data-testid="button-hero-plans"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                {t.ctaPlans}
                <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
              </button>
            </a>
          </div>
          {/* Trust strip — above-the-fold price + risk-reducer + POPIA + billing
              partner. Owner request: put the R169 anchor near the primary CTA
              so scrolling parents see it in the first 3 seconds. */}
          <div
            data-testid="hero-trust-strip"
            style={{
              display: "flex", justifyContent: "center", flexWrap: "wrap",
              gap: "8px 22px", marginTop: 18, fontSize: 13.5, fontWeight: 700,
              color: "#fff", letterSpacing: ".2px",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#9FF5E8" }}>✓</span>{t.trustPrice}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#FFB7E5" }}>✓</span>{t.trustCancel}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#C5B3FF" }}>✓</span>{t.trustPopia}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#FFE29A" }}>✓</span>{t.trustSecure}
            </span>
          </div>
        </div>
      </div>

      {/* ── Marquee ─────────────────────────────────────────── */}
      <div style={{ overflow: "hidden", borderTop: "1px solid #C5B3FF", borderBottom: "1px solid #C5B3FF", padding: "14px 0", margin: "40px 0 0" }}>
        <div
          style={{
            display: "flex", gap: 48, width: "max-content",
            animation: "bt-marquee 22s linear infinite",
            fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: 18, whiteSpace: "nowrap",
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
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#FFB7E5",
              fontSize: 17, letterSpacing: ".5px", transform: "rotate(-2deg)",
            }}
          >
            <Layers size={20} strokeWidth={2.4} color="#FFB7E5" aria-hidden />
            <span>{t.tDrop}</span>
          </div>
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
                  background: "#0e0d12",
                  border: `2px solid ${f.color}`, borderRadius: 22,
                  padding: 28, cursor: "default", width: "100%",
                } as React.CSSProperties}
              >
                <div
                  className="btl-fchip"
                  style={{
                    width: 54, height: 54, borderRadius: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: f.chipBg, marginBottom: 18,
                    color: f.color, // Lucide inherits color; the emoji stays as fallback below
                    border: `1px solid ${f.color}`,
                    boxShadow: `0 6px 18px ${f.glow}`,
                  }}
                >
                  <span aria-hidden style={{ color: f.color, display: "inline-flex" }}>
                    {FEATURE_ICONS[i] ?? f.icon}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18.5, letterSpacing: "-.2px", marginBottom: 9 }}>{f.title}</div>
                <div style={{ fontSize: 15, lineHeight: 1.62, color: "#fff" }}>{f.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Rizz interactive demo ─────────────────────────────
          Three real Grade-12 MCQs; correct answers fire ConfettiBurst. */}
      <RizzDemo language={language} />

      {/* ── Proof band: the receipts ────────────────────────── */}
      <div className="btl-sec" style={{ maxWidth: 1100, margin: "112px auto 0", padding: "0 32px" }}>
        <div
          style={{
            position: "relative", overflow: "hidden", borderRadius: 30,
            border: "1.5px solid #9FD8FF",
            background: "#0b0b12",
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
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#9FF5E8",
                fontSize: 17, letterSpacing: ".5px", transform: "rotate(-2deg)",
              }}
            >
              <FileCheck size={20} strokeWidth={2.4} color="#9FF5E8" aria-hidden />
              <span>{t.proofEye}</span>
            </div>
            <div className="btl-sec-head" style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-1.6px", lineHeight: 1.1, marginTop: 10 }}>
              {t.proofHead1}
              <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>{t.proofHead2}</span>
            </div>
            <div className="btl-sec-sub" style={{ marginTop: 16, fontSize: 16.5, lineHeight: 1.68, color: "#fff" }}>{t.proofSub}</div>
            {/* Credibility chip — evidence-toned, not salesy. */}
            <div
              data-testid="badge-proof-verified"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginTop: 18,
                border: "1.5px solid #94F7C5", borderRadius: 999, padding: "9px 18px",
                fontSize: 13.5, fontWeight: 700, color: "#94F7C5",
                background: "rgba(148,247,197,.08)",
              }}
            >
              <span aria-hidden>✓</span>
              <span>{t.proofVerify}</span>
            </div>
          </Reveal>
          {/* Qualitative evidence cards — no internal counts on the landing
              page (owner request). Confidence without exact figures. */}
          <div
            className="btl-proof-grid"
            data-testid="proof-band"
            style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 18 }}
          >
            {t.proof.map((p, i) => (
              <Reveal key={p.title} delay={i * 90} style={{ display: "flex" }}>
                <div
                  className="btl-proof-cell"
                  style={{
                    "--c": p.color, "--glow": p.glow,
                    position: "relative", padding: "26px 18px", textAlign: "center",
                    borderRadius: 22, border: "1.5px solid " + p.color,
                    background: "#0e0d12",
                    boxShadow: "0 10px 34px " + p.glow, width: "100%", boxSizing: "border-box",
                  } as React.CSSProperties}
                >
                  <div
                    aria-hidden
                    style={{
                      width: 52, height: 52, borderRadius: 14,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 12,
                      color: p.color,
                      background: "#050508",
                      border: `1.2px solid ${p.color}`,
                      boxShadow: `0 6px 20px ${p.glow}`,
                    }}
                  >
                    <span style={{ color: p.color, display: "inline-flex" }}>
                      {PROOF_ICONS[i] ?? p.icon}
                    </span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: p.color, letterSpacing: "-.4px", lineHeight: 1.3 }}>
                    {p.title}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.5, color: "#fff" }}>{p.detail}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── XP strip ────────────────────────────────────────── */}
      <div className="btl-sec" style={{ maxWidth: 1100, margin: "116px auto 0", padding: "0 32px" }}>
        <Reveal>
          <div className="btl-xp-card" style={{ background: "#0e0d12", border: "1.5px solid #C5B3FF", borderRadius: 28, padding: 52, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 44, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 490 }}>
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#9FF5E8",
                  fontSize: 17, letterSpacing: ".5px", transform: "rotate(-2deg)",
                }}
              >
                <Sparkles size={20} strokeWidth={2.4} color="#9FF5E8" aria-hidden />
                <span>{t.xpEye}</span>
              </div>
              <div className="btl-xp-head" style={{ fontSize: 35, fontWeight: 900, letterSpacing: "-1.2px", lineHeight: 1.16, marginTop: 10 }}>
                {t.xpHead1}<span style={{ color: "#9FD8FF" }}>{t.xpHead2}</span>{t.xpHead3}
              </div>
              <div style={{ marginTop: 14, fontSize: 16, lineHeight: 1.68, color: "#fff" }}>{t.xpBody}</div>
            </div>
            <div className="btl-xp-stats" style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {t.xpStats.map((s, i) => (
                <div key={s.label} style={{ background: "#050508", border: `1.5px solid ${s.color}`, borderRadius: 20, padding: "24px 28px", textAlign: "center", minWidth: 116, animation: "bt-wiggle 6s ease-in-out infinite" }}>
                  <div
                    aria-hidden
                    style={{
                      color: s.color, marginBottom: 6,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {XP_ICONS[i]}
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "1.6px", color: "#fff", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── BrainTrack vs. other matric sites — animated head-to-head ── */}
      <CompareWall t={t} language={language} />

      {/* ── Exam Blast — R550 season pass ──────────────────────
          Once-off R550 charged in full now → full season access to
          15 Dec 2026, no recurring billing, no auto-renewal. Links to
          /subscribe?offer=exam-boost. */}
      <div className="btl-sec" style={{ maxWidth: 760, margin: "112px auto 0", padding: "0 32px" }}>
        <a
          href="/subscribe?offer=exam-boost"
          data-testid="offer-exam-boost"
          style={{
            display: "block", textDecoration: "none",
            background: "#050508", border: "2.5px solid #FFE29A",
            borderRadius: 22, boxShadow: "7px 7px 0 0 #FFE29A",
            padding: "clamp(20px,4vw,30px)", transform: "rotate(-.4deg)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: "1 1 300px", minWidth: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: 15, color: "#FFB7E5", transform: "rotate(-2deg)", display: "inline-block" }}>
                {language === "af" ? "Eksamenseisoen-spesiaal" : "Exam season special"}
              </span>
              <div style={{ fontSize: "clamp(24px,5vw,32px)", fontWeight: 900, letterSpacing: -0.8, color: "#fff", margin: "6px 0 8px" }}>
                {language === "af" ? "Exam Blast — R550 seisoenkaart" : "Exam Blast — R550 season pass"}
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#fff", margin: 0 }}>
                {language === "af"
                  ? "Eenmalige R550, nou ten volle gehef — volle toegang regdeur die rekord- en NSS-eindeksamens, tot 15 Desember 2026. Geen maandelikse heffings, geen outomatiese hernuwing nie."
                  : "Once-off R550, charged in full now — full access right through prelims and the NSC finals, to 15 December 2026. No monthly charges, no auto-renewal."}
              </p>
            </div>
            <div
              style={{
                flex: "0 0 auto", background: "#FFE29A", color: "#050508",
                fontWeight: 900, fontSize: 16, borderRadius: 12,
                padding: "14px 26px", boxShadow: "4px 4px 0 0 rgba(0,0,0,.85)",
                whiteSpace: "nowrap",
              }}
            >
              {language === "af" ? "Kry Exam Blast →" : "Get Exam Blast →"}
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#fff", margin: "12px 0 0" }}>
            {language === "af"
              ? "Of kies eerder Student Life teen R169/maand — kanselleer enige tyd — albei sluit alles in. Verskyn op jou staat as KTH-TECH."
              : "Prefer monthly? Student Life is R169/month, cancel anytime — both include everything. Appears on your statement as KTH-TECH."}
          </p>
        </a>
      </div>

      {/* Reviews ribbon removed (owner call) — no unverified pilot-cohort
          testimonials pre-launch. */}

      {/* ── Footer ──────────────────────────────────────────────
          Shared <PublicFooter/> — consistent with every other public
          page (owner request). The previous bespoke "gravity wall"
          footer was removed in favour of the shared component. */}
      <PublicFooter />

      {modal}
    </div>
  );
}
