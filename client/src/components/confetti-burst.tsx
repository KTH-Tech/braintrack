import { useState } from "react";

/* ── Fullscreen exam-completion confetti ─────────────────────────────────
   IMPORTANT: every particle's `animation` is set via the inline `style`
   attribute using a literal `bt-` prefixed keyframe name (bt-confetti /
   bt-confetti-2 / bt-confetti-3, defined in index.css). The global
   animation kill-switch in index.css (search "Global animation kill-switch")
   suppresses ALL animations app-wide EXCEPT elements whose inline style
   contains the substring "bt-" or that carry a .bt-* class — so this MUST
   stay an inline `animation: "bt-…"` string, never a plain CSS class alone,
   or the burst will silently render as static, motionless shapes. */

const CONFETTI_COLORS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];

/** Three fall patterns — straight, drifting, fluttering — cycled across
 *  particles so the burst reads as a natural tumble, not one shape raining
 *  in lockstep. All three keyframes are defined in index.css. */
const CONFETTI_KEYFRAMES = ["bt-confetti", "bt-confetti-2", "bt-confetti-3"] as const;
const CONFETTI_EASING = ["ease-in", "ease-in-out", "cubic-bezier(.3,0,.7,1)"] as const;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Big, fullscreen exam-completion celebration burst. Renders `count`
 * particles in a `position: fixed; inset: 0` layer so the confetti covers
 * the entire viewport (not just the results card it's mounted inside),
 * with varied sizes/shapes, staggered fall timing, and horizontal
 * drift + rotation for a natural look.
 *
 * Mount it once at the moment you want the burst to fire (e.g. only once
 * the results/grade view first renders) — it doesn't loop or re-trigger on
 * its own. Fully suppressed for prefers-reduced-motion users.
 */
export function ConfettiBurst({ count = 60 }: { count?: number }) {
  // Lazy-init so reduced-motion users never see a single frame of confetti
  // before it's suppressed (no post-mount effect / flash).
  const [reduced] = useState(() => prefersReducedMotion());

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 70 }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const keyframe = CONFETTI_KEYFRAMES[i % CONFETTI_KEYFRAMES.length];
        const easing = CONFETTI_EASING[i % CONFETTI_EASING.length];
        const isCircle = i % 3 === 0;
        const isRibbon = i % 5 === 0;
        const size = 6 + ((i * 7) % 13); // 6–18px
        const duration = 2.2 + (i % 9) * 0.28; // 2.2s–4.4s fall
        const delay = (i % 14) * 0.1; // 0–1.3s stagger
        const drift = (((i * 47) % 9) - 4) * 60; // -240..240px horizontal drift

        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: `${-10 - ((i * 13) % 60)}px`,
              left: `${(i * 137.508) % 100}%`,
              width: isRibbon ? size * 0.55 : size,
              height: isRibbon ? size * 2.1 : isCircle ? size : size * 1.15,
              borderRadius: isCircle ? "50%" : isRibbon ? 1 : 2,
              background: color,
              ["--cx" as any]: `${drift}px`,
              animation: `${keyframe} ${duration.toFixed(2)}s ${easing} ${delay.toFixed(2)}s both`,
            }}
          />
        );
      })}
    </div>
  );
}
