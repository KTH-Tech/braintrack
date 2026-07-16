import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ExamQuestionText } from "@/components/exam/exam-question-text";
import { Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import {
  PatGuidanceBanner,
  CreativeWritingGuidanceBanner,
  CreativeWritingTipsPanel,
  isPatGuidanceMemo,
  isCreativeWritingGuidanceMemo,
} from "@/components/exam/pat-guidance-banner";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  Loader2,
  AlertCircle,
  ExternalLink,
  Globe,
  Home,
  LogOut,
} from "lucide-react";

interface DbeQuestion {
  id: string;
  source: "verbatim" | "ai";
  subject: string;
  year: number | null;
  session: string | null;
  paperNumber: number | null;
  language: string;
  questionNumber: string;
  questionText: string;
  memoText: string | null;
  marks: number | null;
  topic: string | null;
  cognitiveLevel: string;
  sourcePaperUrl: string | null;
  sourceMemoUrl: string | null;
  qualityScore?: number;
}

interface QuestionsResponse {
  questions: DbeQuestion[];
  total: number;
  page: number;
  limit: number;
  counts?: { verbatim: number; ai: number };
}

export default function DbePracticePage() {
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const search = useSearch();
  const params = new URLSearchParams(search);
  const subject = params.get("subject") ?? "";
  const yearParam = params.get("year") ?? "";
  const paperParam = params.get("paper") ?? "";

  const [currentIdx, setCurrentIdx] = useState(0);
  const [shownMemos, setShownMemos] = useState<Set<string>>(new Set());
  const [startedQuestions, setStartedQuestions] = useState<Set<string>>(new Set());
  const [writingTipsDismissed, setWritingTipsDismissed] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<"all" | "verbatim" | "ai">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateFromPaper = useMutation({
    mutationFn: async (vars: { year: number; session: string | null; paperNumber: number }) => {
      const r = await apiRequest("POST", "/api/dbe/generate-from-paper", { subject, ...vars, count: 10 });
      return r.json();
    },
    onSuccess: (data) => {
      toast({
        title: isAf ? "Klaar gegenereer" : "Generated",
        description: isAf
          ? `${data.generated} nuwe oefening-vrae geskep uit hierdie vraestel.`
          : `${data.generated} new practice questions created from this paper.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dbe/questions", subject] });
    },
    onError: (e: any) => {
      toast({
        title: isAf ? "Kon nie genereer nie" : "Generation failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    },
  });

  const { data, isLoading } = useQuery<QuestionsResponse>({
    queryKey: ["/api/dbe/questions", subject, yearParam, paperParam, sourceFilter],
    queryFn: async () => {
      const qs = new URLSearchParams({ subject, source: sourceFilter });
      if (yearParam) qs.set("year", yearParam);
      if (paperParam) qs.set("paperNumber", paperParam);
      qs.set("limit", "500");
      const r = await fetch(`/api/dbe/questions?${qs}`, { credentials: "include" });
      return r.json();
    },
    enabled: !!subject,
  });

  const allQuestions = data?.questions ?? [];
  const [examKey, setExamKey] = useState<string>("");

  const exams = (() => {
    const seen = new Map<string, { key: string; year: number | null; session: string | null; paperNumber: number | null; source: "verbatim" | "ai"; count: number }>();
    for (const q of allQuestions) {
      const key = q.source === "ai" ? "ai" : `${q.year}|${q.session}|${q.paperNumber}`;
      const existing = seen.get(key);
      if (existing) existing.count++;
      else seen.set(key, { key, year: q.year, session: q.session, paperNumber: q.paperNumber, source: q.source, count: 1 });
    }
    return Array.from(seen.values()).sort((a, b) => {
      if (a.source === "ai" && b.source !== "ai") return 1;
      if (b.source === "ai" && a.source !== "ai") return -1;
      if ((b.year ?? 0) !== (a.year ?? 0)) return (b.year ?? 0) - (a.year ?? 0);
      return (a.paperNumber ?? 0) - (b.paperNumber ?? 0);
    });
  })();

  const questions = examKey
    ? allQuestions.filter(q => (q.source === "ai" ? "ai" : `${q.year}|${q.session}|${q.paperNumber}`) === examKey)
    : allQuestions;
  const total = questions.length;
  const current = questions[currentIdx];

  const toggleMemo = (id: string) => {
    setShownMemos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setStartedQuestions(started => {
          if (started.has(id)) return started;
          const updated = new Set(started);
          updated.add(id);
          return updated;
        });
      }
      return next;
    });
  };

  const paperLabel = (q: DbeQuestion) =>
    q.source === "ai"
      ? (isAf ? "KI-oefening" : "AI Practice")
      : `${q.year} ${q.session} | ${isAf ? "Vraestel" : "Paper"} ${q.paperNumber}`;

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-white mx-auto" />
          <p className="text-white">{isAf ? "Geen vak gekies nie." : "No subject selected."}</p>
          <Link href="/exam-mode">
            <Button variant="outline">{isAf ? "Terug na Eksamens" : "Back to Exams"}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border sticky top-0 z-50 bg-background/90">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold text-sm leading-tight">{subject}</p>
                <p className="text-[10px] text-white uppercase tracking-wider">
                  {yearParam && paperParam
                    ? `${yearParam} | ${isAf ? "Vraestel" : "Paper"} ${paperParam}`
                    : isAf ? "Alle Vraestelle" : "All Papers"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-white hover:text-white transition-colors" data-testid="button-language-toggle">
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold">{language === "en" ? "EN" : "AF"}</span>
              </button>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-white" title={isAf ? "Tuis" : "Home"} data-testid="button-home">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-white" onClick={() => logout()} title={isAf ? "Uitteken" : "Sign Out"} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-white" />
              <p className="font-semibold text-white">{isAf ? "Geen vrae beskikbaar nie." : "No questions available."}</p>
              <Link href="/exam-mode">
                <Button variant="outline" className="mt-4">
                  {isAf ? "Terug na Eksamens" : "Back to Exams"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {total} {isAf ? "vrae" : "questions"}
                </Badge>
                {data?.counts && (
                  <div className="inline-flex items-center rounded-md border border-border overflow-hidden text-[11px]">
                    {(["all", "verbatim", "ai"] as const).map(opt => {
                      const labels = {
                        all: { en: "All", af: "Alles" },
                        verbatim: { en: `Real DBE (${data.counts!.verbatim})`, af: `Eg DBE (${data.counts!.verbatim})` },
                        ai: { en: `AI Practice (${data.counts!.ai})`, af: `KI (${data.counts!.ai})` },
                      };
                      const isActive = sourceFilter === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => { setSourceFilter(opt); setCurrentIdx(0); }}
                          className={`px-2 py-1 font-semibold transition-colors ${
                            isActive ? "bg-primary text-primary-foreground" : "bg-card text-white hover:bg-muted"
                          }`}
                          data-testid={`filter-source-${opt}`}
                        >
                          {labels[opt][isAf ? "af" : "en"]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                  data-testid="button-prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-white">
                  {currentIdx + 1} / {questions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIdx === questions.length - 1}
                  data-testid="button-next"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {exams.length > 1 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-white uppercase tracking-wider">
                  {isAf ? "Kies eksamen" : "Choose exam"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setExamKey(""); setCurrentIdx(0); }}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors ${
                      examKey === ""
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card text-white hover:border-primary/40"
                    }`}
                    data-testid="exam-all"
                  >
                    {isAf ? "Alle vraestelle" : "All papers"} <span className="opacity-60">({allQuestions.length})</span>
                  </button>
                  {exams.map(ex => (
                    <button
                      key={ex.key}
                      onClick={() => { setExamKey(ex.key); setCurrentIdx(0); }}
                      className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors ${
                        examKey === ex.key
                          ? ex.source === "ai"
                            ? "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300"
                            : "border-primary bg-primary/15 text-primary"
                          : "border-border bg-card text-white hover:border-primary/40"
                      }`}
                      data-testid={`exam-${ex.key}`}
                    >
                      {ex.source === "ai"
                        ? (isAf ? "KI-oefening" : "AI Practice")
                        : `${ex.year} ${ex.session} · ${isAf ? "V" : "P"}${ex.paperNumber}`}
                      <span className="opacity-60 ml-1">({ex.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(() => {
              const selectedExam = exams.find(e => e.key === examKey);
              if (!selectedExam || selectedExam.source !== "verbatim") return null;
              const seedQ = allQuestions.find(
                q => q.source === "verbatim" && q.year === selectedExam.year && q.session === selectedExam.session && q.paperNumber === selectedExam.paperNumber
              );
              const paperUrl = seedQ?.sourcePaperUrl;
              const memoUrl = seedQ?.sourceMemoUrl;
              const isGen = generateFromPaper.isPending;
              return (
                <Card className="border-primary/30 bg-primary/5" data-testid="source-paper-panel">
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-white">
                          {isAf ? "Bron-vraestel" : "Source paper"}
                        </p>
                        <p className="text-sm font-semibold">
                          {selectedExam.year} {selectedExam.session} · {isAf ? "Vraestel" : "Paper"} {selectedExam.paperNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {paperUrl && (
                          <a
                            href={paperUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
                            data-testid="link-paper-pdf"
                          >
                            <Download className="w-3.5 h-3.5" /> {isAf ? "Vraestel PDF" : "Paper PDF"}
                          </a>
                        )}
                        {memoUrl && (
                          <a
                            href={memoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
                            data-testid="link-memo-pdf"
                          >
                            <Download className="w-3.5 h-3.5" /> {isAf ? "Memo PDF" : "Memo PDF"}
                          </a>
                        )}
                        <Button
                          size="sm"
                          disabled={isGen}
                          onClick={() => generateFromPaper.mutate({
                            year: selectedExam.year!,
                            session: selectedExam.session,
                            paperNumber: selectedExam.paperNumber!,
                          })}
                          className="gap-1.5 text-xs"
                          data-testid="button-generate-from-paper"
                        >
                          {isGen ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          {isGen
                            ? (isAf ? "Genereer..." : "Generating…")
                            : (isAf ? "Genereer oefening uit hierdie vraestel" : "Generate practice from this paper")}
                        </Button>
                      </div>
                    </div>
                    <p className="text-[11px] text-white">
                      {isAf
                        ? "Skep 10 nuwe KI-oefenvrae in dieselfde styl, onderwerpe en moeilikheidsvlak as hierdie vraestel — perfek om verder te oefen sodra jy klaar is."
                        : "Creates 10 new AI practice questions in the same style, topics and difficulty as this paper — perfect for extra revision once you're done."}
                    </p>
                  </CardContent>
                </Card>
              );
            })()}

            {current && (
              <Card className="border-2 border-border" data-testid={`question-card-${current.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">
                        {isAf ? "Vraag" : "Question"} {current.questionNumber}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`text-[10px] ${current.source === "ai" ? "bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"}`}
                          data-testid={`source-${current.source}`}
                        >
                          {current.source === "ai"
                            ? (isAf ? "KI-oefening" : "AI Practice")
                            : (isAf ? "Eg DBE" : "Real DBE")}
                          {current.source === "ai" && current.qualityScore != null && ` · ${current.qualityScore}%`}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {paperLabel(current)}
                        </Badge>
                        {current.topic && (
                          <Badge variant="outline" className="text-[10px]">
                            {current.topic}
                          </Badge>
                        )}
                        {current.marks != null && (
                          <Badge className="text-[10px] bg-primary/15 text-primary">
                            <Award className="w-2.5 h-2.5 mr-1" />
                            {current.marks} {isAf ? current.marks === 1 ? "punt" : "punte" : current.marks === 1 ? "mark" : "marks"}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize text-white">
                          {current.cognitiveLevel}
                        </Badge>
                      </div>
                    </div>
                    {current.sourcePaperUrl && (
                      <a
                        href={current.sourcePaperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white hover:text-primary flex items-center gap-1"
                        data-testid={`link-source-${current.id}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        {isAf ? "DBE-bron" : "DBE source"}
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const isCreativeWritingPaper =
                      isCreativeWritingGuidanceMemo(current.memoText) ||
                      (/isixhosa/i.test(current.subject) &&
                        /home language|huistaal/i.test(current.subject) &&
                        current.paperNumber === 3);
                    if (
                      !isCreativeWritingPaper ||
                      writingTipsDismissed ||
                      startedQuestions.has(current.id)
                    ) {
                      return null;
                    }
                    return (
                      <CreativeWritingTipsPanel
                        isAf={isAf}
                        onDismiss={() => setWritingTipsDismissed(true)}
                      />
                    );
                  })()}

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                    <div className="text-sm leading-relaxed font-medium" data-testid={`text-question-${current.id}`}>
                      <ExamQuestionText text={current.questionText} />
                    </div>
                  </div>

                  <Button
                    variant={shownMemos.has(current.id) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleMemo(current.id)}
                    className="w-full gap-2"
                    data-testid={`button-memo-${current.id}`}
                  >
                    {shownMemos.has(current.id)
                      ? <><EyeOff className="w-4 h-4" />{isAf ? "Verberg Memo" : "Hide Memo"}</>
                      : <><Eye className="w-4 h-4" />{isAf ? "Wys Memo / Antwoord" : "Show Memo / Answer"}</>}
                  </Button>

                  {shownMemos.has(current.id) && (
                    <div className="animate-in fade-in space-y-2">
                      {isPatGuidanceMemo(current.memoText) ? (
                        <PatGuidanceBanner
                          memoText={current.memoText!}
                          isAf={isAf}
                        />
                      ) : isCreativeWritingGuidanceMemo(current.memoText) ? (
                        <CreativeWritingGuidanceBanner
                          memoText={current.memoText!}
                          isAf={isAf}
                        />
                      ) : (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 space-y-2 text-emerald-950 dark:text-emerald-100">
                          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                            {isAf ? "Memo / Amptelike Antwoord" : "Memo / Official Answer"}
                          </p>
                          {current.memoText ? (
                            <div className="text-sm leading-relaxed" data-testid={`text-memo-${current.id}`}>
                              <ExamQuestionText text={current.memoText} />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>
                                {isAf
                                  ? "Memo nog nie beskikbaar nie. "
                                  : "Memo not yet available. "}
                                {current.sourceMemoUrl && (
                                  <a
                                    href={current.sourceMemoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline underline-offset-2 font-semibold"
                                  >
                                    {isAf ? "Sien amptelike DBE-memo" : "View official DBE memo"}
                                  </a>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => { setCurrentIdx(idx); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                    idx === currentIdx
                      ? "border-primary bg-primary/15 text-primary"
                      : shownMemos.has(q.id)
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-border bg-card hover:border-primary/40 text-white"
                  }`}
                  data-testid={`button-jump-${q.id}`}
                >
                  Q{q.questionNumber}
                  {q.marks != null && <span className="text-[9px] ml-1 opacity-60">({q.marks})</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
