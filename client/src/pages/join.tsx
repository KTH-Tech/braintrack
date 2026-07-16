import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { useToast } from "@/hooks/use-toast";
import { Loader2, School, CheckCircle2, Phone, User, Hash, Globe, ChevronRight, RotateCcw } from "lucide-react";

const NEON = "#7FEFFF";
const hexRgba = (h: string, a: number) => {
  const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

type School = { id: number; schoolName: string; schoolCode: string; isActive: boolean };

const T = {
  en: {
    joining: "Joining BrainTrack",
    at: "at",
    tagline: "South Africa's #1 Matric prep platform",
    step1: "Your details",
    step2: "Verify your number",
    firstName: "First name",
    lastName: "Last name",
    phone: "Mobile number",
    phonePlaceholder: "e.g. 083 123 4567",
    grade: "Grade",
    selectGrade: "Select your grade",
    language: "Preferred language",
    parentEmail: "Parent / guardian email (optional)",
    parentEmailHint: "Required if you are under 18 — for consent and progress updates",
    next: "Continue",
    otpSent: "We sent a 6-digit code to",
    enterCode: "Enter your verification code",
    verify: "Verify & enter",
    resend: "Resend code",
    invalidSchool: "Invalid or inactive school code. Check your QR code and try again.",
    loading: "Loading school…",
    alreadyHave: "Already have an account?",
    signIn: "Sign in",
    success: "Verified! Taking you to BrainTrack…",
    grades: ["Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
    english: "English",
    afrikaans: "Afrikaans",
  },
  af: {
    joining: "Sluit aan by BrainTrack",
    at: "by",
    tagline: "Suid-Afrika se #1 matriek voorbereidingsplatform",
    step1: "Jou besonderhede",
    step2: "Bevestig jou nommer",
    firstName: "Voornaam",
    lastName: "Van",
    phone: "Selfoonnommer",
    phonePlaceholder: "bv. 083 123 4567",
    grade: "Graad",
    selectGrade: "Kies jou graad",
    language: "Voorkeur taal",
    parentEmail: "Ouer / voog e-pos (opsioneel)",
    parentEmailHint: "Vereis as jy onder 18 is — vir toestemming en vordering",
    next: "Gaan voort",
    otpSent: "Ons het 'n 6-syfer kode gestuur na",
    enterCode: "Voer jou verifikasiekode in",
    verify: "Bevestig & teken in",
    resend: "Stuur kode weer",
    invalidSchool: "Ongeldige of onaktiewe skooldkode. Kyk jou QR-kode en probeer weer.",
    loading: "Skool laai…",
    alreadyHave: "Het jy reeds 'n rekening?",
    signIn: "Teken in",
    success: "Bevestig! Ons neem jou na BrainTrack…",
    grades: ["Graad 8","Graad 9","Graad 10","Graad 11","Graad 12"],
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

function NeonInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl text-sm text-white bg-white/5 outline-none transition-all focus:bg-white/8 placeholder:text-white"
      style={{ border: `1px solid ${hexRgba(NEON, 0.2)}`, ...(props.style ?? {}) }}
    />
  );
}

function NeonSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-4 py-3 rounded-xl text-sm text-white bg-[#0d0d0d] outline-none appearance-none cursor-pointer"
      style={{ border: `1px solid ${hexRgba(NEON, 0.2)}` }}
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

  const [step, setStep] = useState<"details" | "otp" | "done">("details");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", grade: "", language: language, parentEmail: "" });
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
      grade: parseInt(form.grade),
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
    form.phone.trim().length >= 9 &&
    form.grade !== "";

  if (schoolLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: NEON }} />
      </div>
    );
  }

  if (schoolError || !school) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <School className="w-10 h-10 text-white" />
        <p className="text-white text-sm max-w-xs">{t.invalidSchool}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start py-10 px-4">
      {/* Top glow */}
      <div aria-hidden className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${hexRgba(NEON, 0.1)} 0%, transparent 70%)` }} />

      <div className="w-full max-w-md flex flex-col gap-6 relative z-10">

        {/* Logo */}
        <div className="flex justify-center pt-2">
          <BrainTrackLogo className="h-9 w-9" wordmark wordmarkClassName="text-lg" />
        </div>

        {/* School banner */}
        <div className="rounded-2xl px-5 py-4 text-center" style={{ background: hexRgba(NEON, 0.07), border: `1px solid ${hexRgba(NEON, 0.22)}` }}>
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
        <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "#080808", border: `1px solid ${hexRgba(NEON, 0.15)}` }}>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {(["details", "otp"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: step === s || (step === "done" && i === 1) ? NEON : hexRgba(NEON, 0.12), color: step === s || (step === "done" && i === 1) ? "#000" : hexRgba(NEON, 0.5) }}>
                  {(step === "otp" && i === 0) || step === "done" ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-xs" style={{ color: step === s ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>
                  {i === 0 ? t.step1 : t.step2}
                </span>
                {i === 0 && <ChevronRight className="w-3 h-3 text-white" />}
              </div>
            ))}
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
                  <NeonInput type="tel" value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder={t.phonePlaceholder} className="pl-9" autoComplete="tel" style={{ paddingLeft: "2.25rem", border: `1px solid ${hexRgba(NEON, 0.2)}` }} />
                </div>
              </InputRow>

              <div className="grid grid-cols-2 gap-3">
                <InputRow label={t.grade}>
                  <NeonSelect value={form.grade} onChange={e => setField("grade", e.target.value)}>
                    <option value="">{t.selectGrade}</option>
                    {[8,9,10,11,12].map((g,i) => <option key={g} value={g}>{t.grades[i]}</option>)}
                  </NeonSelect>
                </InputRow>
                <InputRow label={t.language}>
                  <NeonSelect value={form.language} onChange={e => handleLangChange(e.target.value as "en"|"af")}>
                    <option value="en">{t.english}</option>
                    <option value="af">{t.afrikaans}</option>
                  </NeonSelect>
                </InputRow>
              </div>

              <InputRow label={t.parentEmail}>
                <NeonInput type="email" value={form.parentEmail} onChange={e => setField("parentEmail", e.target.value)} placeholder="parent@email.com" autoComplete="email" />
                <p className="text-[10px] text-white leading-relaxed">{t.parentEmailHint}</p>
              </InputRow>

              <button
                disabled={!canSubmitDetails || joinMutation.isPending}
                onClick={() => joinMutation.mutate()}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: NEON, color: "#000" }}
              >
                {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                {t.next}
              </button>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <div className="flex flex-col gap-5 items-center text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: hexRgba(NEON, 0.1), border: `1px solid ${hexRgba(NEON, 0.25)}` }}>
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
                className="w-48 text-center text-3xl font-mono tracking-[0.4em] py-3 rounded-xl text-white bg-white/5 outline-none"
                style={{ border: `1px solid ${hexRgba(NEON, 0.25)}` }}
              />
              <button
                disabled={otp.length !== 6 || verifyMutation.isPending}
                onClick={() => verifyMutation.mutate()}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: NEON, color: "#000" }}
              >
                {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {t.verify}
              </button>
              <button onClick={() => { setStep("details"); setOtp(""); }} className="flex items-center gap-1.5 text-xs text-white hover:text-white transition-colors">
                <RotateCcw className="w-3 h-3" />
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
            <a href="/api/login" className="underline" style={{ color: hexRgba(NEON, 0.8) }}>{t.signIn}</a>
          </p>
        )}

        {/* School code pill */}
        <p className="text-center text-[10px] font-mono text-white">{school.schoolCode}</p>
      </div>
    </div>
  );
}
