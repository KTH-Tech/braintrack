import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AdminTopNav } from "@/components/admin-top-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import {
  ArrowLeft, BookOpen, Layers, BookMarked, Search,
  Pencil, Trash2, Plus, X, Check,
  Loader2, Upload, Download, ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  Filter,
} from "lucide-react";

async function downloadUnreviewedCsv(endpoint: string, fallbackName: string) {
  const r = await fetch(endpoint, { credentials: "include" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const blob = await r.blob();
  const disposition = r.headers.get("Content-Disposition") || "";
  const match = /filename="?([^"]+)"?/i.exec(disposition);
  const filename = match?.[1] ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Row types ────────────────────────────────────────────────────────────────
interface TopicNoteRow {
  id: number;
  topicId: number;
  topicName: string;
  subjectName: string;
  language: string;
  summary: string;
  keyConcepts: unknown[];
  workedExamples: unknown[];
  source: string;
  updatedAt: string;
}

interface TopicFlashcardRow {
  id: number;
  topicId: number;
  topicName: string;
  subjectName: string;
  language: string;
  front: string;
  back: string;
  cardType: string;
  orderIndex: number;
  source: string;
}

interface LiteratureNoteRow {
  id: number;
  workId: number;
  workTitle: string;
  author: string;
  subjectName: string;
  language: string;
  themes: unknown[];
  characters: unknown[];
  literaryDevices: unknown[];
  essayFrameworks: unknown[];
  summary: string;
  source: string;
  updatedAt: string;
}

// ── Draft types ──────────────────────────────────────────────────────────────
interface NoteDraft {
  summary: string;
  keyConcepts: unknown;
  workedExamples: unknown;
}

interface FlashcardDraft {
  front: string;
  back: string;
  cardType: string;
  orderIndex: number;
}

interface LitNoteDraft {
  summary: string;
  themes: unknown;
  characters: unknown;
  literaryDevices: unknown;
  essayFrameworks: unknown;
}

// ── Create form types ────────────────────────────────────────────────────────
interface NewFlashcard {
  topicId: string;
  language: string;
  front: string;
  back: string;
  cardType: string;
  orderIndex: number;
}

interface NewTopicNote {
  topicId: string;
  language: string;
  summary: string;
  keyConcepts: string;
  workedExamples: string;
}

interface NewLitNote {
  workId: string;
  language: string;
  summary: string;
}

// ── Colour palette ───────────────────────────────────────────────────────────
const HEX = {
  cyan: "#28c9d6",
  violet: "#8e7cdc",
  pink: "#e6519c",
  amber: "#ffb020",
  green: "#34d399",
} as const;

// ── GlowCard shell ───────────────────────────────────────────────────────────
function GlowCard({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-2xl bg-black p-5 transition-shadow"
      style={{
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 0 1px ${accent}22, 0 0 24px -8px ${accent}77`,
      }}
    >
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t rounded-tl-2xl" style={{ borderColor: accent }} />
      <span aria-hidden className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t rounded-tr-2xl" style={{ borderColor: accent }} />
      <span aria-hidden className="pointer-events-none absolute left-0 bottom-0 h-3 w-3 border-l border-b rounded-bl-2xl" style={{ borderColor: accent }} />
      <span aria-hidden className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 border-r border-b rounded-br-2xl" style={{ borderColor: accent }} />
      {children}
    </div>
  );
}

// ── Source badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: string }) {
  const isAdmin = source === "admin";
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
      style={{
        background: isAdmin ? `${HEX.pink}22` : `${HEX.cyan}22`,
        color: isAdmin ? HEX.pink : HEX.cyan,
        border: `1px solid ${isAdmin ? HEX.pink : HEX.cyan}44`,
      }}
    >
      {source}
    </span>
  );
}

// ── Plain textarea ────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</label>
      <textarea
        className="w-full resize-y rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none ring-1 ring-white/10 focus:ring-white/30"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ── JSON textarea ─────────────────────────────────────────────────────────────
function JsonField({
  label, value, onChange,
}: { label: string; value: unknown; onChange: (v: unknown) => void }) {
  const [raw, setRaw] = useState(() => JSON.stringify(value, null, 2));
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</label>
      <textarea
        className={`w-full resize-y rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder-white/20 outline-none ring-1 focus:ring-white/30 ${err ? "ring-red-500" : "ring-white/10"}`}
        rows={6}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setErr(null);
          } catch {
            setErr("Invalid JSON");
          }
        }}
      />
      {err && <span className="text-xs text-red-400">{err}</span>}
    </div>
  );
}

// ── Search + count bar ────────────────────────────────────────────────────────
function SearchBar({
  value, onChange, placeholder, count, right,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  count: number;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          className="w-full rounded-lg bg-white/5 py-2 pl-8 pr-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30 placeholder-white/25"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {right}
      <span className="shrink-0 text-xs text-white/40">{count} rows</span>
    </div>
  );
}

// ── Language pill ─────────────────────────────────────────────────────────────
function LangPill({ lang }: { lang: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
      style={{ background: `${HEX.violet}22`, color: HEX.violet, border: `1px solid ${HEX.violet}44` }}
    >
      {lang}
    </span>
  );
}

// ── Coverage banner ───────────────────────────────────────────────────────
function CoverageBanner({
  label,
  rows,
  accent,
  showUnreviewedOnly,
  onToggleFilter,
}: {
  label: string;
  rows: { source: string }[];
  accent: string;
  showUnreviewedOnly: boolean;
  onToggleFilter: () => void;
}) {
  const total = rows.length;
  const reviewed = rows.filter((r) => r.source === "admin").length;
  const unreviewed = total - reviewed;
  const pct = total === 0 ? 100 : Math.round((reviewed / total) * 100);
  const allDone = unreviewed === 0;

  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center gap-4"
      style={{
        background: allDone ? `${HEX.green}11` : `${HEX.amber}11`,
        border: `1px solid ${allDone ? HEX.green : HEX.amber}33`,
      }}
      data-testid="coverage-banner"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {allDone
            ? <CheckCircle2 size={14} style={{ color: HEX.green }} />
            : <AlertCircle size={14} style={{ color: HEX.amber }} />}
          <span className="text-xs font-bold" style={{ color: allDone ? HEX.green : HEX.amber }}>
            {reviewed} of {total} {label} reviewed
          </span>
          {unreviewed > 0 && (
            <span className="text-xs text-white/40">
              — {unreviewed} seed-only
            </span>
          )}
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: allDone ? HEX.green : HEX.amber,
            }}
          />
        </div>
      </div>
      {unreviewed > 0 && (
        <button
          data-testid="filter-unreviewed-btn"
          onClick={onToggleFilter}
          className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all"
          style={{
            background: showUnreviewedOnly ? `${HEX.amber}33` : "rgba(255,255,255,0.05)",
            color: showUnreviewedOnly ? HEX.amber : "rgba(255,255,255,0.40)",
            border: `1px solid ${showUnreviewedOnly ? HEX.amber : "rgba(255,255,255,0.10)"}`,
          }}
        >
          <Filter size={11} />
          {showUnreviewedOnly ? "All rows" : "Unreviewed"}
        </button>
      )}
    </div>
  );
}

// ── Coverage by Subject panel ─────────────────────────────────────────────
function SubjectBreakdownPanel({
  rows,
  accent,
  onSelectSubject,
}: {
  rows: { subjectName: string; source: string }[];
  accent: string;
  onSelectSubject: (subject: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const bySubject = useMemo(() => {
    const map = new Map<string, { total: number; reviewed: number }>();
    for (const r of rows) {
      const name = r.subjectName ?? "Unknown";
      const existing = map.get(name) ?? { total: 0, reviewed: 0 };
      map.set(name, {
        total: existing.total + 1,
        reviewed: existing.reviewed + (r.source === "admin" ? 1 : 0),
      });
    }
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats, unreviewed: stats.total - stats.reviewed }))
      .sort((a, b) => b.unreviewed - a.unreviewed || a.name.localeCompare(b.name));
  }, [rows]);

  if (bySubject.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors"
        style={{ color: open ? accent : "rgba(255,255,255,0.35)" }}
        data-testid="coverage-by-subject-toggle"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        Coverage by Subject
      </button>

      {open && (
        <div
          className="mt-2 rounded-xl overflow-hidden"
          style={{ border: `1px solid ${accent}22`, background: `${accent}08` }}
          data-testid="coverage-by-subject-panel"
        >
          <div className="px-4 py-2 border-b border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              {bySubject.length} subjects · click name to filter
            </span>
          </div>
          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
            {bySubject.map(({ name, total, reviewed, unreviewed }) => {
              const pct = total === 0 ? 100 : Math.round((reviewed / total) * 100);
              const allDone = unreviewed === 0;
              return (
                <div key={name} className="flex items-center gap-3 px-4 py-2">
                  <button
                    className="text-xs font-semibold text-left truncate flex-1 hover:underline transition-colors min-w-0"
                    style={{ color: accent }}
                    onClick={() => onSelectSubject(name)}
                    title={`Filter by ${name}`}
                    data-testid={`subject-filter-${name}`}
                  >
                    {name}
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-white/40 w-20 text-right">
                      {reviewed} / {total}
                    </span>
                    <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, background: allDone ? HEX.green : accent }}
                      />
                    </div>
                    <span
                      className="text-[10px] w-8 text-right"
                      style={{ color: allDone ? HEX.green : "rgba(255,255,255,0.35)" }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bulk Import result type ───────────────────────────────────────────────
interface BulkImportResult {
  created: number;
  updated: number;
  errored: number;
  errors: { index: number; reason: string }[];
}

// ── Bulk Import Panel ─────────────────────────────────────────────────────
const NOTES_SCHEMA_HINT = `[
  {
    "topicId": 42,
    "language": "en",
    "summary": "Topic summary text",
    "keyConcepts": [{"term": "Osmosis", "definition": "Movement of water..."}],
    "workedExamples": [{"title": "Example 1", "steps": ["Step 1", "Step 2"]}]
  }
]`;

const FLASHCARDS_SCHEMA_HINT = `[
  {
    "topicId": 42,
    "language": "en",
    "front": "What is osmosis?",
    "back": "The movement of water through a semi-permeable membrane.",
    "cardType": "definition",
    "orderIndex": 0
  }
]`;

function BulkImportPanel({
  type,
  accent,
  onImported,
}: {
  type: "notes" | "flashcards";
  accent: string;
  onImported: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  const endpoint =
    type === "notes"
      ? "/api/admin/topic-notes/bulk-import"
      : "/api/admin/topic-flashcards/bulk-import";

  const schemaHint = type === "notes" ? NOTES_SCHEMA_HINT : FLASHCARDS_SCHEMA_HINT;

  const importMutation = useMutation({
    mutationFn: async (items: unknown[]) => {
      const r = await apiRequest("POST", endpoint, { items });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      return r.json() as Promise<BulkImportResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      onImported();
      if (data.errored === 0) {
        toast({ title: `Bulk import complete — ${data.created} created, ${data.updated} updated` });
      } else {
        toast({
          title: `Import finished with ${data.errored} error(s)`,
          description: `${data.created} created, ${data.updated} updated`,
          variant: "destructive",
        });
      }
    },
    onError: (e: Error) => toast({ title: "Import failed", description: e.message, variant: "destructive" }),
  });

  function handleImport() {
    setParseError(null);
    setResult(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e: any) {
      setParseError("Invalid JSON — " + e.message);
      return;
    }
    if (!Array.isArray(parsed)) {
      setParseError("JSON must be an array of objects");
      return;
    }
    importMutation.mutate(parsed as unknown[]);
  }

  return (
    <div>
      <button
        data-testid={`bulk-import-toggle-${type}`}
        onClick={() => { setOpen((v) => !v); setResult(null); setParseError(null); }}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors"
        style={{ color: open ? accent : "rgba(255,255,255,0.35)" }}
      >
        <Upload size={13} />
        Bulk Import
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <GlowCard accent={accent}>
          <p className="mb-1 text-sm font-bold" style={{ color: accent }}>
            Bulk Import — {type === "notes" ? "Topic Notes" : "Flashcards"}
          </p>
          <p className="mb-3 text-xs text-white/40">
            Paste a JSON array. Notes upsert on <code className="text-white/60">(topicId, language)</code>.
            Flashcards insert new rows; include <code className="text-white/60">"id"</code> to update existing ones.
            Max 500 items per batch.
          </p>

          <div className="mb-2 flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Schema example (click to copy)
            </label>
            <pre
              className="cursor-pointer rounded-lg bg-white/5 p-3 text-[10px] text-white/40 ring-1 ring-white/10 hover:text-white/60 transition-colors overflow-x-auto"
              onClick={() => { setRaw(schemaHint); setParseError(null); setResult(null); }}
              title="Click to copy example into editor"
            >
              {schemaHint}
            </pre>
          </div>

          <div className="flex flex-col gap-1 mb-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              JSON Payload
            </label>
            <textarea
              data-testid={`bulk-import-textarea-${type}`}
              className={`w-full resize-y rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-white outline-none ring-1 focus:ring-white/30 ${parseError ? "ring-red-500" : "ring-white/10"}`}
              rows={10}
              value={raw}
              placeholder={`Paste JSON array here…`}
              onChange={(e) => { setRaw(e.target.value); setParseError(null); }}
            />
            {parseError && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={12} /> {parseError}
              </div>
            )}
          </div>

          {result && (
            <div
              className="mb-3 rounded-lg p-3 text-xs"
              style={{
                background: result.errored > 0 ? "#ff444422" : "#34d39922",
                border: `1px solid ${result.errored > 0 ? "#ff4444" : "#34d399"}44`,
              }}
            >
              <div className="flex items-center gap-2 font-bold mb-1" style={{ color: result.errored > 0 ? "#ff6060" : "#34d399" }}>
                {result.errored > 0 ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                {result.errored > 0 ? "Import completed with errors" : "Import successful"}
              </div>
              <div className="flex gap-4 text-white/60">
                <span><span className="text-green-400 font-bold">{result.created}</span> created</span>
                <span><span className="text-amber-400 font-bold">{result.updated}</span> updated</span>
                <span><span className="text-red-400 font-bold">{result.errored}</span> errored</span>
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-red-300/80">
                  {result.errors.slice(0, 10).map((e) => (
                    <li key={e.index}>Item [{e.index}]: {e.reason}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li className="text-white/40">…and {result.errors.length - 10} more</li>
                  )}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              size="sm"
              data-testid={`bulk-import-submit-${type}`}
              style={{ background: `${accent}33`, color: accent, border: `1px solid ${accent}55` }}
              onClick={handleImport}
              disabled={importMutation.isPending || !raw.trim()}
            >
              {importMutation.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : <Upload size={12} className="mr-1" />}
              Import
            </Button>
          </div>
        </GlowCard>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Topic Notes Tab
// ────────────────────────────────────────────────────────────────────────────
function TopicNotesTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showUnreviewedOnly, setShowUnreviewedOnly] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<NoteDraft>({ summary: "", keyConcepts: [], workedExamples: [] });
  const [creating, setCreating] = useState(false);
  const [newNote, setNewNote] = useState<NewTopicNote>({ topicId: "", language: "en", summary: "", keyConcepts: "[]", workedExamples: "[]" });

  const { data: rows = [], isLoading } = useQuery<TopicNoteRow[]>({
    queryKey: ["/api/admin/topic-notes"],
    queryFn: () => apiRequest("GET", "/api/admin/topic-notes").then((r) => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: NoteDraft }) =>
      apiRequest("PUT", `/api/admin/topic-notes/${id}`, body).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Topic note saved" });
      qc.invalidateQueries({ queryKey: ["/api/admin/topic-notes"] });
      setEditingId(null);
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/admin/topic-notes/${id}`).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Topic note deleted" });
      qc.invalidateQueries({ queryKey: ["/api/admin/topic-notes"] });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest("POST", "/api/admin/topic-notes", body).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Topic note created" });
      qc.invalidateQueries({ queryKey: ["/api/admin/topic-notes"] });
      setCreating(false);
      setNewNote({ topicId: "", language: "en", summary: "", keyConcepts: "[]", workedExamples: "[]" });
    },
    onError: (e: Error) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (!q || r.subjectName?.toLowerCase().includes(q) || r.topicName?.toLowerCase().includes(q)) &&
        (!showUnreviewedOnly || r.source !== "admin"),
    );
  }, [rows, search, showUnreviewedOnly]);

  function startEdit(row: TopicNoteRow) {
    setDraft({ summary: row.summary ?? "", keyConcepts: row.keyConcepts ?? [], workedExamples: row.workedExamples ?? [] });
    setEditingId(row.id);
  }

  function submitCreate() {
    let keyConcepts: unknown;
    let workedExamples: unknown;
    try { keyConcepts = JSON.parse(newNote.keyConcepts); } catch { keyConcepts = []; }
    try { workedExamples = JSON.parse(newNote.workedExamples); } catch { workedExamples = []; }
    createMutation.mutate({
      topicId: Number(newNote.topicId),
      language: newNote.language,
      summary: newNote.summary,
      keyConcepts,
      workedExamples,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-white/40" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CoverageBanner
        label="topic notes"
        rows={rows}
        accent={HEX.cyan}
        showUnreviewedOnly={showUnreviewedOnly}
        onToggleFilter={() => setShowUnreviewedOnly((v) => !v)}
      />
      <SubjectBreakdownPanel
        rows={rows}
        accent={HEX.cyan}
        onSelectSubject={(name) => { setSearch(name); setShowUnreviewedOnly(false); }}
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Filter by subject or topic…"
        count={filtered.length}
        right={
          <div className="flex items-center gap-2 shrink-0">
            <BulkImportPanel
              type="notes"
              accent={HEX.cyan}
              onImported={() => qc.invalidateQueries({ queryKey: ["/api/admin/topic-notes"] })}
            />
            <Button
              size="sm"
              style={{ background: `${HEX.amber}22`, color: HEX.amber, border: `1px solid ${HEX.amber}55` }}
              onClick={() =>
                downloadUnreviewedCsv("/api/admin/topic-notes/export", "topic-notes-unreviewed.csv").catch((e) =>
                  toast({ title: "Export failed", description: e.message, variant: "destructive" }),
                )
              }
              data-testid="export-unreviewed-notes-btn"
              title="Download CSV of all seed-only (unreviewed) topic notes"
            >
              <Download size={14} />
              Export unreviewed
            </Button>
            <Button
              size="sm"
              style={{ background: `${HEX.cyan}33`, color: HEX.cyan, border: `1px solid ${HEX.cyan}55` }}
              onClick={() => setCreating((v) => !v)}
              data-testid="create-note-btn"
            >
              <Plus size={14} />
              Add note
            </Button>
          </div>
        }
      />

      {creating && (
        <GlowCard accent={HEX.green}>
          <p className="mb-4 text-sm font-bold text-white/70">New Topic Note</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Topic ID</label>
                <input
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                  placeholder="e.g. 42"
                  value={newNote.topicId}
                  onChange={(e) => setNewNote((n) => ({ ...n, topicId: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1 w-24">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Language</label>
                <select
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                  value={newNote.language}
                  onChange={(e) => setNewNote((n) => ({ ...n, language: e.target.value }))}
                >
                  <option value="en">en</option>
                  <option value="af">af</option>
                </select>
              </div>
            </div>
            <Field label="Summary" value={newNote.summary} rows={3} onChange={(v) => setNewNote((n) => ({ ...n, summary: v }))} />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Key Concepts (JSON array)</label>
              <textarea
                className="w-full resize-y rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                rows={3}
                value={newNote.keyConcepts}
                onChange={(e) => setNewNote((n) => ({ ...n, keyConcepts: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Worked Examples (JSON array)</label>
              <textarea
                className="w-full resize-y rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                rows={3}
                value={newNote.workedExamples}
                onChange={(e) => setNewNote((n) => ({ ...n, workedExamples: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setCreating(false)}>Cancel</Button>
              <Button
                size="sm"
                style={{ background: `${HEX.green}33`, color: HEX.green, border: `1px solid ${HEX.green}55` }}
                onClick={submitCreate}
                disabled={createMutation.isPending || !newNote.topicId}
                data-testid="save-new-note-btn"
              >
                {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Create
              </Button>
            </div>
          </div>
        </GlowCard>
      )}

      {filtered.map((row) => (
        <GlowCard key={row.id} accent={editingId === row.id ? HEX.amber : HEX.cyan}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{row.subjectName}</span>
                <span className="text-white/30">›</span>
                <span className="text-sm font-semibold text-white truncate">{row.topicName}</span>
                <LangPill lang={row.language} />
                <SourceBadge source={row.source} />
              </div>
              {editingId !== row.id && (
                <p className="line-clamp-2 text-xs text-white/50 mt-1">{row.summary || <em>No summary</em>}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {editingId === row.id ? (
                <>
                  <Button size="sm" variant="ghost" className="text-white/50 hover:text-white" onClick={() => setEditingId(null)} disabled={updateMutation.isPending}>
                    <X size={14} />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
                    onClick={() => updateMutation.mutate({ id: row.id, body: draft })}
                    disabled={updateMutation.isPending}
                    data-testid={`save-note-${row.id}`}
                  >
                    {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" className="text-white/40 hover:text-white" onClick={() => startEdit(row)} data-testid={`edit-note-${row.id}`}>
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="text-red-500/50 hover:text-red-400"
                    onClick={() => deleteMutation.mutate(row.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`delete-note-${row.id}`}
                  >
                    <Trash2 size={13} />
                  </Button>
                </>
              )}
            </div>
          </div>

          {editingId === row.id && (
            <div className="mt-4 flex flex-col gap-4">
              <Field
                label="Summary"
                rows={4}
                value={draft.summary}
                onChange={(v) => setDraft((d) => ({ ...d, summary: v }))}
              />
              <JsonField
                label="Key Concepts (JSON array)"
                value={draft.keyConcepts}
                onChange={(v) => setDraft((d) => ({ ...d, keyConcepts: v }))}
              />
              <JsonField
                label="Worked Examples (JSON array)"
                value={draft.workedExamples}
                onChange={(v) => setDraft((d) => ({ ...d, workedExamples: v }))}
              />
            </div>
          )}
        </GlowCard>
      ))}

      {filtered.length === 0 && !creating && (
        <div className="py-16 text-center text-white/30 text-sm">No topic notes found.</div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Topic Flashcards Tab
// ────────────────────────────────────────────────────────────────────────────
function TopicFlashcardsTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showUnreviewedOnly, setShowUnreviewedOnly] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<FlashcardDraft>({ front: "", back: "", cardType: "concept", orderIndex: 0 });
  const [creating, setCreating] = useState(false);
  const [newCard, setNewCard] = useState<NewFlashcard>({ topicId: "", language: "en", front: "", back: "", cardType: "concept", orderIndex: 0 });

  const { data: rows = [], isLoading } = useQuery<TopicFlashcardRow[]>({
    queryKey: ["/api/admin/topic-flashcards"],
    queryFn: () => apiRequest("GET", "/api/admin/topic-flashcards").then((r) => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: FlashcardDraft }) =>
      apiRequest("PUT", `/api/admin/topic-flashcards/${id}`, body).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Flashcard saved" });
      qc.invalidateQueries({ queryKey: ["/api/admin/topic-flashcards"] });
      setEditingId(null);
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/admin/topic-flashcards/${id}`).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Flashcard deleted" });
      qc.invalidateQueries({ queryKey: ["/api/admin/topic-flashcards"] });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: (body: NewFlashcard) =>
      apiRequest("POST", "/api/admin/topic-flashcards", body).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Flashcard created" });
      qc.invalidateQueries({ queryKey: ["/api/admin/topic-flashcards"] });
      setCreating(false);
      setNewCard({ topicId: "", language: "en", front: "", back: "", cardType: "concept", orderIndex: 0 });
    },
    onError: (e: Error) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (!q ||
          r.subjectName?.toLowerCase().includes(q) ||
          r.topicName?.toLowerCase().includes(q) ||
          r.front?.toLowerCase().includes(q)) &&
        (!showUnreviewedOnly || r.source !== "admin"),
    );
  }, [rows, search, showUnreviewedOnly]);

  function startEdit(row: TopicFlashcardRow) {
    setDraft({ front: row.front, back: row.back, cardType: row.cardType, orderIndex: row.orderIndex });
    setEditingId(row.id);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-white/40" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CoverageBanner
        label="flashcards"
        rows={rows}
        accent={HEX.violet}
        showUnreviewedOnly={showUnreviewedOnly}
        onToggleFilter={() => setShowUnreviewedOnly((v) => !v)}
      />
      <SubjectBreakdownPanel
        rows={rows}
        accent={HEX.violet}
        onSelectSubject={(name) => { setSearch(name); setShowUnreviewedOnly(false); }}
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Filter by subject, topic or question…"
        count={filtered.length}
        right={
          <div className="flex items-center gap-2 shrink-0">
            <BulkImportPanel
              type="flashcards"
              accent={HEX.violet}
              onImported={() => qc.invalidateQueries({ queryKey: ["/api/admin/topic-flashcards"] })}
            />
            <Button
              size="sm"
              style={{ background: `${HEX.amber}22`, color: HEX.amber, border: `1px solid ${HEX.amber}55` }}
              onClick={() =>
                downloadUnreviewedCsv("/api/admin/topic-flashcards/export", "topic-flashcards-unreviewed.csv").catch((e) =>
                  toast({ title: "Export failed", description: e.message, variant: "destructive" }),
                )
              }
              data-testid="export-unreviewed-flashcards-btn"
              title="Download CSV of all seed-only (unreviewed) flashcards"
            >
              <Download size={14} />
              Export unreviewed
            </Button>
            <Button
              size="sm"
              style={{ background: `${HEX.violet}33`, color: HEX.violet, border: `1px solid ${HEX.violet}55` }}
              onClick={() => setCreating((v) => !v)}
              data-testid="create-flashcard-btn"
            >
              <Plus size={14} />
              Add card
            </Button>
          </div>
        }
      />

      {creating && (
        <GlowCard accent={HEX.green}>
          <p className="mb-4 text-sm font-bold text-white/70">New Flashcard</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Topic ID</label>
                <input
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                  placeholder="e.g. 42"
                  value={newCard.topicId}
                  onChange={(e) => setNewCard((c) => ({ ...c, topicId: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1 w-24">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Language</label>
                <select
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                  value={newCard.language}
                  onChange={(e) => setNewCard((c) => ({ ...c, language: e.target.value }))}
                >
                  <option value="en">en</option>
                  <option value="af">af</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 w-28">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Type</label>
                <select
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                  value={newCard.cardType}
                  onChange={(e) => setNewCard((c) => ({ ...c, cardType: e.target.value }))}
                >
                  <option value="concept">concept</option>
                  <option value="formula">formula</option>
                  <option value="definition">definition</option>
                  <option value="example">example</option>
                </select>
              </div>
            </div>
            <Field label="Front (question / prompt)" value={newCard.front} rows={2} onChange={(v) => setNewCard((c) => ({ ...c, front: v }))} />
            <Field label="Back (answer / explanation)" value={newCard.back} rows={3} onChange={(v) => setNewCard((c) => ({ ...c, back: v }))} />
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setCreating(false)}>Cancel</Button>
              <Button
                size="sm"
                style={{ background: `${HEX.green}33`, color: HEX.green, border: `1px solid ${HEX.green}55` }}
                onClick={() => createMutation.mutate(newCard)}
                disabled={createMutation.isPending || !newCard.topicId || !newCard.front || !newCard.back}
                data-testid="save-new-flashcard-btn"
              >
                {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Create
              </Button>
            </div>
          </div>
        </GlowCard>
      )}

      {filtered.map((row) => (
        <GlowCard key={row.id} accent={editingId === row.id ? HEX.amber : HEX.violet}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{row.subjectName}</span>
                <span className="text-white/30">›</span>
                <span className="text-sm font-semibold text-white">{row.topicName}</span>
                <LangPill lang={row.language} />
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: `${HEX.cyan}11`, color: HEX.cyan, border: `1px solid ${HEX.cyan}33` }}
                >
                  {row.cardType}
                </span>
                <SourceBadge source={row.source} />
              </div>
              {editingId !== row.id && (
                <p className="line-clamp-1 text-xs text-white/60 mt-1">
                  <span className="text-white/40 mr-1">Q:</span>{row.front}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {editingId === row.id ? (
                <>
                  <Button size="sm" variant="ghost" className="text-white/50 hover:text-white" onClick={() => setEditingId(null)} disabled={updateMutation.isPending}>
                    <X size={14} />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
                    onClick={() => updateMutation.mutate({ id: row.id, body: draft })}
                    disabled={updateMutation.isPending}
                    data-testid={`save-card-${row.id}`}
                  >
                    {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" className="text-white/40 hover:text-white" onClick={() => startEdit(row)} data-testid={`edit-card-${row.id}`}>
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="text-red-500/50 hover:text-red-400"
                    onClick={() => deleteMutation.mutate(row.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`delete-card-${row.id}`}
                  >
                    <Trash2 size={13} />
                  </Button>
                </>
              )}
            </div>
          </div>

          {editingId === row.id && (
            <div className="mt-4 flex flex-col gap-4">
              <Field label="Front (question / prompt)" value={draft.front} rows={2} onChange={(v) => setDraft((d) => ({ ...d, front: v }))} />
              <Field label="Back (answer / explanation)" value={draft.back} rows={3} onChange={(v) => setDraft((d) => ({ ...d, back: v }))} />
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Card Type</label>
                  <select
                    className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                    value={draft.cardType}
                    onChange={(e) => setDraft((d) => ({ ...d, cardType: e.target.value }))}
                  >
                    <option value="concept">concept</option>
                    <option value="formula">formula</option>
                    <option value="definition">definition</option>
                    <option value="example">example</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 w-24">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Order</label>
                  <input
                    type="number"
                    className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                    value={draft.orderIndex}
                    onChange={(e) => setDraft((d) => ({ ...d, orderIndex: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          )}
        </GlowCard>
      ))}

      {filtered.length === 0 && !creating && (
        <div className="py-16 text-center text-white/30 text-sm">No flashcards found.</div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Literature Notes Tab
// ────────────────────────────────────────────────────────────────────────────
function LiteratureNotesTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showUnreviewedOnly, setShowUnreviewedOnly] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<LitNoteDraft>({ summary: "", themes: [], characters: [], literaryDevices: [], essayFrameworks: [] });
  const [creating, setCreating] = useState(false);
  const [newNote, setNewNote] = useState<NewLitNote>({ workId: "", language: "en", summary: "" });

  const { data: rows = [], isLoading } = useQuery<LiteratureNoteRow[]>({
    queryKey: ["/api/admin/literature-notes"],
    queryFn: () => apiRequest("GET", "/api/admin/literature-notes").then((r) => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: LitNoteDraft }) =>
      apiRequest("PUT", `/api/admin/literature-notes/${id}`, body).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Literature note saved" });
      qc.invalidateQueries({ queryKey: ["/api/admin/literature-notes"] });
      setEditingId(null);
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/admin/literature-notes/${id}`).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Literature note deleted" });
      qc.invalidateQueries({ queryKey: ["/api/admin/literature-notes"] });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: (body: NewLitNote) =>
      apiRequest("POST", "/api/admin/literature-notes", body).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Literature note created" });
      qc.invalidateQueries({ queryKey: ["/api/admin/literature-notes"] });
      setCreating(false);
      setNewNote({ workId: "", language: "en", summary: "" });
    },
    onError: (e: Error) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (!q ||
          r.workTitle?.toLowerCase().includes(q) ||
          r.author?.toLowerCase().includes(q) ||
          r.subjectName?.toLowerCase().includes(q)) &&
        (!showUnreviewedOnly || r.source !== "admin"),
    );
  }, [rows, search, showUnreviewedOnly]);

  function startEdit(row: LiteratureNoteRow) {
    setDraft({
      summary: row.summary ?? "",
      themes: row.themes ?? [],
      characters: row.characters ?? [],
      literaryDevices: row.literaryDevices ?? [],
      essayFrameworks: row.essayFrameworks ?? [],
    });
    setEditingId(row.id);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-white/40" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CoverageBanner
        label="literature notes"
        rows={rows}
        accent={HEX.pink}
        showUnreviewedOnly={showUnreviewedOnly}
        onToggleFilter={() => setShowUnreviewedOnly((v) => !v)}
      />
      <SubjectBreakdownPanel
        rows={rows}
        accent={HEX.pink}
        onSelectSubject={(name) => { setSearch(name); setShowUnreviewedOnly(false); }}
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Filter by subject, title or author…"
        count={filtered.length}
        right={
          <Button
            size="sm"
            className="shrink-0"
            style={{ background: `${HEX.pink}33`, color: HEX.pink, border: `1px solid ${HEX.pink}55` }}
            onClick={() => setCreating((v) => !v)}
            data-testid="create-lit-note-btn"
          >
            <Plus size={14} />
            Add note
          </Button>
        }
      />

      {creating && (
        <GlowCard accent={HEX.green}>
          <p className="mb-4 text-sm font-bold text-white/70">New Literature Note</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Work ID</label>
                <input
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                  placeholder="e.g. 5"
                  value={newNote.workId}
                  onChange={(e) => setNewNote((n) => ({ ...n, workId: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1 w-24">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Language</label>
                <select
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
                  value={newNote.language}
                  onChange={(e) => setNewNote((n) => ({ ...n, language: e.target.value }))}
                >
                  <option value="en">en</option>
                  <option value="af">af</option>
                </select>
              </div>
            </div>
            <Field label="Summary" value={newNote.summary} rows={3} onChange={(v) => setNewNote((n) => ({ ...n, summary: v }))} />
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setCreating(false)}>Cancel</Button>
              <Button
                size="sm"
                style={{ background: `${HEX.green}33`, color: HEX.green, border: `1px solid ${HEX.green}55` }}
                onClick={() => createMutation.mutate(newNote)}
                disabled={createMutation.isPending || !newNote.workId}
                data-testid="save-new-lit-note-btn"
              >
                {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Create
              </Button>
            </div>
          </div>
        </GlowCard>
      )}

      {filtered.map((row) => (
        <GlowCard key={row.id} accent={editingId === row.id ? HEX.amber : HEX.pink}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{row.workTitle}</span>
                <span className="text-xs text-white/40">by {row.author}</span>
                <LangPill lang={row.language} />
                <SourceBadge source={row.source} />
              </div>
              {editingId !== row.id && (
                <p className="line-clamp-2 text-xs text-white/50 mt-1">{row.summary || <em>No summary</em>}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {editingId === row.id ? (
                <>
                  <Button size="sm" variant="ghost" className="text-white/50 hover:text-white" onClick={() => setEditingId(null)} disabled={updateMutation.isPending}>
                    <X size={14} />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
                    onClick={() => updateMutation.mutate({ id: row.id, body: draft })}
                    disabled={updateMutation.isPending}
                    data-testid={`save-lit-${row.id}`}
                  >
                    {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" className="text-white/40 hover:text-white" onClick={() => startEdit(row)} data-testid={`edit-lit-${row.id}`}>
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="text-red-500/50 hover:text-red-400"
                    onClick={() => deleteMutation.mutate(row.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`delete-lit-${row.id}`}
                  >
                    <Trash2 size={13} />
                  </Button>
                </>
              )}
            </div>
          </div>

          {editingId === row.id && (
            <div className="mt-4 flex flex-col gap-4">
              <Field label="Summary" rows={4} value={draft.summary} onChange={(v) => setDraft((d) => ({ ...d, summary: v }))} />
              <JsonField label="Themes (JSON array)" value={draft.themes} onChange={(v) => setDraft((d) => ({ ...d, themes: v }))} />
              <JsonField label="Characters (JSON array)" value={draft.characters} onChange={(v) => setDraft((d) => ({ ...d, characters: v }))} />
              <JsonField label="Literary Devices (JSON array)" value={draft.literaryDevices} onChange={(v) => setDraft((d) => ({ ...d, literaryDevices: v }))} />
              <JsonField label="Essay Frameworks (JSON array)" value={draft.essayFrameworks} onChange={(v) => setDraft((d) => ({ ...d, essayFrameworks: v }))} />
            </div>
          )}
        </GlowCard>
      ))}

      {filtered.length === 0 && !creating && (
        <div className="py-16 text-center text-white/30 text-sm">No literature notes found.</div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────────────
type Tab = "notes" | "flashcards" | "literature";

const TABS: { id: Tab; label: string; labelAf: string; icon: React.ReactNode; accent: string }[] = [
  { id: "notes",      label: "Topic Notes",      labelAf: "Onderwerpnotas",     icon: <BookOpen size={15} />,   accent: HEX.cyan },
  { id: "flashcards", label: "Flashcards",        labelAf: "Flitskaarte",        icon: <Layers size={15} />,     accent: HEX.violet },
  { id: "literature", label: "Literature Notes",  labelAf: "Literatuurnotas",    icon: <BookMarked size={15} />, accent: HEX.pink },
];

export default function AdminContentEditorPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const [tab, setTab] = useState<Tab>("notes");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <AdminTopNav current="content-editor" />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">
            {isAf ? "Inhoudsredigeerder" : "Content Editor"}
          </h2>
          <p className="mt-1 text-sm text-white/40">
            {isAf
              ? "Wysig onderwerpnotas, flitskaarte en literatuurnotas. Wysigings word geskryf met source = 'admin' sodat die saad dit nie oorskyf nie."
              : "Edit topic notes, flashcards and literature notes. Changes are written with source = 'admin' so the seeder won't overwrite them."}
          </p>
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all"
              style={{
                color: tab === t.id ? t.accent : "rgba(255,255,255,0.35)",
                borderBottom: tab === t.id ? `2px solid ${t.accent}` : "2px solid transparent",
              }}
            >
              {t.icon}
              {isAf ? t.labelAf : t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "notes"      && <TopicNotesTab />}
        {tab === "flashcards" && <TopicFlashcardsTab />}
        {tab === "literature" && <LiteratureNotesTab />}
      </main>
    </div>
  );
}
