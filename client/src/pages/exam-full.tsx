import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExamQuestionText } from "@/components/exam/exam-question-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { MarkingFeedback, type MarkingResult } from "@/components/exam/marking-feedback";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  Trophy,
  AlertCircle,
  GraduationCap,
  LogOut,
} from "lucide-react";

interface PaperMeta {
  subject: string;
  year: number;
  session: string;
  paperNumber: number;
  questionCount: number;
  totalMarks: number;
}

interface PaperGroup {
  subject: string;
  papers: PaperMeta[];
}

interface FullPaper {
  subject: string;
  year: number;
  session: string | null;
  paperNumber: number;
  totalMarks: number;
  timeMinutes: number;
  questions: {
    id: number;
    questionNumber: string;
    questionText: string;
    marks: number;
    topic: string | null;
    cognitiveLevel: string | null;
    mcqOptions: Array<{ letter: string; text: string }> | null;
  }[];
}

interface FullResult {
  subject: string;
  year: number;
  paperNumber: number;
  session: string | null;
  marksAwarded: number;
  marksAvailable: number;
  percentage: number;
  band: "red" | "amber" | "green" | "star";
  sections: { section: string; awarded: number; available: number; questions: number; percentage: number }[];
  perQuestion: Array<MarkingResult & {
    questionId: number;
    questionNumber: string;
    questionText: string;
    marks: number;
    memoExcerpt: string | null;
    learnerAnswer: string;
  }>;
}

type Phase = "select" | "exam" | "results";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ExamFullPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const search = useSearch();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const preselectedSubject = useMemo(
    () => new URLSearchParams(search).get("subject") ?? "",
    [search],
  );

  const [phase, setPhase] = useState<Phase>("select");
  const [subject, setSubject] = useState<string>("");
  const [paperKey, setPaperKey] = useState<string>("");
  const [paper, setPaper] = useState<FullPaper | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<FullResult | null>(null);
  const [examError, setExamError] = useState<string>("");
  const [examLoading, setExamLoading] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: groups, isLoading: groupsLoading, isError: groupsError, refetch: refetchGroups, isRefetching: groupsRefetching } = useQuery<PaperGroup[]>({
    queryKey: ["/api/exam/full/papers"],
  });

  const subjectGroup = useMemo(
    () => groups?.find((g) => g.subject === subject) ?? null,
    [groups, subject],
  );

  useEffect(() => {
    if (!subject && preselectedSubject && groups && groups.length > 0) {
      const match = groups.find(
        (g) => g.subject.toLowerCase() === preselectedSubject.toLowerCase(),
      );
      if (match) {
        setSubject(match.subject);
        setPaperKey("");
      }
    }
  }, [preselectedSubject, groups, subject]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!paper) throw new Error("No paper loaded");
      const r = await apiRequest("POST", "/api/exam/full/submit", {
        subject: paper.subject,
        year: paper.year,
        paperNumber: paper.paperNumber,
        session: paper.session,
        answers,
      });
      return (await r.json()) as FullResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setPhase("results");
      if (timerRef.current) clearInterval(timerRef.current);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: isAf ? "Indiening het misluk" : "Submission failed",
        description: isAf
          ? "Ons kon nie jou eksamen indien nie. Kontroleer jou verbinding en probeer weer — jou antwoorde is steeds hier."
          : "We couldn't submit your exam. Check your connection and try again — your answers are still here.",
      });
    },
  });

  const submitErrorMessage = isAf
    ? "Kon nie jou eksamen indien nie. Jou antwoorde is veilig — probeer asseblief weer."
    : "Could not submit your exam. Your answers are safe — please retry.";

  const startExam = async () => {
    if (!paperKey) return;
    setExamError("");
    setExamLoading(true);
    try {
      const [year, paperNumber, session] = paperKey.split("|");
      // Always send `session` explicitly — the server treats "null"/empty
      // as IS NULL, so this guarantees we fetch exactly the sitting the
      // learner picked.
      const qs = new URLSearchParams({ subject, year, paperNumber, session: session ?? "null" });
      const r = await fetch(`/api/exam/full/paper?${qs}`, { credentials: "include" });
      if (!r.ok) {
        const msg = r.status === 401 || r.status === 403
          ? (isAf ? "Jy is nie gemagtig nie. Meld asseblief aan." : "You are not authorised. Please log in.")
          : r.status === 404
            ? (isAf ? "Vraestel nie gevind nie." : "Paper not found.")
            : (isAf ? `Serverfout (${r.status}). Probeer asseblief weer.` : `Server error (${r.status}). Please try again.`);
        setExamError(msg);
        return;
      }
      const data: FullPaper = await r.json();
      if (!data.questions || data.questions.length === 0) {
        setExamError(isAf ? "Geen vrae beskikbaar vir hierdie vraestel nie." : "No questions available for this paper.");
        return;
      }
      setPaper(data);
      setAnswers({});
      setSecondsLeft(data.timeMinutes * 60);
      setPhase("exam");
    } catch (err) {
      setExamError(isAf ? "Netwerkfout. Kontroleer jou verbinding en probeer weer." : "Network error. Check your connection and try again.");
    } finally {
      setExamLoading(false);
    }
  };

  // Countdown — keep mutation call outside the setState callback to avoid
  // React warnings about calling side-effects during state derivation.
  useEffect(() => {
    if (phase !== "exam") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s <= 1 ? 0 : s - 1;
        return next;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-submit when the clock hits zero (watching secondsLeft directly)
  useEffect(() => {
    if (phase === "exam" && secondsLeft === 0 && !submitMutation.isPending) {
      if (timerRef.current) clearInterval(timerRef.current);
      submitMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  // Block browser tab close / refresh during the exam
  useEffect(() => {
    if (phase !== "exam") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [phase]);

  // ── Setup ─────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <PageHeader
          icon={GraduationCap}
          title={isAf ? "Volle Eksamen" : "Full Exam"}
          subtitle={isAf ? "Volledige DBE vraestel — getyd en memo-gemerk" : "Full DBE paper — timed and memo-marked"}
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
          {examLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-card/80 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">
                {isAf ? "Vraestel word gelaai…" : "Fetching paper…"}
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
              <p className="text-white">
                {isAf
                  ? "Hierdie modus simuleer 'n DBE vraestel: getyd, een keer indien aan die einde. Antwoorde word teen die memorandum gemerk."
                  : "This mode simulates a DBE paper: timed, single submission at the end. Answers are marked against the memorandum."}
              </p>
            </div>

            {groupsError ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {isAf ? "Kon nie vraestelle laai nie" : "Couldn't load papers"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isAf
                      ? "Kyk jou internetverbinding en probeer weer."
                      : "Check your connection and try again."}
                  </p>
                </div>
                <Button
                  onClick={() => refetchGroups()}
                  disabled={groupsRefetching}
                  className="rounded-2xl font-semibold"
                  data-testid="button-retry-groups"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${groupsRefetching ? "animate-spin" : ""}`} />
                  {groupsRefetching ? (isAf ? "Probeer…" : "Retrying…") : (isAf ? "Probeer Weer" : "Try Again")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold">{isAf ? "Vak" : "Subject"}</label>
                <Select value={subject} onValueChange={(v) => { setSubject(v); setPaperKey(""); setExamError(""); }} disabled={groupsLoading || examLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      groupsLoading
                        ? (isAf ? "Laai vakke…" : "Loading subjects…")
                        : (isAf ? "Kies vak…" : "Choose subject…")
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {(groups ?? []).map((g) => (
                      <SelectItem key={g.subject} value={g.subject}>
                        {g.subject} ({g.papers.length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!groupsError && subjectGroup && (
              <div className="space-y-2">
                <label className="text-sm font-semibold">{isAf ? "Vraestel" : "Paper"}</label>
                <Select value={paperKey} onValueChange={(v) => { setPaperKey(v); setExamError(""); }} disabled={examLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={isAf ? "Kies vraestel…" : "Choose paper…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectGroup.papers.map((p) => (
                      <SelectItem
                        key={`${p.year}|${p.paperNumber}|${p.session}`}
                        value={`${p.year}|${p.paperNumber}|${p.session}`}
                      >
                        {p.year} {p.session} · {isAf ? "Vraestel" : "Paper"} {p.paperNumber} · {p.questionCount}Q · {p.totalMarks} {isAf ? "merke" : "marks"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={startExam} disabled={!paperKey || examLoading} size="lg" className="w-full">
              {examLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <FileText className="w-5 h-5 mr-2" />
              )}
              {examLoading
                ? (isAf ? "Laai…" : "Loading…")
                : (isAf ? "Begin eksamen" : "Start exam")}
            </Button>

            {examError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{examError}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Active exam ───────────────────────────────────────────
  if (phase === "exam" && paper) {
    const answered = Object.values(answers).filter((a) => a && a.trim().length > 0).length;
    const lowTime = secondsLeft <= 300;
    return (
      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Exit confirmation dialog */}
        <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isAf ? "Eksamen verlaat?" : "Leave exam?"}
              </DialogTitle>
              <DialogDescription>
                {isAf
                  ? "Jou antwoorde en tydteller sal verlore gaan. Hierdie aksie kan nie ongedaan gemaak word nie."
                  : "Your answers and timer progress will be lost. This cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowExitDialog(false)}>
                {isAf ? "Bly in eksamen" : "Stay in exam"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setShowExitDialog(false);
                  navigate("/dashboard");
                }}
              >
                {isAf ? "Ja, verlaat" : "Yes, leave"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="sticky top-2 z-20 rounded-2xl border bg-card/95 backdrop-blur p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExitDialog(true)}
              className="text-muted-foreground hover:text-foreground"
              title={isAf ? "Verlaat eksamen" : "Leave exam"}
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <span className={`inline-flex items-center gap-1.5 font-mono font-bold text-lg ${lowTime ? "text-red-500" : "text-foreground"}`}>
              <Clock className="w-5 h-5" />
              {formatTime(secondsLeft)}
            </span>
            <span className="text-sm text-foreground">
              {answered}/{paper.questions.length} {isAf ? "beantwoord" : "answered"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{paper.subject} {paper.year} P{paper.paperNumber}</span>
            <Button
              size="sm"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              variant={answered === paper.questions.length ? "default" : "outline"}
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              {isAf ? "Dien in" : "Submit"}
            </Button>
          </div>
        </div>

        <Progress value={(answered / paper.questions.length) * 100} className="h-1.5" />

        <div className="space-y-4">
          {paper.questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <p className="text-sm font-bold">
                    {isAf ? "Vraag" : "Question"} {q.questionNumber}
                    {q.topic && <span className="ml-2 text-xs text-muted-foreground font-normal">· {q.topic}</span>}
                  </p>
                  <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-full">
                    {q.marks} {isAf ? "merke" : "marks"}
                  </span>
                </div>
                <ExamQuestionText text={q.questionText} className="text-sm text-foreground" />

                {q.mcqOptions && q.mcqOptions.length > 0 ? (
                  <div className="space-y-2">
                    {q.mcqOptions.map((o) => (
                      <button
                        key={o.letter}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.letter }))}
                        className={`w-full text-left p-2.5 rounded-lg border-2 text-sm transition-colors ${
                          answers[q.id] === o.letter
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="font-bold mr-2">{o.letter}.</span>
                        {o.text}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    placeholder={isAf ? "Jou antwoord…" : "Your answer…"}
                    rows={3}
                    className="resize-none"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} size="lg" className="w-full">
          {submitMutation.isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          {isAf ? "Dien volledige eksamen in" : "Submit full exam"}
        </Button>

        {submitMutation.isError && !submitMutation.isPending && (
          <div
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            data-testid="full-exam-submit-error"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <p>{submitErrorMessage}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                data-testid="button-retry-submit"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${submitMutation.isPending ? "animate-spin" : ""}`} />
                {isAf ? "Probeer weer" : "Retry"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────
  if (phase === "results" && result) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        <PageHeader
          icon={Trophy}
          title={isAf ? "Eksamen-resultate" : "Exam Results"}
          subtitle={`${result.subject} · ${result.year} · ${isAf ? "Vraestel" : "Paper"} ${result.paperNumber}`}
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
              {result.marksAwarded} / {result.marksAvailable}
            </div>
            <div className="text-2xl text-foreground">{result.percentage}%</div>
            <Progress value={result.percentage} className="h-3" />
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
              {isAf ? "Memo-gedryf merk" : "Memo-driven marking"}
            </p>
          </CardContent>
        </Card>

        {result.sections.length > 1 && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="text-sm font-bold">{isAf ? "Per afdeling" : "Section by section"}</p>
              {result.sections.map((s) => (
                <div key={s.section} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">
                      {isAf ? "Afdeling" : "Section"} {s.section} · {s.questions} {isAf ? "vrae" : "questions"}
                    </span>
                    <span>{s.awarded}/{s.available} ({s.percentage}%)</span>
                  </div>
                  <Progress value={s.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <p className="text-sm font-bold">{isAf ? "Per vraag" : "Question by question"}</p>
          {result.perQuestion.map((q) => (
            <MarkingFeedback
              key={q.questionId}
              result={q}
              isAf={isAf}
              questionNumber={q.questionNumber}
              questionText={q.questionText}
            />
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={() => { setPhase("select"); setResult(null); setPaper(null); setPaperKey(""); }} variant="outline">
            {isAf ? "Nuwe vraestel" : "New paper"}
          </Button>
          <Link href="/exam/mini-mock">
            <Button>
              {isAf ? "Probeer Mini Mock" : "Try Mini Mock"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
