import { PublicNav } from "@/components/public-nav";
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
  Sparkles,
  AlertTriangle,
  ArrowRight,
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

// Canonical rainbow
// Section accents — one colour per section, not per tile. Drives borders,
// glows, icon hue and section header pill. Stops the page reading as a
// fruit-salad of nine simultaneous rainbow tiles.
const ACCENT = {
  core:    { hex: "#28c9d6", halo: "rgba(40,201,214,0.28)" },  // cyan — Brain Boost (included)
  price:   { hex: "#ffd83a", halo: "rgba(255,216,58,0.28)" },  // yellow — price highlight only
  power:   { hex: "#8e7cdc", halo: "rgba(142,124,220,0.28)" }, // violet — optional add-ons
  rescue:  { hex: "#e6519c", halo: "rgba(230,81,156,0.28)" },  // pink — emergency packs
  proof:   { hex: "#4f8cd9", halo: "rgba(79,140,217,0.28)" },  // blue — proof / strategy
} as const;
type Accent = { hex: string; halo: string };
// Back-compat: the bento + lists used to map RAINBOW[i] per tile. Kept as a
// constant alias to a single colour so existing callers compile unchanged.
const RAINBOW: Accent[] = Array.from({ length: 9 }, () => ACCENT.core);

/** Bento layout – each core feature gets a span + tone */
const bentoLayout: Array<{ col: string; row: string; tone: "hero" | "wide" | "std" }> = [
  { col: "md:col-span-2 md:row-span-2", row: "", tone: "hero" },
  { col: "md:col-span-2",                 row: "", tone: "wide" },
  { col: "",                              row: "", tone: "std"  },
  { col: "",                              row: "", tone: "std"  },
  { col: "md:col-span-2",                 row: "", tone: "wide" },
  { col: "",                              row: "", tone: "std"  },
  { col: "",                              row: "", tone: "std"  },
  { col: "",                              row: "", tone: "std"  },
  { col: "",                              row: "", tone: "std"  },
];

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
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.app/" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://braintrack.app/features" },
  ],
};

/** Bento tile — scales internal typography based on tone */
function BentoTile({
  accent,
  icon: Icon,
  title,
  desc,
  layout,
  testId,
}: {
  accent: { hex: string; halo: string };
  icon: typeof BookOpen;
  title: string;
  desc: string;
  layout: (typeof bentoLayout)[number];
  testId?: string;
}) {
  const isHero = layout.tone === "hero";
  const isWide = layout.tone === "wide";
  return (
    <div
      className={`relative rounded-2xl bg-black p-5 overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 ${layout.col} ${layout.row}`}
      style={{
        border: `1.5px solid ${accent.hex}`,
        boxShadow: `0 0 0 1px ${accent.halo}, 0 0 22px ${accent.halo}, inset 0 0 18px rgba(0,0,0,0.55)`,
      }}
      data-testid={testId}
    >
      {/* Corner brackets */}
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: accent.hex }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: accent.hex }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: accent.hex }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: accent.hex }} />

      {isHero && (
        <div
          aria-hidden
          className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accent.halo} 0%, transparent 70%)`,
          }}
        />
      )}

      <div className={`relative ${isHero ? "h-full flex flex-col justify-between" : "flex items-start gap-4"}`}>
        <div
          className={`rounded-xl bg-black flex items-center justify-center shrink-0 ${isHero ? "w-14 h-14" : "w-11 h-11"}`}
          style={{
            border: `1.5px solid ${accent.hex}`,
            boxShadow: `0 0 14px ${accent.halo}, inset 0 0 10px ${accent.halo}`,
          }}
        >
          <Icon
            className={isHero ? "w-7 h-7" : "w-5 h-5"}
            style={{ color: accent.hex, filter: `drop-shadow(0 0 6px ${accent.halo})` }}
          />
        </div>
        <div className={`min-w-0 ${isHero ? "mt-4 space-y-3" : "space-y-1.5"}`}>
          <h3
            className={`font-black text-white leading-tight ${isHero ? "text-2xl md:text-3xl" : isWide ? "text-lg" : "text-base font-bold"}`}
            style={{ textShadow: `0 0 10px ${accent.halo}` }}
          >
            {title}
          </h3>
          <p className={`text-white font-medium leading-relaxed ${isHero ? "text-base" : "text-sm"}`}>
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Section header */
function SectionHeader({
  eyebrow,
  pill,
  pillIcon: PillIcon,
  pillHex,
  title,
  subtitle,
}: {
  eyebrow?: string;
  pill: string;
  pillIcon: typeof Sparkles;
  pillHex: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black"
          style={{ border: `1px solid ${pillHex}`, boxShadow: `0 0 14px ${pillHex}66` }}
        >
          <PillIcon className="w-3.5 h-3.5" style={{ color: pillHex, filter: `drop-shadow(0 0 4px ${pillHex})` }} />
          <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: pillHex }}>
            {pill}
          </span>
        </div>
        {eyebrow && (
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white">
            {eyebrow}
          </span>
        )}
      </div>
      <h2
        className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.05] text-white"
        style={{ textShadow: `0 0 18px ${pillHex}55` }}
      >
        {title}
      </h2>
      {subtitle && <p className="text-white font-medium max-w-2xl">{subtitle}</p>}
    </div>
  );
}

export default function FeaturesPage() {
  const { language } = useLanguage();
  useSEO({
    title: "Features | BrainTrack™ CAPS Study Plan & NSC Past Papers",
    description:
      "Explore BrainTrack™ features: CAPS weekly study plan, NSC past papers with memos, gap detection, Rizz AI tutor, gamified progress & parent dashboard. R169/month.",
    canonical: "https://braintrack.app/features",
    ogTitle: "BrainTrack™ Features — CAPS Plan, NSC Past Papers & AI Tutor",
    ogDescription:
      "CAPS-aligned study plan, 10 years of NSC past papers with memos, gap detection, Rizz AI tutor, and progress tracking for Grade 12 Matric. Try free for 14 days.",
    ogUrl: "https://braintrack.app/features",
    jsonLd: featuresBreadcrumb,
  });
  const c = t[language];
  const isAf = language === "af";

  return (
    <div className="min-h-screen relative bg-black text-white">
      {/* Cosmic wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 12% 8%,  rgba(255,106,31,0.10) 0%, transparent 60%)," +
            "radial-gradient(ellipse 55% 45% at 88% 6%,  rgba(230,81,156,0.10) 0%, transparent 60%)," +
            "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(40,201,214,0.10) 0%, transparent 65%)," +
            "#000",
        }}
      />
      <div className="relative z-10">
        <PublicNav />
        <main className="pt-14">
          {/* ═══ Hero ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-14">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black"
                  style={{ border: "1px solid #28c9d6", boxShadow: "0 0 12px rgba(40,201,214,0.35)" }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#28c9d6" }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "#28c9d6" }}>
                    {c.heroPill}
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                  {c.heroEyebrow}
                </span>
              </div>

              <h1
                className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.98] max-w-5xl"
                data-testid="text-features-title"
              >
                {c.heroTitle}
              </h1>

              {/* Single accent rule (was a rainbow gradient) */}
              <div
                aria-hidden
                className="h-[2px] my-7 max-w-xl"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #28c9d6 35%, #28c9d6 65%, transparent)",
                  boxShadow: "0 0 14px rgba(40,201,214,0.45)",
                }}
              />

              <p className="text-white max-w-2xl leading-relaxed text-lg" data-testid="text-features-subtitle">
                {c.heroSubtitle}
              </p>

              {/* Inline count chips */}
              <div className="flex flex-wrap gap-2.5 mt-7">
                {[
                  { label: c.heroChip1, hex: "#28c9d6" },
                  { label: c.heroChip2, hex: "#ffd83a" },
                  { label: c.heroChip3, hex: "#e6519c" },
                ].map(({ label, hex }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black"
                    style={{ border: `1px solid ${hex}88`, boxShadow: `0 0 10px ${hex}44` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: hex, boxShadow: `0 0 6px ${hex}` }} />
                    <span className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: hex }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ Core Features — BENTO ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pb-14">
            <div className="max-w-6xl mx-auto">
              <SectionHeader
                eyebrow={isAf ? "Kerninhoud" : "What's Included"}
                pill="Brain Boost"
                pillIcon={Sparkles}
                pillHex="#28c9d6"
                title={<span>{c.sectionCore}</span>}
                subtitle={c.coreDesc}
              />

              {/* Price strip */}
              <div className="mt-5 mb-7 flex flex-wrap items-center gap-3">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black"
                  style={{ border: "1px solid #ffd83a88" }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#ffd83a" }} />
                  <span className="text-sm font-black" style={{ color: "#ffd83a" }} data-testid="text-core-price">
                    {c.corePriceLabel}
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                  {c.corePriceSub}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-4">
                {coreFeatures.map((f, i) => (
                  <BentoTile
                    key={i}
                    accent={ACCENT.core}
                    icon={f.icon}
                    title={c[f.titleKey as keyof typeof c] as string}
                    desc={c[f.descKey as keyof typeof c] as string}
                    layout={bentoLayout[i]}
                    testId={`card-feature-${i}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ═══ Power-Ups — EDITORIAL NUMBERED LIST ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pb-14">
            <div className="max-w-5xl mx-auto">
              <SectionHeader
                eyebrow={isAf ? "Opsioneel" : "Optional"}
                pill={c.powerUpPill}
                pillIcon={Zap}
                pillHex="#8e7cdc"
                title={
                  language === "en" ? (
                    <>Optional <span style={{ color: "#8e7cdc" }}>Power-Ups</span></>
                  ) : (
                    <>Opsionele <span style={{ color: "#8e7cdc" }}>Krag-Opgradings</span></>
                  )
                }
                subtitle={c.powerUpDesc}
              />

              <div className="mt-10 divide-y divide-white/10">
                {powerUps.map((f, i) => {
                  const accent = ACCENT.power;
                  const Icon = f.icon;
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_auto_1fr_auto] gap-4 md:gap-6 items-center py-6"
                      data-testid={`card-powerup-${i}`}
                    >
                      {/* Big numeral */}
                      <div
                        className="font-black tabular-nums text-5xl md:text-6xl leading-none"
                        style={{
                          color: accent.hex,
                          textShadow: `0 0 18px ${accent.halo}`,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      {/* Icon chip (desktop) */}
                      <div
                        className="hidden md:flex w-11 h-11 rounded-xl bg-black items-center justify-center"
                        style={{
                          border: `1.5px solid ${accent.hex}`,
                          boxShadow: `0 0 14px ${accent.halo}, inset 0 0 10px ${accent.halo}`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: accent.hex, filter: `drop-shadow(0 0 6px ${accent.halo})` }} />
                      </div>

                      {/* Text */}
                      <div className="col-span-2 md:col-span-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3
                            className="text-lg md:text-xl font-black text-white leading-tight"
                            style={{ textShadow: `0 0 10px ${accent.halo}` }}
                          >
                            {c[f.titleKey as keyof typeof c] as string}
                          </h3>
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] bg-black"
                            style={{ color: accent.hex, border: `1px solid ${accent.hex}`, boxShadow: `0 0 10px ${accent.halo}` }}
                          >
                            {c.powerUpPill}
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium leading-relaxed">
                          {c[f.descKey as keyof typeof c] as string}
                        </p>
                      </div>

                      {/* Arrow (desktop) */}
                      <div className="hidden md:block">
                        <ArrowRight className="w-5 h-5" style={{ color: accent.hex, filter: `drop-shadow(0 0 6px ${accent.halo})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ═══ Rescue Packs — EMERGENCY BAND ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pb-14">
            <div className="max-w-6xl mx-auto">
              <SectionHeader
                eyebrow={isAf ? "Nood" : "Emergency"}
                pill={c.rescuePill}
                pillIcon={AlertTriangle}
                pillHex="#e6519c"
                title={<span>{c.sectionRescue}</span>}
                subtitle={c.rescueDesc}
              />

              {/* Calm container — single pink hairline + soft halo (was a
                  diagonal candy-cane band that fought the cards inside it) */}
              <div
                className="mt-8 rounded-2xl bg-black p-4 sm:p-5"
                style={{
                  border: "1px solid rgba(230,81,156,0.55)",
                  boxShadow: "0 0 22px rgba(230,81,156,0.18)",
                }}
              >
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {rescuePacks.map((f, i) => {
                      const accent = ACCENT.rescue;
                      const Icon = f.icon;
                      return (
                        <div
                          key={i}
                          className="relative rounded-xl bg-black p-4 group"
                          style={{
                            border: `1.5px solid ${accent.hex}`,
                            boxShadow: `0 0 18px ${accent.halo}, inset 0 0 12px rgba(0,0,0,0.6)`,
                          }}
                          data-testid={`card-rescue-${i}`}
                        >
                          <div className="flex items-center gap-2.5 mb-3">
                            <div
                              className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shrink-0"
                              style={{
                                border: `1.5px solid ${accent.hex}`,
                                boxShadow: `0 0 10px ${accent.halo}`,
                              }}
                            >
                              <Icon className="w-4 h-4" style={{ color: accent.hex, filter: `drop-shadow(0 0 5px ${accent.halo})` }} />
                            </div>
                            <span
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] bg-black"
                              style={{ color: accent.hex, border: `1px solid ${accent.hex}` }}
                            >
                              SOS · {String(i + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <h3
                            className="text-base font-black text-white leading-snug mb-3 min-h-[2.6em]"
                            style={{ textShadow: `0 0 4px ${accent.halo}` }}
                          >
                            {c[f.titleKey as keyof typeof c] as string}
                          </h3>
                          <p className="text-xs text-white font-medium leading-relaxed">
                            {c[f.descKey as keyof typeof c] as string}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ Why BrainTrack Works — STATS + POINTS ═══ */}
          <section className="px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-6xl mx-auto">
              <SectionHeader
                eyebrow={isAf ? "Strategie" : "Strategy"}
                pill={isAf ? "Strategie" : "Strategy"}
                pillIcon={Target}
                pillHex="#4f8cd9"
                title={
                  language === "en" ? (
                    <>Why <span style={{ color: "#4f8cd9" }}>BrainTrack</span> Works</>
                  ) : (
                    <>Hoekom <span style={{ color: "#4f8cd9" }}>BrainTrack</span> Werk</>
                  )
                }
                subtitle={c.diffSubtitle}
              />

              {/* Big stat cards */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: c.stat1L, value: c.stat1V, hex: "#28c9d6" },
                  { label: c.stat2L, value: c.stat2V, hex: "#ffd83a" },
                  { label: c.stat3L, value: c.stat3V, hex: "#b066d6" },
                  { label: c.stat4L, value: c.stat4V, hex: "#e6519c" },
                ].map(({ label, value, hex }) => (
                  <div
                    key={label}
                    className="relative rounded-2xl bg-black p-5 overflow-hidden"
                    style={{
                      border: `1.5px solid ${hex}`,
                      boxShadow: `0 0 18px ${hex}44, inset 0 0 16px rgba(0,0,0,0.6)`,
                    }}
                  >
                    <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: hex }} />
                    <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: hex }} />
                    <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: hex }} />
                    <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: hex }} />
                    <div
                      className="text-4xl md:text-5xl font-black tabular-nums leading-none"
                      style={{ color: hex, textShadow: `0 0 18px ${hex}77`, fontVariantNumeric: "tabular-nums" }}
                    >
                      {value}
                    </div>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white leading-snug">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Differentiator points — single proof-blue accent on every check */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {diffPoints.map((key, i) => (
                  <div key={i} className="flex items-center gap-3" data-testid={`text-diff-point-${i}`}>
                    <CheckCircle
                      className="w-4 h-4 shrink-0"
                      style={{ color: ACCENT.proof.hex, filter: `drop-shadow(0 0 5px ${ACCENT.proof.halo})` }}
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
