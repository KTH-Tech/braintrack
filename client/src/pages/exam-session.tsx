import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useExamSessionProtection } from "@/hooks/use-exam-session-protection";
import { ExamQuestionText } from "@/components/exam/exam-question-text";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  BookOpen,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Home,
  LogOut,
  Trophy,
  AlertCircle,
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Task #394 — Release Gate: papers that haven't passed the ≥98% memo +
  // mark-coverage check are simply not listed by /api/exam/full/papers, so
  // we never show a "Questions being prepared" placeholder. Reaching this
  // state means the requested paperId isn't in the released set (typically
  // a stale link). Send the learner back to a paper that IS released.
  if (examState === "empty" || (!matchedPaper && !papersLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg w-full text-center" data-testid="card-paper-not-released">
          <CardHeader>
            <div className="mx-auto mb-4">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
            </div>
            <CardTitle className="text-xl">
              {isAf ? "Vraestel nie beskikbaar nie" : "Paper not available"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isAf
                ? "Hierdie vraestel is tans nie beskikbaar nie. Kies asseblief 'n ander vraestel."
                : "This paper isn't currently available. Please pick another paper from Crunch Time."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white mb-6">
              {subjectName} — {paperId.toUpperCase()}
            </p>
            <Button onClick={() => navigate("/exam-mode")} className="w-full" data-testid="button-back-to-crunch">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isAf ? "Terug na Eksamentyd" : "Back to Crunch Time"}
            </Button>
          </CardContent>
        </Card>
      </div>
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
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              {subjectName}
            </CardTitle>
            <CardDescription>
              {paperId.toUpperCase()} — {mcqQuestions.length} {isAf ? "vrae" : "questions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {rulesList.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/exam-mode")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isAf ? "Terug" : "Back"}
              </Button>
              <Button
                className="flex-1"
                onClick={() => createSessionMutation.mutate()}
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isAf ? "Begin Eksamen" : "Start Exam"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (examState === "active") {
    const totalAnswered = Object.keys(answers).length;
    const totalQuestions = mcqQuestions.length;
    const progressPct = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
    const isLowTime = timeRemaining < 600;

    return (
      <div className="min-h-screen flex flex-col" onContextMenu={e => e.preventDefault()}>
        <div className="p-3 border-b bg-card sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">{subjectName}</Badge>
              <Badge variant="outline" className="text-xs">{paperId.toUpperCase()}</Badge>
            </div>
            <div className={`flex items-center gap-2 font-mono text-lg font-semibold ${isLowTime ? "text-white" : ""}`}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white">{totalAnswered}/{totalQuestions}</span>
              <Progress value={progressPct} className="w-24" />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                {isAf ? "Indien" : "Submit"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h2 className="text-xl font-semibold">
              {isAf ? "Vrae" : "Questions"} ({mcqQuestions.reduce((s, q) => s + q.marks, 0)} {isAf ? "punte" : "marks"})
            </h2>
            {mcqQuestions.map((q) => (
              <Card key={q.id} className={answers[q.id] ? "border-green-500/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="font-medium text-sm flex-1">
                      <span className="mr-1">{q.questionNumber}.</span>
                      <ExamQuestionText text={q.questionText} className="inline-block w-full" />
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">{q.marks} {isAf ? "punte" : "marks"}</Badge>
                  </div>
                  {q.isMCQ && q.options ? (
                    <div className="grid gap-2">
                      {q.options.map(opt => (
                        <Button
                          key={opt.label}
                          variant={answers[q.id] === opt.label ? "default" : "outline"}
                          className="justify-start text-left h-auto py-2"
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.label }))}
                          data-testid={`option-${q.id}-${opt.label}`}
                        >
                          <span className="font-semibold mr-3 flex-shrink-0">{opt.label}.</span>
                          <span className="text-sm">{opt.text}</span>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder={isAf ? "Tik jou antwoord hier…" : "Type your answer here…"}
                      rows={Math.min(8, Math.max(3, q.marks * 2))}
                      className="font-medium text-sm"
                      data-testid={`answer-${q.id}`}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (examState === "results" && examResult) {
    const getBand = (pct: number) => {
      if (pct >= 80) return { label: isAf ? "Ster" : "Star", color: "text-primary", bg: "bg-primary/10" };
      if (pct >= 60) return { label: isAf ? "Groen" : "Green", color: "text-green-500", bg: "bg-green-500/10" };
      if (pct >= 40) return { label: "Amber", color: "text-amber-500", bg: "bg-amber-500/10" };
      return { label: isAf ? "Rooi" : "Red", color: "text-red-500", bg: "bg-red-500/10" };
    };
    const band = getBand(examResult.percentage);

    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Trophy className={`w-16 h-16 mx-auto mb-2 ${band.color}`} />
              <CardTitle className="text-2xl">{isAf ? "Eksamen Voltooi!" : "Exam Complete!"}</CardTitle>
              <CardDescription>{subjectName} — {paperId.toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`text-center p-6 rounded-2xl border  shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ${band.bg}`}>
                <p className={`text-5xl font-bold ${band.color}`}>{examResult.percentage}%</p>
                <p className="text-lg font-semibold mt-1">{examResult.score} / {examResult.total} {isAf ? "punte" : "marks"}</p>
                <Badge className="mt-2">{band.label}</Badge>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">{isAf ? "Vraag-vir-vraag" : "Question by Question"}</h3>
                {examResult.details.map((d, i) => {
                  const q = mcqQuestions.find((mq) => mq.id === d.questionId);
                  const isMcqWrong = !d.correct && !!q?.isMCQ && !!d.correctAnswer;
                  const correctOpt = isMcqWrong
                    ? q?.options?.find((o) => o.label === d.correctAnswer)
                    : undefined;
                  return (
                    <div key={i} className={`p-3 rounded-lg border  shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] ${d.correct ? "border-green-500/35 bg-green-500/8" : "border-red-500/35 bg-red-500/8"} space-y-2`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {d.correct ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                          <span className="text-sm font-medium">Q{d.questionNumber}</span>
                        </div>
                        <div className="text-xs text-white">
                          {d.userAnswer ? `${isAf ? "Jou" : "Your"}: ${d.userAnswer}` : (isAf ? "Nie beantwoord" : "Not answered")}
                        </div>
                      </div>
                      {isMcqWrong && (
                        <div className="flex items-start gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            {isAf ? "Korrekte antwoord:" : "Correct answer:"}{" "}
                            <span className="font-bold">{d.correctAnswer}</span>
                            {correctOpt && <span className="font-normal"> — {correctOpt.text}</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/exam-mode")} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {isAf ? "Terug na Eksamentyd" : "Back to Crunch Time"}
                </Button>
                <Button onClick={() => navigate("/dashboard")} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  {isAf ? "Kontroleskerm" : "Dashboard"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
