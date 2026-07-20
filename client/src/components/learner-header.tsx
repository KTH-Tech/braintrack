import { Link } from "wouter";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import type { ReactNode } from "react";

interface LearnerHeaderProps {
  /** Route the back button navigates to. Defaults to the learner dashboard. */
  backHref?: string;
  /** Back-button label, already localized by the caller. */
  backLabel: string;
  /** Page title shown in Permanent Marker next to the back button (hidden below sm). */
  title: string;
  /** Hex color for the title text. Defaults to the app's aqua accent. */
  titleColor?: string;
  /** Extra content rendered after the title — badges, a mascot, etc. */
  titleExtra?: ReactNode;
  /** Extra buttons rendered before the language toggle / sign-out controls. */
  actions?: ReactNode;
  /** Constrains the header's inner row width to match the page's content column. */
  maxWidthClassName?: string;
}

/**
 * Shared sticky top bar for every learner-facing sub-page (Subjects, Progress,
 * Flashcards, Study Plan, Tutor, exam flows, etc.). Centralizing this avoids the
 * per-page drift that crept in when each page hand-copied its own header —
 * different paddings, icon sizes, and a couple of buttons that silently lost
 * their visible label.
 */
export function LearnerHeader({
  backHref = "/dashboard",
  backLabel,
  title,
  titleColor = "#9FF5E8",
  titleExtra,
  actions,
  maxWidthClassName = "max-w-7xl",
}: LearnerHeaderProps) {
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,.08)" }}
    >
      <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={backHref}>
              <button
                data-testid="link-home"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 shrink-0"
                style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">{backLabel}</span>
              </button>
            </Link>
            <span
              className="hidden sm:inline truncate"
              style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: titleColor, transform: "rotate(-2deg)" }}
            >
              {title}
            </span>
            {titleExtra}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {actions}
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10"
              style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }}
              data-testid="button-language-toggle"
            >
              {isAf ? "AF" : "EN"}
            </button>
            <button
              onClick={() => logout()}
              data-testid="button-logout"
              aria-label={isAf ? "Uitteken" : "Sign Out"}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10"
              style={{ color: "#FFB7E5", border: "1.5px solid #FFB7E5" }}
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{isAf ? "Uitteken" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
