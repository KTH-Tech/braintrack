// Long-running ingestion job registry.
//
// Why this exists: `POST /api/admin/dbe-ingestion/run-all` kicks off a job that
// can run for hours, but it used to return immediately with nothing an admin
// could follow. The Content Studio card fired the mutation, showed "Completed",
// and then the operator was blind — no way to tell whether the run was still
// going, had finished, or had died with the process. A backfill that got
// through 10 of 266 targets looked exactly like one that finished.
//
// This module keeps a single in-process registry of ingestion runs and pairs it
// with `dbe_ingestion_log` as the authoritative progress source. The in-memory
// half tracks intent (which subjects were queued, which are in flight, terminal
// state, the error); the DB half tracks work actually completed, by counting
// log rows written since the run started. Neither alone is enough: memory can't
// survive a restart, and the log has no notion of a "run".
//
// Deliberate non-goal: this is NOT persisted. If the server process dies the job
// is gone, and that is reported honestly rather than papered over — see
// `deriveStatus()`, which downgrades a "running" job with no recent log activity
// to `stalled`, and the status endpoint, which reports `idle` when no job has
// ever been registered in this process. Inventing a jobs table would duplicate
// state that `dbe_ingestion_log` already holds.

import { randomUUID } from "crypto";

/** How long a "running" job may go without a new dbe_ingestion_log row before
 *  we stop believing it is alive. Ingestion of a single paper (fetch + parse +
 *  extract) is minutes, not tens of minutes, so 20 min is generous. */
export const STALL_AFTER_MS = 20 * 60 * 1000;

export type JobStatus = "running" | "succeeded" | "failed" | "stopped" | "stalled";

export interface SubjectOutcome {
  completed: number;
  failed: number;
  errors: string[];
  finishedAt: string;
}

export interface IngestionJob {
  id: string;
  kind: "run-all";
  startedAt: string;
  finishedAt: string | null;
  /** Terminal state as recorded in-process. `deriveStatus` may report `stalled`
   *  on top of this when the job claims to be running but the log has gone quiet. */
  status: Exclude<JobStatus, "stalled">;
  /** Subjects queued for this run. */
  queued: string[];
  /** Subjects skipped because they were already complete or already running. */
  skipped: number;
  /** Subjects currently being worked, for the "what is it on right now" readout. */
  inFlight: string[];
  /** Subjects finished (successfully or not) — the numerator for progress. */
  doneSubjects: string[];
  perSubject: Record<string, SubjectOutcome>;
  /** Fatal error that ended the whole run, as opposed to a per-subject failure. */
  error: string | null;
  /** Cooperative stop flag — the runner checks this between subjects. */
  abort: boolean;
  /** Year window this run covered, echoed back for display. */
  yearStart: number;
  yearEnd: number;
  /** `MAX(dbe_ingestion_log.id)` at the moment the run started. Papers processed
   *  by THIS run are exactly the log rows with a higher id, which is how we get
   *  real per-paper progress without threading a job id through the ingester. */
  logBaselineId: number;
}

/** Only one run-all job is tracked at a time; a second concurrent batch would
 *  fight the first over the same subjects and the same rows. */
let current: IngestionJob | null = null;

export function getCurrentJob(): IngestionJob | null {
  return current;
}

/** True when a run is in flight and a new one must be refused. */
export function isJobRunning(): boolean {
  return current?.status === "running";
}

export function startJob(params: {
  queued: string[];
  skipped: number;
  yearStart: number;
  yearEnd: number;
  logBaselineId: number;
}): IngestionJob {
  current = {
    id: randomUUID(),
    kind: "run-all",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    status: "running",
    queued: params.queued,
    skipped: params.skipped,
    inFlight: [],
    doneSubjects: [],
    perSubject: {},
    error: null,
    abort: false,
    yearStart: params.yearStart,
    yearEnd: params.yearEnd,
    logBaselineId: params.logBaselineId,
  };
  return current;
}

export function markSubjectStarted(jobId: string, subject: string): void {
  if (current?.id !== jobId) return;
  if (!current.inFlight.includes(subject)) current.inFlight.push(subject);
}

export function markSubjectFinished(
  jobId: string,
  subject: string,
  outcome: SubjectOutcome,
): void {
  if (current?.id !== jobId) return;
  current.inFlight = current.inFlight.filter((s) => s !== subject);
  if (!current.doneSubjects.includes(subject)) current.doneSubjects.push(subject);
  current.perSubject[subject] = outcome;
}

export function finishJob(
  jobId: string,
  status: Exclude<JobStatus, "running" | "stalled">,
  error?: string,
): void {
  if (current?.id !== jobId) return;
  current.status = status;
  current.finishedAt = new Date().toISOString();
  current.inFlight = [];
  if (error) current.error = error;
}

/** Request a cooperative stop. The runner checks `abort` between subjects, so
 *  the currently in-flight subject finishes before the run halts. */
export function requestStop(): boolean {
  if (!current || current.status !== "running") return false;
  current.abort = true;
  return true;
}

export function shouldAbort(jobId: string): boolean {
  return current?.id === jobId && current.abort;
}

/**
 * Reconcile the in-memory job with observed DB progress.
 *
 * `papersProcessed` / `lastLogAt` come from `dbe_ingestion_log` rows written
 * since `logBaselineId`. When a job says it is running but the log has been
 * silent for longer than STALL_AFTER_MS, we report `stalled` — that is the
 * signature of the process having died mid-run, which is precisely the failure
 * that used to be invisible.
 */
export function deriveStatus(
  job: IngestionJob,
  lastLogAt: Date | null,
): JobStatus {
  if (job.status !== "running") return job.status;
  const reference = lastLogAt ?? new Date(job.startedAt);
  if (Date.now() - reference.getTime() > STALL_AFTER_MS) return "stalled";
  return "running";
}

/** Test seam — drops the tracked job so suites don't leak state into each other. */
export function __resetJobs(): void {
  current = null;
}
