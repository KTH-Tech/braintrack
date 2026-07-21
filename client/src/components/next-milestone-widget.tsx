import { useQuery } from "@tanstack/react-query";
import { Flame, Star, Zap, Target, Trophy, GraduationCap, Award, BookOpen, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const ACCENT = "#FFE29A";

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
        className="h-full min-h-[180px] animate-pulse"
        style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20 }}
      />
    );
  }

  if (!milestone) {
    return (
      <div
        className="h-full p-5 text-center flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: `1.5px solid ${ACCENT}`, borderRadius: 20 }}
      >
        <Trophy className="w-7 h-7 mx-auto mb-2" style={{ color: ACCENT }} />
        <p className="text-sm font-semibold text-white">
          {isAf ? "Jy't al die mylpale bereik!" : "You've reached all milestones!"}
        </p>
        <Link href="/rewards">
          <button
            className="text-[11px] mt-2 inline-flex items-center gap-1 uppercase tracking-[0.14em]"
            style={{ color: ACCENT, fontFamily: "'Poppins',sans-serif", fontWeight: 800, background: "transparent", border: "none", cursor: "pointer" }}
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
        className="h-full p-5 flex flex-col gap-4 cursor-pointer transition-transform hover:-translate-y-1"
        style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: `1.5px solid ${ACCENT}`, borderRadius: 20 }}
        data-testid="next-milestone-widget"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${ACCENT}26` }}
          >
            <Icon className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-[0.18em]" style={{ color: ACCENT, fontFamily: "'Poppins',sans-serif", fontWeight: 800 }}>
              {isAf ? "Jaag jou volgende kenteken" : "Chasing your next badge"}
            </p>
            <p
              className="truncate"
              style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", transform: "rotate(-2deg)", transformOrigin: "left center" }}
            >
              {isAf ? milestone.nameAf : milestone.name}
            </p>
          </div>
          <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color: ACCENT }}>
            {milestone.currentValue}/{milestone.targetValue}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.08)" }}>
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${milestone.progressPct}%`,
                background: "linear-gradient(90deg,#FFE29A,#94F7C5)",
              }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-black tabular-nums" style={{ color: ACCENT }}>{milestone.progressPct}%</span>
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
