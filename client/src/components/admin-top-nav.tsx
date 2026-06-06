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
      },
      {
        key: "billing",
        href: "/learn/admin/billing",
        labelEn: "Billing",
        labelAf: "Fakturering",
        descEn: "Trials, recurring failures, lapsed subscribers",
        descAf: "Proewe, mislukkings en vervalde intekeninge",
        Icon: CreditCard,
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
      },
      {
        key: "content-editor",
        href: "/learn/admin/content",
        labelEn: "Content Editor",
        labelAf: "Inhoudsredigeerder",
        descEn: "Edit topic notes, flashcards, literature",
        descAf: "Wysig notas, flitskaarte en literatuur",
        Icon: FileEdit,
      },
      {
        key: "content-studio",
        href: "/learn/admin/content-studio",
        labelEn: "Content Studio",
        labelAf: "Inhoudstudio",
        descEn: "DBE pipeline: papers, memos and ingestion",
        descAf: "DBE-pyplyn: vraestelle, memo's en ingestie",
        Icon: Database,
      },
      {
        key: "topic-audio",
        href: "/learn/admin/topic-audio",
        labelEn: "Topic Audio",
        labelAf: "Onderwerp Klank",
        descEn: "Preview, regenerate and replace MP3s",
        descAf: "Voorskou, hergenereer en vervang MP3's",
        Icon: Headphones,
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
      },
      {
        key: "partner-branding",
        href: "/learn/admin/partner-branding",
        labelEn: "Partner Branding",
        labelAf: "Vennoothandelsmerk",
        descEn: "Partner name, logo and report schedule",
        descAf: "Vennootnaam, logo en verslagskedule",
        Icon: Handshake,
      },
      {
        key: "schools",
        href: "/partner-schools",
        labelEn: "Partner Schools",
        labelAf: "Vennootskole",
        descEn: "Channels, pipelines and contacts",
        descAf: "Kanale, pyplyne en kontakte",
        Icon: Store,
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
      },
      {
        key: "parent",
        href: "/parent",
        labelEn: "Parent View",
        labelAf: "Ouer Aansig",
        descEn: "Jump to the parent dashboard",
        descAf: "Gaan na die ouerpaneel",
        Icon: Users,
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
      className="sticky top-0 z-40 bg-black/85 backdrop-blur-xl"
      style={{ borderBottom: "1px solid rgba(142,124,220,0.28)" }}
      data-testid="admin-top-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link href="/learn/admin" className="flex items-center gap-2 min-w-0" data-testid="admin-nav-brand">
          <div
            className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shrink-0"
            style={{ border: "1.5px solid #b066d6", boxShadow: "0 0 14px rgba(176,102,214,0.45)" }}
          >
            <ShieldAlert className="w-4 h-4" style={{ color: "#b066d6" }} />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p
              className="text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ color: "#b066d6" }}
            >
              BrainTrack
            </p>
            <p className="text-sm font-bold text-white truncate">
              {isAf ? "Admin" : "Admin"}
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 ml-2">
          <Link
            href="/learn/admin"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.18em] transition ${
              dashboardActive
                ? "bg-white text-black"
                : "text-white hover:bg-white/10"
            }`}
            data-testid="admin-nav-dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            {isAf ? "Paneel" : "Dashboard"}
          </Link>

          <Link
            href="/learn/admin/emails"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.18em] transition ${
              current === "emails"
                ? "bg-white text-black"
                : "text-white hover:bg-white/10"
            }`}
            data-testid="admin-nav-emails-top"
          >
            <Mail className="w-3.5 h-3.5" />
            {isAf ? "E-pos Sjablone" : "Email Templates"}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.18em] transition ${
                  current && current !== "dashboard"
                    ? "bg-white text-black"
                    : "text-white border border-white/20 hover:bg-white/10"
                }`}
                data-testid="admin-nav-menu-trigger"
              >
                {isAf ? "Spyskaart" : "Admin Menu"}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="w-80 max-h-[80vh] overflow-y-auto bg-black/95 border border-white/15 backdrop-blur-xl"
              data-testid="admin-nav-menu-content"
            >
              {NAV_GROUPS.map((group, gi) => (
                <div key={group.labelEn}>
                  {gi > 0 && <DropdownMenuSeparator className="bg-white/10" />}
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
                    {isAf ? group.labelAf : group.labelEn}
                  </DropdownMenuLabel>
                  {group.items.map(({ key, href, labelEn, labelAf, descEn, descAf, Icon }) => {
                    const active = current === key;
                    return (
                      <DropdownMenuItem
                        key={key}
                        asChild
                        className={`focus:bg-white/10 ${active ? "bg-white/10" : ""}`}
                      >
                        <Link
                          href={href}
                          className="flex items-start gap-3 cursor-pointer px-2 py-2"
                          data-testid={`admin-nav-${key}`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0"
                            style={{
                              border: "1px solid rgba(176,102,214,0.4)",
                              boxShadow: "0 0 10px rgba(176,102,214,0.18)",
                            }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white leading-tight">
                              {isAf ? labelAf : labelEn}
                            </p>
                            <p className="text-[11px] text-white/60 leading-snug mt-0.5">
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
            className="text-[10px] font-black uppercase tracking-[0.22em] px-3 py-1.5 rounded-full bg-black text-white hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.18)" }}
            data-testid="admin-nav-lang"
          >
            {isAf ? "EN" : "AF"}
          </button>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-full bg-black text-white"
            style={{ border: "1px solid rgba(255,255,255,0.18)" }}
            data-testid="admin-nav-home"
            title={isAf ? "Tuis" : "Home"}
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
          <a
            href="/api/auth/logout"
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] px-3 py-1.5 rounded-full bg-black"
            style={{
              border: "1px solid rgba(230,81,156,0.5)",
              color: "#e6519c",
              boxShadow: "0 0 10px rgba(230,81,156,0.25)",
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
