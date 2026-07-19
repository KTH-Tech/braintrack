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
import rizzAvatar from "@/assets/handoff/rizz-avatar.png";
import btIcon from "@/assets/handoff/icon-transparent.png";
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
import { GraffitiSplats } from "@/components/graffiti-splats";
import { NotificationsPanel } from "@/components/notifications-panel";
import { NextMilestoneWidget } from "@/components/next-milestone-widget";
import { GoalProgress } from "@/components/goal-progress";
import { YouVsYouChart } from "@/components/you-vs-you-chart";
import { PersonalBestsWidget } from "@/components/personal-bests-widget";
import { useEarliestPrelimDate, FINALS_DATE, CountdownDigits } from "@/components/exam-countdown";

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
  { href: "/subjects",       icon: Languages,   label: labels.navSubjects     },
  // Rizz, the AI tutor. Was reachable only from a dashboard card, so learners
  // had no way to find it from the sidebar.
  { href: "/tutor",          icon: Brain,       label: labels.navTutor        },
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
          fontFamily: "'Poppins', sans-serif",
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
  const filteredSubjects = selectedSubjectIds.length > 0
    ? subjects?.filter((s: any) => selectedSubjectIds.includes(s.id))
    : (subjects ?? []);

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
          borderRight: "1px solid rgba(255,255,255,.07)",
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
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px 22px", cursor: "pointer" }}>
          <img src={btIcon} alt="BrainTrack" style={{ width: 56, height: 56, objectFit: "contain" }} />
          <span className="bt-wordmark" style={{ fontSize: 17 }}>BrainTrack</span>
        </Link>
        {navLinks.map(({ href, icon: Icon, label }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}>
              <div
                data-testid={`nav-icon-${href.replace(/\//g, "")}`}
                title={label}
                aria-label={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 14,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  color: active ? "#9FF5E8" : "#fff",
                  background: active ? "rgba(159,245,232,.12)" : "transparent",
                  border: active ? "1px solid #9FF5E8" : "1px solid transparent",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.05)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon style={{ width: 16, height: 16, flex: "none" }} />
                <span style={{ flex: 1 }}>{label}</span>
              </div>
            </Link>
          );
        })}
        <div
          data-testid="streak-badge"
          style={{
            marginTop: "auto",
            background: "linear-gradient(140deg,rgba(255,183,229,.14),rgba(197,179,255,.12))",
            border: "1px solid rgba(255,183,229,.3)",
            borderRadius: 18,
            padding: 16,
          }}
        >
          <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 14, color: "#FFB7E5" }}>{t.studyStreak} 🔥🔥🔥</div>
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
            border: "1px solid rgba(255,255,255,.14)",
            borderRadius: 14,
            padding: "11px 14px",
            cursor: "pointer",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF8DA1"; e.currentTarget.style.color = "#FF8DA1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.14)"; e.currentTarget.style.color = "#fff"; }}
        >
          <LogOut style={{ width: 16, height: 16 }} />
          {t.signOutLabel}
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="bt-dash-main" style={{ flex: 1, padding: "34px 40px", minWidth: 0, position: "relative", overflow: "hidden" }}>
        {/* Decorative blurred glows + graffiti scatter glyphs */}
        <div aria-hidden style={{ position: "absolute", top: -40, right: -40, width: 340, height: 340, background: "radial-gradient(circle,rgba(255,183,229,.12),transparent 65%)", filter: "blur(24px)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "10%", left: -60, width: 300, height: 300, background: "radial-gradient(circle,rgba(159,245,232,.1),transparent 65%)", filter: "blur(24px)", pointerEvents: "none" }} />
        <span aria-hidden style={{ position: "absolute", top: 110, right: 60, fontFamily: "'Permanent Marker',cursive", fontSize: 30, color: "rgba(255,226,154,.5)", transform: "rotate(12deg)", pointerEvents: "none" }}>★</span>
        <span aria-hidden style={{ position: "absolute", top: 300, right: 24, fontFamily: "'Permanent Marker',cursive", fontSize: 26, color: "rgba(255,183,229,.45)", transform: "rotate(-8deg)", pointerEvents: "none" }}>⚡</span>
        <span aria-hidden style={{ position: "absolute", bottom: 140, right: 80, fontFamily: "'Permanent Marker',cursive", fontSize: 24, color: "rgba(197,179,255,.45)", transform: "rotate(6deg)", pointerEvents: "none" }}>✦</span>
        <span aria-hidden style={{ position: "absolute", top: "60%", left: 8, fontFamily: "'Permanent Marker',cursive", fontSize: 22, color: "rgba(159,216,255,.4)", transform: "rotate(-14deg)", pointerEvents: "none" }}>👑</span>

        {/* ── Mobile top bar (<861px) ── */}
        <div className="bt-mobilebar" style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginBottom: 18, position: "relative", zIndex: 2 }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={btIcon} alt="BrainTrack" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <span className="bt-wordmark" style={{ fontSize: 15 }}>BrainTrack</span>
          </Link>
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 14, background: "transparent", border: "1px solid #9FF5E8", color: "#9FF5E8", cursor: "pointer" }}
          >
            {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="bt-mobilemenu" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 18, position: "relative", zIndex: 2 }}>
            {navLinks.map(({ href, icon: Icon, label }, idx) => {
              const active = location === href;
              const col = PASTELS[idx % PASTELS.length];
              return (
                <Link key={href} href={href}>
                  <button
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      width: "100%",
                      padding: "8px 4px",
                      borderRadius: 14,
                      fontSize: 10,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                      cursor: "pointer",
                      background: active ? col : "transparent",
                      color: active ? "#050508" : col,
                      border: `1px solid ${col}`,
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    <span style={{ lineHeight: 1 }}>{label.slice(0, 8)}</span>
                  </button>
                </Link>
              );
            })}
            <button
              onClick={() => logout()}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                width: "100%",
                padding: "8px 4px",
                borderRadius: 14,
                fontSize: 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: ".04em",
                cursor: "pointer",
                background: "transparent",
                color: "#FF8DA1",
                border: "1px solid #FF8DA1",
              }}
            >
              <LogOut style={{ width: 16, height: 16 }} />
              <span style={{ lineHeight: 1 }}>{t.signOutLabel.slice(0, 8)}</span>
            </button>
          </div>
        )}

        {/* ── Header row ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 30, position: "relative", zIndex: 1 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#9FF5E8", transform: "rotate(-2deg)", display: "inline-block", textShadow: "0 0 12px rgba(159,245,232,.5)" }}>
              {getGreeting()} ⚡
            </div>
            <div role="heading" aria-level={1} style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: "#fff" }}>
              {firstName} <span style={{ fontSize: 24 }}>🎧🔥</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <NotificationsPanel isAf={isAf} />
            <button
              onClick={toggleLanguage}
              data-testid="button-language-toggle"
              style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: "#C5B3FF", background: "transparent", border: "1px solid #C5B3FF", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }}
            >
              {language === "en" ? "EN" : "AF"}
            </button>
            <Link href="/daily-challenge">
              <button
                data-testid="button-claim-daily-xp"
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#050508",
                  background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 22px",
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(159,245,232,.35)",
                  transition: "transform .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                {t.claimXp}
              </button>
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
                boxShadow: "0 0 18px rgba(255,183,229,.4)",
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

      <main style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
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
          const hex = urgent ? "#FFB7E5" : "#FFE29A";
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
                  className="rounded-xl px-4 py-2 text-sm font-bold transition-all"
                  style={{
                    background: "#9FF5E8",
                    color: "#0a0a0a",
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
              background: "linear-gradient(135deg, rgba(255,183,229,0.10) 0%, transparent 60%), #000",
              border: "1px solid rgba(255,183,229,0.45)",
              boxShadow: "0 0 18px rgba(255,183,229,0.15)",
            }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#FFB7E5]" />
              <span className="text-sm font-semibold text-[#FFB7E5]">
                {t.lapsedBannerMsg}
              </span>
            </div>
            <Link href="/subscribe">
              <button
                className="rounded-xl px-4 py-2 text-sm font-bold transition-all"
                style={{
                  background: "#9FF5E8",
                  color: "#0a0a0a",
                }}
              >
                <RefreshCcw className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                {t.lapsedBannerCta}
              </button>
            </Link>
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
            <button
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 800,
                fontSize: 14,
                color: "#050508",
                background: "linear-gradient(100deg,#FFB7E5,#C5B3FF)",
                border: "none",
                borderRadius: 10,
                padding: "13px 26px",
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "transform .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              {t.startRevision}
            </button>
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
                background: "linear-gradient(160deg,rgba(255,255,255,.055),rgba(255,255,255,.015))",
                border: `1.5px solid ${hex}`,
                borderRadius: 20,
                padding: "20px 22px",
                transform: `rotate(${tilt}deg)`,
                boxShadow: `0 10px 30px ${hex}40`,
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
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: 26 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <div role="heading" aria-level={2} style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>{t.subjectsHeading} 📈</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 14, color: "#9FF5E8", textShadow: "0 0 10px rgba(159,245,232,.5)" }}>{t.keepPushing}</span>
                <Link href="/settings">
                  <button
                    data-testid="link-manage-subjects"
                    style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,.14)", borderRadius: 10, padding: "6px 12px", cursor: "pointer" }}
                  >
                    {t.manageLabel}
                  </button>
                </Link>
              </div>
            </div>
            {subjectsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[1, 2, 3].map(i => <div key={i} className="animate-pulse" style={{ height: 40, borderRadius: 12, background: "rgba(255,255,255,.05)" }} />)}
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
                      <div data-testid={`subject-card-${subject.id}`} style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
                        <div style={{ width: 40, height: 40, flex: "none", borderRadius: 12, background: `${hex}26`, color: hex, fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 14px ${hex}40` }}>
                          {initial}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 15, fontWeight: 700, marginBottom: 6, color: "#fff" }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subject.name}</span>
                            <span className="tabular-nums" style={{ color: hex, flex: "none" }}>{pct}%</span>
                          </div>
                          <div style={{ height: 9, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: `linear-gradient(90deg,${hex},${hex2})`, boxShadow: `0 0 12px ${hex}40` }} />
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
                  <button
                    data-testid="button-select-subjects"
                    style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 14, color: "#050508", background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", border: "none", borderRadius: 10, padding: "12px 22px", cursor: "pointer" }}
                  >
                    {t.selectSubjectsBtn}
                  </button>
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
                  <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFE29A", marginBottom: 10 }}>{missionTitle}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "#fff" }}>
                    {missionSub} · {t.worthLabel} <b style={{ color: "#9FF5E8" }}>+250 XP</b>
                  </div>
                  <Link href={missionHref}>
                    <button
                      style={{ marginTop: 16, width: "100%", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: "#050508", background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", border: "none", borderRadius: 10, padding: 13, cursor: "pointer", transition: "all .2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(159,245,232,.35)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      {t.runIt}
                    </button>
                  </Link>
                </div>
              );
            })()}

            {/* Fresh drops — recent achievements */}
            <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: 24, flex: 1 }}>
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
                        <div style={{ width: 42, height: 42, flex: "none", borderRadius: "50%", background: `${hex}26`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 16px ${hex}40` }}>
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

        {/* ── Exam countdown — DBE 2026 ── */}
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            <div role="heading" aria-level={2} style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>{t.examCountdownHeading}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5" }}>{heroName}</span>
              <LiveCountdownChips target={heroTarget} tinted size={20} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16 }}>
            {/* Prelims tile */}
            {!hasAnyPrelimData && !PRELIMS_DATE ? (
              <Link href="/settings">
                <div
                  data-testid="countdown-prelims-empty"
                  style={{ height: "100%", background: "rgba(5,5,8,.6)", border: "1.5px solid #9FF5E8", borderRadius: 16, padding: "16px 18px", boxShadow: "0 0 20px rgba(159,245,232,.25)", cursor: "pointer", transition: "transform .2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                >
                  <div style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 8px", borderRadius: 6, background: "rgba(159,245,232,.12)", color: "#9FF5E8", textTransform: "uppercase" }}>{t.prelimsLabel}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#9FF5E8", marginTop: 10 }}>{t.setupLink}</div>
                  <div style={{ fontSize: 13, color: "#fff", marginTop: 2 }}>{t.addPrelimDates}</div>
                </div>
              </Link>
            ) : (
              <div
                data-testid="countdown-prelims"
                style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid #9FF5E8", borderRadius: 16, padding: "16px 18px", boxShadow: "0 0 20px rgba(159,245,232,.25)", transition: "transform .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
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
              style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid #FFB7E5", borderRadius: 16, padding: "16px 18px", boxShadow: "0 0 20px rgba(255,183,229,.25)", transition: "transform .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
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
                      style={{ background: "rgba(5,5,8,.6)", border: `1.5px solid ${hex}`, borderRadius: 16, padding: "16px 18px", boxShadow: `0 0 20px ${hex}40`, transition: "transform .2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
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
              className="shrink-0 px-4 py-2 rounded-xl bg-black font-bold text-sm transition-none"
              style={{
                color: ac.hex,
                border: `1.5px solid ${ac.hex}`,
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
            active: { label: "Active",       labelAf: "Aktief",         hex: "#9FF5E8", halo: "rgba(159,245,232,0.22)"  },
            trial:  { label: "Free Trial",   labelAf: "Gratis Proef",   hex: "#FFE29A", halo: "rgba(255,226,154,0.22)"  },
            grace:  { label: "Grace Period", labelAf: "Grasietydperk",  hex: "#94F7C5", halo: "rgba(148,247,197,0.22)"  },
            lapsed: { label: "Lapsed",       labelAf: "Verval",         hex: "#FFB7E5", halo: "rgba(255,183,229,0.22)"  },
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
                    <span className="text-[11px] text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" style={{ color: "#FFE29A" }} />
                      {trialDaysLeft} {trialDaysLeft === 1 ? t.dayLeft : t.daysLeft}
                    </span>
                  )}
                  {dateVal && (
                    <span className="text-[11px] text-white">
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

        <GoalProgress isAf={isAf} />

        {/* ===== EXAM-AWARE WIDGETS (T114) ===== */}
        {examWidgets && (examWidgets.nextExam || examWidgets.thisWeekExams?.length > 0) && (
          <div className="space-y-4" data-testid="exam-aware-section">
            {/* Urgency Banner — cosmic neon, wordmark palette */}
            {examWidgets.urgencyBanner && (() => {
              const urgencyColor: Record<string, { hex: string; halo: string }> = {
                red:     { hex: "#FFB7E5", halo: "rgba(255,183,229,0.28)" }, // pink = final sprint
                amber:   { hex: "#94F7C5", halo: "rgba(148,247,197,0.28)" }, // orange = exam prep
                blue:    { hex: "#FFE29A", halo: "rgba(255,226,154,0.28)" }, // gold = focused
                emerald: { hex: "#C5B3FF", halo: "rgba(197,179,255,0.28)" },// violet = build
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
                      className="shrink-0 px-4 py-2 rounded-xl bg-black font-bold text-sm"
                      style={{ color: u.hex, border: `1.5px solid ${u.hex}` }}
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
                  style={{ border: "1.5px solid #9FF5E8", boxShadow: "0 0 0 1px rgba(159,245,232,0.22), 0 0 22px rgba(159,245,232,0.22)" }}
                  data-testid="next-exam-card"
                >
                  <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: "#9FF5E8" }} />
                  <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: "#9FF5E8" }} />
                  <span aria-hidden className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: "#9FF5E8" }} />
                  <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: "#9FF5E8" }} />
                  <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(159,245,232,0.25)" }}>
                    <GraduationCap className="w-4 h-4" style={{ color: "#9FF5E8", filter: "drop-shadow(0 0 4px rgba(159,245,232,0.6))" }} />
                    <h3 className="font-bold text-sm" style={{ color: "#9FF5E8", textShadow: "0 0 8px rgba(159,245,232,0.4)" }}>
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
                        style={{ border: "1px solid rgba(159,245,232,0.4)", boxShadow: "inset 0 0 12px rgba(159,245,232,0.15)" }}
                      >
                        <p className="text-2xl font-bold tabular-nums" style={{ color: "#9FF5E8", textShadow: "0 0 10px rgba(159,245,232,0.5)" }} data-testid="next-exam-days">
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
                style={{ border: "1.5px solid #94F7C5", boxShadow: "0 0 0 1px rgba(148,247,197,0.22), 0 0 22px rgba(148,247,197,0.22)" }}
                data-testid="this-week-exams-card"
              >
                <span aria-hidden className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: "#94F7C5" }} />
                <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: "#94F7C5" }} />
                <span aria-hidden className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: "#94F7C5" }} />
                <span aria-hidden className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: "#94F7C5" }} />
                <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(148,247,197,0.25)" }}>
                  <CalendarDays className="w-4 h-4" style={{ color: "#94F7C5", filter: "drop-shadow(0 0 4px rgba(148,247,197,0.6))" }} />
                  <h3 className="font-bold text-sm" style={{ color: "#94F7C5", textShadow: "0 0 8px rgba(148,247,197,0.4)" }}>{t.thisWeek}</h3>
                </div>
                <div className="p-5">
                  {examWidgets.thisWeekExams?.length > 0 ? (
                    <div className="space-y-2">
                      {examWidgets.thisWeekExams.slice(0, 3).map((e: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-black" style={{ border: "1px solid rgba(148,247,197,0.35)" }}>
                          <div
                            className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0"
                            style={{ border: "1px solid #94F7C5", boxShadow: "0 0 10px rgba(148,247,197,0.35)" }}
                          >
                            <span className="text-xs font-bold" style={{ color: "#94F7C5" }}>P{e.paperNumber}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">{e.subjectName}</p>
                            <p className="text-[10px] text-white">
                              {formatDate(e.examDate + "T00:00:00", language, { weekday: "short", day: "numeric", month: "short" })}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold shrink-0" style={{ color: "#94F7C5" }}>
                            {e.daysRemaining}{t.daysShort}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <Coffee className="w-8 h-8 text-white mb-2" />
                      <p className="text-xs font-semibold text-white">{t.noExamsThisWeek}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VARK Style Badge */}
        {varkStyle && (
          <div
            className="relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-black w-fit overflow-hidden"
            style={{ border: "1.5px solid #C5B3FF", boxShadow: "0 0 0 1px rgba(197,179,255,0.22), 0 0 18px rgba(197,179,255,0.22)" }}
            data-testid="vark-style-badge"
          >
            <span aria-hidden className="absolute inset-y-3 left-0 w-[2px] rounded-r" style={{ background: "#C5B3FF", boxShadow: "0 0 8px #C5B3FF" }} />
            <span className="text-2xl pl-1">{varkStyle.icon}</span>
            <div>
              <p className="text-xs uppercase font-semibold tracking-widest" style={{ color: "#C5B3FF", textShadow: "0 0 8px rgba(197,179,255,0.45)" }}>
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
              borderColor: "rgba(159,245,232,0.45)",
              boxShadow: "0 0 18px rgba(159,245,232,0.22)",
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
                <p className="text-xs font-semibold mt-1.5" style={{ color: "#9FF5E8" }}>
                  {t.profileAutoUpdated}
                </p>
              )}
            </div>
            <Link href="/settings" className="flex-shrink-0">
              <button
                className="text-sm font-bold px-4 py-2 rounded-xl bg-black"
                style={{ color: "#9FF5E8", border: "1.5px solid #9FF5E8" }}
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
                hex: "#C5B3FF", halo: "rgba(197,179,255,",
                head: <img src={rizzAvatar} alt="Rizz" className="w-14 h-14 rounded-2xl object-cover" style={{ border: "1.5px solid #C5B3FF", boxShadow: "0 0 14px rgba(197,179,255,0.45)" }} />,
                title: "Rizz",
                sub: t.tutorCardSub,
                cta: t.tutorCardCta,
              },
              {
                href: "/exam-mode", testid: "link-exam-mode", varkKey: "kinesthetic",
                hex: "#9FD8FF", halo: "rgba(159,216,255,",
                head: (
                  <div
                    className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center"
                    style={{ border: "1.5px solid #9FD8FF", boxShadow: "0 0 14px rgba(159,216,255,0.45), inset 0 0 10px rgba(159,216,255,0.25)" }}
                  >
                    <Shield className="w-7 h-7" style={{ color: "#9FD8FF", filter: "drop-shadow(0 0 4px rgba(159,216,255,0.55))" }} />
                  </div>
                ),
                title: t.crunchTitle,
                sub: t.crunchSub,
                cta: t.crunchCta,
              },
              {
                href: "/progress", testid: "link-progress-card", varkKey: "visual",
                hex: "#C5B3FF", halo: "rgba(197,179,255,",
                head: (
                  <div
                    className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center"
                    style={{ border: "1.5px solid #C5B3FF", boxShadow: "0 0 14px rgba(197,179,255,0.45), inset 0 0 10px rgba(197,179,255,0.25)" }}
                  >
                    <TrendingUp className="w-7 h-7" style={{ color: "#C5B3FF", filter: "drop-shadow(0 0 4px rgba(197,179,255,0.55))" }} />
                  </div>
                ),
                title: t.progressCardTitle,
                sub: t.progressCardSub,
                cta: t.progressCardCta,
              },
              {
                href: "/daily-challenge", testid: "link-daily-challenge", varkKey: "read",
                hex: "#94F7C5", halo: "rgba(148,247,197,",
                head: (
                  <div
                    className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center"
                    style={{ border: "1.5px solid #94F7C5", boxShadow: "0 0 14px rgba(148,247,197,0.45), inset 0 0 10px rgba(148,247,197,0.25)" }}
                  >
                    <Sparkles className="w-7 h-7" style={{ color: "#94F7C5", filter: "drop-shadow(0 0 4px rgba(148,247,197,0.55))" }} />
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
              hex: "#9FF5E8",
              halo: "rgba(159,245,232,",
              icon: <Zap className="w-7 h-7" style={{ color: "#9FF5E8", filter: "drop-shadow(0 0 4px rgba(159,245,232,0.55))" }} />,
              title: t.miniMockTitle,
              sub: t.miniMockSub,
              cta: t.miniMockCta,
            },
            {
              href: "/exam/full",
              testid: "link-full-exam",
              hex: "#FFB7E5",
              halo: "rgba(255,183,229,",
              icon: <GraduationCap className="w-7 h-7" style={{ color: "#FFB7E5", filter: "drop-shadow(0 0 4px rgba(255,183,229,0.55))" }} />,
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
              border: "1.5px solid #94F7C5",
              boxShadow: "0 0 0 1px rgba(148,247,197,0.28), 0 0 28px rgba(148,247,197,0.28), inset 0 0 22px rgba(0,0,0,0.55)",
            }}
            data-testid="panel-focus-areas"
          >
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#94F7C5" }} />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#94F7C5" }} />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#94F7C5" }} />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#94F7C5" }} />

            <div
              className="flex items-center justify-between px-6 py-5 gap-3"
              style={{ borderBottom: "1px solid rgba(148,247,197,0.35)" }}
            >
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Target className="w-5 h-5" style={{ color: "#94F7C5", filter: "drop-shadow(0 0 6px rgba(148,247,197,0.8))" }} />
                  {t.focusAreasHeading}
                </h2>
                <p className="text-xs text-white mt-1">{t.focusAreasSubtitle}</p>
              </div>
            </div>
            {focusAreasData.focusAreas.length === 0 ? (
              <div className="p-6 text-center">
                <div
                  className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-black flex items-center justify-center"
                  style={{ border: "1.5px solid #94F7C5", boxShadow: "0 0 14px rgba(148,247,197,0.4)" }}
                >
                  <Sparkles className="w-7 h-7" style={{ color: "#94F7C5", filter: "drop-shadow(0 0 5px #94F7C5)" }} />
                </div>
                <p className="text-sm text-white" data-testid="text-focus-areas-empty">{t.focusAreasEmpty}</p>
              </div>
            ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {focusAreasData.focusAreas.map((fa) => {
                const isRed = fa.masteryBand === "red";
                const hex = isRed ? "#FF8DA1" : "#FFE29A";
                const halo = isRed ? "rgba(255,141,161,0.28)" : "rgba(255,226,154,0.28)";
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
                      <p className="text-[10px] uppercase tracking-wider text-white truncate">{subjectName}</p>
                      <p className="text-sm font-bold text-white mt-0.5 line-clamp-2">{topicName}</p>
                      <div className="flex items-center justify-end mt-2">
                        <ChevronRight className="w-4 h-4 text-white group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* Recommended + Your Vibe — cosmic neon */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div
            className="relative rounded-2xl bg-black overflow-hidden"
            style={{
              border: "1.5px solid #9FF5E8",
              boxShadow: "0 0 0 1px rgba(159,245,232,0.28), 0 0 28px rgba(159,245,232,0.28), inset 0 0 22px rgba(0,0,0,0.55)",
            }}
          >
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#9FF5E8" }} />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#9FF5E8" }} />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#9FF5E8" }} />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#9FF5E8" }} />
            <div className="flex items-center gap-2 px-6 py-5" style={{ borderBottom: "1px solid rgba(159,245,232,0.35)" }}>
              <Sparkles className="w-5 h-5" style={{ color: "#9FF5E8", filter: "drop-shadow(0 0 6px rgba(159,245,232,0.85))" }} />
              <h2 className="text-lg font-bold text-white">{t.recommendedHeading}</h2>
            </div>
            <div className="p-5 space-y-3">
              {(() => {
                const items = [
                  { href: "/tutor", num: 1, hex: "#9FF5E8", label: t.tryRizz },
                  { href: "/subjects",    num: 2, hex: "#C5B3FF", label: t.completePractice },
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
              border: "1.5px solid #C5B3FF",
              boxShadow: "0 0 0 1px rgba(197,179,255,0.3), 0 0 28px rgba(197,179,255,0.3), inset 0 0 22px rgba(0,0,0,0.55)",
            }}
          >
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#C5B3FF" }} />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#C5B3FF" }} />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#C5B3FF" }} />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#C5B3FF" }} />
            <div className="flex items-center gap-2 px-6 py-5" style={{ borderBottom: "1px solid rgba(197,179,255,0.35)" }}>
              <Brain className="w-5 h-5" style={{ color: "#C5B3FF", filter: "drop-shadow(0 0 6px rgba(197,179,255,0.85))" }} />
              <h2 className="text-lg font-bold text-white">{t.yourVibeHeading}</h2>
            </div>
            <div className="p-5">
              {profile ? (
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-4 rounded-2xl bg-black"
                    style={{ border: "1px solid rgba(197,179,255,0.55)", boxShadow: "0 0 14px rgba(197,179,255,0.3)" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#C5B3FF" }}>{t.learningStyleLabel}</p>
                    <p className="font-bold text-white text-base">
                      {isAf
                        ? LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.nameAfrikaans
                        : LEARNING_STYLE_INFO[profile.learningStyle as LearningStyle]?.name || profile.learningStyle}
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-2xl bg-black"
                    style={{ border: "1px solid rgba(255,226,154,0.5)", boxShadow: "0 0 14px rgba(255,226,154,0.25)" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#FFE29A" }}>{t.bestTimeLabel}</p>
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
              border: "1.5px solid #FFE29A",
              boxShadow:
                "0 0 18px rgba(255,226,154,0.35), 0 0 36px rgba(255,226,154,0.20), inset 0 0 22px rgba(255,226,154,0.10)",
            }}
            data-testid="pro-tip-banner"
          >
            <span
              className="inline-flex h-12 w-12 rounded-xl items-center justify-center bg-black shrink-0"
              style={{
                border: "1.5px solid #FFE29A",
                boxShadow: "0 0 14px rgba(255,226,154,0.55), inset 0 0 12px rgba(255,226,154,0.25)",
              }}
            >
              <Lightbulb
                className="w-6 h-6"
                style={{ color: "#FFE29A", filter: "drop-shadow(0 0 6px #FFE29A)" }}
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
                    color: "#FFE29A",
                    border: "1px solid #FFE29A",
                    boxShadow: "0 0 8px rgba(255,226,154,0.45)",
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
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
                style={{
                  color: "#0a0a0a",
                  background: "#9FF5E8",
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
              { title: t.nextMilestoneTitle, hex: "#94F7C5", Widget: NextMilestoneWidget },
              { title: t.thisWeek,          hex: "#9FF5E8", Widget: YouVsYouChart },
              { title: t.personalBestsTitle, hex: "#FFE29A", Widget: PersonalBestsWidget },
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

      {/* Responsive: the left menu persists at every width (user request —
          no top-bar fallback); it just slims down on narrow screens. */}
      <style>{`
        .bt-mobilebar, .bt-mobilemenu { display: none !important; }
        @media (max-width: 860px) {
          .bt-dash-sidebar { width: 200px !important; padding: 18px 10px !important; }
          .bt-dash-main { padding: 20px 14px !important; }
          .bt-grid-stats, .bt-grid-2col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 1280px) and (min-width: 861px) {
          .bt-grid-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
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
        border: "1.5px solid #C5B3FF",
        boxShadow: "0 0 0 1px rgba(255,183,229,0.25), 0 0 28px rgba(197,179,255,0.3), 0 0 44px rgba(255,183,229,0.22), inset 0 0 22px rgba(0,0,0,0.55)",
      }}
    >
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 z-10" style={{ borderColor: "#FFB7E5" }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 z-10" style={{ borderColor: "#C5B3FF" }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 z-10" style={{ borderColor: "#C5B3FF" }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 z-10" style={{ borderColor: "#FFB7E5" }} />

      <div
        className="flex items-center gap-2 px-6 py-5"
        style={{ borderBottom: "1px solid rgba(197,179,255,0.35)" }}
      >
        <HelpCircle className="w-5 h-5" style={{ color: "#FFB7E5", filter: "drop-shadow(0 0 6px rgba(255,183,229,0.85))" }} />
        <h2 className="text-lg font-bold text-white">{faqHeading}</h2>
      </div>
      <div className="divide-y" style={{ borderColor: "rgba(197,179,255,0.2)" }}>
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} style={{ borderTop: idx === 0 ? "none" : "1px solid rgba(197,179,255,0.18)" }}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex items-center justify-between w-full px-6 py-4 text-left text-sm font-semibold transition-colors"
                style={{ color: isOpen ? "#C5B3FF" : "rgb(var(--foreground) / 1)" }}
                data-testid={`faq-q-${idx}`}
              >
                <span className={isOpen ? "" : "text-white"}>{item.q}</span>
                <ChevronDown
                  className="w-4 h-4 shrink-0 transition-transform duration-200 ml-3"
                  style={{
                    color: isOpen ? "#C5B3FF" : "#ffffff",
                    transform: isOpen ? "rotate(180deg)" : undefined,
                    filter: isOpen ? "drop-shadow(0 0 4px #C5B3FF)" : undefined,
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
