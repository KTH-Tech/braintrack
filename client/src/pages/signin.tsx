// Native email + password sign-in / sign-up.
// Styled to the Luxury Street Graffiti handoff (see landing.tsx for the
// shared conventions). Talks to /api/auth/login and /api/auth/register.
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

const CTA_GRADIENT = "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const HEADLINE_GRADIENT = "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)";

const COPY = {
  en: {
    eyebrow: "welcome back",
    signInTitle: "Log on to ",
    signInAccent: "BrainTrack",
    signUpTitle: "Create your ",
    signUpAccent: "BrainTrack account",
    email: "Email",
    password: "Password",
    firstName: "First name",
    lastName: "Last name",
    iAmA: "I am a",
    learner: "Learner",
    parent: "Parent",
    signIn: "Log on",
    signUp: "Create account",
    signingIn: "Logging on…",
    creating: "Creating account…",
    noAccount: "New to BrainTrack?",
    createOne: "Create an account",
    haveAccount: "Already have an account?",
    signInInstead: "Log on",
    passwordHint: "At least 10 characters.",
    backHome: "← Back to home",
  },
  af: {
    eyebrow: "welkom terug",
    signInTitle: "Meld aan by ",
    signInAccent: "BrainTrack",
    signUpTitle: "Skep jou ",
    signUpAccent: "BrainTrack-rekening",
    email: "E-pos",
    password: "Wagwoord",
    firstName: "Naam",
    lastName: "Van",
    iAmA: "Ek is 'n",
    learner: "Leerder",
    parent: "Ouer",
    signIn: "Meld aan",
    signUp: "Skep rekening",
    signingIn: "Meld aan…",
    creating: "Skep rekening…",
    noAccount: "Nuut by BrainTrack?",
    createOne: "Skep 'n rekening",
    haveAccount: "Het jy reeds 'n rekening?",
    signInInstead: "Meld aan",
    passwordHint: "Ten minste 10 karakters.",
    backHome: "← Terug na tuisblad",
  },
} as const;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(5,5,8,.6)",
  border: "1.5px solid rgba(255,255,255,.18)",
  borderRadius: 12,
  padding: "13px 15px",
  color: "#fff",
  fontFamily: "'Poppins',sans-serif",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

export default function SignInPage() {
  const { language } = useLanguage();
  const t = COPY[language];
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  // Prefill from THIS DEVICE's last successful login only. Deliberately not
  // hardcoded — baking an admin email into the public bundle would hand every
  // visitor the exact account to attack.
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem("bt:last-email") ?? ""; } catch { return ""; }
  });
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"learner" | "parent">("learner");
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: "Sign in | BrainTrack™",
    description: "Sign in to your BrainTrack account to continue your Grade 12 exam prep.",
  });

  const submit = useMutation({
    mutationFn: async () => {
      const url = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "signin"
          ? { email, password }
          : { email, password, firstName: firstName || undefined, lastName: lastName || undefined, role };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Something went wrong. Please try again.");
      return data;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries();
      try { localStorage.setItem("bt:last-email", email); } catch { /* private mode */ }
      const userRole = data?.user?.role ?? role;
      // Honour ?returnTo= (e.g. the footer Admin link) before role defaults.
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo");
      if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
        navigate(returnTo);
        return;
      }
      navigate(userRole === "admin" ? "/learn/admin" : userRole === "parent" ? "/parent" : "/classroom");
    },
    onError: (e: any) => setError(e?.message ?? "Something went wrong."),
  });

  const isSignIn = mode === "signin";

  return (
    <div style={{ minHeight: "100vh", background: "#050508", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <style>{`
        .bts-input:focus { border-color: #9FF5E8 !important; box-shadow: 0 0 0 3px rgba(159,245,232,.15); }
        .bts-cta { transition: transform .2s; }
        .bts-cta:hover:not(:disabled) { transform: translateY(-2px); }
        .bts-cta:disabled { opacity: .6; cursor: not-allowed; }
        .bts-link { color: #9FD8FF; cursor: pointer; font-weight: 700; background: none; border: none; font-size: 14px; font-family: inherit; }
        .bts-link:hover { color: #FFB7E5; }
        .bts-role { cursor: pointer; transition: all .18s; }
      `}</style>

      <Link href="/">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, cursor: "pointer" }}>
          <img src={iconTransparent} alt="BrainTrack" style={{ width: 52, height: 52, objectFit: "contain" }} />
          <span className="bt-wordmark" style={{ fontSize: 24, letterSpacing: "-.5px" }}>BrainTrack</span>
        </div>
      </Link>

      <div style={{ width: "100%", maxWidth: 420, background: "linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.015))", border: "1px solid rgba(255,255,255,.09)", borderRadius: 24, padding: 32 }}>
        <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFB7E5", fontSize: 15, transform: "rotate(-2deg)", marginBottom: 4 }}>
          {t.eyebrow}
        </div>
        <div role="heading" aria-level={1} style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.5px", color: "#fff", marginBottom: 22, lineHeight: 1.2 }}>
          {isSignIn ? t.signInTitle : t.signUpTitle}
          <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
            {isSignIn ? t.signInAccent : t.signUpAccent}
          </span>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setError(null); submit.mutate(); }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {!isSignIn && (
            <div style={{ display: "flex", gap: 12 }}>
              <input className="bts-input" style={inputStyle} placeholder={t.firstName} value={firstName}
                onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" data-testid="input-first-name" />
              <input className="bts-input" style={inputStyle} placeholder={t.lastName} value={lastName}
                onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" data-testid="input-last-name" />
            </div>
          )}

          <input className="bts-input" style={inputStyle} type="email" required placeholder={t.email} value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" data-testid="input-email" />

          <div>
            <input className="bts-input" style={inputStyle} type="password" required placeholder={t.password} value={password}
              onChange={(e) => setPassword(e.target.value)} minLength={isSignIn ? undefined : 10}
              autoComplete={isSignIn ? "current-password" : "new-password"} data-testid="input-password" />
            {!isSignIn && (
              <div style={{ fontSize: 12.5, color: "#fff", opacity: .8, marginTop: 6 }}>{t.passwordHint}</div>
            )}
          </div>

          {!isSignIn && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{t.iAmA}</div>
              <div style={{ display: "flex", gap: 10 }}>
                {(["learner", "parent"] as const).map((r) => (
                  <span key={r} className="bts-role" data-testid={`role-${r}`} onClick={() => setRole(r)}
                    style={{
                      flex: 1, textAlign: "center", padding: "11px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14,
                      color: role === r ? "#050508" : "#fff",
                      background: role === r ? "#9FF5E8" : "transparent",
                      border: `1.5px solid ${role === r ? "#9FF5E8" : "rgba(255,255,255,.18)"}`,
                    }}>
                    {r === "learner" ? t.learner : t.parent}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div data-testid="auth-error" style={{ background: "rgba(255,141,161,.12)", border: "1px solid #FF8DA1", color: "#FF8DA1", borderRadius: 12, padding: "11px 14px", fontSize: 13.5, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button type="submit" className="bts-cta" disabled={submit.isPending} data-testid="button-submit-auth"
            style={{
              fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16, color: "#050508",
              background: CTA_GRADIENT, backgroundSize: "200% 100%", animation: "bt-rainbow 5s linear infinite",
              border: "none", borderRadius: 12, padding: "15px 20px", cursor: "pointer",
              boxShadow: "0 0 16px rgba(255,183,229,.28)", marginTop: 4,
            }}>
            {submit.isPending ? (isSignIn ? t.signingIn : t.creating) : (isSignIn ? t.signIn : t.signUp)}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#fff" }}>
          {isSignIn ? t.noAccount : t.haveAccount}{" "}
          <button type="button" className="bts-link" data-testid="button-toggle-auth-mode"
            onClick={() => { setMode(isSignIn ? "signup" : "signin"); setError(null); }}>
            {isSignIn ? t.createOne : t.signInInstead}
          </button>
        </div>
      </div>

      <Link href="/">
        <span style={{ marginTop: 24, fontSize: 13.5, color: "#fff", opacity: .85, cursor: "pointer" }}>{t.backHome}</span>
      </Link>
    </div>
  );
}
