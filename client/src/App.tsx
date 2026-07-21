import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useSocket } from "@/hooks/use-socket";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { RizzSupportBot } from "@/components/rizz-support-bot";
import { PublicFooter } from "@/components/public-footer";
import { CosmicBackground } from "@/components/neural-bg";
import { InstallBanner } from "@/components/install-banner";
import { AppRatingPrompt } from "@/components/app-rating-prompt";
import { AdminPreviewBanner } from "@/components/admin-preview-banner";
import { DemoAccountBadge } from "@/components/demo-account-badge";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { UpdateBanner } from "@/components/update-banner";
import { useSwUpdate } from "@/hooks/use-sw-update";
import { ErrorBoundary } from "@/components/error-boundary";

function PartnerLink({ source, referralCode }: { source: string; referralCode?: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    localStorage.setItem("btk_src", source);
    if (referralCode) localStorage.setItem("btk_ref", referralCode);
    fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, referralCode }),
    }).catch(() => {});
    setLocation("/");
  }, [source, referralCode, setLocation]);
  return null;
}

function ReferralLink() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || "";
  return <PartnerLink source="referral" referralCode={code} />;
}

const ROLE_REF_SOURCES: Record<string, string> = {
  partner: "ref:partner",
  channel: "ref:channel",
  growth:  "ref:growth",
};

function RefAttributionDetector() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;
    // Learner-to-learner referral codes — either legacy BT-XXXXXXXXXX or new
    // {firstname}_brain{nnn} format. Store separately so they don't collide
    // with partner/channel sources. Legacy codes are normalised to uppercase;
    // new name-based codes are kept lowercase to match how they are stored.
    if (/^(BT-[A-Fa-f0-9]{10}|[a-z]{1,12}_brain\d{3})$/.test(ref)) {
      const normalised = /^BT-/i.test(ref) ? ref.toUpperCase() : ref;
      if (!localStorage.getItem("btk_learner_ref")) {
        localStorage.setItem("btk_learner_ref", normalised);
      }
      fetch("/api/track/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "learner-referral", referralCode: normalised }),
      }).catch(() => {});
      return;
    }
    const source = ROLE_REF_SOURCES[ref] || `ref:${ref}`;
    if (!localStorage.getItem("btk_src")) {
      localStorage.setItem("btk_src", source);
    }
    fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    }).catch(() => {});
  }, []);
  return null;
}

function LearnerReferralAttribution() {
  const { isAuthenticated, user } = useAuth();
  const attempted = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !user || attempted.current) return;
    const code = localStorage.getItem("btk_learner_ref");
    if (!code) return;
    attempted.current = true;
    fetch("/api/referral/attribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json().catch(() => ({})))
      .then(() => {
        localStorage.removeItem("btk_learner_ref");
      })
      .catch(() => {});
  }, [isAuthenticated, user]);
  return null;
}

const NotFound = lazy(() => import("@/pages/not-found"));
const LandingPage = lazy(() => import("@/pages/landing"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const SubscribePage = lazy(() => import("@/pages/subscribe"));
const SignInPage = lazy(() => import("@/pages/signin"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const AdminDashboardPage = lazy(() => import("@/pages/admin-dashboard"));
const SubjectsPage = lazy(() => import("@/pages/subjects"));
const SubjectDetailPage = lazy(() => import("@/pages/subject-detail"));
const TutorPage = lazy(() => import("@/pages/tutor"));
const ProgressPage = lazy(() => import("@/pages/progress"));
const ExamReadyPage = lazy(() => import("@/pages/exam-ready"));
const PrivacyPolicyPage = lazy(() => import("@/pages/privacy-policy"));
const TermsOfServicePage = lazy(() => import("@/pages/terms-of-service"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const PartnerSchoolsPage = lazy(() => import("@/pages/partner-schools"));
const ParentDashboardPage = lazy(() => import("@/pages/parent-dashboard"));
const ParentActivateChildPage = lazy(() => import("@/pages/parent-activate-child"));
const ActivatePage = lazy(() => import("@/pages/activate"));
const PrintableCalendarPage = lazy(() => import("@/pages/printable-calendar"));
const PastPapersPage = lazy(() => import("@/pages/past-papers"));
const BSTExamPage = lazy(() => import("@/pages/bst-exam"));
const ExamModePage = lazy(() => import("@/pages/exam-mode"));
const ExamSessionPage = lazy(() => import("@/pages/exam-session"));
const ExamMiniMockPage = lazy(() => import("@/pages/exam-mini-mock"));
const ExamFullPage = lazy(() => import("@/pages/exam-full"));
const AboutPage = lazy(() => import("@/pages/about"));
const ResearchPage = lazy(() => import("@/pages/research"));
const FeaturesPage = lazy(() => import("@/pages/features"));
const ForSchoolsPage = lazy(() => import("@/pages/for-schools"));
const DailyChallengePage = lazy(() => import("@/pages/daily-challenge"));
const StudyCalendarPage = lazy(() => import("@/pages/study-calendar"));
const PrelimTimetablePage = lazy(() => import("@/pages/prelim-timetable"));
const DBEPortalPage = lazy(() => import("@/pages/dbe-portal"));
const AdminReportsPage = lazy(() => import("@/pages/admin-reports"));
const AdminProductsPage = lazy(() => import("@/pages/admin-products"));
const AdminBillingPage = lazy(() => import("@/pages/admin-billing"));
const AdminContentStudioPage = lazy(() => import("@/pages/admin-content-studio"));
const AdminPartnerBrandingPage = lazy(() => import("@/pages/admin-partner-branding"));
const AdminSchoolQRPage = lazy(() => import("@/pages/admin-school-qr"));
const AdminQrGeneratorPage = lazy(() => import("@/pages/admin-qr-generator"));
const JoinPage = lazy(() => import("@/pages/join"));
const AdminEmailsPage = lazy(() => import("@/pages/admin-emails"));
const AdminSignInPage = lazy(() => import("@/pages/admin-signin"));
const AdminContentEditorPage = lazy(() => import("@/pages/admin-content-editor"));
const AdminConsentLogPage = lazy(() => import("@/pages/admin-consent-log"));
const RewardsPage = lazy(() => import("@/pages/rewards"));
const MyNotesPage = lazy(() => import("@/pages/my-notes"));
const RoleSelectPage = lazy(() => import("@/pages/role-select"));
// Task #43 — Parent registration + parent-consent confirmation pages.
const ParentOnboardingPage = lazy(() => import("@/pages/parent-onboarding"));
const ParentConsentPage = lazy(() => import("@/pages/parent-consent"));
const DbePracticePage = lazy(() => import("@/pages/dbe-practice"));
const ParentPurchasePage = lazy(() => import("@/pages/parent-purchase"));
const FlashcardsPage = lazy(() => import("@/pages/flashcards"));
const RevisionPage = lazy(() => import("@/pages/revision"));
const CookiePolicyPage = lazy(() => import("@/pages/cookie-policy"));
const RefundPolicyPage = lazy(() => import("@/pages/refund-policy"));
const StorePage = lazy(() => import("@/pages/store"));
const JourneyPage = lazy(() => import("@/pages/journey"));
const SchoolOnboardingPage = lazy(() => import("@/pages/school-onboarding"));
const SchoolDashboardPage = lazy(() => import("@/pages/school-dashboard"));
// Minor learners land here until their parent grants consent + adds a card.
const WaitingForParentPage = lazy(() => import("@/pages/waiting-for-parent"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function useContentProtection() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'c' || e.key === 'C' || e.key === 's' || e.key === 'S' ||
          e.key === 'p' || e.key === 'P' || e.key === 'a' || e.key === 'A' ||
          e.key === 'u' || e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'PrintScreen' || e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const handleBeforePrint = () => {
      const overlay = document.createElement('div');
      overlay.id = 'print-protection-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:999999;display:flex;align-items:center;justify-content:center;';
      const inner = document.createElement('div');
      inner.style.cssText = 'text-align:center;font-family:sans-serif;color:#333;';
      const heading = document.createElement('h2');
      heading.style.cssText = 'font-size:1.5rem;margin-bottom:0.5rem;';
      heading.textContent = 'Content Protected';
      const para = document.createElement('p');
      para.style.cssText = 'color:#666;';
      para.textContent = 'Printing of BrainTrack content is not permitted.';
      inner.appendChild(heading);
      inner.appendChild(para);
      overlay.appendChild(inner);
      document.body.appendChild(overlay);
    };

    const handleAfterPrint = () => {
      const overlay = document.getElementById('print-protection-overlay');
      if (overlay) overlay.remove();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    document.body.classList.add('content-protected');

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      document.body.classList.remove('content-protected');
    };
  }, []);
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: onboardingComplete, isLoading: onboardingLoading } = useQuery<boolean>({
    queryKey: ["/api/user/onboarding-status"],
    enabled: isAuthenticated,
  });

  // Subscription gate — always called (hooks must not be conditional).
  // Fetching is suppressed until the user is authenticated, non-admin, and
  // has completed onboarding so we never hit the endpoint prematurely.
  const isLearner = isAuthenticated && user?.role !== "admin" && user?.role !== "parent";
  const { data: subscriptionStatus, isLoading: subLoading } = useQuery<{ active: boolean; status: string | null; trialEndsAt: string | null; parentFlow?: { isMinor: boolean; consentGranted: boolean; cardCaptured: boolean; pending: boolean } | null }>({
    queryKey: ["/api/user/subscription-status"],
    enabled: isLearner && onboardingComplete === true,
  });
  const subscriptionActive = subscriptionStatus?.active;
  // Minor learners with consent/card still pending never see /subscribe —
  // they wait on the parent gate instead (consent + card starts the trial).
  const parentGatePending = Boolean(subscriptionStatus?.parentFlow?.pending);

  if (authLoading || (isAuthenticated && onboardingLoading)) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    window.location.href = "/signin";
    return null;
  }

  if (user?.role === "admin") {
    return <>{children}</>;
  }

  if (user && !(user as any).roleConfirmed) {
    window.location.href = "/role-select";
    return null;
  }

  if (user?.role === "parent") {
    window.location.href = "/parent";
    return null;
  }

  if (!onboardingComplete) {
    window.location.href = "/onboarding";
    return null;
  }

  if (subLoading) return <PageLoader />;

  if (!subscriptionActive) {
    window.location.href = parentGatePending ? "/waiting-for-parent" : "/subscribe";
    return null;
  }

  return <>{children}</>;
}

// Task #394 — Client-side admin gate. Backend `/api/admin/*` routes are
// authoritatively guarded by `requireRole("admin")` plus the email allowlist
// (server/replit_integrations/auth/replitAuth.ts), but admin pages also need a
// client guard so non-admins never see a flash of admin chrome before the API
// calls fail. Auth state is loaded BEFORE rendering children — never a flash.
function RequireAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    // Task #394 — preserve current admin path so OIDC's
    // successReturnToOrRedirect lands the user back here after sign-in.
    // Non-admins then immediately see the "Admin Only" block below.
    //
    // SAFE: `returnTo` is derived exclusively from the browser's own
    // window.location (same-origin, never user-supplied text) and is
    // encodeURIComponent-encoded before being appended to the hardcoded
    // `/signin?returnTo=` base URL.  The destination of the href
    // itself (`/api/login`) is a hardcoded internal path.
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/signin?returnTo=${returnTo}`; // nosemgrep: no-raw-window-location-href-variable
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 bg-black text-white"
        data-testid="admin-only-block"
        data-task="394"
      >
        <div className="max-w-md text-center rounded-2xl p-8 border border-white/15 bg-black/60 ">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-400">
            Admin Only
          </p>
          <h1 className="text-xl font-black text-white mt-2">
            This page is for administrators only.
          </h1>
          <p className="text-sm text-white mt-3">
            Your account does not have admin privileges. If you believe this is
            an error, please contact support.
          </p>
          <a
            href="/dashboard"
            className="inline-block mt-5 text-xs font-bold underline text-white"
            data-testid="link-dashboard"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Parent-only route guard. Backend `/api/parent/*` routes are authoritatively
// guarded by `requireRole("parent","admin")`; this client guard ensures
// non-parents never see parent chrome and the role boundary holds at the
// router layer too.
function RequireParentRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    // SAFE: `returnTo` is derived exclusively from the browser's own
    // window.location (same-origin, never user-supplied text) and is
    // encodeURIComponent-encoded before being appended to the hardcoded
    // `/signin?returnTo=` base URL.  See RequireAdminRoute for details.
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/signin?returnTo=${returnTo}`; // nosemgrep: no-raw-window-location-href-variable
    return null;
  }

  // Admins reach the parent dashboard too, so support can see exactly what a
  // parent sees without needing a parent login. The server still scopes every
  // parent query by the caller's own id, so an admin sees the empty state
  // rather than another family's data.
  if (user?.role === "parent" || user?.role === "admin") {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-black text-white"
      data-testid="parent-only-block"
    >
      <div className="max-w-md text-center rounded-2xl p-8 border border-white/15 bg-black/60 ">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
          Parent Only
        </p>
        <h1 className="text-xl font-black text-white mt-2">
          This page is for linked parent accounts.
        </h1>
        <p className="text-sm text-white mt-3">
          Your account is not registered as a parent. If you believe this is an
          error, please contact support.
        </p>
        <a
          href="/dashboard"
          className="inline-block mt-5 text-xs font-bold underline text-white"
          data-testid="link-dashboard"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}

// School-admin route guard. Allows school_admin users (scoped to their school)
// and platform admins (who can inspect any school via ?schoolId=).
function RequireSchoolAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    // SAFE: `returnTo` is derived exclusively from the browser's own
    // window.location (same-origin, never user-supplied text) and is
    // encodeURIComponent-encoded before being appended to the hardcoded
    // `/signin?returnTo=` base URL.  See RequireAdminRoute for details.
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/signin?returnTo=${returnTo}`; // nosemgrep: no-raw-window-location-href-variable
    return null;
  }

  if (user?.role === "school_admin" || user?.role === "admin") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <div className="max-w-md text-center rounded-2xl p-8 border border-white/15 bg-black/60 ">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-400">
          School Admin Only
        </p>
        <h1 className="text-xl font-black text-white mt-2">
          This page is for school administrators.
        </h1>
        <p className="text-sm text-white mt-3">
          Your account does not have school admin access. Contact your school representative or BrainTrack support.
        </p>
        <a href="/dashboard" className="inline-block mt-5 text-xs font-bold underline text-white">
          Back to dashboard
        </a>
      </div>
    </div>
  );
}

function ParentDashboardAliasRedirect() {
  useEffect(() => {
    const search = window.location.search || "";
    window.location.replace("/parent" + search);
  }, []);
  return <PageLoader />;
}

function DbePortalAliasRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("from", "legacy");
    window.location.replace("/learn/admin/dbe-portal?" + params.toString());
  }, []);
  return <PageLoader />;
}

function AdminOrLearnerDashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboardPage />;
  return <DashboardPage />;
}

function LearnerOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    window.location.href = "/signin";
    return null;
  }

  if (user?.role === "parent") {
    window.location.href = "/parent";
    return null;
  }

  return <>{children}</>;
}

// Task #43 — Parent registration flow guard. Allows authenticated users (incl.
// users whose role hasn't been confirmed yet) onto the page so they can finish
// the parent onboarding without ProtectedRoute bouncing them to /parent-dashboard.
function ParentOnboardingRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) {
    window.location.href = "/signin";
    return null;
  }
  return <>{children}</>;
}

function RoleSelectRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    window.location.href = "/signin";
    return null;
  }

  if (user?.roleConfirmed || user?.role === "admin") {
    window.location.href = "/dashboard";
    return null;
  }

  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  const { data: onboardingComplete, isLoading: onboardingLoading } = useQuery<boolean>({
    queryKey: ["/api/user/onboarding-status"],
    enabled: isAuthenticated,
  });

  if (isLoading || onboardingLoading) return <PageLoader />;

  if (!isAuthenticated) {
    window.location.href = "/signin";
    return null;
  }

  if (onboardingComplete) {
    window.location.href = "/dashboard";
    return null;
  }

  return <>{children}</>;
}

function SubscribeRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: onboardingComplete, isLoading: onboardingLoading } = useQuery<boolean>({
    queryKey: ["/api/user/onboarding-status"],
    enabled: isAuthenticated,
  });

  const { data: subscriptionStatus, isLoading: subLoading } = useQuery<{ active: boolean; status: string | null; trialEndsAt: string | null; parentFlow?: { isMinor: boolean; consentGranted: boolean; cardCaptured: boolean; pending: boolean } | null }>({
    queryKey: ["/api/user/subscription-status"],
    enabled: isAuthenticated && onboardingComplete === true,
  });
  const subscriptionActive = subscriptionStatus?.active;

  if (authLoading || (isAuthenticated && (onboardingLoading || (onboardingComplete && subLoading)))) {
    return <PageLoader />;
  }

  // Already fully subscribed learners have nothing to do on /subscribe.
  if (isAuthenticated && user?.role !== "admin" && onboardingComplete && subscriptionActive) {
    window.location.href = "/dashboard";
    return null;
  }

  // Minors may not self-activate a trial — the parent gate owns activation.
  if (isAuthenticated && user?.role !== "admin" && onboardingComplete && subscriptionStatus?.parentFlow?.pending) {
    window.location.href = "/waiting-for-parent";
    return null;
  }

  return <>{children}</>;
}

function GlobalFooter() {
  const [location] = useLocation();
  // Whitelist: the handoff redesign gives landing/features/research their own
  // comp footers, and app surfaces (learner/parent/admin) use their own shells —
  // the shared PublicFooter only belongs on plain public/legal pages.
  const showOn = [
    "/privacy-policy", "/terms-of-service", "/cookie-policy", "/refund-policy",
    "/about", "/join", "/parent-consent", "/parent-onboarding",
  ];
  if (!showOn.some(p => location.startsWith(p))) return null;
  return <PublicFooter />;
}

function GlobalCookieBanner() {
  const [location] = useLocation();
  // Admin surfaces excluded: the consent banner is for visitors and learners,
  // and on the admin console it overlays the bottom rows of data tables (it
  // even intercepted clicks during automated QA of the content editor).
  const hideOn = ["/exam-session", "/bst-exam", "/onboarding", "/learn/admin", "/admin"];
  if (hideOn.some(p => location.startsWith(p))) return null;
  return <CookieConsentBanner />;
}

function GlobalNova() {
  const { isAuthenticated, user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    const isLearner = isAuthenticated && user?.role === "learner";
    if (!isLearner) {
      setTheme("blanc");
    }
  }, [isAuthenticated, user, setTheme]);

  // Old NovaBot launcher retired — RizzSupportBot (handoff redesign) is the
  // single floating assistant. This component still enforces the non-learner
  // theme, which is why it stays mounted.
  return null;
}

function GlobalSocketConnector() {
  useSocket();
  return null;
}

function LearnerNotificationEnforcer() {
  const { isAuthenticated, user } = useAuth();
  const push = usePushNotifications();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "learner") return;
    if (!push.isSupported) return;
    if (push.isSubscribed) return;
    if (attempted.current) return;
    if (push.permissionState === "granted") {
      attempted.current = true;
      push.enable().catch(() => {});
    }
  }, [isAuthenticated, user, push]);

  return null;
}

function LanguageSync() {
  const { isAuthenticated, user } = useAuth();
  const { setLanguage } = useLanguage();
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const currentUserId = user.id ?? null;
    if (currentUserId === prevUserId.current) return;
    prevUserId.current = currentUserId;
    const raw = user.preferredLanguage;
    if (!raw || typeof raw !== "string") return;
    const key = raw.trim().toLowerCase();
    const normalized: "en" | "af" | null =
      key === "en" ? "en"
      : key === "af" ? "af"
      : null;
    if (normalized) {
      setLanguage(normalized);
    }
  }, [isAuthenticated, user, setLanguage]);

  return null;
}

function Router() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={LandingPage} />

        <Route path="/onboarding">
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        </Route>

        <Route path="/subscribe">
          <SubscribeRoute>
            <SubscribePage />
          </SubscribeRoute>
        </Route>

        {/* Native email + password auth — works without Replit OIDC. */}
        <Route path="/signin"><SignInPage /></Route>
        <Route path="/login"><SignInPage /></Route>

        <Route path="/dashboard">
          <ProtectedRoute>
            <AdminOrLearnerDashboard />
          </ProtectedRoute>
        </Route>

        {/*
          Legacy alias for /dashboard. "Classroom" used to name three different
          places at once — this route, the subjects list heading, and the
          single-subject page title — so the label was removed from the UI.
          The route stays so old links and bookmarks keep working.
        */}
        <Route path="/classroom">
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </ProtectedRoute>
        </Route>

        <Route path="/subjects">
          <ProtectedRoute>
            <SubjectsPage />
          </ProtectedRoute>
        </Route>

        <Route path="/subject/:id">
          <ProtectedRoute>
            <SubjectDetailPage />
          </ProtectedRoute>
        </Route>

        <Route path="/tutor">
          <ProtectedRoute>
            <TutorPage />
          </ProtectedRoute>
        </Route>

        <Route path="/progress">
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        </Route>

        <Route path="/exam-ready">
          <ProtectedRoute>
            <ExamReadyPage />
          </ProtectedRoute>
        </Route>

        <Route path="/settings">
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        </Route>

        {/* Legacy alias — keep inbound /parent-dashboard URLs working. */}
        <Route path="/parent-dashboard">
          <ParentDashboardAliasRedirect />
        </Route>

        {/* Legacy aliases — bookmarked DBE admin URLs redirect to the new portal. */}
        <Route path="/admin/dbe">
          <DbePortalAliasRedirect />
        </Route>
        <Route path="/admin/dbe-advanced">
          <DbePortalAliasRedirect />
        </Route>
        <Route path="/learn/admin/dbe">
          <DbePortalAliasRedirect />
        </Route>
        <Route path="/learn/admin/dbe-advanced">
          <DbePortalAliasRedirect />
        </Route>

        <Route path="/parent">
          <RequireParentRoute>
            <ParentDashboardPage />
          </RequireParentRoute>
        </Route>

        {/* Launch flow — parent creates + activates their child's learner
            account and hands over the on-screen credentials. */}
        <Route path="/parent/activate-child">
          <RequireParentRoute>
            <ParentActivateChildPage />
          </RequireParentRoute>
        </Route>

        <Route path="/about" component={AboutPage} />
        <Route path="/research" component={ResearchPage} />
        <Route path="/features" component={FeaturesPage} />
        <Route path="/for-schools" component={ForSchoolsPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms-of-service" component={TermsOfServicePage} />
        <Route path="/cookie-policy" component={CookiePolicyPage} />
        <Route path="/refund-policy" component={RefundPolicyPage} />
        <Route path="/activate" component={ActivatePage} />
        <Route path="/calendar" component={PrintableCalendarPage} />
        <Route path="/past-papers" component={PastPapersPage} />

        <Route path="/exam-mode">
          <ProtectedRoute>
            <ExamModePage />
          </ProtectedRoute>
        </Route>

        <Route path="/exam/mini-mock">
          <ProtectedRoute>
            <ExamMiniMockPage />
          </ProtectedRoute>
        </Route>

        <Route path="/exam/full">
          <ProtectedRoute>
            <ExamFullPage />
          </ProtectedRoute>
        </Route>

        <Route path="/daily-challenge">
          <ProtectedRoute>
            <DailyChallengePage />
          </ProtectedRoute>
        </Route>

        <Route path="/study-calendar">
          <ProtectedRoute>
            <StudyCalendarPage />
          </ProtectedRoute>
        </Route>

        <Route path="/prelim-timetable">
          <ProtectedRoute>
            <PrelimTimetablePage />
          </ProtectedRoute>
        </Route>

        <Route path="/bst-exam">
          <ProtectedRoute>
            <BSTExamPage />
          </ProtectedRoute>
        </Route>

        <Route path="/exam-session">
          <ProtectedRoute>
            <ExamSessionPage />
          </ProtectedRoute>
        </Route>

        <Route path="/admin-signin">
          <AdminSignInPage />
        </Route>

        {/* Legacy aliases — the DBE Portal now lives under the Admin Panel. */}
        <Route path="/dbe-portal/login">
          <DbePortalAliasRedirect />
        </Route>

        <Route path="/dbe-portal">
          <DbePortalAliasRedirect />
        </Route>

        <Route path="/learn/admin">
          <RequireAdminRoute>
            <AdminDashboardPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/dbe-portal">
          <RequireAdminRoute>
            <DBEPortalPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/reports">
          <RequireAdminRoute>
            <AdminReportsPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/products">
          <RequireAdminRoute>
            <AdminProductsPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/billing">
          <RequireAdminRoute>
            <AdminBillingPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/admin/content-studio">
          <RequireAdminRoute>
            <AdminContentStudioPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/partner-branding">
          <RequireAdminRoute>
            <AdminPartnerBrandingPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/school-qr">
          <RequireAdminRoute>
            <AdminSchoolQRPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/qr">
          <RequireAdminRoute>
            <AdminQrGeneratorPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/emails">
          <RequireAdminRoute>
            <AdminEmailsPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/content">
          <RequireAdminRoute>
            <AdminContentEditorPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/learn/admin/consent/:userId">
          <RequireAdminRoute>
            <AdminConsentLogPage />
          </RequireAdminRoute>
        </Route>

        <Route path="/dbe-practice">
          <ProtectedRoute>
            <DbePracticePage />
          </ProtectedRoute>
        </Route>

        <Route path="/flashcards">
          <ProtectedRoute>
            <FlashcardsPage />
          </ProtectedRoute>
        </Route>

        <Route path="/revision/:subjectId">
          <ProtectedRoute>
            <RevisionPage />
          </ProtectedRoute>
        </Route>

        <Route path="/rewards">
          <LearnerOnlyRoute>
            <RewardsPage />
          </LearnerOnlyRoute>
        </Route>

        <Route path="/store">
          <LearnerOnlyRoute>
            <StorePage />
          </LearnerOnlyRoute>
        </Route>

        <Route path="/my-notes">
          <LearnerOnlyRoute>
            <MyNotesPage />
          </LearnerOnlyRoute>
        </Route>

        <Route path="/journey">
          <ProtectedRoute>
            <JourneyPage />
          </ProtectedRoute>
        </Route>

        <Route path="/role-select">
          <RoleSelectRoute>
            <RoleSelectPage />
          </RoleSelectRoute>
        </Route>

        {/* Task #43 — Parent registration flow + public consent confirmation */}
        <Route path="/parent-onboarding">
          <ParentOnboardingRoute>
            <ParentOnboardingPage />
          </ParentOnboardingRoute>
        </Route>
        <Route path="/parent-consent" component={ParentConsentPage} />

        {/* Minor learners wait here until parent consent + card capture. */}
        <Route path="/waiting-for-parent">
          <LearnerOnlyRoute>
            <WaitingForParentPage />
          </LearnerOnlyRoute>
        </Route>

        <Route path="/school/dashboard">
          <RequireSchoolAdminRoute>
            <SchoolDashboardPage />
          </RequireSchoolAdminRoute>
        </Route>

        <Route path="/partner-schools" component={PartnerSchoolsPage} />
        <Route path="/join/:code" component={JoinPage} />

        <Route path="/school-onboarding" component={SchoolOnboardingPage} />

        <Route path="/parent-purchase" component={ParentPurchasePage} />

        <Route path="/terms" component={TermsOfServicePage} />
        <Route path="/privacy" component={PrivacyPolicyPage} />

        {/* Partner & channel tracking links */}
        <Route path="/sms" component={() => <PartnerLink source="sms" />} />
        <Route path="/sms-founding" component={() => <PartnerLink source="sms-founding-partner" />} />
        <Route path="/d6" component={() => <PartnerLink source="d6" />} />
        <Route path="/d6-app" component={() => <PartnerLink source="d6-app" />} />
        <Route path="/d6-schools" component={() => <PartnerLink source="d6-schools" />} />
        <Route path="/school" component={() => <PartnerLink source="school" />} />
        <Route path="/learner" component={() => <PartnerLink source="learner" />} />
        <Route path="/ref" component={ReferralLink} />
        <Route path="/outreach" component={() => <PartnerLink source="outreach" />} />

        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}


function BottomBanners() {
  const { updateAvailable, applyUpdate } = useSwUpdate();
  return (
    <>
      {!updateAvailable && <InstallBanner />}
      <UpdateBanner updateAvailable={updateAvailable} applyUpdate={applyUpdate} />
    </>
  );
}

function App() {
  useContentProtection();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <CosmicBackground />
          <Toaster />
          <AdminPreviewBanner />
          <DemoAccountBadge />
          <LanguageSync />
          <GlobalSocketConnector />
          <LearnerNotificationEnforcer />
          <RefAttributionDetector />
          <LearnerReferralAttribution />
          <Router />
          <GlobalFooter />
          <GlobalNova />
          <RizzSupportBot />
          <BottomBanners />
          <AppRatingPrompt />
          <GlobalCookieBanner />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
