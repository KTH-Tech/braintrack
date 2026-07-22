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
  0%,100% { filter: hue-rotate(-22deg) saturate(1.35) brightness(1); }
  50%     { filter: hue-rotate(72deg)  saturate(1.75) brightness(1.24); }
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

/* ── Cute pastel icon particles ────────────────────────────────────────
   Inline SVG paths for the icons that mix into the glitter. Two clusters:
   the original "cute" set (sparkle, star, heart, flower, cloud, lightning,
   moon, rainbow) plus a "street" set (crown, flame, diamond, headphones,
   music note, speech bubble) so the burst reads as pastel-graffiti — the
   BrainTrack aesthetic — instead of soft-pastel-only. Each entry is
   `[path, viewBox]`; we render them as filled shapes in a random pastel
   colour so they read as small graphic silhouettes at 14–26px. */
const ICONS: Array<[string, string]> = [
  // ── Cute cluster ───────────────────────────────────────────────────
  // 4-point sparkle
  ["M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z", "0 0 24 24"],
  // 5-point star
  ["M12 2 L14.7 8.6 L22 9.2 L16.4 13.9 L18.2 21 L12 17.3 L5.8 21 L7.6 13.9 L2 9.2 L9.3 8.6 Z", "0 0 24 24"],
  // Heart
  ["M12 21 C 3 14 3 8 7.5 5.5 C 10 4 12 6 12 7.5 C 12 6 14 4 16.5 5.5 C 21 8 21 14 12 21 Z", "0 0 24 24"],
  // Flower (5 petals + centre)
  ["M12 2 c 1.8 0 3.2 1.4 3.2 3.2 c 0 .6 -.2 1.2 -.5 1.7 c 1.8 -.2 3.5 1.2 3.5 3 c 0 1.5 -1.2 2.8 -2.8 3 c 1.2 .8 1.5 2.5 .6 3.8 c -.9 1.2 -2.6 1.5 -3.8 .6 c -.2 1.6 -1.5 2.8 -3.2 2.8 s -3 -1.2 -3.2 -2.8 c -1.2 .9 -2.9 .6 -3.8 -.6 c -.9 -1.3 -.6 -3 .6 -3.8 c -1.6 -.2 -2.8 -1.5 -2.8 -3 c 0 -1.8 1.7 -3.2 3.5 -3 c -.3 -.5 -.5 -1.1 -.5 -1.7 c 0 -1.8 1.4 -3.2 3.2 -3.2 Z M 12 10.5 a 1.8 1.8 0 1 0 0 3.6 a 1.8 1.8 0 0 0 0 -3.6 Z", "0 0 24 24"],
  // Cloud
  ["M7 18 h 11 a 4 4 0 0 0 .4 -7.98 A 6 6 0 0 0 7 12 a 4 4 0 0 0 0 8 Z", "0 0 24 22"],
  // Lightning
  ["M13 2 L4 14 h 6 l -1 8 l 9 -12 h -6 z", "0 0 24 24"],
  // Crescent moon
  ["M15 3 a 9 9 0 1 0 6 15 A 7 7 0 0 1 15 3 Z", "0 0 24 24"],
  // Rainbow arc
  ["M2 20 A 10 10 0 0 1 22 20 h -3 A 7 7 0 0 0 5 20 Z M6 20 A 6 6 0 0 1 18 20 h -3 A 3 3 0 0 0 9 20 Z", "0 0 24 24"],
  // Butterfly — figure-eight wings + a stubby body
  ["M12 8 C 12 4 4 4 4 10 C 4 14 8 15 12 12 M12 8 C 12 4 20 4 20 10 C 20 14 16 15 12 12 M12 12 C 12 16 4 16 4 18 C 4 20 8 21 12 18 M12 12 C 12 16 20 16 20 18 C 20 20 16 21 12 18 M11 6 h 2 v 14 h -2 Z", "0 0 24 24"],
  // Balloon — pear teardrop + a tiny knot at the base
  ["M12 3 c -4 0 -7 3 -7 7 c 0 4 3 8 7 11 c 4 -3 7 -7 7 -11 c 0 -4 -3 -7 -7 -7 z M11 21 h 2 v 2 h -2 z", "0 0 24 24"],
  // Sun starburst — filled 8-point radiant
  ["M12 3 L13 9 L18 5 L15 10 L21 11 L15 13 L18 18 L13 15 L12 21 L11 15 L6 18 L9 13 L3 11 L9 10 L6 5 L11 9 Z", "0 0 24 24"],
  // Cherries — a pair with crossing stems
  ["M7 16 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 z M13 16 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 z M10 13 c 0 -5 4 -8 9 -9 M16 13 c 0 -4 3 -7 5 -8", "0 0 24 24"],
  // Cupcake — icing dome on a wrapper with a lil' fluted rim
  ["M6 22 h 12 v -6 h -12 z M6 16 c 0 -4 3 -7 6 -7 s 6 3 6 7 z M9 16 l 3 -3 l 3 3 M8 22 v -6 M12 22 v -6 M16 22 v -6", "0 0 24 24"],
  // Ribbon bow — two triangular loops meeting at a small knot
  ["M12 10 L5 6 v 8 z M12 10 L19 6 v 8 z M11 8 h 2 v 6 h -2 z M10 14 h 4 v 3 h -4 z", "0 0 24 24"],

  // ── Street cluster ─────────────────────────────────────────────────
  // Crown — three spikes, one gem-notched bar
  ["M3 18 h 18 l -1 -10 l -4 4 l -3 -8 l -3 8 l -4 -4 Z M5 20 h 14 v 2 h -14 z", "0 0 24 24"],
  // Fire flame — teardrop with a rising inner tongue
  ["M12 2 c 0 4 -5 5 -5 11 a 5 5 0 0 0 10 0 c 0 -3 -2 -4 -2 -7 c 0 -2 -1.5 -3 -3 -4 Z M10.5 14 a 2 2 0 1 0 3 0 c 0 -1.5 -1.5 -2 -1.5 -3.5 c -.6 1 -1.5 2 -1.5 3.5 Z", "0 0 24 24"],
  // Diamond gem — brilliant cut with top facets
  ["M4 9 L8 3 L16 3 L20 9 L12 22 Z M4 9 h 16 M8 3 L12 9 L16 3 M10 9 L12 22 L14 9", "0 0 24 24"],
  // Headphones — chunky pads + arc band
  ["M4 20 v -7 h 4 v 7 z M16 20 v -7 h 4 v 7 z M4 13 v -1 c 0 -4.4 3.6 -8 8 -8 s 8 3.6 8 8 v 1", "0 0 24 24"],
  // Music note — eighth note with flag
  ["M9 3 v 13.5 a 3.5 3.5 0 1 0 3 3.5 V 7 l 8 -2 v -3 z", "0 0 24 24"],
  // Speech bubble — rounded rectangle with tail
  ["M4 4 h 16 a 2 2 0 0 1 2 2 v 9 a 2 2 0 0 1 -2 2 h -8 l -5 4 v -4 h -3 a 2 2 0 0 1 -2 -2 v -9 a 2 2 0 0 1 2 -2 z", "0 0 24 24"],
];

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
  /** When set, this particle renders as an SVG icon instead of a shape span.
   *  The colour is a solid pastel (not the holographic gradient) so the icon
   *  reads as a legible silhouette. */
  icon?: { pathIndex: number; color: string };
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

    const i1 = Math.floor(Math.random() * PALETTE.length);
    const c1 = PALETTE[i1];
    const c2 = PALETTE[(i1 + 2 + Math.floor(Math.random() * 3)) % PALETTE.length];
    const g = Math.floor(Math.random() * 360);
    // Iridescent oil-slick fill: pastel-only so shards read as saturated
    // holographic foil (never washed-out white). The `linear` variant is a
    // two-tone pastel foil with a slim specular sheen line; hue-rotate
    // (bt-gshimmer) animates the whole thing for the holographic shift.
    const holo =
      Math.random() < 0.5
        ? `conic-gradient(from ${g}deg, #9FF5E8, #9FD8FF, #FFB7E5, #C5B3FF, #FFE29A, #94F7C5, #9FF5E8)`
        : `linear-gradient(130deg, ${c1} 0%, ${c2} 46%, #FFFFFF 55%, ${c2} 64%, ${c1} 100%)`;

    const roll = Math.random();
    let size: number;
    let height: number;
    let radius: number | string;
    let icon: { pathIndex: number; color: string } | undefined;
    if (roll < 0.18) {
      // thin foil ribbon / shard
      size = 3 + Math.random() * 3;
      height = 10 + Math.random() * 12;
      radius = 1;
    } else if (roll < 0.42) {
      // round sequin
      size = 5 + Math.random() * 8;
      height = size;
      radius = "50%";
    } else if (roll < 0.62) {
      // diamond / square glitter fleck
      size = 5 + Math.random() * 9;
      height = size;
      radius = 2;
    } else {
      // cute pastel icon — 38% of particles are icons so the celebration
      // reads as sparkles + stars + hearts + flowers, not just abstract foil.
      size = 14 + Math.random() * 12;
      height = size;
      radius = 0;
      icon = {
        pathIndex: Math.floor(Math.random() * ICONS.length),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      };
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
      icon,
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
      {/* Iridescent expanding rings — a conic gradient masked to a thin ring
          so it stays perfectly circular. (border-image renders as a rectangle
          and ignores border-radius — that was the bug making these look like
          faint boxes around the card.) */}
      <span
        style={{
          ...center,
          width: 104,
          height: 104,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, #9FF5E8, #9FD8FF, #FFB7E5, #C5B3FF, #FFE29A, #94F7C5, #9FF5E8)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mixBlendMode: "screen",
          animation: "bt-gring 0.75s cubic-bezier(.16,.8,.3,1) both",
        }}
      />
      <span
        style={{
          ...center,
          width: 78,
          height: 78,
          borderRadius: "50%",
          background:
            "conic-gradient(from 120deg, #FFB7E5, #C5B3FF, #9FD8FF, #94F7C5, #FFE29A, #FFB7E5)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
          mixBlendMode: "screen",
          animation: "bt-gring 0.85s cubic-bezier(.16,.8,.3,1) 0.05s both",
        }}
      />

      {/* ── Glitter shards + cute pastel icons ─────────────────────── */}
      {particles.map((p, i) => {
        const commonStyle: React.CSSProperties = {
          ...center,
          width: p.size,
          height: p.height,
          willChange: "transform, opacity, filter",
          ["--bx" as string]: p.bx,
          ["--by" as string]: p.by,
          ["--dx" as string]: p.dx,
          ["--spin" as string]: p.spin,
          // Two bt- animations: pop/gravity + hue-shift sparkle. Inline "bt-"
          // keeps both exempt from the global animation kill-switch.
          animation:
            `bt-gpop ${p.duration.toFixed(2)}s cubic-bezier(.12,.62,.24,1) ${p.delay.toFixed(2)}s both, ` +
            `bt-gshimmer ${p.shimmerDur.toFixed(2)}s ease-in-out ${p.shimmerDelay.toFixed(2)}s infinite`,
        };
        if (p.icon) {
          const [d, viewBox] = ICONS[p.icon.pathIndex];
          return (
            <span key={i} style={commonStyle}>
              <svg
                viewBox={viewBox}
                width={p.size}
                height={p.height}
                aria-hidden
                style={{
                  display: "block",
                  filter: `drop-shadow(0 2px 4px ${p.icon.color}66)`,
                }}
              >
                <path d={d} fill={p.icon.color} />
              </svg>
            </span>
          );
        }
        return (
          <span
            key={i}
            style={{
              ...commonStyle,
              borderRadius: p.radius,
              background: p.background,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </div>
  );

  return createPortal(layer, document.body);
}
