/**
 * Boost Session — a guided ~30-minute revision sprint that rotates through
 * ALL of the learner's selected subjects, one timed block per subject.
 *
 * Deliberately a thin orchestrator over EXISTING machinery — no parallel
 * question-serving stack:
 *   - Questions per subject:  GET  /api/subjects/:id/boost/quiz   (released DBE MCQs)
 *   - Authoritative grading:  POST /api/subjects/:id/boost/quiz/submit
 *                             (coins, XP, progress, wrong-answer capture, badges)
 *   - Session tracking:       POST /api/study-sessions/start  +  PATCH …/:id/end
 *   - Completion:             POST /api/boost-session/complete (streak + daily bonus)
 * The 30-minute split across subjects is the pure helper in
 * shared/boost-session.ts (unit-tested in tests/unit/boost-session-split.test.ts).
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { CSSProperties } from "react";
import { useLanguage } from "@/lib/language-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { incrementQuizSessionCount } from "@/lib/quiz-session-tracker";
import { LearnerHeader } from "@/components/learner-header";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { ConfettiBurst } from "@/components/confetti-burst";
import { Button } from "@/components/ui/button";
import {
  splitBoostSession,
  BOOST_SESSION_TOTAL_SECONDS,
  type BoostBlock,
} from "@shared/boost-session";
import {
  Zap,
  Clock,
  Flame,
  Coins,
  Trophy,
  Target,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  BookOpen,
  SkipForward,
  Square,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

/* ── Design tokens (street/graffiti system used across learner pages) ── */
const PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];

const cardStyle = (accent?: string, radius = 18): CSSProperties => ({
  background: "linear-gradient(#0e0d12, #0e0d12), #050508",
  border: accent ? `1.5px solid ${accent}` : "1px solid #1b1922",
  borderRadius: radius,
});

const marker = (color: string, size = 16): CSSProperties => ({
  fontFamily: "'Bebas Neue', system-ui, sans-serif",
  fontSize: size,
  color,
  transform: "rotate(-2deg)",
  display: "inline-block",
});

const T = {
  en: {
    back: "Dashboard",
    title: "Boost Session",
    tagline: "30 min · all your subjects",
    introHeadline: "One sprint. Every subject.",
    introCopy:
      "30 minutes of real released DBE questions, rotating through every subject you take. Answer as many as you can in each block — the timer moves you on.",
    yourLineup: "Your line-up",
    perBlock: "min each",
    minutes: "min",
    realQuestions: "Real DBE questions",
    coinsPerCorrect: "+5 coins per correct",
    streakCounts: "Counts for your streak",
    startCta: "Start 30-min Boost",
    noSubjectsHeadline: "No subjects selected",
    noSubjectsCopy: "Pick the subjects you're writing this year, then come boost them.",
    goToSettings: "Go to Settings",
    introErrorHeadline: "Couldn't load your subjects",
    introErrorCopy: "We couldn't reach the server. Check your connection and try again.",
    tryAgain: "Try Again",
    retrying: "Retrying...",
    loadingBlock: "Loading questions",
    blockOf: "Subject",
    sessionLeft: "session left",
    blockLeft: "in this block",
    questionOf: "Question",
    selectAnswer: "Tap an answer to lock it in",
    correctLabel: "Correct answer:",
    explanation: "Official memo",
    nextQuestion: "Next question",
    nextSubject: "Next subject",
    finishSession: "Finish session",
    skipSubject: "Skip subject",
    endEarly: "End session",
    noQuestionsYet: "No questions for this subject yet — moving on.",
    submitFailed: "Couldn't save this block's answers. Your session continues.",
    savingBlock: "Marking your answers",
    summaryTitle: "Boost complete!",
    summarySub: "You just revised every subject in one sitting.",
    answeredLabel: "Answered",
    correctShort: "Correct",
    accuracyLabel: "Accuracy",
    coinsLabel: "Coins",
    streakLabel: "Day streak",
    bonusLabel: "Boost bonus",
    perSubject: "Per subject",
    skippedNoQuestions: "No questions yet",
    notAttempted: "Not reached",
    revisionNudge: "Wrong answers are saved for you in Revision.",
    revisionCta: "Open Revision",
    backToDash: "Back to Dashboard",
    minsRevised: "min revised",
  },
  af: {
    back: "Paneelbord",
    title: "Boost-sessie",
    tagline: "30 min · al jou vakke",
    introHeadline: "Een sessie. Elke vak.",
    introCopy:
      "30 minute se regte vrygestelde DBE-vrae wat deur elkeen van jou vakke roteer. Antwoord soveel as wat jy kan in elke blok — die tydhouer skuif jou aan.",
    yourLineup: "Jou vakke",
    perBlock: "min elk",
    minutes: "min",
    realQuestions: "Regte DBE-vrae",
    coinsPerCorrect: "+5 munte per korrekte antwoord",
    streakCounts: "Tel vir jou reeks",
    startCta: "Begin 30-min Boost",
    noSubjectsHeadline: "Geen vakke gekies nie",
    noSubjectsCopy: "Kies eers die vakke wat jy vanjaar skryf, en kom boost hulle dan.",
    goToSettings: "Gaan na Instellings",
    introErrorHeadline: "Kon nie jou vakke laai nie",
    introErrorCopy: "Ons kon nie aan die bediener koppel nie. Kyk jou internetverbinding en probeer weer.",
    tryAgain: "Probeer Weer",
    retrying: "Probeer...",
    loadingBlock: "Laai vrae",
    blockOf: "Vak",
    sessionLeft: "sessie oor",
    blockLeft: "in hierdie blok",
    questionOf: "Vraag",
    selectAnswer: "Tik 'n antwoord om dit vas te maak",
    correctLabel: "Korrekte antwoord:",
    explanation: "Amptelike memo",
    nextQuestion: "Volgende vraag",
    nextSubject: "Volgende vak",
    finishSession: "Voltooi sessie",
    skipSubject: "Slaan vak oor",
    endEarly: "Beëindig sessie",
    noQuestionsYet: "Nog geen vrae vir hierdie vak nie — ons gaan aan.",
    submitFailed: "Kon nie hierdie blok se antwoorde stoor nie. Jou sessie gaan voort.",
    savingBlock: "Merk jou antwoorde",
    summaryTitle: "Boost voltooi!",
    summarySub: "Jy het pas elke vak in een sessie hersien.",
    answeredLabel: "Beantwoord",
    correctShort: "Korrek",
    accuracyLabel: "Akkuraatheid",
    coinsLabel: "Munte",
    streakLabel: "Dag-reeks",
    bonusLabel: "Boost-bonus",
    perSubject: "Per vak",
    skippedNoQuestions: "Nog geen vrae nie",
    notAttempted: "Nie bereik nie",
    revisionNudge: "Verkeerde antwoorde word vir jou in Hersiening gestoor.",
    revisionCta: "Open Hersiening",
    backToDash: "Terug na Paneelbord",
    minsRevised: "min hersien",
  },
} as const;

/* ── Types ── */
interface QuizQuestion {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  topic: string;
  explanation: string;
}

interface SubmitResult {
  score: number;
  total: number;
  percentage: number;
  coinsEarned: number;
}

interface BlockRun {
  subjectId: number;
  subjectName: string;
  plannedSeconds: number;
  /** Filled once the block has actually run. */
  answered: number;
  correct: number;
  coinsEarned: number;
  status: "pending" | "done" | "no_questions" | "skipped";
}

type Phase = "intro" | "running" | "summary";
type BlockPhase = "loading" | "quiz" | "submitting";

const fmtClock = (s: number) => {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.max(0, s) % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export default function BoostSessionPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const { toast } = useToast();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
    isRefetching: profileRefetching,
  } = useQuery<{ selectedSubjects?: number[] }>({
    queryKey: ["/api/user/onboarding"],
  });
  const {
    data: allSubjects,
    isLoading: subjectsLoading,
    error: subjectsError,
    refetch: refetchSubjects,
    isRefetching: subjectsRefetching,
  } = useQuery<
    Array<{ id: number; name: string; nameAfrikaans: string | null }>
  >({ queryKey: ["/api/subjects"] });

  const [phase, setPhase] = useState<Phase>("intro");
  const [blocks, setBlocks] = useState<BlockRun[]>([]);
  const [blockIdx, setBlockIdx] = useState(0);
  const [blockPhase, setBlockPhase] = useState<BlockPhase>("loading");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerLocked, setAnswerLocked] = useState(false);
  const [completion, setCompletion] = useState<{ currentStreak: number; bonusCoins: number } | null>(null);

  const sessionIdRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number>(0);
  const answersRef = useRef<Record<number, string>>({});
  const questionsRef = useRef<QuizQuestion[]>([]);
  const blocksRef = useRef<BlockRun[]>([]);
  const secondsLeftRef = useRef(0);
  const endingRef = useRef(false);
  const prefetchRef = useRef(new Map<number, Promise<{ questions: QuizQuestion[]; comingSoon?: boolean }>>());

  blocksRef.current = blocks;
  answersRef.current = answers;
  questionsRef.current = questions;
  secondsLeftRef.current = secondsLeft;

  /* Selected subjects → planned blocks (names resolved, unknown ids dropped) */
  const selectedIds: number[] = Array.isArray(profile?.selectedSubjects)
    ? (profile!.selectedSubjects as number[])
    : [];
  const knownSelected = selectedIds.filter((id) => allSubjects?.some((s) => s.id === id));
  const plan: BoostBlock[] = splitBoostSession(knownSelected);
  const subjectName = useCallback(
    (id: number) => {
      const s = allSubjects?.find((x) => x.id === id);
      if (!s) return `#${id}`;
      return isAf ? s.nameAfrikaans || s.name : s.name;
    },
    [allSubjects, isAf],
  );

  const fetchBlockQuestions = useCallback(
    (subjectId: number) => {
      const cached = prefetchRef.current.get(subjectId);
      if (cached) return cached;
      const p = fetch(
        `/api/subjects/${subjectId}/boost/quiz?lang=${isAf ? "af" : "en"}&difficulty=medium`,
        { credentials: "include" },
      ).then(async (r) => {
        if (!r.ok) throw new Error(`quiz load failed: ${r.status}`);
        return r.json() as Promise<{ questions: QuizQuestion[]; comingSoon?: boolean }>;
      });
      prefetchRef.current.set(subjectId, p);
      // A rejected promise must not poison the cache for retries
      p.catch(() => prefetchRef.current.delete(subjectId));
      return p;
    },
    [isAf],
  );

  /* ── Submit the current block's answered questions through the existing
        per-subject marking endpoint (coins/XP/progress/wrong-answers). ── */
  const submitBlock = useCallback(
    async (run: BlockRun, qs: QuizQuestion[], ans: Record<number, string>): Promise<BlockRun> => {
      const answeredEntries = qs
        .filter((q) => ans[q.id] !== undefined && ans[q.id] !== "")
        .map((q) => ({ questionId: q.id, selected: ans[q.id] }));
      const clientCorrect = qs.filter((q) => ans[q.id] === q.correctAnswer).length;
      if (answeredEntries.length === 0) {
        return { ...run, answered: 0, correct: 0, coinsEarned: 0, status: "done" };
      }
      try {
        const res = await apiRequest("POST", `/api/subjects/${run.subjectId}/boost/quiz/submit`, {
          answers: answeredEntries,
          lang: isAf ? "af" : "en",
        });
        const data = (await res.json()) as SubmitResult;
        return {
          ...run,
          answered: data.total ?? answeredEntries.length,
          correct: data.score ?? clientCorrect,
          coinsEarned: data.coinsEarned ?? 0,
          status: "done",
        };
      } catch {
        toast({ title: t.submitFailed, variant: "destructive" });
        return {
          ...run,
          answered: answeredEntries.length,
          correct: clientCorrect,
          coinsEarned: 0,
          status: "done",
        };
      }
    },
    [isAf, t.submitFailed, toast],
  );

  const finishSession = useCallback(async (finalBlocks: BlockRun[]) => {
    const totalAnswered = finalBlocks.reduce((s, b) => s + b.answered, 0);
    if (sessionIdRef.current !== null) {
      apiRequest("PATCH", `/api/study-sessions/${sessionIdRef.current}/end`, {
        questionsAnswered: totalAnswered,
      }).catch(() => {});
      sessionIdRef.current = null;
    }
    if (totalAnswered > 0) {
      incrementQuizSessionCount();
      try {
        const res = await apiRequest("POST", "/api/boost-session/complete", {
          questionsAnswered: totalAnswered,
        });
        const data = await res.json();
        setCompletion({ currentStreak: data.currentStreak ?? 0, bonusCoins: data.bonusCoins ?? 0 });
      } catch {
        setCompletion(null);
      }
    }
    for (const key of [
      "/api/user/stats",
      "/api/user/coins",
      "/api/user/progress",
      "/api/user/badges",
      "/api/learner/goals",
      "/api/learner/readiness",
      "/api/mastery/weak-topics",
    ]) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
    setPhase("summary");
  }, []);

  /* ── Advance to block `idx`, rolling any leftover seconds forward. ── */
  const startBlock = useCallback(
    async (idx: number, carrySeconds: number, currentBlocks: BlockRun[]) => {
      if (idx >= currentBlocks.length) {
        await finishSession(currentBlocks);
        return;
      }
      endingRef.current = false;
      setBlockIdx(idx);
      setBlockPhase("loading");
      setQuestions([]);
      setAnswers({});
      setQIdx(0);
      setAnswerLocked(false);

      const run = currentBlocks[idx];
      let payload: { questions: QuizQuestion[]; comingSoon?: boolean };
      try {
        payload = await fetchBlockQuestions(run.subjectId);
      } catch {
        payload = { questions: [], comingSoon: true };
      }

      if (!payload.questions || payload.questions.length === 0) {
        // Nothing servable for this subject — roll its whole allowance forward.
        const updated = currentBlocks.map((b, i) =>
          i === idx ? { ...b, status: "no_questions" as const } : b,
        );
        setBlocks(updated);
        toast({ title: `${run.subjectName}: ${t.noQuestionsYet}` });
        await startBlock(idx + 1, carrySeconds + run.plannedSeconds, updated);
        return;
      }

      setQuestions(payload.questions);
      setSecondsLeft(run.plannedSeconds + carrySeconds);
      setBlockPhase("quiz");
      // Warm the next subject's questions while this block runs
      const next = currentBlocks[idx + 1];
      if (next) fetchBlockQuestions(next.subjectId).catch(() => {});
    },
    [fetchBlockQuestions, finishSession, t.noQuestionsYet, toast],
  );

  /* ── End the current block (time up / questions done / skip / end-early). ── */
  const endBlock = useCallback(
    async (opts: { skipRest?: boolean } = {}) => {
      if (endingRef.current) return;
      endingRef.current = true;
      setBlockPhase("submitting");

      const idx = blockIdx;
      const carry = opts.skipRest ? 0 : Math.max(0, secondsLeftRef.current);
      const run = blocksRef.current[idx];
      const graded = await submitBlock(run, questionsRef.current, answersRef.current);
      const updated = blocksRef.current.map((b, i) => (i === idx ? graded : b));
      setBlocks(updated);

      if (opts.skipRest) {
        await finishSession(updated);
      } else {
        await startBlock(idx + 1, carry, updated);
      }
    },
    [blockIdx, finishSession, startBlock, submitBlock],
  );

  /* ── Session timer: ticks only while a quiz block is on screen. ── */
  useEffect(() => {
    if (phase !== "running" || blockPhase !== "quiz") return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          void endBlock();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, blockPhase, blockIdx, endBlock]);

  const startSession = () => {
    if (plan.length === 0) return;
    const initial: BlockRun[] = plan.map((b) => ({
      subjectId: b.subjectId,
      subjectName: subjectName(b.subjectId),
      plannedSeconds: b.seconds,
      answered: 0,
      correct: 0,
      coinsEarned: 0,
      status: "pending",
    }));
    setBlocks(initial);
    setCompletion(null);
    sessionStartRef.current = Date.now();
    setPhase("running");
    apiRequest("POST", "/api/study-sessions/start", { context: "boost_session" })
      .then((r) => r.json())
      .then((s: { sessionId: number }) => {
        sessionIdRef.current = s.sessionId;
      })
      .catch(() => {});
    void startBlock(0, 0, initial);
  };

  const handleSelect = (label: string) => {
    if (answerLocked) return;
    const q = questions[qIdx];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: label }));
    setAnswerLocked(true);
  };

  const handleNextQuestion = () => {
    if (qIdx + 1 >= questions.length) {
      void endBlock();
    } else {
      setAnswerLocked(false);
      setQIdx((i) => i + 1);
    }
  };

  /* ══════════════════ INTRO ══════════════════ */
  if (phase === "intro") {
    const introLoading = profileLoading || subjectsLoading;
    const introError = profileError || subjectsError;
    const introRefetching = profileRefetching || subjectsRefetching;
    const noSubjects = profile !== undefined && plan.length === 0;
    const perBlockMin = plan.length > 0 ? Math.round(plan[0].seconds / 60) : 0;
    return (
      <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
        <GraffitiSplats variant="corner" opacity={0.4} />
        <LearnerHeader backLabel={t.back} title={t.title} titleColor="#94F7C5" maxWidthClassName="max-w-2xl" />
        <main className="relative max-w-2xl mx-auto px-4 pb-16 pt-6 space-y-5" style={{ zIndex: 1 }}>
          {introLoading ? (
            <div className="space-y-5" data-testid="boost-session-intro-loading">
              <div className="h-56 w-full animate-pulse" style={{ background: "#1b1922", borderRadius: 18 }} />
              <div className="h-64 w-full animate-pulse" style={{ background: "#1b1922", borderRadius: 18 }} />
            </div>
          ) : introError ? (
            <div style={cardStyle("#FF8DA1")} className="p-7 text-center space-y-3" data-testid="boost-session-intro-error">
              <AlertCircle className="w-9 h-9 mx-auto" style={{ color: "#FF8DA1" }} />
              <div className="text-xl font-black">{t.introErrorHeadline}</div>
              <p className="text-sm leading-relaxed">{t.introErrorCopy}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (profileError) void refetchProfile();
                    if (subjectsError) void refetchSubjects();
                  }}
                  disabled={introRefetching}
                  data-testid="button-retry-boost-intro"
                >
                  <RefreshCw className={`w-4 h-4 ${introRefetching ? "animate-spin" : ""}`} />
                  {introRefetching ? t.retrying : t.tryAgain}
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline">{t.backToDash}</Button>
                </Link>
              </div>
            </div>
          ) : noSubjects ? (
            <div style={cardStyle("#FFE29A")} className="p-7 text-center space-y-3" data-testid="boost-session-no-subjects">
              <BookOpen className="w-9 h-9 mx-auto" style={{ color: "#FFE29A" }} />
              <div className="text-xl font-black">{t.noSubjectsHeadline}</div>
              <p className="text-sm leading-relaxed">{t.noSubjectsCopy}</p>
              <Link href="/settings">
                <Button variant="primary" className="mt-2">
                  {t.goToSettings}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Hero */}
              <div style={{ ...cardStyle("#94F7C5"), animation: "bt-fadeup .45s cubic-bezier(.22,1,.36,1) both" }} className="relative overflow-hidden p-6 sm:p-7" data-testid="boost-session-intro">
                <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl" style={{ background: "rgba(148,247,197,.22)" }} />
                <div className="relative space-y-3">
                  <span style={marker("#94F7C5", 17)}>{t.tagline} ⚡</span>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight" style={{ letterSpacing: -0.5 }}>
                    {t.introHeadline}
                  </h1>
                  <p className="text-sm leading-relaxed">{t.introCopy}</p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { Icon: Target, hex: "#9FD8FF", label: t.realQuestions },
                      { Icon: Coins, hex: "#FFE29A", label: t.coinsPerCorrect },
                      { Icon: Flame, hex: "#FFB7E5", label: t.streakCounts },
                    ].map(({ Icon, hex, label }) => (
                      <div key={label} className="rounded-xl px-2.5 py-3 flex flex-col items-center gap-1.5 text-center" style={{ background: "rgba(5,5,8,.6)", border: `1px solid ${hex}` }}>
                        <Icon className="w-4 h-4" style={{ color: hex }} />
                        <span className="text-[11px] font-bold leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Line-up */}
              <div style={cardStyle()} className="p-5 sm:p-6" data-testid="boost-session-lineup">
                <div className="flex items-baseline justify-between gap-3 mb-4">
                  <div className="font-extrabold text-base">{t.yourLineup} 🎒</div>
                  <span style={marker("#FFE29A", 15)}>
                    {plan.length} × ~{perBlockMin} {t.perBlock}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {plan.map((b, i) => {
                    const hex = PASTELS[i % PASTELS.length];
                    return (
                      <div key={b.subjectId} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5" style={{ background: "rgba(5,5,8,.6)", border: `1px solid ${hex}` }}>
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs" style={{ background: `${hex}26`, color: hex }}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm font-bold truncate">{subjectName(b.subjectId)}</span>
                        <span className="tabular-nums text-xs font-extrabold" style={{ color: hex }}>
                          {Math.floor(b.seconds / 60)} {t.minutes}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Button
                  onClick={startSession}
                  data-testid="button-start-boost-session-run"
                  variant="primary"
                  size="lg"
                  className="mt-5 w-full"
                >
                  <Zap className="w-5 h-5" />
                  {t.startCta}
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  /* ══════════════════ SUMMARY ══════════════════ */
  if (phase === "summary") {
    const ran = blocks.filter((b) => b.status === "done");
    const totalAnswered = ran.reduce((s, b) => s + b.answered, 0);
    const totalCorrect = ran.reduce((s, b) => s + b.correct, 0);
    const totalCoins = ran.reduce((s, b) => s + b.coinsEarned, 0) + (completion?.bonusCoins ?? 0);
    const pct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const gradeHex = pct >= 80 ? "#94F7C5" : pct >= 60 ? "#9FF5E8" : pct >= 40 ? "#FFE29A" : "#FFB7E5";
    const minutesRevised = sessionStartRef.current
      ? Math.min(
          Math.round(BOOST_SESSION_TOTAL_SECONDS / 60),
          Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000)),
        )
      : 0;
    const anyWrong = totalAnswered - totalCorrect > 0;
    return (
      <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
        {totalAnswered > 0 && <ConfettiBurst />}
        <GraffitiSplats variant="corner" opacity={0.4} />
        <LearnerHeader backLabel={t.back} title={t.title} titleColor="#94F7C5" maxWidthClassName="max-w-2xl" />
        <main className="relative max-w-2xl mx-auto px-4 pb-16 pt-6 space-y-5" style={{ zIndex: 1 }}>
          <div style={{ ...cardStyle(gradeHex), animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) both" }} className="p-6 sm:p-7 text-center space-y-3" data-testid="boost-session-summary">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${gradeHex}` }}>
              <Trophy className="w-8 h-8" style={{ color: gradeHex }} />
            </div>
            <div style={marker(gradeHex, 19)}>{t.summaryTitle}</div>
            <p className="text-sm">{t.summarySub}</p>
            <div className="text-5xl font-black tabular-nums" data-testid="boost-session-score">
              {totalCorrect}
              <span className="text-2xl"> / {totalAnswered}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden mx-auto max-w-sm" style={{ background: "#0e0d12" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg,#9FF5E8,${gradeHex})` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { label: t.accuracyLabel, value: `${pct}%`, hex: gradeHex },
                { label: t.coinsLabel, value: `+${totalCoins}`, hex: "#FFE29A" },
                {
                  label: completion ? t.streakLabel : t.minsRevised,
                  value: completion ? `${completion.currentStreak} 🔥` : `${minutesRevised}`,
                  hex: "#FFB7E5",
                },
              ].map(({ label, value, hex }) => (
                <div key={label} className="rounded-xl px-2 py-3" style={{ background: "rgba(5,5,8,.6)", border: `1px solid ${hex}` }}>
                  <div className="text-xl font-black tabular-nums" style={{ color: hex }}>{value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            {completion && completion.bonusCoins > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold" style={{ background: "rgba(255,226,154,.12)", border: "1px solid #FFE29A", color: "#FFE29A" }}>
                <Sparkles className="w-3.5 h-3.5" />
                {t.bonusLabel}: +{completion.bonusCoins} <Coins className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Per-subject breakdown */}
          <div style={cardStyle()} className="p-5 sm:p-6" data-testid="boost-session-breakdown">
            <div className="font-extrabold text-base mb-4">{t.perSubject} 📊</div>
            <div className="space-y-2.5">
              {blocks.map((b, i) => {
                const hex = PASTELS[i % PASTELS.length];
                const subPct = b.answered > 0 ? Math.round((b.correct / b.answered) * 100) : 0;
                return (
                  <div key={b.subjectId} className="rounded-xl px-3.5 py-3" style={{ background: "rgba(5,5,8,.6)", border: `1px solid ${hex}` }} data-testid={`boost-block-result-${b.subjectId}`}>
                    <div className="flex items-center gap-3">
                      <span className="flex-1 text-sm font-bold truncate">{b.subjectName}</span>
                      {b.status === "done" ? (
                        <span className="tabular-nums text-sm font-black" style={{ color: hex }}>
                          {b.correct}/{b.answered}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold" style={{ color: hex }}>
                          {b.status === "no_questions" ? t.skippedNoQuestions : t.notAttempted}
                        </span>
                      )}
                    </div>
                    {b.status === "done" && b.answered > 0 && (
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "#0e0d12" }}>
                        <div className="h-full rounded-full" style={{ width: `${subPct}%`, background: hex }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {anyWrong && (
            <div style={cardStyle("#C5B3FF")} className="p-4 flex items-center gap-3 flex-wrap">
              <Sparkles className="w-5 h-5 shrink-0" style={{ color: "#C5B3FF" }} />
              <p className="flex-1 min-w-[180px] text-sm font-semibold m-0">{t.revisionNudge}</p>
              <Link href="/revision">
                <Button variant="outline">
                  {t.revisionCta}
                </Button>
              </Link>
            </div>
          )}

          <Link href="/dashboard">
            <Button
              data-testid="button-boost-back-dashboard"
              variant="primary"
              size="lg"
              className="w-full"
            >
              {t.backToDash}
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  /* ══════════════════ RUNNING ══════════════════ */
  const run = blocks[blockIdx];
  const hex = PASTELS[blockIdx % PASTELS.length];
  const q = questions[qIdx];
  const selected = q ? answers[q.id] : undefined;
  const futureSeconds = blocks.slice(blockIdx + 1).reduce((s, b) => s + (b.status === "pending" ? b.plannedSeconds : 0), 0);
  const sessionRemaining = secondsLeft + futureSeconds;
  const blockPct = run && run.plannedSeconds > 0 ? Math.min(100, Math.round((secondsLeft / run.plannedSeconds) * 100)) : 0;
  const isLastBlock = blockIdx >= blocks.length - 1;
  const timerHot = secondsLeft <= 20;

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      <main className="relative max-w-2xl mx-auto px-4 pb-24 pt-5 space-y-4" style={{ zIndex: 1 }}>
        {/* ── Session header: subject, block progress, clocks ── */}
        <div style={cardStyle(hex, 18)} className="p-4" data-testid="boost-session-header">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <span style={marker(hex, 15)}>
                {t.blockOf} {blockIdx + 1}/{blocks.length}
              </span>
              <div className="text-lg font-black leading-tight truncate" data-testid="boost-current-subject">
                {run?.subjectName}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 tabular-nums text-sm font-black px-3 py-1.5 rounded-lg"
                style={{
                  background: timerHot ? "rgba(255,141,161,.14)" : "rgba(5,5,8,.6)",
                  border: `1px solid ${timerHot ? "#FF8DA1" : hex}`,
                  color: timerHot ? "#FF8DA1" : hex,
                }}
                data-testid="boost-block-timer"
              >
                <Clock className="w-3.5 h-3.5" />
                {fmtClock(secondsLeft)}
              </span>
              <span className="tabular-nums text-xs font-bold px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(5,5,8,.6)", border: "1px solid #1b1922" }}>
                {fmtClock(sessionRemaining)} · {t.sessionLeft}
              </span>
            </div>
          </div>
          {/* Block time bar */}
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#0e0d12" }}>
            <div className="h-full rounded-full" style={{ width: `${blockPct}%`, background: `linear-gradient(90deg,${hex},#fff0)`, transition: "width 1s linear" }} />
          </div>
          {/* Subject dots */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {blocks.map((b, i) => (
              <span
                key={b.subjectId}
                title={b.subjectName}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === blockIdx ? 22 : 8,
                  background:
                    i < blockIdx
                      ? b.status === "no_questions"
                        ? "#fff"
                        : PASTELS[i % PASTELS.length]
                      : i === blockIdx
                        ? PASTELS[i % PASTELS.length]
                        : "#fff",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Block body ── */}
        {blockPhase !== "quiz" || !q ? (
          <div style={cardStyle()} className="p-10 flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-9 h-9 animate-spin" style={{ color: hex }} />
            <p className="text-sm font-bold m-0">
              {blockPhase === "submitting" ? t.savingBlock : t.loadingBlock} — {run?.subjectName}…
            </p>
          </div>
        ) : (
          <div key={`${blockIdx}-${qIdx}`} style={{ ...cardStyle(), animation: "bt-fadeup .3s cubic-bezier(.22,1,.36,1) both" }} className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest" style={{ background: `${hex}1F`, border: `1px solid ${hex}`, color: hex }}>
                <Target className="w-3 h-3" />
                {q.topic}
              </span>
              <span className="tabular-nums text-xs font-bold">
                {t.questionOf} {qIdx + 1}/{questions.length}
              </span>
            </div>

            <p className="text-base sm:text-lg font-semibold leading-relaxed m-0" data-testid={`boost-session-question-${q.id}`}>
              {q.question}
            </p>

            <div className="grid gap-2.5">
              {q.options.map((opt) => {
                const isCorrect = opt.label === q.correctAnswer;
                const wasWrong = answerLocked && selected === opt.label && !isCorrect;
                const showCorrect = answerLocked && isCorrect;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSelect(opt.label)}
                    disabled={answerLocked}
                    data-testid={`boost-session-option-${q.id}-${opt.label}`}
                    className="w-full text-left px-4 py-3.5 rounded-xl text-sm flex items-center gap-3 transition-all"
                    style={{
                      background: showCorrect
                        ? "rgba(148,247,197,.14)"
                        : wasWrong
                          ? "rgba(255,141,161,.14)"
                          : "rgba(5,5,8,.6)",
                      border: `1.5px solid ${showCorrect ? "#94F7C5" : wasWrong ? "#FF8DA1" : "#1b1922"}`,
                      color: "#fff",
                      cursor: answerLocked ? "default" : "pointer",
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
                      style={{
                        background: showCorrect ? "#94F7C5" : wasWrong ? "#FF8DA1" : `${hex}26`,
                        color: showCorrect || wasWrong ? "#050508" : hex,
                      }}
                    >
                      {opt.label}
                    </span>
                    <span className="flex-1 leading-snug">{opt.text}</span>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#94F7C5" }} />}
                    {wasWrong && <XCircle className="w-5 h-5 shrink-0" style={{ color: "#FF8DA1" }} />}
                  </button>
                );
              })}
            </div>

            {answerLocked && selected !== q.correctAnswer && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(148,247,197,.1)", border: "1px solid #94F7C5" }}>
                <b style={{ color: "#94F7C5" }}>{t.correctLabel}</b>{" "}
                <b>{q.correctAnswer}</b>
                {(() => {
                  const co = q.options.find((o) => o.label === q.correctAnswer);
                  return co ? <span> — {co.text}</span> : null;
                })()}
              </div>
            )}

            {answerLocked && q.explanation && (
              <div className="rounded-xl px-4 py-3" style={{ background: "rgba(159,216,255,.08)", border: "1px solid #9FD8FF" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#9FD8FF" }} />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: "#9FD8FF" }}>
                    {t.explanation}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line m-0">{q.explanation}</p>
              </div>
            )}

            {answerLocked ? (
              <Button
                onClick={handleNextQuestion}
                data-testid="boost-session-next"
                variant="primary"
                size="lg"
                className="w-full"
              >
                {qIdx + 1 >= questions.length ? (isLastBlock ? t.finishSession : t.nextSubject) : t.nextQuestion}
                <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <p className="text-[12px] font-semibold text-center m-0">{t.selectAnswer}</p>
            )}
          </div>
        )}

        {/* ── Session controls ── */}
        {blockPhase === "quiz" && (
          <div className="flex gap-2.5">
            <Button
              onClick={() => void endBlock()}
              data-testid="boost-session-skip-subject"
              variant="outline"
              className="flex-1"
            >
              <SkipForward className="w-4 h-4" />
              {isLastBlock ? t.finishSession : t.skipSubject}
            </Button>
            {!isLastBlock && (
              <Button
                onClick={() => void endBlock({ skipRest: true })}
                data-testid="boost-session-end-early"
                variant="outline"
                className="flex-1"
              >
                <Square className="w-3.5 h-3.5" />
                {t.endEarly}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
