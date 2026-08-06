import { useState, useMemo, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ExamQuestionText } from "@/components/exam/exam-question-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MarkingFeedback, type MarkingResult } from "@/components/exam/marking-feedback";
import { ConfettiBurst } from "@/components/confetti-burst";
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

/* ── Street-pastel building blocks ─────────────────────────────────────── */

function PrimaryBtn({ children, onClick, disabled, testId, full, size = "md" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  testId?: string;
  full?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`${full ? "w-full " : ""}inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all disabled:opacity-40 ${size === "lg" ? "px-6 py-3.5 text-base" : "px-5 py-2.5 text-sm"}`}
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

function GlassCard({ children, accent, className = "", style }: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
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

function StreetShell({ isAf, eyebrow, onExit, children }: {
  isAf: boolean;
  eyebrow: string;
  onExit?: () => void;
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
              <Zap className="w-4 h-4 shrink-0" style={{ color: "#9FF5E8" }} />
              <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#9FF5E8", transform: "rotate(-2deg)", display: "inline-block" }}>
                Mini Mock
              </span>
              <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-[0.18em] text-white truncate" style={{ opacity: 0.85 }}>
                · {eyebrow}
              </span>
            </div>
            {onExit ? (
              <button
                onClick={onExit}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10"
                style={{ color: "#FFB7E5", border: "1.5px solid #FFB7E5" }}
              >
                <ArrowLeft className="w-4 h-4" />
                {isAf ? "Verlaat" : "Exit"}
              </button>
            ) : (
              <Link href="/dashboard">
                <button
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10"
                  style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">{isAf ? "Tuis" : "Home"}</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">{children}</main>
    </div>
  );
}

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

interface SubjectEntry {
  subject: string;
  total: number;
  topics: { name: string; count: number }[];
  /**
   * Set by the server when this subject has NO questions in the learner's
   * language — the count above is for the language named here, and starting a
   * session will explicitly fall back to it.
   */
  fallbackLanguage?: "en" | "af" | null;
}

/** Language block returned alongside learner content — see server/language.ts. */
interface LanguageMeta {
  requested: "en" | "af";
  served: "en" | "af";
  fellBack: boolean;
  notice: string | null;
}

interface MiniMockQuestion {
  id: number;
  questionNumber: string;
  questionText: string;
  marks: number;
  topic: string | null;
  cognitiveLevel: string | null;
  // Simulated questions are original + self-contained, so they carry no source
  // paper — year/paperNumber are null and mcqOptions is null.
  year: number | null;
  paperNumber: number | null;
  mcqOptions: Array<{ letter: string; text: string }> | null;
  stimulusText?: string | null;
  simulated?: boolean;
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
  /**
   * Set when the server had to serve this session in the other language
   * because the subject has no content in the learner's language. Shown to
   * the learner so the switch is never silent.
   */
  const [languageNotice, setLanguageNotice] = useState<string | null>(null);

  // `language` is part of the queryKey AND the URL: question counts are
  // per-language, so switching language must refetch rather than serve the
  // cached other-language list.
  const { data: subjects, isLoading: subjectsLoading, isError: subjectsError, refetch: refetchSubjects, isRefetching: subjectsRefetching } = useQuery<SubjectEntry[]>({
    queryKey: [`/api/exam/mini-mock/subjects?lang=${language}`, language],
    queryFn: async () => {
      const r = await fetch(`/api/exam/mini-mock/subjects?lang=${language}`, { credentials: "include" });
      if (!r.ok) throw new Error(`subjects ${r.status}`);
      return (await r.json()) as SubjectEntry[];
    },
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
      // Language is fixed for the whole session at start. The server picks one
      // language and serves every question in it — no mid-session switching.
      const qs = new URLSearchParams({ subject, count: String(count), lang: language });
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
        // contentPreparing = the simulated pool for this subject isn't ready
        // yet (nothing has cleared the 92% quality bar). Say so honestly rather
        // than implying the learner did something wrong.
        setStartError(
          data.contentPreparing
            ? (isAf
                ? "Ons berei tans oefenvrae vir hierdie vak voor. Kom binnekort terug."
                : "We're still preparing practice questions for this subject. Check back soon.")
            : (isAf
                ? "Geen vrae beskikbaar nie. Kies 'n ander vak of onderwerp."
                : "No questions available. Try a different subject or topic."),
        );
        return;
      }
      setQuestions(qs2);
      // Explicit, visible fallback — never a silent language switch.
      setLanguageNotice(data.language?.fellBack ? (data.language.notice ?? null) : null);
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
    setLanguageNotice(null);
  };

  // ── Results screen ─────────────────────────────────────────
  if (sessionDone && questions.length > 0) {
    const totalAwarded = Object.values(results).reduce((s, r) => s + r.marksAwarded, 0);
    const totalAvailable = Object.values(results).reduce((s, r) => s + r.marksAvailable, 0);
    const pct = totalAvailable > 0 ? Math.round((totalAwarded / totalAvailable) * 100) : 0;
    const gradeHex = pct >= 80 ? "#94F7C5" : pct >= 60 ? "#9FF5E8" : pct >= 40 ? "#FFE29A" : "#FFB7E5";

    return (
      <StreetShell isAf={isAf} eyebrow={subject}>
        <GlassCard accent={gradeHex} className="p-6 sm:p-8 text-center" style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) both" }}>
          <ConfettiBurst />
          <div className="relative space-y-3">
            <div
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${gradeHex}` }}
            >
              <Trophy className="w-8 h-8" style={{ color: gradeHex }} />
            </div>
            <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 18, color: gradeHex, transform: "rotate(-1.5deg)" }}>
              {isAf ? "Mini Mock voltooi!" : "Mini Mock complete!"}
            </div>
            <div className="text-5xl font-black tabular-nums text-white">
              {totalAwarded} <span className="text-white" style={{ opacity: 0.85 }}>/ {totalAvailable}</span>
            </div>
            <div className="text-2xl font-black tabular-nums" style={{ color: gradeHex }}>{pct}%</div>
            <div className="h-2.5 rounded-full overflow-hidden mx-auto max-w-sm" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg,#9FF5E8,${gradeHex})` }} />
            </div>
            <p className="text-sm text-white" style={{ opacity: 0.9 }}>
              {isAf
                ? `${questions.length} vrae gemerk volgens DBE memo`
                : `${questions.length} questions marked from the DBE memo`}
            </p>
          </div>
        </GlassCard>

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
          <GhostBtn onClick={reset} color="#C5B3FF">
            <RotateCcw className="w-4 h-4" />
            {isAf ? "Nuwe sessie" : "New session"}
          </GhostBtn>
          <Link href="/exam/full">
            <PrimaryBtn>
              {isAf ? "Probeer Volle Eksamen" : "Try Full Exam"}
              <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </Link>
        </div>
      </StreetShell>
    );
  }

  // ── Active question ────────────────────────────────────────
  if (currentQ) {
    const progressPct = ((currentIdx + (currentResult ? 1 : 0)) / questions.length) * 100;
    return (
      <StreetShell isAf={isAf} eyebrow={`${subject} · ${currentIdx + 1}/${questions.length}`} onExit={reset}>
        {/* Focused exam chrome — slim progress rail */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#9FF5E8,#C5B3FF)" }}
            />
          </div>
          <span className="text-[11px] font-black tabular-nums px-2 py-0.5 rounded-lg" style={{ color: "#9FF5E8", border: "1px solid rgba(159,245,232,.4)", background: "rgba(159,245,232,.06)" }}>
            {currentIdx + 1}/{questions.length}
          </span>
        </div>

        {/* Explicit language-fallback notice — the learner is told when this
            session is not in their chosen language, rather than the app
            appearing to switch language on its own. */}
        {languageNotice && (
          <p
            data-testid="mini-mock-language-notice"
            className="text-xs font-semibold px-3 py-2 rounded-lg"
            style={{ color: "#FFE29A", background: "rgba(255,226,154,.1)", border: "1px solid rgba(255,226,154,.45)" }}
          >
            {languageNotice}
          </p>
        )}

        <GlassCard className="p-5 sm:p-6" style={{ animation: "bt-fadeup .4s cubic-bezier(.22,1,.36,1) both" }}>
          {/* Aqua accent line */}
          <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "#9FF5E8" }} />
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                {isAf ? "Vraag" : "Question"} {currentQ.questionNumber}
                {currentQ.topic && <span className="ml-2" style={{ color: "#C5B3FF" }}>· {currentQ.topic}</span>}
              </p>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ color: "#FFE29A", background: "rgba(255,226,154,.1)", border: "1px solid rgba(255,226,154,.45)" }}
              >
                {currentQ.marks} {isAf ? "merke" : "marks"}
              </span>
            </div>
            {/* Passage/extract the question refers to — shown above the
                question so "reël 1", "die teks", a comprehension character are
                readable. Only present when the question actually needs it. */}
            {currentQ.stimulusText && currentQ.stimulusText.trim().length > 0 && (
              <div
                className="rounded-2xl p-4 mb-1"
                style={{ background: "#050508", border: "2px solid #9FD8FF", boxShadow: "4px 4px 0 0 #9FD8FF" }}
                data-testid="mini-mock-stimulus"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: "#9FD8FF" }}>
                  {isAf ? "Lees die teks" : "Read the text"}
                </p>
                <p className="text-sm text-white whitespace-pre-line leading-relaxed">
                  {currentQ.stimulusText}
                </p>
              </div>
            )}
            <ExamQuestionText text={currentQ.questionText} className="text-base text-white" />
            <p className="text-xs text-white" style={{ opacity: 0.85 }}>
              {currentQ.simulated || currentQ.year == null
                ? (isAf ? "BrainTrack-oefenvraag · KABV-belyn" : "BrainTrack practice question · CAPS-aligned")
                : `${isAf ? "Bron: DBE" : "Source: DBE"} ${currentQ.year} · ${isAf ? "Vraestel" : "Paper"} ${currentQ.paperNumber}`}
            </p>

            {currentQ.mcqOptions && currentQ.mcqOptions.length > 0 ? (
              <div className="space-y-2">
                {currentQ.mcqOptions.map((o) => {
                  const active = answer === o.letter;
                  return (
                    <button
                      key={o.letter}
                      type="button"
                      onClick={() => setAnswer(o.letter)}
                      disabled={!!currentResult}
                      className="w-full text-left p-3 rounded-xl transition-all disabled:opacity-60 flex items-center gap-3"
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
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={isAf ? "Tik jou antwoord hier…" : "Type your answer here…"}
                rows={5}
                disabled={!!currentResult}
                className="resize-none text-white placeholder:text-white rounded-xl focus-visible:ring-[#9FF5E8]/40 focus-visible:border-[#9FF5E8]"
                style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(255,255,255,.18)" }}
              />
            )}

            {!currentResult ? (
              <>
                <PrimaryBtn onClick={submitAnswer} disabled={!answer.trim() || markMutation.isPending} full>
                  {markMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isAf ? "Dien antwoord in" : "Submit answer"}
                </PrimaryBtn>
                {markMutation.isError && !markMutation.isPending && (
                  <div
                    className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
                    style={{ background: "rgba(255,141,161,.08)", border: "1px solid rgba(255,141,161,.45)", color: "#FF8DA1" }}
                    data-testid="mini-mock-mark-error"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <p>
                        {isAf
                          ? "Kon nie jou antwoord merk nie. Kontroleer jou verbinding en probeer weer."
                          : "Could not mark your answer. Check your connection and try again."}
                      </p>
                      <GhostBtn
                        onClick={retryMark}
                        disabled={markMutation.isPending || !markMutation.variables}
                        color="#FF8DA1"
                        testId="button-retry-mark"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${markMutation.isPending ? "animate-spin" : ""}`} />
                        {isAf ? "Probeer weer" : "Retry"}
                      </GhostBtn>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <PrimaryBtn onClick={nextQuestion} full>
                {currentIdx + 1 >= questions.length
                  ? (isAf ? "Sien resultate" : "See results")
                  : (isAf ? "Volgende vraag" : "Next question")}
                <ArrowRight className="w-4 h-4" />
              </PrimaryBtn>
            )}
          </div>
        </GlassCard>

        {currentResult && (
          <div className="space-y-2" style={{ animation: "bt-fadeup .4s cubic-bezier(.22,1,.36,1) both" }}>
            <MarkingFeedback
              result={currentResult}
              isAf={isAf}
              questionNumber={currentQ.questionNumber}
            />
            <McqCorrectAnswerCallout question={currentQ} result={currentResult} isAf={isAf} />
          </div>
        )}
      </StreetShell>
    );
  }

  // ── Setup screen ───────────────────────────────────────────
  return (
    <StreetShell isAf={isAf} eyebrow={isAf ? "Vinnige memo-gemerkte oefening" : "Quick memo-marked practice"}>
      {/* Hero */}
      <section style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) both" }}>
        <div className="inline-flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4" style={{ color: "#FFB7E5" }} />
          <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", transform: "rotate(-2deg)", display: "inline-block" }}>
            {isAf ? "Toets jouself" : "Test yourself"}
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
          Mini Mock
        </div>
        <p className="text-white text-sm sm:text-base mt-3 max-w-xl" style={{ opacity: 0.9 }}>
          {isAf
            ? "Kies 'n vak en onderwerp. Jy kry 5–15 vrae uit DBE-vraestelle, en elke antwoord word onmiddellik teen die memo gemerk."
            : "Pick a subject and topic. You'll get 5–15 questions from DBE papers, each marked instantly against the memo."}
        </p>
      </section>

      <GlassCard className="p-5 sm:p-6" style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) .08s both" }}>
        <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#FFE29A,#94F7C5,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
        {loadingStart && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[22px]" style={{ background: "rgba(5,5,8,.85)", backdropFilter: "blur(4px)" }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#9FF5E8" }} />
            <p className="text-sm font-bold text-white">
              {isAf ? "Vrae word gelaai…" : "Fetching questions…"}
            </p>
          </div>
        )}
        <div className="space-y-5">
          {subjectsError ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,141,161,.08)", border: "1.5px solid #FF8DA1" }}
              >
                <AlertCircle className="w-6 h-6" style={{ color: "#FF8DA1" }} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white">
                  {isAf ? "Kon nie vakke laai nie" : "Couldn't load subjects"}
                </p>
                <p className="text-sm text-white" style={{ opacity: 0.85 }}>
                  {isAf
                    ? "Kyk jou internetverbinding en probeer weer."
                    : "Check your connection and try again."}
                </p>
              </div>
              <PrimaryBtn
                onClick={() => refetchSubjects()}
                disabled={subjectsRefetching}
                testId="button-retry-subjects"
              >
                <RefreshCw className={`w-4 h-4 ${subjectsRefetching ? "animate-spin" : ""}`} />
                {subjectsRefetching ? (isAf ? "Probeer…" : "Retrying…") : (isAf ? "Probeer Weer" : "Try Again")}
              </PrimaryBtn>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{isAf ? "Vak" : "Subject"}</label>
              <Select value={subject} onValueChange={(v) => { setSubject(v); setTopic("all"); setStartError(""); }} disabled={subjectsLoading || loadingStart}>
                <SelectTrigger
                  data-testid="select-subject"
                  className="h-12 rounded-xl text-white"
                  style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(255,255,255,.18)" }}
                >
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
                <p className="text-xs text-white" style={{ opacity: 0.85 }}>
                  {isAf
                    ? "Geen vakke met vrygestelde vrae beskikbaar nie. Probeer later weer."
                    : "No subjects with released questions are available yet. Please check back later."}
                </p>
              )}
            </div>
          )}

          {subjectEntry && subjectEntry.topics.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{isAf ? "Onderwerp" : "Topic"}</label>
              <Select value={topic} onValueChange={(v) => { setTopic(v); setStartError(""); }} disabled={loadingStart}>
                <SelectTrigger
                  className="h-12 rounded-xl text-white"
                  style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(255,255,255,.18)" }}
                >
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
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{isAf ? "Aantal vrae" : "Number of questions"}</label>
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
                    className="py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={
                      active
                        ? {
                            background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
                            color: "#050508",
                            border: "none",
                          }
                        : {
                            background: "rgba(255,255,255,.03)",
                            border: "1.5px solid rgba(255,255,255,.12)",
                            color: "#ffffff",
                          }
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <PrimaryBtn onClick={startSession} disabled={!subject || loadingStart} full size="lg">
            {loadingStart ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
            {isAf ? "Begin Mini Mock" : "Start Mini Mock"}
          </PrimaryBtn>

          {startError && (
            <div
              className="flex items-start gap-2 rounded-xl p-3 text-sm"
              style={{ background: "rgba(255,141,161,.08)", border: "1px solid rgba(255,141,161,.45)", color: "#FF8DA1" }}
              data-testid="mini-mock-start-error"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{startError}</span>
            </div>
          )}
        </div>
      </GlassCard>
    </StreetShell>
  );
}
