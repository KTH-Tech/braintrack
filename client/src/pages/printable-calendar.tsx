import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, ChevronLeft, ChevronRight, Download, Calendar } from "lucide-react";
import { Link } from "wouter";
import brandLogo from "@assets/Logo_01_1779989960628.jpeg";

const NSC_EXAM_DATES_2026 = [
  { date: "2026-10-26", subject: "English HL P1 / FAL P1", time: "09:00" },
  { date: "2026-10-27", subject: "English HL P2 / FAL P2", time: "09:00" },
  { date: "2026-10-28", subject: "Afrikaans HL P1 / FAL P1", time: "09:00" },
  { date: "2026-10-29", subject: "Afrikaans HL P2 / FAL P2", time: "09:00" },
  { date: "2026-10-30", subject: "Mathematics P1", time: "09:00" },
  { date: "2026-11-02", subject: "Mathematics P2", time: "09:00" },
  { date: "2026-11-02", subject: "Mathematical Literacy P1", time: "14:00" },
  { date: "2026-11-03", subject: "Mathematical Literacy P2", time: "09:00" },
  { date: "2026-11-04", subject: "Physical Sciences P1", time: "09:00" },
  { date: "2026-11-05", subject: "Physical Sciences P2", time: "09:00" },
  { date: "2026-11-06", subject: "Life Sciences P1", time: "09:00" },
  { date: "2026-11-09", subject: "Life Sciences P2", time: "09:00" },
  { date: "2026-11-10", subject: "Accounting", time: "09:00" },
  { date: "2026-11-11", subject: "Business Studies", time: "09:00" },
  { date: "2026-11-12", subject: "Economics P1", time: "09:00" },
  { date: "2026-11-13", subject: "Economics P2", time: "09:00" },
  { date: "2026-11-16", subject: "Geography P1", time: "09:00" },
  { date: "2026-11-17", subject: "Geography P2", time: "09:00" },
  { date: "2026-11-18", subject: "History P1", time: "09:00" },
  { date: "2026-11-19", subject: "History P2", time: "09:00" },
  { date: "2026-11-20", subject: "Information Technology P1", time: "09:00" },
  { date: "2026-11-23", subject: "Information Technology P2", time: "09:00" },
  { date: "2026-11-23", subject: "CAT P1", time: "14:00" },
  { date: "2026-11-24", subject: "CAT P2", time: "09:00" },
  { date: "2026-11-25", subject: "Engineering Graphics & Design P1", time: "09:00" },
  { date: "2026-11-26", subject: "Engineering Graphics & Design P2", time: "09:00" },
  { date: "2026-11-27", subject: "Agricultural Sciences P1", time: "09:00" },
  { date: "2026-11-30", subject: "Agricultural Sciences P2", time: "09:00" },
];

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
  const { language, setLanguage } = useLanguage();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9);
  const [viewMode, setViewMode] = useState<"single" | "full">("single");

  const t = {
    en: {
      title: "NSC 2026 Study Calendar",
      subtitle: "Exam dates + Study planning",
      print: "Print",
      download: "Download PDF",
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
      download: "Laai PDF af",
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
          className={`border border-gray-200 dark:border-gray-700 p-1 min-h-[60px] ${
            compact ? "min-h-[40px]" : "min-h-[80px]"
          } ${hasExam ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700" : ""}`}
        >
          <div className={`font-semibold text-sm ${hasExam ? "text-foreground" : ""}`}>
            {day}
          </div>
          {hasExam && !compact && (
            <div className="text-xs text-foreground mt-1">
              {exams.map((e, i) => (
                <div key={i} className="truncate">
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
            <span className="text-muted-foreground text-sm mr-2">{i}.</span>
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
              <span className="text-xs text-muted-foreground w-12">{exam.time}</span>
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

            <Button onClick={handlePrint} data-testid="button-print">
              <Printer className="w-4 h-4 mr-2" />
              {text.print}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 print:p-4">
        <div className="print:block hidden text-center mb-6">
          <img
            src={brandLogo}
            alt="BrainTrack"
            className="print-brand-logo mx-auto mb-3"
            style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
          />
          <h1 className="text-2xl font-semibold">{text.title}</h1>
          <p className="text-muted-foreground">{text.subtitle}</p>
          <p className="text-sm mt-1">www.braintrack.co.za</p>
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
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}
