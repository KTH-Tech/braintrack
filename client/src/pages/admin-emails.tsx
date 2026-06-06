import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/lib/language-context";
import { AdminTopNav } from "@/components/admin-top-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail, Send, ChevronLeft, Loader2, CheckCircle, AlertCircle, Eye,
  Settings, Key, AtSign, User as UserIcon, CornerDownLeft, EyeOff, Save, ShieldCheck,
  Home, LogOut, FileText, CreditCard, XCircle, Flame, BarChart3, CalendarClock, UserMinus, PartyPopper,
} from "lucide-react";

type EmailType =
  | "welcome"
  | "consent-request"
  | "consent-confirmed"
  | "day-13"
  | "day-14"
  | "subscription-confirmed"
  | "payment-failed"
  | "subscription-cancelled"
  | "streak-milestone"
  | "weekly-progress"
  | "exam-countdown"
  | "inactivity-nudge";
type Lang = "en" | "af";
type Tab = "templates" | "settings";
type Category = "lifecycle" | "billing" | "engagement";

interface PreviewResponse { subject: string; html: string; }
interface SendResponse { delivery: "sent" | "not_configured" | "failed"; error?: string; }
interface EmailConfig { apiKeyDisplay: string; fromEmail: string; fromName: string; replyTo: string; isConfigured: boolean; }

const EMAIL_TYPES: {
  value: EmailType;
  label: string; labelAf: string;
  desc: string; descAf: string;
  icon: typeof Mail;
  category: Category;
}[] = [
  { value: "welcome", label: "Welcome Email", labelAf: "Welkom E-pos",
    desc: "Sent to learners when their 14-day Brain Boost trial starts",
    descAf: "Gestuur aan leerders wanneer hul 14-dae Brain Boost-proeftydperk begin",
    icon: PartyPopper, category: "lifecycle" },
  { value: "consent-request", label: "Parent Consent Request", labelAf: "Ouertoestemming Versoek",
    desc: "Sent to parents asking them to confirm consent for their child",
    descAf: "Gestuur aan ouers om toestemming vir hul kind te bevestig",
    icon: FileText, category: "lifecycle" },
  { value: "consent-confirmed", label: "Consent Confirmed", labelAf: "Toestemming Bevestig",
    desc: "Sent to learners after their parent confirms consent",
    descAf: "Gestuur aan leerders nadat hul ouer toestemming bevestig",
    icon: CheckCircle, category: "lifecycle" },
  { value: "day-13", label: "Trial Expiry — Day 13", labelAf: "Proeftydperk — Dag 13",
    desc: "Nudge sent on day 13 of trial: ending soon, keep momentum",
    descAf: "Stoot gestuur op dag 13 van proeftydperk: eindig binnekort",
    icon: AlertCircle, category: "lifecycle" },
  { value: "day-14", label: "Trial Expiry — Day 14", labelAf: "Proeftydperk — Dag 14",
    desc: "Urgent last-day notice: trial expires today, subscribe now",
    descAf: "Dringende laaste-dag kennisgewing: proeftydperk verloop vandag",
    icon: AlertCircle, category: "lifecycle" },
  { value: "subscription-confirmed", label: "Subscription Confirmed", labelAf: "Intekening Bevestig",
    desc: "Sent after a successful first payment or recurring renewal",
    descAf: "Gestuur na 'n suksesvolle eerste betaling of hernuwing",
    icon: CheckCircle, category: "billing" },
  { value: "payment-failed", label: "Payment Failed", labelAf: "Betaling Misluk",
    desc: "Sent when a recurring debit fails — 3-day grace period warning",
    descAf: "Gestuur wanneer 'n hernuwing misluk — 3-dae grasieperiode",
    icon: CreditCard, category: "billing" },
  { value: "subscription-cancelled", label: "Subscription Cancelled", labelAf: "Intekening Gekanselleer",
    desc: "Confirmation that the subscription has been cancelled",
    descAf: "Bevestiging dat die intekening gekanselleer is",
    icon: XCircle, category: "billing" },
  { value: "streak-milestone", label: "Streak Milestone", labelAf: "Streep-Mylpaal",
    desc: "Celebrates a learner hitting a 7 / 30 / 100-day study streak",
    descAf: "Vier 'n leerder se 7 / 30 / 100-dae studie-streep",
    icon: Flame, category: "engagement" },
  { value: "weekly-progress", label: "Weekly Progress Recap", labelAf: "Weeklikse Vordering",
    desc: "Sunday digest: questions answered, topics covered, study time",
    descAf: "Sondag-opsomming: vrae, onderwerpe, studietyd",
    icon: BarChart3, category: "engagement" },
  { value: "exam-countdown", label: "NSC Exam Countdown", labelAf: "NSC-Eksamen Aftel",
    desc: "Reminder triggered at 30 / 21 / 14 / 7 days before the next paper",
    descAf: "Herinnering by 30 / 21 / 14 / 7 dae voor die volgende vraestel",
    icon: CalendarClock, category: "engagement" },
  { value: "inactivity-nudge", label: "Inactivity Nudge", labelAf: "Onaktiewe Stoot",
    desc: "Friendly \"we miss you\" sent after 7 days without activity",
    descAf: "Vriendelike \"ons mis jou\" na 7 dae sonder aktiwiteit",
    icon: UserMinus, category: "engagement" },
];

const CATEGORY_META: Record<Category, { en: string; af: string }> = {
  lifecycle: { en: "Lifecycle", af: "Lewensiklus" },
  billing: { en: "Billing", af: "Fakturering" },
  engagement: { en: "Engagement", af: "Betrokkenheid" },
};

export default function AdminEmailsPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [selectedType, setSelectedType] = useState<EmailType>("welcome");
  const [previewLang, setPreviewLang] = useState<Lang>("en");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState<string>("");
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [lastSendResult, setLastSendResult] = useState<SendResponse | null>(null);

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [fromEmailInput, setFromEmailInput] = useState("");
  const [fromNameInput, setFromNameInput] = useState("");
  const [replyToInput, setReplyToInput] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsTestResult, setSettingsTestResult] = useState<SendResponse | null>(null);

  const { data: emailConfig, isLoading: isConfigLoading } = useQuery<EmailConfig>({
    queryKey: ["/api/admin/email-config"],
    queryFn: async () => {
      const res = await fetch("/api/admin/email-config", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: (cfg: EmailConfig) => {
      if (!settingsLoaded) {
        setFromEmailInput(cfg.fromEmail);
        setFromNameInput(cfg.fromName);
        setReplyToInput(cfg.replyTo);
        setSettingsLoaded(true);
      }
    },
  } as any);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = {
        fromEmail: fromEmailInput,
        fromName: fromNameInput,
        replyTo: replyToInput,
      };
      if (apiKeyInput.trim()) body.apiKey = apiKeyInput.trim();
      const res = await apiRequest("POST", "/api/admin/email-config", body);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-config"] });
      setApiKeyInput("");
      setSettingsLoaded(false);
      toast({
        title: isAf ? "Instellings gestoor" : "Settings saved",
        description: isAf ? "E-posinstelling suksesvol bygewerk." : "Email settings updated successfully.",
      });
    },
    onError: (err: any) => {
      toast({ title: isAf ? "Stoor misluk" : "Save failed", description: err?.message ?? String(err), variant: "destructive" });
    },
  });

  const settingsTestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/test-email", {});
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<SendResponse>;
    },
    onSuccess: (data) => {
      setSettingsTestResult(data);
      if (data.delivery === "sent") {
        toast({ title: isAf ? "Toets-e-pos gestuur!" : "Test email sent!", description: isAf ? "Gestuur na jou admin-adres." : "Sent to your admin address." });
      } else {
        toast({
          title: isAf ? "Stuur misluk" : "Send failed",
          description: data.error ?? (data.delivery === "not_configured" ? (isAf ? "E-pos nie gekonfigureer nie" : "Email not configured") : (isAf ? "Onbekende fout" : "Unknown error")),
          variant: "destructive",
        });
      }
    },
    onError: (err: any) => {
      toast({ title: isAf ? "Fout" : "Error", description: err?.message ?? String(err), variant: "destructive" });
    },
  });

  async function fetchPreview(type: EmailType, lang: Lang) {
    setIsFetchingPreview(true);
    setPreviewHtml(null);
    try {
      const res = await fetch(`/api/admin/emails/preview?type=${type}&language=${lang}`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PreviewResponse = await res.json();
      setPreviewHtml(data.html);
      setPreviewSubject(data.subject);
    } catch (err) {
      toast({ title: isAf ? "Voorskou misluk" : "Preview failed", description: String(err), variant: "destructive" });
    } finally {
      setIsFetchingPreview(false);
    }
  }

  function handleTypeSelect(type: EmailType) {
    setSelectedType(type);
    setPreviewHtml(null);
    setPreviewSubject("");
    setLastSendResult(null);
  }

  function handleLangChange(lang: Lang) {
    setPreviewLang(lang);
    setPreviewHtml(null);
    setPreviewSubject("");
    setLastSendResult(null);
  }

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/emails/test-send", {
        type: selectedType, language: previewLang, to: testEmail,
      });
      return res.json() as Promise<SendResponse>;
    },
    onSuccess: (data) => {
      setLastSendResult(data);
      if (data.delivery === "sent") {
        toast({ title: isAf ? "Toets-e-pos gestuur!" : "Test email sent!", description: testEmail });
      } else if (data.delivery === "not_configured") {
        toast({
          title: isAf ? "E-pos nie gekonfigureer nie" : "Email not configured",
          description: isAf ? "Konfigureer SendGrid in die Instellings-oortjie." : "Configure SendGrid in the Settings tab.",
          variant: "destructive",
        });
      } else {
        toast({ title: isAf ? "Stuur misluk" : "Send failed", description: data.error ?? (isAf ? "Onbekende fout" : "Unknown error"), variant: "destructive" });
      }
    },
    onError: (err: any) => {
      toast({ title: isAf ? "Fout" : "Error", description: err?.message ?? String(err), variant: "destructive" });
    },
  });

  const selectedMeta = EMAIL_TYPES.find((t) => t.value === selectedType)!;
  const groupedTypes = useMemo(() => {
    const groups: Record<Category, typeof EMAIL_TYPES> = { lifecycle: [], billing: [], engagement: [] };
    EMAIL_TYPES.forEach((t) => groups[t.category].push(t));
    return groups;
  }, []);

  const headerActions = (
    <div className="flex items-center gap-2">
      <div role="group" className="flex items-center rounded-xl border border-border bg-card p-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          data-testid="tab-templates"
          aria-pressed={activeTab === "templates"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "templates" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          {isAf ? "Sjablone" : "Templates"}
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("settings"); setSettingsTestResult(null); }}
          data-testid="tab-settings"
          aria-pressed={activeTab === "settings"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "settings" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          {isAf ? "Instellings" : "Settings"}
        </button>
      </div>

      {activeTab === "templates" && (
        <div role="group" className="flex items-center rounded-full border border-border bg-card p-0.5">
          {(["en", "af"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => handleLangChange(l)}
              data-testid={`button-lang-${l}`}
              aria-pressed={previewLang === l}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                previewLang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l === "en" ? "EN" : "AF"}
            </button>
          ))}
        </div>
      )}

      <Link
        href="/learn/admin/reports"
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition"
        aria-label={isAf ? "Terug na Admin" : "Back to Admin"}
        data-testid="link-admin"
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition"
        aria-label={isAf ? "Kontroleskerm" : "Dashboard"}
        data-testid="button-home"
      >
        <Home className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <AdminTopNav current="emails" />
      <PageHeader
        sticky
        icon={Mail}
        title={isAf ? "E-pos Bestuur" : "Email Management"}
        subtitle={isAf ? "Voorskou, toets en konfigureer transaksionele e-posse" : "Preview, test and configure transactional emails"}
        testId="text-page-title"
        actions={headerActions}
      />

      {/* ── SETTINGS TAB ── */}
      {activeTab === "settings" && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          {!isConfigLoading && emailConfig && (
            <div
              data-testid="config-status-banner"
              className={`mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium ${
                emailConfig.isConfigured
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              {emailConfig.isConfigured
                ? <ShieldCheck className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />}
              {emailConfig.isConfigured
                ? (isAf ? "SendGrid is gekonfigureer en aktief" : "SendGrid is configured and active")
                : (isAf ? "Geen API-sleutel gekonfigureer nie — e-posse sal nie gestuur word nie" : "No API key configured — emails will not be sent")}
            </div>
          )}

          <Card className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                <Key className="w-3.5 h-3.5" />
                {isAf ? "SendGrid API-sleutel" : "SendGrid API Key"}
              </label>
              {!isConfigLoading && emailConfig?.apiKeyDisplay && (
                <p className="text-xs text-muted-foreground">
                  {isAf ? "Huidig: " : "Current: "}
                  <span className="font-mono text-primary">{emailConfig.apiKeyDisplay}</span>
                </p>
              )}
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={isAf ? "Nuwe sleutel (laat leeg om te behou)" : "New key (leave blank to keep current)"}
                  data-testid="api-key-input"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                  tabIndex={-1}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                {isAf
                  ? "Die sleutel word gevalideer teen die SendGrid API voor dit gestoor word. Die rou waarde word nooit aan die voorkant gewys nie."
                  : "The key is validated against the SendGrid API before saving. The raw value is never shown to the frontend after saving."}
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                <AtSign className="w-3.5 h-3.5" />
                {isAf ? "Van E-posadres" : "From Email Address"}
              </label>
              <input
                type="email"
                value={fromEmailInput}
                onChange={(e) => setFromEmailInput(e.target.value)}
                placeholder="learn@braintrack.app"
                data-testid="from-email-input"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                <UserIcon className="w-3.5 h-3.5" />
                {isAf ? "Vertoonnaam" : "From Display Name"}
              </label>
              <input
                type="text"
                value={fromNameInput}
                onChange={(e) => setFromNameInput(e.target.value)}
                placeholder="BrainTrack"
                data-testid="from-name-input"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                <CornerDownLeft className="w-3.5 h-3.5" />
                {isAf ? "Antwoord-aan Adres" : "Reply-To Address"}
                <span className="text-muted-foreground/60 font-normal normal-case tracking-normal">
                  {isAf ? "(opsioneel)" : "(optional)"}
                </span>
              </label>
              <input
                type="email"
                value={replyToInput}
                onChange={(e) => setReplyToInput(e.target.value)}
                placeholder={isAf ? "antwoord@braintrack.app" : "replies@braintrack.app"}
                data-testid="reply-to-input"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
              />
            </div>

            <Button
              type="button"
              data-testid="save-config-button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || (!fromEmailInput && !fromNameInput && !apiKeyInput)}
              className="w-full"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isAf ? "Stoor Instellings" : "Save Settings"}
            </Button>
          </Card>

          <Card className="mt-6 p-6 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Send className="w-4 h-4 text-primary" />
              {isAf ? "Stuur Toets-E-pos" : "Send Test Email"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAf
                ? "Stuur 'n welkom-sjabloonepos na jou eie admin-adres om te bevestig dat aflewering werk met die gestoorde konfigurasie."
                : "Send a welcome template email to your own admin address to confirm delivery works with the saved configuration."}
            </p>
            <Button
              type="button"
              variant="secondary"
              data-testid="settings-test-send-button"
              disabled={settingsTestMutation.isPending}
              onClick={() => { setSettingsTestResult(null); settingsTestMutation.mutate(); }}
            >
              {settingsTestMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {isAf ? "Stuur Toets na My Adres" : "Send Test to My Address"}
            </Button>

            {settingsTestResult && (
              <div
                data-testid="settings-test-result"
                className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm border ${
                  settingsTestResult.delivery === "sent"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : settingsTestResult.delivery === "not_configured"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}
              >
                {settingsTestResult.delivery === "sent"
                  ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>
                  {settingsTestResult.delivery === "sent"
                    ? isAf ? "E-pos suksesvol gestuur!" : "Email sent successfully!"
                    : settingsTestResult.delivery === "not_configured"
                    ? isAf ? "Nie gekonfigureer — stel die API-sleutel hierbo in." : "Not configured — set the API key above."
                    : settingsTestResult.error ?? (isAf ? "Stuur misluk" : "Send failed")}
                </span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TEMPLATES TAB ── */}
      {activeTab === "templates" && (
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
          {/* Sidebar — grouped email type list */}
          <aside className="lg:w-80 shrink-0 space-y-5">
            {(Object.keys(groupedTypes) as Category[]).map((cat) => (
              <div key={cat}>
                <h2 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                  {isAf ? CATEGORY_META[cat].af : CATEGORY_META[cat].en}
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5">{groupedTypes[cat].length}</Badge>
                </h2>
                <div className="space-y-1.5">
                  {groupedTypes[cat].map((et) => {
                    const Icon = et.icon;
                    const active = selectedType === et.value;
                    return (
                      <button
                        key={et.value}
                        type="button"
                        data-testid={`email-type-${et.value}`}
                        onClick={() => handleTypeSelect(et.value)}
                        aria-pressed={active}
                        className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                          active
                            ? "bg-primary/10 border-primary/40 text-foreground shadow-[0_0_20px_-8px_hsl(var(--primary)/0.5)]"
                            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                        }`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border ${active ? "bg-primary/15 border-primary/40 text-primary" : "bg-background border-border text-muted-foreground"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-foreground mb-0.5">
                            {isAf ? et.labelAf : et.label}
                          </div>
                          <div className="text-xs text-muted-foreground leading-snug">
                            {isAf ? et.descAf : et.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Test send panel */}
            <Card className="p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Send className="w-3 h-3" />
                {isAf ? "Toets Stuur" : "Test Send"}
              </h3>
              <p className="text-xs text-muted-foreground leading-snug">
                {isAf
                  ? "Stuur die gekose sjabloon na enige e-posadres."
                  : "Send the selected template to any email address."}
              </p>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder={isAf ? "jou@epos.com" : "you@email.com"}
                data-testid="test-email-input"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
              />
              <Button
                type="button"
                data-testid="test-send-button"
                disabled={sendMutation.isPending || !testEmail.includes("@")}
                onClick={() => { setLastSendResult(null); sendMutation.mutate(); }}
                className="w-full"
                size="sm"
              >
                {sendMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {isAf ? "Stuur Toets" : "Send Test"}
              </Button>

              {lastSendResult && (
                <div
                  data-testid="send-result"
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs border ${
                    lastSendResult.delivery === "sent"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : lastSendResult.delivery === "not_configured"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}
                >
                  {lastSendResult.delivery === "sent" ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                  <span>
                    {lastSendResult.delivery === "sent"
                      ? isAf ? "E-pos gestuur!" : "Email sent!"
                      : lastSendResult.delivery === "not_configured"
                      ? isAf ? "E-pos nie gekonfigureer nie — gebruik Instellings" : "Email not configured — use Settings tab"
                      : lastSendResult.error ?? (isAf ? "Stuur misluk" : "Send failed")}
                  </span>
                </div>
              )}
            </Card>
          </aside>

          {/* Main — preview area */}
          <main className="flex-1 min-w-0">
            <Card className="p-5 mb-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {isAf ? CATEGORY_META[selectedMeta.category].af : CATEGORY_META[selectedMeta.category].en}
                    </Badge>
                    <h1 className="text-lg font-bold text-foreground">
                      {isAf ? selectedMeta.labelAf : selectedMeta.label}
                    </h1>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isAf ? selectedMeta.descAf : selectedMeta.desc}
                  </p>
                  {previewSubject && (
                    <p className="text-xs text-primary mt-2 font-medium">
                      {isAf ? "Onderwerp: " : "Subject: "}
                      <span className="text-foreground/80" data-testid="preview-subject">{previewSubject}</span>
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  data-testid="preview-button"
                  onClick={() => fetchPreview(selectedType, previewLang)}
                  disabled={isFetchingPreview}
                  className="shrink-0"
                >
                  {isFetchingPreview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                  {isAf ? "Wys Voorskou" : "Render Preview"}
                </Button>
              </div>
            </Card>

            <Card className="overflow-hidden p-0" style={{ minHeight: "600px" }}>
              {isFetchingPreview && (
                <div className="flex items-center justify-center h-96 bg-card">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              {!isFetchingPreview && !previewHtml && (
                <div className="flex flex-col items-center justify-center h-96 bg-card text-muted-foreground" data-testid="preview-empty">
                  <Mail className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">
                    {isAf
                      ? "Klik \"Wys Voorskou\" om die e-possjabloon te sien"
                      : "Click \"Render Preview\" to view the email template"}
                  </p>
                </div>
              )}
              {!isFetchingPreview && previewHtml && (
                <iframe
                  data-testid="email-preview-frame"
                  title="Email Preview"
                  srcDoc={previewHtml}
                  className="w-full border-0 bg-white"
                  style={{ height: "700px" }}
                  sandbox="allow-same-origin"
                />
              )}
            </Card>

            <p className="text-xs text-muted-foreground/70 mt-3 text-center">
              {isAf
                ? "Voorskou gebruik voorbeelddata. Werklike e-posse gebruik die leerder se naam en datums."
                : "Preview uses sample data. Real emails use the learner's name and actual dates."}
            </p>
          </main>
        </div>
      )}
    </div>
  );
}
