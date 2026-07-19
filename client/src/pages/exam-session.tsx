import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useExamSessionProtection } from "@/hooks/use-exam-session-protection";
import { ExamQuestionText } from "@/components/exam/exam-question-text";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { incrementQuizSessionCount, recordMilestone } from "@/lib/quiz-session-tracker";
import {
  Clock,
  Shield,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Home,
  Trophy,
  AlertCircle,
} from "lucide-react";

/* ── Street-pastel building blocks (design-guidelines.md) ───────────────── */

const CONFETTI_COLORS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];

function ConfettiBurst() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: -8,
            left: `${(i * 61) % 100}%`,
            width: i % 3 === 0 ? 10 : 7,
            height: i % 2 === 0 ? 12 : 7,
            borderRadius: i % 2 === 0 ? 2 : "50%",
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            boxShadow: `0 0 8px ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]}66`,
            ["--cx" as any]: `${((i % 5) - 2) * 26}px`,
            animation: `bt-confetti ${0.9 + (i % 6) * 0.16}s ease-in ${(i % 8) * 0.07}s both`,
          }}
        />
      ))}
    </div>
  );
}

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
        boxShadow: "0 0 20px rgba(159,245,232,.30)",
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
        boxShadow: accent ? `0 0 22px ${accent}33` : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Full-page shell used on the rules / empty / results screens */
function StreetShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white relative overflow-x-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      {/* Ambient auras — kept faint for focused exam chrome */}
      <div aria-hidden className="pointer-events-none fixed -top-24 -left-24 w-[380px] h-[380px] rounded-full blur-[120px] opacity-20" style={{ background: "#9FF5E8" }} />
      <div aria-hidden className="pointer-events-none fixed -bottom-24 -right-24 w-[340px] h-[340px] rounded-full blur-[120px] opacity-15" style={{ background: "#C5B3FF" }} />
      {children}
    </div>
  );
}

type ExamState = "rules" | "active" | "results" | "empty";

interface MCQQuestion {
  id: number;
  questionNumber: string;
  questionText: string;
  marks: number;
  isMCQ: boolean;
  options?: { label: string; text: string }[];
  correctAnswer?: string;
  memoText?: string;
}

interface ExamSessionData {
  id: number;
  examPaperId: number;
  status: string;
  examToken?: string;
}

export default function ExamSessionPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const subjectCode = params.get("subject") || "";
  const paperId = params.get("paper") || "";

  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const isAf = language === "af";
  useExamSessionProtection();

  const [examState, setExamState] = useState<ExamState>("rules");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeUsed, setTimeUsed] = useState(0);
  const [sessionData, setSessionData] = useState<ExamSessionData | null>(null);
  const [examResult, setExamResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    details: { questionId: number; questionNumber: string; userAnswer: string; correctAnswer: string; correct: boolean; marks: number }[];
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const examEndAtRef = useRef<number>(0);
  const examStartAtRef = useRef<number>(0);

  const { data: allPapers, isLoading: papersLoading } = useQuery<any[]>({
    queryKey: ["/api/exam-papers"],
    queryFn: () => fetch("/api/exam-papers", { credentials: "include" }).then(r => r.json()),
  });

  const { data: subjects } = useQuery<any[]>({
    queryKey: ["/api/subjects"],
  });

  const matchedSubject = useMemo(() => {
    if (!subjects) return null;
    return subjects.find((s: any) => s.code === subjectCode) || null;
  }, [subjects, subjectCode]);

  const matchedPaper = useMemo(() => {
    if (!allPapers || !matchedSubject) return null;
    const subjectPapers = allPapers.filter((p: any) => p.subjectId === matchedSubject.id);
    const paperNum = parseInt(paperId.replace(/[^0-9]/g, "")) || 1;
    return subjectPapers.find((p: any) => p.paperNumber === paperNum) || subjectPapers[0] || null;
  }, [allPapers, matchedSubject, paperId]);

  const { data: questionsData, isLoading: questionsLoading } = useQuery<any[]>({
    queryKey: ["/api/exam-papers", matchedPaper?.id, "questions"],
    queryFn: () => fetch(`/api/exam-papers/${matchedPaper!.id}/questions`, { credentials: "include" }).then(r => r.json()),
    enabled: !!matchedPaper,
  });

  const mcqQuestions: MCQQuestion[] = useMemo(() => {
    if (!questionsData || !Array.isArray(questionsData)) return [];
    return questionsData.map((q: any) => {
      const rawText: string = q.questionText || "";
      let options: { label: string; text: string }[] = [];

      const optionPatterns = [
        /\(([A-D])\)\s*([^(]+?)(?=\([A-D]\)|$)/g,
        /(?:^|\s)([A-D])\.\s+([^A-D.]+?)(?=\s[A-D]\.|$)/g,
        /(?:^|\s)([A-D])\)\s+([^A-D)]+?)(?=\s[A-D]\)|$)/g,
      ];

      for (const pattern of optionPatterns) {
        const matches = [...rawText.matchAll(pattern)];
        if (matches.length >= 2) {
          options = matches.map(m => ({ label: m[1].toUpperCase(), text: m[2].trim() }));
          break;
        }
      }

      const isMCQ = options.length >= 2;

      let correctAnswer = "";
      const memo = (q.memoText || "").trim();
      if (isMCQ) {
        const memoUpper = memo.toUpperCase();
        if (/^[A-D]$/.test(memoUpper)) {
          correctAnswer = memoUpper;
        } else {
          const memoMatch = memoUpper.match(/\b([A-D])\b/);
          if (memoMatch) correctAnswer = memoMatch[1];
        }
      } else {
        correctAnswer = memo;
      }

      const cleanedText = isMCQ
        ? (rawText.replace(/\(([A-D])\)\s*[^(]+/g, "").replace(/(?:^|\s)[A-D]\.\s+[^A-D.]+/g, "").trim() || rawText)
        : rawText;

      return {
        id: q.id,
        questionNumber: q.questionNumber,
        questionText: cleanedText,
        marks: q.marks || 1,
        isMCQ,
        options: isMCQ ? options : undefined,
        correctAnswer,
        memoText: memo,
      };
    });
  }, [questionsData]);

  useEffect(() => {
    if (mcqQuestions.length === 0 && !questionsLoading && !papersLoading && matchedPaper) {
      setExamState("empty");
    }
  }, [mcqQuestions, questionsLoading, papersLoading, matchedPaper]);

  const duration = matchedPaper?.timeMinutes || 180;

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/exam-sessions", {
        examPaperId: matchedPaper!.id,
        timeAllowedMinutes: duration,
      });
      return res.json();
    },
    onSuccess: (data: ExamSessionData) => {
      setSessionData(data);
      const totalSec = duration * 60;
      const now = Date.now();
      examStartAtRef.current = now;
      examEndAtRef.current = now + totalSec * 1000;
      setTimeRemaining(totalSec);
      setTimeUsed(0);
      setAnswers({});
      setExamState("active");
    },
    onError: () => {
      toast({
        title: isAf ? "Fout" : "Error",
        description: isAf ? "Kon nie eksamen begin nie" : "Failed to start exam session",
        variant: "destructive",
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!sessionData) throw new Error("No session");

      const normalize = (s: string) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
      const tokenize = (s: string) => normalize(s).split(/[^a-z0-9]+/).filter(t => t.length >= 4);
      const answersArray = mcqQuestions.map(q => {
        const userAnswer = answers[q.id] || "";
        let correct = false;
        if (q.isMCQ) {
          correct = !!(q.correctAnswer && userAnswer === q.correctAnswer);
        } else if (userAnswer.trim().length >= 2 && q.correctAnswer && q.correctAnswer.trim().length >= 2) {
          const u = normalize(userAnswer);
          const c = normalize(q.correctAnswer);
          if (u === c) {
            correct = true;
          } else {
            const uTokens = new Set(tokenize(userAnswer));
            const cTokens = tokenize(q.correctAnswer);
            if (cTokens.length >= 2) {
              const overlap = cTokens.filter(t => uTokens.has(t)).length;
              correct = overlap / cTokens.length >= 0.6;
            }
          }
        }
        return {
          questionId: q.id,
          questionNumber: q.questionNumber,
          userAnswer,
          correctAnswer: q.correctAnswer || "",
          correct,
          marks: q.marks,
        };
      });

      const score = answersArray.filter(a => a.correct).reduce((sum, a) => sum + a.marks, 0);
      const total = answersArray.reduce((sum, a) => sum + a.marks, 0);

      const res = await apiRequest("POST", `/api/exam-sessions/${sessionData.id}/submit`, {
        answersJson: answersArray,
        timeUsedSeconds: timeUsed,
        examToken: sessionData.examToken,
      });

      const updated = await res.json();

      return {
        score,
        total,
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
        details: answersArray,
        updated,
      };
    },
    onSuccess: (data) => {
      incrementQuizSessionCount();
      recordMilestone("first_exam_session");
      setExamResult({ score: data.score, total: data.total, percentage: data.percentage, details: data.details });
      setExamState("results");
      if (timerRef.current) clearInterval(timerRef.current);
      // Refresh calendar + mastery so study plan reflects latest performance
      queryClient.invalidateQueries({ queryKey: ["/api/mastery/weak-topics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learner/readiness"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learner/today-directive"] });
    },
    onError: () => {
      toast({
        title: isAf ? "Fout" : "Error",
        description: isAf ? "Kon nie eksamen indien nie" : "Failed to submit exam",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (examState === "active") {
      const tick = () => {
        const now = Date.now();
        const remainingSec = Math.max(0, Math.round((examEndAtRef.current - now) / 1000));
        const usedSec = Math.max(0, Math.round((now - examStartAtRef.current) / 1000));
        setTimeRemaining(remainingSec);
        setTimeUsed(usedSec);
        if (remainingSec <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          if (!submitMutation.isPending) submitMutation.mutate();
        }
      };
      tick();
      timerRef.current = setInterval(tick, 500);
      const onVisible = () => { if (document.visibilityState === "visible") tick(); };
      document.addEventListener("visibilitychange", onVisible);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        document.removeEventListener("visibilitychange", onVisible);
      };
    }
  }, [examState]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const subjectName = matchedSubject
    ? (isAf ? (matchedSubject.nameAfrikaans || matchedSubject.name) : matchedSubject.name)
    : subjectCode;

  if (papersLoading || questionsLoading) {
    return (
      <StreetShell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#9FF5E8" }} />
        </div>
      </StreetShell>
    );
  }

  // Task #394 — Release Gate: papers that haven't passed the ≥98% memo +
  // mark-coverage check are simply not listed by /api/exam/full/papers, so
  // we never show a "Questions being prepared" placeholder. Reaching this
  // state means the requested paperId isn't in the released set (typically
  // a stale link). Send the learner back to a paper that IS released.
  if (examState === "empty" || (!matchedPaper && !papersLoading)) {
    return (
      <StreetShell>
        <div className="min-h-screen flex items-center justify-center p-6">
          <GlassCard accent="#FFE29A" className="max-w-lg w-full p-6 sm:p-8 text-center" testId="card-paper-not-released" style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) both" }}>
            <div className="space-y-4">
              <div
                className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid #FFE29A", boxShadow: "0 0 22px rgba(255,226,154,.35)" }}
              >
                <AlertCircle className="w-8 h-8" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 8px #FFE29A)" }} />
              </div>
              <div role="heading" aria-level={1} className="text-xl font-black text-white">
                {isAf ? "Vraestel nie beskikbaar nie" : "Paper not available"}
              </div>
              <p className="text-base text-white" style={{ opacity: 0.94 }}>
                {isAf
                  ? "Hierdie vraestel is tans nie beskikbaar nie. Kies asseblief 'n ander vraestel."
                  : "This paper isn't currently available. Please pick another paper from Crunch Time."}
              </p>
              <p className="text-sm text-white" style={{ opacity: 0.9 }}>
                {subjectName} — {paperId.toUpperCase()}
              </p>
              <PrimaryBtn onClick={() => navigate("/exam-mode")} full testId="button-back-to-crunch">
                <ArrowLeft className="w-4 h-4" />
                {isAf ? "Terug na Eksamentyd" : "Back to Crunch Time"}
              </PrimaryBtn>
            </div>
          </GlassCard>
        </div>
      </StreetShell>
    );
  }

  if (examState === "rules") {
    const rulesList = isAf
      ? [
          `Die eksamen is ${duration} minute lank`,
          "Meervoudige keuse vrae",
          "Blaai-skakels word aangeteken",
          "Die eksamen sal outomaties indien wanneer tyd verstreke is",
          "Jy kan nie teruggaan nadat jy ingedien het nie",
        ]
      : [
          `The examination is ${duration} minutes long`,
          "Multiple choice questions",
          "Tab switches will be logged",
          "The exam will auto-submit when time expires",
          "You cannot go back after submitting",
        ];

    return (
      <StreetShell>
        <div className="min-h-screen flex items-center justify-center p-6">
          <GlassCard className="max-w-lg w-full p-6 sm:p-8" style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) both" }}>
            <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#FFE29A,#94F7C5,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: "#9FF5E8", filter: "drop-shadow(0 0 4px #9FF5E8)" }} />
                <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#9FF5E8", transform: "rotate(-2deg)", display: "inline-block", textShadow: "0 0 12px rgba(159,245,232,.5)" }}>
                  {isAf ? "Eksamentyd" : "Crunch Time"}
                </span>
              </div>
              <div>
                <div
                  role="heading"
                  aria-level={1}
                  className="font-black leading-[0.98] tracking-tight text-2xl sm:text-3xl"
                  style={{
                    backgroundImage: "linear-gradient(90deg,#FFE29A,#FFE29A,#94F7C5,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {subjectName}
                </div>
                <p className="text-sm text-white mt-2" style={{ opacity: 0.94 }}>
                  {paperId.toUpperCase()} — {mcqQuestions.length} {isAf ? "vrae" : "questions"}
                </p>
              </div>
              <ul className="space-y-2.5">
                {rulesList.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#94F7C5" }} />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <GhostBtn onClick={() => navigate("/exam-mode")} color="#9FD8FF">
                  <ArrowLeft className="w-4 h-4" />
                  {isAf ? "Terug" : "Back"}
                </GhostBtn>
                <div className="flex-1">
                  <PrimaryBtn
                    onClick={() => createSessionMutation.mutate()}
                    disabled={createSessionMutation.isPending}
                    full
                  >
                    {createSessionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isAf ? "Begin Eksamen" : "Start Exam"}
                  </PrimaryBtn>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </StreetShell>
    );
  }

  if (examState === "active") {
    const totalAnswered = Object.keys(answers).length;
    const totalQuestions = mcqQuestions.length;
    const progressPct = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
    const isLowTime = timeRemaining < 600;
    const timerHex = isLowTime ? "#FF8DA1" : "#FFE29A";

    return (
      <div
        className="min-h-screen flex flex-col text-white"
        style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}
        onContextMenu={e => e.preventDefault()}
      >
        <div
          className="p-3 border-b sticky top-0 z-50"
          style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,.08)" }}
        >
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full truncate"
                style={{ color: "#9FF5E8", background: "rgba(159,245,232,.06)", border: "1px solid rgba(159,245,232,.4)" }}
              >
                {subjectName}
              </span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ color: "#C5B3FF", background: "rgba(197,179,255,.06)", border: "1px solid rgba(197,179,255,.4)" }}
              >
                {paperId.toUpperCase()}
              </span>
            </div>
            <div
              className="flex items-center gap-2 font-mono text-lg font-semibold tabular-nums"
              style={{ color: timerHex, textShadow: `0 0 12px ${timerHex}66` }}
            >
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tabular-nums text-white">{totalAnswered}/{totalQuestions}</span>
              <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#9FF5E8,#C5B3FF)", boxShadow: "0 0 8px rgba(159,245,232,.6)" }}
                />
              </div>
              <PrimaryBtn
                size="sm"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isAf ? "Indien" : "Submit"}
              </PrimaryBtn>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div role="heading" aria-level={2} className="text-xl font-black text-white">
              {isAf ? "Vrae" : "Questions"}{" "}
              <span style={{ color: "#9FF5E8" }}>
                ({mcqQuestions.reduce((s, q) => s + q.marks, 0)} {isAf ? "punte" : "marks"})
              </span>
            </div>
            {mcqQuestions.map((q) => {
              const isAnswered = !!answers[q.id];
              return (
                <GlassCard key={q.id} accent={isAnswered ? "#94F7C5" : undefined}>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="font-medium text-sm flex-1 text-white">
                        <span className="mr-1 font-bold" style={{ color: "#9FD8FF" }}>{q.questionNumber}.</span>
                        <ExamQuestionText text={q.questionText} className="inline-block w-full text-white" />
                      </div>
                      <span
                        className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ color: "#FFE29A", background: "rgba(255,226,154,.1)", border: "1px solid rgba(255,226,154,.45)" }}
                      >
                        {q.marks} {isAf ? "punte" : "marks"}
                      </span>
                    </div>
                    {q.isMCQ && q.options ? (
                      <div className="grid gap-2">
                        {q.options.map(opt => {
                          const active = answers[q.id] === opt.label;
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              className="w-full text-left p-3 rounded-xl transition-all flex items-center gap-3"
                              onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.label }))}
                              data-testid={`option-${q.id}-${opt.label}`}
                              style={{
                                background: active ? "rgba(159,245,232,.08)" : "rgba(255,255,255,.02)",
                                border: active ? "1.5px solid #9FF5E8" : "1.5px solid rgba(255,255,255,.12)",
                                boxShadow: active ? "0 0 14px rgba(159,245,232,.2)" : "none",
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
                                {opt.label}
                              </span>
                              <span className="flex-1 text-sm text-white leading-snug">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <Textarea
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder={isAf ? "Tik jou antwoord hier…" : "Type your answer here…"}
                        rows={Math.min(8, Math.max(3, q.marks * 2))}
                        className="font-medium text-sm text-white placeholder:text-white rounded-xl focus-visible:ring-[#9FF5E8]/40 focus-visible:border-[#9FF5E8]"
                        style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(255,255,255,.18)" }}
                        data-testid={`answer-${q.id}`}
                      />
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (examState === "results" && examResult) {
    const getBand = (pct: number) => {
      if (pct >= 80) return { label: isAf ? "Ster" : "Star", hex: "#94F7C5" };
      if (pct >= 60) return { label: isAf ? "Groen" : "Green", hex: "#9FF5E8" };
      if (pct >= 40) return { label: "Amber", hex: "#FFE29A" };
      return { label: isAf ? "Rooi" : "Red", hex: "#FFB7E5" };
    };
    const band = getBand(examResult.percentage);

    return (
      <StreetShell>
        <div className="p-6">
          <div className="max-w-3xl mx-auto space-y-5">
            <GlassCard accent={band.hex} className="p-6 sm:p-8 text-center" style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) both" }}>
              <ConfettiBurst />
              <div className="relative space-y-3">
                <div
                  className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${band.hex}`, boxShadow: `0 0 22px ${band.hex}55` }}
                >
                  <Trophy className="w-8 h-8" style={{ color: band.hex, filter: `drop-shadow(0 0 8px ${band.hex})` }} />
                </div>
                <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 18, color: band.hex, transform: "rotate(-1.5deg)", textShadow: `0 0 12px ${band.hex}66` }}>
                  {isAf ? "Eksamen Voltooi!" : "Exam Complete!"}
                </div>
                <p className="text-sm text-white" style={{ opacity: 0.94 }}>
                  {subjectName} — {paperId.toUpperCase()}
                </p>
                <div className="text-5xl font-black tabular-nums" style={{ color: band.hex, textShadow: `0 0 14px ${band.hex}66` }}>
                  {examResult.percentage}%
                </div>
                <p className="text-lg font-semibold text-white tabular-nums">
                  {examResult.score} / {examResult.total} {isAf ? "punte" : "marks"}
                </p>
                <span
                  className="inline-flex items-center text-xs font-black px-3 py-1 rounded-full uppercase tracking-[0.14em]"
                  style={{ color: band.hex, border: `1px solid ${band.hex}`, background: "rgba(5,5,8,.6)", boxShadow: `0 0 10px ${band.hex}55` }}
                >
                  {band.label}
                </span>
                <div className="h-2.5 rounded-full overflow-hidden mx-auto max-w-sm" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${examResult.percentage}%`, background: `linear-gradient(90deg,#9FF5E8,${band.hex})`, boxShadow: `0 0 10px ${band.hex}` }} />
                </div>
              </div>
            </GlassCard>

            <div className="space-y-3">
              <div role="heading" aria-level={2} className="font-black text-white">
                {isAf ? "Vraag-vir-vraag" : "Question by Question"}
              </div>
              {examResult.details.map((d, i) => {
                const q = mcqQuestions.find((mq) => mq.id === d.questionId);
                const isMcqWrong = !d.correct && !!q?.isMCQ && !!d.correctAnswer;
                const correctOpt = isMcqWrong
                  ? q?.options?.find((o) => o.label === d.correctAnswer)
                  : undefined;
                const rowHex = d.correct ? "#94F7C5" : "#FF8DA1";
                return (
                  <div
                    key={i}
                    className="p-3 rounded-xl space-y-2"
                    style={{
                      background: d.correct ? "rgba(148,247,197,.06)" : "rgba(255,141,161,.06)",
                      border: `1px solid ${rowHex}55`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {d.correct
                          ? <CheckCircle2 className="w-4 h-4" style={{ color: "#94F7C5" }} />
                          : <XCircle className="w-4 h-4" style={{ color: "#FF8DA1" }} />}
                        <span className="text-sm font-bold text-white">Q{d.questionNumber}</span>
                      </div>
                      <div className="text-xs text-white" style={{ opacity: 0.9 }}>
                        {d.userAnswer ? `${isAf ? "Jou" : "Your"}: ${d.userAnswer}` : (isAf ? "Nie beantwoord" : "Not answered")}
                      </div>
                    </div>
                    {isMcqWrong && (
                      <div
                        className="flex items-start gap-2 rounded-xl px-3 py-2"
                        style={{ background: "rgba(148,247,197,.08)", border: "1px solid rgba(148,247,197,.4)" }}
                      >
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#94F7C5" }} />
                        <p className="text-sm font-semibold" style={{ color: "#94F7C5" }}>
                          {isAf ? "Korrekte antwoord:" : "Correct answer:"}{" "}
                          <span className="font-bold">{d.correctAnswer}</span>
                          {correctOpt && <span className="font-normal text-white"> — {correctOpt.text}</span>}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <GhostBtn onClick={() => navigate("/exam-mode")} color="#9FD8FF" full>
                  <ArrowLeft className="w-4 h-4" />
                  {isAf ? "Terug na Eksamentyd" : "Back to Crunch Time"}
                </GhostBtn>
              </div>
              <div className="flex-1">
                <PrimaryBtn onClick={() => navigate("/dashboard")} full>
                  <Home className="w-4 h-4" />
                  {isAf ? "Kontroleskerm" : "Dashboard"}
                </PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      </StreetShell>
    );
  }

  return null;
}
