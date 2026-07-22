// BrainTrack subscribe — restyled to pixel-match the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, PRICING section).
// All signup/trial/billing logic, form state, API flows, redirects and
// data-testids are preserved — only the presentation changed.
// NOTE: billing runs via Netcash (the comp said "Paystack" — copy kept neutral).
import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
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
  ShieldCheck,
  Lock,
  Star,
  Clock,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import iconTransparent from "@/assets/handoff/icon-transparent.png";
import { ConfettiBurst } from "@/components/confetti-burst";
import { KthTechChip } from "@/components/brand/KthTechLogo";
import { PaymentIconsRow, PaystackBadge } from "@/components/brand/PaymentIcons";

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

// Journey branching — who is looking at /subscribe (task: subscription is a
// step of the journey, not a standalone page). Shape mirrors
// GET /api/user/subscription-status.
interface ParentViewInfo {
  learnerName: string | null;
  status: string | null;
  active: boolean;
  trialEndsAt: string | null;
  nextRenewalAt: string | null;
  cardCaptured: boolean;
  consentToken: string | null;
}

interface SubStatusResp {
  active: boolean;
  status: string | null;
  trialEndsAt: string | null;
  parentFlow: {
    isMinor: boolean;
    consentRequested: boolean;
    consentGranted: boolean;
    cardCaptured: boolean;
    pending: boolean;
  } | null;
  parentView?: ParentViewInfo | null;
}

/** Shape of GET /api/exam-countdown — real NSC 2026 dates baked into the API.
 *  Used here to render legitimate urgency ("prelims in N days") without
 *  fabricated scarcity or countdown timers. */
interface ExamCountdownResp {
  nextExam: "prelims" | "finals" | "done";
  preliminaryExams: { daysRemaining: number; label: string; labelAf: string };
  finalExams: { daysRemaining: number; label: string; labelAf: string };
  urgencyMessage: string;
  urgencyMessageAf: string;
}

const CTA_GRADIENT =
  "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const HEADLINE_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)";

// Scoped styles shared by every screen of this page.
const SCOPED_CSS = `
  .bts-input { background: rgba(5,5,8,.6) !important; border: 1.5px solid rgba(255,255,255,.18) !important; border-radius: 12px !important; color: #fff !important; }
  .bts-input:focus, .bts-input:focus-visible { border-color: #9FF5E8 !important; outline: none !important; box-shadow: none !important; }
  .bts-nav-link { color:#fff; cursor:pointer; transition:color .2s; }
  .bts-nav-link:hover { color:#9FF5E8; }
  .bts-nav-cta { transition: transform .2s; }
  .bts-nav-cta:hover { transform: translateY(-2px); }
  .bts-outline-btn { transition: border-color .2s, color .2s; }
  .bts-outline-btn:hover { border-color:#9FF5E8 !important; color:#9FF5E8 !important; }
  .bts-rainbow-btn { transition: transform .2s; }
  .bts-rainbow-btn:hover { transform: translateY(-2px); }
  .bts-method-btn { transition: border-color .2s, transform .2s; }
  .bts-method-btn:hover { border-color: var(--c) !important; transform: translateY(-2px); }
  .bts-logo-img { transition: transform .25s; }
  .bts-logo-img:hover { transform: scale(1.15) rotate(-4deg); }
  @media (max-width: 860px) {
    .bts-nav-links { display:none !important; }
    .bts-head { font-size: 36px !important; letter-spacing: -1px !important; }
    .bts-grid2 { grid-template-columns: 1fr !important; }
    .bts-guarantee-grid { grid-template-columns: 1fr !important; }
  }
`;

const RAINBOW_BTN_STYLE: React.CSSProperties = {
  fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
  color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
  animation: "bt-rainbow 5s linear infinite", border: "none",
  borderRadius: 12, padding: "15px 24px", cursor: "pointer",
};

const OUTLINE_BTN_STYLE: React.CSSProperties = {
  fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
  color: "#fff", background: "transparent",
  border: "2px solid rgba(255,255,255,.25)", borderRadius: 12,
  padding: "14px 24px", cursor: "pointer",
};

/** Centered dark screen for the flow states (success / payment / errors). */
function WallScreen({ children, testId }: { children: ReactNode; testId?: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", overflowX: "hidden" }}>
      <style>{SCOPED_CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 16px" }}>
        <div style={{ maxWidth: 520, width: "100%" }} data-testid={testId}>{children}</div>
      </div>
    </div>
  );
}

/** Accent callout — pastel left rule on a faint card. */
function WallCallout({ color, children, className = "" }: { color: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        borderLeft: `3px solid ${color}`, background: "rgba(255,255,255,.03)",
        borderRadius: "0 12px 12px 0", padding: "14px 18px", textAlign: "left",
      }}
    >
      {children}
    </div>
  );
}

export default function SubscribePage() {
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isAf = language === "af";
  const isParent = (user as any)?.role === "parent";

  const [pageState, setPageState] = useState<PageState>("plan");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Fires the exam-completion sparkle ONCE when the learner arrives fresh
  // from onboarding (?welcome=1). We strip the flag from the URL right
  // away so a refresh, a payment-callback bounce, or a back-and-forward
  // doesn't re-celebrate the same profile-creation moment.
  const [showWelcome] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("welcome") === "1";
  });
  useEffect(() => {
    if (!showWelcome || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    window.history.replaceState({}, "", url.toString());
  }, [showWelcome]);
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
    canonical: "https://braintrack.tech/subscribe",
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

  // Journey branching — role-aware view of /subscribe. Minor learners never
  // see a checkout (the parent gate owns activation → /waiting-for-parent);
  // parents subscribe FOR their linked learner; adult learners get the
  // self-serve checkout framed as the journey's final step.
  const {
    data: subStatus,
    isLoading: subStatusLoading,
    refetch: refetchSubStatus,
  } = useQuery<SubStatusResp>({
    queryKey: ["/api/user/subscription-status"],
    enabled: !authLoading && isAuthenticated,
  });

  // Real DBE-anchored exam countdown — powers the honest urgency line on the
  // hero ("prelims in N days"). Public endpoint, safe to fetch on any state.
  const { data: examCountdown } = useQuery<ExamCountdownResp>({
    queryKey: ["/api/exam-countdown"],
    staleTime: 5 * 60 * 1000,
  });
  const minorPending = Boolean(subStatus?.parentFlow?.pending);

  useEffect(() => {
    // Minors wait on the parent journey view — same 3-step machinery,
    // masked parent email, resend + change-email actions.
    if (minorPending) navigate("/waiting-for-parent");
  }, [minorPending, navigate]);

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
    // Parents never run the learner self-serve machinery — their branch reads
    // the linked learner's state from /api/user/subscription-status instead.
    enabled: !authLoading && isAuthenticated && !isParent,
    staleTime: 0,
  });

  async function handleStartTrial() {
    if (!isAuthenticated) {
      window.location.href = "/signin";
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
      if (data.error === "parent_consent_required") {
        // Minors can't self-activate — the parent gate owns trial activation.
        navigate("/waiting-for-parent");
        return;
      }
      setPageState("plan");
      setErrorMsg(data.message ?? (isAf ? "Kon nie proeftydperk begin nie." : "Could not start trial. Please try again."));
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const status = parseInt(msg.split(":")[0] ?? "", 10);
      if (status === 403) {
        // parent_consent_required — minors wait on the parent gate.
        navigate("/waiting-for-parent");
        return;
      }
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

  // ── Journey branching: who is looking at /subscribe? ──────────────
  // Block rendering for signed-in users until the role-aware status is known
  // so a minor never gets a flash of the checkout.
  if (isAuthenticated && (subStatusLoading || minorPending)) {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" style={{ width: 32, height: 32, color: "#9FF5E8" }} />
      </div>
    );
  }

  // Parent → subscribes FOR their linked learner (executive restraint view).
  if (isAuthenticated && isParent) {
    return (
      <ParentSubscribeScreen
        isAf={isAf}
        navigate={navigate}
        parentView={subStatus?.parentView ?? null}
        onRefetch={() => { refetchSubStatus(); }}
      />
    );
  }

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
      <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" style={{ width: 32, height: 32, color: "#9FF5E8" }} />
      </div>
    );
  }

  const trialPerks = isAf
    ? [
        "KABV-belynde studieplan, elke dag herbou",
        "10 jaar se NSS-vraestelle met memo's",
        "Dadelike nasien & swakpunt-opsporing",
        "Rizz slim ondersteuning in EN/AF",
        "Spel-agtige vordering + ouerverslae",
      ]
    : [
        "CAPS-aligned study plan, rebuilt daily",
        "10 years of NSC past papers with memos",
        "Instant marking & weak-spot detection",
        "Rizz smart support in EN/AF",
        "Gamified progress + parent reports",
      ];

  const premiumPerks = isAf
    ? [
        "Alles in die gratis proeftydperk",
        "Onbeperkte vraestel-drille & memo's",
        "Dinamiese studieplan wat by jou aanpas",
        "Rizz slim ondersteuning, 24/7",
        "Weeklikse ouerverslae",
        "XP, reekse & beloningsonthullings",
      ]
    : [
        "Everything in the free trial",
        "Unlimited past-paper drills & memos",
        "Dynamic study plan that adapts to you",
        "Rizz smart support, 24/7",
        "Weekly parent reports",
        "XP, streaks & reward reveals",
      ];

  return (
    <div style={{ minHeight: "100vh", background: "#050508", overflowX: "hidden", color: "#fff" }}>
      <style>{SCOPED_CSS}</style>

      {showWelcome && <ConfettiBurst />}

      {/* ── Nav ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, padding: "16px 48px", position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,5,8,.82)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Link href="/">
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <img src={iconTransparent} alt="BrainTrack" className="bts-logo-img" style={{ width: 56, height: 56, objectFit: "contain" }} />
            <span className="bt-wordmark" style={{ fontSize: 22, letterSpacing: "-.5px" }}>BrainTrack</span>
          </div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 14, fontWeight: 600, flex: "none" }}>
          <span className="bts-nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Link href="/features"><span className="bts-nav-link">{isAf ? "Funksies" : "Features"}</span></Link>
            <Link href="/research"><span className="bts-nav-link">{isAf ? "Navorsing" : "Research"}</span></Link>
          </span>
          <a href="/signin">
            <button
              className="bts-nav-cta"
              data-testid="button-nav-enter"
              style={{
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14,
                color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                animation: "bt-rainbow 6s linear infinite", border: "none",
                borderRadius: 10, padding: "11px 24px", whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {isAf ? "Betree die app →" : "Enter the app →"}
            </button>
          </a>
        </div>
      </div>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <div data-testid="subscribe-plan-panel" style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 32px 100px" }}>
        <div style={{ textAlign: "center" }}>
          {/* Adult learner journey rail — /subscribe is the LAST onboarding
              step, not a standalone pricing page. */}
          {isAuthenticated && <JourneyRail isAf={isAf} />}

          {/* Legit urgency: exam-countdown-driven, no fake timers. Prelims
              show if within 45 days, else finals. Source: /api/exam-countdown
              (DBE-anchored dates). */}
          {examCountdown && examCountdown.nextExam !== "done" && (
            <div
              data-testid="subscribe-exam-urgency"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginBottom: 14,
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13,
                color: "#050508", background: "#FFE29A",
                borderRadius: 999, padding: "6px 14px",
              }}
            >
              <Clock style={{ width: 14, height: 14 }} />
              {(() => {
                const prelims = examCountdown.preliminaryExams.daysRemaining;
                const finals = examCountdown.finalExams.daysRemaining;
                if (prelims > 0 && prelims <= 45) {
                  return isAf
                    ? `${prelims} dae tot voorlopige eksamens — beplan die laaste stukkie nou`
                    : `${prelims} days until prelims — plan the last stretch now`;
                }
                return isAf
                  ? `${finals} dae tot NSS-finaal — begin sonder om te wag`
                  : `${finals} days until NSC finals — start without waiting`;
              })()}
            </div>
          )}

          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFE29A", fontSize: 18, transform: "rotate(-2deg)" }}>
            {isAuthenticated
              ? (isAf ? "laaste stap — aktiveer jou 14 gratis dae 🚀" : "last step — activate your 14 free days 🚀")
              : (isAf ? "matriek prep. bekostigbaar. no gimmicks." : "matric prep. affordable. no gimmicks.")}
          </div>
          <div
            role="heading"
            aria-level={1}
            className="bts-head"
            data-testid="subscribe-heading"
            style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", margin: "8px 0 10px", fontFamily: "'Poppins',sans-serif", color: "#fff" }}
          >
            {isAf ? "14 dae gratis. " : "14 days free. "}
            <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
              {isAf ? "Dan R169/maand." : "Then R169/month."}
            </span>
          </div>
          <div
            data-testid="subscribe-hero-subline"
            style={{ fontSize: 17.5, color: "#fff", maxWidth: 620, margin: "0 auto 12px", lineHeight: 1.6, fontWeight: 500 }}
          >
            {isAf
              ? "R5,63 per dag. Minder as een tutor-sessie per maand. Kanselleer enige tyd — geen boete, geen oproepe."
              : "R5.63 a day. Less than one tutor session per month. Cancel anytime — no penalty, no phone calls."}
          </div>
          <div
            style={{ fontSize: 14, color: "#fff", maxWidth: 620, margin: "0 auto 28px", lineHeight: 1.55 }}
          >
            {isAf
              ? "Vir ouers wat 'n minderjarige aktiveer: R1 vandag om die kaart te verifieer (POPIA-toestemming). Geen ander heffing tot dag 14 nie."
              : "Parents activating a minor pay R1 today to verify the card (POPIA consent). No other charge until day 14."}
          </div>

          {/* ── Trust-signal stack (above the CTA — this is the moment the parent's brain says "is this legit?") ── */}
          <div
            data-testid="subscribe-trust-stack"
            style={{
              display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap",
              maxWidth: 780, margin: "0 auto 40px",
            }}
          >
            <span style={trustPillStyle}>
              <Lock style={{ width: 13, height: 13, color: "#94F7C5" }} />
              {isAf ? "Paystack veilige fakturering" : "Paystack secure billing"}
            </span>
            <span style={trustPillStyle}>
              <ShieldCheck style={{ width: 13, height: 13, color: "#9FD8FF" }} />
              {isAf ? "POPIA-nakomend" : "POPIA compliant"}
            </span>
            <span style={trustPillStyle}>
              <BookOpen style={{ width: 13, height: 13, color: "#FFB7E5" }} />
              {isAf ? "KABV-belyn · NSS 2026" : "CAPS-aligned · NSC 2026"}
            </span>
            <span style={trustPillStyle}>
              <GraduationCap style={{ width: 13, height: 13, color: "#FFE29A" }} />
              {isAf ? "10 jaar NSS-vraestelle + memo's" : "10+ years NSC past papers + memos"}
            </span>
          </div>

          {/* ── Payment methods trust strip — parents' brains scan for
               "will my card even work here?" the moment they read a price.
               Answer that before the pricing tiles: five stylised payment
               chips (Visa / Mastercard / Amex / Verified by Visa / SecureCode)
               plus a Paystack processor badge and the KTH-Tech charging-
               entity chip so parents can see who actually appears on their
               bank statement.  All inlined SVG — no CDN, no full-colour
               brand logos. ── */}
          <div
            data-testid="subscribe-payment-strip"
            style={{ maxWidth: 780, margin: "0 auto 18px" }}
          >
            <PaymentIconsRow color="#fff" height={26} isAf={isAf} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              <PaystackBadge isAf={isAf} />
              <span style={{ color: "#fff", opacity: 0.35, fontSize: 12 }} aria-hidden>·</span>
              <span
                data-testid="subscribe-kth-charging-entity"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#fff",
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                <span>
                  {isAf
                    ? "Jy betaal by KTH-Tech (BrainTrack se moedermaatskappy)"
                    : "You're checking out with KTH-Tech (BrainTrack's parent)"}
                </span>
                <KthTechChip size={18} />
              </span>
            </div>
          </div>

          {/* ── Trial summary card — the four things a parent needs to see
               before they hand over a card, in the same order Paystack will
               ask them to confirm. Butter (free trial) → matter-of-fact R1
               → mint (day-14 charge + cancel) → statement descriptor.  Also
               truthful for adult self-serve: card isn't taken until Paystack
               step, and the R1 verify line is scoped as "if you enter a card
               today" so it doesn't overstate for the no-card path. ── */}
          <div
            data-testid="subscribe-trial-summary"
            style={{
              maxWidth: 620,
              margin: "0 auto 30px",
              textAlign: "left",
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 18,
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Line 1 — butter accent: 14 days free */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 22, color: "#FFE29A", lineHeight: 1 }}>
                {isAf ? "14 dae gratis" : "14 days free"}
              </span>
              <span style={{ fontSize: 13, color: "#fff", opacity: 0.85 }}>
                {isAf ? "· volle toegang, geen beperking" : "· full access, no gating"}
              </span>
            </div>

            {/* Line 2 — matter-of-fact R1 verify */}
            <div style={{ fontSize: 13.5, color: "#fff", lineHeight: 1.5 }}>
              {isAf
                ? "R1,00 kaartverifikasie vandag as jy 'n kaart byvoeg (POPIA-toestemming, nie-terugbetaalbaar)."
                : "R1.00 verification charge today if you add a card (POPIA consent, non-refundable)."}
            </div>

            {/* Line 3 — mint accent: R169 on day 14 · cancel anytime */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#9FF5E8",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#9FF5E8" }} aria-hidden />
                {isAf
                  ? "R169/maand vanaf dag 14 · Kanselleer enige tyd"
                  : "R169/month starting day 14 · Cancel anytime"}
              </span>
            </div>

            {/* Line 4 — statement descriptor, always shown so the parent
                 recognises the charge on their bank statement */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingTop: 10,
                borderTop: "1px dashed rgba(255,255,255,.14)",
                fontSize: 12,
                color: "#fff",
                opacity: 0.85,
              }}
            >
              <ShieldCheck style={{ width: 13, height: 13, color: "#94F7C5", flex: "none" }} />
              <span>
                {isAf
                  ? "Verskyn op jou bankstaat as KTH-TECH"
                  : "Appears on your statement as KTH-TECH"}
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{ maxWidth: 820, margin: "0 auto 24px" }}>
            <WallCallout color="#FFE29A">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <AlertCircle style={{ width: 20, height: 20, flex: "none", marginTop: 2, color: "#FFE29A" }} />
                <p style={{ fontSize: 14, color: "#fff", margin: 0 }}>{errorMsg}</p>
              </div>
            </WallCallout>
          </div>
        )}

        <div className="bts-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 24, textAlign: "left", maxWidth: 820, margin: "0 auto" }}>
          {/* ── Free trial card ── */}
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, padding: 32, display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>{isAf ? "Gratis proeftydperk" : "Free trial"}</div>
            <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-1px", margin: "8px 0 2px", color: "#fff" }}>{isAf ? "14 dae" : "14 days"}</div>
            <div style={{ fontSize: 14, color: "#fff", marginBottom: 20 }}>
              {isAf ? "Volle platform. Volle toegang. Geen verrassings." : "Full platform. Full access. No surprises."}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {trialPerks.map((tp) => (
                <div key={tp} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.4, color: "#fff" }}>
                  <span style={{ color: "#9FF5E8", fontWeight: 900 }}>✓</span>
                  <span>{tp}</span>
                </div>
              ))}
            </div>

            {/* Trial signup form — parent + learner cell numbers */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, margin: "22px 0" }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "block", marginBottom: 6 }}>
                  {isAf ? "Ouer se selfoonnommer" : "Parent's cell phone number"}
                </label>
                <div style={{ position: "relative" }}>
                  <Phone style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "#9FD8FF" }} />
                  <Input
                    type="tel"
                    placeholder="082 123 4567"
                    className="bts-input pl-11 h-12 text-base"
                    value={parentCell}
                    onChange={(e) => setParentCell(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "block", marginBottom: 6 }}>
                  {isAf ? "Leerder se selfoonnommer" : "Learner's cell phone number"}
                </label>
                <div style={{ position: "relative" }}>
                  <Phone style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "#9FD8FF" }} />
                  <Input
                    type="tel"
                    placeholder="071 234 5678"
                    className="bts-input pl-11 h-12 text-base"
                    value={learnerCell}
                    onChange={(e) => setLearnerCell(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTrial}
              className="bts-outline-btn"
              data-testid="button-subscribe-cta"
              style={{ ...OUTLINE_BTN_STYLE, width: "100%" }}
            >
              {isAf ? "Begin 14 gratis dae" : "Start 14 days free"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#fff", margin: "10px 0 0", lineHeight: 1.55 }}>
              {isAf
                ? "Opset neem 60 sekondes. Geen verborgde fooie."
                : "Setup takes 60 seconds. No hidden fees."}
            </p>
          </div>

          {/* ── Premium card ── */}
          <div
            style={{
              background: "linear-gradient(150deg,rgba(255,183,229,.14),rgba(159,216,255,.12))",
              border: "1.5px solid #FFB7E5", borderRadius: 24, padding: 32,
              position: "relative",
              display: "flex", flexDirection: "column",
            }}
          >
            <span
              style={{
                position: "absolute", top: -13, left: 32,
                fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#050508",
                background: "linear-gradient(100deg,#9FF5E8,#FFE29A)", borderRadius: 999,
                padding: "5px 16px", transform: "rotate(-2deg)",
              }}
            >
              {isAf ? "gewildste 👑" : "most popular 👑"}
            </span>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>BrainTrack Premium</div>
            <div data-testid="text-subscribe-price" style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "8px 0 2px" }}>
              <span style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-1px", color: "#fff" }}>R169</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{isAf ? "/maand" : "/month"}</span>
            </div>
            <div style={{ fontSize: 14, color: "#fff", marginBottom: 20 }}>
              {isAf
                ? "Per leerder · maandeliks · kanselleer enige tyd in Instellings"
                : "Per learner · billed monthly · cancel anytime in Settings"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {premiumPerks.map((pp) => (
                <div key={pp} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.4, color: "#fff" }}>
                  <span style={{ color: "#FFE29A", fontWeight: 900 }}>★</span>
                  <span>{pp}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleStartTrial}
              className="bts-rainbow-btn"
              data-testid="button-subscribe-premium-cta"
              style={{ ...RAINBOW_BTN_STYLE, width: "100%", marginTop: 22 }}
            >
              {isAf ? "Begin 14 gratis dae" : "Start 14 days free"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#fff", margin: "10px 0 0", lineHeight: 1.55 }}>
              {isAf
                ? "Kanselleer voor dag 14 en jy word nooit gehef nie."
                : "Cancel before day 14 and you're never charged."}
            </p>
          </div>
        </div>

        {/* ── R1 verify explainer — parents scan for gotchas; put the answer
             directly under the pricing cards where the doubt lives ── */}
        <div style={{ maxWidth: 820, margin: "26px auto 0" }}>
          <div
            data-testid="subscribe-r1-explainer"
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 14,
              alignItems: "flex-start",
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 18,
              padding: "18px 22px",
            }}
          >
            <div
              style={{
                width: 42, height: 42, borderRadius: 12, flex: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(148,247,197,.16)", border: "1px solid rgba(148,247,197,.5)",
              }}
            >
              <ShieldCheck style={{ width: 20, height: 20, color: "#94F7C5" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#94F7C5", marginBottom: 4 }}>
                {isAf ? "wat is die R1?" : "what's the R1?"}
              </div>
              <p style={{ fontSize: 14, color: "#fff", margin: 0, lineHeight: 1.6 }}>
                {isAf
                  ? "As jy 'n minderjarige aktiveer, vra Paystack R1 om die kaart aan die ouer te koppel — dis hoe POPIA-toestemming rekord hou. Dit is een keer, geen ander heffing tot dag 14 nie. Volwasse leerders wat vir hulself aanmeld, hoef geen kaart in te lees om te begin nie."
                  : "For parents activating a minor, Paystack takes R1 to confirm the card belongs to you — that's how POPIA consent is recorded. It's one-off, non-refundable, and there is no other charge until day 14. Adult learners activating themselves don't need to enter a card to start the trial."}
              </p>
            </div>
          </div>
        </div>

        {/* ── Real 2025 cohort testimonials (parent-first). Sourced from
             client/src/components/landing/reviews-ribbon.tsx — same corpus,
             three short cards, no fabrication. ── */}
        <div style={{ maxWidth: 820, margin: "36px auto 0" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFB7E5", fontSize: 15, transform: "rotate(-1.5deg)" }}>
              {isAf ? "van die 2025 toetsgroep" : "from the 2025 test cohort"}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginTop: 6 }}>
              {isAf ? "~900 leerders. Regte terugvoer." : "~900 learners. Real feedback."}
            </div>
          </div>
          <div className="bts-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {SUBSCRIBE_TESTIMONIALS.map((r) => (
              <div
                key={r.quoteEn}
                data-testid={`testimonial-${r.role}`}
                style={{
                  background: "linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.015))",
                  border: `1.5px solid ${r.color}`,
                  borderRadius: 18,
                  padding: "18px 18px 16px",
                  display: "flex", flexDirection: "column", gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 30, height: 30, borderRadius: 9,
                      display: "grid", placeItems: "center",
                      background: `${r.color}22`, border: `1px solid ${r.color}66`,
                    }}
                  >
                    <r.Icon size={14} strokeWidth={2.4} color={r.color} aria-hidden />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                    {isAf ? r.roleAf : r.roleEn}
                  </span>
                </div>
                <div style={{ display: "inline-flex", gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={12} strokeWidth={2.2} aria-hidden style={{ color: "#FFE29A", fill: "#FFE29A" }} />
                  ))}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#fff", fontStyle: "italic" }}>
                  {`"${isAf ? r.quoteEn : r.quoteEn}"`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cancel / refund / trust footer — softer honest language;
             matches refund-policy.tsx (no money-back guarantee promised). ── */}
        <div style={{ maxWidth: 820, margin: "36px auto 0" }}>
          <div
            data-testid="subscribe-guarantee-block"
            className="bts-guarantee-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <div style={cancelBlockStyle}>
              <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#9FF5E8", marginBottom: 4 }}>
                {isAf ? "kanselleer regtig" : "actually cancel"}
              </div>
              <p style={{ fontSize: 13.5, color: "#fff", margin: 0, lineHeight: 1.55 }}>
                {isAf
                  ? "Instellings → Intekening → Kanselleer. Onmiddellik. Geen oproepe, geen e-posse, geen kansellasiegelde."
                  : "Settings → Subscription → Cancel. Immediate. No calls, no emails, no cancellation fees."}
              </p>
            </div>
            <div style={cancelBlockStyle}>
              <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFE29A", marginBottom: 4 }}>
                {isAf ? "geen verrassings" : "no gotchas"}
              </div>
              <p style={{ fontSize: 13.5, color: "#fff", margin: 0, lineHeight: 1.55 }}>
                {isAf
                  ? "Kanselleer voor dag 14 en jy word nooit R169 gehef nie. Geen kontrakte, geen langtermyn-vasklouings."
                  : "Cancel before day 14 and you're never charged R169. No contracts, no long-term lock-in."}
              </p>
            </div>
          </div>
        </div>

        {/* Local trust row (kept lean; SA-specific proof points) */}
        <div style={{ display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap", marginTop: 30, fontSize: 13.5, color: "#fff" }}>
          <span>{isAf ? "🔒 Fakturering deur die ouer beheer" : "🔒 Billing controlled by the parent"}</span>
          <span>{isAf ? "🇿🇦 Rand-pryse, geen buitelandse valuta" : "🇿🇦 Rand pricing, no forex"}</span>
          <span>{isAf ? "🎓 Skool-grootmaatlisensies beskikbaar" : "🎓 School bulk licences available"}</span>
        </div>

        <p style={{ textAlign: "center", color: "#fff", fontSize: 12, marginTop: 26, padding: "0 16px", lineHeight: 1.7 }}>
          {isAf ? (
            <>
              {"Deur voort te gaan stem jy in tot ons "}
              <Link href="/terms-of-service"><span style={{ color: "#9FD8FF", cursor: "pointer" }}>Diensvoorwaardes</span></Link>
              {", "}
              <Link href="/privacy-policy"><span style={{ color: "#9FD8FF", cursor: "pointer" }}>Privaatheidsbeleid</span></Link>
              {" en "}
              <Link href="/refund-policy"><span style={{ color: "#9FD8FF", cursor: "pointer" }}>Terugbetalingsbeleid</span></Link>
              {". Ons stuur 'n herinnering voor jou proeftydperk eindig."}
            </>
          ) : (
            <>
              {"By continuing you agree to our "}
              <Link href="/terms-of-service"><span style={{ color: "#9FD8FF", cursor: "pointer" }}>Terms of Service</span></Link>
              {", "}
              <Link href="/privacy-policy"><span style={{ color: "#9FD8FF", cursor: "pointer" }}>Privacy Policy</span></Link>
              {" and "}
              <Link href="/refund-policy"><span style={{ color: "#9FD8FF", cursor: "pointer" }}>Refund Policy</span></Link>
              {". We'll send a reminder before your trial ends."}
            </>
          )}
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button
            onClick={() => navigate(homeHref)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            {isAf ? "Terug na tuisblad" : "Back to home"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Testimonial constants ────────────────────────────────────────────
// These three quotes are copied verbatim from
// client/src/components/landing/reviews-ribbon.tsx — the 2025 test cohort
// (~900 learners) corpus. Selected for CRO on /subscribe: two parent voices
// (the payer) + one learner voice, all short enough to scan on mobile.
const SUBSCRIBE_TESTIMONIALS = [
  {
    role: "parent-1",
    roleEn: "Parent",
    roleAf: "Ouer",
    quoteEn: "The parent report helped us support our child without taking over the study process.",
    Icon: HeartHandshake,
    color: "#C5B3FF",
  },
  {
    role: "learner-1",
    roleEn: "Grade 12 Learner",
    roleAf: "Graad 12 Leerder",
    quoteEn: "BrainTrack showed me what to study, not just how much I still had to study.",
    Icon: GraduationCap,
    color: "#9FF5E8",
  },
  {
    role: "parent-2",
    roleEn: "Parent",
    roleAf: "Ouer",
    quoteEn: "We could see progress, weaker areas and the next priorities in one place.",
    Icon: HeartHandshake,
    color: "#FFE29A",
  },
] as const;

const trustPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "'Poppins',sans-serif",
  fontSize: 12.5,
  fontWeight: 700,
  color: "#fff",
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.14)",
  borderRadius: 999,
  padding: "7px 12px",
};

const cancelBlockStyle: React.CSSProperties = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 16,
  padding: "16px 18px",
};

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
    paystack: isAf ? "Betaal met Paystack" : "Pay with Paystack",
    paystackDesc: isAf
      ? "Veilige betaalblad — kaart, EFT of SnapScan. Jou intekening hernu outomaties elke maand."
      : "Secure checkout — card, EFT or SnapScan. Your subscription renews automatically each month.",
    paystackBadge: isAf ? "Veilig" : "Secure",
    loading: isAf ? "Verwerk..." : "Processing...",
    cancelledTitle: isAf ? "Betaling gekanselleer" : "Payment cancelled",
    cancelledDesc: isAf
      ? "Jy het die betaalblad verlaat. Jou intekening is nie geaktiveer nie — probeer weer hieronder."
      : "You left the payment page. Your subscription was not activated — try again below.",
    notConfigured: isAf
      ? "Betaling is tans nie beskikbaar nie. Herhalende fakturering is nog nie geaktiveer op hierdie omgewing nie — probeer asseblief later weer."
      : "Payment not available. Recurring billing isn't active on this environment yet — please try again shortly.",
    back: isAf ? "Terug" : "Back",
    secure: isAf
      ? "Veilige betaling verwerk deur Paystack. Jy sal na Paystack se betaalblad herlei word."
      : "Secure payment processed by Paystack. You will be redirected to the Paystack checkout page.",
  };

  async function handlePaystackCheckout() {
    setLoadingMethod("card");
    setErrorMsg(null);
    try {
      const res = await apiRequest("POST", "/api/paystack/initialize", {});
      const data = await res.json() as {
        authorizationUrl?: string;
        alreadyActive?: boolean;
        error?: string;
        message?: string;
      };
      if (data.alreadyActive) {
        onSuccess();
        return;
      }
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl; // ACCEPTED RISK: server-returned Paystack checkout URL, not user-controlled // nosemgrep: no-raw-window-location-href-variable
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
    <WallScreen>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <CreditCard style={{ width: 36, height: 36, margin: "0 auto 20px", color: "#9FF5E8" }} />
        <div
          role="heading"
          aria-level={1}
          style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 14, fontFamily: "'Poppins',sans-serif", color: "#fff" }}
        >
          <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
            {t.headline}
          </span>
        </div>
        <p style={{ color: "#fff", opacity: 0.942, margin: 0 }}>{t.subheadline}</p>
      </div>

      {/* Cancelled banner */}
      {showCancelledBanner && (
        <div style={{ marginBottom: 20 }}>
          <WallCallout color="#FFE29A">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <XCircle style={{ width: 20, height: 20, flex: "none", marginTop: 2, color: "#FFE29A" }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>{t.cancelledTitle}</p>
                <p style={{ fontSize: 12, color: "#fff", opacity: 0.94, margin: 0 }}>{t.cancelledDesc}</p>
              </div>
            </div>
          </WallCallout>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div style={{ marginBottom: 20 }}>
          <WallCallout color="#FFE29A">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <AlertCircle style={{ width: 20, height: 20, flex: "none", marginTop: 2, color: "#FFE29A" }} />
              <p style={{ fontSize: 14, color: "#fff", margin: 0 }}>{errorMsg}</p>
            </div>
          </WallCallout>
        </div>
      )}

      {/* Charge summary */}
      <div style={{ marginBottom: 28 }}>
        <WallCallout color="#FFE29A">
          <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#FFE29A", margin: "0 0 4px" }}>
            {t.charge}
          </p>
          <p style={{ fontWeight: 800, fontSize: 17, color: "#FFE29A", margin: 0, lineHeight: 1.5 }}>
            {t.chargeDetail}
          </p>
        </WallCallout>
      </div>

      {/* Paystack checkout — sole payment provider */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
        <button
          onClick={handlePaystackCheckout}
          disabled={anyLoading}
          className="bts-method-btn"
          data-testid="button-paystack-checkout"
          style={{
            "--c": "#94F7C5",
            width: "100%", textAlign: "left", background: "rgba(255,255,255,.03)",
            border: "1.5px solid rgba(255,255,255,.12)", borderRadius: 18, padding: "18px 20px",
            cursor: anyLoading ? "not-allowed" : "pointer", opacity: anyLoading ? 0.6 : 1,
            fontFamily: "'Poppins',sans-serif", color: "#fff",
          } as React.CSSProperties}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 44, height: 44, flex: "none", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(148,247,197,.14)" }}>
              {anyLoading ? (
                <Loader2 className="animate-spin" style={{ width: 20, height: 20, color: "#94F7C5" }} />
              ) : (
                <CreditCard style={{ width: 20, height: 20, color: "#94F7C5" }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: "#fff" }}>{t.paystack}</span>
                <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#94F7C5" }}>
                  {t.paystackBadge}
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: "#fff", opacity: 0.94, lineHeight: 1.55, margin: 0 }}>{t.paystackDesc}</p>
            </div>
            <ChevronRight style={{ width: 20, height: 20, flex: "none", marginTop: 2, color: "#94F7C5" }} />
          </div>
        </button>
      </div>

      <p style={{ textAlign: "center", color: "#fff", opacity: 0.94, fontSize: 12, padding: "0 16px", lineHeight: 1.7, marginBottom: 28 }}>
        {t.secure}
      </p>

      <button
        onClick={() => (window.location.href = homeHref)} // nosemgrep: no-raw-window-location-href-variable
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "none", border: "none", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        {t.back}
      </button>
    </WallScreen>
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
    <WallScreen>
      <div style={{ textAlign: "center" }}>
        <CheckCircle2 style={{ width: 56, height: 56, margin: "0 auto 24px", color: "#94F7C5" }} />
        <div
          role="heading"
          aria-level={1}
          style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 18, fontFamily: "'Poppins',sans-serif", color: "#fff" }}
        >
          <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
            {isAf ? "Welkom by Brain Boost!" : "Welcome to Brain Boost!"}
          </span>
        </div>
        <p style={{ color: "#fff", fontSize: 17, marginBottom: 24 }}>
          {isAf
            ? "Jou 14-dae gratis proeftydperk is nou aktief."
            : "Your 14-day free trial is now active."}
        </p>

        {/* SMS delivery status */}
        {smsFailed && (
          <div style={{ marginBottom: 20 }}>
            <WallCallout color="#FFE29A">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <AlertCircle style={{ width: 20, height: 20, flex: "none", marginTop: 2, color: "#FFE29A" }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>
                    {isAf ? "WhatsApp-skakel nie gestuur nie" : "WhatsApp link not sent"}
                  </p>
                  <p style={{ fontSize: 12, color: "#fff", opacity: 0.94, margin: 0 }}>
                    {isAf
                      ? "Die aanmeldingskakels kon nie afgelewer word nie. Gebruik die knoppie hieronder om dit weer te probeer of die nommer reg te stel."
                      : "The sign-in link could not be delivered. Use the button below to retry or correct the number."}
                  </p>
                </div>
              </div>
            </WallCallout>
          </div>
        )}

        {smsSent && !smsFailed && (
          <div style={{ marginBottom: 20 }}>
            <WallCallout color={deliveryStatus === "delivered" || deliveryStatus === "opened" ? "#94F7C5" : "#9FF5E8"}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {deliveryStatus === "delivered" || deliveryStatus === "opened" ? (
                  <CheckCircle2 style={{ width: 16, height: 16, flex: "none", color: "#94F7C5" }} />
                ) : (
                  <Loader2 className="animate-spin" style={{ width: 16, height: 16, flex: "none", color: "#9FF5E8" }} />
                )}
                <p style={{ fontSize: 12, color: "#fff", margin: 0 }}>
                  {deliveryStatus === "delivered"
                    ? (isAf ? `Skakel afgelewer aan ${smsResult.to}` : `Link delivered to ${smsResult.to}`)
                    : deliveryStatus === "opened"
                    ? (isAf ? `Leerder het die skakel oopgemaak` : `Learner opened the link`)
                    : (isAf
                      ? `Aanmeldingskakel gestuur na ${smsResult.to} — kontroleer aflewering…`
                      : `Sign-in link sent to ${smsResult.to} — checking delivery…`)}
                </p>
              </div>
            </WallCallout>
          </div>
        )}

        {/* Inline resend feedback */}
        {resendStatus === "success" && resendMsg && (
          <div style={{ marginBottom: 16 }}>
            <WallCallout color="#94F7C5">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 style={{ width: 16, height: 16, flex: "none", color: "#94F7C5" }} />
                <p style={{ fontSize: 12, color: "#fff", margin: 0 }}>{resendMsg}</p>
              </div>
            </WallCallout>
          </div>
        )}
        {resendStatus === "error" && resendMsg && (
          <div style={{ marginBottom: 16 }}>
            <WallCallout color="#FFE29A">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <AlertCircle style={{ width: 16, height: 16, flex: "none", marginTop: 2, color: "#FFE29A" }} />
                <p style={{ fontSize: 12, color: "#fff", margin: 0 }}>{resendMsg}</p>
              </div>
            </WallCallout>
          </div>
        )}

        {/* Corrected cell input (shown on demand) */}
        {showCellInput && (
          <div style={{ marginBottom: 16, textAlign: "left" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#fff", display: "block", marginBottom: 4 }}>
              {isAf ? "Leerder se selfoonnommer" : "Learner's cell number"}
            </label>
            <div style={{ position: "relative" }}>
              <Phone style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9FD8FF" }} />
              <Input
                type="tel"
                placeholder="071 234 5678"
                className="bts-input pl-10 h-10 text-sm"
                value={editCell}
                onChange={(e) => setEditCell(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Resend / correct number actions */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexDirection: smsFailed ? "column" : "row", alignItems: "center", justifyContent: "center" }}>
          {smsFailed ? (
            <>
              <button
                onClick={handleResend}
                disabled={resendLoading || cooldownSecs > 0}
                className="bts-rainbow-btn"
                style={{ ...RAINBOW_BTN_STYLE, display: "inline-flex", alignItems: "center", gap: 8, opacity: resendLoading || cooldownSecs > 0 ? 0.6 : 1, cursor: resendLoading || cooldownSecs > 0 ? "not-allowed" : "pointer" }}
              >
                {resendLoading ? (
                  <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
                ) : (
                  <Send style={{ width: 16, height: 16 }} />
                )}
                {cooldownSecs > 0
                  ? (isAf ? `Wag ${cooldownSecs}s...` : `Wait ${cooldownSecs}s...`)
                  : (isAf ? "Stuur skakel weer" : "Resend link")}
              </button>
              <button
                onClick={() => setShowCellInput((v) => !v)}
                style={{ background: "none", border: "none", color: "#fff", fontSize: 14, textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}
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
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#fff", fontSize: 14, cursor: resendLoading || cooldownSecs > 0 ? "not-allowed" : "pointer", fontFamily: "'Poppins',sans-serif" }}
            >
              <RefreshCw style={{ width: 14, height: 14, color: "#9FF5E8" }} />
              {cooldownSecs > 0
                ? (isAf ? `Wag ${cooldownSecs}s...` : `Wait ${cooldownSecs}s...`)
                : (isAf ? "Stuur skakel weer" : "Resend link")}
            </button>
          )}
        </div>

        {/* Show resend button when cell input is visible and SMS was previously sent */}
        {showCellInput && smsSent && (
          <button
            onClick={handleResend}
            disabled={resendLoading || cooldownSecs > 0}
            className="bts-outline-btn"
            style={{ ...OUTLINE_BTN_STYLE, display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, opacity: resendLoading || cooldownSecs > 0 ? 0.6 : 1 }}
          >
            {resendLoading ? (
              <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
            ) : (
              <Send style={{ width: 16, height: 16 }} />
            )}
            {cooldownSecs > 0
              ? (isAf ? `Wag ${cooldownSecs}s...` : `Wait ${cooldownSecs}s...`)
              : (isAf ? "Stuur skakel" : "Send link")}
          </button>
        )}

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/dashboard")}
            className="bts-rainbow-btn"
            style={RAINBOW_BTN_STYLE}
          >
            {isAf ? "Gaan na Dashboard" : "Go to Dashboard"}
          </button>
        </div>
      </div>
    </WallScreen>
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
        ? "Jou kaart sal elke maand met R169 gehef word deur KTH-Tech. Jou kaartbesonderhede word veilig deur Paystack gestoor."
        : "Your card will be charged R169 each month by KTH-Tech. Your card details are securely stored by Paystack.");

  return (
    <WallScreen testId="payment-success-panel">
      <div style={{ textAlign: "center" }}>
        <CheckCircle2 style={{ width: 56, height: 56, margin: "0 auto 24px", color: "#94F7C5" }} />

        <div
          role="heading"
          aria-level={1}
          data-testid="payment-success-heading"
          style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 16, fontFamily: "'Poppins',sans-serif", color: "#fff" }}
        >
          <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
            {isAf ? "Betaling suksesvol" : "Payment successful"}
          </span>
        </div>
        <p style={{ color: "#fff", fontSize: 17, marginBottom: 32 }}>
          {isAf
            ? "Brain Boost is nou aktief op jou rekening."
            : "Brain Boost is now active on your account."}
        </p>

        {/* Payment method */}
        <div style={{ marginBottom: 20 }}>
          <WallCallout color="#9FD8FF">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
              {isDebicheck ? (
                <Landmark style={{ width: 20, height: 20, flex: "none", marginTop: 2, color: "#9FD8FF" }} />
              ) : (
                <CreditCard style={{ width: 20, height: 20, flex: "none", marginTop: 2, color: "#9FD8FF" }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#9FD8FF", margin: "0 0 2px" }}>
                  {isAf ? "Betaalmetode" : "Payment method"}
                </p>
                <p style={{ fontWeight: 700, color: "#fff", margin: 0 }} data-testid="payment-success-method">
                  {methodLabel}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "#fff", opacity: 0.94, lineHeight: 1.6, margin: 0 }}>
              {methodDesc}
            </p>
          </WallCallout>
        </div>

        {/* Billing */}
        <div style={{ marginBottom: 32 }}>
          <WallCallout color="#FFE29A">
            <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#FFE29A", margin: "0 0 4px" }}>
              {isAf ? "Maandeliks gehef" : "Billed monthly"}
            </p>
            <p style={{ fontWeight: 800, fontSize: 17, color: "#FFE29A", margin: "0 0 6px" }}>
              {isAf
                ? "R169/maand · Kanselleer enige tyd"
                : "R169/month · Cancel anytime"}
            </p>
            {/* Statement descriptor — parents see "KTH-TECH" on their bank
                statement, not "BrainTrack". Saying it up-front here prevents
                "I don't recognise this charge" chargebacks. */}
            <p style={{ fontSize: 13, color: "#fff", opacity: 0.9, margin: 0 }}>
              {isAf
                ? "Verskyn op jou staat as KTH-TECH."
                : "Appears on your statement as KTH-TECH."}
            </p>
          </WallCallout>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/dashboard")}
            className="bts-rainbow-btn"
            data-testid="button-payment-success-dashboard"
            style={RAINBOW_BTN_STYLE}
          >
            {isAf ? "Gaan na Dashboard" : "Go to Dashboard"}
          </button>
        </div>
      </div>
    </WallScreen>
  );
}

function NotConfiguredScreen({ isAf, homeHref }: { isAf: boolean, homeHref: string }) {
  return (
    <WallScreen>
      <div style={{ textAlign: "center" }}>
        <AlertCircle style={{ width: 56, height: 56, margin: "0 auto 24px", color: "#FFE29A" }} />
        <div
          role="heading"
          aria-level={1}
          style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 16, fontFamily: "'Poppins',sans-serif", color: "#fff" }}
        >
          <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
            {isAf ? "Betalings nie opgestel nie" : "Payments not configured"}
          </span>
        </div>
        <p style={{ color: "#fff", opacity: 0.94, marginBottom: 40 }}>
          {isAf
            ? "Ons kan nie tans nuwe proeftydperke verwerk nie. Probeer asseblief later weer."
            : "We cannot process new trials at this time. Please try again later."}
        </p>
        <a
          href={homeHref}
          className="bts-outline-btn"
          style={{ ...OUTLINE_BTN_STYLE, display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
        >
          {isAf ? "Terug" : "Back"}
        </a>
      </div>
    </WallScreen>
  );
}

/** Pastel progress rail — the learner journey with /subscribe as its final
    step. Shown to signed-in adult learners only. */
function JourneyRail({ isAf }: { isAf: boolean }) {
  const steps = [
    { label: isAf ? "Teken aan" : "Sign up", color: "#9FF5E8", done: true },
    { label: isAf ? "Bou jou profiel" : "Build your profile", color: "#9FD8FF", done: true },
    { label: isAf ? "Aktiveer jou proeftydperk" : "Activate your trial", color: "#FFB7E5", done: false },
  ];
  return (
    <div
      data-testid="subscribe-journey-rail"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", rowGap: 10, marginBottom: 24 }}
    >
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 26, height: 26, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
                fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 12,
                ...(s.done
                  ? { background: s.color, color: "#050508" }
                  : { border: `1.5px solid ${s.color}`, color: s.color }),
              }}
            >
              {s.done ? "✓" : i + 1}
            </span>
            <span style={{ fontSize: 13, fontWeight: s.done ? 600 : 800, color: "#fff" }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              style={{
                width: 34, height: 2, margin: "0 10px", borderRadius: 2,
                background: `linear-gradient(90deg, ${s.color}, ${steps[i + 1].color})`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/** Parent branch of the /subscribe journey — the parent subscribes FOR their
    linked learner. Executive restraint per design guidelines: one marker
    accent, pastel left-rule callouts, no confetti. Card capture reuses the
    EXISTING /api/parent-consent/card-capture endpoints (R1 verification →
    trial starts server-side); no new payment path. */
function ParentSubscribeScreen({
  isAf,
  navigate,
  parentView,
  onRefetch,
}: {
  isAf: boolean;
  navigate: any;
  parentView: ParentViewInfo | null;
  onRefetch: () => void;
}) {
  const [ccLoading, setCcLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const learnerName = parentView?.learnerName?.trim() || (isAf ? "jou leerder" : "your learner");
  const hasSub = Boolean(parentView && (parentView.active || parentView.status === "trial" || parentView.status === "active"));

  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(isAf ? "af-ZA" : "en-ZA", { day: "numeric", month: "long", year: "numeric" })
      : null;

  const perks = isAf
    ? [
        "KABV-belynde studieplan, elke dag herbou",
        "10 jaar se NSS-vraestelle met memo's en onmiddellike nasien",
        "Rizz slim ondersteuning in EN/AF, 24/7",
        "Weeklikse ouerverslae reguit na jou",
      ]
    : [
        "CAPS-aligned study plan, rebuilt daily",
        "10 years of NSC past papers with memos and instant marking",
        "Rizz smart support in EN/AF, 24/7",
        "Weekly parent reports straight to you",
      ];

  async function handleCardCapture() {
    if (!parentView?.consentToken) return;
    setCcLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest("POST", "/api/parent-consent/card-capture/initialize", {
        token: parentView.consentToken,
      });
      const data = await res.json() as {
        authorizationUrl?: string;
        alreadyCaptured?: boolean;
        message?: string;
      };
      if (data.alreadyCaptured) {
        onRefetch();
        return;
      }
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl; // ACCEPTED RISK: server-returned Paystack checkout URL, not user-controlled // nosemgrep: no-raw-window-location-href-variable
        return;
      }
      setErrorMsg(
        data.message ??
        (isAf ? "Kon nie die kaartverifikasie begin nie. Probeer weer." : "Could not start card verification. Please try again.")
      );
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const status = parseInt(msg.split(":")[0] ?? "", 10);
      setErrorMsg(
        status === 503
          ? (isAf
              ? "Betaling is tans nie beskikbaar op hierdie omgewing nie. Probeer asseblief later weer."
              : "Payments aren't available on this environment yet. Please try again shortly.")
          : (isAf ? "Iets het fout gegaan. Probeer asseblief weer." : "Something went wrong. Please try again.")
      );
    } finally {
      setCcLoading(false);
    }
  }

  // ── No linked learner yet ──
  if (!parentView) {
    return (
      <WallScreen testId="parent-subscribe-nolearner">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFE29A", fontSize: 16, transform: "rotate(-2deg)", marginBottom: 18 }}>
            {isAf ? "jou deel van die reis" : "your part of the journey"}
          </div>
          <div
            role="heading"
            aria-level={1}
            data-testid="parent-subscribe-heading"
            style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 14, fontFamily: "'Poppins',sans-serif", color: "#fff" }}
          >
            <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
              {isAf ? "Koppel eers jou leerder" : "Link your learner first"}
            </span>
          </div>
          <p style={{ color: "#fff", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            {isAf
              ? "Sodra jou kind se rekening aan joune gekoppel is, aktiveer jy hul Brain Boost-proeftydperk hier in een stap."
              : "Once your child's account is linked to yours, you activate their Brain Boost trial right here in one step."}
          </p>
          <button
            onClick={() => navigate("/parent")}
            data-testid="button-parent-dashboard"
            style={{
              fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
              color: "#050508", background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
              border: "none", borderRadius: 12, padding: "15px 28px", cursor: "pointer",
            }}
          >
            {isAf ? "Gaan na ouer-dashboard" : "Go to parent dashboard"}
          </button>
        </div>
      </WallScreen>
    );
  }

  // ── Learner already on trial / active — show status, never a checkout ──
  if (hasSub) {
    const isTrial = parentView.status === "trial";
    const nextBillDate = fmtDate(isTrial ? parentView.trialEndsAt : (parentView.nextRenewalAt ?? parentView.trialEndsAt));
    return (
      <WallScreen testId="parent-subscribe-panel">
        <div style={{ textAlign: "center" }}>
          <CheckCircle2 style={{ width: 48, height: 48, margin: "0 auto 20px", color: "#94F7C5" }} />
          <div
            role="heading"
            aria-level={1}
            data-testid="parent-subscribe-heading"
            style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 12, fontFamily: "'Poppins',sans-serif", color: "#fff" }}
          >
            <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
              {isAf ? `Brain Boost is aktief vir ${learnerName}` : `Brain Boost is live for ${learnerName}`}
            </span>
          </div>
          <p style={{ color: "#fff", fontSize: 15, marginBottom: 28 }}>
            {isAf
              ? "Alles is opgestel — daar is niks verder om te betaal of te aktiveer nie."
              : "Everything is set up — there's nothing further to pay or activate."}
          </p>

          <div style={{ marginBottom: 20 }}>
            <WallCallout color="#94F7C5">
              <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#94F7C5", margin: "0 0 4px" }}>
                {isAf ? "Status" : "Status"}
              </p>
              <p style={{ fontWeight: 800, fontSize: 17, color: "#fff", margin: 0 }} data-testid="parent-subscribe-status">
                {isTrial
                  ? (isAf ? "14-dae gratis proeftydperk" : "14-day free trial")
                  : (isAf ? "Aktief — R169/maand" : "Active — R169/month")}
              </p>
            </WallCallout>
          </div>

          {nextBillDate && (
            <div style={{ marginBottom: 32 }}>
              <WallCallout color="#9FD8FF">
                <p style={{ fontSize: 14, color: "#fff", margin: 0, lineHeight: 1.6 }} data-testid="parent-subscribe-next-billing">
                  {isTrial
                    ? (isAf
                        ? `Eerste heffing van R169 op ${nextBillDate} — kanselleer enige tyd voor dan in die app.`
                        : `First charge of R169 on ${nextBillDate} — cancel anytime before then in the app.`)
                    : (isAf
                        ? `Volgende fakturering: ${nextBillDate} · R169 · kanselleer enige tyd in die app.`
                        : `Next billing: ${nextBillDate} · R169 · cancel anytime in the app.`)}
                </p>
              </WallCallout>
            </div>
          )}

          <button
            onClick={() => navigate("/parent")}
            data-testid="button-parent-dashboard"
            style={{
              fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
              color: "#050508", background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
              border: "none", borderRadius: 12, padding: "15px 28px", cursor: "pointer",
            }}
          >
            {isAf ? "Gaan na ouer-dashboard" : "Go to parent dashboard"}
          </button>
        </div>
      </WallScreen>
    );
  }

  // ── Checkout needed — parent adds the card, trial starts server-side ──
  return (
    <WallScreen testId="parent-subscribe-panel">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFE29A", fontSize: 16, transform: "rotate(-2deg)", marginBottom: 16 }}>
          {isAf ? "jou deel van die reis" : "your part of the journey"}
        </div>
        <div
          role="heading"
          aria-level={1}
          data-testid="parent-subscribe-heading"
          style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 12, fontFamily: "'Poppins',sans-serif", color: "#fff" }}
        >
          <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
            {isAf ? `Ontsluit ${learnerName} se Brain Boost` : `Unlock ${learnerName}'s Brain Boost`}
          </span>
        </div>
        <p style={{ color: "#fff", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          {isAf
            ? "Jou kind het hul deel gedoen — hierdie stap is joune. Voeg een keer 'n kaart by en hul 14-dae gratis proeftydperk begin dadelik."
            : "Your child did their part — this step is yours. Add a card once and their 14-day free trial starts immediately."}
        </p>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: 20 }}>
          <WallCallout color="#FFE29A">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <AlertCircle style={{ width: 20, height: 20, flex: "none", marginTop: 2, color: "#FFE29A" }} />
              <p style={{ fontSize: 14, color: "#fff", margin: 0 }}>{errorMsg}</p>
            </div>
          </WallCallout>
        </div>
      )}

      {/* What the child gets */}
      <div style={{ marginBottom: 20 }}>
        <WallCallout color="#9FD8FF">
          <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#9FD8FF", margin: "0 0 8px" }}>
            {isAf ? `Wat ${learnerName} kry` : `What ${learnerName} gets`}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {perks.map((p) => (
              <div key={p} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5, color: "#fff" }}>
                <span style={{ color: "#94F7C5", fontWeight: 900 }}>✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </WallCallout>
      </div>

      {/* Trial + billing terms */}
      <div style={{ marginBottom: 28 }}>
        <WallCallout color="#FFE29A">
          <p style={{ fontWeight: 800, fontSize: 15, color: "#FFE29A", margin: 0, lineHeight: 1.7 }} data-testid="parent-subscribe-terms">
            {isAf
              ? "R1 kaartverifikasie vandag · gratis vir 14 dae · R169/maand vanaf dag 14 · kanselleer enige tyd in die app"
              : "R1 card verification today · free for 14 days · R169/month from day 14 · cancel anytime in the app"}
          </p>
        </WallCallout>
      </div>

      {parentView.consentToken ? (
        <button
          onClick={handleCardCapture}
          disabled={ccLoading}
          data-testid="button-parent-card-capture"
          style={{
            width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15,
            color: "#050508", background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
            border: "none", borderRadius: 12, padding: "16px 24px",
            cursor: ccLoading ? "not-allowed" : "pointer", opacity: ccLoading ? 0.6 : 1,
            marginBottom: 20,
          }}
        >
          {ccLoading ? (
            <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
          ) : (
            <CreditCard style={{ width: 18, height: 18 }} />
          )}
          {isAf
            ? `Voeg kaart by & begin ${learnerName} se proeftydperk`
            : `Add card & start ${learnerName}'s trial`}
        </button>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <WallCallout color="#FFB7E5">
            <p style={{ fontSize: 14, color: "#fff", margin: 0, lineHeight: 1.6 }}>
              {isAf
                ? "Ons kon nie 'n veilige betaalskakel opstel nie. Gebruik asseblief die skakel in die toestemmings-e-pos wat aan jou gestuur is."
                : "We couldn't set up a secure payment link. Please use the link in the consent email that was sent to you."}
            </p>
          </WallCallout>
        </div>
      )}

      <p style={{ textAlign: "center", color: "#fff", opacity: 0.94, fontSize: 12, padding: "0 16px", lineHeight: 1.7, marginBottom: 24 }}>
        {isAf
          ? "Veilige betaling verwerk deur Paystack. Jy word na Paystack se betaalblad herlei vir die R1-verifikasie."
          : "Secure payment processed by Paystack. You'll be redirected to Paystack's checkout for the R1 verification."}
      </p>

      <button
        onClick={() => navigate("/parent")}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "none", border: "none", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        {isAf ? "Terug na ouer-dashboard" : "Back to parent dashboard"}
      </button>
    </WallScreen>
  );
}
