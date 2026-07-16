import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { BrandThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Users,
  Clock,
  BookOpen,
  Download,
  Printer,
  RefreshCw,
  GraduationCap,
  MapPin,
  Flame,
  BarChart3,
  AlertCircle,
  ShieldCheck,
  Zap,
  Target,
  Globe,
} from "lucide-react";

interface SchoolDashboardData {
  school: {
    id: number;
    name: string;
    province: string | null;
    district: string | null;
  };
  generatedAt: string;
  summary: {
    totalLearners: number;
    activeLearners: number;
    avgSessionSeconds: number;
    totalSessions: number;
    overallAccuracy: number;
    totalAttempts: number;
  };
  subjectEngagement: { subjectName: string; sessionCount: number }[];
  avgScoreBySubject: { subjectName: string; avgScore: number; learnerCount: number }[];
  streakDistribution: { label: string; range: string; count: number }[];
}

const T = {
  en: {
    schoolDashboard: "School Dashboard",
    refresh: "Refresh",
    exportCsv: "Export CSV",
    print: "Print",
    dataGenerated: "Data generated",
    refreshesDaily: "Refreshes daily",
    privacyNotice: (
      <span>
        All data is <strong>aggregated and anonymised</strong>. No individual learner names or
        identifiers are shown. Subject scores are only shown where at least 2 learners have
        data, to prevent re-identification.
      </span>
    ),
    privacyShort: "Aggregated & anonymised â€” no individual learner data",
    totalLearners: "Total Learners",
    activeLearners: "Active This Week",
    overallAccuracy: "Overall Accuracy",
    avgSession: "Avg Session Time",
    studySessions: "Study Sessions",
    attempts: "Total Attempts",
    last30: "Last 30 days",
    keyMetrics: "Key Metrics",
    subjectEngagement: "Subject Engagement",
    subjectEngagementSub: "Sessions per subject",
    avgMastery: "Avg Mastery Score",
    avgMasterySub: "Score by subject",
    streakActivity: "Streak Activity Distribution",
    streakCaption: "Based on current streaks of all learners at this school.",
    noSessions: "No sessions recorded for this school yet.",
    noMastery: "Not enough data. Requires at least 2 learners per subject.",
    sessions: "Sessions",
    avgScore: "Avg score (%)",
    learners: "learners",
    colorLegend: "Colour: green â‰¥75%, amber â‰¥50%, red <50%",
    printFooter: "BrainTrack School Dashboard",
    generated: "Generated",
    printAnon: "All data is anonymised and aggregated. No individual learner data is included.",
    dashboardUnavailable: "Dashboard unavailable",
    couldNotLoad: "Could not load dashboard data.",
    tryAgain: "Try again",
    exportFailed: "Export failed. Please try again.",
    heroEnrolled: "enrolled",
    heroActive: "active this week",
    heroAccuracy: "overall accuracy",
  },
  af: {
    schoolDashboard: "Skool-dashboard",
    refresh: "Verfris",
    exportCsv: "Voer uit",
    print: "Druk",
    dataGenerated: "Data gegenereer",
    refreshesDaily: "Verfris daagliks",
    privacyNotice: (
      <span>
        Alle data is <strong>saamgevoeg en geanonimiseer</strong>. Geen individuele leerder se name
        of identifiseerders word gewys nie. Vaktellings word slegs gewys waar ten minste 2 leerders
        data het, om heridentifikasie te voorkom.
      </span>
    ),
    privacyShort: "Saamgevoeg en geanonimiseer â€” geen individuele leerderdata",
    totalLearners: "Totale Leerders",
    activeLearners: "Aktief Hierdie Week",
    overallAccuracy: "Algehele Akkuraatheid",
    avgSession: "Gem. Sessietyd",
    studySessions: "Studiesessies",
    attempts: "Totale Pogings",
    last30: "Laaste 30 dae",
    keyMetrics: "Sleutelstatistieke",
    subjectEngagement: "Vakbetrokkenheid",
    subjectEngagementSub: "Sessies per vak",
    avgMastery: "Gem. Beheersing",
    avgMasterySub: "Telling per vak",
    streakActivity: "Strekverdeling",
    streakCaption: "Gebaseer op huidige streaks van alle leerders by hierdie skool.",
    noSessions: "Nog geen sessies vir hierdie skool nie.",
    noMastery: "Nie genoeg data nie. Vereis ten minste 2 leerders per vak.",
    sessions: "Sessies",
    avgScore: "Gem. telling (%)",
    learners: "leerders",
    colorLegend: "Kleur: groen â‰¥75%, amber â‰¥50%, rooi <50%",
    printFooter: "BrainTrack Skool-dashboard",
    generated: "Gegenereer",
    printAnon: "Alle data is geanonimiseer en saamgevoeg. Geen individuele leerderdata is ingesluit nie.",
    dashboardUnavailable: "Dashboard nie beskikbaar nie",
    couldNotLoad: "Kon nie data laai nie.",
    tryAgain: "Probeer weer",
    exportFailed: "Uitvoer het misluk. Probeer asseblief weer.",
    heroEnrolled: "ingeskryf",
    heroActive: "aktief hierdie week",
    heroAccuracy: "algehele akkuraatheid",
  },
};

const SUBJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
  "#3b82f6", "#a855f7",
];

const STREAK_COLORS = ["#94a3b8", "#3b82f6", "#6366f1", "#8b5cf6"];

function formatMinutes(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs text-popover-foreground shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.stroke || "currentColor" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function HeroStat({
  icon: Icon,
  value,
  label,
  sub,
  color = "text-primary",
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1 px-4 py-5 sm:py-6">
      <div className={`${color} mb-1`}>
        <Icon className="w-6 h-6 mx-auto" />
      </div>
      <p className="text-3xl sm:text-4xl font-black text-foreground leading-none tabular-nums">
        {value}
      </p>
      <p className="text-xs font-semibold uppercase tracking-widest text-white">{label}</p>
      {sub && <p className="text-[10px] text-white">{sub}</p>}
    </div>
  );
}

function SecondaryMetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="border-border/60 bg-card/60 ">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${color} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-white uppercase tracking-wider font-semibold leading-tight">{label}</p>
            <p className="text-xl font-black text-foreground mt-0.5 leading-none tabular-nums">{value}</p>
            {sub && <p className="text-[10px] text-white mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SchoolDashboardPage() {
  const { user } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const af = language === "af";
  const t = T[af ? "af" : "en"];

  const { data, isLoading, isError, error, refetch, isFetching } =
    useQuery<SchoolDashboardData>({
      queryKey: ["/api/school/dashboard"],
      staleTime: 23 * 60 * 60 * 1000,
      retry: 1,
    });

  const handleExport = async () => {
    try {
      const res = await fetch("/api/school/dashboard/export.csv");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.error) { alert(json.error); return; }
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `braintrack-school-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(t.exportFailed);
    }
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="sticky top-0 z-20 bg-background/80 border-b border-border/60 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-muted" />
              <div className="space-y-1">
                <div className="h-2.5 w-24 rounded bg-muted" />
                <div className="h-4 w-40 rounded bg-muted" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded-md bg-muted" />
              <div className="h-8 w-24 rounded-md bg-muted" />
              <div className="h-8 w-16 rounded-md bg-muted" />
            </div>
          </div>
        </div>
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <div className="h-10 rounded-xl bg-muted/30 border border-border/40" />
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center py-5 gap-2">
                  <div className="w-6 h-6 rounded bg-muted" />
                  <div className="h-9 w-24 rounded bg-muted" />
                  <div className="h-2.5 w-20 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="h-3 w-20 rounded bg-muted mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded bg-muted mt-0.5 shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="h-2 w-full rounded bg-muted" />
                      <div className="h-6 w-3/4 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card/60 p-4 h-[320px]" />
            ))}
          </div>
          <div className="rounded-xl border border-border/60 bg-card/60 h-[260px]" />
        </main>
      </div>
    );
  }

  if (isError) {
    const msg = (error as any)?.message || "";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center rounded-2xl border border-border/60 bg-card/60 p-8">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h1 className="text-xl font-black text-foreground">{t.dashboardUnavailable}</h1>
          <p className="text-sm text-white mt-2">
            {msg || t.couldNotLoad}
          </p>
          <Button className="mt-5" onClick={() => refetch()}>
            {t.tryAgain}
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { school, summary, subjectEngagement, avgScoreBySubject, streakDistribution, generatedAt } = data;
  const generatedDate = new Date(generatedAt).toLocaleString("en-ZA", {
    dateStyle: "long", timeStyle: "short",
  });

  const streakTotal = streakDistribution.reduce((s, b) => s + b.count, 0);

  const chartAxisStyle = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };
  const chartGridColor = "hsl(var(--border))";
  const chartCursorFill = "hsl(var(--muted) / 0.3)";

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-black">

      {/* Aurora gradient background â€” non-print only */}
      <div
        className="fixed inset-0 pointer-events-none print:hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 0%, hsl(var(--primary) / 0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, hsl(var(--accent) / 0.05) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 border-b border-border/60 print:static print:bg-white print:border-black/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <GraduationCap className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                {t.schoolDashboard}
              </p>
              <h1 className="text-base font-black text-foreground truncate leading-tight">{school.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 print:hidden">
            <BrandThemeToggle />
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-xs text-white hover:text-foreground h-8 px-2.5"
              onClick={toggleLanguage}
              aria-label={af ? "Switch to English" : "Skakel na Afrikaans"}
              data-testid="button-language-toggle"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{af ? "EN" : "AF"}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-xs text-white hover:text-foreground h-8 px-2.5"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{t.refresh}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-xs text-white hover:text-foreground h-8 px-2.5"
              onClick={handleExport}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.exportCsv}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-xs text-white hover:text-foreground h-8 px-2.5"
              onClick={handlePrint}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.print}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* School meta row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-white">
          {school.province && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {school.province}{school.district ? `, ${school.district}` : ""}
            </span>
          )}
          <span className="text-white">
            {t.dataGenerated}: {generatedDate}
          </span>
          <span className="text-primary/60 ml-auto print:hidden">{t.refreshesDaily}</span>
        </div>

        {/* Privacy banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground/80">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <span>{t.privacyNotice}</span>
        </div>

        {/* Hero KPIs */}
        <Card className="border-border/60 bg-card/70 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
            <HeroStat
              icon={Users}
              value={summary.totalLearners.toLocaleString()}
              label={t.totalLearners}
              sub={t.heroEnrolled}
              color="text-primary"
            />
            <HeroStat
              icon={Zap}
              value={summary.activeLearners.toLocaleString()}
              label={t.activeLearners}
              sub={t.last30}
              color="text-emerald-500"
            />
            <HeroStat
              icon={Target}
              value={`${summary.overallAccuracy}%`}
              label={t.overallAccuracy}
              sub={t.heroAccuracy}
              color="text-amber-500"
            />
          </div>
        </Card>

        {/* Secondary metric cards */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white mb-3">
            {t.keyMetrics}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SecondaryMetricCard
              icon={Clock}
              label={t.avgSession}
              value={formatMinutes(summary.avgSessionSeconds)}
              color="text-cyan-500"
            />
            <SecondaryMetricCard
              icon={BookOpen}
              label={t.studySessions}
              value={summary.totalSessions.toLocaleString()}
              color="text-violet-500"
            />
            <SecondaryMetricCard
              icon={BarChart3}
              label={t.attempts}
              value={summary.totalAttempts.toLocaleString()}
              color="text-rose-500"
            />
          </div>
        </section>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Engagement */}
          <Card className="border-border/60 bg-card/60 ">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                {t.subjectEngagement}
              </CardTitle>
              <p className="text-[10px] text-white mt-0.5">{t.subjectEngagementSub}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {subjectEngagement.length === 0 ? (
                <div className="flex items-center justify-center h-[280px] text-sm text-white">
                  {t.noSessions}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[300px]">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={subjectEngagement}
                        layout="vertical"
                        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                        <XAxis
                          type="number"
                          tick={chartAxisStyle}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <YAxis
                          dataKey="subjectName"
                          type="category"
                          width={110}
                          tick={chartAxisStyle}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: chartCursorFill }} />
                        <Bar dataKey="sessionCount" name={t.sessions} radius={[0, 4, 4, 0]}>
                          {subjectEngagement.map((_, i) => (
                            <Cell key={i} fill={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Avg Score by Subject */}
          <Card className="border-border/60 bg-card/60 ">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                {t.avgMastery}
              </CardTitle>
              <p className="text-[10px] text-white mt-0.5">{t.avgMasterySub}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {avgScoreBySubject.length === 0 ? (
                <div className="flex items-center justify-center h-[280px] text-sm text-white text-center px-4">
                  {t.noMastery}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[300px]">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={avgScoreBySubject}
                        layout="vertical"
                        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                          tick={chartAxisStyle}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          dataKey="subjectName"
                          type="category"
                          width={110}
                          tick={chartAxisStyle}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          content={<CustomBarTooltip />}
                          cursor={{ fill: chartCursorFill }}
                          formatter={(v: any) => [`${v}%`, t.avgScore]}
                        />
                        <Bar dataKey="avgScore" name={t.avgScore} radius={[0, 4, 4, 0]}>
                          {avgScoreBySubject.map((row, i) => (
                            <Cell
                              key={i}
                              fill={row.avgScore >= 75 ? "#10b981" : row.avgScore >= 50 ? "#f59e0b" : "#ef4444"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-white mt-1 text-right">
                      {t.colorLegend}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Streak Distribution â€” unified panel */}
        <Card className="border-border/60 bg-card/60 ">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 shrink-0" />
              {t.streakActivity}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-5">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Donut */}
              <div className="shrink-0 flex items-center justify-center sm:w-[220px]">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={streakDistribution}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={42}
                      paddingAngle={3}
                    >
                      {streakDistribution.map((_, i) => (
                        <Cell key={i} fill={STREAK_COLORS[i % STREAK_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomBarTooltip />}
                      formatter={(v: any) => [v, t.learners]}
                    />
                    <Legend
                      iconSize={8}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Ranked bars */}
              <div className="flex-1 flex flex-col justify-center gap-3 min-w-0">
                {streakDistribution.map((bucket, i) => {
                  const pct = streakTotal > 0 ? Math.round((bucket.count / streakTotal) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-foreground/80">{bucket.label}</span>
                        <span className="text-white tabular-nums">
                          {bucket.count} {t.learners} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted/40 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: STREAK_COLORS[i % STREAK_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-white mt-1">{t.streakCaption}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-6 border-t border-black/20 text-xs text-black/50 text-center space-y-1">
          <p>{t.printFooter} â€” {school.name}</p>
          <p>
            {t.generated}: {generatedDate} Â· {t.printAnon}
          </p>
          <p>braintrack.co.za</p>
        </div>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:static { position: static !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:text-black { color: black !important; }
          .print\\:border-black\\/20 { border-color: rgba(0,0,0,0.2) !important; }
          body { background: white !important; }
          .recharts-surface text { fill: #333 !important; }
          .recharts-cartesian-grid line { stroke: #e5e7eb !important; }
        }
      `}</style>
    </div>
  );
}
