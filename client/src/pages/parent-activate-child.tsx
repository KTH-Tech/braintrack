import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { ShareQr } from "@/components/share-qr";
import { ConfettiBurst } from "@/components/confetti-burst";
import {
  isOnboardingPreview,
  createPreviewGate,
  installPreviewWriteTripwire,
} from "@/lib/onboarding-preview";
import { buildWhatsAppDeepLink, buildActivationShareText } from "@/lib/parent-share";
import iconTransparent from "@/assets/handoff/icon-transparent.png";
import {
  Loader2, UserPlus, Phone, Mail, School, Globe, KeyRound, Copy, Check,
  AlertTriangle, ChevronRight, ArrowLeft, ShieldCheck, Sparkles,
  MessageCircle, Share2, Smartphone, Eye, LogOut, GraduationCap,
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
    sub: "Two quick steps: create your child's BrainTrack account, then share their sign-in link. Grade 12 (NSC matric) — they choose their own subjects when they sign in.",
    stepCreate: "Create profile",
    stepShare: "Share link",
    yourDetails: "Your details",
    parentPhone: "Your cell number",
    parentPhonePlaceholder: "e.g. 083 123 4567",
    parentEmail: "Your email",
    childDetails: "Your child's details",
    gradeChip: "Grade 12 · NSC matric",
    childFirstName: "Child's first name",
    childLastName: "Child's last name",
    childEmail: "Child's email (optional)",
    childEmailHint: "No email? Leave it blank — we'll create a username for them.",
    childCell: "Child's cell (optional)",
    childCellHint: "Add it and the WhatsApp button opens a chat straight to them.",
    childCellPlaceholder: "e.g. 083 123 4567",
    school: "Child's school",
    schoolPlaceholder: "Search by school name or town…",
    language: "Child's language",
    english: "English",
    afrikaans: "Afrikaans",
    consentNote: "By creating this account you, as parent/guardian, consent to your child using BrainTrack (POPIA). We record this consent with the account.",
    submit: "Create account & get share link",
    creating: "Creating account…",
    // Success / SHARE screen
    doneEyebrow: "they're in!",
    doneHeading: "Account created",
    doneSubName: "is ready.",
    // — Share section (the core step) —
    shareEyebrow: "one tap to share",
    shareHeading: "Send the sign-in link",
    shareSub: "Tap below to share their single-use sign-in link. It signs them straight in — no password to type. The link works for 24 hours.",
    shareWhatsApp: "Share via WhatsApp",
    shareWhatsAppTo: "WhatsApp it to your child",
    shareNative: "Share…",
    shareCopy: "Copy link",
    shareCopied: "Link copied!",
    qrScan: "Scan with your child's phone camera to sign them in.",
    qrDownload: "Download QR",
    linkExpires: "This link is single-use and expires in 24 hours.",
    noLinkNote: "We couldn't generate the share link this time — hand over the sign-in details below instead. You can always share a fresh link from your parent dashboard.",
    // — Credentials (secondary hand-over) —
    credsHeading: "Or hand over these sign-in details",
    doneSub: "They sign in at",
    username: "Username",
    password: "Password",
    copy: "Copy",
    copied: "Copied!",
    copyBoth: "Copy username + password",
    writeDown: "Write these down now — for your child's security this password is shown only once. It is not in the link or QR, not emailed or SMS'd, and we cannot show it again.",
    nextSteps: "What your child does next",
    step1: "Opens the link (or signs in with the username + password)",
    step2: "Completes their quick onboarding (subjects, prelim dates)",
    step3: "Changes the password in Settings → Account",
    addAnother: "Add another child",
    goDashboard: "Go to parent dashboard",
    back: "Back to dashboard",
    errorTitle: "Could not create the account",
    duplicateChildTitle: "Already linked",
    emailTakenTitle: "Email already registered",
    // — Admin preview —
    previewBadge: "Preview · nothing is saved",
    previewNote: "You're viewing the parent onboarding as an admin. No account is created and no link is sent — the details below are sample data.",
    previewExit: "Exit preview",
  },
  af: {
    eyebrow: "kom ons kry hulle in!",
    heading: "Voeg jou kind by & aktiveer",
    sub: "Twee vinnige stappe: skep jou kind se BrainTrack-rekening, deel dan hul aanmeldskakel. Graad 12 (NSC-matriek) — hulle kies self hul vakke wanneer hulle inteken.",
    stepCreate: "Skep profiel",
    stepShare: "Deel skakel",
    yourDetails: "Jou besonderhede",
    parentPhone: "Jou selfoonnommer",
    parentPhonePlaceholder: "bv. 083 123 4567",
    parentEmail: "Jou e-pos",
    childDetails: "Jou kind se besonderhede",
    gradeChip: "Graad 12 · NSC-matriek",
    childFirstName: "Kind se voornaam",
    childLastName: "Kind se van",
    childEmail: "Kind se e-pos (opsioneel)",
    childEmailHint: "Geen e-pos nie? Los dit oop — ons skep 'n gebruikersnaam vir hulle.",
    childCell: "Kind se selfoon (opsioneel)",
    childCellHint: "Voeg dit by en die WhatsApp-knoppie open 'n klets reguit na hulle.",
    childCellPlaceholder: "bv. 083 123 4567",
    school: "Kind se skool",
    schoolPlaceholder: "Soek op skoolnaam of dorp…",
    language: "Kind se taal",
    english: "Engels",
    afrikaans: "Afrikaans",
    consentNote: "Deur hierdie rekening te skep gee jy, as ouer/voog, toestemming dat jou kind BrainTrack gebruik (POPIA). Ons teken hierdie toestemming saam met die rekening aan.",
    submit: "Skep rekening & kry deelskakel",
    creating: "Skep rekening…",
    doneEyebrow: "hulle is binne!",
    doneHeading: "Rekening geskep",
    doneSubName: "is reg.",
    shareEyebrow: "een tik om te deel",
    shareHeading: "Stuur die aanmeldskakel",
    shareSub: "Tik hieronder om hul eenmalige aanmeldskakel te deel. Dit teken hulle dadelik in — geen wagwoord om te tik nie. Die skakel werk vir 24 uur.",
    shareWhatsApp: "Deel via WhatsApp",
    shareWhatsAppTo: "WhatsApp dit aan jou kind",
    shareNative: "Deel…",
    shareCopy: "Kopieer skakel",
    shareCopied: "Skakel gekopieer!",
    qrScan: "Skandeer met jou kind se kamera om hulle in te teken.",
    qrDownload: "Laai QR af",
    linkExpires: "Hierdie skakel is eenmalig en verval oor 24 uur.",
    noLinkNote: "Ons kon nie hierdie keer die deelskakel skep nie — oorhandig eerder die aanmeldbesonderhede hieronder. Jy kan altyd 'n vars skakel vanaf jou ouer-dashboard deel.",
    credsHeading: "Of oorhandig hierdie aanmeldbesonderhede",
    doneSub: "Hulle teken in by",
    username: "Gebruikersnaam",
    password: "Wagwoord",
    copy: "Kopieer",
    copied: "Gekopieer!",
    copyBoth: "Kopieer gebruikersnaam + wagwoord",
    writeDown: "Skryf dit nou neer — vir jou kind se veiligheid word hierdie wagwoord net een keer gewys. Dit is nie in die skakel of QR nie, word nie ge-e-pos of ge-SMS nie, en ons kan dit nie weer wys nie.",
    nextSteps: "Wat jou kind volgende doen",
    step1: "Maak die skakel oop (of teken in met die gebruikersnaam + wagwoord)",
    step2: "Voltooi hul vinnige aanboording (vakke, vooreksamendatums)",
    step3: "Verander die wagwoord in Instellings → Rekening",
    addAnother: "Voeg nog 'n kind by",
    goDashboard: "Na ouer-dashboard",
    back: "Terug na dashboard",
    errorTitle: "Kon nie die rekening skep nie",
    duplicateChildTitle: "Reeds gekoppel",
    emailTakenTitle: "E-pos reeds geregistreer",
    previewBadge: "Voorskou · niks word gestoor nie",
    previewNote: "Jy bekyk die ouer-aanboording as 'n admin. Geen rekening word geskep en geen skakel word gestuur nie — die besonderhede hieronder is voorbeelddata.",
    previewExit: "Verlaat voorskou",
  },
} as const;

type SchoolResult = { id: number | null; natEmis?: number; name: string; province: string | null; district: string | null };

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-white uppercase tracking-[0.18em]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white leading-snug">{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(5,5,8,.6)",
  border: "1.5px solid #1b1922",
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
    <div className="rounded-2xl p-4" style={{ background: "#1b1922", border: `1.5px solid ${color}` }}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{label}</p>
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

/** Two-step journey indicator: 1 Create profile → 2 Share link. */
function StepDots({ active, labels }: { active: 1 | 2; labels: [string, string] }) {
  return (
    <div className="flex items-center justify-center gap-2" data-testid="parent-onboarding-steps">
      {labels.map((label, i) => {
        const step = (i + 1) as 1 | 2;
        const on = step === active;
        const done = step < active;
        const hex = on ? PASTEL.cyan : done ? PASTEL.emerald : "#ffffff";
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em]"
              style={{
                color: on || done ? "#050508" : "#fff",
                background: on || done ? hex : "transparent",
                border: `1.5px solid ${on || done ? hex : "#1b1922"}`,
              }}
            >
              <span className="w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px]"
                style={{ background: on || done ? "rgba(5,5,8,.15)" : "transparent" }}>
                {done ? "✓" : step}
              </span>
              {label}
            </span>
            {i === 0 && <span className="w-4 h-[2px] rounded-full" style={{ background: done ? PASTEL.emerald : "#1b1922" }} />}
          </div>
        );
      })}
    </div>
  );
}

/** Loud, unmistakable admin-preview hazard banner (amber dashed) — mirrors the
 *  onboarding/parent-dashboard preview banners. Only rendered when inPreview. */
function PreviewBanner({ badge, note, exitLabel }: { badge: string; note: string; exitLabel: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-start gap-3"
      style={{
        background: "repeating-linear-gradient(135deg, rgba(255,226,154,.16) 0 14px, rgba(255,226,154,.06) 14px 28px)",
        border: "2px dashed #FFE29A",
      }}
      data-testid="parent-onboarding-preview-banner"
      role="status"
      aria-live="polite"
    >
      <Eye className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#FFE29A" }} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#FFE29A" }}>{badge}</p>
        <p className="text-[11px] text-white mt-0.5 leading-snug">{note}</p>
      </div>
      <button
        type="button"
        onClick={() => { if (typeof window !== "undefined") window.location.href = "/dashboard"; }}
        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em]"
        style={{ border: "1px solid #FFE29A", color: "#FFE29A", background: "transparent" }}
        data-testid="button-exit-parent-preview"
      >
        <LogOut className="w-3 h-3" />
        {exitLabel}
      </button>
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

  // ── Admin-only preview (?preview=1) ──────────────────────────────────────
  // "i want to view parent onboarding" — an admin can walk this whole flow at
  // /parent/activate-child?preview=1 WITHOUT creating a real account. The
  // activate mutation is routed through previewGate.mutation(real, simulated):
  // in preview the real POST is never invoked and a fetch tripwire additionally
  // blocks any write to /api/* that might slip past. The school-search GET stays
  // live (harmless, keeps the preview realistic). A non-admin with the flag gets
  // inPreview === false and the completely normal live flow.
  const inPreview = isOnboardingPreview(
    user?.role,
    typeof window !== "undefined" ? window.location.search : "",
  );
  const previewGate = useMemo(() => createPreviewGate(inPreview), [inPreview]);
  useEffect(() => {
    if (!inPreview || typeof window === "undefined") return;
    return installPreviewWriteTripwire(window);
  }, [inPreview]);

  const [form, setForm] = useState({
    parentPhone: "",
    parentEmail: "",
    childFirstName: "",
    childLastName: "",
    childEmail: "",
    childCell: "",
    schoolName: "",
    schoolId: null as number | null,
    language: language as "en" | "af",
  });
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<SchoolResult[]>([]);
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
    learnerName: string;
    activationUrl: string | null;
    childCell: string | null;
  } | null>(null);
  const [bothCopied, setBothCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

  type ActivateResponse = {
    username: string;
    password: string;
    learnerName: string;
    activationUrl: string | null;
    childCell: string | null;
  };

  const activate = useMutation({
    // previewGate: live, the real POST runs. In preview it is NEVER invoked —
    // the simulated branch resolves obviously-synthetic sample data so the
    // share screen renders exactly as a parent would see it, without writing.
    mutationFn: previewGate.mutation(
      async (): Promise<ActivateResponse> => {
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
            childCell: form.childCell.trim() || undefined,
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
        return body as ActivateResponse;
      },
      async (): Promise<ActivateResponse> => {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://app.braintrack.tech";
        const first = form.childFirstName.trim() || "Amahle";
        const last = form.childLastName.trim() || "Dlamini";
        return {
          username: "amahle.dlamini12@learners.braintrack.tech",
          password: "Sample-Preview-10",
          learnerName: `${first} ${last} (SAMPLE)`,
          activationUrl: `${origin}/api/auth/onboarding-claim?token=preview-sample-token-not-real`,
          childCell: form.childCell.trim() || null,
        };
      },
    ),
    onSuccess: (data) => {
      setCredentials({
        username: data.username,
        password: data.password,
        learnerName: data.learnerName,
        activationUrl: data.activationUrl ?? null,
        childCell: data.childCell ?? null,
      });
      // The parent dashboard's children list must include the new learner.
      // Skipped in preview — nothing was created and the tripwire only allows
      // reads anyway.
      if (!inPreview) queryClient.invalidateQueries({ queryKey: ["/api/parent/children"] });
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
    border: "1px solid #1b1922",
  };

  // ── Derived share artifacts (share step) ──────────────────────────────────
  // The activation link carries a single-use token — NEVER the password. The
  // wa.me link is a DEEP LINK the parent taps (opens THEIR WhatsApp) — not a
  // server-side send. Targets the child's number when supplied, else the picker.
  const activationUrl = credentials?.activationUrl ?? null;
  const waLink = activationUrl
    ? buildWhatsAppDeepLink(activationUrl, form.language, credentials?.childCell ?? form.childCell)
    : null;
  const canNativeShare =
    typeof navigator !== "undefined" && typeof (navigator as any).share === "function";

  async function handleNativeShare() {
    if (!activationUrl) return;
    try {
      // The share text already embeds the link — pass it alone so a native
      // sheet doesn't duplicate the URL. No child data, no password.
      await (navigator as any).share({
        title: "BrainTrack",
        text: buildActivationShareText(activationUrl, form.language),
      });
    } catch {
      /* user cancelled, or unsupported — the explicit buttons remain */
    }
  }

  // ── Success / SHARE — the ONE time the password is visible ────────────────
  if (credentials) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden" style={{ background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif" }} data-testid="activate-child-success">
        {/* Profile-created celebration — fires once when the credentials
            first render. ConfettiBurst self-removes when the burst is done. */}
        <ConfettiBurst />
        <GraffitiSplats variant="full" opacity={0.35} />
        <div className="relative z-10 w-full max-w-lg">
          <div className="rounded-3xl overflow-hidden" style={cardStyle}>
            <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
            <div className="p-6 sm:p-8 flex flex-col gap-5">
              {inPreview && <PreviewBanner badge={t.previewBadge} note={t.previewNote} exitLabel={t.previewExit} />}
              <StepDots active={2} labels={[t.stepCreate, t.stepShare]} />

              <div className="text-center">
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: PASTEL.emerald, transform: "rotate(-2deg)", display: "inline-block" }}>
                  {t.doneEyebrow}
                </p>
                <h1 className="text-2xl font-black text-white mt-1">{t.doneHeading}</h1>
                <p className="text-sm text-white mt-2">
                  <span className="font-bold" style={{ color: PASTEL.cyan }}>{credentials.learnerName}</span> {t.doneSubName}
                </p>
              </div>

              {/* ── SHARE STEP — the core of the flow ──────────────────────── */}
              {activationUrl ? (
                <div
                  className="rounded-2xl p-5 flex flex-col gap-4"
                  style={{ background: "rgba(148,247,197,.05)", border: `1.5px solid ${PASTEL.emerald}` }}
                  data-testid="share-step"
                >
                  <div className="text-center">
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: PASTEL.emerald, transform: "rotate(-1.5deg)", display: "inline-block" }}>
                      {t.shareEyebrow}
                    </p>
                    <h2 className="text-lg font-black text-white mt-0.5">{t.shareHeading}</h2>
                    <p className="text-[13px] text-white mt-1.5 leading-relaxed">{t.shareSub}</p>
                  </div>

                  {/* Primary: WhatsApp deep link the PARENT taps */}
                  <Button asChild variant="primary" size="lg" className="w-full">
                    <a
                      href={waLink ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="button-share-whatsapp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {credentials.childCell ? t.shareWhatsAppTo : t.shareWhatsApp}
                    </a>
                  </Button>

                  {/* Secondary row: native share (if available) + copy link */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {canNativeShare && (
                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                        style={{ background: "transparent", color: PASTEL.blue, border: `1.5px solid ${PASTEL.blue}` }}
                        data-testid="button-share-native"
                      >
                        <Share2 className="w-4 h-4" />
                        {t.shareNative}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(activationUrl).catch(() => {});
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 1800);
                      }}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                      style={{ background: "transparent", color: PASTEL.cyan, border: `1.5px solid ${PASTEL.cyan}` }}
                      data-testid="button-share-copy-link"
                    >
                      {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {linkCopied ? t.shareCopied : t.shareCopy}
                    </button>
                  </div>

                  {/* QR — the deliberate light exception; dark-on-white, real quiet zone */}
                  <div className="flex flex-col items-center pt-1">
                    <ShareQr
                      value={activationUrl}
                      scanLabel={t.qrScan}
                      downloadLabel={t.qrDownload}
                      downloadName={`BrainTrack-signin-QR`}
                      accent={PASTEL.cyan}
                    />
                  </div>

                  <p className="text-[11px] text-white text-center inline-flex items-center justify-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    {t.linkExpires}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(255,226,154,.06)", border: `1.5px solid ${PASTEL.amber}` }}>
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: PASTEL.amber }} />
                  <p className="text-[13px] text-white leading-snug" data-testid="share-step-nolink">{t.noLinkNote}</p>
                </div>
              )}

              {/* ── Credentials — secondary hand-over. Password on-screen ONLY ── */}
              <p className="text-[11px] font-black uppercase tracking-[0.2em] mt-1" style={{ color: PASTEL.blue }}>{t.credsHeading}</p>
              <p className="text-[12px] text-white -mt-2">
                {t.doneSub}{" "}
                <span className="font-bold" style={{ color: PASTEL.cyan }}>{window.location.origin.replace(/^https?:\/\//, "")}/signin</span>
              </p>

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
              <div className="rounded-2xl p-4" style={{ background: "#1b1922", border: "1px solid #1b1922" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-2">{t.nextSteps}</p>
                <ol className="flex flex-col gap-2">
                  {[t.step1, t.step2, t.step3].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white">
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
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setCredentials(null);
                    setLinkCopied(false);
                    setBothCopied(false);
                    setForm((f) => ({ ...f, childFirstName: "", childLastName: "", childEmail: "", childCell: "", schoolName: "", schoolId: null }));
                    setSchoolQuery("");
                  }}
                  data-testid="button-add-another-child"
                >
                  <UserPlus className="w-4 h-4" />
                  {t.addAnother}
                </Button>
                <Link href="/parent" className="flex-1">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full"
                    data-testid="button-done-dashboard"
                  >
                    {t.goDashboard}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
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

        {inPreview && <PreviewBanner badge={t.previewBadge} note={t.previewNote} exitLabel={t.previewExit} />}

        {/* Header */}
        <div className="text-center">
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: PASTEL.cyan, transform: "rotate(-2deg)", display: "inline-block" }}>
            {t.eyebrow}
          </p>
          <h1 className="text-2xl font-black text-white mt-1">{t.heading}</h1>
          <p className="text-sm text-white mt-2 leading-relaxed">{t.sub}</p>
        </div>

        <StepDots active={1} labels={[t.stepCreate, t.stepShare]} />

        {/* Card */}
        <div className="rounded-3xl overflow-hidden" style={cardStyle}>
          <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
          <div className="p-6 sm:p-7 flex flex-col gap-5">

            {/* Parent block */}
            <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: PASTEL.blue }}>{t.yourDetails}</p>
            <FieldRow label={t.parentPhone}>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                <PastelInput type="tel" autoComplete="tel" value={form.parentPhone} onChange={(e) => setField("parentPhone", e.target.value)} placeholder={t.parentPhonePlaceholder} style={{ ...inputStyle, paddingLeft: "2.6rem" }} data-testid="input-parent-phone" />
              </div>
            </FieldRow>
            <FieldRow label={t.parentEmail}>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                <PastelInput type="email" autoComplete="email" value={form.parentEmail} onChange={(e) => setField("parentEmail", e.target.value)} placeholder="you@email.com" style={{ ...inputStyle, paddingLeft: "2.6rem" }} data-testid="input-parent-email" />
              </div>
            </FieldRow>

            {/* Child block */}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: PASTEL.pink }}>{t.childDetails}</p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.14em]"
                style={{ color: PASTEL.amber, border: `1px solid ${PASTEL.amber}` }}
                data-testid="grade-chip"
              >
                <GraduationCap className="w-3 h-3" />
                {t.gradeChip}
              </span>
            </div>
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

            <FieldRow label={t.childCell} hint={t.childCellHint}>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                <PastelInput type="tel" autoComplete="off" value={form.childCell} onChange={(e) => setField("childCell", e.target.value)} placeholder={t.childCellPlaceholder} style={{ ...inputStyle, paddingLeft: "2.6rem" }} data-testid="input-child-cell" />
              </div>
            </FieldRow>

            <FieldRow label={t.school}>
              <div className="relative">
                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                <PastelInput
                  value={schoolQuery}
                  onChange={(e) => { setSchoolQuery(e.target.value); setField("schoolName", e.target.value); setField("schoolId", null); }}
                  placeholder={t.schoolPlaceholder}
                  style={{ ...inputStyle, paddingLeft: "2.6rem" }}
                  data-testid="input-child-school"
                />
              </div>
              {schoolResults.length > 0 && (
                <div className="rounded-xl overflow-hidden max-h-56 overflow-y-auto" style={{ border: "1px solid #1b1922", background: "#0a0a0f" }}>
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
                      className="w-full text-left px-4 py-2.5 hover:bg-[#1b1922] transition-colors"
                      style={{ borderBottom: "1px solid #1b1922" }}
                      data-testid={`school-result-${i}`}
                    >
                      <span className="block text-sm font-semibold text-white">{s.name}</span>
                      <span className="block text-[11px] text-white">
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
                style={{ background: "#0a0a0f", border: "1.5px solid #1b1922" }}
                data-testid="select-child-language"
              >
                <option value="en">{t.english}</option>
                <option value="af">{t.afrikaans}</option>
              </select>
            </FieldRow>

            {/* Consent statement — the legal heart of this flow */}
            <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: "rgba(148,247,197,.05)", border: "1px solid rgba(148,247,197,.35)" }}>
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: PASTEL.emerald }} />
              <p className="text-[11px] text-white leading-relaxed" data-testid="consent-note">{t.consentNote}</p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canSubmit}
              onClick={() => activate.mutate()}
              data-testid="button-activate-child"
            >
              {activate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {activate.isPending ? t.creating : t.submit}
            </Button>

            <p className="text-[11px] text-white text-center inline-flex items-center justify-center gap-1.5">
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
