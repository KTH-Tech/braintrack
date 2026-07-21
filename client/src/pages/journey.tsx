import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/formatters";
import { Link } from "wouter";
import {
  Loader2, CheckCircle2, Star, Flame,
  BookOpen, Trophy, Target, Brain, Rocket, Sparkles, ArrowRight, Lock,
  Calendar, HelpCircle, FileText,
} from "lucide-react";
import rizzAvatar from "@assets/rizz-nav-transparent.png";
import { rizzMascot } from "@/components/rizz-brand";
import { LearnerHeader } from "@/components/learner-header";
import { GraffitiSplats } from "@/components/graffiti-splats";

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

/* Guideline rainbow — single source of truth for this page. */
const RAINBOW = [
  "#FFE29A", "#FFE29A", "#94F7C5", "#9FF5E8", "#9FD8FF", "#C5B3FF", "#FFB7E5",
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

/* Map each event type to one stop on the guideline pastel cycle. */
const EVENT_HEX: Record<string, string> = {
  onboarding: "#9FF5E8",
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

const marker = (color: string, size = 16): CSSProperties => ({
  fontFamily: "'Permanent Marker',cursive",
  fontSize: size,
  color,
  transform: "rotate(-2deg)",
  display: "inline-block",
  textShadow: `0 0 10px ${halo(color, 0.45)}`,
});

/* Cute sticker callout — small rotated speech-bubble chip, same graffiti
   language as the landing-page mural stickers (FOCUS/PLAN/ACHIEVE etc.),
   recreated in CSS since those live baked into the mural artwork. */
const sticker = (color: string, rotate: number, pos: CSSProperties): CSSProperties => ({
  position: "absolute",
  ...pos,
  transform: `rotate(${rotate}deg)`,
  fontFamily: "'Permanent Marker',cursive",
  fontSize: 16,
  lineHeight: 1.2,
  color,
  background: "rgba(5,5,8,.88)",
  border: `1.5px solid ${color}`,
  borderRadius: 14,
  padding: "6px 11px",
  boxShadow: `0 0 14px ${halo(color, 0.4)}`,
  whiteSpace: "nowrap",
  zIndex: 3,
});

const T = {
  en: {
    pageTitle: "Learning Journey",
    parentBadge: "Parent",
    homeTitle: "Home",
    backTitle: "Back",
    heroLabel: "Journey",
    heroSubtitle: "Your personal learning journey — every milestone, every spark.",
    hypeLine: "Every step counts. Let's get it! 🚀",
    sticker1: "You've got this!",
    sticker2: "Momentum building ⚡",
    sticker3: "Streak mode: ON 🔥",
    examReadyLink: "Exam Readiness",
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
    backTitle: "Terug",
    heroLabel: "Leerreis",
    heroSubtitle: "Jou persoonlike leerreis — elke mylpaal, elke vonk.",
    hypeLine: "Elke tree tel. Kom ons doen dit! 🚀",
    sticker1: "Jy kan dit doen!",
    sticker2: "Momentum bou ⚡",
    sticker3: "Reeks-modus: AAN 🔥",
    examReadyLink: "Eksamengereedheid",
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
  const { language } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const params = new URLSearchParams(window.location.search);
  const isParentView = params.get("parent") === "1";
  const backHref = isParentView ? "/parent" : "/dashboard";
  const backLabel = isParentView ? t.backTitle : t.homeTitle;

  const { data: journey, isLoading } = useQuery<JourneyData>({
    queryKey: ["/api/user/journey"],
  });

  const events = journey?.events ?? [];
  const completed = events.filter((e) => e.isCompleted);
  const upcoming = events.filter((e) => !e.isCompleted);

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}
    >
      {/* Light background scatter — kept low-opacity so it doesn't compete
          with Rizz's standing mascot illustration and sticker callouts below. */}
      <GraffitiSplats variant="band" opacity={0.32} />

      {/* ── Sticky street header ── */}
      <LearnerHeader
        backHref={backHref}
        backLabel={backLabel}
        title={t.pageTitle}
        maxWidthClassName="max-w-5xl"
        titleExtra={isParentView ? (
          <span
            className="text-[9px] font-black uppercase tracking-[0.22em] px-2 py-0.5 rounded-full shrink-0"
            style={{ color: "#C5B3FF", border: "1px solid #C5B3FF", background: "rgba(255,255,255,.03)" }}
          >
            {t.parentBadge}
          </span>
        ) : undefined}
      />

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Ambient pastel auras */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-40"
          style={{ background: "#9FF5E8" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -right-24 w-[380px] h-[380px] rounded-full blur-[120px] opacity-30"
          style={{ background: "#FFB7E5" }}
        />

        {/* ── Hero ── */}
        <section className="relative" style={{ animation: "bt-fadeup .5s both" }}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1 min-w-0 space-y-4">
              <div className="inline-flex items-center gap-2">
                <Rocket
                  className="w-4 h-4"
                  style={{ color: "#FFE29A", filter: "drop-shadow(0 0 4px #FFE29A)" }}
                />
                <span style={marker("#FFE29A")}>{t.heroLabel}</span>
              </div>
              <div
                role="heading"
                aria-level={1}
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.95]"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${RAINBOW.join(", ")})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {isAf
                  ? `${journey?.learnerName ? journey.learnerName : "Jou"} Leerreis`
                  : `${journey?.learnerName ? journey.learnerName + "'s" : "Your"} Journey`}
              </div>
              <p className="text-white font-medium text-sm sm:text-base max-w-2xl leading-relaxed" style={{ opacity: 0.94 }}>
                {t.heroSubtitle}
              </p>
              <span style={marker("#FFB7E5", 15)}>{t.hypeLine}</span>
            </div>

            {/* Rizz — standing full-body mascot (official handoff art, sneakers and all).
                Always visible so the journey page reads as Rizz-hosted, not just text;
                the sticker callouts progressively appear once there's room so nothing
                crowds the 375px header/hero the way the old dashboard sidebar once did. */}
            <div
              className="relative shrink-0 mx-auto lg:mx-0"
              style={{ width: 160, height: 192 }}
              data-testid="journey-rizz-mascot"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full blur-[50px] opacity-60"
                style={{ background: "#B388FF" }}
              />
              <img
                src={rizzMascot}
                alt={isAf ? "Rizz, jou studiemaat" : "Rizz, your study buddy"}
                className="relative"
                style={{
                  zIndex: 2,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  animation: "bt-float 6s ease-in-out infinite",
                  filter: "drop-shadow(0 16px 26px rgba(179,136,255,.35))",
                }}
              />
              <span className="hidden sm:inline-flex" style={sticker("#9FF5E8", -8, { top: -8, left: -14 })}>
                {t.sticker1}
              </span>
              <span className="hidden lg:inline-flex" style={sticker("#FFE29A", 7, { top: 26, right: -60 })}>
                {t.sticker2}
              </span>
              <span className="hidden lg:inline-flex" style={sticker("#FFB7E5", -6, { bottom: 8, left: -34 })}>
                {t.sticker3}
              </span>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#9FF5E8" }} />
          </div>
        ) : (
          <>
            {/* ── Rizz narrator card (Rizz-branded — keeps #6EE7F9) ── */}
            <section
              className="relative rounded-3xl p-5 sm:p-6 overflow-hidden"
              style={{
                background: "rgba(255,255,255,.03)",
                border: "1.5px solid #6EE7F9",
                borderRadius: 22,
                boxShadow: `0 0 28px ${halo("#6EE7F9", 0.28)}`,
                animation: "bt-fadeup .5s .05s both",
              }}
              data-testid="rizz-narrator"
            >
              <span
                aria-hidden
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "#6EE7F9", boxShadow: "0 0 10px #6EE7F9" }}
              />
              <div className="flex items-start gap-4">
                <div
                  className="shrink-0 w-14 h-14 rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(5,5,8,.6)",
                    border: "1.5px solid #6EE7F9",
                    boxShadow: `0 0 14px ${halo("#6EE7F9", 0.45)}`,
                  }}
                >
                  <img src={rizzAvatar} alt="Rizz" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block mb-1.5" style={marker("#6EE7F9", 15)}>
                    {t.rizzSays}
                  </span>
                  <p className="text-sm sm:text-base text-white leading-relaxed font-medium italic">
                    "{isAf ? journey?.rizzCommentAf : journey?.rizzComment}"
                  </p>
                </div>
              </div>
            </section>

            {/* ── Stats bar — 5 pastel chips ── */}
            {journey?.stats && (
              <section className="grid grid-cols-2 sm:grid-cols-5 gap-3" style={{ animation: "bt-fadeup .5s .1s both" }}>
                {[
                  { label: t.statDays,      value: journey.stats.totalDays,         hex: "#9FF5E8", Icon: Calendar,   testid: "stat-days"      },
                  { label: t.statBadges,    value: journey.stats.badgesEarned,      hex: "#9FD8FF", Icon: Trophy,     testid: "stat-badges"    },
                  { label: t.statQuestions, value: journey.stats.questionsAnswered, hex: "#FFB7E5", Icon: HelpCircle, testid: "stat-questions" },
                  { label: t.statPapers,    value: journey.stats.papersCompleted,   hex: "#C5B3FF", Icon: FileText,   testid: "stat-papers"    },
                  { label: t.statStreak,    value: journey.stats.currentStreak,     hex: "#FFE29A", Icon: Flame,      testid: "stat-streak"    },
                ].map(({ label, value, hex, Icon, testid }, i) => {
                  const h = halo(hex, 0.32);
                  return (
                    <div
                      key={label}
                      className="relative p-4 text-center overflow-hidden transition-transform"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: `1.5px solid ${hex}`,
                        borderRadius: 20,
                        boxShadow: `0 0 16px ${halo(hex, 0.22)}`,
                        transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "rotate(0deg) translateY(-6px)";
                        e.currentTarget.style.boxShadow = `0 0 26px ${h}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = `rotate(${i % 2 === 0 ? -1 : 1}deg)`;
                        e.currentTarget.style.boxShadow = `0 0 16px ${halo(hex, 0.22)}`;
                      }}
                      data-testid={testid}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <Icon className="w-3.5 h-3.5" style={{ color: hex, filter: `drop-shadow(0 0 4px ${h})` }} />
                        <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: hex }}>
                          {label}
                        </span>
                      </div>
                      <p
                        className="text-3xl font-black tabular-nums leading-none text-white"
                        style={{ textShadow: `0 0 12px ${h}` }}
                      >
                        {value}
                      </p>
                    </div>
                  );
                })}
              </section>
            )}

            {/* ── Completed timeline ── */}
            <section className="space-y-3" style={{ animation: "bt-fadeup .5s .15s both" }}>
              <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#9FF5E8", filter: "drop-shadow(0 0 4px #9FF5E8)" }} />
                {t.completedMilestones}
                <span
                  className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-black tabular-nums"
                  style={{ background: "rgba(255,255,255,.03)", border: "1px solid #9FF5E8", color: "#9FF5E8" }}
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
                  }}
                />

                <div className="space-y-3">
                  {completed.length === 0 && (
                    <div
                      className="flex items-center gap-3 p-4 text-white text-sm"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.08)",
                        borderRadius: 18,
                      }}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" style={{ color: "#FFB7E5" }} />
                      {t.emptyMilestones}
                    </div>
                  )}

                  {completed.map((event) => {
                    const Icon = EVENT_ICONS[event.type] ?? Star;
                    const hex = EVENT_HEX[event.type] ?? "#9FF5E8";
                    const h = halo(hex, 0.32);
                    return (
                      <div key={event.id} className="relative flex gap-4" data-testid={`journey-event-${event.id}`}>
                        {/* timeline node */}
                        <span
                          aria-hidden
                          className="absolute -left-[23px] top-4 w-3 h-3 rounded-full"
                          style={{
                            background: "#050508",
                            border: `2px solid ${hex}`,
                            boxShadow: `0 0 10px ${hex}, 0 0 20px ${h}`,
                          }}
                        />
                        <div
                          className="flex-1 p-4 transition-all"
                          style={{
                            background: "rgba(255,255,255,.03)",
                            border: `1px solid ${hex}`,
                            borderRadius: 18,
                            boxShadow: `0 0 14px ${halo(hex, 0.18)}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-6px)";
                            e.currentTarget.style.boxShadow = `0 0 24px ${h}`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = `0 0 14px ${halo(hex, 0.18)}`;
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{
                                  background: "rgba(5,5,8,.6)",
                                  border: `1.5px solid ${hex}`,
                                  boxShadow: `0 0 10px ${h}`,
                                }}
                              >
                                <Icon className="w-4 h-4" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex})` }} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-sm text-white leading-tight">
                                  {isAf ? event.titleAf : event.title}
                                </p>
                                <p className="text-[11px] text-white mt-1 leading-relaxed" style={{ opacity: 0.92 }}>
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
              <section className="space-y-3" style={{ animation: "bt-fadeup .5s .2s both" }}>
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                  <Lock className="w-3.5 h-3.5" style={{ color: "#C5B3FF" }} />
                  {t.upcomingGoals}
                  <span
                    className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-black tabular-nums text-white"
                    style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.18)" }}
                  >
                    {upcoming.length}
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {upcoming.slice(0, 6).map((event) => {
                    const Icon = EVENT_ICONS[event.type] ?? Star;
                    const hex = EVENT_HEX[event.type] ?? "#9FF5E8";
                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-4"
                        style={{
                          background: "rgba(255,255,255,.03)",
                          border: `1px dashed ${hex}55`,
                          borderRadius: 18,
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "rgba(5,5,8,.6)", border: `1px dashed ${hex}66` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: hex }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-sm text-white leading-tight">
                            {isAf ? event.titleAf : event.title}
                          </p>
                          <p className="text-[11px] text-white mt-1 leading-relaxed" style={{ opacity: 0.92 }}>
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
                className="relative p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 overflow-hidden"
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1.5px solid #FFB7E5",
                  borderRadius: 22,
                  boxShadow: `0 0 26px ${halo("#FFB7E5", 0.28)}`,
                  animation: "bt-fadeup .5s .25s both",
                }}
                data-testid="journey-cta"
              >
                <div className="min-w-0">
                  <span className="block mb-1" style={marker("#FFB7E5", 15)}>
                    {isAf ? "Klein treë, GROOT resultate!" : "Small steps BIG results!"}
                  </span>
                  <h3 className="font-black text-xl text-white">{t.ctaHeading}</h3>
                  <p className="text-sm text-white mt-1 leading-relaxed" style={{ opacity: 0.92 }}>
                    {t.ctaDescription}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col sm:flex-row items-stretch gap-2.5">
                  <Link href="/exam-ready">
                    <button
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm hover:bg-white/10 transition-all"
                      style={{ background: "rgba(255,255,255,.03)", color: "#fff", border: "1.5px solid rgba(255,255,255,.2)" }}
                      data-testid="button-exam-readiness"
                    >
                      <Target className="w-4 h-4" style={{ color: "#C5B3FF" }} />
                      {t.examReadyLink}
                    </button>
                  </Link>
                  <Link href="/subjects">
                    <button
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm transition-all"
                      style={{
                        background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
                        color: "#050508",
                        border: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                      }}
                      data-testid="button-start-studying"
                    >
                      {t.ctaButton}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
