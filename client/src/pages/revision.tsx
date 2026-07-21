import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/lib/language-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Trophy, BookOpen, Loader2, Target, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RevisionQuestion {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  topic: string | null;
  explanation: string | null;
  timesWrong?: number;
  source?: "history" | "ai_practice";
}

interface RevisionData {
  questions: RevisionQuestion[];
  subjectName: string;
  hasWrongAttempts: boolean;
  source: "history" | "ai_practice";
  total: number;
}

type QuizPhase = "loading" | "quiz" | "results";

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
});

const primaryBtnStyle: CSSProperties = {
  background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
  color: "#050508",
  border: "none",
  borderRadius: 12,
  fontWeight: 800,
};

export default function RevisionPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const { toast } = useToast();

  const [phase, setPhase] = useState<QuizPhase>("loading");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answersRef = useRef<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const sessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    setPhase("loading");
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted(false);
  }, [subjectId]);

  const { data, isLoading, error } = useQuery<RevisionData>({
    queryKey: ["/api/subjects", subjectId, "revision-questions", isAf ? "af" : "en"],
    queryFn: async () => {
      const r = await fetch(`/api/subjects/${subjectId}/revision-questions?lang=${isAf ? "af" : "en"}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load revision questions");
      return r.json();
    },
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        toast({ title: isAf ? "Fout" : "Error", description: isAf ? "Kon nie vrae laai nie." : "Could not load questions.", variant: "destructive" });
        setPhase("quiz");
      } else if (data) {
        setPhase("quiz");
      }
    }
  }, [isLoading, data, error]);

  const revisionRunIdRef = useRef<symbol | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    const thisRun = Symbol();
    revisionRunIdRef.current = thisRun;
    if (!subjectId) return;
    apiRequest("POST", "/api/study-sessions/start", { subjectId: parseInt(subjectId), context: "revision" })
      .then(r => r.json())
      .then((s: { sessionId: number }) => {
        if (revisionRunIdRef.current !== thisRun) {
          apiRequest("PATCH", `/api/study-sessions/${s.sessionId}/end`, { questionsAnswered: 0 }).catch(() => {});
          return;
        }
        sessionIdRef.current = s.sessionId;
      })
      .catch(() => {});
    return () => {
      revisionRunIdRef.current = null;
      if (sessionIdRef.current !== null) {
        const invalidateProgress = () => {
          queryClient.invalidateQueries({ queryKey: ["/api/learner/goals"] });
          queryClient.invalidateQueries({ queryKey: ["/api/learner/readiness"] });
        };
        const endSession = apiRequest("PATCH", `/api/study-sessions/${sessionIdRef.current}/end`, { questionsAnswered: Object.keys(answersRef.current).length });
        endSession.then(invalidateProgress).catch(invalidateProgress);
        sessionIdRef.current = null;
      }
    };
  }, [subjectId]);

  const retryMutation = useMutation({
    mutationFn: async ({ id, correct }: { id: number; correct: boolean }) => {
      const r = await apiRequest("PATCH", `/api/boost-wrong-answers/${id}/retry`, { correct });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learner/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learner/readiness"] });
    },
  });

  const questions = data?.questions ?? [];
  const current = questions[currentIdx];
  const totalQuestions = questions.length;
  const selectedAnswer = current ? answers[current.id] : undefined;

  function handleAnswer(label: string) {
    if (submitted || !current) return;
    setAnswers(prev => ({ ...prev, [current.id]: label }));
    setSubmitted(true);
    const correct = label === current.correctAnswer;
    if (data?.source === "history") {
      retryMutation.mutate({ id: current.id, correct });
    }
  }

  function handleNext() {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(i => i + 1);
      setSubmitted(false);
    } else {
      const invalidateProgress = () => {
        queryClient.invalidateQueries({ queryKey: ["/api/learner/goals"] });
        queryClient.invalidateQueries({ queryKey: ["/api/learner/readiness"] });
      };
      if (sessionIdRef.current !== null) {
        apiRequest("PATCH", `/api/study-sessions/${sessionIdRef.current}/end`, { questionsAnswered: totalQuestions })
          .then(invalidateProgress).catch(invalidateProgress);
        sessionIdRef.current = null;
      } else {
        invalidateProgress();
      }
      setPhase("results");
    }
  }

  const correctCount = questions.filter(q => answers[q.id] === q.correctAnswer).length;
  const scorePct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  if (isLoading || phase === "loading") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 text-white"
        style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#9FF5E8" }} />
        <p className="text-sm text-white">
          {isAf ? "Laai hersiening vrae..." : "Loading revision questions..."}
        </p>
      </div>
    );
  }

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
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href={`/subject/${subjectId}`}>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 shrink-0"
              style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
            >
              <ArrowLeft className="w-4 h-4" />
              {isAf ? "Terug" : "Back"}
            </button>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2 min-w-0">
            <RotateCcw className="w-4 h-4 shrink-0" style={{ color: "#9FF5E8" }} />
            <span className="truncate" style={marker("#9FF5E8")}>
              {isAf ? "Hersiening" : "Revision Mode"}
            </span>
            {data?.source === "ai_practice" && (
              <span
                className="text-[10px] font-black uppercase tracking-[0.14em] px-2 py-0.5 rounded-full shrink-0"
                style={{ color: "#C5B3FF", border: "1px solid #C5B3FF", background: "rgba(255,255,255,.03)" }}
              >
                {isAf ? "Oefensessie" : "Practice"}
              </span>
            )}
          </div>
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-xl bg-white/[.03] text-xs font-extrabold hover:bg-white/10 shrink-0"
            style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }}
            data-testid="button-language-toggle"
          >
            {language === "en" ? "EN" : "AF"}
          </button>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Ambient pastel auras */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-32 w-[360px] h-[360px] rounded-full blur-[120px] opacity-40"
          style={{ background: "#9FF5E8" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-56 -right-32 w-[320px] h-[320px] rounded-full blur-[120px] opacity-30"
          style={{ background: "#C5B3FF" }}
        />

        {phase === "quiz" && totalQuestions > 0 && current && (
          <>
            {data?.hasWrongAttempts ? (
              <div
                className="relative flex items-center gap-2 px-4 py-2.5"
                style={{
                  background: halo("#FF8DA1", 0.07),
                  border: `1px solid ${halo("#FF8DA1", 0.4)}`,
                  borderRadius: 14,
                  animation: "bt-fadeup .5s both",
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#FF8DA1" }} />
                <p className="text-xs font-semibold text-white">
                  {isAf
                    ? `${totalQuestions} vrae wat jy verkeerd geantwoord het — hersien dit nou.`
                    : `${totalQuestions} questions you previously got wrong — practice them now.`}
                </p>
              </div>
            ) : (
              <div
                className="relative flex items-center gap-2 px-4 py-2.5"
                style={{
                  background: halo("#9FD8FF", 0.07),
                  border: `1px solid ${halo("#9FD8FF", 0.4)}`,
                  borderRadius: 14,
                  animation: "bt-fadeup .5s both",
                }}
              >
                <Target className="w-4 h-4 shrink-0" style={{ color: "#9FD8FF" }} />
                <p className="text-xs font-semibold text-white">
                  {isAf
                    ? "Oefeningsvrae vir hierdie vak. Doen die daaglikse vasvraag om verkeerde antwoorde te bou."
                    : "Practice questions for this subject. Do the daily quiz to build your wrong-answer list."}
                </p>
              </div>
            )}

            <div className="relative space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-white">
                  {isAf ? `Vraag ${currentIdx + 1} van ${totalQuestions}` : `Question ${currentIdx + 1} of ${totalQuestions}`}
                </span>
                {current.topic && (
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ color: "#FFE29A", border: "1px solid #FFE29A", background: "rgba(255,255,255,.03)" }}
                  >
                    {current.topic}
                  </span>
                )}
              </div>
              {/* Rainbow progress bar */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentIdx + 1) / totalQuestions) * 100}%`,
                    background: RAINBOW_GRADIENT,
                  }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="relative overflow-hidden" style={{ ...cardStyle(undefined, 24), animation: "bt-fadeup .5s .05s both" }}>
              <div className="absolute top-0 inset-x-0 h-1" style={{ background: RAINBOW_GRADIENT }} aria-hidden="true" />
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold shrink-0"
                    style={{ background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508" }}
                  >
                    Q
                  </span>
                  <div className="flex-1 pt-0.5">
                    <p className="text-white font-semibold leading-relaxed text-base">
                      {current.question}
                    </p>
                    {current.timesWrong && current.timesWrong > 1 && (
                      <p className="text-[10px] mt-1 font-bold" style={{ color: "#FF8DA1" }}>
                        {isAf ? `Verkeerd ${current.timesWrong}× voorheen` : `Wrong ${current.timesWrong}× before`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {current.options.map(opt => {
                    const selected = selectedAnswer === opt.label;
                    const isCorrect = opt.label === current.correctAnswer;
                    const wasWrong = submitted && selected && !isCorrect;
                    const showCorrect = submitted && isCorrect;

                    const optionStyle: CSSProperties = showCorrect
                      ? { background: halo("#94F7C5", 0.1), border: `1.5px solid ${halo("#94F7C5", 0.6)}` }
                      : wasWrong
                      ? { background: halo("#FF8DA1", 0.1), border: `1.5px solid ${halo("#FF8DA1", 0.6)}` }
                      : selected
                      ? { background: halo("#9FF5E8", 0.08), border: "1.5px solid #9FF5E8" }
                      : { background: "rgba(255,255,255,.03)", border: "1.5px solid rgba(255,255,255,.08)" };

                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleAnswer(opt.label)}
                        disabled={submitted}
                        className={`w-full text-left flex items-center gap-3 p-4 text-sm font-medium text-white transition-all ${
                          submitted ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
                        }`}
                        style={{ borderRadius: 14, ...optionStyle }}
                        onMouseEnter={(e) => {
                          if (!submitted && !selected) e.currentTarget.style.border = "1.5px solid rgba(159,245,232,.5)";
                        }}
                        onMouseLeave={(e) => {
                          if (!submitted && !selected) e.currentTarget.style.border = "1.5px solid rgba(255,255,255,.08)";
                        }}
                      >
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0"
                          style={
                            showCorrect
                              ? { background: "#94F7C5", color: "#050508" }
                              : wasWrong
                              ? { background: "#FF8DA1", color: "#050508" }
                              : selected
                              ? { background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508" }
                              : { background: "rgba(255,255,255,.06)", color: "#ffffff" }
                          }
                        >
                          {opt.label}
                        </span>
                        <span>{opt.text}</span>
                        {showCorrect && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: "#94F7C5" }} />}
                        {wasWrong && <XCircle className="w-4 h-4 ml-auto shrink-0" style={{ color: "#FF8DA1" }} />}
                      </button>
                    );
                  })}
                </div>

                {submitted && selectedAnswer && selectedAnswer !== current.correctAnswer && (
                  <div
                    className="p-3 flex items-center gap-2"
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${halo("#94F7C5", 0.5)}`,
                      background: halo("#94F7C5", 0.1),
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#94F7C5" }} />
                    <p className="text-sm font-bold text-white">
                      {isAf ? "Korrekte antwoord:" : "Correct answer:"}{" "}
                      <span style={{ color: "#94F7C5" }}>{current.correctAnswer}</span>
                      {current.options.find((o: { label: string; text: string }) => o.label === current.correctAnswer) && (
                        <span className="font-normal"> — {current.options.find((o: { label: string; text: string }) => o.label === current.correctAnswer)!.text}</span>
                      )}
                    </p>
                  </div>
                )}

                {submitted && current.explanation && (
                  <div
                    className="p-4"
                    style={{
                      borderRadius: 12,
                      background: halo("#9FD8FF", 0.08),
                      border: `1px solid ${halo("#9FD8FF", 0.4)}`,
                    }}
                  >
                    <p className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: "#9FD8FF" }}>
                      {isAf ? "Verduideliking" : "Explanation"}
                    </p>
                    <p className="text-sm text-white leading-relaxed">
                      {current.explanation}
                    </p>
                  </div>
                )}

                {submitted && (
                  <button
                    onClick={handleNext}
                    className="w-full py-3 text-sm transition-all"
                    style={primaryBtnStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    {currentIdx < totalQuestions - 1
                      ? (isAf ? "Volgende Vraag" : "Next Question")
                      : (isAf ? "Sien Resultate" : "See Results")}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {phase === "quiz" && totalQuestions === 0 && (
          <div className="relative" style={{ ...cardStyle(error ? "#FF8DA1" : "#94F7C5", 24), animation: "bt-fadeup .5s both" }}>
            <div className="p-10 text-center">
              {error ? (
                <>
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#FF8DA1" }} />
                  <div role="heading" aria-level={2} className="text-xl font-extrabold text-white mb-2">
                    {isAf ? "Kon nie vrae laai nie" : "Could not load questions"}
                  </div>
                  <p className="text-white mb-6" style={{ opacity: 0.92 }}>
                    {isAf
                      ? "Iets het verkeerd gegaan. Probeer asseblief weer."
                      : "Something went wrong loading revision questions. Please try again."}
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: "#94F7C5" }} />
                  <span className="block mb-2" style={marker("#94F7C5", 17)}>
                    {isAf ? "Sterk gedaan! 💪" : "You're crushing it! 💪"}
                  </span>
                  <div role="heading" aria-level={2} className="text-xl font-extrabold text-white mb-2">
                    {isAf ? "Alles hersien!" : "All caught up!"}
                  </div>
                  <p className="text-white mb-6" style={{ opacity: 0.92 }}>
                    {isAf
                      ? "Geen verkeerde antwoorde om te hersien nie. Doen die daaglikse vasvraag om jou hersiening te bou."
                      : "No wrong answers to revise. Do the daily quiz to build your revision list."}
                  </p>
                </>
              )}
              <Link href={`/subject/${subjectId}`}>
                <button
                  className="px-6 py-2.5 text-sm transition-all"
                  style={primaryBtnStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  {isAf ? "Terug na Vak" : "Back to Subject"}
                </button>
              </Link>
            </div>
          </div>
        )}

        {phase === "results" && (
          <div className="relative overflow-hidden" style={{ ...cardStyle("#FFE29A", 24), animation: "bt-fadeup .5s both" }}>
            <div className="absolute top-0 inset-x-0 h-1" style={{ background: RAINBOW_GRADIENT }} aria-hidden="true" />
            <div className="p-8 text-center space-y-6">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(5,5,8,.6)",
                  border: "2px solid #FFE29A",
                  animation: "bt-float 3s ease-in-out infinite",
                }}
              >
                <Trophy className="w-10 h-10" style={{ color: "#FFE29A" }} />
              </div>
              <div>
                <p className="text-4xl font-black" style={rainbowText}>{scorePct}%</p>
                <p className="text-white mt-1 font-bold">
                  {correctCount}/{totalQuestions} {isAf ? "korrek" : "correct"}
                </p>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${scorePct}%`,
                    background: RAINBOW_GRADIENT,
                  }}
                />
              </div>
              <span style={marker("#FFB7E5", 16)}>
                {scorePct >= 80
                  ? (isAf ? "Uitstekend! Jy's op dreef!" : "Excellent! You're on track!")
                  : scorePct >= 60
                  ? (isAf ? "Goeie werk! Oefen nog 'n bietjie." : "Good work! Keep practicing.")
                  : (isAf ? "Bly oefen – jy sal dit kry!" : "Keep practicing — you'll get there!")}
              </span>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => {
                    setCurrentIdx(0);
                    setAnswers({});
                    setSubmitted(false);
                    setPhase("quiz");
                  }}
                  className="inline-flex items-center px-5 py-2.5 text-sm font-bold hover:bg-white/5 transition-colors"
                  style={{ background: "transparent", border: "1.5px solid #9FD8FF", color: "#9FD8FF", borderRadius: 12 }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isAf ? "Herhaal" : "Retry"}
                </button>
                <Link href={`/subject/${subjectId}`}>
                  <button
                    className="inline-flex items-center px-5 py-2.5 text-sm transition-all"
                    style={primaryBtnStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {isAf ? "Terug na Vak" : "Back to Subject"}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
