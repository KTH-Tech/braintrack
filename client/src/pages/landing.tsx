// BrainTrack landing — rebuilt from scratch (2026-07-17).
// Dark graffiti wall: one fixed emoji/doodle/hype-word scatter behind
// everything, wall-written content (no cards), black-on-pastel callout
// headings, rectangle buttons, Poppins body + marker accents. Bilingual.
import { PublicNav } from "@/components/public-nav";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { useRolePromptNav } from "@/components/role-prompt-modal";
import { useState } from "react";
import {
  ArrowRight, BookOpen, Brain, CalendarDays, ChevronDown, LineChart, Users, Check,
} from "lucide-react";

const PASTEL = ["#6FA8FF", "#7FEFFF", "#93FFB8", "#FFF29E", "#FFC48F", "#FF9FE5", "#C6A4FF"];

const COPY = {
  en: {
    eyebrow: "Grade 12 · CAPS · R169/mo",
    titleBase: "Matric prep that actually moves your",
    titleAccent: "marks.",
    subtitle:
      "A weekly plan that maps to CAPS, 10 years of real NSC papers with memos, an AI tutor that actually gets you, and parent reports that don't collect dust.",
    urgency: "Prelims are around the corner. Don't wing it.",
    cta: "Start my 14 free days",
    tagTop: "This is",
    tagBig: "Matric.",
    tagA: "Every mark ",
    tagB: "counts.",
    stats: [
      { k: "Subjects", v: "24+", c: "#7FEFFF" },
      { k: "Papers", v: "10y", c: "#FFF29E" },
      { k: "AI Tutor", v: "24/7", c: "#C6A4FF" },
    ],
    featuresTitle: "Everything you need to nail Matric",
    features: [
      { icon: CalendarDays, c: "#7FEFFF", t: "Weekly Study Plan", d: "A real Grade 12 roadmap — small daily reps, no last-minute panic." },
      { icon: BookOpen, c: "#93FFB8", t: "Real NSC Papers + Memos", d: "Practise the exam, not the textbook. See exactly where marks leak." },
      { icon: LineChart, c: "#FFC48F", t: "Weak-Spot Tracker", d: "Flags the topics costing you marks and tells you what to do next." },
      { icon: Brain, c: "#FF9FE5", t: "Rizz — Your AI Tutor", d: "CAPS-aligned help, 24/7. Explains the tough bits until they click." },
      { icon: Users, c: "#C6A4FF", t: "Parent Loop-In", d: "Weekly progress reports parents actually read." },
      { icon: Check, c: "#FFF29E", t: "Exam Technique Drills", d: "Stop leaving easy marks on the table." },
    ],
    pricingTitle: "One plan. Real Matric marks.",
    price: "R169",
    period: "/month",
    trial: "14 days free",
    planChecks: [
      "Real NSC papers + memos (2015–2025)",
      "Rizz — your AI tutor, CAPS-aligned",
      "Progress tracking that makes sense",
      "Exam-time drills that adapt to you",
      "Study calendar that fits your week",
      "Cancel anytime",
    ],
    faqTitle: "Ask away",
    faq: [
      { q: "So what is BrainTrack, exactly?", a: "A Grade 12 study app built for CAPS and the NSC exam. Weekly plan, 10 years of real past papers with memos, an AI tutor called Rizz, and weekly parent reports — all aimed at shifting your Matric marks." },
      { q: "How much does it cost?", a: "R169 per month with 14 days free. It unlocks every subject, the AI tutor, full past-paper practice and parent reports. Cancel anytime in the app." },
      { q: "Is it CAPS-aligned?", a: "Yes. Every plan, note, flashcard and quiz is built around the official CAPS curriculum for the NSC — the same exams written nationally in October/November." },
      { q: "Werk dit in Afrikaans?", a: "Ja — alles is volledig tweetalig. Vraestelle, memo's, notas en Rizz werk in Engels én Afrikaans." },
    ],
    finalTitle: "Your marks won't move themselves.",
    finalCta: "Start free — takes 2 minutes",
  },
  af: {
    eyebrow: "Graad 12 · KABV · R169/maand",
    titleBase: "Matriekvoorbereiding wat regtig jou punte laat",
    titleAccent: "skuif.",
    subtitle:
      "'n Weeklikse plan wat by KABV pas, 10 jaar se regte NSS-vraestelle met memo's, 'n KI-tutor wat jou regtig verstaan, en ouerverslae wat nie stof vergader nie.",
    urgency: "Proewe is om die draai. Moenie improviseer nie.",
    cta: "Begin my 14 gratis dae",
    tagTop: "Dit is",
    tagBig: "Matriek.",
    tagA: "Elke punt ",
    tagB: "tel.",
    stats: [
      { k: "Vakke", v: "24+", c: "#7FEFFF" },
      { k: "Vraestelle", v: "10j", c: "#FFF29E" },
      { k: "KI-Tutor", v: "24/7", c: "#C6A4FF" },
    ],
    featuresTitle: "Alles wat jy nodig het om Matriek te klop",
    features: [
      { icon: CalendarDays, c: "#7FEFFF", t: "Weeklikse Studieplan", d: "'n Regte Graad 12-padkaart — klein daaglikse stappe, geen paniek nie." },
      { icon: BookOpen, c: "#93FFB8", t: "Regte NSS-vraestelle + Memo's", d: "Oefen die eksamen, nie die handboek nie." },
      { icon: LineChart, c: "#FFC48F", t: "Swakplek-naspoorder", d: "Wys die onderwerpe wat jou punte kos en wat om volgende te doen." },
      { icon: Brain, c: "#FF9FE5", t: "Rizz — Jou KI-Tutor", d: "KABV-belyn, 24/7. Verduidelik die moeilike dele totdat dit klik." },
      { icon: Users, c: "#C6A4FF", t: "Ouers Ingesluit", d: "Weeklikse verslae wat ouers regtig lees." },
      { icon: Check, c: "#FFF29E", t: "Eksamentegniek-drille", d: "Hou op om maklike punte op die tafel te los." },
    ],
    pricingTitle: "Een plan. Regte Matriekpunte.",
    price: "R169",
    period: "/maand",
    trial: "14 dae gratis",
    planChecks: [
      "Regte NSS-vraestelle + memo's (2015–2025)",
      "Rizz — jou KI-tutor, KABV-belyn",
      "Vorderingsnaspoor wat sin maak",
      "Eksamentyd-drille wat by jou aanpas",
      "Studiekalender wat by jou week pas",
      "Kanselleer enige tyd",
    ],
    faqTitle: "Vra weg",
    faq: [
      { q: "Wat is BrainTrack presies?", a: "'n Graad 12-studie-app vir KABV en die NSS-eksamen. Weeklikse plan, 10 jaar se regte vraestelle met memo's, 'n KI-tutor genaamd Rizz, en weeklikse ouerverslae — alles gemik op beter Matriekpunte." },
      { q: "Hoeveel kos dit?", a: "R169 per maand met 14 dae gratis. Alle vakke, die KI-tutor, volle vraestel-oefening en ouerverslae. Kanselleer enige tyd in die app." },
      { q: "Is dit KABV-belyn?", a: "Ja. Elke plan, nota, flitskaart en toets is gebou rondom die amptelike KABV-kurrikulum vir die NSS." },
      { q: "Does it work in English?", a: "Yes — everything is fully bilingual. Papers, memos, notes and Rizz work in both English and Afrikaans." },
    ],
    finalTitle: "Jou punte gaan nie hulself skuif nie.",
    finalCta: "Begin gratis — vat 2 minute",
  },
} as const;

export default function LandingPage() {
  const { language } = useLanguage();
  const t = COPY[language];
  const { handleCta, modal } = useRolePromptNav();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useSEO({
    title: "BrainTrack™ | Grade 12 Matric Past Papers, Memos & AI Tutor — South Africa",
    description:
      "Pass Matric with confidence. 10 years of NSC past papers + memos, CAPS-aligned weekly study plan, AI tutor and parent reports. Built for SA Grade 12. R169/month — 14 days free.",
    canonical: "https://braintrack.co.za/",
    ogTitle: "Matric Past Papers, Memos & AI Tutor for Grade 12 SA | BrainTrack™",
    ogDescription:
      "10 years of NSC past papers + memos, CAPS-aligned weekly revision, AI tutor and parent reports. R169/month — 14 days free.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: COPY.en.faq.slice(0, 3).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  });

  const primaryBtn =
    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]";

  return (
    <div className="min-h-screen relative bg-background text-white overflow-x-hidden">
      {/* One graffiti scatter behind the whole page */}
      <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <GraffitiSplats variant="full" opacity={0.9} />
      </div>

      <PublicNav />

      <main className="relative z-10 pt-16">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-14 text-center">
          {/* Giant graffiti wordmark + crown */}
          <div className="bt-rise bt-rise-1 relative inline-block">
            <span
              className="rainbow-text graffiti-hand leading-[0.85] block"
              style={{ fontSize: "clamp(3.2rem, 10vw + 1rem, 8rem)", textShadow: "0 4px 0 rgba(0,0,0,0.55)" }}
            >
              BrainTrack
            </span>
            <svg aria-hidden viewBox="0 0 100 100" className="absolute -top-7 -right-4 w-12 h-12 sm:w-16 sm:h-16" style={{ color: "#fff", transform: "rotate(14deg)" }}>
              <path d="M14 70 L22 34 L40 54 L50 24 L60 54 L78 34 L86 70" stroke="currentColor" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 80 L82 80" stroke="currentColor" strokeWidth={7} fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <p className="bt-rise bt-rise-2 mt-4 text-[11px] font-black uppercase tracking-[0.28em] text-white">
            {t.eyebrow}
          </p>

          <h1
            data-testid="hero-title"
            className="bt-rise bt-rise-2 mt-5 font-black tracking-tight leading-[1.05] text-white mx-auto max-w-3xl text-[clamp(1.9rem,4.2vw+1rem,4rem)]"
          >
            {t.titleBase} <span className="callout-hl">{t.titleAccent}</span>
          </h1>

          <p className="bt-rise bt-rise-3 mt-5 text-white leading-relaxed max-w-2xl mx-auto" style={{ fontSize: "clamp(1rem, 1.1vw + 0.6rem, 1.2rem)" }}>
            {t.subtitle}
          </p>

          <p
            className="bt-rise bt-rise-3 graffiti-hand mt-5 text-lg -rotate-1"
            style={{ color: "#FFF29E", textShadow: "0 2px 0 rgba(0,0,0,0.6)" }}
          >
            {t.urgency}
          </p>

          <div className="bt-rise bt-rise-4 mt-7 flex justify-center">
            <button
              onClick={handleCta}
              data-testid="button-hero-cta"
              className={primaryBtn}
              style={{ background: "#7FEFFF", color: "#0a0a0a" }}
            >
              {t.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* This is Matric. tag */}
          <div className="bt-rise bt-rise-5 mt-12 -rotate-2 select-none">
            <p className="graffiti-hand text-white leading-[1]" style={{ fontSize: "clamp(1.6rem, 3vw + 0.5rem, 2.6rem)", textShadow: "0 2px 0 rgba(0,0,0,0.6)" }}>
              {t.tagTop}
            </p>
            <p className="graffiti-hand leading-[1.2] mt-1">
              <span className="callout-hl" style={{ fontSize: "clamp(2.6rem, 5.5vw + 0.5rem, 4.8rem)" }}>{t.tagBig}</span>
            </p>
            <p className="graffiti-hand mt-3 leading-[1.4]" style={{ fontSize: "clamp(1.2rem, 2vw + 0.4rem, 1.9rem)" }}>
              <span className="text-white">{t.tagA}</span>
              <span className="callout-hl">{t.tagB}</span>
            </p>
          </div>

          {/* stats */}
          <div data-testid="stats-strip" className="bt-rise bt-rise-5 mt-12 flex items-start justify-center gap-10 sm:gap-16">
            {t.stats.map(({ k, v, c }) => (
              <div key={k} className="text-center">
                <div className="graffiti-hand text-3xl sm:text-4xl tabular-nums leading-none" style={{ color: c, textShadow: "0 2px 0 rgba(0,0,0,0.6)" }}>
                  {v}
                </div>
                <div className="mt-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white">{k}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section id="everything" className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-center">
            <span className="callout-hl">{t.featuresTitle}</span>
          </h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {t.features.map((f) => (
              <div key={f.t} className="flex flex-col items-center text-center gap-2.5">
                <f.icon className="w-8 h-8" style={{ color: f.c }} />
                <h3 className="text-base font-extrabold text-white">{f.t}</h3>
                <p className="text-sm text-white leading-relaxed max-w-[280px]">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────── */}
        <section id="pricing" className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
            <span className="callout-hl">{t.pricingTitle}</span>
          </h2>

          <p className="graffiti-hand mt-10 leading-none">
            <span style={{ color: "#7FEFFF", fontSize: "clamp(3rem, 6vw, 5rem)", textShadow: "0 3px 0 rgba(0,0,0,0.6)" }}>{t.price}</span>
            <span className="text-white text-lg font-bold ml-2">{t.period}</span>
          </p>
          <p className="graffiti-hand mt-2 text-lg" style={{ color: "#FF9FE5" }}>{t.trial}</p>

          <ul className="mt-8 space-y-2.5 inline-block text-left">
            {t.planChecks.map((c, i) => (
              <li key={c} className="flex items-start gap-2.5 text-sm text-white">
                <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: PASTEL[i % PASTEL.length] }} />
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex justify-center">
            <button
              onClick={handleCta}
              data-testid="button-pricing-cta"
              className={primaryBtn}
              style={{ background: "#7FEFFF", color: "#0a0a0a" }}
            >
              {t.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq-section" className="relative max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.1] text-center mb-10">
            <span className="callout-hl">{t.faqTitle}</span>
          </h2>
          {t.faq.map((f, idx) => {
            const c = PASTEL[idx % PASTEL.length];
            const open = openFaq === idx;
            return (
              <div key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                <button
                  className="w-full text-left py-4 flex items-center gap-3 cursor-pointer"
                  onClick={() => setOpenFaq(open ? null : idx)}
                  aria-expanded={open}
                  aria-controls={`faq-a-${idx}`}
                >
                  <span className="text-sm sm:text-base font-extrabold text-white flex-1">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: c }} />
                </button>
                <div className="grid transition-all duration-300" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden" id={`faq-a-${idx}`} role="region">
                    <p className="pb-5 text-sm text-white leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────── */}
        <section className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-24 text-center">
          <p className="graffiti-hand -rotate-1 text-2xl sm:text-3xl" style={{ color: "#FFF29E", textShadow: "0 2px 0 rgba(0,0,0,0.6)" }}>
            {t.finalTitle}
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCta}
              data-testid="button-final-cta"
              className={primaryBtn}
              style={{ background: "#93FFB8", color: "#0a0a0a" }}
            >
              {t.finalCta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {modal}
    </div>
  );
}
