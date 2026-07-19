import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Zap } from "lucide-react";

const ACCENT = "#9FD8FF";
const ACCENT_GLOW = "rgba(159,216,255,0.3)";
const UP = "#94F7C5";
const DOWN = "#FF8DA1";

interface WeeklyData {
  accuracy: number;
  questionsAnswered: number;
  studyDays: number;
}
interface WeeklyComparison {
  thisWeek: WeeklyData;
  lastWeek: WeeklyData;
}
interface YouVsYouChartProps { isAf?: boolean }

function deltaHex(diff: number) {
  if (diff > 0) return UP;
  if (diff < 0) return DOWN;
  return "#FFE29A";
}

function DeltaPill({ diff, suffix = "" }: { diff: number; suffix?: string }) {
  const hex = deltaHex(diff);
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const label = diff === 0 ? "0" : `${diff > 0 ? "+" : ""}${diff}${suffix}`;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-black tabular-nums"
      style={{ color: hex, background: `${hex}14`, border: `1px solid ${hex}40` }}
    >
      <Icon className="w-3 h-3" style={{ color: hex }} />
      {label}
    </span>
  );
}

export function YouVsYouChart({ isAf = false }: YouVsYouChartProps) {
  const { data, isLoading } = useQuery<WeeklyComparison>({
    queryKey: ["/api/user/weekly-comparison"],
    refetchInterval: 300000,
  });

  if (isLoading) {
    return (
      <div
        className="h-full min-h-[180px] animate-pulse"
        style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20 }}
      />
    );
  }
  if (!data) {
    return (
      <div
        className="h-full p-5 flex flex-col items-center justify-center text-center"
        style={{ background: "rgba(255,255,255,.03)", border: `1.5px solid ${ACCENT}`, borderRadius: 20, boxShadow: `0 0 18px ${ACCENT_GLOW}` }}
      >
        <Target className="w-7 h-7 mb-2" style={{ color: ACCENT }} />
        <p className="text-sm font-semibold text-white">
          {isAf ? "Nog geen weeklikse data nie" : "No weekly data yet"}
        </p>
        <p className="text-[11px] text-white mt-1">
          {isAf ? "Studeer 'n paar dae om vergelykings te sien." : "Study a few days to see comparisons."}
        </p>
      </div>
    );
  }

  const { thisWeek, lastWeek } = data;

  const metrics = [
    { icon: Target,   labelEn: "Accuracy",   labelAf: "Akkuraatheid", now: thisWeek.accuracy,          prev: lastWeek.accuracy,          suffix: "%", hex: "#9FD8FF" },
    { icon: Zap,      labelEn: "Questions",  labelAf: "Vrae",         now: thisWeek.questionsAnswered, prev: lastWeek.questionsAnswered, suffix: "",  hex: "#FFE29A" },
    { icon: Calendar, labelEn: "Study Days", labelAf: "Studiedae",    now: thisWeek.studyDays,         prev: lastWeek.studyDays,         suffix: "",  hex: "#C5B3FF" },
  ];

  return (
    <div
      className="h-full p-5 flex flex-col gap-4"
      style={{ background: "rgba(255,255,255,.03)", border: `1.5px solid ${ACCENT}`, borderRadius: 20, boxShadow: `0 0 18px ${ACCENT_GLOW}` }}
      data-testid="you-vs-you-chart"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: ACCENT, fontFamily: "'Poppins',sans-serif", fontWeight: 800 }}>
          {isAf ? "Hierdie week vs vorige" : "This week vs last"}
        </p>
        <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 14, color: "#FFB7E5", transform: "rotate(-2deg)", display: "inline-block" }}>
          {isAf ? "jy vs JY" : "you vs YOU"}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {metrics.map(({ icon: Icon, labelEn, labelAf, now, prev, suffix, hex }) => {
          const diff = now - prev;
          return (
            <div
              key={labelEn}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${hex}55`, boxShadow: `0 0 10px ${hex}26` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${hex}26` }}
              >
                <Icon className="w-4 h-4" style={{ color: hex }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white" style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800 }}>
                  {isAf ? labelAf : labelEn}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span
                    className="text-xl font-black tabular-nums leading-none"
                    style={{ color: hex }}
                  >
                    {now}{suffix}
                  </span>
                  <span className="text-[10px] font-semibold tabular-nums text-white leading-none">
                    {isAf ? "vorige" : "prev"} {prev}{suffix}
                  </span>
                </div>
              </div>

              <DeltaPill diff={diff} suffix={suffix} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
