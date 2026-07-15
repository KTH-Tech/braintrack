// Decorative graffiti paint splats — the brand-board "splatter" device.
// Pure SVG + CSS transforms (GPU-cheap), pointer-events-none, aria-hidden,
// and fully static under prefers-reduced-motion.

const BRAND = ["#006BFF", "#00E5FF", "#22FF66", "#FFE600", "#FF8A00", "#FF2BD6", "#8A2BFF"];

function Splat({ color, size, x, y, rotate, delay, drip = false }: {
  color: string; size: number; x: string; y: string; rotate: number; delay: number; drip?: boolean;
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
        {/* Main organic blob */}
        <path d="M50 8c11-4 24 1 30 10 5 8 2 16 10 20 9 5 11 18 4 25-6 6-16 3-19 12-4 10-16 14-25 10-8-4-9-13-18-13-10 0-19-10-18-20 1-9 10-12 11-20 2-10 13-21 25-24z" />
        {/* Satellite droplets */}
        <circle cx="11" cy="22" r="5.5" />
        <circle cx="90" cy="30" r="4.5" />
        <circle cx="82" cy="84" r="6" />
        <circle cx="18" cy="78" r="4" />
        <circle cx="96" cy="58" r="3" />
        <circle cx="5" cy="55" r="2.5" />
        <circle cx="72" cy="5" r="3.5" />
        {drip && (
          <>
            <path d="M44 90c0 0 2 11 2 17 0 4-1.5 6-3.5 6s-3.5-2.5-3.5-6c0-6 2-17 2-17z" />
            <path d="M56 86c0 0 1.5 8 1.5 12 0 3-1 4.5-2.5 4.5s-2.5-1.5-2.5-4.5c0-4 1.5-12 1.5-12z" />
          </>
        )}
      </svg>
    </span>
  );
}

export function GraffitiSplats({
  variant = "hero",
  opacity = 0.55,
}: {
  variant?: "hero" | "corner" | "band" | "full";
  opacity?: number;
}) {
  const layouts: Record<string, Array<{
    c: number; size: number; x: string; y: string; r: number; d: number; drip?: boolean;
  }>> = {
    hero: [
      { c: 0, size: 220, x: "-6%",  y: "2%",   r: -18, d: 0,    drip: true },
      { c: 5, size: 170, x: "84%",  y: "-4%",  r: 24,  d: 120 },
      { c: 2, size: 130, x: "76%",  y: "60%",  r: -8,  d: 250,  drip: true },
      { c: 6, size: 180, x: "2%",   y: "62%",  r: 40,  d: 380 },
      { c: 3, size: 100, x: "44%",  y: "-6%",  r: 12,  d: 500 },
      { c: 4, size: 90,  x: "55%",  y: "75%",  r: -32, d: 620,  drip: true },
      { c: 1, size: 80,  x: "30%",  y: "80%",  r: 55,  d: 740 },
    ],
    corner: [
      { c: 1, size: 200, x: "-8%",  y: "-10%", r: -25, d: 0,   drip: true },
      { c: 5, size: 150, x: "88%",  y: "70%",  r: 15,  d: 200 },
      { c: 3, size: 100, x: "80%",  y: "-5%",  r: -40, d: 350 },
      { c: 4, size: 80,  x: "-2%",  y: "75%",  r: 20,  d: 500 },
    ],
    band: [
      { c: 4, size: 160, x: "-2%",  y: "5%",   r: -12, d: 0 },
      { c: 2, size: 110, x: "46%",  y: "50%",  r: 30,  d: 180,  drip: true },
      { c: 6, size: 150, x: "88%",  y: "-5%",  r: -30, d: 360 },
      { c: 0, size: 90,  x: "22%",  y: "65%",  r: 50,  d: 480 },
      { c: 1, size: 80,  x: "68%",  y: "70%",  r: -20, d: 600 },
    ],
    full: [
      { c: 0, size: 240, x: "-8%",  y: "0%",   r: -18, d: 0,    drip: true },
      { c: 5, size: 180, x: "84%",  y: "-6%",  r: 24,  d: 100 },
      { c: 2, size: 160, x: "76%",  y: "55%",  r: -8,  d: 220,  drip: true },
      { c: 6, size: 200, x: "0%",   y: "58%",  r: 40,  d: 340 },
      { c: 3, size: 120, x: "44%",  y: "-8%",  r: 12,  d: 460 },
      { c: 4, size: 110, x: "52%",  y: "72%",  r: -32, d: 580,  drip: true },
      { c: 1, size: 100, x: "28%",  y: "78%",  r: 55,  d: 700 },
      { c: 0, size: 80,  x: "38%",  y: "38%",  r: -60, d: 820 },
      { c: 5, size: 90,  x: "66%",  y: "28%",  r: 15,  d: 940 },
    ],
  };

  return (
    <span aria-hidden className="bt-splat-field" style={{ opacity }}>
      {(layouts[variant] ?? layouts.hero).map((s, i) => (
        <Splat
          key={i}
          color={BRAND[s.c]}
          size={s.size}
          x={s.x}
          y={s.y}
          rotate={s.r}
          delay={s.d}
          drip={s.drip}
        />
      ))}
    </span>
  );
}
