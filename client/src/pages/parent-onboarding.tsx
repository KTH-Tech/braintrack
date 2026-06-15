import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Sparkles, ArrowRight, Users, Globe } from "lucide-react";

// Task #43 — Parent registration flow.
// Captures parent name, child name + grade + school, then creates a pending
// parent↔learner activation link. The parent shares the activation code with
// their child to complete the link.
export default function ParentOnboardingPage() {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAf = language === "af";

  const [parentFirstName, setParentFirstName] = useState((user as any)?.firstName ?? "");
  const [parentLastName, setParentLastName] = useState((user as any)?.lastName ?? "");
  const [learnerName, setLearnerName] = useState("");
  const [learnerGrade, setLearnerGrade] = useState<number>(12);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [schoolResults, setSchoolResults] = useState<Array<{ id: number; name: string; province: string | null }>>([]);
  const [activationCode, setActivationCode] = useState<string | null>(null);

  useEffect(() => {
    const q = schoolQuery.trim();
    if (q.length < 2) { setSchoolResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/schools/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
        const j = await r.json();
        setSchoolResults(Array.isArray(j?.results) ? j.results : []);
      } catch { setSchoolResults([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [schoolQuery]);

  const submit = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/parent/onboarding", {
        parentFirstName: parentFirstName.trim(),
        parentLastName: parentLastName.trim() || undefined,
        learnerName: learnerName.trim(),
        learnerGrade,
        schoolName: schoolName.trim() || undefined,
        schoolId: schoolId ?? undefined,
        language: isAf ? "af" : "en",
      });
      return res as unknown as { ok: boolean; activationToken: string; activationUrl: string };
    },
    onSuccess: (data) => {
      setActivationCode(data.activationToken);
      toast({
        title: isAf ? "Klaar!" : "All set!",
        description: isAf
          ? "Deel die aktiveringskode met jou kind om die rekening te koppel."
          : "Share the activation code with your child to link their account.",
      });
    },
    onError: () => {
      toast({
        title: isAf ? "Fout" : "Error",
        description: isAf ? "Kon nie aanmelding voltooi nie." : "Could not complete onboarding.",
        variant: "destructive",
      });
    },
  });

  const canSubmit = parentFirstName.trim().length >= 1 && learnerName.trim().length >= 1 && !submit.isPending;

  if (activationCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full" data-testid="parent-onboarding-success">
          <CardHeader>
            <CardTitle>{isAf ? "Aktiveringskode" : "Activation code"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-white">
              {isAf
                ? "Gee hierdie kode aan jou kind. Hulle kan dit by /activate invoer om die rekeninge te koppel."
                : "Give this code to your child. They can enter it at /activate to link their account."}
            </p>
            <div className="rounded-xl border border-border bg-muted px-4 py-4 font-mono text-center text-base select-all" data-testid="activation-code">
              {activationCode}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigator.clipboard?.writeText(activationCode).catch(() => {})} variant="outline" className="flex-1">
                {isAf ? "Kopieer kode" : "Copy code"}
              </Button>
              <Button onClick={() => { window.location.href = "/parent-dashboard"; }} className="flex-1" data-testid="button-go-dashboard">
                {isAf ? "Na ouer-dashboard" : "Go to parent dashboard"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-end">
          <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-white hover:text-white" data-testid="button-language-toggle">
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold">{isAf ? "AF" : "EN"}</span>
          </button>
        </div>

        <Card data-testid="parent-onboarding-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>{isAf ? "Welkom, ouer!" : "Welcome, parent!"}</CardTitle>
                <p className="text-sm text-white mt-1">
                  {isAf
                    ? "Vertel ons van jouself en jou kind."
                    : "Tell us about yourself and your child."}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAf ? "Jou naam" : "Your first name"}</Label>
                <Input value={parentFirstName} onChange={(e) => setParentFirstName(e.target.value)} data-testid="input-parent-first-name" />
              </div>
              <div className="space-y-2">
                <Label>{isAf ? "Jou van (opsioneel)" : "Your last name (optional)"}</Label>
                <Input value={parentLastName} onChange={(e) => setParentLastName(e.target.value)} data-testid="input-parent-last-name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isAf ? "Kind se naam" : "Child's name"}</Label>
              <Input value={learnerName} onChange={(e) => setLearnerName(e.target.value)} placeholder={isAf ? "Voor- en van" : "First and last name"} data-testid="input-learner-name" />
            </div>

            <div className="space-y-2">
              <Label>{isAf ? "Graad" : "Grade"}</Label>
              <div className="flex gap-2 flex-wrap">
                {[10, 11, 12].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setLearnerGrade(g)}
                    className={`px-5 h-11 rounded-xl border-2 font-semibold ${learnerGrade === g ? "border-primary bg-primary/10 text-white" : "border-border text-white hover:border-primary/40"}`}
                    data-testid={`button-learner-grade-${g}`}
                  >
                    {isAf ? `Graad ${g}` : `Grade ${g}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isAf ? "Skool" : "School"}</Label>
              <Input
                value={schoolQuery}
                onChange={(e) => { setSchoolQuery(e.target.value); setSchoolName(e.target.value); setSchoolId(null); }}
                placeholder={isAf ? "Soek skool…" : "Search for the school…"}
                data-testid="input-school"
              />
              {schoolResults.length > 0 && (
                <div className="rounded-xl border border-border bg-card divide-y divide-border max-h-56 overflow-y-auto">
                  {schoolResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSchoolId(s.id); setSchoolName(s.name); setSchoolQuery(s.name); setSchoolResults([]); }}
                      className={`w-full text-left px-4 py-3 hover:bg-muted ${schoolId === s.id ? "bg-primary/10" : ""}`}
                      data-testid={`school-result-${s.id}`}
                    >
                      <div className="font-semibold">{s.name}</div>
                      {s.province && <div className="text-xs text-white">{s.province}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={() => submit.mutate()} disabled={!canSubmit} className="w-full h-12 text-base font-semibold" data-testid="button-submit-parent-onboarding">
              {submit.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isAf ? "Skep ouer-rekening" : "Create parent account"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
