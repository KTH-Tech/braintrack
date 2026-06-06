import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { type VarkStyle, VARK_STYLES, getContentOrder, getPrimaryCTAs, mapLearningStyleToVark } from "@/lib/vark";
import { useAuth } from "@/hooks/use-auth";

export interface VarkInsights {
  stats: Record<string, { count: number; avgTimeSeconds: number; avgPerformance: number | null; score: number }>;
  dominantStyle: VarkStyle | null;
  currentStyle: VarkStyle | null;
  styleEvolving: boolean;
  eventCount: number;
  recommendation: string | null;
  autoUpdated: boolean;
}

export function useVark() {
  const { user } = useAuth();
  const { data: onboarding } = useQuery<any>({ queryKey: ["/api/user/onboarding"] });
  const { data: insights } = useQuery<VarkInsights>({
    queryKey: ["/api/vark/insights"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const varkPrimary: VarkStyle = useMemo(() => {
    // If insights auto-updated the user's style, prefer the dominant style
    if (insights?.autoUpdated && insights.dominantStyle) return insights.dominantStyle;
    const stored = (user as any)?.varkPrimary as VarkStyle | undefined;
    if (stored && VARK_STYLES[stored]) return stored;
    const fromOnboarding = onboarding?.learningStyle;
    if (fromOnboarding) return mapLearningStyleToVark(fromOnboarding);
    return "kinesthetic";
  }, [user, onboarding, insights]);

  const varkSecondary: VarkStyle | null = useMemo(() => {
    const stored = (user as any)?.varkSecondary as VarkStyle | undefined;
    if (stored && VARK_STYLES[stored]) return stored;
    return null;
  }, [user]);

  const varkInfo = VARK_STYLES[varkPrimary];

  return {
    varkPrimary,
    varkSecondary,
    varkInfo,
    style: varkInfo,
    insights: insights ?? null,
    getContentOrder: () => getContentOrder(varkPrimary),
    getPrimaryCTAs: (isAf = false) => getPrimaryCTAs(varkPrimary, isAf),
    VARK_STYLES,
  };
}
