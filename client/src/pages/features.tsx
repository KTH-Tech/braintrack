// BrainTrack features — pure-black street-graffiti sticker redesign.
// Learner-first: leads with what the app does FOR a Grade 12 matric (past
// papers + memos, Rizz AI support, daily plans, weak-spot radar, XP/streaks,
// parent visibility as backup) then a sticker CTA to start free / sign in.
// Shared shell: PublicNav (fixed 64px) + PublicFooter. Pure #000, no grey text,
// hard-offset shadows only (zero blur). Bilingual EN/AF. bt-* keyframes only.
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const RAINBOW =
  "linear-gradient(95deg,#9FD8FF,#94F7C5,#FFE29A,#FFB7E5,#C5B3FF)";

// Pastel accent cycle for the subject chips.
const CHIP_COLORS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];

// Solid Permanent-Marker glyphs scattered behind the hero — no blur, no glow.
const SCATTER: Array<{ glyph: string; color: string; size: number; rotate: number; style: React.CSSProperties }> = [
  { glyph: "★", color: "#FFE29A", size: 34, rotate: -14, style: { top: 8, left: "6%" } },
  { glyph: "⚡", color: "#9FF5E8", size: 30, rotate: 10, style: { top: 40, right: "7%" } },
  { glyph: "✦", color: "#C5B3FF", size: 26, rotate: 8, style: { bottom: 20, left: "10%" } },
  { glyph: "☻", color: "#FFB7E5", size: 26, rotate: -8, style: { bottom: 4, right: "9%" } },
  { glyph: "✏", color: "#94F7C5", size: 22, rotate: -10, style: { top: 90, left: "24%" } },
  { glyph: "↗", color: "#9FD8FF", size: 24, rotate: -12, style: { top: 74, right: "22%" } },
];

const COPY = {
  en: {
    eyebrow: "the full toolkit",
    head1: "Everything a matric needs, ",
    headAccent: "in one app",
    sub:
      "Real NSC past papers and memos, an AI study buddy that never sleeps, a plan built around your weak spots, and XP for every win — all CAPS-aligned, all in English and Afrikaans.",
    subjectsHead: "Every CAPS subject — sorted",
    subjects: [
      "Mathematics", "Mathematical Literacy", "Physical Sciences", "Life Sciences",
      "Accounting", "Business Studies", "Economics", "Geography", "History",
      "English HL/FAL", "Afrikaans HL/EAT", "Life Orientation", "CAT", "IT",
    ],
    featsHead: "What you actually get",
    features: [
      { icon: "📝", color: "#9FD8FF", title: "Past papers + memos", body: "Practice real NSC-style questions built from 10 years of exam patterns — every one with a worked memo. Know exactly what November throws at you." },
      { icon: "🤖", color: "#C5B3FF", title: "Rizz, your AI sidekick", body: "Stuck at 11pm? Rizz walks you through the platform, breaks down your next move and keeps you on track — in English or Afrikaans. Your study guide, not a shortcut." },
      { icon: "📅", color: "#FFB7E5", title: "A plan made for your day", body: "A fresh study plan every morning, rebuilt around what you got wrong yesterday. No guessing what to revise — just open it and go." },
      { icon: "🎯", color: "#94F7C5", title: "Weak-spot radar", body: "BrainTrack spots exactly where you're dropping marks and aims your practice there, so you get stronger where it actually counts." },
      { icon: "🏆", color: "#FFE29A", title: "XP, streaks & rewards", body: "Earn XP, keep your streak alive and unlock badges. Studying that actually feels like leveling up, session after session." },
      { icon: "📘", color: "#9FF5E8", title: "CAPS-aligned, EN + AF", body: "100% curriculum-aligned — no fluff, no filler. The whole app switches between English and Afrikaans with one tap." },
      { icon: "👀", color: "#FFB7E5", title: "Your people, in the loop", body: "Parents get a clean weekly report — so the nagging turns into high-fives, and you get backup instead of pressure." },
    ],
    ctaEyebrow: "ready when you are",
    ctaHead: "Start free. Watch your marks move.",
    ctaBtn: "Start your 14-day trial",
    ctaSignin: "I already have an account",
    ctaLoggedIn: "Go to My Dashboard",
  },
  af: {
    eyebrow: "die volle gereedskapstel",
    head1: "Alles wat 'n matriek nodig het, ",
    headAccent: "in een app",
    sub:
      "Regte NSS-vraestelle en memo's, 'n KI-studiemaat wat nooit slaap nie, 'n plan gebou rondom jou swakplekke, en XP vir elke oorwinning — alles KABV-belyn, alles in Engels en Afrikaans.",
    subjectsHead: "Elke KABV-vak — gesorteer",
    subjects: [
      "Wiskunde", "Wiskundige Geletterdheid", "Fisiese Wetenskappe", "Lewenswetenskappe",
      "Rekeningkunde", "Besigheidstudies", "Ekonomie", "Geografie", "Geskiedenis",
      "Engels HT/EAT", "Afrikaans HT/EAT", "Lewensoriëntering", "RTT", "IT",
    ],
    featsHead: "Wat jy regtig kry",
    features: [
      { icon: "📝", color: "#9FD8FF", title: "Vraestelle + memo's", body: "Oefen regte NSS-styl vrae gebou uit 10 jaar se eksamenpatrone — elkeen met 'n uitgewerkte memo. Weet presies wat November gooi." },
      { icon: "🤖", color: "#C5B3FF", title: "Rizz, jou KI-hulpie", body: "Vasgevang om 11nm? Rizz lei jou deur die platform, breek jou volgende stap af en hou jou op koers — in Engels of Afrikaans. Jou studiegids, nie 'n kortpad nie." },
      { icon: "📅", color: "#FFB7E5", title: "'n Plan vir jóú dag", body: "'n Vars studieplan elke oggend, herbou rondom wat jy gister verkeerd gekry het. Geen raaiwerk oor wat om te hersien nie — maak dit oop en gaan." },
      { icon: "🎯", color: "#94F7C5", title: "Swakplek-radar", body: "BrainTrack spot presies waar jy punte verloor en mik jou oefening daarheen, sodat jy sterker word waar dit regtig tel." },
      { icon: "🏆", color: "#FFE29A", title: "XP, reekse & belonings", body: "Verdien XP, hou jou reeks aan die lewe en ontsluit kentekens. Studie wat regtig soos vlak-op voel, sessie na sessie." },
      { icon: "📘", color: "#9FF5E8", title: "KABV-belyn, EN + AF", body: "100% kurrikulum-belyn — geen nonsens, geen vulsel nie. Die hele app wissel tussen Engels en Afrikaans met een tik." },
      { icon: "👀", color: "#FFB7E5", title: "Jou mense, in die prentjie", body: "Ouers kry 'n skoon weeklikse verslag — so raak die geneul hoë-vywe, en jy kry rugsteun in plaas van druk." },
    ],
    ctaEyebrow: "gereed wanneer jy is",
    ctaHead: "Begin gratis. Sien jou punte skuif.",
    ctaBtn: "Begin jou 14-dae proeftydperk",
    ctaSignin: "Ek het reeds 'n rekening",
    ctaLoggedIn: "My Paneelbord",
  },
} as const;

const featuresBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.tech/" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://braintrack.tech/features" },
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
          ? { ...style, animation: `bt-fadeup .8s cubic-bezier(.22,.75,.3,1) ${delay}ms both` }
          : { ...style, opacity: 0 }
      }
    >
      {children}
    </div>
  );
}

export default function FeaturesPage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const t = COPY[language];

  useSEO({
    title: "Features | BrainTrack™ CAPS Study Plan & NSC Past Papers",
    description:
      "Explore BrainTrack™ features: CAPS weekly study plan, NSC past papers with memos, gap detection, Rizz AI support, gamified progress & parent dashboard. R169/month.",
    canonical: "https://braintrack.tech/features",
    ogTitle: "BrainTrack™ Features — CAPS Plan, NSC Past Papers & AI Support",
    ogDescription:
      "CAPS-aligned study plan, 10 years of NSC past papers with memos, gap detection, Rizz AI support, and progress tracking for Grade 12 Matric. Try free for 14 days.",
    ogUrl: "https://braintrack.tech/features",
    jsonLd: featuresBreadcrumb,
  });

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#fff", overflowX: "hidden" }} data-testid="page-features">
      <PublicNav />

      <style>{`
        .btf-card {
          transition: transform .16s ease, box-shadow .16s ease;
          will-change: transform;
        }
        .btf-card:hover {
          transform: translate(-3px,-3px);
          box-shadow: 9px 9px 0 0 var(--c);
        }
        .btf-chip { transition: transform .16s ease, box-shadow .16s ease; }
        .btf-chip:hover { transform: translate(-2px,-2px); box-shadow: 4px 4px 0 0 var(--c); }
        .btf-btn { transition: transform .16s ease, box-shadow .16s ease; }
        .btf-btn:hover { transform: translate(-3px,-3px); box-shadow: 9px 9px 0 0 var(--s); }
        .btf-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px;
        }
        @media (max-width: 1000px) { .btf-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 680px)  { .btf-grid { grid-template-columns: 1fr; } }
        .btf-h1 { font-size: clamp(34px, 8vw, 60px); }
        .btf-h2 { font-size: clamp(24px, 5vw, 36px); }
        /* Narrow phones: stack the CTA buttons full-width and let long
           (esp. Afrikaans) labels wrap instead of clipping past the edge. */
        @media (max-width: 480px) {
          .btf-cta-row { flex-direction: column; }
          .btf-cta-row > a { width: 100%; }
          .btf-cta-row .btf-btn { width: 100%; white-space: normal !important; }
        }
      `}</style>

      <main style={{ paddingTop: 64 }}>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{ position: "relative", maxWidth: 1080, margin: "0 auto", padding: "56px 20px 40px", textAlign: "center" }}>
          {SCATTER.map((s, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                position: "absolute", fontFamily: "'Permanent Marker',cursive",
                fontSize: s.size, color: s.color, transform: `rotate(${s.rotate}deg)`,
                pointerEvents: "none", zIndex: 0,
                animation: `bt-float ${7 + i}s ease-in-out infinite`,
                ...s.style,
              }}
            >
              {s.glyph}
            </span>
          ))}

          <Reveal style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8", fontSize: 18, transform: "rotate(-2deg)", display: "inline-block" }}>
              {t.eyebrow}
            </div>
            <h1
              className="btf-h1"
              data-testid="text-features-title"
              style={{ fontWeight: 900, letterSpacing: "-1.6px", lineHeight: 1.08, margin: "12px 0 0", fontFamily: "'Poppins',sans-serif", color: "#fff" }}
            >
              {t.head1}
              <span
                style={{
                  background: RAINBOW,
                  WebkitBackgroundClip: "text", backgroundClip: "text",
                  color: "transparent", WebkitTextFillColor: "transparent",
                }}
              >
                {t.headAccent}
              </span>
            </h1>
            <div
              aria-hidden
              style={{ width: 180, height: 5, margin: "18px auto 0", borderRadius: 999, background: RAINBOW, transform: "rotate(-1.2deg)" }}
            />
            <p
              data-testid="text-features-subtitle"
              style={{ fontSize: 17, color: "#fff", maxWidth: 640, margin: "20px auto 0", lineHeight: 1.6 }}
            >
              {t.sub}
            </p>
          </Reveal>
        </section>

        {/* ── Subjects ─────────────────────────────────────────── */}
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "8px 20px 8px", textAlign: "center" }}>
          <Reveal>
            <h2 className="btf-h2" style={{ fontFamily: "'Permanent Marker',cursive", color: "#fff", margin: "0 0 22px", transform: "rotate(-1deg)" }}>
              {t.subjectsHead}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {t.subjects.map((name, i) => {
                const c = CHIP_COLORS[i % CHIP_COLORS.length];
                return (
                  <span
                    key={name}
                    className="btf-chip"
                    style={{ ["--c" as string]: c, fontSize: 13.5, fontWeight: 800, color: c, background: "#050508", border: `2px solid ${c}`, borderRadius: 999, padding: "8px 16px" } as React.CSSProperties}
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </Reveal>
        </section>

        {/* ── Feature sticker cards ────────────────────────────── */}
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 20px 0", textAlign: "center" }}>
          <Reveal>
            <h2 className="btf-h2" style={{ fontFamily: "'Permanent Marker',cursive", color: "#fff", margin: "0 0 34px", transform: "rotate(-1deg)" }}>
              {t.featsHead}
            </h2>
          </Reveal>
          <div className="btf-grid">
            {t.features.map((f, i) => (
              <Reveal key={f.title} delay={i * 70} style={{ display: "flex" }}>
                <div
                  className="btf-card"
                  data-testid={`card-feature-${i}`}
                  style={{
                    ["--c" as string]: f.color,
                    width: "100%", boxSizing: "border-box", textAlign: "left",
                    background: "#050508", border: `2.5px solid ${f.color}`,
                    borderRadius: 18, boxShadow: `6px 6px 0 0 ${f.color}`,
                    padding: 24,
                  } as React.CSSProperties}
                >
                  <div
                    style={{
                      width: 52, height: 52, borderRadius: 14, display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 25,
                      background: "#000", border: `2.5px solid ${f.color}`,
                      boxShadow: `3px 3px 0 0 ${f.color}`, marginBottom: 18,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 9, color: "#fff", fontFamily: "'Poppins',sans-serif" }}>{f.title}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "#fff" }}>{f.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Final CTA sticker ────────────────────────────────── */}
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "72px 20px 100px" }}>
          <Reveal>
            <div
              style={{
                background: "#050508", border: "2.5px solid #C5B3FF",
                borderRadius: 24, boxShadow: "8px 8px 0 0 #C5B3FF",
                padding: "clamp(28px,6vw,44px)", textAlign: "center",
                transform: "rotate(-.4deg)",
              }}
            >
              <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFB7E5", fontSize: 16, transform: "rotate(-2deg)", display: "inline-block" }}>
                {t.ctaEyebrow}
              </div>
              <div className="btf-h2" style={{ fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.12, color: "#fff", margin: "10px 0 26px", fontFamily: "'Poppins',sans-serif" }}>
                {t.ctaHead}
              </div>
              <div className="btf-cta-row" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
                <Link href={isAuthenticated ? "/dashboard" : "/subscribe"}>
                  <button
                    className="btf-btn bt-btn"
                    data-testid="button-features-cta"
                    style={{
                      ["--s" as string]: "#FFE29A",
                      fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: 16,
                      color: "#000", background: "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)",
                      backgroundSize: "200% 100%", animation: "bt-rainbow 5s linear infinite",
                      border: "2.5px solid #000", borderRadius: 12, padding: "15px 34px",
                      boxShadow: "6px 6px 0 0 #FFE29A", whiteSpace: "nowrap", cursor: "pointer",
                    } as React.CSSProperties}
                  >
                    {isAuthenticated ? t.ctaLoggedIn : t.ctaBtn}
                  </button>
                </Link>
                {!isAuthenticated && (
                  <a href="/signin">
                    <button
                      className="btf-btn"
                      data-testid="button-features-signin"
                      style={{
                        ["--s" as string]: "#9FD8FF",
                        fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16,
                        color: "#fff", background: "#000", border: "2.5px solid #9FD8FF",
                        borderRadius: 12, padding: "15px 30px", boxShadow: "6px 6px 0 0 #9FD8FF",
                        whiteSpace: "nowrap", cursor: "pointer",
                      } as React.CSSProperties}
                    >
                      {t.ctaSignin}
                    </button>
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
