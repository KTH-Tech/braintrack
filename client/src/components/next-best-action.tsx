import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type FC } from "react";
import { ArrowRight, BookOpen, CheckCircle, Clock, Flame, Headphones, RotateCcw, Sparkles, Zap, type LucideProps } from "lucide-react";
import { Card } from "@/components/ui/card";

type AccentKey = "cyan" | "amber" | "emerald" | "violet" | "red";

interface NextAction {
  type: "quiz" | "revision" | "review" | "challenge" | "audio";
  title: string;
  titleAf: string;
  description: string;
  descriptionAf: string;
  href: string;
  accent: AccentKey;
  meta?: {
    masteryBand?: string;
    masteryScore?: number;
    subjectId?: number | null;
    topicName?: string | null;
    daysToExam?: number;
    vark?: string;
  };
}

interface NextBestActionProps {
  isAf: boolean;
}

const ACCENT_STYLES: Record<AccentKey, { card: string; icon: string; btn: string }> = {
  cyan:    { card: "border-cyan-300/30 bg-cyan-500/[0.08]",       icon: "text-cyan-500",    btn: "bg-cyan-500/10 text-cyan-600 border-cyan-300/40 hover:bg-cyan-500/20" },
  amber:   { card: "border-amber-300/30 bg-amber-500/[0.08]",     icon: "text-amber-500",   btn: "bg-amber-500/10 text-amber-600 border-amber-300/40 hover:bg-amber-500/20" },
  emerald: { card: "border-emerald-300/30 bg-emerald-500/[0.08]", icon: "text-emerald-500", btn: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40 hover:bg-emerald-500/20" },
  violet:  { card: "border-violet-300/30 bg-violet-500/[0.08]",   icon: "text-violet-500",  btn: "bg-violet-500/10 text-violet-600 border-violet-300/40 hover:bg-violet-500/20" },
  red:     { card: "border-red-300/40 bg-red-500/[0.10]",         icon: "text-red-500",     btn: "bg-red-500/10 text-red-600 border-red-300/40 hover:bg-red-500/20" },
};

const AI_QUIZ_HREFS = ["/flashcards/quiz", "/ai-quiz", "/api/flashcards/quiz"];

function sanitizeAction(action: NextAction | undefined): NextAction | undefined {
  if (!action) return action;
  const isAiQuiz = AI_QUIZ_HREFS.some(p => action.href.startsWith(p));
  if (!isAiQuiz) return action;
  return { ...action, href: "/subjects" };
}

const ACTION_ICONS: Record<NextAction["type"], FC<LucideProps>> = {
  quiz: Zap,
  revision: RotateCcw,
  review: BookOpen,
  challenge: Flame,
  audio: Headphones,
};

export function NextBestAction({ isAf }: NextBestActionProps) {
  const { data, isLoading } = useQuery<{ action: NextAction }>({
    queryKey: ["/api/learner/next-action"],
    staleTime: 30000,
  });

  const action = sanitizeAction(data?.action);
  const styles = ACCENT_STYLES[action?.accent ?? "cyan"];
  const Icon = ACTION_ICONS[action?.type ?? "quiz"];

  return (
    <Card
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${action ? styles.card : "border-border"}`}
      data-testid="next-best-action-widget"
    >
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border/50">
        <CheckCircle className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">
          {isAf ? "Volgende Stap" : "Next Best Action"}
        </h2>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
        ) : action ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${styles.card}`}>
              <Icon className={`w-7 h-7 ${styles.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-base leading-tight">
                {isAf ? action.titleAf : action.title}
              </p>
              <p className="text-sm text-white mt-0.5 leading-snug">
                {isAf ? action.descriptionAf : action.description}
              </p>
              {action.meta && (action.meta.vark || action.meta.daysToExam !== undefined) && (
                <div className="flex items-center gap-2 mt-2 flex-wrap" data-testid="next-action-meta">
                  {action.meta.vark && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border border-border/60 text-white">
                      <Sparkles className="w-3 h-3" />
                      {isAf ? "VARK" : "VARK"}: {action.meta.vark}
                    </span>
                  )}
                  {action.meta.masteryBand && action.meta.masteryScore !== undefined && (
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border border-border/60 text-white">
                      {action.meta.masteryBand} · {action.meta.masteryScore}%
                    </span>
                  )}
                  {action.meta.daysToExam !== undefined && (
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border border-border/60 text-white">
                      {action.meta.daysToExam}d {isAf ? "tot eksamen" : "to exam"}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Link href={action.href}>
              <button
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${styles.btn}`}
                data-testid="next-action-cta"
              >
                {isAf ? "Doen dit" : "Do it"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-white text-sm">
            <Clock className="w-5 h-5 shrink-0" />
            <span>{isAf ? "Laai aanbevelings..." : "Loading recommendations..."}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
