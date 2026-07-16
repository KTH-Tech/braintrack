import { useQuery } from "@tanstack/react-query";
import { Award, Trophy, TrendingUp } from "lucide-react";

const NEON = "#FFF29E";
const NEON_GLOW = "rgba(255,230,0,0.35)";

/* Canonical band colours (rainbow-anchored) */
function scoreNeon(score: number) {
  if (score >= 80) return "#7FEFFF"; // cyan
  if (score >= 60) return "#FFF29E"; // gold
  return "#FF9FE5";                  // pink (for "needs work")
}

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
        className="h-full min-h-[180px] rounded-2xl bg-black p-5 space-y-2"
        style={{ border: `1px solid ${NEON}33` }}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }} />
        ))}
      </div>
    );
  }

  if (bests.length === 0) {
    return (
      <div
        className="h-full rounded-2xl bg-black p-6 text-center flex flex-col items-center justify-center"
        style={{ border: `1px solid ${NEON}55`, boxShadow: `0 0 14px ${NEON_GLOW}` }}
      >
        <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: NEON, filter: `drop-shadow(0 0 6px ${NEON})` }} />
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
      className="h-full rounded-2xl bg-black p-4 flex flex-col gap-2"
      style={{ border: `1px solid ${NEON}55`, boxShadow: `0 0 18px ${NEON_GLOW}` }}
      data-testid="personal-bests-widget"
    >
      {topBests.map((pb, index) => {
        const hex = scoreNeon(pb.highest_score);
        const isTop = index === 0;
        return (
          <div
            key={pb.id}
            className="flex items-center gap-3 p-3 rounded-xl transition-colors"
            style={{
              background: `${hex}10`,
              border: `1px solid ${hex}35`,
            }}
            data-testid={`personal-best-${pb.subject_code}`}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${hex}1f`, border: `1px solid ${hex}55` }}
            >
              {isTop ? (
                <Award className="w-4 h-4" style={{ color: NEON, filter: `drop-shadow(0 0 4px ${NEON})` }} />
              ) : (
                <TrendingUp className="w-4 h-4" style={{ color: hex }} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white truncate">
                {isAf ? pb.subject_name_af : pb.subject_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${pb.highest_score}%`,
                      background: hex,
                      boxShadow: `0 0 6px ${hex}`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p
                className="text-sm font-black tabular-nums"
                style={{ color: hex, textShadow: `0 0 8px ${hex}88` }}
              >
                {pb.highest_score}%
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white">
                {isAf ? "Rekord" : "Record"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
