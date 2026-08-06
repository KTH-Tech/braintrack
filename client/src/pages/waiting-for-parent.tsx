import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, CheckCircle2, CreditCard, Send, RefreshCw, MessageCircle, Copy, Check, Link2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { ConfettiBurst } from "@/components/confetti-burst";
import { buildParentConsentWhatsAppLink } from "@/lib/parent-share";

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

/** Privacy-friendly display of the parent's email on a minor's screen:
    "k****e@g***.com". The raw address never renders; resend still uses the
    stored address server-side. */
function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "•••";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  const domName = dot > 0 ? domain.slice(0, dot) : domain;
  const tld = dot > 0 ? domain.slice(dot) : "";
  const maskedLocal =
    local.length <= 2
      ? `${local[0]}•`
      : `${local[0]}${"•".repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}`;
  const maskedDomain = `${domName[0] ?? ""}${"•".repeat(Math.min(Math.max(domName.length - 1, 1), 4))}${tld}`;
  return `${maskedLocal}@${maskedDomain}`;
}

const T = {
  en: {
    eyebrow: "almost in! 🚀",
    heading: "waiting for your parent 💌",
    sub: "Send your parent or guardian the approval link on WhatsApp below. Once they approve and add a card, your 14-day free trial unlocks automatically — no charge for 14 days.",
    sentTo: "Consent link is for",
    stepConsent: "Parent approves",
    stepCard: "Card added (R1 verification)",
    stepTrial: "Your 14-day trial starts",
    resend: "Resend the email too (optional)",
    resending: "Sending…",
    resent: "Email sent!",
    resentDesc: "We've re-sent the consent request.",
    resendFailed: "Couldn't send",
    resendFailedDesc: "Please check the email address and try again.",
    changeEmail: "Use a different email",
    emailPlaceholder: "parent@email.com",
    shareHeading: "Send the consent link to your parent 📲",
    shareNote: "The email can take a while to arrive (or land in spam). The fastest way in is to send your parent the link yourself on WhatsApp — one tap and they approve.",
    shareLinkLabel: "Your parent's approval link",
    shareWhatsApp: "Send on WhatsApp",
    shareCopy: "Copy link",
    shareCopied: "Copied!",
    shareCopyFailed: "Couldn't copy automatically — tap the link above to select it.",
    getLink: "Get the link",
    gettingLink: "Getting link…",
    shareEmailPrompt: "Your parent/guardian's email",
    shareGetLinkFailed: "Couldn't get the link",
    shareGetLinkFailedDesc: "Please check the email address and try again.",
    checking: "checking with the parentals…",
    allDone: "you're in! 🔥",
    allDoneSub: "Consent + card confirmed. Your trial is live.",
    goDashboard: "Go to my dashboard",
    signout: "Sign out",
  },
  af: {
    eyebrow: "amper binne! 🚀",
    heading: "ons wag vir jou ouer 💌",
    sub: "Stuur die goedkeuringskakel hieronder op WhatsApp aan jou ouer of voog. Sodra hulle goedkeur en 'n kaart byvoeg, ontsluit jou 14-dae gratis proeftydperk outomaties — geen koste vir 14 dae nie.",
    sentTo: "Toestemmingskakel is vir",
    stepConsent: "Ouer keur goed",
    stepCard: "Kaart bygevoeg (R1-verifikasie)",
    stepTrial: "Jou 14-dae proeftydperk begin",
    resend: "Stuur die e-pos ook weer (opsioneel)",
    resending: "Stuur…",
    resent: "E-pos gestuur!",
    resentDesc: "Ons het die toestemmingsversoek weer gestuur.",
    resendFailed: "Kon nie stuur nie",
    resendFailedDesc: "Gaan asseblief die e-posadres na en probeer weer.",
    changeEmail: "Gebruik 'n ander e-pos",
    emailPlaceholder: "ouer@voorbeeld.com",
    shareHeading: "Stuur die toestemmingskakel aan jou ouer 📲",
    shareNote: "Die e-pos kan 'n rukkie neem om aan te kom (of in gemorspos beland). Die vinnigste manier is om self die skakel op WhatsApp aan jou ouer te stuur — een tik en hulle keur goed.",
    shareLinkLabel: "Jou ouer se goedkeuringskakel",
    shareWhatsApp: "Stuur op WhatsApp",
    shareCopy: "Kopieer skakel",
    shareCopied: "Gekopieer!",
    shareCopyFailed: "Kon nie outomaties kopieer nie — tik die skakel hierbo om dit te merk.",
    getLink: "Kry die skakel",
    gettingLink: "Kry skakel…",
    shareEmailPrompt: "Jou ouer/voog se e-pos",
    shareGetLinkFailed: "Kon nie die skakel kry nie",
    shareGetLinkFailedDesc: "Gaan asseblief die e-posadres na en probeer weer.",
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
  // Fires the exam-completion sparkle ONCE if we arrived here fresh from
  // onboarding (?welcome=1). We strip the flag off the URL immediately so a
  // refresh, a poll bounce, or a back-and-forward doesn't re-celebrate the
  // same moment. Reload-safe: sessionStorage would also work but the URL
  // param is naturally scoped to this navigation.
  const [showWelcome] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("welcome") === "1";
  });
  useEffect(() => {
    if (!showWelcome || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    window.history.replaceState({}, "", url.toString());
  }, [showWelcome]);

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

  // ── Manual-share fallback ────────────────────────────────────────────────
  // The consent email depends on an authenticated SendGrid sender that isn't
  // reliably delivering, so a minor can get stranded here forever. This block
  // lets the LEARNER be the courier: we call the same request endpoint (which
  // re-mints and RETURNS the consent link) and surface it as a one-tap WhatsApp
  // share + copy button. No working email required.
  const [consentUrl, setConsentUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [shareEmail, setShareEmail] = useState("");

  const linkMutation = useMutation({
    mutationFn: async (email: string) => {
      const r = await apiRequest("POST", "/api/onboarding/parent-consent/request", {
        parentEmail: email,
        language,
      });
      return (await r.json()) as { ok: boolean; url: string; delivery: string };
    },
    onSuccess: (data) => {
      setConsentUrl(data.url);
      setLinkCopied(false);
      setCopyFailed(false);
    },
    onError: () => {
      toast({ title: t.shareGetLinkFailed, description: t.shareGetLinkFailedDesc, variant: "destructive" });
    },
  });

  // Auto-mint the link on load when we already hold a parent address and
  // consent isn't granted yet — so the share buttons are ready immediately.
  const consentAlreadyGranted = Boolean(consentStatus?.granted);
  const parentEmailOnFile = consentStatus?.parentEmail ?? null;
  useEffect(() => {
    if (!isAuthenticated || consentAlreadyGranted) return;
    if (parentEmailOnFile && !consentUrl && !linkMutation.isPending) {
      linkMutation.mutate(parentEmailOnFile);
    }
    // linkMutation identity is stable; excluded to avoid re-fire loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, consentAlreadyGranted, parentEmailOnFile, consentUrl]);

  const handleCopyShareLink = async () => {
    if (!consentUrl) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(consentUrl);
      setCopyFailed(false);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      setLinkCopied(false);
      setCopyFailed(true);
    }
  };

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
      {showWelcome && <ConfettiBurst />}
      <GraffitiSplats variant="full" opacity={0.4} />
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-3xl border border-white/10 overflow-hidden"
          style={{ background: "#050508", animation: "bt-fadeup .6s cubic-bezier(.22,1,.36,1) both" }}
        >
          <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
          <div className="p-8 text-center space-y-5">
            <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFE29A", fontSize: 16, transform: "rotate(-2deg)" }}>
              {done ? t.allDone : t.eyebrow}
            </div>

            {done ? (
              <>
                <CheckCircle2 className="w-14 h-14 mx-auto" style={{ color: "#94F7C5" }} />
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
                  }}
                >
                  {t.goDashboard}
                </button>
              </>
            ) : (
              <>
                <MessageCircle className="w-14 h-14 mx-auto" style={{ color: "#94F7C5", animation: "bt-float 3s ease-in-out infinite" }} />
                <h1 className="text-2xl font-black leading-tight" style={{ fontFamily: "'Poppins',sans-serif" }} data-testid="waiting-heading">
                  {t.heading}
                </h1>
                <p className="text-sm text-white leading-relaxed">{t.sub}</p>

                {parentEmail && (
                  <p className="text-xs text-white">
                    {t.sentTo}{" "}
                    <span className="font-bold" style={{ color: "#9FD8FF" }} data-testid="waiting-parent-email">{maskEmail(parentEmail)}</span>
                  </p>
                )}

                {/* ── Manual share: the learner is the courier ──────────────
                    Primary path when email can't be relied on. Surfaces the
                    consent link with a one-tap WhatsApp share + copy. */}
                <div
                  className="text-left rounded-2xl p-4 space-y-3"
                  style={{ background: "rgba(255,255,255,.04)", border: "1.5px solid #94F7C5" }}
                  data-testid="consent-share-block"
                >
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, color: "#fff", fontSize: 15 }}>
                    {t.shareHeading}
                  </p>
                  <p className="text-[13px] text-white leading-relaxed">{t.shareNote}</p>

                  {consentUrl ? (
                    <>
                      <div
                        className="rounded-xl p-3"
                        style={{ background: "rgba(0,0,0,.45)", border: "1px solid rgba(255,255,255,.14)" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#94F7C5" }}>
                          {t.shareLinkLabel}
                        </p>
                        <p className="text-[12px] break-all text-white select-all mt-1 leading-relaxed" data-testid="consent-link-url">
                          {consentUrl}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={buildParentConsentWhatsAppLink(consentUrl, language)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2"
                          data-testid="consent-share-whatsapp"
                          style={{
                            fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
                            color: "#062012", background: "#25D366", textDecoration: "none",
                            borderRadius: 12, padding: "13px 20px",
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                          {t.shareWhatsApp}
                        </a>
                        <button
                          onClick={handleCopyShareLink}
                          className="w-full inline-flex items-center justify-center gap-2"
                          data-testid="consent-copy-link"
                          style={{
                            fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
                            color: linkCopied ? "#94F7C5" : "#fff", background: "transparent",
                            border: `2px solid ${linkCopied ? "#94F7C5" : "rgba(255,255,255,.25)"}`,
                            borderRadius: 12, padding: "11px 20px", cursor: "pointer",
                          }}
                        >
                          {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {linkCopied ? t.shareCopied : t.shareCopy}
                        </button>
                      </div>
                      {copyFailed && (
                        <p role="status" className="text-[12px] font-semibold" style={{ color: "#FFE29A" }} data-testid="consent-copy-failed">
                          {t.shareCopyFailed}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {!parentEmailOnFile && (
                        <Input
                          type="email"
                          inputMode="email"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                          placeholder={t.shareEmailPrompt}
                          className="h-12 bg-background text-white"
                          data-testid="input-consent-share-email"
                        />
                      )}
                      <button
                        onClick={() => linkMutation.mutate(parentEmailOnFile || shareEmail.trim())}
                        disabled={linkMutation.isPending || (!parentEmailOnFile && !/.+@.+\..+/.test(shareEmail.trim()))}
                        className="w-full inline-flex items-center justify-center gap-2"
                        data-testid="consent-get-link"
                        style={{
                          fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
                          color: "#062012", background: "#94F7C5", border: "none",
                          borderRadius: 12, padding: "13px 20px",
                          cursor: linkMutation.isPending ? "not-allowed" : "pointer",
                          opacity: (linkMutation.isPending || (!parentEmailOnFile && !/.+@.+\..+/.test(shareEmail.trim()))) ? 0.6 : 1,
                        }}
                      >
                        {linkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                        {linkMutation.isPending ? t.gettingLink : t.getLink}
                      </button>
                    </>
                  )}
                </div>

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
                          ? { background: "#94F7C5", color: "#050508" }
                          : { border: "1.5px solid rgba(255,255,255,.25)", color: "rgba(255,255,255,.9)" }}
                      >
                        {step.complete ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[11px]">{i + 1}</span>}
                      </span>
                      <span style={{ color: "#fff" }}>{step.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-[15px]" style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FF5E8" }}>
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

                {/* Email is now only an optional backup — both actions are
                    demoted to small secondary links beneath the WhatsApp CTA. */}
                <div className="flex flex-col items-center gap-2 pt-1">
                  <button
                    onClick={() => resendMutation.mutate()}
                    disabled={resendDisabled}
                    className="inline-flex items-center gap-1.5 text-xs underline underline-offset-2"
                    data-testid="button-waiting-resend"
                    style={{
                      background: "none", border: "none", fontFamily: "'Poppins',sans-serif",
                      color: "#fff", cursor: resendDisabled ? "not-allowed" : "pointer",
                      opacity: resendDisabled ? 0.6 : 1,
                    }}
                  >
                    {resendMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#9FF5E8" }} /> : <Send className="w-3 h-3" style={{ color: "#9FF5E8" }} />}
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
                </div>
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
