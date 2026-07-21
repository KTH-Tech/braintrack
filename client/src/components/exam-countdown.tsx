import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Rocket, GraduationCap } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";

// Fallback date used when the learner has no prelim data or is unauthenticated.
// Reflects the earliest entry in the NSC 2026 SACAI preliminary timetable
// (CAT P1 practical on 17 Aug 2026).
export const PRELIMS_DATE = new Date("2026-08-17T09:00:00+02:00");
// First paper of the official DBE Oct/Nov 2026 NSC timetable (FINAL — February 2026
// revision): Computer Applications Technology P1 Practical, Tue 13 Oct 2026, 09:00 SAST.
// Finals window runs 13 Oct – 27 Nov 2026 (last seeded paper: Music P2, Wed 25 Nov).
export const FINALS_DATE = new Date("2026-10-13T09:00:00+02:00");

export type PrelimExamEntry = {
  examDate: string;
  startTime: string;
  subjectName: string;
  paperNumber: number;
};

/**
 * Returns the earliest *upcoming* prelim exam for the authenticated learner.
 * Resolution order: learner-set dates override school-set dates (handled server-side).
 * Past prelims are skipped so the countdown always points to the next event.
 *
 * Return values:
 *   earliestPrelim  — the next upcoming exam entry, or null
 *   targetDate      — the Date for that exam, or null
 *   hasAnyPrelimData— true if the learner has prelim records (even if all are past)
 *   isLoading       — true while the authenticated fetch is in-flight
 *
 * Callers should distinguish three states:
 *   !hasAnyPrelimData            → no data yet  (show CTA / use SACAI default)
 *   hasAnyPrelimData && !targetDate → all prelims past (show "done" state)
 *   hasAnyPrelimData && targetDate  → upcoming prelim  (live countdown)
 */
export function useEarliestPrelimDate(): {
  earliestPrelim: PrelimExamEntry | null;
  targetDate: Date | null;
  hasAnyPrelimData: boolean;
  isLoading: boolean;
} {
  const { isAuthenticated } = useAuth();

  const { data: prelimData, isLoading } = useQuery<{
    exams: PrelimExamEntry[];
    count: number;
  }>({
    queryKey: ["/api/learner/prelim-exams"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const allExams = prelimData?.exams ?? [];
  const now = new Date();
  const upcoming = allExams
    .filter(e => new Date(`${e.examDate}T${e.startTime}:00+02:00`) > now)
    .sort((a, b) =>
      `${a.examDate}T${a.startTime}`.localeCompare(`${b.examDate}T${b.startTime}`)
    );

  const earliestPrelim = upcoming[0] ?? null;
  const targetDate = earliestPrelim
    ? new Date(`${earliestPrelim.examDate}T${earliestPrelim.startTime}:00+02:00`)
    : null;

  return {
    earliestPrelim,
    targetDate,
    hasAnyPrelimData: isAuthenticated && !isLoading && allExams.length > 0,
    isLoading: isAuthenticated ? isLoading : false,
  };
}

/**
 * Isolated day-counter that ticks every second but only re-renders its own
 * ~5-element subtree — prevents full-page re-renders when embedded in large
 * layouts like the Dashboard command bridge hero.
 */
export function CountdownDigits({
  target,
  hex,
  dayLabel,
  daysLabel,
}: {
  target: Date;
  hex: string;
  dayLabel: string;
  daysLabel: string;
}) {
  const calcDays = () => Math.max(0, Math.floor((target.getTime() - Date.now()) / 86400000));
  const [days, setDays] = useState<number>(calcDays);
  useEffect(() => {
    setDays(calcDays());
    const id = setInterval(() => setDays(calcDays()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.getTime()]);
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="text-3xl sm:text-[34px] font-black tabular-nums leading-none"
        style={{
          fontFamily: '"JetBrains Mono", "Sora", monospace',
          color: hex,
        }}
      >
        {days}
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: hex }}>
        {days === 1 ? dayLabel : daysLabel}
      </span>
    </div>
  );
}

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function calc(target: Date): Countdown {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Cell({ value, unit }: { value: string | number; unit: string }) {
  return (
    <div className="flex flex-col items-center min-w-[3.25rem] px-2 py-1.5 rounded-lg bg-background/80 border border-border shadow-sm">
      <span className="text-xl sm:text-2xl font-bold tabular-nums text-foreground leading-none">{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-white mt-0.5">{unit}</span>
    </div>
  );
}

function Block({
  label,
  icon: Icon,
  iconColor,
  cd,
  isAf,
  testid,
}: {
  label: string;
  icon: any;
  iconColor: string;
  cd: Countdown;
  isAf: boolean;
  testid: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2" data-testid={testid}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        <Cell value={cd.days} unit={isAf ? "Dae" : "Days"} />
        <span className="text-white text-sm">:</span>
        <Cell value={String(cd.hours).padStart(2, "0")} unit={isAf ? "Ure" : "Hrs"} />
        <span className="text-white text-sm">:</span>
        <Cell value={String(cd.minutes).padStart(2, "0")} unit="Min" />
        <span className="text-white text-sm">:</span>
        <Cell value={String(cd.seconds).padStart(2, "0")} unit="Sec" />
      </div>
    </div>
  );
}

export function ExamCountdown({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const isAf = language === "af";

  const { targetDate, hasAnyPrelimData } = useEarliestPrelimDate();

  // Three-state prelim target:
  //   upcoming → live countdown to that date
  //   all past → a past sentinel so calc() returns 0:0:0:0 (not the SACAI
  //              seeded default which is intended for unauthenticated visitors)
  //   no data / unauthenticated → PRELIMS_DATE fallback (SACAI 2026 start)
  const prelimTarget = targetDate
    ? targetDate
    : hasAnyPrelimData
    ? new Date(0) // all prelims done — show 0:0:0:0
    : PRELIMS_DATE; // unauthenticated / no data → SACAI default

  const [prelims, setPrelims] = useState<Countdown>(() => calc(prelimTarget));
  const [finals, setFinals] = useState<Countdown>(() => calc(FINALS_DATE));

  useEffect(() => {
    setPrelims(calc(prelimTarget));
    const id = setInterval(() => {
      setPrelims(calc(prelimTarget));
      setFinals(calc(FINALS_DATE));
    }, 1000);
    return () => clearInterval(id);
  }, [prelimTarget.getTime()]);

  return (
    <div
      className={`inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-5 py-4 rounded-2xl border border-border/60 bg-gradient-to-br from-cyan-500/5 via-background to-orange-500/5 shadow-md ${className}`}
      data-testid="exam-countdown"
    >
      <Block
        label={isAf ? "Vooreksamens" : "Prelims"}
        icon={Rocket}
        iconColor="text-cyan-500"
        cd={prelims}
        isAf={isAf}
        testid="countdown-prelims"
      />
      <div className="hidden sm:block w-px h-14 bg-border" />
      <Block
        label={isAf ? "Finale" : "Finals"}
        icon={GraduationCap}
        iconColor="text-orange-500"
        cd={finals}
        isAf={isAf}
        testid="countdown-finals"
      />
    </div>
  );
}
