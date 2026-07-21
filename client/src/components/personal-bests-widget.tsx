import { useQuery } from "@tanstack/react-query";
import { Award, Trophy, TrendingUp } from "lucide-react";

const ACCENT = "#FFE29A";

/* Canonical band colours (street-pastel-anchored) */
function scorePastel(score: number) {
  if (score >= 80) return "#94F7C5"; // mint — strong
  if (score >= 60) return "#FFE29A"; // yellow — solid
  return "#FF8DA1";                  // alert — needs work
}

/* Companion pastel for the bar gradient (accent → next accent) */
const BAR_NEXT: Record<string, string> = {
  "#94F7C5": "#9FF5E8",
  "#FFE29A": "#94F7C5",
  "#FF8DA1": "#FFB7E5",
};

interface PersonalBest {
  id: number;
  user_id: string;
  subject_id: number;
  subject_name: string;
  subject_name_af: string;
  subject_code: string;
  highest_score: number;
  highest_score_at: string | null;
  best_streak: number;
  total_sessions: number;
}

interface PersonalBestsWidgetProps { isAf?: boolean }

export function PersonalBestsWidget({ isAf = false }: PersonalBestsWidgetProps) {
  const { data: bests = [], isLoading } = useQuery<PersonalBest[]>({
    queryKey: ["/api/user/personal-bests"],
    refetchInterval: 120000,
  });

  if (isLoading) {
    return (
      <div
        className="h-full min-h-[180px] p-5 space-y-2"
        style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20 }}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,.05)" }} />
        ))}
      </div>
    );
  }

  if (bests.length === 0) {
    return (
      <div
        className="h-full p-6 text-center flex flex-col items-center justify-center"
        style={{ background: "rgba(255,255,255,.03)", border: `1.5px solid ${ACCENT}`, borderRadius: 20 }}
      >
        <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: ACCENT }} />
        <p className="text-sm text-white font-semibold">
          {isAf
            ? "Nog geen persoonlike rekords nie — begin om te studeer!"
            : "No personal records yet — start studying!"}
        </p>
      </div>
    );
  }

  const topBests = bests.slice(0, 5);

  return (
    <div
      className="h-full p-4 flex flex-col gap-2"
      style={{ background: "rgba(255,255,255,.03)", border: `1.5px solid ${ACCENT}`, borderRadius: 20 }}
      data-testid="personal-bests-widget"
    >
      {topBests.map((pb, index) => {
        const hex = scorePastel(pb.highest_score);
        const hex2 = BAR_NEXT[hex] ?? "#9FF5E8";
        const isTop = index === 0;
        return (
          <div
            key={pb.id}
            className="flex items-center gap-3 p-3 rounded-xl transition-colors"
            style={{
              background: "rgba(255,255,255,.03)",
              border: `1px solid ${hex}55`,
            }}
            data-testid={`personal-best-${pb.subject_code}`}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${hex}26` }}
            >
              {isTop ? (
                <Award className="w-4 h-4" style={{ color: ACCENT }} />
              ) : (
                <TrendingUp className="w-4 h-4" style={{ color: hex }} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white truncate">
                {isAf ? pb.subject_name_af : pb.subject_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.08)" }}>
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${pb.highest_score}%`,
                      background: `linear-gradient(90deg,${hex},${hex2})`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-black tabular-nums" style={{ color: hex }}>
                {pb.highest_score}%
              </p>
              {isTop ? (
                <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", transform: "rotate(-2deg)", display: "inline-block" }}>
                  {isAf ? "Rekord" : "Record"}
                </p>
              ) : (
                <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: hex, fontFamily: "'Poppins',sans-serif", fontWeight: 800 }}>
                  {isAf ? "Rekord" : "Record"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
