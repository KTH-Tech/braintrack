/**
 * client/src/pages/progress.tsx — the learner's honest self-view.
 *
 * WHAT PROGRESS MEANS (mirrored per-tile below):
 *
 *   1. MISSION READINESS   — the cross-app score also shown on the Dashboard.
 *                            Kept identical to `calcReadiness` for consistency
 *                            (the e2e spec `tests/e2e/study-readiness.spec.ts`
 *                            asserts the three surfaces agree).
 *   2. PROGRESS RECIPE     — the honest 4-part composite (accuracy 30 +
 *                            volume 30 + coverage 25 + consistency 15) that
 *                            answers "what is progress measured against?".
 *                            Every ingredient traces back to a real DB source
 *                            (see `client/src/lib/readiness.ts`).
 *   3. TREND               — the last 14 days off `attempts`, plus this-week
 *                            vs last-week (`/api/user/weekly-comparison`) and
 *                            time on task (`/api/learner/goals.weekly.studyMinutes`).
 *   4. COVERAGE            — per-subject accuracy off `user_progress`, plus
 *                            per-topic mastery bands off `topic_mastery`
 *                            (the marking pipeline's real per-topic signal —
 *                            NOT `dbe_verbatim_questions.topic` which is NULL
 *                            on released rows).
 *   5. NEXT MOVE           — one prescriptive next action from
 *                            `pickNextMove`, biased to the weakest started
 *                            subject.
 *   6. MILESTONES          — real dated achievements: personal-best per subject
 *                            (`/api/user/personal-bests`) + next badge
 *                            (`/api/user/next-milestone`).
 *
 * Every metric on this page must be traceable to a real DB source. If the
 * evidence isn't there, the page says so with a one-line note in the empty
 * state — it never invents a placeholder number.
 */
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/formatters";
import {
  calcReadiness,
  calcReadinessBreakdown,
  readinessBandLabel,
  type ReadinessPart,
} from "@/lib/readiness";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  TrendingUp,
  TrendingDown,
  Flame,
  BookOpen,
  Calendar,
  CheckCircle,
  Rocket,
  Compass,
  Layers,
  Trophy,
  Sparkles,
  Zap,
  Clock,
} from "lucide-react";
import { getSubjectIcon } from "@/lib/vark";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { LearnerHeader } from "@/components/learner-header";
import { YouVsYouChart } from "@/components/you-vs-you-chart";
import { NextMilestoneWidget } from "@/components/next-milestone-widget";
import { PersonalBestsWidget } from "@/components/personal-bests-widget";
import {
  type ProgressStats,
  type SubjectProgress,
  type TopicMasteryEntry,
  hasAnyActivity,
  summariseActivity,
  dayAccuracy,
  splitSubjects,
  improvementOf,
  pickNextMove,
  pickTopicFocus,
  pickTopicStrengths,
  summariseTopicMastery,
  accuracyHex,
} from "@/lib/progress-insights";

/* Opaque card base — the graffiti scatter sits behind the page and bled
   through when these were translucent, so every card paints #050508 first. */
const CARD_BG = "linear-gradient(#1b1922, #1b1922), #050508";

/* Palette (pastels only — no grey text ever). */
const HEX = {
  sky: "#9FD8FF",
  aqua: "#9FF5E8",
  mint: "#94F7C5",
  yellow: "#FFE29A",
  pink: "#FFB7E5",
  purple: "#C5B3FF",
  alert: "#FF8DA1",
} as const;

/* Colour ramp keyed to mastery band, so a "Coverage" tile matches the badges
   in the topic pool below it. */
function bandHex(band: "red" | "amber" | "green"): string {
  return band === "green" ? HEX.mint : band === "amber" ? HEX.yellow : HEX.alert;
}

function Panel({
  hex,
  icon: Icon,
  title,
  subtitle,
  children,
  testid,
}: {
  hex: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  testid?: string;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ background: CARD_BG, border: `1.5px solid ${hex}`, boxShadow: `0 0 0 1px ${hex}47` }}
      data-testid={testid}
    >
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: hex }} />
      <div className="flex items-center gap-2.5 px-6 py-5" style={{ borderBottom: `1px solid ${hex}59` }}>
        <Icon className="w-5 h-5 shrink-0" style={{ color: hex }} />
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
          {subtitle && <p className="text-[12px] font-semibold text-white mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * One of the four ingredients in the Progress Recipe. Shows the ingredient's
 * contribution to the composite (e.g. 18.9/30), the raw underlying signal
 * (e.g. 63% accuracy), a bar, and the source-of-truth description.
 */
function RecipeTile({
  hex,
  icon: Icon,
  title,
  part,
  rawLabel,
  source,
  testid,
}: {
  hex: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  part: ReadinessPart;
  rawLabel: string;
  source: string;
  testid?: string;
}) {
  const pct = Math.min(100, (part.value / part.cap) * 100);
  return (
    <div
      className="relative rounded-2xl p-4 overflow-hidden transition-transform hover:-translate-y-1"
      style={{ background: CARD_BG, border: `1.5px solid ${hex}`, boxShadow: `0 0 0 1px ${hex}33` }}
      data-testid={testid}
    >
      <span aria-hidden className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: hex }} />
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#1b1922] flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${hex}` }}>
          <Icon className="w-4 h-4" style={{ color: hex }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: hex }}>{title}</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className="text-xl font-black tabular-nums leading-none"
              style={{ color: hex }}
              data-testid={testid ? `${testid}-value` : undefined}
            >
              {part.empty ? "—" : part.value}
            </span>
            <span className="text-[11px] font-semibold text-white leading-none">/ {part.cap}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#1b1922" }}>
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%`, background: hex }}
        />
      </div>
      <p className="text-[11px] font-semibold text-white mt-2 leading-snug">
        {rawLabel}
      </p>
      <p className="text-[10px] font-semibold mt-1 leading-snug" style={{ color: hex }}>
        {source}
      </p>
    </div>
  );
}

export default function ProgressPage() {
  const { language } = useLanguage();
  const isAf = language === "af";

  const { data: stats, isLoading } = useQuery<ProgressStats>({
    queryKey: ["/api/user/progress"],
  });

  const { data: goals } = useQuery<{
    weekly: { studyMinutes: number; activeDays: number };
    daily: { questionsAnswered: number; questionsGoal: number };
  } | null>({
    queryKey: ["/api/learner/goals"],
    staleTime: 60_000,
  });

  const started = hasAnyActivity(stats);
  const activity = summariseActivity(stats?.recentActivity);
  const { started: activeSubjects, notStarted: idleSubjects } = splitSubjects(stats?.subjectProgress);
  const nextMove = pickNextMove(stats);

  const acc = stats?.overallAccuracy ?? 0;
  const streak = stats?.studyStreak ?? 0;
  const papers = stats?.totalPapersCompleted ?? 0;
  const questions = stats?.totalQuestionsAttempted ?? 0;

  /* Two readiness numbers, on purpose:
     • Mission Readiness — legacy 3-part, matches Dashboard. Same testid.
     • Progress Recipe — 4-part honest composite with source-of-truth breakdown. */
  const missionReadiness = calcReadiness({
    accuracy: acc,
    studyStreak: streak,
    questionsAnswered: questions,
  });
  const breakdown = calcReadinessBreakdown({
    accuracy: acc,
    questionsAnswered: questions,
    subjectsEnrolled: stats?.subjectProgress?.length ?? 0,
    subjectsStarted: activeSubjects.length,
    studyStreak: streak,
  });

  const topicSummary = summariseTopicMastery(stats?.topicMastery);
  const topicStrengths = pickTopicStrengths(stats?.topicMastery, 3);
  const topicFocus = pickTopicFocus(stats?.topicMastery, 5);
  const studyMinutes14d = stats?.studyMinutes14d ?? 0;
  const studyMinutesThisWeek = goals?.weekly?.studyMinutes ?? 0;

  /* "What do I do next?" — one sentence, derived only from what the data can
     actually prove (see client/src/lib/progress-insights.ts). */
  const nextMoveCopy: { title: string; body: string; cta: string; href: string } = (() => {
    switch (nextMove.kind) {
      case "start":
        return {
          title: isAf ? "Beantwoord jou eerste vraag" : "Answer your first question",
          body: isAf
            ? "Jou verslag is nog leeg — dis reg so, jy't nou net begin. Tien vrae is genoeg om jou eerste akkuraatheidslesing te kry."
            : "Your report is empty — that's normal, you've just started. Ten questions is enough to get your first real accuracy reading.",
          cta: isAf ? "Begin oefen" : "Start practising",
          href: "/dashboard",
        };
      case "build_baseline":
        return {
          title: isAf ? "Bou jou basislyn" : "Build your baseline",
          body: isAf
            ? "Jy't begin — mooi. Nog 'n paar vrae en ons kan vir jou wys waar jou sterk en swak punte regtig lê."
            : "You've started — good. A few more questions and we can show you where your strengths and weak spots actually are.",
          cta: isAf ? "Hou aan oefen" : "Keep practising",
          href: "/dashboard",
        };
      case "practise_weakest":
        return {
          title: isAf ? `Fokus op ${nextMove.subjectName}` : `Focus on ${nextMove.subjectName}`,
          body: isAf
            ? `Dis jou laagste vak op ${nextMove.accuracy}%. 'n Kort sessie hier skuif jou totaal die vinnigste.`
            : `It's your lowest subject at ${nextMove.accuracy}%. A short session here moves your overall number fastest.`,
          cta: isAf ? "Oefen hierdie vak" : "Practise this subject",
          href: `/subject/${nextMove.subjectId}`,
        };
      case "widen":
        return {
          title: isAf ? `Begin met ${nextMove.subjectName}` : `Open up ${nextMove.subjectName}`,
          body: isAf
            ? "Alles wat jy aangepak het lyk gesond. Tyd om 'n vak by te voeg wat jy nog nie aangeraak het nie."
            : "Everything you've touched is looking healthy. Time to pick up a subject you haven't started yet.",
          cta: isAf ? "Begin hierdie vak" : "Start this subject",
          href: `/subject/${nextMove.subjectId}`,
        };
      default:
        return {
          title: isAf ? "Hou die streep aan die brand" : "Keep the streak alive",
          body: isAf
            ? "Elke vak is aan die gang en gesond. Konsekwentheid is nou die enigste ding wat oorbly."
            : "Every subject is running and healthy. Consistency is the only thing left to get right.",
          cta: isAf ? "Vandag se sessie" : "Today's session",
          href: "/dashboard",
        };
    }
  })();

  const rank =
    acc >= 85 ? (isAf ? "Legendaries" : "Legendary") :
    acc >= 70 ? (isAf ? "Voorloper"   : "Top Performer") :
    acc >= 55 ? (isAf ? "Op Koers"    : "On Track") :
    acc >= 40 ? (isAf ? "Bou Momentum": "Building Momentum") :
                (isAf ? "Ontluik"     : "Emerging");
  const rankHex = acc >= 70 ? HEX.sky : acc >= 40 ? HEX.yellow : HEX.pink;
  const missionHex =
    missionReadiness >= 75 ? HEX.sky : missionReadiness >= 40 ? HEX.yellow : HEX.pink;
  const recipeHex =
    breakdown.total >= 75 ? HEX.mint : breakdown.total >= 55 ? HEX.yellow : HEX.pink;
  const R = 52;
  const C = 2 * Math.PI * R;
  const offset = C - (Math.min(100, Math.max(0, acc)) / 100) * C;

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      <GraffitiSplats variant="band" opacity={0.55} />
      <LearnerHeader
        backHref="/dashboard"
        backLabel={isAf ? "Tuis" : "Home"}
        title={isAf ? "Vordering" : "Progress"}
        titleColor={HEX.aqua}
        maxWidthClassName="max-w-7xl"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Cosmic wordmark wash behind the report */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 opacity-40">
          <div className="absolute top-[5%] left-[10%] w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(159,216,255,0.22), transparent 70%)" }} />
          <div className="absolute top-[40%] right-[0%] w-[380px] h-[380px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(197,179,255,0.22), transparent 70%)" }} />
          <div className="absolute bottom-[5%] left-[30%] w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,226,154,0.18), transparent 70%)" }} />
        </div>

        <div className="space-y-8 relative z-10">
          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10"
            style={{ background: CARD_BG, border: `1.5px solid ${HEX.sky}`, boxShadow: `0 0 0 1px rgba(159,216,255,0.28)` }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(159,216,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(159,216,255,1) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
              }}
            />
            <div
              aria-hidden
              className="absolute left-0 right-0 h-px pointer-events-none progress-hero-scan"
              style={{ background: `linear-gradient(90deg, transparent, ${HEX.sky} 20%, ${HEX.purple} 50%, ${HEX.pink} 80%, transparent)` }}
            />
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, ${HEX.yellow}, ${HEX.yellow}, ${HEX.mint}, ${HEX.aqua}, ${HEX.sky}, ${HEX.purple}, ${HEX.pink})` }}
            />
            <span aria-hidden className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: HEX.sky }} />
            <span aria-hidden className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: HEX.sky }} />
            <span aria-hidden className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: HEX.sky }} />
            <span aria-hidden className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: HEX.sky }} />

            <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[#1b1922]" style={{ border: `1px solid ${HEX.sky}8C` }}>
                    <span className="w-1.5 h-1.5 rounded-full progress-hero-pulse" style={{ background: HEX.sky }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: HEX.sky }}>
                      {isAf ? "Prestasieverslag" : "Performance Report"}
                    </span>
                  </div>
                  {started && (
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-[#1b1922]" style={{ border: `1px solid ${rankHex}` }}>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: rankHex }}>
                        {isAf ? "Rang" : "Rank"}: {rank}
                      </span>
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-[#1b1922]" style={{ border: `1px solid ${HEX.yellow}8C` }}>
                    <Flame className="w-3 h-3" style={{ color: HEX.yellow }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: HEX.yellow }}>
                      {streak} {isAf ? (streak === 1 ? "dag" : "dae") : (streak === 1 ? "day" : "days")}
                    </span>
                  </div>
                </div>

                <div
                  role="heading"
                  aria-level={1}
                  className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.98]"
                  style={{
                    background: `linear-gradient(90deg, ${HEX.yellow}, ${HEX.yellow}, ${HEX.mint}, ${HEX.aqua}, ${HEX.sky}, ${HEX.purple}, ${HEX.pink})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {isAf ? "Jou Vordering" : "Your Progress"}
                </div>
                <p className="text-white font-medium text-base sm:text-lg max-w-xl">
                  {started
                    ? (isAf
                        ? "Elke syfer hier is uit jou eie werk gemeet — geen versinsel nie."
                        : "Every number here is measured from your own work — nothing invented.")
                    : (isAf
                        ? "Hier land jou syfers sodra jy begin oefen. Op die oomblik is dit 'n skoon bladsy — kom ons vul dit."
                        : "This is where your numbers land once you start practising. Right now it's a clean page — let's fill it.")}
                </p>

                {/* Mission Readiness — the cross-app number.
                    Same testid, same formula, so /dashboard, /progress and
                    /study-calendar always agree (see study-readiness.spec.ts). */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                      {isAf ? "Missie Gereedheid" : "Mission Readiness"}
                    </span>
                    <span data-testid="mission-readiness-value" className="text-[11px] font-bold" style={{ color: missionHex }}>
                      {missionReadiness}% · {readinessBandLabel(missionReadiness, isAf)}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "#1b1922", border: "1px solid #1b1922" }}>
                    <div
                      className="absolute top-0 left-0 bottom-0 rounded-full transition-[width] duration-700"
                      style={{
                        width: `${missionReadiness}%`,
                        background: `linear-gradient(90deg, ${HEX.yellow}, ${HEX.yellow}, ${HEX.mint}, ${HEX.aqua}, ${HEX.sky}, ${HEX.purple}, ${HEX.pink})`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-white mt-1.5">
                    {isAf
                      ? "Dieselfde syfer as op jou dashboard. Kyk hieronder vir die volle uiteensetting."
                      : "The same number your dashboard shows. Full breakdown below."}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { k: isAf ? "Vraestelle" : "Papers",    v: papers,    hex: HEX.purple },
                    { k: isAf ? "Vrae"       : "Questions", v: questions, hex: HEX.yellow },
                    { k: isAf ? "Streep"     : "Streak",    v: streak,    hex: HEX.yellow },
                  ].map(({ k, v, hex }) => (
                    <div key={k} className="rounded-xl bg-[#1b1922] px-3 py-2" style={{ border: `1px solid ${hex}55` }}>
                      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">{k}</div>
                      <div className="text-lg font-black" style={{ color: hex }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <Link href="/dashboard">
                    <button
                      className="px-4 py-2 rounded-xl bg-[#1b1922] font-bold text-sm hover:bg-[#1b1922]"
                      style={{ color: HEX.sky, border: `1.5px solid ${HEX.sky}` }}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 inline mr-1.5" />
                      {isAf ? "Terug na Tuis" : "Back to Dashboard"}
                    </button>
                  </Link>
                </div>
              </div>

              {/* Accuracy dial — the visual anchor of the hero. Still just
                  accuracy (not the composite) because it is the number the
                  learner most-often thinks about when asked "how am I doing?". */}
              <div className="relative flex-shrink-0 self-center">
                <svg width="160" height="160" viewBox="0 0 140 140" className="relative">
                  <defs>
                    <linearGradient id="accDialStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={HEX.yellow} />
                      <stop offset="25%" stopColor={HEX.yellow} />
                      <stop offset="50%" stopColor={HEX.aqua} />
                      <stop offset="75%" stopColor={HEX.purple} />
                      <stop offset="100%" stopColor={HEX.pink} />
                    </linearGradient>
                  </defs>
                  <circle cx="70" cy="70" r={R} fill="none" stroke="#1b1922" strokeWidth="8" />
                  <circle
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke="url(#accDialStroke)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={offset}
                    transform="rotate(-90 70 70)"
                    style={{ transition: "stroke-dashoffset 900ms ease-out" }}
                  />
                  {Array.from({ length: 36 }).map((_, i) => {
                    const ang = (i / 36) * Math.PI * 2 - Math.PI / 2;
                    const r1 = 62, r2 = 64;
                    return (
                      <line
                        key={i}
                        x1={70 + Math.cos(ang) * r1}
                        y1={70 + Math.sin(ang) * r1}
                        x2={70 + Math.cos(ang) * r2}
                        y2={70 + Math.sin(ang) * r2}
                        stroke="rgba(159,216,255,0.4)"
                        strokeWidth="1"
                      />
                    );
                  })}
                  <text
                    x="70" y="66" textAnchor="middle"
                    style={{ fontFamily: "'Poppins',sans-serif", fontSize: started ? "32px" : "22px", fontWeight: 900, fill: started ? rankHex : "#ffffff" }}
                  >
                    {started ? acc : "—"}
                  </text>
                  <text
                    x="70" y="82" textAnchor="middle"
                    style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", fill: "#ffffff" }}
                  >
                    {isAf ? "AKKURAATHEID" : "ACCURACY"}
                  </text>
                  {started && (
                    <text
                      x="70" y="96" textAnchor="middle"
                      style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", fontWeight: 800, fill: rankHex, letterSpacing: "0.12em" }}
                    >
                      %
                    </text>
                  )}
                </svg>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          ) : !stats ? (
            <div className="rounded-2xl p-12 text-center" style={{ background: CARD_BG, border: "1px solid #1b1922" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1b1922] flex items-center justify-center border border-[#1b1922]">
                <Target className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-bold text-white">{isAf ? "Kon nie jou vordering laai nie" : "Couldn't load your progress"}</p>
              <p className="text-sm text-white mt-1">{isAf ? "Gaan jou verbinding na en laai die bladsy weer." : "Check your connection and reload the page."}</p>
            </div>
          ) : (
            <>
              {/* ── Progress Recipe ─ the honest 4-part composite ──────────
                  Answers the question "what does progress measure?" by naming
                  the four ingredients and showing each one's contribution to
                  the composite. Every tile carries its raw signal + source. */}
              <Panel
                hex={recipeHex}
                icon={Layers}
                title={isAf ? "Vorderingsresep" : "Progress Recipe"}
                subtitle={
                  started
                    ? (isAf
                        ? `Vier bestanddele. Elkeen uit jou eie data. Totaal: ${breakdown.total} / 100 (${readinessBandLabel(breakdown.total, isAf)}).`
                        : `Four ingredients. Each drawn from your own data. Total: ${breakdown.total} / 100 (${readinessBandLabel(breakdown.total, isAf)}).`)
                    : (isAf
                        ? "Elke bestanddeel vul op sodra jy oefen."
                        : "Each ingredient fills up as you practise.")
                }
                testid="panel-recipe"
              >
                <div className="p-4 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="recipe-tiles">
                    <RecipeTile
                      hex={HEX.sky}
                      icon={Target}
                      title={isAf ? "Akkuraatheid" : "Accuracy"}
                      part={breakdown.accuracy}
                      rawLabel={
                        breakdown.accuracy.empty
                          ? (isAf ? "Nog geen antwoorde nie." : "No answers yet.")
                          : `${breakdown.accuracy.raw}% ${isAf ? "reg oor" : "correct across"} ${questions} ${isAf ? "vrae" : "questions"}`
                      }
                      source={isAf ? "Bron: attempts.is_correct" : "Source: attempts.is_correct"}
                      testid="recipe-accuracy"
                    />
                    <RecipeTile
                      hex={HEX.yellow}
                      icon={Zap}
                      title={isAf ? "Volume" : "Volume"}
                      part={breakdown.volume}
                      rawLabel={
                        breakdown.volume.empty
                          ? (isAf ? "Beantwoord vrae om hierdie balk te vul." : "Answer questions to fill this bar.")
                          : `${breakdown.volume.raw} / 300 ${isAf ? "vrae aangepak" : "questions attempted"}`
                      }
                      source={isAf ? "Bron: attempts (aantal)" : "Source: attempts (count)"}
                      testid="recipe-volume"
                    />
                    <RecipeTile
                      hex={HEX.mint}
                      icon={Layers}
                      title={isAf ? "Vakdekking" : "Coverage"}
                      part={breakdown.coverage}
                      rawLabel={
                        breakdown.coverage.empty
                          ? (isAf ? "Kies vakke om hierdie balk te ontsluit." : "Pick subjects to unlock this bar.")
                          : `${activeSubjects.length} / ${stats.subjectProgress.length} ${isAf ? "vakke begin" : "subjects started"}`
                      }
                      source={isAf ? "Bron: user_progress · onboarding_results" : "Source: user_progress · onboarding_results"}
                      testid="recipe-coverage"
                    />
                    <RecipeTile
                      hex={HEX.pink}
                      icon={Flame}
                      title={isAf ? "Konsekwentheid" : "Consistency"}
                      part={breakdown.consistency}
                      rawLabel={
                        breakdown.consistency.empty
                          ? (isAf ? "Studeer vandag om jou streep te begin." : "Study today to start your streak.")
                          : `${breakdown.consistency.raw}-${isAf ? "dag streep" : "day streak"} (${isAf ? "kap by 7" : "caps at 7"})`
                      }
                      source={isAf ? "Bron: user_streaks.current_streak" : "Source: user_streaks.current_streak"}
                      testid="recipe-consistency"
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-white mt-4 leading-snug">
                    {isAf
                      ? "Elke balk is 'n aparte sein. Twee groen balke en twee rooi wys wat om reg te maak — nie net 'n enkele nommer nie."
                      : "Each bar is a separate signal. Two green and two red bars tell you what to fix — not just a single number."}
                  </p>
                </div>
              </Panel>

              {/* ── Next move — the "what do I do now?" answer ─────────────── */}
              <div
                className="relative rounded-2xl overflow-hidden p-6 sm:p-7"
                style={{ background: CARD_BG, border: `1.5px solid ${HEX.mint}`, boxShadow: `0 0 0 1px rgba(148,247,197,0.28)` }}
                data-testid="next-move-card"
              >
                <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: HEX.mint }} />
                <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: HEX.mint }} />
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-[#1b1922]" style={{ border: `1.5px solid ${HEX.mint}` }}>
                    <Compass className="w-7 h-7" style={{ color: HEX.mint }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: HEX.mint, transform: "rotate(-1.5deg)", display: "inline-block" }}>
                      {isAf ? "jou volgende skuif" : "your next move"}
                    </p>
                    <h2 className="text-white font-black text-xl sm:text-2xl leading-tight mt-0.5" data-testid="next-move-title">
                      {nextMoveCopy.title}
                    </h2>
                    <p className="text-white text-sm mt-1.5 leading-relaxed">{nextMoveCopy.body}</p>
                  </div>
                  <Link href={nextMoveCopy.href}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto shrink-0 whitespace-nowrap"
                      data-testid="next-move-cta"
                    >
                      {nextMoveCopy.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* ── Brand-new learner: no counters, just a runway ──────────── */}
              {!started ? (
                <Panel
                  hex={HEX.purple}
                  icon={Rocket}
                  title={isAf ? "Jou vakke staan gereed" : "Your subjects are ready"}
                  subtitle={isAf
                    ? "Kies enige een om te begin — jou eerste syfers verskyn hier sodra jy klaar is."
                    : "Pick any one to begin — your first numbers show up here the moment you finish."}
                  testid="panel-ready-to-start"
                >
                  <div className="p-5">
                    {(stats.subjectProgress ?? []).length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {stats.subjectProgress.map((subject, idx) => {
                          const stops = [HEX.aqua, HEX.sky, HEX.pink, HEX.purple, HEX.yellow, HEX.mint];
                          const hex = stops[idx % stops.length];
                          return (
                            <Link key={subject.subjectId} href={`/subject/${subject.subjectId}`}>
                              <div
                                className="p-4 rounded-2xl bg-[#1b1922] cursor-pointer transition-all hover:-translate-y-1.5 flex items-center gap-3"
                                style={{ border: `1px solid ${hex}55` }}
                                data-testid={`ready-subject-${subject.subjectId}`}
                              >
                                <span className="text-2xl shrink-0">{getSubjectIcon(subject.subjectName)}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-white text-sm truncate">{subject.subjectName}</p>
                                  <p className="text-[11px] font-bold uppercase tracking-widest mt-0.5" style={{ color: hex }}>
                                    {isAf ? "Nog nie begin nie" : "Not started yet"}
                                  </p>
                                </div>
                                <ArrowRight className="w-4 h-4 shrink-0" style={{ color: hex }} />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 rounded-2xl bg-[#1b1922] border border-[#1b1922] p-6">
                        <BookOpen className="w-7 h-7 mx-auto mb-3 text-white" />
                        <p className="font-bold text-white">{isAf ? "Nog geen vakke gekies nie" : "No subjects picked yet"}</p>
                        <p className="text-sm text-white mt-1">
                          {isAf ? "Voltooi jou profiel om jou vakke te kies." : "Finish your profile to choose your subjects."}
                        </p>
                      </div>
                    )}
                  </div>
                </Panel>
              ) : (
                <>
                  {/* ── Headline counters ─────────────────────────────────── */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {([
                      { label: isAf ? "Studie-reeks" : "Study Streak", value: stats.studyStreak,             unit: isAf ? "dae" : "days", icon: Flame,       hex: HEX.yellow, testid: "stat-streak" },
                      { label: isAf ? "Akkuraatheid" : "Accuracy",     value: stats.overallAccuracy,         unit: "%",                   icon: Target,      hex: HEX.sky,    testid: "stat-accuracy" },
                      { label: isAf ? "Vraestelle"   : "Papers Done",  value: stats.totalPapersCompleted,    unit: "",                    icon: BookOpen,    hex: HEX.purple, testid: "stat-papers" },
                      { label: isAf ? "Vrae"         : "Questions",    value: stats.totalQuestionsAttempted, unit: "",                    icon: CheckCircle, hex: HEX.yellow, testid: "stat-questions" },
                    ]).map(({ label, value, unit, icon: Icon, hex, testid }) => (
                      <div
                        key={label}
                        className="relative rounded-2xl p-5 overflow-hidden transition-all hover:-translate-y-1.5"
                        style={{ background: CARD_BG, border: `1.5px solid ${hex}`, boxShadow: `0 0 0 1px ${hex}33` }}
                      >
                        <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: hex }} />
                        <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: hex }} />
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#1b1922] flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${hex}` }}>
                            <Icon className="w-6 h-6" style={{ color: hex }} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: hex }}>{label}</p>
                            <p className="text-2xl font-bold" style={{ color: hex }} data-testid={testid}>
                              {value}{unit && <span className="text-sm font-semibold text-white ml-1">{unit}</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Trend: 14-day chart + week-over-week + time on task ─ */}
                  <Panel
                    hex={HEX.yellow}
                    icon={Calendar}
                    title={isAf ? "Neiging" : "Trend"}
                    subtitle={
                      activity.totalQuestions > 0
                        ? (isAf
                            ? `${activity.totalQuestions} vrae oor ${activity.activeDays} ${activity.activeDays === 1 ? "dag" : "dae"} · ${activity.accuracy}% akkuraat oor 14 dae`
                            : `${activity.totalQuestions} questions across ${activity.activeDays} ${activity.activeDays === 1 ? "day" : "days"} · ${activity.accuracy}% accurate over 14 days`)
                        : (isAf ? "Nog niks hierdie twee weke nie" : "Nothing logged these two weeks")
                    }
                    testid="panel-activity"
                  >
                    <div className="p-6">
                      {stats.recentActivity.length > 0 ? (
                        <>
                          <div className="flex items-end gap-1 sm:gap-1.5 h-28" data-testid="activity-bars">
                            {stats.recentActivity.map((day, index) => {
                              const dAcc = dayAccuracy(day);
                              const hex = accuracyHex(dAcc);
                              const pct = activity.bestDay > 0
                                ? Math.max(6, Math.round((day.questionsAnswered / activity.bestDay) * 100))
                                : 6;
                              return (
                                <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0" data-testid={`activity-${index}`}>
                                  <span className="text-[10px] font-bold tabular-nums" style={{ color: day.questionsAnswered > 0 ? hex : "#ffffff" }}>
                                    {day.questionsAnswered > 0 ? day.questionsAnswered : ""}
                                  </span>
                                  <div
                                    className="w-full rounded-t-md transition-all"
                                    style={{
                                      height: `${pct}%`,
                                      background: day.questionsAnswered > 0 ? hex : "#1b1922",
                                      minHeight: 4,
                                    }}
                                    title={`${day.date} · ${day.questionsAnswered} ${isAf ? "vrae" : "questions"}${dAcc !== null ? ` · ${dAcc}%` : ""}`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-white">
                            <span>{formatDate(stats.recentActivity[0].date, language, { day: "numeric", month: "short" })}</span>
                            <span>{isAf ? "Vandag" : "Today"}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                            {[
                              { k: isAf ? "Aktiewe dae" : "Active days", v: `${activity.activeDays}/${activity.windowDays}`, hex: HEX.mint },
                              { k: isAf ? "Beste dag"   : "Best day",    v: `${activity.bestDay}`,                          hex: HEX.purple },
                              { k: isAf ? "Akkuraat"    : "Accurate",    v: `${activity.accuracy}%`,                        hex: HEX.sky },
                              { k: isAf ? "Studietyd 14d" : "Study time 14d", v: `${studyMinutes14d}m`,                    hex: HEX.pink },
                            ].map(({ k, v, hex }) => (
                              <div key={k} className="rounded-xl bg-[#1b1922] px-3 py-2" style={{ border: `1px solid ${hex}55` }}>
                                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">{k}</div>
                                <div className="text-lg font-black" style={{ color: hex }}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 rounded-2xl bg-[#1b1922] border border-[#1b1922] p-6">
                          <Calendar className="w-7 h-7 mx-auto mb-3 text-white" />
                          <p className="font-bold text-white">{isAf ? "Nog geen daaglikse geskiedenis nie" : "No daily history yet"}</p>
                          <p className="text-sm text-white mt-1">
                            {isAf ? "Beantwoord vrae en jou daaglikse ritme verskyn hier." : "Answer questions and your daily rhythm shows up here."}
                          </p>
                        </div>
                      )}
                    </div>
                  </Panel>

                  {/* Week-over-week — the YouVsYou comparison stays intact. */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <YouVsYouChart isAf={isAf} />
                    <div
                      className="h-full p-5 flex flex-col gap-3"
                      style={{ background: CARD_BG, border: `1.5px solid ${HEX.pink}`, borderRadius: 20, boxShadow: `0 0 0 1px ${HEX.pink}33` }}
                      data-testid="panel-time-on-task"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#1b1922] flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${HEX.pink}` }}>
                          <Clock className="w-4 h-4" style={{ color: HEX.pink }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: HEX.pink }}>
                            {isAf ? "Tyd op die taak" : "Time on task"}
                          </p>
                          <p className="text-lg font-bold text-white leading-tight">
                            {isAf ? "Werklik voor die skerm gespandeer" : "Actually spent studying"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#1b1922] px-3 py-3" style={{ border: `1px solid ${HEX.pink}55` }}>
                          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                            {isAf ? "Hierdie week" : "This week"}
                          </div>
                          <div className="text-2xl font-black mt-0.5" style={{ color: HEX.pink }} data-testid="time-week">
                            {studyMinutesThisWeek}<span className="text-sm font-semibold text-white ml-1">m</span>
                          </div>
                          <div className="text-[10px] font-semibold text-white mt-0.5">
                            {isAf ? "van study_sessions" : "from study_sessions"}
                          </div>
                        </div>
                        <div className="rounded-xl bg-[#1b1922] px-3 py-3" style={{ border: `1px solid ${HEX.purple}55` }}>
                          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                            {isAf ? "Laaste 14 dae" : "Last 14 days"}
                          </div>
                          <div className="text-2xl font-black mt-0.5" style={{ color: HEX.purple }} data-testid="time-14d">
                            {studyMinutes14d}<span className="text-sm font-semibold text-white ml-1">m</span>
                          </div>
                          <div className="text-[10px] font-semibold text-white mt-0.5">
                            {isAf ? "gestapelde sessies" : "stacked sessions"}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-white leading-snug">
                        {studyMinutes14d === 0 && studyMinutesThisWeek === 0
                          ? (isAf
                              ? "Sessietyd word aangeteken sodra jy 'n vraestel begin — dan meet ons ook hoe lank jy studeer."
                              : "Session time starts logging the moment you open a paper — that's when we can measure how long you study.")
                          : (isAf
                              ? "Sessieduur uit study_sessions.duration_seconds. Nie afgelei uit die aantal vrae nie."
                              : "Session duration from study_sessions.duration_seconds. Not inferred from question count.")}
                      </p>
                    </div>
                  </div>

                  {/* ── Coverage: per-subject + per-topic ─────────────────── */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Panel
                      hex={HEX.sky}
                      icon={TrendingUp}
                      title={isAf ? "Vakvordering" : "Subject Progress"}
                      subtitle={isAf
                        ? `${activeSubjects.length} van ${stats.subjectProgress.length} vakke aan die gang`
                        : `${activeSubjects.length} of ${stats.subjectProgress.length} subjects underway`}
                      testid="panel-subject-progress"
                    >
                      <div className="p-5 space-y-3">
                        {activeSubjects.length > 0 ? (
                          activeSubjects.map((subject: SubjectProgress, idx: number) => {
                            const stops = [HEX.aqua, HEX.sky, HEX.pink, HEX.purple, HEX.yellow, HEX.mint];
                            const hex = stops[idx % stops.length];
                            const barColor = accuracyHex(subject.accuracy);
                            const delta = improvementOf(subject);
                            return (
                              <Link key={subject.subjectId} href={`/subject/${subject.subjectId}`}>
                                <div
                                  className="p-4 rounded-2xl bg-[#1b1922] cursor-pointer transition-all hover:-translate-y-1.5"
                                  style={{ border: `1px solid ${hex}55` }}
                                  data-testid={`progress-subject-${subject.subjectId}`}
                                >
                                  <div className="flex items-center justify-between mb-2.5 gap-2">
                                    <span className="font-bold text-white flex items-center gap-2 text-sm min-w-0 flex-1">
                                      <span className="text-lg shrink-0">{getSubjectIcon(subject.subjectName)}</span>
                                      <span className="truncate">{subject.subjectName}</span>
                                    </span>
                                    <span className="font-bold text-base shrink-0" style={{ color: barColor }}>
                                      {subject.accuracy}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-[#1b1922] overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${subject.accuracy}%`, background: barColor }} />
                                  </div>
                                  <div className="flex items-center justify-between mt-2.5 text-[11px] font-semibold text-white uppercase tracking-widest gap-2">
                                    <span>{subject.questionsAttempted} {isAf ? "vrae" : "Qs"}</span>
                                    {delta !== null && (
                                      <span
                                        className="inline-flex items-center gap-1 normal-case tracking-normal"
                                        style={{ color: delta >= 0 ? HEX.mint : HEX.alert }}
                                        data-testid={`subject-delta-${subject.subjectId}`}
                                      >
                                        {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {delta > 0 ? "+" : ""}{delta} {isAf ? "vs begin" : "vs start"}
                                      </span>
                                    )}
                                    <span>{subject.papersCompleted} {isAf ? "vraestelle" : "papers"}</span>
                                  </div>
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          <div className="text-center py-10 rounded-2xl bg-[#1b1922] border border-[#1b1922] p-6">
                            <BookOpen className="w-7 h-7 mx-auto mb-3 text-white" />
                            <p className="font-bold text-white">{isAf ? "Nog geen vak begin nie" : "No subject started yet"}</p>
                            <p className="text-sm text-white mt-1">
                              {isAf ? "Kies 'n vak hieronder om jou eerste balk te vul." : "Pick a subject below to fill your first bar."}
                            </p>
                          </div>
                        )}

                        {idleSubjects.length > 0 && (
                          <div className="pt-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white mb-2">
                              {isAf ? "Nog nie begin nie" : "Not started yet"}
                            </p>
                            <div className="flex flex-wrap gap-2" data-testid="idle-subjects">
                              {idleSubjects.map((subject: SubjectProgress) => (
                                <Link key={subject.subjectId} href={`/subject/${subject.subjectId}`}>
                                  <span
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1b1922] text-[12px] font-bold text-white cursor-pointer hover:bg-[#1b1922]"
                                    style={{ border: "1px solid #1b1922" }}
                                    data-testid={`idle-subject-${subject.subjectId}`}
                                  >
                                    <span>{getSubjectIcon(subject.subjectName)}</span>
                                    {subject.subjectName}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Panel>

                    {/* Topic Coverage — the real per-topic breakdown, off
                        topic_mastery. Present only when the marking pipeline
                        has produced enough banded rows; otherwise the panel
                        says "topic breakdown coming soon" honestly. */}
                    <Panel
                      hex={HEX.purple}
                      icon={Layers}
                      title={isAf ? "Onderwerp-vaardigheid" : "Topic Mastery"}
                      subtitle={
                        topicSummary.total > 0
                          ? (isAf
                              ? `${topicSummary.green} groen · ${topicSummary.amber} amber · ${topicSummary.red} rooi (${topicSummary.graded} gegradeer)`
                              : `${topicSummary.green} green · ${topicSummary.amber} amber · ${topicSummary.red} red (${topicSummary.graded} graded)`)
                          : (isAf
                              ? "Onderwerp-uiteensetting kom sodra jy meer aanpak"
                              : "Topic breakdown appears as you attempt more")
                      }
                      testid="panel-topic-mastery"
                    >
                      <div className="p-5 space-y-4">
                        {topicSummary.total > 0 ? (
                          <>
                            {/* Coverage strip — 3 counters colour-matched to
                                the bands they represent. */}
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { k: isAf ? "Groen" : "Green", v: topicSummary.green, hex: HEX.mint },
                                { k: isAf ? "Amber" : "Amber", v: topicSummary.amber, hex: HEX.yellow },
                                { k: isAf ? "Rooi"  : "Red",   v: topicSummary.red,   hex: HEX.alert },
                              ].map(({ k, v, hex }) => (
                                <div key={k} className="rounded-xl bg-[#1b1922] px-3 py-2" style={{ border: `1px solid ${hex}55` }}>
                                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">{k}</div>
                                  <div className="text-lg font-black" style={{ color: hex }}>{v}</div>
                                </div>
                              ))}
                            </div>

                            {topicStrengths.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white mb-2 flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3" style={{ color: HEX.mint }} />
                                  {isAf ? "Sterkpunte" : "Strengths"}
                                </p>
                                <div className="space-y-2" data-testid="topic-strengths">
                                  {topicStrengths.map((t: TopicMasteryEntry) => (
                                    <div
                                      key={t.topicId}
                                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#1b1922]"
                                      style={{ border: `1px solid ${HEX.mint}55` }}
                                      data-testid={`topic-strength-${t.topicId}`}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white text-[13px] truncate">{t.topicName}</p>
                                        <p className="text-[10px] font-semibold text-white truncate">{t.subjectName}</p>
                                      </div>
                                      <span className="font-black text-base shrink-0" style={{ color: HEX.mint }}>
                                        {t.masteryScore}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {topicFocus.length > 0 ? (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white mb-2 flex items-center gap-1.5">
                                  <Target className="w-3 h-3" style={{ color: HEX.alert }} />
                                  {isAf ? "Fokus hier volgende" : "Focus here next"}
                                </p>
                                <div className="space-y-2" data-testid="topic-focus">
                                  {topicFocus.map((t: TopicMasteryEntry) => {
                                    const hex = bandHex(t.masteryBand);
                                    return (
                                      <Link key={t.topicId} href={`/subject/${t.subjectId}`}>
                                        <div
                                          className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#1b1922] cursor-pointer transition-all hover:-translate-y-0.5"
                                          style={{ border: `1px solid ${hex}55` }}
                                          data-testid={`topic-focus-${t.topicId}`}
                                        >
                                          <div className="min-w-0 flex-1">
                                            <p className="font-bold text-white text-[13px] truncate">{t.topicName}</p>
                                            <p className="text-[10px] font-semibold text-white truncate">
                                              {t.subjectName} · {t.questionsAttempted} {isAf ? "vrae" : "Qs"}
                                            </p>
                                          </div>
                                          <span className="font-black text-base shrink-0" style={{ color: hex }}>
                                            {t.masteryScore}%
                                          </span>
                                          <ArrowRight className="w-4 h-4 shrink-0" style={{ color: hex }} />
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-6 rounded-2xl bg-[#1b1922] border border-[#1b1922] p-4">
                                <p className="font-bold text-white text-sm">
                                  {isAf ? "Elke onderwerp is amber of beter" : "Every topic is amber or better"}
                                </p>
                                <p className="text-[11px] text-white mt-1">
                                  {isAf ? "Bly aan die gang om die groen band te bereik." : "Keep going to reach the green band."}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 rounded-2xl bg-[#1b1922] border border-[#1b1922] p-6">
                            <Layers className="w-7 h-7 mx-auto mb-3 text-white" />
                            <p className="font-bold text-white">
                              {isAf ? "Onderwerp-uiteensetting kom binnekort" : "Topic breakdown coming soon"}
                            </p>
                            <p className="text-sm text-white mt-1">
                              {isAf
                                ? "Sodra jy elke onderwerp 'n paar keer probeer het, verskyn die bande hier."
                                : "Once you've attempted each topic a few times, the bands appear here."}
                            </p>
                          </div>
                        )}
                      </div>
                    </Panel>
                  </div>

                  {/* Focus subjects (unchanged) — labelled as SUBJECTS
                      because that is what stats.weakTopics actually is. */}
                  <Panel
                    hex={HEX.pink}
                    icon={TrendingDown}
                    title={isAf ? "Vakke om op te fokus" : "Subjects to focus on"}
                    subtitle={isAf ? "Onder 70% na ten minste 2 vrae" : "Under 70% after at least 2 questions"}
                    testid="panel-focus-subjects"
                  >
                    <div className="p-5 space-y-3">
                      {stats.weakTopics.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {stats.weakTopics.slice(0, 6).map((topic) => {
                            const hex = accuracyHex(topic.accuracy);
                            return (
                              <Link key={topic.topicId} href={`/subject/${topic.topicId}`}>
                                <div
                                  className="flex items-center justify-between p-4 rounded-2xl bg-[#1b1922] cursor-pointer transition-all hover:-translate-y-1"
                                  style={{ border: `1px solid ${hex}55` }}
                                  data-testid={`weak-topic-${topic.topicId}`}
                                >
                                  <div className="min-w-0 flex-1 flex items-center gap-2">
                                    <span className="text-lg shrink-0">{getSubjectIcon(topic.subjectName)}</span>
                                    <p className="font-bold text-white text-sm truncate">{topic.topicName}</p>
                                  </div>
                                  <span className="font-bold text-base shrink-0 ml-3" style={{ color: hex }}>{topic.accuracy}%</span>
                                  <ArrowRight className="w-4 h-4 shrink-0 ml-2" style={{ color: hex }} />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-10 rounded-2xl bg-[#1b1922] border border-[#1b1922] p-6">
                          <Target className="w-7 h-7 mx-auto mb-3 text-white" />
                          <p className="font-bold text-white">
                            {activeSubjects.length > 0
                              ? (isAf ? "Niks onder 70% nie" : "Nothing below 70%")
                              : (isAf ? "Nog nie genoeg data nie" : "Not enough data yet")}
                          </p>
                          <p className="text-sm text-white mt-1">
                            {activeSubjects.length > 0
                              ? (isAf ? "Elke vak wat jy aangepak het, hou stand. Hou so aan." : "Every subject you've worked on is holding up. Keep it there.")
                              : (isAf ? "Beantwoord 'n paar vrae per vak — dan wys ons waar om te fokus." : "Answer a few questions per subject and we'll show you where to focus.")}
                          </p>
                        </div>
                      )}
                    </div>
                  </Panel>

                  {/* ── Milestones: personal bests + next badge ────────────
                      Both widgets already exist and pull from real endpoints,
                      but the page was previously missing personal-bests. */}
                  <Panel
                    hex={HEX.yellow}
                    icon={Trophy}
                    title={isAf ? "Mylpale" : "Milestones"}
                    subtitle={isAf
                      ? "Werklike prestasies uit personal_bests en jou kentekens"
                      : "Real achievements from personal_bests and your badges"}
                    testid="panel-milestones"
                  >
                    <div className="p-5 grid gap-5 lg:grid-cols-2">
                      <PersonalBestsWidget isAf={isAf} />
                      <NextMilestoneWidget isAf={isAf} />
                    </div>
                  </Panel>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
