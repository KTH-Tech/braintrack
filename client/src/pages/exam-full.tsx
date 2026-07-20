import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ExamQuestionText } from "@/components/exam/exam-question-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MarkingFeedback, type MarkingResult } from "@/components/exam/marking-feedback";
import { ConfettiBurst } from "@/components/confetti-burst";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
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

/* ── Street-pastel building blocks (design-guidelines.md) ───────────────── */

function PrimaryBtn({ children, onClick, disabled, testId, full, size = "md" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  testId?: string;
  full?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const pad = size === "lg" ? "px-6 py-3.5 text-base" : size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`${full ? "w-full " : ""}inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all disabled:opacity-40 ${pad}`}
      style={{
        background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
        color: "#050508",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, disabled, testId, color = "#ffffff", full }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  testId?: string;
  color?: string;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`${full ? "w-full " : ""}inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-40`}
      style={{
        background: "transparent",
        color,
        border: color === "#ffffff" ? "1.5px solid rgba(255,255,255,.2)" : `1.5px solid ${color}`,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
    >
      {children}
    </button>
  );
}

function GlassCard({ children, accent, className = "", style, testId }: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      data-testid={testId}
      style={{
        background: "rgba(255,255,255,.03)",
        border: accent ? `1.5px solid ${accent}` : "1px solid rgba(255,255,255,.08)",
        borderRadius: 22,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Shell with the graffiti sticky header, used on the select + results phases */
function StreetShell({ isAf, eyebrow, children }: {
  isAf: boolean;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white relative overflow-x-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      {/* Ambient auras — kept faint for focused exam chrome */}
      <div aria-hidden className="pointer-events-none fixed -top-24 -left-24 w-[380px] h-[380px] rounded-full blur-[120px] opacity-20" style={{ background: "#9FF5E8" }} />
      <div aria-hidden className="pointer-events-none fixed -bottom-24 -right-24 w-[340px] h-[340px] rounded-full blur-[120px] opacity-15" style={{ background: "#C5B3FF" }} />

      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,.08)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <GraduationCap className="w-4 h-4 shrink-0" style={{ color: "#9FF5E8", filter: "drop-shadow(0 0 4px #9FF5E8)" }} />
              <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#9FF5E8", transform: "rotate(-2deg)", display: "inline-block" }}>
                {isAf ? "Volle Eksamen" : "Full Exam"}
              </span>
              <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-[0.18em] text-white truncate" style={{ opacity: 0.85 }}>
                · {eyebrow}
              </span>
            </div>
            <Link href="/dashboard">
              <button
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10"
                style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">{isAf ? "Tuis" : "Home"}</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">{children}</main>
    </div>
  );
}

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

/**
 * For a wrong MCQ answer, shows the full correct option ("B — text"), not
 * just a bare letter — mirrors the callout used on the Mini Mock results
 * screen so the "what was the right answer" explanation reads the same
 * across both exam modes.
 */
function McqCorrectAnswerCallout({
  paper,
  questionId,
  result,
  isAf,
}: {
  paper: FullPaper | null;
  questionId: number;
  result: MarkingResult;
  isAf: boolean;
}) {
  const question = paper?.questions.find((pq) => pq.id === questionId);
  if (!question?.mcqOptions || question.mcqOptions.length === 0) return null;
  if (result.marksAwarded >= result.marksAvailable) return null;
  const correctLetter = result.perCriterion[0]?.missed?.[0];
  if (!correctLetter) return null;
  const opt = question.mcqOptions.find((o) => o.letter === correctLetter);
  return (
    <div
      className="flex items-start gap-2 rounded-xl px-3 py-2"
      style={{ background: "rgba(148,247,197,.08)", border: "1px solid rgba(148,247,197,.4)" }}
    >
      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#94F7C5" }} />
      <p className="text-sm font-semibold" style={{ color: "#94F7C5" }}>
        {isAf ? "Korrekte antwoord:" : "Correct answer:"}{" "}
        <span className="font-bold">{correctLetter}</span>
        {opt && <span className="font-normal text-white"> — {opt.text}</span>}
      </p>
    </div>
  );
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
      <StreetShell isAf={isAf} eyebrow={isAf ? "Getyd en memo-gemerk" : "Timed and memo-marked"}>
        {/* Hero */}
        <section style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="inline-flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 4px #FFE29A)" }} />
            <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFE29A", transform: "rotate(-2deg)", display: "inline-block" }}>
              {isAf ? "Die groot een" : "The big one"}
            </span>
          </div>
          <div
            role="heading"
            aria-level={1}
            className="font-black leading-[0.95] tracking-tight text-3xl sm:text-4xl"
            style={{
              backgroundImage: "linear-gradient(90deg, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {isAf ? "Volle Eksamen" : "Full Exam"}
          </div>
          <p className="text-white text-sm sm:text-base mt-3 max-w-xl" style={{ opacity: 0.94 }}>
            {isAf ? "Volledige DBE vraestel — getyd en memo-gemerk" : "Full DBE paper — timed and memo-marked"}
          </p>
        </section>

        <GlassCard className="p-5 sm:p-6" style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) .08s both" }}>
          <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#FFE29A,#94F7C5,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
          {examLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[22px]" style={{ background: "rgba(5,5,8,.85)", backdropFilter: "blur(4px)" }}>
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#9FF5E8" }} />
              <p className="text-sm font-bold text-white">
                {isAf ? "Vraestel word gelaai…" : "Fetching paper…"}
              </p>
            </div>
          )}
          <div className="space-y-5">
            <div
              className="rounded-xl p-3 text-sm flex gap-2"
              style={{
                background: "rgba(5,5,8,.6)",
                border: "1px solid rgba(255,226,154,0.55)",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 4px #FFE29A)" }} />
              <p className="text-white">
                {isAf
                  ? "Hierdie modus simuleer 'n DBE vraestel: getyd, een keer indien aan die einde. Antwoorde word teen die memorandum gemerk."
                  : "This mode simulates a DBE paper: timed, single submission at the end. Answers are marked against the memorandum."}
              </p>
            </div>

            {groupsError ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,141,161,.08)", border: "1.5px solid #FF8DA1" }}
                >
                  <AlertCircle className="w-6 h-6" style={{ color: "#FF8DA1" }} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-white">
                    {isAf ? "Kon nie vraestelle laai nie" : "Couldn't load papers"}
                  </p>
                  <p className="text-sm text-white" style={{ opacity: 0.85 }}>
                    {isAf
                      ? "Kyk jou internetverbinding en probeer weer."
                      : "Check your connection and try again."}
                  </p>
                </div>
                <PrimaryBtn
                  onClick={() => refetchGroups()}
                  disabled={groupsRefetching}
                  testId="button-retry-groups"
                >
                  <RefreshCw className={`w-4 h-4 ${groupsRefetching ? "animate-spin" : ""}`} />
                  {groupsRefetching ? (isAf ? "Probeer…" : "Retrying…") : (isAf ? "Probeer Weer" : "Try Again")}
                </PrimaryBtn>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{isAf ? "Vak" : "Subject"}</label>
                <Select value={subject} onValueChange={(v) => { setSubject(v); setPaperKey(""); setExamError(""); }} disabled={groupsLoading || examLoading}>
                  <SelectTrigger
                    className="h-12 rounded-xl text-white"
                    style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(255,255,255,.18)" }}
                  >
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
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{isAf ? "Vraestel" : "Paper"}</label>
                <Select value={paperKey} onValueChange={(v) => { setPaperKey(v); setExamError(""); }} disabled={examLoading}>
                  <SelectTrigger
                    className="h-12 rounded-xl text-white"
                    style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(255,255,255,.18)" }}
                  >
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

            <PrimaryBtn onClick={startExam} disabled={!paperKey || examLoading} full size="lg">
              {examLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              {examLoading
                ? (isAf ? "Laai…" : "Loading…")
                : (isAf ? "Begin eksamen" : "Start exam")}
            </PrimaryBtn>

            {examError && (
              <div
                className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(255,141,161,.08)", border: "1px solid rgba(255,141,161,.45)", color: "#FF8DA1" }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{examError}</span>
              </div>
            )}
          </div>
        </GlassCard>
      </StreetShell>
    );
  }

  // ── Active exam ───────────────────────────────────────────
  if (phase === "exam" && paper) {
    const answered = Object.values(answers).filter((a) => a && a.trim().length > 0).length;
    const lowTime = secondsLeft <= 300;
    const timerHex = lowTime ? "#FF8DA1" : "#FFE29A";
    return (
      <div className="min-h-screen text-white relative overflow-x-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {/* Exit confirmation dialog */}
          <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <DialogContent
              className="text-white"
              style={{ background: "#0A0A10", border: "1px solid rgba(255,255,255,.12)", borderRadius: 22, fontFamily: "'Poppins',sans-serif" }}
            >
              <DialogHeader>
                <DialogTitle className="text-white">
                  {isAf ? "Eksamen verlaat?" : "Leave exam?"}
                </DialogTitle>
                <DialogDescription className="text-white" style={{ opacity: 0.9 }}>
                  {isAf
                    ? "Jou antwoorde en tydteller sal verlore gaan. Hierdie aksie kan nie ongedaan gemaak word nie."
                    : "Your answers and timer progress will be lost. This cannot be undone."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:gap-0">
                <GhostBtn onClick={() => setShowExitDialog(false)} color="#9FD8FF">
                  {isAf ? "Bly in eksamen" : "Stay in exam"}
                </GhostBtn>
                <GhostBtn
                  color="#FF8DA1"
                  onClick={() => {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setShowExitDialog(false);
                    navigate("/dashboard");
                  }}
                >
                  {isAf ? "Ja, verlaat" : "Yes, leave"}
                </GhostBtn>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div
            className="sticky top-2 z-20 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap"
            style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.08)" }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitDialog(true)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/[.03] hover:bg-white/10 transition-colors"
                style={{ color: "#FFB7E5", border: "1.5px solid #FFB7E5" }}
                title={isAf ? "Verlaat eksamen" : "Leave exam"}
              >
                <LogOut className="w-4 h-4" />
              </button>
              <span
                className="inline-flex items-center gap-1.5 font-mono font-bold text-lg tabular-nums"
                style={{ color: timerHex }}
              >
                <Clock className="w-5 h-5" />
                {formatTime(secondsLeft)}
              </span>
              <span className="text-sm font-bold text-white tabular-nums">
                {answered}/{paper.questions.length} {isAf ? "beantwoord" : "answered"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ color: "#C5B3FF", background: "rgba(197,179,255,.06)", border: "1px solid rgba(197,179,255,.4)" }}
              >
                {paper.subject} {paper.year} P{paper.paperNumber}
              </span>
              <PrimaryBtn
                size="sm"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isAf ? "Dien in" : "Submit"}
              </PrimaryBtn>
            </div>
          </div>

          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(answered / paper.questions.length) * 100}%`, background: "linear-gradient(90deg,#9FF5E8,#C5B3FF)" }}
            />
          </div>

          <div className="space-y-4">
            {paper.questions.map((q) => (
              <GlassCard key={q.id}>
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="text-sm font-bold text-white">
                      {isAf ? "Vraag" : "Question"} {q.questionNumber}
                      {q.topic && <span className="ml-2 text-xs font-normal" style={{ color: "#C5B3FF" }}>· {q.topic}</span>}
                    </p>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ color: "#FFE29A", background: "rgba(255,226,154,.1)", border: "1px solid rgba(255,226,154,.45)" }}
                    >
                      {q.marks} {isAf ? "merke" : "marks"}
                    </span>
                  </div>
                  <ExamQuestionText text={q.questionText} className="text-sm text-white" />

                  {q.mcqOptions && q.mcqOptions.length > 0 ? (
                    <div className="space-y-2">
                      {q.mcqOptions.map((o) => {
                        const active = answers[q.id] === o.letter;
                        return (
                          <button
                            key={o.letter}
                            type="button"
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.letter }))}
                            className="w-full text-left p-3 rounded-xl transition-all flex items-center gap-3"
                            style={{
                              background: active ? "rgba(159,245,232,.08)" : "rgba(255,255,255,.02)",
                              border: active ? "1.5px solid #9FF5E8" : "1.5px solid rgba(255,255,255,.12)",
                            }}
                          >
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
                              style={{
                                background: active ? "linear-gradient(100deg,#9FF5E8,#C5B3FF)" : "rgba(5,5,8,.6)",
                                color: active ? "#050508" : "#ffffff",
                                border: active ? "none" : "1px solid rgba(255,255,255,.18)",
                              }}
                            >
                              {o.letter}
                            </span>
                            <span className="flex-1 text-sm text-white leading-snug">{o.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <Textarea
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      placeholder={isAf ? "Jou antwoord…" : "Your answer…"}
                      rows={3}
                      className="resize-none text-white placeholder:text-white rounded-xl focus-visible:ring-[#9FF5E8]/40 focus-visible:border-[#9FF5E8]"
                      style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(255,255,255,.18)" }}
                    />
                  )}
                </div>
              </GlassCard>
            ))}
          </div>

          <PrimaryBtn onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} full size="lg">
            {submitMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isAf ? "Dien volledige eksamen in" : "Submit full exam"}
          </PrimaryBtn>

          {submitMutation.isError && !submitMutation.isPending && (
            <div
              className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(255,141,161,.08)", border: "1px solid rgba(255,141,161,.45)", color: "#FF8DA1" }}
              data-testid="full-exam-submit-error"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <p>{submitErrorMessage}</p>
                <GhostBtn
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  color="#FF8DA1"
                  testId="button-retry-submit"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${submitMutation.isPending ? "animate-spin" : ""}`} />
                  {isAf ? "Probeer weer" : "Retry"}
                </GhostBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────
  if (phase === "results" && result) {
    const gradeHex =
      result.percentage >= 80 ? "#94F7C5"
      : result.percentage >= 60 ? "#9FF5E8"
      : result.percentage >= 40 ? "#FFE29A"
      : "#FFB7E5";
    return (
      <StreetShell isAf={isAf} eyebrow={`${result.subject} · ${result.year} · ${isAf ? "Vraestel" : "Paper"} ${result.paperNumber}`}>
        <GlassCard accent={gradeHex} className="p-6 sm:p-8 text-center" style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) both" }}>
          <ConfettiBurst />
          <div className="relative space-y-3">
            <div
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${gradeHex}` }}
            >
              <Trophy className="w-8 h-8" style={{ color: gradeHex, filter: `drop-shadow(0 0 8px ${gradeHex})` }} />
            </div>
            <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 18, color: gradeHex, transform: "rotate(-1.5deg)" }}>
              {isAf ? "Eksamen-resultate" : "Exam Results"}
            </div>
            <div className="text-5xl font-black tabular-nums text-white">
              {result.marksAwarded} <span className="text-white" style={{ opacity: 0.85 }}>/ {result.marksAvailable}</span>
            </div>
            <div className="text-2xl font-black tabular-nums" style={{ color: gradeHex }}>{result.percentage}%</div>
            <div className="h-2.5 rounded-full overflow-hidden mx-auto max-w-sm" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div className="h-full rounded-full" style={{ width: `${result.percentage}%`, background: `linear-gradient(90deg,#9FF5E8,${gradeHex})` }} />
            </div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-white" style={{ opacity: 0.9 }}>
              {isAf ? "Memo-gedryf merk" : "Memo-driven marking"}
            </p>
          </div>
        </GlassCard>

        {result.sections.length > 1 && (
          <GlassCard className="p-5">
            <div className="space-y-3">
              <p className="text-sm font-black text-white uppercase tracking-[0.14em]">{isAf ? "Per afdeling" : "Section by section"}</p>
              {result.sections.map((s, i) => {
                const PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];
                const sHex = PASTELS[i % PASTELS.length];
                return (
                  <div key={s.section} className="space-y-1">
                    <div className="flex justify-between text-sm text-white">
                      <span className="font-semibold">
                        {isAf ? "Afdeling" : "Section"} {s.section} · {s.questions} {isAf ? "vrae" : "questions"}
                      </span>
                      <span className="tabular-nums" style={{ color: sHex }}>{s.awarded}/{s.available} ({s.percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${s.percentage}%`, background: sHex }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        <div className="space-y-3">
          <p className="text-sm font-black text-white uppercase tracking-[0.14em]">{isAf ? "Per vraag" : "Question by question"}</p>
          {result.perQuestion.map((q) => (
            <div key={q.questionId} className="space-y-2">
              <MarkingFeedback
                result={q}
                isAf={isAf}
                questionNumber={q.questionNumber}
                questionText={q.questionText}
              />
              <McqCorrectAnswerCallout paper={paper} questionId={q.questionId} result={q} isAf={isAf} />
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <GhostBtn onClick={() => { setPhase("select"); setResult(null); setPaper(null); setPaperKey(""); }} color="#C5B3FF">
            {isAf ? "Nuwe vraestel" : "New paper"}
          </GhostBtn>
          <Link href="/exam/mini-mock">
            <PrimaryBtn>
              {isAf ? "Probeer Mini Mock" : "Try Mini Mock"}
              <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </Link>
        </div>
      </StreetShell>
    );
  }

  return null;
}
