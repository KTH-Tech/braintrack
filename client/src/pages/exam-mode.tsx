import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  ChevronRight,
  LogOut,
  Shield,
  Star,
  Target,
  TrendingUp,
  Flame,
  Zap,
  GraduationCap,
  Clock,
  Sparkles,
  AlertCircle,
  BarChart2,
  ShieldCheck,
  Trophy,
  Home,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useMemo } from "react";
import type { Subject, OnboardingResult } from "@shared/schema";
import { useLanguage } from "@/lib/language-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Languages } from "lucide-react";
import { getSubjectIcon, STATUS_ICONS } from "@/lib/vark";

interface SubjectMastery {
  subjectId: number;
  totalMastery: number;
  overallBand: string;
  topics: {
    id: number;
    name: string;
    nameAfrikaans: string | null;
    masteryScore: number;
    masteryBand: string;
    questionsAttempted: number;
  }[];
  progress: {
    papersCompleted: number;
    questionsAttempted: number;
    correctAnswers: number;
    accuracy: number;
  };
}

interface DbeAvailableSubject {
  subject: string;
  papers: { subject: string; year: number; paperNumber: number; session: string; questionCount: number; totalMarks: number }[];
}

const DBE_NAME_TO_CODE: Record<string, string> = {
  "Afrikaans FAL": "AFRF",
  "Afrikaans First Additional Language": "AFRF",
  "Afrikaans FAL ": "AFRF",
  "Afrikaans Home Language": "AFRH",
  "English FAL": "ENGF",
  "English First Additional Language": "ENGF",
  "English Home Language": "ENGH",
  "Business Studies": "BUS",
  "Mathematics": "MATH",
  "Mathematical Literacy": "MATL",
  "Physical Sciences": "PHYS",
  "Life Sciences": "LIFE",
  "Accounting": "ACC",
  "Geography": "GEO",
  "History": "HIS",
  "Economics": "ECO",
  "Tourism": "TOUR",
  "Computer Applications Technology": "CAT",
  "Information Technology": "IT",
  "Consumer Studies": "CON",
  "Agricultural Sciences": "AGR",
  "Engineering Graphics and Design": "EGD",
  "Visual Arts": "ART",
};

const EXAM_CONFIG: Record<string, {
  papers: { id: string; name: string; nameAf: string; totalMarks: number; duration: number; sections: string }[];
  active: boolean;
  route: string;
}> = {
  BUS: {
    papers: [
      { id: "bst-p1", name: "Paper 1 - Business Environments, Operations, Ventures", nameAf: "Vraestel 1 - Sakeomgewings, Bedrywighede, Ondernemings", totalMarks: 150, duration: 180, sections: "A: MCQ (40) | B: Case Studies (80) | C: Essay (30)" },
      { id: "bst-p2", name: "Paper 2 - Business Roles & Operations", nameAf: "Vraestel 2 - Sakerolle & Bedrywighede", totalMarks: 150, duration: 180, sections: "A: MCQ (40) | B: Case Studies (80) | C: Essay (30)" },
      { id: "bst-p3", name: "Paper 3 - Integrated Topics", nameAf: "Vraestel 3 - Ge\u00EFntegreerde Onderwerpe", totalMarks: 100, duration: 120, sections: "A: MCQ (30) | B: Case Studies (50) | C: Essay (20)" },
    ],
    active: true,
    route: "/bst-exam",
  },
  MAT: {
    papers: [
      { id: "mat-p1", name: "Paper 1 - Algebra, Calculus, Probability", nameAf: "Vraestel 1 - Algebra, Calculus, Waarskynlikheid", totalMarks: 150, duration: 180, sections: "10 Questions (150 marks)" },
      { id: "mat-p2", name: "Paper 2 - Geometry, Trigonometry, Statistics", nameAf: "Vraestel 2 - Meetkunde, Trigonometrie, Statistiek", totalMarks: 150, duration: 180, sections: "10 Questions (150 marks)" },
    ],
    active: true,
    route: "/exam-session",
  },
  ENG: {
    papers: [
      { id: "eng-p1", name: "Paper 1 - Language in Context", nameAf: "Vraestel 1 - Taal in Konteks", totalMarks: 80, duration: 120, sections: "Comprehension | Summary | Language" },
      { id: "eng-p2", name: "Paper 2 - Literature", nameAf: "Vraestel 2 - Letterkunde", totalMarks: 80, duration: 120, sections: "Novel | Drama | Poetry" },
      { id: "eng-p3", name: "Paper 3 - Writing", nameAf: "Vraestel 3 - Skryfwerk", totalMarks: 100, duration: 150, sections: "Essays | Transactional Writing" },
    ],
    active: true,
    route: "/exam-session",
  },
  AFR: {
    papers: [
      { id: "afr-p1", name: "Paper 1 - Taal in Konteks", nameAf: "Vraestel 1 - Taal in Konteks", totalMarks: 80, duration: 120, sections: "Begrip | Opsomming | Taal" },
      { id: "afr-p2", name: "Paper 2 - Letterkunde", nameAf: "Vraestel 2 - Letterkunde", totalMarks: 80, duration: 120, sections: "Roman | Drama | Po\u00EBsie" },
      { id: "afr-p3", name: "Paper 3 - Skryfwerk", nameAf: "Vraestel 3 - Skryfwerk", totalMarks: 100, duration: 150, sections: "Opstelle | Transaksionele Skryfwerk" },
    ],
    active: true,
    route: "/exam-session",
  },
  PHY: {
    papers: [
      { id: "phy-p1", name: "Paper 1 - Mechanics, Waves, Electricity", nameAf: "Vraestel 1 - Meganika, Golwe, Elektrisiteit", totalMarks: 150, duration: 180, sections: "10 Questions (150 marks)" },
      { id: "phy-p2", name: "Paper 2 - Chemistry", nameAf: "Vraestel 2 - Chemie", totalMarks: 150, duration: 180, sections: "10 Questions (150 marks)" },
    ],
    active: true,
    route: "/exam-session",
  },
  LIF: {
    papers: [
      { id: "lif-p1", name: "Paper 1 - Life at Molecular, Cell, Tissue & Organ Level", nameAf: "Vraestel 1 - Lewe op Molekul\u00EAre, Sel, Weefsel & Orgaanvlak", totalMarks: 150, duration: 150, sections: "4 Questions (150 marks)" },
      { id: "lif-p2", name: "Paper 2 - Life Processes, Diversity, Environmental Studies", nameAf: "Vraestel 2 - Lewensprosesse, Diversiteit, Omgewingstudies", totalMarks: 150, duration: 150, sections: "4 Questions (150 marks)" },
    ],
    active: true,
    route: "/exam-session",
  },
  ACC: {
    papers: [
      { id: "acc-p1", name: "Paper 1 - Financial Accounting", nameAf: "Vraestel 1 - Financi\u00EBle Rekeningkunde", totalMarks: 150, duration: 180, sections: "Financial Statements | Analysis | Ethics" },
      { id: "acc-p2", name: "Paper 2 - Managerial Accounting", nameAf: "Vraestel 2 - Bestuursrekeningkunde", totalMarks: 150, duration: 120, sections: "Cost Accounting | Budgets" },
    ],
    active: true,
    route: "/exam-session",
  },
  GEO: {
    papers: [
      { id: "geo-p1", name: "Paper 1 - Physical Geography", nameAf: "Vraestel 1 - Fisiese Aardrykskunde", totalMarks: 150, duration: 180, sections: "Climate | Geomorphology | Mapwork" },
      { id: "geo-p2", name: "Paper 2 - Human Geography", nameAf: "Vraestel 2 - Menslike Aardrykskunde", totalMarks: 150, duration: 180, sections: "Rural | Urban | Economic | GIS" },
    ],
    active: true,
    route: "/exam-session",
  },
  HIS: {
    papers: [
      { id: "his-p1", name: "Paper 1 - Source-based", nameAf: "Vraestel 1 - Brongebaseerd", totalMarks: 150, duration: 180, sections: "Source Analysis | Essay" },
      { id: "his-p2", name: "Paper 2 - Essay-based", nameAf: "Vraestel 2 - Opstelgebaseerd", totalMarks: 150, duration: 180, sections: "Extended Writing" },
    ],
    active: true,
    route: "/exam-session",
  },
  ECO: {
    papers: [
      { id: "eco-p1", name: "Paper 1 - Macro & Micro Economics", nameAf: "Vraestel 1 - Makro & Mikro Ekonomie", totalMarks: 150, duration: 180, sections: "Micro (60) | Macro (60) | Essay (30)" },
      { id: "eco-p2", name: "Paper 2 - Economic Pursuits", nameAf: "Vraestel 2 - Ekonomiese Strewes", totalMarks: 150, duration: 180, sections: "Contemporary Issues | Essay" },
    ],
    active: true,
    route: "/exam-session",
  },
  AFRH: {
    papers: [
      { id: "afrh-p1", name: "Paper 1 - Taal in Konteks", nameAf: "Vraestel 1 - Taal in Konteks", totalMarks: 80, duration: 120, sections: "Begrip | Opsomming | Taal" },
      { id: "afrh-p2", name: "Paper 2 - Letterkunde", nameAf: "Vraestel 2 - Letterkunde", totalMarks: 80, duration: 120, sections: "Roman | Drama | Po\u00EBsie" },
      { id: "afrh-p3", name: "Paper 3 - Skryfwerk", nameAf: "Vraestel 3 - Skryfwerk", totalMarks: 100, duration: 150, sections: "Opstelle | Transaksionele Skryfwerk" },
    ],
    active: true,
    route: "/exam-session",
  },
  AFRF: {
    papers: [
      { id: "afrf-p1", name: "Paper 1 - Language in Context", nameAf: "Vraestel 1 - Taal in Konteks", totalMarks: 80, duration: 120, sections: "Comprehension | Summary | Language" },
      { id: "afrf-p2", name: "Paper 2 - Literature", nameAf: "Vraestel 2 - Letterkunde", totalMarks: 70, duration: 120, sections: "Novel | Drama | Poetry" },
      { id: "afrf-p3", name: "Paper 3 - Writing", nameAf: "Vraestel 3 - Skryfwerk", totalMarks: 100, duration: 150, sections: "Essays | Transactional Writing" },
    ],
    active: true,
    route: "/exam-session",
  },
  ENGH: {
    papers: [
      { id: "engh-p1", name: "Paper 1 - Language in Context", nameAf: "Vraestel 1 - Taal in Konteks", totalMarks: 80, duration: 120, sections: "Comprehension | Summary | Language" },
      { id: "engh-p2", name: "Paper 2 - Literature", nameAf: "Vraestel 2 - Letterkunde", totalMarks: 80, duration: 120, sections: "Novel | Drama | Poetry" },
      { id: "engh-p3", name: "Paper 3 - Writing", nameAf: "Vraestel 3 - Skryfwerk", totalMarks: 100, duration: 150, sections: "Essays | Transactional Writing" },
    ],
    active: true,
    route: "/exam-session",
  },
  ENGF: {
    papers: [
      { id: "engf-p1", name: "Paper 1 - Language in Context", nameAf: "Vraestel 1 - Taal in Konteks", totalMarks: 80, duration: 120, sections: "Comprehension | Summary | Language" },
      { id: "engf-p2", name: "Paper 2 - Literature", nameAf: "Vraestel 2 - Letterkunde", totalMarks: 70, duration: 120, sections: "Novel | Short Stories | Poetry" },
      { id: "engf-p3", name: "Paper 3 - Writing", nameAf: "Vraestel 3 - Skryfwerk", totalMarks: 100, duration: 150, sections: "Essays | Transactional Writing" },
    ],
    active: true,
    route: "/exam-session",
  },
  CON: {
    papers: [
      { id: "con-p1", name: "Paper 1 - Theory", nameAf: "Vraestel 1 - Teorie", totalMarks: 200, duration: 180, sections: "Short Questions | Long Questions | Practical" },
    ],
    active: true,
    route: "/exam-session",
  },
  CAT: {
    papers: [
      { id: "cat-p1", name: "Paper 1 - Theory", nameAf: "Vraestel 1 - Teorie", totalMarks: 150, duration: 180, sections: "Hardware | Software | Networks | Data" },
      { id: "cat-p2", name: "Paper 2 - Practical", nameAf: "Vraestel 2 - Prakties", totalMarks: 150, duration: 180, sections: "Word | Excel | Access | Integration" },
    ],
    active: true,
    route: "/exam-session",
  },
  TOUR: {
    papers: [
      { id: "tour-p1", name: "Paper 1 - Tourism Sectors", nameAf: "Vraestel 1 - Toerismesektore", totalMarks: 200, duration: 180, sections: "Tourism Sectors | Sustainable Tourism | Map Work | Culture" },
    ],
    active: true,
    route: "/exam-session",
  },
  IT: {
    papers: [
      { id: "it-p1", name: "Paper 1 - Theory", nameAf: "Vraestel 1 - Teorie", totalMarks: 150, duration: 180, sections: "Hardware | Networks | Data | Internet" },
      { id: "it-p2", name: "Paper 2 - Practical (Delphi/Java)", nameAf: "Vraestel 2 - Prakties (Delphi/Java)", totalMarks: 150, duration: 180, sections: "Programming | Database | OOP" },
    ],
    active: true,
    route: "/exam-session",
  },
  MATH: {
    papers: [
      { id: "math-p1", name: "Paper 1 - Algebra, Calculus, Probability", nameAf: "Vraestel 1 - Algebra, Calculus, Waarskynlikheid", totalMarks: 150, duration: 180, sections: "10 Questions (150 marks)" },
      { id: "math-p2", name: "Paper 2 - Geometry, Trigonometry, Statistics", nameAf: "Vraestel 2 - Meetkunde, Trigonometrie, Statistiek", totalMarks: 150, duration: 180, sections: "10 Questions (150 marks)" },
    ],
    active: true,
    route: "/exam-session",
  },
  MATL: {
    papers: [
      { id: "matl-p1", name: "Paper 1 - Basic Skills", nameAf: "Vraestel 1 - Basiese Vaardighede", totalMarks: 150, duration: 180, sections: "Finance | Data | Maps | Probability" },
      { id: "matl-p2", name: "Paper 2 - Applications", nameAf: "Vraestel 2 - Toepassings", totalMarks: 150, duration: 180, sections: "Finance | Maps | Data | Probability" },
    ],
    active: true,
    route: "/exam-session",
  },
  PHYS: {
    papers: [
      { id: "phys-p1", name: "Paper 1 - Physics", nameAf: "Vraestel 1 - Fisika", totalMarks: 150, duration: 180, sections: "Mechanics | Waves | Electricity | Magnetism" },
      { id: "phys-p2", name: "Paper 2 - Chemistry", nameAf: "Vraestel 2 - Chemie", totalMarks: 150, duration: 180, sections: "Chemical Change | Chemical Systems | Matter" },
    ],
    active: true,
    route: "/exam-session",
  },
  LIFE: {
    papers: [
      { id: "life-p1", name: "Paper 1 - Molecular, Cell & Organ Level", nameAf: "Vraestel 1 - Molekul\u00EAre, Sel & Orgaanvlak", totalMarks: 150, duration: 150, sections: "4 Questions (150 marks)" },
      { id: "life-p2", name: "Paper 2 - Diversity, Ecology, Environment", nameAf: "Vraestel 2 - Diversiteit, Ekologie, Omgewing", totalMarks: 150, duration: 150, sections: "4 Questions (150 marks)" },
    ],
    active: true,
    route: "/exam-session",
  },
  ART: {
    papers: [
      { id: "art-p1", name: "Paper 1 - Visual Art History", nameAf: "Vraestel 1 - Visuele Kunsgeskiedenis", totalMarks: 100, duration: 180, sections: "Art History | Visual Culture | Analysis" },
    ],
    active: true,
    route: "/exam-session",
  },
  AGR: {
    papers: [
      { id: "agr-p1", name: "Paper 1 - Animal Sciences", nameAf: "Vraestel 1 - Dierwetenskappe", totalMarks: 150, duration: 150, sections: "Animal Nutrition | Breeding | Health" },
      { id: "agr-p2", name: "Paper 2 - Plant & Soil Sciences", nameAf: "Vraestel 2 - Plant- & Grondwetenskappe", totalMarks: 150, duration: 150, sections: "Plant Production | Soil Science" },
    ],
    active: true,
    route: "/exam-session",
  },
  EGD: {
    papers: [
      { id: "egd-p1", name: "Paper 1 - Civil Technology", nameAf: "Vraestel 1 - Siviele Tegnologie", totalMarks: 150, duration: 180, sections: "Working Drawings | Perspectives" },
      { id: "egd-p2", name: "Paper 2 - Mechanical Technology", nameAf: "Vraestel 2 - Meganiese Tegnologie", totalMarks: 150, duration: 180, sections: "Mechanical Drawings | Assembly" },
    ],
    active: true,
    route: "/exam-session",
  },
};

// Canonical rainbow stops for per-card accents
const RAINBOW_ACCENTS: { hex: string; halo: string }[] = [
  { hex: "#FFC48F", halo: "rgba(255,196,143,0.32)" },
  { hex: "#FFF29E", halo: "rgba(255,242,158,0.32)" },
  { hex: "#FFF29E", halo: "rgba(255,242,158,0.32)" },
  { hex: "#7FEFFF", halo: "rgba(127,239,255,0.32)" },
  { hex: "#6FA8FF", halo: "rgba(111,168,255,0.32)" },
  { hex: "#C6A4FF", halo: "rgba(198,164,255,0.32)" },
  { hex: "#C6A4FF", halo: "rgba(198,164,255,0.32)" },
  { hex: "#FF9FE5", halo: "rgba(255,159,229,0.32)" },
];

function getBandHex(band: string): { hex: string; halo: string; label: string } {
  switch (band) {
    case "star":  return { hex: "#FFF29E", halo: "rgba(255,242,158,0.32)",  label: "STAR" };
    case "green": return { hex: "#7FEFFF", halo: "rgba(127,239,255,0.32)",  label: "GREEN" };
    case "amber": return { hex: "#FFC48F", halo: "rgba(255,196,143,0.32)",  label: "AMBER" };
    default:      return { hex: "#FF9FE5", halo: "rgba(255,159,229,0.32)",  label: "RED" };
  }
}

function getBandIcon(band: string, hex: string) {
  const style = { color: hex, filter: `drop-shadow(0 0 6px ${hex})` };
  switch (band) {
    case "star":  return <Trophy className="w-4 h-4" style={style} />;
    case "green": return <ShieldCheck className="w-4 h-4" style={style} />;
    case "amber": return <BarChart2 className="w-4 h-4" style={style} />;
    default:      return <AlertCircle className="w-4 h-4" style={style} />;
  }
}

function getBandLabel(band: string, t: typeof T["en"] | typeof T["af"]) {
  switch (band) {
    case "star": return t.starBand;
    case "green": return t.greenBand;
    case "amber": return t.amberBand;
    default: return t.redBand;
  }
}

function getReadinessScore(mastery: SubjectMastery | undefined): number {
  if (!mastery) return 0;
  const accuracyWeight = mastery.progress.accuracy * 0.4;
  const masteryWeight = mastery.totalMastery * 0.4;
  const activityWeight = Math.min(100, mastery.progress.questionsAttempted * 2) * 0.2;
  return Math.round(accuracyWeight + masteryWeight + activityWeight);
}

function SubjectExamCard({ subject, isAf, t, colorIndex }: { subject: Subject; isAf: boolean; t: typeof T["en"] | typeof T["af"]; colorIndex: number }) {
  const { data: mastery } = useQuery<SubjectMastery>({
    queryKey: ["/api/subjects", subject.id.toString(), "mastery"],
  });

  const examConfig = EXAM_CONFIG[subject.code] || null;
  const isActive = examConfig?.active ?? false;
  const band = mastery?.overallBand || "red";
  const masteryPct = mastery?.totalMastery ?? 0;
  const readiness = getReadinessScore(mastery);
  const accent = RAINBOW_ACCENTS[colorIndex % RAINBOW_ACCENTS.length];
  const bandMeta = getBandHex(band);

  return (
    <div
      className="relative rounded-2xl bg-black p-5 overflow-hidden"
      style={{
        border: `1.5px solid ${accent.hex}`,
        boxShadow: `0 0 0 1px ${accent.halo}, 0 0 22px ${accent.halo}, inset 0 0 18px rgba(0,0,0,0.6)`,
      }}
      data-testid={`subject-card-${subject.code}`}
    >
      {/* Corner brackets */}
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: accent.hex }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: accent.hex }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: accent.hex }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: accent.hex }} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span
            className="w-11 h-11 rounded-xl bg-black flex items-center justify-center shrink-0 text-xl"
            style={{
              border: `1.5px solid ${accent.hex}`,
              boxShadow: `0 0 14px ${accent.halo}, inset 0 0 10px ${accent.halo}`,
            }}
          >
            {getSubjectIcon(subject.name)}
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-white leading-tight truncate" style={{ textShadow: `0 0 10px ${accent.halo}` }}>
              {isAf ? (subject.nameAfrikaans || subject.name) : subject.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white">{subject.code}</span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] bg-black"
                style={{
                  color: isActive ? "#7FEFFF" : "#FFC48F",
                  border: `1px solid ${isActive ? "#7FEFFF" : "#FFC48F"}`,
                  boxShadow: `0 0 8px ${isActive ? "rgba(127,239,255,0.45)" : "rgba(255,196,143,0.4)"}`,
                }}
              >
                {isActive ? t.liveLabel : t.soonLabel}
              </span>
            </div>
          </div>
        </div>
        {mastery && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black shrink-0"
            style={{
              border: `1.5px solid ${bandMeta.hex}`,
              boxShadow: `0 0 12px ${bandMeta.halo}, inset 0 0 8px ${bandMeta.halo}`,
            }}
          >
            {getBandIcon(band, bandMeta.hex)}
            <span className="font-black text-base" style={{ color: bandMeta.hex, textShadow: `0 0 8px ${bandMeta.halo}` }}>
              {masteryPct}%
            </span>
          </div>
        )}
      </div>

      {/* Stat grid */}
      {mastery && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { v: mastery.progress.papersCompleted, k: t.examsAbbr, hex: "#FFC48F" },
            { v: mastery.progress.questionsAttempted, k: t.questionsAbbr, hex: "#FFF29E" },
            { v: `${mastery.progress.accuracy}%`, k: t.accuracyAbbr, hex: "#C6A4FF" },
            { v: `${readiness}%`, k: t.readyAbbr, hex: "#7FEFFF" },
          ].map((s, i) => (
            <div
              key={i}
              className="text-center rounded-xl bg-black py-2"
              style={{ border: `1px solid ${s.hex}55`, boxShadow: `0 0 8px ${s.hex}26` }}
            >
              <p className="text-base font-black" style={{ color: s.hex, textShadow: `0 0 6px ${s.hex}66` }}>{s.v}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white">{s.k}</p>
            </div>
          ))}
        </div>
      )}

      {/* Papers list */}
      {examConfig && (
        <div className="space-y-2 mb-4">
          <p className="text-[9px] font-black text-white uppercase tracking-[0.22em]">
            {t.availablePapers}
          </p>
          {examConfig.papers.map((paper) => (
            <div
              key={paper.id}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black"
              style={{ border: `1px solid ${accent.hex}55` }}
              data-testid={`paper-${paper.id}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">
                  {isAf ? paper.nameAf : paper.name}
                </p>
                <p className="text-[10px] text-white font-medium">
                  {paper.totalMarks} {t.marksUnit} · {paper.duration} min
                </p>
              </div>
              {isActive ? (
                <Link href={examConfig.route === "/bst-exam" ? examConfig.route : `${examConfig.route}?subject=${subject.code}&paper=${paper.id}`} className="shrink-0">
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-[0.14em] bg-black"
                    style={{
                      color: accent.hex,
                      border: `1.5px solid ${accent.hex}`,
                      boxShadow: `0 0 10px ${accent.halo}`,
                      textShadow: `0 0 6px ${accent.halo}`,
                    }}
                    data-testid={`button-start-${paper.id}`}
                  >
                    <Zap className="w-3 h-3" />
                    {t.startBtn}
                  </button>
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.14em] bg-black text-white shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <Clock className="w-3 h-3" />
                  {t.soonLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!examConfig && (
        <div className="text-center py-6 mb-4 rounded-xl bg-black" style={{ border: `1px dashed ${accent.hex}55` }}>
          <Brain className="w-8 h-8 mx-auto mb-2" style={{ color: accent.hex, filter: `drop-shadow(0 0 6px ${accent.halo})` }} />
          <p className="text-xs text-white font-medium">
            {t.comingSoon}
          </p>
        </div>
      )}

      {/* Footer links */}
      <div className="flex gap-2">
        <Link href={`/subject/${subject.id}`} className="flex-1">
          <button
            className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-[0.14em] bg-black text-white hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.22)" }}
            data-testid={`button-view-${subject.code}`}
          >
            <Target className="w-3 h-3" />
            {t.masteryBtn}
          </button>
        </Link>
        <Link href={`/tutor?subject=${subject.id}`} className="flex-1">
          <button
            className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-[0.14em] bg-black text-white hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.22)" }}
            data-testid={`button-tutor-${subject.code}`}
          >
            <Brain className="w-3 h-3" />
            {t.tutorBtn}
          </button>
        </Link>
      </div>
    </div>
  );
}

const T = {
  en: {
    homeLabel: "Home",
    subjectsLabel: "Subjects",
    signOut: "Sign Out",
    pageTitle: "Crunch Time",
    capsLabel: "CAPS Aligned",
    timedScored: "Timed · Scored",
    examSimulation: "Exam Simulation",
    heroHeading: "Exam Mode",
    heroSubtitle: "Past papers, timed practice, and full mock exams — all in one place.",
    examSimSubtitle: "CAPS-aligned simulated mock exams for all your subjects — timed, structured, scored.",
    liveLabel: "Live",
    papersLabel: "Papers",
    miniMock: "Mini Mock",
    fullExam: "Full Exam",
    quickModesLabel: "Quick Modes",
    selectSubjectLabel: "Select a subject to begin",
    startExam: "Start Exam",
    paper: "Paper",
    year: "Year",
    questions: "Questions",
    marks: "Marks",
    noExamsAvailable: "No exams available for this subject yet.",
    available: "Available",
    notAvailable: "Not available",
    loading: "Loading...",
    soonLabel: "Soon",
    examsAbbr: "Exams",
    questionsAbbr: "Qs",
    accuracyAbbr: "Acc",
    readyAbbr: "Ready",
    availablePapers: "Available Papers",
    marksUnit: "marks",
    startBtn: "Start",
    comingSoon: "Exam simulations coming soon",
    masteryBtn: "Mastery",
    tutorBtn: "Tutor",
    miniMockTitle: "Mini Mock",
    miniMockTag: "5–15 questions",
    miniMockSub: "Pick a subject and topic, practise quickly with instant marking.",
    miniMockCta: "Start Mini Mock",
    fullExamTitle: "Full Exam",
    fullExamTag: "Complete DBE paper",
    fullExamSub: "Sit a complete, timed DBE paper — marked just like the real thing.",
    fullExamCta: "Start Full Exam",
    noSubjectsMsg: "No subjects selected",
    noSubjectsDesc: "Complete your profile to select your subjects",
    setupProfileBtn: "Setup Profile",
    starBand: "Star",
    greenBand: "Green",
    amberBand: "Amber",
    redBand: "Red",
    homeTitle: "Home",
    signOutTitle: "Sign Out",
  },
  af: {
    homeLabel: "Tuis",
    subjectsLabel: "Vakke",
    signOut: "Uitteken",
    pageTitle: "Eksamentyd",
    capsLabel: "KABV Belyn",
    timedScored: "Getyd · Gemerk",
    examSimulation: "Eksamen Simulasie",
    examSimSubtitle: "KABV-belynde gesimuleerde proefeksamens vir al jou vakke — getyd, gestruktureerd, gemerk.",
    heroHeading: "Eksamenmode",
    heroSubtitle: "Vorige vraestelle, getyde oefening en volle skyneksamens — alles op een plek.",
    liveLabel: "Lewendig",
    papersLabel: "Vraestelle",
    miniMock: "Mini-Toets",
    fullExam: "Volle Eksamen",
    quickModesLabel: "Vinnige Modes",
    selectSubjectLabel: "Kies 'n vak om te begin",
    startExam: "Begin Eksamen",
    paper: "Vraestel",
    year: "Jaar",
    questions: "Vrae",
    marks: "Punte",
    noExamsAvailable: "Geen eksamens beskikbaar vir hierdie vak nie.",
    available: "Beskikbaar",
    notAvailable: "Nie beskikbaar nie",
    loading: "Laai tans...",
    soonLabel: "Binnekort",
    examsAbbr: "Eks",
    questionsAbbr: "Vrae",
    accuracyAbbr: "Akk",
    readyAbbr: "Gereed",
    availablePapers: "Beskikbare Vraestelle",
    marksUnit: "punte",
    startBtn: "Begin",
    comingSoon: "Eksamen simulasies binnekort beskikbaar",
    masteryBtn: "Bemeester",
    tutorBtn: "Tutor",
    miniMockTitle: "Mini-Toets",
    miniMockTag: "5–15 vrae",
    miniMockSub: "Kies vak, kies onderwerp, oefen vinnig met onmiddellike merk.",
    miniMockCta: "Begin Mini-Toets",
    fullExamTitle: "Volle Eksamen",
    fullExamTag: "Volle DBE-vraestel",
    fullExamSub: "Werk deur 'n volle, getyde DBE-vraestel — gemerk soos die regte ding.",
    fullExamCta: "Begin Volle Eksamen",
    noSubjectsMsg: "Geen vakke gekies nie",
    noSubjectsDesc: "Voltooi jou profiel om jou vakke te kies",
    setupProfileBtn: "Stel Profiel Op",
    starBand: "Ster",
    greenBand: "Groen",
    amberBand: "Amber",
    redBand: "Rooi",
    homeTitle: "Tuis",
    signOutTitle: "Uitteken",
  },
} as const;

export default function ExamModePage() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const t = T[language];

  const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: profile } = useQuery<OnboardingResult>({
    queryKey: ["/api/user/onboarding"],
  });

  const selectedSubjectIds = profile?.selectedSubjects || [];

  const learnerSubjects = useMemo(() => {
    if (!subjects) return [];
    if (selectedSubjectIds.length > 0) {
      return subjects.filter(s => selectedSubjectIds.includes(s.id));
    }
    return subjects;
  }, [subjects, selectedSubjectIds]);

  const liveCount = learnerSubjects.filter((s) => (EXAM_CONFIG[s.code]?.active ?? false)).length;
  const totalPapers = learnerSubjects.reduce(
    (sum, s) => sum + (EXAM_CONFIG[s.code]?.papers.length ?? 0),
    0,
  );

  return (
    <div className="min-h-screen relative bg-black text-white">
      {/* Cosmic wordmark wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 12% 8%,  rgba(255,196,143,0.10) 0%, transparent 60%)," +
            "radial-gradient(ellipse 55% 45% at 88% 6%,  rgba(255,159,229,0.10) 0%, transparent 60%)," +
            "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(127,239,255,0.10) 0%, transparent 65%)," +
            "#000",
        }}
      />
      <div className="relative z-10">
        <header
          className="sticky top-0 z-50 bg-black/80"
          style={{ borderBottom: "1px solid rgba(255,159,229,0.35)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 gap-4">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" style={{ color: "#FF9FE5", filter: "drop-shadow(0 0 4px #FF9FE5)" }} />
                <span className="font-black text-sm uppercase tracking-[0.18em]" style={{ color: "#FF9FE5" }}>
                  {t.pageTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLanguage()}
                  className="text-white font-semibold hover:text-white rounded-2xl"
                  data-testid="button-language-toggle"
                >
                  {isAf ? "AF" : "EN"}
                </Button>
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-white" title={t.homeTitle} data-testid="button-home">
                    <Home className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-white" onClick={() => logout()} data-testid="button-logout" title={t.signOutTitle}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* ═══ Cinematic Hero ═══ */}
          <section
            className="relative overflow-hidden rounded-3xl bg-black p-6 sm:p-10 md:p-12"
            style={{
              border: "1.5px solid #FF9FE5",
              boxShadow:
                "0 0 0 1px rgba(255,159,229,0.32), 0 0 40px rgba(255,159,229,0.42), inset 0 0 32px rgba(0,0,0,0.65)",
            }}
          >
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, #FFC48F, #FFC48F, #FFF29E, #FFF29E, #7FEFFF, #6FA8FF, #C6A4FF, #C6A4FF, #FF9FE5)",
              }}
            />
            <div
              aria-hidden
              className="absolute left-0 right-0 h-px pointer-events-none progress-hero-scan"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #FF9FE5 20%, #C6A4FF 50%, #7FEFFF 80%, transparent)",
                boxShadow: "0 0 14px #FF9FE5, 0 0 28px #C6A4FF",
              }}
            />
            <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,159,229,0.28), transparent 70%)" }} />
            <div aria-hidden className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,196,143,0.22), transparent 70%)" }} />

            <span aria-hidden className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "#FF9FE5" }} />
            <span aria-hidden className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "#FF9FE5" }} />
            <span aria-hidden className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "#FF9FE5" }} />
            <span aria-hidden className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "#FF9FE5" }} />

            <div className="relative text-center space-y-5">
              {/* HUD pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                  style={{ border: "1px solid #FF9FE5", boxShadow: "0 0 14px rgba(255,159,229,0.5)" }}
                >
                  <Flame className="w-3 h-3" style={{ color: "#FF9FE5", filter: "drop-shadow(0 0 4px #FF9FE5)" }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "#FF9FE5" }}>
                    {t.examSimulation}
                  </span>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                  style={{ border: "1px solid rgba(127,239,255,0.65)", boxShadow: "0 0 10px rgba(127,239,255,0.4)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full progress-hero-pulse" style={{ background: "#7FEFFF", boxShadow: "0 0 6px #7FEFFF" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#7FEFFF" }}>
                    {t.capsLabel}
                  </span>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                  style={{ border: "1px solid rgba(255,242,158,0.65)", boxShadow: "0 0 10px rgba(255,242,158,0.4)" }}
                >
                  <AlertCircle className="w-3 h-3" style={{ color: "#FFF29E", filter: "drop-shadow(0 0 4px #FFF29E)" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#FFF29E" }}>
                    {t.timedScored}
                  </span>
                </div>
              </div>

              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.98] max-w-4xl mx-auto"
                style={{
                  background:
                    "linear-gradient(90deg, #FFC48F, #FFC48F, #FFF29E, #FFF29E, #7FEFFF, #6FA8FF, #C6A4FF, #C6A4FF, #FF9FE5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 22px rgba(255,159,229,0.32))",
                }}
                data-testid="text-crunch-time-title"
              >
                {t.pageTitle}
              </h1>
              <p className="text-white max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
                {t.examSimSubtitle}
              </p>

              {/* Stat ticker */}
              <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-1">
                {[
                  { k: t.subjectsLabel, v: learnerSubjects.length, hex: "#7FEFFF" },
                  { k: t.liveLabel, v: liveCount, hex: "#FFF29E" },
                  { k: t.papersLabel, v: totalPapers, hex: "#FF9FE5" },
                ].map(({ k, v, hex }) => (
                  <div
                    key={k}
                    className="rounded-xl bg-black px-3 py-2"
                    style={{ border: `1px solid ${hex}55`, boxShadow: `0 0 10px ${hex}33` }}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">{k}</div>
                    <div className="text-2xl font-black" style={{ color: hex, textShadow: `0 0 8px ${hex}55` }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ Quick Modes — Mini Mock + Full Exam ═══ */}
          <section className="grid sm:grid-cols-2 gap-5" data-testid="section-exam-quick-modes">
            {[
              {
                href: "/exam/mini-mock",
                testid: "tile-mini-mock",
                hex: "#7FEFFF",
                halo: "rgba(127,239,255,",
                icon: <Zap className="w-7 h-7" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 6px rgba(127,239,255,0.6))" }} />,
                title: t.miniMockTitle,
                tag: t.miniMockTag,
                sub: t.miniMockSub,
                cta: t.miniMockCta,
              },
              {
                href: "/exam/full",
                testid: "tile-full-exam",
                hex: "#FF9FE5",
                halo: "rgba(255,159,229,",
                icon: <GraduationCap className="w-7 h-7" style={{ color: "#FF9FE5", filter: "drop-shadow(0 0 6px rgba(255,159,229,0.6))" }} />,
                title: t.fullExamTitle,
                tag: t.fullExamTag,
                sub: t.fullExamSub,
                cta: t.fullExamCta,
              },
            ].map(({ href, testid, hex, halo, icon, title, tag, sub, cta }) => (
              <Link key={href} href={href} className="block h-full" data-testid={testid}>
                <div
                  className="relative h-full rounded-2xl bg-black p-6 overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                  style={{
                    border: `1.5px solid ${hex}`,
                    boxShadow: `0 0 0 1px ${halo}0.22), 0 0 22px ${halo}0.32), inset 0 0 18px rgba(0,0,0,0.55)`,
                  }}
                >
                  <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: hex, boxShadow: `0 0 10px ${halo}0.8)` }} />
                  <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: hex }} />
                  <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: hex }} />
                  <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: hex }} />
                  <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: hex }} />
                  <div className="relative flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center flex-shrink-0"
                      style={{ border: `1.5px solid ${hex}`, boxShadow: `0 0 14px ${halo}0.45), inset 0 0 10px ${halo}0.25)` }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-black text-white leading-tight" style={{ textShadow: `0 0 10px ${halo}0.4)` }}>{title}</h3>
                        <span
                          className="text-[9px] font-black uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-black"
                          style={{ color: hex, border: `1px solid ${hex}`, boxShadow: `0 0 8px ${halo}0.4)` }}
                        >
                          {tag}
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{sub}</p>
                      <div
                        className="mt-3 inline-flex items-center font-black text-xs uppercase tracking-[0.14em] group-hover:translate-x-1 transition-all"
                        style={{ color: hex, textShadow: `0 0 8px ${halo}0.5)` }}
                      >
                        {cta} <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </section>

          {/* ═══ Subjects Grid ═══ */}
          {subjectsLoading ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-80 rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : learnerSubjects.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {learnerSubjects.map((subject, idx) => (
                <SubjectExamCard key={subject.id} subject={subject} isAf={isAf} t={t} colorIndex={idx} />
              ))}
            </div>
          ) : (
            <div
              className="relative rounded-2xl bg-black p-12 text-center overflow-hidden"
              style={{
                border: "1.5px solid #FFC48F",
                boxShadow: "0 0 0 1px rgba(255,196,143,0.28), 0 0 26px rgba(255,196,143,0.35), inset 0 0 18px rgba(0,0,0,0.55)",
              }}
            >
              <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "#FFC48F" }} />
              <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: "#FFC48F" }} />
              <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: "#FFC48F" }} />
              <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#FFC48F" }} />
              <GraduationCap className="w-16 h-16 mx-auto mb-4" style={{ color: "#FFC48F", filter: "drop-shadow(0 0 10px rgba(255,196,143,0.6))" }} />
              <p className="text-xl font-black text-white">
                {t.noSubjectsMsg}
              </p>
              <p className="text-sm text-white mt-2 font-medium">
                {t.noSubjectsDesc}
              </p>
              <Link href="/onboarding">
                <button
                  className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-xl bg-black font-black uppercase tracking-[0.16em] text-sm"
                  style={{
                    color: "#FFC48F",
                    border: "1.5px solid #FFC48F",
                    boxShadow: "0 0 14px rgba(255,196,143,0.5)",
                  }}
                  data-testid="button-setup-profile"
                >
                  {t.setupProfileBtn}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
