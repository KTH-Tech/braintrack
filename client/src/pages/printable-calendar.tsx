import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import brandLogo from "@/assets/handoff/icon-transparent.png";

// Exam dates come LIVE from /api/timetable (the verified official DBE
// Oct/Nov 2026 session in the database) — never hardcoded again. A previous
// hardcoded list here carried fabricated dates (Maths P1 was 7 days off).
type PrintableExam = { date: string; subject: string; time: string };
function useOfficialExamDates(): { exams: PrintableExam[]; isLoading: boolean; isError: boolean } {
  const { language } = useLanguage();
  const isAf = language === "af";
  const { data, isLoading, isError } = useQuery<any>({ queryKey: ["/api/timetable"], staleTime: 60 * 60 * 1000 });
  const entries = data?.entries ?? [];
  const exams = entries
    .filter((e: any) => !e.isNonExaminationDay && (e.session === "November" || !e.session))
    .map((e: any) => {
      // AUDIT FIX: subject names were always English — nsc_timetable has no
      // Afrikaans column, so /api/timetable now attaches subjectNameAf via a
      // server-side lookup map. "P" (Paper) becomes "V" (Vraestel) for AF.
      const name = (isAf ? e.subjectNameAf : e.subjectName) ?? e.subjectName ?? e.subject_name ?? "";
      const paperLabel = isAf ? "V" : "P";
      return {
        date: String(e.examDate ?? e.exam_date ?? "").slice(0, 10),
        subject: e.paperNumber ? `${name} ${paperLabel}${e.paperNumber}` : name,
        time: String(e.startTime ?? e.start_time ?? "09:00").slice(0, 5),
      };
    })
    .sort((a: PrintableExam, b: PrintableExam) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return { exams, isLoading, isError };
}

const MONTHS_2026 = [
  { name: "January", nameAf: "Januarie", days: 31, startDay: 4 },
  { name: "February", nameAf: "Februarie", days: 28, startDay: 0 },
  { name: "March", nameAf: "Maart", days: 31, startDay: 0 },
  { name: "April", nameAf: "April", days: 30, startDay: 3 },
  { name: "May", nameAf: "Mei", days: 31, startDay: 5 },
  { name: "June", nameAf: "Junie", days: 30, startDay: 1 },
  { name: "July", nameAf: "Julie", days: 31, startDay: 3 },
  { name: "August", nameAf: "Augustus", days: 31, startDay: 6 },
  { name: "September", nameAf: "September", days: 30, startDay: 2 },
  { name: "October", nameAf: "Oktober", days: 31, startDay: 4 },
  { name: "November", nameAf: "November", days: 30, startDay: 0 },
  { name: "December", nameAf: "Desember", days: 31, startDay: 2 },
];

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_AF = ["Son", "Maa", "Din", "Woe", "Don", "Vry", "Sat"];

export default function PrintableCalendar() {
  // Live official dates (verified against the DBE PDF) — replaces the old
  // fabricated hardcoded list; existing render code keeps its name.
  const { exams: NSC_EXAM_DATES_2026, isLoading: datesLoading, isError: datesError } = useOfficialExamDates();
  const { language, setLanguage } = useLanguage();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9);
  const [viewMode, setViewMode] = useState<"single" | "full">("single");

  useSEO({
    title: "NSC 2026 Exam Timetable & Study Calendar | BrainTrack",
    description:
      "Free printable NSC 2026 exam timetable and Grade 12 study calendar for South African matrics. Official DBE dates, English & Afrikaans.",
    canonical: "https://braintrack.tech/calendar",
    ogTitle: "NSC 2026 Exam Timetable & Printable Study Calendar — BrainTrack",
    ogDescription:
      "Official Grade 12 NSC 2026 exam dates in a printable, month-by-month study planner. Free for South African matrics. EN & AF.",
  });

  const t = {
    en: {
      title: "NSC 2026 Study Calendar",
      subtitle: "Exam dates + Study planning",
      print: "Print",
      examDates: "NSC Exam Dates",
      studyGoals: "My Study Goals",
      weeklyGoals: "Weekly Goals",
      notes: "Notes",
      fullYear: "Full Year",
      monthly: "Monthly View",
      prevMonth: "Previous",
      nextMonth: "Next",
      backToApp: "Back to App",
      examDay: "EXAM",
      weekdays: WEEKDAYS_EN,
      weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
    },
    af: {
      title: "NSC 2026 Studiekalender",
      subtitle: "Eksamen datums + Studeer beplanning",
      print: "Druk",
      examDates: "NSC Eksamen Datums",
      studyGoals: "My Studiedoelwitte",
      weeklyGoals: "Weeklikse Doelwitte",
      notes: "Notas",
      fullYear: "Volle Jaar",
      monthly: "Maandelikse Aansig",
      prevMonth: "Vorige",
      nextMonth: "Volgende",
      backToApp: "Terug na App",
      examDay: "EKSAMEN",
      weekdays: WEEKDAYS_AF,
      weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
    },
  };

  const text = t[language];

  const getExamsForDate = (monthIndex: number, day: number) => {
    const dateStr = `2026-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return NSC_EXAM_DATES_2026.filter((e) => e.date === dateStr);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderMonthCalendar = (monthIndex: number, compact = false) => {
    const month = MONTHS_2026[monthIndex];
    const monthName = language === "af" ? month.nameAf : month.name;
    const days = [];

    for (let i = 0; i < month.startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    for (let day = 1; day <= month.days; day++) {
      const exams = getExamsForDate(monthIndex, day);
      const hasExam = exams.length > 0;

      days.push(
        <div
          key={day}
          className={`border border-gray-200 dark:border-gray-700 p-1 min-h-[60px] min-w-0 overflow-hidden ${
            compact ? "min-h-[40px]" : "min-h-[80px]"
          } ${hasExam ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700" : ""}`}
        >
          <div className={`font-semibold text-sm ${hasExam ? "text-foreground" : ""}`}>
            {day}
          </div>
          {hasExam && !compact && (
            <div className="text-xs text-foreground mt-1 min-w-0">
              {exams.map((e, i) => (
                <div key={i} className="truncate min-w-0">
                  {e.subject}
                </div>
              ))}
            </div>
          )}
          {hasExam && compact && (
            <div className="text-[10px] text-foreground font-semibold">
              {text.examDay}
            </div>
          )}
          {!hasExam && !compact && (
            <div className="h-8 border-b border-dotted border-gray-300 dark:border-gray-600 mt-2" />
          )}
        </div>
      );
    }

    return (
      <div className={`${compact ? "text-xs" : ""}`}>
        <h3 className={`font-semibold text-center mb-2 ${compact ? "text-sm" : "text-lg"}`}>
          {monthName} 2026
        </h3>
        <div className="grid grid-cols-7 gap-0">
          {text.weekdays.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-xs py-1 bg-muted border border-border"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const renderStudyGoalsSection = () => (
    <div className="mt-6 print:mt-4">
      <h3 className="font-semibold text-lg mb-3">{text.studyGoals}</h3>
      <div className="grid gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="border-b border-dotted border-border h-8 flex items-end"
          >
            <span className="text-foreground print:text-black text-sm mr-2">{i}.</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWeeklyGoalsSection = () => (
    <div className="mt-6 print:mt-4">
      <h3 className="font-semibold text-lg mb-3">{text.weeklyGoals}</h3>
      <div className="grid grid-cols-2 gap-4">
        {text.weeks.map((week) => (
          <div key={week} className="border border-gray-300 dark:border-gray-600 p-3 rounded">
            <div className="font-semibold text-sm mb-2">{week}</div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-b border-dotted border-gray-300 dark:border-gray-500 h-5"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotesSection = () => (
    <div className="mt-6 print:mt-4">
      <h3 className="font-semibold text-lg mb-3">{text.notes}</h3>
      <div className="border border-gray-300 dark:border-gray-600 p-4 rounded min-h-[150px]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border-b border-dotted border-gray-300 dark:border-gray-500 h-6"
          />
        ))}
      </div>
    </div>
  );

  const renderExamDatesList = () => (
    <div className="mt-6 print:break-before-page">
      <h3 className="font-semibold text-lg mb-3">{text.examDates}</h3>
      <div className="grid gap-1 text-sm">
        {NSC_EXAM_DATES_2026.map((exam, i) => {
          const date = new Date(exam.date);
          const dayName = language === "af" 
            ? ["Son", "Maa", "Din", "Woe", "Don", "Vry", "Sat"][date.getDay()]
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-1 border-b border-gray-200 dark:border-gray-700"
            >
              <span className="font-mono text-xs w-20">
                {date.getDate()}/{date.getMonth() + 1} {dayName}
              </span>
              <span className="text-xs text-foreground print:text-black w-12">{exam.time}</span>
              <span className="font-medium">{exam.subject}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="print:hidden p-4 border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" data-testid="button-back-dashboard">
                <ChevronLeft className="w-4 h-4 mr-1" />
                {text.backToApp}
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h1 className="font-semibold text-lg">{text.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
              data-testid="button-lang-en"
            >
              English
            </Button>
            <Button
              variant={language === "af" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("af")}
              data-testid="button-lang-af"
            >
              Afrikaans
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <Button
              variant={viewMode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("single")}
              data-testid="button-view-monthly"
            >
              {text.monthly}
            </Button>
            <Button
              variant={viewMode === "full" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("full")}
              data-testid="button-view-full"
            >
              {text.fullYear}
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <Button
              onClick={handlePrint}
              data-testid="button-print"
              disabled={datesLoading || datesError}
              style={{
                background: "linear-gradient(90deg,#FFE29A,#94F7C5,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)",
                color: "#050508",
                fontWeight: 800,
                border: "none",
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              {text.print}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 print:p-4">
        {/* On-screen only: surface timetable query state — printing is disabled
            until the official dates have loaded. */}
        {(datesLoading || datesError) && (
          <div
            className="print:hidden mb-4 rounded-xl border p-3 text-sm font-semibold"
            style={{ borderColor: datesError ? "#FF8DA1" : undefined }}
            data-testid="printable-dates-status"
          >
            {datesError ? (
              <span style={{ color: "#FF8DA1" }}>
                {language === "af"
                  ? "Kon nie die amptelike eksamendatums laai nie — druk is tydelik gedeaktiveer. Herlaai die bladsy om weer te probeer."
                  : "Couldn't load the official exam dates — printing is temporarily disabled. Reload the page to try again."}
              </span>
            ) : (
              <span>
                {language === "af" ? "Laai amptelike eksamendatums…" : "Loading official exam dates…"}
              </span>
            )}
          </div>
        )}
        <div className="print:block hidden text-center mb-6">
          <img
            src={brandLogo}
            alt="BrainTrack"
            className="print-brand-logo mx-auto mb-3"
            style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
          />
          <h1 className="text-2xl font-semibold">{text.title}</h1>
          <p className="text-foreground print:text-black">{text.subtitle}</p>
          <p className="text-sm mt-1">www.braintrack.tech</p>
        </div>

        {viewMode === "single" ? (
          <div>
            <div className="flex items-center justify-between mb-4 print:hidden">
              <Button
                variant="outline"
                onClick={() => setCurrentMonthIndex((i) => Math.max(0, i - 1))}
                disabled={currentMonthIndex === 0}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {text.prevMonth}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentMonthIndex((i) => Math.min(11, i + 1))}
                disabled={currentMonthIndex === 11}
                data-testid="button-next-month"
              >
                {text.nextMonth}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                {renderMonthCalendar(currentMonthIndex)}
                {renderStudyGoalsSection()}
                {renderWeeklyGoalsSection()}
                {renderNotesSection()}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
              {MONTHS_2026.map((_, index) => (
                <Card key={index} className="print:break-inside-avoid">
                  <CardContent className="p-4">
                    {renderMonthCalendar(index, true)}
                  </CardContent>
                </Card>
              ))}
            </div>
            {renderExamDatesList()}
          </div>
        )}

        {viewMode === "single" && (
          <div className="mt-8 print:break-before-page">
            {renderExamDatesList()}
          </div>
        )}
      </div>

      <style>{`
        .print-brand-logo { width: 180px; height: auto; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print-brand-logo { display: block !important; width: 180px; height: auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:break-before-page { break-before: page; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          .print\\:text-black { color: #000 !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}
