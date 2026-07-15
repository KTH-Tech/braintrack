import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { AdminTopNav } from "@/components/admin-top-nav";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, Upload, Trash2, CheckCircle, Loader2, ImageIcon, Calendar, Clock, Send, History, ToggleLeft, ToggleRight } from "lucide-react";

type PartnerBranding = {
  partnerName: string | null;
  hasLogo: boolean;
  partnerLogoBase64: string | null;
};

type ReportScheduleConfig = {
  enabled: boolean;
  frequency: "weekly" | "monthly";
  dayOfWeek: number;
  dayOfMonth: number;
  sendHourSast: number;
};

type SendLogEntry = {
  id: number;
  parentUserId: string;
  learnerUserId: string | null;
  learnerName: string | null;
  sentToEmail: string | null;
  status: string;
  errorMessage: string | null;
  trigger: string | null;
  sentAt: string | null;
};

type OptOutLogEntry = {
  id: number;
  parentUserId: string;
  learnerUserId: string | null;
  learnerName: string | null;
  parentEmail: string | null;
  action: string; // "opted_out" | "resubscribed"
  source: string; // "parent_dashboard" | "unsubscribe_link"
  createdAt: string | null;
};

function NeonShell({ children, color = "#8A2BFF", className = "" }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <div
      className={`relative rounded-2xl bg-black overflow-hidden ${className}`}
      style={{ border: `1.5px solid ${color}`, boxShadow: `0 0 0 1px rgba(138,43,255,0.22), 0 0 28px rgba(138,43,255,0.18)` }}
    >
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: color }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: color }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: color }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: color }} />
      {children}
    </div>
  );
}

const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_NAMES_AF = ["Sondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrydag", "Saterdag"];

function StatusBadge({ status, errorMessage, isAf }: { status: string; errorMessage?: string | null; isAf?: boolean }) {
  // Opt-out skips are not failures — surface them with their own neutral/amber
  // styling and a clear label so admins can tell them apart from real errors.
  const isOptOut = status === "skipped" && errorMessage === "opted_out";
  if (isOptOut) {
    return (
      <span
        className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
        style={{ background: "rgba(245,158,11,0.15)", border: "1px solid #f59e0b", color: "#f59e0b" }}
      >
        {isAf ? "Afgemeld" : "Opted out"}
      </span>
    );
  }
  const color =
    status === "sent"
      ? { bg: "rgba(16,185,129,0.15)", border: "#10b981", text: "#10b981" }
      : status === "failed"
        ? { bg: "rgba(220,38,38,0.15)", border: "#dc2626", text: "#dc2626" }
        : { bg: "rgba(107,114,128,0.15)", border: "#6b7280", text: "#6b7280" };
  return (
    <span
      className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}
    >
      {status}
    </span>
  );
}

export default function AdminPartnerBrandingPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Branding state
  const [partnerName, setPartnerName] = useState<string>("");
  const [localLogo, setLocalLogo] = useState<File | null>(null);
  const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);
  const [clearLogo, setClearLogo] = useState(false);

  const { data, isLoading } = useQuery<PartnerBranding>({
    queryKey: ["/api/admin/partner-branding"],
    select: (d) => d,
  });

  useEffect(() => {
    if (data) {
      setPartnerName(data.partnerName ?? "");
    }
  }, [data?.partnerName]);

  // Schedule state
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<"weekly" | "monthly">("weekly");
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState(1);
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState(1);
  const [scheduleSendHourSast, setScheduleSendHourSast] = useState(7);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery<{ config: ReportScheduleConfig }>({
    queryKey: ["/api/admin/report-schedule"],
  });

  useEffect(() => {
    if (scheduleData?.config && !scheduleLoaded) {
      const c = scheduleData.config;
      setScheduleEnabled(c.enabled);
      setScheduleFrequency(c.frequency);
      setScheduleDayOfWeek(c.dayOfWeek);
      setScheduleDayOfMonth(c.dayOfMonth);
      setScheduleSendHourSast(c.sendHourSast);
      setScheduleLoaded(true);
    }
  }, [scheduleData, scheduleLoaded]);

  const { data: sendLogData, isLoading: sendLogLoading, refetch: refetchLog } = useQuery<{ log: SendLogEntry[] }>({
    queryKey: ["/api/admin/report-schedule/send-log"],
  });

  const { data: optOutLogData, isLoading: optOutLogLoading } = useQuery<{ log: OptOutLogEntry[] }>({
    queryKey: ["/api/admin/report-schedule/opt-out-log"],
  });

  const saveBrandingMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append("partnerName", partnerName);
      if (clearLogo) form.append("clearLogo", "true");
      if (localLogo) form.append("logo", localLogo);
      const res = await fetch("/api/admin/partner-branding", {
        method: "PUT",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Save failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/partner-branding"] });
      setLocalLogo(null);
      setLocalLogoPreview(null);
      setClearLogo(false);
      toast({
        title: isAf ? "Vennoothandels gestoer" : "Partner branding saved",
        description: isAf ? "Veranderinge sal in alle nuwe verslae verskyn." : "Changes will appear in all newly generated reports.",
      });
    },
    onError: (err: Error) => {
      toast({ title: isAf ? "Stoor misluk" : "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const saveScheduleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/report-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          enabled: scheduleEnabled,
          frequency: scheduleFrequency,
          dayOfWeek: scheduleDayOfWeek,
          dayOfMonth: scheduleDayOfMonth,
          sendHourSast: scheduleSendHourSast,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Save failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/report-schedule"] });
      setScheduleLoaded(false);
      toast({
        title: isAf ? "Skedule gestoer" : "Schedule saved",
        description: isAf ? "Verslagstuurplan is opgedateer." : "Report send schedule has been updated.",
      });
    },
    onError: (err: Error) => {
      toast({ title: isAf ? "Stoor misluk" : "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const sendNowMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/report-schedule/send-now", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Send failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      refetchLog();
      const r = data.result;
      toast({
        title: isAf ? "Verslae gestuur" : "Reports sent",
        description: isAf
          ? `Gestuur: ${r.sent} · Misluk: ${r.failed} · Oorgeslaan: ${r.skipped}`
          : `Sent: ${r.sent} · Failed: ${r.failed} · Skipped: ${r.skipped}`,
      });
    },
    onError: (err: Error) => {
      toast({ title: isAf ? "Stuur misluk" : "Send failed", description: err.message, variant: "destructive" });
    },
  });

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: isAf ? "Lêer te groot" : "File too large", description: isAf ? "Logo moet kleiner as 2 MB wees." : "Logo must be smaller than 2 MB.", variant: "destructive" });
      return;
    }
    setLocalLogo(file);
    setClearLogo(false);
    const reader = new FileReader();
    reader.onload = (ev) => setLocalLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleClearLogo() {
    setLocalLogo(null);
    setLocalLogoPreview(null);
    setClearLogo(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const currentLogoSrc = localLogoPreview ?? (clearLogo ? null : data?.partnerLogoBase64 ?? null);
  const hasAnyLogo = !!currentLogoSrc;
  const isBrandingDirty = partnerName !== (data?.partnerName ?? "") || !!localLogo || clearLogo;

  const dayNames = isAf ? DAY_NAMES_AF : DAY_NAMES_EN;

  const formatSendTime = () => {
    const hour = scheduleSendHourSast;
    const ampm = hour < 12 ? "AM" : "PM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:00 ${ampm} SAST`;
  };

  const sendLog = sendLogData?.log ?? [];

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminTopNav current="partner-branding" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── Branding section ── */}
        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-white">
              {isAf ? "Vennoothandels-instellings" : "Partner Branding Settings"}
            </h1>
            <p className="mt-1 text-sm text-white/60 leading-relaxed max-w-xl">
              {isAf
                ? "Stel 'n vennootnaam en logo in. Dit sal in alle nuut gegenereerde ouerverslae verskyn, langs die BrainTrack-handelsmerk."
                : "Set a partner display name and logo. These appear in all newly generated parent reports, alongside the BrainTrack brand."}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#8A2BFF" }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Form */}
              <NeonShell color="#8A2BFF">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center" style={{ border: "1.5px solid #8A2BFF", boxShadow: "0 0 12px rgba(138,43,255,0.4)" }}>
                      <Building2 className="w-5 h-5" style={{ color: "#8A2BFF" }} />
                    </div>
                    <h2 className="text-base font-black text-white">{isAf ? "Vennootnaam" : "Partner Name"}</h2>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-white/60 mb-2">
                      {isAf ? "Vertoonaam (opsioneel)" : "Display name (optional)"}
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder={isAf ? "bv. Hoërskool Stellenbosch" : "e.g. Stellenbosch High School"}
                      maxLength={80}
                      data-testid="input-partner-name"
                      className="w-full rounded-xl bg-black text-white text-sm px-4 py-3 outline-none focus:ring-2 placeholder-white/30"
                      style={{ border: "1px solid rgba(138,43,255,0.4)" }}
                    />
                    <p className="mt-1.5 text-[10px] text-white/40">
                      {isAf ? "Laat leeg om geen vennootteks te wys nie." : "Leave empty to show no partner text."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-white/60 mb-2">
                      {isAf ? "Vennootlogo" : "Partner Logo"}
                    </label>

                    {hasAnyLogo ? (
                      <div className="flex flex-col gap-3">
                        <div className="relative rounded-xl overflow-hidden bg-white flex items-center justify-center" style={{ height: 80, border: "1px solid rgba(138,43,255,0.3)" }}>
                          <img src={currentLogoSrc!} alt={isAf ? "Vennootlogo-voorskou" : "Partner logo preview"} className="max-h-full max-w-full object-contain p-2" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition" style={{ border: "1px solid rgba(138,43,255,0.5)", color: "#8A2BFF" }} data-testid="btn-replace-logo">
                            <Upload className="w-3.5 h-3.5" />
                            {isAf ? "Vervang" : "Replace"}
                          </button>
                          <button type="button" onClick={handleClearLogo} className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition" style={{ border: "1px solid rgba(255,43,214,0.5)", color: "#FF2BD6" }} data-testid="btn-clear-logo">
                            <Trash2 className="w-3.5 h-3.5" />
                            {isAf ? "Verwyder" : "Remove"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 rounded-xl py-6 text-sm font-semibold transition-all hover:bg-white/5" style={{ border: "2px dashed rgba(138,43,255,0.4)", color: "#8A2BFF" }} data-testid="btn-upload-logo">
                        <ImageIcon className="w-8 h-8 opacity-60" />
                        <span>{isAf ? "Klik om logo op te laai" : "Click to upload logo"}</span>
                        <span className="text-[11px] text-white/40 font-normal">{isAf ? "PNG, JPG of SVG · maks 2 MB" : "PNG, JPG or SVG · max 2 MB"}</span>
                      </button>
                    )}

                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} data-testid="input-logo-file" />
                  </div>

                  <button
                    type="button"
                    onClick={() => saveBrandingMutation.mutate()}
                    disabled={saveBrandingMutation.isPending || !isBrandingDirty}
                    data-testid="btn-save-branding"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#8A2BFF", color: "#000", boxShadow: "0 0 20px rgba(138,43,255,0.5)" }}
                  >
                    {saveBrandingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {saveBrandingMutation.isPending ? (isAf ? "Stoor…" : "Saving…") : (isAf ? "Stoor Veranderinge" : "Save Changes")}
                  </button>
                </div>
              </NeonShell>

              {/* Right: Live preview */}
              <NeonShell color="#00E5FF">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center" style={{ border: "1.5px solid #00E5FF", boxShadow: "0 0 12px rgba(0,229,255,0.4)" }}>
                      <ImageIcon className="w-5 h-5" style={{ color: "#00E5FF" }} />
                    </div>
                    <h2 className="text-base font-black text-white">{isAf ? "Verslag-kopstuk-voorskou" : "Report Header Preview"}</h2>
                  </div>

                  <p className="text-xs text-white/50">
                    {isAf ? "Hierdie is 'n benadering van hoe die PDF-kopstuk sal lyk." : "This approximates how the PDF header will look."}
                  </p>

                  <div className="rounded-xl overflow-hidden" style={{ background: "#1e1b4b" }} data-testid="report-header-preview">
                    <div className="px-5 py-4">
                      <div className="text-2xl font-black text-white" style={{ fontFamily: "serif" }}>BrainTrack™</div>
                      <div className="text-xs mt-0.5" style={{ color: "#c4b5fd" }}>{isAf ? "Vorderingsverslag" : "Progress Report"}</div>
                      <div className="mt-2 text-[11px] text-white/80">{isAf ? "Leerder:" : "Learner:"} {isAf ? "U Kind" : "Your Child"}</div>
                      {(partnerName || hasAnyLogo) && (
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[10px]" style={{ color: "#c4b5fd" }}>
                            {isAf ? "In vennootskap met:" : "In partnership with:"} {partnerName || "—"}
                          </span>
                          {hasAnyLogo && (
                            <img src={currentLogoSrc!} alt={isAf ? "Vennootlogo" : "Partner logo"} className="h-5 object-contain bg-white rounded px-1" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.18)" }}>
                    <p className="text-[11px] font-bold text-white" style={{ color: "#00E5FF" }}>{isAf ? "Wenke" : "Tips"}</p>
                    <ul className="text-[11px] text-white/60 space-y-1 list-disc list-inside">
                      <li>{isAf ? "Gebruik 'n logo met deurskynende agtergrond (PNG) vir beste resultate." : "Use a logo with transparent background (PNG) for best results."}</li>
                      <li>{isAf ? "Horisontale logo's werk die beste in die koptekst." : "Horizontal logos work best in the header."}</li>
                      <li>{isAf ? "Veranderinge word onmiddellik op alle nuwe verslae toegepas." : "Changes apply immediately to all new reports."}</li>
                      <li>{isAf ? "Vorige afgelaaide verslae word nie verander nie." : "Previously downloaded reports are not affected."}</li>
                    </ul>
                  </div>
                </div>
              </NeonShell>
            </div>
          )}
        </section>

        {/* ── Scheduled Report Email section ── */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: "#f59e0b" }} />
              {isAf ? "Geskeduleerde Verslag-e-pos" : "Scheduled Report Emails"}
            </h2>
            <p className="mt-1 text-sm text-white/60 leading-relaxed max-w-xl">
              {isAf
                ? "Stuur outomaties die vorderingsverslag na alle aktiewe ouers op 'n gereelde skedule. Die verslag word as PDF aangeheg."
                : "Automatically email the progress report to all active parents on a regular schedule. The report is attached as a PDF."}
            </p>
          </div>

          {scheduleLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#f59e0b" }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Schedule config */}
              <NeonShell color="#f59e0b">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center" style={{ border: "1.5px solid #f59e0b", boxShadow: "0 0 12px rgba(245,158,11,0.4)" }}>
                      <Clock className="w-5 h-5" style={{ color: "#f59e0b" }} />
                    </div>
                    <h3 className="text-base font-black text-white">{isAf ? "Skedule-instellings" : "Schedule Settings"}</h3>
                  </div>

                  {/* Enable/Disable toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">{isAf ? "Skedule aktief" : "Schedule enabled"}</p>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        {isAf ? "Skakel outomatiese versending aan of af." : "Turn automatic sending on or off."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScheduleEnabled((v) => !v)}
                      data-testid="toggle-schedule-enabled"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition"
                      style={{
                        background: scheduleEnabled ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${scheduleEnabled ? "#f59e0b" : "rgba(255,255,255,0.15)"}`,
                        color: scheduleEnabled ? "#f59e0b" : "#6b7280",
                      }}
                    >
                      {scheduleEnabled
                        ? <><ToggleRight className="w-4 h-4" />{isAf ? "Aan" : "On"}</>
                        : <><ToggleLeft className="w-4 h-4" />{isAf ? "Af" : "Off"}</>
                      }
                    </button>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-white/60 mb-2">
                      {isAf ? "Frekwensie" : "Frequency"}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["weekly", "monthly"] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setScheduleFrequency(f)}
                          data-testid={`btn-freq-${f}`}
                          className="py-2 rounded-xl text-xs font-bold transition"
                          style={{
                            background: scheduleFrequency === f ? "#f59e0b" : "rgba(255,255,255,0.04)",
                            color: scheduleFrequency === f ? "#000" : "#9ca3af",
                            border: `1px solid ${scheduleFrequency === f ? "#f59e0b" : "rgba(255,255,255,0.12)"}`,
                          }}
                        >
                          {f === "weekly" ? (isAf ? "Weekliks" : "Weekly") : (isAf ? "Maandeliks" : "Monthly")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day picker */}
                  {scheduleFrequency === "weekly" ? (
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-white/60 mb-2">
                        {isAf ? "Dag van die week" : "Day of week"}
                      </label>
                      <select
                        value={scheduleDayOfWeek}
                        onChange={(e) => setScheduleDayOfWeek(Number(e.target.value))}
                        data-testid="select-day-of-week"
                        className="w-full rounded-xl bg-black text-white text-sm px-4 py-3 outline-none"
                        style={{ border: "1px solid rgba(245,158,11,0.4)" }}
                      >
                        {dayNames.map((name, i) => (
                          <option key={i} value={i}>{name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-white/60 mb-2">
                        {isAf ? "Dag van die maand" : "Day of month"}
                      </label>
                      <select
                        value={scheduleDayOfMonth}
                        onChange={(e) => setScheduleDayOfMonth(Number(e.target.value))}
                        data-testid="select-day-of-month"
                        className="w-full rounded-xl bg-black text-white text-sm px-4 py-3 outline-none"
                        style={{ border: "1px solid rgba(245,158,11,0.4)" }}
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-[10px] text-white/40">
                        {isAf ? "Gebruik 1–28 om alle maande te dek." : "Use 1–28 to cover all months."}
                      </p>
                    </div>
                  )}

                  {/* Send hour */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-white/60 mb-2">
                      {isAf ? "Stuuruur (SAST)" : "Send hour (SAST)"}
                    </label>
                    <select
                      value={scheduleSendHourSast}
                      onChange={(e) => setScheduleSendHourSast(Number(e.target.value))}
                      data-testid="select-send-hour"
                      className="w-full rounded-xl bg-black text-white text-sm px-4 py-3 outline-none"
                      style={{ border: "1px solid rgba(245,158,11,0.4)" }}
                    >
                      {Array.from({ length: 24 }, (_, i) => i).map((h) => {
                        const ampm = h < 12 ? "AM" : "PM";
                        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                        return (
                          <option key={h} value={h}>{`${h12}:00 ${ampm}`}</option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => saveScheduleMutation.mutate()}
                    disabled={saveScheduleMutation.isPending}
                    data-testid="btn-save-schedule"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#f59e0b", color: "#000", boxShadow: "0 0 20px rgba(245,158,11,0.4)" }}
                  >
                    {saveScheduleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {saveScheduleMutation.isPending ? (isAf ? "Stoor…" : "Saving…") : (isAf ? "Stoor Skedule" : "Save Schedule")}
                  </button>
                </div>
              </NeonShell>

              {/* Right: Send preview + manual trigger */}
              <NeonShell color="#10b981">
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center" style={{ border: "1.5px solid #10b981", boxShadow: "0 0 12px rgba(16,185,129,0.4)" }}>
                      <Send className="w-5 h-5" style={{ color: "#10b981" }} />
                    </div>
                    <h3 className="text-base font-black text-white">{isAf ? "Stuur & Skedule-opsomming" : "Send & Schedule Summary"}</h3>
                  </div>

                  {/* Summary card */}
                  <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <span className="text-white/50">{isAf ? "Status:" : "Status:"}</span>
                      <span className={scheduleEnabled ? "text-green-400 font-bold" : "text-white/40"}>
                        {scheduleEnabled ? (isAf ? "✓ Aktief" : "✓ Active") : (isAf ? "✗ Af" : "✗ Off")}
                      </span>
                      <span className="text-white/50">{isAf ? "Frekwensie:" : "Frequency:"}</span>
                      <span className="text-white font-semibold">
                        {scheduleFrequency === "weekly" ? (isAf ? "Weekliks" : "Weekly") : (isAf ? "Maandeliks" : "Monthly")}
                      </span>
                      <span className="text-white/50">{isAf ? "Dag:" : "Day:"}</span>
                      <span className="text-white font-semibold">
                        {scheduleFrequency === "weekly"
                          ? dayNames[scheduleDayOfWeek]
                          : `${isAf ? "Dag" : "Day"} ${scheduleDayOfMonth}`}
                      </span>
                      <span className="text-white/50">{isAf ? "Tyd:" : "Time:"}</span>
                      <span className="text-white font-semibold">{formatSendTime()}</span>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
                    <p className="text-[11px] font-bold" style={{ color: "#10b981" }}>{isAf ? "Hoe dit werk" : "How it works"}</p>
                    <ul className="text-[11px] text-white/60 space-y-1 list-disc list-inside">
                      <li>{isAf ? "Elke aktiewe ouer met 'n bekende e-posadres ontvang die verslag." : "Every active parent with a known email receives the report."}</li>
                      <li>{isAf ? "Die PDF word intyds gegenereer met die nuutste data." : "The PDF is generated in real-time with the latest data."}</li>
                      <li>{isAf ? "Vennoothandels-logo en naam word ingesluit indien ingestel." : "Partner branding logo and name are included if set."}</li>
                      <li>{isAf ? "Alle sendings word in die stuurlys hieronder aangeteken." : "All sends are logged in the send log below."}</li>
                    </ul>
                  </div>

                  {/* Manual send now */}
                  <button
                    type="button"
                    onClick={() => sendNowMutation.mutate()}
                    disabled={sendNowMutation.isPending}
                    data-testid="btn-send-now"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1.5px solid #10b981", boxShadow: "0 0 16px rgba(16,185,129,0.25)" }}
                  >
                    {sendNowMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sendNowMutation.isPending ? (isAf ? "Stuur tans…" : "Sending…") : (isAf ? "Stuur Nou aan Alle Ouers" : "Send Now to All Parents")}
                  </button>
                  <p className="text-[10px] text-white/30 text-center">
                    {isAf
                      ? "Stuur onmiddellik aan alle aktiewe ouers, ongeag die skedule."
                      : "Sends immediately to all active parents, regardless of schedule."}
                  </p>
                </div>
              </NeonShell>
            </div>
          )}
        </section>

        {/* ── Send log section ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <History className="w-5 h-5" style={{ color: "#6366f1" }} />
              {isAf ? "Stuurlys" : "Send Log"}
            </h2>
            <button
              type="button"
              onClick={() => refetchLog()}
              className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition"
              style={{ border: "1px solid rgba(99,102,241,0.4)", color: "#6366f1" }}
            >
              {isAf ? "Verfris" : "Refresh"}
            </button>
          </div>

          <NeonShell color="#6366f1">
            <div className="p-4">
              {sendLogLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#6366f1" }} />
                </div>
              ) : sendLog.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-white/40">
                    {isAf ? "Nog geen verslae gestuur nie." : "No reports sent yet."}
                  </p>
                  <p className="text-xs text-white/25 mt-1">
                    {isAf ? "Stuur nou of aktiveer die skedule hierbo." : "Send now or activate the schedule above."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-white/40 font-black uppercase tracking-wider text-[10px]">
                        <th className="text-left pb-3 pr-4">{isAf ? "Tyd" : "Time"}</th>
                        <th className="text-left pb-3 pr-4">{isAf ? "Leerder" : "Learner"}</th>
                        <th className="text-left pb-3 pr-4">{isAf ? "Na" : "To"}</th>
                        <th className="text-left pb-3 pr-4">{isAf ? "Status" : "Status"}</th>
                        <th className="text-left pb-3">{isAf ? "Wyse" : "Trigger"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sendLog.slice(0, 50).map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/3 transition">
                          <td className="py-2.5 pr-4 text-white/50 whitespace-nowrap">
                            {entry.sentAt
                              ? new Date(entry.sentAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-white font-medium max-w-[120px] truncate">
                            {entry.learnerName ?? "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-white/60 max-w-[160px] truncate">
                            {entry.sentToEmail ?? "—"}
                          </td>
                          <td className="py-2.5 pr-4">
                            <StatusBadge status={entry.status} errorMessage={entry.errorMessage} isAf={isAf} />
                            {entry.errorMessage && entry.errorMessage !== "opted_out" && (
                              <p className="text-[9px] text-red-400 mt-0.5 max-w-[140px] truncate" title={entry.errorMessage}>
                                {entry.errorMessage}
                              </p>
                            )}
                            {entry.errorMessage === "opted_out" && (
                              <p className="text-[9px] text-amber-400/70 mt-0.5 max-w-[140px] truncate">
                                {isAf ? "Ouer afgemeld" : "Parent unsubscribed"}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5">
                            <span className="text-[10px] text-white/40">
                              {entry.trigger === "manual" ? (isAf ? "Handmatig" : "Manual") : (isAf ? "Gepland" : "Scheduled")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </NeonShell>
        </section>

        {/* Opt-out / re-subscribe audit log */}
        <section className="mb-8">
          <NeonShell color="#f59e0b">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <ToggleLeft className="w-4 h-4" style={{ color: "#f59e0b" }} />
                <h2 className="text-sm font-black uppercase tracking-wider text-white">
                  {isAf ? "Afmeld / Heraansluit-geskiedenis" : "Opt-out / Re-subscribe history"}
                </h2>
              </div>
              <p className="text-xs text-white/40 mb-4">
                {isAf
                  ? "Wanneer ouers afgemeld of weer aangesluit het vir verslag-e-posse."
                  : "When parents unsubscribed from or re-enabled scheduled report emails."}
              </p>

              {optOutLogLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#f59e0b" }} />
                </div>
              ) : (optOutLogData?.log ?? []).length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-white/40">
                    {isAf ? "Nog geen afmeld-aktiwiteit nie." : "No opt-out activity yet."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-white/40 font-black uppercase tracking-wider text-[10px]">
                        <th className="text-left pb-3 pr-4">{isAf ? "Tyd" : "Time"}</th>
                        <th className="text-left pb-3 pr-4">{isAf ? "Leerder" : "Learner"}</th>
                        <th className="text-left pb-3 pr-4">{isAf ? "Ouer-e-pos" : "Parent email"}</th>
                        <th className="text-left pb-3 pr-4">{isAf ? "Aksie" : "Action"}</th>
                        <th className="text-left pb-3">{isAf ? "Bron" : "Source"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(optOutLogData?.log ?? []).slice(0, 50).map((entry) => {
                        const isResub = entry.action === "resubscribed";
                        return (
                          <tr key={entry.id} className="hover:bg-white/3 transition">
                            <td className="py-2.5 pr-4 text-white/50 whitespace-nowrap">
                              {entry.createdAt
                                ? new Date(entry.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                : "—"}
                            </td>
                            <td className="py-2.5 pr-4 text-white font-medium max-w-[120px] truncate">
                              {entry.learnerName ?? "—"}
                            </td>
                            <td className="py-2.5 pr-4 text-white/60 max-w-[160px] truncate">
                              {entry.parentEmail ?? "—"}
                            </td>
                            <td className="py-2.5 pr-4">
                              <span
                                className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={
                                  isResub
                                    ? { background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", color: "#10b981" }
                                    : { background: "rgba(245,158,11,0.15)", border: "1px solid #f59e0b", color: "#f59e0b" }
                                }
                              >
                                {isResub ? (isAf ? "Heraangesluit" : "Re-subscribed") : (isAf ? "Afgemeld" : "Opted out")}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span className="text-[10px] text-white/40">
                                {entry.source === "unsubscribe_link"
                                  ? (isAf ? "E-pos skakel" : "Email link")
                                  : (isAf ? "Ouer-paneel" : "Parent dashboard")}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </NeonShell>
        </section>

      </main>
    </div>
  );
}
