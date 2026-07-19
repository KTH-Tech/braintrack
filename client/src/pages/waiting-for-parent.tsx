import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Mail, CheckCircle2, CreditCard, Send, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { GraffitiSplats } from "@/components/graffiti-splats";

// Gate screen for minor learners whose parent hasn't yet granted consent +
// captured a card. Polls subscription status; the moment consent + card land
// (which starts the 14-day trial server-side) the learner is sent through to
// the dashboard. Resending reuses the existing consent-email machinery
// (POST /api/onboarding/parent-consent/request).

interface ParentFlow {
  isMinor: boolean;
  consentRequested: boolean;
  consentGranted: boolean;
  cardCaptured: boolean;
  pending: boolean;
}

interface SubStatus {
  active: boolean;
  status: string | null;
  trialEndsAt: string | null;
  parentFlow: ParentFlow | null;
}

const T = {
  en: {
    eyebrow: "almost in! 🚀",
    heading: "waiting for your parent 💌",
    sub: "We've sent your parent/guardian an email. Once they approve and add a card, your 14-day free trial unlocks automatically — no charge for 14 days.",
    sentTo: "Consent request sent to",
    stepConsent: "Parent approves",
    stepCard: "Card added (R1 verification)",
    stepTrial: "Your 14-day trial starts",
    resend: "Resend email",
    resending: "Sending…",
    resent: "Email sent!",
    resentDesc: "We've re-sent the consent request.",
    resendFailed: "Couldn't send",
    resendFailedDesc: "Please check the email address and try again.",
    changeEmail: "Use a different email",
    emailPlaceholder: "parent@email.com",
    checking: "checking with the parentals…",
    allDone: "you're in! 🔥",
    allDoneSub: "Consent + card confirmed. Your trial is live.",
    goDashboard: "Go to my dashboard",
    signout: "Sign out",
  },
  af: {
    eyebrow: "amper binne! 🚀",
    heading: "ons wag vir jou ouer 💌",
    sub: "Ons het 'n e-pos aan jou ouer/voog gestuur. Sodra hulle goedkeur en 'n kaart byvoeg, ontsluit jou 14-dae gratis proeftydperk outomaties — geen koste vir 14 dae nie.",
    sentTo: "Toestemmingsversoek gestuur aan",
    stepConsent: "Ouer keur goed",
    stepCard: "Kaart bygevoeg (R1-verifikasie)",
    stepTrial: "Jou 14-dae proeftydperk begin",
    resend: "Stuur e-pos weer",
    resending: "Stuur…",
    resent: "E-pos gestuur!",
    resentDesc: "Ons het die toestemmingsversoek weer gestuur.",
    resendFailed: "Kon nie stuur nie",
    resendFailedDesc: "Gaan asseblief die e-posadres na en probeer weer.",
    changeEmail: "Gebruik 'n ander e-pos",
    emailPlaceholder: "ouer@voorbeeld.com",
    checking: "ons hoor by die ouers…",
    allDone: "jy's binne! 🔥",
    allDoneSub: "Toestemming + kaart bevestig. Jou proeftydperk is aktief.",
    goDashboard: "Gaan na my dashboard",
    signout: "Teken uit",
  },
} as const;

export default function WaitingForParentPage() {
  const { language } = useLanguage();
  const t = T[language];
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const { data: sub, isLoading: subLoading } = useQuery<SubStatus>({
    queryKey: ["/api/user/subscription-status"],
    enabled: isAuthenticated,
    refetchInterval: 15_000, // poll — flips to "done" when the parent finishes
  });

  const { data: consentStatus } = useQuery<{ granted: boolean; parentEmail: string | null }>({
    queryKey: ["/api/user/parent-consent-status"],
    enabled: isAuthenticated,
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const email = (showEmailInput && newEmail.trim()) || consentStatus?.parentEmail || "";
      const r = await apiRequest("POST", "/api/onboarding/parent-consent/request", {
        parentEmail: email,
        language,
      });
      return r;
    },
    onSuccess: () => {
      toast({ title: t.resent, description: t.resentDesc });
      setShowEmailInput(false);
    },
    onError: () => {
      toast({ title: t.resendFailed, description: t.resendFailedDesc, variant: "destructive" });
    },
  });

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050508" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#9FF5E8" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/signin";
    return null;
  }

  const done = Boolean(sub?.active) || (sub?.parentFlow ? !sub.parentFlow.pending && sub.parentFlow.consentGranted && sub.parentFlow.cardCaptured : false);
  const consentGranted = Boolean(sub?.parentFlow?.consentGranted);
  const cardCaptured = Boolean(sub?.parentFlow?.cardCaptured);
  const parentEmail = consentStatus?.parentEmail ?? null;
  const resendDisabled = resendMutation.isPending || (!parentEmail && !(showEmailInput && /.+@.+\..+/.test(newEmail.trim())));

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden" style={{ background: "#050508", color: "#fff" }} data-testid="waiting-for-parent-page">
      <GraffitiSplats variant="full" opacity={0.4} />
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-3xl border border-white/10 overflow-hidden"
          style={{ background: "#050508", boxShadow: "0 0 30px rgba(159,245,232,0.15)", animation: "bt-fadeup .6s cubic-bezier(.22,1,.36,1) both" }}
        >
          <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
          <div className="p-8 text-center space-y-5">
            <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFE29A", fontSize: 16, transform: "rotate(-2deg)" }}>
              {done ? t.allDone : t.eyebrow}
            </div>

            {done ? (
              <>
                <CheckCircle2 className="w-14 h-14 mx-auto" style={{ color: "#94F7C5", filter: "drop-shadow(0 0 18px rgba(148,247,197,.45))" }} />
                <h1 className="text-2xl font-black" style={{ fontFamily: "'Poppins',sans-serif" }} data-testid="waiting-done-heading">
                  {t.allDoneSub}
                </h1>
                <button
                  onClick={() => { window.location.href = "/dashboard"; }}
                  className="w-full"
                  data-testid="button-waiting-dashboard"
                  style={{
                    fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
                    color: "#050508", background: "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)",
                    backgroundSize: "200% 100%", animation: "bt-rainbow 5s linear infinite",
                    border: "none", borderRadius: 12, padding: "15px 24px", cursor: "pointer",
                    boxShadow: "0 0 26px rgba(255,183,229,.4)",
                  }}
                >
                  {t.goDashboard}
                </button>
              </>
            ) : (
              <>
                <Mail className="w-14 h-14 mx-auto" style={{ color: "#FFB7E5", filter: "drop-shadow(0 0 16px rgba(255,183,229,.4))", animation: "bt-float 3s ease-in-out infinite" }} />
                <h1 className="text-2xl font-black leading-tight" style={{ fontFamily: "'Poppins',sans-serif" }} data-testid="waiting-heading">
                  {t.heading}
                </h1>
                <p className="text-sm text-white leading-relaxed">{t.sub}</p>

                {parentEmail && (
                  <p className="text-xs text-white">
                    {t.sentTo}{" "}
                    <span className="font-bold" style={{ color: "#9FD8FF" }} data-testid="waiting-parent-email">{parentEmail}</span>
                  </p>
                )}

                {/* Step checklist */}
                <div className="text-left space-y-3 rounded-2xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,.03)" }}>
                  {[
                    { label: t.stepConsent, complete: consentGranted, icon: <CheckCircle2 className="w-4 h-4" /> },
                    { label: t.stepCard, complete: cardCaptured, icon: <CreditCard className="w-4 h-4" /> },
                    { label: t.stepTrial, complete: done, icon: <CheckCircle2 className="w-4 h-4" /> },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-semibold">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-none"
                        style={step.complete
                          ? { background: "#94F7C5", color: "#050508", boxShadow: "0 0 12px rgba(148,247,197,.5)" }
                          : { border: "1.5px solid rgba(255,255,255,.25)", color: "rgba(255,255,255,.9)" }}
                      >
                        {step.complete ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[11px]">{i + 1}</span>}
                      </span>
                      <span style={{ color: "#fff" }}>{step.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs" style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8" }}>
                  <Loader2 className="w-3.5 h-3.5" style={{ animation: "bt-spin 1.4s linear infinite" }} />
                  {t.checking}
                </div>

                {showEmailInput && (
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="h-12 bg-background text-white"
                    data-testid="input-waiting-parent-email"
                  />
                )}

                <button
                  onClick={() => resendMutation.mutate()}
                  disabled={resendDisabled}
                  className="w-full inline-flex items-center justify-center gap-2"
                  data-testid="button-waiting-resend"
                  style={{
                    fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
                    color: "#fff", background: "transparent",
                    border: "2px solid rgba(255,255,255,.25)", borderRadius: 12,
                    padding: "13px 24px", cursor: resendDisabled ? "not-allowed" : "pointer",
                    opacity: resendDisabled ? 0.6 : 1,
                  }}
                >
                  {resendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {resendMutation.isPending ? t.resending : t.resend}
                </button>

                <button
                  onClick={() => setShowEmailInput((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs underline underline-offset-2"
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}
                  data-testid="button-waiting-change-email"
                >
                  <RefreshCw className="w-3 h-3" style={{ color: "#9FF5E8" }} />
                  {t.changeEmail}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Kill-switch exemption: keyframes referenced by inline styles containing "bt-" */}
      <style>{`
        @keyframes bt-fadeup { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bt-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes bt-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
