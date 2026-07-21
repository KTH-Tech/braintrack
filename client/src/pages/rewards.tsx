import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/formatters";
import { useLocation } from "wouter";
import { Flame, Star, Zap, Target, Trophy, GraduationCap, Award, BookOpen, Coins, Lock, Loader2, ShoppingBag, ArrowRight, Users, Copy, Check, Share2, Sparkles, Medal } from "lucide-react";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { LearnerHeader } from "@/components/learner-header";
import { useState } from "react";

const BADGE_INFO: Record<string, {
  name: string;
  nameAf: string;
  icon: any;
  unlockHint: string;
  unlockHintAf: string;
}> = {
  streak_3:        { name: "3-Day Streak",   nameAf: "3-Dag Reeks",         icon: Flame,        unlockHint: "Study 3 days in a row",          unlockHintAf: "Studeer 3 dae agtereenvolgens" },
  streak_7:        { name: "7-Day Streak",   nameAf: "7-Dag Reeks",         icon: Flame,        unlockHint: "Study 7 days in a row",          unlockHintAf: "Studeer 7 dae agtereenvolgens" },
  streak_14:       { name: "14-Day Streak",  nameAf: "14-Dag Reeks",        icon: Flame,        unlockHint: "Study 14 days in a row",         unlockHintAf: "Studeer 14 dae agtereenvolgens" },
  streak_30:       { name: "30-Day Streak",  nameAf: "30-Dag Reeks",        icon: Flame,        unlockHint: "Study 30 days in a row",         unlockHintAf: "Studeer 30 dae agtereenvolgens" },
  questions_10:    { name: "10 Questions",   nameAf: "10 Vrae",             icon: Star,         unlockHint: "Answer 10 questions",            unlockHintAf: "Beantwoord 10 vrae" },
  questions_50:    { name: "50 Questions",   nameAf: "50 Vrae",             icon: Star,         unlockHint: "Answer 50 questions",            unlockHintAf: "Beantwoord 50 vrae" },
  questions_100:   { name: "100 Questions",  nameAf: "100 Vrae",            icon: Zap,          unlockHint: "Answer 100 questions",           unlockHintAf: "Beantwoord 100 vrae" },
  questions_500:   { name: "500 Questions",  nameAf: "500 Vrae",            icon: Zap,          unlockHint: "Answer 500 questions",           unlockHintAf: "Beantwoord 500 vrae" },
  accuracy_70:     { name: "70% Accuracy",  nameAf: "70% Akkuraatheid",    icon: Target,       unlockHint: "Reach 70% overall accuracy",     unlockHintAf: "Behaal 70% algehele akkuraatheid" },
  accuracy_80:     { name: "80% Accuracy",  nameAf: "80% Akkuraatheid",    icon: Target,       unlockHint: "Reach 80% overall accuracy",     unlockHintAf: "Behaal 80% algehele akkuraatheid" },
  accuracy_90:     { name: "90% Accuracy",  nameAf: "90% Akkuraatheid",    icon: Trophy,       unlockHint: "Reach 90% overall accuracy",     unlockHintAf: "Behaal 90% algehele akkuraatheid" },
  subject_mastery: { name: "Subject Master", nameAf: "Vak Meester",         icon: GraduationCap,unlockHint: "Master all topics in a subject", unlockHintAf: "Bemeester alle onderwerpe in 'n vak" },
  exam_complete:   { name: "Exam Ready",     nameAf: "Eksamen Gereed",      icon: Award,        unlockHint: "Complete a full exam paper",     unlockHintAf: "Voltooi 'n volledige vraestel" },
  first_paper:     { name: "First Paper",    nameAf: "Eerste Vraestel",     icon: BookOpen,     unlockHint: "Complete your first paper",       unlockHintAf: "Voltooi jou eerste vraestel" },
  high_score:      { name: "80% Club",       nameAf: "80% Klub",            icon: Trophy,       unlockHint: "Score 80% or higher on any quiz, exam or paper", unlockHintAf: "Behaal 80% of hoër in enige toets, eksamen of vraestel" },
};

const STREAK_MILESTONES = [3, 7, 14, 30];

const T = {
  en: {
    pageTitle: "Rewards",
    homeTitle: "Home",
    heroHeading: "Your Rewards",
    heroSubtitle: "Your coins, badges, and achievements — all in one place.",
    coinBalance: "Coin Balance",
    earned: "earned",
    spent: "spent",
    recentTransactions: "Recent transactions",
    noTransactions: "No transactions yet.",
    studyStreak: "Study Streak",
    daysInARow: "days in a row",
    yourBadges: "Your Badges",
    noBadges: "No badges yet — start studying!",
    stillToUnlock: "Still to Unlock",
    referHeading: "Refer a Friend — Earn a Free Month",
    referDesc: "Share your link. When 2 friends pay for Brain Boost, you get 1 free month added to your subscription.",
    copyLinkTitle: "Copy link",
    copied: "Copied",
    copy: "Copy",
    whatsappTitle: "Share on WhatsApp",
    progressToReward: "Progress to next reward",
    paidReferrals: "paid referrals",
    earnedLabel: "Earned",
    freeMonths: "free months",
    friendSingular: "friend",
    friendPlural: "friends",
    signedUpWaiting: "signed up — waiting on payment.",
    paidSubNote: "Only paid subscriptions count — free trials don't qualify.",
    spendCoins: "Spend your coins",
    spendDesc: "Power-ups like Streak Freeze, 2x Coins and the Mystery Box are waiting in the Learner Store.",
    goToStore: "Go to Store",
    yourCode: "Your referral code",
    shareLink: "Share link",
    webShare: "Share",
    upgradeToRefer: "Subscribe to unlock referrals",
    upgradeToReferDesc: "Start your Brain Boost subscription to get a personal referral code and earn free months.",
    upgradeCta: "Start Free Trial",
    leaderboardHeading: "Referral Leaderboard",
    leaderboardSubtitle: "Top learners by paid referrals.",
    leaderboardEmpty: "No paid referrals yet — be the first to climb the board!",
    leaderboardYou: "You",
    leaderboardRank: "Rank",
    leaderboardLearner: "Learner",
    leaderboardPaid: "Paid",
    leaderboardYourRank: "Your rank",
    leaderboardUnranked: "Refer a friend to enter the leaderboard.",
  },
  af: {
    pageTitle: "Belonings",
    homeTitle: "Tuis",
    heroHeading: "Jou Belonings",
    heroSubtitle: "Jou punte, kentekens en prestasies — alles op een plek.",
    coinBalance: "Muntsaldo",
    earned: "verdien",
    spent: "spandeer",
    recentTransactions: "Onlangse transaksies",
    noTransactions: "Nog geen transaksies nie.",
    studyStreak: "Studie-reeks",
    daysInARow: "dae agtereenvolgens",
    yourBadges: "Jou Kentekens",
    noBadges: "Nog geen kentekens verdien nie — begin studeer!",
    stillToUnlock: "Nog te ontsluit",
    referHeading: "Verwys 'n Vriend — Verdien 'n Gratis Maand",
    referDesc: "Deel jou skakel. Wanneer 2 vriende vir Brain Boost intekening betaal, kry jy 1 gratis maand by jou intekening gevoeg.",
    copyLinkTitle: "Kopieer skakel",
    copied: "Gekopieer",
    copy: "Kopieer",
    whatsappTitle: "Deel op WhatsApp",
    progressToReward: "Voortgang na volgende beloning",
    paidReferrals: "betaalde verwysings",
    earnedLabel: "Verdien",
    freeMonths: "gratis maande",
    friendSingular: "vriend",
    friendPlural: "vriende",
    signedUpWaiting: "het ingeteken — wag op betaling.",
    paidSubNote: "Slegs betaalde intekenings tel — gratis proeftydperke tel nie.",
    spendCoins: "Spandeer jou munte",
    spendDesc: "Hupstote soos Reeks Vries, 2x Munte en die Raaiselkas wag in die Leerderwinkel.",
    goToStore: "Gaan na winkel",
    yourCode: "Jou verwysings kode",
    shareLink: "Deel skakel",
    webShare: "Deel",
    upgradeToRefer: "Teken in om verwysings te ontsluit",
    upgradeToReferDesc: "Begin jou Brain Boost-intekening om 'n persoonlike verwysings kode te kry en gratis maande te verdien.",
    upgradeCta: "Begin Gratis Proef",
    leaderboardHeading: "Verwysings Ranglys",
    leaderboardSubtitle: "Top leerders volgens betaalde verwysings.",
    leaderboardEmpty: "Nog geen betaalde verwysings nie — wees die eerste!",
    leaderboardYou: "Jy",
    leaderboardRank: "Rang",
    leaderboardLearner: "Leerder",
    leaderboardPaid: "Betaal",
    leaderboardYourRank: "Jou rang",
    leaderboardUnranked: "Verwys 'n vriend om op die ranglys te kom.",
  },
} as const;

export default function RewardsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const isAf = language === "af";
  const t = T[language];

  if (user?.role === "parent") {
    setLocation("/parent");
    return null;
  }


  const { data: coins, isLoading: coinsLoading } = useQuery<{ balance: number; totalEarned: number; totalSpent: number }>({
    queryKey: ["/api/user/coins"],
  });

  const { data: transactions, isLoading: txLoading } = useQuery<any[]>({
    queryKey: ["/api/user/coins/transactions"],
  });

  const { data: badges, isLoading: badgesLoading } = useQuery<any[]>({
    queryKey: ["/api/user/badges"],
  });

  const { data: stats } = useQuery<{ studyStreak: number; accuracy: number; questionsAnswered: number }>({
    queryKey: ["/api/user/stats"],
  });

  const { data: referralCode } = useQuery<{ code: string; link: string }>({
    queryKey: ["/api/referral/my-code"],
  });

  const { data: referral } = useQuery<{
    code: string;
    link: string;
    threshold: number;
    pendingReferrals: number;
    paidReferrals: number;
    towardNextReward: number;
    monthsEarned: number;
  }>({
    queryKey: ["/api/referral/my-link"],
  });

  const { data: leaderboard } = useQuery<{
    top: { rank: number; displayName: string; conversions: number; isCurrentUser: boolean }[];
    me: { rank: number | null; displayName: string; conversions: number; totalRanked: number };
  }>({
    queryKey: ["/api/referral/leaderboard"],
  });

  const { data: subscriptionStatus } = useQuery<{ active: boolean; status: string | null; trialEndsAt: string | null }>({
    queryKey: ["/api/user/subscription-status"],
  });
  const isSubscribed = subscriptionStatus?.active;

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = async () => {
    const code = referralCode?.code ?? referral?.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyLink = async () => {
    const link = referralCode?.link ?? referral?.link;
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleWebShare = async () => {
    const link = referralCode?.link ?? referral?.link;
    if (!link) return;
    const shareData = {
      title: "BrainTrack",
      text: isAf
        ? `Sluit by my aan op BrainTrack om vir die NSC eksamens voor te berei:`
        : `Join me on BrainTrack to prep for the NSC exams:`,
      url: link,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled or share failed — fall back to WhatsApp
        handleWhatsApp();
      }
    } else {
      handleWhatsApp();
    }
  };

  const handleWhatsApp = () => {
    const link = referralCode?.link ?? referral?.link;
    if (!link) return;
    const msg = isAf
      ? `Hi! Sluit by my aan op BrainTrack om vir die NSC eksamens voor te berei: ${link}`
      : `Hey! Join me on BrainTrack to prep for the NSC exams: ${link}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const earnedCodes = new Set((badges ?? []).map((b: any) => b.badgeCode));
  const allBadgeCodes = Object.keys(BADGE_INFO);
  const earnedBadges = (badges ?? []);
  const lockedBadges = allBadgeCodes.filter(code => !earnedCodes.has(code));

  const streak = stats?.studyStreak ?? 0;
  const nextMilestone = STREAK_MILESTONES.find(m => m > streak);
  const daysToNext = nextMilestone ? nextMilestone - streak : 0;

  const isLoading = coinsLoading || badgesLoading;

  return (
    <div className="min-h-screen text-white relative" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      {/* One fixed full-page graffiti wall behind everything */}
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: 0, opacity: 0.9 }}>
        <GraffitiSplats variant="full" opacity={0.9} />
      </div>
      <LearnerHeader
        backHref="/dashboard"
        backLabel={t.homeTitle}
        title={t.pageTitle}
        titleColor="#9FF5E8"
        maxWidthClassName="max-w-4xl"
      />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Graffiti hero — soft card, marker heading */}
        <div
          className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
          style={{
            background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          data-testid="rewards-hero"
        >
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }}
          />
          <div className="relative flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,226,154,.15)", border: "1.5px solid #FFE29A" }}
            >
              <Trophy className="w-7 h-7" style={{ color: "#FFE29A" }} />
            </div>
            <div className="flex-1 min-w-0">
              <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFE29A", transform: "rotate(-2deg)", display: "inline-block" }}>
                {isAf ? "verdien dit, dra dit!" : "earn it, flex it!"} 🏆
              </span>
              <div
                role="heading"
                aria-level={1}
                className="font-black leading-tight text-2xl sm:text-3xl"
                style={{
                  backgroundImage: "linear-gradient(90deg,#FFE29A,#FFE29A,#94F7C5,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {t.heroHeading}
              </div>
              <p className="text-sm text-white mt-2">
                {t.heroSubtitle}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FFE29A" }} />
          </div>
        ) : (
          <>
            {/* Coin Balance + Study Streak */}
            <div className="grid sm:grid-cols-3 gap-4">
              <CosmicCard hex="#FFE29A" halo="rgba(255,226,154," className="sm:col-span-2" testId="card-coin-balance">
                <CosmicCardTitle hex="#FFE29A" halo="rgba(255,226,154," icon={Coins}>
                  {t.coinBalance}
                </CosmicCardTitle>
                <div className="p-5 pt-3">
                  <div className="flex items-end gap-4 mb-4">
                    <span
                      className="text-5xl tabular-nums"
                      style={{ color: "#FFE29A", fontWeight: 900 }}
                      data-testid="coin-balance"
                    >
                      {coins?.balance ?? 0}
                    </span>
                    <div className="flex flex-col text-xs text-white mb-1 gap-0.5">
                      <span><span style={{ color: "#9FD8FF" }}>↑</span> {coins?.totalEarned ?? 0} {t.earned}</span>
                      <span><span style={{ color: "#FFB7E5" }}>↓</span> {coins?.totalSpent ?? 0} {t.spent}</span>
                    </div>
                  </div>
                  {!txLoading && transactions && transactions.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-2">
                        {t.recentTransactions}
                      </p>
                      {transactions.slice(0, 8).map((tx: any, i: number) => {
                        if (!tx) return null;
                        const positive = (tx.amount ?? 0) > 0;
                        return (
                          <div key={i} className="flex justify-between items-center text-sm py-1 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.06)" }} data-testid={`tx-row-${i}`}>
                            <span className="text-white truncate max-w-[180px]">{tx.description || tx.reason || ""}</span>
                            <span className="font-bold tabular-nums" style={{ color: positive ? "#9FD8FF" : "#FFB7E5" }}>
                              {positive ? "+" : ""}{tx.amount ?? 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {(!transactions || transactions.length === 0) && (
                    <p className="text-sm text-white">{t.noTransactions}</p>
                  )}
                </div>
              </CosmicCard>

              <CosmicCard hex="#FFE29A" halo="rgba(255,226,154," testId="card-streak">
                <CosmicCardTitle hex="#FFE29A" halo="rgba(255,226,154," icon={Flame}>
                  {t.studyStreak}
                </CosmicCardTitle>
                <div className="p-5 pt-3">
                  <div
                    className="text-5xl font-black tabular-nums mb-1"
                    style={{ color: "#FFE29A" }}
                    data-testid="streak-count"
                  >
                    {streak}
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white mb-4 font-bold">
                    {t.daysInARow}
                  </p>
                  <div className="flex gap-2">
                    {STREAK_MILESTONES.map((m) => {
                      const hit = streak >= m;
                      return (
                        <div
                          key={m}
                          className="flex flex-col items-center flex-1 rounded-xl py-2 bg-black/40 transition-all"
                          style={{
                            border: hit ? "1px solid rgba(255,226,154,0.6)" : "1px solid rgba(255,255,255,0.1)",
                          }}
                          data-testid={`milestone-${m}`}
                        >
                          <Flame className="w-4 h-4" style={{ color: hit ? "#FFE29A" : "#FFFFFF" }} />
                          <span className="text-xs font-bold mt-0.5" style={{ color: hit ? "#FFE29A" : "#FFFFFF" }}>{m}</span>
                        </div>
                      );
                    })}
                  </div>
                  {nextMilestone && (
                    <p className="text-xs text-white mt-3 text-center">
                      {isAf
                        ? `Nog ${daysToNext} dag${daysToNext !== 1 ? "e" : ""} tot ${nextMilestone}-dag kenteken`
                        : `${daysToNext} day${daysToNext !== 1 ? "s" : ""} to ${nextMilestone}-day badge`}
                    </p>
                  )}
                </div>
              </CosmicCard>
            </div>

            {/* Earned badges */}
            <CosmicCard hex="#FFE29A" halo="rgba(255,226,154," testId="card-earned-badges">
              <CosmicCardTitle hex="#FFE29A" halo="rgba(255,226,154," icon={Trophy} count={earnedBadges.length}>
                {t.yourBadges}
              </CosmicCardTitle>
              <div className="p-5 pt-3">
                {earnedBadges.length === 0 ? (
                  <p className="text-sm text-white text-center py-4">
                    {t.noBadges}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {earnedBadges.map((badge: any) => {
                      const info = BADGE_INFO[badge.badgeCode];
                      if (!info) return null;
                      const Icon = info.icon;
                      return (
                        <div
                          key={badge.id}
                          className="relative flex flex-col items-center gap-2 p-3 rounded-xl bg-black/40 text-center transition-all duration-300 hover:-translate-y-0.5"
                          style={{
                            border: "1px solid rgba(255,226,154,0.4)",
                          }}
                          data-testid={`earned-badge-${badge.badgeCode}`}
                        >
                          <div
                            className="w-11 h-11 rounded-full bg-black flex items-center justify-center"
                            style={{ border: "1px solid rgba(255,226,154,0.5)" }}
                          >
                            <Icon className="w-5 h-5" style={{ color: "#FFE29A" }} />
                          </div>
                          <span className="text-xs font-bold text-white leading-tight">{isAf ? info.nameAf : info.name}</span>
                          {badge.earnedAt && (
                            <span className="text-[10px] text-white">{formatDate(badge.earnedAt, language, { day: "numeric", month: "short", year: "numeric" })}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CosmicCard>

            {/* Locked badges */}
            <CosmicCard hex="#C5B3FF" halo="rgba(197,179,255," testId="card-locked-badges">
              <CosmicCardTitle hex="#C5B3FF" halo="rgba(197,179,255," icon={Lock} count={lockedBadges.length}>
                {t.stillToUnlock}
              </CosmicCardTitle>
              <div className="p-5 pt-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {lockedBadges.map((code) => {
                    const info = BADGE_INFO[code];
                    if (!info) return null;
                    const Icon = info.icon;
                    return (
                      <div
                        key={code}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-black/40 text-center"
                        style={{ border: "1px dashed rgba(255,255,255,0.14)" }}
                        data-testid={`locked-badge-${code}`}
                      >
                        <div
                          className="w-11 h-11 rounded-full bg-black flex items-center justify-center relative"
                          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                          <Lock className="w-3 h-3 text-white absolute -bottom-0.5 -right-0.5" />
                        </div>
                        <span className="text-xs font-bold text-white leading-tight">{isAf ? info.nameAf : info.name}</span>
                        <span className="text-[10px] text-white leading-tight">{isAf ? info.unlockHintAf : info.unlockHint}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CosmicCard>

            {/* Refer a Friend */}
            <CosmicCard hex="#9FD8FF" halo="rgba(159,216,255," testId="card-refer-friend">
              <CosmicCardTitle hex="#9FD8FF" halo="rgba(159,216,255," icon={Users}>
                {t.referHeading}
              </CosmicCardTitle>
              <div className="p-5 pt-3 space-y-4">
                {isSubscribed === false ? (
                  /* ── No active subscription — show upgrade CTA ── */
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center"
                      style={{ border: "1px solid rgba(159,216,255,0.4)" }}
                    >
                      <Sparkles className="w-7 h-7" style={{ color: "#9FD8FF" }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white mb-1">{t.upgradeToRefer}</p>
                      <p className="text-xs text-white max-w-xs mx-auto">{t.upgradeToReferDesc}</p>
                    </div>
                    <button
                      onClick={() => setLocation("/subscribe")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                      style={{ background: "#9FD8FF", color: "#0a0a0a" }}
                      data-testid="button-upgrade-to-refer"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t.upgradeCta}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* ── Active subscriber — show code + link + progress ── */
                  <>
                    <p className="text-sm text-white">
                      {t.referDesc}
                    </p>

                    {/* Prominent referral code */}
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white font-bold mb-2">
                        {t.yourCode}
                      </p>
                      <div
                        className="flex items-center gap-3 p-3 rounded-xl bg-black/40"
                        style={{ border: "1px solid rgba(159,216,255,0.4)" }}
                      >
                        <code
                          className="flex-1 text-base sm:text-lg font-black font-mono tracking-wide"
                          style={{ color: "#9FD8FF" }}
                          data-testid="referral-code"
                        >
                          {referralCode?.code ?? referral?.code ?? "—"}
                        </code>
                        <button
                          onClick={handleCopyCode}
                          disabled={!(referralCode?.code ?? referral?.code)}
                          title={t.copyLinkTitle}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold bg-black text-[#9FD8FF] hover:bg-[#9FD8FF]/10 transition-colors disabled:opacity-50"
                          style={{ border: "1.5px solid #9FD8FF" }}
                          data-testid="button-copy-referral"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? t.copied : t.copy}
                        </button>
                      </div>
                    </div>

                    {/* Share link row */}
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white font-bold mb-2">
                        {t.shareLink}
                      </p>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40" style={{ border: "1px solid rgba(159,216,255,0.25)" }}>
                        <code className="flex-1 text-xs text-white truncate font-mono" data-testid="referral-link">
                          {referralCode?.link ?? referral?.link ?? "—"}
                        </code>
                        <button
                          onClick={handleCopyLink}
                          disabled={!(referralCode?.link ?? referral?.link)}
                          title={t.copyLinkTitle}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold bg-black text-[#9FD8FF] hover:bg-[#9FD8FF]/10 transition-colors disabled:opacity-50 shrink-0"
                          style={{ border: "1.5px solid #9FD8FF" }}
                          data-testid="button-copy-referral-link"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedLink ? t.copied : t.copy}
                        </button>
                        <button
                          onClick={handleWebShare}
                          disabled={!(referralCode?.link ?? referral?.link)}
                          title={t.whatsappTitle}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                          style={{ background: "#94F7C5", color: "#0a0a0a" }}
                          data-testid="button-whatsapp-referral"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          {t.webShare}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-[160px]">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white font-bold mb-1.5">
                          {t.progressToReward}
                        </p>
                        <p className="text-sm text-white" data-testid="referral-progress-text">
                          <span className="font-black text-lg" style={{ color: "#9FD8FF" }}>
                            {referral?.towardNextReward ?? 0}
                          </span>
                          <span className="text-white"> / {referral?.threshold ?? 2} </span>
                          {t.paidReferrals}
                        </p>
                        <div className="h-2 rounded-full bg-white/10 mt-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, ((referral?.towardNextReward ?? 0) / (referral?.threshold ?? 2)) * 100)}%`,
                              background: "linear-gradient(90deg,#9FD8FF,#9FD8FF)",
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white font-bold mb-1">
                          {t.earnedLabel}
                        </p>
                        <p className="text-2xl font-black tabular-nums" style={{ color: "#9FD8FF" }} data-testid="referral-months-earned">
                          {referral?.monthsEarned ?? 0}
                        </p>
                        <p className="text-[10px] text-white leading-tight">
                          {t.freeMonths}
                        </p>
                      </div>
                    </div>

                    {(referral?.pendingReferrals ?? 0) > 0 && (
                      <p className="text-xs text-white">
                        {(() => {
                          const n = referral!.pendingReferrals;
                          return `${n} ${n === 1 ? t.friendSingular : t.friendPlural} ${t.signedUpWaiting}`;
                        })()}
                      </p>
                    )}
                    <p className="text-[10px] text-white">
                      {t.paidSubNote}
                    </p>
                  </>
                )}
              </div>
            </CosmicCard>

            {/* Referral Leaderboard */}
            <CosmicCard hex="#FFE29A" halo="rgba(255,226,154," testId="card-referral-leaderboard">
              <CosmicCardTitle hex="#FFE29A" halo="rgba(255,226,154," icon={Medal}>
                {t.leaderboardHeading}
              </CosmicCardTitle>
              <div className="p-5 pt-3 space-y-3">
                <p className="text-sm text-white">{t.leaderboardSubtitle}</p>
                {(!leaderboard || leaderboard.top.length === 0) ? (
                  <p className="text-sm text-white italic py-4 text-center" data-testid="leaderboard-empty">
                    {t.leaderboardEmpty}
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 text-[10px] uppercase tracking-[0.18em] text-white font-bold px-3 pb-1">
                      <span>{t.leaderboardRank}</span>
                      <span>{t.leaderboardLearner}</span>
                      <span className="text-right">{t.leaderboardPaid}</span>
                    </div>
                    <ul className="space-y-1.5" data-testid="leaderboard-list">
                      {leaderboard.top.map((row) => {
                        const isMe = row.isCurrentUser;
                        const medal = row.rank === 1 ? "#FFE29A" : row.rank === 2 ? "#9FD8FF" : row.rank === 3 ? "#FFE29A" : null;
                        return (
                          <li
                            key={`${row.rank}-${row.displayName}`}
                            className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-center px-3 py-2 rounded-lg"
                            style={{
                              background: isMe ? "rgba(159,216,255,0.12)" : "rgba(255,255,255,0.03)",
                              border: isMe ? "1px solid rgba(159,216,255,0.5)" : "1px solid rgba(255,255,255,0.06)",
                            }}
                            data-testid={`leaderboard-row-${row.rank}`}
                          >
                            <span
                              className="font-black text-sm tabular-nums min-w-[1.75rem] text-center"
                              style={{ color: medal ?? (isMe ? "#9FD8FF" : "#FFFFFF") }}
                            >
                              {row.rank}
                            </span>
                            <span className="text-sm text-white truncate flex items-center gap-2">
                              {row.displayName}
                              {isMe && (
                                <span
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                                  style={{ background: "rgba(159,216,255,0.2)", color: "#9FD8FF", border: "1px solid rgba(159,216,255,0.5)" }}
                                >
                                  {t.leaderboardYou}
                                </span>
                              )}
                            </span>
                            <span className="font-bold text-sm tabular-nums" style={{ color: isMe ? "#9FD8FF" : "#FFE29A" }}>
                              {row.conversions}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    {leaderboard.me && !leaderboard.top.some((r) => r.isCurrentUser) && (
                      <div
                        className="mt-3 px-3 py-2 rounded-lg flex items-center justify-between"
                        style={{ background: "rgba(159,216,255,0.10)", border: "1px solid rgba(159,216,255,0.5)" }}
                        data-testid="leaderboard-you-row"
                      >
                        <span className="text-xs text-white">
                          {t.leaderboardYourRank}:{" "}
                          <span className="font-black text-white">
                            {leaderboard.me.rank ? `#${leaderboard.me.rank}` : "—"}
                          </span>
                        </span>
                        <span className="text-xs text-white">
                          <span className="font-bold tabular-nums" style={{ color: "#9FD8FF" }}>
                            {leaderboard.me.conversions}
                          </span>{" "}
                          <span className="text-white">{t.paidReferrals}</span>
                        </span>
                      </div>
                    )}
                    {leaderboard.me && leaderboard.me.rank === null && (
                      <p className="text-xs text-white italic mt-2 text-center">
                        {t.leaderboardUnranked}
                      </p>
                    )}
                  </>
                )}
              </div>
            </CosmicCard>

            {/* Store CTA */}
            <CosmicCard hex="#9FD8FF" halo="rgba(159,216,255," testId="card-store-cta">
              <CosmicCardTitle hex="#9FD8FF" halo="rgba(159,216,255," icon={ShoppingBag}>
                {t.spendCoins}
              </CosmicCardTitle>
              <div className="p-5 pt-3 flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-sm text-white flex-1">
                  {t.spendDesc}
                </p>
                <button
                  onClick={() => setLocation("/store")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
                  style={{ background: "#94F7C5", color: "#0a0a0a" }}
                  data-testid="button-go-to-store"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t.goToStore}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </CosmicCard>

          </>
        )}
      </main>
    </div>
  );
}

function CosmicCard({
  hex,
  halo,
  className = "",
  testId,
  children,
}: {
  hex: string;
  halo: string;
  className?: string;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all ${className}`}
      style={{
        background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
        border: `1px solid ${hex}44`,
      }}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

function CosmicCardTitle({
  hex,
  halo,
  icon: Icon,
  count,
  children,
}: {
  hex: string;
  halo: string;
  icon: any;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-5 py-4"
      style={{ borderBottom: `1px solid ${hex}33` }}
    >
      <Icon className="w-4 h-4" style={{ color: hex }} />
      <span
        className="flex-1"
        style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: hex, transform: "rotate(-1.5deg)", display: "inline-block" }}
      >
        {children}
      </span>
      {typeof count === "number" && (
        <span
          className="text-[11px] font-black px-2 py-0.5 rounded-full"
          style={{ color: hex, border: `1px solid ${hex}`, background: `${hex}1A` }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
