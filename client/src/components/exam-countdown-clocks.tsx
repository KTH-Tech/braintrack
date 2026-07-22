import { useEffect, useState } from "react";
import { Rocket, GraduationCap } from "lucide-react";

/**
 * PrelimFinalClocks — a pair of sticker-slap countdown clocks for the learner
 * dashboard. Mounted AFTER a learner has locked in their 6 subjects, as a
 * loud, in-your-face reminder of how close prelims and the final NSC are.
 *
 * Design brief (owner, 2026-07-22):
 *   "for the last time chose 6 subject two clocks 1 preplim on final"
 *
 * Style: luxury street graffiti — marker-font headline, hard black drop
 * shadow, slight tilt. Prelim = sky #9FD8FF, Final = pink #FFB7E5.
 *
 * Behaviour:
 *   • Single setInterval(60_000) → re-renders once per minute (no seconds).
 *   • If a target date is in the past → "Started" / "Wrote" state.
 *   • Bilingual via `isAf` prop.
 *
 * ─────────────────────────────────────────────────────────────────────
 * NOTE — these dates are HARD-CODED PLACEHOLDERS per the launch spec.
 * They should be lifted into a shared config (or fed from the learner's
 * personal exam-timetable) once the school-selected timetable feature
 * ships. See `client/src/components/exam-countdown.tsx` for the query
 * pattern that pulls per-learner prelim data (`useEarliestPrelimDate`).
 * ─────────────────────────────────────────────────────────────────────
 */
const PRELIM_START = new Date("2026-08-25T08:00:00+02:00"); // Mon 25 Aug 2026
const FINAL_START  = new Date("2026-10-27T08:00:00+02:00"); // Mon 27 Oct 2026

type Remaining = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
};

function computeRemaining(target: Date): Remaining {
  const diff = target.getTime() - Date.now();
  const totalMs = diff;
  if (diff <= 0) {
    return { totalMs, days: 0, hours: 0, minutes: 0, isPast: true };
  }
  return {
    totalMs,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    isPast: false,
  };
}

/** Format a Date like "Mon 25 Aug 2026" — SA locale, en/af aware. */
function formatSADate(d: Date, isAf: boolean): string {
  return d.toLocaleDateString(isAf ? "af-ZA" : "en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type ClockKind = "prelim" | "final";

function Clock({
  kind,
  target,
  isAf,
  remaining,
}: {
  kind: ClockKind;
  target: Date;
  isAf: boolean;
  remaining: Remaining;
}) {
  const isPrelim = kind === "prelim";
  const accent = isPrelim ? "#9FD8FF" : "#FFB7E5";
  const accentSoft = isPrelim ? "rgba(159,216,255,0.18)" : "rgba(255,183,229,0.18)";
  const tilt = isPrelim ? "-1deg" : "2deg";
  const Icon = isPrelim ? Rocket : GraduationCap;

  const labelBig = isPrelim
    ? isAf ? "VOOREKSAMEN" : "PRELIM"
    : isAf ? "FINALE" : "FINAL";

  const startLine = isPrelim
    ? (isAf ? "Vooreksamens begin " : "Prelims start ")
    : (isAf ? "Finales begin " : "Finals start ");

  // Past-due copy: prelim → "Started", final → "Wrote" (matric wrote the paper).
  const pastLabel = isPrelim
    ? (isAf ? "AAN DIE GANG" : "STARTED")
    : (isAf ? "GESKRYF" : "WROTE");

  const dayWord = remaining.days === 1
    ? (isAf ? "dag" : "day")
    : (isAf ? "dae" : "days");

  const hoursMinutesLine = `${remaining.hours}h ${String(remaining.minutes).padStart(2, "0")}m`;

  return (
    <div
      data-testid={`countdown-clock-${kind}`}
      style={{
        flex: 1,
        minWidth: 0,
        position: "relative",
        background: "#000",
        border: `2px solid ${accent}`,
        borderRadius: 20,
        padding: "22px 22px 20px",
        transform: `rotate(${tilt})`,
        // Sticker-slap hard shadow — offset, no blur, matches accent.
        boxShadow: `6px 6px 0 0 ${accentSoft}, 0 0 0 1px ${accent} inset`,
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Big accent halo behind the number, keeps card feeling "loud" */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -30,
          top: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: accent,
          opacity: 0.09,
          pointerEvents: "none",
        }}
      />

      {/* Eyebrow row: icon + PRELIM / FINAL tag */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div
          aria-hidden
          style={{
            width: 34,
            height: 34,
            flex: "none",
            borderRadius: 10,
            background: accentSoft,
            border: `1.5px solid ${accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ width: 18, height: 18, color: accent }} />
        </div>
        <div
          data-testid={`countdown-label-${kind}`}
          style={{
            fontFamily: "'Permanent Marker', 'Bebas Neue', cursive",
            fontSize: 22,
            letterSpacing: 2,
            color: accent,
            lineHeight: 1,
            // Sticker text-shadow for the "graffiti tag" feel.
            textShadow: "2px 2px 0 rgba(0,0,0,0.85)",
          }}
        >
          {labelBig}
        </div>
      </div>

      {remaining.isPast ? (
        // Past-due state — the exam window is open (or done).
        <div
          data-testid={`countdown-past-${kind}`}
          style={{
            fontFamily: "'Permanent Marker', cursive",
            fontSize: 44,
            lineHeight: 1,
            color: accent,
            textShadow: "3px 3px 0 rgba(0,0,0,0.9)",
            marginTop: 6,
            marginBottom: 8,
          }}
        >
          {pastLabel}
        </div>
      ) : (
        <>
          {/* Big number: days remaining */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span
              data-testid={`countdown-days-${kind}`}
              className="tabular-nums"
              style={{
                fontFamily: "'Permanent Marker', 'Bebas Neue', cursive",
                fontSize: 72,
                lineHeight: 0.9,
                color: "#fff",
                textShadow: `3px 3px 0 ${accent}`,
                fontWeight: 400,
              }}
            >
              {remaining.days}
            </span>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: accent,
              }}
            >
              {dayWord}
            </span>
          </div>

          {/* Sub-line: hours + minutes (updates every 60s, no seconds) */}
          <div
            data-testid={`countdown-hoursmins-${kind}`}
            className="tabular-nums"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
              marginTop: 2,
              opacity: 0.95,
            }}
          >
            {hoursMinutesLine}
          </div>
        </>
      )}

      {/* Bottom line: full start date */}
      <div
        data-testid={`countdown-startdate-${kind}`}
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: "#fff",
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px dashed ${accentSoft}`,
          lineHeight: 1.35,
        }}
      >
        {startLine}
        <b style={{ color: accent, fontWeight: 800 }}>{formatSADate(target, isAf)}</b>
      </div>
    </div>
  );
}

/**
 * Horizontal pair of clocks — Prelim + Final — that ticks live.
 *
 * At ≥640px: side-by-side, gap 20px.
 * At <640px (mobile, incl. 375px): stack vertically, gap 16px, full-width each.
 *
 * @param isAf  true → Afrikaans copy, false → English.
 */
export function PrelimFinalClocks({ isAf = false }: { isAf?: boolean }) {
  const [prelim, setPrelim] = useState<Remaining>(() => computeRemaining(PRELIM_START));
  const [final,  setFinal]  = useState<Remaining>(() => computeRemaining(FINAL_START));

  useEffect(() => {
    // Recompute on mount so hydration-time value refreshes immediately, then
    // tick once per minute. Seconds-level granularity is intentional overkill
    // for a days/hours/minutes countdown and would thrash the dashboard.
    setPrelim(computeRemaining(PRELIM_START));
    setFinal(computeRemaining(FINAL_START));
    const id = window.setInterval(() => {
      setPrelim(computeRemaining(PRELIM_START));
      setFinal(computeRemaining(FINAL_START));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      data-testid="prelim-final-clocks"
      className="bt-clocks-row"
      style={{
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        width: "100%",
        // Extra room around cards so the tilt + hard shadow don't get clipped
        // by tight parent padding.
        padding: "10px 8px 14px",
        boxSizing: "border-box",
      }}
    >
      {/* Scoped responsive rules: stack vertically below 640px so each clock
          gets full width at 375px and the big number stays readable. */}
      <style>{`
        .bt-clocks-row > * { flex: 1 1 260px; }
        @media (max-width: 639px) {
          .bt-clocks-row { gap: 16px !important; }
          .bt-clocks-row > * { flex: 1 1 100% !important; }
        }
      `}</style>
      <Clock kind="prelim" target={PRELIM_START} isAf={isAf} remaining={prelim} />
      <Clock kind="final"  target={FINAL_START}  isAf={isAf} remaining={final} />
    </div>
  );
}

export default PrelimFinalClocks;
