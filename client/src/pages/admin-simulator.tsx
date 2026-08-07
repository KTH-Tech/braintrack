import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminTopNav } from "@/components/admin-top-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { Zap, Rocket, Loader2, FileText, BookOpen, Search, Layers, PackageCheck, ClipboardCheck, X, Check, Target } from "lucide-react";

/**
 * Simulator — the owner's dedicated screen for the simulated content pipeline
 * (owner spec, 2026-07-24):
 *   • DBE Portal = ingest the real papers. THIS screen = generate + release.
 *   • Per subject: how much simulated content exists, its quality, how many
 *     carry generated supporting paragraphs, and topic coverage.
 *   • Release button — enabled once a subject has questions at/above the
 *     release bar. Each release stamps a NEW VERSION and is cumulative:
 *     v2 adds to v1, nothing is ever un-released.
 *
 * The release bar is 92 (what the QA scorer can actually award today — the
 * owner's 99% is the generator's aspirational target; a hard 99 gate would
 * never enable the button).
 *
 * This is an internal ADMIN power tool — dark aesthetic, data-rich. A KPI
 * header aggregates every subject; a toolbar (search / sort / filter) and
 * bulk actions (generate-for-all, release-all-eligible) drive the whole bank
 * at once. All new logic is CLIENT-ONLY over the three existing endpoints.
 */

type SubjectRow = {
  subject: string;
  total: number;
  avgQuality: number;
  ge92: number;
  withStimulus: number;
  released: number;
  unreleasedEligible: number;
  latestVersion: number;
  topics: number;
};

type QaCheck = { label: string; pass: boolean; value: number | string; threshold: number | string; failingCount: number };
type QaWorstRow = { id: number; qualityScore: number; capsAlignment: number; structureScore: number; hasMemo: boolean; language: string | null; questionText: string };
type QaReport = {
  subject: string;
  bars: { quality: number; caps: number; structure: number };
  totals: { total: number; released: number; unreleased: number };
  checks: QaCheck[];
  language: { en: number; af: number } | null;
  supportingMaterial: { withStimulus: number; total: number } | null;
  worst: QaWorstRow[];
  meetsCriteria: boolean;
  migrationPending: boolean;
  note?: string;
};

type CoverageTopic = { topic: string; covered: boolean; simulatedCount: number; highYield: boolean; frequencyRank: number | null };
type CoverageReport = {
  subject: string;
  totalTopics: number;
  coveredCount: number;
  coveragePct: number;
  highYieldTotal: number;
  highYieldCovered: number;
  topics: CoverageTopic[];
  note?: string;
};

type SortKey = "readiness" | "quality" | "total" | "name";
type FilterKey = "all" | "unreleased" | "released" | "below";
type GenCount = 10 | 25 | 50;

const P = { mint: "#94F7C5", sky: "#9FD8FF", pink: "#FFB7E5", butter: "#FFE29A", violet: "#C5B3FF" };
const ACCENTS = [P.mint, P.sky, P.pink, P.violet, P.butter];

export default function AdminSimulatorPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const { toast } = useToast();
  const qc = useQueryClient();
  // Busy state is tracked PER SUBJECT (subject → which op is running) so an
  // in-flight generate/release on one subject never disables the buttons on the
  // others. A single shared `busySubject` used to lock the whole grid — clicking
  // Generate on one card froze every other card until it finished.
  const [busyOps, setBusyOps] = useState<Record<string, "simulate" | "release" | "mcq">>({});
  const markBusy = (s: string, op: "simulate" | "release" | "mcq") =>
    setBusyOps((p) => ({ ...p, [s]: op }));
  const clearBusy = (s: string) =>
    setBusyOps((p) => { const n = { ...p }; delete n[s]; return n; });

  // Toolbar state (all client-side over fetched subjects)
  const [genCount, setGenCount] = useState<GenCount>(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("readiness");
  const [filter, setFilter] = useState<FilterKey>("all");

  // Bulk-action state
  const [bulkGen, setBulkGen] = useState<{ done: number; total: number } | null>(null);
  const [bulkRel, setBulkRel] = useState<{ done: number; total: number } | null>(null);

  const { data, isLoading } = useQuery<{ subjects: SubjectRow[]; releaseBar: number }>({
    queryKey: ["/api/admin/simulator/overview"],
    refetchInterval: 15000, // generation runs elsewhere; keep counts fresh
  });
  const releaseBar = data?.releaseBar ?? 92;
  const subjects = useMemo(() => data?.subjects ?? [], [data]);

  const crunch = useMutation({
    mutationFn: async (subject: string) => {
      const r = await apiRequest("POST", "/api/admin/dbe-ingestion/simulate-subject", { subject, count: genCount });
      return r.json();
    },
    onMutate: (s) => markBusy(s, "simulate"),
    onSettled: (_d, _e, s) => {
      clearBusy(s);
      qc.invalidateQueries({ queryKey: ["/api/admin/simulator/overview"] });
    },
    onSuccess: (d: any) =>
      toast({ title: isAf ? "Genereer klaar" : "Generation done", description: `${d?.generated ?? "?"} ${isAf ? "vrae gebank" : "questions banked"}` }),
    onError: (e: any) =>
      toast({ title: isAf ? "Genereer het misluk" : "Generation failed", description: String(e?.message ?? e), variant: "destructive" }),
  });

  // Daily-quiz MCQs — generate + STRICT verify (solver-agree + on-syllabus) +
  // release, in one synchronous call. Distinct from `crunch` (written-response
  // exam content into dbe_simulated_questions): this produces multiple-choice
  // questions into generated_questions and only releases keys the solver
  // independently confirmed. This is the ONLY producer for the learner quiz.
  const mcq = useMutation({
    mutationFn: async (subject: string) => {
      const r = await apiRequest("POST", "/api/admin/simulator/generate-mcq", { subject, count: genCount });
      return r.json();
    },
    onMutate: (s) => markBusy(s, "mcq"),
    onSettled: (_d, _e, s) => {
      clearBusy(s);
      qc.invalidateQueries({ queryKey: ["/api/admin/simulator/overview"] });
    },
    onSuccess: (d: any) =>
      toast({
        title: d?.released > 0
          ? (isAf ? `${d.released} MCV vrygestel` : `${d.released} MCQs released`)
          : (isAf ? "Geen MCV vrygestel nie" : "No MCQs released"),
        description: d?.message ?? "",
      }),
    onError: (e: any) =>
      toast({ title: isAf ? "MCV-generering het misluk" : "MCQ generation failed", description: String(e?.message ?? e), variant: "destructive" }),
  });

  const release = useMutation({
    mutationFn: async (subject: string) => {
      const r = await apiRequest("POST", "/api/admin/simulator/release", { subject });
      return r.json();
    },
    onMutate: (s) => markBusy(s, "release"),
    onSettled: (_d, _e, s) => {
      clearBusy(s);
      qc.invalidateQueries({ queryKey: ["/api/admin/simulator/overview"] });
    },
    onSuccess: (d: any) =>
      toast({
        title: d?.released > 0 ? (isAf ? `Vrygestel — v${d.version}` : `Released — v${d.version}`) : (isAf ? "Niks om vry te stel nie" : "Nothing to release"),
        description: d?.released > 0
          ? `${d.released} ${isAf ? "vrae bygevoeg tot die vrygestelde poel" : "questions added to the released pool"}`
          : (d?.message ?? ""),
      }),
    onError: (e: any) =>
      toast({ title: isAf ? "Vrystelling het misluk" : "Release failed", description: String(e?.message ?? e), variant: "destructive" }),
  });

  // ── QA report (read-only, on demand) ────────────────────────────────────
  // Fetches the per-subject QA report and opens it in a modal. Purely reads
  // stored scores server-side — no generation, no re-verify, so it's safe to
  // click any time, even mid-generation.
  const [qaSubject, setQaSubject] = useState<string | null>(null);
  const [qaData, setQaData] = useState<QaReport | null>(null);
  const [qaLoading, setQaLoading] = useState(false);

  async function openQa(subject: string) {
    setQaSubject(subject);
    setQaData(null);
    setQaLoading(true);
    try {
      const r = await apiRequest("GET", `/api/admin/simulator/qa?subject=${encodeURIComponent(subject)}`);
      setQaData((await r.json()) as QaReport);
    } catch (e: any) {
      setQaSubject(null);
      toast({ title: isAf ? "QA het misluk" : "QA failed", description: String(e?.message ?? e), variant: "destructive" });
    } finally {
      setQaLoading(false);
    }
  }
  function closeQa() {
    setQaSubject(null);
    setQaData(null);
  }

  // ── CAPS topic-coverage panel + topic-targeted generation ─────────────────
  // Shows the subject's FULL CAPS topic list vs what the simulated bank covers,
  // flags high-yield topics, and generates for the MISSING ones (high-yield
  // first). Generation is driven by the topic-targeted /generate-topic endpoint.
  const MISSING_CAP = 10; // never fire off more than the top-10 missing at once
  const [covSubject, setCovSubject] = useState<string | null>(null);
  const [covData, setCovData] = useState<CoverageReport | null>(null);
  const [covLoading, setCovLoading] = useState(false);
  // Progress of the sequential "Generate Missing Topics" run.
  const [covGen, setCovGen] = useState<{ done: number; total: number; current: string } | null>(null);

  async function fetchCoverage(subject: string) {
    const r = await apiRequest("GET", `/api/admin/simulator/coverage?subject=${encodeURIComponent(subject)}`);
    return (await r.json()) as CoverageReport;
  }

  async function openCoverage(subject: string) {
    setCovSubject(subject);
    setCovData(null);
    setCovLoading(true);
    try {
      setCovData(await fetchCoverage(subject));
    } catch (e: any) {
      setCovSubject(null);
      toast({ title: isAf ? "Dekking het misluk" : "Coverage failed", description: String(e?.message ?? e), variant: "destructive" });
    } finally {
      setCovLoading(false);
    }
  }
  function closeCoverage() {
    if (covGen) return; // don't allow closing mid-run
    setCovSubject(null);
    setCovData(null);
  }

  // Sequentially generate for a list of CAPS topics (already ordered high-yield
  // first by the endpoint). One /generate-topic call per topic (count=1) so the
  // owner sees "3/10…" progress; refreshes coverage + overview at the end.
  async function generateForTopics(subject: string, topicsToGen: string[], count: number = genCount, label?: string) {
    if (topicsToGen.length === 0 || covGen) return;
    let ok = 0;
    let failed = 0;
    for (let i = 0; i < topicsToGen.length; i++) {
      const topic = topicsToGen[i];
      setCovGen({ done: i, total: topicsToGen.length, current: topic });
      try {
        const r = await apiRequest("POST", "/api/admin/simulator/generate-topic", { subject, topic, count });
        const d = await r.json();
        if (Number(d?.generated ?? 0) > 0) ok++;
        else failed++;
      } catch {
        failed++;
      }
    }
    setCovGen(null);
    qc.invalidateQueries({ queryKey: ["/api/admin/simulator/overview"] });
    try {
      setCovData(await fetchCoverage(subject));
    } catch { /* keep stale panel — non-fatal */ }
    toast({
      title: label ?? (isAf ? "Onderwerpe gegenereer" : "Topics generated"),
      description: `${ok}/${topicsToGen.length} ${isAf ? "onderwerpe gebank" : "topics banked"} · ×${count}${failed ? ` · ${failed} ${isAf ? "misluk" : "failed"}` : ""}`,
      variant: failed && !ok ? "destructive" : undefined,
    });
  }

  // Generate for the subject's HIGH-YIELD topics (top exam-frequency), missing
  // ones first, then deepen covered high-yield — genCount per topic. Fetches
  // fresh coverage so it works from any row without opening the panel.
  async function generateHighYield(subject: string) {
    if (covGen) return;
    let cov = covData && covSubject === subject ? covData : null;
    if (!cov) { try { cov = await fetchCoverage(subject); setCovSubject(subject); setCovData(cov); } catch { cov = null; } }
    if (!cov) { toast({ title: isAf ? "Kon nie dekking laai nie" : "Couldn't load coverage", variant: "destructive" }); return; }
    const hy = cov.topics.filter((t) => t.highYield);
    const ordered = [...hy.filter((t) => !t.covered), ...hy.filter((t) => t.covered)].slice(0, 15).map((t) => t.topic);
    if (!ordered.length) { toast({ title: isAf ? "Geen hoë-opbrengs onderwerpe nie" : "No high-yield topics found" }); return; }
    await generateForTopics(subject, ordered, genCount, isAf ? "Hoë-opbrengs gegenereer" : "High-yield generated");
  }

  const bulkBusy = bulkGen !== null || bulkRel !== null;
  // anyBusy is used ONLY to gate the whole-grid bulk actions + single-flight
  // sequences (coverage/high-yield). Per-subject buttons gate on their OWN
  // subject via `busyOps` so one card never blocks another.
  const anyIndividualBusy = Object.keys(busyOps).length > 0;
  const anyBusy = anyIndividualBusy || bulkBusy || covGen !== null;

  // ── Readiness classification ────────────────────────────────────────────
  // ready   → has unreleased-eligible content (can release now)
  // below   → no questions at/above the release bar at all
  // done    → has eligible content, all of it already released
  function readiness(s: SubjectRow): "ready" | "below" | "done" {
    if (s.unreleasedEligible > 0) return "ready";
    if (s.ge92 === 0) return "below";
    return "done";
  }

  // ── Aggregate KPIs (across ALL subjects, unfiltered) ────────────────────
  const kpi = useMemo(() => {
    const totalQ = subjects.reduce((a, s) => a + s.total, 0);
    const totalReleased = subjects.reduce((a, s) => a + s.released, 0);
    const weightedQ = subjects.reduce((a, s) => a + s.avgQuality * s.total, 0);
    const withUnreleased = subjects.filter((s) => s.unreleasedEligible > 0).length;
    return {
      subjectCount: subjects.length,
      totalQ,
      totalReleased,
      avgQuality: totalQ > 0 ? Math.round(weightedQ / totalQ) : 0,
      pctReleased: totalQ > 0 ? Math.round((totalReleased / totalQ) * 100) : 0,
      withUnreleased,
    };
  }, [subjects]);

  // ── Toolbar: filter + search + sort (all client-side) ───────────────────
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = subjects.filter((s) => {
      if (q && !s.subject.toLowerCase().includes(q)) return false;
      const r = readiness(s);
      if (filter === "unreleased") return s.unreleasedEligible > 0;
      if (filter === "released") return r === "done";
      if (filter === "below") return r === "below";
      return true;
    });
    rows = [...rows].sort((a, b) => {
      if (sortBy === "name") return a.subject.localeCompare(b.subject);
      if (sortBy === "quality") return b.avgQuality - a.avgQuality;
      if (sortBy === "total") return b.total - a.total;
      // readiness: most ready-to-release first, then quality
      return b.unreleasedEligible - a.unreleasedEligible || b.avgQuality - a.avgQuality;
    });
    return rows;
  }, [subjects, search, filter, sortBy]);

  // ── Bulk: generate for every VISIBLE subject, sequentially ──────────────
  async function bulkGenerate() {
    if (anyBusy) return;
    const targets = visible.map((s) => s.subject);
    if (!targets.length) return;
    setBulkGen({ done: 0, total: targets.length });
    let banked = 0;
    let failed = 0;
    for (let i = 0; i < targets.length; i++) {
      try {
        const r = await apiRequest("POST", "/api/admin/dbe-ingestion/simulate-subject", { subject: targets[i], count: genCount });
        const d = await r.json();
        banked += Number(d?.generated ?? 0);
      } catch {
        failed++;
      }
      setBulkGen({ done: i + 1, total: targets.length });
    }
    setBulkGen(null);
    qc.invalidateQueries({ queryKey: ["/api/admin/simulator/overview"] });
    toast({
      title: isAf ? "Massa-genereer klaar" : "Bulk generate done",
      description: `${banked} ${isAf ? "vrae gebank oor" : "questions banked across"} ${targets.length - failed}/${targets.length} ${isAf ? "vakke" : "subjects"}${failed ? ` · ${failed} ${isAf ? "misluk" : "failed"}` : ""}`,
      variant: failed ? "destructive" : undefined,
    });
  }

  // ── Bulk: release every VISIBLE subject with eligible content ───────────
  async function bulkRelease() {
    if (anyBusy) return;
    const targets = visible.filter((s) => s.unreleasedEligible > 0).map((s) => s.subject);
    if (!targets.length) {
      toast({ title: isAf ? "Niks om vry te stel nie" : "Nothing eligible to release" });
      return;
    }
    setBulkRel({ done: 0, total: targets.length });
    let released = 0;
    let failed = 0;
    for (let i = 0; i < targets.length; i++) {
      try {
        const r = await apiRequest("POST", "/api/admin/simulator/release", { subject: targets[i] });
        const d = await r.json();
        released += Number(d?.released ?? 0);
      } catch {
        failed++;
      }
      setBulkRel({ done: i + 1, total: targets.length });
    }
    setBulkRel(null);
    qc.invalidateQueries({ queryKey: ["/api/admin/simulator/overview"] });
    toast({
      title: isAf ? "Massa-vrystelling klaar" : "Bulk release done",
      description: `${released} ${isAf ? "vrae vrygestel oor" : "questions released across"} ${targets.length - failed}/${targets.length} ${isAf ? "vakke" : "subjects"}${failed ? ` · ${failed} ${isAf ? "misluk" : "failed"}` : ""}`,
      variant: failed ? "destructive" : undefined,
    });
  }

  const t = (en: string, af: string) => (isAf ? af : en);

  return (
    <div className="min-h-screen text-white" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      <AdminTopNav current="simulator" />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 64px" }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.8, margin: "0 0 6px" }}>Simulator</h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#fff", maxWidth: 760, margin: "0 0 22px" }}>
          {t(
            `Generate original, examiner-grounded exam content — questions + memo + supporting material — then release it to learners. Released content feeds BOTH the Mini Mock AND the Full Exam (/exam/full); learners never see the verbatim DBE papers. Every release gets a version number and BUILDS on the previous one — nothing is ever un-released. Release bar: ${releaseBar}%+ quality.`,
            `Genereer oorspronklike, eksaminator-gegronde eksameninhoud — vrae + memo + ondersteunende materiaal — en stel dit dan vry aan leerders. Vrygestelde inhoud voed BEIDE die Mini Mock ÉN die Volle Eksamen (/exam/full); leerders sien nooit die woordelikse DBE-vraestelle nie. Elke vrystelling kry 'n weergawenommer en BOU op die vorige een — niks word ooit teruggetrek nie. Vrystellingsdrempel: ${releaseBar}%+ kwaliteit.`,
          )}
        </p>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: P.mint }} />
          </div>
        ) : !subjects.length ? (
          <div style={{ background: "#050508", border: `2.5px solid ${P.butter}`, boxShadow: `5px 5px 0 0 ${P.butter}`, borderRadius: 18, padding: 26 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>
              {t("No subjects with ingested content yet.", "Geen vakke met ingeneemde inhoud nie.")}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13.5 }}>
              {t(
                "Every subject with a usable ingested bank shows here with a Generate button — ingest real papers in the DBE Portal first.",
                "Elke vak met 'n bruikbare ingeneemde bank verskyn hier met 'n Genereer-knoppie — neem eers regte vraestelle in by die DBE Portaal.",
              )}
            </p>
          </div>
        ) : (
          <>
            {/* ── KPI SUMMARY HEADER ─────────────────────────────────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <KpiCard testid="sim-kpi-subjects" accent={P.sky} label={t("Subjects", "Vakke")} big={kpi.subjectCount} />
              <KpiCard testid="sim-kpi-total" accent={P.mint} label={t("Simulated questions", "Gesimuleerde vrae")} big={kpi.totalQ.toLocaleString()} />
              <KpiCard testid="sim-kpi-released" accent={P.violet} label={t("Released", "Vrygestel")} big={kpi.totalReleased.toLocaleString()} />
              <KpiCard testid="sim-kpi-quality" accent={P.butter} label={t("Avg quality", "Gem. kwaliteit")} big={`${kpi.avgQuality}%`} pct={kpi.avgQuality} />
              <KpiCard testid="sim-kpi-pct-released" accent={P.pink} label={t("% released", "% vrygestel")} big={`${kpi.pctReleased}%`} pct={kpi.pctReleased} />
              <KpiCard testid="sim-kpi-pending" accent={P.sky} label={t("Subjects w/ unreleased", "Vakke met onvrygestel")} big={kpi.withUnreleased} />
            </div>

            {/* ── BULK ACTIONS BAR ───────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 12,
                background: "#050508",
                border: `2.5px solid ${P.mint}`,
                boxShadow: `5px 5px 0 0 ${P.mint}`,
                borderRadius: 16,
                padding: "14px 16px",
                marginBottom: 14,
              }}
            >
              <span style={{ fontWeight: 900, fontSize: 12.5, letterSpacing: 0.4, textTransform: "uppercase" }}>
                {t("Bulk actions", "Massa-aksies")}
              </span>

              {/* Variable generate-count selector */}
              <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12 }}>{t("Count", "Getal")}:</span>
                {([10, 25, 50] as GenCount[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setGenCount(c)}
                    disabled={anyBusy}
                    data-testid={`sim-count-${c}`}
                    style={{
                      background: genCount === c ? P.mint : "transparent",
                      color: genCount === c ? "#050508" : "#fff",
                      border: `2px solid ${P.mint}`,
                      borderRadius: 9,
                      padding: "6px 11px",
                      fontWeight: 900,
                      fontSize: 12.5,
                      cursor: anyBusy ? "not-allowed" : "pointer",
                      opacity: anyBusy ? 0.55 : 1,
                      minHeight: 36,
                    }}
                  >
                    ×{c}
                  </button>
                ))}
              </div>

              <div style={{ flex: "1 1 auto" }} />

              <button
                onClick={bulkGenerate}
                disabled={anyBusy || !visible.length}
                data-testid="sim-bulk-generate"
                style={bulkBtn(P.sky, anyBusy || !visible.length)}
              >
                {bulkGen ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <Layers style={{ width: 15, height: 15 }} />}
                {bulkGen
                  ? `${t("Generating", "Genereer")} ${bulkGen.done}/${bulkGen.total}…`
                  : `${t("Generate for ALL", "Genereer vir ALMAL")} (${visible.length} ×${genCount})`}
              </button>

              <button
                onClick={bulkRelease}
                disabled={anyBusy || !visible.some((s) => s.unreleasedEligible > 0)}
                data-testid="sim-bulk-release"
                style={bulkBtn(P.violet, anyBusy || !visible.some((s) => s.unreleasedEligible > 0))}
              >
                {bulkRel ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <PackageCheck style={{ width: 15, height: 15 }} />}
                {bulkRel
                  ? `${t("Releasing", "Stel vry")} ${bulkRel.done}/${bulkRel.total}…`
                  : `${t("Release ALL eligible", "Stel ALMAL vry")} (${visible.filter((s) => s.unreleasedEligible > 0).length})`}
              </button>
            </div>

            {/* ── TOOLBAR: search / sort / filter ────────────────────────── */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
              {/* Search */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#050508",
                  border: "2px solid #1b1922",
                  borderRadius: 11,
                  padding: "0 12px",
                  flex: "1 1 220px",
                  minWidth: 0,
                  minHeight: 42,
                }}
              >
                <Search style={{ width: 15, height: 15, color: P.sky, flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("Search subjects…", "Soek vakke…")}
                  data-testid="sim-search"
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    width: "100%",
                    padding: "10px 0",
                  }}
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                data-testid="sim-sort"
                style={{
                  background: "#050508",
                  color: "#fff",
                  border: "2px solid #1b1922",
                  borderRadius: 11,
                  padding: "0 12px",
                  fontFamily: "inherit",
                  fontWeight: 700,
                  fontSize: 13,
                  minHeight: 42,
                  cursor: "pointer",
                }}
              >
                <option value="readiness">{t("Sort: Readiness", "Sorteer: Gereedheid")}</option>
                <option value="quality">{t("Sort: Avg quality", "Sorteer: Gem. kwaliteit")}</option>
                <option value="total">{t("Sort: Total", "Sorteer: Totaal")}</option>
                <option value="name">{t("Sort: Name", "Sorteer: Naam")}</option>
              </select>

              {/* Filter chips */}
              {([
                ["all", t("All", "Almal")],
                ["unreleased", t("Has unreleased", "Het onvrygestel")],
                ["released", t("Fully released", "Volledig vrygestel")],
                ["below", t("Below bar", "Onder drempel")],
              ] as [FilterKey, string][]).map(([key, label]) => {
                const active = filter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    data-testid={`sim-filter-${key}`}
                    style={{
                      background: active ? P.pink : "transparent",
                      color: active ? "#050508" : "#fff",
                      border: `2px solid ${P.pink}`,
                      borderRadius: 999,
                      padding: "8px 14px",
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: "pointer",
                      minHeight: 38,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: 12, margin: "0 0 12px" }}>
              {t("Showing", "Wys")} {visible.length}/{subjects.length} {t("subjects", "vakke")}
            </p>

            {/* ── SUBJECT ROWS ───────────────────────────────────────────── */}
            {!visible.length ? (
              <div style={{ background: "#050508", border: "2.5px solid #1b1922", borderRadius: 16, padding: 22 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {t("No subjects match your filters.", "Geen vakke pas by jou filters nie.")}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {visible.map((s) => {
                  const accent = ACCENTS[Math.abs(hash(s.subject)) % ACCENTS.length];
                  // Per-subject busy: which op (if any) is running for THIS card.
                  const subjOp = busyOps[s.subject];
                  const subjBusy = !!subjOp;
                  // This card's generate/release/mcq buttons lock only for this
                  // subject (or during a whole-grid bulk run) — never because a
                  // DIFFERENT subject is busy.
                  const lockThis = subjBusy || bulkBusy;
                  const canRelease = s.unreleasedEligible > 0;
                  const r = readiness(s);
                  const releasedPct = s.total > 0 ? Math.min(100, (s.released / s.total) * 100) : 0;
                  const barPct = s.total > 0 ? Math.min(100, (s.ge92 / s.total) * 100) : 0;
                  return (
                    <div
                      key={s.subject}
                      data-testid={`sim-row-${s.subject}`}
                      style={{
                        background: "#050508",
                        border: `2.5px solid ${accent}`,
                        boxShadow: `5px 5px 0 0 ${accent}`,
                        borderRadius: 18,
                        padding: "18px 20px",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <p style={{ fontWeight: 900, fontSize: 17, margin: 0, color: accent }}>{s.subject}</p>
                          <ReadinessChip state={r} n={s.unreleasedEligible} isAf={isAf} />
                        </div>
                        <p style={{ fontSize: 12.5, margin: "6px 0 0", color: "#fff" }}>
                          {s.total} {t("questions", "vrae")} · {t("avg quality", "gem. kwaliteit")} {s.avgQuality}%
                          {" · "}{s.ge92} ≥{releaseBar}%
                          {" · "}<FileText style={{ width: 11, height: 11, display: "inline" }} /> {s.withStimulus} {t("with passage", "met leesteks")}
                          {" · "}<BookOpen style={{ width: 11, height: 11, display: "inline" }} /> {s.topics} {t("topics", "onderwerpe")}
                        </p>

                        {/* Progress bar: released fill + eligible (≥bar) marker */}
                        <div style={{ marginTop: 10 }}>
                          <div
                            style={{
                              position: "relative",
                              height: 12,
                              borderRadius: 999,
                              background: "#1b1922",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: `${releasedPct}%`,
                                background: accent,
                                borderRadius: 999,
                                transition: "width .3s ease",
                              }}
                            />
                            {/* eligible-line marker (ge92 / total) */}
                            {s.total > 0 && s.ge92 > 0 && (
                              <div
                                title={t("Eligible line", "Drempellyn")}
                                style={{
                                  position: "absolute",
                                  top: -2,
                                  bottom: -2,
                                  left: `calc(${barPct}% - 1px)`,
                                  width: 2,
                                  background: "#fff",
                                }}
                              />
                            )}
                          </div>
                          <p style={{ fontSize: 11.5, margin: "5px 0 0", color: accent }}>
                            {s.released > 0
                              ? `${t("Released", "Vrygestel")}: ${s.released}/${s.total} (v${s.latestVersion})`
                              : t("Nothing released yet", "Nog niks vrygestel nie")}
                            {canRelease && ` · ${s.unreleasedEligible} ${t("ready", "gereed")}`}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {/* Single generation CTA (was duplicated as "Generate" +
                            "Generate Exam Paper", both hitting the same endpoint).
                            Produces exam questions + memo + supporting material that
                            feed /exam/full once released. */}
                        <button
                          onClick={() => crunch.mutate(s.subject)}
                          disabled={lockThis}
                          data-testid={`sim-generate-${s.subject}`}
                          title={t(
                            "Generates exam questions + memo + supporting material → feeds Full Exam once released",
                            "Genereer eksamenvrae + memo + ondersteunende materiaal → voed die Volle Eksamen sodra vrygestel",
                          )}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: "transparent", color: accent,
                            border: `2px solid ${accent}`, borderRadius: 10,
                            padding: "10px 16px", fontWeight: 800, fontSize: 13.5,
                            cursor: lockThis ? "not-allowed" : "pointer", opacity: lockThis && subjOp !== "simulate" ? 0.5 : 1,
                            minHeight: 44,
                          }}
                        >
                          {subjOp === "simulate" ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <Zap style={{ width: 15, height: 15 }} />}
                          {t("Generate Exam", "Genereer Eksamen")} ×{genCount}
                        </button>
                        {/* Read-only QA — verify stored scores meet the
                            release criteria before/after release. */}
                        <button
                          onClick={() => openQa(s.subject)}
                          disabled={qaLoading && qaSubject === s.subject}
                          data-testid={`sim-qa-${s.subject}`}
                          title={t("Verify this subject's simulated content against the release criteria", "Verifieer hierdie vak se gesimuleerde inhoud teen die vrystellingskriteria")}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: "transparent", color: accent,
                            border: `2px solid ${accent}`, borderRadius: 10,
                            padding: "10px 16px", fontWeight: 800, fontSize: 13.5,
                            cursor: qaLoading && qaSubject === s.subject ? "wait" : "pointer",
                            minHeight: 44,
                          }}
                        >
                          {qaLoading && qaSubject === s.subject ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <ClipboardCheck style={{ width: 15, height: 15 }} />}
                          {t("QA", "GK")}
                        </button>
                        {/* CAPS topic-coverage — see which CAPS topics the
                            simulated bank covers and generate for missing ones. */}
                        <button
                          onClick={() => openCoverage(s.subject)}
                          disabled={covLoading && covSubject === s.subject}
                          data-testid={`sim-coverage-${s.subject}`}
                          title={t("See CAPS topic coverage and generate for the missing (high-yield first) topics", "Sien CAPS-onderwerpdekking en genereer vir die ontbrekende (hoë-opbrengs eerste) onderwerpe")}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: "transparent", color: accent,
                            border: `2px solid ${accent}`, borderRadius: 10,
                            padding: "10px 16px", fontWeight: 800, fontSize: 13.5,
                            cursor: covLoading && covSubject === s.subject ? "wait" : "pointer",
                            minHeight: 44,
                          }}
                        >
                          {covLoading && covSubject === s.subject ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <Target style={{ width: 15, height: 15 }} />}
                          {t("Coverage", "Dekking")}
                        </button>
                        {/* High-Yield — generate straight at the top exam-frequency
                            CAPS topics (missing first), genCount each. */}
                        <button
                          onClick={() => generateHighYield(s.subject)}
                          disabled={covGen !== null || lockThis}
                          data-testid={`sim-highyield-${s.subject}`}
                          title={t(`Generate for this subject's HIGH-YIELD (top exam-frequency) CAPS topics — missing first, ×${genCount} each`, `Genereer vir hierdie vak se HOË-OPBRENGS (top eksamenfrekwensie) KABV-onderwerpe — ontbrekende eerste, ×${genCount} elk`)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: P.butter, color: "#050508",
                            border: `2px solid ${P.butter}`, borderRadius: 10,
                            padding: "10px 16px", fontWeight: 900, fontSize: 13.5,
                            cursor: covGen !== null || lockThis ? "not-allowed" : "pointer",
                            opacity: covGen !== null || lockThis ? 0.55 : 1,
                            boxShadow: covGen !== null || lockThis ? "none" : "3px 3px 0 0 rgba(0,0,0,.85)",
                            minHeight: 44,
                          }}
                        >
                          <Zap style={{ width: 15, height: 15 }} />
                          {t("High-Yield", "Hoë-opbrengs")}
                        </button>
                        {/* Quiz MCQs — generate multiple-choice questions for the
                            daily/boost quiz and RELEASE only the keys the solver
                            independently confirmed + CAPS-verified. The only
                            producer for the learner quiz surface. */}
                        <button
                          onClick={() => mcq.mutate(s.subject)}
                          disabled={lockThis}
                          data-testid={`sim-mcq-${s.subject}`}
                          title={t(`Generate daily-quiz MCQs, ×${genCount}, and release only solver-confirmed keys (on-syllabus)`, `Genereer daaglikse-toets MCV, ×${genCount}, en stel net solver-bevestigde sleutels vry (op-sillabus)`)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: subjOp === "mcq" ? "transparent" : accent,
                            color: subjOp === "mcq" ? "#fff" : "#050508",
                            border: `2px solid ${accent}`, borderRadius: 10,
                            padding: "10px 16px", fontWeight: 900, fontSize: 13.5,
                            cursor: lockThis ? "not-allowed" : "pointer",
                            opacity: lockThis && subjOp !== "mcq" ? 0.55 : 1,
                            minHeight: 44,
                          }}
                        >
                          {subjOp === "mcq"
                            ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} />
                            : <ClipboardCheck style={{ width: 15, height: 15 }} />}
                          {t("Quiz MCQs", "Toets MCV")}
                        </button>
                        <button
                          onClick={() => release.mutate(s.subject)}
                          disabled={lockThis || !canRelease}
                          title={canRelease ? undefined : t(`Needs unreleased questions at ≥${releaseBar}% quality`, `Benodig vrae ≥${releaseBar}% wat nog nie vrygestel is nie`)}
                          data-testid={`sim-release-${s.subject}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: canRelease ? accent : "transparent",
                            color: canRelease ? "#050508" : "#fff",
                            border: `2px solid ${accent}`, borderRadius: 10,
                            padding: "10px 16px", fontWeight: 900, fontSize: 13.5,
                            cursor: lockThis || !canRelease ? "not-allowed" : "pointer",
                            opacity: !canRelease ? 0.45 : lockThis && subjOp !== "release" ? 0.5 : 1,
                            boxShadow: canRelease ? "3px 3px 0 0 rgba(0,0,0,.85)" : "none",
                            minHeight: 44,
                          }}
                        >
                          {subjOp === "release" ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <Rocket style={{ width: 15, height: 15 }} />}
                          {t("Release", "Stel vry")} → v{s.latestVersion + 1}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── QA RESULTS MODAL ────────────────────────────────────────────── */}
      {qaSubject && (
        <QaModal subject={qaSubject} report={qaData} loading={qaLoading} isAf={isAf} onClose={closeQa} />
      )}

      {/* ── CAPS TOPIC-COVERAGE MODAL ───────────────────────────────────── */}
      {covSubject && (
        <CoverageModal
          subject={covSubject}
          report={covData}
          loading={covLoading}
          gen={covGen}
          missingCap={MISSING_CAP}
          isAf={isAf}
          onClose={closeCoverage}
          onGenerate={(topicsToGen) => generateForTopics(covSubject, topicsToGen)}
        />
      )}
    </div>
  );
}

// Stable colour pick so a subject keeps its accent regardless of sort/filter order.
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return h;
}

function bulkBtn(accent: string, disabled: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: disabled ? "transparent" : accent,
    color: disabled ? "#fff" : "#050508",
    border: `2px solid ${accent}`,
    borderRadius: 11,
    padding: "10px 15px",
    fontWeight: 900,
    fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? "none" : "3px 3px 0 0 rgba(0,0,0,.85)",
    minHeight: 44,
  };
}

function KpiCard({ testid, accent, label, big, pct }: { testid: string; accent: string; label: string; big: number | string; pct?: number }) {
  return (
    <div
      data-testid={testid}
      style={{
        background: "#050508",
        border: `2.5px solid ${accent}`,
        boxShadow: `5px 5px 0 0 ${accent}`,
        borderRadius: 16,
        padding: "14px 16px",
      }}
    >
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.3, textTransform: "uppercase", color: "#fff" }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, lineHeight: 1, color: accent }}>{big}</p>
      {typeof pct === "number" && (
        <div style={{ height: 7, borderRadius: 999, background: "#1b1922", overflow: "hidden", marginTop: 10 }}>
          <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: accent, borderRadius: 999 }} />
        </div>
      )}
    </div>
  );
}

function ReadinessChip({ state, n, isAf }: { state: "ready" | "below" | "done"; n: number; isAf: boolean }) {
  const cfg =
    state === "ready"
      ? { c: P.mint, label: isAf ? `gereed vir vrystelling ${n}` : `ready to release ${n}` }
      : state === "done"
        ? { c: P.violet, label: isAf ? "alles vrygestel" : "all released" }
        : { c: P.butter, label: isAf ? "onder drempel" : "below bar" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 900,
        color: cfg.c,
        border: `1.5px solid ${cfg.c}`,
        borderRadius: 999,
        padding: "3px 9px",
        textTransform: "uppercase",
        letterSpacing: 0.3,
      }}
    >
      {cfg.label}
    </span>
  );
}

// ── QA modal ────────────────────────────────────────────────────────────────
// Dark admin sticker-card aesthetic (bg #050508, accent border, hard offset
// shadow). Shows verdict banner + criteria checklist + language coverage +
// worst-5 sample. Entirely driven by the read-only /qa endpoint.
function QaModal({
  subject, report, loading, isAf, onClose,
}: { subject: string; report: QaReport | null; loading: boolean; isAf: boolean; onClose: () => void }) {
  const t = (en: string, af: string) => (isAf ? af : en);
  const verdictColor = report?.meetsCriteria ? P.mint : P.pink;
  const accent = ACCENTS[Math.abs(hash(subject)) % ACCENTS.length];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.78)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 16px", overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-testid="sim-qa-panel"
        style={{
          width: "100%", maxWidth: 720,
          background: "#050508",
          border: `2.5px solid ${accent}`,
          boxShadow: `7px 7px 0 0 ${accent}`,
          borderRadius: 18,
          padding: "22px 22px 26px",
          color: "#fff", fontFamily: "'Poppins',sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: "#fff" }}>
              {t("QA report", "GK-verslag")}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 900, color: accent }}>{subject}</p>
          </div>
          <button
            onClick={onClose}
            data-testid="sim-qa-close"
            aria-label={t("Close", "Maak toe")}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "transparent", color: "#fff",
              border: "2px solid #1b1922", borderRadius: 10,
              width: 40, height: 40, cursor: "pointer", flexShrink: 0,
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {loading || !report ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Loader2 className="animate-spin" style={{ width: 26, height: 26, color: accent }} />
          </div>
        ) : (
          <>
            {/* Verdict banner */}
            <div
              data-testid="sim-qa-verdict"
              style={{
                background: verdictColor, color: "#050508",
                borderRadius: 14, padding: "14px 18px", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "4px 4px 0 0 rgba(0,0,0,.85)",
              }}
            >
              {report.meetsCriteria ? <Check style={{ width: 22, height: 22, strokeWidth: 3 }} /> : <X style={{ width: 22, height: 22, strokeWidth: 3 }} />}
              <div>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 17, letterSpacing: 0.3 }}>
                  {report.meetsCriteria ? t("MEETS CRITERIA", "VOLDOEN AAN KRITERIA") : t("NEEDS WORK", "BENODIG WERK")}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 700 }}>
                  {report.totals.total} {t("questions", "vrae")} · {report.totals.released} {t("released", "vrygestel")} · {report.totals.unreleased} {t("unreleased", "onvrygestel")}
                </p>
              </div>
            </div>

            {report.migrationPending && report.note && (
              <p style={{ fontSize: 12, color: P.butter, margin: "0 0 14px", fontWeight: 700 }}>⚠ {report.note}</p>
            )}

            {/* Criteria checklist */}
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", margin: "0 0 8px" }}>
              {t("Criteria", "Kriteria")}
            </p>
            <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
              {report.checks.map((c) => (
                <div
                  key={c.label}
                  data-testid={`sim-qa-check-${c.label}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    border: `2px solid ${c.pass ? P.mint : P.pink}`,
                    borderRadius: 11, padding: "10px 14px",
                  }}
                >
                  <span style={{ color: c.pass ? P.mint : P.pink, display: "inline-flex", flexShrink: 0 }}>
                    {c.pass ? <Check style={{ width: 18, height: 18, strokeWidth: 3 }} /> : <X style={{ width: 18, height: 18, strokeWidth: 3 }} />}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 13.5, flex: 1, minWidth: 0 }}>{c.label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", textAlign: "right" }}>
                    {t("value", "waarde")} {c.value} / {t("target", "teiken")} {c.threshold}
                    {c.failingCount > 0 && (
                      <span style={{ color: P.pink }}> · {c.failingCount} {t("failing", "misluk")}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Language coverage */}
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", margin: "0 0 8px" }}>
              {t("Language coverage", "Taaldekking")}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
              {report.language ? (
                <>
                  <LangPill label="EN" n={report.language.en} accent={P.sky} />
                  <LangPill label="AF" n={report.language.af} accent={P.violet} />
                  {report.supportingMaterial && (
                    <span style={{ fontSize: 12.5, fontWeight: 700, alignSelf: "center" }}>
                      <FileText style={{ width: 12, height: 12, display: "inline" }} /> {report.supportingMaterial.withStimulus}/{report.supportingMaterial.total} {t("with supporting material", "met ondersteunende materiaal")}
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 12.5 }}>{t("Unavailable (migration pending)", "Nie beskikbaar (migrasie hangend)")}</span>
              )}
            </div>

            {/* Worst-5 sample */}
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", margin: "0 0 8px" }}>
              {t("Lowest-scoring rows", "Laagste-gegradeerde rye")}
            </p>
            {report.worst.length === 0 ? (
              <p style={{ fontSize: 13, margin: 0 }}>{t("No rows yet.", "Nog geen rye nie.")}</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {report.worst.map((w) => (
                  <div
                    key={w.id}
                    data-testid={`sim-qa-worst-${w.id}`}
                    style={{
                      border: "2px solid #1b1922",
                      borderRadius: 11, padding: "10px 14px",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 5 }}>
                      <ScorePill label="Q" n={w.qualityScore} />
                      <ScorePill label="CAPS" n={w.capsAlignment} />
                      <ScorePill label="STR" n={w.structureScore} />
                      {w.language && <Tag text={w.language.toUpperCase()} c={P.sky} />}
                      <Tag text={w.hasMemo ? t("memo ✓", "memo ✓") : t("no memo", "geen memo")} c={w.hasMemo ? P.mint : P.pink} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                      {w.questionText || t("(empty)", "(leeg)")}…
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LangPill({ label, n, accent }: { label: string; n: number; accent: string }) {
  const has = n > 0;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        border: `2px solid ${has ? accent : P.pink}`, borderRadius: 999,
        padding: "6px 14px", fontWeight: 900, fontSize: 13,
        color: has ? accent : P.pink,
      }}
    >
      {label} · {n}
    </span>
  );
}

function ScorePill({ label, n }: { label: string; n: number }) {
  const c = n >= 92 ? P.mint : n >= 85 ? P.butter : P.pink;
  return (
    <span style={{ fontSize: 11, fontWeight: 900, color: c, border: `1.5px solid ${c}`, borderRadius: 8, padding: "2px 8px" }}>
      {label} {n}
    </span>
  );
}

function Tag({ text, c }: { text: string; c: string }) {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 900, color: c, border: `1.5px solid ${c}`, borderRadius: 999, padding: "2px 8px", textTransform: "uppercase", letterSpacing: 0.3 }}>
      {text}
    </span>
  );
}

// ── CAPS topic-coverage modal ────────────────────────────────────────────────
// Same dark sticker-card aesthetic as QaModal. Shows coverage % (X/Y CAPS
// topics), a high-yield summary, and the full topic list with a covered ✓/✗
// chip, a ⚡ HIGH-YIELD badge, and the simulated count — missing high-yield
// topics sorted to the top by the server. "Generate Missing Topics" fires the
// top-N (high-yield first) missing topics at the topic-targeted endpoint; each
// missing row also has its own "Generate".
function CoverageModal({
  subject, report, loading, gen, missingCap, isAf, onClose, onGenerate,
}: {
  subject: string;
  report: CoverageReport | null;
  loading: boolean;
  gen: { done: number; total: number; current: string } | null;
  missingCap: number;
  isAf: boolean;
  onClose: () => void;
  onGenerate: (topics: string[]) => void;
}) {
  const t = (en: string, af: string) => (isAf ? af : en);
  const accent = ACCENTS[Math.abs(hash(subject)) % ACCENTS.length];
  const busy = gen !== null;

  const missing = report ? report.topics.filter((x) => !x.covered) : [];
  // Already sorted high-yield-missing first by the server → just take the top N.
  const missingBatch = missing.slice(0, missingCap).map((x) => x.topic);
  const pctColor = report && report.coveragePct >= 80 ? P.mint : report && report.coveragePct >= 50 ? P.butter : P.pink;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.78)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 16px", overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-testid="sim-coverage-panel"
        style={{
          width: "100%", maxWidth: 760,
          background: "#050508",
          border: `2.5px solid ${accent}`,
          boxShadow: `7px 7px 0 0 ${accent}`,
          borderRadius: 18,
          padding: "22px 22px 26px",
          color: "#fff", fontFamily: "'Poppins',sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: "#fff" }}>
              {t("CAPS topic coverage", "CAPS-onderwerpdekking")}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 900, color: accent }}>{subject}</p>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            data-testid="sim-coverage-close"
            aria-label={t("Close", "Maak toe")}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "transparent", color: "#fff",
              border: "2px solid #1b1922", borderRadius: 10,
              width: 40, height: 40, cursor: busy ? "not-allowed" : "pointer", flexShrink: 0,
              opacity: busy ? 0.4 : 1,
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {loading || !report ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Loader2 className="animate-spin" style={{ width: 26, height: 26, color: accent }} />
          </div>
        ) : (
          <>
            {/* Coverage summary banner */}
            <div
              data-testid="sim-coverage-summary"
              style={{
                background: pctColor, color: "#050508",
                borderRadius: 14, padding: "14px 18px", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                boxShadow: "4px 4px 0 0 rgba(0,0,0,.85)",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 26, lineHeight: 1 }}>{report.coveragePct}%</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 15 }}>
                  {report.coveredCount}/{report.totalTopics} {t("CAPS topics covered", "CAPS-onderwerpe gedek")}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 700 }}>
                  ⚡ {report.highYieldCovered}/{report.highYieldTotal} {t("high-yield covered", "hoë-opbrengs gedek")} · {missing.length} {t("missing", "ontbreek")}
                </p>
              </div>
            </div>

            {report.note && (
              <p style={{ fontSize: 12, color: P.butter, margin: "0 0 14px", fontWeight: 700 }}>⚠ {report.note}</p>
            )}

            {/* Generate missing controls */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <button
                onClick={() => onGenerate(missingBatch)}
                disabled={busy || missingBatch.length === 0}
                data-testid={`sim-gen-missing-${subject}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: missingBatch.length === 0 ? "transparent" : accent,
                  color: missingBatch.length === 0 ? "#fff" : "#050508",
                  border: `2px solid ${accent}`, borderRadius: 10,
                  padding: "10px 16px", fontWeight: 900, fontSize: 13.5,
                  cursor: busy || missingBatch.length === 0 ? "not-allowed" : "pointer",
                  opacity: busy || missingBatch.length === 0 ? 0.55 : 1,
                  boxShadow: missingBatch.length === 0 ? "none" : "3px 3px 0 0 rgba(0,0,0,.85)",
                  minHeight: 44,
                }}
              >
                {busy ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <Zap style={{ width: 15, height: 15 }} />}
                {t("Generate Missing Topics", "Genereer Ontbrekende Onderwerpe")}
                {missingBatch.length > 0 ? ` (${missingBatch.length})` : ""}
              </button>
              {busy && gen && (
                <span data-testid="sim-coverage-progress" style={{ fontSize: 12.5, fontWeight: 800, color: accent }}>
                  {gen.done + 1}/{gen.total}… <span style={{ fontWeight: 700 }}>{gen.current}</span>
                </span>
              )}
              {!busy && missing.length > missingCap && (
                <span style={{ fontSize: 11.5 }}>
                  {t(`Top ${missingCap} high-yield first`, `Boonste ${missingCap} hoë-opbrengs eerste`)}
                </span>
              )}
            </div>

            {/* Topic list */}
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", margin: "0 0 8px" }}>
              {t("Topics", "Onderwerpe")}
            </p>
            {report.topics.length === 0 ? (
              <p style={{ fontSize: 13, margin: 0 }}>{t("No CAPS topics available for this subject.", "Geen CAPS-onderwerpe vir hierdie vak nie.")}</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {report.topics.map((tp) => (
                  <div
                    key={tp.topic}
                    data-testid={`sim-coverage-topic-${tp.topic}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                      border: `2px solid ${tp.covered ? "rgba(148,247,197,0.5)" : tp.highYield ? P.pink : "#1b1922"}`,
                      borderRadius: 11, padding: "10px 14px",
                    }}
                  >
                    <span style={{ color: tp.covered ? P.mint : P.pink, display: "inline-flex", flexShrink: 0 }}>
                      {tp.covered ? <Check style={{ width: 17, height: 17, strokeWidth: 3 }} /> : <X style={{ width: 17, height: 17, strokeWidth: 3 }} />}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 13.5, flex: 1, minWidth: 120 }}>{tp.topic}</span>
                    {tp.highYield && <Tag text={`⚡ ${t("high-yield", "hoë-opbrengs")}`} c={P.butter} />}
                    {tp.frequencyRank != null && (
                      <span style={{ fontSize: 10.5, fontWeight: 800 }}>#{tp.frequencyRank}</span>
                    )}
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: tp.simulatedCount > 0 ? P.mint : "#fff", opacity: tp.simulatedCount > 0 ? 1 : 0.55 }}>
                      {tp.simulatedCount} {t("sim", "sim")}
                    </span>
                    {!tp.covered && (
                      <button
                        onClick={() => onGenerate([tp.topic])}
                        disabled={busy}
                        data-testid={`sim-cov-gen-${tp.topic}`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: "transparent", color: accent,
                          border: `2px solid ${accent}`, borderRadius: 9,
                          padding: "6px 12px", fontWeight: 800, fontSize: 12,
                          cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1,
                          minHeight: 36,
                        }}
                      >
                        <Zap style={{ width: 13, height: 13 }} />
                        {t("Generate", "Genereer")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
