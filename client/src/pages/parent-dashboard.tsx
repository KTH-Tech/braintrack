import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { DailyDirective } from "@/types/daily-directive";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Link2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { VARK_STYLES } from "@/lib/vark";
import { BrandThemeToggle } from "@/components/theme-toggle";
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

function CosmicCard({ children, hex, className = "" }: { children: React.ReactNode; hex: string; className?: string }) {
  return (
    <div
      className={`relative rounded-2xl bg-black p-6 ${className}`}
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: hex, boxShadow: `0 0 8px ${hex}` }} />
      <div className="relative">{children}</div>
    </div>
  );
}

const COSMIC: Record<"cyan" | "emerald" | "amber" | "red" | "purple" | "pink", { hex: string; halo: string }> = {
  cyan:    { hex: "#28c9d6", halo: "rgba(40,201,214,0.35)" },
  emerald: { hex: "#4ADE80", halo: "rgba(74,222,128,0.35)" },
  amber:   { hex: "#ffd83a", halo: "rgba(255,216,58,0.35)" },
  red:     { hex: "#e6519c", halo: "rgba(230,81,156,0.40)" },
  purple:  { hex: "#b066d6", halo: "rgba(176,102,214,0.35)" },
  pink:    { hex: "#e6519c", halo: "rgba(230,81,156,0.35)" },
};

function GlowCard({ children, color = "cyan", className = "" }: { children: React.ReactNode; color?: "cyan" | "emerald" | "amber" | "red"; className?: string }) {
  const { hex, halo } = COSMIC[color];
  return (
    <div
      className={`relative rounded-2xl bg-black overflow-hidden ${className}`}
      style={{ border: `1.5px solid ${hex}`, boxShadow: `0 0 18px ${halo}, inset 0 0 14px rgba(0,0,0,0.55)` }}
    >
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: hex }} />
      {children}
    </div>
  );
}

function NeonBadge({ children, color = "cyan" }: { children: React.ReactNode; color?: "cyan" | "emerald" | "amber" | "red" }) {
  const { hex, halo } = COSMIC[color];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-black uppercase tracking-[0.18em]"
      style={{ color: hex, border: `1px solid ${hex}`, boxShadow: `0 0 10px ${halo}` }}
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
  const color = last > first ? "#4ADE80" : last < first ? "#e6519c" : "#28c9d6";
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

function LiveStatCard({
  icon: Icon,
  label,
  target,
  unit,
  hex,
  pulse = false,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  target: number;
  unit: string;
  hex: string;
  pulse?: boolean;
}) {
  const display = useCountUp(Math.max(0, Math.round(target)), 1100);
  return (
    <div
      className="relative rounded-2xl p-5 bg-black overflow-hidden"
      style={{
        border: `1px solid ${hex}55`,
        boxShadow: `0 0 12px ${hex}22, inset 0 0 10px rgba(0,0,0,0.55)`,
      }}
    >
      <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: hex, boxShadow: `0 0 8px ${hex}` }} />
      <div aria-hidden
        className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-30 blur-2xl pointer-events-none"
        style={{ background: hex }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 ${pulse ? "bt-pulse-ring" : ""}`}
          style={{ border: `1px solid ${hex}`, boxShadow: `0 0 10px ${hex}66`, ["--bt-ring" as any]: `${hex}80` }}
        >
          <Icon className="w-5 h-5" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex})` }} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] truncate text-white">{label}</p>
          <p className="text-2xl font-black leading-tight tabular-nums" style={{ color: "#fff", textShadow: `0 0 8px ${hex}55` }}>
            {display}
            <span className="text-sm font-medium text-white ml-1">{unit}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function WeeklyMiniStat({ label, target, suffix, hex }: { label: string; target: number; suffix: string; hex: string }) {
  const display = useCountUp(Math.max(0, Math.round(target)), 950);
  return (
    <div
      className="text-center p-3 rounded-xl bg-black"
      style={{ border: `1px solid ${hex}55`, boxShadow: `0 0 10px ${hex}18` }}
    >
      <p className="text-2xl font-black tabular-nums" style={{ color: "#fff", textShadow: `0 0 6px ${hex}66` }}>
        {display}{suffix}
      </p>
      <p className="text-[10px] mt-1 font-semibold uppercase tracking-wider" style={{ color: `${hex}bb` }}>{label}</p>
    </div>
  );
}

function AlarmDigit({ value, hex }: { value: string; hex: string }) {
  // Ghost "88" behind each digit like a 7-seg LCD alarm clock.
  // Remounts per tick via `key={value}` to retrigger the crisp glow pulse.
  return (
    <span className="relative inline-block min-w-[14px] text-center leading-none">
      <span
        aria-hidden
        className="absolute inset-0 text-[14px] font-black tabular-nums select-none"
        style={{ color: hex, opacity: 0.1, fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace" }}
      >
        8
      </span>
      <span
        key={value}
        className="bt-tick-digit relative text-[14px] font-black tabular-nums"
        style={{ color: hex, textShadow: `0 0 8px ${hex}, 0 0 2px ${hex}`, fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace" }}
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
    total < 24 * 3600 * 1000 ? "#e6519c" :
    total < 7 * 86400 * 1000 ? "#ff8a1f" :
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
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black text-[11px] font-black uppercase tracking-[0.18em] bt-pulse-ring"
        style={{ color: "#e6519c", border: "1.5px solid #e6519c", boxShadow: "0 0 14px #e6519c99", ["--bt-ring" as any]: "rgba(230,81,156,0.7)" }}
      >
        <Clock className="w-3 h-3" /> {isAf ? "Eksamen BEGIN!" : "EXAM IS ON!"}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0.5" aria-label={isAf ? "Aftel na eksamen" : "Countdown to exam"}>
      <span
        className="text-[7px] font-black tracking-[0.28em] uppercase bt-tagline-sweep"
        aria-hidden
      >
        {isAf ? "Jou tyd begin" : "Your time starts"}
      </span>
      <div
        className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md bt-pulse-ring"
        style={{
          background: "rgba(0,0,0,0.9)",
          border: `1px solid ${urgentHex}`,
          boxShadow: `0 0 10px ${urgentHex}55, inset 0 0 8px ${urgentHex}22`,
          ["--bt-ring" as any]: `${urgentHex}80`,
        }}
      >
        {parts.map((p, i) => (
          <div key={i} className="flex items-baseline">
            <div
              className="flex flex-col items-center justify-center rounded-[4px] min-w-[26px] px-1 py-[2px]"
              style={{ background: "rgba(255,255,255,0.02)" }}
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
                style={{ color: urgentHex, textShadow: `0 0 6px ${urgentHex}` }}
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
  const overallHex = overallBand === "green" ? "#4ADE80" : overallBand === "amber" ? "#ffd83a" : "#e6519c";

  const subjectName = (id: number) => {
    const s = subjects?.find(x => x.id === id);
    if (!s) return isAf ? `Vak ${id}` : `Subject ${id}`;
    return isAf ? (s.nameAfrikaans || s.name) : s.name;
  };

  const pills = Object.entries(subjectReadinessData?.readiness ?? {})
    .map(([id, score]) => ({ id: Number(id), score: Number(score) }))
    .sort((a, b) => b.score - a.score);

  return (
    <CosmicCard hex={overallHex} className="">
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
                style={{ color: "#4ADE80", border: "1px solid #4ADE8066", boxShadow: "0 0 8px #4ADE8033" }}
                data-testid={`parent-child-link-opened-${learnerId}`}
                title={isAf ? "Jou kind het die teken-in-skakel oopgemaak" : "Your child has opened the sign-in link"}
              >
                <CheckCircle2 className="w-3 h-3" style={{ color: "#4ADE80" }} />
                {isAf ? "Skakel oopgemaak" : "Opened link"}
                {linkOpenedAt ? <span className="font-normal text-white/60">· {linkOpenedAt}</span> : null}
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
                const hex = band === "green" ? "#4ADE80" : band === "amber" ? "#ffd83a" : "#e6519c";
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-[11px] font-semibold"
                    style={{ color: hex, border: `1px solid ${hex}66`, boxShadow: `0 0 8px ${hex}33` }}
                    data-testid={`parent-child-pill-${learnerId}-${id}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: hex, boxShadow: `0 0 6px ${hex}` }} />
                    {subjectName(id)}
                    <span className="tabular-nums font-black">{score}%</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CosmicCard>
  );
}

function ReadinessPanel({ readiness, isAf }: { readiness: ReadinessItem[]; isAf: boolean }) {
  if (!readiness.length) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px #28c9d6)" }} />
        <h3 className="font-bold text-white text-base">{isAf ? "Gereedheidstelsel per Vak" : "Readiness Score per Subject"}</h3>
      </div>
      <p className="text-xs text-white -mt-2">{isAf ? "Hoe gereed is jou kind vir die eksamen in elke vak?" : "How exam-ready is your child in each subject?"}</p>
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
      <svg width={size} height={size} className="-rotate-90" style={{ filter: `drop-shadow(0 0 6px ${hex}aa)` }} role="presentation" aria-hidden="true">
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
          style={{ color: "#fff", textShadow: `0 0 8px ${hex}` }}
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
  const barHex = item.masteryBand === "green" ? "#4ADE80" : item.masteryBand === "amber" ? "#ffd83a" : "#e6519c";
  return (
            <GlowCard color={glowColor} className="p-4">
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
                    {item.trendDirection === "up" && <ArrowUpRight className="w-3 h-3" style={{ color: "#4ADE80" }} />}
                    {item.trendDirection === "down" && <TrendingDown className="w-3 h-3" style={{ color: "#e6519c" }} />}
                    {item.trendDirection === "stable" && <Minus className="w-3 h-3 text-white" />}
                    <span className="text-[10px] text-white">
                      {item.trendDirection === "up" ? (isAf ? "Styg" : "Rising") : item.trendDirection === "down" ? (isAf ? "Daal" : "Dropping") : (isAf ? "Stabiel" : "Stable")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white tabular-nums">{isAf ? "Aanvanglyn" : "Baseline"}: {baselineDisplay}%</span>
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: item.delta >= 0 ? "#4ADE80" : "#e6519c" }}>
                  {deltaSign}{deltaDisplay}% {isAf ? "verbetering" : "change"}
                </span>
              </div>
            </GlowCard>
  );
}

function RiskAlerts({ readiness, isAf }: { readiness: ReadinessItem[]; isAf: boolean }) {
  const alerts = readiness.filter(
    (r) => r.masteryBand === "red" || r.trendDirection === "down"
  );
  if (!alerts.length) return null;
  return (
    <GlowCard color="red" className="p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0" style={{ border: "1px solid #e6519c", boxShadow: "0 0 12px rgba(230,81,156,0.45)" }}>
          <ShieldAlert className="w-5 h-5" style={{ color: "#e6519c", filter: "drop-shadow(0 0 4px #e6519c)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-sm" style={{ color: "#e6519c" }}>{isAf ? "Aandag Vereis" : "Attention Needed"}</h3>
            <NeonBadge color="red">{alerts.length} {isAf ? "vak" : alerts.length === 1 ? "subject" : "subjects"}</NeonBadge>
          </div>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.subjectName} className="rounded-lg bg-black p-3" style={{ border: "1px solid rgba(230,81,156,0.45)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{a.subjectName}</span>
                  {a.trendDirection === "down" && (
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: "#e6519c" }}>
                      <TrendingDown className="w-3 h-3" />
                      {isAf ? "Dalende tendens" : "Declining trend"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white">
                  {a.masteryBand === "red"
                    ? (isAf
                      ? `Hierdie vak het tans 'n lae bemeesteringsvlak (${a.currentAccuracy}%). 'n Bietjie ekstra aandag hier kan 'n groot verskil maak.`
                      : `This subject currently has a low mastery level (${a.currentAccuracy}%). A little extra focus here can make a big difference.`)
                    : (isAf
                      ? `Hierdie vak wys 'n afwaartse tendens oor die afgelope 7 dae. Moedig jou kind aan om meer te oefen.`
                      : `This subject is showing a downward trend over the last 7 days. Encourage your child to practise a bit more.`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlowCard>
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
    <GlowCard color="cyan" className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px #28c9d6)" }} />
        <h3 className="font-bold text-white text-sm">{isAf ? "Onlangse Aktiwiteit" : "Recent Activity"}</h3>
        <NeonBadge color="cyan">{isAf ? "Lewend" : "Live"}</NeonBadge>
      </div>
      <div className="space-y-2">
        {recent.map((event, i) => (
          <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-black" style={{ border: `1px solid ${event.isCorrect ? "#4ADE80" : "#e6519c"}33` }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-black"
              style={{ border: `1px solid ${event.isCorrect ? "#4ADE80" : "#e6519c"}66`, boxShadow: `0 0 8px ${event.isCorrect ? "#4ADE80" : "#e6519c"}55` }}>
              {event.isCorrect
                ? <CheckCircle className="w-3.5 h-3.5" style={{ color: "#4ADE80" }} />
                : <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#e6519c" }} />}
            </div>
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
    </GlowCard>
  );
}

function MonthlySummaryPanel({ summary, isAf }: { summary: MonthlySummary; isAf: boolean }) {
  return (
    <GlowCard color="cyan" className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-4 h-4" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px #28c9d6)" }} />
        <h3 className="font-bold text-white text-sm">{isAf ? "30-Dae Opsomming" : "30-Day Summary"}</h3>
        <NeonBadge color="cyan">{isAf ? "Hierdie Maand" : "This Month"}</NeonBadge>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: isAf ? "Vrae Beantwoord" : "Questions Answered", value: summary.questionsAnswered, hex: "#28c9d6" },
          { label: isAf ? "Studiedae" : "Study Days",               value: summary.studyDays,         hex: "#4f8cd9" },
          { label: isAf ? "Gem. Akkuraatheid" : "Avg Accuracy",     value: `${summary.avgAccuracy}%`, hex: "#4ADE80" },
        ].map(({ label, value, hex }) => (
          <div key={label} className="text-center p-3 rounded-xl bg-black" style={{ border: `1px solid ${hex}33`, boxShadow: `inset 0 0 12px ${hex}15` }}>
            <p className="text-2xl font-bold" style={{ color: hex, textShadow: `0 0 10px ${hex}80` }}>{value}</p>
            <p className="text-[10px] text-white mt-1 font-semibold uppercase tracking-wider">{label}</p>
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
                    <span className="text-xs font-bold" style={{ color: "#28c9d6", textShadow: "0 0 6px rgba(40,201,214,0.7)" }}>{s.accuracy}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-black overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.accuracy}%`, background: "#28c9d6", boxShadow: "0 0 8px #28c9d6aa" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlowCard>
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
    active:       { en: "Active",          af: "Aktief",         hex: "#4ADE80" },
    trial:        { en: "Free Trial",      af: "Gratis Proeftyd", hex: "#28c9d6" },
    trialing:     { en: "Free Trial",      af: "Gratis Proeftyd", hex: "#28c9d6" },
    pending:      { en: "Pending",         af: "Hangend",        hex: "#ffd83a" },
    grace:        { en: "Payment Issue",   af: "Betaalprobleem", hex: "#ff8a1f" },
    grace_period: { en: "Payment Issue",   af: "Betaalprobleem", hex: "#ff8a1f" },
    lapsed:       { en: "Expired",         af: "Verval",         hex: "#e6519c" },
    cancelled:    { en: "Cancelled",       af: "Gekanselleer",   hex: "#e6519c" },
    none:         { en: "Not Subscribed",  af: "Nie Ingeskryf",  hex: "#8e7cdc" },
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
    <div
      className="relative rounded-2xl bg-black p-5"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      data-testid="parent-subscription-panel"
    >
      <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: s.hex, boxShadow: `0 0 8px ${s.hex}` }} />
      <div className="relative flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: s.hex }}>
            {isAf ? "Intekening" : "Subscription"}
          </p>
          <h3 className="text-lg font-bold text-white">{planName}</h3>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-[11px] font-bold"
            style={{ color: s.hex, border: `1px solid ${s.hex}66`, boxShadow: `0 0 8px ${s.hex}33` }}
            data-testid="parent-subscription-status"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.hex, boxShadow: `0 0 6px ${s.hex}` }} />
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
            className="shrink-0 bg-black text-[#28c9d6] hover:bg-[#28c9d6]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            style={{ border: "1px solid #28c9d6", boxShadow: "0 0 12px rgba(40,201,214,0.35)" }}
            data-testid="button-manage-subscription"
          >
            {isAf ? "Bestuur Betaling" : "Manage Payment"}
          </Button>
        </Link>
      </div>
    </div>
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

  const hex = isOpened ? "#4ADE80" : isDelivered ? "#28c9d6" : isFailed ? "#e6519c" : "#ffd83a";

  return (
    <div
      className="relative rounded-2xl bg-black p-5"
      style={{ border: `1px solid ${hex}44`, boxShadow: `0 0 14px ${hex}22` }}
      data-testid="whatsapp-link-status-panel"
    >
      <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: hex, boxShadow: `0 0 8px ${hex}` }} />
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
              <CheckCircle2 className="w-4 h-4" style={{ color: "#4ADE80" }} />
              <p className="text-sm font-semibold text-white">
                {isAf ? "Skakel gebruik ✓" : "Link opened ✓"}
              </p>
            </div>
          )}

          {!isOpened && isDelivered && (() => {
            const deliveredAtLabel = fmtTime(data.deliveryUpdatedAt);
            return (
              <div className="flex items-center gap-2" data-testid="link-status-delivered">
                <CheckCircle2 className="w-4 h-4" style={{ color: "#28c9d6" }} />
                <p className="text-sm font-semibold text-white">
                  {isAf ? "Afgelewer" : "Delivered"}
                  {deliveredAtLabel
                    ? <span className="ml-1 font-normal text-white/70">{deliveredAtLabel} ✓</span>
                    : " ✓"}
                </p>
              </div>
            );
          })()}

          {!isOpened && isSent && (() => {
            const sentAtLabel = fmtTime(data.createdAt);
            return (
              <div className="flex items-center gap-2" data-testid="link-status-sent">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#ffd83a" }} />
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
                <XCircle className="w-4 h-4" style={{ color: "#e6519c" }} />
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
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#ffd83a" }} />
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
            <p className="text-xs text-[#e6519c] mt-1" data-testid="resend-error">{resendError}</p>
          )}
        </div>

        {!isOpened && (isFailed || isInFlight) && (
          <Button
            size="sm"
            disabled={resending || resendCooldown > 0 || isInFlight}
            onClick={handleResend}
            className="shrink-0 bg-black hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: hex, border: `1px solid ${hex}`, boxShadow: `0 0 10px ${hex}33` }}
            data-testid="button-resend-whatsapp-link"
            title={isInFlight ? (isAf ? "Wag totdat die skakel afgelewer is" : "Wait until delivery is confirmed") : undefined}
          >
            {resending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-1.5" />
            )}
            {resendCooldown > 0
              ? `${resendCooldown}s`
              : isAf
              ? "Stuur weer"
              : "Resend"}
          </Button>
        )}
      </div>
    </div>
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
    <div
      className="flex items-start justify-between gap-4 p-4 rounded-xl bg-black/40"
      style={{ border: "1px solid rgba(124,124,220,0.35)" }}
      data-testid="report-email-opt-out-toggle"
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">{helper}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={optedOut}
        disabled={isLoading || mutation.isPending}
        onClick={() => mutation.mutate(!optedOut)}
        data-testid="button-toggle-report-email-opt-out"
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:opacity-50"
        style={{
          background: optedOut ? "#7c3aed" : "rgba(255,255,255,0.18)",
          border: `1px solid ${optedOut ? "#7c3aed" : "rgba(255,255,255,0.25)"}`,
          boxShadow: optedOut ? "0 0 10px rgba(124,58,237,0.45)" : "none",
        }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          style={{ transform: optedOut ? "translateX(22px)" : "translateX(4px)" }}
        />
      </button>
    </div>
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
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-black disabled:opacity-60 disabled:cursor-wait transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        style={{ color: "#28c9d6", border: "1px solid #28c9d6", boxShadow: "0 0 14px rgba(40,201,214,0.45)" }}
        data-testid="button-download-report"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {isAf ? "Laai Verslag Af" : "Download Report"}
      </button>
    </span>
  );
}

const BAR_HEX: Record<string, string> = {
  "bg-emerald-500": "#4ADE80",
  "bg-emerald-400": "#4ADE80",
  "bg-amber-500":   "#ffd83a",
  "bg-amber-400":   "#ffd83a",
  "bg-red-500":     "#e6519c",
  "bg-red-400":     "#e6519c",
  "bg-pink-500":    "#e6519c",
  "bg-cyan-500":    "#28c9d6",
  "bg-cyan-400":    "#28c9d6",
  "bg-muted-foreground/40": "rgba(255,255,255,0.28)",
  "bg-white/25":    "rgba(255,255,255,0.28)",
};

function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 120 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  const fill = BAR_HEX[color] ?? color;
  const glow = fill.startsWith("#") ? `0 0 8px ${fill}80` : "none";
  return (
    <div className="h-2 rounded-full bg-black overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%`, background: fill, boxShadow: glow }}
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
        <span className="font-semibold" style={{ color: isUp ? "#4ADE80" : diff < 0 ? "#e6519c" : undefined }}>{current}%</span>
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
            <stop offset="0%" stopColor="rgba(40,201,214,0.28)" />
            <stop offset="100%" stopColor="rgba(40,201,214,0)" />
          </linearGradient>
        </defs>
        <polygon points={filled} fill="url(#spark-fill-cosmic)" />
        <polyline points={polyline} fill="none" stroke="#28c9d6" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px #28c9d6)" }} />
        {raw.map((v, i) => {
          const x = pad + (i / (days.length - 1)) * (W - pad * 2);
          const y = H - pad - (v / max) * (H - pad * 2);
          return v > 0 ? <circle key={i} cx={x} cy={y} r="2.5" fill="#28c9d6" /> : null;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-14 gap-4">
            <div className="flex items-center gap-1.5">
              <BrandThemeToggle />
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white hover:text-white transition-colors text-xs font-semibold border border-border hover:border-border/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                data-testid="button-language-toggle"
              >
                <Globe className="h-3.5 w-3.5" />
                {language === "en" ? "EN" : "AF"}
              </button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.history.back()} title={isAf ? "Terug" : "Back"}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")} title={isAf ? "Tuis" : "Home"}>
                <Home className="h-4 w-4" />
              </Button>
              <button
                onClick={() => logout()}
                className="text-white hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                data-testid="button-logout"
                title={isAf ? "Uitteken" : "Sign Out"}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
        {/* Cosmic wordmark wash */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 opacity-40">
          <div className="absolute top-[2%] left-[8%] w-[440px] h-[440px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(40,201,214,0.22), transparent 70%)" }} />
          <div className="absolute top-[30%] right-[2%] w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(142,124,220,0.22), transparent 70%)" }} />
          <div className="absolute bottom-[4%] left-[32%] w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(230,81,156,0.16), transparent 70%)" }} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black"
              style={{ border: "1px solid rgba(142,124,220,0.45)", boxShadow: "0 0 12px rgba(142,124,220,0.35)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#8e7cdc", boxShadow: "0 0 6px #8e7cdc" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#8e7cdc" }}>
                {isAf ? "Ouerverslag" : "Parent Report"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text tracking-tight leading-[1.05]">
              {isAf ? `Welkom, ${user?.firstName || "Ouer"}` : `Welcome, ${user?.firstName || "Parent"}`}
            </h1>
            <p className="text-white font-medium text-base sm:text-lg max-w-2xl">
              {isAf ? "Volg jou kind se vordering en bly ingelig oor hul leerreis." : "Track your child's progress and stay informed about their learning journey."}
            </p>
          </div>
          {childProgress && <DownloadReportButton learnerName={childProgress.learnerName ?? ""} isAf={isAf} />}
        </div>

        <SubscriptionPanel isAf={isAf} />

        <WhatsAppLinkStatusPanel isAf={isAf} />

        {selectedLearnerId && (
          <ReportEmailOptOutToggle learnerUserId={selectedLearnerId} isAf={isAf} />
        )}

        {childProgressError ? (
          <CosmicCard hex="#e6519c" className="p-0">
            <div className="p-10 text-center" data-testid="parent-dashboard-error">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mx-auto mb-4" style={{ border: "1px solid #e6519c", boxShadow: "0 0 18px #e6519c55" }}>
                <AlertTriangle className="w-7 h-7" style={{ color: "#e6519c", filter: "drop-shadow(0 0 4px #e6519c)" }} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">
                {isAf ? "Kon nie jou dashboard laai nie" : "Couldn't load your dashboard"}
              </h2>
              <p className="text-sm text-white max-w-md mx-auto mb-5">
                {isAf
                  ? "Ons kon nie aan die bediener koppel nie. Kyk jou internetverbinding en probeer weer."
                  : "We couldn't reach the server. Check your connection and try again."}
              </p>
              <Button
                onClick={() => refetchChildProgress()}
                disabled={isRefetchingChildProgress}
                className="bg-black text-[#e6519c] hover:bg-[#e6519c]/10"
                style={{ border: "1px solid #e6519c", boxShadow: "0 0 14px rgba(230,81,156,0.45)" }}
                data-testid="button-retry-parent-dashboard"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefetchingChildProgress ? "animate-spin" : ""}`} />
                {isRefetchingChildProgress ? (isAf ? "Probeer..." : "Retrying...") : (isAf ? "Probeer Weer" : "Try Again")}
              </Button>
            </div>
          </CosmicCard>
        ) : childProgress && !hasNoActivity ? (
          <div className="space-y-8 relative z-10">

            {/* Active-child switcher — only renders for parents linked to >1 learner.
                Selecting a child updates selectedLearnerId, which is part of every widget's
                queryKey, so React Query refetches the hero, stats, weekly report, readiness,
                activity feed, monthly summary and exam schedule together. */}
            {(childrenData?.children?.length ?? 0) > 1 && (
              <div
                className="relative rounded-2xl bg-black p-4 sm:p-5"
                style={{ border: "1px solid rgba(142,124,220,0.45)", boxShadow: "0 0 18px rgba(142,124,220,0.25)" }}
                data-testid="parent-child-switcher"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 4px #8e7cdc)" }} />
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                    {isAf ? "Kies Kind" : "Viewing Child"}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black"
                    style={{ color: "#8e7cdc", border: "1px solid #8e7cdc55" }}>
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
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        style={
                          active
                            ? { background: "#8e7cdc", color: "#000", border: "1px solid #8e7cdc", boxShadow: "0 0 12px rgba(142,124,220,0.55)" }
                            : { background: "#000", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }
                        }
                      >
                        {c.learnerName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hero learner card — cosmic-neon */}
            <div
              className="relative overflow-hidden rounded-2xl bg-black p-6 sm:p-8"
              style={{ border: "1.5px solid #28c9d6", boxShadow: "0 0 0 1px rgba(40,201,214,0.28), 0 0 26px rgba(40,201,214,0.3), inset 0 0 22px rgba(0,0,0,0.55)" }}
            >
              <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "#28c9d6" }} />
              <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: "#28c9d6" }} />
              <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: "#28c9d6" }} />
              <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#28c9d6" }} />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "#28c9d6" }}>{isAf ? "Leerder" : "Learner"}</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1" style={{ textShadow: "0 0 12px rgba(40,201,214,0.4)" }}>{childProgress.learnerName}</h2>
                  <p className="text-white text-xs">
                    {isAf ? "Laas aktief" : "Last active"}: {formatDate(childProgress.lastActiveDate)}
                  </p>
                  {childProgress.varkPrimary && VARK_STYLES[childProgress.varkPrimary as keyof typeof VARK_STYLES] && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-xs font-semibold"
                      style={{ border: "1px solid #ffd83a", color: "#ffd83a", boxShadow: "0 0 10px rgba(255,216,58,0.35)" }}
                      data-testid="parent-vark-badge"
                    >
                      <span>{VARK_STYLES[childProgress.varkPrimary as keyof typeof VARK_STYLES].icon}</span>
                      <span>{isAf ? "Leerstyl" : "Style"}: {isAf ? VARK_STYLES[childProgress.varkPrimary as keyof typeof VARK_STYLES].labelAf : VARK_STYLES[childProgress.varkPrimary as keyof typeof VARK_STYLES].label}</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 space-y-4">
                  <AccuracyCompare
                    initial={childProgress.subjectMarks.length > 0
                      ? Math.round(childProgress.subjectMarks.reduce((a, s) => a + s.initialMark, 0) / childProgress.subjectMarks.length)
                      : 50}
                    current={childProgress.overallAccuracy}
                    isAf={isAf}
                  />
                  <Sparkline studyDays={childProgress.weeklyReport.studyDays} totalQ={childProgress.weeklyReport.questionsAnswered} />
                </div>
              </div>
            </div>

            {/* Stat cards — cosmic neon, live-animated */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LiveStatCard icon={Flame}    label={isAf ? "Studie-reeks" : "Study Streak"}       target={childProgress.currentStreak}                 unit={isAf ? "dae" : "days"} hex="#ff8a1f" pulse={childProgress.currentStreak >= 7} />
              <LiveStatCard icon={Target}   label={isAf ? "Akkuraatheid" : "Accuracy"}           target={childProgress.overallAccuracy}               unit="%"                     hex="#8e7cdc" />
              <LiveStatCard icon={BookOpen} label={isAf ? "Vrae Voltooi" : "Questions Done"}     target={childProgress.totalQuestionsAnswered}        unit=""                      hex="#4f8cd9" />
              <LiveStatCard icon={Clock}    label={isAf ? "Minute Hierdie Week" : "Minutes This Week"} target={childProgress.weeklyReport.totalMinutes} unit="min"                 hex="#28c9d6" />
            </div>

            {/* Per-child readiness — one card per linked learner; numbers match each learner's own dashboard */}
            {(childrenData?.children ?? []).length > 0 && (
              <div className="space-y-3" data-testid="parent-children-readiness">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px #28c9d6)" }} />
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                    {isAf ? "Gereedheid per Kind" : "Readiness per Child"}
                  </h2>
                  {(childrenData?.children?.length ?? 0) > 1 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black"
                      style={{ color: "#28c9d6", border: "1px solid #28c9d655" }}>
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

            {/* Weekly report */}
            <div
              className="relative rounded-2xl bg-black p-6"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: "#28c9d6", boxShadow: "0 0 8px #28c9d6" }} />
              <div className="relative flex items-center justify-between flex-wrap gap-2 mb-5">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-white">
                    <Calendar className="w-4 h-4" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px #28c9d6)" }} />
                    {isAf ? "Weeklikse Vorderingsverslag" : "Weekly Progress Report"}
                  </h3>
                  <p className="text-xs text-white mt-0.5">
                    {formatDate(childProgress.weeklyReport.weekStarting)} – {formatDate(childProgress.weeklyReport.weekEnding)}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-black"
                  style={{ color: "#28c9d6", border: "1px solid #28c9d6", boxShadow: "0 0 10px rgba(40,201,214,0.35)" }}
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
                      className="relative rounded-xl bg-black p-6 text-center mb-2"
                      style={{ border: "1px dashed rgba(40,201,214,0.45)" }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mx-auto mb-3" style={{ border: "1px solid #28c9d6", boxShadow: "0 0 12px #28c9d655" }}>
                        <BookOpen className="w-6 h-6" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px #28c9d6)" }} />
                      </div>
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
                      { label: isAf ? "Dae Gestudeer" : "Days Studied",   n: wr.studyDays,         suffix: "",  hex: "#ff6a1f" },
                      { label: isAf ? "Minute Bestee" : "Minutes Spent",  n: wr.totalMinutes,      suffix: "",  hex: "#ffd83a" },
                      { label: isAf ? "Vrae Voltooi" : "Questions Done",  n: wr.questionsAnswered, suffix: "",  hex: "#28c9d6" },
                      { label: isAf ? "Akkuraatheid" : "Accuracy",        n: wr.accuracy,          suffix: "%", hex: "#8e7cdc" },
                    ].map(({ label, n, suffix, hex }, i) => (
                      <WeeklyMiniStat key={i} label={label} target={n} suffix={suffix} hex={hex} />
                    ))}
                  </div>
                );
              })()}

              <div className="relative grid gap-4 sm:grid-cols-2">
                {childProgress.weeklyReport.achievements.length > 0 && (
                  <div className="relative p-4 rounded-xl bg-black overflow-hidden" style={{ border: "1px solid #4ADE80aa" }}>
                    <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "#4ADE80" }} />
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "#4ADE80" }}>
                      <CheckCircle className="w-4 h-4" style={{ filter: "drop-shadow(0 0 4px #4ADE80)" }} />
                      {isAf ? "Prestasies Hierdie Week" : "Achievements This Week"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {childProgress.weeklyReport.achievements.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-black text-xs" style={{ color: "#4ADE80", border: "1px solid #4ADE8055" }}>{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {childProgress.weeklyReport.areasForImprovement.length > 0 && (
                  <div className="relative p-4 rounded-xl bg-black overflow-hidden" style={{ border: "1px solid #ffd83aaa" }}>
                    <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "#ffd83a" }} />
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "#ffd83a" }}>
                      <AlertTriangle className="w-4 h-4" style={{ filter: "drop-shadow(0 0 4px #ffd83a)" }} />
                      {isAf ? "Areas om op te Fokus" : "Areas to Focus On"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {childProgress.weeklyReport.areasForImprovement.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-black text-xs" style={{ color: "#ffd83a", border: "1px solid #ffd83a55" }}>{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subject grids — cosmic neon */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CosmicCard hex="#4f8cd9">
                <h3 className="flex items-center gap-2 text-base font-bold text-white mb-1">
                  <TrendingUp className="w-4 h-4" style={{ color: "#4f8cd9", filter: "drop-shadow(0 0 4px #4f8cd9)" }} />
                  {isAf ? "Vakvordering" : "Subject Progress"}
                </h3>
                <p className="text-xs text-white mb-4">{isAf ? "Akkuraatheid per vak hierdie week" : "Accuracy per subject this week"}</p>
                <div className="space-y-3">
                  {childProgress.weeklyReport.subjectBreakdown.map((subject, i) => {
                    const accHex = subject.accuracy >= 70 ? "#4ADE80" : subject.accuracy >= 50 ? "#ffd83a" : "#e6519c";
                    const mastery = subject.masteryScore ?? null;
                    const progress = subject.progressScore ?? null;
                    const masteryHex = mastery == null ? "#8e7cdc" : mastery >= 75 ? "#4ADE80" : mastery >= 60 ? "#ffd83a" : "#e6519c";
                    return (
                      <div key={i} className="p-3 rounded-xl bg-black border border-white/10 space-y-2" data-testid={`parent-subject-row-${i}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-white">{subject.subjectName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white">{subject.questionsAttempted} {isAf ? "vrae" : "q's"}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black" style={{ color: accHex, border: `1px solid ${accHex}55` }}>{subject.accuracy}%</span>
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
              </CosmicCard>

              <CosmicCard hex="#8e7cdc">
                <h3 className="flex items-center gap-2 text-base font-bold text-white mb-1">
                  <Target className="w-4 h-4" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 4px #8e7cdc)" }} />
                  {isAf ? "Vakpuntevergelyking" : "Subject Marks Comparison"}
                </h3>
                <p className="text-xs text-white mb-4">{isAf ? "Aanvanklike vs Huidige Prestasie" : "Initial vs Current Performance"}</p>
                <div className="space-y-3">
                  {childProgress.subjectMarks.map((subject, i) => {
                    const diff = subject.currentMark - subject.initialMark;
                    const isUp = diff > 0;
                    const isDown = diff < 0;
                    const diffHex = isUp ? "#4ADE80" : isDown ? "#e6519c" : "#ffffff";
                    return (
                      <div key={i} className="p-3 rounded-xl bg-black border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-white">{subject.subjectName}</span>
                          <div className="flex items-center gap-1">
                            {isUp && <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#4ADE80" }} />}
                            {isDown && <ArrowDownRight className="w-3.5 h-3.5" style={{ color: "#e6519c" }} />}
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
              </CosmicCard>
            </div>

            {childProgress.examSessions && childProgress.examSessions.length > 0 && (
              <CosmicCard hex="#ffd83a">
                <h3 className="flex items-center gap-2 text-base font-bold text-white mb-1">
                  <Trophy className="w-4 h-4" style={{ color: "#ffd83a", filter: "drop-shadow(0 0 4px #ffd83a)" }} />
                  {isAf ? "Eksamentyd Eksamenresultate" : "Crunch Time Exam Results"}
                </h3>
                <p className="text-xs text-white mb-4">
                  {isAf ? "Onlangse gesimuleerde eksamen resultate" : "Recent simulated exam results"}
                </p>
                <div className="space-y-2">
                  {childProgress.examSessions.map((session, i) => {
                    const pct = session.score != null && session.totalMarks
                      ? Math.round((session.score / session.totalMarks) * 100)
                      : null;
                    const pctHex = pct == null ? "#ffffff" : pct >= 60 ? "#4ADE80" : pct >= 40 ? "#ffd83a" : "#e6519c";
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/10">
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
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black" style={{ color: "#28c9d6", border: "1px solid #28c9d655" }}>{isAf ? "Voltooi" : "Completed"}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CosmicCard>
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
                <CosmicCard hex="#4f8cd9">
                  <div data-testid="parent-exam-timetable">
                    <h3 className="flex items-center gap-2 text-base font-bold text-white mb-1">
                      <Calendar className="w-4 h-4" style={{ color: "#4f8cd9", filter: "drop-shadow(0 0 4px #4f8cd9)" }} />
                      {isAf ? "NSC 2026 Eksamenrooster" : "NSC 2026 Exam Timetable"}
                    </h3>
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
                      const accentHex = !hasReadinessData ? "#8e7cdc" : acc >= 70 ? "#4ADE80" : acc >= 50 ? "#ffd83a" : "#e6519c";
                      const labelText = !hasReadinessData
                        ? (isAf ? "Geen oefendata nog nie" : "No practice data yet")
                        : acc >= 70
                          ? (isAf ? "Op Koers ✓" : "On Track ✓")
                          : acc >= 50
                            ? (isAf ? "Bou Momentum" : "Building Momentum")
                            : (isAf ? "Aandag Nodig" : "Needs Attention");
                      return (
                        <div data-testid="parent-overall-readiness" className="flex items-center gap-3 p-3 rounded-xl bg-black mb-3" style={{ border: "1px solid #28c9d655" }}>
                          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0" style={{ border: "1px solid #28c9d6", boxShadow: "0 0 10px #28c9d655" }}>
                            <GraduationCap className="w-4 h-4" style={{ color: "#28c9d6" }} />
                          </div>
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
                            <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#ffd83a" }} />
                          )}
                        </div>
                      );
                    })()}

                    {/* Today's directive — what the learner should focus on right now */}
                    {learnerDirective && learnerDirective.hasExam && (() => {
                      const urgencyMap: Record<string, { color: string; glow: string }> = {
                        final_sprint:     { color: "#e6519c", glow: "rgba(230,81,156,0.45)" },
                        exam_prep_mode:   { color: "#ff8a1f", glow: "rgba(255,138,31,0.45)" },
                        focused_revision: { color: "#ffd83a", glow: "rgba(255,216,58,0.45)" },
                        build_mastery:    { color: "#8e7cdc", glow: "rgba(142,124,220,0.45)" },
                      };
                      const u = urgencyMap[learnerDirective.urgencyState] || urgencyMap.build_mastery;
                      const days = learnerDirective.daysUntil ?? 0;
                      const subjectLabel = isAf ? learnerDirective.subjectNameAf : learnerDirective.subjectName;
                      return (
                        <div
                          data-testid="parent-today-directive"
                          className="flex items-center gap-3 p-3 rounded-xl bg-black mb-3"
                          style={{ border: `1px solid ${u.color}aa`, boxShadow: `0 0 14px ${u.glow}` }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0"
                            style={{ border: `1px solid ${u.color}`, boxShadow: `0 0 10px ${u.glow}` }}
                          >
                            <Rocket className="w-4 h-4" style={{ color: u.color, filter: `drop-shadow(0 0 4px ${u.glow})` }} />
                          </div>
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
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-black mb-3" style={{ border: "1px solid #e6519caa", boxShadow: "0 0 16px rgba(230,81,156,0.18)" }}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#e6519c", filter: "drop-shadow(0 0 4px #e6519c)" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold mb-1" style={{ color: "#e6519c" }}>
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
                        const uHex = entry.isAtRisk ? "#e6519c" : urgency === "red" ? "#e6519c" : urgency === "amber" ? "#ffd83a" : urgency === "blue" ? "#4f8cd9" : "#4ADE80";
                        const accHex = entry.subjectAccuracy == null ? "#ffffff" : entry.subjectAccuracy >= 70 ? "#4ADE80" : entry.subjectAccuracy >= 50 ? "#ffd83a" : "#e6519c";
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black" style={{ border: `1px solid ${uHex}55` }}>
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: uHex, boxShadow: `0 0 6px ${uHex}` }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-white truncate">{entry.subjectName}</p>
                                {entry.subjectAccuracy !== null && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black" style={{ color: accHex, border: `1px solid ${accHex}55` }}>{entry.subjectAccuracy}%</span>
                                )}
                                {entry.isAtRisk && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black" style={{ color: "#e6519c", border: "1px solid #e6519c" }}>
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
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#ffd83a" }}>
                          {isAf ? "Nie-eksamen Dae (inhaal)" : "Non-Examination Days (catch-up)"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {nonExamDates.map(d => (
                            <span key={d} className="inline-flex px-2.5 py-1 rounded-lg bg-black text-[10px] font-semibold" style={{ color: "#ffd83a", border: "1px solid #ffd83a55" }}>
                              {fmtDate(d + "T00:00:00", language, { weekday: "short", day: "numeric", month: "short" })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CosmicCard>
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

            {/* Journey link */}
            <div
              className="relative rounded-2xl bg-black p-5 flex items-center justify-between gap-4"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: "#28c9d6", boxShadow: "0 0 8px #28c9d6" }} />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0" style={{ border: "1px solid #28c9d6", boxShadow: "0 0 12px #28c9d655" }}>
                  <MapPin className="w-5 h-5" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px #28c9d6)" }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
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
                  className="shrink-0 relative bg-black text-[#28c9d6] hover:bg-[#28c9d6]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  style={{ border: "1px solid #28c9d6", boxShadow: "0 0 12px rgba(40,201,214,0.35)" }}
                >
                  {isAf ? "Sien Reis" : "View Journey"}
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <ParentTipCard isAf={isAf} />

            <LinkHistorySection learnerId={selectedLearnerId} isAf={isAf} />

          </div>
        ) : hasNoActivity && childProgress ? (
          <div className="space-y-6 relative z-10">
            <NoActivityEmptyState learnerName={childProgress.learnerName} isAf={isAf} />
            <LinkHistorySection learnerId={selectedLearnerId} isAf={isAf} />
          </div>
        ) : (
          <CosmicCard hex="#8e7cdc" className="p-0">
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mx-auto mb-4" style={{ border: "1px solid #8e7cdc", boxShadow: "0 0 18px #8e7cdc55" }}>
                <BookOpen className="w-8 h-8" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 4px #8e7cdc)" }} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{isAf ? "Nog geen kinderrekening gekoppel nie" : "No child account linked yet"}</h2>
              <p className="text-sm text-white max-w-md mx-auto">
                {isAf ? "Vra jou kind om sy aktiveringskode in Instellings te deel — sodra dit gekoppel is, sien jy hul vordering hier." : "Ask your child to share their activation code from Settings — once linked, you'll see their progress here."}
              </p>
              <div className="mt-5">
                <a href="/subscribe" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #8e7cdc, #b066d6)", boxShadow: "0 0 18px rgba(142,124,220,0.4)" }} data-testid="link-parent-get-started">
                  {isAf ? "Begin nou — Brain Boost" : "Get Started — Brain Boost"}
                </a>
              </div>
            </div>
          </CosmicCard>
        )}

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
      <div
        className="relative overflow-hidden rounded-2xl bg-black p-8 sm:p-10 text-center"
        style={{ border: "1.5px solid #28c9d6", boxShadow: "0 0 0 1px rgba(40,201,214,0.28), 0 0 26px rgba(40,201,214,0.3), inset 0 0 22px rgba(0,0,0,0.55)" }}
      >
        <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "#28c9d6" }} />
        <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: "#28c9d6" }} />
        <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: "#28c9d6" }} />
        <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#28c9d6" }} />

        <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mx-auto mb-5" style={{ border: "1px solid #28c9d6", boxShadow: "0 0 18px rgba(40,201,214,0.45)" }}>
          <Rocket className="w-8 h-8" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px #28c9d6)" }} />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black mb-3"
          style={{ border: "1px solid rgba(40,201,214,0.45)", boxShadow: "0 0 12px rgba(40,201,214,0.35)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#28c9d6", boxShadow: "0 0 6px #28c9d6" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#28c9d6" }}>
            {isAf ? "Gereed om te begin" : "Ready to begin"}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ textShadow: "0 0 12px rgba(40,201,214,0.4)" }}>
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
            className="relative rounded-2xl bg-black p-5"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: "#8e7cdc", boxShadow: "0 0 8px #8e7cdc" }} />
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0" style={{ border: "1px solid #8e7cdc", boxShadow: "0 0 12px rgba(142,124,220,0.45)" }}>
                <t.icon className="w-5 h-5" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 4px #8e7cdc)" }} />
              </div>
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

  const hexMap: Record<string, string> = { emerald: "#4ADE80", amber: "#ffd83a", red: "#e6519c" };
  const hex = hexMap[accent];

  return (
    <div
      className="relative rounded-2xl bg-black p-5"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      data-testid="performance-status"
    >
      <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: hex, boxShadow: `0 0 8px ${hex}` }} />
      <div className="relative flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center shrink-0" style={{ border: `1px solid ${hex}`, boxShadow: `0 0 12px ${hex}55` }}>
          <StatusIcon className="w-5 h-5" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex})` }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-sm" style={{ color: hex }}>{statusLabel}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black" style={{ color: hex, border: `1px solid ${hex}55` }}>{isAf ? "Hierdie Week" : "This Week"}</span>
          </div>
          <p className="text-sm leading-relaxed text-white">{statusDesc}</p>
        </div>
      </div>
    </div>
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
    <div
      className="relative rounded-2xl bg-black p-5"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      data-testid="celebration-banner"
    >
      <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: "linear-gradient(180deg,#ffd83a,#e6519c,#28c9d6)", boxShadow: "0 0 8px #ffd83a" }} />
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shrink-0" style={{ border: "1px solid #ffd83a", boxShadow: "0 0 14px #ffd83a55" }}>
          <Trophy className="w-6 h-6" style={{ color: "#ffd83a", filter: "drop-shadow(0 0 4px #ffd83a)" }} />
        </div>
        <div>
          <h3 className="font-bold text-white flex items-center gap-2 mb-1">
            <PartyPopper className="w-4 h-4" style={{ color: "#e6519c", filter: "drop-shadow(0 0 4px #e6519c)" }} />
            {isAf ? "Viering!" : "Celebration!"}
          </h3>
          {messages.map((msg, i) => <p key={i} className="text-sm text-white">{msg}</p>)}
        </div>
      </div>
    </div>
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
  if (usedAt) return "#a3e635";
  switch (status) {
    case "delivered": return "#a3e635";
    case "sent": return "#28c9d6";
    case "failed":
    case "undelivered": return "#e6519c";
    default: return "#ffd83a";
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
    <div
      className="relative rounded-2xl bg-black overflow-hidden"
      style={{ border: "1px solid rgba(125,211,252,0.25)" }}
      data-testid="parent-link-history"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0"
            style={{ border: "1px solid #7dd3fc", boxShadow: "0 0 10px #7dd3fc44" }}
          >
            <Link2 className="w-4 h-4" style={{ color: "#7dd3fc", filter: "drop-shadow(0 0 3px #7dd3fc)" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isAf ? "Inskakelingskakelskedule" : "Onboarding Link History"}
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
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
          style={{ color: "rgba(255,255,255,0.35)" }}
        />
      </button>

      {open && (
        <div className="border-t border-white/10 px-5 pb-5 pt-4">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-white/40 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {isAf ? "Laai tans..." : "Loading…"}
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex items-center justify-center gap-2 py-8 text-[#e6519c] text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {isAf ? "Kon nie geskiedenisinligting laai nie." : "Could not load link history."}
            </div>
          )}

          {!isLoading && !isError && count === 0 && (
            <p className="text-sm text-white/40 italic text-center py-8">
              {isAf ? "Geen inskakelingskakels gevind nie." : "No onboarding links found."}
            </p>
          )}

          {!isLoading && !isError && rows && rows.length > 0 && (
            <div className="space-y-2">
              {rows.map((r, i) => {
                const hex = deliveryStatusHex(r.deliveryStatus, r.usedAt);
                const displayStatus = r.usedAt ? "opened" : (r.deliveryStatus ?? "pending");
                return (
                  <div
                    key={r.jti}
                    className="rounded-xl p-3"
                    style={{ border: `1px solid ${hex}33`, background: `${hex}0a` }}
                    data-testid={`parent-link-row-${i}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{ background: `${hex}22`, color: hex }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider"
                            style={{ background: `${hex}22`, color: hex }}
                          >
                            {displayStatus}
                          </span>
                          {r.channel && (
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">
                              via {r.channel}
                            </span>
                          )}
                          {(r.retryCount ?? 0) > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fb923c22", color: "#fb923c" }}>
                              {r.retryCount} {isAf ? "herprobeer" : "retry"}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                          {r.sentTo && (
                            <div>
                              <span className="text-white/40">{isAf ? "Gestuur aan " : "Sent to "}</span>
                              <span className="text-white font-mono">{r.sentTo}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-white/40">{isAf ? "Uitgereik " : "Issued "}</span>
                            <span className="text-white/70">{fmtDt(r.createdAt)}</span>
                          </div>
                          {r.deliveryUpdatedAt && (
                            <div>
                              <span className="text-white/40">{isAf ? "Status " : "Status "}</span>
                              <span className="text-white/70">{fmtDt(r.deliveryUpdatedAt)}</span>
                            </div>
                          )}
                          {r.usedAt && (
                            <div>
                              <span className="text-white/40">{isAf ? "Oopgemaak " : "Opened "}</span>
                              <span className="text-white/70">{fmtDt(r.usedAt)}</span>
                            </div>
                          )}
                        </div>
                        {r.deliveryError && (
                          <div className="text-[10px] font-mono text-[#e6519c] break-all bg-[#e6519c]/10 px-2 py-1 rounded-lg">
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
    </div>
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
    <div
      className="relative rounded-2xl bg-black p-5"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      data-testid="parent-tip-card"
    >
      <div aria-hidden className="absolute inset-y-4 left-0 w-[2px] rounded-r" style={{ background: "#ffd83a", boxShadow: "0 0 8px #ffd83a" }} />
      <div className="relative flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0" style={{ border: "1px solid #ffd83a", boxShadow: "0 0 12px #ffd83a55" }}>
          <Lightbulb className="w-5 h-5" style={{ color: "#ffd83a", filter: "drop-shadow(0 0 4px #ffd83a)" }} />
        </div>
        <div>
          <h3 className="font-bold text-sm mb-1" style={{ color: "#ffd83a" }}>{isAf ? "Ouertip van die Week" : "Parent Tip of the Week"}</h3>
          <p className="text-sm text-white leading-relaxed">{tips[tipIndex]}</p>
        </div>
      </div>
    </div>
  );
}


const PARENT_FAQ = {
  en: [
    { q: "How do I see my child's progress?", a: "Your dashboard shows weekly reports including study days, minutes studied, subjects practised, and mastery levels." },
    { q: "What does the mastery percentage mean?", a: "Mastery shows how well your child understands each topic. Green (75%+) means strong, amber (50-74%) developing, red means more practice needed." },
    { q: "Can I see which subjects my child is struggling with?", a: "Yes — the subject breakdown highlights weak areas in red. Use this for focused conversations with your child or their teachers." },
    { q: "How does the 14-day free trial work?", a: "Full access for 14 days. No charge until day 15. Cancel anytime before then at no cost." },
    { q: "Is the content aligned with the NSC curriculum?", a: "Yes — all questions, topics, and study plans come from the CAPS curriculum and 10 years of real NSC exam papers." },
    { q: "How do I contact support?", a: "Email enterprise@kth-tech.com or use the help button in the app. We respond within 24 hours." },
  ],
  af: [
    { q: "Hoe sien ek my kind se vordering?", a: "Jou dashboard wys weeklikse verslae met studiedae, minute gestudeer, vakke geoefen en bemeesteringsvlakke." },
    { q: "Wat beteken die bemeesteringspersentasie?", a: "Bemeestering wys hoe goed jou kind elke onderwerp verstaan. Groen (75%+) beteken sterk, amber (50-74%) ontwikkelend, rooi beteken meer oefening nodig." },
    { q: "Kan ek sien met watter vakke my kind sukkel?", a: "Ja — die vakuiteensetting lig swak areas in rooi uit vir gefokusde gesprekke." },
    { q: "Hoe werk die 14-dae gratis proeftydperk?", a: "Volle toegang vir 14 dae. Geen heffing voor dag 15 nie. Kanselleer enige tyd teen geen koste." },
    { q: "Is die inhoud in lyn met die NSC-kurrikulum?", a: "Ja — alle vrae en studieplanne kom uit die KABV-kurrikulum en 10 jaar se werklike NSC-eksamenvraestelle." },
    { q: "Hoe kontak ek ondersteuning?", a: "Stuur 'n e-pos aan enterprise@kth-tech.com of gebruik die hulpknoppie in die app." },
  ],
};

function ParentFAQ({ isAf }: { isAf: boolean }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const items = isAf ? PARENT_FAQ.af : PARENT_FAQ.en;
  return (
    <div className="mt-4">
      <CosmicCard hex="#8e7cdc">
        <h3 className="flex items-center gap-2 text-base font-bold text-white mb-4">
          <HelpCircle className="w-4 h-4" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 4px #8e7cdc)" }} />
          {isAf ? "Gereelde Vrae vir Ouers" : "Parent FAQ"}
        </h3>
        <div className="divide-y divide-white/10">
          {items.map((item, idx) => (
            <div key={idx}>
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="flex items-center justify-between w-full py-3.5 text-left text-sm font-medium text-white hover:text-[#8e7cdc] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9aafd] rounded-md"
                data-testid={`faq-parent-q-${idx}`}
              >
                {item.q}
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ml-3 ${openIdx === idx ? "rotate-180" : ""}`}
                  style={{ color: openIdx === idx ? "#8e7cdc" : "rgba(255,255,255,0.45)" }}
                />
              </button>
              {openIdx === idx && (
                <p className="pb-4 text-sm text-white leading-relaxed" data-testid={`faq-parent-a-${idx}`}>{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </CosmicCard>
    </div>
  );
}
