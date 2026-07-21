import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Target, Zap, Settings2, Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface GoalData {
  daily: {
    questionsAnswered: number;
    questionsGoal: number;
    pct: number;
  };
  weekly: {
    activeDays: number;
    daysGoal: number;
    pct: number;
    studyMinutes: number;
  };
  settings: {
    dailyQuestionsGoal: number;
    weeklyDaysGoal: number;
  };
  streakDays: number;
}

interface GoalProgressProps {
  isAf: boolean;
}

function LuminousBar({ pct, hex, hex2 }: { pct: number; hex: string; hex2: string }) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative h-3 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.08)" }}>
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
        style={{
          width: `${clampedPct}%`,
          background: `linear-gradient(90deg,${hex},${hex2})`,
          boxShadow: `0 0 12px ${hex}40`,
        }}
      />
    </div>
  );
}

export function GoalProgress({ isAf }: GoalProgressProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [dailyDraft, setDailyDraft] = useState(20);
  const [weeklyDraft, setWeeklyDraft] = useState(5);

  const { data, isLoading } = useQuery<GoalData>({
    queryKey: ["/api/learner/goals"],
    staleTime: 30000,
  });

  const saveGoals = useMutation({
    mutationFn: () =>
      apiRequest("PUT", "/api/learner/goals/settings", {
        dailyQuestionsGoal: dailyDraft,
        weeklyDaysGoal: weeklyDraft,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learner/goals"] });
      setModalOpen(false);
      toast({
        title: isAf ? "Doelwitte gestoor" : "Goals saved",
        description: isAf
          ? "Jou studiedoelwitte is opgedateer."
          : "Your study goals have been updated.",
      });
    },
    onError: () => {
      toast({
        title: isAf ? "Fout" : "Error",
        description: isAf
          ? "Kon nie doelwitte stoor nie. Probeer weer."
          : "Could not save goals. Please try again.",
        variant: "destructive",
      });
    },
  });

  function openModal() {
    setDailyDraft(data?.settings?.dailyQuestionsGoal ?? 20);
    setWeeklyDraft(data?.settings?.weeklyDaysGoal ?? 5);
    setModalOpen(true);
  }

  return (
    <>
      <div
        className="overflow-hidden"
        data-testid="goal-progress-widget"
        style={{
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 20,
        }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Target className="w-5 h-5" style={{ color: "#9FF5E8" }} />
            <h2 className="text-lg" style={{ color: "#ffffff", fontFamily: "'Poppins',sans-serif", fontWeight: 800 }}>
              {isAf ? "Daaglikse Doele" : "Daily Goals"}
            </h2>
            <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", transform: "rotate(-2deg)", display: "inline-block" }}>
              {isAf ? "elke dag tel!" : "every day counts!"}
            </span>
            {data && data.streakDays >= 2 && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,226,154,.14)", border: "1px solid #FFE29A", boxShadow: "0 0 10px rgba(255,226,154,.25)" }}
                title={isAf ? `${data.streakDays}-dag reeks!` : `${data.streakDays}-day streak!`}
              >
                <Flame className="w-3.5 h-3.5" style={{ color: "#FFE29A" }} />
                <span className="text-xs font-bold tabular-nums" style={{ color: "#FFE29A" }}>
                  {data.streakDays}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={openModal}
            aria-label={isAf ? "Stel doelwitte" : "Set goals"}
            className="p-1.5 rounded-lg text-white transition-colors"
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,.14)", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#9FF5E8")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.14)")}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {isLoading ? (
            <>
              <div className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,.05)" }} />
              <div className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,.05)" }} />
            </>
          ) : data ? (
            <>
              <div className="space-y-2" data-testid="daily-goal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" style={{ color: "#9FF5E8" }} />
                    <span className="text-sm font-semibold text-white">
                      {isAf ? "Vrae Vandag" : "Questions Today"}
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-white">
                    <span style={{ color: "#9FF5E8" }}>{data.daily.questionsAnswered}</span>
                    <span className="text-white">/{data.daily.questionsGoal}</span>
                  </span>
                </div>
                <LuminousBar pct={data.daily.pct} hex="#9FF5E8" hex2="#9FD8FF" />
                <p className="text-[10px] text-white">
                  {data.daily.pct >= 100
                    ? (isAf ? "Daaglikse doelwit behaal!" : "Daily goal complete!")
                    : isAf
                    ? `${data.daily.questionsGoal - data.daily.questionsAnswered} vrae oor`
                    : `${data.daily.questionsGoal - data.daily.questionsAnswered} questions left`}
                </p>
              </div>

              <div className="space-y-2" data-testid="weekly-goal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" style={{ color: "#C5B3FF" }} />
                    <span className="text-sm font-semibold text-white">
                      {isAf ? "Studiedae Hierdie Week" : "Study Days This Week"}
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-white">
                    <span style={{ color: "#C5B3FF" }}>{data.weekly.activeDays}</span>
                    <span className="text-white">/{data.weekly.daysGoal}</span>
                  </span>
                </div>
                <LuminousBar pct={data.weekly.pct} hex="#C5B3FF" hex2="#FFB7E5" />
                <p className="text-[10px] text-white">
                  {data.weekly.pct >= 100
                    ? (isAf ? "Weeklikse doelwit behaal!" : "Weekly goal complete!")
                    : isAf
                    ? `${data.weekly.daysGoal - data.weekly.activeDays} dae oor vir hierdie week`
                    : `${data.weekly.daysGoal - data.weekly.activeDays} days left this week`}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: "#9FF5E8" }} />
              {isAf ? "Stel Studiedoelwitte" : "Set Study Goals"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: "#9FF5E8" }} />
                  {isAf ? "Daaglikse Vraaedoelwit" : "Daily Question Target"}
                </label>
                <span className="text-sm font-bold tabular-nums" style={{ color: "#9FF5E8" }}>
                  {dailyDraft}
                </span>
              </div>
              <Slider
                min={10}
                max={50}
                step={5}
                value={[dailyDraft]}
                onValueChange={([v]) => setDailyDraft(v)}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-white">
                <span>10</span>
                <span>50</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" style={{ color: "#C5B3FF" }} />
                  {isAf ? "Weeklikse Studiedae" : "Weekly Study Days"}
                </label>
                <span className="text-sm font-bold tabular-nums" style={{ color: "#C5B3FF" }}>
                  {weeklyDraft}
                </span>
              </div>
              <Slider
                min={1}
                max={7}
                step={1}
                value={[weeklyDraft]}
                onValueChange={([v]) => setWeeklyDraft(v)}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-white">
                <span>1</span>
                <span>7</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,.2)", color: "#ffffff", fontWeight: 700 }}
            >
              {isAf ? "Kanselleer" : "Cancel"}
            </Button>
            <Button
              onClick={() => saveGoals.mutate()}
              disabled={saveGoals.isPending}
              style={{
                background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
                color: "#050508",
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 800,
                border: "none",
                transition: "transform .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              {saveGoals.isPending
                ? (isAf ? "Stoor..." : "Saving...")
                : (isAf ? "Stoor Doelwitte" : "Save Goals")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
