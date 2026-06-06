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
    pct >= 75 ? "green" : pct >= 50 ? "amber" : "red";
  const bandColor = {
    red: "text-red-500 border-red-300/50 bg-red-50/30",
    amber: "text-amber-500 border-amber-300/50 bg-amber-50/30",
    green: "text-emerald-500 border-emerald-300/50 bg-emerald-50/30",
  }[band];

  return (
    <div className={cn("rounded-2xl border bg-card p-4 sm:p-5 space-y-4", bandColor, className)}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          {questionNumber && (
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/70">
              {isAf ? "Vraag" : "Question"} {questionNumber}
            </p>
          )}
          <p className="text-2xl sm:text-3xl font-bold mt-1">
            {result.marksAwarded} / {result.marksAvailable}
            <span className="text-sm font-normal text-foreground/70 ml-2">({pct}%)</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {result.isCorrect ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              {isAf ? "Volle merke" : "Full marks"}
            </span>
          ) : result.marksAwarded === 0 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
              <XCircle className="w-4 h-4" />
              {isAf ? "Geen merke" : "No marks"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
              <AlertCircle className="w-4 h-4" />
              {isAf ? "Gedeeltelik" : "Partial credit"}
            </span>
          )}
        </div>
      </div>

      {questionText && (
        <div className="text-sm text-foreground/90 italic border-l-2 border-current/30 pl-3 max-h-32 overflow-y-auto">
          <ExamQuestionText text={questionText} />
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          {isAf ? "Merkpunte uit memorandum" : "Memo marking points"}
        </p>
        {result.perCriterion.map((c) => {
          const fullyMet = c.awarded === c.marks;
          const partial = c.awarded > 0 && c.awarded < c.marks;
          // Panels use a higher-contrast tinted bg + a tone-matched text
          // colour so memo content stays readable in BOTH light and dark
          // themes. `text-white` on `bg-emerald-50/40` was invisible.
          return (
            <div
              key={c.id}
              className={cn(
                "rounded-xl border p-3 space-y-2",
                fullyMet
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                  : partial
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                    : "border-red-500/40 bg-red-500/10 text-red-950 dark:text-red-100",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium flex-1">
                  <ExamQuestionText
                    text={c.memoExcerpt || (isAf ? "Memo punt" : "Memo point")}
                  />
                </div>
                <span className="text-sm font-bold whitespace-nowrap">
                  {c.awarded}/{c.marks}
                </span>
              </div>

              {(c.matched.length > 0 || c.missed.length > 0) && (
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {c.matched.map((m, i) => (
                    <span
                      key={`m-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 border border-emerald-500/40"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {m}
                    </span>
                  ))}
                  {c.missed.map((m, i) => (
                    <span
                      key={`x-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-900 dark:text-red-100 border border-red-500/40"
                    >
                      <XCircle className="w-3 h-3" />
                      {m}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs opacity-90">{c.feedback}</p>
            </div>
          );
        })}
      </div>

      {result.examinerNotes.length > 0 && (
        <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 space-y-2 text-cyan-950 dark:text-cyan-100">
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
            <BookOpen className="w-3.5 h-3.5" />
            {isAf ? "Eksaminator-riglyne uit memo" : "Examiner guidance from memo"}
          </p>
          <ul className="space-y-1 text-xs">
            {result.examinerNotes.slice(0, 6).map((note, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 opacity-70">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
