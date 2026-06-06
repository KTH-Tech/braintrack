import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/formatters";
import { calcReadiness } from "@/lib/readiness";
import type { OnboardingResult } from "@shared/schema";
import { PageHeader } from "@/components/page-header";
import { 
  ArrowLeft,
  Target,
  TrendingUp,
  TrendingDown,
  Flame,
  BookOpen,
  ChevronRight,
  LogOut,
  Calendar,
  CheckCircle,
  Languages
} from "lucide-react";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { getSubjectIcon, STATUS_ICONS } from "@/lib/vark";

interface SubjectProgress {
  subjectId: number;
  subjectName: string;
  accuracy: number;
  questionsAttempted: number;
  papersCompleted: number;
}

interface WeakTopic {
  topicId: number;
  topicName: string;
  subjectName: string;
  accuracy: number;
}

interface ProgressStats {
  overallAccuracy: number;
  studyStreak: number;
  totalQuestionsAttempted: number;
  totalPapersCompleted: number;
  subjectProgress: SubjectProgress[];
  weakTopics: WeakTopic[];
  recentActivity: {
    date: string;
    questionsAnswered: number;
    correctAnswers: number;
  }[];
}

export default function ProgressPage() {
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  const { data: stats, isLoading } = useQuery<ProgressStats>({
    queryKey: ["/api/user/progress"],
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg bg-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-xl gradient-text hidden sm:inline">{isAf ? "Klaskamer" : "Classroom"}</span>
            </div>
            <nav className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" data-testid="link-home" className="flex items-center gap-2 text-white hover:text-white hover:bg-white/10">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden md:inline">{isAf ? "Tuis" : "Home"}</span>
                </Button>
              </Link>
              <Link href="/subjects">
                <Button variant="ghost" size="sm" data-testid="link-subjects" className="flex items-center gap-2 text-white hover:text-white hover:bg-white/10">
                  <Languages className="w-4 h-4" />
                  <span className="hidden md:inline">{isAf ? "Vakke" : "Subjects"}</span>
                </Button>
              </Link>
              <Link href="/progress">
                <Button variant="default" size="sm" data-testid="link-progress" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden md:inline">{isAf ? "Vordering" : "Progress"}</span>
                </Button>
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLanguage()}
                className="text-white font-semibold hover:text-white hover:bg-white/10 rounded-2xl"
                data-testid="button-language-toggle"
              >
                {isAf ? "AF" : "EN"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()}
                data-testid="button-logout"
                aria-label={isAf ? "Uitteken" : "Sign Out"}
                className="text-white font-semibold hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isAf ? "Uitteken" : "Sign Out"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Cosmic wordmark wash behind the report */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 opacity-40">
          <div className="absolute top-[5%] left-[10%] w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(40,201,214,0.22), transparent 70%)" }} />
          <div className="absolute top-[40%] right-[0%] w-[380px] h-[380px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(142,124,220,0.22), transparent 70%)" }} />
          <div className="absolute bottom-[5%] left-[30%] w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,138,31,0.18), transparent 70%)" }} />
        </div>

        <div className="space-y-8 relative z-10">
          {/* Cinematic hero banner */}
          {(() => {
            const acc = stats?.overallAccuracy ?? 0;
            const streak = stats?.studyStreak ?? 0;
            const papers = stats?.totalPapersCompleted ?? 0;
            const questions = stats?.totalQuestionsAttempted ?? 0;
            const readiness = calcReadiness({ accuracy: acc, studyStreak: streak, questionsAnswered: questions });
            const rank =
              acc >= 85 ? (isAf ? "Legendaries" : "Legendary") :
              acc >= 70 ? (isAf ? "Voorloper"   : "Top Performer") :
              acc >= 55 ? (isAf ? "Op Koers"    : "On Track") :
              acc >= 40 ? (isAf ? "Bou Momentum": "Building Momentum") :
                          (isAf ? "Ontluik"     : "Emerging");
            const rankHex = acc >= 70 ? "#28c9d6" : acc >= 55 ? "#ffd83a" : acc >= 40 ? "#ff8a1f" : "#e6519c";
            const readinessHex = readiness >= 75 ? "#28c9d6" : readiness >= 55 ? "#ffd83a" : readiness >= 40 ? "#ff8a1f" : "#e6519c";
            const R = 52;
            const C = 2 * Math.PI * R;
            const offset = C - (Math.min(100, Math.max(0, acc)) / 100) * C;

            return (
              <div
                className="relative overflow-hidden rounded-3xl bg-black p-6 sm:p-8 md:p-10"
                style={{
                  border: "1.5px solid #28c9d6",
                  boxShadow: "0 0 0 1px rgba(40,201,214,0.28), 0 0 32px rgba(40,201,214,0.35), inset 0 0 28px rgba(0,0,0,0.6)",
                }}
              >
                {/* Grid texture */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(40,201,214,1) 1px, transparent 1px), linear-gradient(90deg, rgba(40,201,214,1) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                    maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                  }}
                />
                {/* Scan line */}
                <div
                  aria-hidden
                  className="absolute left-0 right-0 h-px pointer-events-none progress-hero-scan"
                  style={{
                    background: "linear-gradient(90deg, transparent, #28c9d6 20%, #8e7cdc 50%, #e6519c 80%, transparent)",
                    boxShadow: "0 0 14px #28c9d6, 0 0 28px #8e7cdc",
                  }}
                />
                {/* Rainbow top bar */}
                <div
                  aria-hidden
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: "linear-gradient(90deg, #ff6a1f, #ff8a1f, #ffb020, #ffd83a, #28c9d6, #4f8cd9, #8e7cdc, #b066d6, #e6519c)" }}
                />
                {/* Corner brackets */}
                <span aria-hidden className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "#28c9d6" }} />
                <span aria-hidden className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "#28c9d6" }} />
                <span aria-hidden className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "#28c9d6" }} />
                <span aria-hidden className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "#28c9d6" }} />

                <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
                  {/* Left: copy + ticker */}
                  <div className="flex-1 space-y-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black"
                        style={{ border: "1px solid rgba(40,201,214,0.55)", boxShadow: "0 0 12px rgba(40,201,214,0.4)" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full progress-hero-pulse" style={{ background: "#28c9d6", boxShadow: "0 0 6px #28c9d6" }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#28c9d6" }}>
                          {isAf ? "Prestasieverslag" : "Performance Report"}
                        </span>
                      </div>
                      <div
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                        style={{ border: `1px solid ${rankHex}`, boxShadow: `0 0 12px ${rankHex}66` }}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: rankHex }}>
                          {isAf ? "Rang" : "Rank"}: {rank}
                        </span>
                      </div>
                      <div
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                        style={{ border: "1px solid rgba(255,138,31,0.55)", boxShadow: "0 0 10px rgba(255,138,31,0.4)" }}
                      >
                        <Flame className="w-3 h-3" style={{ color: "#ff8a1f", filter: "drop-shadow(0 0 4px #ff8a1f)" }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#ff8a1f" }}>
                          {streak} {isAf ? (streak === 1 ? "dag" : "dae") : (streak === 1 ? "day" : "days")}
                        </span>
                      </div>
                    </div>

                    <h1
                      className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.98]"
                      style={{
                        background:
                          "linear-gradient(90deg, #ff6a1f, #ff8a1f, #ffb020, #ffd83a, #28c9d6, #4f8cd9, #8e7cdc, #b066d6, #e6519c)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        filter: "drop-shadow(0 0 18px rgba(40,201,214,0.25))",
                      }}
                    >
                      {isAf ? "Jou Vordering" : "Your Progress"}
                    </h1>
                    <p className="text-white font-medium text-base sm:text-lg max-w-xl">
                      {isAf
                        ? "'n Lewendige missiekonsole vir jou matriekreis — elke vraestel, elke streep, elke oorwinning."
                        : "A live mission console for your matric journey — every paper, every streak, every win."}
                    </p>

                    {/* Rainbow readiness meter */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                          {isAf ? "Missie Gereedheid" : "Mission Readiness"}
                        </span>
                        <span data-testid="mission-readiness-value" className="text-[11px] font-bold" style={{ color: readinessHex, textShadow: `0 0 8px ${readinessHex}66` }}>
                          {readiness}%
                        </span>
                      </div>
                      <div
                        className="relative h-2 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <div
                          className="absolute top-0 left-0 bottom-0 rounded-full transition-[width] duration-700"
                          style={{
                            width: `${readiness}%`,
                            background:
                              "linear-gradient(90deg, #ff6a1f, #ff8a1f, #ffb020, #ffd83a, #28c9d6, #4f8cd9, #8e7cdc, #b066d6, #e6519c)",
                            boxShadow: "0 0 14px rgba(40,201,214,0.7), 0 0 22px rgba(142,124,220,0.5)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Mini ticker */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        { k: isAf ? "Vraestelle" : "Papers",  v: papers,    hex: "#8e7cdc" },
                        { k: isAf ? "Vrae"       : "Questions", v: questions, hex: "#ffd83a" },
                        { k: isAf ? "Streep"     : "Streak",  v: streak,    hex: "#ff8a1f" },
                      ].map(({ k, v, hex }) => (
                        <div
                          key={k}
                          className="rounded-xl bg-black px-3 py-2"
                          style={{ border: `1px solid ${hex}55`, boxShadow: `0 0 10px ${hex}33` }}
                        >
                          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">{k}</div>
                          <div className="text-lg font-black" style={{ color: hex, textShadow: `0 0 8px ${hex}55` }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1">
                      <Link href="/dashboard">
                        <button
                          className="px-4 py-2 rounded-xl bg-black font-bold text-xs uppercase tracking-widest"
                          style={{ color: "#28c9d6", border: "1.5px solid #28c9d6", boxShadow: "0 0 14px rgba(40,201,214,0.4)" }}
                          data-testid="button-back"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 inline mr-1.5" />
                          {isAf ? "Terug na Tuis" : "Back to Dashboard"}
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Right: neon accuracy dial */}
                  <div className="relative flex-shrink-0 self-center">
                    <div
                      aria-hidden
                      className="absolute inset-0 rounded-full blur-2xl"
                      style={{ background: `radial-gradient(circle, ${rankHex}55, transparent 70%)` }}
                    />
                    <svg width="160" height="160" viewBox="0 0 140 140" className="relative">
                      <defs>
                        <linearGradient id="accDialStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff8a1f" />
                          <stop offset="25%" stopColor="#ffd83a" />
                          <stop offset="50%" stopColor="#28c9d6" />
                          <stop offset="75%" stopColor="#8e7cdc" />
                          <stop offset="100%" stopColor="#e6519c" />
                        </linearGradient>
                        <filter id="accDialGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2.6" result="b" />
                          <feMerge>
                            <feMergeNode in="b" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Track */}
                      <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
                      {/* Value */}
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
                        filter="url(#accDialGlow)"
                        style={{ transition: "stroke-dashoffset 900ms ease-out" }}
                      />
                      {/* Tick dots */}
                      {Array.from({ length: 36 }).map((_, i) => {
                        const ang = (i / 36) * Math.PI * 2 - Math.PI / 2;
                        const r1 = 62, r2 = 64;
                        const x1 = 70 + Math.cos(ang) * r1;
                        const y1 = 70 + Math.sin(ang) * r1;
                        const x2 = 70 + Math.cos(ang) * r2;
                        const y2 = 70 + Math.sin(ang) * r2;
                        return (
                          <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(40,201,214,0.4)"
                            strokeWidth="1"
                          />
                        );
                      })}
                      {/* Center text */}
                      <text
                        x="70"
                        y="66"
                        textAnchor="middle"
                        style={{
                          fontFamily: "Sora, sans-serif",
                          fontSize: "32px",
                          fontWeight: 900,
                          fill: rankHex,
                          filter: `drop-shadow(0 0 6px ${rankHex})`,
                        }}
                      >
                        {acc}
                      </text>
                      <text
                        x="70"
                        y="82"
                        textAnchor="middle"
                        style={{
                          fontFamily: "Sora, sans-serif",
                          fontSize: "9px",
                          fontWeight: 700,
                          letterSpacing: "0.2em",
                          fill: "#ffffff",
                        }}
                      >
                        {isAf ? "AKKURAATHEID" : "ACCURACY"}
                      </text>
                      <text
                        x="70"
                        y="96"
                        textAnchor="middle"
                        style={{
                          fontFamily: "Sora, sans-serif",
                          fontSize: "11px",
                          fontWeight: 800,
                          fill: rankHex,
                          letterSpacing: "0.12em",
                        }}
                      >
                        %
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Hero stats — neon cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(() => {
                  const heroStats = [
                    { label: isAf ? "Studie-reeks" : "Study Streak", value: stats.studyStreak, unit: isAf ? "dae" : "days", icon: Flame,       hex: "#ff8a1f", testid: "stat-streak" },
                    { label: isAf ? "Akkuraatheid" : "Accuracy",     value: stats.overallAccuracy, unit: "%",                icon: Target,      hex: "#28c9d6", testid: "stat-accuracy" },
                    { label: isAf ? "Vraestelle"   : "Papers Done",  value: stats.totalPapersCompleted, unit: "",            icon: BookOpen,    hex: "#8e7cdc", testid: "stat-papers" },
                    { label: isAf ? "Vrae"         : "Questions",    value: stats.totalQuestionsAttempted, unit: "",         icon: CheckCircle, hex: "#ffd83a", testid: "stat-questions" },
                  ];
                  return heroStats.map(({ label, value, unit, icon: Icon, hex, testid }) => (
                    <div
                      key={label}
                      className="relative rounded-2xl bg-black p-5 overflow-hidden transition-all hover:-translate-y-0.5"
                      style={{ border: `1.5px solid ${hex}`, boxShadow: `0 0 0 1px ${hex}33, 0 0 22px ${hex}44, inset 0 0 18px rgba(0,0,0,0.6)` }}
                    >
                      <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: hex }} />
                      <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: hex }} />
                      <span aria-hidden className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: hex }} />
                      <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: hex }} />
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shrink-0"
                          style={{ border: `1.5px solid ${hex}`, boxShadow: `0 0 14px ${hex}66, inset 0 0 8px ${hex}55` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: hex, filter: `drop-shadow(0 0 5px ${hex})` }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: `${hex}cc` }}>{label}</p>
                          <p className="text-2xl font-bold" style={{ color: hex, textShadow: `0 0 10px ${hex}55` }} data-testid={testid}>
                            {value}{unit && <span className="text-sm font-semibold text-white ml-1">{unit}</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Subject Progress + Areas to Improve */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Subject Progress */}
                <div
                  className="relative rounded-2xl bg-black overflow-hidden"
                  style={{ border: "1.5px solid #4f8cd9", boxShadow: "0 0 0 1px rgba(79,140,217,0.28), 0 0 26px rgba(79,140,217,0.3), inset 0 0 22px rgba(0,0,0,0.55)" }}
                >
                  <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#4f8cd9" }} />
                  <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#4f8cd9" }} />
                  <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#4f8cd9" }} />
                  <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#4f8cd9" }} />
                  <div className="flex items-center gap-2 px-6 py-5" style={{ borderBottom: "1px solid rgba(79,140,217,0.35)" }}>
                    <TrendingUp className="w-5 h-5" style={{ color: "#4f8cd9", filter: "drop-shadow(0 0 6px rgba(79,140,217,0.85))" }} />
                    <h2 className="text-lg font-bold text-white">{isAf ? "Vakvordering" : "Subject Progress"}</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {stats.subjectProgress.length > 0 ? (
                      stats.subjectProgress.map((subject, idx) => {
                        const stops = ["#ff8a1f", "#ffd83a", "#28c9d6", "#4f8cd9", "#8e7cdc", "#b066d6", "#e6519c"];
                        const hex = stops[idx % stops.length];
                        const barColor = subject.accuracy >= 70 ? "#28c9d6" : subject.accuracy >= 50 ? "#ffd83a" : "#e6519c";
                        return (
                          <Link key={subject.subjectId} href={`/subject/${subject.subjectId}`}>
                            <div
                              className="p-4 rounded-2xl bg-black cursor-pointer transition-all hover:-translate-y-0.5"
                              style={{ border: `1px solid ${hex}55`, boxShadow: `0 0 12px ${hex}33` }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = hex; e.currentTarget.style.boxShadow = `0 0 22px ${hex}88`; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${hex}55`; e.currentTarget.style.boxShadow = `0 0 12px ${hex}33`; }}
                              data-testid={`progress-subject-${subject.subjectId}`}
                            >
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="font-bold text-white flex items-center gap-2 text-sm">
                                  <span className="text-lg">{getSubjectIcon(subject.subjectName)}</span>
                                  {subject.subjectName}
                                </span>
                                <span className="font-bold text-base" style={{ color: barColor, textShadow: `0 0 8px ${barColor}66` }}>
                                  {subject.accuracy}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${subject.accuracy}%`, background: barColor, boxShadow: `0 0 10px ${barColor}` }}
                                />
                              </div>
                              <div className="flex items-center justify-between mt-2.5 text-[11px] font-semibold text-white uppercase tracking-widest">
                                <span>{subject.questionsAttempted} {isAf ? "vrae" : "Qs"}</span>
                                <span>{subject.papersCompleted} {isAf ? "vraestelle" : "papers"}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 rounded-2xl bg-black border border-white/10 p-6">
                        <div
                          className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-black flex items-center justify-center border border-white/10"
                        >
                          <BookOpen className="w-7 h-7 text-white/50" />
                        </div>
                        <p className="font-bold text-white">{isAf ? "Nog geen vorderingsdata nie" : "No progress data yet"}</p>
                        <p className="text-sm text-white/70 mt-1">{isAf ? "Begin vrae beantwoord om jou vordering na te spoor" : "Start answering questions to track your progress"}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Areas to Improve */}
                <div
                  className="relative rounded-2xl bg-black overflow-hidden"
                  style={{ border: "1.5px solid #e6519c", boxShadow: "0 0 0 1px rgba(230,81,156,0.28), 0 0 26px rgba(230,81,156,0.3), inset 0 0 22px rgba(0,0,0,0.55)" }}
                >
                  <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#e6519c" }} />
                  <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#e6519c" }} />
                  <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#e6519c" }} />
                  <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#e6519c" }} />
                  <div className="flex items-center gap-2 px-6 py-5" style={{ borderBottom: "1px solid rgba(230,81,156,0.35)" }}>
                    <TrendingDown className="w-5 h-5" style={{ color: "#e6519c", filter: "drop-shadow(0 0 6px rgba(230,81,156,0.85))" }} />
                    <h2 className="text-lg font-bold text-white">{isAf ? "Areas om te Verbeter" : "Areas to Improve"}</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {stats.weakTopics.length > 0 ? (
                      stats.weakTopics.slice(0, 5).map((topic) => {
                        const hex = topic.accuracy >= 50 ? "#ffd83a" : "#e6519c";
                        return (
                          <div
                            key={topic.topicId}
                            className="flex items-center justify-between p-4 rounded-2xl bg-black"
                            style={{ border: `1px solid ${hex}55`, boxShadow: `0 0 12px ${hex}33` }}
                            data-testid={`weak-topic-${topic.topicId}`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white text-sm truncate">{topic.topicName}</p>
                              <p className="text-xs text-white flex items-center gap-1 mt-0.5">
                                <span>{getSubjectIcon(topic.subjectName)}</span>
                                {topic.subjectName}
                              </p>
                            </div>
                            <span className="font-bold text-base shrink-0 ml-3" style={{ color: hex, textShadow: `0 0 8px ${hex}66` }}>
                              {topic.accuracy}%
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 rounded-2xl bg-black border border-white/10 p-6">
                        <div
                          className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-black flex items-center justify-center border border-white/10"
                        >
                          <Target className="w-7 h-7 text-white/50" />
                        </div>
                        <p className="font-bold text-white">{isAf ? "Nog geen swak areas nie" : "No weak areas yet"}</p>
                        <p className="text-sm text-white/70 mt-1">{isAf ? "Hou aan oefen om persoonlike insigte te kry" : "Keep practicing to get personalized insights"}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div
                className="relative rounded-2xl bg-black overflow-hidden"
                style={{ border: "1.5px solid #ffd83a", boxShadow: "0 0 0 1px rgba(255,216,58,0.28), 0 0 26px rgba(255,216,58,0.28), inset 0 0 22px rgba(0,0,0,0.55)" }}
              >
                <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#ffd83a" }} />
                <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#ffd83a" }} />
                <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#ffd83a" }} />
                <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#ffd83a" }} />
                <div className="flex items-center gap-2 px-6 py-5" style={{ borderBottom: "1px solid rgba(255,216,58,0.35)" }}>
                  <Calendar className="w-5 h-5" style={{ color: "#ffd83a", filter: "drop-shadow(0 0 6px rgba(255,216,58,0.85))" }} />
                  <h2 className="text-lg font-bold text-white">{isAf ? "Onlangse Aktiwiteit" : "Recent Activity"}</h2>
                </div>
                <div className="p-6">
                  {stats.recentActivity.length > 0 ? (
                    <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-7">
                      {stats.recentActivity.slice(0, 7).map((day, index) => {
                        const accuracy = day.questionsAnswered > 0
                          ? Math.round((day.correctAnswers / day.questionsAnswered) * 100)
                          : 0;
                        const hex = accuracy >= 70 ? "#28c9d6" : accuracy >= 50 ? "#ffd83a" : day.questionsAnswered > 0 ? "#e6519c" : "#4f8cd9";
                        const intensity = Math.min(1, day.questionsAnswered / 20);
                        return (
                          <div
                            key={day.date}
                            className="p-3 rounded-2xl bg-black text-center transition-all hover:-translate-y-0.5"
                            style={{
                              border: `1px solid ${hex}${day.questionsAnswered > 0 ? "88" : "33"}`,
                              boxShadow: day.questionsAnswered > 0 ? `0 0 ${10 + intensity * 14}px ${hex}${Math.round(40 + intensity * 60).toString(16)}` : "none",
                            }}
                            data-testid={`activity-${index}`}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">
                              {formatDate(day.date, language, { weekday: 'short' })}
                            </p>
                            <p className="text-2xl font-bold" style={{ color: hex, textShadow: day.questionsAnswered > 0 ? `0 0 8px ${hex}88` : "none" }}>
                              {day.questionsAnswered}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: day.questionsAnswered > 0 ? `${hex}cc` : "rgba(255,255,255,0.35)" }}>
                              {day.questionsAnswered > 0 ? `${accuracy}%` : '—'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-2xl bg-black border border-white/10 p-6">
                      <div
                        className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-black flex items-center justify-center border border-white/10"
                      >
                        <Calendar className="w-7 h-7 text-white/50" />
                      </div>
                      <p className="font-bold text-white">{isAf ? "Geen onlangse aktiwiteit nie" : "No recent activity"}</p>
                      <p className="text-sm text-white/70 mt-1">{isAf ? "Begin studeer om jou aktiwiteit hier te sien" : "Start studying to see your activity here"}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-black border border-white/10 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-black flex items-center justify-center border border-white/10">
                <Target className="w-8 h-8 text-white/50" />
              </div>
              <p className="text-lg font-bold text-white">{isAf ? "Geen vorderingsdata beskikbaar nie" : "No progress data available"}</p>
              <p className="text-sm text-white/70 mt-1">{isAf ? "Begin vrae beantwoord om jou vordering na te spoor" : "Start answering questions to track your progress"}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
