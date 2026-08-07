import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  ChevronRight,
  Flame,
  Lightbulb,
  LogOut,
  Sparkles,
  Shield,
  GraduationCap,
  Settings,
  Award,
  Star,
  Zap,
  Trophy,
  Rocket,
  CalendarDays,
  Languages,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  Timer,
  RefreshCcw,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { LEARNING_STYLE_INFO, type LearningStyle } from "@/lib/constants";
import rizzAvatar from "@/assets/handoff/rizz-avatar.png";
import { RizzHeaderButton } from "@/components/rizz-support-bot";
import btIcon from "@/assets/handoff/icon-transparent.png";
import { RescuePackAlert } from "@/components/performance-packs";
import { LearnerStudyPlan } from "@/components/learner-study-plan";
import { useLanguage } from "@/lib/language-context";
import { formatDate, formatNumber } from "@/lib/formatters";
import { calcReadiness } from "@/lib/readiness";
import { useVark } from "@/hooks/use-vark";
import { BadgePopup } from "@/components/badge-popup";
import { NotificationsPanel } from "@/components/notifications-panel";
import { NextMilestoneWidget } from "@/components/next-milestone-widget";
import { GoalProgress } from "@/components/goal-progress";
import { YouVsYouChart } from "@/components/you-vs-you-chart";
import { PersonalBestsWidget } from "@/components/personal-bests-widget";
import { useEarliestPrelimDate, FINALS_DATE } from "@/components/exam-countdown";
import { ReferralShareCard } from "@/components/referral-share-card";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { Button } from "@/components/ui/button";

const BADGE_INFO: Record<string, { name: string; nameAfrikaans: string; icon: any; color: string }> = {
  streak_3:      { name: "3-Day Streak",    nameAfrikaans: "3-Dag Reeks",    icon: Flame,        color: "text-orange-500" },
  streak_7:      { name: "7-Day Streak",    nameAfrikaans: "7-Dag Reeks",    icon: Flame,        color: "text-orange-500" },
  streak_14:     { name: "14-Day Streak",   nameAfrikaans: "14-Dag Reeks",   icon: Flame,        color: "text-red-500"    },
  streak_30:     { name: "30-Day Streak",   nameAfrikaans: "30-Dag Reeks",   icon: Flame,        color: "text-red-600"    },
  questions_10:  { name: "10 Questions",    nameAfrikaans: "10 Vrae",        icon: Star,         color: "text-amber-500"  },
  questions_50:  { name: "50 Questions",    nameAfrikaans: "50 Vrae",        icon: Star,         color: "text-yellow-500" },
  questions_100: { name: "100 Questions",   nameAfrikaans: "100 Vrae",       icon: Zap,          color: "text-blue-500"   },
  questions_500: { name: "500 Questions",   nameAfrikaans: "500 Vrae",       icon: Zap,          color: "text-blue-600"   },
  subject_mastery:{ name: "Subject Master", nameAfrikaans: "Vak Meester",    icon: GraduationCap,color: "text-cyan-500" },
  exam_complete: { name: "Exam Ready",      nameAfrikaans: "Eksamen Gereed", icon: Award,        color: "text-emerald-500"},
  first_paper:   { name: "First Paper",     nameAfrikaans: "Eerste Vraestel",icon: BookOpen,     color: "text-cyan-500"   },
};

const NAV_LINKS = (labels: { navHome: string; navSubjects: string; navTutor: string; navFlashcards: string; navProgress: string; navStudyPlan: string; navRewards: string; navStore: string; navJourney: string; navSettings: string }) => [
  { href: "/dashboard",      icon: BookOpen,    label: labels.navHome         },
  // Subjects has no sidebar tab (owner call): the dashboard's "Your Subjects"
  // section links each subject card directly and /subjects stays routable.
  // Rizz, the AI tutor. Was reachable only from a dashboard card, so learners
  // had no way to find it from the sidebar.
  { href: "/tutor",          icon: Brain,       label: labels.navTutor        },
  { href: "/flashcards",     icon: Layers,      label: labels.navFlashcards   },
  { href: "/progress",       icon: TrendingUp,  label: labels.navProgress     },
  { href: "/rewards",        icon: Trophy,      label: labels.navRewards      },
  { href: "/store",          icon: Sparkles,    label: labels.navStore        },
  { href: "/journey",        icon: Rocket,      label: labels.navJourney      },
  { href: "/settings",       icon: Settings,    label: labels.navSettings     },
];

/* ── Live count-up hook: smoothly animates number changes. ────────── */
function useCountUp(target: number, duration = 900) {
  const [display, setDisplay] = useState<number>(target);
  const fromRef = useRef<number>(target);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    if (from === to) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const v = from + (to - from) * eased;
      setDisplay(v);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);
  return display;
}

/* Live neon counter: pulses briefly when value changes. */
function LiveCounter({
  value, suffix = "", decimals = 0, className, style, testid,
}: {
  value: number; suffix?: string; decimals?: number;
  className?: string; style?: React.CSSProperties; testid?: string;
}) {
  const { language } = useLanguage();
  const animated = useCountUp(value);
  const [pulse, setPulse] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setPulse(true);
      const id = setTimeout(() => setPulse(false), 700);
      prev.current = value;
      return () => clearTimeout(id);
    }
  }, [value]);
  const rounded = decimals > 0 ? animated.toFixed(decimals) : formatNumber(Math.round(animated), language);
  return (
    <span
      className={`tabular-nums transition-transform duration-200 ${className ?? ""}`}
      style={{ transform: pulse ? "scale(1.08)" : "scale(1)", ...style }}
      data-testid={testid}
    >
      {rounded}{suffix}
    </span>
  );
}

/* ── Luxury Street Graffiti pastel cycle ─────────────────────────── */
const PASTELS = ["#9FF5E8", "#FFB7E5", "#C5B3FF", "#FFE29A", "#9FD8FF", "#94F7C5"];

const CHIP_ACCENTS = [
  { hex: "#9FF5E8", tint: "rgba(159,245,232,.12)" },
  { hex: "#FFB7E5", tint: "rgba(255,183,229,.12)" },
  { hex: "#C5B3FF", tint: "rgba(197,179,255,.12)" },
  { hex: "#FFE29A", tint: "rgba(255,226,154,.12)" },
];

/* Live [Nd][Nh][Nm][Ns] countdown chips — isolated 1 s tick so only this
   small subtree re-renders (same pattern as CountdownDigits, Task #819). */
function LiveCountdownChips({
  target,
  tinted = false,
  size = 18,
}: {
  target: Date;
  tinted?: boolean;
  size?: number;
}) {
  const calcParts = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [cd, setCd] = useState(calcParts);
  useEffect(() => {
    setCd(calcParts());
    const id = setInterval(() => setCd(calcParts()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.getTime()]);
  const parts = [
    { v: cd.d, u: "d" },
    { v: cd.h, u: "h" },
    { v: cd.m, u: "m" },
    { v: cd.s, u: "s" },
  ];
  return (
    <div style={{ display: "flex", gap: 8, fontWeight: 900, fontSize: size }}>
      {parts.map((p, i) => (
        <span
          key={p.u}
          className="tabular-nums"
          style={{
            background: tinted ? CHIP_ACCENTS[i].tint : "rgba(5,5,8,.5)",
            border: `1px solid ${CHIP_ACCENTS[i].hex}`,
            color: CHIP_ACCENTS[i].hex,
            borderRadius: 8,
            padding: "6px 10px",
          }}
        >
          {p.v}
          {p.u}
        </span>
      ))}
    </div>
  );
}


const T = {
  en: {
    signOut: "Sign Out",
    statusLabel: "Status",
    yourStatus: "Your Status",
    readinessLabel: "READINESS",
    prelimsLabel: "Prelims",
    finalsLabel: "Finals",
    dayLabel: "day",
    daysLabel: "days",
    viewDetails: "View Details",
    studyStreak: "Study Streak",
    streakDays: "days",
    accuracy: "Accuracy",
    questionsAnswered: "Questions Answered",
    papersCompleted: "Papers Completed",
    continueStudying: "Continue Studying",
    startStudying: "Start Studying",
    quickActions: "Quick Actions",
    smartTutor: "Smart Tutor",
    examMode: "Exam Mode",
    subjects: "Subjects",
    flashcards: "Flashcards",
    rewards: "Rewards",
    store: "Store",
    schedule: "Schedule",
    dailyChallenge: "Daily Challenge",
    noSubjects: "No subjects selected",
    noSubjectsDesc: "Go to Settings to choose the subjects you're writing this year.",
    goToSettings: "Go to Settings",
    recentActivity: "Recent Activity",
    noActivityYet: "No activity yet",
    startPracticing: "Start practising to see your progress here.",
    subjectsHeading: "Your Subjects",
    masteryLabel: "Mastery",
    focusAreasHeading: "Focus Areas",
    focusAreasSubtitle: "Topics across all your subjects that need the most attention.",
    focusAreasEmpty: "You're on top of every topic. Keep practising to stay sharp!",
    focusBandCatchUp: "Catch Up",
    focusBandBuilding: "Building",
    practiceNow: "Practice Now",
    upcomingExams: "Upcoming Exams",
    noUpcomingExams: "No upcoming exams scheduled",
    addPrelimDates: "Add your prelim dates in Settings.",
    liveSession: "Live session",
    calendarLabel: "Calendar",
    nextExam: "Next Exam",
    thisWeek: "This Week",
    subjectPriority: "Subject Priority Queue",
    fullPlan: "Full plan",
    daysAbbr: "days",
    daysShort: "d",
    paperLabel: "Paper",
    yourStyleLabel: "Your Style",
    styleEvolving: "Your style is evolving!",
    profileAutoUpdated: "Your profile has been updated automatically.",
    viewLabel: "View",
    manageLabel: "Manage",
    navHome: "Home",
    navSubjects: "Subjects",
    navTutor: "Rizz Tutor",
    navFlashcards: "Flashcards",
    navProgress: "Progress",
    navStudyPlan: "Study Plan",
    navRewards: "Rewards",
    navStore: "Store",
    navJourney: "Journey",
    navSettings: "Settings",
    signOutLabel: "Sign Out",
    daysInARow: "days in a row",
    answeredLabel: "answered",
    averageLabel: "average",
    completedLabel: "completed",
    miniMockTitle: "⚡ Mini-Mock",
    miniMockSub: "Practice hard!",
    miniMockCta: "⚡ Start Mini Mock",
    fullExamTitle: "🎓 Full Exam",
    fullExamSub: "Complete DBE paper",
    fullExamCta: "⚡ Start Full Exam",
    tutorCardTitle: "💬 Smart Tutor",
    tutorCardSub: "Ask me anything!",
    tutorCardCta: "💬 Chat",
    crunchTitle: "✏️ Crunch Time",
    crunchSub: "Practice hard!",
    crunchCta: "✏️ Start",
    progressCardTitle: "📊 Progress",
    progressCardSub: "Track your gains!",
    progressCardCta: "📊 View",
    dailyChallengeTitle: "⚡ Daily Challenge",
    dailyChallengeSub: "5 quick questions!",
    dailyChallengeCta: "⚡ Go",
    setupLink: "Set up →",
    selectSubjectsHeading: "No subjects selected",
    selectSubjectsBtn: "Select Subjects",
    selectSubjectsDesc: "Complete your profile to select your subjects",
    achievementsHeading: "Achievements",
    startLearningToUnlock: "Start learning to unlock!",
    toLabel: "to",
    yourVibeHeading: "Your Vibe",
    learningStyleLabel: "Learning Style",
    bestTimeLabel: "Best Time",
    proTipHeading: "Pro-Tip for Your Style",
    consistencyTip: "Consistency is the key to mastering any subject.",
    openPlanBtn: "Open your plan",
    nextMilestoneTitle: "Next Milestone",
    personalBestsTitle: "Personal Bests",
    lapsedBannerMsg: "Your Student Life access has ended.",
    lapsedBannerCta: "Reactivate",
    tierPlatinum: "Platinum",
    tierGold: "Gold",
    tierSilver: "Silver",
    tierBronze: "Bronze",
    legendLabel: "Legend",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    greetMorning: "Yo {name}! Let's go!",
    greetAfternoon: "What's good, {name}!",
    greetEvening: "Evening vibes, {name}!",
    greetingSubMorning: "a fresh day to own your matric.",
    greetingSubAfternoon: "still time to pull ahead today.",
    greetingSubEvening: "one more session and you're a step ahead.",
    daysLeft: "days left",
    prelimsFallback: "Aug – Sept (provincial)",
    claimXp: "⚡ Claim daily XP 💰",
    startRevision: "Start revision — practise now →",
    runIt: "Run it →",
    nextMissionTitle: "Next mission 🎯",
    freshDropsTitle: "Fresh drops 🏆✨",
    examCountdownHeading: "Exam countdown — DBE 2026 ⏳",
    keepPushing: "keep pushing ↗ 💪",
    streakNudge: "Don't break it now — keep the fire going.",
    worthLabel: "worth",
    prelimNote: "Prelim dates are set by your school/province (typically Aug–mid Sep). Finals per the official DBE NSC Oct/Nov 2026 timetable.",
    boostSessionTitle: "Boost Session",
    boostSessionTag: "30 min · all your subjects",
    boostSessionDesc: "One guided sprint of real DBE questions rotating through every subject you take.",
    boostSessionCta: "Start 30-min Boost →",
    dailyBoostHeading: "Daily Boost",
    dailyBoostSub: "one for the head, one for the heart",
    dailyBoostTipEyebrow: "TIP OF THE DAY",
    dailyBoostRizzEyebrow: "RIZZ SAYS",
  },
  af: {
    signOut: "Uitteken",
    statusLabel: "Status",
    yourStatus: "Jou Status",
    readinessLabel: "GEREEDHEID",
    prelimsLabel: "Vooreksamens",
    finalsLabel: "Finale",
    dayLabel: "dag",
    daysLabel: "dae",
    viewDetails: "Sien meer",
    studyStreak: "Studierreeks",
    streakDays: "dae",
    accuracy: "Akkuraatheid",
    questionsAnswered: "Vrae Beantwoord",
    papersCompleted: "Vraestelle Voltooi",
    continueStudying: "Gaan voort met studie",
    startStudying: "Begin Studeer",
    quickActions: "Vinnige Aksies",
    smartTutor: "Slimmer Tutor",
    examMode: "Eksamenmode",
    subjects: "Vakke",
    flashcards: "Flitskaarte",
    rewards: "Belonings",
    store: "Winkel",
    schedule: "Skedule",
    dailyChallenge: "Daaglikse Uitdaging",
    noSubjects: "Geen vakke gekies nie",
    noSubjectsDesc: "Gaan na Instellings om die vakke te kies wat jy hierdie jaar skryf.",
    goToSettings: "Gaan na Instellings",
    recentActivity: "Onlangse Aktiwiteit",
    noActivityYet: "Nog geen aktiwiteit nie",
    startPracticing: "Begin oefen om jou vordering hier te sien.",
    subjectsHeading: "Jou Vakke",
    masteryLabel: "Bemeestering",
    focusAreasHeading: "Fokusareas",
    focusAreasSubtitle: "Onderwerpe oor al jou vakke wat die meeste aandag nodig het.",
    focusAreasEmpty: "Jy is op hoogte van elke onderwerp. Hou aan oefen om skerp te bly!",
    focusBandCatchUp: "Inhaal",
    focusBandBuilding: "Bou",
    practiceNow: "Oefen Nou",
    upcomingExams: "Komende Eksamens",
    noUpcomingExams: "Geen komende eksamens geskeduleer nie",
    addPrelimDates: "Voeg jou vooreksamendatums by in Instellings.",
    liveSession: "Lewende sessie",
    calendarLabel: "Kalender",
    nextExam: "Volgende Eksamen",
    thisWeek: "Hierdie Week",
    subjectPriority: "Vak Prioriteitslys",
    fullPlan: "Volledige plan",
    daysAbbr: "dae",
    daysShort: "d",
    paperLabel: "Vraestel",
    yourStyleLabel: "Jou Leerstyl",
    styleEvolving: "Jou leerstyl ontwikkel!",
    profileAutoUpdated: "Jou profiel is outomaties opgedateer.",
    viewLabel: "Sien",
    manageLabel: "Verander",
    navHome: "Tuis",
    navSubjects: "Vakke",
    navTutor: "Rizz Tutor",
    navFlashcards: "Flitskaarte",
    navProgress: "Vordering",
    navStudyPlan: "Studieplan",
    navRewards: "Belonings",
    navStore: "Winkel",
    navJourney: "Reis",
    navSettings: "Instellings",
    signOutLabel: "Uitteken",
    daysInARow: "dae agtereen",
    answeredLabel: "beantwoord",
    averageLabel: "gemiddeld",
    completedLabel: "voltooi",
    miniMockTitle: "⚡ Mini-Toets",
    miniMockSub: "Oefen jou hartlap!",
    miniMockCta: "⚡ Begin Mini-Toets",
    fullExamTitle: "🎓 Volle Eksamen",
    fullExamSub: "Volle DBE-vraestel",
    fullExamCta: "⚡ Begin Volle Eksamen",
    tutorCardTitle: "💬 Slimmer Tutor",
    tutorCardSub: "Vra my enigiets!",
    tutorCardCta: "💬 Gesels",
    crunchTitle: "✏️ Eksamentyd",
    crunchSub: "Oefen jou hartlap!",
    crunchCta: "✏️ Begin",
    progressCardTitle: "📊 Vordering",
    progressCardSub: "Kyk hoe ver jy gekom het!",
    progressCardCta: "📊 Sien",
    dailyChallengeTitle: "⚡ Daaglikse",
    dailyChallengeSub: "5 vinnige vrae!",
    dailyChallengeCta: "⚡ Begin",
    setupLink: "Stel op →",
    selectSubjectsHeading: "Geen vakke gekies nie",
    selectSubjectsBtn: "Kies Vakke",
    selectSubjectsDesc: "Voltooi jou profiel om jou vakke te kies",
    achievementsHeading: "Prestasies",
    startLearningToUnlock: "Begin leer om prestasies te ontsluit!",
    toLabel: "tot",
    yourVibeHeading: "Jou Leerstyl",
    learningStyleLabel: "Leerstyl",
    bestTimeLabel: "Beste Tyd",
    proTipHeading: "Wenk net vir Jou",
    consistencyTip: "Konsekwentheid is die sleutel tot bemeestering.",
    openPlanBtn: "Open jou plan",
    nextMilestoneTitle: "Volgende Mylpaal",
    personalBestsTitle: "Persoonlike Rekords",
    lapsedBannerMsg: "Jou Student Life toegang het geëindig.",
    lapsedBannerCta: "Hernu",
    tierPlatinum: "Platinum",
    tierGold: "Goud",
    tierSilver: "Silwer",
    tierBronze: "Brons",
    legendLabel: "Legende",
    greetingMorning: "Môre",
    greetingAfternoon: "Middag",
    greetingEvening: "Aand",
    greetMorning: "Môre, {name}! Kom ons swot!",
    greetAfternoon: "Howzit, {name}! Tyd om te swot.",
    greetEvening: "Aand, {name}! Nog 'n bietjie swot-tyd?",
    greetingSubMorning: "'n nuwe dag om jou matriek te oorrompel.",
    greetingSubAfternoon: "nog tyd om vandag vooruit te kom.",
    greetingSubEvening: "een meer sessie en jy's 'n stap voor.",
    daysLeft: "dae oor",
    prelimsFallback: "Aug – Sept (per provinsie)",
    claimXp: "⚡ Eis daaglikse XP 💰",
    startRevision: "Begin hersiening — oefen nou →",
    runIt: "Doen dit →",
    nextMissionTitle: "Volgende missie 🎯",
    freshDropsTitle: "Nuwe wenne 🏆✨",
    examCountdownHeading: "Eksamen-aftelling — DBE 2026 ⏳",
    keepPushing: "hou aan druk ↗ 💪",
    streakNudge: "Moenie dit nou breek nie — hou die vuur brandend.",
    worthLabel: "werd",
    prelimNote: "Vooreksamendatums word deur jou skool/provinsie bepaal (gewoonlik Aug tot middel Sep). Finale eksamens volg die amptelike DBE NSC Okt/Nov 2026-rooster.",
    boostSessionTitle: "Boost-sessie",
    boostSessionTag: "30 min · al jou vakke",
    boostSessionDesc: "Een begeleide sessie met regte DBE-vrae wat deur elkeen van jou vakke roteer.",
    boostSessionCta: "Begin 30-min Boost →",
    dailyBoostHeading: "Daaglikse Boost",
    dailyBoostSub: "een vir die kop, een vir die hart",
    dailyBoostTipEyebrow: "WENK VAN DIE DAG",
    dailyBoostRizzEyebrow: "RIZZ SÊ",
  },
} as const;

// CountdownDigits is imported from exam-countdown so countdown rendering
// logic lives in one place. See client/src/components/exam-countdown.tsx.

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [popupBadge, setPopupBadge] = useState<string | null>(null);
  const dismissPopup = useCallback(() => setPopupBadge(null), []);

  const { data: stats } = useQuery<{
    studyStreak: number;
    accuracy: number;
    questionsAnswered: number;
    papersCompleted: number;
  }>({ queryKey: ["/api/user/stats"], refetchInterval: 20000, refetchOnWindowFocus: true });

  const { data: subscription } = useQuery<{
    status: string;
    billingMethod: string | null;
    trialEndsAt: string | null;
    nextRenewalAt: string | null;
    gracePeriodEndsAt: string | null;
  } | null>({ queryKey: ["/api/user/subscription"], staleTime: 5 * 60 * 1000 });

  const { data: profile } = useQuery<any>({ queryKey: ["/api/user/onboarding"] });
  const { data: subjects, isLoading: subjectsLoading } = useQuery<any[]>({ queryKey: ["/api/subjects"] });
  const { data: focusAreasData } = useQuery<{
    focusAreas: Array<{
      topicId: number;
      subjectId: number;
      topicName: string;
      topicNameAfrikaans: string;
      subjectName: string;
      subjectNameAfrikaans: string;
      masteryScore: number;
      masteryBand: "red" | "amber";
    }>;
  }>({
    queryKey: [`/api/mastery/focus-areas?limit=3&lang=${language}`],
    staleTime: 60000,
  });
  const { data: badges } = useQuery<any[]>({ queryKey: ["/api/user/badges"] });
  const { data: examWidgets } = useQuery<any>({
    queryKey: ["/api/timetable/widgets"],
    refetchInterval: 300000,
    staleTime: 120000,
  });
  const { data: goals } = useQuery<{
    weekly: { studyMinutes: number; activeDays: number; daysGoal: number; pct: number };
    daily: { questionsAnswered: number; questionsGoal: number; pct: number };
    settings: { dailyQuestionsGoal: number; weeklyDaysGoal: number };
  }>({ queryKey: ["/api/learner/goals"], staleTime: 60000 });

  // Daily Boost — one tip + one Rizz line per learner per SAST day. The
  // server keys off the SAST date so the pair is stable within the day and
  // rotates at midnight SAST. We include today's SAST date in the queryKey
  // so React Query treats a new day as a fresh query and auto-refetches
  // when the browser is left open overnight. lang is on the querystring so
  // a language toggle re-fetches in the new language (endpoint honors ?lang=).
  const todaySast = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
  const { data: dailyBoost } = useQuery<{
    tip: { text: string; textAf: string; subject: string | null };
    rizz: { text: string; textAf: string };
    date: string;
  }>({
    queryKey: [`/api/learner/daily-motivation?lang=${language}&d=${todaySast}`],
    staleTime: 12 * 60 * 60 * 1000, // 12h — never re-fetches within the same day
  });
  const { varkPrimary, style: varkStyle, insights: varkInsights } = useVark();

  type Countdown = { days: number; hours: number; minutes: number; seconds: number };
  function calcCountdown(target: Date): Countdown {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }

  // Prelim dates: use the shared hook so this surface and ExamCountdown share
  // the same data source. Past prelims are automatically skipped; learner-set
  // dates override school-set dates (handled server-side).
  //
  // Three states the hook exposes:
  //   !hasAnyPrelimData              → no records yet   (show Settings CTA)
  //   hasAnyPrelimData && !PRELIMS_DATE → all past       (show 0-day card, no CTA)
  //   hasAnyPrelimData && PRELIMS_DATE  → upcoming       (live countdown)
  const { earliestPrelim, targetDate, hasAnyPrelimData } = useEarliestPrelimDate();
  // When all prelims are past we pass a past-date sentinel so CountdownDigits
  // renders 0 days rather than showing the "no data" Settings CTA.
  const PRELIMS_DATE: Date | null = targetDate ?? (hasAnyPrelimData ? new Date(0) : null);

  useEffect(() => {
    localStorage.removeItem("braintrack-theme");
    document.documentElement.className = document.documentElement.className
      .split(" ")
      .filter(c => !c.startsWith("theme-"))
      .join(" ");
  }, []);

  // Task #819 step 12 — countdown state + 1Hz interval was previously hoisted
  // into DashboardPage, forcing the entire 2,000-line page to re-render every
  // second. Now isolated to <CountdownDigits> below (defined in this file)
  // which owns its own state, so the per-second tick only re-renders the
  // ~10-line digit subtree instead of the whole dashboard.

  type PrepStatus = "star" | "on_track" | "concerned" | "at_risk";
  const getPrepStatus = () => {
    const streak    = stats?.studyStreak    ?? 0;
    const questions = stats?.questionsAnswered ?? 0;
    const papers    = stats?.papersCompleted   ?? 0;
    let score = 0;
    if (streak >= 7) score += 35; else if (streak >= 3) score += 25; else if (streak >= 1) score += 15;
    score += Math.min(65, questions + papers * 8);
    if (score >= 85) return { status: "star"      as PrepStatus, label: "Star",     labelAf: "Ster",   icon: Star,      accent: "cyan",   message: "Top performer. You're ready.",                 messageAf: "Top presteerder. Jy's gereed."              };
    if (score >= 60) return { status: "on_track"  as PrepStatus, label: "Locked In",labelAf:"Gefokus", icon: TrendingUp,accent: "blue",   message: "Solid progress. Keep it up.",                  messageAf: "Goeie vordering. Hou vol."                  };
    if (score >= 30) return { status: "concerned" as PrepStatus, label: "Building", labelAf: "Besig",  icon: Target,    accent: "yellow", message: "Getting there. A bit more consistency helps.", messageAf: "Op pad. Bietjie meer konsekwentheid help."  };
    return                   { status: "at_risk"  as PrepStatus, label: "Catch Up", labelAf: "Inhaal", icon: Flame,     accent: "pink",   message: "Time to get moving. Start small.",             messageAf: "Tyd om te begin. Begin klein."              };
  };
  const prepStatus = getPrepStatus();

  const accentMap: Record<string, { hex: string; halo: string }> = {
    cyan:   { hex: "#9FF5E8", halo: "rgba(159,245,232,0.28)" },
    blue:   { hex: "#9FD8FF", halo: "rgba(159,216,255,0.28)" },
    yellow: { hex: "#FFE29A", halo: "rgba(255,226,154,0.28)" },
    pink:   { hex: "#FFB7E5", halo: "rgba(255,183,229,0.28)" },
  };
  const ac = accentMap[prepStatus.accent];

  const getGreeting = () => {
    const h = new Date().getHours();
    const n = user?.firstName || "Legend";
    const key = h < 12 ? t.greetMorning : h < 17 ? t.greetAfternoon : t.greetEvening;
    return key.replace("{name}", n);
  };

  const selectedSubjectIds = profile?.selectedSubjects || [];
  // Only the learner's chosen subjects — never the whole catalogue. With no
  // selection this is [], which renders the "select your subjects" prompt below
  // instead of dumping all 62 subjects onto the dashboard.
  const filteredSubjects = selectedSubjectIds.length > 0
    ? subjects?.filter((s: any) => selectedSubjectIds.includes(s.id))
    : [];

  const navLinks = NAV_LINKS(t);

  const streakVal = stats?.studyStreak ?? 0;
  const readiness = calcReadiness({
    accuracy: stats?.accuracy ?? 0,
    studyStreak: streakVal,
    questionsAnswered: stats?.questionsAnswered ?? 0,
  });
  const firstName = user?.firstName || t.legendLabel;
  const avatarBg = PASTELS[(firstName.charCodeAt(0) || 0) % PASTELS.length];
  const daysTo = (d: Date) => Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));

  // Next-exam target for the hero + countdown chips: personal NSC timetable
  // entry first, then the earliest prelim, then the official DBE finals date.
  const nextExamEntry = examWidgets?.nextExam ?? null;
  const heroTarget: Date = (() => {
    if (nextExamEntry?.examDate) {
      const withTime = new Date(`${nextExamEntry.examDate}T${nextExamEntry.startTime || "09:00"}:00+02:00`);
      if (!isNaN(withTime.getTime())) return withTime;
      const dateOnly = new Date(`${nextExamEntry.examDate}T09:00:00+02:00`);
      if (!isNaN(dateOnly.getTime())) return dateOnly;
    }
    return targetDate ?? FINALS_DATE;
  })();
  const heroName = nextExamEntry
    ? `${nextExamEntry.subjectName} · ${t.paperLabel} ${nextExamEntry.paperNumber}`
    : earliestPrelim
    ? `${earliestPrelim.subjectName} · ${t.paperLabel} ${earliestPrelim.paperNumber}`
    : `DBE NSC · ${t.finalsLabel}`;
  const heroWhen = heroTarget.toLocaleDateString(isAf ? "af-ZA" : "en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });


  return (
    <div className="bt-dash-root" style={{ minHeight: "100vh", background: "#050508", display: "flex" }}>
      <BadgePopup badgeCode={popupBadge} isAf={isAf} onDismiss={dismissPopup} />

      {/* ── Sidebar (desktop ≥861px) ── */}
      <aside
        className="bt-dash-sidebar"
        style={{
          width: 240,
          flex: "none",
          borderRight: "1px solid #1b1922",
          padding: "26px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          position: "sticky",
          top: 0,
          height: "100vh",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <Link href="/dashboard" className="bt-dash-logo" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px 22px", cursor: "pointer" }}>
          <img src={btIcon} alt="BrainTrack" className="bt-dash-logo-img" style={{ width: 56, height: 56, objectFit: "contain", flex: "none" }} />
          <span className="bt-wordmark bt-dash-navlabel" style={{ fontSize: 17 }}>BrainTrack</span>
        </Link>
        {navLinks.map(({ href, icon: Icon, label }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}>
              <div
                className="bt-dash-navitem"
                data-testid={`nav-icon-${href.replace(/\//g, "")}`}
                title={label}
                aria-label={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  minHeight: 44,
                  borderRadius: 14,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  color: active ? "#9FF5E8" : "#fff",
                  background: active ? "rgba(159,245,232,.12)" : "transparent",
                  border: active ? "1px solid #9FF5E8" : "1px solid transparent",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#1b1922"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon style={{ width: 16, height: 16, flex: "none" }} />
                <span className="bt-dash-navlabel" style={{ flex: 1 }}>{label}</span>
              </div>
            </Link>
          );
        })}
        <div
          className="bt-dash-streak"
          data-testid="streak-badge"
          style={{
            marginTop: "auto",
            background: "linear-gradient(140deg,rgba(255,183,229,.14),rgba(197,179,255,.12))",
            border: "1px solid rgba(255,183,229,.3)",
            borderRadius: 18,
            padding: 16,
          }}
        >
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "#FFB7E5" }}>{t.studyStreak} 🔥🔥🔥</div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginTop: 2 }}>
            {streakVal} <span style={{ fontSize: 14 }}>{streakVal === 1 ? t.dayLabel : t.streakDays}</span>
          </div>
          <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>{t.streakNudge}</div>
        </div>
        <button
          onClick={() => logout()}
          data-testid="button-logout"
          title={t.signOutLabel}
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            background: "transparent",
            border: "1px solid #1b1922",
            borderRadius: 14,
            padding: "11px 14px",
            minHeight: 44,
            cursor: "pointer",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF8DA1"; e.currentTarget.style.color = "#FF8DA1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1b1922"; e.currentTarget.style.color = "#fff"; }}
        >
          <LogOut style={{ width: 16, height: 16, flex: "none" }} />
          <span className="bt-dash-navlabel">{t.signOutLabel}</span>
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="bt-dash-main" style={{ flex: 1, padding: "34px 40px", minWidth: 0, position: "relative", overflow: "hidden" }}>
        {/* Graffiti scatter only. The two blurred radial "glow" blobs that used
            to sit here were removed — soft bloom read as cheap neon against the
            flat sticker cards. The wall texture carries the depth now. */}
        <GraffitiSplats variant="full" opacity={0.55} />

        {/* ── Header row ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 30, position: "relative", zIndex: 1 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "#9FF5E8", transform: "rotate(-2deg)", display: "inline-block" }}>
              {getGreeting()} ⚡
            </div>
            <div role="heading" aria-level={1} style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: "#fff" }}>
              {firstName} <span style={{ fontSize: 24 }}>🎧🔥</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <RizzHeaderButton />
            <NotificationsPanel isAf={isAf} />
            <button
              onClick={toggleLanguage}
              data-testid="button-language-toggle"
              style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: "#C5B3FF", background: "transparent", border: "1px solid #C5B3FF", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }}
            >
              {language === "en" ? "EN" : "AF"}
            </button>
            <Link href="/daily-challenge">
              <Button variant="primary" data-testid="button-claim-daily-xp">
                {t.claimXp}
              </Button>
            </Link>
            <div
              aria-hidden
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: avatarBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 15,
                color: "#050508",
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

      <main style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <RescuePackAlert isAf={isAf} />

        {subscription && subscription.status === "lapsed" && (
          <div
            data-testid="subscription-lapsed-banner"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5"
            style={{
              background: "linear-gradient(135deg, rgba(255,183,229,0.12) 0%, #1b1922 60%), #050508",
              border: "1.5px solid rgba(255,183,229,0.5)",
            }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#FFB7E5]" />
              <span className="text-sm font-bold text-white">
                {t.lapsedBannerMsg}
              </span>
            </div>
            <Link href="/subscribe">
              <Button variant="primary" size="sm">
                <RefreshCcw className="w-3 h-3" />
                {t.lapsedBannerCta}
              </Button>
            </Link>
          </div>
        )}

        {/* ═══ Daily Boost — one tip, one Rizz line, refreshes at SAST midnight ═══
             Rendered near the top of the dashboard on purpose: it's a "first
             thing you see when you open the app" nudge. Falls back to a
             skeleton silently on first paint / error — never blocks the rest
             of the page. */}
        {dailyBoost && (
          <div
            data-testid="daily-boost-section"
            className="bt-grid-2col"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
          >
            {/* Rizz motivational card */}
            <div
              data-testid="daily-boost-rizz"
              style={{
                background: "linear-gradient(140deg,rgba(197,179,255,.14),rgba(255,183,229,.10)), #050508",
                border: "1.5px solid #C5B3FF",
                borderRadius: 20,
                padding: "18px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <img
                src={rizzAvatar}
                alt="Rizz"
                style={{ width: 54, height: 54, borderRadius: 14, objectFit: "cover", border: "1.5px solid #C5B3FF", flex: "none" }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#C5B3FF" }}>
                  {t.dailyBoostRizzEyebrow}
                </div>
                <div
                  data-testid="daily-boost-rizz-text"
                  style={{ fontFamily: "'Poppins',sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.45, marginTop: 4 }}
                >
                  {isAf ? dailyBoost.rizz.textAf : dailyBoost.rizz.text}
                </div>
              </div>
            </div>

            {/* Daily Tip card */}
            <div
              data-testid="daily-boost-tip"
              style={{
                background: "linear-gradient(140deg,rgba(159,245,232,.14),rgba(148,247,197,.10)), #050508",
                border: "1.5px solid #9FF5E8",
                borderRadius: 20,
                padding: "18px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  border: "1.5px solid #9FF5E8",
                  background: "rgba(159,245,232,.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                <Lightbulb style={{ width: 26, height: 26, color: "#9FF5E8" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#9FF5E8" }}>
                  {t.dailyBoostTipEyebrow}
                  {dailyBoost.tip.subject && (
                    <span data-testid="daily-boost-tip-subject" style={{ color: "#fff", fontWeight: 700, marginLeft: 8 }}>
                      · {dailyBoost.tip.subject}
                    </span>
                  )}
                </div>
                <div
                  data-testid="daily-boost-tip-text"
                  style={{ fontFamily: "'Poppins',sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.45, marginTop: 4 }}
                >
                  {isAf ? dailyBoost.tip.textAf : dailyBoost.tip.text}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Next-exam hero ═══ */}
        <div
          data-testid="learner-command-hero"
          style={{
            background: "linear-gradient(120deg,rgba(255,183,229,.12),rgba(159,216,255,.1))",
            border: "1.5px solid rgba(255,183,229,.3)",
            borderRadius: 20,
            padding: "20px 26px",
            display: "flex",
            alignItems: "center",
            gap: 22,
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#FFB7E5" }}>{t.nextExam} ⏰</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, marginTop: 2, color: "#fff" }}>{heroName}</div>
            <div style={{ fontSize: 13, color: "#fff" }}>
              {heroWhen} · {t.readinessLabel.toLowerCase()}{" "}
              <b style={{ color: "#9FF5E8" }}>
                <span data-testid="hero-readiness-value">{readiness}</span>%
              </b>
            </div>
          </div>
          <LiveCountdownChips target={heroTarget} />
          <Link href="/exam/mini-mock">
            <Button variant="primary" size="lg" className="whitespace-nowrap">
              {t.startRevision}
            </Button>
          </Link>
        </div>

        {/* ═══ Boost Session — 30 min of revision across ALL selected subjects ═══ */}
        <div
          data-testid="boost-session-card"
          style={{
            background: "linear-gradient(120deg,rgba(148,247,197,.13),rgba(159,245,232,.09)), #050508",
            border: "1.5px solid #94F7C5",
            borderRadius: 20,
            padding: "20px 26px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: "5px 5px 0 0 rgba(148,247,197,.85)",
          }}
        >
          <div
            aria-hidden
            style={{
              width: 52,
              height: 52,
              flex: "none",
              borderRadius: 16,
              background: "rgba(148,247,197,.16)",
              border: "1px solid #94F7C5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Timer style={{ width: 26, height: 26, color: "#94F7C5" }} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#94F7C5", transform: "rotate(-2deg)", display: "inline-block" }}>
              {t.boostSessionTag} ⚡
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, color: "#fff" }}>{t.boostSessionTitle} 🚀</div>
            <div style={{ fontSize: 13, color: "#fff" }}>{t.boostSessionDesc}</div>
          </div>
          <Link href="/boost-session">
            <Button variant="primary" size="lg" className="whitespace-nowrap" data-testid="button-start-boost-session">
              {t.boostSessionCta}
            </Button>
          </Link>
        </div>

        {/* ── Stat stickers ── */}
        <div className="bt-grid-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {[
            { label: t.studyStreak,       value: stats?.studyStreak ?? 0,       suffix: "",  sub: t.daysInARow,     Icon: Flame,         hex: "#FFB7E5", tilt: -1.2, testid: "card-stat-streak",    statTestid: "stat-streak"    },
            { label: t.questionsAnswered, value: stats?.questionsAnswered ?? 0, suffix: "",  sub: t.answeredLabel,  Icon: Zap,           hex: "#9FF5E8", tilt: 0.8,  testid: "card-stat-questions", statTestid: "stat-questions" },
            { label: t.accuracy,          value: stats?.accuracy ?? 0,          suffix: "%", sub: t.averageLabel,   Icon: Target,        hex: "#C5B3FF", tilt: -0.8, testid: "card-stat-accuracy",  statTestid: "stat-accuracy"  },
            { label: t.papersCompleted,   value: stats?.papersCompleted ?? 0,   suffix: "",  sub: t.completedLabel, Icon: CalendarCheck, hex: "#FFE29A", tilt: 1.2,  testid: "card-stat-papers",    statTestid: "stat-papers"    },
          ].map(({ label, value, suffix, sub, Icon, hex, tilt, testid, statTestid }) => (
            <div
              key={label}
              data-testid={testid}
              style={{
                background: "linear-gradient(160deg,#1b1922,#1b1922)",
                border: `1.5px solid ${hex}`,
                borderRadius: 20,
                padding: "20px 22px",
                transform: `rotate(${tilt}deg)`,
                boxShadow: `5px 5px 0 0 ${hex}`,
                transition: "transform .25s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(0deg) translateY(-6px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = `rotate(${tilt}deg)`)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#fff" }}>{label}</div>
                <Icon style={{ width: 18, height: 18, flex: "none", color: hex }} />
              </div>
              <LiveCounter
                value={typeof value === "number" ? value : 0}
                suffix={suffix}
                className="block"
                style={{ fontSize: 30, fontWeight: 900, color: hex, marginTop: 6, lineHeight: 1.15 }}
                testid={statTestid}
              />
              <div style={{ fontSize: 13.5, color: "#fff" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Two-column: Subject mastery + Next mission / Fresh drops ── */}
        <div className="bt-grid-2col" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
          {/* Subject mastery */}
          <div style={{ background: "linear-gradient(#1b1922, #1b1922), #050508", border: "1px solid #1b1922", borderRadius: 24, padding: 26 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <div role="heading" aria-level={2} style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>{t.subjectsHeading} 📈</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#9FF5E8" }}>{t.keepPushing}</span>
                <Link href="/settings">
                  <button
                    data-testid="link-manage-subjects"
                    style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", background: "transparent", border: "1px solid #1b1922", borderRadius: 10, padding: "6px 12px", cursor: "pointer" }}
                  >
                    {t.manageLabel}
                  </button>
                </Link>
              </div>
            </div>
            {subjectsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[1, 2, 3].map(i => <div key={i} className="animate-pulse" style={{ height: 40, borderRadius: 12, background: "#1b1922" }} />)}
              </div>
            ) : filteredSubjects && filteredSubjects.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {filteredSubjects.map((subject: any, idx: number) => {
                  const hex = PASTELS[idx % PASTELS.length];
                  const hex2 = PASTELS[(idx + 1) % PASTELS.length];
                  const fa = focusAreasData?.focusAreas.find(f => f.subjectId === subject.id);
                  const pct = Math.max(0, Math.min(100, Math.round(fa ? fa.masteryScore : (stats?.accuracy ?? 0))));
                  const initial = (subject.name || "?").trim().charAt(0).toUpperCase();
                  return (
                    <Link key={subject.id} href={`/subject/${subject.id}`}>
                      <div data-testid={`subject-card-${subject.id}`} style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer", minHeight: 44, padding: "2px 0" }}>
                        <div style={{ width: 40, height: 40, flex: "none", borderRadius: 12, background: `${hex}26`, color: hex, fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {initial}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 15, fontWeight: 700, marginBottom: 6, color: "#fff" }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subject.name}</span>
                            <span className="tabular-nums" style={{ color: hex, flex: "none" }}>{pct}%</span>
                          </div>
                          <div style={{ height: 9, borderRadius: 999, background: "#1b1922", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: `linear-gradient(90deg,${hex},${hex2})` }} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div role="heading" aria-level={3} style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 4 }}>{t.selectSubjectsHeading}</div>
                <p style={{ color: "#fff", fontSize: 14, marginBottom: 20 }}>{t.selectSubjectsDesc}</p>
                <Link href="/settings">
                  <Button variant="primary" data-testid="button-select-subjects">
                    {t.selectSubjectsBtn}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Next mission */}
            {(() => {
              const fa = focusAreasData?.focusAreas?.[0] ?? null;
              const missionTitle = fa
                ? (language === "af" && fa.topicNameAfrikaans ? fa.topicNameAfrikaans : fa.topicName)
                : t.miniMockTitle;
              const missionSub = fa
                ? `${language === "af" && fa.subjectNameAfrikaans ? fa.subjectNameAfrikaans : fa.subjectName} · ${t.masteryLabel} ${fa.masteryScore}%`
                : t.miniMockSub;
              const missionHref = fa ? `/subject/${fa.subjectId}?topicId=${fa.topicId}` : "/exam/mini-mock";
              return (
                <div style={{ background: "linear-gradient(150deg,rgba(159,245,232,.12),rgba(197,179,255,.1))", border: "1px solid rgba(159,245,232,.28)", borderRadius: 24, padding: 24 }}>
                  <div role="heading" aria-level={2} style={{ fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 4 }}>{t.nextMissionTitle}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#FFE29A", marginBottom: 10 }}>{missionTitle}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "#fff" }}>
                    {missionSub} · {t.worthLabel} <b style={{ color: "#9FF5E8" }}>+250 XP</b>
                  </div>
                  <Link href={missionHref}>
                    <Button variant="primary" size="lg" className="mt-4 w-full">
                      {t.runIt}
                    </Button>
                  </Link>
                </div>
              );
            })()}

            {/* Fresh drops — recent achievements */}
            <div style={{ background: "linear-gradient(#1b1922, #1b1922), #050508", border: "1px solid #1b1922", borderRadius: 24, padding: 24, flex: 1 }}>
              <div role="heading" aria-level={2} style={{ fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 16 }}>{t.freshDropsTitle}</div>
              {badges && badges.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {badges.slice(0, 3).map((badge: any, idx: number) => {
                    const info = BADGE_INFO[badge.badgeCode];
                    if (!info) return null;
                    const Icon = info.icon;
                    const hex = PASTELS[idx % PASTELS.length];
                    return (
                      <div key={badge.id} data-testid={`badge-${badge.badgeCode}`} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                        <div style={{ width: 42, height: 42, flex: "none", borderRadius: "50%", background: `${hex}26`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon style={{ width: 20, height: 20, color: hex }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{isAf ? info.nameAfrikaans : info.name}</div>
                          <div style={{ fontSize: 13, color: "#fff" }}>
                            {badge.earnedAt ? formatDate(String(badge.earnedAt), language, { day: "numeric", month: "short" }) : t.achievementsHeading}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#fff", fontSize: 13, lineHeight: 1.5 }}>{t.startLearningToUnlock}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Exam countdown — DBE 2026 ──
            The two clocks (prelims + finals). Both run on REAL per-learner
            data — prelims from the learner's own timetable via
            useEarliestPrelimDate, finals from the shared FINALS_DATE — so
            don't replace these with a hard-coded pair. Sticker-slap frame,
            no bloom. */}
        <div style={{ background: "#050508", border: "2.5px solid #FFE29A", borderRadius: 24, boxShadow: "6px 6px 0 0 #FFE29A", padding: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            <div role="heading" aria-level={2} style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>{t.examCountdownHeading}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#FFB7E5" }}>{heroName}</span>
              <LiveCountdownChips target={heroTarget} tinted size={20} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16 }}>
            {/* Prelims tile */}
            {!hasAnyPrelimData && !PRELIMS_DATE ? (
              <Link href="/settings">
                <div
                  data-testid="countdown-prelims-empty"
                  style={{ height: "100%", background: "#050508", border: "2.5px solid #9FF5E8", borderRadius: 16, boxShadow: "5px 5px 0 0 #9FF5E8", padding: "16px 18px", cursor: "pointer", transition: "transform .18s ease, box-shadow .18s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-3px,-3px)"; e.currentTarget.style.boxShadow = "9px 9px 0 0 #9FF5E8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "5px 5px 0 0 #9FF5E8"; }}
                >
                  <div style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 8px", borderRadius: 6, background: "rgba(159,245,232,.12)", color: "#9FF5E8", textTransform: "uppercase" }}>{t.prelimsLabel}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#9FF5E8", marginTop: 10 }}>{t.setupLink}</div>
                  <div style={{ fontSize: 13, color: "#fff", marginTop: 2 }}>{t.addPrelimDates}</div>
                </div>
              </Link>
            ) : (
              <div
                data-testid="countdown-prelims"
                style={{ background: "#050508", border: "2.5px solid #9FF5E8", borderRadius: 16, boxShadow: "5px 5px 0 0 #9FF5E8", padding: "16px 18px", transition: "transform .18s ease, box-shadow .18s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-3px,-3px)"; e.currentTarget.style.boxShadow = "9px 9px 0 0 #9FF5E8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "5px 5px 0 0 #9FF5E8"; }}
              >
                <div style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 8px", borderRadius: 6, background: "rgba(159,245,232,.12)", color: "#9FF5E8", textTransform: "uppercase" }}>{t.prelimsLabel}</div>
                <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 900, color: "#9FF5E8", marginTop: 10 }}>
                  {PRELIMS_DATE ? daysTo(PRELIMS_DATE) : 0}{t.daysShort}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {earliestPrelim ? earliestPrelim.subjectName : (isAf ? "Vooreksamens voltooi" : "Prelims complete")}
                </div>
                <div style={{ fontSize: 13, color: "#fff" }}>
                  {earliestPrelim
                    ? formatDate(earliestPrelim.examDate + "T00:00:00", language, { day: "numeric", month: "short", year: "numeric" })
                    : t.prelimsFallback}
                </div>
              </div>
            )}
            {/* Finals tile */}
            <div
              data-testid="countdown-finals"
              style={{ background: "#050508", border: "2.5px solid #FFB7E5", borderRadius: 16, boxShadow: "5px 5px 0 0 #FFB7E5", padding: "16px 18px", transition: "transform .18s ease, box-shadow .18s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-3px,-3px)"; e.currentTarget.style.boxShadow = "9px 9px 0 0 #FFB7E5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "5px 5px 0 0 #FFB7E5"; }}
            >
              <div style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 8px", borderRadius: 6, background: "rgba(255,183,229,.12)", color: "#FFB7E5", textTransform: "uppercase" }}>{t.finalsLabel}</div>
              <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 900, color: "#FFB7E5", marginTop: 10 }}>
                {daysTo(FINALS_DATE)}{t.daysShort}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: "#fff" }}>DBE NSC 2026</div>
              <div style={{ fontSize: 13, color: "#fff" }}>
                {FINALS_DATE.toLocaleDateString(isAf ? "af-ZA" : "en-ZA", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            {/* Upcoming subject tiles from the learner's NSC timetable */}
            {examWidgets?.subjectPriorityQueue?.length > 0 && (
              <div data-testid="subject-priority-queue" style={{ display: "contents" }}>
                {examWidgets.subjectPriorityQueue.slice(0, 6).map((item: any, i: number) => {
                  const hex = PASTELS[(i + 2) % PASTELS.length];
                  return (
                    <div
                      key={i}
                      style={{ background: "#050508", border: `2.5px solid ${hex}`, borderRadius: 16, boxShadow: `5px 5px 0 0 ${hex}`, padding: "16px 18px", transition: "transform .18s ease, box-shadow .18s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-3px,-3px)"; e.currentTarget.style.boxShadow = `9px 9px 0 0 ${hex}`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `5px 5px 0 0 ${hex}`; }}
                    >
                      <div style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 8px", borderRadius: 6, background: `${hex}1F`, color: hex, textTransform: "uppercase" }}>
                        {t.paperLabel} {item.nextPaperNumber}
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 900, color: hex, marginTop: 10 }}>
                        {item.daysRemaining}{t.daysShort}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.subjectName}</div>
                      <div style={{ fontSize: 13, color: "#fff" }}>
                        {item.examDate ? formatDate(item.examDate + "T00:00:00", language, { day: "numeric", month: "short" }) : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: "#fff" }}>{t.prelimNote}</div>
        </div>

        {/* ── Referral share — surfaced on home, not buried in Settings ──
            Self-hides when the learner has no referral code yet. */}
        <ReferralShareCard isAf={isAf} />

        {/* ── Prep status — graffiti sticker banner ── */}
        <div
          data-testid="prep-status-indicator"
          style={{
            background: `linear-gradient(120deg, ${ac.hex}14, #1b1922), #050508`,
            border: `1.5px solid ${ac.hex}`,
            borderRadius: 20,
            padding: "20px 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: `5px 5px 0 0 ${ac.hex}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                flex: "none",
                borderRadius: 16,
                background: `${ac.hex}26`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {(() => { const Icon = prepStatus.icon; return <Icon style={{ width: 26, height: 26, color: ac.hex }} />; })()}
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: ac.hex, transform: "rotate(-2deg)", display: "inline-block" }}>
                {t.yourStatus} ✦
              </div>
              <div data-testid="prep-status-label" style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, color: "#fff" }}>
                {isAf ? prepStatus.labelAf : prepStatus.label}
              </div>
            </div>
          </div>
          <p data-testid="prep-status-message" style={{ flex: 1, minWidth: 200, fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.5, margin: 0 }}>
            {isAf ? prepStatus.messageAf : prepStatus.message}
          </p>
          <Link href="/progress">
            <button
              data-testid="button-view-details"
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                background: "transparent",
                border: "1.5px solid #1b1922",
                borderRadius: 10,
                padding: "10px 18px",
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ac.hex; e.currentTarget.style.color = ac.hex; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1b1922"; e.currentTarget.style.color = "#fff"; }}
            >
              {t.viewDetails}
            </button>
          </Link>
        </div>

        {/* Dynamic Study Plan widget — Top 3 weak topics + Readiness Scores
            (elevated above stat cards so it's the primary actionable element) */}
        <LearnerStudyPlan isAf={isAf} />

        <GoalProgress isAf={isAf} />

        {/* ── Exam urgency banner. (Old Next-Exam + This-Week cards removed:
            both duplicated the hero countdown and priority-queue tiles.) ── */}
        {examWidgets?.urgencyBanner && (() => {
          const urgencyColor: Record<string, { hex: string; halo: string }> = {
            red:     { hex: "#FF8DA1", halo: "rgba(255,141,161,0.3)" },
            amber:   { hex: "#FFE29A", halo: "rgba(255,226,154,0.3)" },
            blue:    { hex: "#9FD8FF", halo: "rgba(159,216,255,0.3)" },
            emerald: { hex: "#94F7C5", halo: "rgba(148,247,197,0.3)" },
          };
          const u = urgencyColor[examWidgets.urgencyBanner.color] ?? urgencyColor.emerald;
          const Icon =
            examWidgets.urgencyBanner.color === "red"   ? AlertTriangle :
            examWidgets.urgencyBanner.color === "amber" ? Clock :
            examWidgets.urgencyBanner.color === "blue"  ? Target : CheckCircle2;
          return (
            <div
              data-testid="urgency-banner"
              style={{
                background: `linear-gradient(120deg, ${u.hex}14, #1b1922), #050508`,
                border: `1.5px solid ${u.hex}`,
                borderRadius: 18,
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 40, height: 40, flex: "none", borderRadius: 12,
                  background: `${u.hex}26`, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon style={{ width: 20, height: 20, color: u.hex }} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: u.hex, transform: "rotate(-1.5deg)", display: "inline-block" }}>
                  {isAf ? examWidgets.urgencyBanner.labelAf : examWidgets.urgencyBanner.label}
                </div>
                <p style={{ fontSize: 13, color: "#fff", margin: "2px 0 0" }}>
                  {isAf ? (examWidgets.urgencyBanner.descriptionAf || examWidgets.urgencyBanner.description) : examWidgets.urgencyBanner.description}
                </p>
              </div>
              <Link href="/study-calendar">
                <button
                  style={{
                    fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13,
                    color: "#fff", background: "transparent",
                    border: "1.5px solid #1b1922", borderRadius: 10,
                    padding: "9px 16px", cursor: "pointer", transition: "all .2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = u.hex; e.currentTarget.style.color = u.hex; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1b1922"; e.currentTarget.style.color = "#fff"; }}
                >
                  {t.calendarLabel} <ChevronRight className="w-3 h-3 ml-1 inline" />
                </button>
              </Link>
            </div>
          );
        })()}

        {/* ── Quick actions — one curated graffiti grid (merged the old
            4-card quick actions + 2-card exam practice sections) ── */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
            <div role="heading" aria-level={2} style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>{t.quickActions} 🚀</div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#FFE29A", transform: "rotate(-2deg)", display: "inline-block" }}>
              {isAf ? "kies jou missie" : "pick your mission"}
            </span>
          </div>
          <div className="bt-grid-quick" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {(() => {
              const allCards = [
                {
                  href: "/tutor", testid: "link-smart-tutor", varkKey: "auditory", hex: "#C5B3FF", tilt: -1,
                  head: <img src={rizzAvatar} alt="Rizz" style={{ width: 46, height: 46, borderRadius: 14, objectFit: "cover" as const, border: "1.5px solid #C5B3FF" }} />,
                  isImg: true,
                  title: "Rizz", sub: t.tutorCardSub, cta: t.tutorCardCta,
                },
                {
                  href: "/exam-mode", testid: "link-exam-mode", varkKey: "kinesthetic", hex: "#9FD8FF", tilt: 0.8,
                  head: <Shield style={{ width: 24, height: 24, color: "#9FD8FF" }} />, isImg: false,
                  title: t.crunchTitle, sub: t.crunchSub, cta: t.crunchCta,
                },
                {
                  href: "/progress", testid: "link-progress-card", varkKey: "visual", hex: "#FFB7E5", tilt: -0.7,
                  head: <TrendingUp style={{ width: 24, height: 24, color: "#FFB7E5" }} />, isImg: false,
                  title: t.progressCardTitle, sub: t.progressCardSub, cta: t.progressCardCta,
                },
                {
                  href: "/daily-challenge", testid: "link-daily-challenge", varkKey: "read", hex: "#94F7C5", tilt: 1,
                  head: <Sparkles style={{ width: 24, height: 24, color: "#94F7C5" }} />, isImg: false,
                  title: t.dailyChallengeTitle, sub: t.dailyChallengeSub, cta: t.dailyChallengeCta,
                },
                {
                  href: "/exam/mini-mock", testid: "link-mini-mock", varkKey: "", hex: "#9FF5E8", tilt: -1.1,
                  head: <Zap style={{ width: 24, height: 24, color: "#9FF5E8" }} />, isImg: false,
                  title: t.miniMockTitle, sub: t.miniMockSub, cta: t.miniMockCta,
                },
                {
                  href: "/exam/full", testid: "link-full-exam", varkKey: "", hex: "#FFE29A", tilt: 0.9,
                  head: <GraduationCap style={{ width: 24, height: 24, color: "#FFE29A" }} />, isImg: false,
                  title: t.fullExamTitle, sub: t.fullExamSub, cta: t.fullExamCta,
                },
              ];
              const order: Record<string, string[]> = {
                visual:      ["visual", "auditory", "kinesthetic", "read"],
                auditory:    ["auditory", "kinesthetic", "visual", "read"],
                read:        ["read", "auditory", "visual", "kinesthetic"],
                kinesthetic: ["kinesthetic", "read", "auditory", "visual"],
              };
              const preferred = varkPrimary ? (order[varkPrimary] ?? []) : [];
              const sorted = preferred.length
                ? [...allCards].sort((a, b) => {
                    const ai = a.varkKey ? preferred.indexOf(a.varkKey) : 90;
                    const bi = b.varkKey ? preferred.indexOf(b.varkKey) : 90;
                    return (ai === -1 ? 90 : ai) - (bi === -1 ? 90 : bi);
                  })
                : allCards;
              return sorted.map(({ href, testid, head, isImg, title, sub, cta, hex, tilt }) => (
                <Link key={href} href={href} data-testid={testid}>
                  <div
                    style={{
                      height: "100%",
                      background: "linear-gradient(160deg,#1b1922,#1b1922)",
                      border: `1.5px solid ${hex}`,
                      borderRadius: 20,
                      padding: "18px 20px",
                      cursor: "pointer",
                      transform: `rotate(${tilt}deg)`,
                      boxShadow: `5px 5px 0 0 ${hex}`,
                      transition: "transform .25s, box-shadow .25s",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg) translate(-3px,-3px)"; e.currentTarget.style.boxShadow = `9px 9px 0 0 ${hex}`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${tilt}deg)`; e.currentTarget.style.boxShadow = `5px 5px 0 0 ${hex}`; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {isImg ? head : (
                        <div style={{ width: 46, height: 46, flex: "none", borderRadius: 14, background: `${hex}26`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {head}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{title}</div>
                        <div style={{ fontSize: 13, color: "#fff" }}>{sub}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: "auto", fontSize: 13, fontWeight: 800, color: hex, display: "flex", alignItems: "center", gap: 4 }}>
                      {cta} <ChevronRight style={{ width: 15, height: 15 }} />
                    </div>
                  </div>
                </Link>
              ));
            })()}
          </div>
        </div>

        {/* ── Focus areas — cross-subject mastery gaps, graffiti restyle ── */}
        {focusAreasData && (
          <div
            data-testid="panel-focus-areas"
            style={{ background: "linear-gradient(#1b1922, #1b1922), #050508", border: "1px solid #1b1922", borderRadius: 24, padding: 26 }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <div role="heading" aria-level={2} style={{ fontWeight: 800, fontSize: 18, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                <Target style={{ width: 18, height: 18, color: "#94F7C5" }} />
                {t.focusAreasHeading} 🎯
              </div>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#94F7C5", transform: "rotate(-2deg)", display: "inline-block" }}>
                {isAf ? "vang hulle vas!" : "lock them down!"}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#fff", margin: "0 0 18px" }}>{t.focusAreasSubtitle}</p>
            {focusAreasData.focusAreas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "18px 0" }}>
                <Sparkles style={{ width: 28, height: 28, color: "#94F7C5", margin: "0 auto 10px" }} />
                <p data-testid="text-focus-areas-empty" style={{ fontSize: 14, color: "#fff", margin: 0 }}>{t.focusAreasEmpty}</p>
              </div>
            ) : (
              <div className="bt-grid-focus" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {focusAreasData.focusAreas.map((fa) => {
                  const isRed = fa.masteryBand === "red";
                  const hex = isRed ? "#FF8DA1" : "#FFE29A";
                  const bandLabel = isRed ? t.focusBandCatchUp : t.focusBandBuilding;
                  const topicName = language === "af" && fa.topicNameAfrikaans ? fa.topicNameAfrikaans : fa.topicName;
                  const subjectName = language === "af" && fa.subjectNameAfrikaans ? fa.subjectNameAfrikaans : fa.subjectName;
                  return (
                    <Link key={`${fa.subjectId}-${fa.topicId}`} href={`/subject/${fa.subjectId}?topicId=${fa.topicId}`}>
                      <div
                        data-testid={`focus-area-${fa.topicId}`}
                        style={{
                          height: "100%",
                          background: `linear-gradient(160deg, ${hex}12, #1b1922)`,
                          border: `1.5px solid ${hex}66`,
                          borderRadius: 18,
                          padding: 16,
                          cursor: "pointer",
                          transition: "all .2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-3px,-3px)"; e.currentTarget.style.borderColor = hex; e.currentTarget.style.boxShadow = `7px 7px 0 0 ${hex}`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = `${hex}66`; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: hex, transform: "rotate(-2deg)", display: "inline-block" }}>
                            {bandLabel}
                          </span>
                          <span className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, color: hex }}>{fa.masteryScore}%</span>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subjectName}</div>
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: "#fff", marginTop: 2, lineHeight: 1.35 }}>{topicName}</div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 800, color: hex, display: "flex", alignItems: "center", gap: 3 }}>
                            {t.practiceNow} <ChevronRight style={{ width: 14, height: 14 }} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Your Vibe — merged panel (was: VARK badge + evolving nudge +
            Recommended-for-You + Your Vibe + Pro-tip, five separate blocks) ── */}
        {profile && (
          <div
            data-testid="vark-style-badge"
            style={{ background: "linear-gradient(150deg,rgba(197,179,255,.12),#1b1922), #050508", border: "1.5px solid rgba(197,179,255,.5)", borderRadius: 24, padding: 26 }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <div role="heading" aria-level={2} style={{ fontWeight: 800, fontSize: 18, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                <Brain style={{ width: 18, height: 18, color: "#C5B3FF" }} />
                {t.yourVibeHeading} {varkStyle ? varkStyle.icon : "🧠"}
              </div>
              {varkStyle && (
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#C5B3FF", transform: "rotate(-2deg)", display: "inline-block" }}>
                  {isAf ? varkStyle.taglineAf : varkStyle.tagline}
                </span>
              )}
            </div>
            <div className="bt-grid-vibe" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div style={{ background: "rgba(5,5,8,.45)", border: "1px solid rgba(197,179,255,.4)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#C5B3FF", marginBottom: 4 }}>{t.learningStyleLabel}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
                  {varkStyle
                    ? (isAf ? varkStyle.labelAf : varkStyle.label)
                    : (isAf
                        ? LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.nameAfrikaans
                        : LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.name) || profile.learningStyle}
                </div>
              </div>
              <div style={{ background: "rgba(5,5,8,.45)", border: "1px solid rgba(255,226,154,.4)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#FFE29A", marginBottom: 4 }}>{t.bestTimeLabel}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", textTransform: "capitalize" }}>{profile.studyPreference}</div>
              </div>
            </div>
            {/* Pro tip for this style */}
            {LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle] && (
              <div
                data-testid="pro-tip-banner"
                style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "rgba(255,226,154,.08)", border: "1px solid rgba(255,226,154,.35)", borderRadius: 16, padding: "14px 18px" }}
              >
                <Lightbulb style={{ width: 20, height: 20, flex: "none", color: "#FFE29A" }} />
                <p style={{ flex: 1, minWidth: 200, fontSize: 14, color: "#fff", lineHeight: 1.55, margin: 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#FFE29A", marginRight: 8 }}>{t.proTipHeading}:</span>
                  {(isAf
                    ? LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.tipsAfrikaans
                    : LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.tips
                  )?.[0] || t.consistencyTip}
                </p>
                <Link href="/study-calendar">
                  <Button variant="primary" size="sm" data-testid="button-pro-tip-learn-more">
                    {t.openPlanBtn}
                  </Button>
                </Link>
              </div>
            )}
            {/* Style-evolving nudge */}
            {varkInsights?.styleEvolving && varkInsights.dominantStyle && (
              <div
                data-testid="vark-evolving-nudge"
                style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 14, background: "rgba(159,245,232,.08)", border: "1px solid rgba(159,245,232,.35)", borderRadius: 16, padding: "12px 18px" }}
              >
                <span style={{ fontSize: 20 }}>
                  {varkInsights.dominantStyle === "visual" ? "👁" : varkInsights.dominantStyle === "auditory" ? "🔊" : varkInsights.dominantStyle === "read" ? "📖" : "✏"}
                </span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#9FF5E8", marginRight: 8 }}>{t.styleEvolving}</span>
                  <span style={{ fontSize: 13, color: "#fff" }}>
                    {varkInsights.recommendation
                      ? varkInsights.recommendation
                      : isAf
                        ? `Jou studiegeskiedenis wys dat jy die beste presteer met ${varkInsights.dominantStyle}-inhoud.`
                        : `Your study history shows you perform best with ${varkInsights.dominantStyle} content.`}
                    {varkInsights.autoUpdated && (
                      <b style={{ color: "#9FF5E8" }}> {t.profileAutoUpdated}</b>
                    )}
                  </span>
                </div>
                <Link href="/settings">
                  <button
                    style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", background: "transparent", border: "1.5px solid #1b1922", borderRadius: 10, padding: "8px 14px", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9FF5E8"; e.currentTarget.style.color = "#9FF5E8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1b1922"; e.currentTarget.style.color = "#fff"; }}
                  >
                    {t.viewLabel}
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Gamification — Next Milestone + You vs You + Personal Bests */}
        <div className="bt-grid-game" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, alignItems: "stretch" }}>
          {(() => {
            const sections = [
              { title: t.nextMilestoneTitle, hex: "#94F7C5", Widget: NextMilestoneWidget },
              { title: t.thisWeek,          hex: "#9FF5E8", Widget: YouVsYouChart },
              { title: t.personalBestsTitle, hex: "#FFE29A", Widget: PersonalBestsWidget },
            ];
            return sections.map(({ title, hex, Widget }) => (
              <div key={title} style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
                <div role="heading" aria-level={2} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: hex, transform: "rotate(-2deg)", display: "inline-block" }}>
                  {title}
                </div>
                <div style={{ flex: 1 }}>
                  <Widget isAf={isAf} />
                </div>
              </div>
            ));
          })()}
        </div>

      </main>
      </div>

      {/* Responsive: the left menu persists at every width (user request —
          no top-bar fallback); it just slims down on narrow screens. Below
          520px a fixed 200px rail was eating over half the screen and
          crushing every card's content into an unreadable sliver, so it
          drops to an icon-only rail there instead — still always visible,
          just without labels that no longer fit. */}
      <style>{`
        @media (max-width: 860px) {
          .bt-dash-sidebar { width: 200px !important; padding: 18px 10px !important; }
          .bt-dash-main { padding: 20px 14px !important; }
          /* minmax(0,1fr) — the plain 1fr defaults to minmax(auto,1fr) which
             lets grid items grow to their min-content width. On mobile the
             subject-mastery + focus-area cards contain nowrap text that
             pushed the column to 413px inside a 295px parent, clipping the
             right edge. minmax(0, ...) forces the column to honour the
             container. */
          .bt-grid-stats, .bt-grid-2col, .bt-grid-quick, .bt-grid-focus, .bt-grid-vibe, .bt-grid-game { grid-template-columns: minmax(0, 1fr) !important; }
          .bt-grid-2col > *, .bt-grid-quick > *, .bt-grid-focus > *, .bt-grid-vibe > *, .bt-grid-game > *, .bt-grid-stats > * { min-width: 0 !important; }
        }
        @media (max-width: 1280px) and (min-width: 861px) {
          .bt-grid-stats { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
          .bt-grid-quick, .bt-grid-focus, .bt-grid-game { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 520px) {
          .bt-dash-sidebar { width: 60px !important; padding: 14px 6px !important; align-items: center !important; }
          .bt-dash-navlabel { display: none !important; }
          /* min-w/min-h 44 keeps the primary sidebar icons on Apple/WCAG's 44px
             tap-target minimum on iPhone SE-ish screens; centered padding
             collapses to icon-only. */
          .bt-dash-navitem { justify-content: center !important; padding: 12px !important; min-width: 44px !important; min-height: 44px !important; }
          .bt-dash-logo { justify-content: center !important; padding: 0 0 16px !important; }
          .bt-dash-logo-img { width: 32px !important; height: 32px !important; }
          .bt-dash-streak { display: none !important; }
          .bt-dash-main { padding: 16px 10px !important; }
        }
      `}</style>
    </div>
  );
}

