import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AdminTopNav } from "@/components/admin-top-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import {
  ArrowLeft, FileText, Sparkles, BookOpenCheck, CalendarRange,
  Loader2, CheckCircle2, AlertTriangle,
} from "lucide-react";

const HEX = {
  orange: "#FF8A00",
  amber: "#FFE600",
  gold: "#FFE600",
  cyan: "#00E5FF",
  blue: "#006BFF",
  violet: "#8A2BFF",
  pink: "#FF2BD6",
};

type RunState = "idle" | "running" | "success" | "error";

function GlowCard({
  accent, children,
}: { accent: string; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <div
      className="relative rounded-2xl bg-black p-6 transition-shadow"
      style={{
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 0 1px ${accent}22, 0 0 24px -8px ${accent}77`,
      }}
    >
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t rounded-tl-2xl" style={{ borderColor: accent }} />
      <span aria-hidden className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t rounded-tr-2xl" style={{ borderColor: accent }} />
      <span aria-hidden className="pointer-events-none absolute left-0 bottom-0 h-3 w-3 border-l border-b rounded-bl-2xl" style={{ borderColor: accent }} />
      <span aria-hidden className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 border-r border-b rounded-br-2xl" style={{ borderColor: accent }} />
      {children}
    </div>
  );
}

interface ActionCardProps {
  accent: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  endpoint: string;
  method?: "POST" | "GET";
  body?: Record<string, unknown>;
  pipelineLabel: string;
  actionLabel: string;
  runningLabel: string;
  doneLabel: string;
  errorLabel: string;
  startedToastSuffix: string;
  failedToastSuffix: string;
  testId: string;
  isAf: boolean;
}

function ActionCard({
  accent, icon, title, description, endpoint, method = "POST", body,
  pipelineLabel, actionLabel, runningLabel, doneLabel, errorLabel,
  startedToastSuffix, failedToastSuffix, testId, isAf,
}: ActionCardProps) {
  const { toast } = useToast();
  const [state, setState] = useState<RunState>("idle");
  const [detail, setDetail] = useState<string>("");

  const run = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(method, endpoint, body);
      return res.json();
    },
    onSuccess: (data: any) => {
      setState("success");
      const summary =
        (typeof data?.schedulesRegenerated === "number" && `${data.schedulesRegenerated} ${isAf ? "skedules hergenereer" : "schedules regenerated"}`) ||
        (typeof data?.count === "number" && `${data.count} ${isAf ? "rekords verwerk" : "records processed"}`) ||
        (typeof data?.started === "boolean" && (isAf ? "Taak begin" : "Job started")) ||
        (isAf ? "Voltooi" : "Completed");
      setDetail(String(summary));
      toast({ title: `${title} — ${startedToastSuffix}`, description: String(summary) });
    },
    onError: (err: any) => {
      setState("error");
      setDetail(err?.message ?? String(err));
      toast({ title: `${title} — ${failedToastSuffix}`, description: err?.message ?? String(err), variant: "destructive" });
    },
  });

  const handleClick = () => {
    setState("running");
    setDetail("");
    run.mutate();
  };

  return (
    <GlowCard accent={accent}>
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black"
          style={{ border: `1px solid ${accent}77`, color: accent, boxShadow: `0 0 18px -6px ${accent}aa` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider" style={{ color: accent }}>
            {pipelineLabel}
          </div>
          <h3 className="text-lg font-semibold text-white mt-0.5">{title}</h3>
          <p className="text-sm text-white mt-2 leading-relaxed">{description}</p>

          <div className="mt-5 flex items-center gap-3">
            <Button
              onClick={handleClick}
              disabled={state === "running"}
              className="bg-black text-white hover:bg-white/5"
              style={{ border: `1px solid ${accent}99` }}
              data-testid={testId}
            >
              {state === "running" ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{runningLabel}</>
              ) : (
                <>{actionLabel}</>
              )}
            </Button>

            {state === "success" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-white">
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: HEX.cyan }} />
                {detail || doneLabel}
              </span>
            )}
            {state === "error" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-white">
                <AlertTriangle className="h-3.5 w-3.5" style={{ color: HEX.pink }} />
                {detail || errorLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

export default function AdminContentStudio() {
  const { language } = useLanguage();
  const isAf = language === "af";

  const t = {
    back: isAf ? "Terug" : "Back",
    crumb: isAf ? "Admin · Inhoudstudio" : "Admin · Content Studio",
    heading: isAf ? "Inhoudstudio" : "Content Studio",
    intro: isAf
      ? "Een portaal, twee pyplyne. Verander DBE-vraestelle en KABV-leerplandokumente in oefenmateriaal, studieplanne, en gepubliseerde vraestelle vir leerders."
      : "One portal, two pipelines. Turn ingested DBE papers and CAPS curriculum docs into learner-facing practice, study plans, and published past papers.",
    subjects: isAf ? "Vakke" : "Subjects",
    years: isAf ? "Jare" : "Years",
    papers: isAf ? "Vraestelle" : "Papers",
    memos: isAf ? "Memorandums" : "Memos",
    actionsHeading: isAf ? "Generasie-aksies" : "Generation actions",
    papersPipeline: isAf ? "Vraestelle-pyplyn" : "Papers pipeline",
    capsPipeline: isAf ? "KABV-pyplyn" : "CAPS pipeline",
    splitTitle: isAf ? "Verdeel vraestelle in oefenvrae" : "Split papers into practice questions",
    splitDesc: isAf
      ? "Ontleed elke ingenome DBE-vraestel in individuele vrae met memo-antwoorde aangeheg, gereed vir aanpasbare oefening."
      : "Parse every ingested DBE paper into individual questions with their memo answers attached, ready for adaptive practice.",
    splitAction: isAf ? "Begin innamevoer" : "Run ingestion",
    aiTitle: isAf ? "Genereer KI-oefenvrae per onderwerp" : "Generate AI practice questions per topic",
    aiDesc: isAf
      ? "Skep KABV-belynde gesimuleerde meervoudigekeusevrae oor elke vak — deur BrainTrack opgestel, nooit woordeliks van DBE nie."
      : "Create CAPS-aligned simulated multiple-choice questions across every subject — BrainTrack-authored, never verbatim DBE.",
    aiAction: isAf ? "Genereer KI-vrae" : "Generate AI questions",
    publishTitle: isAf ? "Publiseer vraestelle aan leerders" : "Publish past papers to learners",
    publishDesc: isAf
      ? "Bevestig dat elke ingenome vraestel sigbaar is op die leerder se Vraestelle-bladsy en dat lêerhasse korrek is."
      : "Verify every ingested paper is visible on the learner Past Papers page and that file hashes are sound.",
    publishAction: isAf ? "Publiseer & bevestig" : "Publish & verify",
    plansTitle: isAf ? "Genereer KABV-belynde studieplanne" : "Generate CAPS-aligned study plans",
    plansDesc: isAf
      ? "Hergenereer elke leerder se NSC-roosterstudieplan vanaf KABV-onderwerpsdekking, eksamendatums, en huidige bemeestering."
      : "Regenerate every learner's NSC-timetabled study schedule from CAPS topic coverage, exam dates, and current mastery.",
    plansAction: isAf ? "Hergenereer planne" : "Regenerate plans",
    runningLabel: isAf ? "Loop tans…" : "Running…",
    doneLabel: isAf ? "Klaar" : "Done",
    errorLabel: isAf ? "Fout" : "Error",
    startedToast: isAf ? "begin" : "started",
    failedToast: isAf ? "het misluk" : "failed",
    footer: isAf
      ? "Langlopende take gaan in die agtergrond aan — sluit hierdie bladsy en kom enige tyd terug."
      : "Long-running jobs continue in the background — close this page and return any time.",
  };

  const papersList = useQuery<{ subjects: Array<{ subject: string; years: Array<{ year: number; papers: number[]; memos: number[] }> }> }>({
    queryKey: ["/api/past-papers/list"],
  });

  const totals = (() => {
    const subjects = papersList.data?.subjects ?? [];
    let papers = 0;
    let memos = 0;
    let years = new Set<number>();
    for (const s of subjects) {
      for (const y of s.years) {
        papers += y.papers.length;
        memos += y.memos.length;
        years.add(y.year);
      }
    }
    return { subjects: subjects.length, papers, memos, years: years.size };
  })();

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminTopNav current="content-studio" />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 flex items-center justify-end">
          <div className="text-[11px] uppercase tracking-wider" style={{ color: HEX.cyan }}>
            {t.crumb}
          </div>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" data-testid="heading-content-studio">
            {t.heading}
          </h1>
          <p className="mt-3 text-white max-w-2xl">
            {t.intro}
          </p>
        </div>

        {/* Pipeline stats */}
        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t.subjects, key: "subjects", value: totals.subjects, accent: HEX.orange },
            { label: t.years, key: "years", value: totals.years, accent: HEX.gold },
            { label: t.papers, key: "papers", value: totals.papers, accent: HEX.cyan },
            { label: t.memos, key: "memos", value: totals.memos, accent: HEX.violet },
          ].map((s) => (
            <GlowCard key={s.key} accent={s.accent}>
              <div className="text-[11px] uppercase tracking-wider" style={{ color: s.accent }}>{s.label}</div>
              <div className="text-2xl font-bold text-white mt-1" data-testid={`stat-${s.key}`}>
                {papersList.isLoading ? "—" : s.value}
              </div>
            </GlowCard>
          ))}
        </div>

        {/* Actions */}
        <h2 className="text-sm uppercase tracking-wider text-white mb-4">{t.actionsHeading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ActionCard
            accent={HEX.orange}
            icon={<FileText className="h-6 w-6" />}
            pipelineLabel={t.papersPipeline}
            title={t.splitTitle}
            description={t.splitDesc}
            endpoint="/api/admin/dbe-ingestion/run-all"
            actionLabel={t.splitAction}
            runningLabel={t.runningLabel}
            doneLabel={t.doneLabel}
            errorLabel={t.errorLabel}
            startedToastSuffix={t.startedToast}
            failedToastSuffix={t.failedToast}
            testId="btn-run-ingestion"
            isAf={isAf}
          />

          <ActionCard
            accent={HEX.violet}
            icon={<Sparkles className="h-6 w-6" />}
            pipelineLabel={t.papersPipeline}
            title={t.aiTitle}
            description={t.aiDesc}
            endpoint="/api/admin/dbe-ingestion/simulate-all"
            actionLabel={t.aiAction}
            runningLabel={t.runningLabel}
            doneLabel={t.doneLabel}
            errorLabel={t.errorLabel}
            startedToastSuffix={t.startedToast}
            failedToastSuffix={t.failedToast}
            testId="btn-generate-ai"
            isAf={isAf}
          />

          <ActionCard
            accent={HEX.cyan}
            icon={<BookOpenCheck className="h-6 w-6" />}
            pipelineLabel={t.papersPipeline}
            title={t.publishTitle}
            description={t.publishDesc}
            endpoint="/api/admin/dbe-ingestion/verify"
            actionLabel={t.publishAction}
            runningLabel={t.runningLabel}
            doneLabel={t.doneLabel}
            errorLabel={t.errorLabel}
            startedToastSuffix={t.startedToast}
            failedToastSuffix={t.failedToast}
            testId="btn-publish-papers"
            isAf={isAf}
          />

          <ActionCard
            accent={HEX.gold}
            icon={<CalendarRange className="h-6 w-6" />}
            pipelineLabel={t.capsPipeline}
            title={t.plansTitle}
            description={t.plansDesc}
            endpoint="/api/admin/timetable/regenerate"
            actionLabel={t.plansAction}
            runningLabel={t.runningLabel}
            doneLabel={t.doneLabel}
            errorLabel={t.errorLabel}
            startedToastSuffix={t.startedToast}
            failedToastSuffix={t.failedToast}
            testId="btn-regen-plans"
            isAf={isAf}
          />
        </div>

        <p className="mt-10 text-xs text-white">
          {t.footer}
        </p>
      </div>
    </div>
  );
}
