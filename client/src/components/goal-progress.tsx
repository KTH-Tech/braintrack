import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Target, Zap, Settings2, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
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

function LuminousBar({ pct, color }: { pct: number; color: string }) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative h-3 w-full rounded-full bg-white/[0.08] border border-white/10 overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${clampedPct}%` }}
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
      <Card className="overflow-hidden rounded-2xl" data-testid="goal-progress-widget">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-foreground">
              {isAf ? "Daaglikse Doele" : "Daily Goals"}
            </h2>
            {data && data.streakDays >= 2 && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30"
                title={isAf ? `${data.streakDays}-dag reeks!` : `${data.streakDays}-day streak!`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-500 tabular-nums">
                  {data.streakDays}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={openModal}
            aria-label={isAf ? "Stel doelwitte" : "Set goals"}
            className="p-1.5 rounded-lg text-white hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {isLoading ? (
            <>
              <div className="h-14 rounded-xl bg-muted/50 animate-pulse" />
              <div className="h-14 rounded-xl bg-muted/50 animate-pulse" />
            </>
          ) : data ? (
            <>
              <div className="space-y-2" data-testid="daily-goal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-semibold text-foreground">
                      {isAf ? "Vrae Vandag" : "Questions Today"}
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    <span className="text-primary">{data.daily.questionsAnswered}</span>
                    <span className="text-white">/{data.daily.questionsGoal}</span>
                  </span>
                </div>
                <LuminousBar
                  pct={data.daily.pct}
                  color="bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                />
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
                    <CalendarDays className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-semibold text-foreground">
                      {isAf ? "Studiedae Hierdie Week" : "Study Days This Week"}
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    <span className="text-cyan-500">{data.weekly.activeDays}</span>
                    <span className="text-white">/{data.weekly.daysGoal}</span>
                  </span>
                </div>
                <LuminousBar
                  pct={data.weekly.pct}
                  color="bg-gradient-to-r from-cyan-500 to-cyan-500 shadow-[0_0_8px_rgba(6, 182, 212,0.6)]"
                />
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
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-500" />
              {isAf ? "Stel Studiedoelwitte" : "Set Study Goals"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-500" />
                  {isAf ? "Daaglikse Vraaedoelwit" : "Daily Question Target"}
                </label>
                <span className="text-sm font-bold tabular-nums text-primary">
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
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-cyan-500" />
                  {isAf ? "Weeklikse Studiedae" : "Weekly Study Days"}
                </label>
                <span className="text-sm font-bold tabular-nums text-cyan-500">
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
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {isAf ? "Kanselleer" : "Cancel"}
            </Button>
            <Button
              onClick={() => saveGoals.mutate()}
              disabled={saveGoals.isPending}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
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
