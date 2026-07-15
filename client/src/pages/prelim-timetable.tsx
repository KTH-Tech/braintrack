import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowLeft, Clock, GraduationCap, CalendarDays,
  AlertCircle, Zap, Star, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainTrackLogo } from "@/components/braintrack-logo";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExamSlot {
  subjectName: string;
  subjectNameAf: string;
  paperNumber: number | null;
  durationMinutes: number;
  badge?: string;
  isCorrection?: boolean;
}

interface DaySchedule {
  date: string;
  session1: ExamSlot[];
  session2: ExamSlot[];
}

interface WeekData {
  label: string;
  range: string;
  rangeAf: string;
  days: DaySchedule[];
}

interface PATDate {
  date: string;
  description: string;
  descriptionAf: string;
  time: string;
  isBackup?: boolean;
}

// ─── SACAI 2026 Preliminary Exam Timetable ───────────────────────────────────
// Source: 2026 FINAL PRELIMINARY EXAMINATION TIMETABLE: GR 12 (SACAI)

const WEEKS: WeekData[] = [
  {
    label: "Week 1",
    range: "17–21 Aug 2026",
    rangeAf: "17–21 Aug 2026",
    days: [
      {
        date: "2026-08-17",
        session1: [{ subjectName: "Computer Applications Technology", subjectNameAf: "Rekenaartoepassingstegnologie", paperNumber: 1, durationMinutes: 180, badge: "PRACTICAL" }],
        session2: [{ subjectName: "Information Technology", subjectNameAf: "Inligtingstegnologie", paperNumber: 1, durationMinutes: 180, badge: "PRACTICAL" }],
      },
      {
        date: "2026-08-18",
        session1: [
          { subjectName: "Afrikaans Home Language", subjectNameAf: "Afrikaans Huistaal", paperNumber: 3, durationMinutes: 180 },
          { subjectName: "Afrikaans First Additional Language", subjectNameAf: "Afrikaans Eerste Addisionele Taal", paperNumber: 3, durationMinutes: 150 },
        ],
        session2: [{ subjectName: "Tourism", subjectNameAf: "Toerisme", paperNumber: 1, durationMinutes: 180 }],
      },
      {
        date: "2026-08-19",
        session1: [{ subjectName: "Business Studies", subjectNameAf: "Besigheidstudies", paperNumber: 1, durationMinutes: 120 }],
        session2: [{ subjectName: "Geography", subjectNameAf: "Geografie", paperNumber: 1, durationMinutes: 180 }],
      },
      {
        date: "2026-08-20",
        session1: [
          { subjectName: "English Home Language", subjectNameAf: "Engels Huistaal", paperNumber: 3, durationMinutes: 180 },
          { subjectName: "English First Additional Language", subjectNameAf: "Engels Eerste Addisionele Taal", paperNumber: 3, durationMinutes: 150 },
        ],
        session2: [{ subjectName: "Computer Applications Technology", subjectNameAf: "Rekenaartoepassingstegnologie", paperNumber: 2, durationMinutes: 180, badge: "THEORY" }],
      },
      {
        date: "2026-08-21",
        session1: [{ subjectName: "Physical Sciences", subjectNameAf: "Fisiese Wetenskappe", paperNumber: 1, durationMinutes: 180 }],
        session2: [],
      },
    ],
  },
  {
    label: "Week 2",
    range: "24–28 Aug 2026",
    rangeAf: "24–28 Aug 2026",
    days: [
      {
        date: "2026-08-24",
        session1: [{ subjectName: "Physical Sciences", subjectNameAf: "Fisiese Wetenskappe", paperNumber: 2, durationMinutes: 180 }],
        session2: [{ subjectName: "History", subjectNameAf: "Geskiedenis", paperNumber: 1, durationMinutes: 180 }],
      },
      {
        date: "2026-08-25",
        session1: [{ subjectName: "Information Technology", subjectNameAf: "Inligtingstegnologie", paperNumber: 2, durationMinutes: 180, badge: "THEORY" }],
        session2: [
          { subjectName: "English Home Language", subjectNameAf: "Engels Huistaal", paperNumber: 1, durationMinutes: 120, isCorrection: true },
          { subjectName: "English First Additional Language", subjectNameAf: "Engels Eerste Addisionele Taal", paperNumber: 1, durationMinutes: 120, isCorrection: true },
        ],
      },
      {
        date: "2026-08-26",
        session1: [{ subjectName: "Economics", subjectNameAf: "Ekonomie", paperNumber: 1, durationMinutes: 120 }],
        session2: [
          { subjectName: "Consumer Studies", subjectNameAf: "Verbruikerstudies", paperNumber: 1, durationMinutes: 180 },
          { subjectName: "Hospitality Studies", subjectNameAf: "Gasvryheidstudie", paperNumber: 1, durationMinutes: 180 },
        ],
      },
      {
        date: "2026-08-27",
        session1: [{ subjectName: "Life Orientation", subjectNameAf: "Lewensoriëntering", paperNumber: 1, durationMinutes: 150 }],
        session2: [],
      },
      {
        date: "2026-08-28",
        session1: [
          { subjectName: "Mathematics", subjectNameAf: "Wiskunde", paperNumber: 1, durationMinutes: 180 },
          { subjectName: "Mathematical Literacy", subjectNameAf: "Wiskundige Geletterdheid", paperNumber: 1, durationMinutes: 180 },
        ],
        session2: [],
      },
    ],
  },
  {
    label: "Week 3",
    range: "31 Aug – 4 Sep 2026",
    rangeAf: "31 Aug – 4 Sep 2026",
    days: [
      {
        date: "2026-08-31",
        session1: [
          { subjectName: "Mathematics", subjectNameAf: "Wiskunde", paperNumber: 2, durationMinutes: 180 },
          { subjectName: "Mathematical Literacy", subjectNameAf: "Wiskundige Geletterdheid", paperNumber: 2, durationMinutes: 180 },
        ],
        session2: [{ subjectName: "IsiZulu First Additional Language", subjectNameAf: "IsiZulu Eerste Addisionele Taal", paperNumber: 3, durationMinutes: 150 }],
      },
      {
        date: "2026-09-01",
        session1: [
          { subjectName: "English Home Language", subjectNameAf: "Engels Huistaal", paperNumber: 2, durationMinutes: 150 },
          { subjectName: "English First Additional Language", subjectNameAf: "Engels Eerste Addisionele Taal", paperNumber: 2, durationMinutes: 150 },
        ],
        session2: [],
      },
      {
        date: "2026-09-02",
        session1: [{ subjectName: "Business Studies", subjectNameAf: "Besigheidstudies", paperNumber: 2, durationMinutes: 120 }],
        session2: [{ subjectName: "History", subjectNameAf: "Geskiedenis", paperNumber: 2, durationMinutes: 180 }],
      },
      {
        date: "2026-09-03",
        session1: [
          { subjectName: "Afrikaans Home Language", subjectNameAf: "Afrikaans Huistaal", paperNumber: 1, durationMinutes: 120 },
          { subjectName: "Afrikaans First Additional Language", subjectNameAf: "Afrikaans Eerste Addisionele Taal", paperNumber: 1, durationMinutes: 120 },
        ],
        session2: [{ subjectName: "Accounting", subjectNameAf: "Rekeningkunde", paperNumber: 1, durationMinutes: 120 }],
      },
      {
        date: "2026-09-04",
        session1: [{ subjectName: "Life Sciences", subjectNameAf: "Lewenswetenskappe", paperNumber: 1, durationMinutes: 150 }],
        session2: [],
      },
    ],
  },
  {
    label: "Week 4",
    range: "7–10 Sep 2026",
    rangeAf: "7–10 Sep 2026",
    days: [
      {
        date: "2026-09-07",
        session1: [{ subjectName: "Life Sciences", subjectNameAf: "Lewenswetenskappe", paperNumber: 2, durationMinutes: 150 }],
        session2: [{ subjectName: "IsiZulu First Additional Language", subjectNameAf: "IsiZulu Eerste Addisionele Taal", paperNumber: 1, durationMinutes: 120 }],
      },
      {
        date: "2026-09-08",
        session1: [
          { subjectName: "Afrikaans Home Language", subjectNameAf: "Afrikaans Huistaal", paperNumber: 2, durationMinutes: 150 },
          { subjectName: "Afrikaans First Additional Language", subjectNameAf: "Afrikaans Eerste Addisionele Taal", paperNumber: 2, durationMinutes: 150 },
        ],
        session2: [{ subjectName: "Geography", subjectNameAf: "Geografie", paperNumber: 2, durationMinutes: 180 }],
      },
      {
        date: "2026-09-09",
        session1: [{ subjectName: "Economics", subjectNameAf: "Ekonomie", paperNumber: 2, durationMinutes: 120 }],
        session2: [],
      },
      {
        date: "2026-09-10",
        session1: [{ subjectName: "IsiZulu First Additional Language", subjectNameAf: "IsiZulu Eerste Addisionele Taal", paperNumber: 2, durationMinutes: 150 }],
        session2: [{ subjectName: "Accounting", subjectNameAf: "Rekeningkunde", paperNumber: 2, durationMinutes: 120 }],
      },
    ],
  },
];

const PAT_DATES: PATDate[] = [
  { date: "2026-08-04", description: "Tourism PAT Day 1", descriptionAf: "Toerisme PAT Dag 1", time: "09:00–13:00" },
  { date: "2026-08-05", description: "Tourism PAT Day 2", descriptionAf: "Toerisme PAT Dag 2", time: "09:00–13:00" },
  { date: "2026-08-06", description: "AMP PAT Component 5.3 (Test)", descriptionAf: "AMP PAT Komponent 5.3 (Toets)", time: "09:00–10:30" },
  { date: "2026-09-16", description: "Life Orientation Back-up", descriptionAf: "Lewensoriëntering Rugsteun", time: "09:00–11:00", isBackup: true },
  { date: "2026-09-17", description: "Tourism PAT Back-up Day 1", descriptionAf: "Toerisme PAT Rugsteun Dag 1", time: "09:00–13:00", isBackup: true },
  { date: "2026-09-18", description: "Tourism PAT Back-up Day 2", descriptionAf: "Toerisme PAT Rugsteun Dag 2", time: "09:00–13:00", isBackup: true },
];

const SUBJECT_NEON: Record<string, string> = {
  "Mathematics": "#006BFF",
  "Mathematical Literacy": "#00E5FF",
  "Physical Sciences": "#00E5FF",
  "Life Sciences": "#8A2BFF",
  "Accounting": "#FF2BD6",
  "Business Studies": "#00E5FF",
  "Economics": "#FFE600",
  "Geography": "#00E5FF",
  "History": "#FF8A00",
  "English Home Language": "#FFE600",
  "English First Additional Language": "#FFE600",
  "Afrikaans Home Language": "#FF8A00",
  "Afrikaans First Additional Language": "#FF8A00",
  "Computer Applications Technology": "#00E5FF",
  "Information Technology": "#006BFF",
  "Tourism": "#FF8A00",
  "Consumer Studies": "#8A2BFF",
  "Hospitality Studies": "#8A2BFF",
  "Life Orientation": "#8A2BFF",
  "IsiZulu First Additional Language": "#00E5FF",
};

const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_AF = ["Maa", "Din", "Woe", "Don", "Vry", "Sat", "Son"];
const MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_AF = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

function formatExamDate(dateStr: string, isAf: boolean): { day: string; num: string; month: string } {
  const d = new Date(dateStr + "T00:00:00");
  const dow = d.getDay();
  const dayIdx = dow === 0 ? 6 : dow - 1;
  return {
    day: isAf ? DAY_NAMES_AF[dayIdx] : DAY_NAMES_EN[dayIdx],
    num: String(d.getDate()),
    month: isAf ? MONTH_AF[d.getMonth()] : MONTH_EN[d.getMonth()],
  };
}

function calcDays(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.floor((target.getTime() - now.getTime()) / 86_400_000);
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function durationLabel(mins: number, isAf: boolean): string {
  if (mins % 60 === 0) return `${mins / 60}${isAf ? "u" : "h"}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}${isAf ? "u" : "h"}${m}`;
}

function subjectNeon(name: string): string {
  for (const key of Object.keys(SUBJECT_NEON)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return SUBJECT_NEON[key];
    }
  }
  return "#00E5FF";
}

function isMySubject(name: string, myNames: string[]): boolean {
  const nl = name.toLowerCase();
  return myNames.some(
    (m) => nl.includes(m.toLowerCase()) || m.toLowerCase().includes(nl) || nl === m.toLowerCase(),
  );
}

function CountdownBadge({ days, isAf }: { days: number; isAf: boolean }) {
  if (days < 0) {
    return (
      <span style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "1px 5px" }}>
        {isAf ? "Verby" : "Past"}
      </span>
    );
  }
  if (days === 0) {
    return (
      <span style={{ fontSize: 9, fontWeight: 900, color: "#FF8A00", background: "rgba(255,138,0,0.18)", borderRadius: 4, padding: "1px 6px", textShadow: "0 0 8px rgba(255,138,0,0.8)" }}>
        {isAf ? "VANDAG" : "TODAY"}
      </span>
    );
  }
  const color = days <= 7 ? "#FF2BD6" : days <= 21 ? "#FF8A00" : days <= 60 ? "#FFE600" : "#00E5FF";
  return (
    <span style={{ fontSize: 9, fontWeight: 800, color, background: `${color}18`, borderRadius: 4, padding: "1px 5px" }}>
      {days}d
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PrelimTimetablePage() {
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  const [activeWeek, setActiveWeek] = useState(0);
  const [mySubjectsOnly, setMySubjectsOnly] = useState(false);

  const today = todayStr();

  const { data: profile } = useQuery<any>({ queryKey: ["/api/user/onboarding"], retry: false });
  const { data: subjectsData } = useQuery<any[]>({ queryKey: ["/api/subjects"], retry: false });

  const mySubjectNames: string[] = useMemo(() => {
    const selectedIds: number[] = profile?.selectedSubjects || [];
    if (!selectedIds.length || !subjectsData?.length) return [];
    return subjectsData
      .filter((s: any) => selectedIds.includes(s.id))
      .map((s: any) => s.name as string);
  }, [profile, subjectsData]);

  const currentWeek = WEEKS[activeWeek];

  const filteredDays = useMemo(() => {
    if (!mySubjectsOnly || !mySubjectNames.length) return currentWeek.days;
    return currentWeek.days.map((day) => ({
      ...day,
      session1: day.session1.filter((e) => isMySubject(e.subjectName, mySubjectNames)),
      session2: day.session2.filter((e) => isMySubject(e.subjectName, mySubjectNames)),
    })).filter((d) => d.session1.length > 0 || d.session2.length > 0);
  }, [currentWeek, mySubjectsOnly, mySubjectNames]);

  function autoWeek() {
    const now = todayStr();
    for (let i = 0; i < WEEKS.length; i++) {
      const days = WEEKS[i].days;
      const last = days[days.length - 1].date;
      if (now <= last) return i;
    }
    return WEEKS.length - 1;
  }

  return (
    <div className="min-h-screen" style={{ background: "#000" }}>
      {/* Space background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,229,255,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 45% at 85% 85%, rgba(138,43,255,0.12) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 30% at 15% 90%, rgba(255,43,214,0.08) 0%, transparent 60%)" }} />
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Nav bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/study-calendar">
              <Button size="sm" variant="ghost" className="gap-1.5 text-white/70 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4" />
                {isAf ? "Terug" : "Back"}
              </Button>
            </Link>
            <BrainTrackLogo className="h-7 w-auto" />
          </div>
          <Button
            size="sm" variant="ghost"
            className="text-[11px] font-black uppercase tracking-widest hover:bg-white/10"
            style={{ color: "#00E5FF" }}
            onClick={toggleLanguage}
          >
            {isAf ? "EN" : "AF"}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ border: "1px solid rgba(0,229,255,0.5)", color: "#00E5FF" }}>
            <GraduationCap className="w-3.5 h-3.5" />
            {isAf ? "VOOREKSAMENSKEDULE" : "PRELIMINARY EXAM TIMETABLE"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {isAf ? (
              <>Graad 12 <span style={{ background: "linear-gradient(90deg,#00E5FF,#8A2BFF,#FF2BD6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>Vooreksamen 2026</span></>
            ) : (
              <>Grade 12 <span style={{ background: "linear-gradient(90deg,#00E5FF,#8A2BFF,#FF2BD6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>Prelims 2026</span></>
            )}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            {isAf ? "SACAI — Augustus/September 2026 · Registrasienr. 2011/100445/08" : "SACAI — August/September 2026 · Registration No. 2011/100445/08"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Week tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {WEEKS.map((w, i) => {
              const active = activeWeek === i;
              const isCurrent = autoWeek() === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveWeek(i)}
                  className="relative px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all"
                  style={active
                    ? { background: "rgba(0,229,255,0.18)", border: "1px solid rgba(0,229,255,0.6)", color: "#00E5FF", boxShadow: "0 0 12px rgba(0,229,255,0.25)" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }
                  }
                >
                  {w.label}
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: "#00E5FF", boxShadow: "0 0 6px #00E5FF" }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* My subjects toggle */}
          {mySubjectNames.length > 0 && (
            <button
              onClick={() => setMySubjectsOnly((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all"
              style={mySubjectsOnly
                ? { background: "rgba(255,43,214,0.18)", border: "1px solid rgba(255,43,214,0.6)", color: "#FF2BD6", boxShadow: "0 0 10px rgba(255,43,214,0.2)" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }
              }
            >
              <Star className="w-3 h-3" />
              {isAf ? "My Vakke" : "My Subjects"}
            </button>
          )}
        </div>

        {/* Week range label */}
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
          <CalendarDays className="w-4 h-4" style={{ color: "#00E5FF" }} />
          {isAf ? currentWeek.rangeAf : currentWeek.range}
        </div>

        {/* Days grid */}
        <div className="space-y-4">
          {filteredDays.map((day) => {
            const { day: dayName, num, month } = formatExamDate(day.date, isAf);
            const daysLeft = calcDays(day.date);
            const isToday = day.date === today;
            const isPast = daysLeft < 0;
            const hasExams = day.session1.length > 0 || day.session2.length > 0;

            return (
              <div
                key={day.date}
                style={{
                  borderRadius: 16,
                  border: isToday
                    ? "1.5px solid rgba(255,138,0,0.7)"
                    : isPast
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "1px solid rgba(255,255,255,0.12)",
                  background: isToday
                    ? "rgba(255,138,0,0.06)"
                    : isPast
                      ? "rgba(0,0,0,0.4)"
                      : "rgba(0,0,0,0.55)",
                  boxShadow: isToday ? "0 0 20px rgba(255,138,0,0.15)" : undefined,
                  opacity: isPast ? 0.55 : 1,
                }}
              >
                {/* Day header */}
                <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: isToday ? "rgba(255,138,0,0.22)" : "rgba(255,255,255,0.06)",
                        border: isToday ? "1px solid rgba(255,138,0,0.55)" : "1px solid rgba(255,255,255,0.10)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: 9, fontWeight: 800, color: isToday ? "#FF8A00" : "rgba(255,255,255,0.45)", lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>{dayName}</span>
                      <span style={{ fontSize: 17, fontWeight: 900, color: isToday ? "#FF8A00" : "rgba(255,255,255,0.85)", lineHeight: 1.1 }}>{num}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: isToday ? "#FF8A00" : "rgba(255,255,255,0.4)", lineHeight: 1 }}>{month}</span>
                    </div>
                    <div>
                      {isToday && (
                        <span className="text-[10px] font-black uppercase tracking-widest mr-2" style={{ color: "#FF8A00" }}>
                          {isAf ? "VANDAG" : "TODAY"}
                        </span>
                      )}
                      {!hasExams && (
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {isAf ? "Geen eksamens" : "No exams"}
                        </span>
                      )}
                    </div>
                  </div>
                  <CountdownBadge days={daysLeft} isAf={isAf} />
                </div>

                {/* Sessions */}
                {hasExams && (
                  <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x" style={{ "--tw-divide-opacity": 1, borderColor: "rgba(255,255,255,0.08)" } as any}>
                    <SessionColumn
                      time="09:00"
                      slots={day.session1}
                      isAf={isAf}
                      mySubjectNames={mySubjectNames}
                      isPast={isPast}
                    />
                    <SessionColumn
                      time="14:00"
                      slots={day.session2}
                      isAf={isAf}
                      mySubjectNames={mySubjectNames}
                      isPast={isPast}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Week navigation */}
        <div className="flex justify-between items-center pt-2">
          <Button
            size="sm" variant="ghost"
            className="gap-1.5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
            disabled={activeWeek === 0}
            onClick={() => setActiveWeek((w) => Math.max(0, w - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            {isAf ? "Vorige week" : "Prev week"}
          </Button>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
            {activeWeek + 1} / {WEEKS.length}
          </span>
          <Button
            size="sm" variant="ghost"
            className="gap-1.5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
            disabled={activeWeek === WEEKS.length - 1}
            onClick={() => setActiveWeek((w) => Math.min(WEEKS.length - 1, w + 1))}
          >
            {isAf ? "Volgende week" : "Next week"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* PAT / Special Dates */}
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,230,0,0.35)",
            background: "rgba(255,230,0,0.04)",
            boxShadow: "0 0 18px rgba(255,230,0,0.08)",
          }}
        >
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,230,0,0.15)" }}>
            <AlertCircle className="w-4 h-4" style={{ color: "#FFE600" }} />
            <span className="text-sm font-black uppercase tracking-wider" style={{ color: "#FFE600" }}>
              {isAf ? "Spesiale Datums & PAT" : "Special Dates & PAT"}
            </span>
          </div>
          <div className="p-4 space-y-2">
            {PAT_DATES.map((p) => {
              const daysLeft = calcDays(p.date);
              const { day: dayName, num, month } = formatExamDate(p.date, isAf);
              return (
                <div key={p.date} className="flex items-center gap-3 py-1.5">
                  <span className="text-[11px] font-bold tabular-nums w-24 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {dayName} {num} {month}
                  </span>
                  <span className="text-xs font-medium flex-1" style={{ color: p.isBackup ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.8)" }}>
                    {isAf ? p.descriptionAf : p.description}
                    {p.isBackup && (
                      <span className="ml-1.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                        {isAf ? "rugsteun" : "back-up"}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-bold shrink-0" style={{ color: "rgba(255,230,0,0.7)" }}>
                    {p.time}
                  </span>
                  <CountdownBadge days={daysLeft} isAf={isAf} />
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-3">
            <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
              {isAf
                ? "* Geldige rede benodig vir rugsteungeleenthede. Verwys na SBA-beleid 8.1."
                : "* A valid reason must be presented to qualify for back-up opportunities. Refer to SBA policy (8.1)."}
            </p>
          </div>
        </div>

        {/* Correction note */}
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs"
          style={{ background: "rgba(255,138,0,0.07)", border: "1px solid rgba(255,138,0,0.3)", color: "rgba(255,255,255,0.65)" }}>
          <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#FF8A00" }} />
          <span>
            {isAf
              ? "Korreksies: Engels HT V1 (2hr) en Engels EAT V1 (2hr) op 25 Aug 2026 is amptelike korreksies in die SACAI-rooster."
              : "Corrections: English HL P1 (2h) and English FAL P1 (2h) on 25 Aug 2026 are official corrections in the SACAI timetable."}
          </span>
        </div>

        <footer className="pt-4 text-center text-[10px]" style={{ color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {isAf ? "Bron: SACAI 2026 Finale Voorbereidende Eksamenrooster · Gr 12" : "Source: SACAI 2026 Final Preliminary Examination Timetable · Gr 12"}
          <br />
          {isAf ? "Kontak: info@sacai.org.za" : "Contact: info@sacai.org.za"}
        </footer>
      </main>
    </div>
  );
}

// ─── Session column ───────────────────────────────────────────────────────────

function SessionColumn({
  time, slots, isAf, mySubjectNames, isPast,
}: {
  time: string;
  slots: ExamSlot[];
  isAf: boolean;
  mySubjectNames: string[];
  isPast: boolean;
}) {
  const hasSlots = slots.length > 0;

  return (
    <div className="p-4 space-y-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Clock className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          {time}
        </span>
      </div>
      {!hasSlots ? (
        <p className="text-[11px] italic" style={{ color: "rgba(255,255,255,0.2)" }}>
          —
        </p>
      ) : (
        slots.map((slot, idx) => {
          const neon = subjectNeon(slot.subjectName);
          const isMatch = mySubjectNames.length > 0 && isMySubject(slot.subjectName, mySubjectNames);
          const displayName = isAf ? slot.subjectNameAf : slot.subjectName;
          const shortName = displayName.length > 32 ? displayName.slice(0, 30) + "…" : displayName;

          return (
            <div
              key={idx}
              style={{
                borderRadius: 10,
                padding: "8px 10px",
                background: isMatch ? `${neon}1a` : "rgba(255,255,255,0.04)",
                border: isMatch
                  ? `1px solid ${neon}66`
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isMatch ? `0 0 12px ${neon}22` : undefined,
                opacity: isPast ? 0.7 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-bold leading-tight"
                    style={{ color: isMatch ? neon : "rgba(255,255,255,0.82)" }}
                    title={displayName}
                  >
                    {shortName}
                    {isMatch && <span className="ml-1.5" style={{ color: neon, fontSize: 8 }}>★</span>}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {slot.paperNumber ? `P${slot.paperNumber} · ` : ""}
                    {durationLabel(slot.durationMinutes, isAf)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {slot.badge && (
                    <span
                      className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        background: slot.badge === "PRACTICAL" ? "rgba(138,43,255,0.2)" : "rgba(0,229,255,0.15)",
                        color: slot.badge === "PRACTICAL" ? "#8A2BFF" : "#00E5FF",
                        border: `1px solid ${slot.badge === "PRACTICAL" ? "rgba(138,43,255,0.4)" : "rgba(0,229,255,0.3)"}`,
                      }}
                    >
                      {slot.badge}
                    </span>
                  )}
                  {slot.isCorrection && (
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(255,138,0,0.18)", color: "#FF8A00", border: "1px solid rgba(255,138,0,0.4)" }}>
                      {isAf ? "KORR" : "CORR"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
