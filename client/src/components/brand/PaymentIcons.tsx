import * as React from "react";

/**
 * PaymentIcons — stylised, monochrome chips shown on /subscribe so parents
 * can tell at a glance which methods we accept BEFORE they hand over card
 * details. Trust signal placement is above the CTA where the "is this
 * legit?" doubt lives.
 *
 * IMPORTANT: these are STYLISED, geometric silhouettes drawn from scratch —
 * NOT pixel-perfect brand marks. The real Visa / Mastercard / Amex logos
 * have trademark constraints when reproduced on a payment page; a
 * simplified chip that reads "we accept Visa" is aesthetically cleaner
 * (blends into the pure-#050508 luxury-street-graffiti theme) AND legally
 * safer than pasting the full-colour brand PNGs. All SVGs use
 * `currentColor` so a caller can invert / accent via CSS `color`.
 *
 * All shapes are inline — never hotlinked — so the checkout page renders
 * privately, works offline, and doesn't leak the visitor to a CDN.
 */

interface IconProps {
  /** Rendered height in pixels. Width auto-scales via viewBox. */
  height?: number;
  /** Locking colour; defaults to `currentColor` so caller controls via CSS. */
  color?: string;
  /** Tooltip / a11y label. */
  title?: string;
}

/** VISA — 4-letter wordmark chip. Stylised bold-italic-serif silhouette. */
export function VisaMark({ height = 30, color = "currentColor", title = "Visa" }: IconProps) {
  return (
    <svg
      viewBox="0 0 96 40"
      height={height}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g fill={color} fontFamily="'Poppins','Helvetica','Arial',sans-serif" fontWeight={900} fontStyle="italic" letterSpacing="-1">
        <text x="48" y="30" fontSize="26" textAnchor="middle">VISA</text>
      </g>
      {/* Small chevron accent under the wordmark — reads as "Visa" chip */}
      <path d="M18 34 L78 34" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/** MASTERCARD — two interlocked circles, monochrome. */
export function MastercardMark({ height = 30, color = "currentColor", title = "Mastercard" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 40"
      height={height}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <circle cx="24" cy="20" r="13" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="40" cy="20" r="13" fill="none" stroke={color} strokeWidth="2.5" />
      {/* Overlap fill — the classic "MC" intersection, softened as a hint */}
      <path
        d="M32 10 A 13 13 0 0 1 32 30 A 13 13 0 0 1 32 10 Z"
        fill={color}
        opacity="0.32"
      />
    </svg>
  );
}

/** AMEX — pill wordmark. Simplified silhouette. */
export function AmexMark({ height = 30, color = "currentColor", title = "American Express" }: IconProps) {
  return (
    <svg
      viewBox="0 0 96 40"
      height={height}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <rect
        x="4"
        y="6"
        width="88"
        height="28"
        rx="5"
        ry="5"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      <g fill={color} fontFamily="'Poppins','Helvetica','Arial',sans-serif" fontWeight={900} letterSpacing="2">
        <text x="48" y="26" fontSize="14" textAnchor="middle">AMEX</text>
      </g>
    </svg>
  );
}

/** VERIFIED BY VISA — shield with tick. */
export function VerifiedByVisaMark({ height = 30, color = "currentColor", title = "Verified by Visa" }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      height={height}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <path
        d="M20 4 L34 9 V20 C34 27 28 33 20 36 C12 33 6 27 6 20 V9 Z"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M13 20 L18 25 L27 15"
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** MASTERCARD SECURECODE — padlock over an interlock-hint. */
export function SecureCodeMark({ height = 30, color = "currentColor", title = "Mastercard SecureCode / 3-D Secure" }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      height={height}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* Padlock shackle */}
      <path
        d="M13 18 V13 A7 7 0 0 1 27 13 V18"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Padlock body */}
      <rect
        x="9"
        y="18"
        width="22"
        height="16"
        rx="3"
        ry="3"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
      />
      {/* Keyhole — a small circle + slot */}
      <circle cx="20" cy="24" r="1.8" fill={color} />
      <rect x="19" y="24" width="2" height="6" fill={color} />
    </svg>
  );
}

/**
 * Full trust-strip row — five stylised payment chips separated by hairline
 * pastel dividers, followed by a small "Powered by Paystack" chip. Wraps
 * cleanly on mobile (< 480px) via flex-wrap + row gap; each chip has an
 * intrinsic width so nothing overflows. Colour defaults to pure #fff for
 * the pure-#050508 background, and every icon inherits `color` so a caller
 * can accent them via a CSS variable if needed.
 */
export function PaymentIconsRow({
  color = "#fff",
  className,
  height = 26,
  labelEn = "We accept",
  labelAf = "Ons aanvaar",
  isAf = false,
}: {
  color?: string;
  className?: string;
  height?: number;
  labelEn?: string;
  labelAf?: string;
  isAf?: boolean;
}) {
  const label = isAf ? labelAf : labelEn;
  const dividerColor = "#fff";
  return (
    <div
      className={className}
      data-testid="payment-icons-row"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        flexWrap: "wrap",
        rowGap: 10,
        color,
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color,
          opacity: 0.95,
        }}
      >
        {label}
      </span>
      <span style={{ width: 1, height: 20, background: dividerColor }} aria-hidden />
      <VisaMark height={height} color={color} />
      <span style={{ width: 1, height: 18, background: dividerColor }} aria-hidden />
      <MastercardMark height={height} color={color} />
      <span style={{ width: 1, height: 18, background: dividerColor }} aria-hidden />
      <AmexMark height={height} color={color} />
      <span style={{ width: 1, height: 18, background: dividerColor }} aria-hidden />
      <VerifiedByVisaMark height={height} color={color} />
      <span style={{ width: 1, height: 18, background: dividerColor }} aria-hidden />
      <SecureCodeMark height={height} color={color} />
    </div>
  );
}

/**
 * Paystack badge chip — used near the payment row so parents see who's
 * actually processing the charge. Mint accent (#94F7C5) is close enough
 * to Paystack's teal to read as "the Paystack" chip without copying
 * their exact logo. Text-only + a small circular accent glyph.
 */
export function PaystackBadge({
  isAf = false,
  className,
}: {
  isAf?: boolean;
  className?: string;
}) {
  const accent = "#94F7C5";
  return (
    <span
      className={className}
      data-testid="paystack-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(148,247,197,.10)",
        border: `1px solid ${accent}55`,
        fontFamily: "'Poppins',sans-serif",
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: "#fff",
      }}
    >
      {/* Stylised Paystack "P" glyph — filled circle with a notch, drawn
          from scratch. Not the real mark. */}
      <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden>
        <rect x="4" y="4" width="4" height="16" fill={accent} />
        <rect x="4" y="4" width="14" height="4" fill={accent} />
        <rect x="4" y="10" width="12" height="4" fill={accent} />
        <rect x="4" y="16" width="10" height="4" fill={accent} />
      </svg>
      <span>
        {isAf ? "Aangedryf deur Paystack" : "Powered by Paystack"}
      </span>
    </span>
  );
}
