import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, ShieldAlert, CheckCircle2, XCircle, Coins, Loader2, RotateCcw, Trophy, ChevronRight, Clock, AlertCircle, Sparkles, Flame, Target, Award, Play } from "lucide-react";
import { apiRequest, queryClient as globalQueryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BoostPackProps {
  subjectId: number;
  subjectName: string;
  isAf: boolean;
  topicFocus?: string;
  autoStart?: boolean;
}

type QuizState = "idle" | "loading" | "quiz" | "results" | "error" | "coming_soon";

interface QuizQuestion {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  topic: string;
  explanation: string;
}

interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  coinsEarned: number;
  results: {
    questionId: number;
    question: string;
    selected: string | null;
    correct: boolean;
    correctAnswer: string;
    explanation: string;
    topic: string;
  }[];
}

export function SubjectBoostPack({ subjectId, subjectName, isAf, topicFocus, autoStart }: BoostPackProps) {
  const { toast } = useToast();
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const quizStartTimeRef = useRef<number>(Date.now());

  const { data: boostStatus } = useQuery<{ isBoosted: boolean }>({
    queryKey: [`/api/subjects/${subjectId}/boost`],
  });

  const { data: quizData, isLoading: quizLoading, error: quizError } = useQuery<{ questions: QuizQuestion[]; subjectName: string; comingSoon?: boolean }>({
    queryKey: [`/api/subjects/${subjectId}/boost/quiz`, isAf ? "af" : "en", difficulty, topicFocus ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams({ lang: isAf ? "af" : "en", difficulty });
      if (topicFocus) params.set("topicFocus", topicFocus);
      const r = await fetch(`/api/subjects/${subjectId}/boost/quiz?${params}`, { credentials: "include" });
      if (!r.ok) throw new Error(`Quiz load failed: ${r.status}`);
      return r.json();
    },
    enabled: quizStarted,
    staleTime: Infinity,
  });

  const boostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/subjects/${subjectId}/boost`, {});
      return res.json();
    },
    onSuccess: () => {
      globalQueryClient.invalidateQueries({ queryKey: [`/api/subjects/${subjectId}/boost`] });
      toast({
        title: isAf ? "Boost is aan!" : "Boost Activated!",
        description: isAf
          ? `${subjectName} Boost Pack werk nou vir jou.`
          : `${subjectName} Boost Pack is now active.`,
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (submittedAnswers: { questionId: number; selected: string }[]) => {
      const res = await apiRequest("POST", `/api/subjects/${subjectId}/boost/quiz/submit`, { answers: submittedAnswers, questions });
      return res.json() as Promise<QuizResult>;
    },
    onSuccess: (data) => {
      setQuizResult(data);
      setQuizState("results");
      globalQueryClient.invalidateQueries({ queryKey: ["/api/user/coins"] });
      globalQueryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      globalQueryClient.invalidateQueries({ queryKey: ["/api/mastery/weak-topics"] });
      globalQueryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      const invalidateProgress = () => {
        globalQueryClient.invalidateQueries({ queryKey: ["/api/learner/goals"] });
        globalQueryClient.invalidateQueries({ queryKey: ["/api/learner/readiness"] });
        globalQueryClient.invalidateQueries({ queryKey: ["/api/learner/today-directive"] });
      };
      if (sessionIdRef.current !== null) {
        apiRequest("PATCH", `/api/study-sessions/${sessionIdRef.current}/end`, {
          questionsAnswered: data.total,
        }).then(invalidateProgress).catch(invalidateProgress);
        sessionIdRef.current = null;
      } else {
        invalidateProgress();
      }
    },
    onError: () => {
      toast({
        title: isAf ? "Fout" : "Error",
        description: isAf ? "Kon nie vasvra indien nie. Probeer weer." : "Could not submit quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const questions: QuizQuestion[] = quizData?.questions ?? [];

  useEffect(() => {
    if (quizState !== "loading") return;
    if (!quizData) return;
    if (questions.length > 0) {
      setQuizState("quiz");
    } else if (quizData.comingSoon) {
      setQuizState("coming_soon");
    } else {
      setQuizState("error");
    }
  }, [quizData, quizState, questions.length]);

  useEffect(() => {
    if (quizState !== "loading") return;
    if (quizError) {
      setQuizState("error");
    }
  }, [quizError, quizState]);

  const handleRetryGeneration = () => {
    setQuizState("loading");
    globalQueryClient.invalidateQueries({
      queryKey: [`/api/subjects/${subjectId}/boost/quiz`, isAf ? "af" : "en", difficulty, topicFocus ?? "all"],
    });
  };

  useEffect(() => {
    if (quizState !== "quiz" || !countdownEnabled || answerSubmitted) return;
    setTimeLeft(30);
    if (timerRef.current) clearInterval(timerRef.current);
    const qs = quizData?.questions ?? [];
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          const currentQ = qs[currentIndex];
          if (currentQ) {
            setAnswers(prev => {
              if (!prev[currentQ.id]) {
                return { ...prev, [currentQ.id]: "" };
              }
              return prev;
            });
            setAnswerSubmitted(true);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, quizState, countdownEnabled, answerSubmitted, quizData]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setQuizState("loading");
    setAnswers({});
    setCurrentIndex(0);
    setQuizResult(null);
    setTimeLeft(30);
    quizStartTimeRef.current = Date.now();
    apiRequest("POST", "/api/study-sessions/start", { subjectId, context: "boost_quiz" })
      .then(r => r.json())
      .then((session: { sessionId: number }) => { sessionIdRef.current = session.sessionId; })
      .catch(() => {});
  };

  useEffect(() => {
    if (autoStart) handleStartQuiz();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectOption = (label: string) => {
    if (answerSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: label }));
    setAnswerSubmitted(true);
  };

  const handleJumpToQuestion = (index: number) => {
    if (index === currentIndex) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const targetQ = questions[index];
    const alreadyAnswered = targetQ && answers[targetQ.id] !== undefined;
    setCurrentIndex(index);
    setAnswerSubmitted(alreadyAnswered);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setAnswerSubmitted(false);
      setCurrentIndex(i => i + 1);
    }
  };

  const handleSubmit = () => {
    const submittedAnswers = questions.map(q => ({
      questionId: q.id,
      selected: answers[q.id] ?? "",
    }));
    submitMutation.mutate(submittedAnswers);
  };

  const handleReset = () => {
    setQuizState("idle");
    setQuizStarted(false);
    setAnswers({});
    setCurrentIndex(0);
    setQuizResult(null);
    setAnswerSubmitted(false);
  };

  // Shared glass-card shell used across every state of the Daily Quiz
  const glassShell =
    "relative overflow-hidden rounded-2xl border border-white/10 bg-[#050508] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent";

  if (quizState === "idle" && !quizStarted) {
    const DIFFICULTY_OPTIONS: {
      key: "easy" | "medium" | "hard";
      en: string;
      af: string;
      hint_en: string;
      hint_af: string;
      tone: string;
      activeRing: string;
      iconBg: string;
    }[] = [
      { key: "easy",   en: "Easy",   af: "Maklik",  hint_en: "Warm up",      hint_af: "Warm op",       tone: "emerald", activeRing: "ring-emerald-400/70 from-emerald-500/30 to-emerald-400/10", iconBg: "bg-emerald-500/20 text-emerald-300" },
      { key: "medium", en: "Medium", af: "Matig",   hint_en: "Recommended",  hint_af: "Aanbeveel",     tone: "amber",   activeRing: "ring-amber-400/70 from-amber-500/30 to-amber-400/10",       iconBg: "bg-amber-500/20 text-amber-300" },
      { key: "hard",   en: "Hard",   af: "Moeilik", hint_en: "Push yourself",hint_af: "Daag jouself",  tone: "rose",    activeRing: "ring-rose-400/70 from-rose-500/30 to-rose-400/10",         iconBg: "bg-rose-500/20 text-rose-300" },
    ];
    return (
      <div className={glassShell} data-testid="boost-quiz-idle">
        {/* Aurora hero glow */}
        <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative p-6 sm:p-7 space-y-6">
          {/* Hero */}
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 blur-md opacity-70" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center">
                <Zap className="w-7 h-7 text-white drop-shadow" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {isAf ? "Daaglikse Vasvra" : "Daily Quiz"}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-400/20 border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground">
                  <Sparkles className="w-3 h-3" />
                  {isAf ? "Nuut Vandag" : "New Today"}
                </span>
              </div>
              <p className="text-sm text-white mt-1 leading-relaxed">
                {isAf
                  ? `10 vinnige KABV-vrae uit ${subjectName}. Bewys jou bemeestering en verdien munte.`
                  : `10 quick CAPS questions from ${subjectName}. Prove your mastery and earn coins.`}
              </p>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex flex-col items-center gap-1">
              <Target className="w-4 h-4 text-violet-300" />
              <p className="text-base font-bold text-foreground tabular-nums">10</p>
              <p className="text-[10px] uppercase tracking-wider text-white">{isAf ? "Vrae" : "Questions"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex flex-col items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <p className="text-base font-bold text-foreground tabular-nums">+50</p>
              <p className="text-[10px] uppercase tracking-wider text-white">{isAf ? "Munte" : "Coins"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex flex-col items-center gap-1">
              <Clock className="w-4 h-4 text-cyan-300" />
              <p className="text-base font-bold text-foreground tabular-nums">~5m</p>
              <p className="text-[10px] uppercase tracking-wider text-white">{isAf ? "Tyd" : "Time"}</p>
            </div>
          </div>

          {/* Difficulty picker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white uppercase tracking-widest">
                {isAf ? "Moeilikheidsgraad" : "Difficulty"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {DIFFICULTY_OPTIONS.map(opt => {
                const active = difficulty === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setDifficulty(opt.key)}
                    className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                      active
                        ? `border-transparent ring-2 ${opt.activeRing} bg-gradient-to-br shadow-lg`
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                    data-testid={`difficulty-${opt.key}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${opt.iconBg}`}>
                      {opt.key === "easy" && <Sparkles className="w-3.5 h-3.5" />}
                      {opt.key === "medium" && <Target className="w-3.5 h-3.5" />}
                      {opt.key === "hard" && <Flame className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-sm font-bold text-foreground">{isAf ? opt.af : opt.en}</p>
                    <p className="text-[10px] text-white mt-0.5 leading-tight">
                      {isAf ? opt.hint_af : opt.hint_en}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Countdown toggle */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {isAf ? "Aftelmodus" : "Countdown mode"}
                </p>
                <p className="text-[11px] text-white">
                  {isAf ? "30 sekondes per vraag" : "30 seconds per question"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCountdownEnabled(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                countdownEnabled ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-muted"
              }`}
              data-testid="toggle-countdown"
              aria-pressed={countdownEnabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  countdownEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleStartQuiz}
            data-testid="button-start-boost-quiz"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            {isAf ? "Begin Vandag se Vasvra" : "Start Today's Quiz"}
          </Button>
        </div>
      </div>
    );
  }

  if (quizState === "loading") {
    return (
      <div className={glassShell}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-400/10" />
        <div className="relative py-12 px-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 blur-xl opacity-60 animate-pulse" />
            <Loader2 className="relative w-10 h-10 text-foreground animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {isAf ? "Ons berei jou vasvra voor" : "Building your quiz"}
            </p>
            <p className="text-xs text-white">
              {isAf ? "Laai amptelike KABV-vrae..." : "Loading official CAPS questions..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === "coming_soon") {
    return (
      <div className={glassShell} data-testid="boost-quiz-coming-soon">
        <div className="pointer-events-none absolute -top-20 -right-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative p-7 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-500/20 border border-white/10 flex items-center justify-center">
            <Clock className="w-7 h-7 text-cyan-300" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="text-lg font-bold text-foreground">
              {isAf ? "Binnekort beskikbaar" : "Coming soon"}
            </p>
            <p className="text-sm text-white leading-relaxed">
              {isAf
                ? topicFocus
                  ? `Ons berei nog KABV-vrae voor vir ${subjectName} — ${topicFocus}. Kyk binnekort weer.`
                  : `Ons berei nog amptelike KABV-vrae voor vir ${subjectName}. Kyk binnekort weer.`
                : topicFocus
                ? `We're still preparing CAPS questions for ${subjectName} — ${topicFocus}. Check back soon.`
                : `We're still preparing official CAPS questions for ${subjectName}. Check back soon.`}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            data-testid="button-coming-soon-back"
          >
            {isAf ? "Terug" : "Back"}
          </Button>
        </div>
      </div>
    );
  }

  if (quizState === "error") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-white/[0.02] to-transparent " data-testid="boost-quiz-error">
        <div className="pointer-events-none absolute -top-20 -right-10 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="relative p-7 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-rose-300" />
          </div>
          <div className="space-y-1.5">
            <p className="text-lg font-bold text-foreground">
              {isAf ? "Kon nie vrae genereer nie" : "Couldn't generate questions"}
            </p>
            <p className="text-sm text-white max-w-xs leading-relaxed">
              {isAf
                ? "Iets het kort gegaan terwyl ons jou vasvra opbou. Probeer asseblief weer."
                : "Something went wrong while building your quiz. Please try again."}
            </p>
          </div>
          <div className="flex gap-2 w-full max-w-xs">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={handleRetryGeneration}
              data-testid="button-retry-boost-quiz"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isAf ? "Probeer Weer" : "Try Again"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleReset}
              data-testid="button-cancel-boost-quiz"
            >
              {isAf ? "Kanselleer" : "Cancel"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === "quiz" && questions.length > 0) {
    const q = questions[currentIndex];
    const selected = answers[q.id];
    const isLast = currentIndex === questions.length - 1;
    const progressPct = ((currentIndex + 1) / questions.length) * 100;
    const allAnswered = Object.keys(answers).length === questions.length;
    const timerPct = (timeLeft / 30) * 100;
    const timerHot = timeLeft <= 8;
    const timerColor = timeLeft > 15 ? "from-emerald-400 to-emerald-500" : timeLeft > 8 ? "from-amber-300 to-amber-500" : "from-rose-400 to-rose-600";

    return (
      <div className={glassShell}>
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />

        {/* Sticky-feel header */}
        <div className="relative px-5 sm:px-6 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{isAf ? "Daaglikse Vasvra" : "Daily Quiz"}</p>
                <p className="text-[11px] text-white truncate">{subjectName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {countdownEnabled && !answerSubmitted && (
                <span
                  className={`flex items-center gap-1 text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg border ${
                    timerHot
                      ? "text-rose-200 bg-rose-500/20 border-rose-500/40 animate-pulse"
                      : "text-foreground bg-white/[0.05] border-white/10"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {timeLeft}s
                </span>
              )}
              <span className="text-xs font-semibold text-white font-mono tabular-nums px-2 py-1 rounded-lg bg-white/[0.03] border border-white/10">
                {currentIndex + 1}/{questions.length}
              </span>
            </div>
          </div>

          {/* Progress bars */}
          {countdownEnabled && !answerSubmitted && (
            <div className="relative h-1 w-full rounded-full bg-white/5 overflow-hidden mb-1.5">
              <div
                className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-1000 ease-linear`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          )}
          <div className="relative h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Question dots */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            {questions.map((question, idx) => {
              const answeredLabel = answers[question.id];
              const isAnswered = answeredLabel !== undefined && answeredLabel !== "";
              const isCorrect = isAnswered && answeredLabel === question.correctAnswer;
              const isWrong = isAnswered && answeredLabel !== question.correctAnswer;
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={question.id}
                  onClick={() => handleJumpToQuestion(idx)}
                  title={`${isAf ? "Vraag" : "Question"} ${idx + 1}${isCorrect ? ` — ${isAf ? "Korrek" : "Correct"}` : isWrong ? ` — ${isAf ? "Verkeerd" : "Incorrect"}` : ""}`}
                  className={`h-2 rounded-full transition-all flex-shrink-0 ${
                    isCurrent ? "w-6" : "w-2"
                  } ${
                    isCorrect
                      ? "bg-emerald-400"
                      : isWrong
                      ? "bg-rose-400"
                      : isCurrent
                      ? "bg-gradient-to-r from-violet-400 to-cyan-400"
                      : isAnswered
                      ? "bg-white/30"
                      : "bg-white/10"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="relative p-5 sm:p-6 space-y-5">
          {/* Topic + question */}
          <div className="space-y-2">
            {q.topic && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 border border-violet-500/25 px-2.5 py-0.5 text-[10px] font-bold text-violet-200 uppercase tracking-widest">
                <Target className="w-3 h-3" />
                {q.topic}
              </span>
            )}
            <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed" data-testid={`boost-question-${q.id}`}>
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid gap-2.5">
            {q.options.map(opt => {
              const isCorrect = opt.label === q.correctAnswer;
              const wasWrong = answerSubmitted && selected === opt.label && !isCorrect;
              const showCorrect = answerSubmitted && isCorrect;
              const isSelected = selected === opt.label && !answerSubmitted;

              return (
                <button
                  key={opt.label}
                  onClick={() => handleSelectOption(opt.label)}
                  disabled={answerSubmitted}
                  className={`group relative w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 overflow-hidden ${
                    showCorrect
                      ? "border-emerald-400/60 bg-emerald-500/15 text-foreground"
                      : wasWrong
                      ? "border-rose-400/60 bg-rose-500/15 text-foreground"
                      : isSelected
                      ? "border-violet-400/60 bg-gradient-to-r from-violet-500/20 to-cyan-400/15 font-semibold"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
                  } ${answerSubmitted ? "cursor-default" : "cursor-pointer"}`}
                  data-testid={`boost-option-${q.id}-${opt.label}`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                      showCorrect
                        ? "bg-emerald-500 text-white"
                        : wasWrong
                        ? "bg-rose-500 text-white"
                        : isSelected
                        ? "bg-gradient-to-br from-violet-500 to-cyan-400 text-white"
                        : "bg-white/[0.05] text-foreground border border-white/10 group-hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="flex-1 leading-snug text-foreground">{opt.text}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                  {wasWrong && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Correct-answer callout (when wrong) */}
          {answerSubmitted && selected && selected !== q.correctAnswer && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <span className="font-semibold text-emerald-200">
                  {isAf ? "Korrekte antwoord: " : "Correct answer: "}
                </span>
                <span className="font-bold text-foreground">{q.correctAnswer}</span>
                {q.options.find(o => o.label === q.correctAnswer) && (
                  <span className="text-white"> — {q.options.find(o => o.label === q.correctAnswer)!.text}</span>
                )}
              </div>
            </div>
          )}

          {/* Explanation */}
          {answerSubmitted && q.explanation && (
            <div className="relative rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/5 p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <p className="text-[11px] font-bold text-cyan-200 uppercase tracking-widest">
                  {isAf ? "Verduideliking" : "Explanation"}
                </p>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {q.explanation}
              </p>
            </div>
          )}

          {/* Footer actions */}
          {answerSubmitted ? (
            <div className="flex gap-2 pt-1">
              {!isLast && (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="flex-1"
                  data-testid="boost-button-next"
                >
                  {isAf ? "Volgende Vraag" : "Next Question"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {isLast && (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitMutation.isPending}
                  className="flex-1"
                  data-testid="boost-button-submit"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trophy className="w-4 h-4 mr-2" />
                  )}
                  {isAf ? "Indien Vasvra" : "Submit Quiz"}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-white text-center pt-1">
              {isAf ? "Kies 'n antwoord om voort te gaan" : "Select an answer to continue"}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (quizState === "results" && quizResult) {
    const { score, total, percentage, coinsEarned, results } = quizResult;

    const grade =
      percentage >= 80 ? { label_en: "Outstanding", label_af: "Uitstekend", from: "from-emerald-400", to: "to-cyan-400", icon: Award } :
      percentage >= 60 ? { label_en: "Solid Work",  label_af: "Goeie Werk", from: "from-violet-500",  to: "to-cyan-400", icon: Trophy } :
      percentage >= 40 ? { label_en: "Keep Pushing", label_af: "Hou Vol",   from: "from-amber-400",   to: "to-orange-500", icon: Flame } :
                         { label_en: "Try Again",   label_af: "Probeer Weer", from: "from-rose-500",  to: "to-fuchsia-500", icon: RotateCcw };
    const GradeIcon = grade.icon;

    return (
      <div className={glassShell} data-testid="boost-quiz-results">
        <div className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative p-6 sm:p-7 space-y-5">
          {/* Hero result */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${grade.from} ${grade.to} flex items-center justify-center`}>
              <GradeIcon className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-2xl font-bold text-foreground">
                {isAf ? grade.label_af : grade.label_en}
              </h3>
              <p className="text-sm text-white">
                {isAf ? "Vasvra Voltooi" : "Quiz Complete"}
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3.5 flex flex-col items-center gap-1">
              <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums" data-testid="boost-score-display">
                {score}<span className="text-base text-white">/{total}</span>
              </p>
              <p className="text-[10px] uppercase tracking-wider text-white">{isAf ? "Korrek" : "Correct"}</p>
            </div>
            <div className={`rounded-xl border bg-gradient-to-br ${grade.from} ${grade.to} bg-opacity-20 border-white/15 px-3 py-3.5 flex flex-col items-center gap-1 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/40" />
              <p className="relative text-2xl sm:text-3xl font-bold text-white tabular-nums" data-testid="boost-percentage-display">
                {percentage}%
              </p>
              <p className="relative text-[10px] uppercase tracking-wider text-white">{isAf ? "Telling" : "Score"}</p>
            </div>
            <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-3.5 flex flex-col items-center gap-1">
              <p className="text-2xl sm:text-3xl font-bold text-yellow-300 tabular-nums flex items-center gap-1" data-testid="boost-coins-display">
                <Coins className="w-5 h-5" />+{coinsEarned}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-white">{isAf ? "Munte" : "Coins"}</p>
            </div>
          </div>

          {/* Review */}
          <div>
            <p className="text-[11px] font-semibold text-white uppercase tracking-widest mb-2">
              {isAf ? "Hersien Antwoorde" : "Review Answers"}
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 -mr-1">
              {results.map((r, i) => (
                <div
                  key={r.questionId}
                  className={`p-3 rounded-xl border text-sm ${
                    r.correct
                      ? "border-emerald-400/25 bg-emerald-500/[0.07]"
                      : "border-rose-400/25 bg-rose-500/[0.07]"
                  }`}
                  data-testid={`boost-result-${r.questionId}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      r.correct ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                    }`}>
                      {r.correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-snug text-foreground">
                        <span className="text-white">{i + 1}.</span> {r.question}
                      </p>
                      {!r.correct && (
                        <p className="text-xs text-white mt-1.5">
                          {isAf ? "Korrek: " : "Correct: "}
                          <span className="font-semibold text-emerald-300">{r.correctAnswer}</span>
                        </p>
                      )}
                      {r.explanation && (
                        <p className="text-xs text-white mt-1.5 italic leading-relaxed">{r.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
            data-testid="boost-button-try-again"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isAf ? "Probeer môre weer" : "Try Again Tomorrow"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={glassShell}>
      <div className="relative py-8 px-6 flex flex-col items-center gap-3">
        <Zap className="w-7 h-7 text-violet-300" />
        <p className="text-sm text-white text-center">
          {isAf ? "Iets het skeefgeloop. Probeer weer." : "Something went wrong. Please try again."}
        </p>
        <Button size="sm" variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {isAf ? "Herlaai" : "Reset"}
        </Button>
      </div>
    </div>
  );
}

interface RescuePack {
  id?: number;
  titleEn?: string;
  titleAf?: string;
  messageEn?: string;
  messageAf?: string;
  data?: { referenceId?: number; type?: "topic" | "subject" } | null;
}

export function RescuePackAlert({ isAf }: { isAf: boolean }) {
  const { data: rescuePacks } = useQuery<RescuePack[]>({
    queryKey: ["/api/user/rescue-packs"],
  });

  // Gate on real activity: the rescue-packs payload itself carries no usable
  // activity signal (it is a raw notifications list), so we read the same
  // /api/user/stats the dashboard already fetches (shared query cache — no
  // extra request). A brand-new learner with zero answered questions and no
  // completed papers never sees this alert.
  const { data: stats } = useQuery<{
    studyStreak: number;
    accuracy: number;
    questionsAnswered: number;
    papersCompleted: number;
  }>({ queryKey: ["/api/user/stats"] });

  // Subject names for the "what dropped" copy — shared cache with the rest of
  // the app, no extra request in practice.
  const { data: allSubjects } = useQuery<Array<{ id: number; name: string; nameAfrikaans: string }>>({
    queryKey: ["/api/subjects"],
  });

  if (!rescuePacks || rescuePacks.length === 0) return null;
  const hasActivity = (stats?.questionsAnswered ?? 0) > 0 || (stats?.papersCompleted ?? 0) > 0;
  if (!hasActivity) return null;

  return (
    <div className="space-y-3">
      {rescuePacks.map((pack, idx) => {
        const isSubjectPack = pack.data?.type === "subject" && typeof pack.data?.referenceId === "number";
        const subj = isSubjectPack
          ? allSubjects?.find((s) => s.id === pack.data!.referenceId)
          : undefined;
        const subjName = subj ? (isAf ? subj.nameAfrikaans || subj.name : subj.name) : undefined;
        // Subject packs deep-link straight into that subject; topic/unknown
        // packs land on Exam Ready, where weak areas are surfaced.
        const href = isSubjectPack ? `/subject/${pack.data!.referenceId}` : "/exam-ready";
        const description = subjName
          ? (isAf
              ? `Jou punte in ${subjName} het gedaal — hierdie pakket bou die basiese beginsels vinnig weer op.`
              : `Your marks in ${subjName} dropped — this pack rebuilds the basics fast.`)
          : (isAf
              ? "Jou punte het onlangs gedaal — hierdie pakket bou die basiese beginsels vinnig weer op."
              : "Your marks dropped recently — this pack rebuilds the basics fast.");
        return (
          <div
            key={pack.id ?? idx}
            className="relative overflow-hidden"
            style={{
              background: "linear-gradient(#0e0d12, #0e0d12), #050508",
              border: "1.5px solid #FF8DA1",
              borderRadius: 20,
              animation: "bt-fadeup .45s cubic-bezier(.22,1,.36,1) both",
              fontFamily: "'Poppins',sans-serif",
            }}
            data-testid={`rescue-pack-alert-${idx}`}
          >
            {/* Alert accent bar */}
            <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "#FF8DA1" }} />
            <div aria-hidden className="pointer-events-none absolute -top-14 -right-14 w-36 h-36 rounded-full blur-3xl opacity-25" style={{ background: "#FF8DA1" }} />

            <div className="relative p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(5,5,8,.6)", border: "1px solid #FF8DA1" }}
                >
                  <ShieldAlert className="w-5 h-5" style={{ color: "#FF8DA1" }} />
                </div>
                <div className="min-w-0">
                  <div style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: 16, color: "#FF8DA1", transform: "rotate(-1.5deg)", display: "inline-block" }}>
                    {isAf ? "Reddingspakket" : "Rescue Pack"}
                  </div>
                  <p className="text-base font-black text-white leading-tight">
                    {isAf ? "Reddingspakket Geaktiveer" : "Rescue Pack Activated"}
                  </p>
                  <p className="text-sm text-white mt-0.5 leading-snug" style={{ opacity: 0.9 }}>
                    {description}
                  </p>
                </div>
              </div>
              <Link href={href}>
                <Button
                  type="button"
                  variant="primary"
                  className="shrink-0"
                  data-testid={`rescue-pack-start-${idx}`}
                >
                  {isAf ? "Kom ons gaan!" : "Start Now"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
