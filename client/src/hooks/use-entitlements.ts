import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { entitlementsForPlan, type Entitlements, type PlanKey } from "@shared/entitlements";

export interface EntitlementsPayload {
  plan: string | null;
  planKey: PlanKey;
  entitlements: Entitlements;
  startDate: string | null;
  endDate: string | null;
}

/**
 * Per-product entitlements for the signed-in learner.
 *
 * Fetches /api/me/entitlements once (5-min stale) and NEVER blocks or locks
 * the UI on failure: while loading, on error, or when signed out the hook
 * returns FULL entitlements — the paywall elsewhere decides raw access, this
 * hook only shapes the journey. Sprint-specific UI should therefore key off
 * `plan`/`planKey` (only present when the server confirmed an active sub).
 */
export function useEntitlements(): {
  plan: string | null;
  planKey: PlanKey;
  entitlements: Entitlements;
  startDate: string | null;
  endDate: string | null;
  /** Day X of the 42-day sprint (1-based), or null when not a sprint plan. */
  sprintDay: number | null;
  isLoading: boolean;
} {
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery<EntitlementsPayload>({
    queryKey: ["/api/me/entitlements"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const plan = data?.plan ?? null;
  const planKey: PlanKey = data?.planKey ?? "full";
  const entitlements = data?.entitlements ?? entitlementsForPlan(null);

  // "Day X of 42" sprint tracker, computed from the subscription startDate.
  // Clamped to [1, 42] so clock skew or a stretched window never shows odd
  // numbers. Only meaningful for the two 42-day sprint products.
  let sprintDay: number | null = null;
  if ((plan === "prelim_sprint" || plan === "finals_blitz") && data?.startDate) {
    const start = new Date(data.startDate).getTime();
    if (Number.isFinite(start)) {
      const day = Math.floor((Date.now() - start) / 86400000) + 1;
      sprintDay = Math.min(42, Math.max(1, day));
    }
  }

  return {
    plan,
    planKey,
    entitlements,
    startDate: data?.startDate ?? null,
    endDate: data?.endDate ?? null,
    sprintDay,
    isLoading: isAuthenticated ? isLoading : false,
  };
}
