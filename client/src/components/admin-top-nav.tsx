import { Link } from "wouter";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  CreditCard,
  Headphones,
  Handshake,
  FileEdit,
  Mail,
  ShieldAlert,
  Store,
  GraduationCap,
  Users,
  Database,
  ChevronDown,
  LogOut,
  Home,
  QrCode,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AdminNavKey =
  | "dashboard"
  | "reports"
  | "products"
  | "billing"
  | "emails"
  | "topic-audio"
  | "partner-branding"
  | "content-editor"
  | "content-studio"
  | "schools"
  | "qr"
  | "classroom"
  | "parent";

type NavItem = {
  key: AdminNavKey;
  href: string;
  labelEn: string;
  labelAf: string;
  descEn: string;
  descAf: string;
  Icon: any;
  color: string;
};

type NavGroup = {
  labelEn: string;
  labelAf: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    labelEn: "Reports & Insights",
    labelAf: "Verslae & Insig",
    items: [
      {
        key: "reports",
        href: "/learn/admin/reports",
        labelEn: "Reports",
        labelAf: "Verslae",
        descEn: "User, parent, learner & school analytics",
        descAf: "Gebruiker-, ouer-, leerder- en skoolontleding",
        Icon: BarChart3,
        color: "#7FEFFF",
      },
      {
        key: "billing",
        href: "/learn/admin/billing",
        labelEn: "Billing",
        labelAf: "Fakturering",
        descEn: "Trials, recurring failures, lapsed subscribers",
        descAf: "Proewe, mislukkings en vervalde intekeninge",
        Icon: CreditCard,
        color: "#93FFB8",
      },
    ],
  },
  {
    labelEn: "Catalogue & Content",
    labelAf: "Katalogus & Inhoud",
    items: [
      {
        key: "products",
        href: "/learn/admin/products",
        labelEn: "Products",
        labelAf: "Produkte",
        descEn: "Plans, products and availability",
        descAf: "Planne, produkte en beskikbaarheid",
        Icon: Package,
        color: "#FFC48F",
      },
      {
        key: "content-editor",
        href: "/learn/admin/content",
        labelEn: "Content Editor",
        labelAf: "Inhoudsredigeerder",
        descEn: "Edit topic notes, flashcards, literature",
        descAf: "Wysig notas, flitskaarte en literatuur",
        Icon: FileEdit,
        color: "#FFF29E",
      },
      {
        key: "content-studio",
        href: "/learn/admin/content-studio",
        labelEn: "Content Studio",
        labelAf: "Inhoudstudio",
        descEn: "DBE pipeline: papers, memos and ingestion",
        descAf: "DBE-pyplyn: vraestelle, memo's en ingestie",
        Icon: Database,
        color: "#6FA8FF",
      },
      {
        key: "topic-audio",
        href: "/learn/admin/topic-audio",
        labelEn: "Topic Audio",
        labelAf: "Onderwerp Klank",
        descEn: "Preview, regenerate and replace MP3s",
        descAf: "Voorskou, hergenereer en vervang MP3's",
        Icon: Headphones,
        color: "#C6A4FF",
      },
    ],
  },
  {
    labelEn: "Outreach & Partners",
    labelAf: "Uitreik & Vennote",
    items: [
      {
        key: "emails",
        href: "/learn/admin/emails",
        labelEn: "Email Templates",
        labelAf: "E-pos Sjablone",
        descEn: "Preview and test-send transactional emails",
        descAf: "Voorskou en toets-stuur e-posse",
        Icon: Mail,
        color: "#FF9FE5",
      },
      {
        key: "partner-branding",
        href: "/learn/admin/partner-branding",
        labelEn: "Partner Branding",
        labelAf: "Vennoothandelsmerk",
        descEn: "Partner name, logo and report schedule",
        descAf: "Vennootnaam, logo en verslagskedule",
        Icon: Handshake,
        color: "#7FEFFF",
      },
      {
        key: "qr",
        href: "/learn/admin/qr",
        labelEn: "QR Generator",
        labelAf: "QR-Generator",
        descEn: "Turn any link into a branded, downloadable QR code",
        descAf: "Maak enige skakel 'n QR-kode om af te laai",
        Icon: QrCode,
        color: "#93FFB8",
      },
    ],
  },
  {
    labelEn: "Quick Jumps",
    labelAf: "Vinnige Skakels",
    items: [
      {
        key: "classroom",
        href: "/classroom",
        labelEn: "Learner Classroom",
        labelAf: "Leerderklaskamer",
        descEn: "Open the learner-facing classroom view",
        descAf: "Maak die leerder-klaskamer oop",
        Icon: GraduationCap,
        color: "#FFF29E",
      },
      {
        key: "parent",
        href: "/parent",
        labelEn: "Parent View",
        labelAf: "Ouer Aansig",
        descEn: "Jump to the parent dashboard",
        descAf: "Gaan na die ouerpaneel",
        Icon: Users,
        color: "#FFC48F",
      },
    ],
  },
];

interface AdminTopNavProps {
  current?: AdminNavKey;
}

export function AdminTopNav({ current }: AdminTopNavProps) {
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  const dashboardActive = current === "dashboard" || !current;

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "#000",
        borderBottom: "3px solid transparent",
        borderImage: "linear-gradient(90deg,#C6A4FF,#FF9FE5,#6FA8FF,#7FEFFF,#93FFB8,#FFF29E,#FFC48F) 1",
        boxShadow: "0 0 28px rgba(198,164,255,0.25), 0 4px 20px rgba(0,0,0,0.8)",
      }}
      data-testid="admin-top-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link href="/learn/admin" className="flex items-center gap-2.5 min-w-0" data-testid="admin-nav-brand">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(198,164,255,0.15)",
              border: "2px solid #C6A4FF",
              boxShadow: "0 0 18px rgba(198,164,255,0.5)",
            }}
          >
            <ShieldAlert className="w-4.5 h-4.5" style={{ color: "#C6A4FF" }} />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "#C6A4FF" }}>
              BrainTrack
            </p>
            <p className="text-[15px] font-black text-white leading-none tracking-tight">
              Admin
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 ml-2">
          <Link
            href="/learn/admin"
            data-testid="admin-nav-dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105"
            style={dashboardActive ? {
              background: "#C6A4FF",
              color: "#fff",
              border: "2px solid #C6A4FF",
              boxShadow: "0 0 16px rgba(198,164,255,0.55)",
            } : {
              background: "rgba(198,164,255,0.1)",
              color: "#C6A4FF",
              border: "1.5px solid rgba(198,164,255,0.4)",
            }}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            {isAf ? "Paneel" : "Dashboard"}
          </Link>

          <Link
            href="/learn/admin/emails"
            data-testid="admin-nav-emails-top"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105"
            style={current === "emails" ? {
              background: "#FF9FE5",
              color: "#fff",
              border: "2px solid #FF9FE5",
              boxShadow: "0 0 16px rgba(255,159,229,0.55)",
            } : {
              background: "rgba(255,159,229,0.1)",
              color: "#FF9FE5",
              border: "1.5px solid rgba(255,159,229,0.4)",
            }}
          >
            <Mail className="w-3.5 h-3.5" />
            {isAf ? "E-pos" : "Emails"}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-testid="admin-nav-menu-trigger"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: "rgba(127,239,255,0.1)",
                  color: "#7FEFFF",
                  border: "1.5px solid rgba(127,239,255,0.4)",
                }}
              >
                {isAf ? "Spyskaart" : "All Tools"}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="w-80 max-h-[80vh] overflow-y-auto"
              style={{
                background: "#050508",
                border: "2px solid rgba(198,164,255,0.4)",
                boxShadow: "0 0 40px rgba(198,164,255,0.2), 0 20px 60px rgba(0,0,0,0.8)",
              }}
              data-testid="admin-nav-menu-content"
            >
              {NAV_GROUPS.map((group, gi) => (
                <div key={group.labelEn}>
                  {gi > 0 && <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />}
                  <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {isAf ? group.labelAf : group.labelEn}
                  </DropdownMenuLabel>
                  {group.items.map(({ key, href, labelEn, labelAf, descEn, descAf, Icon, color }) => {
                    const active = current === key;
                    return (
                      <DropdownMenuItem
                        key={key}
                        asChild
                        className="focus:bg-white/5"
                        style={active ? { background: `${color}15` } : {}}
                      >
                        <Link
                          href={href}
                          className="flex items-start gap-3 cursor-pointer px-2 py-2"
                          data-testid={`admin-nav-${key}`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: `${color}15`,
                              border: `1.5px solid ${color}`,
                              boxShadow: `0 0 10px ${color}33`,
                            }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-white leading-tight">
                              {isAf ? labelAf : labelEn}
                            </p>
                            <p className="text-[11px] leading-snug mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                              {isAf ? descAf : descEn}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-xl transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff" }}
            data-testid="admin-nav-lang"
          >
            {isAf ? "EN" : "AF"}
          </button>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
            style={{ background: "rgba(127,239,255,0.08)", border: "1.5px solid rgba(127,239,255,0.35)", color: "#7FEFFF" }}
            data-testid="admin-nav-home"
            title={isAf ? "Tuis" : "Home"}
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
          <a
            href="/api/auth/logout"
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl transition-all hover:scale-105"
            style={{
              background: "rgba(255,159,229,0.1)",
              border: "1.5px solid #FF9FE5",
              color: "#FF9FE5",
              boxShadow: "0 0 12px rgba(255,159,229,0.2)",
            }}
            data-testid="admin-nav-logout"
          >
            <LogOut className="w-3 h-3" /> {isAf ? "Teken Uit" : "Logout"}
          </a>
        </div>
      </div>
    </header>
  );
}

export default AdminTopNav;
