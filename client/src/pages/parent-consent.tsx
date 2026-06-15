import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

// Task #43 — Public confirmation landing for parent-consent email links.
// Reads ?token=… and POSTs to /api/onboarding/parent-consent/confirm. No auth
// is required — the JWT is the bearer of trust.
export default function ParentConsentPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [learnerName, setLearnerName] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") ?? "";
    if (!token) { setStatus("error"); setReason("missing_token"); return; }
    (async () => {
      try {
        const r = await fetch(`/api/onboarding/parent-consent/confirm?token=${encodeURIComponent(token)}`);
        const j = await r.json();
        if (!r.ok || !j?.ok) {
          setStatus("error");
          setReason(j?.error ?? "unknown");
          return;
        }
        setLearnerName(j.learnerName ?? null);
        setStatus("ok");
      } catch {
        setStatus("error");
        setReason("network");
      }
    })();
  }, []);

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
              <p className="text-sm text-white">{isAf ? "Bevestig…" : "Confirming…"}</p>
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
                      ? `Dankie! ${learnerName} kan nou volle toegang tot Smart Tutor en eksamen-modus gebruik.`
                      : `Thank you! ${learnerName} now has full access to the Smart Tutor and exam mode.`)
                  : (isAf
                      ? "Dankie! Die leerder se rekening is geaktiveer."
                      : "Thank you! The learner's account is now activated.")}
              </p>
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
                  : (isAf ? "Ons kon nie hierdie skakel verifieer nie." : "We couldn't verify this link.")}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
