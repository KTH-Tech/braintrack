import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Target, TrendingUp, ShieldCheck, Rocket, AlertTriangle } from "lucide-react";
import { calcReadiness, readinessBand } from "@/lib/readiness";
import type { DailyDirective } from "@/types/daily-directive";

const URGENCY_HEX: Record<string, { hex: string }> = {
  final_sprint:     { hex: "#FFB7E5" },
  exam_prep_mode:   { hex: "#FFE29A" },
  focused_revision: { hex: "#FFE29A" },
  build_mastery:    { hex: "#C5B3FF" },
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

const BAND_PASTEL: Record<string, { hex: string }> = {
  red:   { hex: "#FF8DA1" },
  amber: { hex: "#FFE29A" },
  green: { hex: "#94F7C5" },
};

function bandPastel(band: string) {
  return BAND_PASTEL[band] ?? BAND_PASTEL.amber;
}

function BandDot({ band }: { band: string }) {
  const n = bandPastel(band);
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ background: n.hex }}
    />
  );
}

function bandLabel(band: string, isAf: boolean) {
  if (band === "red") return isAf ? "Swak" : "Weak";
  if (band === "amber") return isAf ? "Matig" : "Fair";
  return isAf ? "Goed" : "Good";
}

const ACCENT = "#9FF5E8";

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
  const overallPastel = bandPastel(overallBand);

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

  return (
    <div
      className="relative overflow-hidden"
      data-testid="study-plan-widget"
      style={{
        background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
        border: `1.5px solid ${ACCENT}`,
        borderRadius: 20,
      }}
    >
      {/* rainbow hairline */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }}
      />

      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: ACCENT }} />
          <h2 className="text-sm uppercase tracking-[0.14em]" style={{ color: ACCENT, fontFamily: "'Poppins',sans-serif", fontWeight: 800 }}>
            {isAf ? "Studieplan" : "Study Plan"}
          </h2>
        </div>
        <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", transform: "rotate(-2deg)", display: "inline-block" }}>
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
              className="relative rounded-2xl p-4 overflow-hidden"
              style={{
                background: "rgba(255,255,255,.03)",
                border: `1.5px solid ${u.hex}`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${u.hex}26` }}
                >
                  {directive.isExamToday ? (
                    <AlertTriangle className="w-5 h-5" style={{ color: u.hex }} />
                  ) : (
                    <Rocket className="w-5 h-5" style={{ color: u.hex }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: u.hex, fontFamily: "'Poppins',sans-serif", fontWeight: 800 }}>
                      {directive.isExamToday
                        ? (isAf ? "Eksamen Vandag" : "Exam Today")
                        : (isAf ? "Vandag se Fokus" : "Today's Focus")}
                    </p>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ color: u.hex, background: `${u.hex}1F`, border: `1px solid ${u.hex}66` }}
                    >
                      {isAf ? directive.urgencyLabelAf : directive.urgencyLabel}
                    </span>
                  </div>
                  <p className="text-base font-black text-white leading-tight truncate">
                    {subjectLabel}{directive.paperNumber ? ` · ${isAf ? "V" : "P"}${directive.paperNumber}` : ""}
                  </p>
                  <p className="text-[11px] mt-1 leading-snug" style={{ color: "#ffffff" }}>
                    {isAf ? directive.messageAf : directive.message}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2.5 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-black tabular-nums leading-none"
                        style={{ fontSize: 28, color: u.hex }}
                      >
                        {days}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#ffffff" }}>
                        {days === 1 ? (isAf ? "dag oor" : "day left") : (isAf ? "dae oor" : "days left")}
                      </span>
                    </div>
                    <Link href={directive.deepLink}>
                      <button
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-[10px] text-[11px]"
                        data-testid="today-directive-cta"
                        style={{
                          fontFamily: "'Poppins',sans-serif",
                          fontWeight: 800,
                          color: "#050508",
                          background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
                          border: "none",
                          cursor: "pointer",
                          transition: "all .2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(159,245,232,.35)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
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
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
            />
          ))
        ) : topics.length === 0 ? (
          <div className="text-center py-7">
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(148,247,197,.16)",
              }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: "#94F7C5" }} />
            </div>
            <p className="text-xs font-bold" style={{ color: "#ffffff" }}>
              {isAf ? "Geen swak onderwerpe gevind nie. Goeie werk!" : "No weak topics found — great work!"}
            </p>
          </div>
        ) : (
          topics.map((wt, idx) => {
            const t = wt.topic!;
            const href = `/subject/${t.subjectId}`;
            const subjectReadiness = readinessData?.readiness?.[t.subjectId];
            const pastel = bandPastel(wt.masteryBand);
            const tierHex = subjectReadiness !== undefined ? bandPastel(readinessBand(subjectReadiness)).hex : pastel.hex;
            return (
              <div
                key={wt.topicId}
                className="flex items-center gap-3 p-3 rounded-xl"
                data-testid={`study-plan-topic-${idx}`}
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: `1px solid ${pastel.hex}55`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 tabular-nums"
                  style={{
                    background: `${pastel.hex}26`,
                    color: pastel.hex,
                  }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <BandDot band={wt.masteryBand} />
                    <p className="font-bold text-sm truncate" style={{ color: "#ffffff" }}>
                      {isAf ? (t.nameAfrikaans || t.name) : t.name}
                    </p>
                  </div>
                  <p className="text-[10px] mt-0.5 flex flex-wrap items-center gap-1.5" style={{ color: "#ffffff" }}>
                    <span className="font-bold tabular-nums" style={{ color: pastel.hex }}>
                      {wt.masteryScore}%
                    </span>
                    <span>· {bandLabel(wt.masteryBand, isAf)}</span>
                    <span style={{ color: "#ffffff" }}>·</span>
                    <span>{subjectName(t.subjectId)}</span>
                  </p>
                </div>
                <Link href={href}>
                  <button
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[10px] uppercase tracking-[0.1em]"
                    data-testid={`study-now-${idx}`}
                    style={{
                      fontFamily: "'Poppins',sans-serif",
                      fontWeight: 800,
                      color: tierHex,
                      background: "transparent",
                      border: `1.5px solid ${tierHex}`,
                      cursor: "pointer",
                      transition: "transform .2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
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
          <div className="pt-3 mt-1 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }} data-testid="readiness-summary">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em]" style={{ color: ACCENT, fontFamily: "'Poppins',sans-serif", fontWeight: 800 }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {isAf ? "Gereedheidstellings" : "Readiness Scores"}
              </p>
              <span
                data-testid="readiness-overall"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.14em]"
                style={{
                  background: `${overallPastel.hex}1F`,
                  border: `1px solid ${overallPastel.hex}`,
                  color: overallPastel.hex,
                }}
              >
                {isAf ? "Algeheel" : "Overall"}
                <span className="tabular-nums">
                  {overallReadiness}%
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {readinessEntries.map(([subjectId, score]) => {
                const band = readinessBand(score);
                const n = bandPastel(band);
                return (
                  <Link href={`/subject/${subjectId}`} key={subjectId}>
                    <span
                      data-testid={`readiness-pill-${subjectId}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-transform hover:-translate-y-0.5"
                      style={{
                        background: `${n.hex}14`,
                        border: `1px solid ${n.hex}`,
                        color: "#ffffff",
                      }}
                    >
                      <span className="truncate max-w-[110px]">{subjectName(subjectId)}</span>
                      <span style={{ color: "#ffffff" }}>·</span>
                      <span className="tabular-nums font-black" style={{ color: n.hex }}>
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
