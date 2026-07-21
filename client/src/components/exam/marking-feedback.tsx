import { CheckCircle2, XCircle, AlertCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExamQuestionText } from "@/components/exam/exam-question-text";

export type CriterionResult = {
  id: string;
  marks: number;
  awarded: number;
  matched: string[];
  missed: string[];
  memoExcerpt: string;
  feedback: string;
};

export type MarkingResult = {
  marksAwarded: number;
  marksAvailable: number;
  isCorrect: boolean;
  perCriterion: CriterionResult[];
  examinerNotes: string[];
};

interface MarkingFeedbackProps {
  result: MarkingResult;
  isAf?: boolean;
  questionText?: string;
  questionNumber?: string;
  className?: string;
}

/* ── Street-pastel palette (docs/design-guidelines.md) ──────────────────
   Correct/full marks → mint #94F7C5 · Partial → yellow #FFE29A ·
   Wrong/no marks → alert pink #FF8DA1. Never generic red/green. */
const BAND_HEX = {
  green: "#94F7C5",
  amber: "#FFE29A",
  red: "#FF8DA1",
} as const;
const INFO_HEX = "#9FF5E8";

function halo(hex: string, a = 0.32) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Examiner-style feedback panel.
 *
 * Shows: marks awarded / total, per-criterion matched + missed keywords,
 * the exact memo excerpt for each, and DBE memo-derived examiner notes
 * (Accept/Allow/Award rules). All text is sourced from the parsed memo —
 * no AI prose.
 */
export function MarkingFeedback({
  result,
  isAf = false,
  questionText,
  questionNumber,
  className,
}: MarkingFeedbackProps) {
  const pct = result.marksAvailable > 0
    ? Math.round((result.marksAwarded / result.marksAvailable) * 100)
    : 0;
  const band: "red" | "amber" | "green" =
    result.isCorrect ? "green" : pct >= 75 ? "green" : pct >= 50 ? "amber" : "red";
  const accentHex = BAND_HEX[band];
  const StatusIcon = result.isCorrect ? CheckCircle2 : result.marksAwarded === 0 ? XCircle : AlertCircle;

  return (
    <div
      className={cn("relative overflow-hidden rounded-[22px] p-4 sm:p-5 space-y-4", className)}
      style={{
        background: "rgba(255,255,255,.03)",
        border: `1.5px solid ${accentHex}`,
      }}
    >
      <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accentHex }} />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          {questionNumber && (
            <p className="text-xs font-bold uppercase tracking-wider text-white" style={{ opacity: 0.82 }}>
              {isAf ? "Vraag" : "Question"} {questionNumber}
            </p>
          )}
          <p className="text-2xl sm:text-3xl font-black mt-1 text-white tabular-nums">
            {result.marksAwarded} / {result.marksAvailable}
            <span className="text-sm font-bold ml-2" style={{ color: accentHex }}>({pct}%)</span>
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ color: accentHex, background: halo(accentHex, 0.1), border: `1px solid ${halo(accentHex, 0.45)}` }}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {result.isCorrect
            ? (isAf ? "Volle merke" : "Full marks")
            : result.marksAwarded === 0
              ? (isAf ? "Geen merke" : "No marks")
              : (isAf ? "Gedeeltelik" : "Partial credit")}
        </span>
      </div>

      {!result.isCorrect && (
        <p className="text-sm font-semibold" style={{ color: accentHex }}>
          {result.marksAwarded === 0
            ? (isAf
                ? "Nie hierdie keer nie — werk deur die memo-punte hieronder, dan het jy dit volgende keer."
                : "Not this time — walk through the memo points below and you'll have it next round.")
            : (isAf
                ? "Goeie poging — kyk wat jy gemis het hieronder om jou telling te verhoog."
                : "Good attempt — see what you missed below to push this score even higher.")}
        </p>
      )}

      {questionText && (
        <div
          className="text-sm text-white max-h-32 overflow-y-auto pl-3 italic"
          style={{ opacity: 0.9, borderLeft: `2px solid ${halo(accentHex, 0.5)}` }}
        >
          <ExamQuestionText text={questionText} />
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-white" style={{ opacity: 0.82 }}>
          {isAf ? "Merkpunte uit memorandum" : "Memo marking points"}
        </p>
        {result.perCriterion.map((c) => {
          const fullyMet = c.awarded === c.marks;
          const partial = c.awarded > 0 && c.awarded < c.marks;
          const cHex = fullyMet ? BAND_HEX.green : partial ? BAND_HEX.amber : BAND_HEX.red;
          const CriterionIcon = fullyMet ? CheckCircle2 : partial ? AlertCircle : XCircle;
          return (
            <div
              key={c.id}
              className="rounded-xl p-3 space-y-2"
              style={{ background: halo(cHex, 0.08), border: `1px solid ${halo(cHex, 0.4)}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium flex-1 text-white flex items-start gap-2">
                  <CriterionIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: cHex }} />
                  <ExamQuestionText
                    text={c.memoExcerpt || (isAf ? "Memo punt" : "Memo point")}
                  />
                </div>
                <span className="text-sm font-bold whitespace-nowrap" style={{ color: cHex }}>
                  {c.awarded}/{c.marks}
                </span>
              </div>

              {(c.matched.length > 0 || c.missed.length > 0) && (
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {c.matched.map((m, i) => (
                    <span
                      key={`m-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-white"
                      style={{ background: halo(BAND_HEX.green, 0.14), border: `1px solid ${halo(BAND_HEX.green, 0.45)}` }}
                    >
                      <CheckCircle2 className="w-3 h-3" style={{ color: BAND_HEX.green }} />
                      {m}
                    </span>
                  ))}
                  {c.missed.map((m, i) => (
                    <span
                      key={`x-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-white"
                      style={{ background: halo(BAND_HEX.red, 0.14), border: `1px solid ${halo(BAND_HEX.red, 0.45)}` }}
                    >
                      <XCircle className="w-3 h-3" style={{ color: BAND_HEX.red }} />
                      {m}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-white" style={{ opacity: 0.85 }}>{c.feedback}</p>
            </div>
          );
        })}
      </div>

      {result.examinerNotes.length > 0 && (
        <div
          className="rounded-xl p-3 space-y-2"
          style={{ background: halo(INFO_HEX, 0.08), border: `1px solid ${halo(INFO_HEX, 0.4)}` }}
        >
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white" style={{ opacity: 0.85 }}>
            <BookOpen className="w-3.5 h-3.5" style={{ color: INFO_HEX }} />
            {isAf ? "Eksaminator-riglyne uit memo" : "Examiner guidance from memo"}
          </p>
          <ul className="space-y-1 text-xs text-white" style={{ opacity: 0.9 }}>
            {result.examinerNotes.slice(0, 6).map((note, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5" style={{ color: INFO_HEX }}>•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
