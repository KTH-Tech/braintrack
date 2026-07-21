import type { CSSProperties, ReactNode } from "react";

/**
 * Shared admin-portal design system.
 *
 * BrainTrack's admin portal is an internal ops tool for KTH Tech staff
 * (users, content, billing, DBE data, partner branding, QR codes, emails,
 * consent logs) — it is NOT the learner app. It must read as a clean,
 * professional, confident dashboard: strong hierarchy, generous spacing,
 * a coherent shell, legible data-dense tables. It deliberately does NOT
 * use the learner app's "Permanent Marker Street Pastel" vocabulary
 * (graffiti stickers, cursive headings, confetti, mascots).
 *
 * Every admin page should build its cards, badges, buttons, inputs and
 * tables from these primitives instead of inventing another one-off
 * treatment. This is the same dark-ground (#050508) + pastel-accent +
 * dark-glass language first established in admin-dashboard.tsx — Poppins
 * throughout, pure white or pastel-token text only (never grey/faded).
 */

export type NeonHex =
  | "#9FF5E8" | "#9FD8FF" | "#FFB7E5"
  | "#C5B3FF" | "#FFE29A" | "#94F7C5";

export const NEON_PALETTE: NeonHex[] = [
  "#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5",
];

const NEON_RGB: Record<NeonHex, string> = {
  "#9FF5E8": "159,245,232",
  "#9FD8FF": "159,216,255",
  "#FFB7E5": "255,183,229",
  "#C5B3FF": "197,179,255",
  "#FFE29A": "255,226,154",
  "#94F7C5": "148,247,197",
};

/** rgba() for a token colour at a given alpha — e.g. halo("#9FF5E8", 0.2) */
export function halo(color: NeonHex, a = 0.28): string {
  return `rgba(${NEON_RGB[color]},${a})`;
}

/**
 * The base admin "glass" card: translucent white fill, hairline border,
 * a 2px pastel accent bar along the top. Use for every card-shaped
 * grouping on an admin page (stat tiles, panels, list rows, forms,
 * modals) instead of shadcn's generic <Card> or a bespoke local card.
 */
export function NeonShell({
  color, children, className = "", style, testId,
}: {
  color: NeonHex;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  testId?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        ...style,
      }}
      data-testid={testId}
    >
      <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color, opacity: 0.8 }} />
      {children}
    </div>
  );
}

/** Pill badge — outlined, token-coloured. Use instead of shadcn <Badge>
 * or raw Tailwind bg-*-500/text-*-300 colours (off brand palette). */
export function AdminBadge({
  color, children, solid = false, className = "", testId,
}: { color: NeonHex; children: ReactNode; solid?: boolean; className?: string; testId?: string }) {
  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${className}`}
      style={solid
        ? { background: color, color: "#050508" }
        : { border: `1px solid ${color}`, color, background: halo(color, 0.12) }}
    >
      {children}
    </span>
  );
}

/** Small action button — outlined token colour with transparent fill by
 * default, or `solid` for a filled primary action. Matches the pattern
 * used across admin-dashboard.tsx and admin-billing.tsx action buttons. */
export function AdminButton({
  color = "#9FD8FF", children, onClick, type = "button", disabled, className = "", testId, solid = false, title,
}: {
  color?: NeonHex;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  testId?: string;
  solid?: boolean;
  title?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={solid
        ? { background: color, color: "#050508", border: `1px solid ${color}` }
        : { border: `1px solid ${color}88`, color, background: halo(color, 0.08) }}
    >
      {children}
    </button>
  );
}

/** Text/search/date/email input matching the dashboard's filter-bar
 * inputs — dark fill, hairline border, no browser chrome. */
export const adminInputClass =
  "w-full px-3 py-2 rounded-lg bg-black/50 text-white text-xs placeholder-white focus:outline-none";
export const adminInputStyle: CSSProperties = { border: "1px solid rgba(255,255,255,0.18)" };

/** Multi-line input matching adminInputClass. Admin forms are full of prose and
 * JSON textareas; without this they each invent their own fill/border/placeholder
 * and drift off the palette (usually via a faded placeholder, which reads grey). */
export const adminTextareaClass =
  "w-full px-3 py-2 rounded-lg bg-black/50 text-white text-xs placeholder-white focus:outline-none resize-y";
export const adminTextareaStyle: CSSProperties = { border: "1px solid rgba(255,255,255,0.18)" };

/** Native <select> styled to match — kills the default white-box/system
 * chrome look (full restyle of the dropdown popover itself isn't
 * possible with a plain <select>, but the closed control now matches). */
export const adminSelectClass =
  "px-3 py-2 rounded-lg bg-black/50 text-white text-xs focus:outline-none";
export const adminSelectStyle: CSSProperties = { border: "1px solid rgba(255,255,255,0.18)", colorScheme: "dark" };

/** Table shell helpers — wrap <table> in a div using these classes for
 * the rounded/bordered container + consistent header/row treatment used
 * on admin-dashboard.tsx's referral & fraud-flag tables. */
export const adminTableWrapClass = "overflow-x-auto rounded-xl";
export function adminTableWrapStyle(color: NeonHex): CSSProperties {
  return { border: `1px solid ${halo(color, 0.28)}` };
}
export const adminTableClass = "w-full text-xs";
export const adminTheadClass = "bg-black/60 text-white";
export const adminThClass = "px-3 py-2 font-bold uppercase tracking-wider text-left";
export const adminTrClass = "border-t border-white/5";
export const adminTdClass = "px-3 py-2 text-white";

/** Full-page admin shell: dark ground (#050508) + Poppins. Render
 * <AdminTopNav current="..." /> as the first child, then page content. */
export function AdminGround({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`min-h-screen text-white ${className}`}
      style={{ background: "#050508", fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
