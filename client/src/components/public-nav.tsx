import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Globe, Menu, X, LogOut, FlaskConical, Sparkles, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { BadgeDollarSign } from "lucide-react";

const BRAND = ["#006BFF","#00E5FF","#22FF66","#FFE600","#FF8A00","#FF2BD6","#8A2BFF"];

const navLinks = [
  { href: "/research",  en: "Research", af: "Navorsing", icon: FlaskConical,    color: "#006BFF", dark: true },
  { href: "/features",  en: "Features", af: "Kenmerke",  icon: Sparkles,        color: "#22FF66", dark: true },
  { href: "/subscribe", en: "Pricing",  af: "Pryse",     icon: BadgeDollarSign, color: "#FF2BD6", dark: false },
];

export function PublicNav() {
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "#000",
        borderBottom: "3px solid transparent",
        borderImage: "linear-gradient(90deg,#006BFF,#00E5FF,#22FF66,#FFE600,#FF8A00,#FF2BD6,#8A2BFF) 1",
        boxShadow: "0 0 32px rgba(0,229,255,0.2), 0 4px 24px rgba(0,0,0,0.8)",
      }}
      data-testid="nav-public"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* ── Desktop layout ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-testid={`link-nav-${link.en.toLowerCase().replace(/\s+/g, "-")}`}
                    style={isActive ? {
                      background: link.color,
                      color: link.dark ? "#000" : "#fff",
                      border: `2px solid ${link.color}`,
                      boxShadow: `0 0 16px ${link.color}88`,
                    } : {
                      background: "transparent",
                      color: "#fff",
                      border: "2px solid rgba(255,255,255,0.12)",
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-150 hover:scale-105 active:scale-95"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {language === "en" ? link.en : link.af}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              data-testid="button-language-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.15)" }}
            >
              <Globe className="h-3.5 w-3.5" />
              {language === "en" ? "EN" : "AF"}
            </button>
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={user?.role === "parent" ? "/parent" : "/classroom"} data-testid="link-my-classroom">
                  <button
                    data-testid="button-my-classroom"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-wide text-black transition-all hover:scale-105 active:scale-95"
                    style={{ background: "#22FF66", border: "2px solid #22FF66", boxShadow: "0 0 18px rgba(34,255,102,0.5)" }}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {language === "en" ? "My Classroom" : "My Klaskamer"}
                  </button>
                </Link>
                <a href="/api/auth/logout" data-testid="link-sign-out">
                  <button
                    data-testid="button-sign-out"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white transition-all hover:scale-105"
                    style={{ background: "rgba(255,43,214,0.12)", border: "1.5px solid #FF2BD6" }}
                  >
                    <LogOut className="h-3.5 w-3.5" style={{ color: "#FF2BD6" }} />
                  </button>
                </a>
              </div>
            ) : location === "/" ? (
              <a href="/api/login">
                <button
                  data-testid="button-sign-in"
                  className="inline-flex items-center px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider text-black transition-all hover:scale-105 active:scale-95"
                  style={{ background: "#FFE600", border: "2px solid #FFE600", boxShadow: "0 0 18px rgba(255,230,0,0.5)" }}
                >
                  {language === "en" ? "Sign In" : "Kom In"}
                </button>
              </a>
            ) : null}
          </div>

          {/* ── Mobile layout ──────────────────────────────── */}
          <div className="md:hidden flex items-center justify-between w-full h-16">
            <Link href="/" className="shrink-0 flex items-center text-[11px] font-bold uppercase tracking-widest text-white" data-testid="link-mobile-brand">
              {language === "en" ? "Home" : "Tuis"}
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider text-white"
                style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.15)" }}
                data-testid="button-mobile-language"
              >
                <Globe className="h-3.5 w-3.5" />
                {language === "en" ? "EN" : "AF"}
              </button>
              <ThemeToggle compact />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                data-testid="button-mobile-menu"
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white transition-all hover:scale-105"
                style={{ background: mobileOpen ? "#FF2BD6" : "rgba(255,43,214,0.12)", border: "1.5px solid #FF2BD6" }}
              >
                {mobileOpen ? <X className="h-5 w-5" style={{ color: mobileOpen ? "#000" : "#FF2BD6" }} /> : <Menu className="h-5 w-5" style={{ color: "#FF2BD6" }} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile menu panel ──────────────────────────────── */}
      {mobileOpen && (
        <div
          data-testid="nav-mobile-menu"
          style={{
            background: "#050508",
            borderTop: "2px solid rgba(255,43,214,0.4)",
            animation: "nav-panel-open 0.2s ease-out",
          }}
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link, idx) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`link-mobile-${link.en.toLowerCase()}`}
                  onClick={() => setMobileOpen(false)}
                  style={isActive ? {
                    background: link.color,
                    color: link.dark ? "#000" : "#fff",
                    border: `2px solid ${link.color}`,
                    boxShadow: `0 0 20px ${link.color}66`,
                    animationDelay: `${idx * 50}ms`,
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    border: "1.5px solid rgba(255,255,255,0.1)",
                    animationDelay: `${idx * 50}ms`,
                  }}
                  className="nav-mobile-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wide transition-all"
                >
                  <link.icon className="w-4 h-4" />
                  {language === "en" ? link.en : link.af}
                </Link>
              );
            })}

            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)", margin: "8px 0" }} />

            {isAuthenticated ? (
              <>
                <Link
                  href={user?.role === "parent" ? "/parent" : "/dashboard"}
                  data-testid="link-mobile-my-classroom"
                  onClick={() => setMobileOpen(false)}
                  className="nav-mobile-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wide text-black"
                  style={{ background: "#22FF66", border: "2px solid #22FF66", boxShadow: "0 0 16px rgba(34,255,102,0.45)", animationDelay: `${navLinks.length * 50}ms` }}
                >
                  <BookOpen className="w-4 h-4" />
                  {language === "en" ? "My Classroom" : "My Klaskamer"}
                </Link>
                <a
                  href="/api/auth/logout"
                  data-testid="link-mobile-sign-out"
                  className="nav-mobile-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wide"
                  style={{ background: "rgba(255,43,214,0.1)", color: "#FF2BD6", border: "1.5px solid #FF2BD6", animationDelay: `${(navLinks.length + 1) * 50}ms` }}
                >
                  <LogOut className="h-4 w-4" />
                  {language === "en" ? "Sign Out" : "Uitteken"}
                </a>
              </>
            ) : location === "/" ? (
              <a
                href="/api/login"
                className="nav-mobile-item block"
                style={{ animationDelay: `${navLinks.length * 50}ms` }}
              >
                <button
                  className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-wider text-black"
                  style={{ background: "#FFE600", border: "2px solid #FFE600", boxShadow: "0 0 16px rgba(255,230,0,0.45)" }}
                >
                  {language === "en" ? "Sign In" : "Kom In"}
                </button>
              </a>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
