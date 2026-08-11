import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";
import iconTransparent from "@/assets/handoff/icon-transparent.png";
import { Loader2, School, CheckCircle2, Phone, Hash, ChevronRight, Pencil } from "lucide-react";

const NEON = "#6EE7F9";

type School = { id: number; schoolName: string; schoolCode: string; isActive: boolean };

const T = {
  en: {
    eyebrow: "you're almost in",
    joining: "Joining BrainTrack",
    at: "at",
    tagline: "South Africa's #1 Matric prep platform",
    step1: "Your details",
    step2: "Verify your number",
    firstName: "First name",
    lastName: "Last name",
    phone: "Mobile number",
    phonePlaceholder: "e.g. 083 123 4567",
    language: "Preferred language",
    parentEmail: "Parent / guardian email (optional)",
    parentEmailHint: "Required if you are under 18 — for consent and progress updates",
    next: "Continue",
    otpSent: "We sent a 6-digit code to",
    enterCode: "Enter your verification code",
    verify: "Verify & enter",
    resend: "Change details",
    invalidSchool: "Invalid or inactive school code. Check your QR code and try again.",
    loading: "Loading school…",
    alreadyHave: "Already have an account?",
    signIn: "Sign in",
    backHome: "Back to home",
    success: "Verified! Taking you to BrainTrack…",
    english: "English",
    afrikaans: "Afrikaans",
  },
  af: {
    eyebrow: "jy's amper in",
    joining: "Sluit aan by BrainTrack",
    at: "by",
    tagline: "Suid-Afrika se #1 matriek voorbereidingsplatform",
    step1: "Jou besonderhede",
    step2: "Bevestig jou nommer",
    firstName: "Voornaam",
    lastName: "Van",
    phone: "Selfoonnommer",
    phonePlaceholder: "bv. 083 123 4567",
    language: "Voorkeur taal",
    parentEmail: "Ouer / voog e-pos (opsioneel)",
    parentEmailHint: "Vereis as jy onder 18 is — vir toestemming en vordering",
    next: "Gaan voort",
    otpSent: "Ons het 'n 6-syfer kode gestuur na",
    enterCode: "Voer jou verifikasiekode in",
    verify: "Bevestig & teken in",
    resend: "Verander besonderhede",
    invalidSchool: "Ongeldige of onaktiewe skooldkode. Kyk jou QR-kode en probeer weer.",
    loading: "Skool laai…",
    alreadyHave: "Het jy reeds 'n rekening?",
    signIn: "Teken in",
    backHome: "Terug na tuisblad",
    success: "Bevestig! Ons neem jou na BrainTrack…",
    english: "Engels",
    afrikaans: "Afrikaans",
  },
};

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-white uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

// Solid ground fill + solid white border, NEON placeholder/focus — mirrors
// signin.tsx's .bts-input so the two auth-adjacent forms match.
const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  background: "#050508",
  border: "2px solid #fff",
  borderRadius: 12,
  padding: "12px 16px",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

function NeonInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`join-input w-full outline-none transition-colors ${className ?? ""}`}
      style={{ ...inputBaseStyle, ...(style ?? {}) }}
    />
  );
}

function NeonSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="join-input w-full outline-none appearance-none cursor-pointer"
      style={{ ...inputBaseStyle, background: "#0e0d12" }}
    />
  );
}

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const [, navigate] = useLocation();
  const { language, setLanguage } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const { toast } = useToast();

  // Partner-school deep link — each URL carries a per-school code, so we
  // suppress indexing to avoid thousands of thin-content permutations.
  useSEO({
    title: "Join BrainTrack via your school | BrainTrack",
    description:
      "Verify your mobile number and join BrainTrack through your partner school. Grade 12 matric prep in English and Afrikaans.",
    canonical: "https://braintrack.tech/join",
    noIndex: true,
  });

  const [step, setStep] = useState<"details" | "otp" | "done">("details");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", language: language, parentEmail: "" });
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");

  const { data: school, isLoading: schoolLoading, isError: schoolError } = useQuery<School>({
    queryKey: ["/api/partner-schools/code", code],
    queryFn: async () => {
      const res = await fetch(`/api/partner-schools/code/${code}`);
      if (!res.ok) throw new Error("not_found");
      return res.json();
    },
    retry: false,
  });

  const joinMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/join/${code}`, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      // BrainTrack is a Grade 12 / NSC product — grade is a hard constant,
      // there is no selector (matches onboarding.tsx's same convention).
      grade: 12,
      language: form.language,
      parentEmail: form.parentEmail.trim() || undefined,
    }),
    onSuccess: (data: any) => {
      setUserId(data.userId);
      setStep("otp");
    },
    onError: (err: any) => {
      const msg = err?.message || "Sign-up failed";
      if (msg.includes("phone_taken")) {
        toast({ title: isAf ? "Nommer reeds geregistreer" : "Number already registered", description: isAf ? "Meld asseblief aan." : "Please sign in instead.", variant: "destructive" });
      } else {
        toast({ title: isAf ? "Fout" : "Error", description: msg, variant: "destructive" });
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/join/${code}/verify`, {
      userId,
      phone: form.phone.trim(),
      otp: otp.trim(),
    }),
    onSuccess: (data: any) => {
      setStep("done");
      setTimeout(() => navigate(data.redirect || "/onboarding"), 1200);
    },
    onError: (err: any) => {
      const msg = err?.message || "";
      if (msg.includes("otp_invalid")) toast({ title: isAf ? "Verkeerde kode" : "Wrong code", description: isAf ? "Kyk jou SMS en probeer weer." : "Check your SMS and try again.", variant: "destructive" });
      else if (msg.includes("otp_expired")) toast({ title: isAf ? "Kode verval" : "Code expired", description: isAf ? "Versoek 'n nuwe kode." : "Request a new code.", variant: "destructive" });
      else toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  function setField(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function handleLangChange(lang: "en" | "af") {
    setField("language", lang);
    setLanguage(lang);
  }

  const canSubmitDetails =
    form.firstName.trim().length >= 1 &&
    form.lastName.trim().length >= 1 &&
    form.phone.trim().length >= 9;

  if (schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050508" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: NEON }} />
      </div>
    );
  }

  if (schoolError || !school) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: "#050508" }}>
        <School className="w-10 h-10" style={{ color: NEON }} />
        <p className="text-white text-sm max-w-xs">{t.invalidSchool}</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <a href="/" className="pub-btn" data-testid="button-invalid-school-home" style={{ display: "inline-block", textDecoration: "none" }}>
            {t.backHome}
          </a>
          <a href="/signin" className="pub-btn-outline" data-testid="button-invalid-school-signin" style={{ display: "inline-block", textDecoration: "none", ["--a" as string]: NEON } as React.CSSProperties}>
            {t.signIn}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4" style={{ background: "#050508" }}>
      <style>{`
        .join-input::placeholder { color: #9FD8FF; opacity: 1; }
        .join-input:focus { border-color: ${NEON} !important; }
        .join-resend { transition: color .15s ease; }
        .join-resend:hover { color: ${NEON}; }
      `}</style>

      <div className="w-full max-w-md flex flex-col gap-6 relative z-10">

        {/* Logo */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex items-center gap-2">
            <img src={iconTransparent} alt="BrainTrack" className="h-9 w-9 object-contain" />
            <span className="gradient-text font-bold tracking-tight leading-none text-lg">BrainTrack</span>
          </div>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "'Bebas Neue', system-ui, sans-serif", color: NEON, fontSize: 15,
            letterSpacing: "1.5px", textTransform: "uppercase", textAlign: "center",
            transform: "rotate(-2deg)",
          }}
        >
          {t.eyebrow}
        </div>

        {/* School banner — solid pub-card fill, hard-offset shadow */}
        <div className="rounded-2xl px-5 py-4 text-center" style={{ background: "#0e0d12", border: `2.5px solid ${NEON}`, boxShadow: `6px 6px 0 0 ${NEON}` }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <School className="w-4 h-4 shrink-0" style={{ color: NEON }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: NEON }}>
              {t.joining}
            </span>
          </div>
          <p className="text-white font-bold text-lg leading-snug">{school.schoolName}</p>
          <p className="text-white text-xs mt-1">{t.tagline}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "#0e0d12", border: `2.5px solid ${NEON}`, boxShadow: `6px 6px 0 0 ${NEON}` }}>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {(["details", "otp"] as const).map((s, i) => {
              const isActive = step === s || (step === "done" && i === 1);
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: isActive ? NEON : "#0e0d12", border: `2px solid ${NEON}`, color: isActive ? "#050508" : NEON }}>
                    {(step === "otp" && i === 0) || step === "done" ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-xs font-bold" style={{ color: step === s ? NEON : "#fff" }}>
                    {i === 0 ? t.step1 : t.step2}
                  </span>
                  {i === 0 && <ChevronRight className="w-3 h-3 text-white" />}
                </div>
              );
            })}
          </div>

          {/* ── Step 1: Details ── */}
          {step === "details" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <InputRow label={t.firstName}>
                  <NeonInput value={form.firstName} onChange={e => setField("firstName", e.target.value)} placeholder="Kagiso" autoComplete="given-name" />
                </InputRow>
                <InputRow label={t.lastName}>
                  <NeonInput value={form.lastName} onChange={e => setField("lastName", e.target.value)} placeholder="Dlamini" autoComplete="family-name" />
                </InputRow>
              </div>

              <InputRow label={t.phone}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none" />
                  <NeonInput type="tel" value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder={t.phonePlaceholder} autoComplete="tel" style={{ paddingLeft: "2.25rem" }} />
                </div>
              </InputRow>

              <InputRow label={t.language}>
                <NeonSelect value={form.language} onChange={e => handleLangChange(e.target.value as "en"|"af")}>
                  <option value="en">{t.english}</option>
                  <option value="af">{t.afrikaans}</option>
                </NeonSelect>
              </InputRow>

              <InputRow label={t.parentEmail}>
                <NeonInput type="email" value={form.parentEmail} onChange={e => setField("parentEmail", e.target.value)} placeholder="parent@email.com" autoComplete="email" />
                <p className="text-[10px] text-white leading-relaxed">{t.parentEmailHint}</p>
              </InputRow>

              <button
                disabled={!canSubmitDetails || joinMutation.isPending}
                onClick={() => joinMutation.mutate()}
                data-testid="button-join-continue"
                className="pub-btn pub-btn-block disabled:opacity-40"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  {t.next}
                </span>
              </button>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <div className="flex flex-col gap-5 items-center text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#0e0d12", border: `2px solid ${NEON}` }}>
                <Hash className="w-6 h-6" style={{ color: NEON }} />
              </div>
              <div>
                <p className="text-white text-sm">{t.otpSent}</p>
                <p className="text-white font-semibold text-sm mt-0.5">{form.phone}</p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                data-testid="input-otp"
                className="join-input w-48 text-center text-3xl font-mono tracking-[0.4em] py-3 rounded-xl text-white outline-none"
                style={{ background: "#050508", border: `2px solid ${NEON}` }}
              />
              <button
                disabled={otp.length !== 6 || verifyMutation.isPending}
                onClick={() => verifyMutation.mutate()}
                data-testid="button-join-verify"
                className="pub-btn pub-btn-block disabled:opacity-40"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {t.verify}
                </span>
              </button>
              {/* Doesn't resend a code — it takes you back to step 1 to fix a
                  wrong number/name (there's no resend-OTP endpoint; re-submitting
                  the join form would just 409 on the phone that's already
                  registered from the first submission). Labelled to match. */}
              <button onClick={() => { setStep("details"); setOtp(""); }} data-testid="button-join-change-details" className="join-resend flex items-center gap-1.5 text-xs text-white">
                <Pencil className="w-3 h-3" />
                {t.resend}
              </button>
            </div>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="w-10 h-10" style={{ color: NEON }} />
              <p className="text-white font-semibold">{t.success}</p>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Sign-in link */}
        {step === "details" && (
          <p className="text-center text-xs text-white">
            {t.alreadyHave}{" "}
            <a href="/signin" className="underline font-bold" style={{ color: NEON }}>{t.signIn}</a>
          </p>
        )}

        {/* School code pill */}
        <p className="text-center text-[10px] font-mono text-white">{school.schoolCode}</p>
      </div>
    </div>
  );
}
