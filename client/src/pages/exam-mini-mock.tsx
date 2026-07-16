import { useState, useMemo, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExamQuestionText } from "@/components/exam/exam-question-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { MarkingFeedback, type MarkingResult } from "@/components/exam/marking-feedback";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
  Trophy,
  Zap,
  RotateCcw,
} from "lucide-react";

function McqCorrectAnswerCallout({
  question,
  result,
  isAf,
}: {
  question: MiniMockQuestion;
  result: MarkingResult;
  isAf: boolean;
}) {
  if (!question.mcqOptions || question.mcqOptions.length === 0) return null;
  if (result.marksAwarded >= result.marksAvailable) return null;
  const correctLetter = result.perCriterion[0]?.missed?.[0];
  if (!correctLetter) return null;
  const opt = question.mcqOptions.find((o) => o.letter === correctLetter);
  return (
    <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
        {isAf ? "Korrekte antwoord:" : "Correct answer:"}{" "}
        <span className="font-bold">{correctLetter}</span>
        {opt && <span className="font-normal"> — {opt.text}</span>}
      </p>
    </div>
  );
}

interface SubjectEntry {
  subject: string;
  total: number;
  topics: { name: string; count: number }[];
}

interface MiniMockQuestion {
  id: number;
  questionNumber: string;
  questionText: string;
  marks: number;
  topic: string | null;
  cognitiveLevel: string | null;
  year: number;
  paperNumber: number;
  mcqOptions: Array<{ letter: string; text: string }> | null;
}

const COUNT_OPTIONS = [5, 8, 10, 12, 15];

export default function ExamMiniMockPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const { toast } = useToast();
  const search = useSearch();
  const preselectedSubject = useMemo(
    () => new URLSearchParams(search).get("subject") ?? "",
    [search],
  );
  const preselectedTopic = useMemo(
    () => new URLSearchParams(search).get("topic") ?? "",
    [search],
  );
  const [topicAutoApplied, setTopicAutoApplied] = useState(false);

  const [subject, setSubject] = useState<string>("");
  const [topic, setTopic] = useState<string>("all");
  const [count, setCount] = useState<number>(10);
  const [questions, setQuestions] = useState<MiniMockQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<Record<number, MarkingResult>>({});
  const [sessionDone, setSessionDone] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [startError, setStartError] = useState<string>("");

  const { data: subjects, isLoading: subjectsLoading, isError: subjectsError, refetch: refetchSubjects, isRefetching: subjectsRefetching } = useQuery<SubjectEntry[]>({
    queryKey: ["/api/exam/mini-mock/subjects"],
  });

  const subjectEntry = useMemo(
    () => subjects?.find((s) => s.subject === subject) ?? null,
    [subjects, subject],
  );

  useEffect(() => {
    if (!subject && preselectedSubject && subjects && subjects.length > 0) {
      const match = subjects.find(
        (s) => s.subject.toLowerCase() === preselectedSubject.toLowerCase(),
      );
      if (match) {
        setSubject(match.subject);
        setTopic("all");
      }
    }
  }, [preselectedSubject, subjects, subject]);

  useEffect(() => {
    if (
      !topicAutoApplied &&
      preselectedTopic &&
      subjectEntry &&
      subjectEntry.topics.length > 0
    ) {
      const match = subjectEntry.topics.find(
        (t) => t.name.toLowerCase() === preselectedTopic.toLowerCase(),
      );
      if (match) {
        setTopic(match.name);
        setTopicAutoApplied(true);
      }
    }
  }, [preselectedTopic, subjectEntry, topicAutoApplied]);

  const markMutation = useMutation({
    mutationFn: async (vars: { questionId: number; answer: string }) => {
      const r = await apiRequest("POST", "/api/exam/mini-mock/mark", vars);
      return (await r.json()) as MarkingResult;
    },
    onSuccess: (data, vars) => {
      setResults((prev) => ({ ...prev, [vars.questionId]: data }));
    },
    onError: () => {
      toast({
        title: isAf ? "Merking misluk" : "Marking failed",
        description: isAf
          ? "Kon nie jou antwoord merk nie. Kontroleer jou verbinding en probeer weer."
          : "Could not mark your answer. Check your connection and try again.",
        variant: "destructive",
      });
    },
  });

  const retryMark = () => {
    const vars = markMutation.variables;
    if (vars) markMutation.mutate(vars);
  };

  const startSession = async () => {
    if (!subject) return;
    setStartError("");
    setLoadingStart(true);
    try {
      const qs = new URLSearchParams({ subject, count: String(count) });
      if (topic && topic !== "all") qs.set("topic", topic);
      const r = await fetch(`/api/exam/mini-mock/questions?${qs}`, { credentials: "include" });
      if (!r.ok) {
        setStartError(
          r.status === 401 || r.status === 403
            ? (isAf ? "Jy is nie gemagtig nie. Meld asseblief aan." : "You are not authorised. Please log in.")
            : (isAf ? `Serverfout (${r.status}). Probeer asseblief weer.` : `Server error (${r.status}). Please try again.`),
        );
        return;
      }
      const data = await r.json();
      const qs2: MiniMockQuestion[] = data.questions ?? [];
      if (qs2.length === 0) {
        setStartError(isAf ? "Geen vrae beskikbaar nie. Kies 'n ander vak of onderwerp." : "No questions available. Try a different subject or topic.");
        return;
      }
      setQuestions(qs2);
      setCurrentIdx(0);
      setAnswer("");
      setResults({});
      setSessionDone(false);
    } catch {
      setStartError(isAf ? "Netwerkfout. Kontroleer jou verbinding en probeer weer." : "Network error. Check your connection and try again.");
    } finally {
      setLoadingStart(false);
    }
  };

  const currentQ = questions[currentIdx];
  const currentResult = currentQ ? results[currentQ.id] : null;

  const submitAnswer = () => {
    if (!currentQ || !answer.trim()) return;
    markMutation.mutate({ questionId: currentQ.id, answer });
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setAnswer("");
    }
  };

  const reset = () => {
    setQuestions([]);
    setResults({});
    setSessionDone(false);
    setAnswer("");
  };

  // ── Results screen ─────────────────────────────────────────
  if (sessionDone && questions.length > 0) {
    const totalAwarded = Object.values(results).reduce((s, r) => s + r.marksAwarded, 0);
    const totalAvailable = Object.values(results).reduce((s, r) => s + r.marksAvailable, 0);
    const pct = totalAvailable > 0 ? Math.round((totalAwarded / totalAvailable) * 100) : 0;

    return (
      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        <PageHeader
          icon={Trophy}
          title={isAf ? "Mini Mock voltooi" : "Mini Mock complete"}
          subtitle={subject}
          actions={
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                {isAf ? "Klaar" : "Done"}
              </Button>
            </Link>
          }
        />

        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="text-5xl font-bold">
              {totalAwarded} / {totalAvailable}
            </div>
            <div className="text-2xl text-foreground">{pct}%</div>
            <Progress value={pct} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {isAf
                ? `${questions.length} vrae gemerk volgens DBE memo`
                : `${questions.length} questions marked from the DBE memo`}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {questions.map((q) => {
            const r = results[q.id];
            if (!r) return null;
            return (
              <div key={q.id} className="space-y-2">
                <MarkingFeedback
                  result={r}
                  isAf={isAf}
                  questionNumber={q.questionNumber}
                  questionText={q.questionText}
                />
                <McqCorrectAnswerCallout question={q} result={r} isAf={isAf} />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            {isAf ? "Nuwe sessie" : "New session"}
          </Button>
          <Link href="/exam/full">
            <Button>
              {isAf ? "Probeer Volle Eksamen" : "Try Full Exam"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Active question ────────────────────────────────────────
  if (currentQ) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-5">
        <PageHeader
          icon={Brain}
          title={isAf ? "Mini Mock" : "Mini Mock"}
          subtitle={`${subject} · ${currentIdx + 1}/${questions.length}`}
          actions={
            <Button variant="ghost" size="sm" onClick={reset}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {isAf ? "Verlaat" : "Exit"}
            </Button>
          }
        />

        <Progress value={((currentIdx + (currentResult ? 1 : 0)) / questions.length) * 100} className="h-2" />

        <Card>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                {isAf ? "Vraag" : "Question"} {currentQ.questionNumber}
                {currentQ.topic && <span className="ml-2 text-muted-foreground">· {currentQ.topic}</span>}
              </p>
              <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-full">
                {currentQ.marks} {isAf ? "merke" : "marks"}
              </span>
            </div>
            <ExamQuestionText text={currentQ.questionText} className="text-base text-foreground" />
            <p className="text-xs text-muted-foreground">
              {isAf ? "Bron: DBE" : "Source: DBE"} {currentQ.year} · {isAf ? "Vraestel" : "Paper"} {currentQ.paperNumber}
            </p>

            {currentQ.mcqOptions && currentQ.mcqOptions.length > 0 ? (
              <div className="space-y-2">
                {currentQ.mcqOptions.map((o) => (
                  <button
                    key={o.letter}
                    type="button"
                    onClick={() => setAnswer(o.letter)}
                    disabled={!!currentResult}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                      answer === o.letter
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    } disabled:opacity-60`}
                  >
                    <span className="font-bold mr-2">{o.letter}.</span>
                    {o.text}
                  </button>
                ))}
              </div>
            ) : (
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={isAf ? "Tik jou antwoord hier…" : "Type your answer here…"}
                rows={5}
                disabled={!!currentResult}
                className="resize-none"
              />
            )}

            {!currentResult ? (
              <>
                <Button onClick={submitAnswer} disabled={!answer.trim() || markMutation.isPending} className="w-full">
                  {markMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isAf ? "Dien antwoord in" : "Submit answer"}
                </Button>
                {markMutation.isError && !markMutation.isPending && (
                  <div
                    className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    data-testid="mini-mock-mark-error"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <p>
                        {isAf
                          ? "Kon nie jou antwoord merk nie. Kontroleer jou verbinding en probeer weer."
                          : "Could not mark your answer. Check your connection and try again."}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={retryMark}
                        disabled={markMutation.isPending || !markMutation.variables}
                        data-testid="button-retry-mark"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${markMutation.isPending ? "animate-spin" : ""}`} />
                        {isAf ? "Probeer weer" : "Retry"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button onClick={nextQuestion} className="w-full">
                {currentIdx + 1 >= questions.length
                  ? (isAf ? "Sien resultate" : "See results")
                  : (isAf ? "Volgende vraag" : "Next question")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {currentResult && (
          <div className="space-y-2">
            <MarkingFeedback
              result={currentResult}
              isAf={isAf}
              questionNumber={currentQ.questionNumber}
            />
            <McqCorrectAnswerCallout question={currentQ} result={currentResult} isAf={isAf} />
          </div>
        )}
      </div>
    );
  }

  // ── Setup screen ───────────────────────────────────────────
  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <PageHeader
        icon={Zap}
        title={isAf ? "Mini Mock" : "Mini Mock"}
        subtitle={isAf ? "Vinnige memo-gemerkte oefening" : "Quick memo-marked practice"}
        actions={
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {isAf ? "Tuis" : "Home"}
            </Button>
          </Link>
        }
      />

      <Card className="relative overflow-hidden">
        {loadingStart && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-card/80 ">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              {isAf ? "Vrae word gelaai…" : "Fetching questions…"}
            </p>
          </div>
        )}
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div
            className="rounded-xl bg-black p-3 text-sm flex gap-2"
            style={{
              border: "1px solid rgba(255,230,0,0.55)",
              boxShadow: "0 0 14px rgba(255,230,0,0.25), inset 0 0 12px rgba(255,230,0,0.06)",
              color: "#FFE600",
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ filter: "drop-shadow(0 0 4px #FFE600)" }} />
            <p className="text-foreground">
              {isAf
                ? "Kies 'n vak en onderwerp. Jy kry 5–15 vrae uit DBE-vraestelle, en elke antwoord word onmiddellik teen die memo gemerk."
                : "Pick a subject and topic. You'll get 5–15 questions from DBE papers, each marked instantly against the memo."}
            </p>
          </div>

          {subjectsError ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  {isAf ? "Kon nie vakke laai nie" : "Couldn't load subjects"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAf
                    ? "Kyk jou internetverbinding en probeer weer."
                    : "Check your connection and try again."}
                </p>
              </div>
              <Button
                onClick={() => refetchSubjects()}
                disabled={subjectsRefetching}
                className="rounded-2xl font-semibold"
                data-testid="button-retry-subjects"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${subjectsRefetching ? "animate-spin" : ""}`} />
                {subjectsRefetching ? (isAf ? "Probeer…" : "Retrying…") : (isAf ? "Probeer Weer" : "Try Again")}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold">{isAf ? "Vak" : "Subject"}</label>
              <Select value={subject} onValueChange={(v) => { setSubject(v); setTopic("all"); setStartError(""); }} disabled={subjectsLoading || loadingStart}>
                <SelectTrigger data-testid="select-subject">
                  <SelectValue placeholder={
                    subjectsLoading
                      ? (isAf ? "Laai vakke…" : "Loading subjects…")
                      : (isAf ? "Kies vak…" : "Choose subject…")
                  } />
                </SelectTrigger>
                <SelectContent>
                  {(subjects ?? []).map((s) => (
                    <SelectItem key={s.subject} value={s.subject}>
                      {s.subject} ({s.total})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!subjectsLoading && (subjects?.length ?? 0) === 0 && (
                <p className="text-xs text-muted-foreground">
                  {isAf
                    ? "Geen vakke met vrygestelde vrae beskikbaar nie. Probeer later weer."
                    : "No subjects with released questions are available yet. Please check back later."}
                </p>
              )}
            </div>
          )}

          {subjectEntry && subjectEntry.topics.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">{isAf ? "Onderwerp" : "Topic"}</label>
              <Select value={topic} onValueChange={(v) => { setTopic(v); setStartError(""); }} disabled={loadingStart}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isAf ? "Alle onderwerpe" : "All topics"}</SelectItem>
                  {(() => {
                    const sorted = [...subjectEntry.topics].sort((a, b) => b.count - a.count);
                    const visible = sorted.slice(0, 30);
                    if (
                      topic &&
                      topic !== "all" &&
                      !visible.some((t) => t.name === topic)
                    ) {
                      const extra = sorted.find((t) => t.name === topic);
                      if (extra) visible.unshift(extra);
                    }
                    return visible.map((t) => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.name} ({t.count})
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">{isAf ? "Aantal vrae" : "Number of questions"}</label>
            <div className="grid grid-cols-5 gap-2">
              {COUNT_OPTIONS.map((c) => {
                const active = count === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCount(c)}
                    disabled={loadingStart}
                    data-testid={`count-${c}`}
                    className="py-2 rounded-xl font-bold text-sm transition-all bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                    style={
                      active
                        ? {
                            border: "1.5px solid #00E5FF",
                            boxShadow: "0 0 14px rgba(0,229,255,0.55), inset 0 0 10px rgba(0,229,255,0.08)",
                            color: "#00E5FF",
                          }
                        : {
                            border: "1.5px solid rgba(255,255,255,0.12)",
                            color:"#ffffff",
                          }
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={startSession} disabled={!subject || loadingStart} size="lg" className="w-full">
            {loadingStart ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Brain className="w-5 h-5 mr-2" />
            )}
            {isAf ? "Begin Mini Mock" : "Start Mini Mock"}
          </Button>

          {startError && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" data-testid="mini-mock-start-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{startError}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
