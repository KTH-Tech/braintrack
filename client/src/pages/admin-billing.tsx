import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminTopNav } from "@/components/admin-top-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, AlertTriangle, Clock, CreditCard, XCircle,
  MessageSquare, RefreshCw, Bell, CheckCircle, Zap, TrendingUp,
  Users, Send, Link2, X, ChevronRight, CalendarPlus, Gift, History, ChevronDown, ShieldCheck, Ban, FileText,
} from "lucide-react";
import { ToastAction } from "@/components/ui/toast";

type BillingRow = {
  userId: string;
  userEmail: string | null;
  userName: string | null;
  status: string;
  plan: string | null;
  billingMethod: string | null;
  trialEndsAt: string | null;
  nextRenewalAt: string | null;
  gracePeriodEndsAt: string | null;
  lastPaymentStatus: string | null;
  lastPaymentAt: string | null;
  parentCell: string | null;
  learnerCell: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  trialReminderD13Sent: boolean | null;
  trialReminderD14Sent: boolean | null;
  priceRands: number | null;
};

type ReminderHistoryRow = {
  id: number;
  userId: string;
  sentAt: string;
  type: string;
  result: { ok?: boolean; sent?: number; failed?: number; reason?: string };
  sentBy: string;
  targetEmail: string | null;
  targetName: string | null;
};

type BillingSummary = {
  active: number;
  trial: number;
  grace: number;
  lapsed: number;
  cancelled: number;
  mrr: number;
};

type SmsStats = {
  days: number;
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
  pending: number;
  notConfigured: number;
  autoRetried: number;
};

type LinkHistoryRow = {
  jti: string;
  sentTo: string | null;
  channel: string | null;
  deliveryStatus: string | null;
  deliveryError: string | null;
  deliveryUpdatedAt: string | null;
  retryCount: number | null;
  createdAt: string | null;
  expiresAt: string | null;
  usedAt: string | null;
};

type StuckLinksResult = {
  count: number;
  links: Array<{
    jti: string;
    userId: string;
    sentTo: string;
    deliveryStatus: string;
    deliveryError: string | null;
    createdAt: string;
    hoursAgo: number;
    retryCount: number;
  }>;
};

type AuditLogRow = {
  id: number;
  adminUserId: string;
  action: string;
  details: {
    metadata?: {
      targetUserId?: string;
      days?: number;
      newTrialEndsAt?: string;
      note?: string | null;
    };
    timestamp?: string;
  } | null;
  createdAt: string | null;
};

type Tab = "trials" | "grace" | "lapsed";

type NeonColor = string;

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return String(d); }
}

function fmtDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch { return String(d); }
}

function daysUntil(d: string | null | undefined): number | null {
  if (!d) return null;
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

function daysAgo(d: string | null | undefined): number | null {
  if (!d) return null;
  const diff = Date.now() - new Date(d).getTime();
  return Math.floor(diff / 86_400_000);
}

function fmtMrr(rands: number): string {
  return `R${(rands).toLocaleString("en-ZA")}`;
}

function deliveryStatusColor(status: string | null): string {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return "#9FD8FF";
  if (s === "opened" || s === "used") return "#94F7C5";
  if (s === "failed" || s === "undelivered") return "#FF8DA1";
  if (s === "queued" || s === "sending" || s === "sent" || s === "accepted") return "#C5B3FF";
  if (s === "not_configured") return "#FFFFFF";
  return "#FFFFFF";
}

function NeonTile({
  color, label, value, subLabel, icon: Icon, testId,
}: {
  color: NeonColor; label: string; value: string | number; subLabel?: string; icon: any; testId?: string;
}) {
  return (
    <div
      className="p-4 flex flex-col gap-2 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }}
      data-testid={testId}
    >
      <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color, opacity: 0.8 }} />
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 shrink-0" style={{ color }} />
        <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color }}>{label}</span>
      </div>
      <div className="text-3xl font-black tabular-nums text-white">
        {value}
      </div>
      {subLabel && <div className="text-[10px] text-white">{subLabel}</div>}
    </div>
  );
}

function ActionBtn({
  label, color, onClick, disabled, icon: Icon, testId,
}: {
  label: string; color: string; onClick: () => void; disabled?: boolean; icon: any; testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        border: `1px solid ${color}88`,
        color,
        background: `${color}14`,
      }}
    >
      {disabled ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
      {label}
    </button>
  );
}

function ConsentBtn({ userId }: { userId: string }) {
  return (
    <Link
      href={`/learn/admin/consent/${userId}`}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition"
      style={{
        border: "1px solid #C5B3FF88",
        color: "#C5B3FF",
        background: "#C5B3FF14",
      }}
    >
      <FileText className="w-3 h-3" />
      Consent
    </Link>
  );
}

function LinksBtn({ userId, userName, onClick }: { userId: string; userName: string | null; onClick: (userId: string, name: string | null) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(userId, userName)}
      data-testid={`btn-links-${userId}`}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition"
      style={{
        border: "1px solid #9FD8FF88",
        color: "#9FD8FF",
        background: "#9FD8FF14",
      }}
    >
      <Link2 className="w-3 h-3" />
      Links
    </button>
  );
}

function LinkHistoryModal({
  userId,
  userName,
  onClose,
}: {
  userId: string;
  userName: string | null;
  onClose: () => void;
}) {
  const { data: rows, isLoading, isError } = useQuery<LinkHistoryRow[]>({
    queryKey: [`/api/admin/onboarding-link-history?userId=${userId}`],
    staleTime: 30_000,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-black flex flex-col max-h-[80vh]"
        style={{ border: "1.5px solid #9FD8FF55", boxShadow: "0 0 40px #9FD8FF22" }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
          <Link2 className="w-4 h-4 shrink-0" style={{ color: "#9FD8FF" }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white">Onboarding Link History</p>
            <p className="text-sm font-bold text-white truncate">{userName || userId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white hover:text-white transition"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-white text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex items-center justify-center gap-2 py-12 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Could not load link history — check server logs.
            </div>
          )}

          {!isLoading && !isError && (!rows || rows.length === 0) && (
            <p className="text-sm text-white italic text-center py-12">No onboarding links found for this user.</p>
          )}

          {!isLoading && !isError && rows && rows.length > 0 && (
            <div className="space-y-2">
              {rows.map((r, i) => {
                const statusColor = r.usedAt ? "#94F7C5" : deliveryStatusColor(r.deliveryStatus);
                const displayStatus = r.usedAt ? "opened" : (r.deliveryStatus ?? "unknown");
                return (
                  <div
                    key={r.jti}
                    className="rounded-xl p-3 relative"
                    style={{ border: `1px solid ${statusColor}33`, background: `${statusColor}08` }}
                    data-testid={`link-row-${r.jti}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{ background: `${statusColor}22`, color: statusColor }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider"
                            style={{ background: `${statusColor}22`, color: statusColor }}
                          >
                            {displayStatus}
                          </span>
                          {r.channel && (
                            <span className="text-[10px] text-white uppercase tracking-wider">
                              via {r.channel}
                            </span>
                          )}
                          {(r.retryCount ?? 0) > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fb923c22", color: "#fb923c" }}>
                              {r.retryCount} retry
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                          {r.sentTo && (
                            <div>
                              <span className="text-white">Sent to </span>
                              <span className="text-white font-mono">{r.sentTo}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-white">Issued </span>
                            <span className="text-white">{fmtDateTime(r.createdAt)}</span>
                          </div>
                          {r.deliveryUpdatedAt && (
                            <div>
                              <span className="text-white">Status updated </span>
                              <span className="text-white">{fmtDateTime(r.deliveryUpdatedAt)}</span>
                            </div>
                          )}
                          {r.usedAt && (
                            <div>
                              <span className="text-white">Opened </span>
                              <span className="text-white">{fmtDateTime(r.usedAt)}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-white">Expires </span>
                            <span className="text-white">{fmtDateTime(r.expiresAt)}</span>
                          </div>
                        </div>

                        {r.deliveryError && (
                          <div className="text-[10px] font-mono text-red-400 break-all bg-red-950/30 px-2 py-1 rounded-lg">
                            {r.deliveryError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/10 shrink-0 flex items-center justify-between">
          <span className="text-[10px] text-white">
            {rows ? `${rows.length} link${rows.length !== 1 ? "s" : ""} issued` : ""}
          </span>
          <span className="text-[10px] text-white">Read-only — resend is a parent action</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("trials");
  const { toast } = useToast();
  const qc = useQueryClient();
  const [inFlight, setInFlight] = useState<Set<string>>(new Set());
  const lastUpdatedRef = useRef<Date>(new Date());
  const [linkHistoryUser, setLinkHistoryUser] = useState<{ userId: string; userName: string | null } | null>(null);
  const [reminderHistoryOpen, setReminderHistoryOpen] = useState(false);
  const [actionLogOpen, setActionLogOpen] = useState(false);

  function markInFlight(userId: string, val: boolean) {
    setInFlight(prev => {
      const next = new Set(prev);
      val ? next.add(userId) : next.delete(userId);
      return next;
    });
  }

  function openLinkHistory(userId: string, userName: string | null) {
    setLinkHistoryUser({ userId, userName });
  }

  function closeLinkHistory() {
    setLinkHistoryUser(null);
  }

  const REFETCH = 30_000;

  const { data: summary, dataUpdatedAt: summaryUpdatedAt } = useQuery<BillingSummary>({
    queryKey: ["/api/admin/billing/summary"],
    refetchInterval: REFETCH,
  });

  const { data: trialsData, isLoading: trialsLoading } = useQuery<BillingRow[]>({
    queryKey: ["/api/admin/billing?status=trial&ending=2"],
    refetchInterval: REFETCH,
    enabled: activeTab === "trials",
  });

  const { data: graceData, isLoading: graceLoading } = useQuery<BillingRow[]>({
    queryKey: ["/api/admin/billing?status=grace"],
    refetchInterval: REFETCH,
    enabled: activeTab === "grace",
  });

  const { data: lapsedData, isLoading: lapsedLoading } = useQuery<BillingRow[]>({
    queryKey: ["/api/admin/billing?status=lapsed"],
    refetchInterval: REFETCH,
    enabled: activeTab === "lapsed",
  });

  const { data: smsStats } = useQuery<SmsStats>({
    queryKey: ["/api/admin/onboarding-sms-stats?days=30"],
    refetchInterval: REFETCH,
  });

  const { data: stuckLinks } = useQuery<StuckLinksResult>({
    queryKey: ["/api/admin/billing/stuck-links"],
    refetchInterval: REFETCH,
  });

  const { data: lastNudgedMap } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/billing/last-nudged"],
    refetchInterval: REFETCH,
  });

  const { data: reminderHistory, isLoading: reminderHistoryLoading } = useQuery<ReminderHistoryRow[]>({
    queryKey: ["/api/admin/billing/reminder-history"],
    refetchInterval: REFETCH,
    enabled: reminderHistoryOpen,
  });

  const { data: actionLog, isLoading: actionLogLoading } = useQuery<AuditLogRow[]>({
    queryKey: ["/api/admin/billing/action-log"],
    refetchInterval: REFETCH,
    enabled: actionLogOpen,
  });

  if (summaryUpdatedAt) lastUpdatedRef.current = new Date(summaryUpdatedAt);

  const sendReminderMutation = useMutation({
    mutationFn: async ({ userId, type, force }: { userId: string; type?: string; force?: boolean }) => {
      const r = await apiRequest("POST", `/api/admin/billing/${userId}/send-reminder`, {
        type: type ?? "reminder",
        ...(force ? { force: true } : {}),
      });
      return r.json();
    },
    onSuccess: (data, { userId, type }) => {
      markInFlight(userId, false);
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/last-nudged"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/reminder-history"] });
      if (data.ok) {
        toast({ title: "Reminder sent", description: `Push notification delivered to ${data.sent} device(s).` });
      } else if (data.reason === "recently_nudged") {
        const lastSentTime = data.lastSentAt
          ? new Date(data.lastSentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "earlier today";
        toast({
          title: "Already nudged today",
          description: `Last sent at ${lastSentTime}. Send again anyway?`,
          variant: "destructive",
          action: (
            <ToastAction
              altText="Send anyway"
              onClick={() => {
                markInFlight(userId, true);
                sendReminderMutation.mutate({ userId, type, force: true });
              }}
            >
              Send anyway
            </ToastAction>
          ),
        });
      } else {
        toast({
          title: "Reminder not sent",
          description: data.reason === "no_push_subscription"
            ? "User has no push subscription registered."
            : data.reason === "push_not_configured"
            ? "VAPID push keys are not configured on this environment."
            : "Could not send — check server logs.",
          variant: "destructive",
        });
      }
    },
    onError: (_err, { userId }) => {
      markInFlight(userId, false);
      toast({ title: "Error sending reminder", variant: "destructive" });
    },
  });

  const markLapsedMutation = useMutation({
    mutationFn: async (userId: string) => {
      const r = await apiRequest("POST", `/api/admin/billing/${userId}/mark-lapsed`, {});
      return r.json();
    },
    onSuccess: (_data, userId) => {
      markInFlight(userId, false);
      toast({ title: "Marked as lapsed", description: "Subscription status updated to lapsed." });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing?status=grace"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/summary"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/action-log"] });
    },
    onError: (_err, userId) => {
      markInFlight(userId, false);
      toast({ title: "Error marking lapsed", variant: "destructive" });
    },
  });

  const extendTrialMutation = useMutation({
    mutationFn: async (userId: string) => {
      const r = await apiRequest("POST", `/api/admin/billing/${userId}/extend-trial`, { days: 7 });
      return r.json();
    },
    onSuccess: (data, userId) => {
      markInFlight(userId, false);
      const until = data.newTrialEndsAt ? fmtDate(data.newTrialEndsAt) : "—";
      toast({ title: "Trial extended", description: `Trial extended by 7 days — now ends ${until}.` });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing?status=trial&ending=2"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/summary"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/action-log"] });
    },
    onError: (_err, userId) => {
      markInFlight(userId, false);
      toast({ title: "Error extending trial", variant: "destructive" });
    },
  });

  const grantTrialMutation = useMutation({
    mutationFn: async (userId: string) => {
      const r = await apiRequest("POST", `/api/admin/billing/${userId}/grant-trial`, {});
      return r.json();
    },
    onSuccess: (data, userId) => {
      markInFlight(userId, false);
      const until = data.newTrialEndsAt ? fmtDate(data.newTrialEndsAt) : "—";
      toast({ title: "Fresh trial granted", description: `14-day trial granted — ends ${until}.` });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing?status=lapsed"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing?status=trial&ending=2"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/summary"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/action-log"] });
    },
    onError: (_err, userId) => {
      markInFlight(userId, false);
      toast({ title: "Error granting trial", variant: "destructive" });
    },
  });

  const markActiveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const r = await apiRequest("POST", `/api/admin/billing/${userId}/mark-active`, {});
      return r.json();
    },
    onSuccess: (_data, userId) => {
      markInFlight(userId, false);
      toast({ title: "Marked as active", description: "Subscription status overridden to active." });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing?status=lapsed"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing?status=grace"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/summary"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/billing/action-log"] });
    },
    onError: (_err, userId) => {
      markInFlight(userId, false);
      toast({ title: "Error marking active", variant: "destructive" });
    },
  });

  function handleSendReminder(userId: string, type?: string) {
    markInFlight(userId, true);
    sendReminderMutation.mutate({ userId, type });
  }

  function handleMarkLapsed(userId: string) {
    markInFlight(userId, true);
    markLapsedMutation.mutate(userId);
  }

  function handleExtendTrial(userId: string) {
    markInFlight(userId, true);
    extendTrialMutation.mutate(userId);
  }

  function handleGrantTrial(userId: string) {
    markInFlight(userId, true);
    grantTrialMutation.mutate(userId);
  }

  function handleMarkActive(userId: string) {
    markInFlight(userId, true);
    markActiveMutation.mutate(userId);
  }

  const tabConfig: { id: Tab; label: string; color: string; count: number | undefined }[] = [
    { id: "trials", label: "Trials — Expiring 48h", color: "#FFE29A", count: summary?.trial },
    { id: "grace", label: "Grace Period", color: "#FFE29A", count: summary?.grace },
    { id: "lapsed", label: "Lapsed", color: "#FFB7E5", count: summary?.lapsed },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: "#050508", fontFamily: "'Poppins', system-ui, sans-serif" }}>
      {linkHistoryUser && (
        <LinkHistoryModal
          userId={linkHistoryUser.userId}
          userName={linkHistoryUser.userName}
          onClose={closeLinkHistory}
        />
      )}

      <AdminTopNav current="billing" />
      <div className="border-b border-white/10 bg-black/60 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white">Admin</p>
            <div role="heading" aria-level={1} className="text-base font-black text-white leading-tight">Billing & Operations</div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[10px] text-white">
              Updated {fmtDateTime(lastUpdatedRef.current.toISOString())}
            </span>
            <button
              type="button"
              onClick={() => {
                qc.invalidateQueries({ queryKey: ["/api/admin/billing/summary"] });
                qc.invalidateQueries({ queryKey: ["/api/admin/billing?status=trial&ending=2"] });
                qc.invalidateQueries({ queryKey: ["/api/admin/billing?status=grace"] });
                qc.invalidateQueries({ queryKey: ["/api/admin/billing?status=lapsed"] });
              }}
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg text-white hover:text-white transition"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* KPI Strip */}
        <section data-testid="billing-kpi-strip">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3">Live Billing KPIs</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <NeonTile
              color="#9FF5E8" label="Active" testId="kpi-active"
              value={summary?.active ?? "—"} icon={Zap}
              subLabel="Paid subscribers"
            />
            <NeonTile
              color="#FFE29A" label="Trials" testId="kpi-trial"
              value={summary?.trial ?? "—"} icon={Clock}
              subLabel="14-day free trial"
            />
            <NeonTile
              color="#FFE29A" label="Grace" testId="kpi-grace"
              value={summary?.grace ?? "—"} icon={AlertTriangle}
              subLabel="3-day grace window"
            />
            <NeonTile
              color="#FFB7E5" label="Lapsed" testId="kpi-lapsed"
              value={summary?.lapsed ?? "—"} icon={XCircle}
              subLabel="Need reactivation"
            />
            <NeonTile
              color="#FFFFFF" label="Cancelled" testId="kpi-cancelled"
              value={summary?.cancelled ?? "—"} icon={Ban}
              subLabel="Voluntarily cancelled"
            />
            <NeonTile
              color="#C5B3FF" label="MRR" testId="kpi-mrr"
              value={summary ? fmtMrr(summary.mrr) : "—"} icon={TrendingUp}
              subLabel="Monthly recurring revenue"
            />
          </div>
        </section>

        {/* Stuck onboarding links warning */}
        {stuckLinks && stuckLinks.count > 0 && (
          <section data-testid="stuck-links-banner">
            <div
              className="rounded-2xl p-4"
              style={{ border: "1.5px solid #FF8DA188", background: "rgba(255,141,161,0.07)", boxShadow: "0 0 20px #FF8DA122" }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#FF8DA1" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black" style={{ color: "#FF8DA1" }}>
                    {stuckLinks.count} onboarding link{stuckLinks.count !== 1 ? "s" : ""} stuck &gt;24h — learners may be unable to onboard
                  </p>
                  <p className="text-xs text-white mt-1">
                    These links have been in a non-delivered state for over 24 hours and the learner hasn't tapped them yet.
                    Re-send from the parent's confirmation card or check WhatsApp/Twilio configuration.
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Sent To", "Status", "Age", "Retries"].map(h => (
                            <th key={h} className="text-left pb-1.5 pr-4 font-bold uppercase tracking-wider text-white">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stuckLinks.links.slice(0, 10).map(l => (
                          <tr key={l.jti} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <td className="py-1.5 pr-4 font-mono text-white">{l.sentTo}</td>
                            <td className="py-1.5 pr-4" style={{ color: "#FF8DA1" }}>{l.deliveryStatus}</td>
                            <td className="py-1.5 pr-4 text-white">{l.hoursAgo}h ago</td>
                            <td className="py-1.5 text-white">{l.retryCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {stuckLinks.count > 10 && (
                      <p className="text-[10px] text-white mt-2">+ {stuckLinks.count - 10} more — check Admin Billing → Onboarding Link History per learner</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab navigation */}
        <section>
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabConfig.map(({ id, label, color, count }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  data-testid={`billing-tab-${id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition"
                  style={{
                    border: `1.5px solid ${active ? color : color + "44"}`,
                    color: active ? color : color + "99",
                    background: active ? `${color}18` : "transparent",
                    boxShadow: active ? `0 0 14px ${color}44` : "none",
                  }}
                >
                  {label}
                  {count !== undefined && (
                    <span
                      className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: `${color}22`, color }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── TRIALS TAB ── */}
          {activeTab === "trials" && (
            <TrialsTable
              rows={trialsData ?? []}
              isLoading={trialsLoading}
              inFlight={inFlight}
              onSendReminder={handleSendReminder}
              onExtendTrial={handleExtendTrial}
              onOpenLinks={openLinkHistory}
              lastNudgedMap={lastNudgedMap ?? {}}
            />
          )}

          {/* ── GRACE PERIOD TAB ── */}
          {activeTab === "grace" && (
            <GraceTable
              rows={graceData ?? []}
              isLoading={graceLoading}
              inFlight={inFlight}
              onSendReminder={handleSendReminder}
              onMarkLapsed={handleMarkLapsed}
              onOpenLinks={openLinkHistory}
              lastNudgedMap={lastNudgedMap ?? {}}
            />
          )}

          {/* ── LAPSED TAB ── */}
          {activeTab === "lapsed" && (
            <LapsedTable
              rows={lapsedData ?? []}
              isLoading={lapsedLoading}
              inFlight={inFlight}
              onSendOutreach={handleSendReminder}
              onGrantTrial={handleGrantTrial}
              onMarkActive={handleMarkActive}
              onOpenLinks={openLinkHistory}
              lastNudgedMap={lastNudgedMap ?? {}}
            />
          )}
        </section>

        {/* Onboarding SMS stats */}
        {smsStats && (
          <section data-testid="onboarding-sms-section">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4" style={{ color: "#9FD8FF" }} />
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white">
                Onboarding WhatsApp Links — last {smsStats.days} days
              </p>
            </div>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 rounded-2xl p-4"
              style={{ border: "1px solid #9FD8FF44", background: "rgba(125,211,252,0.04)" }}
              data-testid="onboarding-sms-stats"
            >
              {([
                { k: "total",       label: "Issued",       color: "#ffffff" },
                { k: "sent",        label: "Sent",         color: "#94F7C5" },
                { k: "delivered",   label: "Delivered",    color: "#9FD8FF" },
                { k: "opened",      label: "Opened",       color: "#facc15" },
                { k: "failed",      label: "Failed",       color: "#FF8DA1" },
                { k: "pending",     label: "Pending",      color: "#C5B3FF" },
                { k: "autoRetried", label: "Auto-retried", color: "#fb923c" },
              ] as Array<{ k: keyof Pick<SmsStats, "total"|"sent"|"delivered"|"opened"|"failed"|"pending"|"autoRetried">; label: string; color: string }>
              ).map(c => (
                <div key={c.k} className="rounded-xl bg-white/5 px-3 py-2" data-testid={`sms-stat-${c.k}`}>
                  <div className="text-[10px] uppercase tracking-wider text-white">{c.label}</div>
                  <div className="text-2xl font-black" style={{ color: c.color }}>{smsStats[c.k] ?? 0}</div>
                </div>
              ))}
            </div>
            {smsStats.notConfigured > 0 && (
              <p className="text-xs text-white mt-2">
                {smsStats.notConfigured} link(s) couldn't be sent — Twilio not configured on this environment.
              </p>
            )}
          </section>
        )}

        {/* ── Action History (Audit Log) Panel ── */}
        <section data-testid="action-log-section">
          <button
            type="button"
            onClick={() => setActionLogOpen(v => !v)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white hover:text-white transition mb-3"
          >
            <History className="w-4 h-4" style={{ color: "#fb923c" }} />
            <span style={{ color: "#fb923c" }}>Admin Action History</span>
            <ChevronDown
              className="w-3 h-3 transition-transform"
              style={{ color: "#fb923c", transform: actionLogOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
            {actionLog && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#fb923c22", color: "#fb923c" }}>
                {actionLog.length}
              </span>
            )}
          </button>

          {actionLogOpen && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid #fb923c44", background: "rgba(251,146,60,0.03)" }}
              data-testid="action-log-panel"
            >
              {actionLogLoading && (
                <div className="flex items-center justify-center gap-2 py-10 text-white text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
                </div>
              )}

              {!actionLogLoading && (!actionLog || actionLog.length === 0) && (
                <p className="text-sm text-white italic text-center py-10">No billing actions recorded yet.</p>
              )}

              {!actionLogLoading && actionLog && actionLog.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <Th>Timestamp</Th>
                        <Th>Action</Th>
                        <Th>Target User</Th>
                        <Th>Admin</Th>
                        <Th>Details</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionLog.map(row => {
                        const meta = row.details?.metadata;
                        const actionLabel: Record<string, { label: string; color: string }> = {
                          "billing.extend_trial":  { label: "Extend Trial",  color: "#9FF5E8" },
                          "billing.grant_trial":   { label: "Grant Trial",   color: "#94F7C5" },
                          "billing.mark_lapsed":   { label: "Mark Lapsed",   color: "#FFB7E5" },
                          "billing.mark_active":   { label: "Mark Active",   color: "#9FF5E8" },
                        };
                        const { label, color } = actionLabel[row.action] ?? { label: row.action, color: "#ffffff60" };
                        return (
                          <tr key={row.id} data-testid={`action-log-row-${row.id}`}>
                            <Td>
                              <span className="text-white text-xs font-mono">{fmtDateTime(row.createdAt)}</span>
                            </Td>
                            <Td>
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                                style={{ background: `${color}22`, color }}
                              >
                                {label}
                              </span>
                            </Td>
                            <Td>
                              {meta?.targetUserId ? (
                                <span className="text-white text-xs font-mono">{meta.targetUserId.slice(0, 16)}…</span>
                              ) : (
                                <span className="text-white text-xs">—</span>
                              )}
                            </Td>
                            <Td>
                              <span className="text-white text-xs font-mono">{row.adminUserId.slice(0, 16)}…</span>
                            </Td>
                            <Td>
                              <div className="text-[10px] text-white space-y-0.5">
                                {meta?.days !== undefined && (
                                  <div>+{meta.days} days</div>
                                )}
                                {meta?.newTrialEndsAt && (
                                  <div>→ {fmtDate(meta.newTrialEndsAt)}</div>
                                )}
                                {meta?.note && (
                                  <div className="text-white italic">"{meta.note}"</div>
                                )}
                              </div>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {!actionLogLoading && actionLog && actionLog.length > 0 && (
                <div className="px-4 py-2 border-t border-white/5 text-[10px] text-white">
                  Showing last {actionLog.length} action{actionLog.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Reminder History Panel ── */}
        <section data-testid="reminder-history-section">
          <button
            type="button"
            onClick={() => setReminderHistoryOpen(v => !v)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white hover:text-white transition mb-3"
          >
            <History className="w-4 h-4" style={{ color: "#C5B3FF" }} />
            <span style={{ color: "#C5B3FF" }}>Reminder History</span>
            <ChevronDown
              className="w-3 h-3 transition-transform"
              style={{ color: "#C5B3FF", transform: reminderHistoryOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
            {reminderHistory && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#C5B3FF22", color: "#C5B3FF" }}>
                {reminderHistory.length}
              </span>
            )}
          </button>

          {reminderHistoryOpen && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid #C5B3FF44", background: "rgba(192,132,252,0.03)" }}
              data-testid="reminder-history-panel"
            >
              {reminderHistoryLoading && (
                <div className="flex items-center justify-center gap-2 py-10 text-white text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
                </div>
              )}

              {!reminderHistoryLoading && (!reminderHistory || reminderHistory.length === 0) && (
                <p className="text-sm text-white italic text-center py-10">No reminders dispatched yet.</p>
              )}

              {!reminderHistoryLoading && reminderHistory && reminderHistory.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <Th>Sent At</Th>
                        <Th>Target Learner</Th>
                        <Th>Type</Th>
                        <Th>Delivered</Th>
                        <Th>Failed</Th>
                        <Th>Reason</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {reminderHistory.map(r => {
                        const ok = r.result?.ok ?? false;
                        const sent = r.result?.sent ?? 0;
                        const failed = r.result?.failed ?? 0;
                        const reason = r.result?.reason;
                        return (
                          <tr key={r.id} data-testid={`reminder-row-${r.id}`}>
                            <Td><span className="text-white text-xs font-mono">{fmtDateTime(r.sentAt)}</span></Td>
                            <Td>
                              <div className="font-semibold text-white text-xs">
                                {r.targetName || r.targetEmail || r.userId.slice(0, 8)}
                              </div>
                              {r.targetEmail && r.targetName && (
                                <div className="text-[10px] text-white">{r.targetEmail}</div>
                              )}
                            </Td>
                            <Td>
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                                style={{ background: "#C5B3FF22", color: "#C5B3FF" }}
                              >
                                {r.type}
                              </span>
                            </Td>
                            <Td>
                              <span
                                className="font-black text-sm tabular-nums"
                                style={{ color: sent > 0 ? "#94F7C5" : "#ffffff44" }}
                              >
                                {sent}
                              </span>
                            </Td>
                            <Td>
                              <span
                                className="font-black text-sm tabular-nums"
                                style={{ color: failed > 0 ? "#FF8DA1" : "#ffffff44" }}
                              >
                                {failed}
                              </span>
                            </Td>
                            <Td>
                              {reason ? (
                                <span className="text-[10px] font-mono text-red-400">{reason}</span>
                              ) : (
                                <span className="text-white text-xs">—</span>
                              )}
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {!reminderHistoryLoading && reminderHistory && reminderHistory.length > 0 && (
                <div className="px-4 py-2 border-t border-white/5 text-[10px] text-white">
                  Showing last {reminderHistory.length} dispatch{reminderHistory.length !== 1 ? "es" : ""}
                </div>
              )}
            </div>
          )}
        </section>

        <p className="text-xs text-white flex items-center gap-1.5 pt-2 border-t border-white/10">
          <AlertTriangle className="w-3 h-3" />
          Data from the Netcash webhook. Failed recurring payments enter a 3-day grace period before lapsing.
          Lapse enforcement runs daily at 04:30 UTC. Auto-refreshes every 30 s.
        </p>
      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-white italic px-4 py-8 text-center rounded-2xl bg-white/5 border border-white/10">
      {message}
    </p>
  );
}

function TableShell({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${color}44` }}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white bg-black/60 whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 border-t border-white/5 ${className}`}>{children}</td>;
}

function LearnerCell({ row }: { row: BillingRow }) {
  return (
    <div>
      <div className="font-semibold text-white">{row.userName || row.userEmail || row.userId.slice(0, 8)}</div>
      {row.userEmail && row.userName && <div className="text-[10px] text-white">{row.userEmail}</div>}
      {row.parentCell && <div className="text-[10px] text-white font-mono">{row.parentCell}</div>}
    </div>
  );
}

function LastNudgedBadge({ sentAt }: { sentAt: string | undefined }) {
  if (!sentAt) return <span className="text-white text-xs">—</span>;
  const daysAgoVal = Math.floor((Date.now() - new Date(sentAt).getTime()) / 86_400_000);
  const label = daysAgoVal === 0 ? "Today" : daysAgoVal === 1 ? "Yesterday" : `${daysAgoVal}d ago`;
  const color = daysAgoVal === 0 ? "#94F7C5" : daysAgoVal <= 2 ? "#9FD8FF" : "#C5B3FF";
  return (
    <div>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: `${color}22`, color }}
      >
        {label}
      </span>
      <div className="text-[10px] text-white mt-0.5">{fmtDateTime(sentAt)}</div>
    </div>
  );
}

function MethodBadge({ method }: { method: string | null }) {
  const color = method === "debicheck" ? "#9FD8FF" : method === "card" ? "#94F7C5" : "#ffffff44";
  const label = method ?? "none";
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>
      {label}
    </span>
  );
}

function TrialsTable({ rows, isLoading, inFlight, onSendReminder, onExtendTrial, onOpenLinks, lastNudgedMap }: {
  rows: BillingRow[]; isLoading: boolean; inFlight: Set<string>;
  onSendReminder: (userId: string) => void;
  onExtendTrial: (userId: string) => void;
  onOpenLinks: (userId: string, userName: string | null) => void;
  lastNudgedMap: Record<string, string>;
}) {
  const color = "#FFE29A";
  if (isLoading) return <LoadingState />;
  if (rows.length === 0) return <EmptyState message="No active trials." />;

  return (
    <TableShell color={color}>
      <thead>
        <tr>
          <Th>Learner</Th>
          <Th>Method</Th>
          <Th>Trial Started</Th>
          <Th>Trial Ends</Th>
          <Th>Days Left</Th>
          <Th>D13 Sent</Th>
          <Th>D14 Sent</Th>
          <Th>Last Nudged</Th>
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => {
          const days = daysUntil(r.trialEndsAt);
          const isD13 = days !== null && days === 1;
          const isD14 = days !== null && days === 0;
          const urgentColor = (isD14 || isD13) ? "#FFE29A" : color;
          return (
            <tr key={r.userId} data-testid={`billing-row-${r.userId}`}>
              <Td><LearnerCell row={r} /></Td>
              <Td><MethodBadge method={r.billingMethod} /></Td>
              <Td><span className="text-white text-xs">{fmtDate(r.createdAt)}</span></Td>
              <Td><span className="text-white text-xs">{fmtDate(r.trialEndsAt)}</span></Td>
              <Td>
                <span
                  className="font-black text-sm"
                  style={{ color: days !== null && days <= 2 ? "#FFE29A" : color }}
                >
                  {days !== null ? (days <= 0 ? "Expired" : `${days}d`) : "—"}
                </span>
              </Td>
              <Td>
                {r.trialReminderD13Sent
                  ? <CheckCircle className="w-4 h-4 text-green-400" />
                  : <span className="text-white text-xs">—</span>}
              </Td>
              <Td>
                {r.trialReminderD14Sent
                  ? <CheckCircle className="w-4 h-4 text-green-400" />
                  : <span className="text-white text-xs">—</span>}
              </Td>
              <Td><LastNudgedBadge sentAt={lastNudgedMap[r.userId]} /></Td>
              <Td>
                <div className="flex gap-2 flex-wrap">
                  <ActionBtn
                    label="Extend 7 days"
                    color="#9FF5E8"
                    icon={CalendarPlus}
                    disabled={inFlight.has(r.userId)}
                    onClick={() => onExtendTrial(r.userId)}
                    testId={`btn-extend-${r.userId}`}
                  />
                  <ActionBtn
                    label="Send Reminder"
                    color={urgentColor}
                    icon={Bell}
                    disabled={inFlight.has(r.userId)}
                    onClick={() => onSendReminder(r.userId)}
                    testId={`btn-remind-${r.userId}`}
                  />
                  <LinksBtn userId={r.userId} userName={r.userName} onClick={onOpenLinks} />
                  <ConsentBtn userId={r.userId} />
                </div>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}

function GraceTable({ rows, isLoading, inFlight, onSendReminder, onMarkLapsed, onOpenLinks, lastNudgedMap }: {
  rows: BillingRow[]; isLoading: boolean; inFlight: Set<string>;
  onSendReminder: (userId: string) => void;
  onMarkLapsed: (userId: string) => void;
  onOpenLinks: (userId: string, userName: string | null) => void;
  lastNudgedMap: Record<string, string>;
}) {
  const color = "#FFE29A";
  if (isLoading) return <LoadingState />;
  if (rows.length === 0) return <EmptyState message="No subscriptions in grace period." />;

  return (
    <TableShell color={color}>
      <thead>
        <tr>
          <Th>Learner</Th>
          <Th>Method</Th>
          <Th>Payment Failed</Th>
          <Th>Grace Expires</Th>
          <Th>Grace Days Left</Th>
          <Th>Last Nudged</Th>
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => {
          const graceDays = daysUntil(r.gracePeriodEndsAt);
          return (
            <tr key={r.userId} data-testid={`billing-row-${r.userId}`}>
              <Td><LearnerCell row={r} /></Td>
              <Td><MethodBadge method={r.billingMethod} /></Td>
              <Td>
                <div className="text-xs text-white">{fmtDate(r.lastPaymentAt)}</div>
                {r.lastPaymentStatus && (
                  <div className="text-[10px] font-bold text-red-400">{r.lastPaymentStatus}</div>
                )}
              </Td>
              <Td><span className="text-white text-xs">{fmtDate(r.gracePeriodEndsAt)}</span></Td>
              <Td>
                <span
                  className="font-black text-sm"
                  style={{ color: graceDays !== null && graceDays <= 1 ? "#ff4444" : color }}
                >
                  {graceDays !== null ? (graceDays <= 0 ? "Expired" : `${graceDays}d`) : "—"}
                </span>
              </Td>
              <Td><LastNudgedBadge sentAt={lastNudgedMap[r.userId]} /></Td>
              <Td>
                <div className="flex gap-2 flex-wrap">
                  <ActionBtn
                    label="Send Reminder"
                    color={color}
                    icon={Bell}
                    disabled={inFlight.has(r.userId)}
                    onClick={() => onSendReminder(r.userId)}
                    testId={`btn-remind-${r.userId}`}
                  />
                  <ActionBtn
                    label="Mark Lapsed"
                    color="#FFB7E5"
                    icon={XCircle}
                    disabled={inFlight.has(r.userId)}
                    onClick={() => onMarkLapsed(r.userId)}
                    testId={`btn-lapse-${r.userId}`}
                  />
                  <LinksBtn userId={r.userId} userName={r.userName} onClick={onOpenLinks} />
                  <ConsentBtn userId={r.userId} />
                </div>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}

function LapsedTable({ rows, isLoading, inFlight, onSendOutreach, onGrantTrial, onMarkActive, onOpenLinks, lastNudgedMap }: {
  rows: BillingRow[]; isLoading: boolean; inFlight: Set<string>;
  onSendOutreach: (userId: string, type: string) => void;
  onGrantTrial: (userId: string) => void;
  onMarkActive: (userId: string) => void;
  onOpenLinks: (userId: string, userName: string | null) => void;
  lastNudgedMap: Record<string, string>;
}) {
  const color = "#FFB7E5";
  if (isLoading) return <LoadingState />;
  if (rows.length === 0) return <EmptyState message="No lapsed subscriptions." />;

  return (
    <TableShell color={color}>
      <thead>
        <tr>
          <Th>Learner</Th>
          <Th>Plan</Th>
          <Th>Method</Th>
          <Th>Lapsed Since</Th>
          <Th>Days Lapsed</Th>
          <Th>Last Nudged</Th>
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => {
          const ago = daysAgo(r.updatedAt);
          return (
            <tr key={r.userId} data-testid={`billing-row-${r.userId}`}>
              <Td><LearnerCell row={r} /></Td>
              <Td><span className="text-white text-xs">{r.plan ?? "—"}</span></Td>
              <Td><MethodBadge method={r.billingMethod} /></Td>
              <Td><span className="text-white text-xs">{fmtDate(r.updatedAt)}</span></Td>
              <Td>
                <span className="font-bold text-sm" style={{ color: ago !== null && ago <= 7 ? "#FFE29A" : color }}>
                  {ago !== null ? `${ago}d` : "—"}
                </span>
              </Td>
              <Td><LastNudgedBadge sentAt={lastNudgedMap[r.userId]} /></Td>
              <Td>
                <div className="flex gap-2 flex-wrap">
                  <ActionBtn
                    label="Mark Active"
                    color="#9FF5E8"
                    icon={ShieldCheck}
                    disabled={inFlight.has(r.userId)}
                    onClick={() => onMarkActive(r.userId)}
                    testId={`btn-mark-active-${r.userId}`}
                  />
                  <ActionBtn
                    label="Grant Fresh Trial"
                    color="#94F7C5"
                    icon={Gift}
                    disabled={inFlight.has(r.userId)}
                    onClick={() => onGrantTrial(r.userId)}
                    testId={`btn-grant-trial-${r.userId}`}
                  />
                  <ActionBtn
                    label="Reactivate Outreach"
                    color={color}
                    icon={Send}
                    disabled={inFlight.has(r.userId)}
                    onClick={() => onSendOutreach(r.userId, "outreach")}
                    testId={`btn-outreach-${r.userId}`}
                  />
                  <LinksBtn userId={r.userId} userName={r.userName} onClick={onOpenLinks} />
                  <ConsentBtn userId={r.userId} />
                </div>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-white text-sm">
      <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
    </div>
  );
}
