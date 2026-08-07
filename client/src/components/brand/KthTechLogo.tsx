import * as React from "react";

/**
 * KTH TECH corporate mark — the entity that appears on customers' bank
 * statements as KTH-TECH (KTH Projects (Pty) Ltd t/a KTH-Tech). Distinct
 * from the BrainTrack product mark; use this ONLY where the charging /
 * legal entity matters (checkout, payment success, footer legal line,
 * legal pages).
 *
 * SVG so it scales cleanly at every size (favicon → hero) and inherits
 * currentColor so a caller can invert it (white on black, black on
 * paper, or a pastel accent for a hover state).
 */
export function KthTechLogo({
  size = 64,
  className,
  title = "KTH Tech",
  monochrome = "currentColor",
}: {
  size?: number | string;
  className?: string;
  title?: string;
  /** Colour for both rings + wordmark. Default `currentColor` so the
   *  caller controls it via CSS `color`. Pass a specific hex to lock it. */
  monochrome?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <circle cx="120" cy="120" r="112" fill="none" stroke={monochrome} strokeWidth="4" />
      <circle cx="120" cy="120" r="100" fill="none" stroke={monochrome} strokeWidth="2.5" />
      <g fill={monochrome} fontFamily="'Bebas Neue', system-ui, sans-serif" fontWeight={900} textAnchor="middle">
        <text x="120" y="130" fontSize="86" letterSpacing="2">KTH</text>
        <text x="120" y="172" fontSize="30" letterSpacing="10">TECH</text>
      </g>
    </svg>
  );
}

/** Same lockup, but as a compact horizontal chip suitable for a footer
 *  legal line ("© KTH Projects · KTH-TECH") — the ringed emblem sits to
 *  the left of the entity name, all inheriting `currentColor`. */
export function KthTechChip({
  size = 22,
  label = "KTH-Tech",
  className,
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, lineHeight: 1 }}
    >
      <KthTechLogo size={size} title={label} />
      <span
        style={{
          fontFamily: "'Bebas Neue', system-ui, sans-serif",
          fontWeight: 900,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </span>
  );
}
