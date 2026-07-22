import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

// Task #43 — Public confirmation landing for parent-consent email links.
// Reads ?token=… . No auth is required — the JWT is the bearer of trust.
//
// Card-on-consent flow: granting consent now also captures the parent's card
// via a R1.00 Paystack verification charge (channels: ["card"]). The learner's
// 14-day trial starts only once BOTH consent and the card are captured. If
// Paystack isn't configured in this environment we fall back to the legacy
// consent-only confirmation so the flow never dead-ends.
export default function ParentConsentPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const [status, setStatus] = useState<"loading" | "intro" | "redirecting" | "ok" | "error">("loading");
  const [learnerName, setLearnerName] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [cardCaptured, setCardCaptured] = useState(false);
  const [token, setToken] = useState<string>("");

  // Token-scoped landing (only reached from the parent-consent email link).
  // Must be noindex — otherwise crawlers try each unique token URL and log 4xx.
  useSEO({
    title: "Parent consent | BrainTrack",
    description:
      "Confirm your consent so your Grade 12 learner can start their BrainTrack free trial.",
    canonical: "https://braintrack.tech/parent-consent",
    noIndex: true,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tok = params.get("token") ?? "";
    const reference = params.get("reference") ?? params.get("trxref") ?? "";
    const returningFromPaystack = params.get("paystack") === "return" && reference;
    if (!tok) { setStatus("error"); setReason("missing_token"); return; }
    setToken(tok);

    if (returningFromPaystack) {
      // Back from the Paystack card page — verify the R1 charge server-side.
      (async () => {
        try {
          const r = await fetch(`/api/parent-consent/card-capture/verify?token=${encodeURIComponent(tok)}&reference=${encodeURIComponent(reference)}`);
          const j = await r.json();
          if (!r.ok || !j?.ok) {
            setStatus("error");
            setReason(j?.error ?? "card_not_captured");
            return;
          }
          setLearnerName(j.learnerName ?? null);
          setCardCaptured(true);
          setStatus("ok");
        } catch {
          setStatus("error");
          setReason("network");
        }
      })();
      return;
    }

    // Fresh visit from the email — show the approve + add card step.
    setStatus("intro");
  }, []);

  async function handleApproveAndAddCard() {
    setStatus("redirecting");
    try {
      const r = await fetch("/api/parent-consent/card-capture/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = await r.json();
      if (r.status === 503) {
        // Paystack not configured (e.g. local/dev) — legacy consent-only path.
        const legacy = await fetch(`/api/onboarding/parent-consent/confirm?token=${encodeURIComponent(token)}`);
        const lj = await legacy.json();
        if (!legacy.ok || !lj?.ok) {
          setStatus("error");
          setReason(lj?.error ?? "unknown");
          return;
        }
        setLearnerName(lj.learnerName ?? null);
        setCardCaptured(false);
        setStatus("ok");
        return;
      }
      if (j?.alreadyCaptured) {
        setCardCaptured(true);
        setStatus("ok");
        return;
      }
      if (!r.ok || !j?.authorizationUrl) {
        setStatus("error");
        setReason(j?.error ?? "unknown");
        return;
      }
      // ACCEPTED RISK: server-returned Paystack checkout URL, not user-controlled
      window.location.href = j.authorizationUrl; // nosemgrep: no-raw-window-location-href-variable
    } catch {
      setStatus("error");
      setReason("network");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full" data-testid="parent-consent-card">
        <CardHeader>
          <CardTitle>
            {isAf ? "Ouer / Voog Toestemming" : "Parent / Guardian Consent"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-sm text-white">{isAf ? "Laai…" : "Loading…"}</p>
            </>
          )}
          {status === "redirecting" && (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-sm text-white">
                {isAf ? "Ons neem jou na die veilige kaartblad…" : "Taking you to the secure card page…"}
              </p>
            </>
          )}
          {status === "intro" && (
            <>
              <ShieldCheck className="w-12 h-12 text-[#9FF5E8] mx-auto" />
              <h2 className="text-lg font-bold" data-testid="consent-intro-title">
                {isAf ? "Keur goed & voeg 'n kaart by" : "Approve & add a card"}
              </h2>
              <p className="text-sm text-white text-left">
                {isAf
                  ? "Deur goed te keur, bevestig jy toestemming vir jou leerder se BrainTrack-rekening en voeg jy 'n kaart by vir ná die proeftydperk."
                  : "By approving, you confirm consent for your learner's BrainTrack account and add a card for after the trial."}
              </p>
              <ul className="text-sm text-white text-left space-y-2">
                <li>✓ {isAf ? "Eenmalige R1.00 kaartverifikasie (Paystack, veilig)" : "Once-off R1.00 card verification (Paystack, secure)"}</li>
                <li>✓ {isAf ? "14-dae gratis proeftydperk begin dadelik" : "14-day free trial starts immediately"}</li>
                <li>✓ {isAf ? "Eers ná 14 dae word R169/maand gehef" : "Only after 14 days is R169/month billed"}</li>
                <li>✓ {isAf ? "Kanselleer enige tyd in die app" : "Cancel anytime in the app"}</li>
              </ul>
              <Button
                className="w-full mt-2"
                onClick={handleApproveAndAddCard}
                data-testid="button-approve-add-card"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isAf ? "Keur goed & voeg kaart by" : "Approve & add card"}
              </Button>
              <p className="text-xs text-white">
                {isAf
                  ? "Jou kaartbesonderhede word deur Paystack hanteer — BrainTrack sien of stoor nooit jou kaartnommer nie."
                  : "Your card details are handled by Paystack — BrainTrack never sees or stores your card number."}
              </p>
            </>
          )}
          {status === "ok" && (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h2 className="text-lg font-bold" data-testid="consent-confirmed-title">
                {isAf ? "Toestemming bevestig" : "Consent confirmed"}
              </h2>
              <p className="text-sm text-white">
                {learnerName
                  ? (isAf
                      ? `Dankie! ${learnerName} se 14-dae proeftydperk is nou aktief, met volle toegang tot Smart Tutor en eksamen-modus.`
                      : `Thank you! ${learnerName}'s 14-day trial is now active, with full access to the Smart Tutor and exam mode.`)
                  : (isAf
                      ? "Dankie! Die leerder se rekening is geaktiveer."
                      : "Thank you! The learner's account is now activated.")}
              </p>
              {cardCaptured && (
                <p className="text-xs text-white">
                  {isAf
                    ? "Jou kaart is geverifieer (R1.00). Ná die 14-dae proeftydperk word R169/maand gehef — kanselleer enige tyd."
                    : "Your card is verified (R1.00). After the 14-day trial, R169/month is billed — cancel anytime."}
                </p>
              )}
              <Button asChild className="mt-2"><a href="/">{isAf ? "Klaar" : "Done"}</a></Button>
            </>
          )}
          {status === "error" && (
            <>
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-lg font-bold" data-testid="consent-error-title">
                {isAf ? "Skakel ongeldig" : "Link invalid"}
              </h2>
              <p className="text-sm text-white">
                {reason === "expired"
                  ? (isAf ? "Hierdie skakel het verval. Vra die leerder om 'n nuwe een te stuur." : "This link has expired. Please ask the learner to resend.")
                  : reason === "card_not_captured"
                  ? (isAf ? "Die kaartverifikasie is nie voltooi nie. Maak die skakel weer oop om te probeer." : "The card verification wasn't completed. Open the link again to retry.")
                  : (isAf ? "Ons kon nie hierdie skakel verifieer nie." : "We couldn't verify this link.")}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
