import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
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

const TYPE_COLOURS: Record<ConsentLogRow["consentType"], string> = {
  terms_of_service: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  privacy_policy: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  cookie: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  parental: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  billing: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

const ACTION_COLOURS: Record<ConsentLogRow["action"], string> = {
  granted: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  revoked: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  updated: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
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
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/learn/admin/reports" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isAf ? "Toestemming Ouditlys" : "Consent Audit Log"}
              </h1>
              <p className="text-xs text-muted-foreground font-mono">{userId}</p>
            </div>
          </div>
        </div>

        <Card className="border-border/60 bg-background/60 ">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {isAf ? "Toestemmingsgeskiedenis" : "Consent History"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {isError && (
              <p className="text-sm text-rose-400 py-4 text-center">
                {isAf ? "Kon nie toestemmingsrekords laai nie." : "Failed to load consent records."}
              </p>
            )}
            {!isLoading && !isError && rows && rows.length === 0 && (
              <div className="py-10 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isAf
                    ? "Geen toestemmingsrekords gevind vir hierdie gebruiker nie. Rekords word slegs versamel vir aksies wat na hierdie funksie geaktiveer is."
                    : "No consent records found for this user. Records are only collected for actions taken after this feature was activated."}
                </p>
              </div>
            )}
            {!isLoading && !isError && rows && rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="pb-2 text-left pr-3">{isAf ? "Tipe" : "Type"}</th>
                      <th className="pb-2 text-left pr-3">{isAf ? "Aksie" : "Action"}</th>
                      <th className="pb-2 text-left pr-3">{isAf ? "Weergawe" : "Version"}</th>
                      <th className="pb-2 text-left pr-3">{isAf ? "Tydstempel" : "Timestamp"}</th>
                      <th className="pb-2 text-left pr-3 hidden md:table-cell">IP</th>
                      <th className="pb-2 text-left hidden lg:table-cell">{isAf ? "Gebruiker-agent" : "User Agent"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 pr-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${TYPE_COLOURS[row.consentType]}`}>
                            {TYPE_LABELS[row.consentType]}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${ACTION_COLOURS[row.action]}`}>
                            {row.action}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground font-mono text-xs">{row.version || "—"}</td>
                        <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap text-xs">
                          {new Date(row.createdAt).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", hour12: false })}
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground font-mono text-xs hidden md:table-cell">
                          {row.ipAddress ?? "—"}
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs hidden lg:table-cell max-w-[200px] truncate" title={row.userAgent ?? ""}>
                          {row.userAgent ? row.userAgent.slice(0, 60) + (row.userAgent.length > 60 ? "…" : "") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {rows && rows.length > 0 && (
          <Card className="border-border/60 bg-background/60 ">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {isAf ? "Laaste rekord metadata" : "Latest Record Metadata"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-muted-foreground font-mono bg-muted/20 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(rows[0].metadata, null, 2) ?? "null"}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
