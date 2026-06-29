import { Link } from "wouter";
import {
  Mail, Shield, MapPin, ExternalLink, GraduationCap,
  BookOpen, Sparkles, BadgeDollarSign, FlaskConical,
  FileText, Lock, Cookie, Brain, Undo2,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { BrainTrackLogo } from "@/components/braintrack-logo";

const SUPPORT_EMAIL = "enterprise@kth-tech.com";

const TRUST_BADGES = [
  { label: "POPIA Compliant", color: "#28c9d6", Icon: Shield },
  { label: "CAPS Aligned", color: "#ffd83a", Icon: GraduationCap },
  { label: "NSC 2015–2025", color: "#b066d6", Icon: BookOpen },
  { label: "Built in SA 🇿🇦", color: "#ff8a1f", Icon: MapPin },
];

const DBE_PAPERS_URL = "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx";
const DBE_TIMETABLE_URL = "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCExaminationsTimetable.aspx";

const COLS = {
  en: [
    {
      heading: "Platform",
      links: [
        { href: "/features", label: "Features", Icon: Sparkles },
        { href: "/subscribe", label: "Pricing", Icon: BadgeDollarSign },
        { href: DBE_PAPERS_URL, label: "DBE Past Papers", Icon: BookOpen, external: true },
        { href: DBE_TIMETABLE_URL, label: "NSC Timetable", Icon: GraduationCap, external: true },
      ],
    },
    {
      heading: "Company",
      links: [
        { href: "/about", label: "About", Icon: Brain },
        { href: "/research", label: "Research", Icon: FlaskConical },
        { href: "/partner-schools", label: "For Schools", Icon: GraduationCap },
      ],
    },
    {
      heading: "Legal",
      links: [
        { href: "/privacy-policy", label: "Privacy Policy", Icon: Lock },
        { href: "/terms-of-service", label: "Terms of Service", Icon: FileText },
        { href: "/refund-policy", label: "Refund Policy", Icon: Undo2 },
        { href: "/cookie-policy", label: "Cookie Policy", Icon: Cookie },
      ],
    },
  ],
  af: [
    {
      heading: "Platform",
      links: [
        { href: "/features", label: "Kenmerke", Icon: Sparkles },
        { href: "/subscribe", label: "Pryse", Icon: BadgeDollarSign },
        { href: DBE_PAPERS_URL, label: "DBE Vraestelle", Icon: BookOpen, external: true },
        { href: DBE_TIMETABLE_URL, label: "NSC Rooster", Icon: GraduationCap, external: true },
      ],
    },
    {
      heading: "Maatskappy",
      links: [
        { href: "/about", label: "Oor Ons", Icon: Brain },
        { href: "/research", label: "Navorsing", Icon: FlaskConical },
        { href: "/partner-schools", label: "Vir Skole", Icon: GraduationCap },
      ],
    },
    {
      heading: "Regsake",
      links: [
        { href: "/privacy-policy", label: "Privaatheidsbeleid", Icon: Lock },
        { href: "/terms-of-service", label: "Diensbepalings", Icon: FileText },
        { href: "/refund-policy", label: "Terugbetalingsbeleid", Icon: Undo2 },
        { href: "/cookie-policy", label: "Koekiesbeleid", Icon: Cookie },
      ],
    },
  ],
};

const TRUST_PILLS = {
  en: ["R169/month", "14 days free", "Cancel anytime"],
  af: ["R169/maand", "14 dae gratis", "Kanselleer enige tyd"],
};
const POPIA_NOTICE = {
  en: "BrainTrack is POPIA-compliant. Learner data is protected under the Protection of Personal Information Act (Act 4 of 2013).",
  af: "BrainTrack voldoen aan POPIA. Leerderdata word beskerm ingevolge die Wet op Beskerming van Persoonlike Inligting (Wet 4 van 2013).",
};
const TAGLINE = {
  en: { main: "Grade 12 Matric prep for South Africa.", sub: "CAPS-aligned · POPIA-compliant · Built in SA" },
  af: { main: "Graad 12-matriekvoorbereiding vir Suid-Afrika.", sub: "KABV-belyn · POPIA-nakoming · Trots SA" },
};
const COPY = {
  en: { copyright: "© 2026 BrainTrack™ · A KTH Tech product", support: "Support", adminLabel: "Admin" },
  af: { copyright: "© 2026 BrainTrack™ · 'n KTH Tech-produk", support: "Ondersteuning", adminLabel: "Admin" },
};

export function PublicFooter() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const isAf = language === "af";
  const isAdmin = isAuthenticated && user?.role === "admin";
  const isParent = user?.role === "parent";
  const cols = COLS[language];
  const t = COPY[language];
  const tagline = TAGLINE[language];
  const pills = TRUST_PILLS[language];

  return (
    <footer
      className="relative bg-black overflow-hidden"
      style={{ borderTop: "1px solid rgba(40,201,214,0.18)" }}
      data-testid="footer-public"
      aria-label="Site footer"
    >
      {/* Ambient top glow */}
      <div
        aria-hidden
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[180px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(40,201,214,0.12), transparent 70%)" }}
      />
      {/* Top rainbow rule */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
        style={{ background: "linear-gradient(90deg,#ff6a1f,#ffd83a,#28c9d6,#8e7cdc,#e6519c)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">

        {/* ── Row 1: Logo + Trust badges ─────────────────────────────── */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-10">

          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <Link href="/" data-testid="footer-logo">
              <BrainTrackLogo className="h-8 w-8" wordmark wordmarkClassName="text-base" />
            </Link>
            <p className="text-sm text-white/80 font-semibold leading-snug">{tagline.main}</p>
            <p className="text-[11px] text-white/40 leading-snug">{tagline.sub}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {pills.map((pill, i) => {
                const c = ["#28c9d6","#ffd83a","#b066d6"][i % 3];
                return (
                  <span
                    key={i}
                    className="inline-block text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full bg-black"
                    style={{ color: c, border: `1px solid ${c}44` }}
                  >
                    {pill}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 md:justify-end md:items-start">
            {TRUST_BADGES.map((b) => (
              <div
                key={b.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-[10px] font-bold"
                style={{ color: b.color, border: `1px solid ${b.color}33`, boxShadow: `0 0 8px ${b.color}18` }}
              >
                <b.Icon className="w-3 h-3 shrink-0" />
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 2: Link columns ────────────────────────────────────── */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-8 mb-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {cols.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3
                className="text-[9px] font-black uppercase tracking-[0.28em] mb-4"
                style={{ color: "#28c9d6" }}
              >
                {col.heading}
              </h3>
              <ul className="space-y-2.5" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 text-sm text-white/55 hover:text-white/90 transition-colors duration-150"
                      >
                        <link.Icon className="w-3.5 h-3.5 shrink-0 text-white/20 group-hover:text-white/50 transition-colors" />
                        {link.label}
                        <ExternalLink className="w-2.5 h-2.5 shrink-0 text-white/15 group-hover:text-white/40 transition-colors" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        data-testid={`footer-link-${link.href.replace(/\//g, "-").replace(/^-/, "")}`}
                        className="group flex items-center gap-2 text-sm text-white/55 hover:text-white/90 transition-colors duration-150"
                      >
                        <link.Icon className="w-3.5 h-3.5 shrink-0 text-white/20 group-hover:text-white/50 transition-colors" />
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
                {/* Admin Login — only shown to logged-out visitors */}
                {col.heading === "Platform" && !isAuthenticated && (
                  <li>
                    <a
                      href="/api/login"
                      data-testid="footer-link-admin-login"
                      className="group flex items-center gap-2 text-sm text-white/55 hover:text-white/90 transition-colors duration-150"
                    >
                      <Lock className="w-3.5 h-3.5 shrink-0 text-white/20 group-hover:text-white/50 transition-colors" />
                      {isAf ? "Admin Aanmelding" : "Admin Login"}
                    </a>
                  </li>
                )}
                {/* Conditional: authenticated admin sees DBE Portal link */}
                {col.heading === "Platform" && isAdmin && (
                  <li>
                    <Link
                      href="/learn/admin/dbe-portal"
                      data-testid="footer-link-dbe-portal"
                      className="group flex items-center gap-2 text-sm text-white/55 hover:text-white/90 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 text-white/20 group-hover:text-white/50" />
                      {isAf ? "DBE Portaal" : "DBE Portal"}
                    </Link>
                  </li>
                )}
                {/* Conditional: parent dashboard link */}
                {col.heading === "Platform" && isParent && (
                  <li>
                    <Link
                      href="/parent"
                      data-testid="footer-link-parent"
                      className="group flex items-center gap-2 text-sm text-white/55 hover:text-white/90 transition-colors"
                    >
                      <Brain className="w-3.5 h-3.5 shrink-0 text-white/20 group-hover:text-white/50" />
                      {isAf ? "Ouer Dashboard" : "Parent Dashboard"}
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>

        {/* ── POPIA notice ───────────────────────────────────────────── */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 mb-8"
          style={{ background: "rgba(40,201,214,0.04)", border: "1px solid rgba(40,201,214,0.15)" }}
        >
          <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#28c9d6" }} />
          <p className="text-[11px] text-white/45 leading-relaxed">{POPIA_NOTICE[language]}</p>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-[11px] text-white/30">{t.copyright}</p>

          <div className="flex items-center flex-wrap gap-x-5 gap-y-1.5">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              data-testid="footer-email-support"
              className="inline-flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white/80 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {t.support}
            </a>

            {/* Cancel subscription (non-learner authenticated users) */}
            {isAuthenticated && user?.role !== "learner" && (
              <a
                href="/api/cancel-subscription"
                className="text-[11px] text-white/35 hover:text-white/65 transition-colors"
                data-testid="footer-link-cancel"
              >
                {isAf ? "Kanselleer" : "Cancel subscription"}
              </a>
            )}

            {/* Admin sign-in: intentionally low-contrast per design (public-nav.tsx:90) */}
            <a
              href="/api/login"
              data-testid="footer-link-admin-signin"
              className="inline-flex items-center gap-1 text-[10px] text-white/18 hover:text-white/40 transition-colors"
              aria-label={isAf ? "Admin-aanmelding" : "Admin sign-in"}
            >
              <ExternalLink className="w-3 h-3" />
              {t.adminLabel}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
