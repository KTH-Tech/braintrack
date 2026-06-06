import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { 
  AlertTriangle, 
  Clock, 
  Globe,
  Shield, 
  Eye, 
  Maximize2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Play,
  StopCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  AlertCircle,
  BookOpen,
  ExternalLink,
  Home,
  LogOut
} from "lucide-react";
import type { ExamPaper, Question, Subject, ExamSession, OnboardingResult } from "@shared/schema";
import { BrainTrackLogo } from "@/components/braintrack-logo";

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
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  
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

  if (examState === "violated") {
    return (
      <div ref={containerRef} className="min-h-screen">
        <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <BrainTrackLogo className="h-7 w-auto" />
              <h1 className="text-xl font-semibold text-foreground">
                <span className="gradient-text">{isAfrikaans ? "Eksamen" : "Exam"}</span>{" "}
                {isAfrikaans ? "Gereed" : "Ready"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-foreground hover:bg-white/10 transition-colors" data-testid="button-language-toggle">
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold">{language === "en" ? "EN" : "AF"}</span>
              </button>
              <Link href="/dashboard">
                <button className="p-1.5 rounded-lg text-foreground hover:bg-white/5 transition-colors" title={isAfrikaans ? "Tuis" : "Home"} data-testid="button-home">
                  <Home className="h-4 w-4" />
                </button>
              </Link>
              <button onClick={() => logout()} className="p-1.5 rounded-lg text-foreground hover:bg-white/5 transition-colors" title={isAfrikaans ? "Uitteken" : "Sign Out"} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-57px)]">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">{isAfrikaans ? "Eksamen Gekanselleer" : "Exam Cancelled"}</CardTitle>
              <CardDescription className="text-base mt-2 text-muted-foreground">
                {violationMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  {isAfrikaans
                    ? "Jou eksamen is gekanselleer weens 'n reëloortreding. Al jou antwoorde is verwyder."
                    : "Your exam has been cancelled due to a rule violation. All your answers have been discarded."}
                </p>
              </div>
              <Button 
                className="w-full" 
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
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/dashboard")}
                data-testid="button-back-dashboard"
              >
                {isAfrikaans ? "Terug na Tuisbladsy" : "Back to Dashboard"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (examState === "completed") {
    return (
      <div className="min-h-screen">
        <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <BrainTrackLogo className="h-7 w-auto" />
              <h1 className="text-xl font-semibold text-foreground">
                <span className="gradient-text">{isAfrikaans ? "Eksamen" : "Exam"}</span>{" "}
                {isAfrikaans ? "Gereed" : "Ready"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-foreground hover:bg-white/10 transition-colors" data-testid="button-language-toggle">
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold">{language === "en" ? "EN" : "AF"}</span>
              </button>
              <Link href="/dashboard">
                <button className="p-1.5 rounded-lg text-foreground hover:bg-white/5 transition-colors" title={isAfrikaans ? "Tuis" : "Home"} data-testid="button-home">
                  <Home className="h-4 w-4" />
                </button>
              </Link>
              <button onClick={() => logout()} className="p-1.5 rounded-lg text-foreground hover:bg-white/5 transition-colors" title={isAfrikaans ? "Uitteken" : "Sign Out"} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-57px)]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-foreground">{isAfrikaans ? "Eksamen Voltooi" : "Exam Completed"}</CardTitle>
              <CardDescription className="text-base mt-2 text-muted-foreground">
                {isAfrikaans ? "Goed gedaan! Jou eksamen is ingedien." : "Well done! Your exam has been submitted."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted/30 border border-border rounded-lg">
                  <p className="text-2xl font-semibold text-foreground">{answeredCount}</p>
                  <p className="text-sm text-muted-foreground">{isAfrikaans ? "Vrae Beantwoord" : "Questions Answered"}</p>
                </div>
                <div className="p-4 bg-muted/30 border border-border rounded-lg">
                  <p className="text-2xl font-semibold text-foreground">{formatTime(timeUsed)}</p>
                  <p className="text-sm text-muted-foreground">{isAfrikaans ? "Tyd Gebruik" : "Time Used"}</p>
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => navigate("/progress")}
                data-testid="button-view-results"
              >
                {isAfrikaans ? "Sien Resultate" : "View Results"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/dashboard")}
                data-testid="button-back-dashboard-completed"
              >
                {isAfrikaans ? "Terug na Tuisbladsy" : "Back to Dashboard"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (examState === "setup") {
    return (
      <div className="min-h-screen">
        <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <BrainTrackLogo className="h-7 w-auto" />
              <h1 className="text-xl font-semibold text-foreground">
                <span className="gradient-text">{isAfrikaans ? "Eksamen" : "Exam"}</span>{" "}
                {isAfrikaans ? "Gereed" : "Ready"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-foreground hover:bg-white/10 transition-colors"
                data-testid="button-language-toggle"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold">{language === "en" ? "EN" : "AF"}</span>
              </button>
              <Link href="/dashboard">
                <button className="p-1.5 rounded-lg text-foreground hover:bg-white/5 transition-colors" title={isAfrikaans ? "Tuis" : "Home"} data-testid="button-home">
                  <Home className="h-4 w-4" />
                </button>
              </Link>
              <button onClick={() => logout()} className="p-1.5 rounded-lg text-foreground hover:bg-white/5 transition-colors" title={isAfrikaans ? "Uitteken" : "Sign Out"} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-white">{isAfrikaans ? "Eksamen Gereed Modus" : "Exam Ready Mode"}</h1>
              <p className="text-white">
                {isAfrikaans ? "Oefen onder werklike eksamentoestande met bedrogkontrolering" : "Practice under real exam conditions with anti-cheat monitoring"}
              </p>
            </div>

            <Card className="border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                  {isAfrikaans ? "Belangrike Reëls" : "Important Rules"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-accent mt-0.5" />
                  <p className="text-sm text-white/80">{isAfrikaans ? "Volskerm is vereis. As jy volskerm verlaat, word die eksamen gekanselleer." : "Fullscreen mode is required. Exiting fullscreen will cancel the exam."}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-accent mt-0.5" />
                  <p className="text-sm text-white/80">{isAfrikaans ? "Oortjie-wisseling of die verlaat van die venster sal die eksamen onmiddellik kanselleer." : "Tab switching or leaving the window will immediately cancel the exam."}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent mt-0.5" />
                  <p className="text-sm text-white/80">{isAfrikaans ? "Onaktiwiteit van meer as 10 sekondes gee 'n waarskuwing. Langer pouses kanselleer die eksamen." : "Pausing for more than 10 seconds triggers a warning. Extended pauses cancel the exam."}</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-accent mt-0.5" />
                  <p className="text-sm text-white/80">{isAfrikaans ? "Geen KI-hulp toegelaat nie. Antwoorde moet uit jou eie kennis kom." : "No AI assistance allowed. Answers must come from your own knowledge."}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">{isAfrikaans ? "Kies Jou Vraestel" : "Choose Your Paper"}</CardTitle>
                <p className="text-sm text-white/60">
                  {isAfrikaans
                    ? "Hierdie is gesimuleerde KABV-belynde vraestelle — nie amptelike DBO-eksamens nie."
                    : "These are simulated CAPS-aligned papers — not official DBE exams."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  return (
                    <>
                      {visiblePapers.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid gap-2 max-h-80 overflow-y-auto">
                            {Array.from(grouped.entries()).map(([name, papers]) => (
                              papers.map(paper => (
                                <div
                                  key={`${paper.subjectCode}-${paper.paperNumber}`}
                                  className={`p-3 rounded-lg border cursor-pointer hover-elevate transition-all ${
                                    selectedSubject === paper.subjectCode && selectedPaperNum === paper.paperNumber
                                      ? "border-primary bg-primary/10 shadow-sm"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                  onClick={() => {
                                    setSelectedSubject(paper.subjectCode);
                                    setSelectedPaperNum(paper.paperNumber);
                                    setSelectedPaperId(null);
                                  }}
                                  data-testid={`sim-paper-${paper.subjectCode}-${paper.paperNumber}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-white">{name}</p>
                                      <p className="text-sm text-white/60">
                                        {isAfrikaans ? "Vraestel" : "Paper"} {paper.paperNumber} — {paper.totalMarks} {isAfrikaans ? "punte" : "marks"} — {paper.duration}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">{paper.questionCount} Q</Badge>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      )}
                    </>
                  );
                })()}

                <Button
                  className="w-full"
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
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (examState === "ready") {
    return (
      <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Maximize2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-white">{isAfrikaans ? "Gereed om te Begin" : "Ready to Begin"}</CardTitle>
            <CardDescription className="text-base mt-2 text-white/80">
              {selectedPaperData?.paper?.subjectName
                ? (isAfrikaans ? selectedPaperData.paper.subjectNameAf : selectedPaperData.paper.subjectName)
                : selectedSubject} {selectedPaperNum ? `— ${isAfrikaans ? "Vraestel" : "Paper"} ${selectedPaperNum}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
              <p className="text-sm text-center text-white/80">
                {isAfrikaans
                  ? "Klik op \"Volskerm\" om die eksamenstimer te begin. Maak seker jy is gereed en sal nie onderbreek word nie."
                  : "Clicking \"Enter Fullscreen\" will start the exam timer. Make sure you're ready and won't be interrupted."}
              </p>
            </div>
            <Button 
              className="w-full" 
              onClick={enterFullscreen}
              data-testid="button-enter-fullscreen"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              {isAfrikaans ? "Volskerm & Begin" : "Enter Fullscreen & Start"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setExamState("setup");
                setSelectedPaperId(null);
              }}
              data-testid="button-cancel-ready"
            >
              {isAfrikaans ? "Kanselleer" : "Cancel"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col">
      {showViolationWarning && (
        <div className="fixed inset-0 z-50 bg-destructive/90 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-semibold mb-2">{isAfrikaans ? "Onaktiwiteit Gedetekteer!" : "Inactivity Detected!"}</h2>
            <p className="text-lg">{isAfrikaans ? "Beweeg jou muis of tik om die eksamen voort te sit" : "Move your mouse or type to continue the exam"}</p>
            <p className="text-sm mt-2 opacity-80">{isAfrikaans ? "Eksamen word in 5 sekondes gekanselleer as daar geen aktiwiteit is nie" : "Exam will be cancelled in 5 seconds if no activity"}</p>
          </div>
        </div>
      )}

      <header className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-semibold text-white">{selectedSubject}</p>
              <p className="text-sm text-white/60">
                {selectedPaper?.year} {selectedPaper?.month} - {isAfrikaans ? "Vraestel" : "Paper"} {selectedPaper?.paperNumber}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-white">{isAfrikaans ? "Gemonitor" : "Monitored"}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-white" />
              <span className="font-mono font-semibold text-white">{formatTime(timeUsed)}</span>
            </div>

            <Button 
              variant="destructive" 
              size="sm"
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
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-64 border-r border-border bg-card p-4 overflow-y-auto">
          <h3 className="font-medium text-white mb-3">{isAfrikaans ? "Vrae" : "Questions"}</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions?.map((q, idx) => (
              <button
                key={q.id}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  currentQuestionIndex === idx
                    ? "bg-primary text-primary-foreground"
                    : answers[q.id]?.trim()
                    ? "bg-primary/20 text-primary border border-primary/50"
                    : "bg-white/10 hover-elevate"
                }`}
                onClick={() => setCurrentQuestionIndex(idx)}
                data-testid={`question-nav-${idx}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">{isAfrikaans ? "Vordering" : "Progress"}</span>
              <span className="text-white">{answeredCount}/{totalQuestions}</span>
            </div>
            <Progress value={(answeredCount / totalQuestions) * 100} />
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {currentQuestion ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {isAfrikaans ? "Vraag" : "Question"} {currentQuestionIndex + 1}
                </h2>
                {currentQuestion.marks && (
                  <Badge variant="outline">{currentQuestion.marks} {isAfrikaans ? "punte" : "marks"}</Badge>
                )}
              </div>

              <Card>
                <CardContent className="p-6">
                  {isAfrikaans ? (
                    <p className="text-base whitespace-pre-wrap">
                      {currentQuestion.questionTextAf || "[Afrikaanse vertaling nie beskikbaar nie]"}
                    </p>
                  ) : (
                    <p className="text-base whitespace-pre-wrap">{currentQuestion.questionText}</p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{isAfrikaans ? "Jou Antwoord" : "Your Answer"}</label>
                <Textarea
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
                  className="min-h-[200px] text-base select-none"
                  style={{ userSelect: 'text' }} // Allow typing but block selection for copy
                  onPaste={(e) => e.preventDefault()} // Extra paste prevention
                  onCopy={(e) => e.preventDefault()} // Extra copy prevention
                  onCut={(e) => e.preventDefault()} // Extra cut prevention
                  data-testid="textarea-answer"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  data-testid="button-prev-question"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {isAfrikaans ? "Vorige" : "Previous"}
                </Button>
                <Button
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  data-testid="button-next-question"
                >
                  {isAfrikaans ? "Volgende" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
