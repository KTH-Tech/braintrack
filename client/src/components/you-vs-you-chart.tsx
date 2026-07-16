import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Zap } from "lucide-react";

const NEON = "#7FEFFF";
const NEON_GLOW = "rgba(0,229,255,0.35)";
const DOWN = "#FF9FE5";

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
  if (diff > 0) return NEON;
  if (diff < 0) return DOWN;
  return "rgba(255,255,255,0.45)";
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
      <Icon className="w-3 h-3" style={{ color: hex, filter: `drop-shadow(0 0 3px ${hex})` }} />
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
        className="h-full min-h-[180px] rounded-2xl bg-black"
        style={{ border: `1px solid ${NEON}33` }}
      />
    );
  }
  if (!data) {
    return (
      <div
        className="h-full rounded-2xl bg-black p-5 flex flex-col items-center justify-center text-center"
        style={{ border: `1px solid ${NEON}55`, boxShadow: `0 0 14px ${NEON_GLOW}` }}
      >
        <Target className="w-7 h-7 mb-2" style={{ color: NEON, filter: `drop-shadow(0 0 6px ${NEON})` }} />
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
    { icon: Target,   labelEn: "Accuracy",   labelAf: "Akkuraatheid", now: thisWeek.accuracy,          prev: lastWeek.accuracy,          suffix: "%", hex: "#7FEFFF" },
    { icon: Zap,      labelEn: "Questions",  labelAf: "Vrae",         now: thisWeek.questionsAnswered, prev: lastWeek.questionsAnswered, suffix: "",  hex: "#FFF29E" },
    { icon: Calendar, labelEn: "Study Days", labelAf: "Studiedae",    now: thisWeek.studyDays,         prev: lastWeek.studyDays,         suffix: "",  hex: "#C6A4FF" },
  ];

  return (
    <div
      className="h-full rounded-2xl bg-black p-5 flex flex-col gap-4"
      style={{ border: `1px solid ${NEON}55`, boxShadow: `0 0 18px ${NEON_GLOW}` }}
      data-testid="you-vs-you-chart"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white">
          {isAf ? "Hierdie week vs vorige" : "This week vs last"}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {metrics.map(({ icon: Icon, labelEn, labelAf, now, prev, suffix, hex }) => {
          const diff = now - prev;
          return (
            <div
              key={labelEn}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: `${hex}0d`, border: `1px solid ${hex}2e` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${hex}1a`, border: `1px solid ${hex}44` }}
              >
                <Icon className="w-4 h-4" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex}99)` }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white">
                  {isAf ? labelAf : labelEn}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span
                    className="text-xl font-black tabular-nums leading-none"
                    style={{ color: hex, textShadow: `0 0 10px ${hex}55` }}
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
