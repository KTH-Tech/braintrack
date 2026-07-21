import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AdminTopNav } from "@/components/admin-top-nav";
import { AdminGround, NeonShell, AdminBadge, adminSelectClass, adminSelectStyle, adminInputClass, adminInputStyle, adminTextareaClass, adminTextareaStyle, type NeonHex } from "@/components/admin-ui";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import {
  BookOpen, Layers, BookMarked, Search,
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
  cyan: "#9FF5E8",
  violet: "#C5B3FF",
  pink: "#FFB7E5",
  amber: "#FFE29A",
  mint: "#94F7C5",
} as const;

// ── Source badge ─────────────────────────────────────────────────────────────
// (thin wrapper around the shared AdminBadge — was a bespoke inline pill)
function SourceBadge({ source }: { source: string }) {
  const isAdmin = source === "admin";
  return <AdminBadge color={isAdmin ? HEX.pink : HEX.cyan}>{source}</AdminBadge>;
}

// ── Plain textarea ────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white">{label}</label>
      <textarea
        className={adminTextareaClass} style={adminTextareaStyle}
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
      <label className="text-[10px] font-bold uppercase tracking-widest text-white">{label}</label>
      <textarea
        className={`${adminTextareaClass} font-mono`} style={{ ...adminTextareaStyle, borderColor: err ? "#FFB7E5" : undefined }}
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
      {err && <span className="text-xs text-[#FFB7E5]">{err}</span>}
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
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
        <input
          className={`${adminInputClass} pl-8`} style={adminInputStyle}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {right}
      <span className="shrink-0 text-xs text-white">{count} rows</span>
    </div>
  );
}

// ── Language pill ─────────────────────────────────────────────────────────────
// (thin wrapper around the shared AdminBadge — was a bespoke inline pill)
function LangPill({ lang }: { lang: string }) {
  return <AdminBadge color={HEX.violet}>{lang}</AdminBadge>;
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
        background: allDone ? `${HEX.mint}11` : `${HEX.amber}11`,
        border: `1px solid ${allDone ? HEX.mint : HEX.amber}33`,
      }}
      data-testid="coverage-banner"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {allDone
            ? <CheckCircle2 size={14} style={{ color: HEX.mint }} />
            : <AlertCircle size={14} style={{ color: HEX.amber }} />}
          <span className="text-xs font-bold" style={{ color: allDone ? HEX.mint : HEX.amber }}>
            {reviewed} of {total} {label} reviewed
          </span>
          {unreviewed > 0 && (
            <span className="text-xs text-white">
              — {unreviewed} seed-only
            </span>
          )}
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: allDone ? HEX.mint : HEX.amber,
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
            color: showUnreviewedOnly ? HEX.amber : "#fff",
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
        style={{ color: open ? accent : "#fff" }}
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
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
                    <span className="text-[10px] text-white w-20 text-right">
                      {reviewed} / {total}
                    </span>
                    <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, background: allDone ? HEX.mint : accent }}
                      />
                    </div>
                    <span
                      className="text-[10px] w-8 text-right"
                      style={{ color: allDone ? HEX.mint : "#fff" }}
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
  accent: NeonHex;
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
        style={{ color: open ? accent : "#fff" }}
      >
        <Upload size={13} />
        Bulk Import
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <NeonShell color={accent} className="p-5">
          <p className="mb-1 text-sm font-bold" style={{ color: accent }}>
            Bulk Import — {type === "notes" ? "Topic Notes" : "Flashcards"}
          </p>
          <p className="mb-3 text-xs text-white">
            Paste a JSON array. Notes upsert on <code className="text-white">(topicId, language)</code>.
            Flashcards insert new rows; include <code className="text-white">"id"</code> to update existing ones.
            Max 500 items per batch.
          </p>

          <div className="mb-2 flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white">
              Schema example (click to copy)
            </label>
            <pre
              className="cursor-pointer rounded-lg bg-white/5 p-3 text-[10px] text-white ring-1 ring-white/10 hover:text-white transition-colors overflow-x-auto"
              onClick={() => { setRaw(schemaHint); setParseError(null); setResult(null); }}
              title="Click to copy example into editor"
            >
              {schemaHint}
            </pre>
          </div>

          <div className="flex flex-col gap-1 mb-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white">
              JSON Payload
            </label>
            <textarea
              data-testid={`bulk-import-textarea-${type}`}
              className={`${adminTextareaClass} font-mono`} style={{ ...adminTextareaStyle, borderColor: parseError ? "#FFB7E5" : undefined }}
              rows={10}
              value={raw}
              placeholder={`Paste JSON array here…`}
              onChange={(e) => { setRaw(e.target.value); setParseError(null); }}
            />
            {parseError && (
              <div className="flex items-center gap-1.5 text-xs text-[#FFB7E5]">
                <AlertCircle size={12} /> {parseError}
              </div>
            )}
          </div>

          {result && (
            <div
              className="mb-3 rounded-lg p-3 text-xs"
              style={{
                background: result.errored > 0 ? "rgba(255,183,229,0.13)" : `${HEX.mint}22`,
                border: `1px solid ${result.errored > 0 ? "#FFB7E5" : HEX.mint}44`,
              }}
            >
              <div className="flex items-center gap-2 font-bold mb-1" style={{ color: result.errored > 0 ? "#FFB7E5" : HEX.mint }}>
                {result.errored > 0 ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                {result.errored > 0 ? "Import completed with errors" : "Import successful"}
              </div>
              <div className="flex gap-4 text-white">
                <span><span className="font-bold" style={{ color: HEX.mint }}>{result.created}</span> created</span>
                <span><span className="font-bold" style={{ color: HEX.amber }}>{result.updated}</span> updated</span>
                <span><span className="text-[#FFB7E5] font-bold">{result.errored}</span> errored</span>
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-[#FFB7E5]">
                  {result.errors.slice(0, 10).map((e) => (
                    <li key={e.index}>Item [{e.index}]: {e.reason}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li className="text-white">…and {result.errors.length - 10} more</li>
                  )}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="text-white" onClick={() => setOpen(false)}>
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
        </NeonShell>
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
        <Loader2 className="animate-spin text-white" size={32} />
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
        <NeonShell color={HEX.mint} className="p-5">
          <p className="mb-4 text-sm font-bold text-white">New Topic Note</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white">Topic ID</label>
                <input
                  className={adminInputClass} style={adminInputStyle}
                  placeholder="e.g. 42"
                  value={newNote.topicId}
                  onChange={(e) => setNewNote((n) => ({ ...n, topicId: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1 w-24">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white">Language</label>
                <select
                  className={adminSelectClass}
                  style={adminSelectStyle}
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-white">Key Concepts (JSON array)</label>
              <textarea
                className={`${adminTextareaClass} font-mono`} style={adminTextareaStyle}
                rows={3}
                value={newNote.keyConcepts}
                onChange={(e) => setNewNote((n) => ({ ...n, keyConcepts: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white">Worked Examples (JSON array)</label>
              <textarea
                className={`${adminTextareaClass} font-mono`} style={adminTextareaStyle}
                rows={3}
                value={newNote.workedExamples}
                onChange={(e) => setNewNote((n) => ({ ...n, workedExamples: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" className="text-white" onClick={() => setCreating(false)}>Cancel</Button>
              <Button
                size="sm"
                style={{ background: `${HEX.mint}33`, color: HEX.mint, border: `1px solid ${HEX.mint}55` }}
                onClick={submitCreate}
                disabled={createMutation.isPending || !newNote.topicId}
                data-testid="save-new-note-btn"
              >
                {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Create
              </Button>
            </div>
          </div>
        </NeonShell>
      )}

      {filtered.map((row) => (
        <NeonShell key={row.id} color={editingId === row.id ? HEX.amber : HEX.cyan} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white uppercase tracking-widest">{row.subjectName}</span>
                <span className="text-white">›</span>
                <span className="text-sm font-semibold text-white truncate">{row.topicName}</span>
                <LangPill lang={row.language} />
                <SourceBadge source={row.source} />
              </div>
              {editingId !== row.id && (
                <p className="line-clamp-2 text-xs text-white mt-1">{row.summary || <em>No summary</em>}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {editingId === row.id ? (
                <>
                  <Button size="sm" variant="ghost" className="text-white hover:text-white" onClick={() => setEditingId(null)} disabled={updateMutation.isPending}>
                    <X size={14} />
                  </Button>
                  <Button
                    size="sm"
                    style={{ background: `${HEX.amber}22`, color: HEX.amber, border: `1px solid ${HEX.amber}55` }}
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
                  <Button size="sm" variant="ghost" className="text-white hover:text-white" onClick={() => startEdit(row)} data-testid={`edit-note-${row.id}`}>
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="text-[#FFB7E5] hover:text-[#FFB7E5]"
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
        </NeonShell>
      ))}

      {filtered.length === 0 && !creating && (
        <div className="py-16 text-center text-white text-sm">No topic notes found.</div>
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
        <Loader2 className="animate-spin text-white" size={32} />
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
        <NeonShell color={HEX.mint} className="p-5">
          <p className="mb-4 text-sm font-bold text-white">New Flashcard</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white">Topic ID</label>
                <input
                  className={adminInputClass} style={adminInputStyle}
                  placeholder="e.g. 42"
                  value={newCard.topicId}
                  onChange={(e) => setNewCard((c) => ({ ...c, topicId: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1 w-24">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white">Language</label>
                <select
                  className={adminSelectClass}
                  style={adminSelectStyle}
                  value={newCard.language}
                  onChange={(e) => setNewCard((c) => ({ ...c, language: e.target.value }))}
                >
                  <option value="en">en</option>
                  <option value="af">af</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 w-28">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white">Type</label>
                <select
                  className={adminSelectClass}
                  style={adminSelectStyle}
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
              <Button size="sm" variant="ghost" className="text-white" onClick={() => setCreating(false)}>Cancel</Button>
              <Button
                size="sm"
                style={{ background: `${HEX.mint}33`, color: HEX.mint, border: `1px solid ${HEX.mint}55` }}
                onClick={() => createMutation.mutate(newCard)}
                disabled={createMutation.isPending || !newCard.topicId || !newCard.front || !newCard.back}
                data-testid="save-new-flashcard-btn"
              >
                {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Create
              </Button>
            </div>
          </div>
        </NeonShell>
      )}

      {filtered.map((row) => (
        <NeonShell key={row.id} color={editingId === row.id ? HEX.amber : HEX.violet} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white uppercase tracking-widest">{row.subjectName}</span>
                <span className="text-white">›</span>
                <span className="text-sm font-semibold text-white">{row.topicName}</span>
                <LangPill lang={row.language} />
                <AdminBadge color={HEX.cyan}>{row.cardType}</AdminBadge>
                <SourceBadge source={row.source} />
              </div>
              {editingId !== row.id && (
                <p className="line-clamp-1 text-xs text-white mt-1">
                  <span className="text-white mr-1">Q:</span>{row.front}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {editingId === row.id ? (
                <>
                  <Button size="sm" variant="ghost" className="text-white hover:text-white" onClick={() => setEditingId(null)} disabled={updateMutation.isPending}>
                    <X size={14} />
                  </Button>
                  <Button
                    size="sm"
                    style={{ background: `${HEX.amber}22`, color: HEX.amber, border: `1px solid ${HEX.amber}55` }}
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
                  <Button size="sm" variant="ghost" className="text-white hover:text-white" onClick={() => startEdit(row)} data-testid={`edit-card-${row.id}`}>
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="text-[#FFB7E5] hover:text-[#FFB7E5]"
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white">Card Type</label>
                  <select
                    className={adminSelectClass}
                    style={adminSelectStyle}
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white">Order</label>
                  <input
                    type="number"
                    className={adminInputClass} style={adminInputStyle}
                    value={draft.orderIndex}
                    onChange={(e) => setDraft((d) => ({ ...d, orderIndex: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          )}
        </NeonShell>
      ))}

      {filtered.length === 0 && !creating && (
        <div className="py-16 text-center text-white text-sm">No flashcards found.</div>
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
        <Loader2 className="animate-spin text-white" size={32} />
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
        <NeonShell color={HEX.mint} className="p-5">
          <p className="mb-4 text-sm font-bold text-white">New Literature Note</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white">Work ID</label>
                <input
                  className={adminInputClass} style={adminInputStyle}
                  placeholder="e.g. 5"
                  value={newNote.workId}
                  onChange={(e) => setNewNote((n) => ({ ...n, workId: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1 w-24">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white">Language</label>
                <select
                  className={adminSelectClass}
                  style={adminSelectStyle}
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
              <Button size="sm" variant="ghost" className="text-white" onClick={() => setCreating(false)}>Cancel</Button>
              <Button
                size="sm"
                style={{ background: `${HEX.mint}33`, color: HEX.mint, border: `1px solid ${HEX.mint}55` }}
                onClick={() => createMutation.mutate(newNote)}
                disabled={createMutation.isPending || !newNote.workId}
                data-testid="save-new-lit-note-btn"
              >
                {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Create
              </Button>
            </div>
          </div>
        </NeonShell>
      )}

      {filtered.map((row) => (
        <NeonShell key={row.id} color={editingId === row.id ? HEX.amber : HEX.pink} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{row.workTitle}</span>
                <span className="text-xs text-white">by {row.author}</span>
                <LangPill lang={row.language} />
                <SourceBadge source={row.source} />
              </div>
              {editingId !== row.id && (
                <p className="line-clamp-2 text-xs text-white mt-1">{row.summary || <em>No summary</em>}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {editingId === row.id ? (
                <>
                  <Button size="sm" variant="ghost" className="text-white hover:text-white" onClick={() => setEditingId(null)} disabled={updateMutation.isPending}>
                    <X size={14} />
                  </Button>
                  <Button
                    size="sm"
                    style={{ background: `${HEX.amber}22`, color: HEX.amber, border: `1px solid ${HEX.amber}55` }}
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
                  <Button size="sm" variant="ghost" className="text-white hover:text-white" onClick={() => startEdit(row)} data-testid={`edit-lit-${row.id}`}>
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="text-[#FFB7E5] hover:text-[#FFB7E5]"
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
        </NeonShell>
      ))}

      {filtered.length === 0 && !creating && (
        <div className="py-16 text-center text-white text-sm">No literature notes found.</div>
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
    <AdminGround>
      {/* Header */}
      <AdminTopNav current="content-editor" />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">
            {isAf ? "Inhoudsredigeerder" : "Content Editor"}
          </h2>
          <p className="mt-1 text-sm text-white">
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
                color: tab === t.id ? t.accent : "#fff",
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
    </AdminGround>
  );
}
