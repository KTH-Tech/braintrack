import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Database, ShieldCheck } from "lucide-react";
import { BrainTrackLogo } from "@/components/braintrack-logo";

export default function DBEPortalLogin() {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      try { localStorage.removeItem("braintrack:dbe-portal:ui"); } catch {}
    }
    if (!isLoading && isAuthenticated && user?.role === "admin") {
      window.location.replace("/dbe-portal");
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (isAuthenticated && user?.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  const returnTo = encodeURIComponent("/dbe-portal");

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-black"
      style={{
        backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,229,255,0.12) 0%, transparent 70%)",
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 space-y-7 relative overflow-hidden"
        style={{
          background: "#0a0b12",
          border: "1.5px solid rgba(0,229,255,0.35)",
          boxShadow:
            "0 0 40px rgba(0,229,255,0.18), 0 0 80px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.06) 0%, transparent 50%, rgba(138,43,255,0.05) 100%)",
          }}
        />

        <div className="relative space-y-5 text-center">
          <div className="flex justify-center">
            <BrainTrackLogo className="h-8 w-auto" />
          </div>

          <div>
            <div
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] px-3 py-1 rounded-full mb-3"
              style={{
                color: "#7FEFFF",
                border: "1px solid rgba(0,229,255,0.4)",
                background: "rgba(0,229,255,0.08)",
              }}
            >
              <Database className="w-3 h-3" />
              DBE Admin Portal
            </div>
            <h1
              className="text-xl font-black text-white"
              style={{ textShadow: "0 0 20px rgba(0,229,255,0.3)" }}
            >
              Content Console
            </h1>
            <p className="text-sm text-white mt-1.5">
              Restricted to verified administrators.
            </p>
          </div>
        </div>

        <div className="relative space-y-3">
          {isAuthenticated && user?.role !== "admin" ? (
            <div className="rounded-xl p-4 text-center space-y-2" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}>
              <p
                className="text-xs font-black uppercase tracking-[0.15em]"
                style={{ color: "#f87171" }}
              >
                Access Denied
              </p>
              <p className="text-xs text-white">
                Your account does not have administrator access. Contact BrainTrack support if you believe this is an error.
              </p>
              <a
                href="/dashboard"
                className="inline-block mt-1 text-xs font-bold underline"
                style={{ color: "#7FEFFF" }}
              >
                Back to dashboard
              </a>
            </div>
          ) : (
            <>
              <a
                href={`/api/login?returnTo=${returnTo}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-black uppercase tracking-[0.1em] transition-all"
                style={{
                  color: "#0a0a0a",
                  background: "linear-gradient(135deg, #7FEFFF 0%, #1aa8b4 100%)",
                  boxShadow: "0 0 20px rgba(0,229,255,0.45), 0 4px 16px rgba(0,0,0,0.4)",
                }}
                data-testid="btn-sign-in"
              >
                <ShieldCheck className="w-4 h-4" />
                Sign in with Replit
              </a>
              <p className="text-center text-[11px] text-white">
                Admin access verified via ADMIN_EMAILS allowlist
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
