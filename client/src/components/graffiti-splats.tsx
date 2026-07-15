// Decorative graffiti paint splats — the brand-board "splatter" device.
// Pure SVG + CSS transforms (GPU-cheap), pointer-events-none, aria-hidden,
// and fully static under prefers-reduced-motion. Drop <GraffitiSplats/> into
// any relatively-positioned section; it paints behind the content.

const BRAND = ["#006BFF", "#00E5FF", "#22FF66", "#FFE600", "#FF8A00", "#FF2BD6", "#8A2BFF"];

// One organic splat: main blob + satellite droplets + a drip.
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
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill={color}>
        <path d="M50 12c9-3 20 0 26 8 5 7 3 14 9 18 7 5 8 15 2 21-5 5-13 3-16 10-3 8-13 12-21 9-7-3-8-11-16-11-9 0-17-8-16-17 1-8 9-10 10-17 1-9 10-18 22-21z" />
        <circle cx="14" cy="26" r="4.5" />
        <circle cx="88" cy="34" r="3.5" />
        <circle cx="80" cy="82" r="5" />
        <circle cx="22" cy="80" r="3" />
        <circle cx="94" cy="60" r="2.2" />
        {drip && <path d="M46 88c0 0 1.5 9 1.5 14 0 3-1 5-3 5s-3-2-3-5c0-5 1.8-14 1.8-14z" />}
      </svg>
    </span>
  );
}

export function GraffitiSplats({ variant = "hero", opacity = 0.16 }: { variant?: "hero" | "corner" | "band"; opacity?: number }) {
  const layouts: Record<string, Array<{ c: number; size: number; x: string; y: string; r: number; d: number; drip?: boolean }>> = {
    hero: [
      { c: 0, size: 150, x: "-3%",  y: "6%",  r: -18, d: 100, drip: true },
      { c: 5, size: 110, x: "88%",  y: "2%",  r: 24,  d: 300 },
      { c: 2, size: 90,  x: "78%",  y: "68%", r: -8,  d: 500, drip: true },
      { c: 6, size: 120, x: "6%",   y: "70%", r: 40,  d: 700 },
      { c: 3, size: 70,  x: "45%",  y: "-4%", r: 12,  d: 900 },
    ],
    corner: [
      { c: 1, size: 120, x: "-4%", y: "-8%", r: -25, d: 100, drip: true },
      { c: 5, size: 90,  x: "92%", y: "74%", r: 15,  d: 400 },
    ],
    band: [
      { c: 4, size: 90, x: "2%",  y: "10%", r: -12, d: 100 },
      { c: 2, size: 70, x: "50%", y: "60%", r: 30,  d: 350, drip: true },
      { c: 6, size: 100, x: "90%", y: "0%", r: -30, d: 600 },
    ],
  };
  return (
    <span aria-hidden className="bt-splat-field" style={{ opacity }}>
      {layouts[variant].map((s, i) => (
        <Splat key={i} color={BRAND[s.c]} size={s.size} x={s.x} y={s.y} rotate={s.r} delay={s.d} drip={s.drip} />
      ))}
    </span>
  );
}
