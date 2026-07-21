import { useEffect } from "react";
import { Shield, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { AdminGround, NeonShell } from "@/components/admin-ui";

function PageLoader() {
  return (
    <AdminGround className="flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#9FF5E8" }} />
    </AdminGround>
  );
}

export default function AdminSignInPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isAf = language === "af";

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === "admin") {
      window.location.href = "/dashboard";
    }
  }, [isLoading, isAuthenticated, user?.role]);

  if (isLoading) return <PageLoader />;

  const isAuthorized = isAuthenticated && user?.role === "admin";
  const isWrongAccount = isAuthenticated && user?.role !== "admin";

  return (
    <AdminGround className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm" data-testid="page-admin-signin">
        <NeonShell color="#9FF5E8" className="p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(159,245,232,0.1)", border: "1px solid rgba(159,245,232,0.4)" }}
            >
              <Shield className="w-7 h-7" style={{ color: "#9FF5E8" }} />
            </div>
            <div role="heading" aria-level={1} className="text-lg font-black tracking-tight text-white" data-testid="text-admin-signin-title">
              {isAf ? "Beveiligde Aanmelding" : "Secure Sign in"}
            </div>
            <p className="text-xs text-white leading-relaxed">
              {isAf
                ? "Hierdie area is slegs vir gemagtigde personeel. Meld aan om voort te gaan."
                : "This area is restricted to authorised personnel. Sign in to continue."}
            </p>
            <p className="text-[11px] text-white leading-relaxed">
              {isAf
                ? "Gebruik 'Wagwoord vergeet?' op die aanmeldskerm om jou wagwoord terug te stel."
                : "Use 'Forgot password?' on the sign-in screen to reset your password."}
            </p>

            {isAuthorized && (
              <p className="text-xs font-bold" style={{ color: "#94F7C5" }} data-testid="text-admin-signin-redirect">
                {isAf ? "Word herlei…" : "Redirecting…"}
              </p>
            )}

            {isWrongAccount && (
              <div
                className="w-full rounded-xl p-3 text-[11px] text-white"
                style={{ background: "rgba(255,141,161,0.08)", border: "1px solid rgba(255,141,161,0.4)" }}
                data-testid="text-admin-signin-wrong-account"
              >
                {isAf
                  ? "Jou rekening het nie toegang tot hierdie area nie."
                  : "Your account does not have access to this area."}
              </div>
            )}

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/signin?returnTo=/admin-signin";
                }}
                data-testid="button-admin-signin"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wider transition-transform hover:scale-[1.02]"
                style={{ background: "#9FF5E8", color: "#050508" }}
              >
                <Lock className="w-4 h-4" />
                {isAf ? "Aanmeld" : "Sign in"}
              </button>
            )}

            {isWrongAccount && (
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/api/auth/logout";
                }}
                data-testid="button-admin-signin-switch"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-white transition"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}
              >
                {isAf ? "Wissel rekening" : "Switch account"}
              </button>
            )}
          </div>
        </NeonShell>
      </div>
    </AdminGround>
  );
}
