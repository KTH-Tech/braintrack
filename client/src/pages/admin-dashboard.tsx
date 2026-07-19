import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { AdminTopNav } from "@/components/admin-top-nav";
import { GraffitiSplats, SpraySmear } from "@/components/graffiti-splats";
import { formatNumber } from "@/lib/formatters";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, Database, Eye, FileEdit, FileText, Flag,
  GraduationCap, Gift, Headphones, Layers, Loader2, LogOut, Mail, Package,
  ShieldAlert, Store, Users, Zap, Handshake, School, ChevronDown, ChevronUp, QrCode,
} from "lucide-react";

type NeonHex =
  | "#FFE29A"
  | "#6EE7F9" | "#9FD8FF" | "#C5B3FF" | "#FFB7E5";

function halo(color: NeonHex, a = 0.28) {
  // Token-palette rgb triplets (braintrack-tokens.css pastels).
  const rgb: Record<NeonHex, string> = {
    "#FFE29A": "255,226,154",
    "#6EE7F9": "110,231,249",
    "#9FD8FF": "159,216,255",
    "#C5B3FF": "197,179,255",
    "#FFB7E5": "255,183,229",
  };
  return `rgba(${rgb[color]},${a})`;
}

function NeonShell({
  color, children, className = "", testId,
}: {
  color: NeonHex;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}) {
  const h = halo(color, 0.28);
  return (
    <div
      className={`relative rounded-2xl bg-black overflow-hidden ${className}`}
      style={{ border: `1.5px solid ${color}`, boxShadow: `0 0 0 1px ${h}, 0 0 28px ${h}` }}
      data-testid={testId}
    >
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: color }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: color }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: color }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: color }} />
      {children}
    </div>
  );
}

type AdminStats = {
  totalUsers: number;
  learners: number;
  parents: number;
  admins: number;
  trialUsers: number;
  subscribedUsers: number;
};

type EmergencyStatus = {
  emergency?: { active?: boolean; reason?: string };
  disabledEndpoints?: string[];
  disabledFeatures?: string[];
};

type SchoolEnquiry = {
  id: number;
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string | null;
  numLearners: number | null;
  status: string;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: "#FFE29A",
  contacted: "#6EE7F9",
  converted: "#9FD8FF",
  dismissed: "#C5B3FF",
};

type ReferralFlag = {
  id: number;
  referrerId: string;
  referredId: string;
  flagReason: "same_ip" | "burst_pattern" | "low_engagement";
  flaggedAt: string;
  reviewed: boolean;
  reviewedBy: string | null;
  commissionHalted: boolean;
  metadata: Record<string, unknown> | null;
};

const FLAG_REASON_LABELS: Record<string, { en: string; af: string }> = {
  same_ip:        { en: "Same IP",       af: "Dieselfde IP" },
  burst_pattern:  { en: "Burst Pattern", af: "Stortpatroon"  },
  low_engagement: { en: "Low Engagement",af: "Lae Betrokkenheid" },
};

function FraudFlagsPanel({ isAf }: { isAf: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showReviewed, setShowReviewed] = useState(false);

  const { data, isLoading, isError } = useQuery<{ flags: ReferralFlag[]; total: number }>({
    queryKey: ["/api/admin/referral-flags", showReviewed],
    queryFn: async () => {
      const url = showReviewed
        ? "/api/admin/referral-flags"
        : "/api/admin/referral-flags?reviewed=false";
      const r = await apiRequest("GET", url);
      return r.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (flagId: number) => {
      const r = await apiRequest("PATCH", `/api/admin/referral-flags/${flagId}/review`, {});
      return r.json();
    },
    onSuccess: (_, flagId) => {
      qc.invalidateQueries({ queryKey: ["/api/admin/referral-flags"] });
      toast({
        title: isAf ? "Vlag hersien" : "Flag cleared",
        description: isAf
          ? `Vlag #${flagId} is as hersien gemerk.`
          : `Flag #${flagId} has been marked as reviewed. Rewards will resume on the next conversion.`,
      });
    },
    onError: () => {
      toast({
        title: isAf ? "Kon nie vlag hersien nie" : "Could not clear flag",
        variant: "destructive",
      });
    },
  });

  const flags = data?.flags ?? [];
  const unreviewedCount = flags.filter((f) => !f.reviewed).length;
  const haltedCount = flags.filter((f) => f.commissionHalted && !f.reviewed).length;

  return (
    <section data-testid="fraud-flags-section">
      <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3 flex items-center gap-2">
        <Flag className="w-3 h-3" style={{ color: "#FFE29A" }} />
        {isAf ? "Bedrogvlae" : "Fraud Flags"}
        {unreviewedCount > 0 && (
          <span
            className="px-1.5 py-0.5 rounded-full text-[9px] font-black tabular-nums"
            style={{ background: "rgba(255,226,154,0.18)", color: "#FFE29A", border: "1px solid rgba(255,226,154,0.45)" }}
            data-testid="fraud-flags-badge"
          >
            {unreviewedCount}
          </span>
        )}
      </h2>
      <NeonShell color="#FFE29A" className="p-5" testId="fraud-flags-panel">

        {haltedCount > 0 && (
          <div
            className="mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: "rgba(255,226,154,0.1)", border: "1px solid rgba(255,226,154,0.4)", color: "#FFE29A" }}
            data-testid="fraud-flags-halted-banner"
          >
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {isAf
                ? `${haltedCount} verwys${haltedCount === 1 ? "er het" : "ers het"} 'n aktiewe kommissie-blokkering. Hersien en verwyder die vlag om belonings te hervat.`
                : `${haltedCount} referrer${haltedCount === 1 ? " has" : "s have"} an active commission halt. Review and clear the flag to resume rewards.`}
            </span>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-white">
            {isAf
              ? "Elke vlag toon 'n verdagte verwysingspatroon. Nadat jy hersien het, sal die volgende omskakeling van die verwysers belonings outomaties hervat."
              : "Each flag marks a suspicious referral pattern. Once reviewed, the referrer's next conversion will automatically resume rewards."}
          </p>
          <button
            type="button"
            onClick={() => setShowReviewed((v) => !v)}
            data-testid="fraud-flags-toggle-reviewed"
            className="shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors"
            style={{
              border: `1px solid ${showReviewed ? "#FFE29A" : "rgba(255,255,255,0.18)"}`,
              color: showReviewed ? "#FFE29A" : "#fff",
              background: showReviewed ? "rgba(255,226,154,0.12)" : "transparent",
            }}
          >
            {isAf ? (showReviewed ? "Wys onhersien" : "Wys alles") : (showReviewed ? "Hide reviewed" : "Show all")}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,226,154,0.28)" }}>
          <table className="w-full text-xs" data-testid="fraud-flags-table">
            <thead className="bg-black/60 text-white">
              <tr className="text-left">
                <th className="px-3 py-2 font-bold uppercase tracking-wider">#</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Verwyser-ID" : "Referrer ID"}</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Verwysde-ID" : "Referred ID"}</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Rede" : "Reason"}</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Geblokkeer" : "Halted"}</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Gevlag op" : "Flagged"}</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Aksie" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-white" data-testid="fraud-flags-loading">
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" style={{ color: "#FFE29A" }} />
                    {isAf ? "Laai vlae…" : "Loading flags…"}
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center" style={{ color: "#FFE29A" }} data-testid="fraud-flags-error">
                    {isAf ? "Kon nie vlae laai nie." : "Could not load flags."}
                  </td>
                </tr>
              ) : flags.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-white" data-testid="fraud-flags-empty">
                    {isAf ? "Geen aktiewe bedrogvlae nie." : "No active fraud flags."}
                  </td>
                </tr>
              ) : (
                flags.map((flag) => {
                  const reasonLabel = FLAG_REASON_LABELS[flag.flagReason];
                  const flagDate = new Date(flag.flaggedAt).toLocaleDateString(isAf ? "af-ZA" : "en-ZA");
                  const isPending = reviewMutation.isPending && reviewMutation.variables === flag.id;
                  return (
                    <tr
                      key={flag.id}
                      className="border-t border-white/5"
                      data-testid={`fraud-flag-row-${flag.id}`}
                    >
                      <td className="px-3 py-2 text-white tabular-nums font-mono">{flag.id}</td>
                      <td className="px-3 py-2 text-white font-mono truncate max-w-[120px]" title={flag.referrerId}>
                        {flag.referrerId.slice(0, 12)}…
                      </td>
                      <td className="px-3 py-2 text-white font-mono truncate max-w-[120px]" title={flag.referredId}>
                        {flag.referredId.slice(0, 12)}…
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                          style={{ border: "1px solid rgba(255,226,154,0.5)", color: "#FFE29A" }}
                        >
                          {isAf ? reasonLabel?.af : reasonLabel?.en}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {flag.commissionHalted ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                            style={{ border: "1px solid rgba(255,226,154,0.5)", color: "#FFE29A", background: "rgba(255,226,154,0.12)" }}
                            data-testid={`fraud-flag-halted-${flag.id}`}
                          >
                            {isAf ? "Ja" : "Yes"}
                          </span>
                        ) : (
                          <span className="text-white">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-white tabular-nums">{flagDate}</td>
                      <td className="px-3 py-2">
                        {flag.reviewed ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                            style={{ border: "1px solid rgba(110,231,249,0.4)", color: "#6EE7F9" }}
                            data-testid={`fraud-flag-reviewed-${flag.id}`}
                          >
                            {isAf ? "Hersien" : "Reviewed"}
                          </span>
                        ) : (
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                            style={{ border: "1px solid rgba(255,226,154,0.4)", color: "#FFE29A" }}
                            data-testid={`fraud-flag-pending-${flag.id}`}
                          >
                            {isAf ? "Oop" : "Open"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {!flag.reviewed && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => reviewMutation.mutate(flag.id)}
                            data-testid={`fraud-flag-clear-${flag.id}`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-50 transition-opacity"
                            style={{
                              border: "1px solid rgba(110,231,249,0.5)",
                              color: "#6EE7F9",
                              background: "rgba(110,231,249,0.08)",
                            }}
                          >
                            {isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            {isAf ? "Hersien" : "Clear"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && flags.length > 0 && (
          <p className="mt-3 text-[10px] text-white">
            {isAf
              ? `${data?.total ?? 0} vlag${(data?.total ?? 0) === 1 ? "" : "ge"} totaal`
              : `${data?.total ?? 0} flag${(data?.total ?? 0) === 1 ? "" : "s"} total`}
          </p>
        )}
      </NeonShell>
    </section>
  );
}

type PartnerSchoolInquiry = {
  id: number;
  schoolName: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  expectedLearnerCount: number | null;
  province: string | null;
  district: string | null;
  schoolType: string;
  endorsementStatus: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
};

const INQUIRY_ACTION_COLORS: Record<string, string> = {
  contacted: "#6EE7F9",
  approved: "#9FD8FF",
  dismissed: "#C5B3FF",
};

type DbHealth = {
  poolStats: { total: number; idle: number; waiting: number; max: number };
  activity: { active: number; idle: number; total: number };
  dbStarted: string | null;
  slowQueryCount: number;
  slowQuerySource: "pg_stat_statements_delta" | "pg_stat_statements_cumulative" | "pg_stat_activity";
  slowWindowMinutes: number | null;
  lastMigrationAt: string | null;
  lastMigrationTag: string | null;
  fetchedAt: string;
};

function DbHealthPanel({ isAf }: { isAf: boolean }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<DbHealth>({
    queryKey: ["/api/admin/db-health"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/admin/db-health");
      return r.json();
    },
    refetchInterval: 30_000,
  });

  function formatUptime(startedIso: string | null): string {
    if (!startedIso) return "—";
    const diff = Date.now() - new Date(startedIso).getTime();
    const days = Math.floor(diff / 86_400_000);
    const hrs = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hrs > 0)  parts.push(`${hrs}h`);
    parts.push(`${mins}m`);
    return parts.join(" ");
  }

  const color: NeonHex = "#6EE7F9";
  const poolPct = data ? Math.round((data.poolStats.total / data.poolStats.max) * 100) : 0;
  const lastMig = data?.lastMigrationAt
    ? new Date(data.lastMigrationAt).toLocaleDateString(isAf ? "af-ZA" : "en-ZA", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const lastMigTag = data?.lastMigrationTag ?? null;
  const fetchedAt = data?.fetchedAt
    ? new Date(data.fetchedAt).toLocaleTimeString(isAf ? "af-ZA" : "en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <section data-testid="db-health-section">
      <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3 flex items-center gap-2">
        <Database className="w-3 h-3" style={{ color }} />
        {isAf ? "Databasis Gesondheid" : "DB Health"}
        {isFetching && !isLoading && (
          <Loader2 className="w-3 h-3 animate-spin" style={{ color }} />
        )}
      </h2>

      <NeonShell color={color} className="p-5" testId="db-health-panel">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-sm" style={{ color }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isAf ? "Laai databasis data…" : "Loading database data…"}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 py-6 justify-center text-sm" style={{ color: "#FFE29A" }} data-testid="db-health-error">
            <AlertTriangle className="w-4 h-4" />
            {isAf ? "Kon nie databasis data laai nie." : "Could not load database health data."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {/* Pool connections */}
              <div className="rounded-xl p-3" style={{ background: "rgba(110,231,249,0.07)", border: "1px solid rgba(110,231,249,0.25)" }} data-testid="db-health-pool">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color }}>
                  {isAf ? "Verbindings (Pool)" : "Pool Connections"}
                </p>
                <p className="text-2xl font-black text-white tabular-nums">
                  {data!.poolStats.total}
                  <span className="text-base font-bold" style={{ color: "#fff" }}>/{data!.poolStats.max}</span>
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#fff" }}>
                  {isAf ? `${data!.poolStats.idle} ledig · ${data!.poolStats.waiting} wag` : `${data!.poolStats.idle} idle · ${data!.poolStats.waiting} waiting`}
                </p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(poolPct, 100)}%`,
                      background: poolPct >= 80 ? "#FFE29A" : color,
                    }}
                  />
                </div>
              </div>

              {/* Active connections (pg_stat_activity) */}
              <div className="rounded-xl p-3" style={{ background: "rgba(110,231,249,0.07)", border: "1px solid rgba(110,231,249,0.25)" }} data-testid="db-health-active">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color }}>
                  {isAf ? "Aktiewe Verbindings" : "Active Connections"}
                </p>
                <p className="text-2xl font-black text-white tabular-nums">
                  {data!.activity.active}
                  <span className="text-base font-bold" style={{ color: "#fff" }}>/{data!.activity.total}</span>
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#fff" }}>
                  {isAf ? `${data!.activity.idle} ledig in DB` : `${data!.activity.idle} idle in DB`}
                </p>
              </div>

              {/* Slow queries */}
              <div className="rounded-xl p-3" style={{ background: "rgba(110,231,249,0.07)", border: "1px solid rgba(110,231,249,0.25)" }} data-testid="db-health-slow">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color }}>
                  {isAf ? "Stadige Navrae (>500ms)" : "Slow Queries (>500ms)"}
                </p>
                <p className="text-2xl font-black tabular-nums" style={{ color: data!.slowQueryCount > 0 ? "#FFE29A" : "white" }}>
                  {data!.slowQueryCount}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#fff" }}>
                  {data!.slowQuerySource === "pg_stat_statements_delta"
                    ? (isAf
                        ? `>500ms gem — laaste ${data!.slowWindowMinutes ?? "?"}min`
                        : `>500ms mean — last ${data!.slowWindowMinutes ?? "?"}min`)
                    : data!.slowQuerySource === "pg_stat_statements_cumulative"
                      ? (isAf ? "gemiddeld >500ms (kumulatief)" : "mean >500ms (cumulative)")
                      : (isAf ? "aktief >500ms — laaste uur" : "active >500ms — last hour")}
                </p>
              </div>

              {/* DB Uptime */}
              <div className="rounded-xl p-3" style={{ background: "rgba(110,231,249,0.07)", border: "1px solid rgba(110,231,249,0.25)" }} data-testid="db-health-uptime">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color }}>
                  {isAf ? "DB Beskikbaartyd" : "DB Uptime"}
                </p>
                <p className="text-2xl font-black text-white">
                  {formatUptime(data!.dbStarted)}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#fff" }}>
                  {isAf ? "sedert herbegin" : "since last restart"}
                </p>
              </div>
            </div>

            {/* Last migration + refresh */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs" style={{ color: "#fff" }}>
                <Activity className="w-3 h-3" style={{ color }} />
                <span>
                  {isAf ? "Laaste migrasie:" : "Last migration:"}&nbsp;
                  <span className="font-bold text-white">{lastMig}</span>
                  {lastMigTag && (
                    <span className="ml-1 font-mono text-[10px]" style={{ color: "#fff" }}>
                      ({lastMigTag})
                    </span>
                  )}
                </span>
                {fetchedAt && (
                  <span className="ml-2">
                    {isAf ? `Opgedateer ${fetchedAt}` : `Updated ${fetchedAt}`}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                data-testid="db-health-refresh"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-40"
                style={{ border: `1px solid rgba(110,231,249,0.4)`, color, background: "rgba(110,231,249,0.08)" }}
              >
                {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                {isAf ? "Verfris" : "Refresh"}
              </button>
            </div>
          </>
        )}
      </NeonShell>
    </section>
  );
}

function PartnerSchoolInquiriesPanel({ isAf }: { isAf: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});

  const { data: inquiries = [], isLoading } = useQuery<PartnerSchoolInquiry[]>({
    queryKey: ["/api/admin/school/inquiries"],
  });

  const doAction = useMutation({
    mutationFn: async ({ id, action, notes }: { id: number; action: string; notes?: string }) => {
      const r = await apiRequest("PATCH", `/api/admin/school/inquiries/${id}`, { action, notes });
      return r.json();
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/admin/school/inquiries"] });
      const labels: Record<string, string> = {
        contacted: isAf ? "Gemerk as gekontak" : "Marked as contacted",
        approved: isAf ? "Skool goedgekeur" : "School approved",
        dismissed: isAf ? "Aansoek afgewys" : "Inquiry dismissed",
      };
      toast({ title: labels[vars.action] ?? (isAf ? "Opgedateer" : "Updated") });
    },
    onError: () => {
      toast({ title: isAf ? "Kon nie opdateer nie" : "Update failed", variant: "destructive" });
    },
  });

  const color: NeonHex = "#FFE29A";

  return (
    <section>
      <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3 flex items-center gap-2">
        <Handshake className="w-3 h-3" style={{ color }} />
        {isAf ? "Inkomende Skoolaansoeke" : "Inbound School Inquiries"}
        {inquiries.length > 0 && (
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black"
            style={{ background: color, color: "#000" }}
          >
            {inquiries.length}
          </span>
        )}
      </h2>
      <NeonShell color={color} className="p-5" testId="admin-partner-school-inquiries">
        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-white text-xs">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color }} />
            {isAf ? "Laai aansoeke…" : "Loading inquiries…"}
          </div>
        ) : inquiries.length === 0 ? (
          <p className="text-white text-xs py-4">{isAf ? "Geen uitstaande aansoeke nie." : "No pending school inquiries."}</p>
        ) : (
          <div className="space-y-2">
            {inquiries.map((inq) => {
              const isOpen = expanded === inq.id;
              const fmt = (s: string) => new Date(s).toLocaleDateString(isAf ? "af-ZA" : "en-ZA");
              return (
                <div key={inq.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${color}30` }}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 flex items-center gap-3 bg-black/40 hover:bg-black/60 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : inq.id)}
                    data-testid={`inq-row-${inq.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">{inq.schoolName}</span>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                          style={{ border: `1px solid ${color}`, color }}
                        >
                          {inq.schoolType}
                        </span>
                      </div>
                      <div className="text-[11px] text-white mt-0.5 truncate">
                        {inq.contactName ?? "—"} · {inq.contactEmail ?? "—"}
                        {inq.expectedLearnerCount ? ` · ${inq.expectedLearnerCount} ${isAf ? "leerders" : "learners"}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-white">{fmt(inq.createdAt)}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 bg-black/20 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3">
                        {[
                          { label: isAf ? "Skool" : "School", value: inq.schoolName },
                          { label: isAf ? "Kontak" : "Contact", value: inq.contactName ?? "—" },
                          { label: "Email", value: inq.contactEmail ?? "—" },
                          { label: isAf ? "Telefoon" : "Phone", value: inq.contactPhone ?? "—" },
                          { label: isAf ? "Verwagte leerders" : "Expected learners", value: inq.expectedLearnerCount ? String(inq.expectedLearnerCount) : "—" },
                          { label: isAf ? "Provinsie" : "Province", value: inq.province ?? "—" },
                          { label: isAf ? "Distrik" : "District", value: inq.district ?? "—" },
                          { label: isAf ? "Skooltipe" : "School type", value: inq.schoolType },
                          { label: isAf ? "Ontvang" : "Received", value: fmt(inq.createdAt) },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-lg bg-black/40 px-3 py-2" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                            <div className="text-[10px] font-black uppercase tracking-wider text-white">{label}</div>
                            <div className="text-xs text-white mt-0.5 break-all">{value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-white">
                          {isAf ? "Notas" : "Notes"}
                        </label>
                        <textarea
                          value={noteInputs[inq.id] ?? (inq.notes ?? "")}
                          onChange={(e) => setNoteInputs((prev) => ({ ...prev, [inq.id]: e.target.value }))}
                          rows={2}
                          placeholder={isAf ? "Voeg notas by…" : "Add notes…"}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 text-white text-xs placeholder-white focus:outline-none resize-none"
                          style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(["contacted", "approved", "dismissed"] as const).map((action) => {
                          const ac = INQUIRY_ACTION_COLORS[action];
                          const labels: Record<string, { en: string; af: string }> = {
                            contacted: { en: "Mark Contacted", af: "Merk as Gekontak" },
                            approved: { en: "Approve", af: "Keur goed" },
                            dismissed: { en: "Dismiss", af: "Wys af" },
                          };
                          return (
                            <button
                              key={action}
                              type="button"
                              disabled={doAction.isPending}
                              onClick={() => doAction.mutate({
                                id: inq.id,
                                action,
                                notes: noteInputs[inq.id] ?? inq.notes ?? undefined,
                              })}
                              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                              style={{ border: `1px solid ${ac}`, color: ac, background: "transparent" }}
                              data-testid={`inq-${inq.id}-action-${action}`}
                            >
                              {isAf ? labels[action].af : labels[action].en}
                            </button>
                          );
                        })}
                        {noteInputs[inq.id] !== undefined && noteInputs[inq.id] !== (inq.notes ?? "") && (
                          <button
                            type="button"
                            disabled={doAction.isPending}
                            onClick={() => doAction.mutate({ id: inq.id, action: "contacted", notes: noteInputs[inq.id] })}
                            className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                            style={{ border: "1px solid #fff", color: "#fff" }}
                            data-testid={`inq-${inq.id}-save-notes`}
                          >
                            {isAf ? "Stoor notas" : "Save notes"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </NeonShell>
    </section>
  );
}

function SchoolEnquiriesPanel({ isAf }: { isAf: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});

  const { data: enquiries = [], isLoading } = useQuery<SchoolEnquiry[]>({
    queryKey: ["/api/admin/school-enquiries"],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) => {
      const r = await apiRequest("PATCH", `/api/admin/school-enquiries/${id}/status`, { status, adminNotes });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/school-enquiries"] });
      toast({ title: isAf ? "Status opgedateer" : "Status updated" });
    },
    onError: () => {
      toast({ title: isAf ? "Kon nie opdateer nie" : "Update failed", variant: "destructive" });
    },
  });

  const newCount = enquiries.filter((e) => e.status === "new").length;
  const color: NeonHex = "#FFE29A";

  return (
    <section>
      <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3 flex items-center gap-2">
        <School className="w-3 h-3" style={{ color }} />
        {isAf ? "Skoolaansoeke" : "School Enquiries"}
        {newCount > 0 && (
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black"
            style={{ background: color, color: "#000" }}
          >
            {newCount}
          </span>
        )}
      </h2>
      <NeonShell color={color} className="p-5" testId="admin-school-enquiries">
        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-white text-xs">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color }} />
            {isAf ? "Laai aansoeke…" : "Loading enquiries…"}
          </div>
        ) : enquiries.length === 0 ? (
          <p className="text-white text-xs py-4">{isAf ? "Geen aansoeke nog nie." : "No school enquiries yet."}</p>
        ) : (
          <div className="space-y-2">
            {enquiries.map((enq) => {
              const sc = STATUS_COLORS[enq.status] ?? "#C5B3FF";
              const isOpen = expanded === enq.id;
              const fmt = (s: string) => new Date(s).toLocaleDateString(isAf ? "af-ZA" : "en-ZA");
              return (
                <div key={enq.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${sc}30` }}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 flex items-center gap-3 bg-black/40 hover:bg-black/60 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : enq.id)}
                    data-testid={`enq-row-${enq.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">{enq.schoolName}</span>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                          style={{ border: `1px solid ${sc}`, color: sc }}
                        >
                          {enq.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-white mt-0.5 truncate">
                        {enq.contactPerson} · {enq.email}
                        {enq.numLearners ? ` · ${enq.numLearners} ${isAf ? "leerders" : "learners"}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-white">{fmt(enq.createdAt)}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 bg-black/20 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3">
                        {[
                          { label: isAf ? "Skool" : "School", value: enq.schoolName },
                          { label: isAf ? "Kontak" : "Contact", value: enq.contactPerson },
                          { label: "Email", value: enq.email },
                          { label: isAf ? "Telefoon" : "Phone", value: enq.phone ?? "—" },
                          { label: isAf ? "Leerders" : "Learners", value: enq.numLearners ? String(enq.numLearners) : "—" },
                          { label: isAf ? "Ontvang" : "Received", value: fmt(enq.createdAt) },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-lg bg-black/40 px-3 py-2" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                            <div className="text-[10px] font-black uppercase tracking-wider text-white">{label}</div>
                            <div className="text-xs text-white mt-0.5 break-all">{value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-white">
                          {isAf ? "Notas" : "Notes"}
                        </label>
                        <textarea
                          value={noteInputs[enq.id] ?? (enq.adminNotes ?? "")}
                          onChange={(e) => setNoteInputs((prev) => ({ ...prev, [enq.id]: e.target.value }))}
                          rows={2}
                          placeholder={isAf ? "Voeg notas by…" : "Add notes…"}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 text-white text-xs placeholder-white focus:outline-none resize-none"
                          style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(["new", "contacted", "converted", "dismissed"] as const).map((s) => {
                          const sc2 = STATUS_COLORS[s];
                          const active = enq.status === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={updateStatus.isPending}
                              onClick={() => updateStatus.mutate({
                                id: enq.id,
                                status: s,
                                adminNotes: noteInputs[enq.id] ?? enq.adminNotes ?? undefined,
                              })}
                              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                              style={{
                                border: `1px solid ${sc2}`,
                                color: active ? "#000" : sc2,
                                background: active ? sc2 : "transparent",
                              }}
                              data-testid={`enq-${enq.id}-status-${s}`}
                            >
                              {s}
                            </button>
                          );
                        })}
                        {noteInputs[enq.id] !== undefined && noteInputs[enq.id] !== (enq.adminNotes ?? "") && (
                          <button
                            type="button"
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({
                              id: enq.id,
                              status: enq.status,
                              adminNotes: noteInputs[enq.id],
                            })}
                            className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                            style={{ border: "1px solid #fff", color: "#fff" }}
                            data-testid={`enq-${enq.id}-save-notes`}
                          >
                            {isAf ? "Stoor notas" : "Save notes"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </NeonShell>
    </section>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: stats } = useQuery<AdminStats>({ queryKey: ["/api/admin/reports/stats"] });
  const { data: reportSchedule, isError: reportScheduleError } = useQuery<{ config: { enabled: boolean; frequency: "weekly" | "monthly" } }>({
    queryKey: ["/api/admin/report-schedule"],
  });
  const { data: emergency } = useQuery<EmergencyStatus>({ queryKey: ["/api/admin/emergency/status"] });
  const { data: superFlag } = useQuery<{ isSuperAdmin: boolean }>({ queryKey: ["/api/admin/is-super-admin"] });
  const { data: referralSummary } = useQuery<{
    linksGenerated: number;
    referrersWithActivity: number;
    pending: number;
    converted: number;
    rewarded: number;
    totalPaidConversions: number;
    monthsAwarded: number;
  }>({ queryKey: ["/api/admin/learner-referrals/summary"] });
  const [refStatus, setRefStatus] = useState<"all" | "pending" | "converted" | "rewarded">("all");
  const [refSearchInput, setRefSearchInput] = useState("");
  const [refSearch, setRefSearch] = useState("");
  const [refFrom, setRefFrom] = useState("");
  const [refTo, setRefTo] = useState("");
  const [refPage, setRefPage] = useState(0);
  const REF_PAGE_SIZE = 25;

  useEffect(() => {
    const t = setTimeout(() => {
      setRefSearch(refSearchInput.trim());
      setRefPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [refSearchInput]);

  useEffect(() => {
    setRefPage(0);
  }, [refStatus, refFrom, refTo]);

  const referralRecentParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", String(REF_PAGE_SIZE));
    p.set("offset", String(refPage * REF_PAGE_SIZE));
    if (refStatus !== "all") p.set("status", refStatus);
    if (refSearch) p.set("q", refSearch);
    if (refFrom) p.set("from", refFrom);
    if (refTo) p.set("to", new Date(`${refTo}T23:59:59.999Z`).toISOString());
    return p.toString();
  }, [refStatus, refSearch, refFrom, refTo, refPage]);

  const { data: referralRecent, isLoading: referralRecentLoading, isError: referralRecentError } = useQuery<{
    rows: Array<{
      id: number;
      status: string;
      coinsAwarded: number;
      createdAt: string | null;
      convertedAt: string | null;
      rewardedAt: string | null;
      refereeEmail: string | null;
      referralCode: string | null;
      referrerEmail: string | null;
      referrerFirstName: string | null;
      referrerLastName: string | null;
      refereeUserEmail: string | null;
      refereeFirstName: string | null;
      refereeLastName: string | null;
    }>;
    total: number;
    limit: number;
    offset: number;
  }>({ queryKey: [`/api/admin/learner-referrals/recent?${referralRecentParams}`] });

  const refTotal = referralRecent?.total ?? 0;
  const refStart = refTotal === 0 ? 0 : refPage * REF_PAGE_SIZE + 1;
  const refEnd = Math.min(refTotal, (refPage + 1) * REF_PAGE_SIZE);
  const refHasPrev = refPage > 0;
  const refHasNext = (refPage + 1) * REF_PAGE_SIZE < refTotal;

  const enterPreviewMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/admin/preview/enter", {});
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast({
        title: isAf ? "Voorskou aktief" : "Preview active",
        description: isAf
          ? "Jy sien nou die leerderervaring. Gebruik die geel balk om uit te teken."
          : "You're now seeing the learner experience. Use the yellow banner to exit.",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 300);
    },
    onError: () => {
      toast({
        title: isAf ? "Kon nie voorskou begin nie" : "Could not start preview",
        variant: "destructive",
      });
    },
  });

  const firstName = (user?.firstName || "Admin").split(" ")[0];
  const emergencyActive = Boolean(emergency?.emergency?.active);
  const disabledCount =
    (emergency?.disabledEndpoints?.length ?? 0) + (emergency?.disabledFeatures?.length ?? 0);

  const quickActions: {
    href: string; color: NeonHex; title: string; titleAf: string;
    desc: string; descAf: string; Icon: any; testId: string;
  }[] = [
    {
      href: "/classroom", color: "#FFE29A",
      title: "Open Learner Classroom", titleAf: "Maak Klaskamer Oop",
      desc: "Jump straight to the learner classroom without entering an impersonation session.",
      descAf: "Gaan direk na die leerder klaskamer sonder om 'n nabootsingsessie te begin.",
      Icon: GraduationCap, testId: "quick-preview-classroom",
    },
    {
      href: "/learn/admin/reports", color: "#C5B3FF",
      title: "Reports", titleAf: "Verslae",
      desc: "User, parent, learner and school analytics.",
      descAf: "Gebruiker-, ouer-, leerder- en skoolontleding.",
      Icon: BarChart3, testId: "quick-reports",
    },
    {
      href: "/learn/admin/products", color: "#C5B3FF",
      title: "Products", titleAf: "Produkte",
      desc: "Pricing, plans, and availability controls.",
      descAf: "Pryse, planne en beskikbaarheid.",
      Icon: Package, testId: "quick-products",
    },
    {
      href: "/learn/admin/topic-audio", color: "#6EE7F9",
      title: "Topic Audio", titleAf: "Onderwerp Klank",
      desc: "Preview, regenerate or upload replacement MP3s before students hear them.",
      descAf: "Voorskou, hergenereer of laai vervangings-MP3's op voor leerders dit hoor.",
      Icon: Headphones, testId: "quick-topic-audio",
    },
    {
      href: "/partner-schools", color: "#FFE29A",
      title: "Partner Schools", titleAf: "Vennootskole",
      desc: "Manage channels, pipelines, and contacts.",
      descAf: "Bestuur kanale, pyplyne en kontakte.",
      Icon: Store, testId: "quick-schools",
    },
    {
      href: "/learn/admin/school-qr", color: "#6EE7F9",
      title: "School QR Codes", titleAf: "Skool QR-kodes",
      desc: "Download or print unique QR codes for each partner school.",
      descAf: "Laai af of druk unieke QR-kodes vir elke vennootskool.",
      Icon: QrCode, testId: "quick-school-qr",
    },
    {
      href: "/learn/admin/reports?tab=referrals", color: "#FFB7E5",
      title: "Referral Flags", titleAf: "Verwysingsvlae",
      desc: "Review suspicious referral activity.",
      descAf: "Hersien verdagte verwysings.",
      Icon: ShieldAlert, testId: "quick-referrals",
    },
    {
      href: "/learn/admin/billing", color: "#FFE29A",
      title: "Billing", titleAf: "Fakturering",
      desc: "Trials ending, recurring failures, lapsed subscribers (Netcash).",
      descAf: "Proewe wat eindig, herhalende mislukkings, vervalde intekeninge (Netcash).",
      Icon: AlertTriangle, testId: "quick-billing",
    },
    (() => {
      const cfg = reportSchedule?.config;
      const freqEn = cfg ? (cfg.frequency === "weekly" ? "Weekly" : "Monthly") : "";
      const freqAf = cfg ? (cfg.frequency === "weekly" ? "Weekliks" : "Maandeliks") : "";
      const statusEn = reportScheduleError
        ? "Schedule: unavailable"
        : cfg
        ? cfg.enabled
          ? `Schedule: ${freqEn} (enabled)`
          : `Schedule: disabled (${freqEn})`
        : "Schedule: loading…";
      const statusAf = reportScheduleError
        ? "Skedule: nie beskikbaar nie"
        : cfg
        ? cfg.enabled
          ? `Skedule: ${freqAf} (aktief)`
          : `Skedule: af (${freqAf})`
        : "Skedule: laai…";
      return {
        href: "/learn/admin/partner-branding", color: "#6EE7F9" as NeonHex,
        title: "Partner Branding & Reports", titleAf: "Vennoothandel & Verslae",
        desc: `${statusEn} · Set partner name, logo and report send schedule.`,
        descAf: `${statusAf} · Stel vennootnaam, logo en verslagskedule.`,
        Icon: Handshake, testId: "quick-partner-branding",
      };
    })(),
    {
      href: "/learn/admin/content", color: "#FFB7E5",
      title: "Content Editor", titleAf: "Inhoudsredigeerder",
      desc: "Edit topic notes, flashcards and literature notes without reseeding.",
      descAf: "Wysig onderwerpnotas, flitskaarte en literatuurnotas sonder om oor te saai.",
      Icon: FileEdit, testId: "quick-content-editor",
    },
    {
      href: "/learn/admin/emails", color: "#FFE29A",
      title: "Email Templates", titleAf: "E-pos Sjablone",
      desc: "Preview & test-send transactional emails.",
      descAf: "Voorskou en toets-stuur transaksionele e-posse.",
      Icon: Mail, testId: "quick-email-templates",
    },
    {
      href: "/learn/admin/dbe-portal", color: "#6EE7F9",
      title: "DBE Portal", titleAf: "DBE Portaal",
      desc: "Manage DBE past-paper ingestion, catalog and release-gate controls.",
      descAf: "Bestuur DBE vorige vraestelle, katalogus en vrystellingbeheer.",
      Icon: FileText, testId: "quick-dbe-portal",
    },
  ];

  const previewCard = {
    color: "#FFE29A" as NeonHex,
    title: "Preview Learner Journey",
    titleAf: "Voorskou Leerderreis",
    desc: "Step into a fresh learner's shoes — role select, onboarding, paywall, dashboard.",
    descAf: "Stap in 'n vars leerder se skoene — rolkies, aanboord, betaalmuur, paneel.",
    testId: "quick-preview-learner",
  };

  const statCards: { label: string; labelAf: string; value: number; color: NeonHex; Icon: any; testId: string }[] = [
    { label: "Total Users",  labelAf: "Totaal Gebruikers", value: stats?.totalUsers  ?? 0, color: "#6EE7F9", Icon: Users,         testId: "stat-total"     },
    { label: "Learners",     labelAf: "Leerders",          value: stats?.learners    ?? 0, color: "#9FD8FF", Icon: GraduationCap, testId: "stat-learners"  },
    { label: "Parents",      labelAf: "Ouers",             value: stats?.parents     ?? 0, color: "#C5B3FF", Icon: Users,         testId: "stat-parents"   },
    { label: "Subscribed",   labelAf: "Geabonneer",        value: stats?.subscribedUsers ?? 0, color: "#FFB7E5", Icon: Zap,       testId: "stat-subs"      },
    { label: "Trial",        labelAf: "Proef",             value: stats?.trialUsers  ?? 0, color: "#FFE29A", Icon: Activity,      testId: "stat-trial"     },
    { label: "Admins",       labelAf: "Admins",            value: stats?.admins      ?? 0, color: "#FFE29A", Icon: Layers,        testId: "stat-admins"    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <GraffitiSplats variant="corner" opacity={0.35} />
      <AdminTopNav current="dashboard" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-3xl bg-black p-6 sm:p-8 md:p-10"
          style={{
            border: "1.5px solid #C5B3FF",
            boxShadow: "0 0 0 1px rgba(197,179,255,0.35), 0 0 44px rgba(197,179,255,0.35), inset 0 0 40px rgba(0,0,0,0.65)",
          }}
          data-testid="admin-hero"
        >
          <div aria-hidden className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #6EE7F9, #9FD8FF, #C5B3FF, #FFB7E5)" }} />
          <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(197,179,255,0.3), transparent 70%)" }} />
          <div aria-hidden className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(110,231,249,0.22), transparent 70%)" }} />
          <span aria-hidden className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "#C5B3FF" }} />
          <span aria-hidden className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "#C5B3FF" }} />
          <span aria-hidden className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "#C5B3FF" }} />
          <span aria-hidden className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "#C5B3FF" }} />

          <div className="relative flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
              style={{ border: "1px solid #C5B3FF", boxShadow: "0 0 12px rgba(197,179,255,0.45)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C5B3FF", boxShadow: "0 0 6px #C5B3FF" }} />
              <span className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "#C5B3FF" }}>
                {isAf ? "Administrateur" : "Administrator"}
              </span>
            </div>
            {superFlag?.isSuperAdmin && (
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                style={{ border: "1px solid #FFE29A", boxShadow: "0 0 12px rgba(255,226,154,0.45)" }}>
                <span className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "#FFE29A" }}>
                  {isAf ? "Hoof" : "Super"}
                </span>
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
              style={{
                border: emergencyActive ? "1px solid #FFE29A" : "1px solid rgba(110,231,249,0.55)",
                boxShadow: emergencyActive ? "0 0 12px rgba(255,226,154,0.45)" : "0 0 10px rgba(110,231,249,0.35)",
              }}
              data-testid="badge-emergency"
            >
              {emergencyActive
                ? <AlertTriangle className="w-3 h-3" style={{ color: "#FFE29A" }} />
                : <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#6EE7F9", boxShadow: "0 0 6px #6EE7F9" }} />}
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: emergencyActive ? "#FFE29A" : "#6EE7F9" }}>
                {emergencyActive
                  ? (isAf ? "Noodgeval Aktief" : "Emergency Active")
                  : (isAf ? "Stelsel Gesond" : "System Nominal")}
              </span>
            </div>
          </div>

          <p className="text-white font-semibold text-sm mb-1">{isAf ? "Welkom terug," : "Welcome back,"}</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[0.98] graffiti-hand">
            <span className="spray-title graffiti-hand">
              <SpraySmear color="#C5B3FF" />
              {firstName}.
            </span>
          </h1>
          <p className="text-white text-base sm:text-lg mt-2 max-w-xl">
            {isAf
              ? "Die hele BrainTrack-enjinkamer is hier. Hou kaarte dop, kataloge oop en die stelsel onder beheer."
              : "The whole BrainTrack engine room, right here. Watch the dials, open catalogs, keep the system green."}
          </p>

          {disabledCount > 0 && (
            <div
              className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-black"
              style={{ border: "1px solid rgba(255,226,154,0.55)", boxShadow: "0 0 10px rgba(255,226,154,0.35)" }}
            >
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#FFE29A" }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "#FFE29A" }}>
                {disabledCount} {isAf ? "gedeaktiveer" : "disabled"}
              </span>
            </div>
          )}
        </section>

        {/* Stats grid */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3">
            {isAf ? "Lewende Telling" : "Live Counts"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map(({ label, labelAf, value, color, Icon, testId }) => {
              const h = halo(color, 0.3);
              return (
                <NeonShell key={label} color={color} className="p-4" testId={testId}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center"
                      style={{ border: `1.5px solid ${color}`, boxShadow: `0 0 10px ${h}, inset 0 0 8px ${h}` }}>
                      <Icon className="w-4 h-4" style={{ color, filter: `drop-shadow(0 0 4px ${h})` }} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>
                      {isAf ? labelAf : label}
                    </span>
                  </div>
                  <div className="text-3xl font-black tabular-nums text-white"
                    style={{ textShadow: `0 0 14px ${h}` }}>
                    {formatNumber(value, language)}
                  </div>
                </NeonShell>
              );
            })}
          </div>
        </section>

        {/* Learner Referral Programme */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3 flex items-center gap-2">
            <Gift className="w-3 h-3" style={{ color: "#6EE7F9" }} />
            {isAf ? "Verwysingsprogram" : "Referral Programme"}
          </h2>
          <NeonShell color="#6EE7F9" className="p-5" testId="admin-referral-summary">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Links",            labelAf: "Skakels",     value: referralSummary?.linksGenerated ?? 0,         testId: "ref-links" },
                { label: "Active Referrers", labelAf: "Aktief",      value: referralSummary?.referrersWithActivity ?? 0,  testId: "ref-active" },
                { label: "Pending",          labelAf: "Hangend",     value: referralSummary?.pending ?? 0,                testId: "ref-pending" },
                { label: "Converted",        labelAf: "Bekeer",      value: referralSummary?.converted ?? 0,              testId: "ref-converted" },
                { label: "Rewarded",         labelAf: "Beloon",      value: referralSummary?.rewarded ?? 0,               testId: "ref-rewarded" },
                { label: "Free Months",      labelAf: "Gratis Maande", value: referralSummary?.monthsAwarded ?? 0,        testId: "ref-months" },
              ].map(({ label, labelAf, value, testId }) => (
                <div key={label} className="rounded-xl bg-black/40 p-3" style={{ border: "1px solid rgba(110,231,249,0.35)" }} data-testid={testId}>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#6EE7F9" }}>
                    {isAf ? labelAf : label}
                  </div>
                  <div className="text-2xl font-black tabular-nums text-white mt-1">
                    {formatNumber(value, language)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white mt-3">
              {isAf
                ? "Elke leerder met 'n intekening kry 'n unieke verwysingskakel. 2 betaalde bekerings = 1 gratis maand vir die verwyser."
                : "Every subscribed learner gets a unique referral link. 2 paid conversions = 1 free month for the referrer."}
            </p>

            {/* Drill-down: recent referrals */}
            <div className="mt-5">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-2">
                {isAf ? "Onlangse Verwysings" : "Recent Referrals"}
              </div>

              {/* Filters: status chips + search + date range */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {([
                  { id: "all",       en: "All",       af: "Alles" },
                  { id: "pending",   en: "Pending",   af: "Hangend" },
                  { id: "converted", en: "Converted", af: "Bekeer" },
                  { id: "rewarded",  en: "Rewarded",  af: "Beloon" },
                ] as const).map((c) => {
                  const active = refStatus === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setRefStatus(c.id)}
                      data-testid={`ref-filter-${c.id}`}
                      aria-pressed={active}
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors"
                      style={{
                        border: `1px solid ${active ? "#6EE7F9" : "rgba(255,255,255,0.18)"}`,
                        color: active ? "#6EE7F9" : "#fff",
                        background: active ? "rgba(110,231,249,0.12)" : "transparent",
                      }}
                    >
                      {isAf ? c.af : c.en}
                    </button>
                  );
                })}
                <input
                  type="search"
                  value={refSearchInput}
                  onChange={(e) => setRefSearchInput(e.target.value)}
                  placeholder={isAf ? "Soek op e-pos…" : "Search by email…"}
                  data-testid="ref-search-input"
                  className="ml-1 flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs placeholder-white focus:outline-none"
                  style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                />
                <input
                  type="date"
                  value={refFrom}
                  onChange={(e) => setRefFrom(e.target.value)}
                  data-testid="ref-from-date"
                  aria-label={isAf ? "Vanaf datum" : "From date"}
                  className="px-2 py-1.5 rounded-lg bg-black/50 text-white text-xs focus:outline-none"
                  style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                />
                <input
                  type="date"
                  value={refTo}
                  onChange={(e) => setRefTo(e.target.value)}
                  data-testid="ref-to-date"
                  aria-label={isAf ? "Tot datum" : "To date"}
                  className="px-2 py-1.5 rounded-lg bg-black/50 text-white text-xs focus:outline-none"
                  style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                />
                {(refStatus !== "all" || refSearchInput || refFrom || refTo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRefStatus("all");
                      setRefSearchInput("");
                      setRefSearch("");
                      setRefFrom("");
                      setRefTo("");
                    }}
                    data-testid="ref-clear-filters"
                    className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white hover:text-white"
                    style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                  >
                    {isAf ? "Maak skoon" : "Clear"}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(110,231,249,0.28)" }}>
                <table className="w-full text-xs" data-testid="ref-recent-table">
                  <thead className="bg-black/60 text-white">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Verwyser" : "Referrer"}</th>
                      <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Verwysde" : "Referee"}</th>
                      <th className="px-3 py-2 font-bold uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Geskep" : "Created"}</th>
                      <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Bekeer" : "Converted"}</th>
                      <th className="px-3 py-2 font-bold uppercase tracking-wider">{isAf ? "Beloon" : "Rewarded"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralRecentLoading ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-white" data-testid="ref-recent-loading">
                          <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" style={{ color: "#6EE7F9" }} />
                          {isAf ? "Laai verwysings…" : "Loading referrals…"}
                        </td>
                      </tr>
                    ) : referralRecentError ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center" style={{ color: "#FFE29A" }} data-testid="ref-recent-error">
                          {isAf
                            ? "Kon nie verwysings laai nie. Probeer asseblief weer."
                            : "Couldn't load referrals. Please try again."}
                        </td>
                      </tr>
                    ) : (referralRecent?.rows ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-white">
                          {isAf ? "Geen verwysingsaktiwiteit nog nie." : "No referral activity yet."}
                        </td>
                      </tr>
                    ) : (
                      (referralRecent?.rows ?? []).map((r) => {
                        const referrerName = [r.referrerFirstName, r.referrerLastName].filter(Boolean).join(" ").trim();
                        const refereeName = [r.refereeFirstName, r.refereeLastName].filter(Boolean).join(" ").trim();
                        const fmt = (s: string | null) => (s ? new Date(s).toLocaleDateString(isAf ? "af-ZA" : "en-ZA") : "—");
                        const statusColor =
                          r.status === "rewarded" ? "#FFE29A" :
                          r.status === "converted" ? "#6EE7F9" :
                          "#C5B3FF";
                        return (
                          <tr key={r.id} className="border-t border-white/5" data-testid={`ref-row-${r.id}`}>
                            <td className="px-3 py-2 text-white">
                              <div className="font-bold truncate max-w-[180px]">{referrerName || r.referrerEmail || "—"}</div>
                              {referrerName && r.referrerEmail && (
                                <div className="text-white text-[10px] truncate max-w-[180px]">{r.referrerEmail}</div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-white">
                              <div className="font-bold truncate max-w-[180px]">
                                {refereeName || r.refereeUserEmail || r.refereeEmail || "—"}
                              </div>
                              {(refereeName && (r.refereeUserEmail || r.refereeEmail)) && (
                                <div className="text-white text-[10px] truncate max-w-[180px]">
                                  {r.refereeUserEmail || r.refereeEmail}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                style={{ border: `1px solid ${statusColor}`, color: statusColor }}
                              >
                                {r.status === "signed_up" ? (isAf ? "hangend" : "pending") : r.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-white tabular-nums">{fmt(r.createdAt)}</td>
                            <td className="px-3 py-2 text-white tabular-nums">{fmt(r.convertedAt)}</td>
                            <td className="px-3 py-2 text-white tabular-nums">{fmt(r.rewardedAt)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white">
                <div data-testid="ref-pagination-info">
                  {refTotal === 0
                    ? (isAf ? "Geen resultate" : "No results")
                    : (isAf
                        ? `${refStart}–${refEnd} van ${refTotal}`
                        : `${refStart}–${refEnd} of ${refTotal}`)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!refHasPrev || referralRecentLoading}
                    onClick={() => setRefPage((p) => Math.max(0, p - 1))}
                    data-testid="ref-prev-page"
                    className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-40"
                    style={{
                      border: "1px solid rgba(110,231,249,0.4)",
                      color: "#6EE7F9",
                      background: "rgba(110,231,249,0.08)",
                    }}
                  >
                    {isAf ? "Vorige" : "Previous"}
                  </button>
                  <button
                    type="button"
                    disabled={!refHasNext || referralRecentLoading}
                    onClick={() => setRefPage((p) => p + 1)}
                    data-testid="ref-next-page"
                    className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-40"
                    style={{
                      border: "1px solid rgba(110,231,249,0.4)",
                      color: "#6EE7F9",
                      background: "rgba(110,231,249,0.08)",
                    }}
                  >
                    {isAf ? "Volgende" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </NeonShell>
        </section>

        {/* DB Health */}
        <DbHealthPanel isAf={isAf} />

        {/* Fraud Flags */}
        <FraudFlagsPanel isAf={isAf} />

        {/* Inbound Partner School Inquiries */}
        <PartnerSchoolInquiriesPanel isAf={isAf} />

        {/* School Enquiries */}
        <SchoolEnquiriesPanel isAf={isAf} />

        {/* Quick actions */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3">
            {isAf ? "Bedieningspaneel" : "Command Deck"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const { color, title, titleAf, desc, descAf, testId } = previewCard;
              const h = halo(color, 0.3);
              const busy = enterPreviewMutation.isPending;
              return (
                <button
                  type="button"
                  onClick={() => enterPreviewMutation.mutate()}
                  disabled={busy}
                  data-testid={testId}
                  className="text-left disabled:opacity-70"
                >
                  <div className="h-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] cursor-pointer">
                    <NeonShell color={color} className="h-full">
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center"
                            style={{ border: `1.5px solid ${color}`, boxShadow: `0 0 14px ${h}, inset 0 0 10px ${h}` }}>
                            {busy ? (
                              <Loader2 className="w-5 h-5 animate-spin" style={{ color, filter: `drop-shadow(0 0 5px ${h})` }} />
                            ) : (
                              <Eye className="w-5 h-5" style={{ color, filter: `drop-shadow(0 0 5px ${h})` }} />
                            )}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color }}>→</span>
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight">
                          {isAf ? titleAf : title}
                        </h3>
                        <p className="text-sm text-white leading-relaxed">
                          {isAf ? descAf : desc}
                        </p>
                      </div>
                    </NeonShell>
                  </div>
                </button>
              );
            })()}
            {quickActions.map(({ href, color, title, titleAf, desc, descAf, Icon, testId }) => {
              const h = halo(color, 0.3);
              return (
                <Link key={href} href={href} data-testid={testId}>
                  <div className="h-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] cursor-pointer">
                    <NeonShell color={color} className="h-full">
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center"
                            style={{ border: `1.5px solid ${color}`, boxShadow: `0 0 14px ${h}, inset 0 0 10px ${h}` }}>
                            <Icon className="w-5 h-5" style={{ color, filter: `drop-shadow(0 0 5px ${h})` }} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color }}>→</span>
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight">
                          {isAf ? titleAf : title}
                        </h3>
                        <p className="text-sm text-white leading-relaxed">
                          {isAf ? descAf : desc}
                        </p>
                      </div>
                    </NeonShell>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
