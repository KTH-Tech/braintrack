import { PublicNav } from "@/components/public-nav";
import { GraffitiSplats, SpraySmear } from "@/components/graffiti-splats";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";
import {
  BookOpen,
  Target,
  Brain,
  Globe,
  Zap,
  CheckCircle,
  Calendar,
  Trophy,
  Bot,
  Smartphone,
  Rocket,
  LifeBuoy,
  GraduationCap,
  TrendingUp,
  ClipboardCheck,
} from "lucide-react";

const t = {
  en: {
    heroPill: "What's Inside",
    heroEyebrow: "Grade 12 · NSC/CAPS",
    heroTitle: "Everything BrainTrack gives you, in one place.",
    heroSubtitle:
      "A CAPS-aligned study plan built from 10 years of real NSC papers, weak-spot tracking, an AI tutor, and parent reports — plus optional power-ups and rescue packs for exam crunch-time.",
    heroChip1: "9 Core Features",
    heroChip2: "5 Power-Ups",
    heroChip3: "4 Rescue Packs",
    sectionCore: "Brain Boost",
    corePriceLabel: "R169/month",
    corePriceSub: "Cancel anytime · No long-term commitment",
    coreDesc:
      "Your complete CAPS-aligned study companion. Brain Boost gives you everything you need to master your subjects, track your progress, and walk into exams confident.",
    f1: "CAPS-Aligned Content",
    f1d: "100% curriculum-aligned questions and lessons. No fluff, no filler — only what matters for your exams.",
    f2: "Real Exam-Style Questions",
    f2d: "Practice with questions built from 10 years of historical exam patterns. Know exactly what to expect.",
    f3: "Personalised Daily Study Plans",
    f3d: "A smart study plan generated just for you, every day. Focus on what you need most.",
    f4: "Instant Marking & Feedback",
    f4d: "Get your results immediately with clear explanations. No waiting, no guessing.",
    f5: "Weak-Area Detection",
    f5d: "Pinpoints your gaps and builds a targeted improvement roadmap so you get stronger where it counts.",
    f6: "Gamified Progress",
    f6d: "Earn XP, level up, and collect achievement badges. Stay motivated with every session.",
    f7: "Rizz — Smart Support Agent",
    f7d: "Rizz helps you navigate the platform, explains your next steps, and keeps you on track. Rizz is your support guide — not an academic tutor.",
    f8: "EN/AF Language Support",
    f8d: "Switch between English and Afrikaans at any time. All content, feedback, and support in your preferred language.",
    f9: "Mobile-First Design",
    f9d: "Built for teens, designed for phones. Fast, intuitive, and modern — with multiple themes.",
    sectionPowerUps: "Optional Power-Ups",
    powerUpPill: "Coming Soon",
    powerUpDesc:
      "Take your preparation to the next level with add-ons designed for serious results.",
    pu1: "Exam Mode",
    pu1d: "Simulated mock exams that feel like the real thing. Timed, structured, and exam-ready.",
    pu2: "Subject Boost Pack",
    pu2d: "Extra drills and focused content for subjects where you need the most improvement.",
    pu3: "Distinction Builder",
    pu3d: "Advanced questions and strategies designed to push your marks from good to distinction-level.",
    pu4: "30-Day Exam Sprint",
    pu4d: "An intensive 30-day programme with daily targets to maximise your readiness before exams.",
    pu5: "Smart Study System",
    pu5d: "AI-driven study scheduling that adapts in real-time based on your performance and available time.",
    sectionRescue: "Rescue Packs",
    rescuePill: "Emergency Support",
    rescueDesc: "Falling behind? These targeted interventions get you back on track fast.",
    rp1: "Topic Rescue",
    rp1d: "Intensive revision for a single weak topic — concept review, drills, and a mastery check.",
    rp2: "Subject Rescue",
    rp2d: "A full recovery plan for an entire subject — structured over multiple weeks.",
    rp3: "Exam Rescue Sprint",
    rp3d: "A rapid revision plan across all your subjects in the final weeks before exams.",
    rp4: "Distinction Rescue Boost",
    rp4d: "For learners close to distinction — a targeted push on borderline topics.",
    sectionDiff: "Why BrainTrack Works",
    diffSubtitle: "This is not harder studying. This is strategic learning.",
    diff1: "CAPS-aligned content only — no fluff",
    diff2: "Real exam-style questions from historical patterns",
    diff3: "Personalised study plans that adapt to you",
    diff4: "Instant marking with clear feedback",
    diff5: "Weak-area detection and improvement roadmaps",
    diff6: "Gamified progress that keeps teens motivated",
    stat1L: "CAPS-aligned",
    stat1V: "100%",
    stat2L: "Years of NSC papers",
    stat2V: "10",
    stat3L: "Subjects covered",
    stat3V: "25+",
    stat4L: "Memo coverage",
    stat4V: "Full",
    cta: "Start Your Free 14-Day Trial",
    ctaLoggedIn: "Go to My Classroom",
  },
  af: {
    heroPill: "Wat's Binne",
    heroEyebrow: "Graad 12 · NSS/KABV",
    heroTitle: "Alles wat BrainTrack jou gee, op een plek.",
    heroSubtitle:
      "'n KABV-belynde studieplan gebou uit 10 jaar se regte NSS-vraestelle, swakpuntspoor, 'n KI-tutor, en ouerverslae — plus opsionele krag-opgraderings en reddingspakke vir eksamen-crunchtyd.",
    heroChip1: "9 Kernfunksies",
    heroChip2: "5 Krag-Opgr.",
    heroChip3: "4 Reddings",
    sectionCore: "Brain Boost",
    corePriceLabel: "R169/maand",
    corePriceSub: "Kanselleer enige tyd · Geen langtermyn-verpligting",
    coreDesc:
      "Jou volledige KABV-belynde studievennoot. Brain Boost gee jou alles wat jy nodig het om jou vakke te bemeester, jou vordering te volg, en vol selfvertroue eksamens binne te stap.",
    f1: "KABV-Belynde Inhoud",
    f1d: "100% kurrikulum-belynde vrae en lesse. Geen nonsens nie — net wat saak maak vir jou eksamens.",
    f2: "Regte Eksamen-Styl Vrae",
    f2d: "Oefen met vrae gebou uit 10 jaar se vorige eksamenpatrone. Weet presies wat om te verwag.",
    f3: "Persoonlike Daaglikse Studieplanne",
    f3d: "'n Slim studieplan wat elke dag net vir jou gemaak word. Fokus op wat jy die meeste nodig het.",
    f4: "Dadelike Nasien & Terugvoer",
    f4d: "Kry jou resultate dadelik met duidelike verduidelikings. Geen wag, geen raaiwerk nie.",
    f5: "Swak-Area Opsporing",
    f5d: "Spot jou gapings en bou 'n gerigte verbeteringsplan sodat jy sterker word waar dit tel.",
    f6: "Spel-agtige Vordering",
    f6d: "Verdien XP, bereik nuwe vlakke, en ontsluit prestasiekentekens. Bly gemotiveerd met elke sessie.",
    f7: "Rizz — Slim Ondersteuningsagent",
    f7d: "Rizz help jou om die platform te navigeer, verduidelik jou volgende stappe, en hou jou op koers. Rizz is jou ondersteuningsgids — nie 'n akademiese tutor nie.",
    f8: "EN/AF Taalondersteuning",
    f8d: "Wissel enige tyd tussen Engels en Afrikaans. Alle inhoud, terugvoer en ondersteuning in jou voorkeur taal.",
    f9: "Mobiel-Eerste Ontwerp",
    f9d: "Gebou vir tieners, gemaak vir fone. Vinnig, intuïtief en modern — met verskeie temas.",
    sectionPowerUps: "Opsionele Krag-Opgradings",
    powerUpPill: "Binnekort",
    powerUpDesc:
      "Neem jou voorbereiding na die volgende vlak met byvoegings gemaak vir ernstige resultate.",
    pu1: "Eksamenmodus",
    pu1d: "Proef-eksamens wat soos die regte ding voel. Tydsgebonde, gestruktureerd en eksamen-gereed.",
    pu2: "Vak Hupstoot Pakket",
    pu2d: "Ekstra oefeninge en gefokusde inhoud vir vakke waar jy die meeste verbetering nodig het.",
    pu3: "Onderskeiding Bouer",
    pu3d: "Gevorderde vrae en strategieë gemaak om jou punte van goed na onderskeidingsvlak te stoot.",
    pu4: "30-Dag Eksamen Sprint",
    pu4d: "'n Intensiewe 30-dag program met daaglikse teikens om jou gereedheid voor eksamens te maksimeer.",
    pu5: "Slim Studiestelsel",
    pu5d: "KI-gedrewe studieskedule wat intydse aanpas gebaseer op jou prestasie en beskikbare tyd.",
    sectionRescue: "Reddingspakkette",
    rescuePill: "Nood-Ondersteuning",
    rescueDesc: "Val jy agter? Hierdie gerigte planne kry jou vinnig weer op koers.",
    rp1: "Onderwerp Redding",
    rp1d: "Intensiewe hersiening vir 'n enkele swak onderwerp — konsep-hersiening, oefeninge en 'n bemeesteringstoets.",
    rp2: "Vak Redding",
    rp2d: "'n Volledige herstelplan vir 'n hele vak — gestruktureerd oor 'n paar weke.",
    rp3: "Eksamen Redding Sprint",
    rp3d: "'n Vinnige hersieningsplan oor al jou vakke in die laaste weke voor eksamens.",
    rp4: "Onderskeiding Redding Hupstoot",
    rp4d: "Vir leerders naby aan onderskeiding — 'n gerigte stoot op grensgevalle-onderwerpe.",
    sectionDiff: "Hoekom BrainTrack Werk",
    diffSubtitle: "Dit is nie harder studeer nie. Dit is strategiese leer.",
    diff1: "Slegs KABV-belynde inhoud — geen nonsens nie",
    diff2: "Regte eksamen-styl vrae uit vorige patrone",
    diff3: "Persoonlike studieplanne wat by jou aanpas",
    diff4: "Dadelike nasien met duidelike terugvoer",
    diff5: "Swak-area opsporing en verbeteringsplanne",
    diff6: "Spel-agtige vordering wat jou gemotiveerd hou",
    stat1L: "KABV-belyn",
    stat1V: "100%",
    stat2L: "Jaar se NSS-vraestelle",
    stat2V: "10",
    stat3L: "Vakke gedek",
    stat3V: "25+",
    stat4L: "Memo-dekking",
    stat4V: "Vol",
    cta: "Begin Jou Gratis 14-Dae Proeftydperk",
    ctaLoggedIn: "My Klaskamer",
  },
};

// Soft pastel wall palette — borders, highlights and marker accents only.
const PASTELS = ["#6FA8FF", "#7FEFFF", "#93FFB8", "#FFF29E", "#FFC48F", "#FF9FE5", "#C6A4FF"];

const coreFeatures = [
  { icon: BookOpen,        titleKey: "f1", descKey: "f1d" },
  { icon: ClipboardCheck,  titleKey: "f2", descKey: "f2d" },
  { icon: Calendar,        titleKey: "f3", descKey: "f3d" },
  { icon: CheckCircle,     titleKey: "f4", descKey: "f4d" },
  { icon: Target,          titleKey: "f5", descKey: "f5d" },
  { icon: Trophy,          titleKey: "f6", descKey: "f6d" },
  { icon: Bot,             titleKey: "f7", descKey: "f7d" },
  { icon: Globe,           titleKey: "f8", descKey: "f8d" },
  { icon: Smartphone,      titleKey: "f9", descKey: "f9d" },
] as const;

const powerUps = [
  { icon: Zap,             titleKey: "pu1", descKey: "pu1d" },
  { icon: TrendingUp,      titleKey: "pu2", descKey: "pu2d" },
  { icon: GraduationCap,   titleKey: "pu3", descKey: "pu3d" },
  { icon: Rocket,          titleKey: "pu4", descKey: "pu4d" },
  { icon: Brain,           titleKey: "pu5", descKey: "pu5d" },
] as const;

const rescuePacks = [
  { icon: LifeBuoy,   titleKey: "rp1", descKey: "rp1d" },
  { icon: BookOpen,   titleKey: "rp2", descKey: "rp2d" },
  { icon: Rocket,     titleKey: "rp3", descKey: "rp3d" },
  { icon: TrendingUp, titleKey: "rp4", descKey: "rp4d" },
] as const;

const diffPoints = ["diff1", "diff2", "diff3", "diff4", "diff5", "diff6"] as const;

const featuresBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.co.za/" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://braintrack.co.za/features" },
  ],
};

const MARKER_SHADOW = { textShadow: "0 2px 0 rgba(0,0,0,0.6)" } as const;

/** Wall-written section heading — marker lettering over a spray smear,
 * with an optional marker eyebrow and plain white subtitle. No boxes. */
function WallHeading({
  smear,
  eyebrow,
  title,
  subtitle,
}: {
  smear: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="space-y-3">
      {eyebrow && (
        <p
          className="graffiti-hand text-xs uppercase tracking-[0.24em]"
          style={{ color: smear, ...MARKER_SHADOW }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="spray-title graffiti-hand text-3xl sm:text-4xl md:text-5xl text-white -rotate-1"
        style={MARKER_SHADOW}
      >
        <SpraySmear color={smear} />
        {title}
      </h2>
      {subtitle && <p className="text-white max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export default function FeaturesPage() {
  const { language } = useLanguage();
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
  const c = t[language];
  const isAf = language === "af";

  return (
    <div className="relative min-h-screen bg-background text-white overflow-hidden">
      <GraffitiSplats variant="full" opacity={0.5} />
      <div className="relative z-10">
        <PublicNav />
        <main className="pt-14">
          {/* ═══ Hero — written straight on the wall ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-16">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                <span
                  className="graffiti-hand text-sm uppercase tracking-[0.24em]"
                  style={{ color: "#7FEFFF", ...MARKER_SHADOW }}
                >
                  {c.heroPill}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                  {c.heroEyebrow}
                </span>
              </div>

              <h1
                className="spray-title graffiti-hand text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white -rotate-1 max-w-4xl"
                style={MARKER_SHADOW}
                data-testid="text-features-title"
              >
                <SpraySmear color="#6FA8FF" />
                {c.heroTitle}
              </h1>

              <p className="text-white max-w-2xl leading-relaxed text-lg mt-7" data-testid="text-features-subtitle">
                {c.heroSubtitle}
              </p>

              {/* Count marks — plain wall text with coloured dots, no pills */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-7">
                {[
                  { label: c.heroChip1, hex: "#7FEFFF" },
                  { label: c.heroChip2, hex: "#C6A4FF" },
                  { label: c.heroChip3, hex: "#FF9FE5" },
                ].map(({ label, hex }) => (
                  <span key={label} className="inline-flex items-center gap-2 text-sm font-bold text-white">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: hex, boxShadow: `0 0 8px ${hex}` }}
                      aria-hidden
                    />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ Core Features — Brain Boost ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-5xl mx-auto">
              <WallHeading
                smear="#7FEFFF"
                eyebrow={isAf ? "Kerninhoud" : "What's Included"}
                title={c.sectionCore}
                subtitle={c.coreDesc}
              />

              {/* Price — big pastel marker, small white label. No box. */}
              <div className="mt-6 mb-10">
                <p
                  className="graffiti-hand text-3xl sm:text-4xl"
                  style={{ color: "#FFF29E", ...MARKER_SHADOW }}
                  data-testid="text-core-price"
                >
                  {c.corePriceLabel}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white mt-1.5">
                  {c.corePriceSub}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-9">
                {coreFeatures.map((f, i) => {
                  const hex = PASTELS[i % PASTELS.length];
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-start gap-3" data-testid={`card-feature-${i}`}>
                      <Icon
                        className="w-5 h-5 mt-1.5 shrink-0"
                        style={{ color: hex, filter: `drop-shadow(0 0 6px ${hex})` }}
                      />
                      <div className="min-w-0">
                        <h3 className="graffiti-hand text-lg text-white leading-snug" style={MARKER_SHADOW}>
                          {c[f.titleKey as keyof typeof c] as string}
                        </h3>
                        <p className="text-sm text-white leading-relaxed mt-1.5">
                          {c[f.descKey as keyof typeof c] as string}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ═══ Power-Ups — big pastel numerals on the wall ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-5xl mx-auto">
              <WallHeading
                smear="#C6A4FF"
                eyebrow={isAf ? "Opsioneel" : "Optional"}
                title={c.sectionPowerUps}
                subtitle={c.powerUpDesc}
              />

              <div className="mt-10 space-y-9">
                {powerUps.map((f, i) => {
                  const hex = PASTELS[(i + 2) % PASTELS.length];
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-start gap-5" data-testid={`card-powerup-${i}`}>
                      <span
                        className="graffiti-hand text-4xl md:text-5xl leading-none shrink-0 w-14 md:w-16"
                        style={{ color: hex, ...MARKER_SHADOW }}
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                          <Icon
                            className="w-4 h-4 shrink-0"
                            style={{ color: hex, filter: `drop-shadow(0 0 6px ${hex})` }}
                          />
                          <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                            {c[f.titleKey as keyof typeof c] as string}
                          </h3>
                          <span
                            className="graffiti-hand text-xs uppercase tracking-[0.18em]"
                            style={{ color: hex, ...MARKER_SHADOW }}
                          >
                            {c.powerUpPill}
                          </span>
                        </div>
                        <p className="text-sm text-white leading-relaxed max-w-2xl">
                          {c[f.descKey as keyof typeof c] as string}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ═══ Rescue Packs — pastel left-border callouts ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-5xl mx-auto">
              <WallHeading
                smear="#FF9FE5"
                eyebrow={c.rescuePill}
                title={c.sectionRescue}
                subtitle={c.rescueDesc}
              />

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {rescuePacks.map((f, i) => {
                  const hex = PASTELS[(i + 4) % PASTELS.length];
                  const Icon = f.icon;
                  return (
                    <div
                      key={i}
                      className="pl-4 py-1"
                      style={{ borderLeft: `3px solid ${hex}` }}
                      data-testid={`card-rescue-${i}`}
                    >
                      <p
                        className="graffiti-hand text-xs uppercase tracking-[0.22em] mb-1.5"
                        style={{ color: hex, ...MARKER_SHADOW }}
                      >
                        SOS · {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="flex items-center gap-2 text-base font-bold text-white leading-snug mb-1.5">
                        <Icon
                          className="w-4 h-4 shrink-0"
                          style={{ color: hex, filter: `drop-shadow(0 0 6px ${hex})` }}
                        />
                        {c[f.titleKey as keyof typeof c] as string}
                      </h3>
                      <p className="text-sm text-white leading-relaxed">
                        {c[f.descKey as keyof typeof c] as string}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ═══ Why BrainTrack Works — stats + checklist ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-5xl mx-auto">
              <WallHeading
                smear="#93FFB8"
                eyebrow={isAf ? "Strategie" : "Strategy"}
                title={c.sectionDiff}
                subtitle={c.diffSubtitle}
              />

              {/* Stats — big pastel numbers, small white labels. No boxes. */}
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
                {[
                  { label: c.stat1L, value: c.stat1V, hex: "#7FEFFF" },
                  { label: c.stat2L, value: c.stat2V, hex: "#FFF29E" },
                  { label: c.stat3L, value: c.stat3V, hex: "#C6A4FF" },
                  { label: c.stat4L, value: c.stat4V, hex: "#FF9FE5" },
                ].map(({ label, value, hex }) => (
                  <div key={label}>
                    <div
                      className="graffiti-hand text-4xl md:text-5xl leading-none"
                      style={{ color: hex, ...MARKER_SHADOW }}
                    >
                      {value}
                    </div>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white leading-snug">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Differentiator checklist — small pastel checks, plain white text */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {diffPoints.map((key, i) => (
                  <div key={i} className="flex items-center gap-3" data-testid={`text-diff-point-${i}`}>
                    <CheckCircle
                      className="w-4 h-4 shrink-0"
                      style={{
                        color: PASTELS[i % PASTELS.length],
                        filter: `drop-shadow(0 0 5px ${PASTELS[i % PASTELS.length]})`,
                      }}
                    />
                    <span className="text-white font-medium leading-snug">{c[key as keyof typeof c] as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
