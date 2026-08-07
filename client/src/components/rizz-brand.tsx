// Rizz brand kit — ONE Rizz look, shared by the header button, the support-bot
// chat panel, and the full tutor page. Anything visually "Rizz" (palette,
// wordmark, avatar/expression, brand lines) lives here so it stays consistent.
//
// Animation note: index.css has a global animation kill-switch that only
// exempts elements carrying an inline style containing "bt-" (or the .bt-*
// classes). Every animation below is therefore declared inline as
// `animation: "bt-… "` and its @keyframes shipped in <RizzBrandStyles/>.
import rizzAvatar from "@/assets/handoff/rizz-avatar.png";
import rizzMascot from "@/assets/handoff/rizz-mascot.png";

// ── Official brand palette ──────────────────────────────────────────────────
export const RIZZ = {
  pink: "#FF7EC6",
  purple: "#B388FF",
  cyan: "#6EE7F9",
  yellow: "#FFD166",
  mint: "#94F7C5",
  white: "#FFFFFF",
  nearBlack: "#0D0D14",
  card: "#1C1C26",
} as const;

export const RIZZ_RAINBOW =
  "linear-gradient(95deg,#FF7EC6,#FFD166,#94F7C5,#6EE7F9,#B388FF,#FF7EC6)";
// User → aqua→purple gradient; header/CTA → purple→pink.
export const RIZZ_USER_GRADIENT = "linear-gradient(100deg,#6EE7F9,#B388FF)";
export const RIZZ_HEADER_GRADIENT = "linear-gradient(100deg,#B388FF,#FF7EC6)";

export { rizzAvatar, rizzMascot };

// ── Expression states ───────────────────────────────────────────────────────
export type RizzExpression =
  | "happy"
  | "excited"
  | "focused"
  | "thinking"
  | "cheeky"
  | "surprised"
  | "sleepy"
  | "party";

// We ship two portrait assets; expression is conveyed through the ring colour +
// an inline bt-* animation treatment layered over the avatar.
const EXPRESSION_STYLE: Record<
  RizzExpression,
  { ring: string; anim: string }
> = {
  happy: { ring: RIZZ.purple, anim: "bt-rizz-bob 4.5s ease-in-out infinite" },
  excited: { ring: RIZZ.pink, anim: "bt-rizz-pop 1.4s ease-in-out infinite" },
  focused: { ring: RIZZ.cyan, anim: "none" },
  thinking: { ring: RIZZ.purple, anim: "bt-rizz-think 1.8s ease-in-out infinite" },
  cheeky: { ring: RIZZ.pink, anim: "bt-rizz-tilt 3.5s ease-in-out infinite" },
  surprised: { ring: RIZZ.yellow, anim: "bt-rizz-pop 1.4s ease-in-out infinite" },
  sleepy: { ring: RIZZ.purple, anim: "bt-rizz-breathe 5s ease-in-out infinite" },
  party: { ring: RIZZ.mint, anim: "bt-rizz-party 1.2s ease-in-out infinite" },
};

/**
 * Rizz's face — an avatar with an expression-driven ring colour and micro-motion.
 * Pass `mascot` to use the full-body mascot art instead of the head crop.
 */
export function RizzFace({
  expression = "happy",
  size = 44,
  mascot = false,
  radius,
}: {
  expression?: RizzExpression;
  size?: number;
  mascot?: boolean;
  radius?: number;
}) {
  const e = EXPRESSION_STYLE[expression];
  const r = radius ?? Math.round(size * 0.28);
  return (
    <img
      src={mascot ? rizzMascot : rizzAvatar}
      alt="Rizz"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        objectFit: "cover",
        border: `2px solid ${e.ring}`,
        // Inline "bt-" keeps this exempt from the global animation kill-switch.
        animation: e.anim,
        flex: "none",
      }}
    />
  );
}

// ── Rainbow "RIZZ" marker wordmark ──────────────────────────────────────────
export function RizzWordmark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="bt-wordmark"
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: size,
        letterSpacing: ".5px",
        lineHeight: 1,
        background: RIZZ_RAINBOW,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        // bt-rainbow keyframes live globally in index.css.
        animation: "bt-rainbow 6s linear infinite",
      }}
    >
      RIZZ
    </span>
  );
}

// ── Brand lines — greeting / idle / loading, EN + AF ────────────────────────
// Real Rizz brand lines from the owner's sheet, plus a couple on-brand study
// nudges. Used for the rotating loading copy and idle prompts.
export const RIZZ_LINES = {
  en: {
    loading: [
      "Boosting your brain…",
      "Let's get it!",
      "Progress not perfection",
      "Small steps BIG results",
      "Rizz is thinking…",
    ],
    tagline: "Smarter study. Higher score. Brighter future.",
  },
  af: {
    loading: [
      "Laai jou brein op…",
      "Kom ons wen!",
      "Vordering, nie volmaaktheid nie",
      "Klein treë GROOT resultate",
      "Rizz dink…",
    ],
    tagline: "Slimmer studeer. Hoër punt. Helderder toekoms.",
  },
} as const;

/** Deterministic-ish rotation so the loading line changes each request. */
export function rizzLoadingLine(lang: "en" | "af", tick: number): string {
  const lines = RIZZ_LINES[lang].loading;
  return lines[tick % lines.length];
}

// ── Keyframes (all bt-* so they survive the kill-switch) ────────────────────
// Mount once near the app root or inside any Rizz surface. Safe to render more
// than once — identical @keyframes just redefine the same animation.
export function RizzBrandStyles() {
  return (
    <style>{`
      @keyframes bt-rizz-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      @keyframes bt-rizz-pop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      @keyframes bt-rizz-think { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
      @keyframes bt-rizz-tilt { 0%,100% { transform: rotate(0); } 50% { transform: rotate(-6deg); } }
      @keyframes bt-rizz-breathe { 0%,100% { transform: scale(1); opacity: .85; } 50% { transform: scale(1.03); opacity: 1; } }
      @keyframes bt-rizz-party { 0% { transform: rotate(-5deg) scale(1); } 50% { transform: rotate(5deg) scale(1.06); } 100% { transform: rotate(-5deg) scale(1); } }
      @keyframes bt-rizz-celebrate { 0% { transform: scale(1); } 30% { transform: scale(1.25) rotate(-8deg); } 60% { transform: scale(1.1) rotate(6deg); } 100% { transform: scale(1) rotate(0); } }
      @keyframes bt-rizz-dot { 0%,80%,100% { transform: translateY(0); opacity:.4; } 40% { transform: translateY(-4px); opacity:1; } }
      @keyframes bt-rizz-slidein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @media (prefers-reduced-motion: reduce) {
        [style*="bt-rizz-"] { animation: none !important; }
      }
    `}</style>
  );
}
