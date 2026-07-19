import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/formatters";
import { useLocation, Link } from "wouter";
import {
  Loader2, Home, LogOut, Globe, MapPin, CheckCircle2, Star, Flame,
  BookOpen, Trophy, Target, Brain, Rocket, Sparkles, ArrowRight, Lock,
  ArrowLeft, Calendar, HelpCircle, FileText,
} from "lucide-react";
import rizzAvatar from "@assets/rizz-nav-transparent.png";

interface JourneyEvent {
  id: string;
  type: "onboarding" | "first_quiz" | "subject" | "badge" | "mastery" | "streak" | "paper" | "daily";
  title: string;
  titleAf: string;
  description: string;
  descriptionAf: string;
  date: string;
  isCompleted: boolean;
  icon: string;
  highlight?: boolean;
}

interface JourneyData {
  events: JourneyEvent[];
  stats: {
    totalDays: number;
    badgesEarned: number;
    questionsAnswered: number;
    papersCompleted: number;
    currentStreak: number;
  };
  rizzComment: string;
  rizzCommentAf: string;
  learnerName: string;
  upcomingGoals: { title: string; titleAf: string; progress: number }[];
}

/* Wordmark rainbow — keep this the single source of truth for this page. */
const RAINBOW = [
  "#FFE29A", "#FFE29A", "#FFE29A", "#FFE29A",
  "#6EE7F9", "#9FD8FF", "#C5B3FF", "#C5B3FF", "#FFB7E5",
] as const;

const EVENT_ICONS: Record<string, any> = {
  onboarding: CheckCircle2,
  first_quiz: Star,
  subject:    BookOpen,
  badge:      Trophy,
  mastery:    Target,
  streak:     Flame,
  paper:      Brain,
  daily:      Sparkles,
};

/* Map each event type to one stop on the rainbow. */
const EVENT_HEX: Record<string, string> = {
  onboarding: "#6EE7F9",
  first_quiz: "#FFE29A",
  subject:    "#9FD8FF",
  badge:      "#FFE29A",
  mastery:    "#C5B3FF",
  streak:     "#FFE29A",
  paper:      "#C5B3FF",
  daily:      "#FFB7E5",
};

const halo = (hex: string, a = 0.32) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const T = {
  en: {
    pageTitle: "Learning Journey",
    parentBadge: "Parent",
    homeTitle: "Home",
    signOutTitle: "Sign Out",
    backTitle: "Back",
    heroLabel: "Journey",
    heroSubtitle: "Your personal learning journey — every milestone, every spark.",
    rizzSays: "Rizz says",
    statDays: "Days",
    statBadges: "Badges",
    statQuestions: "Questions",
    statPapers: "Papers",
    statStreak: "Streak",
    completedMilestones: "Completed Milestones",
    emptyMilestones: "Start studying to unlock your first milestone!",
    upcomingGoals: "Upcoming Goals",
    ctaHeading: "Keep it up!",
    ctaDescription: "Answer more questions to grow your journey.",
    ctaButton: "Start Studying",
  },
  af: {
    pageTitle: "Leerreis",
    parentBadge: "Ouersig",
    homeTitle: "Tuis",
    signOutTitle: "Teken uit",
    backTitle: "Terug",
    heroLabel: "Leerreis",
    heroSubtitle: "Jou persoonlike leerreis — elke mylpaal, elke vonk.",
    rizzSays: "Rizz sê",
    statDays: "Dae",
    statBadges: "Kentekens",
    statQuestions: "Vrae",
    statPapers: "Vraestelle",
    statStreak: "Reeks",
    completedMilestones: "Voltooide Mylpale",
    emptyMilestones: "Begin studeer om jou eerste mylpaal te ontsluit!",
    upcomingGoals: "Opkomende Doelwitte",
    ctaHeading: "Hou aan studeer!",
    ctaDescription: "Beantwoord meer vrae om jou reis te laat groei.",
    ctaButton: "Begin Studeer",
  },
} as const;

export default function JourneyPage() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const isAf = language === "af";
  const t = T[language];
  const params = new URLSearchParams(window.location.search);
  const isParentView = params.get("parent") === "1";

  const { data: journey, isLoading } = useQuery<JourneyData>({
    queryKey: ["/api/user/journey"],
  });

  const events = journey?.events ?? [];
  const completed = events.filter((e) => e.isCompleted);
  const upcoming = events.filter((e) => !e.isCompleted);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Sticky neon header ── */}
      <header
        className="sticky top-0 z-40 bg-black"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0"
              style={{
                border: "1px solid #6EE7F9",
                boxShadow: "0 0 12px rgba(110,231,249,0.4), inset 0 0 8px rgba(110,231,249,0.15)",
              }}
            >
              <MapPin className="w-4 h-4" style={{ color: "#6EE7F9", filter: "drop-shadow(0 0 4px #6EE7F9)" }} />
            </div>
            <span className="font-black text-sm text-white truncate">
              {t.pageTitle}
            </span>
            {isParentView && (
              <span
                className="text-[9px] font-black uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-black shrink-0"
                style={{ color: "#C5B3FF", border: "1px solid #C5B3FF" }}
              >
                {t.parentBadge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black text-xs font-black uppercase tracking-[0.18em] hover:bg-white/5 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.12)", color:"#ffffff" }}
              data-testid="button-toggle-language"
            >
              <Globe className="h-3.5 w-3.5" />
              {language === "en" ? "EN" : "AF"}
            </button>
            {!isParentView ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="h-8 w-8 rounded-lg bg-black flex items-center justify-center hover:bg-white/5 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                  title={t.homeTitle}
                  data-testid="button-home"
                >
                  <Home className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={() => logout()}
                  className="h-8 w-8 rounded-lg bg-black flex items-center justify-center hover:bg-white/5 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                  title={t.signOutTitle}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 text-white" />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/parent")}
                className="h-8 w-8 rounded-lg bg-black flex items-center justify-center hover:bg-white/5 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                title={t.backTitle}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10 space-y-8">
        {/* ── Hero ── */}
        <section className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center"
              style={{
                border: "1.5px solid #FFE29A",
                boxShadow: "0 0 16px rgba(255,226,154,0.35), inset 0 0 10px rgba(255,226,154,0.15)",
              }}
            >
              <Rocket className="w-5 h-5" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 5px #FFE29A)" }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white">
              {t.heroLabel}
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.95]"
            style={{
              background: `linear-gradient(90deg, ${RAINBOW.join(", ")})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {isAf
              ? `${journey?.learnerName ? journey.learnerName : "Jou"} Leerreis`
              : `${journey?.learnerName ? journey.learnerName + "'s" : "Your"} Journey`}
          </h1>
          <p className="text-white font-medium text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
            {t.heroSubtitle}
          </p>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#6EE7F9" }} />
          </div>
        ) : (
          <>
            {/* ── Rizz narrator card ── */}
            <section
              className="relative rounded-2xl bg-black p-5 sm:p-6 overflow-hidden"
              style={{
                border: "1.5px solid #6EE7F9",
                boxShadow: `0 0 0 1px ${halo("#6EE7F9", 0.2)}, 0 0 28px ${halo("#6EE7F9", 0.3)}, inset 0 0 22px rgba(0,0,0,0.6)`,
              }}
              data-testid="rizz-narrator"
            >
              <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "#6EE7F9", boxShadow: "0 0 10px #6EE7F9" }} />
              <span aria-hidden className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: "#6EE7F9" }} />
              <span aria-hidden className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: "#6EE7F9" }} />

              <div className="flex items-start gap-4">
                <div
                  className="shrink-0 w-14 h-14 rounded-2xl overflow-hidden bg-black"
                  style={{
                    border: "1.5px solid #6EE7F9",
                    boxShadow: `0 0 14px ${halo("#6EE7F9", 0.45)}`,
                  }}
                >
                  <img src={rizzAvatar} alt="Rizz" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-black mb-1.5 uppercase tracking-[0.28em]"
                    style={{ color: "#6EE7F9", textShadow: `0 0 8px ${halo("#6EE7F9", 0.4)}` }}
                  >
                    {t.rizzSays}
                  </p>
                  <p className="text-sm sm:text-base text-white leading-relaxed font-medium italic">
                    "{isAf ? journey?.rizzCommentAf : journey?.rizzComment}"
                  </p>
                </div>
              </div>
            </section>

            {/* ── Stats bar — 5 neon chips across the rainbow ── */}
            {journey?.stats && (
              <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: t.statDays,      value: journey.stats.totalDays,         hex: "#6EE7F9", Icon: Calendar,   testid: "stat-days"      },
                  { label: t.statBadges,    value: journey.stats.badgesEarned,      hex: "#FFE29A", Icon: Trophy,     testid: "stat-badges"    },
                  { label: t.statQuestions, value: journey.stats.questionsAnswered, hex: "#9FD8FF", Icon: HelpCircle, testid: "stat-questions" },
                  { label: t.statPapers,    value: journey.stats.papersCompleted,   hex: "#C5B3FF", Icon: FileText,   testid: "stat-papers"    },
                  { label: t.statStreak,    value: journey.stats.currentStreak,     hex: "#FFE29A", Icon: Flame,      testid: "stat-streak"    },
                ].map(({ label, value, hex, Icon, testid }) => {
                  const h = halo(hex, 0.32);
                  return (
                    <div
                      key={label}
                      className="relative rounded-2xl bg-black p-4 text-center overflow-hidden"
                      style={{
                        border: `1.5px solid ${hex}`,
                        boxShadow: `0 0 0 1px ${halo(hex, 0.18)}, 0 0 16px ${h}, inset 0 0 12px rgba(0,0,0,0.55)`,
                      }}
                      data-testid={testid}
                    >
                      <span aria-hidden className="absolute top-0 left-0 right-0 h-[1.5px]"
                        style={{ background: hex, boxShadow: `0 0 8px ${hex}` }} />
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <Icon className="w-3.5 h-3.5" style={{ color: hex, filter: `drop-shadow(0 0 4px ${h})` }} />
                        <span
                          className="text-[9px] font-black uppercase tracking-[0.22em]"
                          style={{ color: hex }}
                        >
                          {label}
                        </span>
                      </div>
                      <p
                        className="text-3xl font-black tabular-nums leading-none"
                        style={{
                          fontFamily: '"JetBrains Mono", "Sora", monospace',
                          color: "#ffffff",
                          textShadow: `0 0 12px ${h}`,
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  );
                })}
              </section>
            )}

            {/* ── Completed timeline ── */}
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#6EE7F9", filter: "drop-shadow(0 0 4px #6EE7F9)" }} />
                {t.completedMilestones}
                <span
                  className="ml-1 px-2 py-0.5 rounded-full bg-black text-[9px] font-black tabular-nums"
                  style={{ border: "1px solid #6EE7F9", color: "#6EE7F9" }}
                >
                  {completed.length}
                </span>
              </h2>

              <div className="relative pl-8">
                {/* rainbow rail */}
                <div
                  aria-hidden
                  className="absolute left-3 top-1 bottom-1 w-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(to bottom, ${RAINBOW.join(", ")})`,
                    opacity: 0.45,
                    boxShadow: "0 0 10px rgba(255,255,255,0.08)",
                  }}
                />

                <div className="space-y-3">
                  {completed.length === 0 && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-2xl bg-black text-white text-sm"
                      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" style={{ color: "#FFB7E5" }} />
                      {t.emptyMilestones}
                    </div>
                  )}

                  {completed.map((event) => {
                    const Icon = EVENT_ICONS[event.type] ?? Star;
                    const hex = EVENT_HEX[event.type] ?? "#6EE7F9";
                    const h = halo(hex, 0.32);
                    return (
                      <div key={event.id} className="relative flex gap-4" data-testid={`journey-event-${event.id}`}>
                        {/* timeline node */}
                        <span
                          aria-hidden
                          className="absolute -left-[23px] top-4 w-3 h-3 rounded-full bg-black"
                          style={{
                            border: `2px solid ${hex}`,
                            boxShadow: `0 0 10px ${hex}, 0 0 20px ${h}`,
                          }}
                        />
                        <div
                          className="flex-1 rounded-2xl bg-black p-4 transition-transform hover:scale-[1.005]"
                          style={{
                            border: `1px solid ${hex}`,
                            boxShadow: `0 0 0 1px ${halo(hex, 0.15)}, 0 0 14px ${h}, inset 0 0 12px rgba(0,0,0,0.55)`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0"
                                style={{
                                  border: `1.5px solid ${hex}`,
                                  boxShadow: `0 0 10px ${h}, inset 0 0 8px ${h}`,
                                }}
                              >
                                <Icon className="w-4 h-4" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex})` }} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-sm text-white leading-tight">
                                  {isAf ? event.titleAf : event.title}
                                </p>
                                <p className="text-[11px] text-white mt-1 leading-relaxed">
                                  {isAf ? event.descriptionAf : event.description}
                                </p>
                              </div>
                            </div>
                            <span
                              className="shrink-0 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap mt-1"
                              style={{ color: hex }}
                            >
                              {formatDate(event.date, language, {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── Upcoming goals ── */}
            {!isParentView && upcoming.length > 0 && (
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                  <Lock className="w-3.5 h-3.5 text-white" />
                  {t.upcomingGoals}
                  <span
                    className="ml-1 px-2 py-0.5 rounded-full bg-black text-[9px] font-black tabular-nums text-white"
                    style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                  >
                    {upcoming.length}
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {upcoming.slice(0, 6).map((event) => {
                    const Icon = EVENT_ICONS[event.type] ?? Star;
                    const hex = EVENT_HEX[event.type] ?? "#6EE7F9";
                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-black"
                        style={{
                          border: `1px dashed ${hex}55`,
                          opacity: 0.75,
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shrink-0"
                          style={{ border: `1px dashed ${hex}66` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: `${hex}aa` }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-sm text-white leading-tight">
                            {isAf ? event.titleAf : event.title}
                          </p>
                          <p className="text-[11px] text-white mt-1 leading-relaxed">
                            {isAf ? event.descriptionAf : event.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Learner CTA ── */}
            {!isParentView && (
              <section
                className="relative rounded-2xl bg-black p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 overflow-hidden"
                style={{
                  border: "1.5px solid #FFB7E5",
                  boxShadow: `0 0 0 1px ${halo("#FFB7E5", 0.2)}, 0 0 26px ${halo("#FFB7E5", 0.3)}, inset 0 0 20px rgba(0,0,0,0.55)`,
                }}
                data-testid="journey-cta"
              >
                <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "#FFB7E5" }} />
                <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: "#FFB7E5" }} />
                <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: "#FFB7E5" }} />
                <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#FFB7E5" }} />

                <div className="min-w-0">
                  <h3 className="font-black text-xl text-white">
                    {t.ctaHeading}
                  </h3>
                  <p className="text-sm text-white mt-1 leading-relaxed">
                    {t.ctaDescription}
                  </p>
                </div>
                <Link href="/subjects">
                  <button
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black font-black text-sm uppercase tracking-[0.16em]"
                    style={{
                      color: "#FFB7E5",
                      border: "1.5px solid #FFB7E5",
                      boxShadow: `0 0 16px ${halo("#FFB7E5", 0.4)}`,
                    }}
                    data-testid="button-start-studying"
                  >
                    {t.ctaButton}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
