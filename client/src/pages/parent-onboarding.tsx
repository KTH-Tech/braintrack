import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Sparkles, ArrowRight, Users, Globe } from "lucide-react";

// Task #43 — Parent registration flow.
// Captures parent name, child name + grade + school, then creates a pending
// parent↔learner activation link. The parent shares the activation code with
// their child to complete the link.

// Brand shell — mirrors parent-activate-child: #050508 ground, #0e0d12 card
// with a solid pastel border + rainbow top rule, Bebas kicker, Poppins body.
const cardStyle: React.CSSProperties = {
  background: "#0e0d12",
  border: "1.5px solid #C5B3FF",
};

const RAINBOW_RULE = "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)";

const INPUT_CLASSES =
  "text-white placeholder:text-[#9FD8FF] bg-[#050508] border-[#1b1922] focus:border-[#9FF5E8]";

export default function ParentOnboardingPage() {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAf = language === "af";

  // Signed-in transactional flow — noindex.
  useSEO({
    title: "Parent sign-up | BrainTrack",
    description:
      "Create a BrainTrack parent account and activate your Grade 12 learner's study plan.",
    canonical: "https://braintrack.tech/parent-onboarding",
    noIndex: true,
  });

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
      // apiRequest resolves to a fetch Response — parse the body so
      // activationToken actually populates and the success screen renders.
      const data = await res.json();
      return data as { ok: boolean; activationToken: string; activationUrl: string };
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
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif" }}
      >
        <div className="max-w-lg w-full rounded-3xl overflow-hidden" style={{ ...cardStyle, border: "1.5px solid #94F7C5" }} data-testid="parent-onboarding-success">
          <div aria-hidden className="h-[3px]" style={{ background: RAINBOW_RULE }} />
          <div className="p-6 sm:p-7 space-y-4">
            <div>
              <p
                className="uppercase leading-none"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: "0.16em", color: "#94F7C5", transform: "rotate(-2deg)", display: "inline-block" }}
              >
                {isAf ? "klaar!" : "all set!"}
              </p>
              <h1 className="text-xl font-black text-white">{isAf ? "Aktiveringskode" : "Activation code"}</h1>
            </div>
            <p className="text-sm text-white">
              {isAf
                ? "Gee hierdie kode aan jou kind. Hulle kan dit by /activate invoer om die rekeninge te koppel."
                : "Give this code to your child. They can enter it at /activate to link their account."}
            </p>
            <div
              className="rounded-xl px-4 py-4 font-mono text-center text-base select-all text-white"
              style={{ background: "#1b1922", border: "1.5px solid #9FF5E8" }}
              data-testid="activation-code"
            >
              {activationCode}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigator.clipboard?.writeText(activationCode).catch(() => {})} variant="outline" className="flex-1">
                {isAf ? "Kopieer kode" : "Copy code"}
              </Button>
              <Button variant="primary" onClick={() => { window.location.href = "/parent-dashboard"; }} className="flex-1" data-testid="button-go-dashboard">
                {isAf ? "Na ouer-dashboard" : "Go to parent dashboard"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            {/* Launch flow — the child has NO account yet: the parent creates
                and activates it directly and gets on-screen credentials. */}
            <p className="text-sm text-white pt-2" style={{ borderTop: "1px solid #1b1922" }}>
              {isAf
                ? "Het jou kind nog géén BrainTrack-rekening nie? "
                : "Doesn't your child have a BrainTrack account yet? "}
              <a href="/parent/activate-child" className="underline font-semibold" style={{ color: "#9FD8FF" }} data-testid="link-activate-child">
                {isAf ? "Skep en aktiveer dit nou" : "Create & activate it now"}
              </a>
              {isAf
                ? " — jy kry hul gebruikersnaam en wagwoord dadelik."
                : " — you'll get their username and password immediately."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif" }}
    >
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-end">
          <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-white hover:opacity-80 transition-opacity" data-testid="button-language-toggle">
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold">{isAf ? "AF" : "EN"}</span>
          </button>
        </div>

        <div className="rounded-3xl overflow-hidden" style={cardStyle} data-testid="parent-onboarding-card">
          <div aria-hidden className="h-[3px]" style={{ background: RAINBOW_RULE }} />
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "#050508", border: "1.5px solid #C5B3FF" }}
              >
                <Users className="w-6 h-6" style={{ color: "#C5B3FF" }} />
              </div>
              <div>
                <p
                  className="uppercase leading-none"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: "0.16em", color: "#9FF5E8", transform: "rotate(-2deg)", display: "inline-block" }}
                >
                  {isAf ? "kom ons begin!" : "let's get started!"}
                </p>
                <h1 className="text-xl font-black text-white leading-tight">{isAf ? "Welkom, ouer!" : "Welcome, parent!"}</h1>
                <p className="text-sm text-white mt-1">
                  {isAf
                    ? "Vertel ons van jouself en jou kind."
                    : "Tell us about yourself and your child."}
                </p>
              </div>
            </div>

            <div className="space-y-5 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">{isAf ? "Jou naam" : "Your first name"}</Label>
                <Input className={INPUT_CLASSES} value={parentFirstName} onChange={(e) => setParentFirstName(e.target.value)} data-testid="input-parent-first-name" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">{isAf ? "Jou van (opsioneel)" : "Your last name (optional)"}</Label>
                <Input className={INPUT_CLASSES} value={parentLastName} onChange={(e) => setParentLastName(e.target.value)} data-testid="input-parent-last-name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">{isAf ? "Kind se naam" : "Child's name"}</Label>
              <Input className={INPUT_CLASSES} value={learnerName} onChange={(e) => setLearnerName(e.target.value)} placeholder={isAf ? "Voor- en van" : "First and last name"} data-testid="input-learner-name" />
            </div>

            <div className="space-y-2">
              <Label className="text-white">{isAf ? "Graad" : "Grade"}</Label>
              {/* BrainTrack launches with Grade 12 (NSC matric) — values 10/11
                  stay selectable so the API contract is unchanged, but Grade 12
                  is the pinned, expected choice. */}
              <div className="flex gap-2 flex-wrap">
                {[10, 11, 12].map((g) => {
                  const active = learnerGrade === g;
                  const isNsc = g === 12;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setLearnerGrade(g)}
                      className="px-5 h-11 rounded-xl font-semibold text-sm transition-transform hover:-translate-y-0.5"
                      style={active
                        ? { background: "#C5B3FF", color: "#050508", border: "2px solid #C5B3FF" }
                        : { background: "transparent", color: "#fff", border: `2px solid ${isNsc ? "#C5B3FF" : "#1b1922"}` }}
                      data-testid={`button-learner-grade-${g}`}
                    >
                      {isNsc
                        ? (isAf ? "Graad 12 (NSC)" : "Grade 12 (NSC)")
                        : (isAf ? `Graad ${g}` : `Grade ${g}`)}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-white">
                {isAf
                  ? "BrainTrack is gebou vir Graad 12 (NSC-matriek) — kies dit tensy jou kind vroeër voorberei."
                  : "BrainTrack is built for Grade 12 (NSC matric) — pick it unless your child is preparing early."}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">{isAf ? "Skool" : "School"}</Label>
              <Input
                className={INPUT_CLASSES}
                value={schoolQuery}
                onChange={(e) => { setSchoolQuery(e.target.value); setSchoolName(e.target.value); setSchoolId(null); }}
                placeholder={isAf ? "Soek skool…" : "Search for the school…"}
                data-testid="input-school"
              />
              {schoolResults.length > 0 && (
                <div className="rounded-xl overflow-hidden max-h-56 overflow-y-auto" style={{ border: "1px solid #1b1922", background: "#050508" }}>
                  {schoolResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSchoolId(s.id); setSchoolName(s.name); setSchoolQuery(s.name); setSchoolResults([]); }}
                      className="w-full text-left px-4 py-3 hover:bg-[#1b1922] transition-colors"
                      style={{ borderBottom: "1px solid #1b1922", ...(schoolId === s.id ? { background: "#1b1922" } : {}) }}
                      data-testid={`school-result-${s.id}`}
                    >
                      <div className="font-semibold text-white">{s.name}</div>
                      {s.province && <div className="text-xs text-white">{s.province}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button variant="primary" onClick={() => submit.mutate()} disabled={!canSubmit} className="w-full h-12 text-base font-semibold" data-testid="button-submit-parent-onboarding">
              {submit.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isAf ? "Skep ouer-rekening" : "Create parent account"}
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
