import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

/* ── Fullscreen exam-completion celebration ──────────────────────────────
   HOLOGRAPHIC PASTEL GLITTER POP.

   Two hard problems this component solves:

   1) NON-RENDER (the bug the owner hit). The results views wrap this in a
      <GlassCard> that carries `animation: "bt-fadeup … both"`. bt-fadeup ends
      on `transform: translateY(0)` and `both` fill-mode makes the card hold a
      non-`none` transform forever. Any element with a transform becomes the
      containing block for `position: fixed` descendants — so a `fixed inset-0`
      layer rendered *inside* the card collapses to the card's (overflow-hidden,
      rounded) box and is clipped away. That's why the old burst was invisible.
      FIX: we render through a React portal into `document.body`, so the fixed
      layer is relative to the viewport regardless of any transformed ancestor.

   2) GLOBAL ANIMATION KILL-SWITCH (index.css). A global rule sets
      `animation: none !important` on every element EXCEPT those whose inline
      style contains the substring "bt-" (or a few named .bt-* classes). So
      every animated node below sets its `animation` via the inline `style`
      attribute using `bt-`-prefixed keyframe names. The keyframes themselves
      are injected once into <head> from this file (index.css is owned by
      another agent and must not be edited). Keyframes are element-agnostic, so
      the kill-switch never touches them; only the exempt inline styles matter.

   prefers-reduced-motion is honoured — the whole thing renders nothing. */

const PALETTE = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"] as const;

const STYLE_ID = "bt-glitter-pop-keyframes";

/* All keyframe names are `bt-`-prefixed so the elements that reference them
   (via inline `animation: "bt-…"`) survive the global kill-switch. */
const KEYFRAMES = `
@keyframes bt-gpop {
  0%   { transform: translate3d(-50%,-50%,0) scale(0.2) rotate(0deg); opacity: 0; }
  7%   { opacity: 1; }
  16%  { transform: translate3d(calc(-50% + var(--bx)), calc(-50% + var(--by)), 0) scale(1) rotate(160deg); opacity: 1; }
  78%  { opacity: 1; }
  100% { transform: translate3d(calc(-50% + var(--bx) + var(--dx)), calc(-50% + var(--by) + 96vh), 0) scale(0.82) rotate(var(--spin)); opacity: 0; }
}
@keyframes bt-gshimmer {
  0%,100% { filter: hue-rotate(0deg)  saturate(1.15) brightness(1); }
  50%     { filter: hue-rotate(78deg) saturate(1.5)  brightness(1.55); }
}
@keyframes bt-gbloom {
  0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0; }
  22%  { opacity: 0.55; }
  100% { transform: translate(-50%,-50%) scale(1.9); opacity: 0; }
}
@keyframes bt-gcore {
  0%   { transform: translate(-50%,-50%) scale(0.2); opacity: 0; }
  22%  { opacity: 0.95; }
  100% { transform: translate(-50%,-50%) scale(1.7); opacity: 0; }
}
@keyframes bt-gring {
  0%   { transform: translate(-50%,-50%) scale(0.2); opacity: 0.9; }
  70%  { opacity: 0.28; }
  100% { transform: translate(-50%,-50%) scale(2.7); opacity: 0; }
}
@keyframes bt-gspin {
  0%   { transform: translate(-50%,-50%) rotate(0deg); }
  100% { transform: translate(-50%,-50%) rotate(360deg); }
}
`;

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = KEYFRAMES;
  document.head.appendChild(el);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type Particle = {
  bx: string;
  by: string;
  dx: string;
  spin: string;
  size: number;
  height: number;
  radius: number | string;
  background: string;
  duration: number;
  delay: number;
  shimmerDur: number;
  shimmerDelay: number;
};

/** Build the particle field once. A center-origin POP: every shard starts at
 *  the middle, fires outward along a random vector, then gravity + drift carry
 *  it down and off-screen while it tumbles and hue-shifts. */
function buildParticles(count: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rx = 12 + Math.random() * 36; // vw radius
    const ry = 8 + Math.random() * 30; // vh radius
    const bx = Math.cos(angle) * rx;
    const by = Math.sin(angle) * ry;
    const dx = (Math.random() - 0.5) * 12;
    const spin = 540 + Math.random() * 720;

    const c1 = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const g = Math.floor(Math.random() * 360);
    // Iridescent oil-slick fill: sweeps the whole pastel palette so each
    // shard reads as holographic foil; hue-rotate (bt-gshimmer) animates it.
    const holo =
      Math.random() < 0.5
        ? `conic-gradient(from ${g}deg, #9FF5E8, #9FD8FF, #FFB7E5, #C5B3FF, #FFE29A, #94F7C5, #9FF5E8)`
        : `linear-gradient(135deg, #FFFFFF 0%, ${c1} 22%, #FFB7E5 46%, #C5B3FF 66%, #9FD8FF 100%)`;

    const roll = Math.random();
    let size: number;
    let height: number;
    let radius: number | string;
    if (roll < 0.2) {
      // thin foil ribbon / shard
      size = 3 + Math.random() * 3;
      height = 10 + Math.random() * 12;
      radius = 1;
    } else if (roll < 0.52) {
      // round sequin
      size = 5 + Math.random() * 8;
      height = size;
      radius = "50%";
    } else {
      // diamond / square glitter fleck
      size = 5 + Math.random() * 9;
      height = size;
      radius = 2;
    }

    out.push({
      bx: `${bx.toFixed(2)}vw`,
      by: `${by.toFixed(2)}vh`,
      dx: `${dx.toFixed(2)}vw`,
      spin: `${spin.toFixed(0)}deg`,
      size,
      height,
      radius,
      background: holo,
      duration: 2.6 + Math.random() * 1.7,
      delay: Math.random() * 0.2,
      shimmerDur: 0.7 + Math.random() * 0.85,
      shimmerDelay: Math.random() * 0.5,
    });
  }
  return out;
}

/**
 * Fullscreen holographic pastel glitter POP for exam completion. Renders a
 * portal-mounted `position: fixed; inset: 0` layer (into `document.body`, so it
 * can never be trapped by a transformed ancestor) with a central pop burst and
 * iridescent glitter shards tumbling across the whole viewport.
 *
 * Mount it once when the results/grade view first renders — it fires once and
 * then removes itself. Fully suppressed for prefers-reduced-motion users.
 * `count` is kept for backwards compatibility with existing mounts.
 */
export function ConfettiBurst({ count = 90 }: { count?: number }) {
  const [reduced] = useState(prefersReducedMotion);
  const [active, setActive] = useState(false);
  const particles = useMemo(() => buildParticles(count), [count]);

  // Lifetime: longest shard (duration + delay) plus a small buffer, so the
  // layer self-removes once the celebration is done instead of lingering.
  const lifetimeMs = useMemo(() => {
    const longest = particles.reduce((m, p) => Math.max(m, p.duration + p.delay), 0);
    return Math.ceil(longest * 1000) + 400;
  }, [particles]);

  useEffect(() => {
    if (reduced) return;
    ensureKeyframes();
    setActive(true);
    const t = window.setTimeout(() => setActive(false), lifetimeMs);
    return () => window.clearTimeout(t);
  }, [reduced, lifetimeMs]);

  if (reduced || !active || typeof document === "undefined") return null;

  const center: React.CSSProperties = { position: "absolute", left: "50%", top: "44%" };

  const layer = (
    <div
      aria-hidden
      data-testid="confetti-burst"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {/* ── Center POP ─────────────────────────────────────────────── */}
      {/* Soft holographic bloom */}
      <span
        style={{
          ...center,
          width: 240,
          height: 240,
          borderRadius: "50%",
          mixBlendMode: "screen",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.9) 0%, #9FD8FF 26%, #FFB7E5 52%, rgba(197,179,255,0) 72%)",
          animation: "bt-gbloom 0.95s cubic-bezier(.16,.8,.3,1) both",
        }}
      />
      {/* Bright core flash */}
      <span
        style={{
          ...center,
          width: 84,
          height: 84,
          borderRadius: "50%",
          mixBlendMode: "screen",
          background:
            "radial-gradient(circle, #FFFFFF 0%, #FFE29A 38%, #FFB7E5 66%, rgba(159,245,232,0) 78%)",
          animation: "bt-gcore 0.55s cubic-bezier(.16,.8,.3,1) both",
        }}
      />
      {/* Iridescent expanding rings */}
      <span
        style={{
          ...center,
          width: 96,
          height: 96,
          borderRadius: "50%",
          borderStyle: "solid",
          borderWidth: 2.5,
          borderColor: "#9FD8FF",
          borderImage:
            "conic-gradient(from 0deg, #9FF5E8, #9FD8FF, #FFB7E5, #C5B3FF, #FFE29A, #94F7C5, #9FF5E8) 1",
          mixBlendMode: "screen",
          animation: "bt-gring 0.75s cubic-bezier(.16,.8,.3,1) both",
        }}
      />
      <span
        style={{
          ...center,
          width: 72,
          height: 72,
          borderRadius: "50%",
          borderStyle: "solid",
          borderWidth: 2,
          borderColor: "#FFB7E5",
          borderImage:
            "conic-gradient(from 120deg, #FFB7E5, #C5B3FF, #9FD8FF, #94F7C5, #FFE29A, #FFB7E5) 1",
          mixBlendMode: "screen",
          animation: "bt-gring 0.85s cubic-bezier(.16,.8,.3,1) 0.05s both",
        }}
      />

      {/* ── Glitter shards ─────────────────────────────────────────── */}
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            ...center,
            width: p.size,
            height: p.height,
            borderRadius: p.radius,
            background: p.background,
            mixBlendMode: "screen",
            willChange: "transform, opacity, filter",
            ["--bx" as string]: p.bx,
            ["--by" as string]: p.by,
            ["--dx" as string]: p.dx,
            ["--spin" as string]: p.spin,
            // Two bt- animations: the pop/gravity path + an infinite
            // holographic hue-shift sparkle. Inline "bt-" keeps both exempt
            // from the global animation kill-switch.
            animation:
              `bt-gpop ${p.duration.toFixed(2)}s cubic-bezier(.12,.62,.24,1) ${p.delay.toFixed(2)}s both, ` +
              `bt-gshimmer ${p.shimmerDur.toFixed(2)}s ease-in-out ${p.shimmerDelay.toFixed(2)}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );

  return createPortal(layer, document.body);
}
