import { Link } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

/**
 * Cosmic-neon back/home bar for footer pages (about, faq, privacy, terms).
 * Use at the top of the page content for quick escape back to the landing page
 * and / or the learner dashboard.
 */
export function FooterPageNav({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const isAf = language === "af";
  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="footer-page-nav">
      <Link href="/">
        <button
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black text-sm font-semibold"
          style={{
            color: "#28c9d6",
            border: "1.5px solid #28c9d6",
            boxShadow: "0 0 12px rgba(40,201,214,0.35)",
          }}
          data-testid="footer-nav-back"
        >
          <ArrowLeft className="h-4 w-4" />
          {isAf ? "Terug" : "Back"}
        </button>
      </Link>
      <Link href="/">
        <button
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black text-sm font-semibold"
          style={{
            color: "#ff8a1f",
            border: "1.5px solid #ff8a1f",
            boxShadow: "0 0 12px rgba(255,138,31,0.35)",
          }}
          data-testid="footer-nav-home"
        >
          <Home className="h-4 w-4" />
          {isAf ? "Tuis" : "Home"}
        </button>
      </Link>
    </div>
  );
}

/** Big "Back to Home" button for bottom of footer pages. */
export function FooterPageHomeButton() {
  const { language } = useLanguage();
  const isAf = language === "af";
  return (
    <div className="text-center pt-6" data-testid="footer-page-home-bottom">
      <Link href="/">
        <button
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-base font-bold"
          style={{
            color: "#ffd83a",
            border: "1.5px solid #ffd83a",
            boxShadow: "0 0 16px rgba(255,216,58,0.4), 0 0 32px rgba(255,216,58,0.2)",
          }}
          data-testid="button-back-home-bottom"
        >
          <Home className="h-4 w-4" />
          {isAf ? "Terug na Tuisblad" : "Back to Home"}
        </button>
      </Link>
    </div>
  );
}
