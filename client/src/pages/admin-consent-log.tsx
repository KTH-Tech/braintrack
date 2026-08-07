import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AdminTopNav } from "@/components/admin-top-nav";
import {
  AdminGround, NeonShell, AdminBadge,
  adminTableWrapClass, adminTableWrapStyle, adminTableClass,
  adminTheadClass, adminThClass, adminTrClass, adminTdClass,
  type NeonHex,
} from "@/components/admin-ui";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface ConsentLogRow {
  id: number;
  userId: string | null;
  consentType: "terms_of_service" | "privacy_policy" | "cookie" | "parental" | "billing";
  action: "granted" | "revoked" | "updated";
  version: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const TYPE_LABELS: Record<ConsentLogRow["consentType"], string> = {
  terms_of_service: "Terms of Service",
  privacy_policy: "Privacy Policy",
  cookie: "Cookie",
  parental: "Parental",
  billing: "Billing",
};

const TYPE_COLOURS: Record<ConsentLogRow["consentType"], NeonHex> = {
  terms_of_service: "#9FD8FF",
  privacy_policy: "#C5B3FF",
  cookie: "#FFE29A",
  parental: "#9FF5E8",
  billing: "#94F7C5",
};

const ACTION_COLOURS: Record<ConsentLogRow["action"], NeonHex> = {
  granted: "#94F7C5",
  revoked: "#FFB7E5",
  updated: "#9FD8FF",
};

export default function AdminConsentLogPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId ?? "";
  const { language } = useLanguage();
  const isAf = language === "af";

  const { data: rows, isLoading, isError } = useQuery<ConsentLogRow[]>({
    queryKey: [`/api/admin/consent-log/${userId}`],
    queryFn: async () => (await apiRequest("GET", `/api/admin/consent-log/${userId}`)).json(),
    enabled: !!userId,
  });

  return (
    <AdminGround>
      <AdminTopNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/learn/admin/reports"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white transition"
            style={{ border: "1px solid #1b1922" }}
            data-testid="link-back-reports"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#0e0d12", border: "1px solid rgba(197,179,255,0.5)" }}
            >
              <ShieldCheck className="w-5 h-5" style={{ color: "#C5B3FF" }} />
            </div>
            <div>
              <div role="heading" aria-level={1} className="text-xl font-black text-white">
                {isAf ? "Toestemming Ouditlys" : "Consent Audit Log"}
              </div>
              <p className="text-xs text-white font-mono">{userId}</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3">
            {isAf ? "Toestemmingsgeskiedenis" : "Consent History"}
          </h2>
          <NeonShell color="#C5B3FF" className="p-5" testId="consent-history-panel">
            {isLoading && (
              <div className="flex items-center justify-center py-12 gap-2 text-sm text-white">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#C5B3FF" }} />
                {isAf ? "Laai toestemmingsrekords…" : "Loading consent records…"}
              </div>
            )}
            {isError && (
              <p className="text-sm py-4 text-center" style={{ color: "#FF8DA1" }}>
                {isAf ? "Kon nie toestemmingsrekords laai nie." : "Failed to load consent records."}
              </p>
            )}
            {!isLoading && !isError && rows && rows.length === 0 && (
              <div className="py-10 text-center space-y-2">
                <p className="text-sm text-white max-w-md mx-auto">
                  {isAf
                    ? "Geen toestemmingsrekords gevind vir hierdie gebruiker nie. Rekords word slegs versamel vir aksies wat na hierdie funksie geaktiveer is."
                    : "No consent records found for this user. Records are only collected for actions taken after this feature was activated."}
                </p>
              </div>
            )}
            {!isLoading && !isError && rows && rows.length > 0 && (
              <div className={adminTableWrapClass} style={adminTableWrapStyle("#C5B3FF")}>
                <table className={adminTableClass} data-testid="consent-log-table">
                  <thead className={adminTheadClass}>
                    <tr>
                      <th className={adminThClass}>{isAf ? "Tipe" : "Type"}</th>
                      <th className={adminThClass}>{isAf ? "Aksie" : "Action"}</th>
                      <th className={adminThClass}>{isAf ? "Weergawe" : "Version"}</th>
                      <th className={adminThClass}>{isAf ? "Tydstempel" : "Timestamp"}</th>
                      <th className={`${adminThClass} hidden md:table-cell`}>IP</th>
                      <th className={`${adminThClass} hidden lg:table-cell`}>{isAf ? "Gebruiker-agent" : "User Agent"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className={adminTrClass} data-testid={`consent-row-${row.id}`}>
                        <td className={adminTdClass}>
                          <AdminBadge color={TYPE_COLOURS[row.consentType]}>{TYPE_LABELS[row.consentType]}</AdminBadge>
                        </td>
                        <td className={adminTdClass}>
                          <AdminBadge color={ACTION_COLOURS[row.action]}>{row.action}</AdminBadge>
                        </td>
                        <td className={`${adminTdClass} font-mono`}>{row.version || "—"}</td>
                        <td className={`${adminTdClass} whitespace-nowrap tabular-nums`}>
                          {new Date(row.createdAt).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", hour12: false })}
                        </td>
                        <td className={`${adminTdClass} font-mono hidden md:table-cell`}>
                          {row.ipAddress ?? "—"}
                        </td>
                        <td className={`${adminTdClass} hidden lg:table-cell max-w-[200px] truncate`} title={row.userAgent ?? ""}>
                          {row.userAgent ? row.userAgent.slice(0, 60) + (row.userAgent.length > 60 ? "…" : "") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </NeonShell>
        </section>

        {rows && rows.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-white mb-3">
              {isAf ? "Laaste rekord metadata" : "Latest Record Metadata"}
            </h2>
            <NeonShell color="#9FD8FF" className="p-5" testId="consent-metadata-panel">
              <pre className="text-xs text-white font-mono rounded-xl p-3 overflow-x-auto whitespace-pre-wrap" style={{ background: "#050508", border: "1px solid #1b1922" }}>
                {JSON.stringify(rows[0].metadata, null, 2) ?? "null"}
              </pre>
            </NeonShell>
          </section>
        )}
      </main>
    </AdminGround>
  );
}
