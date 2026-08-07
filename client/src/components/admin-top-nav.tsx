import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  CreditCard,
  Handshake,
  FileEdit,
  Mail,
  FileText,
  GraduationCap,
  Users,
  Database,
  LogOut,
  Home,
  QrCode,
  School,
  Footprints,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

export type AdminNavKey =
  | "dashboard"
  | "reports"
  | "products"
  | "billing"
  | "emails"
  | "partner-branding"
  | "content-editor"
  | "content-studio"
  | "simulator"
  | "dbe-portal"
  | "schools"
  | "qr"
  | "classroom"
  | "onboarding-preview"
  | "parent";

type NavItem = {
  key: AdminNavKey;
  href: string;
  labelEn: string;
  labelAf: string;
  Icon: any;
  testId?: string;
};

type NavGroup = {
  labelEn: string;
  labelAf: string;
  items: NavItem[];
};

// Routes verified against App.tsx (note: Content Studio lives at
// /admin/content-studio, not /learn/admin/content-studio).
const NAV_GROUPS: NavGroup[] = [
  {
    labelEn: "Operations",
    labelAf: "Bedrywighede",
    items: [
      { key: "dashboard", href: "/learn/admin", labelEn: "Dashboard", labelAf: "Paneel", Icon: LayoutDashboard, testId: "admin-nav-dashboard" },
      { key: "reports", href: "/learn/admin/reports", labelEn: "Reports", labelAf: "Verslae", Icon: BarChart3 },
      { key: "billing", href: "/learn/admin/billing", labelEn: "Billing", labelAf: "Fakturering", Icon: CreditCard },
    ],
  },
  {
    labelEn: "Catalogue & Content",
    labelAf: "Katalogus & Inhoud",
    items: [
      { key: "products", href: "/learn/admin/products", labelEn: "Products", labelAf: "Produkte", Icon: Package },
      { key: "content-editor", href: "/learn/admin/content", labelEn: "Content Editor", labelAf: "Inhoudsredigeerder", Icon: FileEdit },
      { key: "content-studio", href: "/admin/content-studio", labelEn: "Content Studio", labelAf: "Inhoudstudio", Icon: Database },
      { key: "simulator", href: "/admin/simulator", labelEn: "Simulator", labelAf: "Simulator", Icon: Zap },
      { key: "dbe-portal", href: "/learn/admin/dbe-portal", labelEn: "DBE Portal", labelAf: "DBE Portaal", Icon: FileText },
    ],
  },
  {
    labelEn: "Outreach & Partners",
    labelAf: "Uitreik & Vennote",
    items: [
      { key: "emails", href: "/learn/admin/emails", labelEn: "Emails", labelAf: "E-pos", Icon: Mail, testId: "admin-nav-emails-top" },
      { key: "partner-branding", href: "/learn/admin/partner-branding", labelEn: "Partner Branding", labelAf: "Vennoothandelsmerk", Icon: Handshake },
      { key: "schools", href: "/learn/admin/school-qr", labelEn: "School QR Codes", labelAf: "Skool QR-kodes", Icon: School },
      { key: "qr", href: "/learn/admin/qr", labelEn: "QR Generator", labelAf: "QR-Generator", Icon: QrCode },
    ],
  },
  {
    labelEn: "Quick Jumps",
    labelAf: "Vinnige Skakels",
    items: [
      // /classroom, not /dashboard: for an admin, /dashboard renders the admin
      // dashboard, so this entry would appear dead. /classroom is the direct
      // alias for the learner DashboardPage.
      { key: "classroom", href: "/classroom", labelEn: "Learner Dashboard", labelAf: "Leerderpaneel", Icon: GraduationCap },
      // ?preview=1: admin-only preview of the learner onboarding flow with
      // every mutation disarmed (see client/src/lib/onboarding-preview.ts) —
      // walking the phases saves nothing against the admin's account.
      { key: "onboarding-preview", href: "/onboarding?preview=1", labelEn: "Onboarding Journey", labelAf: "Aanboordreis", Icon: Footprints },
      { key: "parent", href: "/parent", labelEn: "Parent View", labelAf: "Ouer Aansig", Icon: Users },
    ],
  },
];

interface AdminTopNavProps {
  current?: AdminNavKey;
}

/**
 * Admin left sidebar (formerly a top bar). Renders a fixed 240px column
 * (200px below 861px — the same breakpoint as the learner dashboard shell)
 * and offsets every following sibling of the mounting page automatically,
 * so pages keep their existing structure: <AdminTopNav /> + content.
 */
export function AdminTopNav({ current }: AdminTopNavProps) {
  const { language, toggleLanguage } = useLanguage();
  const [location] = useLocation();
  const isAf = language === "af";

  const isActive = (item: NavItem) =>
    current ? current === item.key : location === item.href;

  return (
    <>
      <aside
        className="bt-admin-sidebar"
        data-testid="admin-top-nav"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: 240,
          zIndex: 40,
          background: "#050508",
          borderRight: "1px solid #1b1922",
          padding: "22px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          boxSizing: "border-box",
          overflowY: "auto",
          fontFamily: "'Poppins', system-ui, sans-serif",
        }}
      >
        <Link
          href="/learn/admin"
          data-testid="admin-nav-brand"
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", cursor: "pointer" }}
        >
          <img src={iconTransparent} alt="" style={{ width: 48, height: 48, objectFit: "contain", flex: "none" }} />
          <span className="bt-wordmark" style={{ fontSize: 16, fontWeight: 900 }}>BrainTrack</span>
        </Link>
        <span
          className="uppercase"
          style={{
            alignSelf: "flex-start",
            margin: "8px 8px 10px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "2px",
            color: "#C5B3FF",
            border: "1px solid rgba(197,179,255,0.4)",
            borderRadius: 6,
            padding: "3px 9px",
          }}
        >
          Admin
        </span>

        {NAV_GROUPS.map((group) => (
          <div key={group.labelEn} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}>
            <div
              className="uppercase"
              style={{
                padding: "6px 10px 4px",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "2.4px",
                color: "#fff",
              }}
            >
              {isAf ? group.labelAf : group.labelEn}
            </div>
            {group.items.map((item) => {
              const { key, href, labelEn, labelAf, Icon, testId } = item;
              const active = isActive(item);
              return (
                <Link key={key} href={href}>
                  <div
                    data-testid={testId ?? `admin-nav-${key}`}
                    title={isAf ? labelAf : labelEn}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: active ? 700 : 600,
                      fontSize: 13,
                      color: active ? "#9FF5E8" : "#fff",
                      background: active ? "rgba(159,245,232,.12)" : "transparent",
                      border: active ? "1px solid #9FF5E8" : "1px solid transparent",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#0e0d12"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <Icon style={{ width: 15, height: 15, flex: "none" }} />
                    <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {isAf ? labelAf : labelEn}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6, paddingTop: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={toggleLanguage}
              data-testid="admin-nav-lang"
              style={{
                flex: 1,
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "#fff",
                background: "transparent",
                border: "1px solid #1b1922",
                borderRadius: 10,
                padding: "8px 10px",
                cursor: "pointer",
                transition: "border-color .2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9FD8FF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#fff"; }}
            >
              {isAf ? "EN" : "AF"}
            </button>
            <Link
              href="/"
              data-testid="admin-nav-home"
              title={isAf ? "Tuis" : "Home"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                color: "#fff",
                border: "1px solid #1b1922",
                borderRadius: 10,
                transition: "border-color .2s",
              }}
            >
              <Home style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          <a
            href="/api/auth/logout"
            data-testid="admin-nav-logout"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#fff",
              background: "transparent",
              border: "1px solid #1b1922",
              borderRadius: 10,
              padding: "9px 12px",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FFB7E5"; e.currentTarget.style.color = "#FFB7E5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.color = "#fff"; }}
          >
            <LogOut style={{ width: 15, height: 15 }} />
            {isAf ? "Teken Uit" : "Logout"}
          </a>
        </div>
      </aside>

      {/* The sidebar persists at every width (no top-bar fallback); it slims
          to 200px under 861px — same approach as the learner dashboard.
          Following siblings of the sidebar are offset so existing admin page
          layouts keep working unchanged. */}
      <style>{`
        .bt-admin-sidebar ~ * { margin-left: 240px !important; }
        @media (max-width: 860px) {
          .bt-admin-sidebar { width: 200px !important; padding: 16px 10px !important; }
          .bt-admin-sidebar ~ * { margin-left: 200px !important; }
        }
      `}</style>
    </>
  );
}

export default AdminTopNav;
