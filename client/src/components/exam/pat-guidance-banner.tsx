import { BookOpen, ChevronDown, ChevronUp, ClipboardList, Info, Lightbulb, PenLine, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const PAT_GUIDANCE_MARKER = "[DESIGN_PAT_GUIDANCE_v1]";
export const CREATIVE_WRITING_GUIDANCE_MARKER = "[CREATIVE_WRITING_GUIDANCE_v1]";

export function isPatGuidanceMemo(memoText: string | null | undefined): boolean {
  return typeof memoText === "string" && memoText.startsWith(PAT_GUIDANCE_MARKER);
}

export function isCreativeWritingGuidanceMemo(memoText: string | null | undefined): boolean {
  return typeof memoText === "string" && memoText.startsWith(CREATIVE_WRITING_GUIDANCE_MARKER);
}

export function isGuidanceMemo(memoText: string | null | undefined): boolean {
  return isPatGuidanceMemo(memoText) || isCreativeWritingGuidanceMemo(memoText);
}

function stripMarker(text: string): string {
  if (text.startsWith(PAT_GUIDANCE_MARKER)) {
    return text.slice(PAT_GUIDANCE_MARKER.length).trim();
  }
  if (text.startsWith(CREATIVE_WRITING_GUIDANCE_MARKER)) {
    return text.slice(CREATIVE_WRITING_GUIDANCE_MARKER.length).trim();
  }
  return text;
}

interface PatGuidanceBannerProps {
  memoText: string;
  isAf?: boolean;
  className?: string;
}

/**
 * Renders the Design PAT Marking Guidance panel.
 *
 * Shown in place of a standard memo panel whenever a Design P2 question's
 * memo_text starts with the PAT_GUIDANCE_MARKER sentinel. The guidance is
 * sourced from the official DBE Design Subject Assessment Guidelines.
 */
export function PatGuidanceBanner({
  memoText,
  isAf = false,
  className,
}: PatGuidanceBannerProps) {
  const body = stripMarker(memoText);

  return (
    <div
      className={cn(
        "rounded-xl border border-violet-500/30 bg-violet-500/8 space-y-3 p-4",
        className,
      )}
      data-testid="pat-guidance-banner"
    >
      <div className="flex items-start gap-2.5">
        <ClipboardList className="w-4 h-4 mt-0.5 text-violet-500 shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            {isAf ? "PAT Beoordelingsleiding" : "PAT Marking Guidance"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isAf
              ? "Ontwerp Vraestel 2 is 'n portefeulje-taak. Geen aparte memo word deur die DBE gepubliseer nie — gebruik hierdie rubriek om jou werk voor indiening self te assesseer."
              : "Design Paper 2 is a portfolio task. No separate memo is published by DBE — use this rubric to self-assess your work before submission."}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-400/30 bg-amber-400/8 px-3 py-2 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 mt-0.5 text-amber-600 shrink-0" />
        <p className="text-[11px] text-amber-700 dark:text-amber-400">
          {isAf
            ? "Hierdie leiding is gebaseer op die amptelike DBE Ontwerp Vakassesseringsriglyne (SAG). Jou onderwyser gebruik die rubriek in die vraestel self om jou portefeulje te beoordeel."
            : "This guidance is based on the official DBE Design Subject Assessment Guidelines (SAG). Your teacher uses the rubric inside the question paper to mark your portfolio."}
        </p>
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-3 max-h-[480px] overflow-y-auto">
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            {isAf ? "Rubrieksamevatting (SAG)" : "Rubric Summary (SAG)"}
          </p>
        </div>
        <pre className="text-[12px] leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
          {body}
        </pre>
      </div>
    </div>
  );
}

const CREATIVE_WRITING_TIPS_EN: string[] = [
  "Choose a topic you have genuine ideas about — depth of thought is rewarded.",
  "Plan your piece before writing — a clear outline prevents structural problems.",
  "Make your introduction engaging and your conclusion deliberate, not abrupt.",
  "Include at least one figurative device (isifaniso, izaci, or another) to show language mastery.",
  "Keep to the required word count, then revise for grammar and spelling after your first draft.",
];

const CREATIVE_WRITING_TIPS_AF: string[] = [
  "Kies 'n onderwerp waaroor jy werklike idees het — diepte van denke word beloon.",
  "Beplan jou stuk voor jy skryf — 'n duidelike raamwerk voorkom struktuurprobleme.",
  "Maak jou inleiding boeiend en jou slot doelgerig, nie abrup nie.",
  "Sluit ten minste een figuurlike toestel in (isifaniso, izaci, of 'n ander) om taalmeesterskap te wys.",
  "Hou by die vereiste woordtelling en gaan dan grammatika en spelling na na jou eerste weergawe.",
];

interface CreativeWritingTipsPanelProps {
  isAf?: boolean;
  onDismiss: () => void;
  className?: string;
}

/**
 * A lightweight, collapsible pre-writing checklist shown BEFORE a learner
 * attempts a creative writing question (isiXhosa HL Paper 3). Unlike the
 * CreativeWritingGuidanceBanner (the full marking rubric revealed with the
 * memo), this panel surfaces 4–5 key self-check tips up front so learners who
 * are stuck before they start get a nudge in the right direction.
 *
 * The panel is collapsible (expand/collapse the tip list) and dismissable
 * (the X removes it for the rest of the session via the onDismiss callback).
 */
export function CreativeWritingTipsPanel({
  isAf = false,
  onDismiss,
  className,
}: CreativeWritingTipsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const tips = isAf ? CREATIVE_WRITING_TIPS_AF : CREATIVE_WRITING_TIPS_EN;

  return (
    <div
      className={cn(
        "rounded-xl border border-sky-500/30 bg-sky-500/8 p-4",
        className,
      )}
      data-testid="creative-writing-tips-panel"
    >
      <div className="flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 mt-0.5 text-sky-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {isAf ? "Voor jy skryf" : "Before you write"}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-expanded={expanded}
                aria-label={
                  expanded
                    ? isAf ? "Vou wenke toe" : "Collapse tips"
                    : isAf ? "Wys wenke" : "Show tips"
                }
                data-testid="button-toggle-writing-tips"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label={isAf ? "Maak toe" : "Dismiss"}
                data-testid="button-dismiss-writing-tips"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isAf
              ? "Vraestel 3 is 'n kreatiewe skryftaak — gebruik hierdie vinnige kontrolelys voor jy begin."
              : "Paper 3 is a creative writing task — use this quick checklist before you start."}
          </p>
          {expanded && (
            <ul className="mt-3 space-y-2 animate-in fade-in">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12px] leading-relaxed text-foreground/90"
                  data-testid={`writing-tip-${i}`}
                >
                  <span className="mt-0.5 text-sky-500 shrink-0">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the Creative Writing Guidance panel for isiXhosa Home Language P3
 * (and any future creative writing papers with no separate DBE memo).
 *
 * Shown whenever a question's memo_text starts with CREATIVE_WRITING_GUIDANCE_MARKER.
 * The guidance is sourced from the official DBE isiXhosa Home Language SAG.
 */
export function CreativeWritingGuidanceBanner({
  memoText,
  isAf = false,
  className,
}: PatGuidanceBannerProps) {
  const body = stripMarker(memoText);

  return (
    <div
      className={cn(
        "rounded-xl border border-sky-500/30 bg-sky-500/8 space-y-3 p-4",
        className,
      )}
      data-testid="creative-writing-guidance-banner"
    >
      <div className="flex items-start gap-2.5">
        <PenLine className="w-4 h-4 mt-0.5 text-sky-500 shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            {isAf ? "Kreatiewe Skryfleiding" : "Creative Writing Guidance"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isAf
              ? "Geen aparte memo word deur die DBE gepubliseer nie — hierdie rubriek is gebaseer op die amptelike DBE Vakassesseringsriglyne (SAG). Gebruik dit om jou skryfwerk self te assesseer."
              : "No separate memo is published by DBE — this rubric is drawn from the official DBE Subject Assessment Guidelines (SAG). Use it to self-assess your creative writing."}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-400/30 bg-amber-400/8 px-3 py-2 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 mt-0.5 text-amber-600 shrink-0" />
        <p className="text-[11px] text-amber-700 dark:text-amber-400">
          {isAf
            ? "Kreatiewe skryfwerk het geen enkele korrekte antwoord nie. Jou onderwyser of eksaminator assesseer jou stuk holisties teen die kriteria in hierdie gids."
            : "Creative writing has no single correct answer. Your teacher or examiner assesses your piece holistically against the criteria in this guide."}
        </p>
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-3 max-h-[480px] overflow-y-auto">
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            {isAf ? "Beoordelingsrubriek (SAG)" : "Marking Rubric (SAG)"}
          </p>
        </div>
        <pre className="text-[12px] leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
          {body}
        </pre>
      </div>
    </div>
  );
}
