import { useQuery } from "@tanstack/react-query";
import { Flame, Star, Zap, Target, Trophy, GraduationCap, Award, BookOpen, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const NEON = "#FFC48F";
const NEON_GLOW = "rgba(255,138,0,0.35)";

const BADGE_ICONS: Record<string, any> = {
  streak_3: Flame, streak_7: Flame, streak_14: Flame, streak_30: Flame,
  questions_10: Star, questions_50: Star, questions_100: Zap, questions_500: Zap,
  accuracy_70: Target, accuracy_80: Target, accuracy_90: Trophy,
  subject_mastery: GraduationCap, exam_complete: Award, first_paper: BookOpen,
  high_score: Trophy, study_week: Sparkles, topic_mastery: Target,
  improvement_15: Zap,
};

interface NextMilestone {
  badgeCode: string;
  name: string;
  nameAf: string;
  progressPct: number;
  currentValue: number;
  targetValue: number;
  unit: string;
}

interface NextMilestoneWidgetProps { isAf?: boolean }

export function NextMilestoneWidget({ isAf = false }: NextMilestoneWidgetProps) {
  const { data: milestone, isLoading } = useQuery<NextMilestone | null>({
    queryKey: ["/api/user/next-milestone"],
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div
        className="h-full min-h-[180px] rounded-2xl bg-black"
        style={{ border: `1px solid ${NEON}33` }}
      />
    );
  }

  if (!milestone) {
    return (
      <div
        className="h-full rounded-2xl bg-black p-5 text-center flex flex-col items-center justify-center"
        style={{ border: `1px solid ${NEON}55`, boxShadow: `0 0 14px ${NEON_GLOW}` }}
      >
        <Trophy className="w-7 h-7 mx-auto mb-2" style={{ color: NEON, filter: `drop-shadow(0 0 6px ${NEON})` }} />
        <p className="text-sm font-semibold text-white">
          {isAf ? "Jy't al die mylpale bereik!" : "You've reached all milestones!"}
        </p>
        <Link href="/rewards">
          <button
            className="text-[11px] font-bold mt-2 inline-flex items-center gap-1 uppercase tracking-[0.16em]"
            style={{ color: NEON }}
            data-testid="next-milestone-view-all"
          >
            {isAf ? "Sien al jou kentekens" : "View all badges"} <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>
    );
  }

  const Icon = BADGE_ICONS[milestone.badgeCode] || Trophy;
  const remaining = Math.max(0, milestone.targetValue - milestone.currentValue);

  return (
    <Link href="/rewards" className="block h-full">
      <div
        className="h-full rounded-2xl bg-black p-5 flex flex-col gap-4 cursor-pointer transition-transform hover:scale-[1.01]"
        style={{ border: `1px solid ${NEON}55`, boxShadow: `0 0 18px ${NEON_GLOW}` }}
        data-testid="next-milestone-widget"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${NEON}18`, border: `1px solid ${NEON}55` }}
          >
            <Icon className="w-5 h-5" style={{ color: NEON, filter: `drop-shadow(0 0 6px ${NEON})` }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white">
              {isAf ? "Jaag jou volgende kenteken" : "Chasing your next badge"}
            </p>
            <p className="text-sm font-bold text-white truncate">
              {isAf ? milestone.nameAf : milestone.name}
            </p>
          </div>
          <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color: NEON }}>
            {milestone.currentValue}/{milestone.targetValue}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${milestone.progressPct}%`,
                background: "linear-gradient(90deg, #FFC48F, #FFC48F, #FFF29E, #FFF29E)",
                boxShadow: `0 0 10px ${NEON}`,
              }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-black tabular-nums" style={{ color: NEON }}>{milestone.progressPct}%</span>
            <span className="text-[10px] text-white font-semibold">
              {isAf
                ? `Nog ${remaining} ${milestone.unit}`
                : `${remaining} ${milestone.unit} to go`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
