import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useExamSessionProtection } from "@/hooks/use-exam-session-protection";
import { incrementQuizSessionCount } from "@/lib/quiz-session-tracker";
import { downloadBlob } from "@/lib/download-file";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { PageHeader } from "@/components/page-header";
import { GraffitiSplats } from "@/components/graffiti-splats";
import {
  Clock,
  Shield,
  Trophy,
  Play,
  Send,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Target,
  ArrowLeft,
  LogOut,
  Globe,
  Zap,
  AlertCircle,
  ListChecks,
} from "lucide-react";

type ExamState = "select" | "rules" | "active" | "results";
type Section = "A" | "B" | "C";

interface PaperSummary {
  id: string;
  name: string;
  paperNumber: number;
  totalMarks: number;
  duration: number;
  sectionA: number;
  sectionB: number;
  sectionC: number;
}

interface MCQ {
  id: string;
  questionNumber: number;
  question: string;
  options: { label: string; text: string }[];
  marks: number;
  topic: string;
}

interface CaseStudy {
  id: string;
  questionNumber: number;
  scenario: string;
  totalMarks: number;
  topic: string;
  subQuestions: { id: string; question: string; marks: number; topic: string }[];
}

interface Essay {
  id: string;
  questionNumber: number;
  question: string;
  marks: number;
  topic: string;
}

interface PaperFull {
  id: string;
  name: string;
  paperNumber: number;
  totalMarks: number;
  duration: number;
  disclaimer: string;
  sectionA: MCQ[];
  sectionB: CaseStudy[];
  sectionC: Essay[];
}

interface TopicResult {
  topic: string;
  earned: number;
  available: number;
  percentage: number;
  band: string;
}

interface ExamResult {
  paperId: string;
  paperName: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  masteryBand: string;
  timeUsedSeconds: number;
  integrityLog: string[];
  results: {
    sectionA: { id: string; userAnswer: string; correctAnswer: string; correct: boolean; earned: number; marks: number }[];
    sectionB: { id: string; subQuestions: { id: string; userAnswer: string; earned: number; marks: number; feedback: string[] }[] }[];
    sectionC: { id: string; userAnswer: string; earned: number; marks: number; feedback: string[] }[];
  };
  topicBreakdown: TopicResult[];
  submittedAt: string;
}

// Pastel Neon Street band hexes — mirror exam-mode.tsx getBandHex():
// star/mastery = butter, green = mint, amber = pink, red = alert.
const BAND_COLORS: Record<string, string> = {
  red: "#FF8DA1",
  amber: "#FFB7E5",
  green: "#94F7C5",
  mastery: "#FFE29A",
};

// Comp pastel accents cycled per paper card — mirror exam-mode.tsx
const PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];
const ALERT_HEX = "#FF8DA1";
const MINT_HEX = "#94F7C5";
const BUTTER_HEX = "#FFE29A";
const AQUA_HEX = "#9FF5E8";
const SKY_HEX = "#9FD8FF";
const DIVIDER_HEX = "#1b1922";
const CARD_BG = "#0e0d12";

const cardStyle = (accent?: string): React.CSSProperties => ({
  background: CARD_BG,
  border: accent ? `1.5px solid ${accent}` : `1px solid ${DIVIDER_HEX}`,
  borderRadius: 20,
});

const bebasKicker = (color: string, size = 15): React.CSSProperties => ({
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: size,
  color,
  transform: "rotate(-2deg)",
  display: "inline-block",
});

const BAND_LABELS: Record<string, { en: string; af: string }> = {
  red: { en: "Catch Up", af: "Inhaal" },
  amber: { en: "Building", af: "Bou" },
  green: { en: "Locked In", af: "Op Koers" },
  mastery: { en: "Star", af: "Ster" },
};

export default function BSTExamPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const canDownload = user?.role === "admin" || user?.role === "parent";
  const { language, setLanguage } = useLanguage();
  const isAf = language === "af";
  const [examState, setExamState] = useState<ExamState>("select");
  useExamSessionProtection();
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<Section>("A");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ sectionA: Record<string, string>; sectionB: Record<string, string>; sectionC: Record<string, string> }>({ sectionA: {}, sectionB: {}, sectionC: {} });
  const [timeRemaining, setTimeRemaining] = useState(180 * 60);
  const [timeUsed, setTimeUsed] = useState(0);
  const [integrityLog, setIntegrityLog] = useState<string[]>([]);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: papersData, isLoading: papersLoading, error: papersError } = useQuery<{ papers: PaperSummary[]; disclaimer: string }, Error & { status?: number }>({
    queryKey: ["/api/bst/papers", language],
    queryFn: async () => {
      const r = await fetch(`/api/bst/papers?lang=${language}`, { credentials: "include" });
      if (!r.ok) {
        const err = new Error(r.status === 401 ? "unauthorized" : `request_failed_${r.status}`) as Error & { status?: number };
        err.status = r.status;
        throw err;
      }
      return r.json();
    },
    retry: (failureCount, err: any) => err?.status !== 401 && failureCount < 2,
  });
  const isUnauthorized = (papersError as any)?.status === 401;

  const { data: paper } = useQuery<PaperFull>({
    queryKey: ["/api/bst/paper", selectedPaperId, language],
    queryFn: () => fetch(`/api/bst/paper/${selectedPaperId}?lang=${language}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPaperId && examState !== "select",
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/bst/submit", {
        paperId: selectedPaperId,
        answers,
        timeUsedSeconds: timeUsed,
        integrityLog,
      });
      return res.json();
    },
    onSuccess: (data: ExamResult) => {
      incrementQuizSessionCount();
      setExamResult(data);
      setExamState("results");
      if (timerRef.current) clearInterval(timerRef.current);
    },
    onError: () => {
      toast({ title: isAf ? "Fout" : "Error", description: isAf ? "Kon nie eksamen indien nie" : "Failed to submit exam", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (examState === "active") {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitMutation.mutate();
            return 0;
          }
          return prev - 1;
        });
        setTimeUsed(prev => prev + 1);
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [examState]);

  useEffect(() => {
    if (examState !== "active") return;
    const handleVisibility = () => {
      if (document.hidden) {
        setIntegrityLog(prev => [...prev, `Tab switch at ${new Date().toISOString()}`]);
        toast({ title: isAf ? "Waarskuwing" : "Warning", description: isAf ? "Blaai-skakel opgespoor!" : "Tab switch detected!", variant: "destructive" });
      }
    };
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        setIntegrityLog(prev => [...prev, `Fullscreen exit at ${new Date().toISOString()}`]);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [examState, isAf]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startExam = useCallback(async () => {
    setAnswers({ sectionA: {}, sectionB: {}, sectionC: {} });
    setTimeRemaining(180 * 60);
    setTimeUsed(0);
    setIntegrityLog([`Exam started at ${new Date().toISOString()}`]);
    setCurrentSection("A");
    setCurrentQuestionIndex(0);
    setSelectedEssay(null);
    setExamState("active");
    try { await document.documentElement.requestFullscreen(); } catch {}
  }, []);

  const t = isAf ? {
    title: "Eksamentyd",
    subtitle: "KABV-Belynde Proefeksamens",
    selectPaper: "Kies 'n Vraestel",
    startExam: "Begin Eksamen",
    rules: "Eksamenreëls",
    submit: "Indien Eksamen",
    sectionA: "Afdeling A – Meervoudige Keuse",
    sectionB: "Afdeling B – Gevallestudies",
    sectionC: "Afdeling C – Opstel",
    marks: "punte",
    timeLeft: "Tyd Oor",
    results: "Resultate",
    topicBreakdown: "Onderwerpuiteensetting",
    back: "Terug",
    writeAnswer: "Skryf jou antwoord hier",
    chooseOne: "Kies EEN van die volgende opstelle",
    disclaimer: "Hierdie proefeksamen is KABV-belyn. Alle vrae is oorspronklik en gesimuleer.",
    integrity: "Integriteitslog",
    rulesList: [
      "Die eksamen is 3 uur (180 minute) lank",
      "Afdeling A: 20 meervoudige keuse vrae (40 punte)",
      "Afdeling B: 3 gevallestudies (80 punte)",
      "Afdeling C: Kies 1 opstel uit 2 (30 punte)",
      "Totaal: 150 punte",
      "Blaaier-skakels word aangeteken",
      "Die eksamen sal outomaties indien wanneer tyd verstreke is",
    ],
    downloadJson: "Laai Resultate Af",
    paper: "Vraestel",
    readScenario: "Lees die scenario en beantwoord die vrae",
  } : {
    title: "Crunch Time",
    subtitle: "CAPS-Aligned Mock Examinations",
    selectPaper: "Select a Paper",
    startExam: "Start Exam",
    rules: "Exam Rules",
    submit: "Submit Exam",
    sectionA: "Section A – Multiple Choice",
    sectionB: "Section B – Case Studies",
    sectionC: "Section C – Essay",
    marks: "marks",
    timeLeft: "Time Left",
    results: "Results",
    topicBreakdown: "Topic Breakdown",
    back: "Back",
    writeAnswer: "Write your answer here",
    chooseOne: "Choose ONE of the following essays",
    disclaimer: "This mock examination is CAPS-aligned. All questions are original and simulated.",
    integrity: "Integrity Log",
    rulesList: [
      "The examination is 3 hours (180 minutes) long",
      "Section A: 20 multiple choice questions (40 marks)",
      "Section B: 3 case studies (80 marks)",
      "Section C: Choose 1 essay from 2 (30 marks)",
      "Total: 150 marks",
      "Tab switches will be logged",
      "The exam will auto-submit when time expires",
    ],
    downloadJson: "Download Results",
    paper: "Paper",
    readScenario: "Read the scenario and answer the questions",
  };

  // Shared header action buttons — keeps the legacy per-language test IDs so existing
  // E2E selectors (button-lang-en / button-lang-af) keep working, while also exposing a
  // single combined toggle for screen readers and keyboard users.
  const baseActions = useMemo(() => (
    <>
      <div
        role="group"
        aria-label={isAf ? "Taal kies" : "Choose language"}
        className="inline-flex items-center rounded-md p-0.5"
        style={{ background: CARD_BG, border: `1px solid ${DIVIDER_HEX}` }}
        data-testid="button-language-toggle"
      >
        <button
          type="button"
          onClick={() => setLanguage("en")}
          aria-pressed={!isAf}
          aria-label="English"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-semibold transition-colors"
          style={!isAf ? { color: AQUA_HEX, background: "rgba(159,245,232,.12)" } : { color: "#fff" }}
          data-testid="button-lang-en"
        >
          {!isAf && <Globe className="h-3 w-3" />}EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("af")}
          aria-pressed={isAf}
          aria-label="Afrikaans"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-semibold transition-colors"
          style={isAf ? { color: AQUA_HEX, background: "rgba(159,245,232,.12)" } : { color: "#fff" }}
          data-testid="button-lang-af"
        >
          {isAf && <Globe className="h-3 w-3" />}AF
        </button>
      </div>
      <Link href="/dashboard">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 shrink-0"
          style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
          title={isAf ? "Tuis" : "Home"}
          aria-label={isAf ? "Tuis" : "Home"}
          data-testid="button-home"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden md:inline">{isAf ? "Tuis" : "Home"}</span>
        </button>
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-lg text-white hover:bg-white/5 transition-colors border-0 bg-transparent"
        title={isAf ? "Uitteken" : "Sign Out"}
        aria-label={isAf ? "Uitteken" : "Sign Out"}
        data-testid="button-logout"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </>
  ), [isAf, logout, setLanguage]);

  // ---------- SELECT STATE ----------
  if (examState === "select") {
    const papers = papersData?.papers ?? [];
    return (
      <div className="min-h-screen relative text-white" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
        <GraffitiSplats variant="corner" opacity={0.35} />
        <PageHeader
          sticky
          icon={Zap}
          animatedIcon="bolt"
          title={t.title}
          subtitle={t.subtitle}
          testId="text-page-title"
          actions={baseActions}
        />

        <main className="max-w-5xl mx-auto px-4 py-6">
          <p className="mb-5" style={bebasKicker(BUTTER_HEX, 16)}>
            {isAf ? "Kies jou vraestel" : "Select your paper"}
          </p>

          {papersLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <Card key={i} className="p-5 space-y-4" style={cardStyle()}>
                  <Skeleton className="h-5 w-2/3 rounded-lg bg-[#1b1922]" />
                  <Skeleton className="h-3 w-full rounded bg-[#1b1922]" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-3 w-full rounded bg-[#1b1922]" />
                    <Skeleton className="h-3 w-5/6 rounded bg-[#1b1922]" />
                    <Skeleton className="h-3 w-4/6 rounded bg-[#1b1922]" />
                  </div>
                  <Skeleton className="h-9 w-full rounded-xl mt-2 bg-[#1b1922]" />
                </Card>
              ))}
            </div>
          ) : isUnauthorized ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center px-6" style={cardStyle(BUTTER_HEX)} data-testid="empty-bst-unauthorized">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: "rgba(255,226,154,.1)", border: `1.5px solid ${BUTTER_HEX}` }}>
                <Shield className="w-7 h-7" style={{ color: BUTTER_HEX }} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {isAf ? "Meld aan om vraestelle te sien" : "Sign in to load papers"}
              </h3>
              <p className="text-sm text-white max-w-sm">
                {isAf
                  ? "Crunch Time vraestelle is beskikbaar nadat jy ingeteken het."
                  : "Crunch Time papers are available once you're signed in to your BrainTrack account."}
              </p>
              <Button
                variant="primary"
                onClick={() => { window.location.href = "/signin"; }}
                className="mt-6"
                data-testid="button-bst-signin"
              >
                {isAf ? "Meld aan" : "Sign in"}
              </Button>
            </Card>
          ) : papersError ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center px-6" style={cardStyle(ALERT_HEX)} data-testid="empty-bst-error">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: "rgba(255,141,161,.08)", border: `1.5px solid ${ALERT_HEX}` }}>
                <AlertCircle className="w-7 h-7" style={{ color: ALERT_HEX }} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {isAf ? "Kon nie vraestelle laai nie" : "Couldn't load papers"}
              </h3>
              <p className="text-sm text-white max-w-sm">
                {isAf
                  ? "Iets het verkeerd geloop. Probeer asseblief weer."
                  : "Something went wrong fetching the paper list. Please try again."}
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-6"
                data-testid="button-bst-retry"
              >
                {isAf ? "Probeer weer" : "Retry"}
              </Button>
            </Card>
          ) : papers.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center px-6" style={cardStyle(AQUA_HEX)} data-testid="empty-bst-papers">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: "rgba(159,245,232,.08)", border: `1.5px solid ${AQUA_HEX}` }}>
                <AlertCircle className="w-7 h-7" style={{ color: AQUA_HEX }} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {isAf ? "Geen vraestelle beskikbaar nie" : "No papers available yet"}
              </h3>
              <p className="text-sm text-white max-w-sm">
                {isAf
                  ? "Vraestelle word tans voorberei. Kom later terug."
                  : "Papers are being prepared. Check back soon or contact your admin."}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="mt-6"
                data-testid="button-back-dashboard"
              >
                {isAf ? "Terug na Kontroleskerm" : "Back to Dashboard"}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((p, idx) => {
                const accent = PASTELS[idx % PASTELS.length];
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPaperId(p.id); setExamState("rules"); }}
                    data-testid={`card-paper-${p.id}`}
                    className="group relative overflow-hidden text-left rounded-2xl p-5 transition-all duration-200 min-w-0 w-full hover:-translate-y-0.5"
                    style={{ background: CARD_BG, border: `1.5px solid ${accent}` }}
                  >
                    {/* Accent top rule — comp card marker */}
                    <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
                    <div className="flex items-start gap-3 mb-4 min-w-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0" style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${accent}` }}>
                        <FileText className="w-4 h-4" style={{ color: accent }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-white">{t.paper} {p.paperNumber}</p>
                        <p className="text-xs text-white mt-0.5 leading-snug truncate">{p.name}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between">
                        <span className="text-white">{isAf ? "Totaal" : "Total marks"}</span>
                        <span className="font-bold" style={{ color: accent }}>{p.totalMarks} {t.marks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">{isAf ? "Tyd" : "Duration"}</span>
                        <span className="text-white font-semibold">{p.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Sec A</span>
                        <span className="text-white font-semibold">{p.sectionA} MCQ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Sec B</span>
                        <span className="text-white font-semibold">{p.sectionB} {isAf ? "Gevalle" : "Cases"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Sec C</span>
                        <span className="text-white font-semibold">{p.sectionC} {isAf ? "Opstelle" : "Essays"}</span>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-center gap-2 w-full min-h-[44px] py-2 rounded-xl text-xs font-extrabold transition-transform group-hover:-translate-y-0.5"
                      style={{
                        color: "#050508",
                        background: "var(--bt-rainbow)",
                        backgroundSize: "200% 100%",
                        animation: "bt-rainbow 5s linear infinite",
                        border: "2px solid #050508",
                      }}
                      data-testid={`button-start-${p.id}`}
                    >
                      <Play className="w-3.5 h-3.5" /> {t.startExam}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ---------- RULES STATE ----------
  if (examState === "rules") {
    return (
      <div className="min-h-screen relative text-white" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
        <GraffitiSplats variant="hero" opacity={0.4} />
        <PageHeader
          sticky
          icon={Shield}
          animatedIcon="bolt"
          title={t.rules}
          subtitle={t.title}
          testId="text-page-title"
          actions={baseActions}
        />

        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card className="relative overflow-hidden p-6 space-y-5" style={cardStyle(BUTTER_HEX)}>
            <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: BUTTER_HEX }} />
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "rgba(255,226,154,.1)", border: `1.5px solid ${BUTTER_HEX}` }}>
                <Shield className="w-5 h-5" style={{ color: BUTTER_HEX }} />
              </div>
              <h2 className="font-black text-lg text-white">{t.rules}</h2>
            </div>
            <ul className="space-y-2.5">
              {t.rulesList.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: MINT_HEX }} />
                  <span className="text-white">{rule}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-white border-t pt-3" style={{ borderColor: DIVIDER_HEX }}>
              {t.disclaimer}
            </p>
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={() => setExamState("select")}
                data-testid="button-back-select"
              >
                {t.back}
              </Button>
              <Button
                variant="primary"
                onClick={startExam}
                className="flex-1 gap-2 min-h-[44px]"
                data-testid="button-begin-exam"
              >
                <Play className="w-4 h-4" /> {t.startExam}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // ---------- ACTIVE STATE ----------
  if (examState === "active" && paper) {
    const sectionACount = paper.sectionA.length;
    const sectionBCount = paper.sectionB.reduce((sum, cs) => sum + cs.subQuestions.length, 0);
    const sectionCCount = paper.sectionC.length;
    const answeredA = Object.keys(answers.sectionA).length;
    const answeredB = Object.keys(answers.sectionB).length;
    const answeredC = Object.keys(answers.sectionC).length;
    const totalAnswered = answeredA + answeredB + answeredC;
    const totalQuestions = sectionACount + sectionBCount + sectionCCount;
    const progressPct = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
    const isLowTime = timeRemaining < 600;
    const isCritical = timeRemaining < 300;

    const sectionTabs: { id: Section; label: string; count: number; answered: number }[] = [
      { id: "A", label: "A", count: sectionACount, answered: answeredA },
      { id: "B", label: "B", count: sectionBCount, answered: answeredB },
      { id: "C", label: "C", count: sectionCCount, answered: answeredC },
    ];

    const timerHex = isCritical ? ALERT_HEX : isLowTime ? BUTTER_HEX : "#fff";
    const activeActions = (
      <>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg tabular-nums font-mono text-sm font-semibold"
          style={{
            color: timerHex,
            background: isCritical ? "rgba(255,141,161,.08)" : isLowTime ? "rgba(255,226,154,.08)" : CARD_BG,
            border: `1px solid ${isCritical || isLowTime ? timerHex : DIVIDER_HEX}`,
          }}
        >
          <Clock className="w-4 h-4" />
          <span data-testid="text-timer">{formatTime(timeRemaining)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: CARD_BG, border: `1px solid ${DIVIDER_HEX}` }}>
          <span className="text-white">{isAf ? "Vooruitgang" : "Progress"}</span>
          <span className="text-white font-semibold tabular-nums">{totalAnswered}/{totalQuestions}</span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending}
          data-testid="button-submit-exam"
          className="gap-1 min-h-[44px]"
          style={{ border: `2px solid ${ALERT_HEX}` }}
        >
          {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">{t.submit}</span>
        </Button>
      </>
    );

    return (
      <div className="min-h-screen flex flex-col text-white" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }} onContextMenu={e => e.preventDefault()} data-nosnippet>
        {/* Combined sticky wrapper: PageHeader + section tabs sub-bar move together so the
            sub-bar can't overlap PageHeader on narrow widths where actions wrap. */}
        <div className="sticky top-0 z-50 border-b" style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", borderColor: DIVIDER_HEX }}>
          <PageHeader
            icon={Zap}
            animatedIcon="bolt"
            title={paper.name || t.title}
            subtitle={`${t.paper} ${paper.paperNumber} · ${formatTime(timeUsed)} ${isAf ? "verby" : "elapsed"}`}
            testId="text-page-title"
            actions={activeActions}
            className="max-w-5xl mx-auto px-4 pt-3 pb-2 !mb-0"
          />
          <div className="max-w-5xl mx-auto px-4 pb-2.5 flex flex-wrap items-center justify-between gap-3 border-t pt-2" style={{ borderColor: DIVIDER_HEX }}>
            <div className="flex items-center gap-1.5 p-1 rounded-lg" style={{ background: CARD_BG, border: `1px solid ${DIVIDER_HEX}` }}>
              {sectionTabs.map(tab => {
                const isActive = currentSection === tab.id;
                const complete = tab.answered >= tab.count && tab.count > 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setCurrentSection(tab.id); setCurrentQuestionIndex(0); }}
                    data-testid={`tab-section-${tab.id.toLowerCase()}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-md text-xs font-bold transition-all"
                    style={
                      isActive
                        ? { color: AQUA_HEX, background: "rgba(159,245,232,.12)", border: `1px solid ${AQUA_HEX}` }
                        : { color: "#fff", border: "1px solid transparent" }
                    }
                  >
                    <span>{tab.label}</span>
                    <span className="tabular-nums" style={{ color: isActive ? AQUA_HEX : "#fff" }}>
                      {tab.answered}/{tab.count}
                    </span>
                    {complete && <CheckCircle2 className="w-3 h-3" style={{ color: MINT_HEX }} />}
                  </button>
                );
              })}
            </div>
            <div className="flex-1 min-w-[140px] max-w-xs">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: DIVIDER_HEX }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#9FF5E8,#C5B3FF)" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {currentSection === "A" && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-white" data-testid="text-section-title">{t.sectionA} (40 {t.marks})</h2>
                {paper.sectionA.map((q) => (
                  <Card key={q.id} style={cardStyle(answers.sectionA[q.id] ? MINT_HEX : undefined)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="font-medium text-sm text-white" data-testid={`text-mcq-${q.id}`}>
                          {q.questionNumber}. {q.question}
                        </p>
                        <Badge variant="outline" className="flex-shrink-0" style={{ color: BUTTER_HEX, borderColor: BUTTER_HEX, background: "transparent" }}>{q.marks} {t.marks}</Badge>
                      </div>
                      <div className="grid gap-2">
                        {q.options.map(opt => {
                          const selected = answers.sectionA[q.id] === opt.label;
                          return (
                            <button
                              key={opt.label}
                              onClick={() => setAnswers(prev => ({ ...prev, sectionA: { ...prev.sectionA, [q.id]: opt.label } }))}
                              data-testid={`button-option-${q.id}-${opt.label}`}
                              className="flex items-center gap-3 text-left rounded-xl px-3 py-2 min-h-[44px] transition-all text-white"
                              style={{
                                background: selected ? "rgba(159,245,232,.08)" : DIVIDER_HEX,
                                border: selected ? `1.5px solid ${AQUA_HEX}` : `1.5px solid ${DIVIDER_HEX}`,
                              }}
                            >
                              <span
                                className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-black flex-shrink-0"
                                style={{
                                  background: selected ? "linear-gradient(100deg,#9FF5E8,#C5B3FF)" : "rgba(5,5,8,.6)",
                                  color: selected ? "#050508" : "#fff",
                                  border: selected ? "none" : `1px solid ${DIVIDER_HEX}`,
                                }}
                              >
                                {opt.label}
                              </span>
                              <span className="text-sm">{opt.text}</span>
                              {selected && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: AQUA_HEX }} />}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {currentSection === "B" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-white" data-testid="text-section-title">{t.sectionB} (80 {t.marks})</h2>
                {paper.sectionB.map(cs => (
                  <Card key={cs.id} style={cardStyle()}>
                    <CardHeader>
                      <CardTitle className="text-base text-white">
                        {isAf ? "Vraag" : "Question"} {cs.questionNumber}
                        <Badge className="ml-2" variant="outline" style={{ color: BUTTER_HEX, borderColor: BUTTER_HEX, background: "transparent" }}>{cs.totalMarks} {t.marks}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div
                        className="p-4 rounded-xl text-sm text-white"
                        style={{ background: "rgba(159,216,255,.06)", border: `1px solid ${SKY_HEX}` }}
                        data-testid={`text-scenario-${cs.id}`}
                      >
                        <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: SKY_HEX }}>{t.readScenario}</p>
                        <div className="whitespace-pre-wrap">{cs.scenario}</div>
                      </div>
                      {cs.subQuestions.map((sq, si) => (
                        <div key={sq.id} className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-white" data-testid={`text-case-q-${sq.id}`}>
                              {cs.questionNumber}.{si + 1} {sq.question}
                            </p>
                            <Badge variant="outline" className="flex-shrink-0" style={{ color: BUTTER_HEX, borderColor: BUTTER_HEX, background: "transparent" }}>{sq.marks}</Badge>
                          </div>
                          <Textarea
                            value={answers.sectionB[sq.id] || ""}
                            onChange={e => setAnswers(prev => ({ ...prev, sectionB: { ...prev.sectionB, [sq.id]: e.target.value } }))}
                            placeholder={t.writeAnswer}
                            className="min-h-[100px] text-sm rounded-xl text-white placeholder:text-white focus-visible:ring-[#9FF5E8]/40 focus-visible:border-[#9FF5E8]"
                            style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${DIVIDER_HEX}` }}
                            data-testid={`input-case-${sq.id}`}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {currentSection === "C" && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-white" data-testid="text-section-title">{t.sectionC} (30 {t.marks})</h2>
                <p className="text-sm text-white">{t.chooseOne}</p>
                {paper.sectionC.map(eq => {
                  const isSelected = selectedEssay === eq.id;
                  return (
                    <Card key={eq.id} style={cardStyle(isSelected ? AQUA_HEX : undefined)}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant={isSelected ? "primary" : "outline"}
                              size="sm"
                              className="min-h-[44px]"
                              onClick={() => setSelectedEssay(eq.id)}
                              data-testid={`button-select-essay-${eq.id}`}
                            >
                              {isAf ? "Vraag" : "Q"} {eq.questionNumber}
                            </Button>
                            <Badge variant="outline" style={{ color: BUTTER_HEX, borderColor: BUTTER_HEX, background: "transparent" }}>{eq.marks} {t.marks}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-white" data-testid={`text-essay-${eq.id}`}>{eq.question}</p>
                        {isSelected && (
                          <Textarea
                            value={answers.sectionC[eq.id] || ""}
                            onChange={e => setAnswers(prev => ({ ...prev, sectionC: { ...prev.sectionC, [eq.id]: e.target.value } }))}
                            placeholder={t.writeAnswer}
                            className="min-h-[280px] text-sm rounded-xl text-white placeholder:text-white focus-visible:ring-[#9FF5E8]/40 focus-visible:border-[#9FF5E8]"
                            style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${DIVIDER_HEX}` }}
                            data-testid={`input-essay-${eq.id}`}
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- RESULTS STATE ----------
  if (examState === "results" && examResult) {
    const bandColor = BAND_COLORS[examResult.masteryBand] || "#fff";
    const bandLabel = BAND_LABELS[examResult.masteryBand]?.[language] || "";

    const downloadResults = async () => {
      const blob = new Blob([JSON.stringify(examResult, null, 2)], { type: "application/json" });
      const filename = `bst-exam-results-${new Date().toISOString().split("T")[0]}.json`;
      await downloadBlob(blob, filename);
    };

    const resultsActions = (
      <>
        {canDownload && (
          <Button variant="outline" size="sm" onClick={downloadResults} className="gap-1" data-testid="button-download-results">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t.downloadJson}</span>
          </Button>
        )}
        <Button variant="primary" size="sm" onClick={() => { setExamState("select"); setExamResult(null); }} data-testid="button-new-exam">
          {t.selectPaper}
        </Button>
        {baseActions}
      </>
    );

    return (
      <div className="min-h-screen relative text-white" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
        <GraffitiSplats variant="corner" opacity={0.3} />
        <PageHeader
          sticky
          icon={Trophy}
          animatedIcon="trophy"
          title={t.results}
          subtitle={`${examResult.percentage}% · ${examResult.totalScore}/${examResult.totalMarks} ${t.marks}`}
          testId="text-results-title"
          actions={resultsActions}
        />

        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Hero score card */}
          <Card className="relative overflow-hidden" style={cardStyle(bandColor)}>
            <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: bandColor }} />
            <CardContent className="p-8">
              <div className="text-center space-y-3">
                <div style={bebasKicker(bandColor, 18)}>{t.results}</div>
                <div
                  className="text-6xl sm:text-7xl font-black tabular-nums"
                  style={{ color: bandColor }}
                  data-testid="text-score-percentage"
                >
                  {examResult.percentage}%
                </div>
                <div className="text-lg text-white">
                  <span data-testid="text-score-fraction">{examResult.totalScore} / {examResult.totalMarks}</span> {t.marks}
                </div>
                <Badge className="text-sm" variant="outline" style={{ color: bandColor, borderColor: bandColor, background: "rgba(5,5,8,.6)" }} data-testid="text-mastery-band">
                  {bandLabel}
                </Badge>
                <div className="text-xs text-white pt-2">
                  {isAf ? "Tyd gebruik" : "Time used"}: <span className="tabular-nums text-white font-semibold">{formatTime(examResult.timeUsedSeconds)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Topic breakdown */}
          <Card style={cardStyle()}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Target className="w-5 h-5" style={{ color: AQUA_HEX }} /> {t.topicBreakdown}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {examResult.topicBreakdown.map(tb => {
                  const tbHex = BAND_COLORS[tb.band] || "#fff";
                  return (
                    <div key={tb.topic} className="space-y-1" data-testid={`topic-result-${tb.topic.replace(/\s/g, '-')}`}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-white">{tb.topic}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white tabular-nums">{tb.earned}/{tb.available}</span>
                          <Badge variant="outline" style={{ color: tbHex, borderColor: tbHex, background: "transparent" }}>
                            {tb.percentage}% · {BAND_LABELS[tb.band]?.[language] || ""}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: DIVIDER_HEX }}>
                        <div className="h-full rounded-full" style={{ width: `${tb.percentage}%`, background: tbHex }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section A review */}
          <Card style={cardStyle()}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <ListChecks className="w-5 h-5" style={{ color: AQUA_HEX }} />
                {t.sectionA} · {isAf ? "Hersiening" : "Review"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {examResult.results.sectionA.map((r, idx) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2.5 rounded-lg text-sm"
                    style={{
                      background: r.correct ? "rgba(148,247,197,.06)" : "rgba(255,141,161,.06)",
                      border: `1px solid ${r.correct ? MINT_HEX : ALERT_HEX}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {r.correct
                        ? <CheckCircle2 className="w-4 h-4" style={{ color: MINT_HEX }} />
                        : <XCircle className="w-4 h-4" style={{ color: ALERT_HEX }} />}
                      <span className="text-white">{isAf ? "Vraag" : "Q"} {idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white">
                        {isAf ? "Jou" : "Your"}: <span className="text-white font-medium">{r.userAnswer || "—"}</span>
                      </span>
                      {!r.correct && <Badge variant="outline" style={{ color: MINT_HEX, borderColor: MINT_HEX, background: "transparent" }}>{r.correctAnswer}</Badge>}
                      <span className="font-medium text-white tabular-nums">{r.earned}/{r.marks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integrity log */}
          {examResult.integrityLog.length > 0 && (
            <Card style={cardStyle()}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5" style={{ color: AQUA_HEX }} /> {t.integrity}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {examResult.integrityLog.map((log, i) => (
                    <p key={i} className="text-xs text-white font-mono">{log}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050508" }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: AQUA_HEX }} />
    </div>
  );
}
