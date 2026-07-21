import { FlaskConical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";

/**
 * Persistent marker shown to anyone signed into a demo account.
 *
 * Demo accounts exist so the owner can review the learner and parent
 * experiences against realistic data (scripts/seed-demo-accounts.ts). Their
 * data is fabricated, so it must never be mistaken for a real family's — hence
 * a badge that is always on screen rather than a one-time notice that can be
 * dismissed and forgotten.
 *
 * Renders nothing for every real account, so it costs nothing in normal use.
 *
 * Positioned bottom-left to stay clear of the other global chrome:
 * AdminPreviewBanner is fixed top (z-100), RizzSupportBot floats bottom-right.
 */
export function DemoAccountBadge() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isAf = language === "af";

  if (!isAuthenticated || !user?.isDemo) return null;

  return (
    <div
      className="fixed bottom-3 left-3 z-[150] inline-flex items-center gap-1.5 rounded-full bg-black px-2.5 py-1 pointer-events-none select-none"
      style={{ border: "1px solid #C5B3FF" }}
      data-testid="demo-account-badge"
      aria-label={isAf ? "Demo-rekening" : "Demo account"}
    >
      <FlaskConical className="w-3 h-3 shrink-0" style={{ color: "#C5B3FF" }} />
      <span
        className="text-[10px] font-black uppercase tracking-[0.18em]"
        style={{ color: "#C5B3FF" }}
      >
        {isAf ? "Demo-rekening" : "Demo Account"}
      </span>
    </div>
  );
}
