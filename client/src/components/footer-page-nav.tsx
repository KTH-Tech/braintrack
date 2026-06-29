import { Link } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

/**
 * Back/Home bar for footer pages (about, FAQ, privacy, terms).
 * Place at the top of page content so visitors can quickly escape back.
 */
export function FooterPageNav({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const isAf = language === "af";
  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="footer-page-nav">
      <Link href="/">
        <Button variant="cta-outline" size="sm" data-testid="footer-nav-back">
          <ArrowLeft className="h-4 w-4" />
          {isAf ? "Terug" : "Back"}
        </Button>
      </Link>
      <Link href="/">
        <Button variant="neon" size="sm" data-testid="footer-nav-home">
          <Home className="h-4 w-4" />
          {isAf ? "Tuis" : "Home"}
        </Button>
      </Link>
    </div>
  );
}

/** Large "Back to Home" anchor at the bottom of footer pages. */
export function FooterPageHomeButton() {
  const { language } = useLanguage();
  const isAf = language === "af";
  return (
    <div className="text-center pt-6" data-testid="footer-page-home-bottom">
      <Link href="/">
        <Button variant="cta-gold" size="lg" data-testid="button-back-home-bottom">
          <Home className="h-4 w-4" />
          {isAf ? "Terug na Tuisblad" : "Back to Home"}
        </Button>
      </Link>
    </div>
  );
}
