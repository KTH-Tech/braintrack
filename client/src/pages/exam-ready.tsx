// BrainTrack Exam Ready — restyled to the "Permanent Marker Street Pastel"
// design system (docs/design-guidelines.md). #050508 ground, pastel accent
// cards, Permanent Marker eyebrows, aqua→purple gradient action buttons,
// pure white text. RESTYLE ONLY — all hooks, anti-cheat logic, mutations
// and data-testids preserved exactly.
import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { LearnerHeader } from "@/components/learner-header";
import { GraffitiSplats } from "@/components/graffiti-splats";
import {
  AlertTriangle,
  Clock,
  Shield,
  Eye,
  Maximize2,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  ArrowRight,
  ArrowLeft,
  Send,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import type { ExamPaper, Subject, OnboardingResult } from "@shared/schema";

interface SimulatedPaperOverview {
  subjectCode: string;
  subjectName: string;
  subjectNameAf: string;
  paperNumber: number;
  totalMarks: number;
  duration: string;
  sectionCount: number;
  questionCount: number;
}

interface SimulatedQuestion {
  id: string;
  questionNumber: string;
  questionText: string;
  questionTextAf: string;
  marks: number;
  cognitiveLevel: string;
  memoText: string;
  memoTextAf: string;
}

interface SimulatedPaperFull {
  paper: {
    subjectCode: string;
    subjectName: string;
    subjectNameAf: string;
    paperNumber: number;
    totalMarks: number;
    duration: string;
    sections: {
      name: string;
      nameAf: string;
      questions: SimulatedQuestion[];
    }[];
  };
}

type ExamState = "setup" | "ready" | "active" | "paused" | "violated" | "completed";

// ── Street Pastel style constants ────────────────────────────────
const PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];
const ALERT_HEX = "#FF8DA1";
const RAINBOW_TEXT: CSSProperties = {
  backgroundImage:
    "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  color: "transparent",
};
const CARD: CSSProperties = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 20,
};
const PRIMARY_BTN: CSSProperties = {
  background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
  color: "#050508",
  border: "none",
  borderRadius: 12,
  fontWeight: 800,
};
const SECONDARY_BTN: CSSProperties = {
  background: "transparent",
  border: "1.5px solid rgba(255,255,255,.2)",
  color: "#fff",
  borderRadius: 12,
  fontWeight: 700,
};
const marker = (color: string, size = 15): CSSProperties => ({
  fontFamily: "'Permanent Marker',cursive",
  fontSize: size,
  color,
  transform: "rotate(-2deg)",
  display: "inline-block",
});
const lift = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "translateY(-2px)";
};
const unlift = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "none";
};

// GPT Detection: Patterns that indicate AI-generated content
const detectAIPatterns = (text: string): { isLikelyAI: boolean; flags: string[] } => {
  const flags: string[] = [];
  const lowerText = text.toLowerCase();

  // Flag 1: Common AI phrases
  const aiPhrases = [
    "i'd be happy to",
    "certainly!",
    "absolutely!",
    "great question",
    "let me explain",
    "in conclusion",
    "it's worth noting",
    "it is important to note",
    "firstly,",
    "secondly,",
    "thirdly,",
    "in summary",
    "to summarize",
    "here's a",
    "here are the",
    "step 1:",
    "step 2:",
  ];

  for (const phrase of aiPhrases) {
    if (lowerText.includes(phrase)) {
      flags.push(`ai_phrase:${phrase}`);
    }
  }

  // Flag 2: Unusual length for simple questions (too verbose)
  // For short-answer questions, >500 chars is suspicious
  if (text.length > 500) {
    flags.push("excessive_length");
  }

  // Flag 3: Perfect grammar/formatting with bullet points in short answers
  const bulletPatterns = /[•\-\*]\s+\w/g;
  const bulletCount = (text.match(bulletPatterns) || []).length;
  if (bulletCount >= 3) {
    flags.push("structured_bullets");
  }

  // Flag 4: Overly formal language patterns
  const formalPatterns = [
    /\bfurthermore\b/i,
    /\bmoreover\b/i,
    /\bconsequently\b/i,
    /\bnevertheless\b/i,
    /\bnotwithstanding\b/i,
    /\binsofar as\b/i,
  ];

  for (const pattern of formalPatterns) {
    if (pattern.test(text)) {
      flags.push("overly_formal");
      break;
    }
  }

  // Flag 5: Suspiciously fast typing (tracked separately)

  // Threshold: 3+ flags = likely AI
  return {
    isLikelyAI: flags.length >= 3,
    flags,
  };
};

export default function ExamReadyPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedPaperNum, setSelectedPaperNum] = useState<number | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [examState, setExamState] = useState<ExamState>("setup");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [examToken, setExamToken] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeUsed, setTimeUsed] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [answerStartTimes, setAnswerStartTimes] = useState<Record<string, number>>({});
  const [aiFlags, setAiFlags] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseCheckRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useQuery<OnboardingResult>({
    queryKey: ["/api/user/onboarding"],
  });

  const isAfrikaans = language === "af";

  // Anti-cheat callbacks below are attached to global event listeners and
  // a setInterval; they capture closures. If they read `isAfrikaans`
  // directly, mid-session language toggles would not be reflected in the
  // violation messages they emit (and the listeners would also be torn
  // down and re-attached on every toggle). Read through this ref instead
  // so the messages always pick up the user's currently active language
  // without rebuilding the callbacks.
  const isAfrikaansRef = useRef(isAfrikaans);
  useEffect(() => {
    isAfrikaansRef.current = isAfrikaans;
  }, [isAfrikaans]);

  const { data: simulatedPapersData } = useQuery<{ papers: SimulatedPaperOverview[] }>({
    queryKey: ["/api/simulated/all-papers"],
  });

  const simulatedPapers = simulatedPapersData?.papers || [];

  const { data: selectedPaperData, isLoading: paperLoading } = useQuery<SimulatedPaperFull>({
    queryKey: ["/api/simulated/paper", selectedSubject, selectedPaperNum],
    enabled: !!selectedSubject && !!selectedPaperNum,
  });

  const { data: examPapers } = useQuery<ExamPaper[]>({
    queryKey: ["/api/exam-papers"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const selectedPaper = examPapers?.find(p => p.id === selectedPaperId) ?? null;

  const questions: SimulatedQuestion[] = selectedPaperData?.paper?.sections?.flatMap(s => s.questions) || [];

  const startExamMutation = useMutation({
    mutationFn: async (paperId: number) => {
      const res = await apiRequest("POST", "/api/exam-sessions", {
        examPaperId: paperId,
        timeAllowedMinutes: 180,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      if (data.examToken) setExamToken(data.examToken);
      setExamState("ready");
    },
    onError: () => {
      toast({
        title: isAfrikaans ? "Fout" : "Error",
        description: isAfrikaans ? "Kon nie eksamen-sessie begin nie" : "Could not start exam session",
        variant: "destructive",
      });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async (data: {
      status?: string;
      timeUsedSeconds?: number;
      violationType?: string;
      violationCount?: number;
      answersJson?: Record<number, string>;
    }) => {
      if (!sessionId) return;
      return apiRequest("PATCH", `/api/exam-sessions/${sessionId}`, data);
    },
  });

  // Check all answers for AI patterns before submission
  const checkAllAnswersForAI = useCallback((): { flaggedQuestions: string[]; allFlags: string[] } => {
    const flaggedQuestions: string[] = [];
    const allFlags: string[] = [];

    for (const [questionId, answer] of Object.entries(answers)) {
      if (!answer || answer.length < 20) continue; // Skip very short answers

      const detection = detectAIPatterns(answer);
      allFlags.push(...detection.flags);

      // Check typing speed (words per minute)
      const startTime = answerStartTimes[questionId];
      if (startTime) {
        const timeSpentMs = Date.now() - startTime;
        const wordCount = answer.split(/\s+/).length;
        const wpm = (wordCount / timeSpentMs) * 60000;

        // >120 WPM is suspicious (professional typist is 60-80 WPM)
        if (wpm > 120 && wordCount > 30) {
          allFlags.push(`fast_typing:${Math.round(wpm)}wpm`);
        }
      }

      if (detection.isLikelyAI) {
        flaggedQuestions.push(questionId);
      }
    }

    return { flaggedQuestions, allFlags };
  }, [answers, answerStartTimes]);

  const submitExamMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;

      // GPT Detection check
      const aiCheck = checkAllAnswersForAI();
      setAiFlags(aiCheck.allFlags);

      return apiRequest("POST", `/api/exam-sessions/${sessionId}/submit`, {
        answersJson: answers,
        timeUsedSeconds: timeUsed,
        aiDetectionFlags: aiCheck.allFlags,
        flaggedForReview: aiCheck.flaggedQuestions.length > 0,
        examToken,
      });
    },
    onSuccess: () => {
      setExamState("completed");
      toast({
        title: isAfrikaans ? "Eksamen Ingedien" : "Exam Submitted",
        description: isAfrikaans ? "Jou antwoorde is suksesvol gestoor" : "Your answers have been saved successfully",
      });
    },
  });

  const cancelExam = useCallback((reason: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pauseCheckRef.current) clearInterval(pauseCheckRef.current);

    setViolationMessage(reason);
    setExamState("violated");

    updateSessionMutation.mutate({
      status: "violated",
      violationType: reason,
      timeUsedSeconds: timeUsed,
    });

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [timeUsed, updateSessionMutation]);

  const handleVisibilityChange = useCallback(() => {
    if (examState !== "active") return;

    if (document.hidden) {
      const newCount = violationCount + 1;
      setViolationCount(newCount);

      if (newCount >= 1) {
        cancelExam(isAfrikaansRef.current ? "Jy het die eksamanskerm verlaat. Toets gekanselleer." : "You left the exam screen. Test cancelled.");
      }
    }
  }, [examState, violationCount, cancelExam]);

  const handleFullscreenChange = useCallback(() => {
    const isNowFullscreen = !!document.fullscreenElement;
    setIsFullscreen(isNowFullscreen);

    if (examState === "active" && !isNowFullscreen) {
      cancelExam(isAfrikaansRef.current ? "Jy het volskerm verlaat. Toets gekanselleer." : "You exited fullscreen mode. Test cancelled.");
    }
  }, [examState, cancelExam]);

  const handleBlur = useCallback(() => {
    if (examState !== "active") return;

    const newCount = violationCount + 1;
    setViolationCount(newCount);

    if (newCount >= 1) {
      cancelExam(isAfrikaansRef.current ? "Jy het weggenavigeer van die eksamen. Toets gekanselleer." : "You navigated away from the exam. Test cancelled.");
    }
  }, [examState, violationCount, cancelExam]);

  const handleActivity = useCallback(() => {
    setLastActivityTime(Date.now());
  }, []);

  // ANTI-CHEATING: Block copy/paste/cut
  const handleCopyPaste = useCallback((e: ClipboardEvent) => {
    if (examState !== "active") return;
    e.preventDefault();

    const newCount = violationCount + 1;
    setViolationCount(newCount);
    setShowViolationWarning(true);
    setViolationMessage(isAfrikaansRef.current ? "Kopieer/plak is nie toegelaat nie!" : "Copy/paste is not allowed!");

    toast({
      title: isAfrikaansRef.current ? "Waarskuwing" : "Warning",
      description: isAfrikaansRef.current ? "Kopieer/plak gedetekteer - dit word nie toegelaat nie" : "Copy/paste detected - this is not allowed",
      variant: "destructive",
    });

    if (newCount >= 2) {
      cancelExam(isAfrikaansRef.current ? "Veelvuldige kopieer/plak pogings. Toets gekanselleer." : "Multiple copy/paste attempts. Test cancelled.");
    }
  }, [examState, violationCount, cancelExam, toast]);

  // ANTI-CHEATING: Block right-click context menu
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (examState === "active") {
      e.preventDefault();
    }
  }, [examState]);

  // ANTI-CHEATING: Block keyboard shortcuts (Ctrl+C, Ctrl+V, etc.)
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    if (examState !== "active") return;

    // Block common cheat shortcuts
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      const newCount = violationCount + 1;
      setViolationCount(newCount);

      toast({
        title: isAfrikaansRef.current ? "Waarskuwing" : "Warning",
        description: isAfrikaansRef.current ? "Sleutelbord kortpaaie is nie toegelaat nie" : "Keyboard shortcuts are not allowed",
        variant: "destructive",
      });

      if (newCount >= 2) {
        cancelExam(isAfrikaansRef.current ? "Veelvuldige kortpadpogings. Toets gekanselleer." : "Multiple shortcut attempts. Test cancelled.");
      }
    }

    // Block F12 (dev tools), Alt+Tab detection handled by blur
    if (e.key === 'F12') {
      e.preventDefault();
      cancelExam(isAfrikaansRef.current ? "Ontwikkelaarsgereedskap is nie toegelaat nie." : "Developer tools are not allowed.");
    }
  }, [examState, violationCount, cancelExam, toast]);

  useEffect(() => {
    if (examState === "active") {
      // Core visibility/fullscreen detection
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("mousemove", handleActivity);
      document.addEventListener("keydown", handleActivity);
      document.addEventListener("click", handleActivity);

      // ANTI-CHEATING: Block copy/paste/cut
      document.addEventListener("copy", handleCopyPaste as EventListener);
      document.addEventListener("paste", handleCopyPaste as EventListener);
      document.addEventListener("cut", handleCopyPaste as EventListener);
      document.addEventListener("contextmenu", handleContextMenu as EventListener);
      document.addEventListener("keydown", handleKeyboardShortcuts as EventListener);

      // 90-second inactivity detection (warning at 60s, cancel at 90s)
      pauseCheckRef.current = setInterval(() => {
        const timeSinceActivity = Date.now() - lastActivityTime;
        if (timeSinceActivity > 60000) { // 60 seconds - show warning
          setShowViolationWarning(true);
          setViolationMessage(isAfrikaansRef.current
            ? `Onaktiwiteit gedetekteer! ${Math.ceil((90000 - timeSinceActivity) / 1000)}s oor...`
            : `Inactivity detected! ${Math.ceil((90000 - timeSinceActivity) / 1000)}s remaining...`
          );
          if (timeSinceActivity > 90000) { // 90 seconds - cancel exam
            cancelExam(isAfrikaansRef.current
              ? "Verlengde onaktiwiteit gedetekteer (90s+ pouse). Toets gekanselleer."
              : "Extended inactivity detected (90s+ pause). Test cancelled."
            );
          }
        } else {
          setShowViolationWarning(false);
        }
      }, 1000);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("mousemove", handleActivity);
        document.removeEventListener("keydown", handleActivity);
        document.removeEventListener("click", handleActivity);
        document.removeEventListener("copy", handleCopyPaste as EventListener);
        document.removeEventListener("paste", handleCopyPaste as EventListener);
        document.removeEventListener("cut", handleCopyPaste as EventListener);
        document.removeEventListener("contextmenu", handleContextMenu as EventListener);
        document.removeEventListener("keydown", handleKeyboardShortcuts as EventListener);
        if (pauseCheckRef.current) clearInterval(pauseCheckRef.current);
      };
    }
  }, [examState, handleVisibilityChange, handleFullscreenChange, handleBlur, handleActivity, handleCopyPaste, handleContextMenu, handleKeyboardShortcuts, lastActivityTime, cancelExam]);

  useEffect(() => {
    if (examState === "active") {
      timerRef.current = setInterval(() => {
        setTimeUsed((prev) => {
          const newTime = prev + 1;
          if (newTime % 30 === 0) {
            updateSessionMutation.mutate({
              timeUsedSeconds: newTime,
              answersJson: answers,
            });
          }
          return newTime;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [examState, answers, updateSessionMutation]);

  const enterFullscreen = async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        setExamState("active");
        setLastActivityTime(Date.now());
      }
    } catch {
      toast({
        title: isAfrikaans ? "Volskerm Vereis" : "Fullscreen Required",
        description: isAfrikaans ? "Laat asseblief volskerm toe om die eksamen te begin" : "Please allow fullscreen to start the exam",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions?.[currentQuestionIndex];
  const totalQuestions = questions?.length || 0;
  const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;

  const selectedPaperInfo = selectedPaperData?.paper;
  const selectedSubjectName = isAfrikaans ? selectedPaperInfo?.subjectNameAf : selectedPaperInfo?.subjectName;

  // ── Shared street-pastel chrome ────────────────────────────────
  const pageRootStyle: CSSProperties = {
    background: "#050508",
    fontFamily: "'Poppins',sans-serif",
  };

  const renderHeader = () => (
    <LearnerHeader
      backHref="/dashboard"
      backLabel={isAfrikaans ? "Tuis" : "Home"}
      title={isAfrikaans ? "Eksamen Gereed" : "Exam Ready"}
      titleColor="#9FF5E8"
      maxWidthClassName="max-w-5xl"
    />
  );

  if (examState === "violated") {
    return (
      <div ref={containerRef} className="min-h-screen text-white" style={pageRootStyle}>
        {renderHeader()}
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
          <div
            className="max-w-md w-full p-8 text-center"
            style={{
              ...CARD,
              border: `1.5px solid ${ALERT_HEX}66`,
              animation: "bt-fadeup .5s both",
            }}
          >
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: `${ALERT_HEX}1a`, border: `1.5px solid ${ALERT_HEX}55` }}
            >
              <XCircle className="w-8 h-8" style={{ color: ALERT_HEX }} />
            </div>
            <span style={marker(ALERT_HEX, 15)}>{isAfrikaans ? "Eish... reëls is reëls" : "Eish... rules are rules"}</span>
            <div role="heading" aria-level={1} className="text-xl font-black mt-2" style={{ color: ALERT_HEX }}>
              {isAfrikaans ? "Eksamen Gekanselleer" : "Exam Cancelled"}
            </div>
            <p className="text-base mt-2 text-white">{violationMessage}</p>
            <div
              className="p-4 mt-5 rounded-xl"
              style={{ background: `${ALERT_HEX}12`, border: `1px solid ${ALERT_HEX}40` }}
            >
              <p className="text-sm text-center text-white">
                {isAfrikaans
                  ? "Jou eksamen is gekanselleer weens 'n reëloortreding. Al jou antwoorde is verwyder."
                  : "Your exam has been cancelled due to a rule violation. All your answers have been discarded."}
              </p>
            </div>
            <div className="space-y-3 mt-6">
              <button
                className="w-full px-5 py-3 text-sm transition-all"
                style={PRIMARY_BTN}
                onMouseEnter={lift}
                onMouseLeave={unlift}
                onClick={() => {
                  setExamState("setup");
                  setSelectedPaperId(null);
                  setAnswers({});
                  setTimeUsed(0);
                  setViolationCount(0);
                }}
                data-testid="button-restart-exam"
              >
                {isAfrikaans ? "Begin Nuwe Eksamen" : "Start New Exam"}
              </button>
              <button
                className="w-full px-5 py-3 text-sm transition-all hover:bg-white/5"
                style={SECONDARY_BTN}
                onClick={() => navigate("/dashboard")}
                data-testid="button-back-dashboard"
              >
                {isAfrikaans ? "Terug na Tuisbladsy" : "Back to Dashboard"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examState === "completed") {
    return (
      <div className="min-h-screen text-white relative overflow-hidden" style={pageRootStyle}>
        <GraffitiSplats variant="corner" opacity={0.5} />
        {renderHeader()}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-30"
          style={{ background: "#94F7C5" }}
        />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
          <div
            className="max-w-md w-full p-8 text-center relative"
            style={{
              ...CARD,
              border: "1.5px solid rgba(148,247,197,.5)",
              animation: "bt-fadeup .5s both",
            }}
          >
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(148,247,197,.12)", border: "1.5px solid rgba(148,247,197,.5)" }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: "#94F7C5", filter: "drop-shadow(0 0 8px rgba(148,247,197,.6))" }} />
            </div>
            <span style={marker("#94F7C5", 16)}>{isAfrikaans ? "Mooi so! 🎉" : "Sharp sharp! 🎉"}</span>
            <div role="heading" aria-level={1} className="text-2xl font-black mt-2" style={RAINBOW_TEXT}>
              {isAfrikaans ? "Eksamen Voltooi" : "Exam Completed"}
            </div>
            <p className="text-base mt-2 text-white">
              {isAfrikaans ? "Goed gedaan! Jou eksamen is ingedien." : "Well done! Your exam has been submitted."}
            </p>
            <div className="grid grid-cols-2 gap-4 text-center mt-6">
              <div className="p-4 rounded-xl" style={{ background: "rgba(159,216,255,.06)", border: "1.5px solid rgba(159,216,255,.4)" }}>
                <p className="text-2xl font-black" style={{ color: "#9FD8FF" }}>{answeredCount}</p>
                <p className="text-sm text-white">{isAfrikaans ? "Vrae Beantwoord" : "Questions Answered"}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,226,154,.06)", border: "1.5px solid rgba(255,226,154,.4)" }}>
                <p className="text-2xl font-black tabular-nums" style={{ color: "#FFE29A" }}>{formatTime(timeUsed)}</p>
                <p className="text-sm text-white">{isAfrikaans ? "Tyd Gebruik" : "Time Used"}</p>
              </div>
            </div>
            <div className="space-y-3 mt-6">
              <button
                className="w-full px-5 py-3 text-sm transition-all"
                style={PRIMARY_BTN}
                onMouseEnter={lift}
                onMouseLeave={unlift}
                onClick={() => navigate("/progress")}
                data-testid="button-view-results"
              >
                {isAfrikaans ? "Sien Resultate" : "View Results"}
              </button>
              <button
                className="w-full px-5 py-3 text-sm transition-all hover:bg-white/5"
                style={SECONDARY_BTN}
                onClick={() => navigate("/dashboard")}
                data-testid="button-back-dashboard-completed"
              >
                {isAfrikaans ? "Terug na Tuisbladsy" : "Back to Dashboard"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examState === "setup") {
    const rules = [
      {
        Icon: Shield,
        hex: PASTELS[0],
        text: isAfrikaans ? "Volskerm is vereis. As jy volskerm verlaat, word die eksamen gekanselleer." : "Fullscreen mode is required. Exiting fullscreen will cancel the exam.",
      },
      {
        Icon: Eye,
        hex: PASTELS[1],
        text: isAfrikaans ? "Oortjie-wisseling of die verlaat van die venster sal die eksamen onmiddellik kanselleer." : "Tab switching or leaving the window will immediately cancel the exam.",
      },
      {
        Icon: Clock,
        hex: PASTELS[2],
        text: isAfrikaans ? "Onaktiwiteit van meer as 10 sekondes gee 'n waarskuwing. Langer pouses kanselleer die eksamen." : "Pausing for more than 10 seconds triggers a warning. Extended pauses cancel the exam.",
      },
      {
        Icon: XCircle,
        hex: PASTELS[3],
        text: isAfrikaans ? "Geen KI-hulp toegelaat nie. Antwoorde moet uit jou eie kennis kom." : "No AI assistance allowed. Answers must come from your own knowledge.",
      },
    ];

    return (
      <div className="min-h-screen text-white relative overflow-hidden" style={pageRootStyle}>
        <GraffitiSplats variant="hero" opacity={0.45} />
        {renderHeader()}
        {/* Ambient auras */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-40"
          style={{ background: "#9FF5E8" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -right-24 w-[380px] h-[380px] rounded-full blur-[120px] opacity-30"
          style={{ background: "#FFB7E5" }}
        />

        <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="space-y-8">
            {/* Hero */}
            <section className="text-center space-y-3" style={{ animation: "bt-fadeup .5s both" }}>
              <div className="inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: "#9FF5E8", filter: "drop-shadow(0 0 4px #9FF5E8)" }} />
                <span style={marker("#9FF5E8", 16)}>
                  {isAfrikaans ? "Regte toestande. Regte fokus. 🔒" : "Real conditions. Real focus. 🔒"}
                </span>
              </div>
              <div
                role="heading"
                aria-level={1}
                className="font-black leading-[0.95] tracking-tight text-3xl sm:text-4xl md:text-5xl"
                style={RAINBOW_TEXT}
              >
                {isAfrikaans ? "Eksamen Gereed Modus" : "Exam Ready Mode"}
              </div>
              <p className="text-white text-base sm:text-lg max-w-xl mx-auto" style={{ opacity: 0.94 }}>
                {isAfrikaans ? "Oefen onder werklike eksamentoestande met bedrogkontrolering" : "Practice under real exam conditions with anti-cheat monitoring"}
              </p>
            </section>

            {/* Rules card */}
            <div
              className="relative overflow-hidden p-6"
              style={{ ...CARD, border: "1.5px solid rgba(255,226,154,.45)" }}
            >
              <span
                aria-hidden
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "#FFE29A" }}
              />
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 6px #FFE29A)" }} />
                <div role="heading" aria-level={2} className="font-black text-lg text-white">
                  {isAfrikaans ? "Belangrike Reëls" : "Important Rules"}
                </div>
              </div>
              <div className="space-y-3">
                {rules.map(({ Icon, hex, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: hex, filter: `drop-shadow(0 0 5px ${hex})` }} />
                    <p className="text-sm text-white">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Paper picker */}
            <div className="p-6" style={CARD}>
              <div role="heading" aria-level={2} className="font-black text-lg text-white">
                {isAfrikaans ? "Kies Jou Vraestel" : "Choose Your Paper"}
              </div>
              <p className="text-sm text-white mt-1 mb-4" style={{ opacity: 0.9 }}>
                {isAfrikaans
                  ? "Hierdie is gesimuleerde KABV-belynde vraestelle — nie amptelike DBO-eksamens nie."
                  : "These are simulated CAPS-aligned papers — not official DBE exams."}
              </p>
              <div className="space-y-4">
                {(() => {
                  const learnerSubjectIds = (profile as any)?.selectedSubjects as number[] | undefined;
                  const codeToSimCode: Record<string, string> = {
                    MATH: "MATH", MATL: "MATHL", PHYS: "PHYS", LIFE: "LIFE",
                    ACC: "ACC", BUS: "BUS", ECO: "ECO", GEO: "GEO", HIS: "HIS",
                    ENGH: "ENG_HL", ENGF: "ENG_HL", AFRH: "AFR_HL", AFRF: "AFR_HL",
                    IT: "IT", CAT: "IT", AGR: "AGRIC", CON: "CONS",
                    TOUR: "TOUR", ART: "VISUAL", DRAMA: "DRAMA", MUSIC: "MUSIC",
                  };
                  const learnerCodes = new Set<string>();
                  if (learnerSubjectIds && subjects) {
                    for (const sid of learnerSubjectIds) {
                      const subj = subjects.find(s => s.id === sid);
                      if (subj?.code) {
                        const simCode = codeToSimCode[subj.code];
                        if (simCode) learnerCodes.add(simCode);
                      }
                    }
                  }
                  // Only show papers for the learner's enrolled subjects
                  const visiblePapers = simulatedPapers.filter(p =>
                    learnerCodes.size === 0 || learnerCodes.has(p.subjectCode)
                  );
                  const grouped = new Map<string, SimulatedPaperOverview[]>();
                  for (const p of visiblePapers) {
                    const name = isAfrikaans ? p.subjectNameAf : p.subjectName;
                    if (!grouped.has(name)) grouped.set(name, []);
                    grouped.get(name)!.push(p);
                  }
                  let paperIdx = -1;
                  return (
                    <>
                      {visiblePapers.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
                            {Array.from(grouped.entries()).map(([name, papers]) => (
                              papers.map(paper => {
                                paperIdx += 1;
                                const hex = PASTELS[paperIdx % PASTELS.length];
                                const isSelected = selectedSubject === paper.subjectCode && selectedPaperNum === paper.paperNumber;
                                return (
                                  <div
                                    key={`${paper.subjectCode}-${paper.paperNumber}`}
                                    className="p-3 cursor-pointer transition-all"
                                    style={{
                                      borderRadius: 14,
                                      background: isSelected ? `${hex}14` : "rgba(255,255,255,.03)",
                                      border: isSelected ? `1.5px solid ${hex}` : "1px solid rgba(255,255,255,.1)",
                                    }}
                                    onClick={() => {
                                      setSelectedSubject(paper.subjectCode);
                                      setSelectedPaperNum(paper.paperNumber);
                                      setSelectedPaperId(null);
                                    }}
                                    data-testid={`sim-paper-${paper.subjectCode}-${paper.paperNumber}`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="font-bold truncate" style={{ color: isSelected ? hex : "#fff" }}>{name}</p>
                                        <p className="text-sm text-white" style={{ opacity: 0.9 }}>
                                          {isAfrikaans ? "Vraestel" : "Paper"} {paper.paperNumber} — {paper.totalMarks} {isAfrikaans ? "punte" : "marks"} — {paper.duration}
                                        </p>
                                      </div>
                                      <span
                                        className="shrink-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                                        style={{ color: hex, border: `1px solid ${hex}` }}
                                      >
                                        {paper.questionCount} Q
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#9FF5E8" }} />
                        </div>
                      )}
                    </>
                  );
                })()}

                <button
                  className="w-full inline-flex items-center justify-center px-5 py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={PRIMARY_BTN}
                  onMouseEnter={lift}
                  onMouseLeave={unlift}
                  disabled={!selectedSubject || !selectedPaperNum}
                  onClick={() => {
                    if (selectedSubject && selectedPaperNum) {
                      if (isAfrikaans && questions.length > 0) {
                        const missingAf = questions.some(q => !q.questionTextAf);
                        if (missingAf) {
                          toast({
                            title: "Afrikaanse inhoud nie volledig nie",
                            description: "Sommige vrae in hierdie vraestel het nog nie 'n volledige Afrikaans vertaling nie. Kies asseblief 'n ander vraestel of wissel na Engels.",
                            variant: "destructive",
                          });
                          return;
                        }
                      }
                      setExamState("ready");
                    }
                  }}
                  data-testid="button-start-exam"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isAfrikaans ? "Begin Eksamen" : "Start Exam"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (examState === "ready") {
    return (
      <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4 text-white" style={pageRootStyle}>
        <div
          className="max-w-md w-full p-8 text-center"
          style={{
            ...CARD,
            border: "1.5px solid rgba(159,216,255,.5)",
            animation: "bt-fadeup .5s both",
          }}
        >
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(159,216,255,.1)", border: "1.5px solid rgba(159,216,255,.5)" }}
          >
            <Maximize2 className="w-8 h-8" style={{ color: "#9FD8FF", filter: "drop-shadow(0 0 8px rgba(159,216,255,.6))" }} />
          </div>
          <span style={marker("#9FD8FF", 16)}>{isAfrikaans ? "Diep asem. Jy's reg. 💪" : "Deep breath. You got this. 💪"}</span>
          <div role="heading" aria-level={1} className="text-2xl font-black mt-2 text-white">
            {isAfrikaans ? "Gereed om te Begin" : "Ready to Begin"}
          </div>
          <p className="text-base mt-2 text-white">
            {selectedPaperData?.paper?.subjectName
              ? (isAfrikaans ? selectedPaperData.paper.subjectNameAf : selectedPaperData.paper.subjectName)
              : selectedSubject} {selectedPaperNum ? `— ${isAfrikaans ? "Vraestel" : "Paper"} ${selectedPaperNum}` : ""}
          </p>
          <div
            className="p-4 mt-5 rounded-xl"
            style={{ background: "rgba(255,226,154,.08)", border: "1px solid rgba(255,226,154,.4)" }}
          >
            <p className="text-sm text-center text-white">
              {isAfrikaans
                ? "Klik op \"Volskerm\" om die eksamenstimer te begin. Maak seker jy is gereed en sal nie onderbreek word nie."
                : "Clicking \"Enter Fullscreen\" will start the exam timer. Make sure you're ready and won't be interrupted."}
            </p>
          </div>
          <div className="space-y-3 mt-6">
            <button
              className="w-full inline-flex items-center justify-center px-5 py-3 text-sm transition-all"
              style={PRIMARY_BTN}
              onMouseEnter={lift}
              onMouseLeave={unlift}
              onClick={enterFullscreen}
              data-testid="button-enter-fullscreen"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              {isAfrikaans ? "Volskerm & Begin" : "Enter Fullscreen & Start"}
            </button>
            <button
              className="w-full px-5 py-3 text-sm transition-all hover:bg-white/5"
              style={SECONDARY_BTN}
              onClick={() => {
                setExamState("setup");
                setSelectedPaperId(null);
              }}
              data-testid="button-cancel-ready"
            >
              {isAfrikaans ? "Kanselleer" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col text-white" style={pageRootStyle}>
      {showViolationWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(5,5,8,.96)" }}>
          <div
            className="text-center text-white p-10 mx-4"
            style={{
              background: "rgba(255,141,161,.08)",
              border: `1.5px solid ${ALERT_HEX}`,
              borderRadius: 24,
            }}
          >
            <AlertCircle
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: ALERT_HEX, animation: "bt-glowpulse 1.2s infinite" }}
            />
            <div role="heading" aria-level={1} className="text-2xl font-black mb-2" style={{ color: ALERT_HEX }}>
              {isAfrikaans ? "Onaktiwiteit Gedetekteer!" : "Inactivity Detected!"}
            </div>
            <p className="text-lg text-white">{isAfrikaans ? "Beweeg jou muis of tik om die eksamen voort te sit" : "Move your mouse or type to continue the exam"}</p>
            <p className="text-sm mt-2 text-white" style={{ opacity: 0.9 }}>{isAfrikaans ? "Eksamen word in 5 sekondes gekanselleer as daar geen aktiwiteit is nie" : "Exam will be cancelled in 5 seconds if no activity"}</p>
          </div>
        </div>
      )}

      <header
        className="border-b p-4"
        style={{ background: "rgba(5,5,8,.94)", borderColor: "rgba(255,255,255,.08)", backdropFilter: "blur(10px)" }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div className="min-w-0">
              <p className="font-black truncate" style={marker("#9FF5E8", 16)}>{selectedSubject}</p>
              <p className="text-sm text-white" style={{ opacity: 0.9 }}>
                {selectedPaper?.year} {selectedPaper?.month} - {isAfrikaans ? "Vraestel" : "Paper"} {selectedPaper?.paperNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ border: "1px solid rgba(148,247,197,.5)" }}
            >
              <Shield className="w-4 h-4" style={{ color: "#94F7C5" }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94F7C5" }}>
                {isAfrikaans ? "Gemonitor" : "Monitored"}
              </span>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ border: "1px solid rgba(255,226,154,.5)" }}
            >
              <Clock className="w-4 h-4" style={{ color: "#FFE29A" }} />
              <span className="font-mono font-bold text-sm" style={{ color: "#FFE29A" }}>{formatTime(timeUsed)}</span>
            </div>

            <button
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "transparent", border: `1.5px solid ${ALERT_HEX}`, color: ALERT_HEX }}
              onClick={() => submitExamMutation.mutate()}
              disabled={submitExamMutation.isPending}
              data-testid="button-submit-exam"
            >
              {submitExamMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isAfrikaans ? "Dien Eksamen In" : "Submit Exam"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <aside
          className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r p-4 overflow-y-auto max-h-48 md:max-h-none"
          style={{ background: "rgba(255,255,255,.02)", borderColor: "rgba(255,255,255,.08)" }}
        >
          <div role="heading" aria-level={2} className="font-bold text-white mb-3">
            {isAfrikaans ? "Vrae" : "Questions"}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {questions?.map((q, idx) => {
              const isCurrent = currentQuestionIndex === idx;
              const isAnswered = !!answers[q.id]?.trim();
              return (
                <button
                  key={q.id}
                  className="w-10 h-10 text-sm font-bold transition-colors"
                  style={
                    isCurrent
                      ? { ...PRIMARY_BTN, borderRadius: 10 }
                      : isAnswered
                      ? { background: "rgba(148,247,197,.1)", color: "#94F7C5", border: "1px solid rgba(148,247,197,.5)", borderRadius: 10 }
                      : { background: "rgba(255,255,255,.05)", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }
                  }
                  onClick={() => setCurrentQuestionIndex(idx)}
                  data-testid={`question-nav-${idx}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white">{isAfrikaans ? "Vordering" : "Progress"}</span>
              <span className="text-white font-bold">{answeredCount}/{totalQuestions}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.08)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%`,
                  background: "linear-gradient(90deg,#9FF5E8,#C5B3FF)",
                }}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {currentQuestion ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div role="heading" aria-level={2} className="text-xl font-black text-white">
                  {isAfrikaans ? "Vraag" : "Question"} {currentQuestionIndex + 1}
                </div>
                {currentQuestion.marks && (
                  <span
                    className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ color: "#FFE29A", border: "1px solid #FFE29A" }}
                  >
                    {currentQuestion.marks} {isAfrikaans ? "punte" : "marks"}
                  </span>
                )}
              </div>

              <div className="p-6" style={CARD}>
                {isAfrikaans ? (
                  <p className="text-base whitespace-pre-wrap text-white">
                    {currentQuestion.questionTextAf || "[Afrikaanse vertaling nie beskikbaar nie]"}
                  </p>
                ) : (
                  <p className="text-base whitespace-pre-wrap text-white">{currentQuestion.questionText}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white">{isAfrikaans ? "Jou Antwoord" : "Your Answer"}</label>
                <textarea
                  placeholder={isAfrikaans ? "Tik jou antwoord hier..." : "Type your answer here..."}
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => {
                    const questionId = currentQuestion.id;
                    const newValue = e.target.value;

                    // Track when typing starts for this question (typing speed detection)
                    if (!answerStartTimes[questionId] && newValue.length > 0) {
                      setAnswerStartTimes(prev => ({
                        ...prev,
                        [questionId]: Date.now()
                      }));
                    }

                    setAnswers(prev => ({
                      ...prev,
                      [questionId]: newValue
                    }));
                  }}
                  className="w-full min-h-[200px] text-base select-none p-4 outline-none placeholder:text-white"
                  style={{
                    userSelect: 'text', // Allow typing but block selection for copy
                    background: "rgba(5,5,8,.6)",
                    border: "1.5px solid rgba(255,255,255,.18)",
                    borderRadius: 12,
                    color: "#fff",
                    fontFamily: "'Poppins',sans-serif",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#9FF5E8"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.18)"; }}
                  onPaste={(e) => e.preventDefault()} // Extra paste prevention
                  onCopy={(e) => e.preventDefault()} // Extra copy prevention
                  onCut={(e) => e.preventDefault()} // Extra cut prevention
                  data-testid="textarea-answer"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  className="inline-flex items-center px-5 py-2.5 text-sm transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={SECONDARY_BTN}
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  data-testid="button-prev-question"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {isAfrikaans ? "Vorige" : "Previous"}
                </button>
                <button
                  className="inline-flex items-center px-5 py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={PRIMARY_BTN}
                  onMouseEnter={lift}
                  onMouseLeave={unlift}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  data-testid="button-next-question"
                >
                  {isAfrikaans ? "Volgende" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#9FF5E8" }} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
