import { useEffect } from "react";
import { Shield, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
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
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4"
      data-testid="page-admin-signin"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-8 shadow-xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center">
            <Shield className="w-7 h-7 text-white/80" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight" data-testid="text-admin-signin-title">
            {isAf ? "Beveiligde Aanmelding" : "Secure Sign in"}
          </h1>
          <p className="text-xs text-white leading-relaxed">
            {isAf
              ? "Hierdie area is slegs vir gemagtigde personeel. Meld aan om voort te gaan."
              : "This area is restricted to authorised personnel. Sign in to continue."}
          </p>
          <p className="text-[11px] text-white leading-relaxed" data-testid="text-admin-signin-replit-note">
            {isAf
              ? "Rekening en wagwoord word deur Replit bestuur. Gebruik 'Wagwoord vergeet?' op die Replit-aanmeldskerm om dit terug te stel."
              : "Account and password are managed by Replit. Use 'Forgot password?' on the Replit sign-in screen to reset."}
          </p>

          {isAuthorized && (
            <p className="text-xs text-white" data-testid="text-admin-signin-redirect">
              {isAf ? "Word herlei…" : "Redirecting…"}
            </p>
          )}

          {isWrongAccount && (
            <div className="w-full rounded-md border border-border/60 bg-muted/30 p-3 text-[11px] text-white" data-testid="text-admin-signin-wrong-account">
              {isAf
                ? "Jou rekening het nie toegang tot hierdie area nie."
                : "Your account does not have access to this area."}
            </div>
          )}

          {!isAuthenticated && (
            <Button
              className="w-full mt-2"
              onClick={() => {
                window.location.href = "/api/login?returnTo=/admin-signin";
              }}
              data-testid="button-admin-signin"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isAf ? "Aanmeld" : "Sign in"}
            </Button>
          )}

          {isWrongAccount && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = "/api/auth/logout";
              }}
              data-testid="button-admin-signin-switch"
            >
              {isAf ? "Wissel rekening" : "Switch account"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
