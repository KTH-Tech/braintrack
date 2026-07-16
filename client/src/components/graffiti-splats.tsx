// BrainTrack graffiti street-art system — matches the brand board:
// spray-paint bursts (jagged core + fine mist speckles + running drips) and
// hand-drawn doodles (crowns, stars, arrows, scribbles, bolts) scattered on
// the page ground. Pure SVG, deterministic layouts, pointer-events-none.

// Pastel tints of the brand palette — softer "pastel vibes" on the dark wall
// while borders/CTAs keep the full-strength neon hexes.
const BRAND = ["#6FA8FF", "#7FEFFF", "#93FFB8", "#FFF29E", "#FFC48F", "#FF9FE5", "#C6A4FF"];

/* Fine spray mist ring — deterministic speckles: [cx, cy, r] */
const SPECKLES: Array<[number, number, number]> = [
  [8, 15, 2.2], [16, 6, 1.4], [28, 3, 1.8], [45, 2, 1.2], [62, 4, 2.6], [78, 8, 1.5],
  [90, 14, 2.0], [96, 26, 1.3], [98, 42, 2.4], [95, 58, 1.6], [97, 72, 1.2], [88, 84, 2.8],
  [74, 93, 1.4], [58, 97, 2.2], [40, 96, 1.5], [24, 92, 2.5], [10, 84, 1.3], [3, 68, 2.0],
  [2, 50, 1.5], [4, 32, 2.3], [34, 10, 1.0], [70, 90, 1.0], [12, 26, 1.2], [86, 66, 1.1],
];

// Jagged spray-paint burst with mist speckles — the brand board splash.
// NOTE: no drips here — bursts render rotated, so baked-in drips would hang
// sideways (gravity-wrong). Drips belong only on unrotated surfaces.
function SprayBurst({ color, size, x, y, rotate, delay }: {
  color: string; size: number; x: string; y: string; rotate: number; delay: number;
}) {
  return (
    <span
      className="bt-splat"
      style={{
        left: x, top: y, width: size, height: size,
        transform: `rotate(${rotate}deg)`,
        animationDelay: `${delay}ms`,
        color,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill={color}>
        {/* jagged starburst core */}
        <path d="M50 6 L58 20 C66 12 76 16 76 26 L90 24 L84 38 C94 42 96 54 87 58 L96 70 L82 70 C84 82 74 90 64 84 L60 97 L51 86 C42 95 28 92 27 81 L14 86 L19 72 C8 68 6 55 15 50 L5 40 L19 37 C16 26 26 17 36 22 L40 8 Z" />
        {/* mist speckles around the burst */}
        {SPECKLES.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} opacity={0.9 - (i % 4) * 0.15} />
        ))}
      </svg>
    </span>
  );
}

// Hand-drawn marker doodles — crowns, stars, arrows, scribbles, bolts.
export type DoodleKind = "crown" | "star" | "arrow" | "scribble" | "bolt" | "underline";

function DoodleShape({ kind }: { kind: DoodleKind }) {
  const stroke = {
    stroke: "currentColor", fill: "none",
    strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "crown":
      return (
        <>
          <path {...stroke} d="M12 72 L20 34 L38 54 L50 22 L62 54 L80 34 L88 72" />
          <path {...stroke} d="M16 82 L84 82" />
        </>
      );
    case "star":
      return <path {...stroke} d="M50 10 L60 38 L90 40 L66 58 L76 88 L50 70 L24 88 L34 58 L10 40 L40 38 Z" />;
    case "arrow":
      return (
        <>
          <path {...stroke} d="M10 85 Q30 25 78 28" />
          <path {...stroke} d="M62 14 L80 28 L60 42" />
        </>
      );
    case "scribble":
      return <path {...stroke} d="M6 60 Q18 28 30 52 T56 46 T82 38 T96 30" />;
    case "bolt":
      return <path fill="currentColor" d="M56 6 L28 54 L46 54 L36 94 L74 42 L54 42 Z" />;
    case "underline":
      return (
        <>
          <path {...stroke} d="M6 30 Q50 18 94 26" />
          <path {...stroke} d="M10 44 Q50 34 90 40" />
        </>
      );
  }
}

function Doodle({ kind, color, size, x, y, rotate, delay }: {
  kind: DoodleKind; color: string; size: number; x: string; y: string; rotate: number; delay: number;
}) {
  return (
    <span
      className="bt-splat"
      style={{
        left: x, top: y, width: size, height: size,
        transform: `rotate(${rotate}deg)`,
        animationDelay: `${delay}ms`,
        color,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" overflow="visible">
        <DoodleShape kind={kind} />
      </svg>
    </span>
  );
}

// Rough paint smear to sit BEHIND a heading (brand-board section titles).
// Usage: <span className="spray-title"><SpraySmear color="#FF9FE5" />Heading</span>
export function SpraySmear({ color = "#FF9FE5" }: { color?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 60"
      preserveAspectRatio="none"
      style={{
        position: "absolute", left: "-6%", top: "-18%", width: "112%", height: "136%",
        zIndex: -1, pointerEvents: "none",
      }}
      fill={color}
    >
      <path d="M8 30 C4 18 22 10 44 12 C60 4 90 6 112 10 C140 4 170 8 192 14 C210 18 218 28 212 38 C216 48 198 54 176 52 C150 58 120 56 96 52 C70 56 40 54 24 48 C10 44 4 38 8 30 Z" opacity="0.92" />
      <circle cx="6" cy="14" r="3" />
      <circle cx="214" cy="46" r="3.4" />
      <circle cx="196" cy="6" r="2.6" />
      <circle cx="16" cy="52" r="2.4" />
    </svg>
  );
}

type BurstSpec = { c: number; size: number; x: string; y: string; r: number; d: number };
type DoodleSpec = { kind: DoodleKind; c: number; size: number; x: string; y: string; r: number; d: number };

export function GraffitiSplats({
  variant = "hero",
  opacity = 0.7,
}: {
  variant?: "hero" | "corner" | "band" | "full";
  opacity?: number;
}) {
  const bursts: Record<string, BurstSpec[]> = {
    hero: [
      { c: 0, size: 260, x: "-7%", y: "-4%",  r: -18, d: 0 },
      { c: 5, size: 210, x: "82%", y: "-8%",  r: 28,  d: 100 },
      { c: 2, size: 180, x: "76%", y: "58%",  r: -10, d: 200 },
      { c: 6, size: 230, x: "-2%", y: "60%",  r: 42,  d: 300 },
      { c: 3, size: 140, x: "42%", y: "-8%",  r: 15,  d: 400 },
      { c: 4, size: 150, x: "56%", y: "72%",  r: -30, d: 500 },
    ],
    corner: [
      { c: 1, size: 240, x: "-10%", y: "-12%", r: -25, d: 0 },
      { c: 5, size: 190, x: "86%",  y: "66%",  r: 18,  d: 150 },
      { c: 3, size: 130, x: "80%",  y: "-6%",  r: -42, d: 300 },
      { c: 4, size: 120, x: "-4%",  y: "72%",  r: 24,  d: 450 },
    ],
    band: [
      { c: 4, size: 190, x: "-3%", y: "0%",  r: -15, d: 0 },
      { c: 2, size: 150, x: "45%", y: "45%", r: 32,  d: 150 },
      { c: 6, size: 200, x: "86%", y: "-8%", r: -32, d: 300 },
      { c: 0, size: 130, x: "20%", y: "60%", r: 48,  d: 450 },
      { c: 1, size: 160, x: "66%", y: "66%", r: -22, d: 600 },
    ],
    full: [
      { c: 0, size: 280, x: "-9%", y: "-3%",  r: -18, d: 0 },
      { c: 5, size: 220, x: "82%", y: "-8%",  r: 28,  d: 80 },
      { c: 2, size: 200, x: "74%", y: "52%",  r: -10, d: 160 },
      { c: 6, size: 250, x: "0%",  y: "56%",  r: 40,  d: 240 },
      { c: 3, size: 160, x: "42%", y: "-10%", r: 16,  d: 320 },
      { c: 4, size: 180, x: "54%", y: "68%",  r: -28, d: 400 },
      { c: 1, size: 170, x: "22%", y: "74%",  r: 52,  d: 480 },
      { c: 0, size: 130, x: "64%", y: "30%",  r: 10,  d: 560 },
    ],
  };

  // Hand-drawn accents layered over every variant — the brand-board chaos.
  const doodles: Record<string, DoodleSpec[]> = {
    hero: [
      { kind: "crown",    c: 3, size: 70, x: "8%",  y: "6%",  r: -12, d: 650 },
      { kind: "star",     c: 5, size: 50, x: "88%", y: "40%", r: 20,  d: 750 },
      { kind: "arrow",    c: 1, size: 90, x: "66%", y: "10%", r: 8,   d: 850 },
      { kind: "scribble", c: 6, size: 110, x: "20%", y: "84%", r: -6, d: 950 },
      { kind: "bolt",     c: 3, size: 46, x: "48%", y: "58%", r: 14,  d: 1050 },
    ],
    corner: [
      { kind: "crown",    c: 3, size: 60, x: "84%", y: "8%",  r: 10,  d: 550 },
      { kind: "scribble", c: 1, size: 90, x: "6%",  y: "50%", r: -8,  d: 650 },
      { kind: "star",     c: 5, size: 44, x: "60%", y: "78%", r: -18, d: 750 },
    ],
    band: [
      { kind: "arrow",    c: 1, size: 80, x: "30%", y: "8%",  r: 6,   d: 700 },
      { kind: "star",     c: 3, size: 46, x: "78%", y: "42%", r: 22,  d: 800 },
      { kind: "scribble", c: 6, size: 96, x: "50%", y: "76%", r: -5,  d: 900 },
    ],
    full: [
      { kind: "crown",    c: 3, size: 76, x: "10%", y: "4%",  r: -14, d: 640 },
      { kind: "crown",    c: 5, size: 56, x: "86%", y: "70%", r: 12,  d: 720 },
      { kind: "star",     c: 1, size: 52, x: "90%", y: "34%", r: 24,  d: 800 },
      { kind: "star",     c: 6, size: 40, x: "34%", y: "40%", r: -20, d: 880 },
      { kind: "arrow",    c: 2, size: 96, x: "60%", y: "8%",  r: 10,  d: 960 },
      { kind: "scribble", c: 6, size: 120, x: "16%", y: "88%", r: -6, d: 1040 },
      { kind: "bolt",     c: 3, size: 50, x: "46%", y: "62%", r: 16,  d: 1120 },
      { kind: "underline", c: 4, size: 100, x: "70%", y: "88%", r: -4, d: 1200 },
    ],
  };

  return (
    <span aria-hidden className="bt-splat-field" style={{ opacity }}>
      {(bursts[variant] ?? bursts.hero).map((s, i) => (
        <SprayBurst
          key={`b${i}`}
          color={BRAND[s.c]}
          size={s.size}
          x={s.x} y={s.y}
          rotate={s.r} delay={s.d}
        />
      ))}
      {(doodles[variant] ?? doodles.hero).map((s, i) => (
        <Doodle
          key={`d${i}`}
          kind={s.kind}
          color={BRAND[s.c]}
          size={s.size}
          x={s.x} y={s.y}
          rotate={s.r} delay={s.d}
        />
      ))}
    </span>
  );
}
