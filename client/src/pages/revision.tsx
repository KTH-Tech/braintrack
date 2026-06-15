import { useState, useEffect, useRef } from "react";
import { useParams, useSearch, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/lib/language-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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

export default function RevisionPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { language } = useLanguage();
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-white">
          {isAf ? "Laai hersiening vrae..." : "Loading revision questions..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/subject/${subjectId}`}>
            <button className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {isAf ? "Terug" : "Back"}
            </button>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold gradient-text">
              {isAf ? "Hersiening" : "Revision Mode"}
            </span>
            {data?.source === "ai_practice" && (
              <Badge variant="secondary" className="text-[10px]">
                {isAf ? "Oefensessie" : "Practice"}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {phase === "quiz" && totalQuestions > 0 && current && (
          <>
            {data?.hasWrongAttempts ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300/30 bg-red-500/[0.07] backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs font-semibold text-white">
                  {isAf
                    ? `${totalQuestions} vrae wat jy verkeerd geantwoord het — hersien dit nou.`
                    : `${totalQuestions} questions you previously got wrong — practice them now.`}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-300/30 bg-cyan-500/[0.07] backdrop-blur-sm">
                <Target className="w-4 h-4 text-cyan-500 shrink-0" />
                <p className="text-xs font-semibold text-white">
                  {isAf
                    ? "Oefeningsvrae vir hierdie vak. Doen die daaglikse vasvraag om verkeerde antwoorde te bou."
                    : "Practice questions for this subject. Do the daily quiz to build your wrong-answer list."}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">
                  {isAf ? `Vraag ${currentIdx + 1} van ${totalQuestions}` : `Question ${currentIdx + 1} of ${totalQuestions}`}
                </span>
                {current.topic && (
                  <Badge variant="secondary" className="text-xs">
                    {current.topic}
                  </Badge>
                )}
              </div>
              <Progress value={((currentIdx + 1) / totalQuestions) * 100} className="h-2" />
            </div>

            <Card className="rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    Q
                  </span>
                  <div className="flex-1 pt-0.5">
                    <p className="text-white font-semibold leading-relaxed text-base">
                      {current.question}
                    </p>
                    {current.timesWrong && current.timesWrong > 1 && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">
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

                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleAnswer(opt.label)}
                        disabled={submitted}
                        className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${
                          showCorrect
                            ? "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200"
                            : wasWrong
                            ? "border-red-400/60 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200"
                            : selected
                            ? "border-primary/40 bg-primary/5 text-white"
                            : "border-border hover:border-primary/30 hover:bg-primary/5 text-white"
                        } ${submitted ? "cursor-default" : "cursor-pointer active:scale-[0.99]"}`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          showCorrect ? "bg-emerald-500 text-white" : wasWrong ? "bg-red-500 text-white" : selected ? "bg-primary text-primary-foreground" : "bg-muted text-white"
                        }`}>
                          {opt.label}
                        </span>
                        <span>{opt.text}</span>
                        {showCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />}
                        {wasWrong && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {submitted && selectedAnswer && selectedAnswer !== current.correctAnswer && (
                  <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {isAf ? "Korrekte antwoord:" : "Correct answer:"}{" "}
                      <span className="font-bold">{current.correctAnswer}</span>
                      {current.options.find((o: { label: string; text: string }) => o.label === current.correctAnswer) && (
                        <span className="font-normal"> — {current.options.find((o: { label: string; text: string }) => o.label === current.correctAnswer)!.text}</span>
                      )}
                    </p>
                  </div>
                )}

                {submitted && current.explanation && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1">
                      {isAf ? "Verduideliking" : "Explanation"}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {current.explanation}
                    </p>
                  </div>
                )}

                {submitted && (
                  <Button onClick={handleNext} className="w-full">
                    {currentIdx < totalQuestions - 1
                      ? (isAf ? "Volgende Vraag" : "Next Question")
                      : (isAf ? "Sien Resultate" : "See Results")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {phase === "quiz" && totalQuestions === 0 && (
          <Card className="rounded-2xl">
            <CardContent className="p-10 text-center">
              {error ? (
                <>
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <h2 className="text-xl font-bold text-white mb-2">
                    {isAf ? "Kon nie vrae laai nie" : "Could not load questions"}
                  </h2>
                  <p className="text-white mb-6">
                    {isAf
                      ? "Iets het verkeerd gegaan. Probeer asseblief weer."
                      : "Something went wrong loading revision questions. Please try again."}
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                  <h2 className="text-xl font-bold text-white mb-2">
                    {isAf ? "Alles hersien!" : "All caught up!"}
                  </h2>
                  <p className="text-white mb-6">
                    {isAf
                      ? "Geen verkeerde antwoorde om te hersien nie. Doen die daaglikse vasvraag om jou hersiening te bou."
                      : "No wrong answers to revise. Do the daily quiz to build your revision list."}
                  </p>
                </>
              )}
              <Link href={`/subject/${subjectId}`}>
                <Button>{isAf ? "Terug na Vak" : "Back to Subject"}</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {phase === "results" && (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-primary/30 flex items-center justify-center bg-primary/10">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="text-4xl font-bold gradient-text">{scorePct}%</p>
                <p className="text-white mt-1 font-semibold">
                  {correctCount}/{totalQuestions} {isAf ? "korrek" : "correct"}
                </p>
              </div>
              <Progress value={scorePct} className="h-3" />
              <p className="text-white font-semibold">
                {scorePct >= 80
                  ? (isAf ? "Uitstekend! Jy's op dreef!" : "Excellent! You're on track!")
                  : scorePct >= 60
                  ? (isAf ? "Goeie werk! Oefen nog 'n bietjie." : "Good work! Keep practicing.")
                  : (isAf ? "Bly oefen – jy sal dit kry!" : "Keep practicing — you'll get there!")}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentIdx(0);
                    setAnswers({});
                    setSubmitted(false);
                    setPhase("quiz");
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isAf ? "Herhaal" : "Retry"}
                </Button>
                <Link href={`/subject/${subjectId}`}>
                  <Button>
                    <BookOpen className="w-4 h-4 mr-2" />
                    {isAf ? "Terug na Vak" : "Back to Subject"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
