import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { GraffitiSplats } from "@/components/graffiti-splats";
import iconTransparent from "@/assets/handoff/icon-transparent.png";
import {
  Loader2, UserPlus, Phone, Mail, School, Globe, KeyRound, Copy, Check,
  AlertTriangle, ChevronRight, ArrowLeft, ShieldCheck, Sparkles,
} from "lucide-react";

// Launch flow — a signed-in parent creates + activates their child's learner
// account in one step (POST /api/parent/activate-child). The generated
// password is displayed ONCE on this screen for the parent to hand to the
// child; it is never stored, mailed or SMS'd. The parent performing this
// action IS the parental consent (recorded server-side).

const PASTEL = {
  blue: "#9FD8FF",
  cyan: "#9FF5E8",
  emerald: "#94F7C5",
  amber: "#FFE29A",
  pink: "#FFB7E5",
  purple: "#C5B3FF",
} as const;

const T = {
  en: {
    eyebrow: "let's get them in!",
    heading: "Add & activate your child",
    sub: "Fill this in once — we create your child's BrainTrack account immediately and show you their sign-in details to hand over.",
    yourDetails: "Your details",
    parentPhone: "Your cell number",
    parentPhonePlaceholder: "e.g. 083 123 4567",
    parentEmail: "Your email",
    childDetails: "Your child's details",
    childFirstName: "Child's first name",
    childLastName: "Child's last name",
    childEmail: "Child's email (optional)",
    childEmailHint: "No email? Leave it blank — we'll create a username for them.",
    school: "Child's school",
    schoolPlaceholder: "Search by school name or town…",
    language: "Child's language",
    english: "English",
    afrikaans: "Afrikaans",
    consentNote: "By creating this account you, as parent/guardian, consent to your child using BrainTrack (POPIA). We record this consent with the account.",
    submit: "Create & activate account",
    creating: "Creating account…",
    // Success screen
    doneEyebrow: "they're in!",
    doneHeading: "Account activated",
    doneSub: "Hand these sign-in details to your child. They sign in at",
    username: "Username",
    password: "Password",
    copy: "Copy",
    copied: "Copied!",
    copyBoth: "Copy username + password",
    writeDown: "Write these down now — for your child's security this password is shown only once. It is not emailed or SMS'd, and we cannot show it again.",
    nextSteps: "What your child does next",
    step1: "Signs in at braintrack with the username + password above",
    step2: "Completes their quick onboarding (subjects, prelim dates)",
    step3: "Changes the password in Settings → Account",
    addAnother: "Add another child",
    goDashboard: "Go to parent dashboard",
    back: "Back to dashboard",
    errorTitle: "Could not create the account",
    duplicateChildTitle: "Already linked",
    emailTakenTitle: "Email already registered",
  },
  af: {
    eyebrow: "kom ons kry hulle in!",
    heading: "Voeg jou kind by & aktiveer",
    sub: "Vul dit een keer in — ons skep dadelik jou kind se BrainTrack-rekening en wys jou hul aanmeldbesonderhede om te oorhandig.",
    yourDetails: "Jou besonderhede",
    parentPhone: "Jou selfoonnommer",
    parentPhonePlaceholder: "bv. 083 123 4567",
    parentEmail: "Jou e-pos",
    childDetails: "Jou kind se besonderhede",
    childFirstName: "Kind se voornaam",
    childLastName: "Kind se van",
    childEmail: "Kind se e-pos (opsioneel)",
    childEmailHint: "Geen e-pos nie? Los dit oop — ons skep 'n gebruikersnaam vir hulle.",
    school: "Kind se skool",
    schoolPlaceholder: "Soek op skoolnaam of dorp…",
    language: "Kind se taal",
    english: "Engels",
    afrikaans: "Afrikaans",
    consentNote: "Deur hierdie rekening te skep gee jy, as ouer/voog, toestemming dat jou kind BrainTrack gebruik (POPIA). Ons teken hierdie toestemming saam met die rekening aan.",
    submit: "Skep & aktiveer rekening",
    creating: "Skep rekening…",
    doneEyebrow: "hulle is binne!",
    doneHeading: "Rekening geaktiveer",
    doneSub: "Gee hierdie aanmeldbesonderhede vir jou kind. Hulle teken in by",
    username: "Gebruikersnaam",
    password: "Wagwoord",
    copy: "Kopieer",
    copied: "Gekopieer!",
    copyBoth: "Kopieer gebruikersnaam + wagwoord",
    writeDown: "Skryf dit nou neer — vir jou kind se veiligheid word hierdie wagwoord net een keer gewys. Dit word nie ge-e-pos of ge-SMS nie, en ons kan dit nie weer wys nie.",
    nextSteps: "Wat jou kind volgende doen",
    step1: "Teken in by braintrack met die gebruikersnaam + wagwoord hierbo",
    step2: "Voltooi hul vinnige aanboording (vakke, vooreksamendatums)",
    step3: "Verander die wagwoord in Instellings → Rekening",
    addAnother: "Voeg nog 'n kind by",
    goDashboard: "Na ouer-dashboard",
    back: "Terug na dashboard",
    errorTitle: "Kon nie die rekening skep nie",
    duplicateChildTitle: "Reeds gekoppel",
    emailTakenTitle: "E-pos reeds geregistreer",
  },
} as const;

type SchoolResult = { id: number | null; natEmis?: number; name: string; province: string | null; district: string | null };

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-white uppercase tracking-[0.18em]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white leading-snug" style={{ opacity: 0.85 }}>{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(5,5,8,.6)",
  border: "1.5px solid rgba(255,255,255,.18)",
};

function PastelInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-colors placeholder:text-white focus:border-[#9FF5E8] ${props.className ?? ""}`}
      style={{ ...inputStyle, ...(props.style ?? {}) }}
    />
  );
}

/** One credential line on the success screen with its own copy button. */
function CredentialRow({ label, value, color, testId, copiedText, copyText }: {
  label: string; value: string; color: string; testId: string; copiedText: string; copyText: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,.03)", border: `1.5px solid ${color}` }}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ opacity: 0.85 }}>{label}</p>
      <div className="flex items-center gap-3 mt-1.5">
        <p className="flex-1 font-mono font-bold text-white break-all select-all text-base" data-testid={testId}>{value}</p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(value).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-transform hover:-translate-y-0.5"
          style={{ color, border: `1.5px solid ${color}`, background: "transparent" }}
          data-testid={`${testId}-copy`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? copiedText : copyText}
        </button>
      </div>
    </div>
  );
}

export default function ParentActivateChildPage() {
  const { user } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    parentPhone: "",
    parentEmail: "",
    childFirstName: "",
    childLastName: "",
    childEmail: "",
    schoolName: "",
    schoolId: null as number | null,
    language: language as "en" | "af",
  });
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<SchoolResult[]>([]);
  const [credentials, setCredentials] = useState<{ username: string; password: string; learnerName: string } | null>(null);
  const [bothCopied, setBothCopied] = useState(false);

  // Prefill the parent's email from their account once auth lands.
  useEffect(() => {
    const email = (user as any)?.email;
    if (email) setForm((f) => (f.parentEmail ? f : { ...f, parentEmail: email }));
  }, [user]);

  // School autocomplete — /api/schools/search matches name OR town across the
  // 8,938-school DBE masterlist plus partner schools.
  useEffect(() => {
    const q = schoolQuery.trim();
    if (q.length < 2) { setSchoolResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/schools/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
        const j = await r.json();
        setSchoolResults(Array.isArray(j?.results) ? j.results : []);
      } catch {
        setSchoolResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [schoolQuery]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const activate = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/parent/activate-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          parentPhone: form.parentPhone.trim(),
          parentEmail: form.parentEmail.trim(),
          childFirstName: form.childFirstName.trim(),
          childLastName: form.childLastName.trim(),
          childEmail: form.childEmail.trim() || undefined,
          schoolName: form.schoolName.trim(),
          schoolId: form.schoolId ?? undefined,
          language: form.language,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(body?.message || "Request failed") as Error & { code?: string };
        err.code = body?.error;
        throw err;
      }
      return body as { username: string; password: string; learnerName: string };
    },
    onSuccess: (data) => {
      setCredentials({ username: data.username, password: data.password, learnerName: data.learnerName });
      // The parent dashboard's children list must include the new learner.
      queryClient.invalidateQueries({ queryKey: ["/api/parent/children"] });
    },
    onError: (err: Error & { code?: string }) => {
      const title =
        err.code === "child_already_linked" ? t.duplicateChildTitle :
        err.code === "email_taken" ? t.emailTakenTitle :
        t.errorTitle;
      toast({ title, description: err.message, variant: "destructive" });
    },
  });

  const canSubmit =
    form.parentPhone.trim().length >= 9 &&
    /.+@.+\..+/.test(form.parentEmail.trim()) &&
    form.childFirstName.trim().length >= 1 &&
    form.childLastName.trim().length >= 1 &&
    form.schoolName.trim().length >= 1 &&
    !activate.isPending;

  const cardStyle: React.CSSProperties = {
    background: "#050508",
    border: "1px solid rgba(255,255,255,.1)",
  };

  // ── Success — the ONE time the password is visible ────────────────────────
  if (credentials) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden" style={{ background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif" }} data-testid="activate-child-success">
        <GraffitiSplats variant="full" opacity={0.35} />
        <div className="relative z-10 w-full max-w-lg">
          <div className="rounded-3xl overflow-hidden" style={cardStyle}>
            <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
            <div className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="text-center">
                <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 18, color: PASTEL.emerald, transform: "rotate(-2deg)", display: "inline-block" }}>
                  {t.doneEyebrow}
                </p>
                <h1 className="text-2xl font-black text-white mt-1">{t.doneHeading}</h1>
                <p className="text-sm text-white mt-2" style={{ opacity: 0.9 }}>
                  {credentials.learnerName} — {t.doneSub}{" "}
                  <span className="font-bold" style={{ color: PASTEL.cyan }}>{window.location.origin.replace(/^https?:\/\//, "")}/signin</span>
                </p>
              </div>

              {/* Show-once warning */}
              <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(255,226,154,.06)", border: `1.5px solid ${PASTEL.amber}` }}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: PASTEL.amber }} />
                <p className="text-sm font-semibold text-white leading-snug" data-testid="password-once-warning">{t.writeDown}</p>
              </div>

              <CredentialRow label={t.username} value={credentials.username} color={PASTEL.blue} testId="text-child-username" copiedText={t.copied} copyText={t.copy} />
              <CredentialRow label={t.password} value={credentials.password} color={PASTEL.pink} testId="text-child-password" copiedText={t.copied} copyText={t.copy} />

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`${t.username}: ${credentials.username}\n${t.password}: ${credentials.password}`).catch(() => {});
                  setBothCopied(true);
                  setTimeout(() => setBothCopied(false), 1800);
                }}
                className="w-full py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                style={{ background: "transparent", color: PASTEL.cyan, border: `1.5px solid ${PASTEL.cyan}` }}
                data-testid="button-copy-both"
              >
                {bothCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {bothCopied ? t.copied : t.copyBoth}
              </button>

              {/* What happens next */}
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-2" style={{ opacity: 0.85 }}>{t.nextSteps}</p>
                <ol className="flex flex-col gap-2">
                  {[t.step1, t.step2, t.step3].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white" style={{ opacity: 0.92 }}>
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                        style={{ background: [PASTEL.cyan, PASTEL.amber, PASTEL.pink][i], color: "#050508" }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCredentials(null);
                    setForm((f) => ({ ...f, childFirstName: "", childLastName: "", childEmail: "", schoolName: "", schoolId: null }));
                    setSchoolQuery("");
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                  style={{ background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,.25)" }}
                  data-testid="button-add-another-child"
                >
                  <UserPlus className="w-4 h-4" />
                  {t.addAnother}
                </button>
                <Link href="/parent" className="flex-1">
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508", border: "none" }}
                    data-testid="button-done-dashboard"
                  >
                    {t.goDashboard}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── The form ──────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-10 overflow-hidden" style={{ background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif" }} data-testid="activate-child-page">
      <GraffitiSplats variant="full" opacity={0.3} />
      <div className="relative z-10 w-full max-w-lg flex flex-col gap-5">

        {/* Top bar: back + logo + language */}
        <div className="flex items-center justify-between">
          <Link href="/parent">
            <button type="button" className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:opacity-80" data-testid="button-back-parent">
              <ArrowLeft className="w-4 h-4" />
              {t.back}
            </button>
          </Link>
          <div className="inline-flex items-center gap-2">
            <img src={iconTransparent} alt="BrainTrack" className="h-8 w-8 object-contain" />
            <span className="bt-wordmark text-base">BrainTrack</span>
          </div>
          <button type="button" onClick={toggleLanguage} className="inline-flex items-center gap-1 text-xs font-bold text-white hover:opacity-80" data-testid="button-language-toggle">
            <Globe className="w-4 h-4" />
            {isAf ? "AF" : "EN"}
          </button>
        </div>

        {/* Header */}
        <div className="text-center">
          <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 18, color: PASTEL.cyan, transform: "rotate(-2deg)", display: "inline-block" }}>
            {t.eyebrow}
          </p>
          <h1 className="text-2xl font-black text-white mt-1">{t.heading}</h1>
          <p className="text-sm text-white mt-2 leading-relaxed" style={{ opacity: 0.9 }}>{t.sub}</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden" style={cardStyle}>
          <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
          <div className="p-6 sm:p-7 flex flex-col gap-5">

            {/* Parent block */}
            <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: PASTEL.blue }}>{t.yourDetails}</p>
            <FieldRow label={t.parentPhone}>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" style={{ opacity: 0.7 }} />
                <PastelInput type="tel" autoComplete="tel" value={form.parentPhone} onChange={(e) => setField("parentPhone", e.target.value)} placeholder={t.parentPhonePlaceholder} style={{ ...inputStyle, paddingLeft: "2.6rem" }} data-testid="input-parent-phone" />
              </div>
            </FieldRow>
            <FieldRow label={t.parentEmail}>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" style={{ opacity: 0.7 }} />
                <PastelInput type="email" autoComplete="email" value={form.parentEmail} onChange={(e) => setField("parentEmail", e.target.value)} placeholder="you@email.com" style={{ ...inputStyle, paddingLeft: "2.6rem" }} data-testid="input-parent-email" />
              </div>
            </FieldRow>

            {/* Child block */}
            <p className="text-[11px] font-black uppercase tracking-[0.2em] mt-1" style={{ color: PASTEL.pink }}>{t.childDetails}</p>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label={t.childFirstName}>
                <PastelInput value={form.childFirstName} onChange={(e) => setField("childFirstName", e.target.value)} placeholder="Kagiso" data-testid="input-child-first-name" />
              </FieldRow>
              <FieldRow label={t.childLastName}>
                <PastelInput value={form.childLastName} onChange={(e) => setField("childLastName", e.target.value)} placeholder="Dlamini" data-testid="input-child-last-name" />
              </FieldRow>
            </div>
            <FieldRow label={t.childEmail} hint={t.childEmailHint}>
              <PastelInput type="email" value={form.childEmail} onChange={(e) => setField("childEmail", e.target.value)} placeholder="child@email.com" data-testid="input-child-email" />
            </FieldRow>

            <FieldRow label={t.school}>
              <div className="relative">
                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" style={{ opacity: 0.7 }} />
                <PastelInput
                  value={schoolQuery}
                  onChange={(e) => { setSchoolQuery(e.target.value); setField("schoolName", e.target.value); setField("schoolId", null); }}
                  placeholder={t.schoolPlaceholder}
                  style={{ ...inputStyle, paddingLeft: "2.6rem" }}
                  data-testid="input-child-school"
                />
              </div>
              {schoolResults.length > 0 && (
                <div className="rounded-xl overflow-hidden max-h-56 overflow-y-auto" style={{ border: "1px solid rgba(255,255,255,.15)", background: "#0a0a0f" }}>
                  {schoolResults.map((s, i) => (
                    <button
                      key={`${s.id ?? "m"}-${s.natEmis ?? i}`}
                      type="button"
                      onClick={() => {
                        setField("schoolName", s.name);
                        setField("schoolId", typeof s.id === "number" ? s.id : null);
                        setSchoolQuery(s.name);
                        setSchoolResults([]);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
                      data-testid={`school-result-${i}`}
                    >
                      <span className="block text-sm font-semibold text-white">{s.name}</span>
                      <span className="block text-[11px] text-white" style={{ opacity: 0.8 }}>
                        {[s.district, s.province].filter(Boolean).join(", ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </FieldRow>

            <FieldRow label={t.language}>
              <select
                value={form.language}
                onChange={(e) => setField("language", e.target.value as "en" | "af")}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer"
                style={{ background: "#0a0a0f", border: "1.5px solid rgba(255,255,255,.18)" }}
                data-testid="select-child-language"
              >
                <option value="en">{t.english}</option>
                <option value="af">{t.afrikaans}</option>
              </select>
            </FieldRow>

            {/* Consent statement — the legal heart of this flow */}
            <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: "rgba(148,247,197,.05)", border: "1px solid rgba(148,247,197,.35)" }}>
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: PASTEL.emerald }} />
              <p className="text-[11px] text-white leading-relaxed" style={{ opacity: 0.9 }} data-testid="consent-note">{t.consentNote}</p>
            </div>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => activate.mutate()}
              className="w-full py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508", border: "none" }}
              data-testid="button-activate-child"
            >
              {activate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {activate.isPending ? t.creating : t.submit}
            </button>

            <p className="text-[11px] text-white text-center inline-flex items-center justify-center gap-1.5" style={{ opacity: 0.8 }}>
              <KeyRound className="w-3.5 h-3.5" />
              {isAf
                ? "Die wagwoord word net een keer op die volgende skerm gewys."
                : "The password is shown once on the next screen."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
