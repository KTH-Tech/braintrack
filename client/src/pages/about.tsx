// BrainTrack about — pure-black street-graffiti restyle.
// Learner-first: centres the SA Grade 12 (matric / NSC) learner. Sticker cards
// (2.5px accent border + hard offset shadow, hover lift), marker eyebrow,
// gradient wordmark headings — NO grey text, NO glow/blur shadows. Bilingual
// EN/AF. Shared shell: PublicNav (fixed 64px) + PublicFooter. Testids kept.
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
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const CTA_GRADIENT =
  "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const WORDMARK_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#94F7C5,#FFE29A,#FFB7E5,#C5B3FF)";

const t = {
  en: {
    title: "We're building the matric app we wish we had",
    tagline: "Made for SA matrics",
    heroSub:
      "Smart, affordable Grade 12 prep — built by South Africans, for South African learners.",
    p1: "BrainTrack is built for one person: the South African Grade 12 learner staring down the NSC. It pulls a decade of real exam patterns, CAPS-aligned revision and worked memos into one place — so you always know what to study next, and why.",
    p2: "We got tired of watching matrics grind through past papers with no memo, no plan and no clue where the marks actually go. BrainTrack turns “I'm not sure” into “I'm ready” — with a study plan that rebuilds around what you got wrong, not a generic checklist.",
    p3: "Every learner deserves smart, affordable prep — not R500-an-hour tutoring. That's why Student Life is R169/month, cancel anytime. Parents can follow the progress, and schools can bring us in through our Future Ready Schools programme — but the learner always comes first.",
    missionTitle: "Why we exist",
    missionDesc:
      "To put a real shot at matric success in every SA learner's pocket — strategic, science-backed study tools that turn late-night effort into actual marks. One learner at a time.",
    f1Title: "Learning Science",
    f1Desc: "Every feature is grounded in proven educational research. Spaced repetition, adaptive difficulty, and targeted revision — all working together.",
    f2Title: "Real Exam Patterns",
    f2Desc: "We study 10 years of NSC exam data to identify what gets tested, how it gets tested, and where learners commonly lose marks.",
    f3Title: "CAPS-Aligned Only",
    f3Desc: "100% curriculum coverage. No guessing, no off-topic content. Every question maps directly to CAPS assessment standards.",
    f4Title: "South African Focus",
    f4Desc: "Built specifically for the South African education system. Available in English and Afrikaans, designed for local learners.",
    whyTitle: "What makes BrainTrack different",
    why1: "Built on 10 years of real exam pattern data",
    why2: "Powered by learning science, not just content delivery",
    why3: "Personalised study plans that adapt daily",
    why4: "Instant marking with clear, actionable feedback",
    why5: "Gamified progress with XP, levels, and badges",
    why6: "Rizz — a smart support agent to keep learners on track",
    why7: "Mobile-first, teen-friendly design with theme options",
    why8: "Affordable at R169/month with optional power-ups",
    schoolsTitle: "Future Ready Schools",
    schoolsDesc:
      "Your school can bring BrainTrack to the whole grade through Future Ready Schools — but you don't have to wait for them. Any learner can start on their own today. Schools are simply how we reach more of you, faster.",
    popia: "Your data is protected under POPIA (Protection of Personal Information Act, 2013). We only collect information necessary for learning and never share it with third parties.",
    cta: "Start Learning Smarter",
    ctaLoggedIn: "Go to My Dashboard",
    privacyTitle: "Privacy & Security",
  },
  af: {
    title: "Ons bou die matriek-app wat ons graag wou gehad het",
    tagline: "Gemaak vir SA-matrieks",
    heroSub:
      "Slim, bekostigbare Graad 12-voorbereiding — gebou deur Suid-Afrikaners, vir Suid-Afrikaanse leerders.",
    p1: "BrainTrack is gebou vir een persoon: die Suid-Afrikaanse Graad 12-leerder wat die NSS in die oë staar. Dit trek 'n dekade se werklike eksamenpatrone, KABV-belynde hersiening en uitgewerkte memo's in een plek saam — sodat jy altyd weet wat om volgende te leer, en hoekom.",
    p2: "Ons was moeg daarvoor om te sien hoe matrieks deur vraestelle sukkel sonder 'n memo, sonder 'n plan en sonder 'n idee waar die punte werklik lê. BrainTrack verander “ek is nie seker nie” in “ek is gereed” — met 'n studieplan wat homself herbou rondom wat jy verkeerd gekry het, nie 'n generiese lys nie.",
    p3: "Elke leerder verdien slim, bekostigbare voorbereiding — nie R500-per-uur onderrig nie. Daarom is Student Life R169/maand, kanselleer enige tyd. Ouers kan die vordering volg, en skole kan ons inbring deur ons Future Ready Schools-program — maar die leerder kom altyd eerste.",
    missionTitle: "Hoekom ons bestaan",
    missionDesc:
      "Om elke SA-leerder 'n regte kans op matrieksukses in die sak te gee — strategiese, wetenskaplik-ondersteunde studiegereedskap wat laataand-inspanning in werklike punte omskep. Een leerder op 'n slag.",
    f1Title: "Leerwetenskap",
    f1Desc: "Elke kenmerk is gegrond op bewese opvoedkundige navorsing. Gespasieerde herhaling, aanpasbare moeilikheidsgraad, en geteikende hersiening — alles werk saam.",
    f2Title: "Regte Eksamenpatrone",
    f2Desc: "Ons bestudeer 10 jaar se NSC-eksamendata om te identifiseer wat getoets word, hoe dit getoets word, en waar leerders algemeen punte verloor.",
    f3Title: "Slegs KABV-Belyn",
    f3Desc: "100% kurrikulum-dekking. Geen raaiwerk, geen irrelevante inhoud nie. Elke vraag karteer direk na KABV-assesseringstandaarde.",
    f4Title: "Suid-Afrikaanse Fokus",
    f4Desc: "Spesifiek gebou vir die Suid-Afrikaanse onderwysstelsel. Beskikbaar in Engels en Afrikaans, ontwerp vir plaaslike leerders.",
    whyTitle: "Wat maak BrainTrack anders",
    why1: "Gebou op 10 jaar se werklike eksamenpatroondata",
    why2: "Aangedryf deur leerwetenskap, nie net inhoudlewering nie",
    why3: "Persoonlike studieplanne wat daagliks aanpas",
    why4: "Onmiddellike nasien met duidelike, uitvoerbare terugvoer",
    why5: "Spelagtige vordering met XP, vlakke en kentekens",
    why6: "Rizz — 'n slim ondersteuningsagent om leerders op koers te hou",
    why7: "Mobiel-eerste, tienervriendelike ontwerp met tema-opsies",
    why8: "Bekostigbaar teen R169/maand met opsionele krag-opgradings",
    schoolsTitle: "Future Ready Schools",
    schoolsDesc:
      "Jou skool kan BrainTrack na die hele graad bring deur Future Ready Schools — maar jy hoef nie vir hulle te wag nie. Enige leerder kan vandag op sy eie begin. Skole is eenvoudig hoe ons meer van julle, vinniger bereik.",
    popia: "Jou data word beskerm volgens die POPIA-wet (Wet op Beskerming van Persoonlike Inligting, 2013). Ons versamel slegs inligting wat nodig is vir leer en deel dit nooit met derde partye nie.",
    cta: "Begin Slimmer Leer",
    ctaLoggedIn: "My Paneelbord",
    privacyTitle: "Privaatheid & Sekuriteit",
  },
};

// Sticker pillars — each carries its own accent for the 2.5px border + hard
// offset shadow. Slight tilt keeps the graffiti-sticker feel.
const pillars = [
  { icon: Brain,     titleKey: "f1Title" as const, descKey: "f1Desc" as const, color: "#9FF5E8", tilt: -1 },
  { icon: BarChart3, titleKey: "f2Title" as const, descKey: "f2Desc" as const, color: "#9FD8FF", tilt: 1 },
  { icon: BookOpen,  titleKey: "f3Title" as const, descKey: "f3Desc" as const, color: "#94F7C5", tilt: 1 },
  { icon: Target,    titleKey: "f4Title" as const, descKey: "f4Desc" as const, color: "#FFB7E5", tilt: -1 },
];

const WHY_COLORS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5", "#9FF5E8", "#FFB7E5"];
const whyPoints = ["why1", "why2", "why3", "why4", "why5", "why6", "why7", "why8"] as const;

const aboutBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.tech/" },
    { "@type": "ListItem", "position": 2, "name": "About", "item": "https://braintrack.tech/about" },
  ],
};

// Gradient wordmark heading — pure fill, no grey.
function GradientText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        background: WORDMARK_GRADIENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export default function AboutPage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  useSEO({
    title: "About BrainTrack™ | Grade 12 CAPS Matric Revision Platform",
    description: "BrainTrack™ is South Africa's Grade 12 Matric exam prep platform — CAPS-aligned weekly plans, 10 years of NSC past papers with memos, AI tutor, and progress tracking.",
    canonical: "https://braintrack.tech/about",
    ogTitle: "About BrainTrack™ — South Africa's Grade 12 Matric Prep Platform",
    ogDescription: "BrainTrack™ combines CAPS-aligned weekly plans, 10 years of NSC past papers, AI tutor Rizz, and progress tracking to help Grade 12 learners improve Matric marks.",
    ogUrl: "https://braintrack.tech/about",
    jsonLd: aboutBreadcrumb,
  });
  const c = t[language];

  const ctaHref = isAuthenticated ? "/dashboard" : "/subscribe";
  const ctaLabel = isAuthenticated ? c.ctaLoggedIn : c.cta;

  // Sticker card base — pure-black fill, accent border, hard offset shadow.
  const sticker = (color: string, tilt = 0): React.CSSProperties => ({
    background: "#050508",
    border: `2.5px solid ${color}`,
    borderRadius: 18,
    boxShadow: `6px 6px 0 0 ${color}`,
    padding: "clamp(20px,4vw,30px)",
    transform: `rotate(${tilt}deg)`,
  });

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#fff" }} data-testid="page-about">
      <PublicNav />

      <main style={{ paddingTop: 64, overflowX: "hidden" }}>
        <style>{`
          .bta-sticker { transition: transform .18s ease; }
          .bta-sticker:hover { transform: translate(-3px,-3px) rotate(0deg) !important; }
          .bta-cta { transition: transform .18s ease; }
          .bta-cta:hover { transform: translate(-3px,-3px); }
          @media (max-width: 640px) {
            .bta-grid2 { grid-template-columns: 1fr !important; }
            .bta-schools-row { flex-direction: column !important; }
          }
        `}</style>

        <div style={{ maxWidth: 980, margin: "0 auto", padding: "48px 20px 64px" }}>

          {/* ── Hero ─────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div
              data-testid="text-about-tagline"
              style={{
                fontFamily: "'Permanent Marker',cursive",
                color: "#9FF5E8",
                fontSize: "clamp(16px,4vw,20px)",
                transform: "rotate(-2deg)",
                display: "inline-block",
                marginBottom: 12,
              }}
            >
              {c.tagline}
            </div>
            <h1
              data-testid="text-about-title"
              style={{
                fontSize: "clamp(34px,8vw,60px)",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-1.5px",
                margin: "0 auto 16px",
                maxWidth: 820,
                fontFamily: "'Poppins',sans-serif",
                color: "#fff",
              }}
            >
              <GradientText>{c.title}</GradientText>
            </h1>
            <p
              data-testid="text-about-hero-sub"
              style={{ fontSize: "clamp(15px,3.6vw,18px)", color: "#fff", maxWidth: 640, margin: "0 auto", lineHeight: 1.6, fontWeight: 600 }}
            >
              {c.heroSub}
            </p>
          </div>

          {/* ── Story ────────────────────────────────────────── */}
          <section
            data-testid="card-about-description"
            className="bta-sticker"
            style={{ ...sticker("#C5B3FF", -0.4), marginBottom: 26 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: "clamp(14.5px,2.4vw,16px)", lineHeight: 1.7, color: "#fff" }}>
              <p data-testid="text-about-p1" style={{ margin: 0 }}>{c.p1}</p>
              <p data-testid="text-about-p2" style={{ margin: 0 }}>{c.p2}</p>
              <p data-testid="text-about-p3" style={{ margin: 0 }}>{c.p3}</p>
            </div>
          </section>

          {/* ── Mission ──────────────────────────────────────── */}
          <section
            data-testid="card-mission"
            className="bta-sticker"
            style={{ ...sticker("#9FD8FF", 0.4), marginBottom: 32, textAlign: "center" }}
          >
            <GraduationCap style={{ width: 36, height: 36, color: "#9FD8FF", margin: "0 auto 12px", display: "block" }} />
            <h2 data-testid="text-mission-title" style={{ fontSize: "clamp(24px,5vw,30px)", fontWeight: 900, letterSpacing: "-.5px", margin: "0 0 12px", fontFamily: "'Poppins',sans-serif" }}>
              <GradientText>{c.missionTitle}</GradientText>
            </h2>
            <p data-testid="text-mission-desc" style={{ fontSize: "clamp(14.5px,2.6vw,16.5px)", lineHeight: 1.7, color: "#fff", maxWidth: 640, margin: "0 auto" }}>
              {c.missionDesc}
            </p>
          </section>

          {/* ── Pillars ──────────────────────────────────────── */}
          <div className="bta-grid2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 22, marginBottom: 32 }}>
            {pillars.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bta-sticker"
                  data-testid={`card-pillar-${i}`}
                  style={{ ...sticker(f.color, f.tilt) }}
                >
                  <div style={{ width: 54, height: 54, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: `2.5px solid ${f.color}`, marginBottom: 16 }}>
                    <Icon style={{ width: 26, height: 26, color: f.color }} />
                  </div>
                  <h3 data-testid={`text-pillar-title-${i}`} style={{ fontWeight: 900, fontSize: "clamp(17px,3.4vw,19px)", margin: "0 0 8px", color: f.color, fontFamily: "'Poppins',sans-serif" }}>
                    {c[f.titleKey]}
                  </h3>
                  <p data-testid={`text-pillar-desc-${i}`} style={{ fontSize: 14, lineHeight: 1.6, color: "#fff", margin: 0 }}>
                    {c[f.descKey]}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Why different ────────────────────────────────── */}
          <section
            data-testid="card-why-different"
            className="bta-sticker"
            style={{ ...sticker("#FFE29A", -0.3), marginBottom: 32 }}
          >
            <h2 data-testid="text-why-title" style={{ fontSize: "clamp(22px,4.6vw,28px)", fontWeight: 900, letterSpacing: "-.5px", textAlign: "center", margin: "0 0 24px", fontFamily: "'Poppins',sans-serif" }}>
              <GradientText>{c.whyTitle}</GradientText>
            </h2>
            <div className="bta-grid2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              {whyPoints.map((key, i) => (
                <div key={i} data-testid={`text-why-point-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <CheckCircle style={{ width: 20, height: 20, color: WHY_COLORS[i % WHY_COLORS.length], flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: "clamp(13.5px,2.4vw,15px)", lineHeight: 1.55 }}>{c[key as keyof typeof c]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Schools (distribution channel, learner-first) ── */}
          <section
            data-testid="card-schools"
            className="bta-sticker bta-schools-row"
            style={{ ...sticker("#9FD8FF", 0.3), marginBottom: 26, display: "flex", alignItems: "flex-start", gap: 18 }}
          >
            <div style={{ width: 50, height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "2.5px solid #9FD8FF", flexShrink: 0 }}>
              <Users style={{ width: 24, height: 24, color: "#9FD8FF" }} />
            </div>
            <div>
              <h2 data-testid="text-schools-title" style={{ fontWeight: 900, fontSize: "clamp(17px,3.4vw,20px)", color: "#9FD8FF", margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>{c.schoolsTitle}</h2>
              <p data-testid="text-schools-desc" style={{ fontSize: "clamp(14px,2.4vw,15.5px)", lineHeight: 1.65, color: "#fff", margin: 0 }}>{c.schoolsDesc}</p>
            </div>
          </section>

          {/* ── POPIA ────────────────────────────────────────── */}
          <section
            data-testid="card-popia-notice"
            className="bta-sticker bta-schools-row"
            style={{ ...sticker("#94F7C5", -0.3), marginBottom: 40, display: "flex", alignItems: "flex-start", gap: 18 }}
          >
            <div style={{ width: 50, height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "2.5px solid #94F7C5", flexShrink: 0 }}>
              <Shield style={{ width: 24, height: 24, color: "#94F7C5" }} />
            </div>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: "clamp(17px,3.4vw,20px)", color: "#94F7C5", margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>{c.privacyTitle}</h2>
              <p data-testid="text-popia-notice" style={{ fontSize: "clamp(14px,2.4vw,15.5px)", lineHeight: 1.65, color: "#fff", margin: 0 }}>{c.popia}</p>
            </div>
          </section>

          {/* ── CTA sticker ──────────────────────────────────── */}
          <div style={{ textAlign: "center" }}>
            <Link href={ctaHref} data-testid="link-signup-child">
              <button
                className="bta-cta"
                style={{
                  fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: "clamp(15px,3vw,17px)",
                  color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                  animation: "bt-rainbow 5s linear infinite",
                  border: "2.5px solid #050508", borderRadius: 12,
                  boxShadow: "6px 6px 0 0 #FFE29A",
                  padding: "16px 36px", whiteSpace: "nowrap", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 10,
                }}
              >
                {ctaLabel}
                <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
