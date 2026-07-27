import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminTopNav } from "@/components/admin-top-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { Zap, Rocket, Loader2, FileText, BookOpen } from "lucide-react";

/**
 * Simulator — the owner's dedicated screen for the simulated content pipeline
 * (owner spec, 2026-07-24):
 *   • DBE Portal = ingest the real papers. THIS screen = generate + release.
 *   • Per subject: how much simulated content exists, its quality, how many
 *     carry generated supporting paragraphs, and topic coverage.
 *   • Release button — enabled once a subject has questions at/above the
 *     release bar. Each release stamps a NEW VERSION and is cumulative:
 *     v2 adds to v1, nothing is ever un-released.
 *
 * The release bar is 92 (what the QA scorer can actually award today — the
 * owner's 99% is the generator's aspirational target; a hard 99 gate would
 * never enable the button).
 */

type SubjectRow = {
  subject: string;
  total: number;
  avgQuality: number;
  ge92: number;
  withStimulus: number;
  released: number;
  unreleasedEligible: number;
  latestVersion: number;
  topics: number;
};

const P = { mint: "#94F7C5", sky: "#9FD8FF", pink: "#FFB7E5", butter: "#FFE29A", violet: "#C5B3FF" };

export default function AdminSimulatorPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const { toast } = useToast();
  const qc = useQueryClient();
  const [busySubject, setBusySubject] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ subjects: SubjectRow[]; releaseBar: number }>({
    queryKey: ["/api/admin/simulator/overview"],
    refetchInterval: 15000, // generation runs elsewhere; keep counts fresh
  });
  const releaseBar = data?.releaseBar ?? 92;

  const crunch = useMutation({
    mutationFn: async (subject: string) => {
      const r = await apiRequest("POST", "/api/admin/dbe-ingestion/simulate-subject", { subject, count: 10 });
      return r.json();
    },
    onMutate: (s) => setBusySubject(s),
    onSettled: () => {
      setBusySubject(null);
      qc.invalidateQueries({ queryKey: ["/api/admin/simulator/overview"] });
    },
    onSuccess: (d: any) =>
      toast({ title: isAf ? "Genereer klaar" : "Generation done", description: `${d?.generated ?? "?"} ${isAf ? "vrae gebank" : "questions banked"}` }),
    onError: (e: any) =>
      toast({ title: isAf ? "Genereer het misluk" : "Generation failed", description: String(e?.message ?? e), variant: "destructive" }),
  });

  const release = useMutation({
    mutationFn: async (subject: string) => {
      const r = await apiRequest("POST", "/api/admin/simulator/release", { subject });
      return r.json();
    },
    onMutate: (s) => setBusySubject(s),
    onSettled: () => {
      setBusySubject(null);
      qc.invalidateQueries({ queryKey: ["/api/admin/simulator/overview"] });
    },
    onSuccess: (d: any) =>
      toast({
        title: d?.released > 0 ? (isAf ? `Vrygestel — v${d.version}` : `Released — v${d.version}`) : (isAf ? "Niks om vry te stel nie" : "Nothing to release"),
        description: d?.released > 0
          ? `${d.released} ${isAf ? "vrae bygevoeg tot die vrygestelde poel" : "questions added to the released pool"}`
          : (d?.message ?? ""),
      }),
    onError: (e: any) =>
      toast({ title: isAf ? "Vrystelling het misluk" : "Release failed", description: String(e?.message ?? e), variant: "destructive" }),
  });

  const anyBusy = crunch.isPending || release.isPending;

  return (
    <div className="min-h-screen text-white" style={{ background: "#000", fontFamily: "'Poppins',sans-serif" }}>
      <AdminTopNav current="simulator" />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 64px" }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: P.pink, transform: "rotate(-2deg)", display: "inline-block" }}>
            {isAf ? "Gesimuleerde inhoud" : "Simulated content"}
          </span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.8, margin: "0 0 6px" }}>
          {isAf ? "Simulator" : "Simulator"}
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#fff", opacity: 0.92, maxWidth: 760, margin: "0 0 22px" }}>
          {isAf
            ? `Genereer oorspronklike, eksaminator-gegronde vrae (met ondersteunende paragrawe waar nodig), en stel dit dan vry aan leerders. Elke vrystelling kry 'n weergawenommer en BOU op die vorige een — niks word ooit teruggetrek nie. Vrystellingsdrempel: ${releaseBar}%+ kwaliteit.`
            : `Generate original, examiner-grounded questions (with supporting paragraphs where needed), then release them to learners. Every release gets a version number and BUILDS on the previous one — nothing is ever un-released. Release bar: ${releaseBar}%+ quality.`}
        </p>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: P.mint }} />
          </div>
        ) : !data?.subjects?.length ? (
          <div style={{ background: "#050508", border: `2.5px solid ${P.butter}`, boxShadow: `5px 5px 0 0 ${P.butter}`, borderRadius: 18, padding: 26 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>
              {isAf ? "Geen vakke met ingeneemde inhoud nie." : "No subjects with ingested content yet."}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, opacity: 0.92 }}>
              {isAf
                ? "Elke vak met 'n bruikbare ingeneemde bank verskyn hier met 'n Genereer-knoppie — neem eers regte vraestelle in by die DBE Portaal."
                : "Every subject with a usable ingested bank shows here with a Generate button — ingest real papers in the DBE Portal first."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {data.subjects.map((s, i) => {
              const accent = [P.mint, P.sky, P.pink, P.violet, P.butter][i % 5];
              const busy = busySubject === s.subject && anyBusy;
              const canRelease = s.unreleasedEligible > 0;
              return (
                <div
                  key={s.subject}
                  data-testid={`sim-row-${s.subject}`}
                  style={{
                    background: "#050508",
                    border: `2.5px solid ${accent}`,
                    boxShadow: `5px 5px 0 0 ${accent}`,
                    borderRadius: 18,
                    padding: "18px 20px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 17, margin: 0, color: accent }}>{s.subject}</p>
                    <p style={{ fontSize: 12.5, margin: "4px 0 0", color: "#fff", opacity: 0.92 }}>
                      {s.total} {isAf ? "vrae" : "questions"} · {isAf ? "gem. kwaliteit" : "avg quality"} {s.avgQuality}%
                      {" · "}{s.ge92} ≥{releaseBar}%
                      {" · "}<FileText style={{ width: 11, height: 11, display: "inline" }} /> {s.withStimulus} {isAf ? "met leesteks" : "with passage"}
                      {" · "}<BookOpen style={{ width: 11, height: 11, display: "inline" }} /> {s.topics} {isAf ? "onderwerpe" : "topics"}
                    </p>
                    <p style={{ fontSize: 12.5, margin: "2px 0 0", color: P.mint }}>
                      {s.released > 0
                        ? `${isAf ? "Vrygestel" : "Released"}: ${s.released} (v${s.latestVersion})`
                        : (isAf ? "Nog niks vrygestel nie" : "Nothing released yet")}
                      {canRelease && ` · ${s.unreleasedEligible} ${isAf ? "gereed vir vrystelling" : "ready to release"}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={() => crunch.mutate(s.subject)}
                      disabled={anyBusy}
                      data-testid={`sim-generate-${s.subject}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: "transparent", color: accent,
                        border: `2px solid ${accent}`, borderRadius: 10,
                        padding: "10px 16px", fontWeight: 800, fontSize: 13.5,
                        cursor: anyBusy ? "not-allowed" : "pointer", opacity: anyBusy && !busy ? 0.5 : 1,
                        minHeight: 44,
                      }}
                    >
                      {busy && crunch.isPending ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <Zap style={{ width: 15, height: 15 }} />}
                      {isAf ? "Genereer ×10" : "Generate ×10"}
                    </button>
                    <button
                      onClick={() => release.mutate(s.subject)}
                      disabled={anyBusy || !canRelease}
                      title={canRelease ? undefined : (isAf ? `Benodig vrae ≥${releaseBar}% wat nog nie vrygestel is nie` : `Needs unreleased questions at ≥${releaseBar}% quality`)}
                      data-testid={`sim-release-${s.subject}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: canRelease ? accent : "transparent",
                        color: canRelease ? "#050508" : "#fff",
                        border: `2px solid ${accent}`, borderRadius: 10,
                        padding: "10px 16px", fontWeight: 900, fontSize: 13.5,
                        cursor: anyBusy || !canRelease ? "not-allowed" : "pointer",
                        opacity: !canRelease ? 0.45 : anyBusy && !busy ? 0.5 : 1,
                        boxShadow: canRelease ? "3px 3px 0 0 rgba(0,0,0,.85)" : "none",
                        minHeight: 44,
                      }}
                    >
                      {busy && release.isPending ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <Rocket style={{ width: 15, height: 15 }} />}
                      {isAf ? `Stel vry → v${s.latestVersion + 1}` : `Release → v${s.latestVersion + 1}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
