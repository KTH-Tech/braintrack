// BrainTrack DBE Practice — verbatim past-paper practice UI restyled to the
// "Luxury Street Graffiti EdTech" comp (matches exam-mode.tsx conventions).
// #050508 ground, #0e0d12 accent-bordered cards, Bebas Neue eyebrows,
// aqua→purple gradient action buttons, pure white text. Bilingual EN/AF.
// RESTYLE ONLY — all hooks, queries, mutations and data-testids preserved.
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ExamQuestionText } from "@/components/exam/exam-question-text";
import { Sparkles, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useEntitlements } from "@/hooks/use-entitlements";
import { PlanScopeBadge, SeasonPassLockedCard } from "@/components/plan-scope";
import {
  PatGuidanceBanner,
  CreativeWritingGuidanceBanner,
  CreativeWritingTipsPanel,
  isPatGuidanceMemo,
  isCreativeWritingGuidanceMemo,
} from "@/components/exam/pat-guidance-banner";
import {
  BookOpen,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  FileText,
  Award,
  Loader2,
  AlertCircle,
  ExternalLink,
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

// Comp gradient + accent constants — mirror exam-mode.tsx
const ACTION_GRADIENT = "linear-gradient(100deg,#9FF5E8,#C5B3FF)";
const VERBATIM_HEX = "#94F7C5";
const VERBATIM_HALO = "rgba(148,247,197,.25)";
const AI_HEX = "#C5B3FF";
const AI_HALO = "rgba(197,179,255,.25)";

// Small pill helper style (uppercase micro-label chips)
const pillBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  borderRadius: 999,
  padding: "4px 11px",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
};

const ghostBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontFamily: "'Poppins',sans-serif",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: "#fff",
  background: "transparent",
  border: "2px solid #1b1922",
  borderRadius: 10,
  padding: "8px 14px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export default function DbePracticePage() {
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  // Per-product journey: sprint plans see the 3 most recent exam years
  // (server-filtered) plus an upgrade card for the full archive.
  const { plan: entPlan, entitlements: ent } = useEntitlements();
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

  const { data, isLoading, isError, refetch, isRefetching } = useQuery<QuestionsResponse>({
    queryKey: ["/api/dbe/questions", subject, yearParam, paperParam, sourceFilter, language],
    queryFn: async () => {
      const qs = new URLSearchParams({ subject, source: sourceFilter, lang: language });
      if (yearParam) qs.set("year", yearParam);
      if (paperParam) qs.set("paperNumber", paperParam);
      qs.set("limit", "500");
      const r = await fetch(`/api/dbe/questions?${qs}`, { credentials: "include" });
      // AUDIT FIX: without this, a failed request either JSON-parse crashed or
      // rendered the misleading "No questions available" empty state.
      if (!r.ok) throw new Error(`dbe-questions ${r.status}`);
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
      <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            background: "#0e0d12",
            border: "1.5px solid rgba(255,141,161,.4)",
            borderRadius: 20,
            padding: "42px 36px",
            textAlign: "center",
          }}
        >
          <AlertCircle style={{ width: 48, height: 48, margin: "0 auto 12px", color: "#FF8DA1" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{isAf ? "Geen vak gekies nie." : "No subject selected."}</div>
          <Link href="/exam-mode">
            <button className="btx-ghost" style={{ ...ghostBtn, marginTop: 18 }}>
              {isAf ? "Terug na Eksamens" : "Back to Exams"}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif", overflowX: "hidden" }}>
      <style>{`
        .btx-action { transition: transform .2s; }
        .btx-action:hover { transform: translateY(-2px); }
        .btx-action:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .btx-nav { transition: transform .2s, background .2s; }
        .btx-nav:hover { transform: translateY(-1px); background: #1b1922 !important; }
        .btx-ghost { transition: border-color .2s, transform .2s; }
        .btx-ghost:hover { border-color: #fff !important; transform: translateY(-1px); }
        .btx-ghost:disabled { opacity: .4; cursor: not-allowed; transform: none; }
        .btx-jump { transition: border-color .2s, transform .2s; }
        .btx-jump:hover { border-color: #9FF5E8 !important; transform: translateY(-1px); }
        @media (max-width: 640px) {
          .btx-jumpgrid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* ── Sticky header ───────────────────────────────────── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, padding: "10px 20px", position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,5,8,.94)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid #1b1922",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Link href="/dashboard">
            <button
              data-testid="button-home"
              title={isAf ? "Tuis" : "Home"}
              className="btx-nav"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13,
                color: "#9FD8FF", background: "#0e0d12",
                border: "1.5px solid #9FD8FF", borderRadius: 12,
                padding: "8px 14px", cursor: "pointer", whiteSpace: "nowrap", flex: "none",
              }}
            >
              <ArrowLeft style={{ width: 15, height: 15 }} />
              <span className="hidden md:inline">{isAf ? "Tuis" : "Home"}</span>
            </button>
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "#9FF5E8", transform: "rotate(-2deg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {subject}
            </div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", color: "#fff" }}>
              {yearParam && paperParam
                ? `${yearParam} | ${isAf ? "Vraestel" : "Paper"} ${paperParam}`
                : isAf ? "Alle Vraestelle" : "All Papers"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
          <button
            onClick={toggleLanguage}
            className="btx-nav"
            style={{
              fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13,
              color: "#C5B3FF", background: "#0e0d12",
              border: "1.5px solid #C5B3FF", borderRadius: 12,
              padding: "8px 14px", cursor: "pointer",
            }}
            data-testid="button-language-toggle"
          >
            {language === "en" ? "EN" : "AF"}
          </button>
          <button
            onClick={() => logout()}
            title={isAf ? "Uitteken" : "Sign Out"}
            className="btx-nav"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13,
              color: "#FFB7E5", background: "#0e0d12",
              border: "1.5px solid #FFB7E5", borderRadius: 12,
              padding: "8px 14px", cursor: "pointer",
            }}
            data-testid="button-logout"
          >
            <LogOut style={{ width: 15, height: 15 }} />
            <span className="hidden md:inline">{isAf ? "Uitteken" : "Sign Out"}</span>
          </button>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 80px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section style={{ animation: "bt-fadeup .5s both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <BookOpen style={{ width: 15, height: 15, color: "#FFE29A" }} />
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 15,
                color: "#FFE29A",
                transform: "rotate(-2deg)",
                display: "inline-block",
              }}
            >
              {isAf ? "Regte vraestelle. Regte oefening. 🔥" : "Real papers. Real reps. 🔥"}
            </span>
            <PlanScopeBadge isAf={isAf} />
          </div>
          <div
            role="heading"
            aria-level={1}
            style={{
              fontWeight: 900,
              letterSpacing: "-.02em",
              lineHeight: 0.98,
              fontSize: "clamp(28px, 5vw, 42px)",
              marginTop: 8,
              backgroundImage:
                "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {isAf ? "DBE-oefening" : "DBE Practice"}
          </div>
          <p style={{ fontSize: 14, color: "#fff", marginTop: 8, maxWidth: 560 }}>
            {isAf
              ? "Werk deur egte DBE-vrae en KI-oefenvrae — memo's op aanvraag, geen druk nie."
              : "Work through real DBE questions and AI practice sets — memos on demand, zero pressure."}
          </p>
        </section>

        {/* Sprint plans: server already scopes the list to the 3 most recent
            exam years — this card explains why and offers the upgrade path. */}
        {entPlan && ent.paperYears === 3 && (
          <div style={{ maxWidth: 440 }}>
            <SeasonPassLockedCard
              isAf={isAf}
              feature={isAf
                ? "Jou sprint sluit die 3 mees onlangse eksamenjare in. Die volle 10-jaar-argief is 'n Seisoenkaart-eksklusief."
                : "Your sprint includes the 3 most recent exam years. The full 10-year archive is a Season Pass exclusive."}
              testId="locked-full-archive"
            />
          </div>
        )}

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton className="h-12 rounded-xl bg-[#0e0d12]" />
            <Skeleton className="h-64 rounded-2xl bg-[#0e0d12]" />
          </div>
        ) : isError ? (
          // AUDIT FIX: request failures used to fall through to the "No
          // questions available" empty state. Show a real error with retry.
          <div
            style={{
              background: "#0e0d12",
              border: "1.5px solid #FF8DA1",
              borderRadius: 20,
              padding: "56px 32px",
              textAlign: "center",
            }}
            data-testid="dbe-questions-error"
          >
            <AlertCircle style={{ width: 48, height: 48, margin: "0 auto 12px", color: "#FF8DA1" }} />
            <div role="heading" aria-level={2} style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
              {isAf ? "Kon nie vrae laai nie." : "Couldn't load questions."}
            </div>
            <p style={{ fontSize: 13, color: "#fff", marginTop: 8, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
              {isAf
                ? "Kontroleer jou internetverbinding en probeer weer."
                : "Check your connection and try again."}
            </p>
            <div style={{ marginTop: 20 }}>
              <Button
                variant="primary"
                disabled={isRefetching}
                onClick={() => refetch()}
                data-testid="button-retry-questions"
              >
                {isRefetching ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : null}
                {isRefetching ? (isAf ? "Probeer…" : "Retrying…") : (isAf ? "Probeer weer" : "Try again")}
              </Button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div
            style={{
              background: "#0e0d12",
              border: "1.5px solid rgba(255,226,154,.4)",
              borderRadius: 20,
              padding: "56px 32px",
              textAlign: "center",
            }}
          >
            <BookOpen style={{ width: 48, height: 48, margin: "0 auto 12px", color: "#FFE29A" }} />
            <div role="heading" aria-level={2} style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
              {isAf ? "Geen vrae beskikbaar nie." : "No questions available."}
            </div>
            <p style={{ fontSize: 13, color: "#fff", marginTop: 8, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
              {isAf
                ? "Daar is nog geen vrygestelde vrae vir hierdie vak en filterkeuse nie — probeer 'n ander jaar of vraestel, of kom binnekort terug."
                : "There are no released questions for this subject and filter yet — try a different year or paper, or check back soon."}
            </p>
            <Link href="/exam-mode">
              <button className="btx-ghost" style={{ ...ghostBtn, marginTop: 20 }}>
                {isAf ? "Terug na Eksamens" : "Back to Exams"}
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* ── Toolbar: count pill + source filter + prev/next ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ ...pillBase, color: "#9FD8FF", border: "1px solid #9FD8FF" }}>
                  <FileText style={{ width: 12, height: 12 }} />
                  {total} {isAf ? "vrae" : "questions"}
                </span>
                {data?.counts && (
                  <div style={{ display: "inline-flex", borderRadius: 999, border: "1px solid #1b1922", overflow: "hidden" }}>
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
                          style={{
                            fontFamily: "'Poppins',sans-serif",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "6px 12px",
                            border: "none",
                            cursor: "pointer",
                            transition: "background .2s, color .2s",
                            color: isActive ? "#050508" : "#fff",
                            background: isActive ? ACTION_GRADIENT : "transparent",
                          }}
                          data-testid={`filter-source-${opt}`}
                        >
                          {labels[opt][isAf ? "af" : "en"]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="btx-ghost"
                  style={{ ...ghostBtn, padding: "7px 10px" }}
                  onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                  data-testid="button-prev"
                >
                  <ChevronLeft style={{ width: 15, height: 15 }} />
                </button>
                <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  {currentIdx + 1} / {questions.length}
                </span>
                <button
                  className="btx-ghost"
                  style={{ ...ghostBtn, padding: "7px 10px" }}
                  onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIdx === questions.length - 1}
                  data-testid="button-next"
                >
                  <ChevronRight style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>

            {/* ── Exam chooser chips ─────────────────────────────── */}
            {exams.length > 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", color: "#FFE29A" }}>
                  {isAf ? "Kies eksamen" : "Choose exam"}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <button
                    onClick={() => { setExamKey(""); setCurrentIdx(0); }}
                    className="btx-jump"
                    style={{
                      fontFamily: "'Poppins',sans-serif",
                      fontSize: 11, fontWeight: 800,
                      padding: "6px 12px", borderRadius: 10, cursor: "pointer",
                      color: examKey === "" ? "#9FF5E8" : "#fff",
                      background: examKey === "" ? "rgba(159,245,232,.12)" : "#0e0d12",
                      border: examKey === "" ? "1px solid #9FF5E8" : "1px solid #1b1922",
                    }}
                    data-testid="exam-all"
                  >
                    {isAf ? "Alle vraestelle" : "All papers"} <span>({allQuestions.length})</span>
                  </button>
                  {exams.map(ex => {
                    const active = examKey === ex.key;
                    const hex = ex.source === "ai" ? AI_HEX : "#9FF5E8";
                    const tint = ex.source === "ai" ? "rgba(197,179,255,.12)" : "rgba(159,245,232,.12)";
                    return (
                      <button
                        key={ex.key}
                        onClick={() => { setExamKey(ex.key); setCurrentIdx(0); }}
                        className="btx-jump"
                        style={{
                          fontFamily: "'Poppins',sans-serif",
                          fontSize: 11, fontWeight: 800,
                          padding: "6px 12px", borderRadius: 10, cursor: "pointer",
                          color: active ? hex : "#fff",
                          background: active ? tint : "#0e0d12",
                          border: active ? `1px solid ${hex}` : "1px solid #1b1922",
                        }}
                        data-testid={`exam-${ex.key}`}
                      >
                        {ex.source === "ai"
                          ? (isAf ? "KI-oefening" : "AI Practice")
                          : `${ex.year} ${ex.session} · ${isAf ? "V" : "P"}${ex.paperNumber}`}
                        <span style={{ marginLeft: 4 }}>({ex.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Source paper panel ─────────────────────────────── */}
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
                <div
                  style={{
                    position: "relative",
                    background: "#0e0d12",
                    border: "1.5px solid rgba(159,216,255,.4)",
                    borderRadius: 20,
                    padding: "18px 20px",
                    overflow: "hidden",
                  }}
                  data-testid="source-paper-panel"
                >
                  <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#9FD8FF" }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", color: "#9FD8FF" }}>
                        {isAf ? "Bron-vraestel" : "Source paper"}
                      </div>
                      <div role="heading" aria-level={3} style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 3 }}>
                        {selectedExam.year} {selectedExam.session} · {isAf ? "Vraestel" : "Paper"} {selectedExam.paperNumber}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {paperUrl && (
                        <a
                          href={paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btx-ghost"
                          style={{ ...ghostBtn, border: "1px solid #1b1922", padding: "7px 12px", textDecoration: "none" }}
                          data-testid="link-paper-pdf"
                        >
                          <Download style={{ width: 13, height: 13 }} /> {isAf ? "Vraestel PDF" : "Paper PDF"}
                        </a>
                      )}
                      {memoUrl && (
                        <a
                          href={memoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btx-ghost"
                          style={{ ...ghostBtn, border: "1px solid #1b1922", padding: "7px 12px", textDecoration: "none" }}
                          data-testid="link-memo-pdf"
                        >
                          <Download style={{ width: 13, height: 13 }} /> {isAf ? "Memo PDF" : "Memo PDF"}
                        </a>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isGen}
                        onClick={() => generateFromPaper.mutate({
                          year: selectedExam.year!,
                          session: selectedExam.session,
                          paperNumber: selectedExam.paperNumber!,
                        })}
                        data-testid="button-generate-from-paper"
                      >
                        {isGen ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Sparkles style={{ width: 13, height: 13 }} />}
                        {isGen
                          ? (isAf ? "Genereer..." : "Generating…")
                          : (isAf ? "Genereer oefening uit hierdie vraestel" : "Generate practice from this paper")}
                      </Button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.6, color: "#fff", marginTop: 10 }}>
                    {isAf
                      ? "Skep 10 nuwe KI-oefenvrae in dieselfde styl, onderwerpe en moeilikheidsvlak as hierdie vraestel — perfek om verder te oefen sodra jy klaar is."
                      : "Creates 10 new AI practice questions in the same style, topics and difficulty as this paper — perfect for extra revision once you're done."}
                  </div>
                </div>
              );
            })()}

            {/* ── Question card ──────────────────────────────────── */}
            {current && (() => {
              const srcHex = current.source === "ai" ? AI_HEX : VERBATIM_HEX;
              const srcHalo = current.source === "ai" ? AI_HALO : VERBATIM_HALO;
              return (
                <div
                  style={{
                    position: "relative",
                    background: "#0e0d12",
                    border: `1.5px solid ${srcHex}`,
                    borderRadius: 20,
                    padding: 22,
                    overflow: "hidden",
                  }}
                  data-testid={`question-card-${current.id}`}
                >
                  <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: srcHex }} />

                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                    <div style={{ minWidth: 0 }}>
                      <div role="heading" aria-level={2} style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
                        {isAf ? "Vraag" : "Question"} {current.questionNumber}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        <span
                          style={{ ...pillBase, color: srcHex, border: `1px solid ${srcHex}` }}
                          data-testid={`source-${current.source}`}
                        >
                          {current.source === "ai"
                            ? (isAf ? "KI-oefening" : "AI Practice")
                            : (isAf ? "Eg DBE" : "Real DBE")}
                          {current.source === "ai" && current.qualityScore != null && ` · ${current.qualityScore}%`}
                        </span>
                        <span style={{ ...pillBase, color: "#9FD8FF", border: "1px solid #9FD8FF" }}>
                          {paperLabel(current)}
                        </span>
                        {current.topic && (
                          <span style={{ ...pillBase, color: "#fff", border: "1px solid #1b1922" }}>
                            {current.topic}
                          </span>
                        )}
                        {current.marks != null && (
                          <span style={{ ...pillBase, color: "#FFE29A", border: "1px solid #FFE29A" }}>
                            <Award style={{ width: 11, height: 11 }} />
                            {current.marks} {isAf ? current.marks === 1 ? "punt" : "punte" : current.marks === 1 ? "mark" : "marks"}
                          </span>
                        )}
                        <span style={{ ...pillBase, color: "#FFB7E5", border: "1px solid #FFB7E5", textTransform: "capitalize", letterSpacing: ".5px" }}>
                          {current.cognitiveLevel}
                        </span>
                      </div>
                    </div>
                    {current.sourcePaperUrl && (
                      <a
                        href={current.sourcePaperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#9FF5E8", textDecoration: "none", flex: "none" }}
                        data-testid={`link-source-${current.id}`}
                      >
                        <ExternalLink style={{ width: 12, height: 12 }} />
                        {isAf ? "DBE-bron" : "DBE source"}
                      </a>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

                    {/* Question text */}
                    <div
                      style={{
                        padding: 18,
                        borderRadius: 14,
                        background: "linear-gradient(#0e0d12, #0e0d12), #050508",
                        border: "1px solid #1b1922",
                      }}
                    >
                      <div style={{ fontSize: 14, lineHeight: 1.7, fontWeight: 500, color: "#fff" }} data-testid={`text-question-${current.id}`}>
                        <ExamQuestionText text={current.questionText} />
                      </div>
                    </div>

                    {/* Memo toggle */}
                    {shownMemos.has(current.id) ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toggleMemo(current.id)}
                        data-testid={`button-memo-${current.id}`}
                      >
                        <EyeOff style={{ width: 14, height: 14 }} />
                        {isAf ? "Verberg Memo" : "Hide Memo"}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => toggleMemo(current.id)}
                        data-testid={`button-memo-${current.id}`}
                      >
                        <Eye style={{ width: 14, height: 14 }} />
                        {isAf ? "Wys Memo / Antwoord" : "Show Memo / Answer"}
                      </Button>
                    )}

                    {/* Memo reveal */}
                    {shownMemos.has(current.id) && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "bt-fadeup .4s both" }}>
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
                          <div
                            style={{
                              padding: 18,
                              borderRadius: 14,
                              background: "rgba(148,247,197,.08)",
                              border: "1px solid rgba(148,247,197,.45)",
                              display: "flex", flexDirection: "column", gap: 8,
                            }}
                          >
                            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", color: "#94F7C5" }}>
                              {isAf ? "Memo / Amptelike Antwoord" : "Memo / Official Answer"}
                            </div>
                            {current.memoText ? (
                              <div style={{ fontSize: 14, lineHeight: 1.7, color: "#fff" }} data-testid={`text-memo-${current.id}`}>
                                <ExamQuestionText text={current.memoText} />
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#fff" }}>
                                <AlertCircle style={{ width: 15, height: 15, flex: "none", color: "#FFE29A" }} />
                                <span>
                                  {isAf
                                    ? "Memo nog nie beskikbaar nie. "
                                    : "Memo not yet available. "}
                                  {current.sourceMemoUrl && (
                                    <a
                                      href={current.sourceMemoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#9FF5E8", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2 }}
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
                  </div>
                </div>
              );
            })()}

            {/* ── Jump grid ──────────────────────────────────────── */}
            <div className="btx-jumpgrid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {questions.map((q, idx) => {
                const active = idx === currentIdx;
                const done = shownMemos.has(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIdx(idx); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="btx-jump"
                    style={{
                      fontFamily: "'Poppins',sans-serif",
                      padding: "9px 6px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      color: active ? "#9FF5E8" : done ? "#94F7C5" : "#fff",
                      background: active ? "rgba(159,245,232,.12)" : done ? "rgba(148,247,197,.08)" : "#0e0d12",
                      border: active ? "1px solid #9FF5E8" : done ? "1px solid rgba(148,247,197,.45)" : "1px solid #1b1922",
                    }}
                    data-testid={`button-jump-${q.id}`}
                  >
                    Q{q.questionNumber}
                    {q.marks != null && <span style={{ fontSize: 9, marginLeft: 4 }}>({q.marks})</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
