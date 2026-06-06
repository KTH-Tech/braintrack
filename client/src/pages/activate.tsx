import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle2, XCircle, Sparkles, BookOpen, Brain, Trophy, Globe } from "lucide-react";
import { BrainTrackLogo } from "@/components/braintrack-logo";

export default function ActivatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const [code, setCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPopia, setAcceptPopia] = useState(false);
  const [activationStatus, setActivationStatus] = useState<"pending" | "success" | "error" | "expired">("pending");
  const [activationDetails, setActivationDetails] = useState<{
    learnerName?: string;
    planName?: string;
    expiresAt?: string;
  } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activationCode = urlParams.get("code");
    if (activationCode) {
      setCode(activationCode);
    }
  }, []);

  const verifyMutation = useMutation({
    mutationFn: async (activationCode: string) => {
      const res = await apiRequest("POST", "/api/activation/verify", { code: activationCode });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        setActivationDetails({
          learnerName: data.learnerName,
          planName: data.planName,
          expiresAt: data.expiresAt,
        });
        setActivationStatus("pending");
      } else if (data.expired) {
        setActivationStatus("expired");
      } else {
        setActivationStatus("error");
      }
    },
    onError: () => {
      setActivationStatus("error");
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/activation/activate", { 
        code,
        acceptedTerms: acceptTerms,
        acceptedPopia: acceptPopia,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setActivationStatus("success");
        toast({
          title: isAf ? "Jou rekening is aktief!" : "Account Activated!",
          description: isAf ? "Welkom by BrainTrack™! Jy word aangestuur na inteken..." : "Welcome to BrainTrack™. Redirecting to login...",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 2000);
      } else {
        toast({
          title: isAf ? "Aktivering het nie gewerk nie" : "Activation Failed",
          description: data.message || (isAf ? "Probeer weer of kontak ons as die probleem aanhou." : "Please try again or contact support."),
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: isAf ? "Aktivering Misluk" : "Activation Failed",
        description: isAf ? "Iets het skeefgeloop. Probeer asseblief weer." : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (code.length >= 6) {
      verifyMutation.mutate(code);
    }
  };

  const handleActivate = () => {
    if (acceptTerms && acceptPopia) {
      activateMutation.mutate();
    }
  };

  const canActivate = acceptTerms && acceptPopia && code.length >= 6;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-end">
            <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-white hover:text-white transition-colors" data-testid="button-language-toggle">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-semibold">{language === "en" ? "EN" : "AF"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {activationStatus === "success" ? (
            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {isAf ? "Jou rekening is aktief!" : "Account Activated!"}
                </h2>
                <p className="text-white mb-6">
                  {isAf ? "Welkom by BrainTrack™! Jou intekening is reg en gereed." : "Welcome to BrainTrack™! Your subscription is now active."}
                </p>
                <div className="space-y-3 text-left bg-muted/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span>{isAf ? "Toegang tot alle Gr. 12 vakke" : "Access to all Grade 12 subjects"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <span>{isAf ? "Rizz as jou persoonlike tutor" : "Rizz assistance"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span>{isAf ? "Spoor jou vordering na" : "Track your progress"}</span>
                  </div>
                </div>
                <Button variant="gradient" className="w-full" onClick={() => window.location.href = "/api/login"}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isAf ? "Kom ons begin!" : "Start Learning"}
                </Button>
                <p className="mt-3 text-[11px] text-white leading-relaxed" data-testid="text-activate-replit-auth-note">
                  {isAf
                    ? "Aanmelding word deur Replit hanteer. As jy jou wagwoord moet terugstel, gebruik 'Wagwoord vergeet?' op die Replit-aanmeldskerm."
                    : "Sign-in is handled by Replit. To reset your password, use 'Forgot password?' on the Replit sign-in screen."}
                </p>
              </CardContent>
            </Card>
          ) : activationStatus === "expired" ? (
            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">{isAf ? "Die skakel is verval" : "Link Expired"}</h2>
                <p className="text-white mb-6">
                  {isAf ? "Hierdie aktiveringsskakel het verval. Vra jou ouer om 'n nuwe skakel aan te vra." : "This activation link has expired. Please ask your parent to request a new activation link."}
                </p>
                <Button variant="outline" className="border-green-500/50" onClick={() => navigate("/")}>
                  {isAf ? "Terug na Tuisblad" : "Go to Homepage"}
                </Button>
              </CardContent>
            </Card>
          ) : activationStatus === "error" ? (
            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">{isAf ? "Ongeldige skakel" : "Invalid Link"}</h2>
                <p className="text-white mb-6">
                  {isAf ? "Hierdie aktiveringsskakel is ongeldig of al gebruik. Kyk jou WhatsApp vir die regte skakel." : "This activation link is invalid or has already been used. Please check your WhatsApp for the correct link."}
                </p>
                <Button variant="outline" className="border-green-500/50" onClick={() => setActivationStatus("pending")}>
                  {isAf ? "Probeer weer" : "Try Again"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  {isAf ? "Aktiveer jou rekening" : "Activate Your Account"}
                </CardTitle>
                <CardDescription>
                  {isAf ? "Jou ouer het 'n BrainTrack™-intekening vir jou gekoop. Voer jou aktiveringskode in om te begin leer!" : "Your parent has purchased a BrainTrack™ subscription for you. Enter your activation code to get started."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activationDetails ? (
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-white">{isAf ? "Intekeningbesonderhede:" : "Subscription Details:"}</p>
                    <p className="font-medium">{activationDetails.learnerName}</p>
                    <p className="text-sm">{isAf ? "Plan" : "Plan"}: <span className="text-white font-medium">{activationDetails.planName}</span></p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="code">{isAf ? "Aktiveringskode" : "Activation Code"}</Label>
                    <Input
                      id="code"
                      placeholder={isAf ? "Voer jou aktiveringskode in" : "Enter your activation code"}
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="text-center text-lg tracking-widest font-mono"
                      maxLength={12}
                      data-testid="input-activation-code"
                    />
                    <p className="text-xs text-white text-center">
                      {isAf ? "Kyk jou WhatsApp vir die aktiveringsskakel van jou ouer" : "Check your WhatsApp for the activation link from your parent"}
                    </p>
                    <Button 
                      variant="gradient" 
                      className="w-full"
                      onClick={handleVerify}
                      disabled={code.length < 6 || verifyMutation.isPending}
                      data-testid="button-verify-code"
                    >
                      {verifyMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isAf ? "Verifieer..." : "Verifying..."}
                        </>
                      ) : (
                        isAf ? "Verifieer Kode" : "Verify Code"
                      )}
                    </Button>
                  </div>
                )}

                {activationDetails && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                          data-testid="checkbox-terms"
                        />
                        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          {isAf ? (
                            <>
                              Ek aanvaar die{" "}
                              <a href="/terms-of-service" className="text-white underline hover:opacity-80" target="_blank">
                                Diensvoorwaardes
                              </a>{" "}
                              en verstaan dat BrainTrack™ 'n leerdervoorbereidingsinstrument is, nie geaffilieer met die Departement van Basiese Onderwys nie.
                            </>
                          ) : (
                            <>
                              I accept the{" "}
                              <a href="/terms-of-service" className="text-white underline hover:opacity-80" target="_blank">
                                Terms of Service
                              </a>{" "}
                              and understand that BrainTrack™ is a learner preparation tool, not affiliated with the Department of Basic Education.
                            </>
                          )}
                        </label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="popia"
                          checked={acceptPopia}
                          onCheckedChange={(checked) => setAcceptPopia(checked as boolean)}
                          data-testid="checkbox-popia"
                        />
                        <label htmlFor="popia" className="text-sm leading-relaxed cursor-pointer">
                          {isAf ? (
                            <>
                              Ek stem in dat my data verwerk word in ooreenstemming met POPIA en die{" "}
                              <a href="/privacy-policy" className="text-white underline hover:opacity-80" target="_blank">
                                Privaatheidsbeleid
                              </a>
                              .
                            </>
                          ) : (
                            <>
                              I consent to my data being processed in accordance with POPIA and the{" "}
                              <a href="/privacy-policy" className="text-white underline hover:opacity-80" target="_blank">
                                Privacy Policy
                              </a>
                              .
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <Button
                      variant="gradient"
                      className="w-full"
                      onClick={handleActivate}
                      disabled={!canActivate || activateMutation.isPending}
                      data-testid="button-activate"
                    >
                      {activateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isAf ? "Aktiveer..." : "Activating..."}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {isAf ? "Aktiveer My Rekening" : "Activate My Account"}
                        </>
                      )}
                    </Button>
                  </>
                )}

                <p className="text-center text-xs text-white">
                  {isAf ? "Sukkel jy? Vra jou ouer om hul bestelbevestiging na te gaan of kontak ondersteuning." : "Having trouble? Ask your parent to check their order confirmation or contact support."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-white">
          <p>{isAf ? "BrainTrack™ is 'n leerdervoorbereidingsinstrument. Inhoud gebaseer op 10 jaar se NSC-eksamenpatrone." : "BrainTrack™ is a learner preparation tool. Content informed by 10 years of NSC exam patterns."}</p>
          <p className="mt-2">© {new Date().getFullYear()} BrainTrack™. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
