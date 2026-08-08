/**
 * Per-product feature entitlements — the single source of truth for what each
 * paid BrainTrack product unlocks (Task: product journeys).
 *
 * RULES (do not weaken):
 *  - Only the two 42-day sprint products (`prelim_sprint`, `finals_blitz`)
 *    ever REDUCE scope. Every other plan value — `exam_boost`, `premium`,
 *    legacy `brain_boost`, legacy `monthly`, comp rows, unknown/missing
 *    values — resolves to FULL (premium-level) entitlements. Existing users
 *    must never lose access because of this map.
 *  - This function must NEVER throw, whatever weird plan string it is handed.
 *  - Whether a user has ANY access at all is decided elsewhere
 *    (hasActiveSubscription / the existing paywall). This map only decides
 *    the SHAPE of the journey for users who already have access.
 *  - Parent weekly reports are included in ALL products (founder decision,
 *    2026-08). The field stays so it remains configurable later.
 */

export type PlanKey =
  | "prelim_sprint"
  | "finals_blitz"
  | "exam_boost"
  | "premium"
  | "full";

export interface Entitlements {
  /** Past-paper archive depth: 3 most recent exam years for sprints, "all" otherwise. */
  paperYears: number | "all";
  /** Which exam-window content the daily drills default to. */
  drillScope: "prelim" | "finals" | "all";
  /** Which exam-window content mini-mocks default to. */
  mockScope: "prelim" | "finals" | "all";
  /** Exam Predictor framing: prelim-focused, finals-focused, or full view. */
  predictorView: "prelim" | "finals" | "full";
  /** Weekly parent reports — included in ALL products. */
  parentReports: boolean;
  /** Study-calendar horizon: the 42-day sprint window vs the whole season. */
  calendarScope: "sprint" | "season";
  /** Dashboard war-room variant. "both_plus" = Season Distinction Pack. */
  warRoom: "prelim" | "finals" | "both" | "both_plus";
  /** Exam-tips vault (Season / Monthly exclusive). */
  examTipsVault: boolean;
}

const FULL: Entitlements = {
  paperYears: "all",
  drillScope: "all",
  mockScope: "all",
  predictorView: "full",
  parentReports: true,
  calendarScope: "season",
  warRoom: "both_plus",
  examTipsVault: true,
};

const PRELIM_SPRINT: Entitlements = {
  paperYears: 3,
  drillScope: "prelim",
  mockScope: "prelim",
  predictorView: "prelim",
  parentReports: true,
  calendarScope: "sprint",
  warRoom: "prelim",
  examTipsVault: false,
};

const FINALS_BLITZ: Entitlements = {
  paperYears: 3,
  drillScope: "finals",
  mockScope: "finals",
  predictorView: "finals",
  parentReports: true,
  calendarScope: "sprint",
  warRoom: "finals",
  examTipsVault: false,
};

/**
 * Resolve a subscription `plan` string to its entitlements.
 * Unknown, missing, legacy, or malformed values → FULL. Never throws.
 */
export function entitlementsForPlan(plan: string | null | undefined): Entitlements {
  switch (plan) {
    case "prelim_sprint":
      return { ...PRELIM_SPRINT };
    case "finals_blitz":
      return { ...FINALS_BLITZ };
    case "exam_boost":
    case "premium":
    case "full":
      return { ...FULL };
    default:
      // Legacy plans ("brain_boost", "monthly"), comp rows, grandfathered
      // trials, unknown values, null/undefined — all resolve to full access.
      return { ...FULL };
  }
}

/** Normalise a raw plan string to a PlanKey for display purposes. */
export function planKeyForPlan(plan: string | null | undefined): PlanKey {
  switch (plan) {
    case "prelim_sprint":
    case "finals_blitz":
    case "exam_boost":
    case "premium":
      return plan;
    default:
      return "full";
  }
}
