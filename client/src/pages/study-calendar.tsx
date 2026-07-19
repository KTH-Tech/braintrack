import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { DailyDirective } from "@/types/daily-directive";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/formatters";
import {
  BookOpen, TrendingUp, CalendarDays, Settings, LogOut,
  Clock, Flame, ChevronRight, Target, Zap, Rocket,
  CheckCircle2, Circle, Moon, Sun, Sunset, AlertTriangle,
  ChevronLeft, GraduationCap, Coffee,
} from "lucide-react";
import { useState } from "react";
import { useVark } from "@/hooks/use-vark";
import { getSubjectIcon } from "@/lib/vark";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { calcReadiness, readinessBand, readinessBandLabel } from "@/lib/readiness";
import { ShieldCheck } from "lucide-react";

/* ─── Day label constants ─────────────────────────────────────────────── */

const DAYS_EN    = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAYS_AF    = ["Maandag","Dinsdag","Woensdag","Donderdag","Vrydag","Saterdag","Sondag"];
const DAYS_SHORT_EN = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAYS_SHORT_AF = ["Maa","Din","Woe","Don","Vry","Sat","Son"];

/* ─── Neon colour palette ──────────────────────────────────────────────── */

/* Wordmark-palette neon set — every hex is a stop in the BrainTrack rainbow */
const NEON: Record<string, { hex: string; glow: string; text: string }> = {
  blue:   { hex: "#9FD8FF", glow: "rgba(159,216,255,0.45)",  text: "#b7d1f4" },
  cyan:   { hex: "#6EE7F9", glow: "rgba(110,231,249,0.45)",  text: "#a8ecf3" },
  green:  { hex: "#C5B3FF", glow: "rgba(197,179,255,0.45)", text: "#c8bff0" },
  gold:   { hex: "#FFE29A", glow: "rgba(255,226,154,0.50)",  text: "#ffe98a" },
  orange: { hex: "#FFE29A", glow: "rgba(255,226,154,0.50)",  text: "#ffb38a" },
  /* legacy alias — second cyan slot kept for compile compatibility */
  cyan2:  { hex: "#6EE7F9", glow: "rgba(110,231,249,0.45)",  text: "#bff3f8" },
  pink:   { hex: "#FFB7E5", glow: "rgba(255,183,229,0.50)",  text: "#f5a8cc" },
  red:    { hex: "#FFE29A", glow: "rgba(255,226,154,0.50)",  text: "#ffc59a" },
  teal:   { hex: "#6EE7F9", glow: "rgba(110,231,249,0.40)",  text: "#9be6ee" },
  lime:   { hex: "#FFE29A", glow: "rgba(255,226,154,0.50)",  text: "#ffd28a" },
  violet: { hex: "#C5B3FF", glow: "rgba(197,179,255,0.50)", text: "#dcb4ee" },
};

const SUBJECT_NEON_MAP: Record<string, keyof typeof NEON> = {
  "Mathematics":                          "blue",
  "Mathematical Literacy":                "cyan",
  "Physical Sciences":                    "cyan",
  "Life Sciences":                        "green",
  "English Home Language":                "gold",
  "English First Additional Language":    "gold",
  "Afrikaans Home Language":              "orange",
  "Afrikaans First Additional Language":  "orange",
  "Geography":                            "cyan2",
  "Accounting":                           "pink",
  "History":                              "red",
  "Business Studies":                     "teal",
  "Economics":                            "lime",
  "Tourism":                              "orange",
  "Information Technology":               "blue",
  "Computer Applications Technology":     "cyan",
  "Agricultural Sciences":                "green",
  "Civil Technology":                     "teal",
  "Electrical Technology":                "gold",
  "Mechanical Technology":                "cyan2",
};

const NEON_SEQUENCE: (keyof typeof NEON)[] = [
  "blue","cyan","green","gold","orange","cyan2","pink","red","teal","lime",
];

function subjectNeon(name: string, idx: number) {
  const key = SUBJECT_NEON_MAP[name] || NEON_SEQUENCE[idx % NEON_SEQUENCE.length];
  return NEON[key];
}

/* ─── Study slot time blocks ───────────────────────────────────────────── */

const STUDY_SLOTS: Record<string, { label: string; labelAf: string; icon: any; hours: string }[]> = {
  morning: [
    { label: "Morning Block",      labelAf: "Oggendblok",         icon: Sun,    hours: "06:00–08:00" },
    { label: "Afternoon Revision", labelAf: "Namiddag Herhaling", icon: Sunset, hours: "15:00–16:00" },
  ],
  afternoon: [
    { label: "Afternoon Block",    labelAf: "Middagblok",         icon: Sunset, hours: "14:00–16:00" },
    { label: "Evening Review",     labelAf: "Aand Herhaling",     icon: Moon,   hours: "18:00–19:00" },
  ],
  evening: [
    { label: "Evening Block",      labelAf: "Aandblok",           icon: Moon,   hours: "18:00–20:00" },
    { label: "Night Recap",        labelAf: "Nagherhaling",       icon: Moon,   hours: "21:00–22:00" },
  ],
};

/* ─── NSC rest dates ───────────────────────────────────────────────────── */

const NSC_NON_EXAM_DATES = ["2026-11-03","2026-11-04","2026-11-05","2026-11-09"];

function calcDays(target: Date) {
  return Math.max(0, Math.floor((target.getTime() - Date.now()) / 86_400_000));
}

/* ─── Urgency bands (thresholds: >14 / 7-14 / 3-6 / 0-2) ─────────────── */

type UrgencyBand = "build" | "focused" | "prep" | "sprint";

function urgencyBand(daysLeft: number): UrgencyBand {
  if (daysLeft > 14) return "build";
  if (daysLeft >= 7) return "focused";
  if (daysLeft >= 3) return "prep";
  return "sprint";
}

const URGENCY_LABEL: Record<UrgencyBand, { en: string; af: string; color: string; glow: string }> = {
  build:   { en: "Build Mastery",      af: "Bou Vaardigheid",     color: "#C5B3FF", glow: "rgba(197,179,255,0.55)" },
  focused: { en: "Focused Revision",   af: "Gefokusde Herhaling", color: "#FFE29A", glow: "rgba(255,226,154,0.55)"  },
  prep:    { en: "Exam Prep Mode",     af: "Eksamenvoorbereiding",color: "#FFE29A", glow: "rgba(255,226,154,0.55)"  },
  sprint:  { en: "Final Sprint",       af: "Finale Sprint",       color: "#FFB7E5", glow: "rgba(255,183,229,0.55)"  },
};

/* ─── Space background ─────────────────────────────────────────────────── */

function SpaceBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "#000000" }}>
      <div style={{ position:"absolute",inset:0, background:"radial-gradient(ellipse 80% 60% at 50% -10%, rgba(110,231,249,0.22) 0%, transparent 70%)" }} />
      <div style={{ position:"absolute",inset:0, background:"radial-gradient(ellipse 55% 45% at 85% 85%, rgba(197,179,255,0.14) 0%, transparent 60%)" }} />
      <div style={{ position:"absolute",inset:0, background:"radial-gradient(ellipse 45% 35% at 15% 90%, rgba(255,183,229,0.10) 0%, transparent 60%)" }} />
      <div style={{ position:"absolute",inset:0, background:"radial-gradient(ellipse 40% 30% at 20% 10%, rgba(255,226,154,0.08) 0%, transparent 60%)" }} />
      <div style={{ position:"absolute",inset:0,opacity:0.025,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat:"repeat",backgroundSize:"128px 128px" }} />
    </div>
  );
}

/* ─── Glassmorphism card wrapper ───────────────────────────────────────── */

function GlassCard({ children, className = "", neonColor, style }: {
  children: React.ReactNode; className?: string;
  neonColor?: string; style?: React.CSSProperties;
}) {
  const hex = neonColor || "#6EE7F9";
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: "#000",
        border: `1.5px solid ${neonColor ? hex : "rgba(255,255,255,0.10)"}`,
        borderRadius: "16px",
        boxShadow: neonColor
          ? `0 0 22px ${hex}55, inset 0 0 14px rgba(0,0,0,0.55)`
          : "inset 0 0 10px rgba(0,0,0,0.55)",
        ...style,
      }}
    >
      {neonColor && (
        <>
          <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 pointer-events-none rounded-tl-[10px]" style={{ borderColor: hex }} />
          <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 pointer-events-none rounded-tr-[10px]" style={{ borderColor: hex }} />
          <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 pointer-events-none rounded-bl-[10px]" style={{ borderColor: hex }} />
          <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 pointer-events-none rounded-br-[10px]" style={{ borderColor: hex }} />
        </>
      )}
      {children}
    </div>
  );
}

/* ─── Exam chip ────────────────────────────────────────────────────────── */

function ExamChip({ name, paper, neon }: { name: string; paper?: string; neon: typeof NEON[string] }) {
  return (
    <div style={{ background:`${neon.hex}22`, border:`1px solid ${neon.hex}88`, boxShadow:`0 0 10px ${neon.glow}`, borderRadius:"8px", padding:"4px 8px", marginBottom:"4px" }}>
      <p style={{ color:neon.text, fontSize:"10px", fontWeight:700, lineHeight:1.2 }} className="truncate">{name}</p>
      {paper && <p style={{ color:neon.hex, fontSize:"9px", opacity:0.8 }}>{paper}</p>}
    </div>
  );
}

/* ─── Rest chip ────────────────────────────────────────────────────────── */

function RestChip({ isAf }: { isAf: boolean }) {
  return (
    <div style={{ background:"rgba(6, 182, 212,0.10)", border:"1px solid rgba(6, 182, 212,0.25)", boxShadow:"0 0 8px rgba(6, 182, 212,0.15)", borderRadius:"8px", padding:"4px 8px", marginBottom:"4px" }}>
      <p style={{ color:"#a5f3fc", fontSize:"10px", fontWeight:600 }}>{isAf ? "Rus & Inhaal" : "Rest & Catch-up"}</p>
    </div>
  );
}

/* ─── Main page component ──────────────────────────────────────────────── */

export default function StudyCalendarPage() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  /* Week offset: 0 = this week, -1 = last week, +1 = next week, etc. */
  const [weekOffset, setWeekOffset] = useState(0);

  /* Mobile selected day index */
  const [mobileDay, setMobileDay] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });

  /* Data queries */
  const { data: profile } = useQuery<any>({ queryKey: ["/api/user/onboarding"] });
  const { data: subjects, isLoading: subjectsLoading } = useQuery<any[]>({ queryKey: ["/api/subjects"] });
  const { data: stats } = useQuery<any>({ queryKey: ["/api/user/stats"] });
  const { data: progressRaw } = useQuery<any>({ queryKey: ["/api/user/progress"], refetchOnWindowFocus: true });
  const { data: examScheduleData } = useQuery<any>({
    queryKey: ["/api/timetable/schedule"],
    staleTime: 120000,
  });
  const { data: readinessData } = useQuery<{ readiness: Record<number, number> }>({
    queryKey: ["/api/learner/readiness"],
    staleTime: 60000,
  });
  const progressData: any[] = progressRaw?.subjectProgress || [];

  /* Weak topics — used to surface specific drill targets in each slot */
  const { data: weakTopicsRaw } = useQuery<any[]>({
    queryKey: ["/api/mastery/weak-topics", { limit: 20 }],
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
  const weakTopicsBySubjectId = new Map<number, any>(
    (weakTopicsRaw || []).map((t: any) => [t.subjectId, t])
  );

  /* Shared readiness score — same formula as dashboard hero & progress page */
  const overallReadiness = calcReadiness({
    accuracy: stats?.accuracy,
    studyStreak: stats?.studyStreak,
    questionsAnswered: stats?.questionsAnswered,
  });

  /* Exam schedule — wired to Task #115 backend.
     retry:false ensures the page never hangs if the endpoint is not yet
     deployed; the || [] fallback keeps the UI functional with zero data. */
  const { data: examScheduleRaw } = useQuery<any[]>({
    queryKey: ["/api/learner/exam-schedule"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const examSchedule: any[] = examScheduleRaw || [];

  /* Exam widgets — wired to Task #114 backend.
     Same graceful-fallback pattern: retry:false + || {} guard. */
  const { data: examWidgets } = useQuery<any>({
    queryKey: ["/api/learner/exam-widgets"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  /* Today's directive — single "what to study right now" prompt */
  const { data: todayDirective } = useQuery<DailyDirective>({
    queryKey: ["/api/learner/today-directive"],
    retry: false,
    staleTime: 60_000,
  });

  const { varkPrimary, insights: varkInsights } = useVark();

  /* VARK subject priority maps — subjects more aligned with each style listed first */
  const VARK_SUBJECT_PRIORITY: Record<string, string[]> = {
    visual:      ["Geography", "History", "Visual Arts", "Mathematics", "Mathematical Literacy", "Technical Mathematics", "Engineering Graphics and Design"],
    auditory:    ["Afrikaans Home Language", "Afrikaans First Additional Language", "English Home Language", "English First Additional Language", "Music", "Dramatic Arts", "Life Orientation"],
    read:        ["English Home Language", "English First Additional Language", "Afrikaans Home Language", "Afrikaans First Additional Language", "History", "Life Sciences", "Business Studies", "Tourism", "Religion Studies"],
    kinesthetic: ["Mathematics", "Physical Sciences", "Information Technology", "Computer Applications Technology", "Accounting", "Electrical Technology", "Mechanical Technology", "Civil Technology", "Agricultural Sciences"],
  };

  /* My subjects */
  const selectedIds: number[] = profile?.selectedSubjects || [];
  const rawSubjects: any[] = selectedIds.length > 0
    ? (subjects || []).filter((s: any) => selectedIds.includes(s.id))
    : (subjects || []).slice(0, 7);

  const mySubjects: any[] = varkPrimary
    ? [...rawSubjects].sort((a: any, b: any) => {
        const priority = VARK_SUBJECT_PRIORITY[varkPrimary] || [];
        const ai = priority.findIndex((p) => a.name?.includes(p) || p.includes(a.name));
        const bi = priority.findIndex((p) => b.name?.includes(p) || p.includes(b.name));
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
    : rawSubjects;

  const studyPref: string = profile?.studyPreference || "evening";
  const slots = STUDY_SLOTS[studyPref] || STUDY_SLOTS.evening;

  /* Hero data — driven by live API. If no schedule is available the hero
     falls back to a "no exam dates yet" state instead of a hardcoded date
     (Task #359 removed the PRELIMS_DATE constant). */
  const heroExam = examWidgets?.nextExam;
  const hasHeroExam = Boolean(heroExam?.examDate);
  const heroName  = heroExam?.subjectName || (isAf ? "Geen eksamendatums nog" : "No exam dates yet");
  const heroPaper = heroExam?.paperNumber ? `P${heroExam.paperNumber}` : "";
  const heroDate  = hasHeroExam ? new Date(heroExam.examDate + "T00:00:00") : null;
  const heroDays  = heroDate ? calcDays(heroDate) : 0;
  const heroUrgency = hasHeroExam ? urgencyBand(heroDays) : "build";
  const heroUrgencyInfo = URGENCY_LABEL[heroUrgency];
  const heroPulse = hasHeroExam && heroDays <= 7;
  /* Subject neon used for the subject name label in the hero */
  const heroSubjectNeon = subjectNeon(heroName, 0);

  /* ── Dynamic week plan ───────────────────────────────────────────────
     Subjects are weighted by:
       • Accuracy        — weaker subjects get more slots
       • Exam proximity  — closer exam = higher priority
       • VARK affinity   — primary-style subjects get a small boost
     Exam days override with that exam's subject. NSC rest dates are
     reserved for catch-up. Saturday is a light slot; Sunday is rest. */
  function buildWeekPlan() {
    if (!mySubjects.length) return [];
    const now = new Date();
    const todayDow = now.getDay();
    const mondayOffset = (todayDow === 0 ? -6 : 1 - todayDow) + weekOffset * 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const progressById = new Map<number, any>(
      progressData.map((p: any) => [p.subjectId, p]),
    );

    // Track next exam date AND paper number per subject name
    const nextExamBySubject = new Map<string, number>();
    const nextExamPaperBySubject = new Map<string, number>();
    for (const e of examSchedule as any[]) {
      const name = e.subjectName || "";
      const d = calcDays(new Date(e.date));
      if (!nextExamBySubject.has(name) || d < (nextExamBySubject.get(name) ?? 9999)) {
        nextExamBySubject.set(name, d);
        nextExamPaperBySubject.set(name, e.paperNumber ?? 1);
      }
    }
    const varkPriority: string[] = VARK_SUBJECT_PRIORITY[varkPrimary || ""] || [];
    const readinessById: Record<number, number> = readinessData?.readiness ?? {};

    // ── Adaptive weighting ────────────────────────────────────────────
    // accuracyWeight:  weaker subject → more slots
    // examWeight:      closer exam → more slots
    // varkWeight:      learning-style match → small boost
    // floorBoost:      readiness < 40% + exam < 30d → critical override (3×)
    //                  readiness < 55% + exam < 14d → urgency boost (2×)
    const weighted = mySubjects.map((s: any) => {
      const prog = progressById.get(s.id);
      const accuracy = typeof prog?.accuracy === "number" ? prog.accuracy : 60;
      const accuracyWeight = Math.max(0.6, (100 - accuracy) / 50);
      const daysToExam = nextExamBySubject.get(s.name) ?? 120;
      const examWeight = daysToExam <= 7 ? 1.9
                       : daysToExam <= 21 ? 1.4
                       : daysToExam <= 60 ? 1.1 : 0.9;
      const varkMatch = varkPriority.some(p => s.name?.includes(p) || p.includes(s.name));
      const varkWeight = varkMatch ? 1.15 : 1.0;
      // Readiness floor gate — critical subjects dominate the plan
      const readiness = typeof readinessById[s.id] === "number" ? readinessById[s.id] : accuracy;
      const floorBoost = readiness < 40 && daysToExam < 30 ? 3.0
                       : readiness < 55 && daysToExam < 14 ? 2.0
                       : 1.0;
      const weakTopic = weakTopicsBySubjectId.get(s.id) ?? null;
      return { subject: s, weight: accuracyWeight * examWeight * varkWeight * floorBoost, weakTopic, readiness, accuracy };
    });

    // Build a weighted pool
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0) || 1;
    const poolSize = Math.max(mySubjects.length * 3, 14);
    const pool: any[] = [];
    const weightedMap = new Map(weighted.map(w => [w.subject.id, w]));
    for (const { subject, weight } of weighted) {
      const reps = Math.max(1, Math.round((weight / totalWeight) * poolSize));
      for (let i = 0; i < reps; i++) pool.push(subject);
    }
    // Light shuffle — prevents back-to-back repeats
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (i * 9301 + 49297) % (i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Urgency power slot — a 3rd block added on weekdays when any enrolled exam is ≤ 7 days away
    const POWER_SLOT = { label: "Power Hour", labelAf: "Kraguur", icon: Rocket, hours: "05:30–06:30" };
    const hasCriticalExamThisWeek = (examSchedule as any[]).some(e => {
      const d = calcDays(new Date(e.date));
      return d <= 7 && d > 0 && mySubjects.some((s: any) => s.name === e.subjectName);
    });

    const plan: Array<{
      day: string; dayAf: string; short: string; shortAf: string;
      slots: Array<{
        subject: any; slot: any; neon: typeof NEON[string];
        reason?: string; reasonAf?: string;
        weakTopic?: any; paperFocus?: string; readiness?: number;
      }>;
      date: Date; dateStr: string;
    }> = [];
    let poolIdx = 0;

    for (let d = 0; d < 7; d++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + d);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${dd}`;

      const isSunday = d === 6;
      const isSaturday = d === 5;
      const isNscRest = NSC_NON_EXAM_DATES.includes(dateStr);

      const daySlots: Array<{
        subject: any; slot: any; neon: typeof NEON[string];
        reason?: string; reasonAf?: string;
        weakTopic?: any; paperFocus?: string; readiness?: number;
      }> = [];

      if (!isSunday && !isNscRest) {
        const dayExams = examSchedule.filter((e: any) => e.date === dateStr);
        // Expand to 3 slots on sprint weekdays
        const baseSlots = isSaturday ? slots.slice(0, 1)
          : hasCriticalExamThisWeek ? [POWER_SLOT, ...slots]
          : slots;

        for (let si = 0; si < baseSlots.length; si++) {
          const slot = baseSlots[si];
          // If there's an exam today, first slot = revision for that exam subject
          if (dayExams.length > 0 && si === 0) {
            const examName = dayExams[0].subjectName;
            const subj = mySubjects.find((s: any) => s.name === examName) || mySubjects[0];
            const neon = subjectNeon(subj.name, 0);
            const wt = weightedMap.get(subj.id);
            daySlots.push({
              subject: subj, slot, neon,
              reason: "Exam today — final revision",
              reasonAf: "Eksamen vandag — finale hersiening",
              weakTopic: wt?.weakTopic ?? null,
              readiness: wt?.readiness,
            });
            continue;
          }
          // Pick next pool subject; avoid same subject back-to-back on same day
          let candidate = pool[poolIdx % pool.length] || mySubjects[0];
          const prevSubjId = daySlots.length > 0 ? daySlots[daySlots.length - 1].subject?.id : null;
          if (prevSubjId != null && candidate?.id === prevSubjId && mySubjects.length > 1) {
            for (let k = 1; k <= pool.length; k++) {
              const c = pool[(poolIdx + k) % pool.length];
              if (c?.id !== prevSubjId) { candidate = c; poolIdx += k; break; }
            }
          }
          const subj = candidate;
          const neon = subjectNeon(subj.name, poolIdx);
          const wt = weightedMap.get(subj.id);
          const accuracy = wt?.accuracy ?? 60;
          const days = nextExamBySubject.get(subj.name) ?? 120;
          const paperNum = nextExamPaperBySubject.get(subj.name);
          const paperFocus = paperNum ? `P${paperNum}` : undefined;
          const weakTopic: any = wt?.weakTopic ?? null;
          // Smart reason: paper focus → exam countdown → weak topic drill → regular
          const reason = days <= 7  ? `${paperFocus ? paperFocus + " · " : ""}Final sprint — ${days}d`
                       : days <= 21 ? `${paperFocus ? paperFocus + " · " : ""}Exam in ${days}d`
                       : accuracy < 55 ? (weakTopic ? `Drill: ${weakTopic.name?.substring(0, 22)}` : "Boost weak area")
                       : "Build mastery";
          const reasonAf = days <= 7  ? `${paperFocus ? paperFocus + " · " : ""}Finale sprint — ${days}d`
                         : days <= 21 ? `${paperFocus ? paperFocus + " · " : ""}Eksamen oor ${days}d`
                         : accuracy < 55 ? (weakTopic ? `Oefen: ${weakTopic.name?.substring(0, 22)}` : "Versterk swak area")
                         : "Bou vaardigheid";
          daySlots.push({ subject: subj, slot, neon, reason, reasonAf, weakTopic, paperFocus, readiness: wt?.readiness });
          poolIdx++;
        }
      }

      plan.push({
        day: DAYS_EN[d], dayAf: DAYS_AF[d],
        short: DAYS_SHORT_EN[d], shortAf: DAYS_SHORT_AF[d],
        slots: daySlots, date, dateStr,
      });
    }
    return plan;
  }

  const weekPlan = buildWeekPlan();

  /* Today's column index in the current week (only valid when weekOffset === 0) */
  const todayDow = new Date().getDay();
  const todayIdx = weekOffset === 0 ? (todayDow === 0 ? 6 : todayDow - 1) : -1;

  /* Helper: exams for a specific date string */
  function examsForDate(dateStr: string) {
    return examSchedule.filter((e: any) => e.date === dateStr);
  }

  /* Studied subject IDs */
  const studiedIds = new Set(
    progressData.filter((p: any) => p.questionsAttempted > 0).map((p: any) => p.subjectId)
  );

  /* This week's exams (sorted by days remaining) */
  const thisWeekExams = examSchedule
    .filter((e: any) => {
      const d = new Date(e.date);
      const p0 = weekPlan[0]?.date;
      const p6 = weekPlan[6]?.date;
      return p0 && p6 && d >= p0 && d <= p6;
    })
    .map((e: any) => {
      const daysLeft = calcDays(new Date(e.date));
      return { ...e, daysLeft, urgency: urgencyBand(daysLeft) };
    })
    .sort((a: any, b: any) => a.daysLeft - b.daysLeft);

  /* Week label for the navigation strip */
  function weekRangeLabel() {
    const d0 = weekPlan[0]?.date;
    const d6 = weekPlan[6]?.date;
    if (!d0 || !d6) return "";
    const fmt = (d: Date) => formatDate(d, language, { day:"numeric", month:"short" });
    return `${fmt(d0)} – ${fmt(d6)}`;
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ color:"#ffffff" }}>
      <SpaceBg />

      {/* ── Sticky neon header ── */}
      <header
        className="sticky top-0 z-50 bg-black/80"
        style={{ borderBottom: "1px solid rgba(110,231,249,0.35)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" style={{ color: "#6EE7F9", filter: "drop-shadow(0 0 4px #6EE7F9)" }} />
              <span className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: "#6EE7F9" }}>
                {isAf ? "Studieplan" : "Study Plan"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-black text-white hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                data-testid="button-language-toggle"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isAf ? "AF" : "EN"}</span>
              </button>
              <Link href="/dashboard">
                <button
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black font-black text-[10px] uppercase tracking-[0.2em]"
                  style={{
                    color: "#6EE7F9",
                    border: "1px solid #6EE7F9",
                    boxShadow: "0 0 10px rgba(110,231,249,0.4)",
                  }}
                  data-testid="button-dashboard"
                >
                  <BookOpen className="w-3 h-3" />
                  {isAf ? "Tuis" : "Home"}
                </button>
              </Link>
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-black text-white hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                data-testid="button-logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Sticky TODAY directive banner — surfaces the timetable engine's #1 priority ── */}
      {todayDirective && todayDirective.hasExam && (() => {
        const urgencyMap: Record<string, { color: string; glow: string }> = {
          final_sprint:     { color: "#FFB7E5", glow: "rgba(255,183,229,0.55)" },
          exam_prep_mode:   { color: "#FFE29A", glow: "rgba(255,226,154,0.55)" },
          focused_revision: { color: "#FFE29A", glow: "rgba(255,226,154,0.55)" },
          build_mastery:    { color: "#C5B3FF", glow: "rgba(197,179,255,0.55)" },
        };
        const u = urgencyMap[todayDirective.urgencyState] || urgencyMap.build_mastery;
        const days = todayDirective.daysUntil ?? 0;
        const subjectLabel = isAf ? todayDirective.subjectNameAf : todayDirective.subjectName;
        return (
          <div
            className="sticky z-40 bg-black/85"
            style={{ top: 56, borderBottom: `1px solid ${u.color}55`, boxShadow: `0 4px 18px ${u.glow}33` }}
            data-testid="sticky-today-directive"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black text-[10px] font-black uppercase tracking-[0.2em] shrink-0"
                  style={{ color: u.color, border: `1px solid ${u.color}`, boxShadow: `0 0 8px ${u.glow}` }}
                >
                  {todayDirective.isExamToday
                    ? (isAf ? "Eksamen Vandag" : "Exam Today")
                    : (isAf ? "Vandag" : "Today")}
                </span>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className="text-sm font-black text-white truncate">
                    {subjectLabel}{todayDirective.paperNumber ? ` · ${isAf ? "V" : "P"}${todayDirective.paperNumber}` : ""}
                  </p>
                  <span className="hidden sm:inline tabular-nums text-[11px] font-bold" style={{ color: u.color, textShadow: `0 0 6px ${u.glow}` }}>
                    {days}{isAf ? (days === 1 ? "d oor" : "d oor") : "d left"}
                  </span>
                  <span className="hidden md:inline text-[11px] truncate" style={{ color:"#ffffff" }}>
                    · {isAf ? todayDirective.messageAf : todayDirective.message}
                  </span>
                </div>
                <Link href={todayDirective.deepLink}>
                  <button
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.16em] bg-black transition-all hover:scale-[1.03]"
                    data-testid="sticky-today-cta"
                    style={{ color: u.color, border: `1.5px solid ${u.color}`, boxShadow: `0 0 10px ${u.glow}` }}
                  >
                    {isAf ? "Studeer Nou" : "Study Now"}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Research-style hero intro (pill badge → gradient title → subtitle) ── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(110,231,249,0.22), transparent 70%)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(197,179,255,0.18), transparent 70%)" }}
          />
          <div className="relative text-center py-10 sm:py-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 bg-black"
              style={{ border: "1.5px solid #6EE7F9", boxShadow: "0 0 14px rgba(110,231,249,0.28)" }}
            >
              <CalendarDays className="w-3.5 h-3.5" style={{ color: "#6EE7F9" }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#6EE7F9" }}>
                {isAf ? "Die Plan" : "The Plan"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4" data-testid="text-study-plan-title">
              {isAf ? (
                <>Jou Matriek <span className="gradient-text">Studieplan</span></>
              ) : (
                <>Your Matric <span className="gradient-text">Study Plan</span></>
              )}
            </h1>
            <p className="text-white max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              {isAf
                ? "Gespasieerde herhaling, vakrotasie en aftelling tot eksamen — 20 minute per dag is al wat jy nodig het."
                : "Spaced repetition, subject rotation and exam countdown — 20 minutes a day is all you need."}
            </p>
          </div>
        </section>

        {/* ── Hero countdown card (cosmic-neon glass) ── */}
        <div
          data-testid="countdown-prelims-plan"
          className="neon-tile relative overflow-hidden p-5 sm:px-[30px] sm:py-7"
          style={{
            borderRadius: 22,
            boxShadow: `0 0 0 1px ${heroUrgencyInfo.color}33, 0 10px 40px rgba(0,0,0,0.55), 0 0 28px ${heroUrgencyInfo.color}22`,
          }}
        >
          {/* Rainbow gradient ribbon at top */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg,#FFE29A,#FFE29A,#FFE29A,#FFE29A,#6EE7F9,#9FD8FF,#C5B3FF,#C5B3FF,#FFB7E5)",
              opacity: 0.95,
            }}
          />
          {/* Soft urgency wash on the right */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: `radial-gradient(ellipse 50% 80% at 100% 50%, ${heroUrgencyInfo.color}1a 0%, transparent 70%)`,
            }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                  background: `linear-gradient(135deg, ${heroUrgencyInfo.color}33, ${heroUrgencyInfo.color}11)`,
                  border: `1px solid ${heroUrgencyInfo.color}66`,
                  boxShadow: `0 0 18px ${heroUrgencyInfo.color}44, inset 0 1px 0 rgba(255,255,255,0.18)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Rocket className="w-6 h-6" style={{ color: heroUrgencyInfo.color, filter: `drop-shadow(0 0 8px ${heroUrgencyInfo.glow})` }} />
              </div>
              <div>
                <p style={{ color:"#ffffff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                  {isAf ? "Volgende Eksamen" : "Next Exam"}
                </p>
                <p
                  className="font-bold"
                  style={{
                    fontSize: 20, lineHeight: 1.2,
                    backgroundImage: "linear-gradient(90deg,#6EE7F9,#C5B3FF,#FFB7E5)",
                    WebkitBackgroundClip: "text", backgroundClip: "text",
                    color: "transparent", WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 10px rgba(168,85,247,0.35))",
                  }}
                >
                  {heroName}
                </p>
                {heroPaper && <p style={{ color:"#ffffff", fontSize: 12, marginTop: 2 }}>{heroPaper}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-center">
                <p
                  className="tabular-nums font-black"
                  style={{
                    fontSize: 56, lineHeight: 1,
                    backgroundImage: "linear-gradient(180deg,#ffffff 0%,#FFE29A 45%,#FFE29A 100%)",
                    WebkitBackgroundClip: "text", backgroundClip: "text",
                    color: "transparent", WebkitTextFillColor: "transparent",
                    filter: `drop-shadow(0 0 18px ${heroUrgencyInfo.glow})`,
                  }}
                >
                  {heroDays}
                </p>
                <p style={{ color:"#ffffff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
                  {isAf ? "dae oor" : "days left"}
                </p>
              </div>
              <div
                style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${heroUrgencyInfo.color}22, rgba(255,255,255,0.04))`,
                  border: `1px solid ${heroUrgencyInfo.color}55`,
                  boxShadow: `0 0 14px ${heroUrgencyInfo.color}22, inset 0 1px 0 rgba(255,255,255,0.12)`,
                  minWidth: 130,
                }}
              >
                <p style={{ color: heroUrgencyInfo.color, fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", textShadow: `0 0 10px ${heroUrgencyInfo.glow}` }}>
                  {isAf ? heroUrgencyInfo.af : heroUrgencyInfo.en}
                </p>
                <p style={{ color:"#ffffff", fontSize: 11, marginTop: 2 }}>
                  {heroDate
                    ? formatDate(heroDate, language, { day: "numeric", month: "short", year: "numeric" })
                    : (isAf ? "Voeg vooreksamendatums by in Instellings" : "Add prelim dates in Settings")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Prelim Timetable CTA ── */}
        <Link href="/prelim-timetable">
          <div
            className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
            style={{
              background: "rgba(110,231,249,0.07)",
              border: "1px solid rgba(110,231,249,0.35)",
              boxShadow: "0 0 16px rgba(110,231,249,0.10)",
            }}
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 shrink-0" style={{ color: "#6EE7F9" }} />
              <div>
                <p className="text-sm font-black" style={{ color: "#6EE7F9" }}>
                  {isAf ? "Vooreksamen Rooster 2026" : "Prelim Timetable 2026"}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {isAf ? "SACAI · Aug–Sep · 4 weke" : "SACAI · Aug–Sep · 4 weeks"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "rgba(110,231,249,0.6)" }} />
          </div>
        </Link>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {([
            { label: isAf ? "Reeks" : "Streak",      value: stats?.studyStreak ?? 0,       icon: Flame,       neon: NEON.orange, testid: "plan-stat-streak"    },
            { label: isAf ? "Gereedheid" : "Readiness", value: `${overallReadiness}%`,     icon: ShieldCheck, neon: NEON.violet, testid: "plan-stat-readiness" },
            { label: isAf ? "Akkuraatheid" : "Accuracy", value:`${stats?.accuracy??0}%`,   icon: Target,      neon: NEON.cyan2,  testid: "plan-stat-accuracy"  },
            { label: isAf ? "Vrae" : "Questions",    value: stats?.questionsAnswered ?? 0,  icon: Zap,         neon: NEON.cyan,   testid: "plan-stat-questions" },
            { label: isAf ? "Vakke" : "Subjects",    value: mySubjects.length,              icon: BookOpen,    neon: NEON.green,  testid: "plan-stat-subjects"  },
          ] as const).map(({ label, value, icon: Icon, neon, testid }) => (
            <GlassCard key={label} className="flex items-center gap-3 p-4">
              <div style={{ width:38,height:38,borderRadius:10,flexShrink:0,background:`${neon.hex}20`,border:`1px solid ${neon.hex}44`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Icon className="w-4 h-4" style={{ color:neon.hex }} />
              </div>
              <div>
                <p style={{ fontSize:"10px", fontWeight:700, color:"#ffffff", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</p>
                <p className="text-xl font-bold tabular-nums" data-testid={testid} style={{ color:neon.text }}>{value}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* ── Readiness Scores section ── */}
        {(() => {
          const entries = Object.entries(readinessData?.readiness ?? {})
            .map(([id, score]) => ({ subjectId: Number(id), score: Number(score) }))
            .filter(e => e.score >= 0)
            .sort((a, b) => a.score - b.score);

          if (entries.length === 0) return null;

          const overallBand = readinessBand(overallReadiness);
          const overallNeon =
            overallBand === "green" ? NEON.cyan2 :
            overallBand === "amber" ? NEON.gold : NEON.pink;

          return (
            <div data-testid="study-calendar-readiness">
              <GlassCard neonColor="#C5B3FF" className="overflow-hidden">
                <div
                  className="px-5 py-4 flex items-center gap-2 flex-wrap"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(197,179,255,0.06)" }}
                >
                  <ShieldCheck className="w-4 h-4" style={{ color: "#C5B3FF", filter: "drop-shadow(0 0 6px rgba(197,179,255,0.65))" }} />
                  <p className="font-bold text-sm" style={{ color:"#ffffff" }}>
                    {isAf ? "Gereedheidstellings" : "Readiness Scores"}
                  </p>
                  <span
                    className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-black"
                    style={{
                      border: `1px solid ${overallNeon.hex}`,
                      boxShadow: `0 0 10px ${overallNeon.glow}`,
                      color: overallNeon.hex,
                    }}
                    data-testid="readiness-overall"
                  >
                    {isAf ? "Algeheel" : "Overall"}
                    <span
                      className="tabular-nums font-black"
                      style={{ fontFamily: '"JetBrains Mono", monospace', textShadow: `0 0 6px ${overallNeon.glow}` }}
                    >
                      {overallReadiness}%
                    </span>
                  </span>
                </div>
                <div className="p-5 space-y-2.5">
                  {entries.map((e, i) => {
                    const subj = (subjects || []).find((s: any) => s.id === e.subjectId);
                    const name = subj ? (isAf ? (subj.nameAfrikaans || subj.name) : subj.name) : (isAf ? "Vak" : "Subject");
                    const neon = subjectNeon(subj?.name || "", i);
                    const band = readinessBand(e.score);
                    const bandHex = band === "green" ? "#6EE7F9" : band === "amber" ? "#FFE29A" : "#FFB7E5";
                    return (
                      <div
                        key={e.subjectId}
                        className="rounded-xl p-3 bg-black"
                        style={{
                          border: `1px solid ${neon.hex}40`,
                          boxShadow: `0 0 10px ${neon.glow}`,
                        }}
                        data-testid={`readiness-row-${e.subjectId}`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: neon.hex, boxShadow: `0 0 8px ${neon.glow}` }}
                            />
                            <span className="text-sm font-bold truncate" style={{ color: neon.text }}>
                              {name}
                            </span>
                            <span
                              className="text-[9px] font-black uppercase tracking-[0.16em] px-1.5 py-0.5 rounded-md shrink-0"
                              style={{
                                color: bandHex,
                                border: `1px solid ${bandHex}66`,
                                background: `${bandHex}14`,
                              }}
                            >
                              {readinessBandLabel(e.score, isAf)}
                            </span>
                          </div>
                          <span
                            className="text-sm font-black tabular-nums shrink-0"
                            style={{
                              color: bandHex,
                              fontFamily: '"JetBrains Mono", monospace',
                              textShadow: `0 0 8px ${bandHex}66`,
                            }}
                          >
                            {e.score}%
                          </span>
                        </div>
                        <div
                          className="relative h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="absolute top-0 left-0 bottom-0 rounded-full transition-[width] duration-700"
                            style={{
                              width: `${Math.max(2, Math.min(100, e.score))}%`,
                              background: `linear-gradient(90deg, ${neon.hex}, ${bandHex})`,
                              boxShadow: `0 0 10px ${neon.glow}, 0 0 14px ${bandHex}66`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          );
        })()}

        {/* ── VARK Adaptive Recommendations ── */}
        {varkInsights && varkInsights.eventCount >= 3 && (
          <div data-testid="vark-calendar-insights">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">
                {varkPrimary === "visual" ? "👁" : varkPrimary === "auditory" ? "🔊" : varkPrimary === "read" ? "📖" : "✏"}
              </span>
              <p className="font-bold text-sm" style={{ color: "#ffffff" }}>
                {isAf ? "Leerstyl Insigte" : "Style Insights"}
              </p>
              {varkInsights.styleEvolving && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(6, 182, 212,0.25)", color: "#a5f3fc", border: "1px solid rgba(6, 182, 212,0.40)" }}
                >
                  {isAf ? "Aan die ontwikkel" : "Evolving"}
                </span>
              )}
            </div>

            {/* Per-style performance bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {(["visual","auditory","read","kinesthetic"] as const).map((style) => {
                const s = varkInsights.stats[style];
                const neonMap: Record<string, typeof NEON[keyof typeof NEON]> = { visual: NEON.blue, auditory: NEON.pink, read: NEON.cyan, kinesthetic: NEON.gold };
                const neon = neonMap[style] || NEON.cyan2;
                const icons: Record<string,string> = { visual:"👁", auditory:"🔊", read:"📖", kinesthetic:"✏" };
                const labels: Record<string,string> = { visual:"Visual", auditory:"Auditory", read:"Read", kinesthetic:"Practice" };
                const labelsAf: Record<string,string> = { visual:"Visueel", auditory:"Ouditief", read:"Lees", kinesthetic:"Oefen" };
                const pct = s?.score ?? 0;
                const isDominant = varkInsights.dominantStyle === style;
                return (
                  <div
                    key={style}
                    style={{
                      borderRadius: 12,
                      padding: "10px 12px",
                      background: isDominant ? `${neon.hex}18` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isDominant ? `${neon.hex}55` : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: isDominant ? neon.text : "rgba(255,255,255,0.50)" }}>
                        {icons[style]} {isAf ? labelsAf[style] : labels[style]}
                      </span>
                      {isDominant && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${neon.hex}30`, color: neon.text }}>
                          {isAf ? "Top" : "Top"}
                        </span>
                      )}
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: neon.hex, transition: "width 0.6s ease" }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span style={{ fontSize: "10px", color:"#ffffff" }}>
                        {s?.count ?? 0} {isAf ? "sess." : "sess."}
                      </span>
                      {s?.avgPerformance != null && (
                        <span style={{ fontSize: "10px", fontWeight: 700, color: isDominant ? neon.text : "rgba(255,255,255,0.40)" }}>
                          {s.avgPerformance}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendation text */}
            {varkInsights.recommendation && (
              <p style={{ fontSize: "12px", color:"#ffffff", lineHeight: 1.5 }}>
                {varkInsights.recommendation}
              </p>
            )}
            {!varkInsights.recommendation && (
              <p style={{ fontSize: "12px", color:"#ffffff", lineHeight: 1.5 }}>
                {isAf
                  ? `Bly aktief om persoonlike leerstyl-aanbevelings te ontsluit.`
                  : `Keep studying to unlock personalised learning style recommendations.`}
              </p>
            )}
          </GlassCard>
          </div>
        )}

        {/* ── Week navigation bar (desktop + mobile) ── */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)", color:"#ffffff" }}
            data-testid="button-prev-week"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{isAf ? "Vorige Week" : "Prev Week"}</span>
          </button>

          <div className="text-center">
            <p className="font-bold text-sm" style={{ color:"#ffffff" }}>
              {weekOffset === 0 ? (isAf ? "Hierdie Week" : "This Week") : weekOffset < 0 ? (isAf ? `${Math.abs(weekOffset)} week(s) gelede` : `${Math.abs(weekOffset)} week(s) ago`) : (isAf ? `Oor ${weekOffset} week(s)` : `${weekOffset} week(s) ahead`)}
            </p>
            <p style={{ color:"#ffffff", fontSize:"12px" }}>{weekRangeLabel()}</p>
          </div>

          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)", color:"#ffffff" }}
            data-testid="button-next-week"
          >
            <span className="hidden sm:inline">{isAf ? "Volgende Week" : "Next Week"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Mobile "This Week" horizontal scrollable strip (above calendar) ── */}
        <div className="md:hidden">
          {thisWeekExams.length > 0 && (
            <div>
              <p style={{ fontSize:"10px", fontWeight:700, color:"#ffffff", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px" }}>
                {isAf ? "Hierdie Week" : "This Week"}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth:"none" }}>
                {thisWeekExams.map((exam: any, i: number) => {
                  const neon = subjectNeon(exam.subjectName || "", i);
                  const urg = URGENCY_LABEL[exam.urgency as UrgencyBand] || URGENCY_LABEL.build;
                  return (
                    <div
                      key={i}
                      className="flex-shrink-0 rounded-xl p-3"
                      style={{ background:`${neon.hex}18`, border:`1px solid ${neon.hex}40`, boxShadow:`0 0 10px ${neon.glow}`, minWidth:"150px", maxWidth:"180px" }}
                      data-testid={`mobile-week-exam-${i}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div style={{ width:8,height:8,borderRadius:"50%",background:neon.hex,boxShadow:`0 0 4px ${neon.glow}`,flexShrink:0 }} />
                        <p style={{ fontSize:"11px", fontWeight:700, color:neon.text }} className="truncate">
                          {isAf && exam.subjectNameAf ? exam.subjectNameAf : exam.subjectName}
                        </p>
                      </div>
                      {exam.paper && <p style={{ fontSize:"9px", color:"#ffffff", marginBottom:"6px" }}>{exam.paper}</p>}
                      <div className="flex items-center justify-between gap-2">
                        <span style={{ display:"inline-block", background:`${urg.color}20`, border:`1px solid ${urg.color}40`, borderRadius:"5px", padding:"1px 5px", fontSize:"9px", fontWeight:700, color:urg.color }}>
                          {isAf ? urg.af : urg.en}
                        </span>
                        <span style={{ fontSize:"18px", fontWeight:900, color:urg.color, lineHeight:1 }}>{exam.daysLeft}<span style={{ fontSize:"9px", fontWeight:600 }}>{isAf?"d":"d"}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===== EXAM DATE OVERLAY (T114) ===== */}
        {examScheduleData?.schedule && examScheduleData.schedule.length > 0 && (() => {
          const upcoming = (examScheduleData.schedule as any[])
            .filter(e => !e.isPast)
            .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);
          const nonExamDays = ["2026-11-03", "2026-11-04", "2026-11-05", "2026-11-09"];
          return (
            <div data-testid="exam-overlay-section">
              <GlassCard neonColor="#C5B3FF" className="overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(197,179,255,0.06)" }}>
                  <GraduationCap className="w-4 h-4" style={{ color:"#C5B3FF", filter:"drop-shadow(0 0 6px rgba(197,179,255,0.65))" }} />
                  <p className="font-bold text-sm" style={{ color:"#ffffff" }}>
                    {isAf ? "NSC Eksamenrooster Oorleg" : "NSC Exam Calendar Overlay"}
                  </p>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(197,179,255,0.18)", color:"#dcb4ee", border:"1px solid rgba(197,179,255,0.45)" }}>
                    2026
                  </span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
                    {upcoming.slice(0, 9).map((exam: any, i: number) => {
                      const urgencyMap: Record<string, { color: string; glow: string }> = {
                        final_sprint:     { color: "#FFB7E5", glow: "rgba(255,183,229,0.50)" },
                        exam_prep_mode:   { color: "#FFE29A", glow: "rgba(255,226,154,0.50)" },
                        focused_revision: { color: "#FFE29A", glow: "rgba(255,226,154,0.50)" },
                        build_mastery:    { color: "#C5B3FF", glow: "rgba(197,179,255,0.50)" },
                      };
                      const u = urgencyMap[exam.urgencyState] || urgencyMap.build_mastery;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background:`${u.color}12`, border:`1px solid ${u.color}40`, boxShadow:`0 0 10px ${u.glow}` }}
                          data-testid={`exam-overlay-item-${i}`}
                        >
                          <div style={{ width:10, height:10, borderRadius:"50%", background:u.color, boxShadow:`0 0 8px ${u.glow}`, flexShrink:0 }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate" style={{ color:"#ffffff" }}>{exam.subjectName}</p>
                            <p className="text-[10px]" style={{ color:"#ffffff" }}>
                              P{exam.paperNumber} · {formatDate(exam.examDate + "T00:00:00", language, { day: "numeric", month: "short" })}
                            </p>
                          </div>
                          <span className="text-[11px] font-black tabular-nums shrink-0" style={{ color:u.color, textShadow:`0 0 8px ${u.glow}` }}>{exam.daysRemaining}d</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-3" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color:"#ffffff", letterSpacing:"0.08em" }}>
                      <Coffee className="w-3 h-3" style={{ color:"#FFE29A" }} />
                      {isAf ? "Nie-eksamen Dae (inhaal & beplanning)" : "Non-Examination Days (catch-up & planning)"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {nonExamDays.map(d => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                          style={{ background:"rgba(255,226,154,0.10)", border:"1px solid rgba(255,226,154,0.40)", color:"#ffe98a", boxShadow:"0 0 8px rgba(255,226,154,0.18)" }}
                        >
                          <Coffee className="w-2.5 h-2.5" />
                          {formatDate(d + "T00:00:00", language, { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })()}

        {/* ── Day nav pills (all breakpoints) ── */}
        <div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth:"none" }}>
            {weekPlan.length === 0 ? (
              subjectsLoading
                ? [0,1,2,3,4,5,6].map(i => (
                    <div key={i} className="flex-shrink-0 w-14 h-10 rounded-xl animate-pulse" style={{ background:"rgba(110,231,249,0.08)", border:"1px solid rgba(110,231,249,0.15)" }} />
                  ))
                : (
                  <div className="flex items-center gap-2 px-1 py-2 text-[11px] font-bold rounded-xl bg-black" style={{ color:"#ffffff", border:"1px solid rgba(255,255,255,0.1)", padding:"6px 14px" }}>
                    <Settings className="w-3 h-3" />
                    {isAf ? "Geen vakke gekies nie — stel op in Instellings" : "No subjects selected — set up in Settings"}
                  </div>
                )
            ) : weekPlan.map((day, idx) => {
              const isToday = idx === todayIdx;
              const isActive = idx === mobileDay;
              return (
                <button
                  key={day.day}
                  onClick={() => setMobileDay(idx)}
                  className="flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all bg-black"
                  style={isActive
                    ? { border:"1.5px solid #6EE7F9", boxShadow:"0 0 14px rgba(110,231,249,0.45), inset 0 0 10px rgba(110,231,249,0.12)" }
                    : { border:"1px solid rgba(255,255,255,0.10)" }}
                  data-testid={`mobile-day-tab-${idx}`}
                >
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{ fontSize:"10px", fontWeight:800, color:isActive?"#6EE7F9":"rgba(255,255,255,0.55)", textShadow: isActive ? "0 0 6px #6EE7F9" : undefined }}
                  >
                    {isAf ? day.shortAf : day.short}
                  </span>
                  {isToday && (
                    <span style={{ width:5, height:5, borderRadius:"50%", background:"#6EE7F9", marginTop:3, display:"block", boxShadow:"0 0 6px #6EE7F9" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main content area (grid + sidebar) ── */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 min-w-0">

          {/* Desktop 7-column week grid (hidden — using per-day view on all breakpoints) */}
          <div className="min-w-0 overflow-hidden">
            <div className="hidden grid-cols-7 gap-2" data-testid="week-grid">
              {weekPlan.map((day, idx) => {
                const isToday = idx === todayIdx;
                const isRestDay = idx === 6;
                const dayExams = examsForDate(day.dateStr);
                const isNonExam = NSC_NON_EXAM_DATES.includes(day.dateStr);

                return (
                  <div
                    key={day.day}
                    className="flex flex-col transition-all"
                    style={{
                      background: isToday ? "rgba(110,231,249,0.08)" : "#0a0b12",
                      border: isToday ? "1.5px solid rgba(110,231,249,0.55)" : "1px solid rgba(255,255,255,0.12)",
                      borderRadius:"14px",
                      boxShadow: isToday ? "0 0 18px rgba(110,231,249,0.25), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
                      padding:"10px 8px", minHeight:"180px",
                    }}
                    data-testid={`day-col-${idx}`}
                  >
                    {/* Day header */}
                    <div className="mb-2 text-center">
                      <p style={{ fontSize:"10px", fontWeight:700, color:isToday?"#6EE7F9":"#ffffff", letterSpacing:"0.06em" }}>
                        {isAf ? day.shortAf : day.short}
                      </p>
                      <p style={{ fontSize:"13px", fontWeight:700, color:"#ffffff" }}>
                        {day.date.getDate()}
                      </p>
                      {isToday && (
                        <div style={{ display:"inline-block", marginTop:"3px", background:"rgba(6, 182, 212,0.35)", border:"1px solid rgba(6, 182, 212,0.60)", borderRadius:"6px", padding:"1px 6px", fontSize:"8px", fontWeight:700, color:"#a5f3fc" }}>
                          {isAf ? "Vandag" : "Today"}
                        </div>
                      )}
                    </div>

                    {/* Official NSC exam chips */}
                    {dayExams.map((exam: any, ei: number) => {
                      const neon = subjectNeon(exam.subjectName || "", ei);
                      return <ExamChip key={ei} name={isAf && exam.subjectNameAf ? exam.subjectNameAf : exam.subjectName} paper={exam.paper} neon={neon} />;
                    })}

                    {/* Non-exam rest day chip */}
                    {isNonExam && <RestChip isAf={isAf} />}

                    {/* Study slots */}
                    {!isRestDay && day.slots.map((entry, si) => {
                      const SlotIcon = entry.slot.icon;
                      const studied = studiedIds.has(entry.subject?.id);
                      return (
                        <Link key={si} href={`/subject/${entry.subject.id}`}>
                          <div
                            className="mb-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                            style={{ background:`${entry.neon.hex}15`, border:`1px solid ${entry.neon.hex}35`, borderRadius:"8px", padding:"5px 7px", opacity:studied?0.6:1 }}
                            data-testid={`slot-${idx}-${si}`}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <SlotIcon className="w-2.5 h-2.5" style={{ color:entry.neon.hex }} />
                              <span style={{ fontSize:"8px", fontWeight:700, color:entry.neon.text, opacity:0.75 }}>{entry.slot.hours}</span>
                            </div>
                            <p style={{ fontSize:"10px", fontWeight:700, color:entry.neon.text, lineHeight:1.2 }} className="truncate">
                              {getSubjectIcon(entry.subject.name)} {isAf && entry.subject.nameAfrikaans ? entry.subject.nameAfrikaans : entry.subject.name}
                            </p>
                          </div>
                        </Link>
                      );
                    })}

                    {/* Sunday rest */}
                    {isRestDay && (
                      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"10px", background:"rgba(6, 182, 212,0.06)", border:"1px dashed rgba(6, 182, 212,0.20)", padding:"8px", textAlign:"center" }}>
                        <div>
                          <Moon className="w-5 h-5 mx-auto mb-1" style={{ color:"rgba(186, 230, 253,0.50)" }} />
                          <p style={{ fontSize:"9px", fontWeight:600, color:"rgba(186, 230, 253,0.50)" }}>{isAf ? "Rusdag" : "Rest Day"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Per-day view (all breakpoints) */}
            <div data-testid="mobile-day-view">
              {weekPlan.length === 0 && subjectsLoading ? (
                <div className="space-y-3" data-testid="day-view-skeleton">
                  <div className="h-6 w-32 rounded-lg animate-pulse" style={{ background:"rgba(110,231,249,0.08)" }} />
                  {[0,1,2].map(i => (
                    <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background:"rgba(110,231,249,0.06)", border:"1px solid rgba(110,231,249,0.12)" }} />
                  ))}
                </div>
              ) : weekPlan.length === 0 ? (
                <div className="rounded-2xl bg-black p-8 text-center" style={{ border:"1px solid rgba(255,255,255,0.1)" }} data-testid="day-view-empty">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3" style={{ color:"rgba(110,231,249,0.4)" }} />
                  <p className="font-bold text-sm text-white mb-1">{isAf ? "Geen studieplan beskikbaar nie" : "No study plan available"}</p>
                  <p className="text-[11px] text-white mb-4">{isAf ? "Kies jou vakke om jou plan te genereer." : "Select your subjects to generate your plan."}</p>
                  <Link href="/settings">
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.16em] bg-black" style={{ color:"#6EE7F9", border:"1.5px solid #6EE7F9", boxShadow:"0 0 12px rgba(110,231,249,0.35)" }}>
                      <Settings className="w-3 h-3" />
                      {isAf ? "Kies Vakke" : "Select Subjects"}
                    </button>
                  </Link>
                </div>
              ) : weekPlan[mobileDay] && (() => {
                const day = weekPlan[mobileDay];
                const isToday = mobileDay === todayIdx;
                const isRestDay = mobileDay === 6;
                const dayExams = examsForDate(day.dateStr);
                const isNonExam = NSC_NON_EXAM_DATES.includes(day.dateStr);

                return (
                  <GlassCard neonColor={isToday ? "#6EE7F9" : undefined} className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg" style={{ color:"#ffffff" }}>
                          {isAf ? day.dayAf : day.day}
                        </p>
                        <p style={{ color:"#ffffff", fontSize:"13px" }}>
                          {formatDate(day.date, language, { day:"numeric", month:"long" })}
                        </p>
                      </div>
                      {isToday && (
                        <span style={{ background:"rgba(6, 182, 212,0.30)", border:"1px solid rgba(6, 182, 212,0.60)", borderRadius:"8px", padding:"3px 10px", fontSize:"11px", fontWeight:700, color:"#a5f3fc" }}>
                          {isAf ? "Vandag" : "Today"}
                        </span>
                      )}
                    </div>

                    {dayExams.map((exam: any, ei: number) => {
                      const neon = subjectNeon(exam.subjectName || "", ei);
                      return <ExamChip key={ei} name={isAf && exam.subjectNameAf ? exam.subjectNameAf : exam.subjectName} paper={exam.paper} neon={neon} />;
                    })}
                    {isNonExam && <RestChip isAf={isAf} />}

                    {isRestDay ? (
                      <div className="text-center py-8">
                        <Moon className="w-10 h-10 mx-auto mb-2" style={{ color:"rgba(186, 230, 253,0.40)" }} />
                        <p className="font-semibold" style={{ color:"#ffffff" }}>
                          {isAf ? "Rusdag — geen druk!" : "Rest day — you've earned it."}
                        </p>
                      </div>
                    ) : day.slots.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2" style={{ color:"rgba(34,197,94,0.45)" }} />
                        <p className="font-semibold" style={{ color:"#ffffff" }}>
                          {isAf ? "NSC pouse — gebruik vir inhaalwerk." : "NSC break — use for catch-up."}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* ── Day theme banner ── */}
                        {(() => {
                          const hasExamToday = dayExams.length > 0;
                          const load = day.slots.length;
                          const theme = hasExamToday
                            ? { label: isAf ? "Eksamendag — Hersiening" : "Exam day — Revision focus", hex: "#FFE29A", emoji: "🎯" }
                            : load >= 3
                            ? { label: isAf ? "Hoë intensiteit" : "High-intensity block", hex: "#FFB7E5", emoji: "⚡" }
                            : load === 2
                            ? { label: isAf ? "Gebalanseerde dag" : "Balanced day", hex: "#6EE7F9", emoji: "⚖" }
                            : { label: isAf ? "Ligte dag" : "Light day", hex: "#C5B3FF", emoji: "🌙" };
                          const totalMinutes = day.slots.reduce((sum, s: any) => {
                            const m = (s.slot.hours || "").match(/(\d+(?:\.\d+)?)\s*h/i);
                            return sum + (m ? parseFloat(m[1]) * 60 : 60);
                          }, 0);
                          const hrs = Math.floor(totalMinutes / 60);
                          const mins = Math.round(totalMinutes % 60);
                          return (
                            <div
                              className="mb-4 flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl"
                              style={{ background: `${theme.hex}10`, border: `1px solid ${theme.hex}35` }}
                              data-testid={`day-theme-${mobileDay}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{theme.emoji}</span>
                                <span className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: theme.hex }}>
                                  {theme.label}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                {isAf ? "Totaal" : "Total"}&nbsp;·&nbsp;
                                <span className="text-white">
                                  {hrs > 0 ? `${hrs}h` : ""}{mins > 0 ? ` ${mins}m` : ""}
                                </span>
                                &nbsp;·&nbsp;{day.slots.length}&nbsp;{isAf ? "blokke" : "blocks"}
                              </span>
                            </div>
                          );
                        })()}

                        {/* ── Per-slot expanded cards ── */}
                        <div className="space-y-3">
                          {day.slots.map((entry, si) => {
                            const SlotIcon = entry.slot.icon;
                            const studied = studiedIds.has(entry.subject?.id);
                            const subjId = entry.subject?.id;
                            return (
                              <div
                                key={si}
                                className="rounded-2xl overflow-hidden relative"
                                style={{
                                  background: `${entry.neon.hex}10`,
                                  border: `1px solid ${entry.neon.hex}40`,
                                  boxShadow: `0 0 14px ${entry.neon.glow}`,
                                  opacity: studied ? 0.72 : 1,
                                }}
                                data-testid={`slot-mobile-${mobileDay}-${si}`}
                              >
                                {/* Readiness band strip — left edge */}
                                {(() => {
                                  const r = entry.readiness;
                                  const bandColor = r == null ? "#6EE7F9" : r < 40 ? "#FFB7E5" : r < 65 ? "#FFE29A" : "#6EE7F9";
                                  return <div aria-hidden style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:bandColor, boxShadow:`0 0 6px ${bandColor}88`, borderRadius:"3px 0 0 3px" }} />;
                                })()}

                                {/* Header */}
                                <div className="flex items-center gap-3 p-3 pl-4">
                                  <div style={{ width:42,height:42,borderRadius:12,flexShrink:0,background:`${entry.neon.hex}22`,border:`1px solid ${entry.neon.hex}55`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                                    <SlotIcon className="w-4 h-4" style={{ color:entry.neon.hex }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate" style={{ color:entry.neon.text, fontSize:"14px" }}>
                                      {getSubjectIcon(entry.subject.name)} {isAf && entry.subject.nameAfrikaans ? entry.subject.nameAfrikaans : entry.subject.name}
                                      {(entry as any).paperFocus && (
                                        <span className="ml-1.5 text-[10px] font-black px-1.5 py-[1px] rounded-md" style={{ background:`${entry.neon.hex}28`, color:entry.neon.hex, border:`1px solid ${entry.neon.hex}55` }}>
                                          {(entry as any).paperFocus}
                                        </span>
                                      )}
                                    </p>
                                    <p style={{ color:"#ffffff", fontSize:"11px" }}>
                                      {isAf ? entry.slot.labelAf : entry.slot.label}&nbsp;·&nbsp;{entry.slot.hours}
                                    </p>
                                    {/* Weak topic drill target */}
                                    {(entry as any).weakTopic && (
                                      <p
                                        className="truncate mt-0.5"
                                        style={{ fontSize:"10px", color:"#FFE29A", opacity:0.85 }}
                                        data-testid={`slot-weak-topic-${mobileDay}-${si}`}
                                      >
                                        ⚑ {isAf ? "Fokus" : "Focus"}: {(entry as any).weakTopic.name}
                                      </p>
                                    )}
                                  </div>
                                  {entry.reason && (
                                    <span
                                      className="flex-shrink-0 rounded-full px-2 py-[2px]"
                                      style={{
                                        fontSize: "9px",
                                        fontWeight: 800,
                                        letterSpacing: "0.04em",
                                        color: entry.neon.hex,
                                        background: `${entry.neon.hex}18`,
                                        border: `1px solid ${entry.neon.hex}40`,
                                      }}
                                      data-testid={`slot-reason-${mobileDay}-${si}`}
                                    >
                                      {isAf ? entry.reasonAf : entry.reason}
                                    </span>
                                  )}
                                </div>

                                {/* Action row — Practice deeplinks to weak topic when available */}
                                <div
                                  className="grid grid-cols-3 gap-px"
                                  style={{ background: `${entry.neon.hex}25`, borderTop: `1px solid ${entry.neon.hex}30` }}
                                >
                                  <Link href={(entry as any).weakTopic ? `/subject/${subjId}?topicId=${(entry as any).weakTopic.topicId ?? (entry as any).weakTopic.id}#boost-quiz-section` : `/subject/${subjId}`}>
                                    <button
                                      className="w-full bg-black/80 hover:bg-black transition-all py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-1.5"
                                      style={{ color: entry.neon.hex }}
                                      data-testid={`slot-action-practice-${mobileDay}-${si}`}
                                    >
                                      📝 {isAf ? "Oefen" : "Practice"}
                                    </button>
                                  </Link>
                                  <Link href={`/flashcards?subjectId=${subjId}`}>
                                    <button
                                      className="w-full bg-black/80 hover:bg-black transition-all py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-1.5"
                                      style={{ color: entry.neon.hex }}
                                      data-testid={`slot-action-flashcards-${mobileDay}-${si}`}
                                    >
                                      🧠 {isAf ? "Kaarte" : "Flashcards"}
                                    </button>
                                  </Link>
                                  <Link href={`/subject/${subjId}?mode=quiz`}>
                                    <button
                                      className="w-full bg-black/80 hover:bg-black transition-all py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-1.5"
                                      style={{ color: entry.neon.hex }}
                                      data-testid={`slot-action-quiz-${mobileDay}-${si}`}
                                    >
                                      ⚡ {isAf ? "Vinnige toets" : "Quick quiz"}
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </GlassCard>
                );
              })()}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4 min-w-0 lg:sticky lg:top-[112px] lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">

            {/* This Week urgency panel */}
            <GlassCard className="overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" style={{ color:"#FFE29A" }} />
                  <p className="font-bold text-sm" style={{ color:"#ffffff" }}>
                    {weekOffset === 0 ? (isAf ? "Hierdie Week" : "This Week") : (isAf ? "Eksamens" : "Exams")}
                  </p>
                </div>
              </div>
              <div className="p-4">
                {thisWeekExams.length === 0 ? (
                  <div className="py-4 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color:"rgba(34,197,94,0.50)" }} />
                    <p style={{ color:"#ffffff", fontSize:"12px" }}>
                      {isAf ? "Geen eksamens hierdie week nie." : "No exams scheduled this week."}
                    </p>
                    <p style={{ color:"#ffffff", fontSize:"11px", marginTop:"4px" }}>
                      {isAf ? "Hou aan bou!" : "Keep building momentum!"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {thisWeekExams.map((exam: any, i: number) => {
                      const neon = subjectNeon(exam.subjectName || "", i);
                      const urg = URGENCY_LABEL[exam.urgency as UrgencyBand] || URGENCY_LABEL.build;
                      return (
                        <div key={i} className="p-2.5 rounded-xl" style={{ background:`${neon.hex}12`, border:`1px solid ${neon.hex}30` }}>
                          <div className="flex items-start gap-2.5">
                            <div style={{ width:10,height:10,borderRadius:"50%",background:neon.hex,boxShadow:`0 0 6px ${neon.glow}`,flexShrink:0,marginTop:2 }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate" style={{ fontSize:"11px", color:neon.text }}>{isAf && exam.subjectNameAf ? exam.subjectNameAf : exam.subjectName}</p>
                              {exam.paper && <p style={{ fontSize:"9px", color:"#ffffff" }}>{exam.paper}</p>}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-black tabular-nums" style={{ fontSize:"16px", color:urg.color, textShadow:`0 0 8px ${urg.glow}` }}>{exam.daysLeft}</p>
                              <p style={{ fontSize:"8px", color:"#ffffff", fontWeight:700 }}>{isAf ? "dae" : "days"}</p>
                            </div>
                          </div>
                          {/* Urgency state label */}
                          <div className="mt-1.5 ml-5">
                            <span style={{ display:"inline-block", background:`${urg.color}20`, border:`1px solid ${urg.color}40`, borderRadius:"5px", padding:"1px 6px", fontSize:"9px", fontWeight:700, color:urg.color }}>
                              {isAf ? urg.af : urg.en}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Subject list */}
            <GlassCard className="overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" style={{ color:"#93c5fd" }} />
                  <p className="font-bold text-sm" style={{ color:"#ffffff" }}>
                    {isAf ? "Jou Vakke" : "Your Subjects"}
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {mySubjects.length === 0 ? (
                  <div className="text-center py-4">
                    <p style={{ color:"#ffffff", fontSize:"12px" }}>
                      {isAf ? "Kies jou vakke in Instellings." : "Select subjects in Settings."}
                    </p>
                    <Link href="/settings">
                      <button className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background:"rgba(6, 182, 212,0.30)", border:"1px solid rgba(6, 182, 212,0.50)", color:"#a5f3fc" }} data-testid="button-select-subjects-plan">
                        {isAf ? "Kies Vakke" : "Select Subjects"}
                      </button>
                    </Link>
                  </div>
                ) : (
                  mySubjects.map((s: any, i: number) => {
                    const neon = subjectNeon(s.name, i);
                    return (
                      <Link key={s.id} href={`/subject/${s.id}`}>
                        <div
                          className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                          style={{ background:`${neon.hex}12`, border:`1px solid ${neon.hex}30` }}
                          data-testid={`subject-pill-${s.id}`}
                        >
                          <div style={{ width:22,height:22,borderRadius:6,flexShrink:0,background:`${neon.hex}30`,border:`1px solid ${neon.hex}55`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                            <span style={{ fontSize:"10px", fontWeight:800, color:neon.text }}>
                              {(isAf ? s.nameAfrikaans || s.name : s.name).charAt(0)}
                            </span>
                          </div>
                          <span style={{ fontSize:"12px", fontWeight:600, color:neon.text, flex:1 }} className="truncate">
                            {isAf ? s.nameAfrikaans || s.name : s.name}
                          </span>
                          <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color:neon.hex, opacity:0.6 }} />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </GlassCard>

            {/* Study times */}
            <GlassCard className="overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color:"#67e8f9" }} />
                  <p className="font-bold text-sm" style={{ color:"#ffffff" }}>
                    {isAf ? "Studietye" : "Study Times"}
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {slots.map((slot, i) => {
                  const SlotIcon = slot.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <SlotIcon className="w-4 h-4 flex-shrink-0" style={{ color:"#ffffff" }} />
                      <div>
                        <p style={{ fontSize:"12px", fontWeight:600, color:"#ffffff" }}>{isAf ? slot.labelAf : slot.label}</p>
                        <p style={{ fontSize:"10px", color:"#ffffff" }}>{slot.hours}</p>
                      </div>
                    </div>
                  );
                })}
                <p style={{ fontSize:"10px", color:"#ffffff", paddingTop:"4px" }}>
                  {isAf ? "Pas dit aan by Instellings → Profiel." : "Adjust in Settings → Profile."}
                </p>
              </div>
            </GlassCard>

            {/* Weekly goals CTA */}
            <div style={{ borderRadius:"16px", padding:"20px", background:"linear-gradient(135deg, rgba(6, 182, 212,0.20) 0%, rgba(59,130,246,0.15) 100%)", border:"1px solid rgba(6, 182, 212,0.35)", boxShadow:"0 0 20px rgba(6, 182, 212,0.15)" }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" style={{ color:"#a5f3fc" }} />
                <p className="font-bold text-sm" style={{ color:"#ffffff" }}>
                  {isAf ? "Hierdie week se doel" : "This week's target"}
                </p>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  isAf ? "Voltooi 5 oefensessies" : "Complete 5 practice sessions",
                  isAf ? "Handhaaf 70%+ akkuraatheid" : "Maintain 70%+ accuracy",
                  isAf ? "Hou jou reeks lewend" : "Keep your streak alive",
                ].map((goal, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Circle className="w-3 h-3 flex-shrink-0" style={{ color:"rgba(186, 230, 253,0.45)" }} />
                    <span style={{ fontSize:"12px", color:"#ffffff", fontWeight:500 }}>{goal}</span>
                  </div>
                ))}
              </div>
              <Link href="/exam-mode">
                <button
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                  style={{ background:"rgba(6, 182, 212,0.40)", border:"1px solid rgba(6, 182, 212,0.60)", color:"#e9d5ff", boxShadow:"0 0 12px rgba(6, 182, 212,0.25)" }}
                  data-testid="button-start-session-plan"
                >
                  {isAf ? "Begin 'n Sessie" : "Start a Session"}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="pt-6 space-y-3" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }} data-testid="study-plan-footer">
          <div className="flex items-center justify-center gap-4" style={{ fontSize:"12px", color:"#ffffff" }}>
            <Link href="/privacy-policy" className="text-white hover:text-white transition-colors">
              {isAf ? "Privaatheidsbeleid" : "Privacy Policy"}
            </Link>
            <span>·</span>
            <Link href="/terms-of-service" className="text-white hover:text-white transition-colors">
              {isAf ? "Diensvoorwaardes" : "Terms of Service"}
            </Link>
            <span>·</span>
            <span>© {new Date().getFullYear()} BrainTrack</span>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.40), 0 0 40px rgba(239,68,68,0.15); }
          50%       { box-shadow: 0 0 35px rgba(239,68,68,0.70), 0 0 70px rgba(239,68,68,0.30); }
        }
      `}</style>
    </div>
  );
}
