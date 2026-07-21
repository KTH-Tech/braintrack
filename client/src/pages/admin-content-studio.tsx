import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminTopNav } from "@/components/admin-top-nav";
import {
  AdminGround, NeonShell, AdminBadge, AdminButton, halo, type NeonHex,
} from "@/components/admin-ui";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import {
  FileText, Sparkles, BookOpenCheck, CalendarRange,
  Loader2, CheckCircle2, AlertTriangle, Square, Activity, Clock,
} from "lucide-react";

const HEX = {
  amber: "#FFE29A",
  cyan: "#9FF5E8",
  blue: "#9FD8FF",
  violet: "#C5B3FF",
  pink: "#FFB7E5",
  mint: "#94F7C5",
} as const satisfies Record<string, NeonHex>;

// ─── Types ───────────────────────────────────────────────────────────────────

type JobState = "idle" | "running" | "succeeded" | "failed" | "stopped" | "stalled";

interface RunAllStatus {
  state: JobState;
  job: {
    id: string;
    startedAt: string;
    finishedAt: string | null;
    elapsedMs: number;
    yearStart: number;
    yearEnd: number;
    totalSubjects: number;
    doneSubjects: number;
    inFlight: string[];
    skipped: number;
    error: string | null;
  } | null;
  progress?: {
    papersProcessed: number;
    memosProcessed: number;
    papersFailed: number;
    questionsExtracted: number;
    lastLogAt: string | null;
  };
  recent?: Array<{
    subject: string; year: number; paperNumber: number; isMemo: boolean;
    status: string; questionCount: number | null; errorMessage: string | null;
  }>;
}

interface CrunchStatus {
  total: number; done: number; failed: number;
  running: boolean; startedAt: string; aborted: boolean;
}

interface HealthTotals {
  totals: {
    rowsTotal: number;
    rowsReleased: number;
    releasedPct: number;
    subjectCount: number;
    byCause: Record<string, number>;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatElapsed(ms: number, isAf: boolean): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}${isAf ? "u" : "h"} ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

const STATE_ACCENT: Record<JobState, NeonHex> = {
  idle: "#9FD8FF",
  running: "#FFE29A",
  succeeded: "#94F7C5",
  failed: "#FFB7E5",
  stopped: "#C5B3FF",
  stalled: "#FFB7E5",
};

// ─── Live job panel ──────────────────────────────────────────────────────────

/**
 * The whole reason this page was rebuilt. A batch ingest runs for hours; before
 * this panel the admin got a toast reading "Completed" the instant they clicked
 * and had no way to tell whether the run was still going, had finished, or had
 * died with the process. Progress here is DB-backed — papers counted straight
 * out of dbe_ingestion_log — so it stays truthful across page reloads.
 */
function IngestJobPanel({ isAf }: { isAf: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const status = useQuery<RunAllStatus>({
    queryKey: ["/api/admin/dbe-ingestion/run-all/status"],
    // Poll while a run is live; back right off once it reaches a terminal state.
    refetchInterval: (q) => {
      const s = q.state.data?.state;
      return s === "running" || s === "stalled" ? 5000 : 30000;
    },
  });

  const stop = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/admin/dbe-ingestion/run-all/stop")).json(),
    onSuccess: (d: any) => {
      toast({ title: isAf ? "Stop versoek" : "Stop requested", description: d?.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/run-all/status"] });
    },
    onError: (e: any) => toast({
      title: isAf ? "Kon nie stop nie" : "Could not stop", description: e?.message, variant: "destructive",
    }),
  });

  if (status.isLoading) {
    return (
      <NeonShell color={HEX.blue} className="p-6" testId="job-panel-loading">
        <div className="flex items-center gap-2 text-white text-sm">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: HEX.blue }} />
          {isAf ? "Laai taakstatus…" : "Loading job status…"}
        </div>
      </NeonShell>
    );
  }

  if (status.isError) {
    return (
      <NeonShell color={HEX.pink} className="p-6" testId="job-panel-error">
        <div className="flex items-center gap-2 text-white text-sm">
          <AlertTriangle className="h-4 w-4" style={{ color: HEX.pink }} />
          {isAf ? "Kon nie taakstatus laai nie" : "Could not load job status"}
          <span className="text-white">— {(status.error as any)?.message ?? ""}</span>
        </div>
      </NeonShell>
    );
  }

  const state = status.data?.state ?? "idle";
  const job = status.data?.job;
  const progress = status.data?.progress;
  const recent = status.data?.recent ?? [];
  const accent = STATE_ACCENT[state];

  const stateLabel: Record<JobState, string> = {
    idle: isAf ? "Geen taak" : "No job running",
    running: isAf ? "Loop tans" : "Running",
    succeeded: isAf ? "Voltooi" : "Succeeded",
    failed: isAf ? "Misluk" : "Failed",
    stopped: isAf ? "Gestop" : "Stopped",
    stalled: isAf ? "Vasgeval" : "Stalled",
  };

  // No job registered in this server process — say that plainly rather than
  // drawing an empty progress bar, which reads as a broken run.
  if (state === "idle" || !job) {
    return (
      <NeonShell color={HEX.blue} className="p-6" testId="job-panel-idle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider" style={{ color: HEX.blue }}>
              {isAf ? "Innamestaak" : "Ingestion job"}
            </div>
            <div className="mt-1 text-lg font-semibold text-white">{stateLabel.idle}</div>
            <p className="mt-1 text-sm text-white">
              {isAf
                ? "Geen bondelinname is in hierdie bedienerproses geregistreer nie. Begin een hieronder."
                : "No batch ingestion has been registered in this server process. Start one below."}
            </p>
          </div>
          <AdminBadge color={HEX.blue} testId="job-state-badge">{stateLabel.idle}</AdminBadge>
        </div>
      </NeonShell>
    );
  }

  const subjectPct = job.totalSubjects > 0
    ? Math.min(100, Math.round((job.doneSubjects / job.totalSubjects) * 100))
    : 0;

  return (
    <NeonShell color={accent} className="p-6" testId="job-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider" style={{ color: accent }}>
            {isAf ? "Innamestaak" : "Ingestion job"} · {job.yearStart}–{job.yearEnd}
          </div>
          <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
            {state === "running" && <Loader2 className="h-4 w-4 animate-spin" style={{ color: accent }} />}
            {stateLabel[state]}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminBadge color={accent} solid={state === "running"} testId="job-state-badge">
            {stateLabel[state]}
          </AdminBadge>
          {(state === "running" || state === "stalled") && (
            <AdminButton
              color={HEX.pink}
              onClick={() => stop.mutate()}
              disabled={stop.isPending}
              testId="btn-stop-ingestion"
            >
              <Square className="h-3 w-3" />
              {isAf ? "Stop" : "Stop"}
            </AdminButton>
          )}
        </div>
      </div>

      {/* Stalled is the failure mode that used to be invisible: the job says it
          is running but nothing has been written to the log in 20 minutes. */}
      {state === "stalled" && (
        <div
          className="mt-4 rounded-lg p-3 text-sm text-white"
          style={{ border: `1px solid ${HEX.pink}`, background: halo(HEX.pink, 0.1) }}
          data-testid="job-stalled-warning"
        >
          {isAf
            ? "Geen nuwe inskrywings in 20 minute nie — die proses het waarskynlik gesterf. Begin die taak weer."
            : "No new log entries in 20 minutes — the process has most likely died. Start the job again."}
        </div>
      )}

      {job.error && (
        <div
          className="mt-4 rounded-lg p-3 text-sm text-white"
          style={{ border: `1px solid ${HEX.pink}`, background: halo(HEX.pink, 0.1) }}
          data-testid="job-error"
        >
          {job.error}
        </div>
      )}

      {/* Subject progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-white">
          <span>{isAf ? "Vakke" : "Subjects"}</span>
          <span className="tabular-nums font-bold" style={{ color: accent }} data-testid="job-subject-progress">
            {job.doneSubjects} / {job.totalSubjects} · {subjectPct}%
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${subjectPct}%`, background: accent }}
          />
        </div>
      </div>

      {/* Counters — all DB-backed */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: isAf ? "Vraestelle" : "Papers", value: progress?.papersProcessed ?? 0, c: HEX.cyan, id: "papers" },
          { label: isAf ? "Memo's" : "Memos", value: progress?.memosProcessed ?? 0, c: HEX.mint, id: "memos" },
          { label: isAf ? "Vrae" : "Questions", value: progress?.questionsExtracted ?? 0, c: HEX.violet, id: "questions" },
          { label: isAf ? "Mislukkings" : "Failures", value: progress?.papersFailed ?? 0, c: HEX.pink, id: "failures" },
        ].map((s) => (
          <div
            key={s.id}
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${halo(s.c, 0.3)}` }}
          >
            <div className="text-[10px] uppercase tracking-wider" style={{ color: s.c }}>{s.label}</div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-white" data-testid={`job-count-${s.id}`}>
              {s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Elapsed + what it is on right now */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" style={{ color: accent }} />
          {isAf ? "Verstreke" : "Elapsed"}{" "}
          <span className="font-bold tabular-nums" data-testid="job-elapsed">{formatElapsed(job.elapsedMs, isAf)}</span>
        </span>
        {job.skipped > 0 && (
          <span>{job.skipped} {isAf ? "oorgeslaan" : "skipped"}</span>
        )}
        {job.inFlight.length > 0 && (
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <Activity className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
            <span className="truncate" data-testid="job-in-flight">
              {isAf ? "Besig met" : "Working on"}: <span className="font-bold">{job.inFlight.join(", ")}</span>
            </span>
          </span>
        )}
      </div>

      {/* The last few papers the pipeline actually touched. */}
      {recent.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-wider text-white">
            {isAf ? "Onlangse vraestelle" : "Recent papers"}
          </div>
          <div className="mt-2 space-y-1">
            {recent.map((r, i) => {
              const ok = r.status === "completed" && (r.questionCount ?? 0) > 0;
              const c: NeonHex = r.status === "failed" ? HEX.pink : ok ? HEX.mint : HEX.amber;
              return (
                <div
                  key={`${r.subject}-${r.year}-${r.paperNumber}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-xs"
                  style={{ background: "rgba(255,255,255,0.035)" }}
                  data-testid={`job-recent-${i}`}
                >
                  <span className="min-w-0 truncate text-white">
                    {r.subject} {r.year} P{r.paperNumber}{r.isMemo ? (isAf ? " (memo)" : " (memo)") : ""}
                  </span>
                  <span className="shrink-0 font-bold tabular-nums" style={{ color: c }}>
                    {r.status === "failed"
                      ? (isAf ? "misluk" : "failed")
                      : `${r.questionCount ?? 0}Q`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </NeonShell>
  );
}

// ─── Crunch-time (simulate-all) progress ─────────────────────────────────────

function CrunchProgress({ isAf }: { isAf: boolean }) {
  const status = useQuery<CrunchStatus>({
    queryKey: ["/api/admin/dbe-ingestion/simulate-all/status"],
    refetchInterval: (q) => (q.state.data?.running ? 5000 : 30000),
  });

  const d = status.data;
  if (!d || (!d.running && d.total === 0)) return null;

  const pct = d.total > 0 ? Math.min(100, Math.round((d.done / d.total) * 100)) : 0;
  const accent: NeonHex = d.running ? HEX.amber : d.failed > 0 ? HEX.pink : HEX.mint;

  return (
    <div className="mt-4" data-testid="crunch-progress">
      <div className="flex items-center justify-between text-xs text-white">
        <span className="inline-flex items-center gap-1.5">
          {d.running && <Loader2 className="h-3 w-3 animate-spin" style={{ color: accent }} />}
          {d.running
            ? (isAf ? "Genereer tans" : "Generating")
            : d.aborted
              ? (isAf ? "Gestop" : "Stopped")
              : (isAf ? "Voltooi" : "Finished")}
        </span>
        <span className="font-bold tabular-nums" style={{ color: accent }}>
          {d.done} / {d.total}
          {d.failed > 0 && <span style={{ color: HEX.pink }}> · {d.failed} {isAf ? "misluk" : "failed"}</span>}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: accent }} />
      </div>
    </div>
  );
}

// ─── Action card ─────────────────────────────────────────────────────────────

interface ActionCardProps {
  accent: NeonHex;
  icon: React.ReactNode;
  title: string;
  description: string;
  endpoint: string;
  body?: Record<string, unknown>;
  pipelineLabel: string;
  actionLabel: string;
  runningLabel: string;
  testId: string;
  isAf: boolean;
  /** Long jobs return immediately having only *queued* work; synchronous ones
   *  return a finished result. Saying "Completed" for the first kind is the lie
   *  this page used to tell. */
  kind: "job" | "sync";
  /** Turns the real response body into a sentence, so a card never falls back
   *  to a generic "Completed" that ignores what the endpoint actually said. */
  summarise: (data: any, isAf: boolean) => string;
  disabled?: boolean;
  disabledReason?: string;
  children?: React.ReactNode;
}

function ActionCard({
  accent, icon, title, description, endpoint, body,
  pipelineLabel, actionLabel, runningLabel, testId, isAf,
  kind, summarise, disabled, disabledReason, children,
}: ActionCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [state, setState] = useState<"idle" | "running" | "success" | "error">("idle");
  const [detail, setDetail] = useState("");

  const run = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", endpoint, body);
      return res.json();
    },
    onSuccess: (data: any) => {
      setState("success");
      const summary = summarise(data, isAf);
      setDetail(summary);
      toast({ title, description: summary });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/run-all/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/simulate-all/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/health"] });
    },
    onError: (err: any) => {
      setState("error");
      const msg = err?.message ?? String(err);
      setDetail(msg);
      toast({ title, description: msg, variant: "destructive" });
      // A 409 means someone else's run is live — refresh so the panel shows it.
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dbe-ingestion/run-all/status"] });
    },
  });

  const busy = state === "running" && run.isPending;

  return (
    <NeonShell color={accent} className="p-6" testId={`card-${testId}`}>
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${halo(accent, 0.45)}`, color: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[11px] uppercase tracking-wider" style={{ color: accent }}>{pipelineLabel}</div>
            <AdminBadge color={kind === "job" ? HEX.amber : HEX.mint}>
              {kind === "job"
                ? (isAf ? "Langlopend" : "Long job")
                : (isAf ? "Onmiddellik" : "Immediate")}
            </AdminBadge>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white">{description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AdminButton
              color={accent}
              solid
              onClick={() => { setState("running"); setDetail(""); run.mutate(); }}
              disabled={busy || disabled}
              title={disabled ? disabledReason : undefined}
              testId={testId}
            >
              {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />{runningLabel}</> : actionLabel}
            </AdminButton>

            {disabled && disabledReason && (
              <span className="inline-flex items-center gap-1.5 text-xs text-white">
                <AlertTriangle className="h-3.5 w-3.5" style={{ color: HEX.amber }} />
                {disabledReason}
              </span>
            )}
            {!disabled && state === "success" && detail && (
              <span className="inline-flex items-center gap-1.5 text-xs text-white" data-testid={`${testId}-result`}>
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: HEX.mint }} />
                {detail}
              </span>
            )}
            {!disabled && state === "error" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-white" data-testid={`${testId}-error`}>
                <AlertTriangle className="h-3.5 w-3.5" style={{ color: HEX.pink }} />
                {detail}
              </span>
            )}
          </div>

          {children}
        </div>
      </div>
    </NeonShell>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminContentStudio() {
  const { language } = useLanguage();
  const isAf = language === "af";

  // Library health drives the stat strip. This replaces the old tiles, which
  // read /api/past-papers/list — a learner endpoint that 402s without an active
  // subscription and, when it does answer, counts PDFs on the serving box's
  // disk rather than what is actually in the database.
  const health = useQuery<HealthTotals>({ queryKey: ["/api/admin/dbe-ingestion/health"] });
  const runStatus = useQuery<RunAllStatus>({ queryKey: ["/api/admin/dbe-ingestion/run-all/status"] });

  const jobLive = runStatus.data?.state === "running" || runStatus.data?.state === "stalled";
  const t = health.data?.totals;
  const needsAttention = t
    ? t.subjectCount - (t.byCause?.healthy ?? 0)
    : 0;

  const stats: Array<{ id: string; label: string; value: string; accent: NeonHex; sub: string }> = [
    {
      id: "released",
      label: isAf ? "Vrye vrae" : "Released questions",
      value: t ? t.rowsReleased.toLocaleString() : "—",
      accent: HEX.mint,
      sub: t ? `${t.releasedPct}% ${isAf ? "van" : "of"} ${t.rowsTotal.toLocaleString()}` : "",
    },
    {
      id: "total",
      label: isAf ? "Totale vrae" : "Total questions",
      value: t ? t.rowsTotal.toLocaleString() : "—",
      accent: HEX.cyan,
      sub: t ? `${(t.rowsTotal - t.rowsReleased).toLocaleString()} ${isAf ? "nog gesluit" : "still gated"}` : "",
    },
    {
      id: "subjects",
      label: isAf ? "Vakke" : "Subjects",
      value: t ? String(t.subjectCount) : "—",
      accent: HEX.blue,
      sub: t ? `${t.byCause?.healthy ?? 0} ${isAf ? "gesond" : "healthy"}` : "",
    },
    {
      id: "attention",
      label: isAf ? "Benodig aandag" : "Need attention",
      value: t ? String(needsAttention) : "—",
      accent: needsAttention > 0 ? HEX.amber : HEX.mint,
      sub: isAf ? "sien DBE Portaal" : "see DBE Portal",
    },
  ];

  return (
    <AdminGround>
      <AdminTopNav current="content-studio" />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 text-[11px] uppercase tracking-wider" style={{ color: HEX.cyan }}>
          {isAf ? "Admin · Inhoudstudio" : "Admin · Content Studio"}
        </div>

        <div className="mb-8">
          <div
            role="heading"
            aria-level={1}
            className="text-3xl font-black tracking-tight text-white md:text-4xl"
            data-testid="heading-content-studio"
          >
            {isAf ? "Inhoudstudio" : "Content Studio"}
          </div>
          <p className="mt-3 max-w-2xl text-white">
            {isAf
              ? "Een portaal, twee pyplyne. Verander ingenome DBE-vraestelle en KABV-leerplandokumente in oefenmateriaal, studieplanne, en gepubliseerde vraestelle vir leerders."
              : "One portal, two pipelines. Turn ingested DBE papers and CAPS curriculum docs into learner-facing practice, study plans, and published past papers."}
          </p>
        </div>

        {/* Live job state leads the page — it is the thing an admin comes here to check. */}
        <div className="mb-8">
          <IngestJobPanel isAf={isAf} />
        </div>

        {/* Library health */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <NeonShell key={s.id} color={s.accent} className="p-4">
              <div className="text-[11px] uppercase tracking-wider" style={{ color: s.accent }}>{s.label}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-white" data-testid={`stat-${s.id}`}>
                {health.isLoading ? "—" : health.isError ? "!" : s.value}
              </div>
              {!health.isLoading && !health.isError && s.sub && (
                <div className="mt-0.5 text-[10px] text-white">{s.sub}</div>
              )}
              {health.isError && (
                <div className="mt-0.5 text-[10px] text-white">{isAf ? "kon nie laai nie" : "failed to load"}</div>
              )}
            </NeonShell>
          ))}
        </div>

        <h2 className="mb-1 text-sm uppercase tracking-wider text-white">
          {isAf ? "Langlopende take" : "Long-running jobs"}
        </h2>
        <p className="mb-4 text-xs text-white">
          {isAf
            ? "Hierdie take loop ure lank in die agtergrond. Volg vordering in die paneel hierbo."
            : "These run for hours in the background. Track them in the panel above."}
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ActionCard
            accent={HEX.amber}
            icon={<FileText className="h-6 w-6" />}
            pipelineLabel={isAf ? "Vraestelle-pyplyn" : "Papers pipeline"}
            kind="job"
            title={isAf ? "Verdeel vraestelle in oefenvrae" : "Split papers into practice questions"}
            description={isAf
              ? "Ontleed elke ingenome DBE-vraestel in individuele vrae met memo-antwoorde aangeheg, gereed vir aanpasbare oefening."
              : "Parse every ingested DBE paper into individual questions with their memo answers attached, ready for adaptive practice."}
            endpoint="/api/admin/dbe-ingestion/run-all"
            actionLabel={isAf ? "Begin inname" : "Run ingestion"}
            runningLabel={isAf ? "Begin tans…" : "Starting…"}
            testId="btn-run-ingestion"
            isAf={isAf}
            disabled={jobLive}
            disabledReason={jobLive
              ? (isAf ? "'n Inname loop reeds" : "An ingestion is already running")
              : undefined}
            summarise={(d, af) =>
              af
                ? `${d?.queued ?? 0} vakke in wagry, ${d?.skipped ?? 0} oorgeslaan — volg hierbo`
                : `${d?.queued ?? 0} subjects queued, ${d?.skipped ?? 0} skipped — track above`}
          />

          <ActionCard
            accent={HEX.violet}
            icon={<Sparkles className="h-6 w-6" />}
            pipelineLabel={isAf ? "Vraestelle-pyplyn" : "Papers pipeline"}
            kind="job"
            title={isAf ? "Genereer KI-oefenvrae per onderwerp" : "Generate AI practice questions per topic"}
            description={isAf
              ? "Skep KABV-belynde gesimuleerde meervoudigekeusevrae oor elke vak — deur BrainTrack opgestel, nooit woordeliks van DBE nie."
              : "Create CAPS-aligned simulated multiple-choice questions across every subject — BrainTrack-authored, never verbatim DBE."}
            endpoint="/api/admin/dbe-ingestion/simulate-all"
            actionLabel={isAf ? "Genereer KI-vrae" : "Generate AI questions"}
            runningLabel={isAf ? "Begin tans…" : "Starting…"}
            testId="btn-generate-ai"
            isAf={isAf}
            summarise={(d, af) =>
              af
                ? `${d?.queued ?? 0} vraestelle in wagry oor ${d?.subjects?.length ?? 0} vakke`
                : `${d?.queued ?? 0} papers queued across ${d?.subjects?.length ?? 0} subjects`}
          >
            <CrunchProgress isAf={isAf} />
          </ActionCard>
        </div>

        <h2 className="mb-1 mt-10 text-sm uppercase tracking-wider text-white">
          {isAf ? "Onmiddellike kontroles" : "Immediate checks"}
        </h2>
        <p className="mb-4 text-xs text-white">
          {isAf
            ? "Hierdie voltooi terwyl jy wag en gee 'n resultaat terug."
            : "These finish while you wait and hand back a result."}
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ActionCard
            accent={HEX.cyan}
            icon={<BookOpenCheck className="h-6 w-6" />}
            pipelineLabel={isAf ? "Vraestelle-pyplyn" : "Papers pipeline"}
            kind="sync"
            title={isAf ? "Publiseer vraestelle aan leerders" : "Publish past papers to learners"}
            description={isAf
              ? "Bevestig dat elke ingenome vraestel sigbaar is op die leerder se Vraestelle-bladsy en dat lêerhasse korrek is."
              : "Verify every ingested paper is visible on the learner Past Papers page and that file hashes are sound."}
            endpoint="/api/admin/dbe-ingestion/verify"
            actionLabel={isAf ? "Publiseer & bevestig" : "Publish & verify"}
            runningLabel={isAf ? "Bevestig tans…" : "Verifying…"}
            testId="btn-publish-papers"
            isAf={isAf}
            summarise={(d, af) =>
              af
                ? `${d?.passed ?? 0} geslaag, ${d?.failed ?? 0} misluk van ${d?.total ?? 0}`
                : `${d?.passed ?? 0} passed, ${d?.failed ?? 0} failed of ${d?.total ?? 0}`}
          />

          <ActionCard
            accent={HEX.blue}
            icon={<CalendarRange className="h-6 w-6" />}
            pipelineLabel={isAf ? "KABV-pyplyn" : "CAPS pipeline"}
            kind="sync"
            title={isAf ? "Genereer KABV-belynde studieplanne" : "Generate CAPS-aligned study plans"}
            description={isAf
              ? "Hergenereer elke leerder se NSC-roosterstudieplan vanaf KABV-onderwerpsdekking, eksamendatums, en huidige bemeestering."
              : "Regenerate every learner's NSC-timetabled study schedule from CAPS topic coverage, exam dates, and current mastery."}
            endpoint="/api/admin/timetable/regenerate"
            actionLabel={isAf ? "Hergenereer planne" : "Regenerate plans"}
            runningLabel={isAf ? "Hergenereer tans…" : "Regenerating…"}
            testId="btn-regen-plans"
            isAf={isAf}
            summarise={(d, af) =>
              af
                ? `${d?.schedulesRegenerated ?? 0} skedules hergenereer`
                : `${d?.schedulesRegenerated ?? 0} schedules regenerated`}
          />
        </div>
      </div>
    </AdminGround>
  );
}
