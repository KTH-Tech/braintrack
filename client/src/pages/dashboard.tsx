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
  HelpCircle,
  ChevronDown,
  Globe,
  Menu,
  X,
  Home,
  ArrowLeft,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Coffee,
  CalendarCheck,
  Timer,
  RefreshCcw,
  CreditCard,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserBadge } from "@shared/schema";
import { LEARNING_STYLE_INFO, type LearningStyle } from "@/lib/constants";
import rizzAvatar from "@assets/rizz-nav-transparent.png";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { TrialEndingBanner } from "@/components/TrialEndingBanner";
import { RescuePackAlert } from "@/components/performance-packs";
import { LearnerStudyPlan } from "@/components/learner-study-plan";
import { useLanguage } from "@/lib/language-context";
import { formatDate, formatNumber } from "@/lib/formatters";
import { calcReadiness } from "@/lib/readiness";
import { useVark } from "@/hooks/use-vark";
import { VARK_STYLES } from "@/lib/vark";
import { BadgePopup } from "@/components/badge-popup";
import { NotificationsPanel } from "@/components/notifications-panel";
import { NextMilestoneWidget } from "@/components/next-milestone-widget";
import { YouVsYouChart } from "@/components/you-vs-you-chart";
import { PersonalBestsWidget } from "@/components/personal-bests-widget";

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

const NAV_LINKS = (labels: { navHome: string; navSubjects: string; navFlashcards: string; navProgress: string; navStudyPlan: string; navRewards: string; navStore: string; navJourney: string; navSettings: string }) => [
  { href: "/dashboard",      icon: BookOpen,    label: labels.navHome         },
  { href: "/subjects",       icon: Languages,   label: labels.navSubjects     },
  { href: "/flashcards",     icon: Layers,      label: labels.navFlashcards   },
  { href: "/progress",       icon: TrendingUp,  label: labels.navProgress     },
  { href: "/study-calendar", icon: CalendarDays,label: labels.navStudyPlan    },
  { href: "/rewards",        icon: Trophy,      label: labels.navRewards      },
  { href: "/store",          icon: Sparkles,    label: labels.navStore        },
  { href: "/journey",        icon: Rocket,      label: labels.navJourney      },
  { href: "/settings",       icon: Settings,    label: labels.navSettings     },
];

function CountdownBox({
  value,
  unit,
  hex,
  pulse = false,
}: {
  value: string | number;
  unit: string;
  hex: string;
  pulse?: boolean;
}) {
  const str = typeof value === "number" ? String(value) : value;
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-xl bg-black px-3.5 py-2.5 min-w-[72px] sm:min-w-[84px]"
      style={{
        border: `1px solid ${hex}66`,
        boxShadow: `0 0 14px ${hex}33, inset 0 0 10px ${hex}14`,
      }}
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[1.5px] rounded-t-xl"
        style={{ background: hex, opacity: pulse ? 1 : 0.55, transition: "opacity 0.4s" }}
      />
      <span
        className="text-[28px] sm:text-[34px] font-black tabular-nums leading-none"
        style={{
          fontFamily: '"JetBrains Mono", "Sora", monospace',
          color: hex,
          textShadow: `0 0 10px ${hex}88, 0 0 22px ${hex}44`,
        }}
      >
        {str}
      </span>
      <span
        className="mt-1.5 text-[10px] sm:text-[11px] font-black tracking-[0.22em] uppercase"
        style={{ color: `${hex}cc` }}
      >
        {unit}
      </span>
    </div>
  );
}

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
    daysUnit: "Days",
    thisWeek: "This Week",
    noExamsThisWeek: "No exams this week",
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
    recommendedHeading: "Recommended for You",
    tryRizz: "Try Rizz",
    completePractice: "Complete a practice paper",
    toLabel: "to",
    yourVibeHeading: "Your Vibe",
    learningStyleLabel: "Learning Style",
    bestTimeLabel: "Best Time",
    proTipHeading: "Pro-Tip for Your Style",
    consistencyTip: "Consistency is the key to mastering any subject.",
    openPlanBtn: "Open your plan",
    nextMilestoneTitle: "Next Milestone",
    personalBestsTitle: "Personal Bests",
    faqHeading: "FAQ",
    trialBannerDay: "day",
    trialBannerDays: "days",
    trialBannerLeft: "left in your free trial",
    trialBannerUpgrade: "Upgrade now",
    lapsedBannerMsg: "Your Brain Boost trial has ended.",
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
    subTrialEnds: "Trial ends",
    subGraceEnds: "Grace ends",
    subNextRenewal: "Next renewal",
    dayLeft: "day left",
    daysLeft: "days left",
    statusManageLabel: "Manage",
    prelimsFallback: "Aug – Sept (provincial)",
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
    daysUnit: "Dae",
    thisWeek: "Hierdie Week",
    noExamsThisWeek: "Geen eksamens hierdie week nie",
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
    recommendedHeading: "Wat Nou?",
    tryRizz: "Vra vir Rizz se hulp",
    completePractice: "Doen 'n paar oefenvrae",
    toLabel: "tot",
    yourVibeHeading: "Jou Leerstyl",
    learningStyleLabel: "Leerstyl",
    bestTimeLabel: "Beste Tyd",
    proTipHeading: "Wenk net vir Jou",
    consistencyTip: "Konsekwentheid is die sleutel tot bemeestering.",
    openPlanBtn: "Open jou plan",
    nextMilestoneTitle: "Volgende Mylpaal",
    personalBestsTitle: "Persoonlike Rekords",
    faqHeading: "Gereelde Vrae",
    trialBannerDay: "dag",
    trialBannerDays: "dae",
    trialBannerLeft: "oor in jou gratis proeftydperk",
    trialBannerUpgrade: "Opgradeer nou",
    lapsedBannerMsg: "Jou Brain Boost proeftydperk het geëindig.",
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
    subTrialEnds: "Proef eindig",
    subGraceEnds: "Grasie eindig",
    subNextRenewal: "Volgende hernuwing",
    dayLeft: "dag oor",
    daysLeft: "dae oor",
    statusManageLabel: "Sien meer",
    prelimsFallback: "Aug – Sept (per provinsie)",
  },
} as const;

// Task #819 step 12 — isolates the 1Hz tick to a ~10-line subtree.
// Previously the countdown state lived on DashboardPage, so every
// setInterval fire re-rendered the entire ~2,000-line dashboard.
function CountdownDigits({
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
          textShadow: `0 0 10px ${hex}66`,
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

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Prelim dates are school-set (Task #359). The earliest learner/school prelim
  // entry — if any — drives the countdown; otherwise the strip prompts the
  // learner to add their dates instead of showing a hardcoded fallback.
  const { data: prelimData } = useQuery<{ exams: Array<{ examDate: string; startTime: string; subjectName: string; paperNumber: number }>; count: number }>({
    queryKey: ["/api/learner/prelim-exams"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const earliestPrelim = (prelimData?.exams || [])
    .slice()
    .sort((a, b) => `${a.examDate}T${a.startTime}`.localeCompare(`${b.examDate}T${b.startTime}`))[0];
  const PRELIMS_DATE = earliestPrelim
    ? new Date(`${earliestPrelim.examDate}T${earliestPrelim.startTime}:00+02:00`)
    : null;
  const FINALS_DATE  = new Date("2026-10-25T08:00:00+02:00");

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
    cyan:   { hex: "#28c9d6", halo: "rgba(40,201,214,0.28)" },
    blue:   { hex: "#4f8cd9", halo: "rgba(79,140,217,0.28)" },
    yellow: { hex: "#ffd83a", halo: "rgba(255,216,58,0.28)" },
    pink:   { hex: "#e6519c", halo: "rgba(230,81,156,0.28)" },
  };
  const ac = accentMap[prepStatus.accent];

  const getGreeting = () => {
    const h = new Date().getHours();
    const n = user?.firstName || "Legend";
    const key = h < 12 ? t.greetMorning : h < 17 ? t.greetAfternoon : t.greetEvening;
    return key.replace("{name}", n);
  };

  const selectedSubjectIds = profile?.selectedSubjects || [];
  const filteredSubjects = selectedSubjectIds.length > 0
    ? subjects?.filter((s: any) => selectedSubjectIds.includes(s.id))
    : (subjects ?? []);

  const navLinks = NAV_LINKS(t);

  return (
    <div className="min-h-screen relative">
      {/* Cosmic wordmark wash behind the entire dashboard */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 12% 8%,  rgba(255,106,31,0.10) 0%, transparent 60%)," +
            "radial-gradient(ellipse 55% 45% at 88% 6%,  rgba(230,81,156,0.10) 0%, transparent 60%)," +
            "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(40,201,214,0.10) 0%, transparent 65%)," +
            "#000",
        }}
      />
      <div className="relative z-10">
      <BadgePopup badgeCode={popupBadge} isAf={isAf} onDismiss={dismissPopup} />
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md" style={{ borderBottom: "1px solid rgba(40,201,214,0.28)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            <div className="flex items-center gap-3">
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(({ href, icon: Icon, label }) => {
                  const active = location === href;
                  return (
                    <Link key={href} href={href}>
                      <button
                        title={label}
                        aria-label={label}
                        data-testid={`nav-icon-${href.replace(/\//g, "")}`}
                        className="flex items-center justify-center w-9 h-9 rounded-lg transition-all"
                        style={active ? {
                          background: "#000",
                          border: "1px solid #28c9d6",
                          color: "#28c9d6",
                          boxShadow: "0 0 12px rgba(40,201,214,0.5), inset 0 0 8px rgba(40,201,214,0.2)",
                        } : { color:"#ffffff" }}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-1.5">
              <NotificationsPanel isAf={isAf} />
              <button
                onClick={toggleLanguage}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-white px-2 py-1 rounded-full bg-black"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                data-testid="button-language-toggle"
              >
                {language === "en" ? "EN" : "AF"}
              </button>
              <button
                onClick={() => logout()}
                className="text-white hover:text-white transition-colors p-1.5 rounded-lg"
                data-testid="button-logout"
                title={t.signOutLabel}
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-white hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                onClick={() => setMobileOpen(v => !v)}
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-black px-4 py-3 space-y-1" style={{ borderTop: "1px solid rgba(40,201,214,0.2)" }}>
            {navLinks.map(({ href, icon: Icon, label }) => {
              const active = location === href;
              return (
                <Link key={href} href={href}>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={active ? { color: "#28c9d6", border: "1px solid #28c9d6", boxShadow: "0 0 10px rgba(40,201,214,0.3)" } : { color:"#ffffff" }}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <RescuePackAlert isAf={isAf} />

        {/* ─── ≤48 h urgent trial-ending banner (dismissible per session) ─── */}
        {subscription && subscription.status === "trial" && (
          <TrialEndingBanner trialEndsAt={subscription.trialEndsAt ?? null} />
        )}

        {/* ─── Subscription status banner (>48 h remaining) ─── */}
        {subscription && subscription.status === "trial" && (() => {
          const endsAt = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
          const msLeft = endsAt ? endsAt.getTime() - Date.now() : null;
          if (msLeft !== null && msLeft <= 48 * 60 * 60 * 1000) return null;
          const daysLeft = endsAt
            ? Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / 86_400_000))
            : null;
          const dayWord = daysLeft === 1 ? t.trialBannerDay : t.trialBannerDays;
          const urgent = daysLeft !== null && daysLeft <= 3;
          const hex = urgent ? "#e6519c" : "#ffd83a";
          return (
            <div
              data-testid="subscription-trial-banner"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5"
              style={{
                background: `linear-gradient(135deg, ${hex}11 0%, transparent 60%), #000`,
                border: `1px solid ${hex}55`,
                boxShadow: `0 0 18px ${hex}22`,
              }}
            >
              <div className="flex items-center gap-3">
                <Timer className="w-4 h-4 shrink-0" style={{ color: hex }} />
                <span className="text-sm font-semibold" style={{ color: hex }}>
                  {daysLeft !== null
                    ? `${daysLeft} ${dayWord} ${t.trialBannerLeft}`
                    : t.trialBannerLeft}
                </span>
              </div>
              <Link href="/subscribe">
                <button
                  className="rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all"
                  style={{
                    background: hex,
                    color: "#000",
                    boxShadow: `0 0 12px ${hex}66`,
                  }}
                >
                  {t.trialBannerUpgrade}
                </button>
              </Link>
            </div>
          );
        })()}

        {subscription && subscription.status === "lapsed" && (
          <div
            data-testid="subscription-lapsed-banner"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5"
            style={{
              background: "linear-gradient(135deg, rgba(230,81,156,0.10) 0%, transparent 60%), #000",
              border: "1px solid rgba(230,81,156,0.45)",
              boxShadow: "0 0 18px rgba(230,81,156,0.15)",
            }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 text-pink-400" />
              <span className="text-sm font-semibold text-pink-400">
                {t.lapsedBannerMsg}
              </span>
            </div>
            <Link href="/subscribe">
              <button
                className="rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all"
                style={{
                  background: "#e6519c",
                  color: "#000",
                  boxShadow: "0 0 12px rgba(230,81,156,0.5)",
                }}
              >
                <RefreshCcw className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                {t.lapsedBannerCta}
              </button>
            </Link>
          </div>
        )}

        {/* ═══ Premium Command Bridge Hero ═══ */}
        {(() => {
          const acc = stats?.accuracy ?? 0;
          const streak = stats?.studyStreak ?? 0;
          const qAnswered = stats?.questionsAnswered ?? 0;
          const papers = stats?.papersCompleted ?? 0;
          const readiness = calcReadiness({ accuracy: acc, studyStreak: streak, questionsAnswered: qAnswered });
          const tier =
            readiness >= 85 ? { label: t.tierPlatinum, hex: "#28c9d6" } :
            readiness >= 65 ? { label: t.tierGold,     hex: "#ffd83a" } :
            readiness >= 40 ? { label: t.tierSilver,   hex: "#8e7cdc" } :
                              { label: t.tierBronze,   hex: "#ff8a1f" };
          const R = 48;
          const C = 2 * Math.PI * R;
          const offset = C - (readiness / 100) * C;
          const firstName = user?.firstName || t.legendLabel;
          const h = new Date().getHours();
          const tod = h < 12 ? t.greetingMorning : h < 17 ? t.greetingAfternoon : t.greetingEvening;
          const subline = h < 12
            ? t.greetingSubMorning
            : h < 17
            ? t.greetingSubAfternoon
            : t.greetingSubEvening;

          /* Next-tier distance hint */
          const nextTierAt = readiness >= 85 ? null : readiness >= 65 ? 85 : readiness >= 40 ? 65 : 40;
          const nextTierLabel = readiness >= 65 ? t.tierPlatinum
                              : readiness >= 40 ? t.tierGold
                              : t.tierSilver;
          const distance = nextTierAt !== null ? nextTierAt - readiness : 0;

          return (
              <div
                className="relative overflow-hidden rounded-3xl bg-black p-6 sm:p-7"
                style={{
                  border: `1px solid ${tier.hex}55`,
                  boxShadow: `0 0 0 1px ${tier.hex}22, 0 18px 50px -22px ${tier.hex}66`,
                }}
                data-testid="learner-command-hero"
              >
                {/* Rainbow hairline */}
                <div
                  aria-hidden
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg, #ff6a1f, #ff8a1f, #ffb020, #ffd83a, #28c9d6, #4f8cd9, #8e7cdc, #b066d6, #e6519c)" }}
                />
                {/* Subtle tier aura */}
                <div
                  aria-hidden
                  className="absolute -right-16 -top-12 w-[280px] h-[280px] rounded-full blur-3xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${tier.hex}26, transparent 70%)` }}
                />

                {/* ── Meta row ── */}
                <div className="relative flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                      style={{ border: `1px solid ${tier.hex}`, boxShadow: `0 0 12px ${tier.hex}44` }}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ background: tier.hex, boxShadow: `0 0 6px ${tier.hex}` }} />
                      <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: tier.hex }}>
                        {tier.label}
                      </span>
                    </div>
                    {streak > 0 && (() => {
                      const sHex =
                        streak >= 30 ? "#e6519c" :
                        streak >= 14 ? "#ff6a1f" :
                        streak >= 7  ? "#ff8a1f" :
                        streak >= 3  ? "#ffb020" : "#ffd83a";
                      return (
                        <div
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                          style={{ border: `1px solid ${sHex}`, boxShadow: `0 0 12px ${sHex}55` }}
                          data-testid="streak-badge"
                        >
                          <Flame className="w-3 h-3" style={{ color: sHex, filter: `drop-shadow(0 0 4px ${sHex})` }} />
                          <span className="text-[11px] font-black tabular-nums leading-none" style={{ color: sHex }}>
                            {streak}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: sHex }}>
                            {streak === 1 ? t.dayLabel : t.daysLabel}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full progress-hero-pulse" style={{ background: "#28c9d6", boxShadow: "0 0 6px #28c9d6" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white">
                      {t.liveSession}
                    </span>
                  </div>
                </div>

                {/* ── Greeting + compact dial ── */}
                <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] items-center">
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-[11px] sm:text-xs uppercase tracking-[0.22em] mb-1.5">
                      {tod}
                    </p>
                    <h1
                      className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.02]"
                      style={{
                        background: "linear-gradient(90deg, #ff6a1f, #ffb020, #ffd83a, #28c9d6, #8e7cdc, #e6519c)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {firstName}.
                    </h1>
                    <p className="text-white font-medium text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                      {subline}
                      {nextTierAt !== null && distance > 0 && (
                        <>
                          {" "}
                          <span className="font-black" style={{ color: tier.hex }}>
                            {distance}%
                          </span>{" "}
                          <span className="text-white">
                            {`${t.toLabel} ${nextTierLabel}.`}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Compact readiness dial — 132×132 */}
                  {(() => {
                    const cx = 66, cy = 66;
                    const rInner = 52;
                    const cInner = 2 * Math.PI * rInner;
                    const innerOffset = cInner - (readiness / 100) * cInner;
                    return (
                      <div className="relative mx-auto sm:mx-0 flex-shrink-0">
                        <svg width="132" height="132" viewBox="0 0 132 132" role="presentation" aria-hidden="true">
                          <defs>
                            <linearGradient id="dashReadinessStrokeMini" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%"   stopColor="#ff6a1f" />
                              <stop offset="25%"  stopColor="#ffd83a" />
                              <stop offset="55%"  stopColor="#28c9d6" />
                              <stop offset="80%"  stopColor="#8e7cdc" />
                              <stop offset="100%" stopColor="#e6519c" />
                            </linearGradient>
                            <filter id="dashReadinessGlowMini" x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur stdDeviation="2.5" result="b" />
                              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                          </defs>
                          {/* track */}
                          <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                          {/* progress */}
                          <circle
                            cx={cx} cy={cy} r={rInner}
                            fill="none"
                            stroke="url(#dashReadinessStrokeMini)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={cInner}
                            strokeDashoffset={innerOffset}
                            transform={`rotate(-90 ${cx} ${cy})`}
                            filter="url(#dashReadinessGlowMini)"
                            style={{ transition: "stroke-dashoffset 900ms ease-out" }}
                          />
                          {/* centre value */}
                          <text x={cx} y={cy + 6} textAnchor="middle"
                            data-testid="hero-readiness-value"
                            style={{
                              fontFamily: '"JetBrains Mono", "Sora", monospace',
                              fontSize: "30px", fontWeight: 900, fill: tier.hex,
                              filter: `drop-shadow(0 0 10px ${tier.hex}cc)`,
                            }}>
                            {readiness}
                          </text>
                          <text x={cx} y={cy + 22} textAnchor="middle"
                            style={{ fontFamily: "Sora, sans-serif", fontSize: "8px", fontWeight: 800, letterSpacing: "0.24em", fill: "#ffffff" }}>
                            {t.readinessLabel}
                          </text>
                        </svg>
                      </div>
                    );
                  })()}
                </div>

                {/* ── Slim countdown row — Days only ── */}
                <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
                  {([
                    {
                      label: t.prelimsLabel,
                      sub: earliestPrelim
                        ? new Date(earliestPrelim.examDate + "T00:00:00").toLocaleDateString(isAf ? "af-ZA" : "en-ZA", { day: "numeric", month: "short", year: "numeric" })
                        : t.prelimsFallback,
                      hex: "#28c9d6",
                      target: PRELIMS_DATE,
                      testid: "countdown-prelims",
                      empty: !earliestPrelim,
                    },
                    { label: t.finalsLabel, sub: "25 Oct 2026", hex: "#ff8a1f", target: FINALS_DATE, testid: "countdown-finals", empty: false },
                  ] as const).map(({ label, sub, hex, target, testid, empty }) => {
                    if (empty || !target) {
                      return (
                        <Link
                          key={label}
                          href="/settings"
                          className="relative rounded-xl bg-black p-3 flex items-center justify-between gap-3"
                          style={{
                            border: `1px solid ${hex}44`,
                            boxShadow: `0 0 14px ${hex}1a`,
                          }}
                          data-testid={`${testid}-empty`}
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: hex }}>
                              {label}
                            </span>
                            <span className="text-[11px] text-white mt-0.5">{sub}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-black" style={{ color: hex, border: `1px solid ${hex}` }}>
                            {t.setupLink}
                          </span>
                        </Link>
                      );
                    }
                    return (
                      <div
                        key={label}
                        className="relative rounded-xl bg-black p-3 flex items-center justify-between gap-3"
                        style={{
                          border: `1px solid ${hex}55`,
                          boxShadow: `0 0 14px ${hex}1f`,
                        }}
                        data-testid={testid}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: hex, boxShadow: `0 0 6px ${hex}` }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: hex }}>
                              {label}
                            </span>
                          </div>
                          <span className="text-[11px] text-white mt-1">{sub}</span>
                        </div>
                        <CountdownDigits
                          target={target}
                          hex={hex}
                          dayLabel={t.dayLabel}
                          daysLabel={t.daysLabel}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        {/* Prep status banner — cosmic neon */}
        <div
          className="relative rounded-2xl bg-black p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
          style={{
            border: `1.5px solid ${ac.hex}`,
            boxShadow: `0 0 0 1px ${ac.halo}, 0 0 32px ${ac.halo}, inset 0 0 24px rgba(0,0,0,0.6)`,
          }}
          data-testid="prep-status-indicator"
        >
          {/* corner brackets */}
          <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: ac.hex }} />
          <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: ac.hex }} />
          <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: ac.hex }} />
          <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: ac.hex }} />

          <div className="flex items-center gap-5 relative">
            <div
              className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shrink-0"
              style={{
                border: `1.5px solid ${ac.hex}`,
                boxShadow: `0 0 18px ${ac.halo}, inset 0 0 12px ${ac.halo}`,
              }}
            >
              {(() => { const Icon = prepStatus.icon; return <Icon className="w-7 h-7" style={{ color: ac.hex, filter: `drop-shadow(0 0 6px ${ac.halo})` }} />; })()}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: `${ac.hex}cc` }}>
                {t.yourStatus}
              </p>
              <p className="text-3xl font-bold" style={{ color: ac.hex, textShadow: `0 0 16px ${ac.halo}` }} data-testid="prep-status-label">
                {isAf ? prepStatus.labelAf : prepStatus.label}
              </p>
            </div>
          </div>
          <p className="text-white font-semibold text-lg flex-1 md:text-center leading-snug relative" data-testid="prep-status-message">
            {isAf ? prepStatus.messageAf : prepStatus.message}
          </p>
          <Link href="/progress" className="relative">
            <button
              className="shrink-0 px-5 py-2.5 rounded-xl bg-black font-bold text-sm transition-none"
              style={{
                color: ac.hex,
                border: `1.5px solid ${ac.hex}`,
                boxShadow: `0 0 14px ${ac.halo}`,
              }}
              data-testid="button-view-details"
            >
              {t.viewDetails}
            </button>
          </Link>
        </div>

        {/* Compact subscription status banner */}
        {subscription && (() => {
          const status = subscription.status;
          const statusConfig: Record<string, { label: string; labelAf: string; hex: string; halo: string }> = {
            active: { label: "Active",       labelAf: "Aktief",         hex: "#28c9d6", halo: "rgba(40,201,214,0.22)"  },
            trial:  { label: "Free Trial",   labelAf: "Gratis Proef",   hex: "#ffd83a", halo: "rgba(255,216,58,0.22)"  },
            grace:  { label: "Grace Period", labelAf: "Grasietydperk",  hex: "#ff8a1f", halo: "rgba(255,138,31,0.22)"  },
            lapsed: { label: "Lapsed",       labelAf: "Verval",         hex: "#e6519c", halo: "rgba(230,81,156,0.22)"  },
          };
          const sc = statusConfig[status] ?? statusConfig["lapsed"];

          const fmt = (iso: string | null | undefined) => {
            if (!iso) return null;
            return new Date(iso).toLocaleDateString(isAf ? "af-ZA" : "en-ZA", { day: "numeric", month: "short", year: "numeric" });
          };

          const trialDaysLeft = (() => {
            if (status !== "trial" || !subscription.trialEndsAt) return null;
            return Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000));
          })();

          const dateVal = (() => {
            if (status === "trial") return fmt(subscription.trialEndsAt);
            if (status === "grace") return fmt(subscription.gracePeriodEndsAt);
            return fmt(subscription.nextRenewalAt);
          })();

          const dateLabel = (() => {
            if (status === "trial") return t.subTrialEnds;
            if (status === "grace") return t.subGraceEnds;
            return t.subNextRenewal;
          })();

          return (
            <div
              className="flex items-center gap-4 rounded-2xl bg-black px-4 py-3"
              style={{ border: `1px solid ${sc.hex}55`, boxShadow: `0 0 16px ${sc.halo}` }}
              data-testid="sub-status-banner"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0"
                  style={{ border: `1.5px solid ${sc.hex}`, boxShadow: `0 0 10px ${sc.halo}` }}
                >
                  <CreditCard className="w-4 h-4" style={{ color: sc.hex }} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-black"
                    style={{ color: sc.hex, border: `1px solid ${sc.hex}`, boxShadow: `0 0 8px ${sc.halo}` }}
                  >
                    {isAf ? sc.labelAf : sc.label}
                  </span>
                  {trialDaysLeft !== null && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" style={{ color: "#ffd83a" }} />
                      {trialDaysLeft} {trialDaysLeft === 1 ? t.dayLeft : t.daysLeft}
                    </span>
                  )}
                  {dateVal && (
                    <span className="text-[11px] text-muted-foreground">
                      {dateLabel}: <span className="font-semibold" style={{ color: sc.hex }}>{dateVal}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Dynamic Study Plan widget — Top 3 weak topics + Readiness Scores
            (elevated above stat cards so it's the primary actionable element) */}
        <LearnerStudyPlan isAf={isAf} />

        {/* Stat cards — pure black with hex-neon per wordmark stop (LIVE) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t.studyStreak,      value: stats?.studyStreak ?? 0,       suffix: "",  sub: t.daysInARow,   Icon: Flame,         hex: "#ff8a1f", halo: "rgba(255,138,31,0.32)", testid: "card-stat-streak",     statTestid: "stat-streak"     },
            { label: t.questionsAnswered, value: stats?.questionsAnswered ?? 0, suffix: "",  sub: t.answeredLabel, Icon: Zap,           hex: "#4f8cd9", halo: "rgba(79,140,217,0.30)", testid: "card-stat-questions",  statTestid: "stat-questions"  },
            { label: t.accuracy,          value: stats?.accuracy ?? 0,          suffix: "%", sub: t.averageLabel,  Icon: Target,        hex: "#b066d6", halo: "rgba(176,102,214,0.32)", testid: "card-stat-accuracy",   statTestid: "stat-accuracy"   },
            { label: t.papersCompleted,   value: stats?.papersCompleted ?? 0,   suffix: "",  sub: t.completedLabel, Icon: CalendarCheck, hex: "#8e7cdc", halo: "rgba(142,124,220,0.30)", testid: "card-stat-papers",     statTestid: "stat-papers"     },
          ].map(({ label, value, suffix, sub, Icon, hex, halo, testid, statTestid }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-2xl bg-black p-3 sm:p-5"
              style={{
                border: `1.5px solid ${hex}`,
                boxShadow: `0 0 0 1px ${hex}44, 0 0 20px ${halo}, inset 0 0 16px rgba(0,0,0,0.55)`,
              }}
              data-testid={testid}
            >
              {/* neon top bar */}
              <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: hex, boxShadow: `0 0 8px ${hex}` }} />
              {/* corner brackets */}
              <span aria-hidden className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: hex }} />
              <span aria-hidden className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: hex }} />
              {/* soft aura */}
              <div aria-hidden className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle, ${halo}, transparent 70%)` }} />

              <div className="relative flex items-start gap-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black flex items-center justify-center shrink-0"
                  style={{
                    border: `1.5px solid ${hex}`,
                    boxShadow: `0 0 14px ${halo}, inset 0 0 10px ${halo}`,
                    color: hex,
                    filter: `drop-shadow(0 0 4px ${halo})`,
                  }}
                >
                  <Icon className="w-5 h-5 sm:w-[26px] sm:h-[26px]" style={{ color: hex }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.22em] mb-1"
                    style={{ color: hex, textShadow: `0 0 8px ${halo}` }}>
                    {label}
                  </p>
                  <LiveCounter
                    value={typeof value === "number" ? value : 0}
                    suffix={suffix}
                    className="text-2xl sm:text-4xl font-black text-white leading-none block"
                    style={{ textShadow: `0 0 14px ${halo}` }}
                    testid={statTestid}
                  />
                  <p className="text-[10px] sm:text-[11px] text-white mt-1">{sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== EXAM-AWARE WIDGETS (T114) ===== */}
        {examWidgets && (examWidgets.nextExam || examWidgets.thisWeekExams?.length > 0) && (
          <div className="space-y-4" data-testid="exam-aware-section">
            {/* Urgency Banner — cosmic neon, wordmark palette */}
            {examWidgets.urgencyBanner && (() => {
              const urgencyColor: Record<string, { hex: string; halo: string }> = {
                red:     { hex: "#e6519c", halo: "rgba(230,81,156,0.28)" }, // pink = final sprint
                amber:   { hex: "#ff8a1f", halo: "rgba(255,138,31,0.28)" }, // orange = exam prep
                blue:    { hex: "#ffd83a", halo: "rgba(255,216,58,0.28)" }, // gold = focused
                emerald: { hex: "#8e7cdc", halo: "rgba(142,124,220,0.28)" },// violet = build
              };
              const u = urgencyColor[examWidgets.urgencyBanner.color] ?? urgencyColor.emerald;
              const Icon =
                examWidgets.urgencyBanner.color === "red"   ? AlertTriangle :
                examWidgets.urgencyBanner.color === "amber" ? Clock :
                examWidgets.urgencyBanner.color === "blue"  ? Target : CheckCircle2;
              return (
                <div
                  className="relative rounded-2xl bg-black p-4 flex items-center gap-4 overflow-hidden"
                  style={{ border: `1.5px solid ${u.hex}`, boxShadow: `0 0 0 1px ${u.halo}, 0 0 22px ${u.halo}, inset 0 0 18px rgba(0,0,0,0.6)` }}
                  data-testid="urgency-banner"
                >
                  <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: u.hex }} />
                  <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: u.hex }} />
                  <span aria-hidden className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: u.hex }} />
                  <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: u.hex }} />
                  <div
                    className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0"
                    style={{ border: `1.5px solid ${u.hex}`, boxShadow: `0 0 14px ${u.halo}, inset 0 0 10px ${u.halo}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: u.hex, filter: `drop-shadow(0 0 4px ${u.halo})` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: u.hex, textShadow: `0 0 10px ${u.halo}` }}>
                      {isAf ? examWidgets.urgencyBanner.labelAf : examWidgets.urgencyBanner.label}
                    </p>
                    <p className="text-xs text-white mt-0.5 truncate">{isAf ? (examWidgets.urgencyBanner.descriptionAf || examWidgets.urgencyBanner.description) : examWidgets.urgencyBanner.description}</p>
                  </div>
                  <Link href="/study-calendar">
                    <button
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-black font-bold text-xs"
                      style={{ color: u.hex, border: `1.5px solid ${u.hex}`, boxShadow: `0 0 12px ${u.halo}` }}
                    >
                      {t.calendarLabel} <ChevronRight className="w-3 h-3 ml-1 inline" />
                    </button>
                  </Link>
                </div>
              );
            })()}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Next Exam Card — cosmic neon, cyan accent */}
              {examWidgets.nextExam && (
                <div
                  className="relative rounded-2xl bg-black overflow-hidden"
                  style={{ border: "1.5px solid #28c9d6", boxShadow: "0 0 0 1px rgba(40,201,214,0.22), 0 0 22px rgba(40,201,214,0.22)" }}
                  data-testid="next-exam-card"
                >
                  <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: "#28c9d6" }} />
                  <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: "#28c9d6" }} />
                  <span aria-hidden className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: "#28c9d6" }} />
                  <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: "#28c9d6" }} />
                  <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(40,201,214,0.25)" }}>
                    <GraduationCap className="w-4 h-4" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px rgba(40,201,214,0.6))" }} />
                    <h3 className="font-bold text-sm" style={{ color: "#28c9d6", textShadow: "0 0 8px rgba(40,201,214,0.4)" }}>
                      {t.nextExam}
                    </h3>
                  </div>
                  <div className="p-5">
                    <p className="font-bold text-white text-base leading-tight">{examWidgets.nextExam.subjectName}</p>
                    <p className="text-xs text-white mt-0.5 mb-3">
                      {t.paperLabel} {examWidgets.nextExam.paperNumber} · {examWidgets.nextExam.startTime}
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 rounded-xl p-3 text-center bg-black"
                        style={{ border: "1px solid rgba(40,201,214,0.4)", boxShadow: "inset 0 0 12px rgba(40,201,214,0.15)" }}
                      >
                        <p className="text-2xl font-bold tabular-nums" style={{ color: "#28c9d6", textShadow: "0 0 10px rgba(40,201,214,0.5)" }} data-testid="next-exam-days">
                          {examWidgets.nextExam.daysRemaining}
                        </p>
                        <p className="text-[10px] font-semibold text-white uppercase">{t.daysUnit}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-xs font-semibold text-white">
                          {formatDate(examWidgets.nextExam.examDate + "T00:00:00", language, { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        <p className="text-[10px] text-white mt-0.5">{examWidgets.nextExam.examDate.slice(0, 7)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* This Week Exams — cosmic neon, orange accent */}
              <div
                className="relative rounded-2xl bg-black overflow-hidden"
                style={{ border: "1.5px solid #ff8a1f", boxShadow: "0 0 0 1px rgba(255,138,31,0.22), 0 0 22px rgba(255,138,31,0.22)" }}
                data-testid="this-week-exams-card"
              >
                <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: "#ff8a1f" }} />
                <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: "#ff8a1f" }} />
                <span aria-hidden className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: "#ff8a1f" }} />
                <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: "#ff8a1f" }} />
                <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(255,138,31,0.25)" }}>
                  <CalendarDays className="w-4 h-4" style={{ color: "#ff8a1f", filter: "drop-shadow(0 0 4px rgba(255,138,31,0.6))" }} />
                  <h3 className="font-bold text-sm" style={{ color: "#ff8a1f", textShadow: "0 0 8px rgba(255,138,31,0.4)" }}>{t.thisWeek}</h3>
                </div>
                <div className="p-5">
                  {examWidgets.thisWeekExams?.length > 0 ? (
                    <div className="space-y-2">
                      {examWidgets.thisWeekExams.slice(0, 3).map((e: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-black" style={{ border: "1px solid rgba(255,138,31,0.35)" }}>
                          <div
                            className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0"
                            style={{ border: "1px solid #ff8a1f", boxShadow: "0 0 10px rgba(255,138,31,0.35)" }}
                          >
                            <span className="text-xs font-bold" style={{ color: "#ff8a1f" }}>P{e.paperNumber}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">{e.subjectName}</p>
                            <p className="text-[10px] text-white">
                              {formatDate(e.examDate + "T00:00:00", language, { weekday: "short", day: "numeric", month: "short" })}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold shrink-0" style={{ color: "#ff8a1f" }}>
                            {e.daysRemaining}{t.daysShort}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <Coffee className="w-8 h-8 text-white/30 mb-2" />
                      <p className="text-xs font-semibold text-white">{t.noExamsThisWeek}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subject Priority Queue — cosmic neon, wordmark palette */}
            {examWidgets.subjectPriorityQueue?.length > 0 && (
              <div
                className="relative rounded-2xl bg-black overflow-hidden"
                style={{ border: "1.5px solid #ffd83a", boxShadow: "0 0 0 1px rgba(255,216,58,0.22), 0 0 22px rgba(255,216,58,0.22)" }}
                data-testid="subject-priority-queue"
              >
                <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: "#ffd83a" }} />
                <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: "#ffd83a" }} />
                <span aria-hidden className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: "#ffd83a" }} />
                <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: "#ffd83a" }} />
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,216,58,0.25)" }}>
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-4 h-4" style={{ color: "#ffd83a", filter: "drop-shadow(0 0 4px rgba(255,216,58,0.6))" }} />
                    <h3 className="font-bold text-sm" style={{ color: "#ffd83a", textShadow: "0 0 8px rgba(255,216,58,0.4)" }}>
                      {t.subjectPriority}
                    </h3>
                  </div>
                  <Link href="/study-calendar">
                    <button className="text-[10px] font-semibold text-white hover:text-white transition-colors">
                      {t.fullPlan} →
                    </button>
                  </Link>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {examWidgets.subjectPriorityQueue.slice(0, 6).map((item: any, i: number) => {
                      const urgencyHex: Record<string, { c: string; h: string }> = {
                        final_sprint:     { c: "#e6519c", h: "rgba(230,81,156,0.28)" },
                        exam_prep_mode:   { c: "#ff8a1f", h: "rgba(255,138,31,0.28)" },
                        focused_revision: { c: "#ffd83a", h: "rgba(255,216,58,0.28)" },
                        build_mastery:    { c: "#8e7cdc", h: "rgba(142,124,220,0.26)"},
                      };
                      const u = urgencyHex[item.urgencyState] ?? urgencyHex.build_mastery;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black"
                          style={{ border: `1px solid ${u.c}`, boxShadow: `0 0 10px ${u.h}, inset 0 0 10px rgba(0,0,0,0.5)` }}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-black"
                            style={{ border: `1px solid ${u.c}`, boxShadow: `0 0 6px ${u.h}` }}
                          >
                            <span className="text-[9px] font-bold" style={{ color: u.c }}>{i + 1}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{item.subjectName}</p>
                            <p className="text-[9px] text-white">
                              {item.daysRemaining} {t.daysAbbr} · P{item.nextPaperNumber}
                            </p>
                          </div>
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: u.c, boxShadow: `0 0 6px ${u.c}` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VARK Style Badge */}
        {varkStyle && (
          <div
            className="relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-black w-fit overflow-hidden"
            style={{ border: "1.5px solid #8e7cdc", boxShadow: "0 0 0 1px rgba(142,124,220,0.22), 0 0 18px rgba(142,124,220,0.22)" }}
            data-testid="vark-style-badge"
          >
            <span aria-hidden className="absolute inset-y-3 left-0 w-[2px] rounded-r" style={{ background: "#8e7cdc", boxShadow: "0 0 8px #8e7cdc" }} />
            <span className="text-2xl pl-1">{varkStyle.icon}</span>
            <div>
              <p className="text-xs uppercase font-semibold tracking-widest" style={{ color: "#8e7cdc", textShadow: "0 0 8px rgba(142,124,220,0.45)" }}>
                {t.yourStyleLabel}
              </p>
              <p className="font-bold text-white text-sm">
                {isAf ? varkStyle.labelAf : varkStyle.label}
                <span className="font-normal text-white"> · {isAf ? varkStyle.taglineAf : varkStyle.tagline}</span>
              </p>
            </div>
          </div>
        )}

        {/* VARK Evolving Nudge — shown when study history reveals a style shift */}
        {varkInsights?.styleEvolving && varkInsights.dominantStyle && (
          <div
            data-testid="vark-evolving-nudge"
            className="flex items-start gap-4 px-5 py-4 rounded-2xl border"
            style={{
              background: "#000",
              borderColor: "rgba(40,201,214,0.45)",
              boxShadow: "0 0 18px rgba(40,201,214,0.22)",
            }}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">
              {varkInsights.dominantStyle === "visual" ? "👁" : varkInsights.dominantStyle === "auditory" ? "🔊" : varkInsights.dominantStyle === "read" ? "📖" : "✏"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm mb-0.5">
                {t.styleEvolving}
              </p>
              <p className="text-white text-xs leading-relaxed">
                {varkInsights.recommendation
                  ? varkInsights.recommendation
                  : isAf
                    ? `Jou studiegeskiedenis wys dat jy die beste presteer met ${varkInsights.dominantStyle}-inhoud.`
                    : `Your study history shows you perform best with ${varkInsights.dominantStyle} content.`}
              </p>
              {varkInsights.autoUpdated && (
                <p className="text-xs font-semibold mt-1.5" style={{ color: "#28c9d6" }}>
                  {t.profileAutoUpdated}
                </p>
              )}
            </div>
            <Link href="/settings" className="flex-shrink-0">
              <button
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-black"
                style={{ color: "#28c9d6", border: "1.5px solid #28c9d6", boxShadow: "0 0 10px rgba(40,201,214,0.4)" }}
              >
                {t.viewLabel}
              </button>
            </Link>
          </div>
        )}

        {/* Quick action cards — cosmic neon, reordered by VARK style */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const allCards = [
              {
                href: "/tutor", testid: "link-smart-tutor", varkKey: "auditory",
                hex: "#b066d6", halo: "rgba(176,102,214,",
                head: <img src={rizzAvatar} alt="Rizz" className="w-14 h-14 rounded-2xl object-cover" style={{ border: "1.5px solid #b066d6", boxShadow: "0 0 14px rgba(176,102,214,0.45)" }} />,
                title: "Rizz",
                sub: t.tutorCardSub,
                cta: t.tutorCardCta,
              },
              {
                href: "/exam-mode", testid: "link-exam-mode", varkKey: "kinesthetic",
                hex: "#4f8cd9", halo: "rgba(79,140,217,",
                head: (
                  <div
                    className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center"
                    style={{ border: "1.5px solid #4f8cd9", boxShadow: "0 0 14px rgba(79,140,217,0.45), inset 0 0 10px rgba(79,140,217,0.25)" }}
                  >
                    <Shield className="w-7 h-7" style={{ color: "#4f8cd9", filter: "drop-shadow(0 0 4px rgba(79,140,217,0.55))" }} />
                  </div>
                ),
                title: t.crunchTitle,
                sub: t.crunchSub,
                cta: t.crunchCta,
              },
              {
                href: "/progress", testid: "link-progress-card", varkKey: "visual",
                hex: "#8e7cdc", halo: "rgba(142,124,220,",
                head: (
                  <div
                    className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center"
                    style={{ border: "1.5px solid #8e7cdc", boxShadow: "0 0 14px rgba(142,124,220,0.45), inset 0 0 10px rgba(142,124,220,0.25)" }}
                  >
                    <TrendingUp className="w-7 h-7" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 4px rgba(142,124,220,0.55))" }} />
                  </div>
                ),
                title: t.progressCardTitle,
                sub: t.progressCardSub,
                cta: t.progressCardCta,
              },
              {
                href: "/daily-challenge", testid: "link-daily-challenge", varkKey: "read",
                hex: "#ff8a1f", halo: "rgba(255,138,31,",
                head: (
                  <div
                    className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center"
                    style={{ border: "1.5px solid #ff8a1f", boxShadow: "0 0 14px rgba(255,138,31,0.45), inset 0 0 10px rgba(255,138,31,0.25)" }}
                  >
                    <Sparkles className="w-7 h-7" style={{ color: "#ff8a1f", filter: "drop-shadow(0 0 4px rgba(255,138,31,0.55))" }} />
                  </div>
                ),
                title: t.dailyChallengeTitle,
                sub: t.dailyChallengeSub,
                cta: t.dailyChallengeCta,
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
                  const ai = preferred.indexOf(a.varkKey);
                  const bi = preferred.indexOf(b.varkKey);
                  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                })
              : allCards;
            return sorted.map(({ href, testid, head, title, sub, cta, hex, halo }) => (
              <Link key={href} href={href} className="block h-full" data-testid={testid}>
                <div
                  className="relative h-full rounded-2xl bg-black p-6 space-y-4 overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer group"
                  style={{
                    border: `1.5px solid ${hex}`,
                    boxShadow: `0 0 0 1px ${halo}0.22), 0 0 22px ${halo}0.22), inset 0 0 18px rgba(0,0,0,0.55)`,
                  }}
                >
                  <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: hex, boxShadow: `0 0 10px ${halo}0.8)` }} />
                  <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: hex }} />
                  <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: hex }} />
                  <span aria-hidden className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: hex }} />
                  <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: hex }} />
                  <div className="relative">{head}</div>
                  <div className="relative">
                    <h3 className="text-lg font-bold text-white leading-tight mb-1" style={{ textShadow: `0 0 10px ${halo}0.35)` }}>{title}</h3>
                    <p className="text-white font-semibold text-sm">{sub}</p>
                  </div>
                  <div
                    className="relative flex items-center font-bold text-xs group-hover:translate-x-1 transition-all"
                    style={{ color: hex, textShadow: `0 0 8px ${halo}0.5)` }}
                  >
                    {cta} <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ));
          })()}
        </div>

        {/* Exam practice — Mini Mock + Full Exam prominent CTAs */}
        <div className="grid sm:grid-cols-2 gap-4" data-testid="section-exam-practice">
          {[
            {
              href: "/exam/mini-mock",
              testid: "link-mini-mock",
              hex: "#28c9d6",
              halo: "rgba(40,201,214,",
              icon: <Zap className="w-7 h-7" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 4px rgba(40,201,214,0.55))" }} />,
              title: t.miniMockTitle,
              sub: t.miniMockSub,
              cta: t.miniMockCta,
            },
            {
              href: "/exam/full",
              testid: "link-full-exam",
              hex: "#e6519c",
              halo: "rgba(230,81,156,",
              icon: <GraduationCap className="w-7 h-7" style={{ color: "#e6519c", filter: "drop-shadow(0 0 4px rgba(230,81,156,0.55))" }} />,
              title: t.fullExamTitle,
              sub: t.fullExamSub,
              cta: t.fullExamCta,
            },
          ].map(({ href, testid, hex, halo, icon, title, sub, cta }) => (
            <Link key={href} href={href} className="block h-full" data-testid={testid}>
              <div
                className="relative h-full rounded-2xl bg-black p-6 overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer group"
                style={{
                  border: `1.5px solid ${hex}`,
                  boxShadow: `0 0 0 1px ${halo}0.22), 0 0 22px ${halo}0.28), inset 0 0 18px rgba(0,0,0,0.55)`,
                }}
              >
                <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: hex, boxShadow: `0 0 10px ${halo}0.8)` }} />
                <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: hex }} />
                <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: hex }} />
                <span aria-hidden className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: hex }} />
                <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: hex }} />
                <div className="relative flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center flex-shrink-0"
                    style={{ border: `1.5px solid ${hex}`, boxShadow: `0 0 14px ${halo}0.45), inset 0 0 10px ${halo}0.25)` }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white leading-tight mb-1" style={{ textShadow: `0 0 10px ${halo}0.35)` }}>{title}</h3>
                    <p className="text-white font-semibold text-sm leading-relaxed">{sub}</p>
                    <div
                      className="mt-3 inline-flex items-center font-bold text-xs group-hover:translate-x-1 transition-all"
                      style={{ color: hex, textShadow: `0 0 8px ${halo}0.5)` }}
                    >
                      {cta} <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Focus Areas — cross-subject mastery gaps (Task #743) */}
        {focusAreasData && (
          <div
            className="relative rounded-2xl bg-black overflow-hidden"
            style={{
              border: "1.5px solid #ff8a1f",
              boxShadow: "0 0 0 1px rgba(255,138,31,0.28), 0 0 28px rgba(255,138,31,0.28), inset 0 0 22px rgba(0,0,0,0.55)",
            }}
            data-testid="panel-focus-areas"
          >
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#ff8a1f" }} />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#ff8a1f" }} />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#ff8a1f" }} />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#ff8a1f" }} />

            <div
              className="flex items-center justify-between px-6 py-5 gap-3"
              style={{ borderBottom: "1px solid rgba(255,138,31,0.35)" }}
            >
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Target className="w-5 h-5" style={{ color: "#ff8a1f", filter: "drop-shadow(0 0 6px rgba(255,138,31,0.8))" }} />
                  {t.focusAreasHeading}
                </h2>
                <p className="text-xs text-white/70 mt-1">{t.focusAreasSubtitle}</p>
              </div>
            </div>
            {focusAreasData.focusAreas.length === 0 ? (
              <div className="p-6 text-center">
                <div
                  className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-black flex items-center justify-center"
                  style={{ border: "1.5px solid #ff8a1f", boxShadow: "0 0 14px rgba(255,138,31,0.4)" }}
                >
                  <Sparkles className="w-7 h-7" style={{ color: "#ff8a1f", filter: "drop-shadow(0 0 5px #ff8a1f)" }} />
                </div>
                <p className="text-sm text-white/80" data-testid="text-focus-areas-empty">{t.focusAreasEmpty}</p>
              </div>
            ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {focusAreasData.focusAreas.map((fa) => {
                const isRed = fa.masteryBand === "red";
                const hex = isRed ? "#ff5b6e" : "#ffd83a";
                const halo = isRed ? "rgba(255,91,110,0.28)" : "rgba(255,216,58,0.28)";
                const bandLabel = isRed ? t.focusBandCatchUp : t.focusBandBuilding;
                const topicName = language === "af" && fa.topicNameAfrikaans ? fa.topicNameAfrikaans : fa.topicName;
                const subjectName = language === "af" && fa.subjectNameAfrikaans ? fa.subjectNameAfrikaans : fa.subjectName;
                return (
                  <Link key={`${fa.subjectId}-${fa.topicId}`} href={`/subject/${fa.subjectId}?topicId=${fa.topicId}`}>
                    <div
                      className="group relative rounded-2xl bg-black p-4 cursor-pointer transition-all hover:-translate-y-0.5 h-full"
                      style={{ border: `1px solid ${hex}66`, boxShadow: `0 0 12px ${halo}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = hex; e.currentTarget.style.boxShadow = `0 0 22px ${hex}99`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${hex}66`; e.currentTarget.style.boxShadow = `0 0 12px ${halo}`; }}
                      data-testid={`focus-area-${fa.topicId}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                          style={{ color: hex, border: `1px solid ${hex}88`, boxShadow: `0 0 8px ${halo}` }}
                        >
                          {bandLabel}
                        </span>
                        <span className="text-xs font-bold" style={{ color: hex }}>
                          {fa.masteryScore}%
                        </span>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-white/60 truncate">{subjectName}</p>
                      <p className="text-sm font-bold text-white mt-0.5 line-clamp-2">{topicName}</p>
                      <div className="flex items-center justify-end mt-2">
                        <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* Subjects + Achievements — cosmic neon */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Subjects panel */}
          <div
            className="lg:col-span-2 relative rounded-2xl bg-black overflow-hidden"
            style={{
              border: "1.5px solid #4f8cd9",
              boxShadow: "0 0 0 1px rgba(79,140,217,0.28), 0 0 28px rgba(79,140,217,0.28), inset 0 0 22px rgba(0,0,0,0.55)",
            }}
          >
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#4f8cd9" }} />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#4f8cd9" }} />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#4f8cd9" }} />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#4f8cd9" }} />

            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid rgba(79,140,217,0.35)" }}
            >
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <BookOpen className="w-5 h-5" style={{ color: "#4f8cd9", filter: "drop-shadow(0 0 6px rgba(79,140,217,0.8))" }} />
                {t.subjectsHeading}
              </h2>
              <Link href="/settings">
                <button
                  className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-black"
                  style={{ color: "#4f8cd9", border: "1px solid rgba(79,140,217,0.55)", boxShadow: "0 0 10px rgba(79,140,217,0.3)" }}
                  data-testid="link-manage-subjects"
                >
                  <Settings className="w-3.5 h-3.5 inline mr-1" />{t.manageLabel}
                </button>
              </Link>
            </div>
            <div className="p-6">
              {subjectsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
                </div>
              ) : filteredSubjects && filteredSubjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(() => {
                    const stops = ["#ff8a1f", "#ffd83a", "#28c9d6", "#4f8cd9", "#8e7cdc", "#b066d6", "#e6519c"];
                    return filteredSubjects.map((subject: any, idx: number) => {
                      const hex = stops[idx % stops.length];
                      const haloHex = `${hex}55`;
                      const initial = (subject.name || "?").trim().charAt(0).toUpperCase();
                      return (
                        <Link key={subject.id} href={`/subject/${subject.id}`}>
                          <div
                            className="group relative rounded-2xl bg-black p-4 cursor-pointer transition-all hover:-translate-y-0.5"
                            style={{ border: `1px solid ${hex}66`, boxShadow: `0 0 12px ${haloHex}` }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = hex; e.currentTarget.style.boxShadow = `0 0 22px ${hex}99`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${hex}66`; e.currentTarget.style.boxShadow = `0 0 12px ${haloHex}`; }}
                            data-testid={`subject-card-${subject.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 font-bold text-base"
                                style={{
                                  color: hex,
                                  border: `1.5px solid ${hex}`,
                                  boxShadow: `0 0 12px ${haloHex}, inset 0 0 8px ${haloHex}`,
                                  textShadow: `0 0 8px ${haloHex}`,
                                }}
                              >
                                {initial}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-white text-sm truncate">{subject.name}</p>
                                <p className="text-[10px] text-white mt-0.5 uppercase tracking-wider">{subject.category}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-white group-hover:text-white transition-colors shrink-0" style={{}} />
                            </div>
                          </div>
                        </Link>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-black flex items-center justify-center"
                    style={{ border: "1.5px solid #4f8cd9", boxShadow: "0 0 14px rgba(79,140,217,0.4)" }}
                  >
                    <BookOpen className="w-8 h-8" style={{ color: "#4f8cd9", filter: "drop-shadow(0 0 5px #4f8cd9)" }} />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">{t.selectSubjectsHeading}</h3>
                  <p className="text-white text-sm mb-6">{t.selectSubjectsDesc}</p>
                  <Link href="/settings">
                    <button
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-black font-bold text-sm"
                      style={{ color: "#4f8cd9", border: "1.5px solid #4f8cd9", boxShadow: "0 0 16px rgba(79,140,217,0.5)" }}
                      data-testid="button-select-subjects"
                    >
                      {t.selectSubjectsBtn}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Achievements panel */}
          <div
            className="relative rounded-2xl bg-black overflow-hidden flex flex-col"
            style={{
              border: "1.5px solid #ffd83a",
              boxShadow: "0 0 0 1px rgba(255,216,58,0.28), 0 0 28px rgba(255,216,58,0.28), inset 0 0 22px rgba(0,0,0,0.55)",
            }}
          >
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#ffd83a" }} />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#ffd83a" }} />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#ffd83a" }} />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#ffd83a" }} />

            <div
              className="flex items-center gap-2 px-6 py-5"
              style={{ borderBottom: "1px solid rgba(255,216,58,0.35)" }}
            >
              <Award className="w-5 h-5" style={{ color: "#ffd83a", filter: "drop-shadow(0 0 6px rgba(255,216,58,0.85))" }} />
              <h2 className="text-lg font-bold text-white">{t.achievementsHeading}</h2>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const stops = ["#ff8a1f", "#ffd83a", "#28c9d6", "#4f8cd9", "#8e7cdc", "#b066d6", "#e6519c", "#ff6a1f"];
                    return badges.slice(0, 8).map((badge: any, idx: number) => {
                      const info = BADGE_INFO[badge.badgeCode];
                      if (!info) return null;
                      const Icon = info.icon;
                      const hex = stops[idx % stops.length];
                      return (
                        <div
                          key={badge.id}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-black cursor-default transition-all hover:-translate-y-0.5"
                          style={{ border: `1px solid ${hex}66`, boxShadow: `0 0 10px ${hex}44` }}
                          data-testid={`badge-${badge.badgeCode}`}
                        >
                          <div
                            className="w-11 h-11 rounded-xl bg-black flex items-center justify-center"
                            style={{ border: `1.5px solid ${hex}`, boxShadow: `0 0 12px ${hex}66, inset 0 0 8px ${hex}55` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex})` }} />
                          </div>
                          <span className="text-[9px] font-semibold text-white text-center leading-tight">
                            {isAf ? info.nameAfrikaans : info.name}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div
                    className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-black flex items-center justify-center"
                    style={{ border: "1.5px solid #ffd83a", boxShadow: "0 0 14px rgba(255,216,58,0.4)" }}
                  >
                    <Trophy className="w-8 h-8" style={{ color: "#ffd83a", filter: "drop-shadow(0 0 5px #ffd83a)" }} />
                  </div>
                  <p className="text-white font-semibold text-sm">{t.startLearningToUnlock}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended + Your Vibe — cosmic neon */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div
            className="relative rounded-2xl bg-black overflow-hidden"
            style={{
              border: "1.5px solid #28c9d6",
              boxShadow: "0 0 0 1px rgba(40,201,214,0.28), 0 0 28px rgba(40,201,214,0.28), inset 0 0 22px rgba(0,0,0,0.55)",
            }}
          >
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#28c9d6" }} />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#28c9d6" }} />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#28c9d6" }} />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#28c9d6" }} />
            <div className="flex items-center gap-2 px-6 py-5" style={{ borderBottom: "1px solid rgba(40,201,214,0.35)" }}>
              <Sparkles className="w-5 h-5" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 6px rgba(40,201,214,0.85))" }} />
              <h2 className="text-lg font-bold text-white">{t.recommendedHeading}</h2>
            </div>
            <div className="p-5 space-y-3">
              {(() => {
                const items = [
                  { href: "/tutor", num: 1, hex: "#28c9d6", label: t.tryRizz },
                  { href: "/subjects",    num: 2, hex: "#8e7cdc", label: t.completePractice },
                ];
                return items.map(({ href, num, hex, label }) => (
                  <Link key={href} href={href}>
                    <div
                      className="group flex items-center gap-3 p-3.5 rounded-2xl bg-black cursor-pointer transition-all hover:-translate-y-0.5"
                      style={{ border: `1px solid ${hex}55`, boxShadow: `0 0 12px ${hex}33` }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = hex; e.currentTarget.style.boxShadow = `0 0 22px ${hex}88`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${hex}55`; e.currentTarget.style.boxShadow = `0 0 12px ${hex}33`; }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl bg-black flex items-center justify-center font-bold text-base shrink-0"
                        style={{ color: hex, border: `1.5px solid ${hex}`, boxShadow: `0 0 12px ${hex}66, inset 0 0 8px ${hex}44`, textShadow: `0 0 8px ${hex}88` }}
                      >
                        {num}
                      </div>
                      <p className="flex-1 font-semibold text-white group-hover:text-white text-sm transition-colors">{label}</p>
                      <ChevronRight className="w-4 h-4 text-white group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ));
              })()}
            </div>
          </div>

          <div
            className="relative rounded-2xl bg-black overflow-hidden"
            style={{
              border: "1.5px solid #8e7cdc",
              boxShadow: "0 0 0 1px rgba(142,124,220,0.3), 0 0 28px rgba(142,124,220,0.3), inset 0 0 22px rgba(0,0,0,0.55)",
            }}
          >
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#8e7cdc" }} />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#8e7cdc" }} />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#8e7cdc" }} />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#8e7cdc" }} />
            <div className="flex items-center gap-2 px-6 py-5" style={{ borderBottom: "1px solid rgba(142,124,220,0.35)" }}>
              <Brain className="w-5 h-5" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 6px rgba(142,124,220,0.85))" }} />
              <h2 className="text-lg font-bold text-white">{t.yourVibeHeading}</h2>
            </div>
            <div className="p-5">
              {profile ? (
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-4 rounded-2xl bg-black"
                    style={{ border: "1px solid rgba(142,124,220,0.55)", boxShadow: "0 0 14px rgba(142,124,220,0.3)" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#8e7cdc" }}>{t.learningStyleLabel}</p>
                    <p className="font-bold text-white text-base">
                      {isAf
                        ? LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.nameAfrikaans
                        : LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.name || profile.learningStyle}
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-2xl bg-black"
                    style={{ border: "1px solid rgba(255,216,58,0.5)", boxShadow: "0 0 14px rgba(255,216,58,0.25)" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#ffd83a" }}>{t.bestTimeLabel}</p>
                    <p className="font-bold text-white text-base capitalize">{profile.studyPreference}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                  <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pro tip banner — neon cosmic, links to personalised study plan */}
        {profile && LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle] && (
          <div
            className="relative rounded-2xl bg-black p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center gap-5"
            style={{
              border: "1.5px solid #ffd83a",
              boxShadow:
                "0 0 18px rgba(255,216,58,0.35), 0 0 36px rgba(255,216,58,0.20), inset 0 0 22px rgba(255,216,58,0.10)",
            }}
            data-testid="pro-tip-banner"
          >
            <span
              className="inline-flex h-12 w-12 rounded-xl items-center justify-center bg-black shrink-0"
              style={{
                border: "1.5px solid #ffd83a",
                boxShadow: "0 0 14px rgba(255,216,58,0.55), inset 0 0 12px rgba(255,216,58,0.25)",
              }}
            >
              <Lightbulb
                className="w-6 h-6"
                style={{ color: "#ffd83a", filter: "drop-shadow(0 0 6px #ffd83a)" }}
              />
            </span>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {t.proTipHeading}
                </h3>
                <span
                  className="text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full bg-black"
                  style={{
                    color: "#ffd83a",
                    border: "1px solid #ffd83a",
                    boxShadow: "0 0 8px rgba(255,216,58,0.45)",
                  }}
                >
                  {profile.learningStyle}
                </span>
              </div>
              <p className="text-white text-sm sm:text-base leading-snug max-w-2xl">
                {(isAf
                  ? LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.tipsAfrikaans
                  : LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.tips
                )?.[0] || t.consistencyTip}
              </p>
            </div>
            <Link href="/study-calendar">
              <button
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{
                  color: "#000",
                  background: "#ffd83a",
                  boxShadow: "0 0 16px rgba(255,216,58,0.65), 0 0 32px rgba(255,216,58,0.35)",
                }}
                data-testid="button-pro-tip-learn-more"
              >
                {t.openPlanBtn}
              </button>
            </Link>
          </div>
        )}

        {/* Gamification — Next Milestone + You vs You + Personal Bests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {(() => {
            const sections = [
              { title: t.nextMilestoneTitle, hex: "#ff8a1f", Widget: NextMilestoneWidget },
              { title: t.thisWeek,          hex: "#28c9d6", Widget: YouVsYouChart },
              { title: t.personalBestsTitle, hex: "#ffd83a", Widget: PersonalBestsWidget },
            ];
            return sections.map(({ title, hex, Widget }) => (
              <div key={title} className="flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-4 w-0.5 rounded-full" style={{ background: hex, boxShadow: `0 0 8px ${hex}` }} />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: hex, textShadow: `0 0 10px ${hex}66` }}>
                    {title}
                  </h2>
                </div>
                <div className="flex-1">
                  <Widget isAf={isAf} />
                </div>
              </div>
            ));
          })()}
        </div>

      </main>
      </div>
    </div>
  );
}

const LEARNER_FAQ = {
  en: [
    { q: "How do I improve my marks?",              a: "Complete more quizzes, daily challenges, and practice exams. Focus on your weakest subjects shown on the dashboard and keep your study streak going." },
    { q: "What counts towards questions completed?", a: "Everything counts: Boost Quizzes, Daily Challenges, Crunch Time sessions, Brain Boost Mock Exams, and Simulated Past Papers." },
    { q: "How does the daily challenge work?",       a: "You get 5 questions per subject each day. Answer them all to earn coins (5 per correct answer). Your results feed into your mastery stats." },
    { q: "What are coins used for?",                 a: "Coins are earned from quizzes and challenges. They track your effort and can unlock rewards in the Rewards section." },
    { q: "How is my exam readiness calculated?",    a: "It's based on your study streak consistency, total questions completed, and how many papers you've covered." },
    { q: "Can I change my subjects?",               a: "Yes — go to Settings and update your selected subjects. You can only change subjects once per week." },
    { q: "What is Crunch Time?",                    a: "Crunch Time is an exam simulation with timed questions per subject. It tests you under real exam pressure." },
    { q: "How do I ask Rizz for help?",             a: "Go to the Tutor section and type your question. Rizz understands all your NSC subjects and can explain concepts in English or Afrikaans." },
  ],
  af: [
    { q: "Hoe verbeter ek my punte?",               a: "Voltooi meer vasvrae, daaglikse uitdagings en oefeneksamens. Fokus op jou swakste vakke en hou jou studie-reeks aan die gang." },
    { q: "Wat tel vir my voltooide vrae?",           a: "Alles tel: Boost-vasvrae, Daaglikse Uitdagings, Eksamentyd-sessies, Brain Boost-proefeksamens en Gesimuleerde Ou Vraestelle." },
    { q: "Hoe werk die daaglikse uitdaging?",        a: "Jy kry 5 vrae per vak elke dag. Beantwoord almal om munte te verdien (5 per korrekte antwoord)." },
    { q: "Waarvoor word munte gebruik?",             a: "Munte word verdien uit vasvrae en uitdagings en kan belonings in die Belonings-afdeling ontsluit." },
    { q: "Hoe word my eksamengereedheid bereken?",   a: "Dit is gebaseer op jou studie-reeks-konsekwentheid, totale vrae voltooi, en hoeveel vraestelle jy gedek het." },
    { q: "Kan ek my vakke verander?",               a: "Ja — gaan na Instellings en werk jou geselekteerde vakke by. Jy kan vakke slegs een keer per week verander." },
    { q: "Wat is Eksamentyd?",                      a: "Eksamentyd is 'n eksamensimulasie met tydbeperkte vrae per vak onder werklike eksamendruk." },
    { q: "Hoe vra ek Rizz vir hulp?",              a: "Gaan na die Tutor-afdeling en tik jou vraag. Rizz verstaan al jou NSC-vakke in Engels of Afrikaans." },
  ],
};

function LearnerFAQ({ isAf, faqHeading }: { isAf: boolean; faqHeading: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const items = isAf ? LEARNER_FAQ.af : LEARNER_FAQ.en;
  return (
    <div
      className="relative rounded-2xl bg-black overflow-hidden"
      style={{
        border: "1.5px solid #b066d6",
        boxShadow: "0 0 0 1px rgba(230,81,156,0.25), 0 0 28px rgba(176,102,214,0.3), 0 0 44px rgba(230,81,156,0.22), inset 0 0 22px rgba(0,0,0,0.55)",
      }}
    >
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#e6519c" }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#b066d6" }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#b066d6" }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#e6519c" }} />

      <div
        className="flex items-center gap-2 px-6 py-5"
        style={{ borderBottom: "1px solid rgba(176,102,214,0.35)" }}
      >
        <HelpCircle className="w-5 h-5" style={{ color: "#e6519c", filter: "drop-shadow(0 0 6px rgba(230,81,156,0.85))" }} />
        <h2 className="text-lg font-bold text-white">{faqHeading}</h2>
      </div>
      <div className="divide-y" style={{ borderColor: "rgba(176,102,214,0.2)" }}>
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} style={{ borderTop: idx === 0 ? "none" : "1px solid rgba(176,102,214,0.18)" }}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex items-center justify-between w-full px-6 py-4 text-left text-sm font-semibold transition-colors"
                style={{ color: isOpen ? "#b066d6" : "rgb(var(--foreground) / 1)" }}
                data-testid={`faq-q-${idx}`}
              >
                <span className={isOpen ? "" : "text-white"}>{item.q}</span>
                <ChevronDown
                  className="w-4 h-4 shrink-0 transition-transform duration-200 ml-3"
                  style={{
                    color: isOpen ? "#b066d6" : "rgba(255,255,255,0.45)",
                    transform: isOpen ? "rotate(180deg)" : undefined,
                    filter: isOpen ? "drop-shadow(0 0 4px #b066d6)" : undefined,
                  }}
                />
              </button>
              {isOpen && (
                <p className="px-6 pb-4 text-sm text-white leading-relaxed" data-testid={`faq-a-${idx}`}>{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
