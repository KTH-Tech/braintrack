import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Star, Zap, Target, Trophy, GraduationCap, Award, BookOpen, X, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

const BADGE_INFO: Record<string, { name: string; nameAf: string; icon: any; color: string; glow: string; isFirstTime?: boolean }> = {
  first_quiz:       { name: "First Quiz",       nameAf: "Eerste Toets",        icon: Star,         color: "text-amber-400",   glow: "rgba(251,191,36,0.6)",  isFirstTime: true },
  first_paper:      { name: "First Paper",       nameAf: "Eerste Vraestel",     icon: BookOpen,     color: "text-cyan-400",    glow: "rgba(34,211,238,0.6)",  isFirstTime: true },
  high_score:       { name: "80% Club",          nameAf: "80% Klub",            icon: Trophy,       color: "text-yellow-400",  glow: "rgba(250,204,21,0.7)",  isFirstTime: true },
  improvement_15:   { name: "15% Improver",      nameAf: "15% Verbeteraar",     icon: Zap,          color: "text-green-400",   glow: "rgba(74,222,128,0.6)",  isFirstTime: true },
  streak_3:         { name: "3-Day Streak",       nameAf: "3-Dag Reeks",         icon: Flame,        color: "text-orange-400",  glow: "rgba(251,146,60,0.6)" },
  streak_7:         { name: "7-Day Streak",       nameAf: "7-Dag Reeks",         icon: Flame,        color: "text-orange-500",  glow: "rgba(249,115,22,0.6)" },
  streak_14:        { name: "14-Day Streak",      nameAf: "14-Dag Reeks",        icon: Flame,        color: "text-red-400",     glow: "rgba(248,113,113,0.6)" },
  streak_30:        { name: "30-Day Streak",      nameAf: "30-Dag Reeks",        icon: Flame,        color: "text-red-500",     glow: "rgba(239,68,68,0.7)",   isFirstTime: true },
  topic_mastery:    { name: "Topic Master",       nameAf: "Onderwerp Meester",   icon: Target,       color: "text-emerald-400", glow: "rgba(52,211,153,0.6)",  isFirstTime: true },
  subject_mastery:  { name: "Subject Master",     nameAf: "Vak Meester",         icon: GraduationCap,color: "text-cyan-400",  glow: "rgba(34, 211, 238,0.7)", isFirstTime: true },
  study_week:       { name: "Full Study Week",    nameAf: "Volle Studieweek",    icon: Sparkles,     color: "text-pink-400",    glow: "rgba(244,114,182,0.7)", isFirstTime: true },
  questions_10:     { name: "10 Questions",       nameAf: "10 Vrae",             icon: Star,         color: "text-amber-300",   glow: "rgba(252,211,77,0.5)" },
  questions_50:     { name: "50 Questions",       nameAf: "50 Vrae",             icon: Star,         color: "text-yellow-400",  glow: "rgba(250,204,21,0.6)" },
  questions_100:    { name: "100 Questions",      nameAf: "100 Vrae",            icon: Zap,          color: "text-blue-400",    glow: "rgba(96,165,250,0.6)",  isFirstTime: true },
  questions_500:    { name: "500 Questions",      nameAf: "500 Vrae",            icon: Zap,          color: "text-blue-500",    glow: "rgba(59,130,246,0.7)",  isFirstTime: true },
  accuracy_70:      { name: "70% Accuracy",       nameAf: "70% Akkuraatheid",    icon: Target,       color: "text-green-400",   glow: "rgba(74,222,128,0.5)" },
  accuracy_80:      { name: "80% Accuracy",       nameAf: "80% Akkuraatheid",    icon: Target,       color: "text-green-500",   glow: "rgba(34,197,94,0.6)" },
  accuracy_90:      { name: "90% Accuracy",       nameAf: "90% Akkuraatheid",    icon: Trophy,       color: "text-cyan-400",  glow: "rgba(186, 230, 253,0.7)", isFirstTime: true },
  exam_complete:    { name: "Exam Ready",         nameAf: "Eksamen Gereed",      icon: Award,        color: "text-emerald-400", glow: "rgba(52,211,153,0.6)" },
  exam_champion:    { name: "Exam Champion",      nameAf: "Eksamen Kampioen",    icon: Award,        color: "text-gold-400",    glow: "rgba(251,191,36,0.7)",  isFirstTime: true },
};

interface BadgePopupProps {
  badgeCode: string | null;
  isAf?: boolean;
  onDismiss: () => void;
}

export function BadgePopup({ badgeCode, isAf = false, onDismiss }: BadgePopupProps) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!badgeCode) {
      hasRun.current = false;
      return;
    }

    const info = BADGE_INFO[badgeCode];
    if (!info) return;

    if (info.isFirstTime && !hasRun.current) {
      hasRun.current = true;
      const end = Date.now() + 2000;
      const colors = ["#06b6d4", "#3b82f6", "#f59e0b", "#10b981", "#ec4899"];
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
          disableForReducedMotion: true,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }

    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [badgeCode, onDismiss]);

  const info = badgeCode ? BADGE_INFO[badgeCode] : null;

  return (
    <AnimatePresence>
      {badgeCode && info && (
        <motion.div
          key={badgeCode}
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            className="pointer-events-auto relative rounded-3xl border border-white/20 bg-background/95 shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4"
            style={{
              boxShadow: `0 0 40px 8px ${info.glow}, 0 8px 32px rgba(0,0,0,0.4)`,
            }}
          >
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 text-white hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-[10px] font-bold text-white uppercase tracking-widest">
              {isAf ? "Kenteken Verdien!" : "Badge Earned!"}
            </p>

            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${info.glow} 0%, transparent 70%)`,
                border: `2px solid ${info.glow}`,
              }}
            >
              {(() => { const Icon = info.icon; return <Icon className={`w-12 h-12 ${info.color}`} />; })()}
            </motion.div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-foreground">
                {isAf ? info.nameAf : info.name}
              </h2>
              {info.isFirstTime && (
                <p className="text-xs text-white font-semibold">
                  {isAf ? "Eerste keer!" : "First time!"}
                </p>
              )}
            </div>

            <motion.div
              className="w-full h-0.5 rounded-full bg-gradient-to-r from-transparent via-current to-transparent"
              style={{ color: info.glow }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <p className="text-xs text-white text-center">
              {isAf ? "Tap om te sluit" : "Tap to dismiss"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
