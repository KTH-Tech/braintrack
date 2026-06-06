import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Globe, Menu, X, LogOut, FlaskConical, Sparkles, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { BadgeDollarSign } from "lucide-react";
const navLinks = [
  { href: "/research", en: "Research", af: "Navorsing", icon: FlaskConical },
  { href: "/features", en: "Features", af: "Kenmerke", icon: Sparkles },
  { href: "/subscribe", en: "Pricing", af: "Pryse", icon: BadgeDollarSign },
];

const adminNavLinks = [
  { href: "/learn/admin/dbe-portal", en: "DBE Portal", af: "DBE Portaal", icon: FileText },
];

export function PublicNav() {
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 nav-glass"
      data-testid="nav-public"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="mr-4 shrink-0" data-testid="link-brand">
              <BrainTrackLogo className="h-8 w-8" wordmark wordmarkClassName="text-base sm:text-lg" />
            </Link>

            <div className="flex items-center h-14 gap-0.5">
              {[...navLinks, ...(isAdmin ? adminNavLinks : [])].map((link) => {
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-testid={`link-nav-${link.en.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`nav-link relative flex items-center px-3.5 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-all duration-300 rounded-lg ${
                      isActive
                        ? "nav-link-active text-foreground"
                        : "text-white hover:text-foreground"
                    }`}
                  >
                    <link.icon className={`w-3.5 h-3.5 mr-1.5 transition-colors duration-300 ${isActive ? "text-primary" : "text-white"}`} />
                    <span className="relative z-10">
                      {language === "en" ? link.en : link.af}
                    </span>
                    {isActive && (
                      <span className="nav-active-indicator" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={toggleLanguage}
              data-testid="button-language-toggle"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold tracking-wide" data-testid="text-language-label">
                {language === "en" ? "EN" : "AF"}
              </span>
            </button>
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                {/* Admin entry-point lives in the footer now (PublicFooter) — admins see
                    the regular "My Classroom" CTA in the nav. */}
                <Link href={user?.role === "parent" ? "/parent" : "/classroom"} data-testid="link-my-classroom">
                  <Button data-testid="button-my-classroom" variant="default" size="sm" className="h-7 text-[11px] px-2.5">
                    {language === "en" ? "My Classroom" : "My Klaskamer"}
                  </Button>
                </Link>
                <a href="/api/auth/logout" data-testid="link-sign-out">
                  <Button variant="ghost" size="icon" className="h-7 w-7" data-testid="button-sign-out">
                    <LogOut className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            ) : location === "/" ? (
              <div className="flex flex-col items-end gap-0.5">
                <a href="/api/login">
                  <Button data-testid="button-sign-in" size="sm" className="nav-cta-btn h-8 text-[11px] px-5 font-semibold text-white border-0 transition-all duration-300">
                    {language === "en" ? "Sign In" : "Kom In"}
                  </Button>
                </a>
                <span className="text-[9px] text-white leading-none" data-testid="text-replit-auth-note">
                  {language === "en" ? "Sign-in powered by Replit" : "Aanmeld via Replit"}
                </span>
              </div>
            ) : null}
          </div>

          <div className="md:hidden flex items-center justify-between w-full h-14">
            <Link href="/" className="shrink-0" data-testid="link-mobile-brand">
              <BrainTrackLogo className="h-7 w-7" wordmark wordmarkClassName="text-sm" />
            </Link>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white active:text-foreground transition-all"
                data-testid="button-mobile-language"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">
                  {language === "en" ? "EN" : "AF"}
                </span>
              </button>
              <ThemeToggle compact />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(!mobileOpen)}
                data-testid="button-mobile-menu"
                className="rounded-lg h-9 w-9 active:bg-muted"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden nav-mobile-panel border-t border-border/40"
          data-testid="nav-mobile-menu"
        >
          <div className="px-3 py-3 space-y-0.5">
            {[...navLinks, ...(isAdmin ? adminNavLinks : [])].map((link, idx) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`link-mobile-${link.en.toLowerCase()}`}
                  className={`nav-mobile-item flex items-center px-4 py-3 rounded-xl text-sm font-semibold tracking-tight transition-all ${
                    isActive
                      ? "text-foreground bg-muted/60"
                      : "text-white active:bg-muted/60"
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  onClick={() => setMobileOpen(false)}
                >
                  <link.icon className={`w-4 h-4 mr-3 ${isActive ? "text-primary" : "text-white"}`} />
                  {language === "en" ? link.en : link.af}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}

            <div className="mx-4 my-2 border-t border-border/40" />

            {isAuthenticated ? (
              <>
                {/* Admin-only entry-points are intentionally excluded from the
                    public header. Admins reach /learn/admin/* via the footer. */}
                <Link
                  href={user?.role === "parent" ? "/parent" : "/dashboard"}
                  data-testid="link-mobile-my-classroom"
                  className="nav-mobile-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-tight text-foreground bg-muted/60"
                  style={{ animationDelay: `${navLinks.length * 40}ms` }}
                  onClick={() => setMobileOpen(false)}
                >
                  <BookOpen className="w-4 h-4" />
                  {language === "en" ? "My Classroom" : "My Klaskamer"}
                </Link>

                <div className="mx-4 my-2 border-t border-border/40" />

                <a
                  href="/api/auth/logout"
                  data-testid="link-mobile-sign-out"
                  className="nav-mobile-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-tight text-white active:bg-muted/60"
                  style={{ animationDelay: `${(navLinks.length + 3) * 40}ms` }}
                >
                  <LogOut className="h-4 w-4 text-white" />
                  {language === "en" ? "Sign Out" : "Uitteken"}
                </a>
              </>
            ) : location === "/" ? (
              <div className="px-4 pt-2 pb-1" style={{ animationDelay: `${navLinks.length * 40}ms` }}>
                <a href="/api/login" className="nav-mobile-item block">
                  <Button className="nav-cta-btn w-full h-11 text-sm font-semibold text-white border-0">
                    {language === "en" ? "Sign In" : "Kom In"}
                  </Button>
                </a>
                <p className="mt-2 text-[10px] text-center text-white leading-snug" data-testid="text-mobile-replit-auth-note">
                  {language === "en"
                    ? "Sign-in powered by Replit. Account and password reset are managed there."
                    : "Aanmeld via Replit. Rekening en wagwoord-terugstel word daar bestuur."}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
