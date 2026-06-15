import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";

export function PublicFooter() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const isAf = language === "af";
  const isParent = user?.role === "parent";

  return (
    <footer className="relative border-t border-border/50" data-testid="footer-public">
      <div className="h-[2px] w-full bg-gradient-to-r from-pink-500 via-orange-400 via-cyan-400 via-blue-500 to-emerald-400" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">

          <p className="text-[11px] text-white shrink-0">
            &copy; 2026 BrainTrack&trade;
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <Link href="/research" className="text-[11px] text-white hover:text-foreground transition-colors" data-testid="link-footer-research">
              {isAf ? "Navorsing" : "Research"}
            </Link>
            <Link href="/features" className="text-[11px] text-white hover:text-foreground transition-colors" data-testid="link-footer-how-it-works">
              {isAf ? "Kenmerke" : "Features"}
            </Link>
            <Link href="/terms-of-service" className="text-[11px] text-white hover:text-foreground transition-colors" data-testid="link-footer-terms">
              {isAf ? "Bepalings" : "Terms"}
            </Link>
            <Link href="/privacy-policy" className="text-[11px] text-white hover:text-foreground transition-colors" data-testid="link-footer-privacy">
              {isAf ? "Privaatheid" : "Privacy"}
            </Link>
            <Link href="/cookie-policy" className="text-[11px] text-white hover:text-foreground transition-colors" data-testid="link-footer-cookies">
              {isAf ? "Koekies" : "Cookies"}
            </Link>
            <a
              href="mailto:brain-support@kthtech.co.za"
              className="text-[11px] text-white hover:text-foreground transition-colors"
              data-testid="link-footer-contact"
            >
              {isAf ? "Kontak" : "Contact"}
            </a>
            <Link
              href="/subscribe"
              className="text-[11px] text-white hover:text-foreground transition-colors"
              data-testid="link-footer-subscribe"
            >
              {isAf ? "Inteken" : "Subscribe"}
            </Link>
            {isAuthenticated && user?.role !== "learner" && (
              <a
                href="/api/cancel-subscription"
                className="text-[11px] text-white hover:text-foreground transition-colors"
                data-testid="link-footer-cancel"
              >
                {isAf ? "Kanselleer" : "Cancel"}
              </a>
            )}
            {isParent && (
              <Link
                href="/parent"
                className="text-[11px] text-white hover:text-foreground transition-colors"
                data-testid="link-footer-parent-dashboard"
              >
                {isAf ? "Ouer Dashboard" : "Parent Dashboard"}
              </Link>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
}
