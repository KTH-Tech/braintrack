import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { shouldShowRatingPrompt, dismissRatingPrompt, restoreRatingStateFromServer, recordMilestone } from "@/lib/quiz-session-tracker";
import { useLanguage } from "@/lib/language-context";

export function AppRatingPrompt() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const { isAuthenticated, user } = useAuth();
  const [visible, setVisible] = useState(false);

  const isLearner = isAuthenticated && user?.role === "learner";

  const { data: prefs } = useQuery<{ ratingPromptDismissed?: boolean } | null>({
    queryKey: ["/api/user/preferences"],
    enabled: isLearner,
  });

  const { data: stats } = useQuery<{ studyStreak?: number } | null>({
    queryKey: ["/api/user/stats"],
    enabled: isLearner,
  });

  useEffect(() => {
    if (!isLearner) return;
    if (prefs !== undefined) {
      restoreRatingStateFromServer(prefs);
    }
    const streak = Number(stats?.studyStreak ?? 0);
    if (streak >= 7) {
      recordMilestone("seven_day_streak");
    }
    if (shouldShowRatingPrompt()) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLearner, prefs, stats?.studyStreak]);

  if (!visible || !isLearner) return null;

  const handleLater = () => {
    dismissRatingPrompt(false);
    setVisible(false);
  };

  const handleRate = () => {
    dismissRatingPrompt(true);
    setVisible(false);
    window.open(
      "https://play.google.com/store/apps/details?id=co.kthtech.braintrack",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleClose = () => {
    dismissRatingPrompt(false);
    setVisible(false);
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm"
      data-testid="app-rating-prompt"
    >
      <div className="rounded-2xl border border-white/20 bg-background/95 shadow-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-500 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {isAf ? "Geniet jy BrainTrack?" : "Enjoying BrainTrack?"}
              </p>
              <p className="text-xs text-white mt-0.5">
                {isAf
                  ? "Jou resensie help ander leerders!"
                  : "Your review helps other learners!"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50 shrink-0"
            data-testid="button-rating-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleLater}
            data-testid="button-rating-later"
          >
            {isAf ? "Miskien Later" : "Maybe Later"}
          </Button>
          <Button
            size="sm"
            variant="cyan"
            className="flex-1 text-xs"
            onClick={handleRate}
            data-testid="button-rating-now"
          >
            {isAf ? "Beoordeel Nou" : "Rate Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
