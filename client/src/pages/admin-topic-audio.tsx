import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { AdminTopNav } from "@/components/admin-top-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ChevronLeft, Loader2, Play, Pause, RefreshCw, Upload, Pin, PinOff,
  Headphones, AlertCircle, CheckCircle2, Zap, XCircle, Clock, RotateCcw, Filter,
} from "lucide-react";

type Lang = "en" | "af";

type Row = {
  id: number;
  subjectId: number;
  subjectName: string;
  name: string;
  nameAfrikaans: string | null;
  summaryEn: string | null;
  summaryAf: string | null;
  audioUrl: string | null;
  audioUrlAf: string | null;
  audioGeneratedAt: string | null;
  audioGeneratedAtEn: string | null;
  audioGeneratedAtAf: string | null;
  audioSourceHashEn: string | null;
  audioSourceHashAf: string | null;
  audioPinnedEn: boolean;
  audioPinnedAf: boolean;
  audioOriginEn: string | null;
  audioOriginAf: string | null;
};

type ListResponse = {
  rows: Row[];
  totalMatched: number;
  subjects: { id: number; name: string }[];
};

type BulkJobItem = {
  topicId: number;
  lang: Lang;
  status: "pending" | "running" | "done" | "error";
  error: string | null;
};

type BulkJobStatus = {
  jobId: string;
  total: number;
  done: number;
  errors: number;
  running: number;
  pending: number;
  completedAt: number | null;
  items: BulkJobItem[];
};

const NEON = "#7FEFFF";
const PINK = "#FF9FE5";
const GOLD = "#FFF29E";
const PURPLE = "#C6A4FF";
const GREEN = "#22c55e";

function fmtDate(s: string | null, isAf: boolean): string {
  if (!s) return isAf ? "nooit" : "never";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 3600 * 1000));
  if (days === 0) return isAf ? "vandag" : "today";
  if (days === 1) return isAf ? "gister" : "yesterday";
  if (days < 30) return isAf ? `${days} dae gelede` : `${days} days ago`;
  return d.toLocaleDateString(isAf ? "af-ZA" : "en-ZA");
}

type BulkItemInfo = { status: BulkJobItem["status"]; error: string | null };

function BulkStatusBadge({
  status,
  errorMsg,
  isAf,
}: {
  status: BulkJobItem["status"];
  errorMsg?: string | null;
  isAf: boolean;
}) {
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1 py-0.5 rounded-full" style={{ border: `1px solid ${GREEN}`, color: GREEN }}>
        <CheckCircle2 className="w-2.5 h-2.5" />
        {isAf ? "Klaar" : "Done"}
      </span>
    );
  if (status === "error")
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1 py-0.5 rounded-full cursor-help"
        style={{ border: `1px solid ${PINK}`, color: PINK }}
        title={errorMsg ?? (isAf ? "Onbekende fout" : "Unknown error")}
      >
        <XCircle className="w-2.5 h-2.5" />
        {isAf ? "Fout" : "Error"}
      </span>
    );
  if (status === "running")
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1 py-0.5 rounded-full" style={{ border: `1px solid ${NEON}`, color: NEON }}>
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
        {isAf ? "Besig" : "Running"}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1 py-0.5 rounded-full" style={{ border: `1px solid rgba(255,255,255,0.3)`, color: "rgba(255,255,255,0.5)" }}>
      <Clock className="w-2.5 h-2.5" />
      {isAf ? "Wagstand" : "Queued"}
    </span>
  );
}

function LangCell({
  row,
  lang,
  playingKey,
  onPlay,
  onRegenerate,
  onUpload,
  onUnpin,
  busyKey,
  bulkItem,
}: {
  row: Row;
  lang: Lang;
  playingKey: string | null;
  onPlay: (key: string, url: string) => void;
  onRegenerate: (id: number, lang: Lang) => void;
  onUpload: (id: number, lang: Lang, file: File) => void;
  onUnpin: (id: number, lang: Lang) => void;
  busyKey: string | null;
  bulkItem: BulkItemInfo | null;
}) {
  const url = lang === "en" ? row.audioUrl : row.audioUrlAf;
  const pinned = lang === "en" ? row.audioPinnedEn : row.audioPinnedAf;
  const origin = lang === "en" ? row.audioOriginEn : row.audioOriginAf;
  const generatedAt =
    (lang === "en" ? row.audioGeneratedAtEn : row.audioGeneratedAtAf) ||
    row.audioGeneratedAt;
  const playKey = `${row.id}:${lang}`;
  const isPlaying = playingKey === playKey;
  const fileRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const isAf = language === "af";

  const busy = busyKey === playKey;

  return (
    <div className="rounded-xl bg-black/60 p-3" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: NEON }}>
          {lang.toUpperCase()}
        </span>
        {pinned && (
          <span
            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
            style={{ border: `1px solid ${GOLD}`, color: GOLD }}
            data-testid={`pin-badge-${row.id}-${lang}`}
          >
            <Pin className="w-2.5 h-2.5" />
            {isAf ? "Vasgesteek" : "Pinned"}
          </span>
        )}
        {origin === "upload" && (
          <span className="text-[9px] uppercase tracking-wider text-white">
            {isAf ? "opgelaai" : "uploaded"}
          </span>
        )}
        {bulkItem && (
          <BulkStatusBadge status={bulkItem.status} errorMsg={bulkItem.error} isAf={isAf} />
        )}
        <span className="ml-auto text-[10px] text-white tabular-nums">
          {fmtDate(generatedAt, isAf)}
        </span>
      </div>

      {url ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPlay(playKey, url)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-black hover:bg-white/5"
              style={{ border: `1px solid ${NEON}`, color: NEON }}
              data-testid={`btn-play-${row.id}-${lang}`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? (isAf ? "Pouse" : "Pause") : (isAf ? "Speel" : "Play")}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-white underline truncate flex-1"
              data-testid={`link-audio-${row.id}-${lang}`}
            >
              {url.split("/").pop()}
            </a>
          </div>
          {isPlaying && (
            <audio
              src={url}
              autoPlay
              controls
              className="w-full h-8"
              onEnded={() => onPlay(playKey, url)}
              data-testid={`audio-${row.id}-${lang}`}
            />
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[11px] text-white mb-2">
          <AlertCircle className="w-3 h-3" style={{ color: PINK }} />
          {isAf ? "geen klank nog nie" : "no audio yet"}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        <button
          type="button"
          onClick={() => onRegenerate(row.id, lang)}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-black hover:bg-white/5 disabled:opacity-50"
          style={{ border: `1px solid ${PURPLE}`, color: PURPLE }}
          data-testid={`btn-regen-${row.id}-${lang}`}
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {isAf ? "Hergenereer" : "Regenerate"}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,.mp3"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(row.id, lang, f);
            if (fileRef.current) fileRef.current.value = "";
          }}
          data-testid={`input-upload-${row.id}-${lang}`}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-black hover:bg-white/5 disabled:opacity-50"
          style={{ border: `1px solid ${GOLD}`, color: GOLD }}
          data-testid={`btn-upload-${row.id}-${lang}`}
        >
          <Upload className="w-3 h-3" />
          {isAf ? "Vervang" : "Upload"}
        </button>

        {pinned && (
          <button
            type="button"
            onClick={() => onUnpin(row.id, lang)}
            disabled={busy}
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-black hover:bg-white/5 disabled:opacity-50"
            style={{ border: `1px solid ${PINK}`, color: PINK }}
            data-testid={`btn-unpin-${row.id}-${lang}`}
          >
            <PinOff className="w-3 h-3" />
            {isAf ? "Maak los" : "Unpin"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminTopicAudioPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const [subjectId, setSubjectId] = useState<string>("");
  const [missing, setMissing] = useState<string>("");
  const [olderThanDays, setOlderThanDays] = useState<string>("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);

  // Bulk job state — persisted to localStorage so a page refresh re-attaches
  const BULK_JOB_KEY = "braintrack_admin_bulk_audio_job_id";
  const [bulkJobId, _setBulkJobId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("braintrack_admin_bulk_audio_job_id") || null;
    } catch {
      return null;
    }
  });
  const setBulkJobId = (id: string | null) => {
    _setBulkJobId(id);
    try {
      if (id) {
        localStorage.setItem(BULK_JOB_KEY, id);
      } else {
        localStorage.removeItem(BULK_JOB_KEY);
      }
    } catch {}
  };
  const [bulkStarting, setBulkStarting] = useState(false);

  const queryKey = useMemo(() => {
    const p = new URLSearchParams();
    if (subjectId) p.set("subjectId", subjectId);
    if (missing) p.set("missing", missing);
    if (olderThanDays) p.set("olderThanDays", olderThanDays);
    if (pinnedOnly) p.set("pinned", "1");
    p.set("limit", "500");
    return ["/api/admin/topics/audio", p.toString()];
  }, [subjectId, missing, olderThanDays, pinnedOnly]);

  const { data, isLoading, isError } = useQuery<ListResponse>({
    queryKey,
    queryFn: async () => {
      const url = `${queryKey[0]}?${queryKey[1]}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  // Poll bulk job status
  const { data: bulkJob, error: bulkJobError } = useQuery<BulkJobStatus>({
    queryKey: ["/api/admin/topics/audio/bulk-job", bulkJobId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/topics/audio/bulk-job/${bulkJobId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!bulkJobId,
    refetchInterval: (query) => {
      const d = query.state.data as BulkJobStatus | undefined;
      if (!d) return 2000;
      return d.completedAt ? false : 2000;
    },
    retry: 1,
  });

  // Clear stale stored job ID only when the server explicitly says the job
  // does not exist (404). Transient network/auth errors keep the stored ID so
  // the page can re-attach once connectivity is restored.
  useEffect(() => {
    if (bulkJobError && bulkJobId) {
      const is404 = bulkJobError.message.startsWith("404");
      if (is404) {
        try { localStorage.removeItem(BULK_JOB_KEY); } catch {}
        _setBulkJobId(null);
      }
    }
  }, [bulkJobError]);

  // Clear the "show only errors" filter whenever the page-level filters change
  useEffect(() => {
    setShowOnlyErrors(false);
  }, [subjectId, missing, olderThanDays, pinnedOnly, search]);

  // When the bulk job completes, refresh the topic list and clear persisted ID
  useEffect(() => {
    if (bulkJob?.completedAt) {
      try { localStorage.removeItem(BULK_JOB_KEY); } catch {}
      qc.invalidateQueries({ queryKey: ["/api/admin/topics/audio"] });
      const err = bulkJob.errors;
      const done = bulkJob.done;
      toast({
        title: isAf ? "Bondellood voltooi" : "Bulk job complete",
        description: isAf
          ? `${done} voltooi, ${err} fout(e).`
          : `${done} succeeded, ${err} error(s).`,
        variant: err > 0 ? "destructive" : "default",
      });
    }
  }, [bulkJob?.completedAt]);

  // Build a lookup: topicId → { en: { status, error }, af: { status, error } }
  const bulkStatusMap = useMemo(() => {
    const m = new Map<number, { en?: BulkItemInfo; af?: BulkItemInfo }>();
    if (!bulkJob) return m;
    for (const item of bulkJob.items) {
      const existing = m.get(item.topicId) ?? {};
      existing[item.lang] = { status: item.status, error: item.error };
      m.set(item.topicId, existing);
    }
    return m;
  }, [bulkJob]);

  const visibleRows = useMemo(() => {
    let rows = data?.rows ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.nameAfrikaans || "").toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q),
      );
    }
    if (showOnlyErrors && bulkStatusMap.size > 0) {
      rows = rows.filter((r) => {
        const info = bulkStatusMap.get(r.id);
        return info && (info.en?.status === "error" || info.af?.status === "error");
      });
    }
    return rows;
  }, [data?.rows, search, showOnlyErrors, bulkStatusMap]);

  const isJobRunning = !!bulkJob && !bulkJob.completedAt;

  const handlePlay = (key: string, _url: string) => {
    setPlayingKey((prev) => (prev === key ? null : key));
  };

  const regenMut = useMutation({
    mutationFn: async ({ id, lang }: { id: number; lang: Lang }) => {
      setBusyKey(`${id}:${lang}`);
      const r = await apiRequest("POST", `/api/admin/topics/${id}/generate-audio`, { language: lang });
      return r.json();
    },
    onSuccess: () => {
      toast({
        title: isAf ? "Klank hergenereer" : "Audio regenerated",
        description: isAf ? "Vars opname is gereed." : "Fresh recording is ready.",
      });
      qc.invalidateQueries({ queryKey: ["/api/admin/topics/audio"] });
    },
    onError: (e: any) => {
      toast({
        title: isAf ? "Hergenereer het misluk" : "Regenerate failed",
        description: e?.message || "Error",
        variant: "destructive",
      });
    },
    onSettled: () => setBusyKey(null),
  });

  const uploadMut = useMutation({
    mutationFn: async ({ id, lang, file }: { id: number; lang: Lang; file: File }) => {
      setBusyKey(`${id}:${lang}`);
      const fd = new FormData();
      fd.append("audio", file);
      fd.append("language", lang);
      const res = await fetch(`/api/admin/topics/${id}/upload-audio`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isAf ? "Klank vervang en vasgesteek" : "Audio replaced and pinned",
        description: isAf
          ? "Bondelskrip sal hierdie taal nie oorskryf nie."
          : "The batch script will skip this language until unpinned.",
      });
      qc.invalidateQueries({ queryKey: ["/api/admin/topics/audio"] });
    },
    onError: (e: any) => {
      toast({
        title: isAf ? "Oplaai het misluk" : "Upload failed",
        description: e?.message || "Error",
        variant: "destructive",
      });
    },
    onSettled: () => setBusyKey(null),
  });

  const unpinMut = useMutation({
    mutationFn: async ({ id, lang }: { id: number; lang: Lang }) => {
      setBusyKey(`${id}:${lang}`);
      const r = await apiRequest("POST", `/api/admin/topics/${id}/unpin-audio`, { language: lang });
      return r.json();
    },
    onSuccess: () => {
      toast({
        title: isAf ? "Vasgesteek verwyder" : "Unpinned",
        description: isAf
          ? "Die nagtelike skrip sal hierdie taal weer bestuur."
          : "The nightly script will manage this language again.",
      });
      qc.invalidateQueries({ queryKey: ["/api/admin/topics/audio"] });
    },
    onError: (e: any) => {
      toast({
        title: isAf ? "Kon nie losmaak nie" : "Unpin failed",
        description: e?.message || "Error",
        variant: "destructive",
      });
    },
    onSettled: () => setBusyKey(null),
  });

  async function handleBulkRegenerate() {
    if (visibleRows.length === 0) return;
    setShowOnlyErrors(false);
    setBulkStarting(true);
    try {
      const res = await fetch("/api/admin/topics/audio/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ topicIds: visibleRows.map((r) => r.id) }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `${res.status}`);
      }
      const { jobId, total } = await res.json();
      setBulkJobId(jobId);
      toast({
        title: isAf ? "Bondeltaak begin" : "Bulk job started",
        description: isAf
          ? `${total} klank-/taalpare in tou gesit.`
          : `${total} audio/language pairs queued.`,
      });
    } catch (err: any) {
      toast({
        title: isAf ? "Bondeltaak het misluk" : "Bulk job failed",
        description: err?.message || "Error",
        variant: "destructive",
      });
    } finally {
      setBulkStarting(false);
    }
  }

  async function handleRetryErrors() {
    if (!bulkJob) return;
    const errorItems = bulkJob.items.filter((i) => i.status === "error");
    if (errorItems.length === 0) return;
    // Collect unique topicIds and unique langs that errored — single job, single jobId
    const topicIds = [...new Set(errorItems.map((i) => i.topicId))];
    const languages = [...new Set(errorItems.map((i) => i.lang))] as ("en" | "af")[];
    setShowOnlyErrors(false);
    setBulkStarting(true);
    try {
      const res = await fetch("/api/admin/topics/audio/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ topicIds, languages }),
      });
      if (!res.ok) throw new Error((await res.text()) || `${res.status}`);
      const { jobId, total } = await res.json();
      setBulkJobId(jobId);
      toast({
        title: isAf ? "Herbegin foute" : "Retrying errors",
        description: isAf
          ? `${total} mislukte paar(e) herskeduleer.`
          : `${total} failed pair(s) re-queued.`,
      });
    } catch (err: any) {
      toast({
        title: isAf ? "Herbegin het misluk" : "Retry failed",
        description: err?.message || "Error",
        variant: "destructive",
      });
    } finally {
      setBulkStarting(false);
    }
  }

  // Client-side admin gate so non-admin authenticated users see a clear
  // explanation instead of a blank page hitting failing API calls. Backend
  // endpoints are still authoritatively guarded by requireRole("admin").
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: NEON }} />
      </div>
    );
  }
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div
          className="max-w-md text-center rounded-2xl p-6 bg-black"
          style={{ border: `1px solid ${PINK}` }}
          data-testid="admin-only-block"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: PINK }}>
            {isAf ? "Slegs Admin" : "Admin Only"}
          </p>
          <h1 className="text-xl font-black text-white mt-2">
            {isAf
              ? "Hierdie bladsy is net vir administrateurs."
              : "This page is for administrators only."}
          </h1>
          <Link
            href="/dashboard"
            className="inline-block mt-4 text-xs font-bold underline text-white"
            data-testid="link-dashboard"
          >
            {isAf ? "Terug na paneelbord" : "Back to dashboard"}
          </Link>
        </div>
      </div>
    );
  }

  const nonPinnedCount = visibleRows.filter(
    (r) => !r.audioPinnedEn || !r.audioPinnedAf,
  ).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminTopNav current="topic-audio" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <section
          className="rounded-2xl p-4 bg-black"
          style={{ border: `1.5px solid ${NEON}`, boxShadow: `0 0 24px rgba(127,239,255,0.25)` }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="text-xs">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-1">
                {isAf ? "Vak" : "Subject"}
              </div>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-black text-white text-xs px-2 py-1.5 rounded-md"
                style={{ border: `1px solid rgba(127,239,255,0.45)` }}
                data-testid="filter-subject"
              >
                <option value="">{isAf ? "Alle vakke" : "All subjects"}</option>
                {(data?.subjects ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-1">
                {isAf ? "Ontbreek" : "Missing audio"}
              </div>
              <select
                value={missing}
                onChange={(e) => setMissing(e.target.value)}
                className="w-full bg-black text-white text-xs px-2 py-1.5 rounded-md"
                style={{ border: `1px solid rgba(127,239,255,0.45)` }}
                data-testid="filter-missing"
              >
                <option value="">{isAf ? "Enige status" : "Any status"}</option>
                <option value="en">{isAf ? "EN ontbreek" : "EN missing"}</option>
                <option value="af">{isAf ? "AF ontbreek" : "AF missing"}</option>
                <option value="any">{isAf ? "Enige ontbreek" : "Either missing"}</option>
              </select>
            </label>

            <label className="text-xs">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-1">
                {isAf ? "Ouer as (dae)" : "Older than (days)"}
              </div>
              <input
                type="number"
                min={0}
                value={olderThanDays}
                onChange={(e) => setOlderThanDays(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="w-full bg-black text-white text-xs px-2 py-1.5 rounded-md"
                style={{ border: `1px solid rgba(127,239,255,0.45)` }}
                data-testid="filter-older"
              />
            </label>

            <label className="text-xs">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-1">
                {isAf ? "Soek" : "Search"}
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAf ? "onderwerp/vak" : "topic / subject"}
                className="w-full bg-black text-white text-xs px-2 py-1.5 rounded-md"
                style={{ border: `1px solid rgba(127,239,255,0.45)` }}
                data-testid="filter-search"
              />
            </label>

            <label className="text-xs flex items-end gap-2">
              <input
                type="checkbox"
                checked={pinnedOnly}
                onChange={(e) => setPinnedOnly(e.target.checked)}
                className="w-4 h-4 accent-amber-400"
                data-testid="filter-pinned"
              />
              <span className="text-[11px] font-bold text-white mb-1.5">
                {isAf ? "Slegs vasgesteek" : "Pinned only"}
              </span>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 text-[11px] text-white">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: NEON }} />
              <span data-testid="result-count">
                {isAf ? "Wys" : "Showing"} <b className="text-white">{visibleRows.length}</b>{" "}
                {isAf ? "onderwerpe" : "topics"}
                {data && data.totalMatched !== visibleRows.length
                  ? ` (${data.totalMatched} ${isAf ? "totaal" : "total"})`
                  : ""}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {isJobRunning && bulkJob && (
                <div
                  className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg"
                  style={{ border: `1px solid ${NEON}`, color: NEON }}
                  data-testid="bulk-progress"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>
                    {bulkJob.done + bulkJob.errors}/{bulkJob.total}
                    {bulkJob.errors > 0 && (
                      <span style={{ color: PINK }}> · {bulkJob.errors} {isAf ? "fout" : "err"}</span>
                    )}
                  </span>
                </div>
              )}
              {bulkJob?.completedAt && (
                <>
                  <div
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg"
                    style={{
                      border: `1px solid ${bulkJob.errors > 0 ? PINK : GREEN}`,
                      color: bulkJob.errors > 0 ? PINK : GREEN,
                    }}
                    data-testid="bulk-complete"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {isAf ? "Bondeltaak klaar" : "Bulk job complete"}: {bulkJob.done}/{bulkJob.total}
                  </div>
                  {bulkJob.errors > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowOnlyErrors((v) => !v)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg bg-black hover:bg-white/5"
                        style={{
                          border: `1.5px solid ${showOnlyErrors ? PINK : "rgba(255,159,229,0.4)"}`,
                          color: showOnlyErrors ? PINK : "rgba(255,159,229,0.6)",
                        }}
                        data-testid="btn-show-errors-only"
                        title={isAf ? "Wys slegs foutonderwerpe" : "Show only failed topics"}
                      >
                        <Filter className="w-3 h-3" />
                        {showOnlyErrors
                          ? (isAf ? "Wys almal" : "Show all")
                          : (isAf ? "Wys slegs foute" : "Show only errors")}
                      </button>
                      <button
                        type="button"
                        onClick={handleRetryErrors}
                        disabled={bulkStarting}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg bg-black hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ border: `1.5px solid ${PINK}`, color: PINK }}
                        data-testid="btn-retry-errors"
                      >
                        {bulkStarting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        {isAf ? "Herprobeer foute" : "Retry errors"}
                        <span
                          className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                          style={{ background: PINK, color: "#000" }}
                        >
                          {bulkJob.errors}
                        </span>
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={handleBulkRegenerate}
                disabled={bulkStarting || isJobRunning || visibleRows.length === 0}
                className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg bg-black hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ border: `1.5px solid ${PURPLE}`, color: PURPLE }}
                data-testid="btn-bulk-regen"
                title={isAf
                  ? `Hergenereer alle ${nonPinnedCount} sigbare onderwerpe (oorsla vasgesteek)`
                  : `Regenerate all ${nonPinnedCount} visible topics (skip pinned)`}
              >
                {bulkStarting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3" />
                )}
                {isAf ? "Hergenereer almal" : "Regenerate all visible"}
                {nonPinnedCount > 0 && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                    style={{ background: PURPLE, color: "#000" }}
                  >
                    {nonPinnedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="flex items-center gap-2 text-white" data-testid="loading">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isAf ? "Laai onderwerpe…" : "Loading topics…"}
          </div>
        )}
        {isError && (
          <div className="text-sm" style={{ color: PINK }} data-testid="error">
            {isAf ? "Kon nie laai nie." : "Failed to load topics."}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3" data-testid="topic-list">
          {visibleRows.map((row) => {
            const rowBulk = bulkStatusMap.get(row.id);
            return (
              <div
                key={row.id}
                className="rounded-2xl p-4 bg-black"
                style={{ border: `1px solid rgba(255,255,255,0.10)` }}
                data-testid={`topic-card-${row.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p
                      className="text-[10px] font-black uppercase tracking-[0.2em]"
                      style={{ color: PURPLE }}
                    >
                      {row.subjectName}
                    </p>
                    <h3 className="text-base font-black text-white truncate">{row.name}</h3>
                    {row.nameAfrikaans && row.nameAfrikaans !== row.name && (
                      <p className="text-[11px] text-white truncate">{row.nameAfrikaans}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-white tabular-nums">#{row.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <LangCell
                    row={row}
                    lang="en"
                    playingKey={playingKey}
                    onPlay={handlePlay}
                    onRegenerate={(id, lang) => regenMut.mutate({ id, lang })}
                    onUpload={(id, lang, file) => uploadMut.mutate({ id, lang, file })}
                    onUnpin={(id, lang) => unpinMut.mutate({ id, lang })}
                    busyKey={busyKey}
                    bulkItem={rowBulk?.en ?? null}
                  />
                  <LangCell
                    row={row}
                    lang="af"
                    playingKey={playingKey}
                    onPlay={handlePlay}
                    onRegenerate={(id, lang) => regenMut.mutate({ id, lang })}
                    onUpload={(id, lang, file) => uploadMut.mutate({ id, lang, file })}
                    onUnpin={(id, lang) => unpinMut.mutate({ id, lang })}
                    busyKey={busyKey}
                    bulkItem={rowBulk?.af ?? null}
                  />
                </div>
              </div>
            );
          })}
          {!isLoading && visibleRows.length === 0 && (
            <div className="text-sm text-white col-span-full" data-testid="empty">
              {isAf ? "Geen onderwerpe pas by hierdie filters nie." : "No topics match these filters."}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
