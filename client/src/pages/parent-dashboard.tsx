import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { DailyDirective } from "@/types/daily-directive";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { formatDate as fmtDate } from "@/lib/formatters";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useSocket } from "@/hooks/use-socket";
import {
  BookOpen, TrendingUp, Clock, Target, Flame, Calendar,
  CheckCircle, AlertTriangle, ChevronDown, Globe,
  ArrowUpRight, ArrowDownRight, Minus,
  Lightbulb, Trophy, PartyPopper,
  HelpCircle, Home, ArrowLeft, LogOut, ChevronRight,
  GraduationCap, MapPin,
  Download, Activity, Zap, TrendingDown, ShieldAlert, BarChart3,
  RefreshCw, Users, Sparkles, Rocket,
  MessageSquare, CheckCircle2, XCircle, Loader2, Send,
  Link2, Settings2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { VARK_STYLES } from "@/lib/vark";
import { BrandThemeToggle } from "@/components/theme-toggle";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { calcReadiness, readinessBand } from "@/lib/readiness";
import { downloadBlob } from "@/lib/download-file";

interface WeeklyReport {
  weekStarting: string;
  weekEnding: string;
  studyDays: number;
  totalMinutes: number;
  questionsAnswered: number;
  accuracy: number;
  subjectBreakdown: { subjectName: string; questionsAttempted: number; accuracy: number; improvement: number; masteryScore?: number | null; progressScore?: number | null }[];
  achievements: string[];
  areasForImprovement: string[];
  streakDays: number;
}

interface ExamSessionResult {
  subject: string;
  score: number | null;
  totalMarks: number | null;
  date: string;
  status: string;
}

interface ChildProgress {
  learnerName: string;
  currentStreak: number;
  overallAccuracy: number;
  totalQuestionsAnswered: number;
  totalPapersCompleted: number;
  lastActiveDate: string;
  weeklyReport: WeeklyReport;
  subjectMarks: { subjectName: string; initialMark: number; currentMark: number }[];
  examSessions?: ExamSessionResult[];
  varkPrimary?: string | null;
}

interface ReadinessItem {
  subjectName: string;
  readinessScore: number;
  currentAccuracy: number;
  baselineMark: number;
  delta: number;
  masteryBand: "red" | "amber" | "green";
  trendDirection: "up" | "down" | "stable";
  trendScores: number[];
}

interface ActivityEvent {
  id: number;
  type: "quiz_attempt";
  timestamp: string;
  subjectName: string;
  topicName: string | null;
  isCorrect: boolean | null;
  marksAwarded: number | null;
  marksAvailable: number | null;
  questionNumber: string | null;
}

interface ParentSubscriptionInfo {
  plan: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  trialEndsAt: string | null;
  nextRenewalAt: string | null;
  billingMethod: string | null;
  paymentProvider: string | null;
}

interface MonthlySummary {
  questionsAnswered: number;
  studyDays: number;
  avgAccuracy: number;
  topSubjects: { subjectName: string; attempts: number; accuracy: number }[];
}

/* ── Graffiti brand primitives ──────────────────────────────────────────────
   Pastel is the ONLY accent palette on this page. Rules held throughout:
   no neon, no glow, no backdrop-blur, no grey — text is pure #fff or a pastel,
   and headings are marker lettering on a pastel highlighter block.          */

const PASTEL = {
  blue:    "#6FA8FF",
  cyan:    "#7FEFFF",
  emerald: "#93FFB8",
  amber:   "#FFF29E",
  orange:  "#FFC48F",
  pink:    "#FF9FE5",
  purple:  "#C6A4FF",
} as const;

/** Marker outline that keeps tag lettering legible on the wall — not a glow. */
const INK = "0 2px 0 rgba(0,0,0,0.85)";

/** Buttons are rectangles: rounded-xl, bold, flat. Primary = pastel fill + black
    text. Secondary = black fill + pastel hairline + pastel text. */
const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60 disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const BTN_PRIMARY = `${BTN_BASE} px-5 py-2.5`;
const BTN_SECONDARY = `${BTN_BASE} px-4 py-2 bg-black`;

const primaryFill = (hex: string): React.CSSProperties => ({
  background: hex,
  color: "#0a0a0a",
  border: `1.5px solid ${hex}`,
});
const secondaryFill = (hex: string): React.CSSProperties => ({
  color: hex,
  border: `1.5px solid ${hex}`,
});

/** Section heading — marker font, BLACK text on a pastel-gradient highlight.
    Any icon sits outside the highlight so it keeps its own pastel colour. */
function Heading({
  children,
  icon: Icon,
  hex = PASTEL.cyan,
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  hex?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeCls = size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-base" : "text-lg sm:text-xl";
  return (
    <h2 className={`graffiti-hand ${sizeCls} flex items-center gap-2.5 flex-wrap leading-tight ${className}`}>
      {Icon && <Icon className="w-5 h-5 shrink-0" style={{ color: hex }} />}
      <span className="callout-hl">{children}</span>
    </h2>
  );
}

/** A row/section written straight on the wall: 3px pastel stripe, no card box. */
function Rail({ children, hex, className = "", ...rest }: {
  children: React.ReactNode;
  hex: string;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`relative pl-4 sm:pl-5 ${className}`}
      style={{ borderLeft: `3px solid ${hex}` }}
      {...rest}
    >
      {children}
    </section>
  );
}

const COSMIC: Record<"cyan" | "emerald" | "amber" | "red" | "purple" | "pink", { hex: string }> = {
  cyan:    { hex: PASTEL.cyan },
  emerald: { hex: PASTEL.emerald },
  amber:   { hex: PASTEL.amber },
  red:     { hex: PASTEL.pink },
  purple:  { hex: PASTEL.purple },
  pink:    { hex: PASTEL.pink },
};

/** Small pastel chip — hairline border, flat black fill. */
function NeonBadge({ children, color = "cyan" }: { children: React.ReactNode; color?: "cyan" | "emerald" | "amber" | "red" }) {
  const { hex } = COSMIC[color];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-black uppercase tracking-[0.18em]"
      style={{ color: hex, border: `1px solid ${hex}` }}
    >
      {children}
    </span>
  );
}

function TrendSparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return <span className="text-xs text-white">—</span>;
  const W = 60; const H = 24; const pad = 3;
  const max = Math.max(...scores, 1);
  const pts = scores.map((v, i) => {
    const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / max) * (H - pad * 2);
    return `${x},${y}`;
  });
  const last = scores[scores.length - 1];
  const first = scores[0];
  const color = last > first ? "#93FFB8" : last < first ? "#FF9FE5" : "#7FEFFF";
  return (
    <svg width={W} height={H} role="presentation" aria-hidden="true">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Tween an integer from 0 → target over `ms` milliseconds (ease-out cubic).
// Re-runs whenever the target changes. Honours prefers-reduced-motion.
function useCountUp(target: number, ms: number = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") { setValue(target); return; }
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce || target === 0) { setValue(target); return; }
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const delta = target - from;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setValue(Math.round(from + delta * ease(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

// Live exam countdown. Returns ticking days/hours/minutes/seconds to the given exam moment.
function useExamCountdown(dateStr: string, startTime?: string | null) {
  const compute = () => {
    const [hh, mm] = (startTime || "09:00").split(":").map(n => parseInt(n, 10));
    const target = new Date(dateStr + `T${String(hh || 9).padStart(2, "0")}:${String(mm || 0).padStart(2, "0")}:00`).getTime();
    const diff = Math.max(0, target - Date.now());
    const totalSec = Math.floor(diff / 1000);
    return {
      total: diff,
      days: Math.floor(totalSec / 86400),
      hours: Math.floor((totalSec % 86400) / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
    };
  };
  const [state, setState] = useState(compute);
  useEffect(() => {
    setState(compute());
    const id = window.setInterval(() => setState(compute()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr, startTime]);
  return state;
}

/** Headline stat tile — a big pastel number and a small white label, sitting on
    a soft panel (no heavy card chrome, no glow). `value` may be a string so
    tiles like study time can render "4h 05m". */
function StatTile({
  icon: Icon,
  label,
  value,
  unit,
  hex,
  testId,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: number | string;
  unit?: string;
  hex: string;
  testId?: string;
}) {
  const isNumeric = typeof value === "number";
  const counted = useCountUp(isNumeric ? Math.max(0, Math.round(value as number)) : 0, 1100);
  const display = isNumeric ? counted : value;
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: "#0a0b12", border: `1px solid ${hex}` }}
      data-testid={testId}
    >
      <Icon className="w-5 h-5 mb-3" style={{ color: hex }} />
      <p className="text-3xl sm:text-4xl font-black leading-none tabular-nums" style={{ color: hex }}>
        {display}
        {unit ? <span className="text-sm font-bold text-white ml-1">{unit}</span> : null}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white mt-2.5 leading-snug">{label}</p>
    </div>
  );
}

function WeeklyMiniStat({ label, target, suffix, hex }: { label: string; target: number; suffix: string; hex: string }) {
  const display = useCountUp(Math.max(0, Math.round(target)), 950);
  // Wall-written mini stat: pastel number, plain white label, no box.
  return (
    <div className="text-center">
      <p className="text-3xl font-black tabular-nums" style={{ color: hex }}>
        {display}{suffix}
      </p>
      <p className="text-[10px] mt-1 font-bold uppercase tracking-wider text-white">{label}</p>
    </div>
  );
}

function AlarmDigit({ value, hex }: { value: string; hex: string }) {
  // Ghost "88" behind each digit like a 7-seg LCD alarm clock. Flat pastel —
  // the tick no longer pulses a glow.
  return (
    <span className="relative inline-block min-w-[14px] text-center leading-none">
      <span
        aria-hidden
        className="absolute inset-0 text-[14px] font-black tabular-nums select-none"
        style={{ color: hex, opacity: 0.15, fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace" }}
      >
        8
      </span>
      <span
        className="relative text-[14px] font-black tabular-nums"
        style={{ color: hex, fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace" }}
      >
        {value}
      </span>
    </span>
  );
}

function CountdownClock({ dateStr, startTime, hex, isAf }: { dateStr: string; startTime?: string | null; hex: string; isAf: boolean }) {
  const { days, hours, minutes, seconds, total } = useExamCountdown(dateStr, startTime);

  // Urgency ramp: <1d pink pulse, <7d orange, otherwise keep parent hex
  const urgentHex =
    total < 24 * 3600 * 1000 ? "#FF9FE5" :
    total < 7 * 86400 * 1000 ? "#FFC48F" :
    hex;

  const labels = isAf
    ? { d: "D", h: "U", m: "M", s: "S" }
    : { d: "D", h: "H", m: "M", s: "S" };
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = [
    { v: pad(days),    l: labels.d },
    { v: pad(hours),   l: labels.h },
    { v: pad(minutes), l: labels.m },
    { v: pad(seconds), l: labels.s },
  ];

  if (total === 0) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black text-[11px] font-black uppercase tracking-[0.18em]"
        style={{ color: PASTEL.pink, border: `1.5px solid ${PASTEL.pink}` }}
      >
        <Clock className="w-3 h-3" /> {isAf ? "Eksamen BEGIN!" : "EXAM IS ON!"}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0.5" aria-label={isAf ? "Aftel na eksamen" : "Countdown to exam"}>
      <span
        className="text-[7px] font-black tracking-[0.28em] uppercase text-white"
        aria-hidden
      >
        {isAf ? "Jou tyd begin" : "Your time starts"}
      </span>
      <div
        className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-black"
        style={{ border: `1px solid ${urgentHex}` }}
      >
        {parts.map((p, i) => (
          <div key={i} className="flex items-baseline">
            <div
              className="flex flex-col items-center justify-center rounded-[4px] min-w-[26px] px-1 py-[2px]"
            >
              <div className="flex items-center gap-[1px]">
                <AlarmDigit value={p.v[0]} hex={urgentHex} />
                <AlarmDigit value={p.v[1]} hex={urgentHex} />
              </div>
              <span className="text-[7px] leading-none mt-[2px] font-black tracking-[0.22em]" style={{ color: `${urgentHex}cc` }}>{p.l}</span>
            </div>
            {i < parts.length - 1 && (
              <span
                className="mx-[2px] text-[12px] font-black leading-none bt-blink-colon tabular-nums"
                style={{ color: urgentHex }}
                aria-hidden
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Per-child readiness card: fetches its own child-progress + per-subject readiness keyed by learnerId,
// so parents with multiple linked children see a card per child with parity-checked numbers.
function ChildReadinessCard({
  learnerId,
  fallbackName,
  subjects,
  isAf,
}: {
  learnerId: string;
  fallbackName: string;
  subjects: { id: number; name: string; nameAfrikaans?: string | null }[] | undefined;
  isAf: boolean;
}) {
  const { data: progress } = useQuery<ChildProgress>({
    queryKey: ["/api/parent/child-progress", learnerId],
    queryFn: () => fetch(`/api/parent/child-progress?learnerId=${encodeURIComponent(learnerId)}`, { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });
  const { data: subjectReadinessData } = useQuery<{ readiness: Record<number, number> }>({
    queryKey: ["/api/parent/learner-subject-readiness", learnerId],
    queryFn: () => fetch(`/api/parent/learner-subject-readiness?learnerId=${encodeURIComponent(learnerId)}`, { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });
  // Task #770 — persistent "learner opened the sign-in link" badge. We read the
  // per-learner onboarding-link history (most-recent token first) and surface a
  // green confirmation once that token has been claimed (usedAt set). While the
  // link is still unopened we keep polling so the badge flips in near-real-time.
  const { data: linkHistory } = useQuery<Array<{ usedAt?: string | null; createdAt?: string | null }>>({
    queryKey: ["/api/parent/onboarding-link-history", learnerId],
    queryFn: () => fetch(`/api/parent/onboarding-link-history?learnerId=${encodeURIComponent(learnerId)}`, { credentials: "include" }).then(r => (r.ok ? r.json() : [])),
    refetchInterval: (query) => {
      const rows = query.state.data as Array<{ usedAt?: string | null }> | undefined;
      if (!rows || rows.length === 0) return false;
      return rows[0]?.usedAt ? false : 15_000;
    },
  });
  const latestLink = linkHistory?.[0];
  const linkOpened = !!latestLink?.usedAt;
  const linkOpenedAt = (() => {
    if (!latestLink?.usedAt) return "";
    try {
      return new Date(latestLink.usedAt).toLocaleDateString([], { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  })();
  const learnerName = progress?.learnerName || fallbackName;
  const overall = calcReadiness({
    accuracy: progress?.overallAccuracy,
    studyStreak: progress?.currentStreak,
    questionsAnswered: progress?.totalQuestionsAnswered,
  });
  const overallBand = readinessBand(overall);
  const overallHex = overallBand === "green" ? "#93FFB8" : overallBand === "amber" ? "#FFF29E" : "#FF9FE5";

  const subjectName = (id: number) => {
    const s = subjects?.find(x => x.id === id);
    if (!s) return isAf ? `Vak ${id}` : `Subject ${id}`;
    return isAf ? (s.nameAfrikaans || s.name) : s.name;
  };

  const pills = Object.entries(subjectReadinessData?.readiness ?? {})
    .map(([id, score]) => ({ id: Number(id), score: Number(score) }))
    .sort((a, b) => b.score - a.score);

  return (
    <Rail hex={overallHex}>
      <div className="flex items-start gap-4 flex-wrap" data-testid={`parent-child-readiness-${learnerId}`}>
        <div className="flex items-center gap-4">
          <ReadinessRing pct={overall} hex={overallHex} size={84} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: overallHex }}>
              {isAf ? "Gereedheid" : "Readiness"}
            </p>
            <h3 className="text-base font-bold text-white leading-tight" data-testid={`parent-child-name-${learnerId}`}>
              {learnerName}
            </h3>
            {linkOpened && (
              <span
                className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-black text-[10px] font-bold"
                style={{ color: "#93FFB8", border: "1px solid #93FFB866" }}
                data-testid={`parent-child-link-opened-${learnerId}`}
                title={isAf ? "Jou kind het die teken-in-skakel oopgemaak" : "Your child has opened the sign-in link"}
              >
                <CheckCircle2 className="w-3 h-3" style={{ color: "#93FFB8" }} />
                {isAf ? "Skakel oopgemaak" : "Opened link"}
                {linkOpenedAt ? <span className="font-normal text-white">· {linkOpenedAt}</span> : null}
              </span>
            )}
            <p className="text-[11px] text-white mt-0.5">
              {isAf
                ? "Dieselfde getal wat jou kind sien."
                : "The same number your child sees."}
            </p>
          </div>
        </div>
        {pills.length > 0 && (
          <div className="flex-1 min-w-[240px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white mb-2">
              {isAf ? "Per Vak" : "Per Subject"}
            </p>
            <div className="flex flex-wrap gap-1.5" data-testid={`parent-child-pills-${learnerId}`}>
              {pills.map(({ id, score }) => {
                const band = readinessBand(score);
                const hex = band === "green" ? "#93FFB8" : band === "amber" ? "#FFF29E" : "#FF9FE5";
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-[11px] font-semibold"
                    style={{ color: hex, border: `1px solid ${hex}66` }}
                    data-testid={`parent-child-pill-${learnerId}-${id}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: hex }} />
                    {subjectName(id)}
                    <span className="tabular-nums font-black">{score}%</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Rail>
  );
}

function ReadinessPanel({ readiness, isAf }: { readiness: ReadinessItem[]; isAf: boolean }) {
  if (!readiness.length) return null;
  return (
    <div className="space-y-4">
      <Heading icon={Zap} hex={PASTEL.cyan}>
        {isAf ? "Gereedheidstelsel per Vak" : "Readiness Score per Subject"}
      </Heading>
      <p className="text-xs text-white">{isAf ? "Hoe gereed is jou kind vir die eksamen in elke vak?" : "How exam-ready is your child in each subject?"}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {readiness.map((item) => {
          const bandColor: "emerald" | "amber" | "red" = item.masteryBand === "green" ? "emerald" : item.masteryBand === "amber" ? "amber" : "red";
          const glowColor: "emerald" | "amber" | "red" = bandColor;
          return (
            <ReadinessCard
              key={item.subjectName}
              item={item}
              bandColor={bandColor}
              glowColor={glowColor}
              isAf={isAf}
            />
          );
        })}
      </div>
    </div>
  );
}

function ReadinessRing({ pct, hex, size = 92 }: { pct: number; hex: string; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c - (clamped / 100) * c;
  const id = `rg-${Math.round(pct * 1000)}-${hex.replace("#", "")}`;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="presentation" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={hex} stopOpacity="0.9" />
            <stop offset="100%" stopColor={hex} stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-xl font-black tabular-nums leading-none"
          style={{ color: "#fff" }}
        >
          {Math.round(clamped)}
        </span>
        <span className="text-[9px] font-black tracking-[0.18em] mt-0.5" style={{ color: hex }}>%</span>
      </div>
    </div>
  );
}

function ReadinessCard({ item, bandColor, glowColor, isAf }: {
  item: ReadinessItem;
  bandColor: "emerald" | "amber" | "red";
  glowColor: "emerald" | "amber" | "red";
  isAf: boolean;
}) {
  const readinessDisplay = useCountUp(item.readinessScore, 1100);
  const baselineDisplay = useCountUp(item.baselineMark, 900);
  const deltaDisplay = useCountUp(Math.abs(item.delta), 900);
  const deltaSign = item.delta >= 0 ? "+" : "-";
  const barHex = item.masteryBand === "green" ? "#93FFB8" : item.masteryBand === "amber" ? "#FFF29E" : "#FF9FE5";
  return (
            <Rail hex={COSMIC[glowColor].hex} className="py-1">
              <div className="flex items-start justify-between mb-3">
                <p className="font-semibold text-sm text-white leading-tight">{item.subjectName}</p>
                <NeonBadge color={bandColor}>
                  {item.masteryBand === "green" ? (isAf ? "Sterk" : "Strong") : item.masteryBand === "amber" ? (isAf ? "Bou" : "Building") : (isAf ? "Nodig" : "Needs Work")}
                </NeonBadge>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <ReadinessRing pct={readinessDisplay} hex={barHex} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white uppercase tracking-[0.18em] font-bold">{isAf ? "Gereedheid" : "Readiness"}</p>
                  <div className="mt-1">
                    <TrendSparkline scores={item.trendScores} />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {item.trendDirection === "up" && <ArrowUpRight className="w-3 h-3" style={{ color: "#93FFB8" }} />}
                    {item.trendDirection === "down" && <TrendingDown className="w-3 h-3" style={{ color: "#FF9FE5" }} />}
                    {item.trendDirection === "stable" && <Minus className="w-3 h-3 text-white" />}
                    <span className="text-[10px] text-white">
                      {item.trendDirection === "up" ? (isAf ? "Styg" : "Rising") : item.trendDirection === "down" ? (isAf ? "Daal" : "Dropping") : (isAf ? "Stabiel" : "Stable")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white tabular-nums">{isAf ? "Aanvanglyn" : "Baseline"}: {baselineDisplay}%</span>
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: item.delta >= 0 ? "#93FFB8" : "#FF9FE5" }}>
                  {deltaSign}{deltaDisplay}% {isAf ? "verbetering" : "change"}
                </span>
              </div>
            </Rail>
  );
}

/** Weak topics — the "what do I actually do about it" list. One 3px pastel
    left-border row per struggling subject, sorted worst-first, each spelling out
    why it is flagged. Sits directly under the headline stats. */
function RiskAlerts({ readiness, isAf }: { readiness: ReadinessItem[]; isAf: boolean }) {
  const alerts = readiness
    .filter((r) => r.masteryBand === "red" || r.trendDirection === "down")
    .slice()
    .sort((a, b) => a.readinessScore - b.readinessScore);
  if (!alerts.length) return null;

  return (
    <section data-testid="parent-weak-topics">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Heading icon={ShieldAlert} hex={PASTEL.pink}>
          {isAf ? "Aandag Vereis" : "Needs Attention"}
        </Heading>
        <NeonBadge color="red">{alerts.length} {isAf ? "vak" : alerts.length === 1 ? "subject" : "subjects"}</NeonBadge>
      </div>
      <div className="space-y-3">
        {alerts.map((a) => {
          const hex = a.masteryBand === "red" ? PASTEL.pink : PASTEL.amber;
          return (
            <Rail key={a.subjectName} hex={hex} className="py-1">
              <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                <span className="text-sm font-bold text-white">{a.subjectName}</span>
                <div className="flex items-center gap-2">
                  {a.trendDirection === "down" && (
                    <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: hex }}>
                      <TrendingDown className="w-3 h-3" />
                      {isAf ? "Dalende tendens" : "Declining trend"}
                    </span>
                  )}
                  <span
                    className="text-[10px] font-black tabular-nums px-2 py-0.5 rounded-full bg-black"
                    style={{ color: hex, border: `1px solid ${hex}` }}
                  >
                    {a.readinessScore}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-white leading-relaxed">
                {a.masteryBand === "red"
                  ? (isAf
                    ? `Hierdie vak het tans 'n lae bemeesteringsvlak (${a.currentAccuracy}%). 'n Bietjie ekstra aandag hier kan 'n groot verskil maak.`
                    : `This subject currently has a low mastery level (${a.currentAccuracy}%). A little extra focus here can make a big difference.`)
                  : (isAf
                    ? `Hierdie vak wys 'n afwaartse tendens oor die afgelope 7 dae. Moedig jou kind aan om meer te oefen.`
                    : `This subject is showing a downward trend over the last 7 days. Encourage your child to practise a bit more.`)}
              </p>
            </Rail>
          );
        })}
      </div>
    </section>
  );
}

function ActivityFeed({ events, isAf }: { events: ActivityEvent[]; isAf: boolean }) {
  const recent = events.slice(0, 10);
  if (!recent.length) return null;

  const relativeTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isAf ? "Nou net" : "Just now";
    if (mins < 60) return isAf ? `${mins} min gelede` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return isAf ? `${hours} uur gelede` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return isAf ? `${days} dag${days !== 1 ? "e" : ""} gelede` : `${days}d ago`;
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Heading icon={Activity} hex={PASTEL.cyan}>
          {isAf ? "Onlangse Aktiwiteit" : "Recent Activity"}
        </Heading>
        <NeonBadge color="cyan">{isAf ? "Lewend" : "Live"}</NeonBadge>
      </div>
      <div className="space-y-3">
        {recent.map((event, i) => (
          <div key={event.id} className="flex items-center gap-3 pl-3" style={{ borderLeft: `3px solid ${event.isCorrect ? PASTEL.emerald : PASTEL.pink}` }}>
            {event.isCorrect
              ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#93FFB8" }} />
              : <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#FF9FE5" }} />}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {event.subjectName}{event.topicName ? ` · ${event.topicName}` : ""}
              </p>
              <p className="text-[10px] text-white">
                {event.isCorrect
                  ? (isAf ? "Korrek beantwoord" : "Answered correctly")
                  : (isAf ? "Probeer nog" : "Still learning")}
                {event.marksAwarded != null && event.marksAvailable != null && ` · ${event.marksAwarded}/${event.marksAvailable}`}
              </p>
            </div>
            <span className="text-[10px] text-white shrink-0">{relativeTime(event.timestamp)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MonthlySummaryPanel({ summary, isAf }: { summary: MonthlySummary; isAf: boolean }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <Heading icon={BarChart3} hex={PASTEL.amber}>
          {isAf ? "30-Dae Opsomming" : "30-Day Summary"}
        </Heading>
        <NeonBadge color="amber">{isAf ? "Hierdie Maand" : "This Month"}</NeonBadge>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: isAf ? "Vrae Beantwoord" : "Questions Answered", value: summary.questionsAnswered, hex: "#7FEFFF" },
          { label: isAf ? "Studiedae" : "Study Days",               value: summary.studyDays,         hex: "#6FA8FF" },
          { label: isAf ? "Gem. Akkuraatheid" : "Avg Accuracy",     value: `${summary.avgAccuracy}%`, hex: "#93FFB8" },
        ].map(({ label, value, hex }) => (
          <div key={label} className="text-center">
            <p className="text-3xl font-black tabular-nums" style={{ color: hex }}>{value}</p>
            <p className="text-[10px] text-white mt-1 font-bold uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>
      {summary.topSubjects.length > 0 && (
        <div>
          <p className="text-[10px] text-white uppercase tracking-widest mb-2">{isAf ? "Beste Vakke Hierdie Maand" : "Top Subjects This Month"}</p>
          <div className="space-y-2">
            {summary.topSubjects.slice(0, 3).map((s, i) => (
              <div key={s.subjectName} className="flex items-center gap-3">
                <span className="text-[10px] text-white w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-white font-medium">{s.subjectName}</span>
                    <span className="text-xs font-bold" style={{ color: "#7FEFFF" }}>{s.accuracy}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-black overflow-hidden" style={{ border: "1px solid #ffffff" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.accuracy}%`, background: "#7FEFFF" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SubscriptionPanel({ isAf }: { isAf: boolean }) {
  const { data: sub, isLoading } = useQuery<ParentSubscriptionInfo | null>({
    queryKey: ["/api/user/subscription"],
    queryFn: () => fetch("/api/user/subscription", { credentials: "include" }).then(r => (r.ok ? r.json() : null)),
    staleTime: 60_000,
  });

  if (isLoading) return null;

  const status = (sub?.status || "none").toLowerCase();
  const planName = sub?.plan || "Brain Boost";

  const statusMap: Record<string, { en: string; af: string; hex: string }> = {
    active:       { en: "Active",          af: "Aktief",         hex: "#93FFB8" },
    trial:        { en: "Free Trial",      af: "Gratis Proeftyd", hex: "#7FEFFF" },
    trialing:     { en: "Free Trial",      af: "Gratis Proeftyd", hex: "#7FEFFF" },
    pending:      { en: "Pending",         af: "Hangend",        hex: "#FFF29E" },
    grace:        { en: "Payment Issue",   af: "Betaalprobleem", hex: "#FFC48F" },
    grace_period: { en: "Payment Issue",   af: "Betaalprobleem", hex: "#FFC48F" },
    lapsed:       { en: "Expired",         af: "Verval",         hex: "#FF9FE5" },
    cancelled:    { en: "Cancelled",       af: "Gekanselleer",   hex: "#FF9FE5" },
    none:         { en: "Not Subscribed",  af: "Nie Ingeskryf",  hex: "#C6A4FF" },
  };
  const s = statusMap[status] || statusMap.none;

  // Pick the most relevant "next billing" date.
  const nextDateStr = sub?.nextRenewalAt || sub?.trialEndsAt || sub?.endDate || null;
  let nextDateLabel: string | null = null;
  if (nextDateStr) {
    try {
      const d = new Date(nextDateStr);
      if (!isNaN(d.getTime())) {
        nextDateLabel = d.toLocaleDateString(isAf ? "af-ZA" : "en-ZA", {
          day: "numeric", month: "short", year: "numeric",
        });
      }
    } catch { /* ignore */ }
  }

  const nextLabel = (status === "trial" || status === "trialing")
    ? (isAf ? "Proeftyd verstryk" : "Trial ends")
    : (isAf ? "Volgende fakturering" : "Next billing");

  return (
    <section
      className="relative pl-4 sm:pl-5 py-1"
      style={{ borderLeft: `3px solid ${s.hex}` }}
      data-testid="parent-subscription-panel"
    >
      <div className="relative flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: s.hex }}>
            {isAf ? "Intekening" : "Subscription"}
          </p>
          <h3 className="graffiti-hand text-xl text-white">{planName}</h3>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-[11px] font-bold"
            style={{ color: s.hex, border: `1px solid ${s.hex}66` }}
            data-testid="parent-subscription-status"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.hex }} />
            {isAf ? s.af : s.en}
          </div>
          {nextDateLabel && (
            <p className="text-[11px] text-white mt-2" data-testid="parent-subscription-next-date">
              {nextLabel}: <span className="font-semibold text-white">{nextDateLabel}</span>
            </p>
          )}
        </div>
        <Link href="/subscribe">
          <Button
            size="sm"
            className={`${BTN_SECONDARY} shrink-0`}
            style={secondaryFill(PASTEL.cyan)}
            data-testid="button-manage-subscription"
          >
            {isAf ? "Bestuur Betaling" : "Manage Payment"}
          </Button>
        </Link>
      </div>
    </section>
  );
}

type LinkStatusRow = {
  found: boolean;
  jti?: string;
  deliveryStatus?: string | null;
  deliveryError?: string | null;
  deliveryUpdatedAt?: string | null;
  channel?: string | null;
  sentTo?: string | null;
  createdAt?: string | null;
  usedAt?: string | null;
};

const TERMINAL_STATUSES = new Set(["delivered", "failed", "undelivered", "not_configured"]);

function WhatsAppLinkStatusPanel({ isAf }: { isAf: boolean }) {
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<LinkStatusRow>({
    queryKey: ["/api/subscribe/onboarding-link-status"],
    queryFn: () =>
      fetch("/api/subscribe/onboarding-link-status", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : { found: false },
      ),
    refetchInterval: (query) => {
      const d = query.state.data as LinkStatusRow | undefined;
      if (!d?.found) return false;
      if (d.usedAt) return false;
      if (d.deliveryStatus && TERMINAL_STATUSES.has(d.deliveryStatus)) return false;
      return 5_000;
    },
    staleTime: 3_000,
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    setResending(true);
    setResendError(null);
    try {
      const r = await apiRequest("POST", "/api/subscribe/resend-onboarding-link", {});
      const d = r as any;
      if (d?.sent) {
        queryClient.invalidateQueries({ queryKey: ["/api/subscribe/onboarding-link-status"] });
        if (d.cooldownSeconds) setResendCooldown(d.cooldownSeconds);
      } else {
        setResendError(d?.message || (isAf ? "Stuur het misluk" : "Resend failed"));
      }
    } catch {
      setResendError(isAf ? "Netwerk fout — probeer weer" : "Network error — try again");
    } finally {
      setResending(false);
    }
  };

  if (isLoading || !data?.found) return null;

  const status = (data.deliveryStatus || "").toLowerCase();
  if (!status || status === "not_configured") return null;

  const isDelivered = status === "delivered";
  const isSent = status === "sent";
  const isFailed = status === "failed" || status === "undelivered";
  const isOpened = !!data.usedAt;
  const isPending = !isDelivered && !isSent && !isFailed && !isOpened;
  const isInFlight = isPending || isSent;

  const maskCell = (cell: string | null | undefined) => {
    if (!cell) return "";
    const digits = cell.replace(/\D/g, "");
    return digits.length >= 6 ? `${digits.slice(0, 3)}****${digits.slice(-2)}` : "****";
  };

  const fmtTime = (iso: string | null | undefined) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const hex = isOpened ? "#93FFB8" : isDelivered ? "#7FEFFF" : isFailed ? "#FF9FE5" : "#FFF29E";

  return (
    <section
      className="relative pl-4 sm:pl-5 py-1"
      style={{ borderLeft: `3px solid ${hex}` }}
      data-testid="whatsapp-link-status-panel"
    >
      <div className="relative flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4" style={{ color: hex }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: hex }}>
              {isAf ? "WhatsApp-skakel" : "WhatsApp Link"}
            </p>
          </div>

          {isOpened && (
            <div className="flex items-center gap-2" data-testid="link-status-opened">
              <CheckCircle2 className="w-4 h-4" style={{ color: "#93FFB8" }} />
              <p className="text-sm font-semibold text-white">
                {isAf ? "Skakel gebruik ✓" : "Link opened ✓"}
              </p>
            </div>
          )}

          {!isOpened && isDelivered && (() => {
            const deliveredAtLabel = fmtTime(data.deliveryUpdatedAt);
            return (
              <div className="flex items-center gap-2" data-testid="link-status-delivered">
                <CheckCircle2 className="w-4 h-4" style={{ color: "#7FEFFF" }} />
                <p className="text-sm font-semibold text-white">
                  {isAf ? "Afgelewer" : "Delivered"}
                  {deliveredAtLabel
                    ? <span className="ml-1 font-normal text-white">{deliveredAtLabel} ✓</span>
                    : " ✓"}
                </p>
              </div>
            );
          })()}

          {!isOpened && isSent && (() => {
            const sentAtLabel = fmtTime(data.createdAt);
            return (
              <div className="flex items-center gap-2" data-testid="link-status-sent">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#FFF29E" }} />
                <p className="text-sm text-white">
                  {isAf
                    ? <>Gestuur{sentAtLabel ? <span className="font-semibold"> {sentAtLabel}</span> : ""} — wag op bevestiging…</>
                    : <>Sent{sentAtLabel ? <span className="font-semibold"> {sentAtLabel}</span> : ""} — awaiting delivery confirmation…</>}
                </p>
              </div>
            );
          })()}

          {!isOpened && isFailed && (
            <div data-testid="link-status-failed">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4" style={{ color: "#FF9FE5" }} />
                <p className="text-sm font-semibold text-white">
                  {isAf ? "Aflewering misluk" : "Delivery failed"}
                </p>
              </div>
              {data.deliveryError && (
                <p className="text-xs text-white mb-2 font-mono">{data.deliveryError}</p>
              )}
            </div>
          )}

          {!isOpened && isPending && (
            <div className="flex items-center gap-2" data-testid="link-status-pending">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#FFF29E" }} />
              <p className="text-sm text-white">
                {isAf ? "Gestuur — skakel behoort binnekort te kom" : "Sent — link should arrive shortly"}
              </p>
            </div>
          )}

          {data.sentTo && (
            <p className="text-[11px] text-white mt-1">
              {isAf ? "Gestuur na" : "Sent to"}{" "}
              <span className="font-mono font-semibold">{maskCell(data.sentTo)}</span>
            </p>
          )}

          {resendError && (
            <p className="text-xs text-[#FF9FE5] mt-1" data-testid="resend-error">{resendError}</p>
          )}
        </div>

        {!isOpened && (isFailed || isInFlight) && (
          <Button
            size="sm"
            disabled={resending || resendCooldown > 0 || isInFlight}
            onClick={handleResend}
            className={`${BTN_SECONDARY} shrink-0`}
            style={secondaryFill(hex)}
            data-testid="button-resend-whatsapp-link"
            title={isInFlight ? (isAf ? "Wag totdat die skakel afgelewer is" : "Wait until delivery is confirmed") : undefined}
          >
            {resending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {resendCooldown > 0
              ? `${resendCooldown}s`
              : isAf
              ? "Stuur weer"
              : "Resend"}
          </Button>
        )}
      </div>
    </section>
  );
}

function ReportEmailOptOutToggle({ learnerUserId, isAf }: { learnerUserId: string; isAf: boolean }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ preferences: Array<{ learnerUserId: string; optedOut: boolean }> }>({
    queryKey: ["/api/parent/report-email-preference"],
    queryFn: () => fetch("/api/parent/report-email-preference", { credentials: "include" }).then(r => r.json()),
  });

  const current = data?.preferences?.find((p) => p.learnerUserId === learnerUserId);
  const optedOut = !!current?.optedOut;

  const mutation = useMutation({
    mutationFn: async (nextOptOut: boolean) => {
      const r = await apiRequest("PUT", "/api/parent/report-email-preference", {
        learnerUserId,
        optOut: nextOptOut,
      });
      if (!r.ok) throw new Error("Failed to update preference");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent/report-email-preference"] });
    },
  });

  if (!learnerUserId) return null;

  const label = isAf
    ? "Stop ontvangs van geskeduleerde verslag-e-posse"
    : "Stop receiving scheduled report emails";
  const helper = optedOut
    ? isAf
      ? "Jy ontvang nie meer geskeduleerde verslae per e-pos vir hierdie leerder nie."
      : "You're no longer receiving scheduled report emails for this learner."
    : isAf
      ? "Skakel aan om geskeduleerde vorderingsverslae per e-pos te stop."
      : "Turn on to stop scheduled progress reports being emailed to you.";

  return (
    <Rail
      hex={PASTEL.purple}
      className="flex items-start justify-between gap-4 py-1"
      data-testid="report-email-opt-out-toggle"
    >
      <div className="min-w-0">
        <div className="text-sm font-bold text-white">{label}</div>
        <div className="text-xs text-white mt-1">{helper}</div>
      </div>
      {/* Stays a real switch — primary pastel fill when opted out, outlined when not. */}
      <button
        type="button"
        role="switch"
        aria-checked={optedOut}
        disabled={isLoading || mutation.isPending}
        onClick={() => mutation.mutate(!optedOut)}
        data-testid="button-toggle-report-email-opt-out"
        className={`${BTN_SECONDARY} shrink-0`}
        style={optedOut ? primaryFill(PASTEL.purple) : secondaryFill(PASTEL.purple)}
      >
        {optedOut
          ? <><CheckCircle2 className="w-4 h-4" />{isAf ? "Aan" : "On"}</>
          : <><XCircle className="w-4 h-4" />{isAf ? "Af" : "Off"}</>}
      </button>
    </Rail>
  );
}

function DownloadReportButton({ learnerName, isAf }: { learnerName: string; isAf: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parent/report/pdf?lang=${isAf ? "af" : "en"}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const filename = `BrainTrack-Report-${learnerName.replace(/\s+/g, "-")}.pdf`;
      const pdfBlob = blob.type ? blob : new Blob([blob], { type: "application/pdf" });
      await downloadBlob(pdfBlob, filename);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const hint = loading
    ? isAf
      ? "Besig om jou verslag voor te berei — wag asseblief…"
      : "Preparing your report — please wait…"
    : undefined;
  return (
    <span
      title={hint}
      aria-label={hint}
      className="inline-block"
      data-testid="button-download-report-wrapper"
    >
      <button
        onClick={handleDownload}
        disabled={loading}
        title={hint}
        aria-label={hint}
        className={`${BTN_PRIMARY} disabled:cursor-wait`}
        style={primaryFill(PASTEL.cyan)}
        data-testid="button-download-report"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {isAf ? "Laai Verslag Af" : "Download Report"}
      </button>
    </span>
  );
}

const BAR_HEX: Record<string, string> = {
  "bg-emerald-500": "#93FFB8",
  "bg-emerald-400": "#93FFB8",
  "bg-amber-500":   "#FFF29E",
  "bg-amber-400":   "#FFF29E",
  "bg-red-500":     "#FF9FE5",
  "bg-red-400":     "#FF9FE5",
  "bg-pink-500":    "#FF9FE5",
  "bg-cyan-500":    "#7FEFFF",
  "bg-cyan-400":    "#7FEFFF",
  "bg-muted-foreground/40": "#ffffff",
  "bg-white/25":    "#ffffff",
};

function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 120 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  const fill = BAR_HEX[color] ?? color;
  return (
    <div className="h-2 rounded-full bg-black overflow-hidden" style={{ border: "1px solid #ffffff" }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%`, background: fill }}
      />
    </div>
  );
}

function AccuracyCompare({ initial, current, isAf }: { initial: number; current: number; isAf: boolean }) {
  const diff = current - initial;
  const isUp = diff > 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-white mb-1">
        <span>{isAf ? "Aanvanklik" : "Baseline"}</span>
        <span className="font-semibold text-white">{initial}%</span>
      </div>
      <AnimatedBar value={initial} color="bg-muted-foreground/40" delay={0} />
      <div className="flex items-center justify-between text-xs text-white">
        <span>{isAf ? "Huidig" : "Current"}</span>
        <span className="font-semibold" style={{ color: isUp ? "#93FFB8" : diff < 0 ? "#FF9FE5" : undefined }}>{current}%</span>
      </div>
      <AnimatedBar value={current} color={isUp ? "bg-emerald-500" : diff < 0 ? "bg-red-500" : "bg-cyan-500"} delay={200} />
    </div>
  );
}

function Sparkline({ studyDays, totalQ }: { studyDays: number; totalQ: number }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const perDay = Math.round(totalQ / Math.max(studyDays, 1));
  const raw = days.map((_, i) => {
    if (i >= 7 - studyDays) return Math.max(1, perDay + Math.round(Math.sin(i * 1.4) * perDay * 0.4));
    return 0;
  });
  const max = Math.max(...raw, 1);
  const W = 140, H = 36, pad = 4;
  const pts = raw.map((v, i) => {
    const x = pad + (i / (days.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / max) * (H - pad * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const filled = `${pad},${H} ` + pts.join(" ") + ` ${W - pad},${H}`;
  return (
    <div>
      <p className="text-[10px] text-white mb-1 uppercase tracking-wider">7-day activity</p>
      <svg width={W} height={H} className="overflow-visible" role="presentation" aria-hidden="true">
        <defs>
          <linearGradient id="spark-fill-cosmic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(127,239,255,0.28)" />
            <stop offset="100%" stopColor="rgba(127,239,255,0)" />
          </linearGradient>
        </defs>
        <polygon points={filled} fill="url(#spark-fill-cosmic)" />
        <polyline points={polyline} fill="none" stroke="#7FEFFF" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {raw.map((v, i) => {
          const x = pad + (i / (days.length - 1)) * (W - pad * 2);
          const y = H - pad - (v / max) * (H - pad * 2);
          return v > 0 ? <circle key={i} cx={x} cy={y} r="2.5" fill="#7FEFFF" /> : null;
        })}
      </svg>
      <div className="flex justify-between mt-0.5" style={{ width: W }}>
        {days.map((d, i) => (
          <span key={i} className="text-[9px] text-white w-4 text-center">{d}</span>
        ))}
      </div>
    </div>
  );
}

export default function ParentDashboardPage() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const [, navigate] = useLocation();
  useSocket();

  // All linked children for this parent (drives per-child readiness rendering and the active-child switcher).
  const { data: childrenData } = useQuery<{ children: Array<{ learnerUserId: string; learnerName: string }> }>({
    queryKey: ["/api/parent/children"],
  });

  // Active child selection — drives every per-child widget below. Defaults to the first linked
  // learner once the children list arrives so multi-child parents see the same child across all
  // widgets and switching refreshes them in lock-step.
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(null);
  useEffect(() => {
    const list = childrenData?.children ?? [];
    if (list.length === 0) return;
    if (!selectedLearnerId || !list.some(c => c.learnerUserId === selectedLearnerId)) {
      setSelectedLearnerId(list[0].learnerUserId);
    }
  }, [childrenData, selectedLearnerId]);

  // Helper: build a parent-scoped URL with the active learnerId attached so the server returns
  // data for the currently-selected child. Including selectedLearnerId in each queryKey ensures
  // React Query refetches every widget the moment the parent switches between children.
  const withLearner = (path: string) =>
    selectedLearnerId ? `${path}?learnerId=${encodeURIComponent(selectedLearnerId)}` : path;

  const {
    data: childProgress,
    isLoading,
    error: childProgressError,
    refetch: refetchChildProgress,
    isRefetching: isRefetchingChildProgress,
  } = useQuery<ChildProgress>({
    queryKey: ["/api/parent/child-progress", selectedLearnerId],
    queryFn: () => fetch(withLearner("/api/parent/child-progress"), { credentials: "include" }).then(r => r.json()),
  });

  const { data: learnerExamData } = useQuery<{
    schedule: Array<{
      subjectName: string;
      paperNumber: number;
      examDate: string;
      startTime: string | null;
      daysRemaining: number;
      urgencyState: string;
      subjectId: number | null;
      subjectAccuracy: number | null;
      isAtRisk: boolean;
    }>;
    nonExamDays: Array<{ examDate: string; subjectName: string }>;
    learnerId: string;
  }>({
    queryKey: ["/api/parent/learner-exam-schedule", selectedLearnerId],
    queryFn: () => fetch(withLearner("/api/parent/learner-exam-schedule"), { credentials: "include" }).then(r => r.json()),
  });

  const { data: learnerDirective } = useQuery<DailyDirective>({
    queryKey: ["/api/parent/learner-today-directive", selectedLearnerId],
    queryFn: () => fetch(withLearner("/api/parent/learner-today-directive"), { credentials: "include" }).then(r => r.json()),
    retry: false,
    staleTime: 60_000,
  });

  const { data: readinessData } = useQuery<{ readiness: ReadinessItem[] }>({
    queryKey: ["/api/parent/readiness", selectedLearnerId],
    queryFn: () => fetch(withLearner("/api/parent/readiness"), { credentials: "include" }).then(r => r.json()),
    enabled: !!childProgress,
    refetchInterval: 60000,
  });

  const { data: activityData } = useQuery<{ feed: ActivityEvent[] }>({
    queryKey: ["/api/parent/activity-feed", selectedLearnerId],
    queryFn: () => fetch(withLearner("/api/parent/activity-feed"), { credentials: "include" }).then(r => r.json()),
    enabled: !!childProgress,
    refetchInterval: 30000,
  });

  const { data: monthlySummaryData } = useQuery<MonthlySummary>({
    queryKey: ["/api/parent/monthly-summary", selectedLearnerId],
    queryFn: () => fetch(withLearner("/api/parent/monthly-summary"), { credentials: "include" }).then(r => r.json()),
    enabled: !!childProgress,
    refetchInterval: 120000,
  });

  const { data: subjectsList } = useQuery<{ id: number; name: string; nameAfrikaans?: string | null }[]>({
    queryKey: ["/api/subjects"],
    staleTime: 5 * 60_000,
  });

  const readiness = readinessData?.readiness ?? [];
  const activityFeed = activityData?.feed ?? [];
  // Defensive: server should always populate these but guard against partial payloads.
  if (childProgress) {
    childProgress.weeklyReport = childProgress.weeklyReport ?? {
      weekStarting: new Date().toISOString(),
      weekEnding: new Date().toISOString(),
      studyDays: 0, totalMinutes: 0, questionsAnswered: 0, accuracy: 0,
      subjectBreakdown: [], achievements: [], areasForImprovement: [], streakDays: 0,
    };
    childProgress.weeklyReport.subjectBreakdown = childProgress.weeklyReport.subjectBreakdown ?? [];
    childProgress.weeklyReport.achievements = childProgress.weeklyReport.achievements ?? [];
    childProgress.weeklyReport.areasForImprovement = childProgress.weeklyReport.areasForImprovement ?? [];
    childProgress.subjectMarks = childProgress.subjectMarks ?? [];
    childProgress.examSessions = childProgress.examSessions ?? [];
    childProgress.learnerName = childProgress.learnerName ?? (isAf ? "Jou Kind" : "Your Child");
  }
  const hasNoActivity = !!childProgress
    && (childProgress.totalQuestionsAnswered ?? 0) === 0
    && (childProgress.totalPapersCompleted ?? 0) === 0
    && (childProgress.currentStreak ?? 0) === 0
    && (childProgress.weeklyReport?.questionsAnswered ?? 0) === 0
    && activityFeed.length === 0;
  const formatDate = (dateStr: string) =>
    fmtDate(dateStr, language, { day: "numeric", month: "short", year: "numeric" });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: "#7FEFFF", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-white overflow-hidden">
      {/* One graffiti scatter behind the whole page */}
      <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <GraffitiSplats variant="full" opacity={0.9} />
      </div>

      <header
        className="sticky top-0 z-50 bg-background"
        style={{ borderBottom: `2px solid ${PASTEL.cyan}` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            <span className="graffiti-hand text-base tracking-tight" style={{ color: PASTEL.amber }}>
              {isAf ? "Ouerpaneel" : "Parent Dashboard"}
            </span>
            <div className="flex items-center gap-1.5">
              <BrandThemeToggle />
              <button
                onClick={toggleLanguage}
                className={BTN_SECONDARY}
                style={secondaryFill(PASTEL.purple)}
                data-testid="button-language-toggle"
              >
                <Globe className="h-3.5 w-3.5" />
                {language === "en" ? "EN" : "AF"}
              </button>
              <button
                onClick={() => window.history.back()}
                title={isAf ? "Terug" : "Back"}
                className={`${BTN_SECONDARY} w-9 h-9 !px-0`}
                style={secondaryFill(PASTEL.cyan)}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/")}
                title={isAf ? "Tuis" : "Home"}
                className={`${BTN_SECONDARY} w-9 h-9 !px-0`}
                style={secondaryFill(PASTEL.emerald)}
              >
                <Home className="h-4 w-4" />
              </button>
              <button
                onClick={() => logout()}
                className={`${BTN_SECONDARY} w-9 h-9 !px-0`}
                style={secondaryFill(PASTEL.pink)}
                data-testid="button-logout"
                title={isAf ? "Uitteken" : "Sign Out"}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* ── Greeting — who this is, and who it's about ─────────────────── */}
        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black"
              style={{ border: `1.5px solid ${PASTEL.purple}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: PASTEL.purple }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: PASTEL.purple }}>
                {isAf ? "Ouerverslag" : "Parent Report"}
              </span>
            </div>
            <h1 className="graffiti-hand text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.15] mt-3">
              <span className="text-white">{isAf ? "Welkom, " : "Welcome, "}</span>
              <span className="callout-hl">{user?.firstName || (isAf ? "Ouer" : "Parent")}</span>
            </h1>
            {childProgress?.learnerName ? (
              <p className="graffiti-hand text-xl sm:text-2xl mt-4 -rotate-1" style={{ color: PASTEL.cyan, textShadow: INK }}>
                {isAf ? "Hoe dit gaan met " : "How "}
                {childProgress.learnerName}
                {isAf ? "" : " is doing"}
              </p>
            ) : (
              <p className="text-white font-medium text-base sm:text-lg max-w-2xl mt-3">
                {isAf ? "Volg jou kind se vordering en bly ingelig oor hul leerreis." : "Track your child's progress and stay informed about their learning journey."}
              </p>
            )}
          </div>
          {childProgress && <DownloadReportButton learnerName={childProgress.learnerName ?? ""} isAf={isAf} />}
        </section>

        {childProgressError ? (
          <section className="py-10 text-center" data-testid="parent-dashboard-error">
            <AlertTriangle className="w-10 h-10 mx-auto mb-4" style={{ color: PASTEL.pink }} />
            <h2 className="graffiti-hand text-2xl sm:text-3xl mb-3">
              <span className="callout-hl">{isAf ? "Kon nie laai nie" : "Couldn't load"}</span>
            </h2>
            <p className="text-sm text-white max-w-md mx-auto mb-6">
              {isAf
                ? "Ons kon nie aan die bediener koppel nie. Kyk jou internetverbinding en probeer weer."
                : "We couldn't reach the server. Check your connection and try again."}
            </p>
            <Button
              onClick={() => refetchChildProgress()}
              disabled={isRefetchingChildProgress}
              className={BTN_SECONDARY}
              style={secondaryFill(PASTEL.pink)}
              data-testid="button-retry-parent-dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetchingChildProgress ? "animate-spin" : ""}`} />
              {isRefetchingChildProgress ? (isAf ? "Probeer..." : "Retrying...") : (isAf ? "Probeer Weer" : "Try Again")}
            </Button>
          </section>
        ) : childProgress && !hasNoActivity ? (
          <div className="space-y-8 relative z-10">

            {/* Active-child switcher — only renders for parents linked to >1 learner.
                Selecting a child updates selectedLearnerId, which is part of every widget's
                queryKey, so React Query refetches the hero, stats, weekly report, readiness,
                activity feed, monthly summary and exam schedule together. */}
            {(childrenData?.children?.length ?? 0) > 1 && (
              <section className="relative" data-testid="parent-child-switcher">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <Heading icon={Users} hex={PASTEL.pink}>
                    {isAf ? "Kies Kind" : "Viewing Child"}
                  </Heading>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black"
                    style={{ color: PASTEL.purple, border: `1px solid ${PASTEL.purple}` }}>
                    {childrenData!.children.length} {isAf ? "kinders" : "children"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2" role="tablist" aria-label={isAf ? "Kies kind" : "Select child"}>
                  {childrenData!.children.map(c => {
                    const active = c.learnerUserId === selectedLearnerId;
                    return (
                      <button
                        key={c.learnerUserId}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSelectedLearnerId(c.learnerUserId)}
                        data-testid={`parent-switch-child-${c.learnerUserId}`}
                        className={BTN_SECONDARY}
                        style={active ? primaryFill(PASTEL.purple) : secondaryFill(PASTEL.purple)}
                      >
                        {c.learnerName}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Learner line — who these numbers are about */}
            <section className="relative">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-white">
                  {isAf ? "Laas aktief" : "Last active"}:{" "}
                  <span className="font-bold">{formatDate(childProgress.lastActiveDate)}</span>
                </p>
                {childProgress.varkPrimary && VARK_STYLES[childProgress.varkPrimary as keyof typeof VARK_STYLES] && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-xs font-semibold"
                    style={{ border: `1px solid ${PASTEL.amber}`, color: PASTEL.amber }}
                    data-testid="parent-vark-badge"
                  >
                    <span>{VARK_STYLES[childProgress.varkPrimary as keyof typeof VARK_STYLES].icon}</span>
                    <span>{isAf ? "Leerstyl" : "Style"}: {isAf ? VARK_STYLES[childProgress.varkPrimary as keyof typeof VARK_STYLES].labelAf : VARK_STYLES[childProgress.varkPrimary as keyof typeof VARK_STYLES].label}</span>
                  </div>
                )}
              </div>
            </section>

            {/* ── Headline stats — the five numbers a parent actually wants ───── */}
            {(() => {
              const wr = childProgress.weeklyReport;
              const mins = wr.totalMinutes ?? 0;
              const h = Math.floor(mins / 60);
              const m = mins % 60;
              const studyTime = h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
              const topicsMastered = wr.subjectBreakdown.filter(s => (s.masteryScore ?? 0) >= 75).length;
              // Prefer live readiness bands; fall back to the week's flagged areas.
              const weakCount = readiness.length > 0
                ? readiness.filter(r => r.masteryBand === "red" || r.trendDirection === "down").length
                : wr.areasForImprovement.length;
              const overallReadiness = calcReadiness({
                accuracy: childProgress.overallAccuracy,
                studyStreak: childProgress.currentStreak,
                questionsAnswered: childProgress.totalQuestionsAnswered,
              });
              const readyHex = readinessBand(overallReadiness) === "green"
                ? PASTEL.emerald
                : readinessBand(overallReadiness) === "amber" ? PASTEL.amber : PASTEL.pink;
              return (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" data-testid="parent-stat-tiles">
                  <StatTile
                    icon={Clock}
                    label={isAf ? "Studietyd dié week" : "Study time this week"}
                    value={studyTime}
                    hex={PASTEL.cyan}
                    testId="stat-tile-study-time"
                  />
                  <StatTile
                    icon={CheckCircle}
                    label={isAf ? "Onderwerpe bemeester" : "Topics mastered"}
                    value={topicsMastered}
                    hex={PASTEL.emerald}
                    testId="stat-tile-topics-mastered"
                  />
                  <StatTile
                    icon={AlertTriangle}
                    label={isAf ? "Swak onderwerpe" : "Weak topics"}
                    value={weakCount}
                    hex={PASTEL.pink}
                    testId="stat-tile-weak-topics"
                  />
                  <StatTile
                    icon={Flame}
                    label={isAf ? "Studie-reeks" : "Study streak"}
                    value={childProgress.currentStreak}
                    unit={isAf ? "dae" : "days"}
                    hex={PASTEL.orange}
                    testId="stat-tile-streak"
                  />
                  <StatTile
                    icon={Zap}
                    label={isAf ? "Algehele gereedheid" : "Overall readiness"}
                    value={overallReadiness}
                    unit="%"
                    hex={readyHex}
                    testId="stat-tile-readiness"
                  />
                </div>
              );
            })()}

            {/* Per-child readiness — one card per linked learner; numbers match each learner's own dashboard */}
            {(childrenData?.children ?? []).length > 0 && (
              <div className="space-y-3" data-testid="parent-children-readiness">
                <div className="flex items-center gap-3 flex-wrap">
                  <Heading icon={Zap} hex={PASTEL.amber}>
                    {isAf ? "Gereedheid per Kind" : "Readiness per Child"}
                  </Heading>
                  {(childrenData?.children?.length ?? 0) > 1 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black"
                      style={{ color: PASTEL.cyan, border: `1px solid ${PASTEL.cyan}` }}>
                      {childrenData!.children.length} {isAf ? "kinders" : "children"}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {childrenData!.children.map(c => (
                    <ChildReadinessCard
                      key={c.learnerUserId}
                      learnerId={c.learnerUserId}
                      fallbackName={c.learnerName}
                      subjects={subjectsList}
                      isAf={isAf}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Risk alerts */}
            {readiness.length > 0 && <RiskAlerts readiness={readiness} isAf={isAf} />}

            {/* Readiness scores per subject */}
            {readiness.length > 0 && <ReadinessPanel readiness={readiness} isAf={isAf} />}

            {/* Weekly report — wall-written */}
            <section className="relative">
              <div className="relative flex items-center justify-between flex-wrap gap-2 mb-5">
                <div>
                  <Heading icon={Calendar} hex={PASTEL.orange}>
                    {isAf ? "Weeklikse Vorderingsverslag" : "Weekly Progress Report"}
                  </Heading>
                  <p className="text-xs text-white mt-1.5">
                    {formatDate(childProgress.weeklyReport.weekStarting)} – {formatDate(childProgress.weeklyReport.weekEnding)}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-black"
                  style={{ color: PASTEL.orange, border: `1px solid ${PASTEL.orange}` }}
                >
                  {isAf ? "Hierdie Week" : "This Week"}
                </span>
              </div>

              {(() => {
                const wr = childProgress.weeklyReport;
                const hasWeeklyActivity =
                  (wr.studyDays ?? 0) > 0 ||
                  (wr.totalMinutes ?? 0) > 0 ||
                  (wr.questionsAnswered ?? 0) > 0 ||
                  (wr.accuracy ?? 0) > 0 ||
                  (wr.subjectBreakdown?.length ?? 0) > 0 ||
                  (wr.achievements?.length ?? 0) > 0 ||
                  (wr.areasForImprovement?.length ?? 0) > 0;

                if (!hasWeeklyActivity) {
                  return (
                    <div
                      data-testid="weekly-report-empty"
                      className="relative pl-4 py-2 mb-2"
                      style={{ borderLeft: "3px solid #7FEFFF" }}
                    >
                      <BookOpen className="w-6 h-6 mb-2" style={{ color: "#7FEFFF" }} />
                      <p className="text-sm font-bold text-white mb-1">
                        {isAf ? "Nog geen aktiwiteit hierdie week nie" : "No activity logged this week yet"}
                      </p>
                      <p className="text-xs text-white max-w-md mx-auto">
                        {isAf
                          ? "Sodra jou kind begin oefen, sal weeklikse statistieke hier verskyn."
                          : "Once your child starts practising, weekly stats will appear here."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="relative grid gap-3 grid-cols-2 sm:grid-cols-4 mb-6">
                    {[
                      { label: isAf ? "Dae Gestudeer" : "Days Studied",   n: wr.studyDays,         suffix: "",  hex: PASTEL.orange },
                      { label: isAf ? "Minute Bestee" : "Minutes Spent",  n: wr.totalMinutes,      suffix: "",  hex: PASTEL.amber },
                      { label: isAf ? "Vrae Voltooi" : "Questions Done",  n: wr.questionsAnswered, suffix: "",  hex: PASTEL.cyan },
                      { label: isAf ? "Akkuraatheid" : "Accuracy",        n: wr.accuracy,          suffix: "%", hex: PASTEL.purple },
                    ].map(({ label, n, suffix, hex }, i) => (
                      <WeeklyMiniStat key={i} label={label} target={n} suffix={suffix} hex={hex} />
                    ))}
                  </div>
                );
              })()}

              {/* Baseline-vs-current and the 7-day shape of the week */}
              <div className="relative grid gap-6 sm:grid-cols-2 mb-6">
                <AccuracyCompare
                  initial={childProgress.subjectMarks.length > 0
                    ? Math.round(childProgress.subjectMarks.reduce((a, s) => a + s.initialMark, 0) / childProgress.subjectMarks.length)
                    : 50}
                  current={childProgress.overallAccuracy}
                  isAf={isAf}
                />
                <Sparkline studyDays={childProgress.weeklyReport.studyDays} totalQ={childProgress.weeklyReport.questionsAnswered} />
              </div>

              <div className="relative grid gap-4 sm:grid-cols-2">
                {childProgress.weeklyReport.achievements.length > 0 && (
                  <Rail hex={PASTEL.emerald} className="py-1">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: PASTEL.emerald }}>
                      <CheckCircle className="w-4 h-4" />
                      {isAf ? "Prestasies Hierdie Week" : "Achievements This Week"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {childProgress.weeklyReport.achievements.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-black text-xs font-bold" style={{ color: PASTEL.emerald, border: `1px solid ${PASTEL.emerald}` }}>{a}</span>
                      ))}
                    </div>
                  </Rail>
                )}
                {childProgress.weeklyReport.areasForImprovement.length > 0 && (
                  <Rail hex={PASTEL.amber} className="py-1">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: PASTEL.amber }}>
                      <AlertTriangle className="w-4 h-4" />
                      {isAf ? "Areas om op te Fokus" : "Areas to Focus On"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {childProgress.weeklyReport.areasForImprovement.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-black text-xs font-bold" style={{ color: PASTEL.amber, border: `1px solid ${PASTEL.amber}` }}>{a}</span>
                      ))}
                    </div>
                  </Rail>
                )}
              </div>
            </section>

            {/* Subject grids — wall-written */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section>
                <Heading icon={TrendingUp} hex={PASTEL.blue} className="mb-2">
                  {isAf ? "Vakvordering" : "Subject Progress"}
                </Heading>
                <p className="text-xs text-white mb-4">{isAf ? "Akkuraatheid per vak hierdie week" : "Accuracy per subject this week"}</p>
                <div className="space-y-3">
                  {childProgress.weeklyReport.subjectBreakdown.map((subject, i) => {
                    const accHex = subject.accuracy >= 70 ? "#93FFB8" : subject.accuracy >= 50 ? "#FFF29E" : "#FF9FE5";
                    const mastery = subject.masteryScore ?? null;
                    const progress = subject.progressScore ?? null;
                    const masteryHex = mastery == null ? "#C6A4FF" : mastery >= 75 ? "#93FFB8" : mastery >= 60 ? "#FFF29E" : "#FF9FE5";
                    return (
                      <div key={i} className="py-1 space-y-2" data-testid={`parent-subject-row-${i}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-white">{subject.subjectName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white">{subject.questionsAttempted} {isAf ? "vrae" : "q's"}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black" style={{ color: accHex, border: `1px solid ${accHex}` }}>{subject.accuracy}%</span>
                          </div>
                        </div>
                        <AnimatedBar
                          value={subject.accuracy}
                          color={subject.accuracy >= 70 ? "bg-emerald-500" : subject.accuracy >= 50 ? "bg-amber-500" : "bg-red-500"}
                          delay={i * 80}
                        />
                        {(mastery != null || progress != null) && (
                          <div className="flex items-center gap-3 text-[10px] pt-0.5" data-testid={`parent-subject-mastery-${i}`}>
                            {mastery != null && (
                              <span className="inline-flex items-center gap-1">
                                <span className="text-white uppercase tracking-wider">{isAf ? "Bemeestering" : "Mastery"}</span>
                                <span className="font-bold" style={{ color: masteryHex }}>{mastery}%</span>
                              </span>
                            )}
                            {progress != null && (
                              <span className="inline-flex items-center gap-1">
                                <span className="text-white uppercase tracking-wider">{isAf ? "Voltooiing" : "Completion"}</span>
                                <span className="font-bold text-white">{progress}%</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <Heading icon={Target} hex={PASTEL.purple} className="mb-2">
                  {isAf ? "Vakpuntevergelyking" : "Subject Marks Comparison"}
                </Heading>
                <p className="text-xs text-white mb-4">{isAf ? "Aanvanklike vs Huidige Prestasie" : "Initial vs Current Performance"}</p>
                <div className="space-y-3">
                  {childProgress.subjectMarks.map((subject, i) => {
                    const diff = subject.currentMark - subject.initialMark;
                    const isUp = diff > 0;
                    const isDown = diff < 0;
                    const diffHex = isUp ? "#93FFB8" : isDown ? "#FF9FE5" : "#ffffff";
                    return (
                      <div key={i} className="py-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-white">{subject.subjectName}</span>
                          <div className="flex items-center gap-1">
                            {isUp && <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#93FFB8" }} />}
                            {isDown && <ArrowDownRight className="w-3.5 h-3.5" style={{ color: "#FF9FE5" }} />}
                            {!isUp && !isDown && <Minus className="w-3.5 h-3.5 text-white" />}
                            <span className="text-xs font-bold" style={{ color: diffHex }}>
                              {isUp ? "+" : ""}{diff}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between text-[10px] text-white">
                              <span>{isAf ? "Aanvanklik" : "Initial"}</span>
                              <span className="font-semibold">{subject.initialMark}%</span>
                            </div>
                            <AnimatedBar value={subject.initialMark} color="bg-white/25" delay={i * 60} />
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between text-[10px] text-white">
                              <span>{isAf ? "Huidig" : "Current"}</span>
                              <span className="font-semibold" style={{ color: diffHex }}>{subject.currentMark}%</span>
                            </div>
                            <AnimatedBar value={subject.currentMark} color={isUp ? "bg-emerald-500" : isDown ? "bg-pink-500" : "bg-cyan-500"} delay={i * 60 + 200} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {childProgress.examSessions && childProgress.examSessions.length > 0 && (
              <section>
                <Heading icon={Trophy} hex={PASTEL.amber} className="mb-2">
                  {isAf ? "Eksamentyd Eksamenresultate" : "Crunch Time Exam Results"}
                </Heading>
                <p className="text-xs text-white mb-4">
                  {isAf ? "Onlangse gesimuleerde eksamen resultate" : "Recent simulated exam results"}
                </p>
                <div className="space-y-2">
                  {childProgress.examSessions.map((session, i) => {
                    const pct = session.score != null && session.totalMarks
                      ? Math.round((session.score / session.totalMarks) * 100)
                      : null;
                    const pctHex = pct == null ? "#ffffff" : pct >= 60 ? "#93FFB8" : pct >= 40 ? "#FFF29E" : "#FF9FE5";
                    return (
                      <div key={i} className="flex items-center justify-between py-1 pl-3" style={{ borderLeft: `3px solid ${pctHex === "#ffffff" ? "#7FEFFF" : pctHex}` }}>
                        <div>
                          <p className="text-sm font-medium text-white">{session.subject}</p>
                          <p className="text-[10px] text-white">
                            {fmtDate(session.date, language, { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <div className="text-right">
                          {pct != null ? (
                            <>
                              <p className="text-sm font-bold" style={{ color: pctHex }}>{pct}%</p>
                              <p className="text-[10px] text-white">{session.score}/{session.totalMarks}</p>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black" style={{ color: "#7FEFFF", border: "1px solid #7FEFFF" }}>{isAf ? "Voltooi" : "Completed"}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ===== NSC EXAM TIMETABLE VIEW (T114) ===== */}
            {learnerExamData && learnerExamData.schedule.length > 0 && (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const upcomingAll = learnerExamData.schedule
                .filter(e => new Date(e.examDate + "T00:00:00") >= today)
                .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
              // Task #346 — show only the next 3 papers as the focused upcoming list
              const upcoming = upcomingAll.slice(0, 3);
              const riskSubjects = upcomingAll.slice(0, 10).filter(e => e.isAtRisk);
              const nonExamDates = (learnerExamData.nonExamDays ?? []).map(e => e.examDate);

              return (
                <section>
                  <div data-testid="parent-exam-timetable">
                    <Heading icon={Calendar} hex={PASTEL.blue} className="mb-2">
                      {isAf ? "NSC 2026 Eksamenrooster" : "NSC 2026 Exam Timetable"}
                    </Heading>
                    <p className="text-xs text-white mb-4">
                      {isAf
                        ? "Aankomende NSC eksamens — hou jou kind se voorbereiding dop"
                        : "Upcoming NSC exams — track your child's preparation readiness"}
                    </p>

                    {/* Overall readiness signal */}
                    {(() => {
                      const hasReadinessData = (childProgress?.totalQuestionsAnswered ?? 0) > 0;
                      const acc = childProgress?.overallAccuracy ?? 0;
                      const streak = childProgress?.currentStreak ?? 0;
                      const accentHex = !hasReadinessData ? "#C6A4FF" : acc >= 70 ? "#93FFB8" : acc >= 50 ? "#FFF29E" : "#FF9FE5";
                      const labelText = !hasReadinessData
                        ? (isAf ? "Geen oefendata nog nie" : "No practice data yet")
                        : acc >= 70
                          ? (isAf ? "Op Koers ✓" : "On Track ✓")
                          : acc >= 50
                            ? (isAf ? "Bou Momentum" : "Building Momentum")
                            : (isAf ? "Aandag Nodig" : "Needs Attention");
                      return (
                        <div data-testid="parent-overall-readiness" className="flex items-center gap-3 pl-3 py-1 mb-3" style={{ borderLeft: `3px solid ${accentHex}` }}>
                          <GraduationCap className="w-5 h-5 shrink-0" style={{ color: "#7FEFFF" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white">
                              {isAf ? "Gereedheidsein" : "Overall Readiness"}:{" "}
                              <span style={{ color: accentHex }}>{labelText}</span>
                            </p>
                            <p className="text-[10px] text-white mt-0.5">
                              {!hasReadinessData
                                ? (isAf
                                    ? "Begin oefen om gereedheid te wys"
                                    : "Start practising to reveal readiness")
                                : isAf
                                  ? `${acc}% akkuraatheid · ${streak} dag-reeks`
                                  : `${acc}% accuracy · ${streak}-day streak`}
                            </p>
                          </div>
                          {hasReadinessData && acc < 50 && (
                            <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#FFF29E" }} />
                          )}
                        </div>
                      );
                    })()}

                    {/* Today's directive — what the learner should focus on right now */}
                    {learnerDirective && learnerDirective.hasExam && (() => {
                      const urgencyMap: Record<string, { color: string; glow: string }> = {
                        final_sprint:     { color: "#FF9FE5", glow: "rgba(255,159,229,0.45)" },
                        exam_prep_mode:   { color: "#FFC48F", glow: "rgba(255,196,143,0.45)" },
                        focused_revision: { color: "#FFF29E", glow: "rgba(255,242,158,0.45)" },
                        build_mastery:    { color: "#C6A4FF", glow: "rgba(198,164,255,0.45)" },
                      };
                      const u = urgencyMap[learnerDirective.urgencyState] || urgencyMap.build_mastery;
                      const days = learnerDirective.daysUntil ?? 0;
                      const subjectLabel = isAf ? learnerDirective.subjectNameAf : learnerDirective.subjectName;
                      return (
                        <div
                          data-testid="parent-today-directive"
                          className="flex items-center gap-3 pl-3 py-1 mb-3"
                          style={{ borderLeft: `3px solid ${u.color}` }}
                        >
                          <Rocket className="w-5 h-5 shrink-0" style={{ color: u.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: u.color }}>
                              {learnerDirective.isExamToday
                                ? (isAf ? "Eksamen Vandag" : "Exam Today")
                                : (isAf ? "Vandag se Fokus" : "Today's Focus")}
                            </p>
                            <p className="text-xs font-bold text-white truncate">
                              {subjectLabel}{learnerDirective.paperNumber ? ` · ${isAf ? "V" : "P"}${learnerDirective.paperNumber}` : ""}
                              <span className="ml-2 tabular-nums font-black" style={{ color: u.color }}>
                                {days}{isAf ? "d" : "d"}
                              </span>
                            </p>
                            <p className="text-[10px] text-white mt-0.5 truncate">
                              {isAf ? learnerDirective.messageAf : learnerDirective.message}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Risk alerts: low readiness (< 50%) with exam within 7 days */}
                    {riskSubjects.length > 0 && (
                      <div className="flex items-start gap-2 pl-3 py-1 mb-3" style={{ borderLeft: "3px solid #FF9FE5" }}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#FF9FE5" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold mb-1" style={{ color: "#FF9FE5" }}>
                            {isAf ? "Risiko-waarskuwing — Eksamen binne 7 dae, lae gereedheid" : "Risk Alert — Exam within 7 days, low readiness"}
                          </p>
                          <p className="text-[10px] text-white">
                            {riskSubjects.map(e =>
                              `${e.subjectName}${e.subjectAccuracy !== null ? ` (${e.subjectAccuracy}%)` : ""}`
                            ).join(" · ")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Upcoming exams with per-subject readiness */}
                    <div className="space-y-2 mb-4">
                      {upcoming.length === 0 ? (
                        <p className="text-xs text-white text-center py-4">
                          {isAf ? "Geen aankomende eksamens" : "No upcoming exams found"}
                        </p>
                      ) : upcoming.map((entry, i) => {
                        const d = new Date(entry.examDate + "T00:00:00");
                        const daysLeft = entry.daysRemaining;
                        const urgency = daysLeft <= 14 ? "red" : daysLeft <= 30 ? "amber" : daysLeft <= 60 ? "blue" : "emerald";
                        const uHex = entry.isAtRisk ? "#FF9FE5" : urgency === "red" ? "#FF9FE5" : urgency === "amber" ? "#FFF29E" : urgency === "blue" ? "#6FA8FF" : "#93FFB8";
                        const accHex = entry.subjectAccuracy == null ? "#ffffff" : entry.subjectAccuracy >= 70 ? "#93FFB8" : entry.subjectAccuracy >= 50 ? "#FFF29E" : "#FF9FE5";
                        return (
                          <div key={i} className="flex items-center gap-3 pl-3 py-1" style={{ borderLeft: `3px solid ${uHex}` }}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-white truncate">{entry.subjectName}</p>
                                {entry.subjectAccuracy !== null && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black" style={{ color: accHex, border: `1px solid ${accHex}` }}>{entry.subjectAccuracy}%</span>
                                )}
                                {entry.isAtRisk && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black" style={{ color: "#FF9FE5", border: "1px solid #FF9FE5" }}>
                                    {isAf ? "RISIKO" : "RISK"}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-white">
                                Paper {entry.paperNumber} · {fmtDate(d, language, { weekday: "short", day: "numeric", month: "short" })} · {entry.startTime ?? ""}
                              </p>
                            </div>
                            <div className="shrink-0">
                              <CountdownClock dateStr={entry.examDate} startTime={entry.startTime} hex={uHex} isAf={isAf} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Non-examination days */}
                    {nonExamDates.length > 0 && (
                      <div className="pl-3 pt-3" style={{ borderLeft: "3px solid #FFF29E" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#FFF29E" }}>
                          {isAf ? "Nie-eksamen Dae (inhaal)" : "Non-Examination Days (catch-up)"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {nonExamDates.map(d => (
                            <span key={d} className="inline-flex px-2.5 py-1 rounded-lg bg-black text-[10px] font-bold" style={{ color: "#FFF29E", border: "1px solid #FFF29E" }}>
                              {fmtDate(d + "T00:00:00", language, { weekday: "short", day: "numeric", month: "short" })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })()}

            {/* Live activity feed + monthly summary */}
            <div className="grid gap-6 lg:grid-cols-2">
              {activityFeed.length > 0 && <ActivityFeed events={activityFeed} isAf={isAf} />}
              {monthlySummaryData && <MonthlySummaryPanel summary={monthlySummaryData} isAf={isAf} />}
            </div>

            <PerformanceStatus childProgress={childProgress} isAf={isAf} />

            {(childProgress.currentStreak >= 7 || childProgress.overallAccuracy >= 80) && (
              <CelebrationBanner childProgress={childProgress} isAf={isAf} />
            )}

            {/* Journey link — wall callout */}
            <Rail hex={PASTEL.emerald} className="py-1 flex items-center justify-between gap-4">
              <div className="relative flex items-center gap-3">
                <MapPin className="w-6 h-6 shrink-0" style={{ color: PASTEL.emerald }} />
                <div>
                  <h3 className="graffiti-hand text-base text-white">
                    {isAf ? "Leerreis Tydlyn" : "Learning Journey Timeline"}
                  </h3>
                  <p className="text-xs text-white mt-0.5">
                    {isAf ? "Sien jou kind se mylpale en vordering" : "View your child's milestones and progress"}
                  </p>
                </div>
              </div>
              <Link href="/journey?parent=1">
                <Button
                  size="sm"
                  className={`${BTN_SECONDARY} shrink-0`}
                  style={secondaryFill(PASTEL.emerald)}
                >
                  {isAf ? "Sien Reis" : "View Journey"}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </Rail>

            <ParentTipCard isAf={isAf} />

          </div>
        ) : hasNoActivity && childProgress ? (
          <div className="space-y-6 relative z-10">
            <NoActivityEmptyState learnerName={childProgress.learnerName} isAf={isAf} />
          </div>
        ) : (
          <section className="py-16 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: PASTEL.purple }} />
            <h2 className="graffiti-hand text-2xl sm:text-3xl mb-3">
              <span className="callout-hl">{isAf ? "Nog geen kind gekoppel nie" : "No child linked yet"}</span>
            </h2>
            <p className="text-sm text-white max-w-md mx-auto">
              {isAf ? "Vra jou kind om sy aktiveringskode in Instellings te deel — sodra dit gekoppel is, sien jy hul vordering hier." : "Ask your child to share their activation code from Settings — once linked, you'll see their progress here."}
            </p>
            <div className="mt-6">
              <a
                href="/subscribe"
                className={BTN_PRIMARY}
                style={primaryFill(PASTEL.purple)}
                data-testid="link-parent-get-started"
              >
                {isAf ? "Begin nou — Brain Boost" : "Get Started — Brain Boost"}
              </a>
            </div>
          </section>
        )}

        {/* ── Account & delivery — always available, regardless of activity ── */}
        <section className="space-y-8 pt-2">
          <Heading icon={Settings2} hex={PASTEL.purple}>
            {isAf ? "Rekening & Kennisgewings" : "Account & Notifications"}
          </Heading>

          <SubscriptionPanel isAf={isAf} />

          <WhatsAppLinkStatusPanel isAf={isAf} />

          {selectedLearnerId && (
            <ReportEmailOptOutToggle learnerUserId={selectedLearnerId} isAf={isAf} />
          )}

          <LinkHistorySection learnerId={selectedLearnerId} isAf={isAf} />
        </section>

      </main>
    </div>
  );
}

function NoActivityEmptyState({ learnerName, isAf }: { learnerName: string; isAf: boolean }) {
  const tips = isAf
    ? [
        { icon: Rocket, title: "Eerste sessie", body: `Vra ${learnerName} om hul eerste 10-minute oefensessie te begin.` },
        { icon: Target, title: "Stel 'n doel", body: "20 minute per dag is genoeg om 'n studie-reeks te bou." },
        { icon: Sparkles, title: "Vier vroeë oorwinnings", body: "Sodra hulle begin, sien jy hier hul vordering, akkuraatheid en gereedheid." },
      ]
    : [
        { icon: Rocket, title: "Start the first session", body: `Ask ${learnerName} to complete their first 10-minute practice session.` },
        { icon: Target, title: "Set a daily goal", body: "20 minutes a day is enough to build a study streak." },
        { icon: Sparkles, title: "Celebrate early wins", body: "Once they start, you'll see progress, accuracy and readiness here." },
      ];

  return (
    <div className="space-y-6 relative z-10" data-testid="parent-no-activity-empty-state">
      <div className="relative py-8 sm:py-10 text-center">
        <Rocket className="w-12 h-12 mx-auto mb-5" style={{ color: "#7FEFFF" }} />

        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black mb-3"
          style={{ border: "1.5px solid #7FEFFF" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#7FEFFF" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#7FEFFF" }}>
            {isAf ? "Gereed om te begin" : "Ready to begin"}
          </span>
        </div>

        <h2 className="graffiti-hand text-2xl sm:text-3xl text-white mb-2">
          {isAf ? `Nog geen aktiwiteit van ${learnerName} nie` : `No activity from ${learnerName} yet`}
        </h2>
        <p className="text-sm sm:text-base text-white max-w-xl mx-auto leading-relaxed">
          {isAf
            ? "Sodra jou kind hul eerste oefensessie of toets begin, sien jy hier hul studie-reeks, akkuraatheid, gereedheid per vak en weeklikse verslag."
            : "Once your child starts their first practice session or quiz, you'll see their study streak, accuracy, per-subject readiness and weekly report here."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {tips.map((t, i) => (
          <div
            key={i}
            className="relative pl-4 py-1"
            style={{ borderLeft: "3px solid #C6A4FF" }}
          >
            <div className="relative flex items-start gap-3">
              <t.icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#C6A4FF" }} />
              <div>
                <h3 className="font-bold text-sm text-white mb-1">{t.title}</h3>
                <p className="text-xs text-white leading-relaxed">{t.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ParentTipCard isAf={isAf} />
    </div>
  );
}

function PerformanceStatus({ childProgress, isAf }: { childProgress: ChildProgress; isAf: boolean }) {
  const streak = childProgress.currentStreak;
  const accuracy = childProgress.overallAccuracy;
  const questions = childProgress.totalQuestionsAnswered;

  let statusLabel: string, statusDesc: string, accent: string, StatusIcon: any;

  if (streak >= 3 && accuracy >= 60 && questions >= 10) {
    statusLabel = isAf ? "Op Koers" : "On Track";
    statusDesc = isAf ? "Jou kind vorder goed! Hou so aan." : "Your child is progressing well! Keep it up.";
    accent = "emerald"; StatusIcon = CheckCircle;
  } else if (streak >= 1 && (accuracy >= 40 || questions >= 5)) {
    statusLabel = isAf ? "Het Aandag Nodig" : "Needs Attention";
    statusDesc = isAf ? "Jou kind studeer, maar kan meer doen. Moedig hulle aan om daagliks te oefen." : "Your child is studying, but could do more. Encourage them to practise daily.";
    accent = "amber"; StatusIcon = AlertTriangle;
  } else {
    statusLabel = isAf ? "Val Agter" : "Falling Behind";
    statusDesc = isAf ? "Jou kind het hierdie week min aktiwiteit. Sit saam en beplan 20 minute per dag." : "Your child has had low activity this week. Sit down together and plan 20 minutes per day.";
    accent = "red"; StatusIcon = AlertTriangle;
  }

  const hexMap: Record<string, string> = { emerald: "#93FFB8", amber: "#FFF29E", red: "#FF9FE5" };
  const hex = hexMap[accent];

  return (
    <section
      className="relative pl-4 sm:pl-5 py-1"
      style={{ borderLeft: `3px solid ${hex}` }}
      data-testid="performance-status"
    >
      <div className="relative flex items-start gap-4">
        <StatusIcon className="w-6 h-6 shrink-0 mt-0.5" style={{ color: hex }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="graffiti-hand text-base" style={{ color: hex }}>{statusLabel}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black" style={{ color: hex, border: `1px solid ${hex}` }}>{isAf ? "Hierdie Week" : "This Week"}</span>
          </div>
          <p className="text-sm leading-relaxed text-white">{statusDesc}</p>
        </div>
      </div>
    </section>
  );
}

function CelebrationBanner({ childProgress, isAf }: { childProgress: ChildProgress; isAf: boolean }) {
  const messages: string[] = [];
  if (childProgress.currentStreak >= 30) messages.push(isAf ? `Ongelooflik! ${childProgress.currentStreak}-dae studie-reeks!` : `Incredible! ${childProgress.currentStreak}-day study streak!`);
  else if (childProgress.currentStreak >= 14) messages.push(isAf ? `Fantasties! ${childProgress.currentStreak}-dae studie-reeks!` : `Fantastic! ${childProgress.currentStreak}-day study streak!`);
  else if (childProgress.currentStreak >= 7) messages.push(isAf ? `Puik werk! ${childProgress.currentStreak}-dae studie-reeks!` : `Great job! ${childProgress.currentStreak}-day study streak!`);
  if (childProgress.overallAccuracy >= 90) messages.push(isAf ? `${childProgress.overallAccuracy}% akkuraatheid — uitstekend!` : `${childProgress.overallAccuracy}% accuracy — outstanding!`);
  else if (childProgress.overallAccuracy >= 80) messages.push(isAf ? `${childProgress.overallAccuracy}% akkuraatheid — sterk vordering!` : `${childProgress.overallAccuracy}% accuracy — strong progress!`);
  if (messages.length === 0) return null;

  return (
    <section
      className="relative pl-4 sm:pl-5 py-1"
      style={{ borderLeft: "3px solid #FFF29E" }}
      data-testid="celebration-banner"
    >
      <div className="relative flex items-center gap-4">
        <Trophy className="w-8 h-8 shrink-0" style={{ color: "#FFF29E" }} />
        <div>
          <Heading icon={PartyPopper} hex={PASTEL.pink} size="sm" className="mb-1.5">
            {isAf ? "Viering!" : "Celebration!"}
          </Heading>
          {messages.map((msg, i) => <p key={i} className="text-sm text-white">{msg}</p>)}
        </div>
      </div>
    </section>
  );
}

interface LinkHistoryRow {
  jti: string;
  userId: string;
  sentTo: string | null;
  channel: string | null;
  deliveryStatus: string | null;
  deliveryError: string | null;
  deliveryUpdatedAt: string | null;
  retryCount: number | null;
  createdAt: string;
  expiresAt: string | null;
  usedAt: string | null;
}

function deliveryStatusHex(status: string | null, usedAt: string | null): string {
  if (usedAt) return "#93FFB8";
  switch (status) {
    case "delivered": return "#93FFB8";
    case "sent": return "#7FEFFF";
    case "failed":
    case "undelivered": return "#FF9FE5";
    default: return "#FFF29E";
  }
}

function fmtDt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function LinkHistorySection({ learnerId, isAf }: { learnerId: string | null; isAf: boolean }) {
  const [open, setOpen] = useState(false);

  const { data: rows, isLoading, isError } = useQuery<LinkHistoryRow[]>({
    queryKey: ["/api/parent/onboarding-link-history", learnerId],
    queryFn: async () => {
      const url = learnerId
        ? `/api/parent/onboarding-link-history?learnerId=${encodeURIComponent(learnerId)}`
        : "/api/parent/onboarding-link-history";
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    },
    staleTime: 60_000,
  });

  const count = rows?.length ?? 0;

  return (
    <section
      className="relative pl-4 sm:pl-5 py-1"
      style={{ borderLeft: "3px solid #7FEFFF" }}
      data-testid="parent-link-history"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <div className="flex items-center gap-3">
          <Link2 className="w-5 h-5 shrink-0" style={{ color: PASTEL.cyan }} />
          <div>
            <h3 className="graffiti-hand text-base text-white">
              {isAf ? "Inskakelingskakelskedule" : "Onboarding Link History"}
            </h3>
            <p className="text-xs text-white mt-0.5">
              {isLoading
                ? (isAf ? "Laai tans..." : "Loading…")
                : count === 0
                  ? (isAf ? "Geen skakels gestuur nie" : "No links sent yet")
                  : (isAf ? `${count} skakel${count !== 1 ? "s" : ""} gestuur` : `${count} link${count !== 1 ? "s" : ""} sent`)}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "#ffffff" }}
        />
      </button>

      {open && (
        <div className="pb-4 pt-2">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-white text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {isAf ? "Laai tans..." : "Loading…"}
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex items-center justify-center gap-2 py-8 text-[#FF9FE5] text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {isAf ? "Kon nie geskiedenisinligting laai nie." : "Could not load link history."}
            </div>
          )}

          {!isLoading && !isError && count === 0 && (
            <p className="text-sm text-white italic text-center py-8">
              {isAf ? "Geen inskakelingskakels gevind nie." : "No onboarding links found."}
            </p>
          )}

          {!isLoading && !isError && rows && rows.length > 0 && (
            <div className="space-y-3">
              {rows.map((r, i) => {
                const hex = deliveryStatusHex(r.deliveryStatus, r.usedAt);
                const displayStatus = r.usedAt ? "opened" : (r.deliveryStatus ?? "pending");
                return (
                  <div
                    key={r.jti}
                    className="pl-3 py-1"
                    style={{ borderLeft: `3px solid ${hex}` }}
                    data-testid={`parent-link-row-${i}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="shrink-0 text-sm font-black tabular-nums"
                        style={{ color: hex }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider bg-black"
                            style={{ border: `1px solid ${hex}`, color: hex }}
                          >
                            {displayStatus}
                          </span>
                          {r.channel && (
                            <span className="text-[10px] text-white uppercase tracking-wider">
                              via {r.channel}
                            </span>
                          )}
                          {(r.retryCount ?? 0) > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black" style={{ border: "1px solid #FFC48F", color: "#FFC48F" }}>
                              {r.retryCount} {isAf ? "herprobeer" : "retry"}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                          {r.sentTo && (
                            <div>
                              <span className="text-white">{isAf ? "Gestuur aan " : "Sent to "}</span>
                              <span className="text-white font-mono font-bold">{r.sentTo}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-white">{isAf ? "Uitgereik " : "Issued "}</span>
                            <span className="text-white font-bold">{fmtDt(r.createdAt)}</span>
                          </div>
                          {r.deliveryUpdatedAt && (
                            <div>
                              <span className="text-white">{isAf ? "Status " : "Status "}</span>
                              <span className="text-white font-bold">{fmtDt(r.deliveryUpdatedAt)}</span>
                            </div>
                          )}
                          {r.usedAt && (
                            <div>
                              <span className="text-white">{isAf ? "Oopgemaak " : "Opened "}</span>
                              <span className="text-white font-bold">{fmtDt(r.usedAt)}</span>
                            </div>
                          )}
                        </div>
                        {r.deliveryError && (
                          <div className="text-[10px] font-mono text-[#FF9FE5] break-all pl-2 py-1" style={{ borderLeft: "3px solid #FF9FE5" }}>
                            {r.deliveryError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const PARENT_TIPS = {
  en: [
    "Ask your child to explain what they learned today — teaching others is the best way to retain knowledge.",
    "Set a consistent 20-minute daily study time. Short, regular sessions beat long cramming sessions.",
    "Celebrate small wins! Every completed challenge and improved accuracy builds exam confidence.",
    "Check the 'Areas to Focus On' section together and plan the week ahead around those subjects.",
    "Encourage your child to use the streak system — consistency is the #1 predictor of exam success.",
  ],
  af: [
    "Vra jou kind om te verduidelik wat hulle vandag geleer het — ander leer is die beste manier om kennis te behou.",
    "Stel 'n konsekwente 20-minuut daaglikse studietyd. Kort, gereelde sessies klop lang inkrammingsessies.",
    "Vier klein oorwinnings! Elke voltooide uitdaging en verbeterde akkuraatheid bou eksamenvertroue.",
    "Kyk saam na die 'Areas om op te Fokus'-afdeling en beplan die week rondom daardie vakke.",
    "Moedig jou kind aan om die streep-stelsel te gebruik — konsekwentheid is die #1 voorspeller van eksamensukses.",
  ],
};

function ParentTipCard({ isAf }: { isAf: boolean }) {
  const tips = isAf ? PARENT_TIPS.af : PARENT_TIPS.en;
  const [tipIndex] = useState(() => Math.floor(Math.random() * tips.length));
  return (
    <section
      className="relative pl-4 sm:pl-5 py-1"
      style={{ borderLeft: "3px solid #FFF29E" }}
      data-testid="parent-tip-card"
    >
      <div className="relative flex items-start gap-4">
        <Lightbulb className="w-6 h-6 shrink-0 mt-0.5" style={{ color: "#FFF29E" }} />
        <div>
          <h3 className="graffiti-hand text-base mb-1" style={{ color: "#FFF29E" }}>{isAf ? "Ouertip van die Week" : "Parent Tip of the Week"}</h3>
          <p className="text-sm text-white leading-relaxed">{tips[tipIndex]}</p>
        </div>
      </div>
    </section>
  );
}


const PARENT_FAQ = {
  en: [
    { q: "How do I see my child's progress?", a: "Your dashboard shows weekly reports including study days, minutes studied, subjects practised, and mastery levels." },
    { q: "What does the mastery percentage mean?", a: "Mastery shows how well your child understands each topic. Green (75%+) means strong, amber (50-74%) developing, red means more practice needed." },
    { q: "Can I see which subjects my child is struggling with?", a: "Yes — the subject breakdown highlights weak areas in red. Use this for focused conversations with your child or their teachers." },
    { q: "How does the 14-day free trial work?", a: "Full access for 14 days. No charge until day 15. Cancel anytime before then at no cost." },
    { q: "Is the content aligned with the NSC curriculum?", a: "Yes — all questions, topics, and study plans come from the CAPS curriculum and 10 years of real NSC exam papers." },
    { q: "How do I contact support?", a: "Email learn@kth-tech.com or use the help button in the app. We respond within 24 hours." },
  ],
  af: [
    { q: "Hoe sien ek my kind se vordering?", a: "Jou dashboard wys weeklikse verslae met studiedae, minute gestudeer, vakke geoefen en bemeesteringsvlakke." },
    { q: "Wat beteken die bemeesteringspersentasie?", a: "Bemeestering wys hoe goed jou kind elke onderwerp verstaan. Groen (75%+) beteken sterk, amber (50-74%) ontwikkelend, rooi beteken meer oefening nodig." },
    { q: "Kan ek sien met watter vakke my kind sukkel?", a: "Ja — die vakuiteensetting lig swak areas in rooi uit vir gefokusde gesprekke." },
    { q: "Hoe werk die 14-dae gratis proeftydperk?", a: "Volle toegang vir 14 dae. Geen heffing voor dag 15 nie. Kanselleer enige tyd teen geen koste." },
    { q: "Is die inhoud in lyn met die NSC-kurrikulum?", a: "Ja — alle vrae en studieplanne kom uit die KABV-kurrikulum en 10 jaar se werklike NSC-eksamenvraestelle." },
    { q: "Hoe kontak ek ondersteuning?", a: "Stuur 'n e-pos aan learn@kth-tech.com of gebruik die hulpknoppie in die app." },
  ],
};

function ParentFAQ({ isAf }: { isAf: boolean }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const items = isAf ? PARENT_FAQ.af : PARENT_FAQ.en;
  return (
    <Rail hex={PASTEL.purple} className="mt-4">
      <Heading icon={HelpCircle} hex={PASTEL.purple} size="sm" className="mb-4">
        {isAf ? "Gereelde Vrae vir Ouers" : "Parent FAQ"}
      </Heading>
      <div>
        {items.map((item, idx) => (
          <div key={idx} style={{ borderTop: idx === 0 ? "none" : "1px solid #ffffff" }}>
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="flex items-center justify-between w-full py-3.5 text-left text-sm font-bold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-md"
              data-testid={`faq-parent-q-${idx}`}
            >
              {item.q}
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ml-3 ${openIdx === idx ? "rotate-180" : ""}`}
                style={{ color: openIdx === idx ? PASTEL.purple : "#ffffff" }}
              />
            </button>
            {openIdx === idx && (
              <p className="pb-4 text-sm text-white leading-relaxed" data-testid={`faq-parent-a-${idx}`}>{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </Rail>
  );
}
