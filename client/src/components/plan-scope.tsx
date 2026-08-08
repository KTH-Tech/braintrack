import { Link } from "wouter";
import { Lock, Crown } from "lucide-react";
import { useEntitlements } from "@/hooks/use-entitlements";
import { Button } from "@/components/ui/button";

/**
 * Per-product journey chrome shared across drill / mock / predictor /
 * past-paper surfaces.
 *
 * PlanScopeBadge — a small "Prelim mode 🎯" / "Finals mode 🔥" sticker shown
 * ONLY to confirmed sprint-plan learners. Season / Monthly / legacy / no-sub
 * learners see nothing (their journey is unchanged).
 *
 * SeasonPassLockedCard — on-brand locked card for Season-Pass-exclusive
 * features. Always links to /subscribe so it is never a dead end.
 */

export function PlanScopeBadge({ isAf }: { isAf?: boolean }) {
  const { plan } = useEntitlements();
  if (plan !== "prelim_sprint" && plan !== "finals_blitz") return null;
  const isPrelim = plan === "prelim_sprint";
  const hex = isPrelim ? "#9FF5E8" : "#FFB7E5";
  return (
    <span
      data-testid={isPrelim ? "plan-scope-badge-prelim" : "plan-scope-badge-finals"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "'Bebas Neue', system-ui, sans-serif",
        fontSize: 15,
        letterSpacing: 1,
        color: "#050508",
        background: hex,
        border: "2px solid #050508",
        borderRadius: 999,
        padding: "4px 14px",
        transform: "rotate(-2deg)",
        whiteSpace: "nowrap",
      }}
    >
      {isPrelim
        ? (isAf ? "Voorlopige modus 🎯" : "Prelim mode 🎯")
        : (isAf ? "Finale modus 🔥" : "Finals mode 🔥")}
    </span>
  );
}

export function SeasonPassLockedCard({
  isAf,
  feature,
  testId,
}: {
  isAf?: boolean;
  /** Short feature name shown on the card, e.g. "Full 10-year archive". */
  feature: string;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId ?? "season-pass-locked-card"}
      style={{
        background: "#0e0d12",
        border: "2.5px solid #FFE29A",
        borderRadius: 18,
        boxShadow: "5px 5px 0 0 #FFE29A",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Lock style={{ width: 16, height: 16, color: "#FFE29A" }} />
        <span
          style={{
            fontFamily: "'Bebas Neue', system-ui, sans-serif",
            fontSize: 16,
            letterSpacing: 1,
            color: "#FFE29A",
          }}
        >
          {isAf ? "Seisoenkaart-eksklusief" : "Season Pass exclusive"}
        </span>
        <Crown style={{ width: 16, height: 16, color: "#FFE29A" }} />
      </div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13.5, color: "#fff", lineHeight: 1.5 }}>
        {feature}
      </div>
      <Link href="/subscribe">
        <Button variant="primary" size="sm" data-testid={testId ? `${testId}-upgrade` : "season-pass-locked-upgrade"}>
          {isAf ? "Gradeer op →" : "Upgrade →"}
        </Button>
      </Link>
    </div>
  );
}
