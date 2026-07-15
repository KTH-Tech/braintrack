import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Play, ShieldCheck, RefreshCw, Search, CheckCircle2, XCircle,
  Loader2, BookOpen, FileText, Eye, GraduationCap,
  Sparkles, ChevronDown, ChevronRight, Zap, BarChart3,
  Download, AlertTriangle, Wrench, Home, LogOut, Trash2,
  Upload, ExternalLink, FileUp, CheckCheck, CloudUpload, Clock, Calendar, History,
  Database, FileSearch, ChevronUp, X, FileCheck,
} from "lucide-react";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { useLanguage } from "@/lib/language-context";
import { formatDate, formatDateTime, formatTime, formatNumber } from "@/lib/formatters";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubjectRow {
  subject: string;
  catalogPapers: number;
  catalogMemos: number;
  papersDone: number;
  memosDone: number;
  papersFailed: number;
  questionsExtracted: number;
  simulatedCount: number;
  flashcardsCount?: number;
  flashcardsToday?: number;
  quizzesCount?: number;
  dailyChallengesCount?: number;
  aiExamPapersCount?: number;
  lastIngested: string | null;
  verifiedCount: number;
  failedVerifyCount: number;
  isRunning: boolean;
  lastResult: { completed: number; failed: number; errors: string[]; finishedAt: string } | null;
  pipelinePhase: "ingesting" | "rebuilding_mastery" | "filling_missing" | "ready" | "failed" | null;
  yearsImported: number;
  avgQualityScore: number;
  avgPredictiveRating: number;
  qualityChecked: boolean;
  unscoredCount: number;
  pipelineAccuracy: number;
  totalTopics: number;
  simulationQuality: number;
  isFullyVerified: boolean;
  verifiedChecks: { hasAllPapers: boolean; hasMemoCoverage: boolean; masteryBuilt: boolean; accuracyPassed: boolean };
  topicsCovered: number;
  highYieldTopics: number;
  yearProgress: Record<number, { paperDone: boolean; memoDone: boolean; failed: boolean; questions: number }>;
  yearUrls: Record<number, { papers: { url: string; paperNumber: number; linkText: string }[]; memos: { url: string; paperNumber: number; linkText: string }[] }>;
  masteryYears: number[];
  memoCoverage?: number;
  marksCoverage?: number;
  levelCoverage?: number;
  topicCoverage?: number;
}

interface OverallStatus {
  total_completed: string;
  total_failed: string;
  verbatimQuestionsTotal: number;
  simulatedQuestionsTotal: number;
  topicsCovered: number;
  totalTopics: number;
  highYieldTopics: number;
  currentlyRunning: string[];
  flashcardsTotal?: number;
  flashcardsToday?: number;
  quizzesTotal?: number;
  quizzesSubjects?: number;
  dailyChallengesTotal?: number;
  dailyChallengesSubjects?: number;
  aiExamPapersTotal?: number;
}

interface MissingMemoRow {
  subject: string;
  year: number;
  paperNumber: number;
  language: string;
  missing: number;
  total: number;
  memoCoveragePct: number;
  withMemoUrl: number;
  noMemoUrl: number;
  catalogHasMemo: boolean;
  qpUrl: string | null;
  memoUrl: string | null;
  remediationHint: string;
}

interface MissingMemosResponse {
  generatedAt: string;
  groupCount: number;
  totalMemoLessQuestions: number;
  bySubjectTotals: Record<string, number>;
  rows: MissingMemoRow[];
}

interface VerbatimQuestion {
  id: number;
  questionNumber: string;
  questionText: string;
  memoText: string | null;
  marks: number | null;
  cognitiveLevel: string;
  contentHash: string;
  year: number;
  paperNumber: number;
  language: string;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function memoCovColorFor(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return "#00E5FF";
  if (pct < 60) return "#ef4444";
  if (pct < 90) return "#f59e0b";
  return "#00E5FF";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, onClick, valueColor }: {
  label: string; value: string | number; sub?: string; icon?: any; onClick?: () => void; valueColor?: string;
}) {
  const { language } = useLanguage();
  const resolvedColor = valueColor ?? "#00E5FF";
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-black p-3 ${onClick ? "cursor-pointer" : ""}`}
      style={{
        border: "1.5px solid rgba(0,229,255,0.45)",
        boxShadow: "0 0 12px rgba(0,229,255,0.18), inset 0 0 14px rgba(0,0,0,0.6)",
      }}
      data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white">{label}</div>
          <div className="text-2xl font-black mt-1" style={{ color: resolvedColor, textShadow: `0 0 8px ${resolvedColor}88` }}>
            {typeof value === "number" ? formatNumber(value, language) : value}
          </div>
          {sub && <div className="text-[10px] text-white mt-1 truncate">{sub}</div>}
        </div>
        {Icon && (
          <Icon className="w-5 h-5 shrink-0" style={{ color: "#00E5FF", filter: "drop-shadow(0 0 4px rgba(0,229,255,0.7))" }} />
        )}
      </div>
    </div>
  );
}

function YearUploadButton({ subject, year, isMemo, label, disabled }: {
  subject: string; year: number; isMemo: boolean; label: string; disabled: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setDone(false);
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("subject", subject);
    formData.append("year", String(year));
    formData.append("paperNumber", "1");
    formData.append("isMemo", String(isMemo));
    try {
      const res = await fetch("/api/admin/dbe-ingestion/upload", { method: "POST", body: formData, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setDone(true);
      toast({ title: `${isMemo ? "Memo" : "Paper"} uploaded — ${data.questionsExtracted ?? 0} questions extracted`, description: `${subject} ${year}` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-uploads/list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <Button
        size="sm"
        variant="outline"
        className={`h-6 text-[10px] gap-0.5 px-1.5 ${isMemo ? "border-emerald-400/50 text-emerald-700 hover:bg-emerald-50" : "border-cyan-400/50 text-cyan-700 hover:bg-cyan-50"}`}
        disabled={disabled || uploading}
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        title={`Upload ${isMemo ? "memo" : "paper"} PDF directly`}
      >
        {uploading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : done ? <CheckCheck className="w-2.5 h-2.5" /> : <FileUp className="w-2.5 h-2.5" />}
        {label}
      </Button>
    </>
  );
}

function SubjectAccordion({ row, localFiles, onIngest, onVerify, onPreview, onFixAll, onQualityCheck, onRestart, onForceReingest, onClear, onRebuildMastery, onSimulate, onCrunchSubject, onFillMissing, isIngesting, isVerifying, isFixing, isChecking, isRestarting, isForceReingesting, isClearing, isRebuildingMastery, isSimulating, isFilling, isAnyCrunchRunning, openaiReady }: {
  row: SubjectRow;
  localFiles?: Record<string, Record<string, { papers: string[]; memos: string[] }>>;
  onIngest: (subject: string, year?: number) => void;
  onVerify: (subject: string) => void;
  onPreview: (subject: string) => void;
  onFixAll: (subject: string) => void;
  onQualityCheck: (subject: string) => void;
  onRestart: (subject: string) => void;
  onForceReingest: (subject: string, year?: number) => void;
  onClear: (subject: string) => void;
  onRebuildMastery: (subject: string) => void;
  onSimulate: (subject: string) => void;
  onCrunchSubject: (subject: string, count: number) => void;
  onFillMissing: (subject: string) => void;
  isIngesting: boolean; isVerifying: boolean; isFixing: boolean; isChecking: boolean;
  isRestarting: boolean; isForceReingesting: boolean; isClearing: boolean; isSimulating: boolean; isRebuildingMastery: boolean;
  isFilling: boolean; isAnyCrunchRunning: boolean;
  openaiReady?: boolean;
}) {
  const [open, setOpen] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}");
      return saved.accordions?.[row.subject] ?? false;
    } catch { return false; }
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { language } = useLanguage();

  const qaMutation = useMutation({
    mutationFn: ({ subject, type }: { subject: string; type: "verbatim" | "simulated" }) =>
      apiRequest("POST", "/api/admin/dbe-ingestion/qa-check", { subject, type }).then((r) => r.json()),
    onSuccess: (data: any, vars) => {
      if (data.error) { toast({ title: "QA Check failed", description: data.error, variant: "destructive" }); return; }
      toast({ title: `QA ${vars.type === "verbatim" ? "Verbatim" : "Simulated"} — ${vars.subject}`, description: `Memo: ${data.accuracy}% · CAPS: ${data.capsAlignment}% · Structure: ${data.structureScore}% · ${data.samplesChecked ?? 0} checked` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] });
    },
    onError: (err: any) => toast({ title: "QA failed", description: err.message, variant: "destructive" }),
  });

  const isPipelineRunning = row.isRunning || row.pipelinePhase === "ingesting" || row.pipelinePhase === "rebuilding_mastery" || row.pipelinePhase === "filling_missing";
  const hasQuestions = row.questionsExtracted > 0;
  const hasPapers = row.papersDone > 0;
  const cappedPapers = Math.min(row.papersDone, row.catalogPapers);
  const ingestionComplete = cappedPapers >= row.catalogPapers && row.catalogPapers > 0;
  const qualityPassed = (row.avgQualityScore ?? 0) >= 60;
  const pct = row.catalogPapers > 0 ? Math.min(100, Math.round((cappedPapers / row.catalogPapers) * 100)) : 0;
  const aiBlocked = openaiReady === false;

  const borderColor = isPipelineRunning ? "rgba(255,230,0,0.6)" : hasQuestions ? "rgba(0,229,255,0.4)" : hasPapers ? "rgba(255,138,0,0.4)" : row.papersFailed > 0 ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.12)";
  const glowColor = isPipelineRunning ? "rgba(255,230,0,0.15)" : hasQuestions ? "rgba(0,229,255,0.1)" : "transparent";

  const neonBtn = "h-7 text-[11px] gap-1 inline-flex items-center justify-center rounded-lg bg-black px-2.5 font-black uppercase tracking-[0.08em] transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100";
  const ghostBtn = "h-7 text-[11px] gap-1 inline-flex items-center justify-center rounded-lg bg-black px-2.5 font-bold uppercase tracking-[0.06em] transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100";

  return (
    <div className="rounded-xl overflow-hidden bg-black" style={{ border: `1.5px solid ${borderColor}`, boxShadow: `0 0 12px ${glowColor}` }} data-testid={`subject-row-${row.subject}`}>
      <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => {
        const next = !open;
        setOpen(next);
        try {
          const saved = JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}");
          if (!saved.accordions) saved.accordions = {};
          saved.accordions[row.subject] = next;
          localStorage.setItem("braintrack:dbe-portal:ui", JSON.stringify(saved));
        } catch {}
      }} data-testid={`subject-toggle-${row.subject}`}>
        {open ? <ChevronDown className="w-4 h-4 shrink-0 text-white/60" /> : <ChevronRight className="w-4 h-4 shrink-0 text-white/60" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black text-sm truncate text-white">{row.subject}</span>
            {isPipelineRunning && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] rounded-md bg-black px-2 py-0.5" style={{ color: "#FFE600", border: "1px solid rgba(255,230,0,0.7)" }}>
                <Loader2 className="w-3 h-3 animate-spin" />
                {row.pipelinePhase === "rebuilding_mastery" ? "Mastery" : row.pipelinePhase === "filling_missing" ? "Filling" : "Ingesting"}
              </span>
            )}
            {!isPipelineRunning && hasQuestions && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] rounded-md bg-black px-2 py-0.5" style={{ color: "#00E5FF", border: "1px solid rgba(0,229,255,0.5)" }}>
                <Sparkles className="w-3 h-3" /> {formatNumber(row.questionsExtracted, language)}Q
              </span>
            )}
            {!isPipelineRunning && hasQuestions && row.memoCoverage !== undefined && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] rounded-md bg-black px-2 py-0.5"
                style={{ color: (row.memoCoverage ?? 0) === 100 ? "#00E5FF" : (row.memoCoverage ?? 0) >= 50 ? "#FFE600" : "#f87171", border: `1px solid ${(row.memoCoverage ?? 0) === 100 ? "rgba(0,229,255,0.5)" : (row.memoCoverage ?? 0) >= 50 ? "rgba(255,230,0,0.5)" : "rgba(248,113,113,0.5)"}` }}
                title={`Memo: ${row.memoCoverage}% · Marks: ${row.marksCoverage ?? 0}% · Level: ${row.levelCoverage ?? 0}% · Topic: ${row.topicCoverage ?? 0}%`}>
                {(row.memoCoverage ?? 0) === 100 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                Memo {row.memoCoverage}%
              </span>
            )}
            {!isPipelineRunning && row.pipelinePhase === "failed" && (
              <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.1em] rounded-md bg-black px-2 py-0.5" style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.5)" }}>Failed</span>
            )}
            {row.simulatedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] rounded-md bg-black px-2 py-0.5" style={{ color: "#8A2BFF", border: "1px solid rgba(138,43,255,0.5)" }}>
                <Zap className="w-3 h-3" />{row.simulatedCount}
                {row.simulationQuality > 0 && <span className="opacity-60">·{row.simulationQuality}%</span>}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: ingestionComplete ? "#00E5FF" : "#FFE600", boxShadow: `0 0 6px ${ingestionComplete ? "rgba(0,229,255,0.5)" : "rgba(255,230,0,0.5)"}` }} />
          </div>
          <span className="text-xs w-14 text-right font-black tabular-nums" style={{ color: ingestionComplete ? "#00E5FF" : "#FFE600" }}>{pct}%</span>
        </div>
      </div>

      {open && (
        <div className="p-3 space-y-4 bg-black" style={{ borderTop: "1px solid rgba(0,229,255,0.2)" }}>
          {/* Action buttons */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#00E5FF" }}>Actions</div>
            <div className="flex flex-wrap gap-2">
              <button
                className={neonBtn}
                style={{ color: "#00E5FF", border: "1.5px solid rgba(0,229,255,0.6)", boxShadow: "0 0 8px rgba(0,229,255,0.3)" }}
                disabled={isPipelineRunning || isIngesting}
                onClick={(e) => { e.stopPropagation(); onIngest(row.subject); }}
                title="Download PDFs from DBE and extract questions for all years (2015–2024)"
                data-testid={`btn-ingest-all-years-${row.subject}`}>
                {isPipelineRunning || isIngesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Ingest All Years
              </button>
              {hasQuestions && (
                <button
                  className={neonBtn}
                  style={aiBlocked
                    ? { color: "rgba(138,43,255,0.4)", border: "1px solid rgba(138,43,255,0.25)", cursor: "not-allowed" }
                    : { color: "#8A2BFF", border: "1.5px solid rgba(138,43,255,0.7)", boxShadow: "0 0 8px rgba(138,43,255,0.3)" }}
                  disabled={isPipelineRunning || isSimulating || aiBlocked}
                  onClick={(e) => { e.stopPropagation(); if (!aiBlocked) onSimulate(row.subject); }}
                  title={aiBlocked ? "Requires OpenAI API key — configure AI_INTEGRATIONS_OPENAI_API_KEY to enable" : "Use OpenAI to generate 50 practice questions from ingested content (batched, mastery-aware)"}
                  data-testid={`btn-simulate-${row.subject}`}>
                  {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Build Questions
                  {aiBlocked && <span className="ml-1 text-[9px] font-black uppercase tracking-[0.1em] px-1 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>No key</span>}
                </button>
              )}
              {ingestionComplete && (
                <button
                  className={neonBtn}
                  style={aiBlocked
                    ? { color: "rgba(217,70,239,0.4)", border: "1px solid rgba(217,70,239,0.25)", cursor: "not-allowed" }
                    : { color: "#d946ef", border: "1.5px solid rgba(217,70,239,0.7)", boxShadow: "0 0 8px rgba(217,70,239,0.3)" }}
                  disabled={isPipelineRunning || isSimulating || isAnyCrunchRunning || aiBlocked}
                  onClick={(e) => { e.stopPropagation(); if (!aiBlocked) onCrunchSubject(row.subject, 10); }}
                  title={aiBlocked ? "Requires OpenAI API key" : "Generate 10 high-quality AI practice papers in one fast batch for this subject"}
                  data-testid={`btn-crunch-subject-${row.subject}`}>
                  <Zap className="w-3.5 h-3.5" /> Crunch ×10
                  {aiBlocked && <span className="ml-1 text-[9px] font-black uppercase tracking-[0.1em] px-1 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>No key</span>}
                </button>
              )}
              {hasQuestions && (row.memoCoverage === undefined || (row.memoCoverage ?? 100) < 100) && (
                <button
                  className={neonBtn}
                  style={{ color: "#fb923c", border: "1.5px solid rgba(251,146,60,0.6)", boxShadow: "0 0 8px rgba(251,146,60,0.25)" }}
                  disabled={isPipelineRunning || isFilling}
                  onClick={(e) => { e.stopPropagation(); onFillMissing(row.subject); }}
                  title="Re-download and re-parse memos for questions that are missing memo text"
                  data-testid={`btn-fill-missing-${row.subject}`}>
                  {isFilling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />} Fill Missing
                </button>
              )}
              <button
                className={neonBtn}
                style={{ color: "#FFE600", border: "1.5px solid rgba(255,230,0,0.6)", boxShadow: "0 0 8px rgba(255,230,0,0.25)" }}
                disabled={isPipelineRunning || isForceReingesting}
                onClick={(e) => { e.stopPropagation(); if (confirm(`Force re-download ALL papers, memos & supporting docs for "${row.subject}"? This replaces any existing data.`)) { onForceReingest(row.subject); } }}
                title="Force re-download and re-parse ALL papers, memos and supporting docs — even already-completed ones"
                data-testid={`btn-force-reingest-${row.subject}`}>
                {isForceReingesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Force Reingest
              </button>
              {hasPapers && (
                <button
                  className={ghostBtn}
                  style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.5)" }}
                  disabled={isPipelineRunning || isRestarting}
                  onClick={(e) => { e.stopPropagation(); onRestart(row.subject); }}
                  title="Clear all ingested data then re-run the full pipeline from scratch"
                  data-testid={`btn-restart-${row.subject}`}>
                  <RefreshCw className="w-3.5 h-3.5" /> Restart
                </button>
              )}
              {hasQuestions && (
                <button
                  className={ghostBtn}
                  style={{ color: "#f87171", border: "1px solid rgba(239,68,68,0.4)" }}
                  disabled={isPipelineRunning || isClearing}
                  onClick={(e) => { e.stopPropagation(); if (confirm(`Clear ALL ingested data for "${row.subject}"?`)) { onClear(row.subject); } }}
                  title="Permanently delete all ingested questions and memo data for this subject — cannot be undone"
                  data-testid={`btn-clear-${row.subject}`}>
                  {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Clear
                </button>
              )}
              {hasQuestions && (
                <button
                  className={ghostBtn}
                  style={{ color: "#006BFF", border: "1px solid rgba(0,107,255,0.5)" }}
                  disabled={isPipelineRunning || qaMutation.isPending}
                  onClick={(e) => { e.stopPropagation(); qaMutation.mutate({ subject: row.subject, type: "verbatim" }); }}
                  title="Run a quality check on a sample of ingested questions — scores memo accuracy, CAPS alignment, and structure">
                  {qaMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />} QA Check
                </button>
              )}
            </div>
          </div>

          {/* Year-by-year detail */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#00E5FF" }}>Papers by Year</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map((yr) => {
                const yrData = row.yearProgress?.[yr];
                const yrUrls = row.yearUrls?.[yr];
                const hasPaper = yrData?.paperDone ?? false;
                const hasMemo = yrData?.memoDone ?? false;
                const hasFailed = yrData?.failed ?? false;
                const yrQuestions = yrData?.questions ?? 0;
                const yrPct = hasPaper && hasMemo ? 100 : hasPaper ? 50 : 0;
                const hasAnyCatalog = (yrUrls?.papers?.length ?? 0) > 0 || (yrUrls?.memos?.length ?? 0) > 0;
                const sanitizedSubj = row.subject.replace(/[^a-zA-Z0-9\-_ ]/g, "").trim().replace(/\s+/g, "_").toLowerCase();
                const localYr = localFiles?.[sanitizedSubj]?.[String(yr)];
                const hasLocalPaper = (localYr?.papers?.length ?? 0) > 0;
                const hasLocalMemo = (localYr?.memos?.length ?? 0) > 0;
                if (!hasAnyCatalog && !hasPaper && !hasMemo && !hasLocalPaper && !hasLocalMemo) return null;
                const yrBorderColor = hasPaper && hasMemo ? "rgba(0,229,255,0.4)" : hasFailed ? "rgba(248,113,113,0.4)" : hasPaper ? "rgba(255,138,0,0.4)" : "rgba(255,255,255,0.1)";
                return (
                  <div key={yr} className="rounded-xl bg-black p-2.5 space-y-2" style={{ border: `1px solid ${yrBorderColor}` }} data-testid={`year-card-${row.subject}-${yr}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{yr}</span>
                        {hasPaper && hasMemo && <CheckCircle2 className="w-3 h-3" style={{ color: "#00E5FF" }} />}
                        {hasFailed && !hasPaper && <XCircle className="w-3 h-3 text-red-400" />}
                        {yrQuestions > 0 && <span className="text-[10px] font-bold" style={{ color: "#00E5FF" }}>{yrQuestions}Q</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black" style={{ color: hasPaper ? "#00E5FF" : "rgba(255,255,255,0.3)" }}>P{hasPaper ? "✓" : "–"}</span>
                        <span className="text-[10px] font-black" style={{ color: hasMemo ? "#4ade80" : "rgba(255,255,255,0.3)" }}>M{hasMemo ? "✓" : "–"}</span>
                      </div>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(yrPct, 0)}%`, background: yrPct === 100 ? "#00E5FF" : yrPct > 0 ? "#FFE600" : "transparent" }} />
                    </div>
                    {yrUrls && (
                      <div className="flex flex-wrap gap-1">
                        {yrUrls.papers?.map((p, i) => (
                          <a key={`paper-${i}`} href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all hover:scale-[1.03]" style={{ color: "#006BFF", border: "1px solid rgba(0,107,255,0.5)", background: "rgba(0,107,255,0.08)" }} title={p.linkText}>
                            <ExternalLink className="w-2.5 h-2.5" /> DBE P{p.paperNumber}
                          </a>
                        ))}
                        {yrUrls.memos?.map((m, i) => (
                          <a key={`memo-${i}`} href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all hover:scale-[1.03]" style={{ color: "#4ade80", border: "1px solid rgba(74,222,128,0.5)", background: "rgba(74,222,128,0.08)" }} title={m.linkText}>
                            <ExternalLink className="w-2.5 h-2.5" /> DBE M{m.paperNumber}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {(!hasPaper || !hasMemo) ? (
                        <button
                          className="h-6 text-[10px] gap-0.5 px-1.5 flex-1 inline-flex items-center justify-center rounded-md font-bold disabled:opacity-40"
                          style={{ color: "#00E5FF", border: "1px solid rgba(0,229,255,0.5)" }}
                          disabled={isPipelineRunning || isIngesting}
                          onClick={(e) => { e.stopPropagation(); onIngest(row.subject, yr); }}
                          title={`Download and ingest DBE paper + memo for ${row.subject} ${yr}`}
                          data-testid={`btn-ingest-${row.subject}-${yr}`}>
                          <Download className="w-2.5 h-2.5" /> Download & Ingest
                        </button>
                      ) : (
                        <button
                          className="h-6 text-[10px] gap-0.5 px-1.5 flex-1 inline-flex items-center justify-center rounded-md font-bold disabled:opacity-40"
                          style={{ color: "#FFE600", border: "1px solid rgba(255,230,0,0.4)" }}
                          disabled={isPipelineRunning || isForceReingesting}
                          onClick={(e) => { e.stopPropagation(); onForceReingest(row.subject, yr); }}
                          title={`Force re-download and re-parse paper + memo for ${row.subject} ${yr}`}
                          data-testid={`btn-force-reingest-${row.subject}-${yr}`}>
                          <RefreshCw className="w-2.5 h-2.5" /> Force Reingest
                        </button>
                      )}
                      <YearUploadButton subject={row.subject} year={yr} isMemo={false} label="Upload Paper" disabled={isPipelineRunning} />
                      <YearUploadButton subject={row.subject} year={yr} isMemo={true} label="Upload Memo" disabled={isPipelineRunning} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quality info */}
          {row.verifiedChecks && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-black p-2.5 text-[11px]" style={{ border: qualityPassed ? "1px solid rgba(0,229,255,0.4)" : "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: qualityPassed ? "#00E5FF" : "rgba(255,255,255,0.4)" }} />
                  <span className="font-black uppercase tracking-[0.1em] text-[10px]" style={{ color: qualityPassed ? "#00E5FF" : "rgba(255,255,255,0.5)" }}>Verbatim</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white font-bold">{row.questionsExtracted} Qs</span>
                  <span className="font-black" style={{ color: qualityPassed ? "#00E5FF" : "#FFE600" }}>{row.avgQualityScore ?? 0}%</span>
                </div>
              </div>
              <div className="rounded-xl bg-black p-2.5 text-[11px]" style={{ border: row.simulationQuality >= 80 ? "1px solid rgba(138,43,255,0.4)" : "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5" style={{ color: row.simulatedCount > 0 ? "#8A2BFF" : "rgba(255,255,255,0.4)" }} />
                  <span className="font-black uppercase tracking-[0.1em] text-[10px]" style={{ color: row.simulatedCount > 0 ? "#8A2BFF" : "rgba(255,255,255,0.5)" }}>AI Simulated</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white font-bold">{row.simulatedCount} Qs</span>
                  <span className="font-black" style={{ color: "#8A2BFF" }}>{row.simulationQuality > 0 ? `${row.simulationQuality}%` : "–"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Overview tab: subject cards (from admin-dbe simple view) ─────────────────

type SubjectSortKey = "name-asc" | "memo-asc" | "memo-desc";

const SUBJECT_SORT_LS_KEY = "dbe_overview_subject_sort";

function OverviewSubjectGrid({ subjects, status, statusLoading, seedSubject, generateAi, restart, openaiReady }: {
  subjects: SubjectRow[];
  status: OverallStatus | undefined;
  statusLoading: boolean;
  seedSubject: any;
  generateAi: any;
  restart: any;
  openaiReady?: boolean;
}) {
  const { language } = useLanguage();

  const [sortKey, setSortKey] = useState<SubjectSortKey>(() => {
    try {
      const saved = localStorage.getItem(SUBJECT_SORT_LS_KEY);
      if (saved === "name-asc" || saved === "memo-asc" || saved === "memo-desc") return saved;
    } catch {}
    return "name-asc";
  });

  const handleSortChange = (v: SubjectSortKey) => {
    setSortKey(v);
    try { localStorage.setItem(SUBJECT_SORT_LS_KEY, v); } catch {}
  };

  const { data: memosData } = useQuery<MissingMemosResponse>({
    queryKey: ["/api/admin/dbe-ingestion/missing-memos"],
    queryFn: () => fetch("/api/admin/dbe-ingestion/missing-memos", { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const memoCovBySubject = useMemo<Record<string, number>>(() => {
    if (!memosData?.rows) return {};
    const totals: Record<string, { missing: number; total: number }> = {};
    for (const r of memosData.rows) {
      if (!totals[r.subject]) totals[r.subject] = { missing: 0, total: 0 };
      totals[r.subject].missing += r.missing;
      totals[r.subject].total += r.total;
    }
    const result: Record<string, number> = {};
    for (const [subj, { missing, total }] of Object.entries(totals)) {
      result[subj] = total > 0 ? Math.round(((total - missing) / total) * 100) : 100;
    }
    return result;
  }, [memosData]);

  const sortedSubjects = useMemo(() => {
    const copy = [...subjects];
    if (sortKey === "name-asc") {
      copy.sort((a, b) => a.subject.localeCompare(b.subject));
    } else {
      copy.sort((a, b) => {
        const aPct = memoCovBySubject[a.subject] ?? a.memoCoverage ?? 100;
        const bPct = memoCovBySubject[b.subject] ?? b.memoCoverage ?? 100;
        const cmp = sortKey === "memo-asc" ? aPct - bPct : bPct - aPct;
        return cmp !== 0 ? cmp : a.subject.localeCompare(b.subject);
      });
    }
    return copy;
  }, [subjects, sortKey, memoCovBySubject]);

  const sortOptions: { value: SubjectSortKey; label: string }[] = [
    { value: "name-asc", label: "Name A–Z" },
    { value: "memo-asc", label: "Memo Coverage ↑ (worst first)" },
    { value: "memo-desc", label: "Memo Coverage ↓ (best first)" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white">Sort by:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className="h-7 px-2.5 rounded-md text-xs font-bold uppercase tracking-[0.06em] transition-none"
              style={
                sortKey === opt.value
                  ? { color: "#00E5FF", border: "1.5px solid #00E5FF", background: "rgba(0,229,255,0.1)", boxShadow: "0 0 8px rgba(0,229,255,0.3)" }
                  : { color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.18)", background: "black" }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
      {sortedSubjects.map((s) => {
        const total = s.questionsExtracted + s.simulatedCount;
        const isRunning = s.isRunning || s.pipelinePhase === "ingesting" || s.pipelinePhase === "rebuilding_mastery" || s.pipelinePhase === "filling_missing";
        const ready = total > 0 && !isRunning;
        const hasNothing = total === 0 && !isRunning;
        const accent = ready ? "#00E5FF" : isRunning ? "#FFE600" : "rgba(255,255,255,0.25)";
        const cardStyle: React.CSSProperties = ready
          ? { border: "1.5px solid #00E5FF", boxShadow: "0 0 14px rgba(0,229,255,0.28), inset 0 0 18px rgba(0,0,0,0.6)" }
          : isRunning
          ? { border: "1.5px solid #FFE600", boxShadow: "0 0 14px rgba(255,230,0,0.32), inset 0 0 18px rgba(0,0,0,0.6)" }
          : { border: "1px solid rgba(255,255,255,0.15)", boxShadow: "inset 0 0 18px rgba(0,0,0,0.6)" };
        const ghostBtn = "h-7 text-xs gap-1 inline-flex items-center justify-center rounded-md bg-black px-2.5 font-bold uppercase tracking-[0.06em] text-white hover:text-white transition-none disabled:opacity-40";
        const ghostStyle: React.CSSProperties = { border: "1px solid rgba(255,255,255,0.18)" };
        const neonBtn = "h-7 text-xs gap-1 inline-flex items-center justify-center rounded-md bg-black px-2.5 font-black uppercase tracking-[0.08em] transition-none disabled:opacity-40";
        const cyanBtnStyle: React.CSSProperties = { color: "#00E5FF", border: "1.5px solid #00E5FF", boxShadow: "0 0 10px rgba(0,229,255,0.4), inset 0 0 6px rgba(0,229,255,0.15)" };
        const purpleBtnStyle: React.CSSProperties = { color: "#8A2BFF", border: "1.5px solid rgba(138,43,255,0.7)", boxShadow: "0 0 8px rgba(138,43,255,0.35)" };

        const memoCovPct = memoCovBySubject[s.subject];
        const hasMemoCov = memoCovPct !== undefined;
        const memoCovColor = memoCovColorFor(memoCovPct);

        return (
          <div key={s.subject} className="rounded-xl p-3 space-y-2 bg-black" style={cardStyle} data-testid={`subject-${s.subject}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-black text-sm truncate text-white" style={{ textShadow: ready ? `0 0 6px ${accent}88` : undefined }}>
                  {s.subject}
                </div>
                <div className="text-[11px] text-white mt-0.5">
                  {total > 0 ? (
                    <>
                      <span style={{ color: "#00E5FF" }}>{formatNumber(s.questionsExtracted, language)}</span> <span className="text-white">verbatim</span>
                      <span className="text-white"> · </span>
                      <span style={{ color: "#8A2BFF" }}>{formatNumber(s.simulatedCount, language)}</span> <span className="text-white">AI</span>
                    </>
                  ) : (
                    <span className="text-white">No questions yet</span>
                  )}
                </div>
                {(s.flashcardsCount || s.quizzesCount || s.dailyChallengesCount) ? (
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-white mt-1">
                    {s.flashcardsCount ? <span>🃏 {s.flashcardsCount} cards</span> : null}
                    {s.quizzesCount ? <span>🧠 {s.quizzesCount} quizzes</span> : null}
                    {s.dailyChallengesCount ? <span>⚡ {s.dailyChallengesCount} daily</span> : null}
                  </div>
                ) : null}
              </div>
              {isRunning ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] rounded-md bg-black px-2 py-0.5 whitespace-nowrap" style={{ color: "#FFE600", border: "1px solid #FFE600" }}>
                  <Loader2 className="w-3 h-3 animate-spin" /> {s.pipelinePhase ?? "Running"}
                </span>
              ) : ready ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] rounded-md bg-black px-2 py-0.5 whitespace-nowrap" style={{ color: "#00E5FF", border: "1px solid #00E5FF" }}>
                  <CheckCircle2 className="w-3 h-3" /> Live
                </span>
              ) : hasNothing ? (
                <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.1em] rounded-md bg-black px-2 py-0.5 text-white whitespace-nowrap" style={{ border: "1px solid rgba(255,255,255,0.18)" }}>
                  Empty
                </span>
              ) : null}
            </div>
            {hasMemoCov && (
              <div className="space-y-0.5" data-testid={`memo-cov-${s.subject}`}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white uppercase tracking-[0.08em] font-bold">Memo Coverage</span>
                  <span className="font-black" style={{ color: memoCovColor }}>{memoCovPct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${memoCovPct}%`, background: memoCovColor, boxShadow: `0 0 6px ${memoCovColor}88` }}
                  />
                </div>
              </div>
            )}
            {ready && s.memoCoverage !== undefined && !hasMemoCov && (
              <div className="flex items-center gap-1.5 text-[11px]">
                {s.memoCoverage === 100 ? <CheckCircle2 className="w-3 h-3" style={{ color: "#00E5FF" }} /> : <AlertTriangle className="w-3 h-3" style={{ color: "#FFE600" }} />}
                <span className="text-white">Memo: <span className="font-black" style={{ color: s.memoCoverage === 100 ? "#00E5FF" : "#FFE600" }}>{s.memoCoverage}%</span></span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button className={neonBtn} style={hasNothing ? cyanBtnStyle : ghostStyle} disabled={isRunning || seedSubject.isPending} onClick={() => seedSubject.mutate(s.subject)} data-testid={`btn-seed-${s.subject}`}>
                {seedSubject.isPending && seedSubject.variables === s.subject ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                {hasNothing ? "Seed" : "Re-seed"}
              </button>
              <button
                className={neonBtn}
                style={openaiReady === false ? { color: "rgba(138,43,255,0.35)", border: "1px solid rgba(138,43,255,0.2)", cursor: "not-allowed" } : purpleBtnStyle}
                disabled={isRunning || generateAi.isPending || openaiReady === false}
                onClick={() => { if (openaiReady !== false) generateAi.mutate(s.subject); }}
                title={openaiReady === false ? "Requires OpenAI API key — configure AI_INTEGRATIONS_OPENAI_API_KEY" : "Generate AI practice questions for this subject"}
                data-testid={`btn-ai-${s.subject}`}>
                <Sparkles className="w-3 h-3" /> AI
              </button>
              <a className={ghostBtn} style={ghostStyle} href={`/api/admin/dbe-ingestion/export?subject=${encodeURIComponent(s.subject)}&format=json&minQuality=98`} download data-testid={`btn-download-json-${s.subject}`}>
                <Download className="w-3 h-3" /> JSON
              </a>
              <a className={ghostBtn} style={ghostStyle} href={`/api/admin/dbe-ingestion/export?subject=${encodeURIComponent(s.subject)}&format=csv&minQuality=98`} download data-testid={`btn-download-csv-${s.subject}`}>
                <Download className="w-3 h-3" /> CSV
              </a>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}

// ─── Missing Memos Panel ──────────────────────────────────────────────────────

function MissingMemosPanel() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [show, setShow] = useState(() => {
    try { return JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}").missingMemosOpen ?? false; } catch { return false; }
  });
  const [filter, setFilter] = useState(() => {
    try { return JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}").missingMemosFilter ?? ""; } catch { return ""; }
  });
  const [reingesting, setReingesting] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ field: "subject" | "year" | "missing" | "memoCoveragePct"; dir: "asc" | "desc" }>({ field: "missing", dir: "desc" });

  const { data, isLoading } = useQuery<MissingMemosResponse>({
    queryKey: ["/api/admin/dbe-ingestion/missing-memos"],
    queryFn: () => fetch("/api/admin/dbe-ingestion/missing-memos", { credentials: "include" }).then((r) => r.json()),
    enabled: show,
    staleTime: 30_000,
  });

  const reingest = useMutation({
    mutationFn: ({ subject, year }: { subject: string; year: number }) =>
      apiRequest("POST", "/api/admin/dbe-ingestion/run", { subject, year, force: true }).then((r) => r.json()),
    onMutate: ({ subject, year }) => setReingesting((p) => new Set(p).add(`${subject}|${year}`)),
    onSuccess: (_d, { subject, year }) => {
      toast({ title: "Re-ingest queued", description: "Pipeline running in background." });
      setReingesting((p) => { const n = new Set(p); n.delete(`${subject}|${year}`); return n; });
      qc.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/missing-memos"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] });
    },
    onError: (e: any, { subject, year }) => {
      toast({ title: "Failed", description: e?.message, variant: "destructive" });
      setReingesting((p) => { const n = new Set(p); n.delete(`${subject}|${year}`); return n; });
    },
  });

  const filtered = (data?.rows ?? [])
    .filter((r) => !filter.trim() || r.subject.toLowerCase().includes(filter.trim().toLowerCase()))
    .sort((a, b) => {
      let cmp = 0;
      if (sort.field === "subject") cmp = a.subject.localeCompare(b.subject);
      else if (sort.field === "year") cmp = a.year - b.year;
      else if (sort.field === "missing") cmp = a.missing - b.missing;
      else if (sort.field === "memoCoveragePct") cmp = a.memoCoveragePct - b.memoCoveragePct;
      return sort.dir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (field: typeof sort.field) => setSort((p) => p.field === field ? { field, dir: p.dir === "asc" ? "desc" : "asc" } : { field, dir: "desc" });

  return (
    <Card className="border-amber-400/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-md bg-amber-400/10 mt-0.5"><FileSearch className="w-4 h-4 text-amber-400" /></div>
            <div>
              <CardTitle className="text-base font-heading flex items-center gap-2">
                Missing Memos
                {data && <Badge variant="outline" className="text-[11px] font-bold" style={{ color: "#FFE600", borderColor: "rgba(255,230,0,0.5)" }}>{data.groupCount} groups</Badge>}
              </CardTitle>
              <p className="text-xs text-white mt-0.5">Ingested questions without memo text — use Re-ingest to retry specific papers.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 border-amber-400/40 text-amber-400 hover:bg-amber-400/10" onClick={() => {
            setShow((v: boolean) => {
              const next = !v;
              try {
                const saved = JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}");
                saved.missingMemosOpen = next;
                localStorage.setItem("braintrack:dbe-portal:ui", JSON.stringify(saved));
              } catch {}
              return next;
            });
          }} data-testid="btn-toggle-missing-memos">
            {show ? <><ChevronUp className="w-3.5 h-3.5" /> Collapse</> : <><ChevronDown className="w-3.5 h-3.5" /> Expand</>}
          </Button>
        </div>
      </CardHeader>
      {show && (
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {data && <p className="text-xs text-white"><span className="font-bold" style={{ color: "#FFE600" }}>{data.totalMemoLessQuestions}</span> questions missing memo text</p>}
            <div className="relative w-64 ml-auto">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-white" />
              <Input placeholder="Filter by subject…" value={filter} onChange={(e) => {
                const val = e.target.value;
                setFilter(val);
                try {
                  const saved = JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}");
                  saved.missingMemosFilter = val;
                  localStorage.setItem("braintrack:dbe-portal:ui", JSON.stringify(saved));
                } catch {}
              }} className="pl-8 h-9" data-testid="input-missing-memos-filter" />
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-white gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-white gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No missing memos found.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-amber-400/20">
              <table className="w-full text-xs" data-testid="table-missing-memos">
                <thead>
                  <tr className="border-b border-amber-400/20" style={{ background: "rgba(255,230,0,0.06)" }}>
                    <th className="text-left px-3 py-2"><button onClick={() => toggleSort("subject")} className="font-semibold text-white hover:text-amber-300">Subject</button></th>
                    <th className="text-center px-3 py-2"><button onClick={() => toggleSort("year")} className="font-semibold text-white hover:text-amber-300">Year</button></th>
                    <th className="text-center px-3 py-2 font-semibold text-white">Paper</th>
                    <th className="text-center px-3 py-2 font-semibold text-white">Lang</th>
                    <th className="text-center px-3 py-2"><button onClick={() => toggleSort("missing")} className="font-semibold text-white hover:text-amber-300">Missing</button></th>
                    <th className="text-center px-3 py-2"><button onClick={() => toggleSort("memoCoveragePct")} className="font-semibold text-white hover:text-amber-300">Coverage</button></th>
                    <th className="text-center px-3 py-2 font-semibold text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const rowKey = `${r.subject}|${r.year}|${r.paperNumber}|${r.language}`;
                    const reingestKey = `${r.subject}|${r.year}`;
                    const isRe = reingesting.has(reingestKey);
                    return (
                      <tr key={rowKey} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-3 py-2 font-medium text-white max-w-[180px] truncate">{r.subject}</td>
                        <td className="px-3 py-2 text-center text-white">{r.year}</td>
                        <td className="px-3 py-2 text-center text-white">P{r.paperNumber}</td>
                        <td className="px-3 py-2 text-center text-white uppercase">{r.language || "—"}</td>
                        <td className="px-3 py-2 text-center font-black" style={{ color: "#FFE600" }}>{r.missing}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="font-bold" style={{ color: r.memoCoveragePct >= 98 ? "#00E5FF" : r.memoCoveragePct >= 50 ? "#FFE600" : "#f87171" }}>{r.memoCoveragePct}%</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 border-cyan-400/40 text-cyan-300" disabled={isRe} onClick={() => reingest.mutate({ subject: r.subject, year: r.year })}>
                            {isRe ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />} Re-ingest
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main portal component ────────────────────────────────────────────────────

export default function DBEPortal() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language, toggleLanguage } = useLanguage();
  const [search, setSearch] = useState(() => {
    try { return JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}").search ?? ""; } catch { return ""; }
  });
  const [openAiBannerDismissed, setOpenAiBannerDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    try { return JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}").activeTab ?? "overview"; } catch { return "overview"; }
  });
  const [previewSubject, setPreviewSubject] = useState<string | null>(null);
  const [previewYear, setPreviewYear] = useState<number | null>(null);
  const [anyRunning, setAnyRunning] = useState(false);
  const [papersPerSubject, setPapersPerSubject] = useState<number>(8);
  const [syncStatus, setSyncStatus] = useState<{
    status: string; completedAt?: string | null; stats?: any | null;
    lastSyncAt?: string | null; subjectsSynced?: number; questionsSynced?: number; message?: string | null;
  } | null>(null);

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ADMIN_TIMEOUT_MS = 60 * 60 * 1000;
  const prevCrunchRunningRef = useRef(false);
  const prevValidateRunningRef = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}");
      saved.activeTab = activeTab;
      localStorage.setItem("braintrack:dbe-portal:ui", JSON.stringify(saved));
    } catch {}
  }, [activeTab]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("braintrack:dbe-portal:ui") ?? "{}");
      saved.search = search;
      localStorage.setItem("braintrack:dbe-portal:ui", JSON.stringify(saved));
    } catch {}
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "legacy") {
      const storedLang = localStorage.getItem("braintrack-language");
      const isAf = storedLang === "af";
      toast({
        title: isAf ? "DBE-adminbladsy het verskuif" : "DBE admin page has moved",
        description: isAf
          ? "Jy is outomaties aangestuur. Boekmerk hierdie bladsy vir die toekoms."
          : "You were redirected automatically. Bookmark this page for next time.",
        duration: 5000,
      });
      params.delete("from");
      const newSearch = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (newSearch ? "?" + newSearch : ""),
      );
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      toast({ title: "Session expired", description: "Logged out after 1 hour of inactivity.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/auth/logout"; }, 1500);
    }, ADMIN_TIMEOUT_MS);
  }, [toast]);

  useEffect(() => {
    resetInactivityTimer();
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
    };
  }, [resetInactivityTimer]);

  // ── Data queries ──────────────────────────────────────────────────────────

  const { data: statusData, isLoading: statusLoading } = useQuery<OverallStatus>({
    queryKey: ["/api/admin/dbe-ingestion/status"],
    refetchInterval: anyRunning ? 3000 : 8000,
  });

  const { data: subjectsData, refetch: refetchSubjects } = useQuery<{ subjects: SubjectRow[] }>({
    queryKey: ["/api/admin/dbe-ingestion/subjects"],
    refetchInterval: (query) => {
      const subjects = (query.state.data as { subjects: SubjectRow[] } | undefined)?.subjects ?? [];
      const dataRunning = subjects.some(
        (s) => s.isRunning || s.pipelinePhase === "ingesting" || s.pipelinePhase === "rebuilding_mastery" || s.pipelinePhase === "filling_missing"
      );
      return dataRunning || anyRunning ? 3000 : 8000;
    },
  });

  const { data: localFilesData } = useQuery<Record<string, Record<string, { papers: string[]; memos: string[] }>>>({
    queryKey: ["/api/admin/dbe-uploads/list"],
    refetchInterval: 30000,
  });

  const { data: crunchStatus, refetch: refetchCrunchStatus } = useQuery<{ running: boolean; done: number; total: number; failed: number; aborted?: boolean }>({
    queryKey: ["/api/admin/dbe-ingestion/simulate-all/status"],
    refetchInterval: (data: any) => (data?.state?.data?.running ? 3000 : false),
  });

  const { data: validateStatus, refetch: refetchValidateStatus } = useQuery<{
    running: boolean; done: number; total: number; failed: number;
    summary: { scoredTotal: number; clean: number; partial: number; garbled: number; avgQuality: number };
  }>({
    queryKey: ["/api/admin/dbe-ingestion/validate-all/status"],
    refetchInterval: (data: any) => (data?.state?.data?.running ? 3000 : false),
  });

  const { data: dbSyncStatus } = useQuery<{
    status: "idle" | "running" | "success" | "failed";
    lastSyncAt: string | null; message: string | null; subjectsSynced: number; questionsSynced: number;
  }>({
    queryKey: ["/api/admin/dbe-ingestion/sync-production/status"],
    refetchInterval: (data: any) => (data?.state?.data?.status === "running" ? 3000 : false),
  });

  const { data: syncHistory, refetch: refetchSyncHistory } = useQuery<any[]>({
    queryKey: ["/api/admin/dbe-ingestion/sync-production/history"],
  });

  const { data: seedNotesStatus, refetch: refetchSeedNotes } = useQuery<{
    total: number; done: number; skipped: number; failed: number; running: boolean; aborted: boolean; currentSubject: string;
    totalTopicsInDb: number; topicsWithNotesInDb: number;
  }>({
    queryKey: ["/api/admin/notes/seed-all/status"],
    refetchInterval: 3000,
  });

  const { data: openaiStatusData } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/admin/openai-status"],
    staleTime: 60_000,
  });
  const openaiReady = openaiStatusData?.configured ?? false;

  const { data: missingMemosData } = useQuery<MissingMemosResponse>({
    queryKey: ["/api/admin/dbe-ingestion/missing-memos"],
    queryFn: () => fetch("/api/admin/dbe-ingestion/missing-memos", { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const previewUrl = previewSubject
    ? `/api/admin/dbe-ingestion/questions?subject=${encodeURIComponent(previewSubject)}&year=${previewYear ?? ""}&limit=20`
    : null;
  const { data: previewData } = useQuery<{ questions: VerbatimQuestion[] }>({
    queryKey: [previewUrl],
    enabled: !!previewUrl,
  });

  // ── Derived values ────────────────────────────────────────────────────────

  const allSubjects = subjectsData?.subjects ?? [];
  const filtered = allSubjects.filter((s) => s.subject.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
    if (b.questionsExtracted !== a.questionsExtracted) return b.questionsExtracted - a.questionsExtracted;
    return b.papersDone - a.papersDone;
  });

  const totalPapers = allSubjects.reduce((a, s) => a + s.catalogPapers, 0);
  const totalDone = allSubjects.reduce((a, s) => a + Math.min(s.papersDone, s.catalogPapers), 0);
  const totalDBE = Number(statusData?.verbatimQuestionsTotal ?? 0);
  const totalSim = allSubjects.reduce((a, s) => a + (s.simulatedCount ?? 0), 0);
  const totalQuestions = totalDBE + totalSim;
  const subjectsReady = allSubjects.filter((s) => s.questionsExtracted > 0).length;
  const subjectsWithSim = allSubjects.filter((s) => s.simulatedCount > 0).length;
  const subjectsWithMastery = allSubjects.filter((s) => (s.masteryYears?.length ?? 0) > 0).length;
  const avgQuality = allSubjects.filter((s) => s.avgQualityScore > 0).length > 0
    ? Math.round(allSubjects.filter((s) => s.avgQualityScore > 0).reduce((a, s) => a + s.avgQualityScore, 0) / allSubjects.filter((s) => s.avgQualityScore > 0).length)
    : 0;
  const paperPct = totalPapers > 0 ? Math.round((totalDone / totalPapers) * 100) : 0;

  const overallMemoCovPct = totalDBE > 0 && missingMemosData
    ? Math.round(((totalDBE - missingMemosData.totalMemoLessQuestions) / totalDBE) * 100)
    : null;

  const coreSubjects = filtered.filter((s) =>
    ["Mathematics", "Physical Sciences", "Life Sciences", "Accounting", "Business Studies",
      "Geography", "History", "Economics", "Tourism", "Information Technology",
      "Computer Applications Technology", "Consumer Studies", "Agricultural Sciences",
      "Engineering Graphic and Design", "Visual Arts", "Dramatic Arts", "Music",
      "Mathematical Literacy", "English FAL", "English HL", "Afrikaans FAL", "Afrikaans HL",
      "Afrikaans SAL", "Technical Mathematics", "Technical Sciences"].includes(s.subject)
  );
  const languageSubjects = filtered.filter((s) => /^(Isi|Sepedi|Sesotho|Setswana|Siswati|Tshivenda|Xitsonga|SASL)/i.test(s.subject));
  const technicalSubjects = filtered.filter((s) => !coreSubjects.includes(s) && !languageSubjects.includes(s));

  useEffect(() => {
    const subjectRunning = subjectsData?.subjects.some(
      (s) => s.isRunning || s.pipelinePhase === "ingesting" || s.pipelinePhase === "rebuilding_mastery" || s.pipelinePhase === "filling_missing"
    ) ?? false;
    setAnyRunning(subjectRunning);
  }, [subjectsData]);

  useEffect(() => {
    if (dbSyncStatus && !syncStatus) {
      setSyncStatus({ status: dbSyncStatus.status, lastSyncAt: dbSyncStatus.lastSyncAt, subjectsSynced: dbSyncStatus.subjectsSynced, questionsSynced: dbSyncStatus.questionsSynced, message: dbSyncStatus.message });
    }
    if (dbSyncStatus?.status === "success" || dbSyncStatus?.status === "failed") refetchSyncHistory?.();
  }, [dbSyncStatus?.status]);

  useEffect(() => {
    const crunchRunning = !!crunchStatus?.running;
    if (crunchRunning) setAnyRunning(true);
    if (prevCrunchRunningRef.current && !crunchRunning) {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/status"] });
    }
    prevCrunchRunningRef.current = crunchRunning;
  }, [crunchStatus?.running, queryClient]);

  useEffect(() => {
    const validateRunning = !!validateStatus?.running;
    if (validateRunning) setAnyRunning(true);
    if (prevValidateRunningRef.current && !validateRunning) queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] });
    prevValidateRunningRef.current = validateRunning;
  }, [validateStatus?.running, queryClient]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const runMutation = useMutation({
    mutationFn: ({ subject, year }: { subject: string; year?: number }) => apiRequest("POST", "/api/admin/dbe-ingestion/run", { subject, year }),
    onSuccess: (_data, vars) => { toast({ title: `Ingestion started for "${vars.subject}"` }); setAnyRunning(true); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (err: any) => toast({ title: "Ingestion failed", description: err.message, variant: "destructive" }),
  });

  const seedAll = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/dbe-ingestion/run-all", {}).then((r) => r.json()),
    onSuccess: (d: any) => { toast({ title: "Seeding started", description: `Queued ${d.queued ?? "all"} subjects — papers will appear as they finish.` }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/status"] }); },
    onError: (e: any) => toast({ title: "Failed", description: e?.message, variant: "destructive" }),
  });

  const seedSubject = useMutation({
    mutationFn: (subject: string) => apiRequest("POST", "/api/admin/dbe-ingestion/run", { subject }).then((r) => r.json()),
    onSuccess: (_d, subject) => { toast({ title: `Seeding ${subject}`, description: "Running in background." }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (e: any) => toast({ title: "Failed", description: e?.message, variant: "destructive" }),
  });

  const generateAi = useMutation({
    mutationFn: (subject?: string) => apiRequest("POST", subject ? "/api/admin/dbe-ingestion/simulate" : "/api/admin/dbe-ingestion/simulate-all", subject ? { subject, count: 30 } : {}).then((r) => r.json()),
    onSuccess: (_d, subject) => { toast({ title: "AI generation queued", description: subject ? `Generating for ${subject}` : "Generating across all subjects" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/status"] }); },
    onError: (e: any) => toast({ title: "Failed", description: e?.message, variant: "destructive" }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ subject }: { subject: string }) => apiRequest("POST", "/api/admin/dbe-ingestion/verify", { subject }),
    onSuccess: (_data, vars) => { toast({ title: `Verification done for "${vars.subject}"` }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (err: any) => toast({ title: "Verification failed", description: err.message, variant: "destructive" }),
  });

  const fixAllMutation = useMutation({
    mutationFn: ({ subject }: { subject: string }) => apiRequest("POST", "/api/admin/dbe-ingestion/fix-all", { subject }),
    onSuccess: (_data, vars) => { toast({ title: `Fix All started for "${vars.subject}"` }); setAnyRunning(true); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (err: any) => toast({ title: "Fix All failed", description: err.message, variant: "destructive" }),
  });

  const qualityCheckMutation = useMutation({
    mutationFn: ({ subject }: { subject: string }) => apiRequest("POST", "/api/admin/dbe-ingestion/quality-check", { subject }).then((r) => r.json()),
    onSuccess: (data: any, vars) => { const parts = [`${data.scored} scored`]; if (data.improved > 0) parts.push(`${data.improved} improved`); if (data.deleted > 0) parts.push(`${data.deleted} removed`); toast({ title: `Quality improved — "${vars.subject}"`, description: parts.join(" · ") }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (err: any) => toast({ title: "Quality check failed", description: err.message, variant: "destructive" }),
  });

  const rebuildMasteryMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/dbe-ingestion/rebuild-mastery", {}).then((r) => r.json()),
    onSuccess: (data: any) => { const parts = [`${data.subjectsProcessed ?? 0} subjects`]; if (data.coverageRowsCreated > 0) parts.push(`${data.coverageRowsCreated} coverage rows`); toast({ title: "Mastery Rebuilt", description: parts.join(" · ") }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/status"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (err: any) => toast({ title: "Rebuild failed", description: err.message, variant: "destructive" }),
  });

  const rebuildSubjectMasteryMutation = useMutation({
    mutationFn: ({ subject }: { subject: string }) => apiRequest("POST", "/api/admin/dbe-ingestion/rebuild-mastery", { subject }).then((r) => r.json()),
    onSuccess: (data: any, vars) => { toast({ title: `Mastery rebuilt — ${vars.subject}`, description: data.coverageRowsCreated > 0 ? `${data.coverageRowsCreated} topic coverage rows` : "Done" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (err: any) => toast({ title: "Mastery rebuild failed", description: err.message, variant: "destructive" }),
  });

  const restartMutation = useMutation({
    mutationFn: ({ subject }: { subject: string }) => apiRequest("POST", "/api/admin/dbe-ingestion/restart", { subject }),
    onSuccess: (_data, vars) => { toast({ title: `Restart initiated for "${vars.subject}"` }); setAnyRunning(true); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (err: any) => toast({ title: "Restart failed", description: err.message, variant: "destructive" }),
  });

  const forceReingestMutation = useMutation({
    mutationFn: ({ subject, year }: { subject: string; year?: number }) =>
      apiRequest("POST", "/api/admin/dbe-ingestion/run", { subject, year, force: true }).then((r) => r.json()),
    onSuccess: (_d, vars) => { toast({ title: `Force reingest started — ${vars.subject}${vars.year ? ` (${vars.year})` : ""}`, description: "Re-downloading all papers, memos and supporting docs." }); setAnyRunning(true); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/status"] }); },
    onError: (err: any) => toast({ title: "Force reingest failed", description: err.message, variant: "destructive" }),
  });

  const clearSubjectMutation = useMutation({
    mutationFn: ({ subject }: { subject: string }) => apiRequest("POST", "/api/admin/dbe-ingestion/clear-subject", { subject }).then((r) => r.json()),
    onSuccess: (data: any, vars) => { if (data?.error) { toast({ title: "Clear failed", description: data.error, variant: "destructive" }); return; } toast({ title: `Cleared "${vars.subject}"` }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/status"] }); },
    onError: (err: any) => toast({ title: "Clear failed", description: err.message, variant: "destructive" }),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/dbe-ingestion/clear-all", {}),
    onSuccess: () => { toast({ title: "All ingestion data cleared" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/status"] }); },
    onError: (err: any) => toast({ title: "Clear failed", description: err.message, variant: "destructive" }),
  });

  const fillMissingMutation = useMutation({
    mutationFn: ({ subject }: { subject: string }) => apiRequest("POST", "/api/admin/dbe-ingestion/fill-missing", { subject }).then((r) => r.json()),
    onSuccess: (data: any, vars) => { if (data.error) { toast({ title: "Fill Missing failed", description: data.error, variant: "destructive" }); return; } toast({ title: `Fill Missing — "${vars.subject}"`, description: data.filled > 0 ? `${data.filled} fields filled. Memo: ${data.memoCoverage}%` : "All fields complete" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (err: any) => toast({ title: "Fill Missing failed", description: err.message, variant: "destructive" }),
  });

  const simulateMutation = useMutation({
    mutationFn: ({ subject }: { subject: string }) => apiRequest("POST", "/api/admin/dbe-ingestion/simulate", { subject }).then((r) => r.json()),
    onSuccess: (data: any, vars) => { toast({ title: `Build Questions done — "${vars.subject}"`, description: `${data.generated ?? 0} questions generated (quality: ${data.simulationQuality ?? 0}%)` }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/status"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); },
    onError: (err: any) => toast({ title: "Simulation failed", description: err.message, variant: "destructive" }),
  });

  const crunchSubjectMutation = useMutation({
    mutationFn: ({ subject, count }: { subject: string; count: number }) => apiRequest("POST", "/api/admin/dbe-ingestion/simulate-subject", { subject, count }).then((r) => r.json()),
    onSuccess: (data: any, vars) => { if (data.error) { toast({ title: "Crunch failed", description: data.error, variant: "destructive" }); return; } toast({ title: `⚡ Crunch ×${vars.count} started — ${vars.subject}` }); refetchCrunchStatus(); },
    onError: (err: any) => toast({ title: "Crunch failed", description: err.message, variant: "destructive" }),
  });

  const simulateAllMutation = useMutation({
    mutationFn: (count: number) => apiRequest("POST", "/api/admin/dbe-ingestion/simulate-all", { papersPerSubject: count }).then((r) => r.json()),
    onSuccess: (data: any) => { if (data.error) { toast({ title: "Crunch Time failed", description: data.error, variant: "destructive" }); return; } toast({ title: "⚡ Crunch Time started", description: data.message || `${data.queued} papers queued` }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); refetchCrunchStatus(); },
    onError: (err: any) => toast({ title: "Crunch Time failed", description: err.message, variant: "destructive" }),
  });

  const stopSimulateAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/dbe-ingestion/simulate-all/stop", {}).then((r) => r.json()),
    onSuccess: (data: any) => { toast({ title: "⏹ Stop requested", description: data.message || "Will halt after current paper" }); refetchCrunchStatus(); },
    onError: (err: any) => toast({ title: "Stop failed", description: err.message, variant: "destructive" }),
  });

  const validateAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/dbe-ingestion/validate-all", {}).then((r) => r.json()),
    onSuccess: (data: any) => { if (data.error) { toast({ title: "Validate failed", description: data.error, variant: "destructive" }); return; } toast({ title: "✓ Validation started", description: `${data.queued} subjects queued` }); refetchValidateStatus(); },
    onError: (err: any) => toast({ title: "Validate failed", description: err.message, variant: "destructive" }),
  });

  const syncProductionMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/dbe-ingestion/sync-production", {}).then((r) => r.json()),
    onSuccess: (data: any) => { setSyncStatus((prev) => ({ ...prev, status: "running" })); toast({ title: "Sync to Production started" }); },
    onError: (err: any) => { setSyncStatus((prev) => ({ ...prev, status: "failed" })); toast({ title: "Sync failed", description: err.message, variant: "destructive" }); },
  });

  const seedNotesMutation = useMutation({
    mutationFn: (force?: boolean) => apiRequest("POST", "/api/admin/notes/seed-all", force ? { force: true } : {}).then((r) => r.json()),
    onSuccess: (data: any) => { if (data.error) { toast({ title: "Seed Notes failed", description: data.error, variant: "destructive" }); return; } toast({ title: "Seed Notes started", description: data.message || `${data.queued} topics queued` }); refetchSeedNotes(); },
    onError: (err: any) => toast({ title: "Seed Notes failed", description: err.message, variant: "destructive" }),
  });

  const stopSeedNotesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/notes/seed-all/stop", {}).then((r) => r.json()),
    onSuccess: (data: any) => { toast({ title: "⏹ Stop requested", description: data.message }); refetchSeedNotes(); },
    onError: (err: any) => toast({ title: "Stop failed", description: err.message, variant: "destructive" }),
  });

  function renderSubjectGroup(label: string, subjects: SubjectRow[]) {
    if (subjects.length === 0) return null;
    const groupDone = subjects.reduce((a, s) => a + s.papersDone, 0);
    const groupTotal = subjects.reduce((a, s) => a + s.catalogPapers, 0);
    const groupQuestions = subjects.reduce((a, s) => a + s.questionsExtracted, 0);
    return (
      <div className="space-y-2" data-testid={`group-${label.toLowerCase().replace(/\s/g, "-")}`}>
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{label} ({subjects.length})</h3>
          <span className="text-xs text-white">{groupDone}/{groupTotal} papers · {formatNumber(groupQuestions, language)} questions</span>
        </div>
        {subjects.map((row) => (
          <SubjectAccordion key={row.subject} row={row} localFiles={localFilesData}
            onIngest={(s, y) => runMutation.mutate({ subject: s, year: y })}
            onVerify={(s) => verifyMutation.mutate({ subject: s })}
            onPreview={(s) => { setPreviewSubject(s); setPreviewYear(null); }}
            onFixAll={(s) => fixAllMutation.mutate({ subject: s })}
            onQualityCheck={(s) => qualityCheckMutation.mutate({ subject: s })}
            onRestart={(s) => restartMutation.mutate({ subject: s })}
            onForceReingest={(s, y) => forceReingestMutation.mutate({ subject: s, year: y })}
            onClear={(s) => clearSubjectMutation.mutate({ subject: s })}
            onRebuildMastery={(s) => rebuildSubjectMasteryMutation.mutate({ subject: s })}
            onSimulate={(s) => simulateMutation.mutate({ subject: s })}
            onCrunchSubject={(s, count) => crunchSubjectMutation.mutate({ subject: s, count })}
            onFillMissing={(s) => fillMissingMutation.mutate({ subject: s })}
            isIngesting={runMutation.isPending} isVerifying={verifyMutation.isPending}
            isFixing={fixAllMutation.isPending} isChecking={qualityCheckMutation.isPending}
            isRestarting={restartMutation.isPending} isForceReingesting={forceReingestMutation.isPending}
            isClearing={clearSubjectMutation.isPending}
            isRebuildingMastery={rebuildSubjectMasteryMutation.isPending} isSimulating={simulateMutation.isPending}
            isFilling={fillMissingMutation.isPending}
            isAnyCrunchRunning={!!crunchStatus?.running || crunchSubjectMutation.isPending || simulateAllMutation.isPending}
            openaiReady={openaiReady}
          />
        ))}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="dark min-h-screen bg-black text-white">
      {/* Navigation bar */}
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-cyan-500/20">
        {/* brand rainbow hairline */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg,#006BFF,#00E5FF,#22FF66,#FFE600,#FF8A00,#FF2BD6,#8A2BFF)" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
            <a href="/learn/admin/dbe-portal" className="flex items-center gap-2">
              <BrainTrackLogo className="h-6 w-auto" />
              <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-[9px] px-1.5 py-0 font-mono uppercase tracking-wider">
                DBE Portal
              </Badge>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="text-[11px] font-bold text-white px-2 py-1 rounded border border-slate-700 hover:border-cyan-500/40 transition-all" data-testid="button-language-toggle">
              {language === "en" ? "EN" : "AF"}
            </button>
            <a href="/" className="text-white hover:text-cyan-300 transition-colors"><Home className="w-3.5 h-3.5" /></a>
            <a
              href="/api/auth/logout"
              onClick={() => {
                try { localStorage.removeItem("braintrack:dbe-portal:ui"); } catch {}
              }}
              className="text-white hover:text-red-400 transition-colors"
              data-testid="portal-nav-logout"
            ><LogOut className="w-3.5 h-3.5" /></a>
          </div>
        </div>
        {/* Status strip */}
        <div className="border-t border-cyan-500/15 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-7 flex items-center justify-between gap-4 text-[10px] font-mono text-white uppercase tracking-wider">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/60 animate-pulse" />
                pipeline online
              </span>
              <span className="text-white">|</span>
              <span>{allSubjects.length} subjects</span>
              <span className="text-white">|</span>
              <span>{formatNumber(totalDone, language)}/{formatNumber(totalPapers, language)} papers</span>
              <span className="text-white">|</span>
              <span>{formatNumber(totalQuestions, language)} questions</span>
            </div>
            <span className="hidden md:block text-cyan-300/70">btk-dbe-portal v1</span>
          </div>
        </div>
      </nav>

      {/* OpenAI key missing banner */}
      {!openaiReady && !openAiBannerDismissed && (
        <div className="border-b border-amber-500/40 bg-amber-500/10" role="alert" data-testid="openai-missing-banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-300">OpenAI API key not configured</p>
              <p className="text-xs text-amber-200/70 mt-0.5">
                AI-powered features are disabled — <span className="font-semibold">Build Questions</span>, <span className="font-semibold">Crunch Time</span>, <span className="font-semibold">Generate AI</span>, and <span className="font-semibold">Seed Notes</span> will not work until the key is set.
              </p>
              <p className="text-xs text-amber-200/50 mt-1">
                To fix: set the <span className="font-mono bg-amber-500/15 px-1 rounded">OPENAI_API_KEY</span> environment variable on the server (e.g. in the Render dashboard) with a valid OpenAI API key, then restart the app.
              </p>
            </div>
            <button
              onClick={() => setOpenAiBannerDismissed(true)}
              className="shrink-0 text-amber-400/60 hover:text-amber-300 transition-colors p-0.5 rounded"
              aria-label="Dismiss banner"
              data-testid="openai-banner-dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Graffiti header band — the brand hero for the content studio */}
      <div className="relative overflow-hidden border-b border-white/10">
        <GraffitiSplats variant="corner" opacity={0.18} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              <span
                style={{
                  background: "linear-gradient(90deg,#006BFF,#00E5FF,#22FF66,#FFE600,#FF8A00,#FF2BD6,#8A2BFF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                DBE Content Studio
              </span>
            </h1>
            <p className="text-sm text-white mt-1">
              Ingest · verify · publish — the question bank behind every learner.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
            <span className="px-2.5 py-1 rounded-lg border border-[#22FF66]/40 text-[#22FF66]">
              {formatNumber(totalQuestions, language)} questions
            </span>
            <span className="px-2.5 py-1 rounded-lg border border-[#00E5FF]/40 text-[#00E5FF]">
              {formatNumber(totalDone, language)}/{formatNumber(totalPapers, language)} papers
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3" data-testid="page-title">
              <Database className="w-6 h-6 text-cyan-400" />
              DBE Content Portal
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {allSubjects.length} subjects · {formatNumber(totalDone, language)}/{formatNumber(totalPapers, language)} papers · {formatNumber(totalQuestions, language)} practice questions
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="gap-1.5 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10" onClick={() => { queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/subjects"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/status"] }); refetchSubjects(); toast({ title: "Refreshed" }); }} data-testid="btn-refresh">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10"
              onClick={() => { if (confirm("Clear ALL ingestion data? This cannot be undone.")) clearAllMutation.mutate(); }}
              disabled={clearAllMutation.isPending || anyRunning} data-testid="btn-clear-all">
              {clearAllMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />} Clear All
            </Button>
          </div>
        </div>

        {/* Pipeline running banner */}
        {anyRunning && (
          <div className="flex items-center gap-2 text-sm rounded-xl bg-black p-3" style={{ border: "1.5px solid #00E5FF", boxShadow: "0 0 14px rgba(0,229,255,0.32)" }}>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: "#00E5FF" }} />
            <span className="font-black uppercase tracking-[0.1em] text-[12px]" style={{ color: "#00E5FF" }}>Pipeline running — auto-refreshing</span>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
          <StatCard label="Papers Ingested" value={`${paperPct}%`} sub={`${totalDone}/${totalPapers}`} icon={FileText} />
          <StatCard label="Subjects Ready" value={subjectsReady} sub={`of ${allSubjects.length} total`} icon={CheckCircle2} />
          <StatCard label="Verbatim Qs" value={totalDBE} sub="exact NSC questions" icon={BookOpen} />
          <StatCard label="Simulated Qs" value={totalSim} sub={`${subjectsWithSim} subjects`} icon={Zap} />
          <StatCard label="Memo Coverage" value={overallMemoCovPct !== null ? `${overallMemoCovPct}%` : "—"} sub={missingMemosData ? `${missingMemosData.totalMemoLessQuestions} missing` : "loading…"} icon={FileCheck} valueColor={memoCovColorFor(overallMemoCovPct)} />
          <StatCard label="Avg Quality" value={avgQuality > 0 ? `${avgQuality}%` : "—"} sub="across scored subjects" icon={ShieldCheck} />
          <StatCard label="Mastery Built" value={subjectsWithMastery} sub={`of ${allSubjects.length}`} icon={GraduationCap} />
          <StatCard label="Topics Covered" value={statusData?.topicsCovered ?? 0} sub={`of ${statusData?.totalTopics ?? 0} CAPS`} icon={BarChart3} />
          <StatCard label="High Yield" value={statusData?.highYieldTopics ?? 0} sub="3+ exam appearances" icon={Sparkles} />
        </div>

        {/* Primary actions row */}
        <div className="rounded-xl bg-black p-4 space-y-0" style={{ border: "1.5px solid rgba(0,229,255,0.35)", boxShadow: "0 0 14px rgba(0,229,255,0.15)" }}>
          {/* Row: Ingestion */}
          <div className="flex items-center gap-3 flex-wrap pb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] w-20 shrink-0" style={{ color: "rgba(0,229,255,0.6)" }}>Ingestion</span>
            <Button size="sm" className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-black" onClick={() => seedAll.mutate()} disabled={seedAll.isPending}
              title="Download and parse all DBE PDFs for all subjects across 2015–2025"
              data-testid="btn-seed-all">
              {seedAll.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Seed All Subjects (2015–2025)
            </Button>
          </div>

          {/* Row: AI & Questions */}
          <div className="flex items-center gap-3 flex-wrap py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] w-20 shrink-0" style={{ color: openaiReady ? "rgba(138,43,255,0.7)" : "rgba(255,255,255,0.25)" }}>
              AI & Qs
              {!openaiReady && <span className="block normal-case tracking-normal font-bold text-[9px] mt-0.5" style={{ color: "#f87171" }}>No key</span>}
            </span>
            <Button size="sm" variant="outline" className="gap-2 border-purple-500/40 text-purple-300 hover:bg-purple-500/10 disabled:opacity-40"
              onClick={() => generateAi.mutate(undefined)} disabled={generateAi.isPending || !openaiReady}
              title={openaiReady ? "Generate AI practice questions for all subjects with DBE content" : "Requires OpenAI API key — configure AI_INTEGRATIONS_OPENAI_API_KEY"}
              data-testid="btn-generate-ai">
              {generateAi.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate AI Questions
              {!openaiReady && <span className="ml-1 text-[9px] px-1 py-0.5 rounded font-black" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>Requires key</span>}
            </Button>
            {/* Crunch Time controls */}
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-black px-2.5 py-1.5" style={{ border: `1.5px solid ${openaiReady ? "#00E5FF" : "rgba(255,255,255,0.2)"}` }}>
              <span className="text-[10px] uppercase tracking-[0.12em] font-black" style={{ color: openaiReady ? "#00E5FF" : "rgba(255,255,255,0.3)" }}>Papers</span>
              <input type="number" min={1} max={20} value={papersPerSubject} onChange={(e) => setPapersPerSubject(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} disabled={simulateAllMutation.isPending || crunchStatus?.running || anyRunning || !openaiReady} className="h-6 w-12 rounded bg-black px-1 text-center text-xs font-black text-white focus:outline-none disabled:opacity-40" style={{ border: "1px solid rgba(0,229,255,0.5)" }} data-testid="input-papers-per-subject" />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white">/subj</span>
            </div>
            <Button size="sm" onClick={() => simulateAllMutation.mutate(papersPerSubject)} disabled={simulateAllMutation.isPending || crunchStatus?.running || anyRunning || !openaiReady} className="gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black disabled:opacity-40"
              title={openaiReady ? "Batch-generate AI practice papers across all subjects" : "Requires OpenAI API key"}
              data-testid="btn-crunch-time">
              {simulateAllMutation.isPending || crunchStatus?.running ? <><Loader2 className="w-4 h-4 animate-spin" />{crunchStatus?.running ? "Running…" : "Starting…"}</> : <><Zap className="w-4 h-4 fill-current" />Crunch Time</>}
            </Button>
            {crunchStatus?.running && (
              <Button size="sm" variant="destructive" onClick={() => stopSimulateAllMutation.mutate()} disabled={stopSimulateAllMutation.isPending || crunchStatus?.aborted} data-testid="btn-crunch-time-stop">
                {crunchStatus?.aborted ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Stopping…</> : <>⏹ Stop</>}
              </Button>
            )}
            {crunchStatus?.running && crunchStatus.total > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-28 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all" style={{ width: `${Math.min(100, Math.round((crunchStatus.done / crunchStatus.total) * 100))}%` }} />
                </div>
                <span className="text-[11px] font-bold text-white tabular-nums">{formatNumber(crunchStatus.done, language)}/{formatNumber(crunchStatus.total, language)}</span>
              </div>
            )}
          </div>

          {/* Row: Validation */}
          <div className="flex items-center gap-3 flex-wrap py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] w-20 shrink-0" style={{ color: "rgba(99,148,220,0.7)" }}>Validation</span>
            <Button size="sm" variant="outline" className="gap-2 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10" onClick={() => rebuildMasteryMutation.mutate()} disabled={rebuildMasteryMutation.isPending}
              title="Recalculate mastery levels and topic coverage scores across all subjects"
              data-testid="btn-rebuild-mastery">
              {rebuildMasteryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />} Rebuild Mastery
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-blue-500/40 text-blue-300 hover:bg-blue-500/10" onClick={() => validateAllMutation.mutate()} disabled={validateAllMutation.isPending || validateStatus?.running}
              title="Score every ingested question for memo accuracy, CAPS alignment, and structural quality"
              data-testid="btn-validate-ingestion">
              {validateAllMutation.isPending || validateStatus?.running ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Validate All
            </Button>
            {validateStatus && !validateStatus.running && validateStatus.summary?.scoredTotal > 0 && (
              <span className="text-[11px] font-bold text-blue-300" data-testid="validate-summary">
                {validateStatus.summary.avgQuality}% avg · {validateStatus.summary.clean} clean · {validateStatus.summary.garbled} garbled
              </span>
            )}
          </div>

          {/* Row: Nightly Jobs */}
          <div className="flex items-center gap-3 flex-wrap pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] w-20 shrink-0" style={{ color: "rgba(99,163,115,0.7)" }}>Nightly</span>
            <Button size="sm" variant="outline" className="gap-2 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-40"
              onClick={() => seedNotesMutation.mutate(undefined)} disabled={seedNotesMutation.isPending || seedNotesStatus?.running || !openaiReady}
              title={openaiReady ? "Generate one baseline AI study note per topic for all ingested subjects (skips topics that already have notes)" : "Requires OpenAI API key — configure AI_INTEGRATIONS_OPENAI_API_KEY"}>
              {seedNotesMutation.isPending || seedNotesStatus?.running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} Seed Notes
              {!openaiReady && <span className="ml-1 text-[9px] px-1 py-0.5 rounded font-black" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>Requires key</span>}
            </Button>
            {seedNotesStatus && !seedNotesStatus.running && (
              (seedNotesStatus.total > 0 && seedNotesStatus.skipped === seedNotesStatus.total && seedNotesStatus.done === 0) ||
              (seedNotesStatus.totalTopicsInDb > 0 && seedNotesStatus.topicsWithNotesInDb === seedNotesStatus.totalTopicsInDb)
            ) && (
              <Button size="sm" variant="outline" className="gap-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 disabled:opacity-40"
                onClick={() => { if (openaiReady) seedNotesMutation.mutate(true); }}
                disabled={!openaiReady}
                title={openaiReady ? "All topics already have notes — use Force Re-seed to regenerate all notes from scratch" : "Requires OpenAI API key — configure AI_INTEGRATIONS_OPENAI_API_KEY"}>
                <RefreshCw className="w-3.5 h-3.5" /> Force Re-seed
                {!openaiReady && <span className="ml-1 text-[9px] px-1 py-0.5 rounded font-black" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>Requires key</span>}
              </Button>
            )}
            {seedNotesStatus?.running && (
              <Button size="sm" variant="destructive" onClick={() => stopSeedNotesMutation.mutate()} disabled={stopSeedNotesMutation.isPending || seedNotesStatus.aborted}>⏹ Stop</Button>
            )}
            {seedNotesStatus?.running && seedNotesStatus.total > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="h-1.5 w-28 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.round(((seedNotesStatus.done + seedNotesStatus.skipped) / seedNotesStatus.total) * 100))}%`, background: "#4ade80" }} />
                </div>
                <span className="text-[11px] font-bold text-emerald-300 tabular-nums">
                  {Math.min(100, Math.round(((seedNotesStatus.done + seedNotesStatus.skipped) / seedNotesStatus.total) * 100))}% · {seedNotesStatus.done}✓ {seedNotesStatus.skipped}skip{seedNotesStatus.failed > 0 ? <span className="text-red-400"> {seedNotesStatus.failed}fail</span> : null}
                </span>
                {seedNotesStatus.currentSubject && (
                  <span className="text-[11px] text-white/50 truncate max-w-[160px]">{seedNotesStatus.currentSubject}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input placeholder="Search subjects…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-white/30" data-testid="input-search" />
        </div>

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 p-1.5 rounded-2xl h-auto flex-wrap bg-black border border-cyan-500/30 shadow-[0_0_14px_rgba(0,229,255,0.18)]">
            {[
              { value: "overview", label: "Overview" },
              { value: "advanced", label: `Advanced (${filtered.length})` },
              { value: "core", label: `Core NSC (${coreSubjects.length})` },
              { value: "languages", label: `Languages (${languageSubjects.length})` },
              { value: "technical", label: `Technical (${technicalSubjects.length})` },
              { value: "sync", label: "Sync & Ops" },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} data-testid={`tab-${tab.value}`}
                className="rounded-xl text-xs px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400 data-[state=active]:shadow-[0_0_14px_rgba(0,229,255,0.45)] data-[state=active]:font-black text-white/60 hover:text-white transition-colors">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview tab — simple subject cards */}
          <TabsContent value="overview" className="space-y-5">
            <OverviewSubjectGrid subjects={filtered} status={statusData} statusLoading={statusLoading} seedSubject={seedSubject} generateAi={generateAi} restart={restartMutation} openaiReady={openaiReady} />
            <MissingMemosPanel />
          </TabsContent>

          {/* Advanced tab — accordion with year-by-year detail */}
          <TabsContent value="advanced" className="space-y-2">
            {filtered.map((row) => (
              <SubjectAccordion key={row.subject} row={row} localFiles={localFilesData}
                onIngest={(s, y) => runMutation.mutate({ subject: s, year: y })}
                onVerify={(s) => verifyMutation.mutate({ subject: s })}
                onPreview={(s) => { setPreviewSubject(s); setPreviewYear(null); }}
                onFixAll={(s) => fixAllMutation.mutate({ subject: s })}
                onQualityCheck={(s) => qualityCheckMutation.mutate({ subject: s })}
                onRestart={(s) => restartMutation.mutate({ subject: s })}
                onForceReingest={(s, y) => forceReingestMutation.mutate({ subject: s, year: y })}
                onClear={(s) => clearSubjectMutation.mutate({ subject: s })}
                onRebuildMastery={(s) => rebuildSubjectMasteryMutation.mutate({ subject: s })}
                onSimulate={(s) => simulateMutation.mutate({ subject: s })}
                onCrunchSubject={(s, count) => crunchSubjectMutation.mutate({ subject: s, count })}
                onFillMissing={(s) => fillMissingMutation.mutate({ subject: s })}
                isIngesting={runMutation.isPending} isVerifying={verifyMutation.isPending}
                isFixing={fixAllMutation.isPending} isChecking={qualityCheckMutation.isPending}
                isRestarting={restartMutation.isPending} isForceReingesting={forceReingestMutation.isPending}
                isClearing={clearSubjectMutation.isPending}
                isRebuildingMastery={rebuildSubjectMasteryMutation.isPending} isSimulating={simulateMutation.isPending}
                isFilling={fillMissingMutation.isPending}
                isAnyCrunchRunning={!!crunchStatus?.running || crunchSubjectMutation.isPending || simulateAllMutation.isPending}
                openaiReady={openaiReady}
              />
            ))}
          </TabsContent>

          {/* Grouped tabs */}
          <TabsContent value="core" className="space-y-4">{renderSubjectGroup("Core NSC Subjects", coreSubjects)}</TabsContent>
          <TabsContent value="languages" className="space-y-4">{renderSubjectGroup("African & Sign Languages", languageSubjects)}</TabsContent>
          <TabsContent value="technical" className="space-y-4">{renderSubjectGroup("Technical & Trade Subjects", technicalSubjects)}</TabsContent>

          {/* Sync & Ops tab */}
          <TabsContent value="sync" className="space-y-4">
            {/* Sync to Production panel */}
            <div className="rounded-xl bg-black p-4" style={{ border: "1.5px solid rgba(0,229,255,0.45)", boxShadow: "0 0 14px rgba(0,229,255,0.2)" }} data-testid="sync-production-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CloudUpload className="w-5 h-5 shrink-0" style={{ color: "#00E5FF" }} />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.1em] text-white">Sync to Production</p>
                    <p className="text-xs text-white/50">Rebuild mastery scores + topic coverage — marks data as production-ready.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {syncStatus && (
                    <div className="flex items-center gap-2 text-xs">
                      {syncStatus.status === "running" && <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black font-black uppercase tracking-[0.1em] text-[10px]" style={{ color: "#5b9dff", border: "1px solid #5b9dff" }}><Loader2 className="w-3 h-3 animate-spin" /> Running…</span>}
                      {syncStatus.status === "success" && <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black font-black uppercase tracking-[0.1em] text-[10px]" style={{ color: "#22c55e", border: "1px solid #22c55e" }}><CheckCircle2 className="w-3 h-3" /> Success — {syncStatus.subjectsSynced} subjects</span>}
                      {syncStatus.status === "failed" && <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black font-black uppercase tracking-[0.1em] text-[10px]" style={{ color: "#ef4444", border: "1px solid #ef4444" }}><XCircle className="w-3 h-3" /> Failed</span>}
                    </div>
                  )}
                  <Button size="sm" onClick={() => { if (confirm("Trigger Sync to Production? This may take several minutes.")) syncProductionMutation.mutate(); }} disabled={syncProductionMutation.isPending || syncStatus?.status === "running" || anyRunning} className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white" data-testid="btn-sync-production-panel">
                    {syncProductionMutation.isPending || syncStatus?.status === "running" ? <><Loader2 className="w-4 h-4 animate-spin" />Syncing…</> : <><CloudUpload className="w-4 h-4" />Sync to Production</>}
                  </Button>
                </div>
              </div>
            </div>

            {/* Sync History */}
            <Card className="border-border/60 bg-black/40" data-testid="sync-history-panel">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-white/50" />
                    <CardTitle className="text-sm">Sync History</CardTitle>
                    {syncHistory && syncHistory.length > 0 && <span className="text-xs text-white/50">— last {syncHistory.length} syncs</span>}
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1.5" onClick={() => refetchSyncHistory()} data-testid="btn-refresh-sync-history">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {!syncHistory || syncHistory.length === 0 ? (
                  <p className="text-xs text-white/40 italic">No production syncs recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border/40">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                          <th className="text-left px-4 py-2 font-medium text-white/60">Timestamp</th>
                          <th className="text-left px-4 py-2 font-medium text-white/60">Status</th>
                          <th className="text-left px-4 py-2 font-medium text-white/60">Subjects</th>
                          <th className="text-left px-4 py-2 font-medium text-white/60">Questions</th>
                          <th className="text-left px-4 py-2 font-medium text-white/60">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {syncHistory.map((entry, i) => (
                          <tr key={entry.id} className={`border-t border-border/40 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                            <td className="px-4 py-2 tabular-nums text-white/70 whitespace-nowrap">
                              {entry.timestamp ? formatDateTime(entry.timestamp, language, { dateStyle: "short", timeStyle: "short" }) : "—"}
                            </td>
                            <td className="px-4 py-2">
                              {entry.status === "success" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold"><CheckCircle2 className="w-3 h-3" /> Success</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-semibold"><XCircle className="w-3 h-3" /> Failed</span>
                              )}
                            </td>
                            <td className="px-4 py-2 tabular-nums text-white/70">{entry.subjectsSynced ?? "—"}</td>
                            <td className="px-4 py-2 tabular-nums text-white/70">{entry.questionsSynced != null ? formatNumber(Number(entry.questionsSynced), language) : "—"}</td>
                            <td className="px-4 py-2 text-white/50 max-w-xs truncate">
                              {entry.error ? <span className="text-red-400" title={entry.error}>{entry.error}</span> : entry.status === "success" ? <span className="text-emerald-400">Completed</span> : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Question preview dialog */}
      <Dialog open={!!previewSubject} onOpenChange={(o) => { if (!o) { setPreviewSubject(null); setPreviewYear(null); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark bg-black border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Question Preview — {previewSubject}</DialogTitle>
            <DialogDescription className="text-white/50">Sample verbatim questions from the ingested papers.</DialogDescription>
          </DialogHeader>
          {previewData?.questions?.length ? (
            <div className="space-y-3 mt-2">
              {previewData.questions.slice(0, 10).map((q) => (
                <div key={q.id} className="border border-white/10 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] text-white/50">
                    <span>{q.year}</span> · <span>P{q.paperNumber}</span> · <span>{q.language}</span> · <span>{q.marks ?? "?"}M</span> · <span>{q.cognitiveLevel}</span>
                  </div>
                  <p className="text-sm text-white">{q.questionText?.slice(0, 300)}{(q.questionText?.length ?? 0) > 300 ? "…" : ""}</p>
                  {q.memoText && <p className="text-xs text-white/50 italic">Memo: {q.memoText?.slice(0, 150)}{(q.memoText?.length ?? 0) > 150 ? "…" : ""}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm py-6 text-center">No questions ingested yet for this subject.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
