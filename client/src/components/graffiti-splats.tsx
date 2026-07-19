// BrainTrack graffiti scatter — vibey teen energy, NOT big muddy blobs.
// A light scatter of emoji, small hand-drawn doodles (stars, bolts, hearts,
// crowns, sparkles) and short hype words. Bright, small, fun, decorative.
// pointer-events-none, aria-hidden, behind content.

const PASTEL = ["#9FD8FF", "#6EE7F9", "#94F7C5", "#FFE29A", "#FFE29A", "#FFB7E5", "#C5B3FF"];

// vibey teen emoji set
const EMOJI = ["🔥", "⚡", "💯", "⭐", "🎯", "🧠", "✌️", "👑", "💎", "🚀", "✨", "📚", "🏆", "💪"];
// short hype words (graffiti tags)
const WORDS = ["MATRIC READY", "YOU GOT THIS", "LEGENDARY", "LEVEL UP", "100%", "FOCUS", "GRIND", "STUDY SMART"];

type DoodleKind = "star" | "bolt" | "heart" | "crown" | "spark" | "arrow";

function Doodle({ kind, color }: { kind: DoodleKind; color: string }) {
  const s = { stroke: color, fill: "none", strokeWidth: 8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "star":  return <path {...s} d="M50 12 L61 40 L90 42 L67 60 L76 88 L50 71 L24 88 L33 60 L10 42 L39 40 Z" />;
    case "bolt":  return <path fill={color} d="M56 8 L26 55 L46 55 L38 92 L74 42 L52 42 Z" />;
    case "heart": return <path fill={color} d="M50 84 C18 60 12 40 26 28 C38 18 50 30 50 30 C50 30 62 18 74 28 C88 40 82 60 50 84 Z" />;
    case "crown": return <><path {...s} d="M14 70 L22 34 L40 54 L50 24 L60 54 L78 34 L86 70" /><path {...s} d="M18 80 L82 80" /></>;
    case "spark": return <><path {...s} d="M50 16 L50 84" /><path {...s} d="M16 50 L84 50" /><path {...s} d="M28 28 L72 72" /><path {...s} d="M72 28 L28 72" /></>;
    case "arrow": return <><path {...s} d="M12 82 Q34 24 82 30" /><path {...s} d="M64 14 L84 30 L62 44" /></>;
  }
}

// deterministic layouts per variant — [type, value, x%, y%, size, rotate, delay]
// type: "e"=emoji index, "d"=doodle kind, "w"=word index
type Item = { t: "e" | "d" | "w"; v: any; x: string; y: string; size: number; r: number; d: number; c: number };

function layoutFor(variant: string): Item[] {
  // A calm scatter — spread out, small, never crowding the centre content.
  const base: Item[] = [
    { t: "e", v: 0,  x: "6%",  y: "10%", size: 34, r: -12, d: 0,   c: 4 },
    { t: "d", v: "crown", x: "88%", y: "8%",  size: 46, r: 12,  d: 80,  c: 3 },
    { t: "e", v: 3,  x: "80%", y: "22%", size: 30, r: 8,   d: 160, c: 1 },
    { t: "d", v: "star",  x: "14%", y: "40%", size: 34, r: -18, d: 240, c: 5 },
    { t: "w", v: 0,  x: "70%", y: "44%", size: 0,  r: -6,  d: 320, c: 1 },
    { t: "e", v: 1,  x: "8%",  y: "68%", size: 32, r: 14,  d: 400, c: 3 },
    { t: "d", v: "bolt",  x: "90%", y: "60%", size: 40, r: 10,  d: 480, c: 4 },
    { t: "e", v: 4,  x: "50%", y: "84%", size: 30, r: -8,  d: 560, c: 2 },
    { t: "d", v: "heart", x: "22%", y: "88%", size: 32, r: 12,  d: 640, c: 5 },
    { t: "w", v: 1,  x: "16%", y: "20%", size: 0,  r: 5,   d: 720, c: 2 },
    { t: "e", v: 2,  x: "92%", y: "84%", size: 28, r: 16,  d: 800, c: 6 },
    { t: "d", v: "spark", x: "60%", y: "14%", size: 30, r: 0,   d: 880, c: 0 },
  ];
  if (variant === "corner") return base.filter((_, i) => i % 2 === 0);
  if (variant === "band") return base.slice(0, 7);
  return base;
}

export function GraffitiSplats({
  variant = "hero",
  opacity = 0.9,
}: {
  variant?: "hero" | "corner" | "band" | "full";
  opacity?: number;
}) {
  const items = layoutFor(variant);
  return (
    <span aria-hidden className="bt-splat-field" style={{ opacity }}>
      {items.map((it, i) => {
        const color = PASTEL[it.c % PASTEL.length];
        const common = {
          position: "absolute" as const,
          left: it.x,
          top: it.y,
          transform: `rotate(${it.r}deg)`,
          animationDelay: `${it.d}ms`,
        };
        if (it.t === "e") {
          return (
            <span key={i} className="bt-splat" style={{ ...common, fontSize: it.size, lineHeight: 1, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>
              {EMOJI[it.v % EMOJI.length]}
            </span>
          );
        }
        if (it.t === "w") {
          return (
            <span
              key={i}
              className="bt-splat graffiti-hand"
              style={{ ...common, color, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", opacity: 0.85, letterSpacing: "0.02em" }}
            >
              {WORDS[it.v % WORDS.length]}
            </span>
          );
        }
        return (
          <span key={i} className="bt-splat" style={{ ...common, width: it.size, height: it.size, color }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%" overflow="visible">
              <Doodle kind={it.v as DoodleKind} color={color} />
            </svg>
          </span>
        );
      })}
    </span>
  );
}

// Kept for callers that still import it (legal page headings). A soft pastel
// smear behind a heading word.
export function SpraySmear({ color = "#FFB7E5" }: { color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 220 60" preserveAspectRatio="none"
      style={{ position: "absolute", left: "-6%", top: "-18%", width: "112%", height: "136%", zIndex: -1, pointerEvents: "none" }}
      fill={color}>
      <path d="M8 30 C4 18 22 10 44 12 C60 4 90 6 112 10 C140 4 170 8 192 14 C210 18 218 28 212 38 C216 48 198 54 176 52 C150 58 120 56 96 52 C70 56 40 54 24 48 C10 44 4 38 8 30 Z" opacity="0.9" />
    </svg>
  );
}
