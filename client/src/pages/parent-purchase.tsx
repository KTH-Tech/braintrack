import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";

// Task #413 — Open access. Brain Boost is free for everyone right now, so the
// /parent-purchase page is a "Coming Soon / not required" placeholder. The
// original purchase flow is preserved in version control for re-enablement.
export default function ParentPurchasePage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isAf = language === "af";

  useSEO({
    title: isAf
      ? "Brain Boost — 14-dae gratis proef | BrainTrack"
      : "Brain Boost — 14-Day Free Trial | BrainTrack",
    description: isAf
      ? "Brain Boost: R169/maand met 14 dae gratis. Kanselleer enige tyd."
      : "Brain Boost: R169/month with 14 days free. Cancel anytime.",
    canonical: "https://app.braintrack.co.za/parent-purchase",
  });

  const homeHref = isAuthenticated ? "/parent" : "/";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div
        className="prismglass-panel max-w-lg w-full text-center px-6 py-10 sm:px-10 sm:py-12"
        data-testid="parent-purchase-coming-soon"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/30 mb-5">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary mb-2">
          {isAf ? "Brain Boost" : "Brain Boost"}
        </p>

        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
          {isAf ? "R169/maand · 14 dae gratis" : "R169/month · 14 days free"}
        </h1>

        <p className="text-sm text-white mb-2">
          {isAf
            ? "Brain Boost gee jou kind volle toegang — studieplanne, regte NSC-vraestelle en memo's, onmiddellike nasien, en Rizz (KI-tutor). Geen heffing tydens die proeftydperk nie, en jy kanselleer enige tyd direk in die app."
            : "Brain Boost gives your child full access — study plans, real NSC papers and memos, instant marking, and Rizz (AI tutor). No charge during the trial, and you cancel anytime directly in the app."}
        </p>

        <p className="text-sm text-white mb-8">
          {isAf
            ? "Meld net aan en koppel jou kind se rekening met sy aktiveringskode."
            : "Just sign in and link your child's account using their activation code."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={homeHref}>
            <Button className="w-full sm:w-auto" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isAuthenticated
                ? isAf
                  ? "Terug na ouer-dashboard"
                  : "Back to parent dashboard"
                : isAf
                  ? "Terug na tuisblad"
                  : "Back to home"}
            </Button>
          </Link>
          {!isAuthenticated && (
            <a href="/api/login">
              <Button variant="outline" className="w-full sm:w-auto" data-testid="button-sign-in">
                {isAf ? "Meld aan" : "Sign in"}
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
