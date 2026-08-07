import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { LearnerHeader } from "@/components/learner-header";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Zap, Sparkles } from "lucide-react";

/* ── EXAM PREDICTOR — BrainTrack's hero differentiator. ────────────────────
   "We've read 10 years of your matric paper. Here's what's most likely on
   yours — drill these first." Reads /api/predictor/:subject (the honest
   recurrence ranking off the DBE 10-year corpus) for every subject the learner
   takes, and lets them jump straight into a topic-focused boost drill.
   HONEST framing only: we surface real recurrence (appeared X of Y years) and a
   coarse likelihood band — never a fabricated precise percentage. */

const BG = "#050508";
const cardStyle = (accent?: string, radius = 20): CSSProperties => ({
  background: "linear-gradient(#0e0d12, #0e0d12), #050508",
  border: accent ? `1.5px solid ${accent}` : "1px solid #1b1922",
  borderRadius: radius,
});

// Likelihood band → bright pastel accent (no grey, no glow).
const BAND_HEX: Record<string, string> = {
  "Almost certain": "#94F7C5",
  "Very likely": "#9FF5E8",
  Likely: "#FFE29A",
  Possible: "#C5B3FF",
};
const BAND_AF: Record<string, string> = {
  "Almost certain": "Amper seker",
  "Very likely": "Baie waarskynlik",
  Likely: "Waarskynlik",
  Possible: "Moontlik",
};

interface PredictorTopic {
  topic: string;
  topicAfrikaans: string;
  appearances: number;
  yearsSpan: number;
  avgMarks: number;
  frequencyRank: number;
  highYield: boolean;
  likelihood: string;
}
interface PredictorResponse {
  subject: string;
  comingSoon: boolean;
  yearsSpan: number;
  topics: PredictorTopic[];
}

const T = {
  en: {
    back: "Back",
    title: "Exam Predictor",
    heroBadge: "10-YEAR PAPER ANALYSIS",
    heroLine: "We've read 10 years of your paper. Drill what's most likely on yours — first.",
    honest: "Ranked by how often each topic actually appeared — not a guess.",
    noSubjects: "Pick your subjects first, then we'll predict your paper.",
    goSubjects: "Choose subjects",
    comingSoon: "Corpus still loading",
    comingSoonBody: "We're still reading the past papers for this subject. Check back soon.",
    highYield: "HIGH-YIELD",
    drill: "Drill this",
    marksAvg: (m: number) => `~${m} marks avg`,
    appearedYears: (n: number, y: number) => `Appeared ${n}/${y} years`,
    appearedTimes: (n: number) => `Appeared ${n}×`,
    rank: (r: number) => `#${r} most frequent`,
    loading: "Reading the papers…",
  },
  af: {
    back: "Terug",
    title: "Eksamenvoorspeller",
    heroBadge: "10-JAAR VRAESTEL-ONTLEDING",
    heroLine: "Ons het 10 jaar se vraestelle gelees. Oefen eers wat die waarskynlikste op joune is.",
    honest: "Gerangskik volgens hoe gereeld elke onderwerp werklik verskyn het — nie 'n raaiskoot nie.",
    noSubjects: "Kies eers jou vakke, dan voorspel ons jou vraestel.",
    goSubjects: "Kies vakke",
    comingSoon: "Korpus laai nog",
    comingSoonBody: "Ons lees steeds die vorige vraestelle vir hierdie vak. Kyk binnekort weer.",
    highYield: "HOË-OPBRENGS",
    drill: "Oefen dit",
    marksAvg: (m: number) => `~${m} punte gem.`,
    appearedYears: (n: number, y: number) => `Verskyn ${n}/${y} jaar`,
    appearedTimes: (n: number) => `Verskyn ${n}×`,
    rank: (r: number) => `#${r} mees gereeld`,
    loading: "Lees die vraestelle…",
  },
};

function SubjectPredictor({
  subjectId,
  subjectName,
  displayName,
  isAf,
}: {
  subjectId: number;
  subjectName: string;
  displayName: string;
  isAf: boolean;
}) {
  const t = isAf ? T.af : T.en;
  const { data, isLoading } = useQuery<PredictorResponse>({
    queryKey: ["/api/predictor", subjectName],
    queryFn: () =>
      fetch(`/api/predictor/${encodeURIComponent(subjectName)}`, { credentials: "include" }).then(
        (r) => r.json(),
      ),
  });

  return (
    <section className="mb-8" data-testid={`predictor-subject-${subjectId}`}>
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5" style={{ color: "#9FF5E8" }} />
        <h2 className="text-lg font-black text-white truncate">{displayName}</h2>
      </div>

      {isLoading && (
        <div style={cardStyle()} className="p-5 text-sm font-bold" data-testid={`predictor-loading-${subjectId}`}>
          <span style={{ color: "#9FF5E8" }}>{t.loading}</span>
        </div>
      )}

      {!isLoading && data?.comingSoon && (
        <div
          style={cardStyle("#C5B3FF")}
          className="p-5"
          data-testid={`predictor-coming-soon-${subjectId}`}
        >
          <p className="text-sm font-black" style={{ color: "#C5B3FF" }}>
            {t.comingSoon}
          </p>
          <p className="text-sm text-white mt-1">{t.comingSoonBody}</p>
        </div>
      )}

      {!isLoading && data && !data.comingSoon && (
        <div className="grid gap-3">
          {data.topics.map((topic, i) => {
            const hex = BAND_HEX[topic.likelihood] ?? "#C5B3FF";
            const bandLabel = isAf ? BAND_AF[topic.likelihood] ?? topic.likelihood : topic.likelihood;
            const recurrence =
              topic.yearsSpan > 0
                ? t.appearedYears(topic.appearances, topic.yearsSpan)
                : t.appearedTimes(topic.appearances);
            return (
              <div
                key={`${topic.topic}-${i}`}
                style={cardStyle(topic.highYield ? hex : undefined)}
                className="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                data-testid={`predictor-topic-${i}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-black text-white">
                      {isAf ? topic.topicAfrikaans : topic.topic}
                    </span>
                    {topic.highYield && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                        style={{ background: hex, color: BG }}
                        data-testid={`predictor-highyield-${i}`}
                      >
                        <Zap className="w-3 h-3" />
                        {t.highYield}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-white">
                      <TrendingUp className="w-4 h-4" style={{ color: hex }} />
                      {recurrence}
                    </span>
                    {topic.avgMarks > 0 && (
                      <span className="text-sm font-bold" style={{ color: "#FFE29A" }}>
                        {t.marksAvg(topic.avgMarks)}
                      </span>
                    )}
                    {topic.frequencyRank > 0 && (
                      <span className="text-xs font-bold text-white/90">{t.rank(topic.frequencyRank)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap"
                    style={{ background: hex, color: BG }}
                    data-testid={`predictor-likelihood-${i}`}
                  >
                    {bandLabel}
                  </span>
                  <Link href={`/subject/${subjectId}?drillTopic=${encodeURIComponent(topic.topic)}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      data-testid={`predictor-drill-${i}`}
                    >
                      {t.drill} →
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function PredictorPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const t = isAf ? T.af : T.en;

  const { data: profile } = useQuery<{ selectedSubjects?: number[] }>({
    queryKey: ["/api/user/onboarding"],
  });
  const { data: allSubjects } = useQuery<
    Array<{ id: number; name: string; nameAfrikaans: string | null }>
  >({ queryKey: ["/api/subjects"] });

  const selectedIds: number[] = Array.isArray(profile?.selectedSubjects)
    ? (profile!.selectedSubjects as number[])
    : [];
  const mySubjects = selectedIds
    .map((id) => allSubjects?.find((s) => s.id === id))
    .filter((s): s is { id: number; name: string; nameAfrikaans: string | null } => !!s);

  return (
    <div className="min-h-screen text-white" style={{ background: BG, fontFamily: "'Poppins',sans-serif" }}>
      <LearnerHeader backLabel={t.back} title={t.title} titleColor="#9FF5E8" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <GraffitiSplats />

        {/* Hero — sells the predictor in one honest line. */}
        <div style={cardStyle("#9FF5E8", 24)} className="p-6 mb-8" data-testid="predictor-hero">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-3"
            style={{ background: "#9FF5E8", color: BG }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.heroBadge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{t.heroLine}</h1>
          <p className="text-sm font-bold text-white/90 mt-2">{t.honest}</p>
        </div>

        {mySubjects.length === 0 ? (
          <div style={cardStyle("#C5B3FF")} className="p-6 text-center" data-testid="predictor-no-subjects">
            <p className="text-base font-black text-white">{t.noSubjects}</p>
            <Link href="/subjects">
              <Button
                variant="primary"
                className="mt-4"
                data-testid="predictor-go-subjects"
              >
                {t.goSubjects} →
              </Button>
            </Link>
          </div>
        ) : (
          mySubjects.map((s) => (
            <SubjectPredictor
              key={s.id}
              subjectId={s.id}
              subjectName={s.name}
              displayName={isAf ? s.nameAfrikaans || s.name : s.name}
              isAf={isAf}
            />
          ))
        )}
      </div>
    </div>
  );
}
