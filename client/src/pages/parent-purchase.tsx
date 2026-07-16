import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Zap } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";
import { GraffitiSplats } from "@/components/graffiti-splats";

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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 bg-background overflow-hidden">
      <GraffitiSplats variant="hero" opacity={0.35} />

      <div
        className="prismglass-panel max-w-lg w-full text-center px-6 py-10 sm:px-10 sm:py-12 relative z-10"
        data-testid="parent-purchase-coming-soon"
      >
        <div className="absolute -top-3 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-[#FFC48F] to-[#FF9FE5] text-white border border-[#FFF29E] shadow-lg">
          ⭐ Early Tester
        </div>

        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/30 mb-5">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary mb-2">
          {isAf ? "Brain Boost" : "Brain Boost"}
        </p>

        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
          {isAf ? "R169/maand · 14 dae gratis" : "R169/month · 14 days free"}
        </h1>

        <div className="flex items-center justify-center gap-2 mb-4 text-xs font-bold text-foreground">
          <Zap className="w-3.5 h-3.5 text-[#FFF29E]" />
          <span style={{ color: "#7FEFFF" }}>
            {isAf ? "Jy kry alles nou — geen wag" : "You get everything now — no waiting"}
          </span>
        </div>

        <p className="text-sm text-foreground mb-2">
          {isAf
            ? "Brain Boost gee jou kind volle toegang — studieplanne, regte NSC-vraestelle en memo's, onmiddellike nasien, en Rizz (KI-tutor). Geen heffing tydens die proeftydperk nie, en jy kanselleer enige tyd direk in die app."
            : "Brain Boost gives your child full access — study plans, real NSC papers and memos, instant marking, and Rizz (AI tutor). No charge during the trial, and you cancel anytime directly in the app."}
        </p>

        <p className="text-sm text-foreground mb-8">
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
