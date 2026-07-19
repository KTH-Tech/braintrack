import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties, ReactNode, MouseEvent as ReactMouseEvent } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { incrementQuizSessionCount } from "@/lib/quiz-session-tracker";
import {
  Flame,
  Trophy,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Zap,
  Star,
  Sparkles,
  Target,
  Calendar,
  Home,
  LogOut,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import type { DailyChallenge, DailyChallengeQuestion } from "@shared/schema";

const CHALLENGE_TIME_LIMIT = 300;

const RAINBOW_GRADIENT =
  "linear-gradient(90deg,#FFE29A,#FFE29A,#94F7C5,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)";

const halo = (hex: string, a = 0.32) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const marker = (color: string, size = 16): CSSProperties => ({
  fontFamily: "'Permanent Marker',cursive",
  fontSize: size,
  color,
  transform: "rotate(-2deg)",
  display: "inline-block",
  textShadow: `0 0 10px ${halo(color, 0.45)}`,
});

const rainbowText: CSSProperties = {
  backgroundImage: RAINBOW_GRADIENT,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  color: "transparent",
};

const cardStyle = (accent?: string, radius = 22): CSSProperties => ({
  background: "rgba(255,255,255,.03)",
  border: accent ? `1.5px solid ${accent}` : "1px solid rgba(255,255,255,.08)",
  borderRadius: radius,
  ...(accent ? { boxShadow: `0 0 22px ${halo(accent, 0.22)}` } : {}),
});

const primaryBtnStyle: CSSProperties = {
  background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
  color: "#050508",
  border: "none",
  borderRadius: 12,
  fontWeight: 800,
  boxShadow: "0 0 20px rgba(159,245,232,.35)",
};

const secondaryBtnStyle = (accent = "rgba(255,255,255,.2)", color = "#fff"): CSSProperties => ({
  background: "transparent",
  border: `1.5px solid ${accent}`,
  color,
  borderRadius: 12,
  fontWeight: 700,
});

function primaryHover(e: ReactMouseEvent<HTMLButtonElement>, on: boolean) {
  e.currentTarget.style.transform = on ? "translateY(-2px)" : "none";
  e.currentTarget.style.boxShadow = on
    ? "0 0 28px rgba(159,245,232,.5)"
    : "0 0 20px rgba(159,245,232,.35)";
}

/* Full-page shell for standalone states (loading / error / empty). */
function PageShell({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <div
      className={`min-h-screen text-white ${center ? "flex items-center justify-center p-6" : ""}`}
      style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}
    >
      {children}
    </div>
  );
}

export default function DailyChallengePage() {
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  const isAf = language === "af";

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState(CHALLENGE_TIME_LIMIT);
  const [reviewQuestions, setReviewQuestions] = useState<DailyChallengeQuestion[]>([]);
  const [timeUpNoAnswers, setTimeUpNoAnswers] = useState(false);
  const selectedAnswersRef = useRef<(number | null)[]>([]);
  const timeUpHandledRef = useRef(false);
  const handleAutoSubmitRef = useRef<() => void>(() => {});

  const { data, isLoading, error: fetchError, refetch: refetchChallenge, isRefetching } = useQuery<{ challenge: DailyChallenge; streak: number }>({
    queryKey: ["/api/daily-challenge"],
  });

  const { data: historyData } = useQuery<{ history: DailyChallenge[]; streak: number }>({
    queryKey: ["/api/daily-challenge/history"],
  });

  const challenge = data?.challenge;
  const streak = data?.streak ?? 0;
  const questions = (challenge?.questionsJson as DailyChallengeQuestion[]) || [];
  const isCompleted = !!challenge?.completedAt;

  useEffect(() => {
    if (questions.length > 0 && selectedAnswers.length === 0) {
      setSelectedAnswers(new Array(questions.length).fill(null));
    }
  }, [questions.length]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    if (isCompleted || showResults) return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, CHALLENGE_TIME_LIMIT - elapsed);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        if (timeUpHandledRef.current) return;
        timeUpHandledRef.current = true;
        if (selectedAnswersRef.current.some((a) => a !== null)) {
          handleAutoSubmitRef.current();
        } else {
          setTimeUpNoAnswers(true);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted, showResults, startTime]);

  useEffect(() => {
    if (isCompleted && challenge) {
      setShowResults(true);
      setReviewQuestions(questions);
      if (challenge.answersJson) {
        const answers = challenge.answersJson as any[];
        setSelectedAnswers(answers.map((a: any) => a.selected));
      }
    }
  }, [isCompleted, challenge]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const res = await apiRequest("POST", `/api/daily-challenge/${challenge!.id}/submit`, {
        answers: selectedAnswers.map((a) => a ?? -1),
        timeSpentSeconds: timeSpent,
      });
      return res.json();
    },
    onSuccess: (data) => {
      incrementQuizSessionCount();
      const fullQuestions = (data.challenge?.questionsJson as DailyChallengeQuestion[]) || [];
      setReviewQuestions(fullQuestions);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ["/api/daily-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-challenge/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      toast({
        title: isAf ? "Uitdaging klaar!" : "Challenge complete!",
        description: isAf
          ? `Jy het ${data.score}/${data.total} gekry (${data.percentage}%) — goed gedaan!`
          : `You scored ${data.score}/${data.total} (${data.percentage}%)`,
      });
    },
    onError: () => {
      toast({
        title: isAf ? "Oeps!" : "Error",
        description: isAf ? "Kon nie jou antwoorde stuur nie" : "Failed to submit",
        variant: "destructive",
      });
    },
  });

  const handleAutoSubmit = useCallback(() => {
    if (!challenge || submitMutation.isPending) return;
    submitMutation.mutate();
  }, [challenge, submitMutation]);

  useEffect(() => {
    handleAutoSubmitRef.current = handleAutoSubmit;
  }, [handleAutoSubmit]);

  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (isCompleted || showResults) return;
      setSelectedAnswers((prev) => {
        const next = [...prev];
        next[currentQuestion] = index;
        return next;
      });
    },
    [currentQuestion, isCompleted, showResults]
  );

  const handleSubmit = () => {
    if (selectedAnswers.some((a) => a === null)) {
      toast({
        title: isAf ? "Wag eers" : "Answer all questions",
        description: isAf ? "Beantwoord eers al die vrae voor jy indien" : "Please answer all questions before submitting",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate();
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = selectedAnswers.filter((a) => a !== null).length;
  const displayQuestions = showResults && reviewQuestions.length > 0 ? reviewQuestions : questions;
  const correctCount = showResults
    ? displayQuestions.reduce((acc, q, i) => acc + (selectedAnswers[i] === q.correctIndex ? 1 : 0), 0)
    : 0;

  const timerUrgent = remainingSeconds <= 60;
  const timerWarning = remainingSeconds <= 120 && remainingSeconds > 60;
  const timerProgress = Math.max(0, Math.min(1, remainingSeconds / CHALLENGE_TIME_LIMIT));
  const timerHex = timerUrgent ? "#FF8DA1" : timerWarning ? "#FFE29A" : "#9FF5E8";

  if (isLoading) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="h-16 w-full animate-pulse" style={{ background: "rgba(255,255,255,.05)", borderRadius: 18 }} />
          <div className="h-3 w-full animate-pulse rounded-full" style={{ background: "rgba(255,255,255,.05)" }} />
          <div className="h-80 animate-pulse" style={{ background: "rgba(255,255,255,.05)", borderRadius: 24 }} />
        </div>
      </PageShell>
    );
  }

  if (!fetchError && data && (!challenge || questions.length === 0)) {
    return (
      <PageShell center>
        <div className="max-w-md w-full p-10 flex flex-col items-center text-center gap-4" style={cardStyle("#9FD8FF", 24)}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid #9FD8FF", boxShadow: `0 0 12px ${halo("#9FD8FF", 0.4)}` }}
          >
            <Target className="w-7 h-7" style={{ color: "#9FD8FF" }} />
          </div>
          <div className="space-y-1">
            <div role="heading" aria-level={2} className="text-xl font-extrabold text-white">
              {isAf ? "Uitdaging kom binnekort" : "Challenge coming soon"}
            </div>
            <p className="text-sm text-white max-w-sm mx-auto" style={{ opacity: 0.92 }}>
              {isAf
                ? "Geen vrae beskikbaar nie. Kies vakke in Instellings en probeer môre weer."
                : "No questions available. Pick your subjects in Settings and check back tomorrow."}
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Link href="/settings">
              <button
                className="px-5 py-2.5 text-sm transition-all"
                style={primaryBtnStyle}
                onMouseEnter={(e) => primaryHover(e, true)}
                onMouseLeave={(e) => primaryHover(e, false)}
              >
                {isAf ? "Instellings" : "Settings"}
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-5 py-2.5 text-sm hover:bg-white/5 transition-colors" style={secondaryBtnStyle()}>
                Dashboard
              </button>
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  if (fetchError) {
    const is503 = fetchError.message?.startsWith("503");

    if (is503) {
      return (
        <PageShell>
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="p-10 flex flex-col items-center text-center gap-4" style={cardStyle("#FFE29A", 24)} data-testid="daily-challenge-not-ready">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid #FFE29A", boxShadow: `0 0 12px ${halo("#FFE29A", 0.4)}` }}
              >
                <Target className="w-7 h-7" style={{ color: "#FFE29A" }} />
              </div>
              <div className="space-y-2">
                <div role="heading" aria-level={2} className="text-xl font-extrabold text-white">
                  {isAf ? "Vrae word nog voorberei" : "Questions aren't ready yet"}
                </div>
                <p className="text-sm text-white max-w-md" style={{ opacity: 0.92 }}>
                  {isAf
                    ? "Kies jou vakke in Instellings sodat ons 'n gepersonaliseerde daaglikse uitdaging vir jou kan skep."
                    : "Select your subjects in Settings so we can build a personalised Daily Challenge just for you."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm hover:bg-white/5 transition-colors disabled:opacity-60"
                  style={secondaryBtnStyle("#9FF5E8", "#9FF5E8")}
                  data-testid="button-retry-challenge"
                  onClick={() => refetchChallenge()}
                  disabled={isRefetching}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
                  {isAf ? "Probeer weer" : "Try Again"}
                </button>
                <Link href="/settings">
                  <button
                    className="px-5 py-2.5 text-sm transition-all"
                    style={primaryBtnStyle}
                    onMouseEnter={(e) => primaryHover(e, true)}
                    onMouseLeave={(e) => primaryHover(e, false)}
                    data-testid="button-go-to-settings"
                  >
                    {isAf ? "Gaan na Instellings" : "Go to Settings"}
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button className="px-5 py-2.5 text-sm hover:bg-white/5 transition-colors" style={secondaryBtnStyle()} data-testid="button-back-to-dashboard-503">
                    {isAf ? "Terug na Dashboard" : "Back to Dashboard"}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="p-10 flex flex-col items-center text-center gap-4" style={cardStyle("#FF8DA1", 24)} data-testid="daily-challenge-error">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid #FF8DA1", boxShadow: `0 0 12px ${halo("#FF8DA1", 0.4)}` }}
            >
              <AlertCircle className="w-7 h-7" style={{ color: "#FF8DA1" }} />
            </div>
            <div className="space-y-1">
              <div role="heading" aria-level={2} className="text-xl font-extrabold text-white">
                {isAf ? "Kon nie vandag se uitdaging laai nie" : "Couldn't load today's challenge"}
              </div>
              <p className="text-sm text-white max-w-md" style={{ opacity: 0.92 }}>
                {isAf
                  ? "Ons kon nie aan die bediener koppel nie. Kyk jou internetverbinding en probeer weer."
                  : "We couldn't reach the server. Check your connection and try again."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => refetchChallenge()}
                disabled={isRefetching}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm transition-all disabled:opacity-60"
                style={primaryBtnStyle}
                onMouseEnter={(e) => primaryHover(e, true)}
                onMouseLeave={(e) => primaryHover(e, false)}
                data-testid="button-retry-daily-challenge"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
                {isRefetching ? (isAf ? "Probeer..." : "Retrying...") : (isAf ? "Probeer Weer" : "Try Again")}
              </button>
              <Link href="/dashboard">
                <button className="px-5 py-2.5 text-sm hover:bg-white/5 transition-colors" style={secondaryBtnStyle()} data-testid="button-back-to-dashboard">
                  {isAf ? "Terug na Dashboard" : "Back to Dashboard"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (timeUpNoAnswers && !showResults && !isCompleted) {
    return (
      <PageShell center>
        <div className="max-w-md w-full p-10 flex flex-col items-center text-center gap-4" style={cardStyle("#FFE29A", 24)} data-testid="daily-challenge-time-up">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid #FFE29A", boxShadow: `0 0 12px ${halo("#FFE29A", 0.4)}` }}
          >
            <Clock className="w-7 h-7" style={{ color: "#FFE29A" }} />
          </div>
          <div className="space-y-2">
            <div role="heading" aria-level={2} className="text-xl font-extrabold text-white" data-testid="text-time-up-title">
              {isAf ? "Tyd is op!" : "Time's up!"}
            </div>
            <p className="text-sm text-white max-w-sm mx-auto" style={{ opacity: 0.92 }}>
              {isAf
                ? "Die 5 minute is verby en jy het nog nie 'n antwoord gekies nie. Geen probleem nie — probeer môre weer met 'n vars uitdaging."
                : "The 5 minutes ran out before you picked any answers. No worries — come back tomorrow for a fresh challenge."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link href="/dashboard">
              <button
                className="px-5 py-2.5 text-sm transition-all"
                style={primaryBtnStyle}
                onMouseEnter={(e) => primaryHover(e, true)}
                onMouseLeave={(e) => primaryHover(e, false)}
                data-testid="button-time-up-dashboard"
              >
                {isAf ? "Terug na Dashboard" : "Back to Dashboard"}
              </button>
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const today = new Date();
  const dayLabel = formatDate(today, isAf ? "af" : "en", { weekday: "long" });
  const dateLabel = formatDate(today, isAf ? "af" : "en", { day: "numeric", month: "short" });

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}
    >
      {/* ── Sticky street header ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,.08)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/dashboard">
                <button
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 shrink-0"
                  style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
                  title={isAf ? "Tuis" : "Home"}
                  data-testid="button-home"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <Home className="w-4 h-4 hidden sm:block" />
                </button>
              </Link>
              <div className="min-w-0">
                <span className="block truncate" style={marker("#9FF5E8")} data-testid="text-page-title">
                  {isAf ? "Daaglikse uitdaging" : "Daily Challenge"}
                </span>
                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.18em] text-white" style={{ opacity: 0.85 }}>
                  {dayLabel} · {dateLabel}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid #FFE29A" }}
                data-testid="text-challenge-streak"
                title={isAf ? "Reeks" : "Streak"}
              >
                <Flame className="w-4 h-4" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 4px #FFE29A)" }} />
                <span className="text-sm font-extrabold tabular-nums" style={{ color: "#FFE29A" }}>
                  {streak}
                  <span className="hidden sm:inline">&nbsp;{isAf ? "dae" : "days"}</span>
                </span>
              </div>
              {!showResults && !isCompleted && (
                <div
                  className="relative flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full transition-colors"
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: `1px solid ${timerHex}`,
                    ...(timerUrgent ? { animation: "bt-glowpulse 1.2s ease-in-out infinite" } : {}),
                  }}
                  data-testid="text-challenge-timer"
                  title={isAf ? "Tyd oor" : "Time left"}
                >
                  <div className="relative w-5 h-5">
                    <svg className="absolute inset-0 w-5 h-5 -rotate-90" viewBox="0 0 20 20" aria-hidden="true">
                      <circle cx="10" cy="10" r="8" fill="none" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="2" />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke={timerHex}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 8}
                        strokeDashoffset={2 * Math.PI * 8 * (1 - timerProgress)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <Clock className="absolute inset-0 m-auto w-2.5 h-2.5" style={{ color: timerHex }} />
                  </div>
                  <span className="text-sm font-extrabold tabular-nums" style={{ color: timerHex }}>
                    {formatCountdown(remainingSeconds)}
                  </span>
                </div>
              )}
              <button
                onClick={toggleLanguage}
                className="px-3 py-2 rounded-xl bg-white/[.03] text-xs font-extrabold hover:bg-white/10"
                style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }}
                data-testid="button-language-toggle"
                title={isAf ? "Taal" : "Language"}
              >
                {language === "en" ? "EN" : "AF"}
              </button>
              <button
                onClick={() => logout()}
                className="inline-flex items-center px-3 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10"
                style={{ color: "#FFB7E5", border: "1.5px solid #FFB7E5" }}
                title={isAf ? "Uitteken" : "Sign Out"}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Ambient pastel auras */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-32 w-[380px] h-[380px] rounded-full blur-[120px] opacity-40"
          style={{ background: "#9FF5E8" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-56 -right-32 w-[340px] h-[340px] rounded-full blur-[120px] opacity-30"
          style={{ background: "#FFB7E5" }}
        />

        {showResults ? (
          <ResultsView
            questions={displayQuestions}
            selectedAnswers={selectedAnswers}
            correctCount={correctCount}
            totalQuestions={displayQuestions.length}
            timeSpent={challenge?.timeSpentSeconds ?? (CHALLENGE_TIME_LIMIT - remainingSeconds)}
            streak={streak}
            isAf={isAf}
            history={historyData?.history || []}
          />
        ) : (
          <>
            {/* Stepper rail */}
            <div className="relative flex items-center gap-1.5" data-testid="progress-dots" style={{ animation: "bt-fadeup .5s both" }}>
              {questions.map((_, i) => {
                const answered = selectedAnswers[i] !== null;
                const isCurrent = i === currentQuestion;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className="relative h-2.5 min-h-0 p-0 flex-1 rounded-full transition-all duration-300 border-0"
                    style={
                      isCurrent
                        ? { background: RAINBOW_GRADIENT, boxShadow: "0 0 12px rgba(159,245,232,.6)" }
                        : answered
                        ? { background: "#9FF5E8", opacity: 0.7 }
                        : { background: "rgba(255,255,255,.1)" }
                    }
                    data-testid={`button-progress-${i}`}
                    aria-label={`${isAf ? "Vraag" : "Question"} ${i + 1}${answered ? ` (${isAf ? "beantwoord" : "answered"})` : ""}`}
                  />
                );
              })}
            </div>

            <div className="relative flex items-center justify-between gap-3" data-testid="text-question-counter">
              <span className="text-sm font-bold text-white">
                {isAf ? "Vraag" : "Question"}{" "}
                <span style={{ color: "#9FF5E8" }}>{currentQuestion + 1}</span>
                <span className="text-white" style={{ opacity: 0.85 }}>/{questions.length}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white hidden sm:inline" style={{ opacity: 0.85 }}>
                  {answeredCount}/{questions.length} {isAf ? "beantwoord" : "answered"}
                </span>
                <span
                  className="text-xs font-extrabold px-3 py-1 rounded-full"
                  style={{ color: "#C5B3FF", background: "rgba(255,255,255,.03)", border: "1px solid #C5B3FF" }}
                >
                  {isAf ? questions[currentQuestion]?.subjectAf || questions[currentQuestion]?.subject : questions[currentQuestion]?.subject}
                </span>
              </div>
            </div>

            {/* Question card */}
            <div className="relative overflow-hidden" style={{ ...cardStyle(undefined, 24), animation: "bt-fadeup .5s .05s both" }}>
              {/* Rainbow top stripe */}
              <div className="absolute top-0 inset-x-0 h-1" style={{ background: RAINBOW_GRADIENT }} aria-hidden="true" />
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0"
                    style={{ background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508" }}
                  >
                    {currentQuestion + 1}
                  </div>
                  <div
                    role="heading"
                    aria-level={2}
                    className="text-xl font-bold text-white leading-relaxed min-w-0 flex-1 break-words whitespace-pre-wrap"
                    data-testid="text-question"
                  >
                    {isAf ? questions[currentQuestion]?.questionAf || questions[currentQuestion]?.question : questions[currentQuestion]?.question}
                  </div>
                </div>

                <div className="space-y-3">
                  {(isAf
                    ? questions[currentQuestion]?.optionsAf || questions[currentQuestion]?.options
                    : questions[currentQuestion]?.options
                  )?.map((option: string, i: number) => {
                    const isSelected = selectedAnswers[currentQuestion] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectAnswer(i)}
                        className="w-full min-h-0 text-left p-4 transition-all duration-200 font-semibold text-base"
                        style={{
                          borderRadius: 18,
                          background: isSelected ? halo("#9FF5E8", 0.08) : "rgba(255,255,255,.03)",
                          border: isSelected ? "2px solid #9FF5E8" : "2px solid rgba(255,255,255,.08)",
                          boxShadow: isSelected ? `0 0 18px ${halo("#9FF5E8", 0.25)}` : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.border = "2px solid rgba(159,245,232,.5)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.border = "2px solid rgba(255,255,255,.08)";
                        }}
                        data-testid={`button-option-${i}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 mt-0.5 transition-colors"
                            style={
                              isSelected
                                ? { background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508" }
                                : { background: "rgba(255,255,255,.06)", color: "#ffffff" }
                            }
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-white min-w-0 flex-1 break-words whitespace-pre-wrap leading-snug pt-1">
                            {option}
                          </span>
                          {isSelected && <Check className="w-5 h-5 shrink-0 mt-1.5" style={{ color: "#9FF5E8" }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="inline-flex items-center px-5 py-2.5 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
                style={secondaryBtnStyle()}
                data-testid="button-prev-question"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> {isAf ? "Vorige" : "Previous"}
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || answeredCount < questions.length}
                  className="inline-flex items-center px-8 py-2.5 text-sm transition-all disabled:opacity-60"
                  style={primaryBtnStyle}
                  onMouseEnter={(e) => primaryHover(e, true)}
                  onMouseLeave={(e) => primaryHover(e, false)}
                  data-testid="button-submit-challenge"
                >
                  {submitMutation.isPending ? (isAf ? "Dien in..." : "Submitting...") : isAf ? "Dien in" : "Submit"}
                  <Sparkles className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  className="inline-flex items-center px-5 py-2.5 text-sm transition-all"
                  style={primaryBtnStyle}
                  onMouseEnter={(e) => primaryHover(e, true)}
                  onMouseLeave={(e) => primaryHover(e, false)}
                  data-testid="button-next-question"
                >
                  {isAf ? "Volgende" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function ResultsView({
  questions,
  selectedAnswers,
  correctCount,
  totalQuestions,
  timeSpent,
  streak,
  isAf,
  history,
}: {
  questions: DailyChallengeQuestion[];
  selectedAnswers: (number | null)[];
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  streak: number;
  isAf: boolean;
  history: DailyChallenge[];
}) {
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [nextIn, setNextIn] = useState("");

  // Countdown to tomorrow at 00:00 local time
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setNextIn(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  const getGrade = () => {
    if (percentage >= 90) return { label: "Outstanding!", labelAf: "Uitstekend!", hex: "#FFE29A", icon: Trophy, hype: "You smashed it! 🔥", hypeAf: "Jy het dit verpletter! 🔥" };
    if (percentage >= 70) return { label: "Great job!", labelAf: "Goeie werk!", hex: "#94F7C5", icon: Star, hype: "Let's get it!", hypeAf: "Kom ons doen dit!" };
    if (percentage >= 50) return { label: "Good effort!", labelAf: "Goeie poging!", hex: "#9FD8FF", icon: Target, hype: "Progress not perfection", hypeAf: "Vordering bo perfeksie" };
    return { label: "Keep trying!", labelAf: "Hou aan!", hex: "#FF8DA1", icon: Zap, hype: "Small steps BIG results", hypeAf: "Klein treë GROOT resultate" };
  };

  const grade = getGrade();
  const GradeIcon = grade.icon;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // XP estimate (matches server logic: 10 base + 20 per correct)
  const xpEarned = 10 + correctCount * 20;

  return (
    <div className="relative space-y-6">
      {/* Trophy hero */}
      <div
        className="relative overflow-hidden"
        style={{ ...cardStyle(grade.hex, 26), animation: "bt-fadeup .5s both" }}
      >
        <div className="absolute top-0 inset-x-0 h-1" style={{ background: RAINBOW_GRADIENT }} aria-hidden="true" />
        <div className="p-8 text-center space-y-4 relative">
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-40 h-40 blur-3xl rounded-full -mr-10 -mt-10 opacity-30"
            style={{ background: grade.hex }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-32 h-32 blur-3xl rounded-full -ml-10 -mb-10 opacity-20"
            style={{ background: "#C5B3FF" }}
          />
          <div className="relative">
            <div
              className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center"
              style={{
                background: "rgba(5,5,8,.6)",
                border: `1.5px solid ${grade.hex}`,
                boxShadow: `0 0 24px ${halo(grade.hex, 0.35)}`,
                animation: "bt-float 3s ease-in-out infinite",
              }}
            >
              <GradeIcon className="w-10 h-10" style={{ color: grade.hex, filter: `drop-shadow(0 0 8px ${grade.hex})` }} />
            </div>
            <div
              role="heading"
              aria-level={2}
              className="text-4xl font-black mt-4"
              style={rainbowText}
              data-testid="text-result-grade"
            >
              {isAf ? grade.labelAf : grade.label}
            </div>
            <span className="block mt-2" style={marker(grade.hex, 16)}>
              {isAf ? grade.hypeAf : grade.hype}
            </span>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="text-center" data-testid="text-result-score">
                <p className="text-5xl font-black text-white tabular-nums" style={{ textShadow: `0 0 16px ${halo(grade.hex, 0.4)}` }}>
                  {correctCount}/{totalQuestions}
                </p>
                <p className="text-sm font-bold text-white">{isAf ? "Korrek" : "Correct"}</p>
              </div>
              <div className="w-px h-12" style={{ background: "rgba(255,255,255,.2)" }} />
              <div className="text-center" data-testid="text-result-percentage">
                <p className="text-5xl font-black text-white tabular-nums" style={{ textShadow: `0 0 16px ${halo(grade.hex, 0.4)}` }}>
                  {percentage}%
                </p>
                <p className="text-sm font-bold text-white">{isAf ? "Telling" : "Score"}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid #9FD8FF" }}
              >
                <Clock className="w-4 h-4" style={{ color: "#9FD8FF" }} />
                <span className="text-sm font-bold text-white tabular-nums">{formatTime(timeSpent)}</span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid #FFE29A" }}
              >
                <Flame className="w-4 h-4" style={{ color: "#FFE29A" }} />
                <span className="text-sm font-bold text-white">
                  {streak} {isAf ? "dae reeks" : "day streak"}
                </span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid #FFB7E5" }}
              >
                <Sparkles className="w-4 h-4" style={{ color: "#FFB7E5" }} />
                <span className="text-sm font-bold text-white">+{xpEarned} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next challenge unlock */}
      <div style={{ ...cardStyle(undefined, 20), animation: "bt-fadeup .5s .05s both" }} data-testid="card-next-challenge">
        <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid #9FF5E8" }}
            >
              <Calendar className="w-5 h-5" style={{ color: "#9FF5E8" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {isAf ? "Volgende uitdaging" : "Next challenge"}
              </p>
              <p className="text-xs text-white" style={{ opacity: 0.9 }}>
                {isAf ? "Ontsluit oor" : "Unlocks in"}{" "}
                <span className="font-bold tabular-nums" style={{ color: "#9FF5E8" }}>{nextIn}</span>
              </p>
            </div>
          </div>
          <Link href="/dashboard">
            <button
              className="px-4 py-2 text-sm hover:bg-white/5 transition-colors"
              style={secondaryBtnStyle("#9FD8FF", "#9FD8FF")}
              data-testid="button-back-home"
            >
              Dashboard
            </button>
          </Link>
        </div>
      </div>

      {/* 14-day streak strip */}
      {history.length > 0 && (
        <div className="space-y-3" style={{ animation: "bt-fadeup .5s .1s both" }}>
          <div role="heading" aria-level={3} className="text-lg font-extrabold text-white px-1 flex items-center gap-2" data-testid="text-history-heading">
            <Flame className="w-5 h-5" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 4px #FFE29A)" }} />
            {isAf ? (
              <>
                Jou <span style={rainbowText}>reeks</span>
              </>
            ) : (
              <>
                Your <span style={rainbowText}>streak</span>
              </>
            )}
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: 14 }).map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (13 - i));
              const dateStr = date.toISOString().split("T")[0];
              const entry = history.find((h) => h.challengeDate === dateStr);
              const completed = !!entry?.completedAt;
              const score = entry?.score ?? 0;
              const total = entry?.totalQuestions ?? 5;
              const isToday = i === 13;

              const dayHex = completed
                ? score === total
                  ? "#94F7C5"
                  : score >= total / 2
                  ? "#9FD8FF"
                  : "#FFE29A"
                : isToday
                ? "#9FF5E8"
                : null;

              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-center p-1 transition-transform ${
                    isToday ? "scale-110" : ""
                  }`}
                  style={{
                    background: dayHex ? halo(dayHex, 0.08) : "rgba(255,255,255,.03)",
                    border: dayHex ? `2px solid ${halo(dayHex, 0.5)}` : "2px solid rgba(255,255,255,.08)",
                    ...(isToday && dayHex ? { boxShadow: `0 0 14px ${halo(dayHex, 0.35)}` } : {}),
                  }}
                  data-testid={`history-day-${i}`}
                  title={formatDate(date, isAf ? "af" : "en", { weekday: "long", day: "numeric", month: "short" })}
                >
                  <span className="text-[9px] font-bold text-white" style={{ opacity: 0.85 }}>
                    {formatDate(date, isAf ? "af" : "en", { weekday: "short" }).slice(0, 2)}
                  </span>
                  {completed ? (
                    <span className="text-base font-extrabold text-white tabular-nums">{score}</span>
                  ) : (
                    <span className="text-base text-white" style={{ opacity: 0.85 }}>—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review answers */}
      <div
        role="heading"
        aria-level={3}
        className="text-lg font-extrabold text-white px-1"
        style={{ animation: "bt-fadeup .5s .15s both" }}
        data-testid="text-review-heading"
      >
        {isAf ? (
          <>
            Hersien jou <span style={rainbowText}>antwoorde</span>
          </>
        ) : (
          <>
            Review your <span style={rainbowText}>answers</span>
          </>
        )}
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const isCorrect = selectedAnswers[i] === q.correctIndex;
          const isExpanded = expandedQ === i;
          const options = isAf ? q.optionsAf || q.options : q.options;
          const rowHex = isCorrect ? "#94F7C5" : "#FF8DA1";

          return (
            <div
              key={i}
              className="overflow-hidden transition-all"
              style={{
                background: "rgba(255,255,255,.03)",
                border: `1.5px solid ${halo(rowHex, 0.45)}`,
                borderRadius: 20,
              }}
            >
              <div className="p-5 space-y-3">
                <button
                  onClick={() => setExpandedQ(isExpanded ? null : i)}
                  className="min-h-0 p-0 w-full text-left flex items-start gap-3 border-0 bg-transparent"
                  data-testid={`button-review-question-${i}`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: rowHex, boxShadow: `0 0 12px ${halo(rowHex, 0.4)}` }}
                  >
                    {isCorrect ? <Check className="w-4 h-4" style={{ color: "#050508" }} /> : <X className="w-4 h-4" style={{ color: "#050508" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm leading-snug break-words">
                      {isAf ? q.questionAf || q.question : q.question}
                    </p>
                    <p className="text-xs mt-1" style={{ color: rowHex }}>{isAf ? q.subjectAf || q.subject : q.subject}</p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-white shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>

                {isExpanded && (
                  <div className="space-y-2 pl-11">
                    {options?.map((opt: string, j: number) => {
                      const isAnswer = j === q.correctIndex;
                      const wasSelected = j === selectedAnswers[i];
                      return (
                        <div
                          key={j}
                          className="text-sm p-2.5 font-medium text-white"
                          style={{
                            borderRadius: 12,
                            background: isAnswer
                              ? halo("#94F7C5", 0.1)
                              : wasSelected && !isAnswer
                              ? halo("#FF8DA1", 0.1)
                              : "rgba(255,255,255,.03)",
                            border: isAnswer
                              ? `1px solid ${halo("#94F7C5", 0.5)}`
                              : wasSelected && !isAnswer
                              ? `1px solid ${halo("#FF8DA1", 0.5)}`
                              : "1px solid rgba(255,255,255,.08)",
                          }}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + j)}.</span>
                          {opt}
                          {isAnswer && <Check className="w-3.5 h-3.5 inline ml-1.5" style={{ color: "#94F7C5" }} />}
                          {wasSelected && !isAnswer && <X className="w-3.5 h-3.5 inline ml-1.5" style={{ color: "#FF8DA1" }} />}
                        </div>
                      );
                    })}
                    {!isCorrect && options?.[q.correctIndex] !== undefined && (
                      <div
                        className="p-3 flex items-center gap-2 mt-2"
                        style={{
                          borderRadius: 12,
                          border: `1px solid ${halo("#94F7C5", 0.5)}`,
                          background: halo("#94F7C5", 0.1),
                        }}
                        data-testid={`callout-correct-answer-${i}`}
                      >
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#94F7C5" }} />
                        <p className="text-sm font-bold text-white">
                          {isAf ? "Korrekte antwoord:" : "Correct answer:"}{" "}
                          <span style={{ color: "#94F7C5" }}>{String.fromCharCode(65 + q.correctIndex)}</span>
                          <span className="font-normal"> — {options[q.correctIndex]}</span>
                        </p>
                      </div>
                    )}
                    {q.explanation && (
                      <div
                        className="p-3 mt-2"
                        style={{
                          borderRadius: 12,
                          background: halo("#9FD8FF", 0.08),
                          border: `1px solid ${halo("#9FD8FF", 0.4)}`,
                        }}
                      >
                        <p className="text-xs font-semibold text-white leading-relaxed">
                          {isAf ? q.explanationAf || q.explanation : q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
