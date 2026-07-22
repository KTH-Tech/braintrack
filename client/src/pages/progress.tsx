import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/formatters";
import { calcReadiness, readinessBandLabel } from "@/lib/readiness";
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
} from "lucide-react";
import { getSubjectIcon } from "@/lib/vark";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { LearnerHeader } from "@/components/learner-header";
import { YouVsYouChart } from "@/components/you-vs-you-chart";
import { NextMilestoneWidget } from "@/components/next-milestone-widget";
import {
  type ProgressStats,
  type SubjectProgress,
  hasAnyActivity,
  summariseActivity,
  dayAccuracy,
  splitSubjects,
  improvementOf,
  pickNextMove,
  accuracyHex,
} from "@/lib/progress-insights";

/* Opaque card base — the graffiti scatter sits behind the page and bled
   through when these were translucent, so every card paints #050508 first. */
const CARD_BG = "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508";

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

export default function ProgressPage() {
  const { language } = useLanguage();
  const isAf = language === "af";

  const { data: stats, isLoading } = useQuery<ProgressStats>({
    queryKey: ["/api/user/progress"],
  });

  const started = hasAnyActivity(stats);
  const activity = summariseActivity(stats?.recentActivity);
  const { started: activeSubjects, notStarted: idleSubjects } = splitSubjects(stats?.subjectProgress);
  const nextMove = pickNextMove(stats);

  const acc = stats?.overallAccuracy ?? 0;
  const streak = stats?.studyStreak ?? 0;
  const papers = stats?.totalPapersCompleted ?? 0;
  const questions = stats?.totalQuestionsAttempted ?? 0;
  const readiness = calcReadiness({ accuracy: acc, studyStreak: streak, questionsAnswered: questions });

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
  const rankHex = acc >= 70 ? "#9FD8FF" : acc >= 40 ? "#FFE29A" : "#FFB7E5";
  const readinessHex = readiness >= 75 ? "#9FD8FF" : readiness >= 40 ? "#FFE29A" : "#FFB7E5";
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
        titleColor="#9FF5E8"
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
            style={{ background: CARD_BG, border: "1.5px solid #9FD8FF", boxShadow: "0 0 0 1px rgba(159,216,255,0.28)" }}
          >
            {/* Grid texture */}
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
              style={{ background: "linear-gradient(90deg, transparent, #9FD8FF 20%, #C5B3FF 50%, #FFB7E5 80%, transparent)" }}
            />
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)" }}
            />
            <span aria-hidden className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "#9FD8FF" }} />
            <span aria-hidden className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "#9FD8FF" }} />
            <span aria-hidden className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "#9FD8FF" }} />
            <span aria-hidden className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "#9FD8FF" }} />

            <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/[.03]" style={{ border: "1px solid rgba(159,216,255,0.55)" }}>
                    <span className="w-1.5 h-1.5 rounded-full progress-hero-pulse" style={{ background: "#9FD8FF" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#9FD8FF" }}>
                      {isAf ? "Prestasieverslag" : "Performance Report"}
                    </span>
                  </div>
                  {/* Rank is a read of measured accuracy — meaningless before
                      there is any, so it only appears once data exists. */}
                  {started && (
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/[.03]" style={{ border: `1px solid ${rankHex}` }}>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: rankHex }}>
                        {isAf ? "Rang" : "Rank"}: {rank}
                      </span>
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/[.03]" style={{ border: "1px solid rgba(255,226,154,0.55)" }}>
                    <Flame className="w-3 h-3" style={{ color: "#FFE29A" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#FFE29A" }}>
                      {streak} {isAf ? (streak === 1 ? "dag" : "dae") : (streak === 1 ? "day" : "days")}
                    </span>
                  </div>
                </div>

                <div
                  role="heading"
                  aria-level={1}
                  className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.98]"
                  style={{
                    background: "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
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
                        ? "'n Lewendige missiekonsole vir jou matriekreis — elke vraestel, elke streep, elke oorwinning."
                        : "A live mission console for your matric journey — every paper, every streak, every win.")
                    : (isAf
                        ? "Hier land jou syfers sodra jy begin oefen. Op die oomblik is dit 'n skoon bladsy — kom ons vul dit."
                        : "This is where your numbers land once you start practising. Right now it's a clean page — let's fill it.")}
                </p>

                {/* Readiness — labelled so the percentage means something. */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                      {isAf ? "Missie Gereedheid" : "Mission Readiness"}
                    </span>
                    <span data-testid="mission-readiness-value" className="text-[11px] font-bold" style={{ color: readinessHex }}>
                      {readiness}% · {readinessBandLabel(readiness, isAf)}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div
                      className="absolute top-0 left-0 bottom-0 rounded-full transition-[width] duration-700"
                      style={{
                        width: `${readiness}%`,
                        background: "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-white mt-1.5">
                    {isAf
                      ? "Gebaseer op akkuraatheid, hoeveel vrae jy beantwoord het, en jou streep."
                      : "Based on your accuracy, how many questions you've answered, and your streak."}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { k: isAf ? "Vraestelle" : "Papers",    v: papers,    hex: "#C5B3FF" },
                    { k: isAf ? "Vrae"       : "Questions", v: questions, hex: "#FFE29A" },
                    { k: isAf ? "Streep"     : "Streak",    v: streak,    hex: "#FFE29A" },
                  ].map(({ k, v, hex }) => (
                    <div key={k} className="rounded-xl bg-white/[.03] px-3 py-2" style={{ border: `1px solid ${hex}55` }}>
                      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">{k}</div>
                      <div className="text-lg font-black" style={{ color: hex }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <Link href="/dashboard">
                    <button
                      className="px-4 py-2 rounded-xl bg-white/[.03] font-bold text-sm hover:bg-white/10"
                      style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 inline mr-1.5" />
                      {isAf ? "Terug na Tuis" : "Back to Dashboard"}
                    </button>
                  </Link>
                </div>
              </div>

              {/* Accuracy dial */}
              <div className="relative flex-shrink-0 self-center">
                <svg width="160" height="160" viewBox="0 0 140 140" className="relative">
                  <defs>
                    <linearGradient id="accDialStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFE29A" />
                      <stop offset="25%" stopColor="#FFE29A" />
                      <stop offset="50%" stopColor="#9FF5E8" />
                      <stop offset="75%" stopColor="#C5B3FF" />
                      <stop offset="100%" stopColor="#FFB7E5" />
                    </linearGradient>
                  </defs>
                  <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
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
            <div className="rounded-2xl p-12 text-center" style={{ background: CARD_BG, border: "1px solid rgba(255,255,255,.12)" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[.03] flex items-center justify-center border border-white/10">
                <Target className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-bold text-white">{isAf ? "Kon nie jou vordering laai nie" : "Couldn't load your progress"}</p>
              <p className="text-sm text-white mt-1">{isAf ? "Gaan jou verbinding na en laai die bladsy weer." : "Check your connection and reload the page."}</p>
            </div>
          ) : (
            <>
              {/* ── Next move — the "what do I do now?" answer ─────────────── */}
              <div
                className="relative rounded-2xl overflow-hidden p-6 sm:p-7"
                style={{ background: CARD_BG, border: "1.5px solid #94F7C5", boxShadow: "0 0 0 1px rgba(148,247,197,0.28)" }}
                data-testid="next-move-card"
              >
                <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "#94F7C5" }} />
                <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#94F7C5" }} />
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/[.03]" style={{ border: "1.5px solid #94F7C5" }}>
                    <Compass className="w-7 h-7" style={{ color: "#94F7C5" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#94F7C5", transform: "rotate(-1.5deg)", display: "inline-block" }}>
                      {isAf ? "jou volgende skuif" : "your next move"}
                    </p>
                    <h2 className="text-white font-black text-xl sm:text-2xl leading-tight mt-0.5" data-testid="next-move-title">
                      {nextMoveCopy.title}
                    </h2>
                    <p className="text-white text-sm mt-1.5 leading-relaxed">{nextMoveCopy.body}</p>
                  </div>
                  <Link href={nextMoveCopy.href}>
                    <button
                      className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-sm shrink-0 bg-white/[.03] hover:bg-white/10 whitespace-nowrap"
                      style={{ color: "#94F7C5", border: "1.5px solid #94F7C5" }}
                      data-testid="next-move-cta"
                    >
                      {nextMoveCopy.cta}
                      <ArrowRight className="w-3.5 h-3.5 inline ml-1.5" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* ── Brand-new learner: no counters, just a runway ──────────── */}
              {!started ? (
                <Panel
                  hex="#C5B3FF"
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
                          const stops = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];
                          const hex = stops[idx % stops.length];
                          return (
                            <Link key={subject.subjectId} href={`/subject/${subject.subjectId}`}>
                              <div
                                className="p-4 rounded-2xl bg-white/[.03] cursor-pointer transition-all hover:-translate-y-1.5 flex items-center gap-3"
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
                      <div className="text-center py-10 rounded-2xl bg-white/[.03] border border-white/10 p-6">
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
                      { label: isAf ? "Studie-reeks" : "Study Streak", value: stats.studyStreak,             unit: isAf ? "dae" : "days", icon: Flame,       hex: "#FFE29A", testid: "stat-streak" },
                      { label: isAf ? "Akkuraatheid" : "Accuracy",     value: stats.overallAccuracy,         unit: "%",                   icon: Target,      hex: "#9FD8FF", testid: "stat-accuracy" },
                      { label: isAf ? "Vraestelle"   : "Papers Done",  value: stats.totalPapersCompleted,    unit: "",                    icon: BookOpen,    hex: "#C5B3FF", testid: "stat-papers" },
                      { label: isAf ? "Vrae"         : "Questions",    value: stats.totalQuestionsAttempted, unit: "",                    icon: CheckCircle, hex: "#FFE29A", testid: "stat-questions" },
                    ]).map(({ label, value, unit, icon: Icon, hex, testid }) => (
                      <div
                        key={label}
                        className="relative rounded-2xl p-5 overflow-hidden transition-all hover:-translate-y-1.5"
                        style={{ background: CARD_BG, border: `1.5px solid ${hex}`, boxShadow: `0 0 0 1px ${hex}33` }}
                      >
                        <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: hex }} />
                        <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: hex }} />
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/[.03] flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${hex}` }}>
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

                  {/* ── Trend: real per-day series off `attempts` ──────────── */}
                  <Panel
                    hex="#FFE29A"
                    icon={Calendar}
                    title={isAf ? "Laaste 14 dae" : "Last 14 days"}
                    subtitle={
                      activity.totalQuestions > 0
                        ? (isAf
                            ? `${activity.totalQuestions} vrae oor ${activity.activeDays} ${activity.activeDays === 1 ? "dag" : "dae"} · ${activity.accuracy}% akkuraat`
                            : `${activity.totalQuestions} questions across ${activity.activeDays} ${activity.activeDays === 1 ? "day" : "days"} · ${activity.accuracy}% accurate`)
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
                              // Scale against the learner's own best day so a
                              // 5-question day is still legible; floor at 6% so
                              // an empty day reads as an intentional gap.
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
                                      background: day.questionsAnswered > 0 ? hex : "rgba(255,255,255,0.10)",
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
                          <div className="grid grid-cols-3 gap-2 mt-4">
                            {[
                              { k: isAf ? "Aktiewe dae" : "Active days", v: `${activity.activeDays}/${activity.windowDays}`, hex: "#94F7C5" },
                              { k: isAf ? "Beste dag"   : "Best day",    v: `${activity.bestDay}`,                          hex: "#C5B3FF" },
                              { k: isAf ? "Akkuraat"    : "Accurate",    v: `${activity.accuracy}%`,                        hex: "#9FD8FF" },
                            ].map(({ k, v, hex }) => (
                              <div key={k} className="rounded-xl bg-white/[.03] px-3 py-2" style={{ border: `1px solid ${hex}55` }}>
                                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">{k}</div>
                                <div className="text-lg font-black" style={{ color: hex }}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 rounded-2xl bg-white/[.03] border border-white/10 p-6">
                          <Calendar className="w-7 h-7 mx-auto mb-3 text-white" />
                          <p className="font-bold text-white">{isAf ? "Nog geen daaglikse geskiedenis nie" : "No daily history yet"}</p>
                          <p className="text-sm text-white mt-1">
                            {isAf ? "Beantwoord vrae en jou daaglikse ritme verskyn hier." : "Answer questions and your daily rhythm shows up here."}
                          </p>
                        </div>
                      )}
                    </div>
                  </Panel>

                  {/* ── Week-over-week + next badge (existing real endpoints) ─ */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <YouVsYouChart isAf={isAf} />
                    <NextMilestoneWidget isAf={isAf} />
                  </div>

                  {/* ── Subjects ──────────────────────────────────────────── */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Panel
                      hex="#9FD8FF"
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
                            const stops = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];
                            const hex = stops[idx % stops.length];
                            const barColor = accuracyHex(subject.accuracy);
                            const delta = improvementOf(subject);
                            return (
                              <Link key={subject.subjectId} href={`/subject/${subject.subjectId}`}>
                                <div
                                  className="p-4 rounded-2xl bg-white/[.03] cursor-pointer transition-all hover:-translate-y-1.5"
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
                                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${subject.accuracy}%`, background: barColor }} />
                                  </div>
                                  <div className="flex items-center justify-between mt-2.5 text-[11px] font-semibold text-white uppercase tracking-widest gap-2">
                                    <span>{subject.questionsAttempted} {isAf ? "vrae" : "Qs"}</span>
                                    {/* Only shown when the learner gave a mark
                                        during onboarding — no baseline, no claim. */}
                                    {delta !== null && (
                                      <span
                                        className="inline-flex items-center gap-1 normal-case tracking-normal"
                                        style={{ color: delta >= 0 ? "#94F7C5" : "#FF8DA1" }}
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
                          <div className="text-center py-10 rounded-2xl bg-white/[.03] border border-white/10 p-6">
                            <BookOpen className="w-7 h-7 mx-auto mb-3 text-white" />
                            <p className="font-bold text-white">{isAf ? "Nog geen vak begin nie" : "No subject started yet"}</p>
                            <p className="text-sm text-white mt-1">
                              {isAf ? "Kies 'n vak hieronder om jou eerste balk te vul." : "Pick a subject below to fill your first bar."}
                            </p>
                          </div>
                        )}

                        {/* Untouched subjects as compact chips rather than a
                            column of identical 0% bars. */}
                        {idleSubjects.length > 0 && (
                          <div className="pt-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white mb-2">
                              {isAf ? "Nog nie begin nie" : "Not started yet"}
                            </p>
                            <div className="flex flex-wrap gap-2" data-testid="idle-subjects">
                              {idleSubjects.map((subject: SubjectProgress) => (
                                <Link key={subject.subjectId} href={`/subject/${subject.subjectId}`}>
                                  <span
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[.03] text-[12px] font-bold text-white cursor-pointer hover:bg-white/10"
                                    style={{ border: "1px solid rgba(255,255,255,0.18)" }}
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

                    {/* Focus areas. Labelled as SUBJECTS, because that is what
                        the data is — the endpoint's `weakTopics` are subject
                        rows in topic clothing, and dbe_verbatim_questions.topic
                        is NULL across the board, so real topic granularity
                        does not exist to show. */}
                    <Panel
                      hex="#FFB7E5"
                      icon={TrendingDown}
                      title={isAf ? "Vakke om op te fokus" : "Subjects to focus on"}
                      subtitle={isAf ? "Onder 70% na ten minste 2 vrae" : "Under 70% after at least 2 questions"}
                      testid="panel-focus-subjects"
                    >
                      <div className="p-5 space-y-3">
                        {stats.weakTopics.length > 0 ? (
                          stats.weakTopics.slice(0, 5).map((topic) => {
                            const hex = accuracyHex(topic.accuracy);
                            return (
                              <Link key={topic.topicId} href={`/subject/${topic.topicId}`}>
                                <div
                                  className="flex items-center justify-between p-4 rounded-2xl bg-white/[.03] cursor-pointer transition-all hover:-translate-y-1"
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
                          })
                        ) : (
                          <div className="text-center py-10 rounded-2xl bg-white/[.03] border border-white/10 p-6">
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
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
