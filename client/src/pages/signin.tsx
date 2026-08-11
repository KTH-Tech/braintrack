// Native email + password sign-in / sign-up.
// Styled to the Luxury Street Graffiti handoff (see landing.tsx for the
// shared conventions). Talks to /api/auth/login and /api/auth/register.
// Wrapped in the shared public shell (PublicNav + PublicFooter). Auth logic,
// form state, testids and redirects are unchanged — this is a restyle only.
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const HEADLINE_GRADIENT = "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)";

const COPY = {
  en: {
    eyebrow: "welcome back",
    h1a: "Welcome back, ",
    h1b: "matric.",
    tagline: "The matric app in your pocket — built for Grade 12 learners.",
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
    createOne: "Get started",
    haveAccount: "Already have an account?",
    signInInstead: "Log on",
    passwordHint: "At least 10 characters.",
    forgotPassword: "Forgot your password?",
    forgotPasswordHint: "Email us to reset it — ",
    forgotPasswordLink: "learn@kth-tech.com",
    backHome: "← Back to home",
  },
  af: {
    eyebrow: "welkom terug",
    h1a: "Welkom terug, ",
    h1b: "matriek.",
    tagline: "Die matriek-app in jou sak — gebou vir Graad 12-leerders.",
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
    createOne: "Kom ons begin",
    haveAccount: "Het jy reeds 'n rekening?",
    signInInstead: "Meld aan",
    passwordHint: "Ten minste 10 karakters.",
    forgotPassword: "Wagwoord vergeet?",
    forgotPasswordHint: "E-pos ons om dit terug te stel — ",
    forgotPasswordLink: "learn@kth-tech.com",
    backHome: "← Terug na tuisblad",
  },
} as const;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#050508",
  border: "2px solid #fff",
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
    canonical: "https://braintrack.tech/signin",
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
      // Seed the auth-user cache synchronously with the user this request
      // just returned, THEN navigate. invalidateQueries() alone races: it
      // only *marks* ["/api/auth/user"] stale and kicks off a background
      // refetch, but useAuth()'s `user` stays at its old cached value until
      // that refetch resolves. navigate() below mounts ProtectedRoute
      // immediately, which read the stale (pre-login) `user` and hard-
      // redirected back to /signin before the fresh session ever landed —
      // wiping this component's state and stranding the user on the login
      // form even though registration/login had already succeeded.
      if (data?.user) qc.setQueryData(["/api/auth/user"], data.user);
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
    <div className="min-h-screen" style={{ background: "#050508", color: "#fff" }} data-testid="page-signin">
      <PublicNav />

      <main style={{ paddingTop: 64 }}>
        <style>{`
          .bts-input::placeholder { color: #9FD8FF; opacity: 1; }
          .bts-input:focus { border-color: #9FF5E8 !important; }
          .bts-cta { transition: transform .15s; }
          .bts-cta:hover:not(:disabled) { transform: translate(-3px,-3px); }
          .bts-cta:disabled { opacity: .7; cursor: not-allowed; }
          .bts-link { color: #9FF5E8; cursor: pointer; font-weight: 800; background: none; border: none; font-size: 14px; font-family: inherit; padding: 0; }
          .bts-link:hover { color: #FFB7E5; }
          .bts-role { cursor: pointer; transition: transform .12s; }
        `}</style>

        <section
          style={{
            width: "100%",
            maxWidth: 460,
            margin: "0 auto",
            padding: "44px 20px 72px",
            boxSizing: "border-box",
          }}
        >
          <h1
            style={{
              fontFamily: "'Bebas Neue', system-ui, sans-serif",
              fontSize: "clamp(30px,8.5vw,44px)",
              lineHeight: 1.05,
              letterSpacing: "-.5px",
              color: "#fff",
              margin: "0 0 12px",
            }}
          >
            {t.h1a}
            <span
              style={{
                background: HEADLINE_GRADIENT,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.h1b}
            </span>
          </h1>

          <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 26px", lineHeight: 1.4 }}>
            {t.tagline}
          </p>

          <div
            style={{
              width: "100%",
              background: "#050508",
              border: "2.5px solid #9FF5E8",
              borderRadius: 20,
              padding: 26,
              boxShadow: "6px 6px 0 0 #9FF5E8",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "-.4px",
                color: "#fff",
                margin: "0 0 20px",
                lineHeight: 1.2,
              }}
            >
              {isSignIn ? t.signInTitle : t.signUpTitle}
              <span
                style={{
                  background: HEADLINE_GRADIENT,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {isSignIn ? t.signInAccent : t.signUpAccent}
              </span>
            </h2>

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
                  <div style={{ fontSize: 12.5, color: "#fff", marginTop: 6 }}>{t.passwordHint}</div>
                )}
                {isSignIn && (
                  <div style={{ fontSize: 12.5, color: "#fff", marginTop: 8, lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 800 }}>{t.forgotPassword}</span>{" "}
                    {t.forgotPasswordHint}
                    <a
                      href={`mailto:learn@kth-tech.com?subject=${encodeURIComponent("Password reset request")}`}
                      data-testid="link-forgot-password"
                      style={{ color: "#9FD8FF", fontWeight: 800, textDecoration: "underline" }}
                    >
                      {t.forgotPasswordLink}
                    </a>
                  </div>
                )}
              </div>

              {!isSignIn && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{t.iAmA}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {(["learner", "parent"] as const).map((r) => (
                      <span key={r} className="bts-role" data-testid={`role-${r}`} onClick={() => setRole(r)}
                        style={{
                          flex: 1, textAlign: "center", padding: "11px 14px", borderRadius: 12, fontWeight: 800, fontSize: 14,
                          color: role === r ? "#050508" : "#fff",
                          background: role === r ? "#9FF5E8" : "transparent",
                          border: `2px solid ${role === r ? "#9FF5E8" : "#fff"}`,
                        }}>
                        {r === "learner" ? t.learner : t.parent}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div data-testid="auth-error" style={{ background: "#050508", border: "2.5px solid #FFB7E5", color: "#fff", borderRadius: 12, padding: "11px 14px", fontSize: 13.5, fontWeight: 700, boxShadow: "4px 4px 0 0 #FFB7E5" }}>
                  {error}
                </div>
              )}

              <button type="submit" className="pub-btn pub-btn-block bts-cta" disabled={submit.isPending} data-testid="button-submit-auth"
                style={{ marginTop: 4 }}>
                {submit.isPending ? (isSignIn ? t.signingIn : t.creating) : (isSignIn ? t.signIn : t.signUp)}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#fff", fontWeight: 600 }}>
              {isSignIn ? t.noAccount : t.haveAccount}{" "}
              <button type="button" className="bts-link" data-testid="button-toggle-auth-mode"
                onClick={() => { setMode(isSignIn ? "signup" : "signin"); setError(null); }}>
                {isSignIn ? t.createOne : t.signInInstead}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Link href="/">
              <span style={{ fontSize: 13.5, color: "#fff", fontWeight: 700, cursor: "pointer" }}>{t.backHome}</span>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
