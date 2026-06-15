import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
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
  Globe,
  Home,
  LogOut,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { DailyChallenge, DailyChallengeQuestion } from "@shared/schema";

const CHALLENGE_TIME_LIMIT = 300;

export default function DailyChallengePage() {
  const { user, logout } = useAuth();
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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-80 rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (!fetchError && data && (!challenge || questions.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="border border-border rounded-[32px] max-w-md w-full">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                {isAf ? "Uitdaging kom binnekort" : "Challenge coming soon"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {isAf
                  ? "Geen vrae beskikbaar nie. Kies vakke in Instellings en probeer môre weer."
                  : "No questions available. Pick your subjects in Settings and check back tomorrow."}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Link href="/settings">
                <Button className="rounded-2xl font-semibold">{isAf ? "Instellings" : "Settings"}</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-2xl font-semibold">
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchError) {
    const is503 = fetchError.message?.startsWith("503");

    if (is503) {
      return (
        <div className="min-h-screen">
          <div className="max-w-3xl mx-auto px-4 py-12">
            <Card className="border-2 border-primary/30 bg-primary/5 rounded-[32px]" data-testid="daily-challenge-not-ready">
              <CardContent className="p-10 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {isAf ? "Vrae word nog voorberei" : "Questions aren't ready yet"}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {isAf
                      ? "Kies jou vakke in Instellings sodat ons 'n gepersonaliseerde daaglikse uitdaging vir jou kan skep."
                      : "Select your subjects in Settings so we can build a personalised Daily Challenge just for you."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button
                    variant="secondary"
                    className="rounded-2xl font-semibold gap-2"
                    data-testid="button-retry-challenge"
                    onClick={() => refetchChallenge()}
                    disabled={isRefetching}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
                    {isAf ? "Probeer weer" : "Try Again"}
                  </Button>
                  <Link href="/settings">
                    <Button className="rounded-2xl font-semibold" data-testid="button-go-to-settings">
                      {isAf ? "Gaan na Instellings" : "Go to Settings"}
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="rounded-2xl font-semibold" data-testid="button-back-to-dashboard-503">
                      {isAf ? "Terug na Dashboard" : "Back to Dashboard"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Card className="border-2 border-destructive/40 bg-destructive/5 rounded-[32px]" data-testid="daily-challenge-error">
            <CardContent className="p-10 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {isAf ? "Kon nie vandag se uitdaging laai nie" : "Couldn't load today's challenge"}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  {isAf
                    ? "Ons kon nie aan die bediener koppel nie. Kyk jou internetverbinding en probeer weer."
                    : "We couldn't reach the server. Check your connection and try again."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button onClick={() => refetchChallenge()} disabled={isRefetching} className="rounded-2xl font-semibold" data-testid="button-retry-daily-challenge">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
                  {isRefetching ? (isAf ? "Probeer..." : "Retrying...") : (isAf ? "Probeer Weer" : "Try Again")}
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="rounded-2xl font-semibold" data-testid="button-back-to-dashboard">
                    {isAf ? "Terug na Dashboard" : "Back to Dashboard"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (timeUpNoAnswers && !showResults && !isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="border-2 border-primary/30 bg-primary/5 rounded-[32px] max-w-md w-full" data-testid="daily-challenge-time-up">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground" data-testid="text-time-up-title">
                {isAf ? "Tyd is op!" : "Time's up!"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {isAf
                  ? "Die 5 minute is verby en jy het nog nie 'n antwoord gekies nie. Geen probleem nie — probeer môre weer met 'n vars uitdaging."
                  : "The 5 minutes ran out before you picked any answers. No worries — come back tomorrow for a fresh challenge."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Link href="/dashboard">
                <Button className="rounded-2xl font-semibold" data-testid="button-time-up-dashboard">
                  {isAf ? "Terug na Dashboard" : "Back to Dashboard"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date();
  const dayLabel = formatDate(today, isAf ? "af" : "en", { weekday: "long" });
  const dateLabel = formatDate(today, isAf ? "af" : "en", { day: "numeric", month: "short" });

  const headerActions = (
    <>
      <div
        className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
        data-testid="text-challenge-streak"
        title={isAf ? "Reeks" : "Streak"}
      >
        <Flame className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-primary">
          {streak}
          <span className="hidden sm:inline">&nbsp;{isAf ? "dae" : "days"}</span>
        </span>
      </div>
      {!showResults && !isCompleted && (
        <div
          className={`relative flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full border transition-colors ${
            timerUrgent
              ? "border-destructive/40 bg-destructive/10 animate-pulse"
              : timerWarning
              ? "border-yellow-500/40 bg-yellow-500/10"
              : "border-border bg-muted/40"
          }`}
          data-testid="text-challenge-timer"
          title={isAf ? "Tyd oor" : "Time left"}
        >
          <div className="relative w-5 h-5">
            <svg className="absolute inset-0 w-5 h-5 -rotate-90" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 8}
                strokeDashoffset={2 * Math.PI * 8 * (1 - timerProgress)}
                className={timerUrgent ? "text-destructive" : timerWarning ? "text-yellow-500" : "text-primary"}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <Clock
              className={`absolute inset-0 m-auto w-2.5 h-2.5 ${
                timerUrgent ? "text-destructive" : timerWarning ? "text-yellow-500" : "text-foreground"
              }`}
            />
          </div>
          <span
            className={`text-sm font-semibold tabular-nums ${
              timerUrgent ? "text-destructive" : timerWarning ? "text-yellow-500" : "text-foreground"
            }`}
          >
            {formatCountdown(remainingSeconds)}
          </span>
        </div>
      )}
      <button
        onClick={toggleLanguage}
        className="min-h-0 inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-foreground hover:bg-white/5 transition-colors border-0 bg-transparent"
        data-testid="button-language-toggle"
        title={isAf ? "Taal" : "Language"}
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-semibold">{language === "en" ? "EN" : "AF"}</span>
      </button>
      <Link href="/dashboard">
        <button
          className="min-h-0 p-1.5 rounded-lg text-foreground hover:bg-white/5 transition-colors border-0 bg-transparent"
          title={isAf ? "Tuis" : "Home"}
          data-testid="button-home"
        >
          <Home className="h-4 w-4" />
        </button>
      </Link>
      <button
        onClick={() => logout()}
        className="min-h-0 p-1.5 rounded-lg text-foreground hover:bg-white/5 transition-colors border-0 bg-transparent"
        title={isAf ? "Uitteken" : "Sign Out"}
        data-testid="button-logout"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <div className="min-h-screen">
      <PageHeader
        sticky
        icon={Sparkles}
        animatedIcon="bolt"
        title={isAf ? "Daaglikse uitdaging" : "Daily Challenge"}
        subtitle={`${dayLabel} · ${dateLabel}`}
        testId="text-page-title"
        actions={headerActions}
      />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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
            <div className="flex items-center gap-1.5" data-testid="progress-dots">
              {questions.map((_, i) => {
                const answered = selectedAnswers[i] !== null;
                const isCurrent = i === currentQuestion;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`group relative h-2.5 min-h-0 p-0 flex-1 rounded-full transition-all duration-300 border-0 ${
                      isCurrent
                        ? "bg-primary shadow-[0_0_12px_-2px] shadow-primary/60"
                        : answered
                        ? "bg-primary/60"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                    data-testid={`button-progress-${i}`}
                    aria-label={`${isAf ? "Vraag" : "Question"} ${i + 1}${answered ? ` (${isAf ? "beantwoord" : "answered"})` : ""}`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3" data-testid="text-question-counter">
              <span className="text-sm font-semibold text-foreground">
                {isAf ? "Vraag" : "Question"}{" "}
                <span className="text-primary">{currentQuestion + 1}</span>
                <span className="text-muted-foreground">/{questions.length}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {answeredCount}/{questions.length} {isAf ? "beantwoord" : "answered"}
                </span>
                <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  {isAf ? questions[currentQuestion]?.subjectAf || questions[currentQuestion]?.subject : questions[currentQuestion]?.subject}
                </span>
              </div>
            </div>

            <Card className="relative border border-border bg-card rounded-[32px] shadow-sm overflow-hidden">
              {/* Subject color stripe */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-emerald-400" aria-hidden="true" />
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                    {currentQuestion + 1}
                  </div>
                  <h2
                    className="text-xl font-semibold text-foreground leading-relaxed min-w-0 flex-1 break-words whitespace-pre-wrap"
                    data-testid="text-question"
                  >
                    {isAf ? questions[currentQuestion]?.questionAf || questions[currentQuestion]?.question : questions[currentQuestion]?.question}
                  </h2>
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
                        className={`group w-full min-h-0 text-left p-4 rounded-2xl border-2 transition-all duration-200 font-semibold text-base ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground shadow-[0_0_0_4px] shadow-primary/10"
                            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        data-testid={`button-option-${i}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-foreground min-w-0 flex-1 break-words whitespace-pre-wrap leading-snug pt-1">
                            {option}
                          </span>
                          {isSelected && <Check className="w-5 h-5 text-primary shrink-0 mt-1.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="rounded-2xl font-semibold"
                data-testid="button-prev-question"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> {isAf ? "Vorige" : "Previous"}
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || answeredCount < questions.length}
                  className="rounded-2xl font-semibold px-8"
                  data-testid="button-submit-challenge"
                >
                  {submitMutation.isPending ? (isAf ? "Dien in..." : "Submitting...") : isAf ? "Dien in" : "Submit"}
                  <Sparkles className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  className="rounded-2xl font-semibold"
                  data-testid="button-next-question"
                >
                  {isAf ? "Volgende" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
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
    if (percentage >= 90) return { label: "Outstanding!", labelAf: "Uitstekend!", gradient: "from-amber-400 to-yellow-500", icon: Trophy };
    if (percentage >= 70) return { label: "Great job!", labelAf: "Goeie werk!", gradient: "from-emerald-400 to-green-500", icon: Star };
    if (percentage >= 50) return { label: "Good effort!", labelAf: "Goeie poging!", gradient: "from-cyan-400 to-blue-500", icon: Target };
    return { label: "Keep trying!", labelAf: "Hou aan!", gradient: "from-orange-400 to-red-500", icon: Zap };
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
    <div className="space-y-6">
      {/* Trophy hero */}
      <Card className={`border-0 bg-gradient-to-br ${grade.gradient} rounded-[32px] shadow-xl overflow-hidden`}>
        <CardContent className="p-8 text-center space-y-4 relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/15 blur-3xl rounded-full -mr-10 -mt-10" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -ml-10 -mb-10" aria-hidden="true" />
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <GradeIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-semibold text-white mt-4" data-testid="text-result-grade">
              {isAf ? grade.labelAf : grade.label}
            </h2>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="text-center" data-testid="text-result-score">
                <p className="text-5xl font-semibold text-white tabular-nums">
                  {correctCount}/{totalQuestions}
                </p>
                <p className="text-sm font-semibold text-white/90">{isAf ? "Korrek" : "Correct"}</p>
              </div>
              <div className="w-px h-12 bg-white/30" />
              <div className="text-center" data-testid="text-result-percentage">
                <p className="text-5xl font-semibold text-white tabular-nums">{percentage}%</p>
                <p className="text-sm font-semibold text-white/90">{isAf ? "Telling" : "Score"}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white tabular-nums">{formatTime(timeSpent)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  {streak} {isAf ? "dae reeks" : "day streak"}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">+{xpEarned} XP</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next challenge unlock */}
      <Card className="border border-border bg-card rounded-[24px]" data-testid="card-next-challenge">
        <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isAf ? "Volgende uitdaging" : "Next challenge"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAf ? "Ontsluit oor" : "Unlocks in"} <span className="font-semibold text-primary tabular-nums">{nextIn}</span>
              </p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="rounded-xl font-semibold" data-testid="button-back-home">
              {isAf ? "Dashboard" : "Dashboard"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 14-day streak strip */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground px-1 flex items-center gap-2" data-testid="text-history-heading">
            <Flame className="w-5 h-5 text-primary" />
            {isAf ? (
              <>
                Jou <span className="gradient-text">reeks</span>
              </>
            ) : (
              <>
                Your <span className="gradient-text">streak</span>
              </>
            )}
          </h3>
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

              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-center p-1 border-2 transition-transform ${
                    isToday ? "scale-110 shadow-md" : ""
                  } ${
                    completed
                      ? score === total
                        ? "bg-green-500/10 border-green-500/40"
                        : score >= total / 2
                        ? "bg-primary/10 border-primary/30"
                        : "bg-yellow-500/10 border-yellow-500/30"
                      : isToday
                      ? "bg-primary/5 border-primary/40"
                      : "bg-muted border-border"
                  }`}
                  data-testid={`history-day-${i}`}
                  title={formatDate(date, isAf ? "af" : "en", { weekday: "long", day: "numeric", month: "short" })}
                >
                  <span className="text-[9px] font-semibold text-muted-foreground">
                    {formatDate(date, isAf ? "af" : "en", { weekday: "short" }).slice(0, 2)}
                  </span>
                  {completed ? (
                    <span className="text-base font-semibold text-foreground tabular-nums">{score}</span>
                  ) : (
                    <span className="text-base text-muted-foreground">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review answers */}
      <h3 className="text-lg font-semibold text-foreground px-1" data-testid="text-review-heading">
        {isAf ? (
          <>
            Hersien jou <span className="gradient-text">antwoorde</span>
          </>
        ) : (
          <>
            Review your <span className="gradient-text">answers</span>
          </>
        )}
      </h3>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const isCorrect = selectedAnswers[i] === q.correctIndex;
          const isExpanded = expandedQ === i;
          const options = isAf ? q.optionsAf || q.options : q.options;

          return (
            <Card
              key={i}
              className={`border-2 rounded-[24px] overflow-hidden transition-all ${
                isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <CardContent className="p-5 space-y-3">
                <button
                  onClick={() => setExpandedQ(isExpanded ? null : i)}
                  className="min-h-0 p-0 w-full text-left flex items-start gap-3 border-0 bg-transparent"
                  data-testid={`button-review-question-${i}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {isCorrect ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm leading-snug break-words">
                      {isAf ? q.questionAf || q.question : q.question}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{isAf ? q.subjectAf || q.subject : q.subject}</p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
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
                          className={`text-sm p-2.5 rounded-xl font-medium ${
                            isAnswer
                              ? "bg-green-500/10 text-foreground border border-green-500/30"
                              : wasSelected && !isAnswer
                              ? "bg-red-500/10 text-foreground border border-red-500/30"
                              : "bg-muted text-foreground border border-border"
                          }`}
                        >
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + j)}.</span>
                          {opt}
                          {isAnswer && <Check className="w-3.5 h-3.5 inline ml-1.5 text-green-600" />}
                          {wasSelected && !isAnswer && <X className="w-3.5 h-3.5 inline ml-1.5 text-red-600" />}
                        </div>
                      );
                    })}
                    {!isCorrect && options?.[q.correctIndex] !== undefined && (
                      <div
                        className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 flex items-center gap-2 mt-2"
                        data-testid={`callout-correct-answer-${i}`}
                      >
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {isAf ? "Korrekte antwoord:" : "Correct answer:"}{" "}
                          <span className="font-bold">{String.fromCharCode(65 + q.correctIndex)}</span>
                          <span className="font-normal"> — {options[q.correctIndex]}</span>
                        </p>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mt-2">
                        <p className="text-xs font-semibold text-foreground">
                          {isAf ? q.explanationAf || q.explanation : q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
