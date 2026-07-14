import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Phone,
  Send,
  RefreshCw,
  CreditCard,
  Landmark,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type PageState =
  | "plan"
  | "loading"
  | "success"
  | "payment_success"
  | "not_configured"
  | "trial_used"
  | "payment_cancelled";

type BillingMethod = "debicheck" | "card" | "trial" | "lapsed" | "admin_override" | string;

interface SmsResult {
  sent: boolean;
  to: string;
  jti: string | null;
  error: string | null;
  message: string | null;
}

export default function SubscribePage() {
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isAf = language === "af";

  const [pageState, setPageState] = useState<PageState>("plan");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parentCell, setParentCell] = useState("");
  const [learnerCell, setLearnerCell] = useState("");
  const [smsResult, setSmsResult] = useState<SmsResult | null>(null);
  const [paymentBillingMethod, setPaymentBillingMethod] = useState<BillingMethod | null>(null);

  const netcashReturnRef = useRef<string | null>(
    new URLSearchParams(window.location.search).get("netcash") ??
    new URLSearchParams(window.location.search).get("payfast")
  );
  // Task #771 — push notification CTA lands at /subscribe#resend. We treat the
  // hash as authoritative: jump straight to the SuccessScreen so the parent
  // can resend the WhatsApp link without being bounced to /dashboard by the
  // "already subscribed" guard.
  const resendHashRef = useRef<boolean>(
    typeof window !== "undefined" && window.location.hash.toLowerCase() === "#resend",
  );

  useSEO({
    title: isAf
      ? "Brain Boost — 14-dae gratis proeftydperk | BrainTrack"
      : "Brain Boost — 14-day free trial | BrainTrack",
    description: isAf
      ? "Begin jou 14-dae gratis proeftydperk. R169/maand daarna. Volle toegang tot NSC-vraestelle, KI-tutor, vordering-nasporing en meer."
      : "Start your 14-day free trial. R169/month thereafter. Full access to NSC past papers, AI tutor, progress tracking and more.",
    canonical: "https://braintrack.app/subscribe",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nc = params.get("netcash");
    // Netcash success returns the lapsed/converting user — show a payment
    // confirmation (PaymentSuccessScreen), not the trial WhatsApp-resend
    // success screen. Until the subscription query resolves, show a loader.
    if (nc === "success") setPageState("loading");
    if (nc === "cancel") setPageState("payment_cancelled");
    const pf = params.get("payfast");
    if (pf === "success") setPageState("loading");
    if (pf === "cancel") setPageState("payment_cancelled");
    // Task #771 — opening #resend from a push notification jumps straight to
    // the success screen so the parent can hit "Resend WhatsApp link".
    if (resendHashRef.current) setPageState("success");
  }, []);

  useQuery({
    queryKey: ["/api/user/subscription", isAuthenticated],
    queryFn: async () => {
      const res = await fetch("/api/user/subscription", { credentials: "include" });
      if (!res.ok) {
        if (!netcashReturnRef.current) setPageState("plan");
        return null;
      }
      const data = await res.json();
      // When returning from Netcash with ?netcash=success we want to confirm
      // the payment landed (status=active, billingMethod != trial) and show
      // the PaymentSuccessScreen. While the webhook is still in flight the
      // sub may briefly read as trial — fall back to the generic success
      // screen in that case so the parent still sees a positive confirmation.
      if (netcashReturnRef.current === "success") {
        const method: BillingMethod | null = data?.billingMethod ?? null;
        if (data?.status === "active" && method && method !== "trial" && method !== "lapsed") {
          setPaymentBillingMethod(method);
          setPageState("payment_success");
        } else {
          setPageState("success");
        }
        return data;
      }
      // Other Netcash return states (e.g. cancel) — URL-param state is
      // authoritative; do not let the subscription query override it.
      if (netcashReturnRef.current) return data;
      // Task #771 — same for the #resend hash from a delivery-failure push:
      // the parent is here specifically to resend, so don't auto-redirect to
      // /dashboard even if they're already on an active subscription.
      if (resendHashRef.current) return data;
      if (data && (data.status === "active" || data.status === "trial")) {
        toast({
          title: isAf ? "Jy is al ingeteken!" : "You're already subscribed!",
          description: isAf
            ? "Brain Boost is al aktief op jou rekening."
            : "Brain Boost is already active on your account.",
        });
        navigate("/dashboard");
      } else if (data && (data.status === "lapsed" || data.status === "expired")) {
        setPageState("trial_used");
      } else {
        setPageState("plan");
      }
      return data;
    },
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
  });

  async function handleStartTrial() {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    const pCell = parentCell.trim();
    const lCell = learnerCell.trim();
    if (!pCell || !lCell) {
      setErrorMsg(isAf
        ? "Verskaf asseblief beide selfoonnommers."
        : "Please provide both cell phone numbers.");
      return;
    }
    setPageState("loading");
    setErrorMsg(null);
    try {
      const res = await apiRequest("POST", "/api/subscribe/start-trial", {
        plan: "brain_boost",
        parentCell: pCell,
        learnerCell: lCell,
        parentApproval: true,
        language: isAf ? "af" : "en",
      });
      const data = await res.json() as {
        trialStarted?: boolean;
        alreadyActive?: boolean;
        error?: string;
        message?: string;
        sms?: SmsResult;
      };
      if (data.alreadyActive || data.trialStarted) {
        if (data.sms) setSmsResult(data.sms);
        setPageState("success");
        return;
      }
      if (data.error === "trial_already_used") {
        setPageState("trial_used");
        return;
      }
      setPageState("plan");
      setErrorMsg(data.message ?? (isAf ? "Kon nie proeftydperk begin nie." : "Could not start trial. Please try again."));
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const status = parseInt(msg.split(":")[0] ?? "", 10);
      if (status === 409) {
        setPageState("trial_used");
      } else if (status === 503) {
        setPageState("not_configured");
      } else {
        setPageState("plan");
        setErrorMsg(isAf ? "Iets het fout gegaan. Probeer asseblief weer." : "Something went wrong. Please try again.");
      }
    }
  }

  const homeHref = isAuthenticated ? "/dashboard" : "/";

  if (pageState === "payment_success") {
    return (
      <PaymentSuccessScreen
        isAf={isAf}
        navigate={navigate}
        billingMethod={paymentBillingMethod}
      />
    );
  }

  if (pageState === "success") {
    return (
      <SuccessScreen
        isAf={isAf}
        homeHref={homeHref}
        isAuthenticated={isAuthenticated}
        navigate={navigate}
        initialSmsResult={smsResult}
        initialLearnerCell={learnerCell}
        language={isAf ? "af" : "en"}
      />
    );
  }

  if (pageState === "not_configured") {
    return <NotConfiguredScreen isAf={isAf} homeHref={homeHref} />;
  }

  if (pageState === "trial_used") {
    return (
      <PaymentPickerScreen
        isAf={isAf}
        homeHref={homeHref}
        onSuccess={() => setPageState("success")}
      />
    );
  }

  if (pageState === "payment_cancelled") {
    return (
      <PaymentPickerScreen
        isAf={isAf}
        homeHref={homeHref}
        onSuccess={() => setPageState("success")}
        showCancelledBanner
      />
    );
  }

  if (pageState === "loading" || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="prismglass-panel max-w-lg w-full px-6 py-10 sm:px-10 sm:py-12" data-testid="subscribe-plan-panel">

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/30 mb-5">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3" data-testid="subscribe-heading">
            {isAf ? "Brain Boost: 14-dae Gratis Proef" : "Brain Boost: 14-day Free Trial"}
          </h1>
          <p className="text-white text-lg">
            {isAf
              ? "Kry volle toegang tot alle kenmerke. R169/maand daarna. Kanselleer enige tyd."
              : "Get full access to all features. R169/month thereafter. Cancel anytime."}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive-foreground">{errorMsg}</p>
          </div>
        )}

        <div className="space-y-6 mb-10">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white ml-1">
              {isAf ? "Ouer se selfoonnommer" : "Parent's cell phone number"}
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <Input
                type="tel"
                placeholder="082 123 4567"
                className="pl-12 bg-white/5 border-white/10 h-12 text-lg"
                value={parentCell}
                onChange={(e) => setParentCell(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white ml-1">
              {isAf ? "Leerder se selfoonnommer" : "Learner's cell phone number"}
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <Input
                type="tel"
                placeholder="071 234 5678"
                className="pl-12 bg-white/5 border-white/10 h-12 text-lg"
                value={learnerCell}
                onChange={(e) => setLearnerCell(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartTrial}
          className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          data-testid="button-subscribe-cta"
        >
          {isAf ? "Begin Gratis Proef" : "Start Free Trial"}
        </Button>

        <p className="text-center text-white text-xs mt-6 px-4 leading-relaxed">
          {isAf
            ? "Deur voort te gaan, stem jy in tot ons Diensvoorwaardes en Privaatheidsbeleid. Ons sal vir jou 'n herinnering stuur voor jou proeftydperk verval."
            : "By continuing, you agree to our Terms of Service and Privacy Policy. We'll send you a reminder before your trial expires."}
        </p>

        <button
          onClick={() => navigate(homeHref)}
          className="w-full mt-8 flex items-center justify-center gap-2 text-white hover:text-foreground transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAf ? "Terug na tuisblad" : "Back to home"}
        </button>
      </div>
    </div>
  );
}

function PaymentPickerScreen({
  isAf,
  homeHref,
  onSuccess,
  showCancelledBanner = false,
}: {
  isAf: boolean;
  homeHref: string;
  onSuccess: () => void;
  showCancelledBanner?: boolean;
}) {
  const [loadingMethod, setLoadingMethod] = useState<"debicheck" | "card" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = {
    headline: isAf ? "Kies jou betaalmetode" : "Choose your payment method",
    subheadline: isAf
      ? "Jou gratis proeftydperk het verval. Aktiveer Brain Boost om volle toegang te behou."
      : "Your free trial has ended. Activate Brain Boost to keep full access.",
    charge: isAf ? "Wat word gehef" : "What you'll be charged",
    chargeDetail: isAf
      ? "R169/maand · Kanselleer enige tyd · Geen verborgde fooie nie"
      : "R169/month · Cancel anytime · No hidden fees",
    debicheck: isAf ? "DebiCheck Debietorder" : "DebiCheck Debit Order",
    debicheckDesc: isAf
      ? "Jou bank verwerk 'n gemagtigde debietorder elke maand. Geen kaartbesonderhede nodig nie."
      : "Your bank processes an authorised debit order each month. No card details required.",
    debicheckBadge: isAf ? "Aanbeveel" : "Recommended",
    card: isAf ? "Herhalende Kaartbetaling" : "Recurring Card Payment",
    cardDesc: isAf
      ? "Jou kaartbesonderhede word veilig gestoor deur Netcash vir maandelikse aftrekkings."
      : "Your card details are securely stored by Netcash for monthly deductions.",
    initiate: isAf ? "Kies {method}" : "Choose {method}",
    loading: isAf ? "Verwerk..." : "Processing...",
    cancelledTitle: isAf ? "Betaling gekanselleer" : "Payment cancelled",
    cancelledDesc: isAf
      ? "Jy het die Netcash-betaalblad verlaat. Jou intekening is nie geaktiveer nie — kies 'n metode hieronder om te probeer."
      : "You left the Netcash payment page. Your subscription was not activated — choose a method below to try again.",
    notConfigured: isAf
      ? "Betaling is tans nie beskikbaar nie. Herhalende fakturering is nog nie geaktiveer op hierdie omgewing nie — probeer asseblief later weer."
      : "Payment not available. Recurring billing isn't active on this environment yet — please try again shortly.",
    back: isAf ? "Terug" : "Back",
    secure: isAf
      ? "Veilige betaling verwerk deur Netcash. Jy sal na Netcash se betalingsblad herlei word."
      : "Secure payment processed by Netcash. You will be redirected to the Netcash payment page.",
  };

  async function handleMethodSelect(method: "debicheck" | "card") {
    setLoadingMethod(method);
    setErrorMsg(null);
    try {
      const endpoint =
        method === "debicheck"
          ? "/api/subscribe/netcash/debicheck/init"
          : "/api/subscribe/netcash/card/init";
      const res = await apiRequest("POST", endpoint, { plan: "brain-boost" });
      const data = await res.json() as {
        redirectUrl?: string;
        alreadyActive?: boolean;
        error?: string;
        message?: string;
      };
      if (data.alreadyActive) {
        onSuccess();
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl; // ACCEPTED RISK: server-returned Netcash payment gateway URL, not user-controlled // nosemgrep: no-raw-window-location-href-variable
        return;
      }
      setErrorMsg(
        data.message ??
        (isAf ? "Kon nie die betaalsessie begin nie. Probeer weer." : "Could not start the payment session. Please try again.")
      );
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const status = parseInt(msg.split(":")[0] ?? "", 10);
      if (status === 503) {
        setErrorMsg(t.notConfigured);
      } else {
        setErrorMsg(
          isAf
            ? "Iets het fout gegaan. Probeer asseblief weer."
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoadingMethod(null);
    }
  }

  const anyLoading = loadingMethod !== null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="prismglass-panel max-w-lg w-full px-6 py-10 sm:px-10 sm:py-12">

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/30 mb-5">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-3">{t.headline}</h1>
          <p className="text-white">{t.subheadline}</p>
        </div>

        {/* Cancelled banner */}
        {showCancelledBanner && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-0.5">{t.cancelledTitle}</p>
              <p className="text-xs text-amber-200/70">{t.cancelledDesc}</p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {errorMsg && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive-foreground">{errorMsg}</p>
          </div>
        )}

        {/* Charge summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wide">{t.charge}</p>
            <p className="text-sm text-foreground">{t.chargeDetail}</p>
          </div>
        </div>

        {/* Method cards */}
        <div className="space-y-4 mb-8">

          {/* DebiCheck */}
          <button
            onClick={() => handleMethodSelect("debicheck")}
            disabled={anyLoading}
            className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all p-5 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                {loadingMethod === "debicheck" ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Landmark className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground">{t.debicheck}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {t.debicheckBadge}
                  </span>
                </div>
                <p className="text-sm text-white leading-relaxed">{t.debicheckDesc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            </div>
          </button>

          {/* Card */}
          <button
            onClick={() => handleMethodSelect("card")}
            disabled={anyLoading}
            className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all p-5 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                {loadingMethod === "card" ? (
                  <Loader2 className="w-5 h-5 text-foreground animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5 text-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-foreground block mb-1">{t.card}</span>
                <p className="text-sm text-white leading-relaxed">{t.cardDesc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            </div>
          </button>
        </div>

        <p className="text-center text-white text-xs px-4 leading-relaxed mb-8">
          {t.secure}
        </p>

        <button
          onClick={() => (window.location.href = homeHref)} // nosemgrep: no-raw-window-location-href-variable
          className="w-full flex items-center justify-center gap-2 text-white hover:text-foreground transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </button>
      </div>
    </div>
  );
}

const TERMINAL_DELIVERY_STATUSES = new Set(["delivered", "failed", "undelivered", "opened"]);
const DELIVERY_POLL_INTERVAL_MS = 3000;
const DELIVERY_POLL_TIMEOUT_MS = 120_000;

function SuccessScreen({
  isAf,
  homeHref,
  isAuthenticated,
  navigate,
  initialSmsResult,
  initialLearnerCell,
  language,
}: {
  isAf: boolean;
  homeHref: string;
  isAuthenticated: boolean;
  navigate: any;
  initialSmsResult: SmsResult | null;
  initialLearnerCell: string;
  language: "en" | "af";
}) {
  const [smsResult, setSmsResult] = useState<SmsResult | null>(initialSmsResult);
  const [editCell, setEditCell] = useState(initialLearnerCell ?? "");
  const [showCellInput, setShowCellInput] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const pollStopRef = useRef(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearPolling() {
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    if (pollTimeoutRef.current) { clearTimeout(pollTimeoutRef.current); pollTimeoutRef.current = null; }
  }

  function startPolling() {
    clearPolling();
    pollStopRef.current = false;

    async function poll() {
      if (pollStopRef.current) return;
      try {
        const res = await apiRequest("GET", "/api/subscribe/onboarding-link-status");
        const data = await res.json() as {
          found?: boolean;
          deliveryStatus?: string | null;
          usedAt?: string | null;
        };
        if (pollStopRef.current) return;
        const status = data.usedAt ? "opened" : (data.deliveryStatus ?? null);
        if (status) setDeliveryStatus(status);
        if (status && TERMINAL_DELIVERY_STATUSES.has(status)) {
          pollStopRef.current = true;
          clearPolling();
          if (status === "failed" || status === "undelivered") {
            setSmsResult((prev) => prev ? { ...prev, sent: false } : prev);
          }
        }
      } catch {
        // silent — keep polling
      }
    }

    poll();
    pollIntervalRef.current = setInterval(poll, DELIVERY_POLL_INTERVAL_MS);
    pollTimeoutRef.current = setTimeout(() => {
      pollStopRef.current = true;
      clearPolling();
    }, DELIVERY_POLL_TIMEOUT_MS);
  }

  useEffect(() => {
    if (smsResult?.sent) {
      setDeliveryStatus(null);
      startPolling();
    }
    return () => { pollStopRef.current = true; clearPolling(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smsResult?.sent, smsResult?.jti]);

  useEffect(() => {
    if (cooldownSecs <= 0) return;
    const timer = setInterval(() => {
      setCooldownSecs((s) => {
        if (s <= 1) { clearInterval(timer); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSecs]);

  async function handleResend() {
    setResendLoading(true);
    setResendStatus("idle");
    setResendMsg(null);
    try {
      const body: Record<string, string> = { language };
      const trimmed = editCell.trim();
      if (trimmed) body.learnerCell = trimmed;
      const res = await apiRequest("POST", "/api/subscribe/resend-onboarding-link", body);
      const data = await res.json() as {
        sent?: boolean;
        to?: string;
        jti?: string | null;
        error?: string | null;
        message?: string | null;
        cooldownSeconds?: number;
      };
      if (data.sent) {
        setSmsResult({
          sent: true,
          to: data.to ?? trimmed,
          jti: data.jti ?? null,
          error: null,
          message: null,
        });
        setResendStatus("success");
        setResendMsg(
          isAf
            ? `Skakel gestuur na ${data.to ?? trimmed}`
            : `Link sent to ${data.to ?? trimmed}`
        );
        if (data.cooldownSeconds && data.cooldownSeconds > 0) {
          setCooldownSecs(data.cooldownSeconds);
        }
        setShowCellInput(false);
      } else {
        setResendStatus("error");
        setResendMsg(
          data.message ??
          (isAf
            ? "Kon nie die skakel stuur nie. Kyk die nommer en probeer weer."
            : "Could not send the link. Check the number and try again.")
        );
      }
    } catch {
      setResendStatus("error");
      setResendMsg(
        isAf
          ? "Iets het fout gegaan. Probeer asseblief weer."
          : "Something went wrong. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  }

  const smsFailed = smsResult !== null && !smsResult.sent;
  const smsSent = smsResult !== null && smsResult.sent;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 text-center">
      <div className="prismglass-panel max-w-lg w-full px-8 py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-4">
          {isAf ? "Welkom by Brain Boost!" : "Welcome to Brain Boost!"}
        </h1>
        <p className="text-white text-lg mb-6">
          {isAf
            ? "Jou 14-dae gratis proeftydperk is nou aktief."
            : "Your 14-day free trial is now active."}
        </p>

        {/* SMS delivery status banner */}
        {smsFailed && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-0.5">
                {isAf ? "WhatsApp-skakel nie gestuur nie" : "WhatsApp link not sent"}
              </p>
              <p className="text-xs text-amber-200/70">
                {isAf
                  ? "Die aanmeldingskakels kon nie afgelewer word nie. Gebruik die knoppie hieronder om dit weer te probeer of die nommer reg te stel."
                  : "The sign-in link could not be delivered. Use the button below to retry or correct the number."}
              </p>
            </div>
          </div>
        )}

        {smsSent && !smsFailed && (
          <div className={`rounded-xl p-3 mb-6 flex items-center gap-2 text-left transition-colors ${
            deliveryStatus === "delivered" || deliveryStatus === "opened"
              ? "bg-green-500/10 border border-green-500/20"
              : "bg-white/5 border border-white/10"
          }`}>
            {deliveryStatus === "delivered" || deliveryStatus === "opened" ? (
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-white shrink-0 animate-spin" />
            )}
            <p className={`text-xs ${deliveryStatus === "delivered" || deliveryStatus === "opened" ? "text-green-300" : "text-white"}`}>
              {deliveryStatus === "delivered"
                ? (isAf ? `Skakel afgelewer aan ${smsResult.to}` : `Link delivered to ${smsResult.to}`)
                : deliveryStatus === "opened"
                ? (isAf ? `Leerder het die skakel oopgemaak` : `Learner opened the link`)
                : (isAf
                  ? `Aanmeldingskakel gestuur na ${smsResult.to} — kontroleer aflewering…`
                  : `Sign-in link sent to ${smsResult.to} — checking delivery…`)}
            </p>
          </div>
        )}

        {/* Inline resend feedback */}
        {resendStatus === "success" && resendMsg && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <p className="text-xs text-green-300">{resendMsg}</p>
          </div>
        )}
        {resendStatus === "error" && resendMsg && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4 flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive-foreground">{resendMsg}</p>
          </div>
        )}

        {/* Corrected cell input (shown on demand) */}
        {showCellInput && (
          <div className="mb-4 text-left">
            <label className="text-xs font-bold text-white ml-1 mb-1 block">
              {isAf ? "Leerder se selfoonnommer" : "Learner's cell number"}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
              <Input
                type="tel"
                placeholder="071 234 5678"
                className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                value={editCell}
                onChange={(e) => setEditCell(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Resend / correct number actions */}
        <div className={`flex gap-3 mb-8 ${smsFailed ? "flex-col" : "flex-row justify-center"}`}>
          {smsFailed ? (
            <>
              <Button
                onClick={handleResend}
                disabled={resendLoading || cooldownSecs > 0}
                className="w-full h-11 font-semibold bg-amber-500 hover:bg-amber-400 text-black"
              >
                {resendLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {cooldownSecs > 0
                  ? (isAf ? `Wag ${cooldownSecs}s...` : `Wait ${cooldownSecs}s...`)
                  : (isAf ? "Stuur skakel weer" : "Resend link")}
              </Button>
              <button
                onClick={() => setShowCellInput((v) => !v)}
                className="text-sm text-white hover:text-foreground transition-colors underline underline-offset-2"
              >
                {isAf ? "Nommer reg te stel" : "Correct the number"}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setShowCellInput((v) => !v);
                setResendStatus("idle");
                setResendMsg(null);
              }}
              disabled={resendLoading || cooldownSecs > 0}
              className="flex items-center gap-1.5 text-sm text-white hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {cooldownSecs > 0
                ? (isAf ? `Wag ${cooldownSecs}s...` : `Wait ${cooldownSecs}s...`)
                : (isAf ? "Stuur skakel weer" : "Resend link")}
            </button>
          )}
        </div>

        {/* Show resend button when cell input is visible and SMS was previously sent */}
        {showCellInput && smsSent && (
          <Button
            onClick={handleResend}
            disabled={resendLoading || cooldownSecs > 0}
            variant="outline"
            className="w-full h-10 text-sm mb-6"
          >
            {resendLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {cooldownSecs > 0
              ? (isAf ? `Wag ${cooldownSecs}s...` : `Wait ${cooldownSecs}s...`)
              : (isAf ? "Stuur skakel" : "Send link")}
          </Button>
        )}

        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full h-14 text-lg font-bold"
        >
          {isAf ? "Gaan na Dashboard" : "Go to Dashboard"}
        </Button>
      </div>
    </div>
  );
}

function PaymentSuccessScreen({
  isAf,
  navigate,
  billingMethod,
}: {
  isAf: boolean;
  navigate: any;
  billingMethod: BillingMethod | null;
}) {
  const isDebicheck = billingMethod === "debicheck";
  const methodLabel = isDebicheck
    ? (isAf ? "DebiCheck Debietorder" : "DebiCheck Debit Order")
    : (isAf ? "Herhalende Kaartbetaling" : "Recurring Card Payment");
  const methodDesc = isDebicheck
    ? (isAf
        ? "Jou bank sal R169 elke maand aftrek volgens jou gemagtigde debietorder."
        : "Your bank will debit R169 each month via your authorised debit order.")
    : (isAf
        ? "Jou kaart sal elke maand met R169 gehef word. Netcash stoor die kaart veilig vir jou."
        : "Your card will be charged R169 each month. Netcash securely stores the card for you.");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 text-center">
      <div className="prismglass-panel max-w-lg w-full px-8 py-12" data-testid="payment-success-panel">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-3xl font-black text-foreground mb-3" data-testid="payment-success-heading">
          {isAf ? "Betaling suksesvol" : "Payment successful"}
        </h1>
        <p className="text-white text-lg mb-8">
          {isAf
            ? "Brain Boost is nou aktief op jou rekening."
            : "Brain Boost is now active on your account."}
        </p>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 text-left">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              {isDebicheck ? (
                <Landmark className="w-5 h-5 text-primary" />
              ) : (
                <CreditCard className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-0.5">
                {isAf ? "Betaalmetode" : "Payment method"}
              </p>
              <p className="font-bold text-foreground" data-testid="payment-success-method">
                {methodLabel}
              </p>
            </div>
          </div>
          <p className="text-sm text-white leading-relaxed">
            {methodDesc}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 mb-8 flex items-center gap-3 text-left">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wide">
              {isAf ? "Maandeliks gehef" : "Billed monthly"}
            </p>
            <p className="text-sm text-foreground font-semibold">
              {isAf
                ? "R169/maand · Kanselleer enige tyd"
                : "R169/month · Cancel anytime"}
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full h-14 text-lg font-bold"
          data-testid="button-payment-success-dashboard"
        >
          {isAf ? "Gaan na Dashboard" : "Go to Dashboard"}
        </Button>
      </div>
    </div>
  );
}

function NotConfiguredScreen({ isAf, homeHref }: { isAf: boolean, homeHref: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 text-center">
      <div className="prismglass-panel max-w-lg w-full px-8 py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-4">
          {isAf ? "Betalings nie opgestel nie" : "Payments not configured"}
        </h1>
        <p className="text-white mb-10">
          {isAf
            ? "Ons kan nie tans nuwe proeftydperke verwerk nie. Probeer asseblief later weer."
            : "We cannot process new trials at this time. Please try again later."}
        </p>
        <Button variant="outline" asChild className="w-full h-12">
          <a href={homeHref}>{isAf ? "Terug" : "Back"}</a>
        </Button>
      </div>
    </div>
  );
}
