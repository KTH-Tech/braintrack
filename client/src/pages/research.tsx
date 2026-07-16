import { useState, useEffect, useRef } from "react";
import { PublicNav } from "@/components/public-nav";
import { GraffitiSplats, SpraySmear } from "@/components/graffiti-splats";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";
import {
  Brain, Target, Zap, BookOpen, MessageSquare, Shield,
  ArrowRight, TrendingUp, Flame, Users,
  ChevronDown, ChevronUp, BarChart3, Clock, Repeat, Eye,
  CheckCircle2, GraduationCap,
} from "lucide-react";
import { Link } from "wouter";

// Soft pastel wall palette — accents, borders and marker highlights only.
const PASTELS = ["#6FA8FF", "#7FEFFF", "#93FFB8", "#FFF29E", "#FFC48F", "#FF9FE5", "#C6A4FF"];

const MARKER_SHADOW = { textShadow: "0 2px 0 rgba(0,0,0,0.6)" } as const;

function useInView(options?: { threshold?: number; once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const once = options?.once ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: options?.threshold ?? 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, options?.threshold]);

  return { ref, inView };
}

function useAnimatedCounter(target: string, inView: boolean) {
  const [display, setDisplay] = useState("0");
  const numericMatch = target.match(/^([\d.]+)/);
  const suffix = numericMatch ? target.slice(numericMatch[0].length) : target;
  const numericValue = numericMatch ? parseFloat(numericMatch[0]) : 0;
  const isDecimal = numericMatch ? numericMatch[0].includes(".") : false;

  useEffect(() => {
    if (!inView || !numericMatch) {
      if (!numericMatch) setDisplay(target);
      return;
    }
    let frame: number;
    const duration = 2800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericValue * eased;
      setDisplay(
        (isDecimal ? current.toFixed(2) : Math.round(current).toString()) + suffix
      );
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return display;
}

const t = {
  en: {
    title: "Research-Backed Learning",
    subtitle: "Built on educational science to help you master the matric exams.",
    c1Title: "Your Learning Profile",
    c1Desc: "Are you a Visual, Auditory, Reading/Writing, or Kinesthetic learner? We identify your style and adapt content to match.",
    c1Detail: "Research by Neil Fleming (VARK model, 1987) shows that matching learning content to a student's preferred modality increases engagement by up to 40%. BrainTrack's profiling test uses validated questions to determine your strongest learning channel, then adapts how content is presented — more diagrams for visual learners, audio explanations for auditory learners, and hands-on practice for kinesthetic learners.",
    c1Source: "Fleming, N.D. (2001). Teaching and Learning Styles: VARK Strategies",
    c2Title: "Spaced Repetition",
    c2Stat: "80%",
    c2StatLabel: "recall after 6 months",
    c2Desc: "Spaced practice achieves 80% recall vs 20% with cramming. Our system optimizes your review intervals.",
    c2Detail: "Hermann Ebbinghaus first demonstrated the 'forgetting curve' in 1885 — without review, we forget 70% within 24 hours. Spaced repetition, refined by researchers like Piotr Wozniak (SuperMemo algorithm, 1987), schedules reviews at increasing intervals to beat this curve. Studies show spaced practice leads to 80% long-term recall vs just 20% from massed practice (cramming).",
    c2Source: "Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology",
    c3Title: "Active Recall",
    c3Stat: "3×",
    c3StatLabel: "better retention",
    c3Desc: "Active recall boosts retention 3× compared to passive reading. Practice questions strengthen memory pathways.",
    c3Detail: "A landmark study by Karpicke & Blunt (2011) published in Science demonstrated that retrieval practice (testing yourself) produces 50% more learning than concept mapping and 3× more than re-reading. Every time you actively retrieve information, you strengthen the neural pathways for that knowledge. BrainTrack's quizzes and daily challenges are designed around this principle.",
    c3Source: "Karpicke, J.D. & Blunt, J.R. (2011). Retrieval Practice Produces More Learning than Elaborative Studying. Science, 331(6018)",
    c4Title: "Exam Pattern Analysis",
    c4Stat: "40%",
    c4StatLabel: "more effective",
    c4Desc: "Exam-style practice is 40% more effective than reading textbooks. We focus on simulated NSC practice.",
    c4Detail: "Transfer-appropriate processing theory (Morris et al., 1977) explains why practising in the same format as the test leads to better results. A meta-analysis by Dunlosky et al. (2013) rated practice testing as the most effective study strategy. BrainTrack uses actual NSC exam patterns from 2015–2025 to create practice that mirrors what you'll face in the real exam.",
    c4Source: "Dunlosky, J. et al. (2013). Improving Students' Learning With Effective Learning Techniques. Psychological Science in the Public Interest",
    c5Title: "Instant Feedback",
    c5Desc: "Immediate feedback accelerates learning. Rizz provides explanations based on official standards.",
    c5Detail: "Research by Hattie & Timperley (2007) identified feedback as one of the most powerful influences on learning, with an effect size of 0.73 (well above the 0.40 threshold for meaningful impact). Immediate, specific feedback helps students correct misconceptions before they become entrenched. Rizz provides instant explanations after every question, referencing official CAPS standards.",
    c5Source: "Hattie, J. & Timperley, H. (2007). The Power of Feedback. Review of Educational Research, 77(1)",
    c6Title: "Metacognition",
    c6Desc: "Understanding your learning style boosts performance. Our profiling test identifies how you learn best.",
    c6Detail: "Metacognition — 'thinking about thinking' — has been shown to improve academic performance by up to 7 months' additional progress according to the Education Endowment Foundation (2018). When students understand how they learn, they make better study decisions. BrainTrack's gap tracking and progress analytics build metacognitive awareness by showing exactly where you're strong and where you need work.",
    c6Source: "Education Endowment Foundation (2018). Metacognition and Self-Regulated Learning. Teaching & Learning Toolkit",
    cta1: "Signup My Child",
    cta1LoggedIn: "Go to My Classroom",
    cta2: "View Features",
    tapToLearn: "Tap to learn more",
    collapse: "Show less",
    sourceLabel: "Source",
    caseStudiesTitle: "Engagement & Consistency",
    caseStudiesSubtitle: "Every feature in BrainTrack is grounded in proven educational research.",
    caseStudy1Title: "10 Years of Real Papers",
    caseStudy1Stat: "2015–2025",
    caseStudy1Desc: "BrainTrack is built on a decade of actual NSC exam papers and official memos — not textbook questions or made-up content. Every drill, quiz, and mock exam comes from what was really asked in matric. That means your child practises exactly what they'll face.",
    caseStudy2Title: "20 Minutes a Day",
    caseStudy2Stat: "20 min",
    caseStudy2Desc: "Short, focused study sessions beat marathon cramming every time. BrainTrack's daily plans are designed around 20-minute bursts — enough to build real understanding without burning out. Consistency beats intensity.",
    caseStudy3Title: "Test Yourself to Remember",
    caseStudy3Stat: "Practice",
    caseStudy3Desc: "Re-reading notes doesn't work. Answering real exam questions does. Every quiz, daily challenge, and past paper on BrainTrack forces active recall — the most effective way to move knowledge into long-term memory.",
    caseStudy4Title: "Streaks Build Habits",
    caseStudy4Stat: "Daily",
    caseStudy4Desc: "Studying every day — even for a few minutes — builds automatic habits. BrainTrack tracks your streak, sends reminders, and rewards consistency with XP and badges. Once the habit forms, studying takes less effort.",
    caseStudy5Title: "Mix Your Subjects",
    caseStudy5Stat: "Rotate",
    caseStudy5Desc: "Studying one subject for hours is less effective than rotating between them. BrainTrack's study planner automatically spreads your subjects across the week so your brain stays sharp and retention improves.",
    caseStudy6Title: "Parents See Everything",
    caseStudy6Stat: "Weekly",
    caseStudy6Desc: "When learners know a parent can see their progress, they study harder. BrainTrack sends weekly reports showing study days, accuracy, streaks, and which subjects need attention — no nagging required, just visibility.",
    comparisonTitle: "BrainTrack vs Traditional Study",
    comparisonBrainTrack: "With BrainTrack",
    comparisonTraditional: "Traditional Study",
    comp1Label: "Long-term Recall",
    comp1BT: "80%",
    comp1Trad: "20%",
    comp2Label: "Retention Boost",
    comp2BT: "3× better",
    comp2Trad: "Baseline",
    comp3Label: "Feedback Speed",
    comp3BT: "Instant",
    comp3Trad: "Days later",
    comp4Label: "Study Habit",
    comp4BT: "20 min/day",
    comp4Trad: "Cramming",
    comp5Label: "Content Source",
    comp5BT: "Real NSC papers",
    comp5Trad: "Textbooks",
    comp6Label: "Parent Visibility",
    comp6BT: "Weekly reports",
    comp6Trad: "None",
    statsTitle: "The Science in Numbers",
  },
  af: {
    title: "Navorsing-Gebaseerde Leer",
    subtitle: "Gebou op opvoedkundige wetenskap om jou te help om die matriekeksamen te bemeester.",
    c1Title: "Jou Leerprofiel",
    c1Desc: "Is jy 'n Visuele, Ouditiewe, Lees/Skryf, of Kinestetiese leerder? Ons identifiseer jou styl en pas inhoud aan.",
    c1Detail: "Navorsing deur Neil Fleming (VARK-model, 1987) toon dat die aanpassing van leerinhoud by 'n student se voorkeursmodaliteit betrokkenheid met tot 40% verhoog. BrainTrack se profieltoets gebruik gevalideerde vrae om jou sterkste leerkanaal te bepaal, en pas dan aan hoe inhoud aangebied word.",
    c1Source: "Fleming, N.D. (2001). Teaching and Learning Styles: VARK Strategies",
    c2Title: "Gespasieerde Herhaling",
    c2Stat: "80%",
    c2StatLabel: "herroeping na 6 maande",
    c2Desc: "Gespasieerde oefening bereik 80% herroeping vs 20% met inkramming. Ons stelsel optimaliseer jou hersienings.",
    c2Detail: "Hermann Ebbinghaus het die 'vergetelkurwe' in 1885 gedemonstreer — sonder hersiening vergeet ons 70% binne 24 uur. Gespasieerde herhaling, verfyn deur navorsers soos Piotr Wozniak (SuperMemo-algoritme, 1987), skeduleer hersienings teen toenemende intervalle.",
    c2Source: "Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology",
    c3Title: "Aktiewe Herroeping",
    c3Stat: "3×",
    c3StatLabel: "beter retensie",
    c3Desc: "Aktiewe herroeping verhoog retensie 3× in vergelyking met passiewe lees. Oefenvrae versterk geheuepaaie.",
    c3Detail: "Karpicke & Blunt (2011) se studie in Science het gedemonstreer dat herroepingsoefening 50% meer leer produseer as konsepkartering en 3× meer as herlees. Elke keer as jy aktief inligting herroep, versterk jy die neurale paaie vir daardie kennis.",
    c3Source: "Karpicke, J.D. & Blunt, J.R. (2011). Science, 331(6018)",
    c4Title: "Eksamenpatroon-Analise",
    c4Stat: "40%",
    c4StatLabel: "meer effektief",
    c4Desc: "Eksamen-styl oefening is 40% meer effektief as handboeklees. Ons fokus op gesimuleerde NSC-oefening.",
    c4Detail: "Oordrag-toepaslike verwerkingsteorie verklaar waarom oefening in dieselfde formaat as die toets tot beter resultate lei. Dunlosky et al. (2013) het oefentoetsing as die doeltreffendste studietegniek gegradeer. BrainTrack gebruik werklike NSC-eksamenpatrone van 2015–2025.",
    c4Source: "Dunlosky, J. et al. (2013). Psychological Science in the Public Interest",
    c5Title: "Kits-Terugvoer",
    c5Desc: "Onmiddellike terugvoer versnel leer. Rizz bied verduidelikings gebaseer op amptelike standaarde.",
    c5Detail: "Navorsing deur Hattie & Timperley (2007) het terugvoer as een van die kragtigste invloede op leer geïdentifiseer, met 'n effekgrootte van 0.73. Onmiddellike, spesifieke terugvoer help studente om wanopvattings reg te stel voordat dit vasgelê word.",
    c5Source: "Hattie, J. & Timperley, H. (2007). Review of Educational Research, 77(1)",
    c6Title: "Metakognisie",
    c6Desc: "Om jou leerstyl te verstaan, verbeter prestasie. Ons profieltoets identifiseer hoe jy die beste leer.",
    c6Detail: "Metakognisie — 'dink oor dink' — verbeter akademiese prestasie met tot 7 maande se bykomende vordering volgens die Education Endowment Foundation (2018). BrainTrack se gapingsopsporing en vorderingsanalise bou metakognitiewe bewustheid.",
    c6Source: "Education Endowment Foundation (2018). Teaching & Learning Toolkit",
    cta1: "Registreer My Kind",
    cta1LoggedIn: "My Klaskamer",
    cta2: "Sien Funksies",
    tapToLearn: "Tik om meer te leer",
    collapse: "Wys minder",
    sourceLabel: "Bron",
    caseStudiesTitle: "Betrokkenheid & Konsekwentheid",
    caseStudiesSubtitle: "Elke funksie in BrainTrack is gebaseer op bewese opvoedkundige navorsing.",
    caseStudy1Title: "10 Jaar se Werklike Vraestelle",
    caseStudy1Stat: "2015–2025",
    caseStudy1Desc: "BrainTrack is gebou op 'n dekade se werklike NSC-eksamenvraestelle en amptelike memo's — nie handboek-vrae of verdigde inhoud nie. Elke oefening, vasvra en proefeksamen kom uit wat regtig in matriek gevra is.",
    caseStudy2Title: "20 Minute per Dag",
    caseStudy2Stat: "20 min",
    caseStudy2Desc: "Kort, gefokusde studiesessies klop maraton-inkramming elke keer. BrainTrack se daaglikse planne is ontwerp rondom 20-minuut-sessies — genoeg om werklike begrip te bou sonder uitbranding.",
    caseStudy3Title: "Toets Jouself om te Onthou",
    caseStudy3Stat: "Oefen",
    caseStudy3Desc: "Notas oorlees werk nie. Werklike eksamenvrae beantwoord wel. Elke vasvra en daaglikse uitdaging forseer aktiewe herroeping.",
    caseStudy4Title: "Reekse Bou Gewoontes",
    caseStudy4Stat: "Daagliks",
    caseStudy4Desc: "Elke dag studeer — selfs net vir 'n paar minute — bou outomatiese gewoontes. BrainTrack volg jou reeks en beloon konsekwentheid met XP en kentekens.",
    caseStudy5Title: "Wissel Jou Vakke Af",
    caseStudy5Stat: "Roteer",
    caseStudy5Desc: "Om ure lank een vak te studeer is minder effektief as om tussen hulle te wissel. BrainTrack se studieplanner versprei outomaties jou vakke oor die week.",
    caseStudy6Title: "Ouers Sien Alles",
    caseStudy6Stat: "Weekliks",
    caseStudy6Desc: "Wanneer leerders weet 'n ouer kan hul vordering sien, studeer hulle harder. BrainTrack stuur weeklikse verslae — geen geseur nodig nie, net sigbaarheid.",
    comparisonTitle: "BrainTrack vs Tradisionele Studie",
    comparisonBrainTrack: "Met BrainTrack",
    comparisonTraditional: "Tradisionele Studie",
    comp1Label: "Langtermyn Herroeping",
    comp1BT: "80%",
    comp1Trad: "20%",
    comp2Label: "Retensie-Verbetering",
    comp2BT: "3× beter",
    comp2Trad: "Basislynwaarde",
    comp3Label: "Terugvoer-Spoed",
    comp3BT: "Onmiddellik",
    comp3Trad: "Dae later",
    comp4Label: "Studiegewoonte",
    comp4BT: "20 min/dag",
    comp4Trad: "Inkramming",
    comp5Label: "Inhoud Bron",
    comp5BT: "Werklike NSC-vraestelle",
    comp5Trad: "Handboeke",
    comp6Label: "Ouer Sigbaarheid",
    comp6BT: "Weeklikse verslae",
    comp6Trad: "Geen",
    statsTitle: "Die Wetenskap in Syfers",
  },
};

const scienceCards = [
  { icon: Brain,         color: "#6FA8FF", titleKey: "c1Title" as const, descKey: "c1Desc" as const, detailKey: "c1Detail" as const, sourceKey: "c1Source" as const, statKey: null,                  statLabelKey: null,                        barValue: 40, barLabel: "engagement" },
  { icon: Target,        color: "#7FEFFF", titleKey: "c2Title" as const, descKey: "c2Desc" as const, detailKey: "c2Detail" as const, sourceKey: "c2Source" as const, statKey: "c2Stat" as const, statLabelKey: "c2StatLabel" as const, barValue: 80, barLabel: "recall" },
  { icon: Zap,           color: "#FFF29E", titleKey: "c3Title" as const, descKey: "c3Desc" as const, detailKey: "c3Detail" as const, sourceKey: "c3Source" as const, statKey: "c3Stat" as const, statLabelKey: "c3StatLabel" as const, barValue: 75, barLabel: "retention" },
  { icon: BookOpen,      color: "#C6A4FF", titleKey: "c4Title" as const, descKey: "c4Desc" as const, detailKey: "c4Detail" as const, sourceKey: "c4Source" as const, statKey: "c4Stat" as const, statLabelKey: "c4StatLabel" as const, barValue: 40, barLabel: "effectiveness" },
  { icon: MessageSquare, color: "#FF9FE5", titleKey: "c5Title" as const, descKey: "c5Desc" as const, detailKey: "c5Detail" as const, sourceKey: "c5Source" as const, statKey: null,                  statLabelKey: null,                        barValue: 73, barLabel: "effect size" },
  { icon: Shield,        color: "#93FFB8", titleKey: "c6Title" as const, descKey: "c6Desc" as const, detailKey: "c6Detail" as const, sourceKey: "c6Source" as const, statKey: null,                  statLabelKey: null,                        barValue: 58, barLabel: "improvement" },
] as const;

const caseStudyItems = [
  { key: "1", icon: TrendingUp, color: "#FFC48F" },
  { key: "2", icon: Clock,      color: "#FFF29E" },
  { key: "3", icon: Target,     color: "#7FEFFF" },
  { key: "4", icon: Flame,      color: "#FF9FE5" },
  { key: "5", icon: Repeat,     color: "#C6A4FF" },
  { key: "6", icon: Users,      color: "#6FA8FF" },
] as const;

function AnimatedBar({ value, delay, color, parentInView }: { value: number; delay: number; color: string; parentInView?: boolean }) {
  const { ref, inView: selfInView } = useInView();
  const isVisible = parentInView !== undefined ? parentInView : selfInView;

  return (
    <div ref={ref} className="w-full h-1.5 rounded-full overflow-hidden" style={{ border: `1px solid ${color}` }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: isVisible ? `${value}%` : "0%",
          transitionDelay: `${delay}ms`,
          background: color,
        }}
      />
    </div>
  );
}

function AnimatedStatCard({ s, i }: { s: { value: string; label: string; icon: any; color: string }; i: number }) {
  const { ref, inView } = useInView();
  const animatedValue = useAnimatedCounter(s.value, inView);
  const Icon = s.icon;

  return (
    <div
      ref={ref}
      className="text-center transition-all duration-700 ease-out"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${i * 100}ms`,
      }}
      data-testid={`card-stat-${i}`}
    >
      <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color, filter: `drop-shadow(0 0 6px ${s.color})` }} />
      <p className="graffiti-hand text-3xl sm:text-4xl leading-none" style={{ color: s.color, ...MARKER_SHADOW }}>
        {animatedValue}
      </p>
      <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white mt-2">{s.label}</p>
    </div>
  );
}

function ScienceCard({ card, index, c, sourceLabel, tapToLearn, collapse }: {
  card: typeof scienceCards[number];
  index: number;
  c: typeof t.en;
  sourceLabel: string;
  tapToLearn: string;
  collapse: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { ref, inView } = useInView();
  const Icon = card.icon;
  const title = c[card.titleKey] as string;
  const desc = c[card.descKey] as string;
  const detail = c[card.detailKey] as string;
  const source = c[card.sourceKey] as string;
  const stat = card.statKey ? (c[card.statKey] as string) : null;
  const statLabel = card.statLabelKey ? (c[card.statLabelKey] as string) : null;

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out h-full"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div
        className="h-full cursor-pointer space-y-3"
        data-testid={`card-research-${index}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <Icon
            className="h-6 w-6 shrink-0"
            style={{ color: card.color, filter: `drop-shadow(0 0 6px ${card.color})` }}
          />
          <button
            className="text-white p-1"
            aria-label={expanded ? collapse : tapToLearn}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <h3 className="graffiti-hand text-xl text-white leading-tight" style={MARKER_SHADOW} data-testid={`text-research-card-title-${index}`}>
          {title}
        </h3>

        {stat && (
          <div className="flex items-baseline gap-3">
            <span className="graffiti-hand text-3xl leading-none" style={{ color: card.color, ...MARKER_SHADOW }}>{stat}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{statLabel}</span>
          </div>
        )}

        <AnimatedBar value={card.barValue} delay={index * 200} color={card.color} parentInView={inView} />
        <p className="text-[10px] text-white uppercase tracking-[0.2em] font-black">{card.barLabel}</p>

        <p className="text-white font-medium leading-relaxed text-sm" data-testid={`text-research-card-desc-${index}`}>
          {desc}
        </p>

        {!expanded && (
          <p className="text-xs text-white font-medium flex items-center gap-1.5">
            <Eye className="w-3 h-3" style={{ color: card.color }} />
            {tapToLearn}
          </p>
        )}

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-1 space-y-3">
            <p className="text-sm text-white leading-relaxed">{detail}</p>
            {/* Source callout — pastel left rule, no box */}
            <div className="flex items-start gap-2 pl-3" style={{ borderLeft: `3px solid ${card.color}` }}>
              <GraduationCap className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: card.color }} />
              <p className="text-[11px] text-white italic">
                <span className="graffiti-hand not-italic" style={{ color: card.color }}>{sourceLabel}:</span> {source}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, bt, trad, btLabel, tradLabel, index, accent }: {
  label: string; bt: string; trad: string; btLabel: string; tradLabel: string; index: number; accent: string;
}) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-[1.1fr_auto_1.1fr] items-center gap-3 md:gap-4 py-5 transition-all duration-700 ease-out"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : "translateX(-24px)",
        transitionDelay: `${index * 90}ms`,
      }}
    >
      {/* BrainTrack side — pastel check, celebrated */}
      <div className="flex items-center gap-3 md:justify-end order-1">
        <div className="flex-1 md:flex-none md:text-right min-w-0">
          <p className="graffiti-hand text-[10px] uppercase tracking-[0.22em] mb-1 md:hidden" style={{ color: accent }}>
            {btLabel}
          </p>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2
              className="w-4 h-4 shrink-0"
              style={{ color: accent, filter: `drop-shadow(0 0 5px ${accent})` }}
            />
            <span className="graffiti-hand text-lg sm:text-xl text-white" style={MARKER_SHADOW}>
              {bt}
            </span>
          </span>
        </div>
      </div>

      {/* Center label + VS mark */}
      <div className="order-0 md:order-2 flex md:flex-col items-center justify-center gap-2 md:gap-1.5 md:px-2">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.22em] text-white text-center md:order-2">
          {label}
        </span>
        <span
          className="hidden md:inline graffiti-hand text-xs md:order-1"
          style={{ color: accent }}
          aria-hidden
        >
          VS
        </span>
      </div>

      {/* Traditional side — plain white, deprecated */}
      <div className="flex items-center gap-3 order-3">
        <div className="flex-1 md:flex-none min-w-0">
          <p className="graffiti-hand text-[10px] uppercase tracking-[0.22em] text-white mb-1 md:hidden">
            {tradLabel}
          </p>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 shrink-0 rounded-full" style={{ background: accent }} aria-hidden />
            <span className="text-base sm:text-lg font-bold text-white">
              {trad}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function CaseStudyCard({ item, index, c }: { item: typeof caseStudyItems[number]; index: number; c: typeof t.en }) {
  const { ref, inView } = useInView();
  const title = c[`caseStudy${item.key}Title` as keyof typeof c] as string;
  const stat = c[`caseStudy${item.key}Stat` as keyof typeof c] as string;
  const desc = c[`caseStudy${item.key}Desc` as keyof typeof c] as string;
  const Icon = item.icon;

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out h-full"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1)" : "scale(0.95)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="h-full space-y-3" data-testid={`card-case-study-${item.key}`}>
        <div className="flex items-center gap-3">
          <Icon
            className="h-5 w-5 shrink-0"
            style={{ color: item.color, filter: `drop-shadow(0 0 6px ${item.color})` }}
          />
          <span className="graffiti-hand text-sm uppercase tracking-[0.15em]" style={{ color: item.color, ...MARKER_SHADOW }}>
            {stat}
          </span>
        </div>
        <h3 className="graffiti-hand text-lg sm:text-xl text-white leading-tight" style={MARKER_SHADOW}>{title}</h3>
        <p className="text-white font-medium leading-relaxed text-sm">{desc}</p>
      </div>
    </div>
  );
}

/* Compact CTAs — small buttons only; full-strength neon allowed here. */
function SolidCta({ children, href, testId }: { children: React.ReactNode; href: string; testId?: string }) {
  return (
    <Link href={href} data-testid={testId}>
      <button
        className="px-5 py-2.5 text-sm font-bold rounded-xl inline-flex items-center gap-2"
        style={{ background: "#FF9FE5", color: "#000" }}
      >
        {children}
      </button>
    </Link>
  );
}

function GhostCta({ children, href, testId }: { children: React.ReactNode; href: string; testId?: string }) {
  return (
    <Link href={href} data-testid={testId}>
      <button
        className="px-5 py-2.5 text-sm font-bold rounded-xl inline-flex items-center gap-2 text-white bg-transparent"
        style={{ border: "2px solid #7FEFFF" }}
      >
        {children}
      </button>
    </Link>
  );
}

export default function ResearchPage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  useSEO({
    title: "Research | BrainTrack™ Learning Science Behind Grade 12 Matric Prep",
    description: "BrainTrack™ is built on spaced repetition, active recall and 10 years of real NSC exam patterns. Discover the learning science powering CAPS-aligned Matric preparation.",
    canonical: "https://braintrack.co.za/research",
    ogTitle: "The Science Behind BrainTrack™ — Why It Improves Matric Marks",
    ogDescription: "Spaced repetition, active recall, and 10 years of NSC exam data power every BrainTrack feature. Learn the research behind South Africa's Grade 12 prep platform.",
    ogUrl: "https://braintrack.co.za/research",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.co.za/" },
        { "@type": "ListItem", "position": 2, "name": "Research", "item": "https://braintrack.co.za/research" },
      ],
    },
  });
  const c = t[language];

  const ctaHref = isAuthenticated ? "/classroom" : "/subscribe";
  const ctaLabel = isAuthenticated ? c.cta1LoggedIn : c.cta1;

  const heroAnim = useInView();
  const midCtaAnim = useInView();
  const caseStudyHeaderAnim = useInView();
  const bottomCtaAnim = useInView();

  const statsGrid: { value: string; label: string; icon: any; color: string }[] = [
    { value: "80%", label: language === "af" ? "Langtermyn Herroeping" : "Long-term Recall", icon: BarChart3, color: "#7FEFFF" },
    { value: "3×", label: language === "af" ? "Beter Retensie" : "Better Retention", icon: TrendingUp, color: "#C6A4FF" },
    { value: "0.73", label: language === "af" ? "Terugvoer Effekgrootte" : "Feedback Effect Size", icon: Zap, color: "#FFF29E" },
    { value: "10yr", label: language === "af" ? "NSC-vraestelle" : "NSC Papers", icon: BookOpen, color: "#FF9FE5" },
  ];

  return (
    <div className="relative min-h-screen bg-background text-white overflow-hidden">
      <GraffitiSplats variant="full" opacity={0.5} />
      <div className="relative z-10">
        <PublicNav />
        <main className="pt-14">
          <section className="relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div
                ref={heroAnim.ref}
                className="text-center py-16 sm:py-20 transition-all ease-out"
                style={{
                  opacity: heroAnim.inView ? 1 : 0,
                  transform: heroAnim.inView ? "translateY(0)" : "translateY(32px)",
                  transitionDuration: "800ms",
                }}
              >
                <p
                  className="graffiti-hand text-sm uppercase tracking-[0.24em] mb-5 inline-flex items-center gap-2"
                  style={{ color: "#7FEFFF", ...MARKER_SHADOW }}
                >
                  <GraduationCap className="w-4 h-4" style={{ color: "#7FEFFF" }} />
                  {language === "af" ? "Die Wetenskap" : "The Science"}
                </p>
                <h1
                  className="spray-title graffiti-hand text-4xl sm:text-6xl text-white leading-[1.05] mb-6 -rotate-1"
                  style={MARKER_SHADOW}
                  data-testid="text-research-title"
                >
                  <SpraySmear color="#FF9FE5" />
                  {language === "af" ? (
                    <>Navorsing-Gebaseerde Leer</>
                  ) : (
                    <>Research-Backed Learning</>
                  )}
                </h1>
                <p className="text-white max-w-2xl mx-auto leading-relaxed text-sm sm:text-base" data-testid="text-research-subtitle">
                  {c.subtitle}
                </p>
              </div>
            </div>
          </section>

          <section className="pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Stats — big pastel numbers straight on the wall */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8 mb-14">
                {statsGrid.map((s, i) => (
                  <AnimatedStatCard key={i} s={s} i={i} />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-14">
                {scienceCards.map((card, i) => (
                  <ScienceCard
                    key={i}
                    card={card}
                    index={i}
                    c={c}
                    sourceLabel={c.sourceLabel}
                    tapToLearn={c.tapToLearn}
                    collapse={c.collapse}
                  />
                ))}
              </div>

              <div
                ref={midCtaAnim.ref}
                className="flex flex-wrap items-center justify-center gap-4 mb-16 transition-all ease-out"
                style={{
                  opacity: midCtaAnim.inView ? 1 : 0,
                  transform: midCtaAnim.inView ? "translateY(0)" : "translateY(24px)",
                  transitionDuration: "700ms",
                }}
              >
                <SolidCta href={ctaHref} testId="link-research-signup">
                  {ctaLabel}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </SolidCta>
                <GhostCta href="/features" testId="link-research-features">
                  {c.cta2}
                </GhostCta>
              </div>

              {/* Head-to-head — wall-written comparison, no panel */}
              <div className="mb-16" data-testid="card-comparison">
                <div className="text-center mb-6">
                  <p
                    className="graffiti-hand text-xs uppercase tracking-[0.24em] mb-3 inline-flex items-center gap-2"
                    style={{ color: "#C6A4FF", ...MARKER_SHADOW }}
                  >
                    <BarChart3 className="w-3.5 h-3.5" style={{ color: "#C6A4FF" }} />
                    {language === "af" ? "Hoofkop-teen-hoofkop" : "Head-to-Head"}
                  </p>
                  <h2
                    className="spray-title graffiti-hand text-2xl sm:text-3xl text-white -rotate-1"
                    style={MARKER_SHADOW}
                  >
                    <SpraySmear color="#C6A4FF" />
                    {language === "af" ? (
                      <>BrainTrack vs Tradisionele Studie</>
                    ) : (
                      <>BrainTrack vs Traditional Study</>
                    )}
                  </h2>
                </div>

                {/* Desktop column headers — plain marker labels, no pills */}
                <div className="hidden md:grid md:grid-cols-[1.1fr_auto_1.1fr] items-center gap-4 pb-3 mb-2">
                  <div className="flex md:justify-end">
                    <span className="graffiti-hand text-xs uppercase tracking-[0.22em]" style={{ color: "#7FEFFF", ...MARKER_SHADOW }}>
                      {c.comparisonBrainTrack}
                    </span>
                  </div>
                  <span className="w-8" aria-hidden />
                  <div>
                    <span className="graffiti-hand text-xs uppercase tracking-[0.22em] text-white" style={MARKER_SHADOW}>
                      {c.comparisonTraditional}
                    </span>
                  </div>
                </div>

                <ComparisonRow label={c.comp1Label} bt={c.comp1BT} trad={c.comp1Trad} btLabel={c.comparisonBrainTrack} tradLabel={c.comparisonTraditional} index={0} accent={PASTELS[1]} />
                <ComparisonRow label={c.comp2Label} bt={c.comp2BT} trad={c.comp2Trad} btLabel={c.comparisonBrainTrack} tradLabel={c.comparisonTraditional} index={1} accent={PASTELS[6]} />
                <ComparisonRow label={c.comp3Label} bt={c.comp3BT} trad={c.comp3Trad} btLabel={c.comparisonBrainTrack} tradLabel={c.comparisonTraditional} index={2} accent={PASTELS[3]} />
                <ComparisonRow label={c.comp4Label} bt={c.comp4BT} trad={c.comp4Trad} btLabel={c.comparisonBrainTrack} tradLabel={c.comparisonTraditional} index={3} accent={PASTELS[4]} />
                <ComparisonRow label={c.comp5Label} bt={c.comp5BT} trad={c.comp5Trad} btLabel={c.comparisonBrainTrack} tradLabel={c.comparisonTraditional} index={4} accent={PASTELS[5]} />
                <ComparisonRow label={c.comp6Label} bt={c.comp6BT} trad={c.comp6Trad} btLabel={c.comparisonBrainTrack} tradLabel={c.comparisonTraditional} index={5} accent={PASTELS[2]} />
              </div>

              <div className="mt-12">
                <div
                  ref={caseStudyHeaderAnim.ref}
                  className="transition-all ease-out"
                  style={{
                    opacity: caseStudyHeaderAnim.inView ? 1 : 0,
                    transform: caseStudyHeaderAnim.inView ? "translateY(0)" : "translateY(24px)",
                    transitionDuration: "700ms",
                  }}
                >
                  <div className="text-center mb-3">
                    <h2
                      className="spray-title graffiti-hand text-2xl sm:text-3xl text-white -rotate-1"
                      style={MARKER_SHADOW}
                      data-testid="text-case-studies-title"
                    >
                      <SpraySmear color="#93FFB8" />
                      {language === "af" ? (
                        <>Betrokkenheid &amp; Konsekwentheid</>
                      ) : (
                        <>Engagement &amp; Consistency</>
                      )}
                    </h2>
                  </div>
                  <p className="text-center text-white font-medium mb-10 max-w-xl mx-auto text-sm">
                    {c.caseStudiesSubtitle}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  {caseStudyItems.map((item, i) => (
                    <CaseStudyCard key={item.key} item={item} index={i} c={c} />
                  ))}
                </div>
              </div>

              <div
                ref={bottomCtaAnim.ref}
                className="mt-16 text-center transition-all ease-out"
                style={{
                  opacity: bottomCtaAnim.inView ? 1 : 0,
                  transform: bottomCtaAnim.inView ? "translateY(0)" : "translateY(24px)",
                  transitionDuration: "700ms",
                }}
              >
                <SolidCta href={ctaHref} testId="link-research-bottom">
                  {ctaLabel}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </SolidCta>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
