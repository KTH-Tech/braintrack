import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Target, TrendingUp, ShieldCheck, Rocket, AlertTriangle } from "lucide-react";
import { calcReadiness, readinessBand } from "@/lib/readiness";
import type { DailyDirective } from "@/types/daily-directive";

const URGENCY_HEX: Record<string, { hex: string; halo: string }> = {
  final_sprint:     { hex: "#FF9FE5", halo: "rgba(255,43,214,0.45)" },
  exam_prep_mode:   { hex: "#FFC48F", halo: "rgba(255,138,0,0.45)" },
  focused_revision: { hex: "#FFF29E", halo: "rgba(255,230,0,0.45)" },
  build_mastery:    { hex: "#C6A4FF", halo: "rgba(138,43,255,0.45)" },
};

interface WeakTopic {
  topicId: number;
  masteryScore: number;
  masteryBand: string;
  topic: {
    id: number;
    name: string;
    nameAfrikaans: string;
    subjectId: number;
  } | null;
}

interface ReadinessData {
  readiness: Record<number, number>;
}

interface SubjectLite {
  id: number;
  name: string;
  nameAfrikaans?: string | null;
}

interface StudyPlanProps {
  isAf: boolean;
}

const BAND_NEON: Record<string, { hex: string; glow: string; text: string }> = {
  red:   { hex: "#FF9FE5", glow: "rgba(255,43,214,0.55)", text: "#f5a8cc" },
  amber: { hex: "#FFF29E", glow: "rgba(255,230,0,0.55)", text: "#ffe98a" },
  green: { hex: "#7FEFFF", glow: "rgba(0,229,255,0.55)", text: "#a8ecf3" },
};

function bandNeon(band: string) {
  return BAND_NEON[band] ?? BAND_NEON.amber;
}

function BandDot({ band }: { band: string }) {
  const n = bandNeon(band);
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ background: n.hex, boxShadow: `0 0 8px ${n.glow}, 0 0 14px ${n.glow}` }}
    />
  );
}

function bandLabel(band: string, isAf: boolean) {
  if (band === "red") return isAf ? "Swak" : "Weak";
  if (band === "amber") return isAf ? "Matig" : "Fair";
  return isAf ? "Goed" : "Good";
}

export function LearnerStudyPlan({ isAf }: StudyPlanProps) {
  const { data: directive } = useQuery<DailyDirective>({
    queryKey: ["/api/learner/today-directive"],
    staleTime: 60_000,
    retry: false,
  });

  const { data, isLoading } = useQuery<{ weakTopics: WeakTopic[] }>({
    queryKey: ["/api/mastery/weak-topics", 3],
    queryFn: () => fetch("/api/mastery/weak-topics?limit=3", { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });

  const { data: readinessData } = useQuery<ReadinessData>({
    queryKey: ["/api/learner/readiness"],
    staleTime: 60000,
  });

  const { data: subjects } = useQuery<SubjectLite[]>({
    queryKey: ["/api/subjects"],
    staleTime: 5 * 60_000,
  });

  const { data: userStats } = useQuery<{ accuracy?: number; studyStreak?: number; questionsAnswered?: number }>({
    queryKey: ["/api/user/stats"],
    staleTime: 60000,
  });

  /* Overall readiness uses the shared formula — same number the dashboard
     hero, progress page Mission Readiness bar, and study calendar all show. */
  const overallReadiness = calcReadiness({
    accuracy: userStats?.accuracy,
    studyStreak: userStats?.studyStreak,
    questionsAnswered: userStats?.questionsAnswered,
  });
  const overallBand = readinessBand(overallReadiness);
  const overallNeon = bandNeon(overallBand);

  const subjectName = (id: number) => {
    const s = subjects?.find(x => x.id === id);
    if (!s) return isAf ? "Vak" : "Subject";
    return isAf ? (s.nameAfrikaans || s.name) : s.name;
  };

  const topics = (data?.weakTopics ?? []).filter(wt => wt.topic);
  const readinessEntries = Object.entries(readinessData?.readiness ?? {})
    .map(([id, score]) => [Number(id), Number(score)] as [number, number])
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3);

  const NEON_CYAN = "#7FEFFF";

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-black"
      data-testid="study-plan-widget"
      style={{
        border: `1.5px solid ${NEON_CYAN}`,
        boxShadow: `0 0 22px rgba(0,229,255,0.35), inset 0 0 14px rgba(0,0,0,0.55)`,
      }}
    >
      {/* corner brackets */}
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 pointer-events-none rounded-tl-[10px]" style={{ borderColor: NEON_CYAN }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 pointer-events-none rounded-tr-[10px]" style={{ borderColor: NEON_CYAN }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 pointer-events-none rounded-bl-[10px]" style={{ borderColor: NEON_CYAN }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 pointer-events-none rounded-br-[10px]" style={{ borderColor: NEON_CYAN }} />
      {/* rainbow hairline */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,#FFC48F,#FFC48F,#FFF29E,#FFF29E,#7FEFFF,#6FA8FF,#C6A4FF,#C6A4FF,#FF9FE5)" }}
      />

      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(0,229,255,0.25)" }}>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: NEON_CYAN, filter: `drop-shadow(0 0 6px ${NEON_CYAN})` }} />
          <h2 className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: NEON_CYAN, textShadow: `0 0 8px rgba(0,229,255,0.6)` }}>
            {isAf ? "Studieplan" : "Study Plan"}
          </h2>
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color:"#ffffff" }}>
          {isAf ? "Top 3 swak" : "Top 3 weak"}
        </span>
      </div>

      {/* ── TODAY directive card — top priority "what to study right now" ── */}
      {directive && directive.hasExam && (() => {
        const u = URGENCY_HEX[directive.urgencyState] ?? URGENCY_HEX.build_mastery;
        const days = directive.daysUntil ?? 0;
        const subjectLabel = isAf ? directive.subjectNameAf : directive.subjectName;
        return (
          <div className="px-4 pt-4" data-testid="today-directive-card">
            <div
              className="relative rounded-xl bg-black p-4 overflow-hidden"
              style={{
                border: `1.5px solid ${u.hex}`,
                boxShadow: `0 0 0 1px ${u.halo}, 0 0 22px ${u.halo}, inset 0 0 14px rgba(0,0,0,0.55)`,
              }}
            >
              <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: u.hex, boxShadow: `0 0 8px ${u.hex}` }} />
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0"
                  style={{ border: `1.5px solid ${u.hex}`, boxShadow: `0 0 12px ${u.halo}, inset 0 0 8px ${u.halo}` }}
                >
                  {directive.isExamToday ? (
                    <AlertTriangle className="w-5 h-5" style={{ color: u.hex, filter: `drop-shadow(0 0 4px ${u.halo})` }} />
                  ) : (
                    <Rocket className="w-5 h-5" style={{ color: u.hex, filter: `drop-shadow(0 0 4px ${u.halo})` }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: u.hex, textShadow: `0 0 6px ${u.halo}` }}>
                      {directive.isExamToday
                        ? (isAf ? "Eksamen Vandag" : "Exam Today")
                        : (isAf ? "Vandag se Fokus" : "Today's Focus")}
                    </p>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black"
                      style={{ color: u.hex, border: `1px solid ${u.hex}66` }}
                    >
                      {isAf ? directive.urgencyLabelAf : directive.urgencyLabel}
                    </span>
                  </div>
                  <p className="text-base font-black text-white leading-tight truncate">
                    {subjectLabel}{directive.paperNumber ? ` · ${isAf ? "V" : "P"}${directive.paperNumber}` : ""}
                  </p>
                  <p className="text-[11px] mt-1 leading-snug" style={{ color:"#ffffff" }}>
                    {isAf ? directive.messageAf : directive.message}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2.5 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-black tabular-nums leading-none"
                        style={{ fontSize: 28, color: u.hex, fontFamily: '"JetBrains Mono", monospace', textShadow: `0 0 12px ${u.halo}` }}
                      >
                        {days}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color:"#ffffff" }}>
                        {days === 1 ? (isAf ? "dag oor" : "day left") : (isAf ? "dae oor" : "days left")}
                      </span>
                    </div>
                    <Link href={directive.deepLink}>
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.16em] bg-black transition-all hover:scale-[1.03]"
                        data-testid="today-directive-cta"
                        style={{
                          color: u.hex,
                          border: `1.5px solid ${u.hex}`,
                          boxShadow: `0 0 12px ${u.halo}`,
                          textShadow: `0 0 6px ${u.halo}`,
                        }}
                      >
                        {isAf ? "Studeer Nou" : "Study Now"}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="p-4 space-y-2.5">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div
              key={i}
              className="h-16 rounded-xl animate-pulse"
              style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)" }}
            />
          ))
        ) : topics.length === 0 ? (
          <div className="text-center py-7">
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(0,229,255,0.10)",
                border: `1px solid ${NEON_CYAN}55`,
                boxShadow: `0 0 14px rgba(0,229,255,0.35)`,
              }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: NEON_CYAN, filter: `drop-shadow(0 0 6px ${NEON_CYAN})` }} />
            </div>
            <p className="text-xs font-bold" style={{ color:"#ffffff" }}>
              {isAf ? "Geen swak onderwerpe gevind nie. Goeie werk!" : "No weak topics found — great work!"}
            </p>
          </div>
        ) : (
          topics.map((wt, idx) => {
            const t = wt.topic!;
            const href = `/subject/${t.subjectId}`;
            const subjectReadiness = readinessData?.readiness?.[t.subjectId];
            const neon = bandNeon(wt.masteryBand);
            const tierHex = subjectReadiness !== undefined ? bandNeon(readinessBand(subjectReadiness)).hex : neon.hex;
            return (
              <div
                key={wt.topicId}
                className="flex items-center gap-3 p-3 rounded-xl bg-black"
                data-testid={`study-plan-topic-${idx}`}
                style={{
                  border: `1px solid ${neon.hex}55`,
                  boxShadow: `0 0 12px ${neon.hex}33, inset 0 0 10px rgba(0,0,0,0.5)`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-black tabular-nums"
                  style={{
                    border: `1px solid ${neon.hex}`,
                    color: neon.hex,
                    boxShadow: `0 0 8px ${neon.glow}`,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <BandDot band={wt.masteryBand} />
                    <p className="font-bold text-sm truncate" style={{ color:"#ffffff" }}>
                      {isAf ? (t.nameAfrikaans || t.name) : t.name}
                    </p>
                  </div>
                  <p className="text-[10px] mt-0.5 flex flex-wrap items-center gap-1.5" style={{ color:"#ffffff" }}>
                    <span className="font-bold tabular-nums" style={{ color: neon.text, fontFamily: '"JetBrains Mono", monospace' }}>
                      {wt.masteryScore}%
                    </span>
                    <span>· {bandLabel(wt.masteryBand, isAf)}</span>
                    <span style={{ color:"#ffffff" }}>·</span>
                    <span>{subjectName(t.subjectId)}</span>
                  </p>
                </div>
                <Link href={href}>
                  <button
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.14em] bg-black transition-all hover:scale-[1.03]"
                    data-testid={`study-now-${idx}`}
                    style={{
                      color: tierHex,
                      border: `1px solid ${tierHex}`,
                      boxShadow: `0 0 10px ${tierHex}55`,
                      textShadow: `0 0 6px ${tierHex}99`,
                    }}
                  >
                    {isAf ? "Studeer" : "Study Now"}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            );
          })
        )}

        {(readinessEntries.length > 0 || overallReadiness > 0) && (
          <div className="pt-3 mt-1 space-y-2" style={{ borderTop: "1px solid rgba(0,229,255,0.18)" }} data-testid="readiness-summary">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: NEON_CYAN }}>
                <ShieldCheck className="w-3.5 h-3.5" style={{ filter: `drop-shadow(0 0 4px ${NEON_CYAN})` }} />
                {isAf ? "Gereedheidstellings" : "Readiness Scores"}
              </p>
              <span
                data-testid="readiness-overall"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-black"
                style={{
                  border: `1px solid ${overallNeon.hex}`,
                  boxShadow: `0 0 8px ${overallNeon.glow}`,
                  color: overallNeon.hex,
                }}
              >
                {isAf ? "Algeheel" : "Overall"}
                <span
                  className="tabular-nums"
                  style={{ fontFamily: '"JetBrains Mono", monospace', textShadow: `0 0 6px ${overallNeon.glow}` }}
                >
                  {overallReadiness}%
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {readinessEntries.map(([subjectId, score]) => {
                const band = readinessBand(score);
                const n = bandNeon(band);
                return (
                  <Link href={`/subject/${subjectId}`} key={subjectId}>
                    <span
                      data-testid={`readiness-pill-${subjectId}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black transition-all hover:scale-[1.03]"
                      style={{
                        border: `1px solid ${n.hex}`,
                        boxShadow: `0 0 8px ${n.glow}`,
                        color: n.text,
                      }}
                    >
                      <span className="truncate max-w-[110px]">{subjectName(subjectId)}</span>
                      <span style={{ color:"#ffffff" }}>·</span>
                      <span
                        className="tabular-nums font-black"
                        style={{ color: n.hex, fontFamily: '"JetBrains Mono", monospace', textShadow: `0 0 6px ${n.glow}` }}
                      >
                        {score}%
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
