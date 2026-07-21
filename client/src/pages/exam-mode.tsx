// BrainTrack Exam Mode hub — restyled to match the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, EXAM MODE section).
// #050508 ground, #0b0b12 accent-bordered cards, Permanent Marker eyebrows,
// aqua→purple gradient action buttons, pure white text. Bilingual EN/AF.
// RESTYLE ONLY — all hooks, queries, config and data-testids preserved.
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  Brain,
  ChevronRight,
  Target,
  Flame,
  Zap,
  GraduationCap,
  Clock,
  AlertCircle,
  BarChart2,
  ShieldCheck,
  Trophy,
  Timer,
} from "lucide-react";
import { useMemo } from "react";
import type { Subject, OnboardingResult } from "@shared/schema";
import { useLanguage } from "@/lib/language-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { LearnerHeader } from "@/components/learner-header";
import { getSubjectIcon } from "@/lib/vark";
import { GraffitiSplats } from "@/components/graffiti-splats";

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
      { id: "bst-p3", name: "Paper 3 - Integrated Topics", nameAf: "Vraestel 3 - Geïntegreerde Onderwerpe", totalMarks: 100, duration: 120, sections: "A: MCQ (30) | B: Case Studies (50) | C: Essay (20)" },
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
      { id: "afr-p2", name: "Paper 2 - Letterkunde", nameAf: "Vraestel 2 - Letterkunde", totalMarks: 80, duration: 120, sections: "Roman | Drama | Poësie" },
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
      { id: "lif-p1", name: "Paper 1 - Life at Molecular, Cell, Tissue & Organ Level", nameAf: "Vraestel 1 - Lewe op Molekulêre, Sel, Weefsel & Orgaanvlak", totalMarks: 150, duration: 150, sections: "4 Questions (150 marks)" },
      { id: "lif-p2", name: "Paper 2 - Life Processes, Diversity, Environmental Studies", nameAf: "Vraestel 2 - Lewensprosesse, Diversiteit, Omgewingstudies", totalMarks: 150, duration: 150, sections: "4 Questions (150 marks)" },
    ],
    active: true,
    route: "/exam-session",
  },
  ACC: {
    papers: [
      { id: "acc-p1", name: "Paper 1 - Financial Accounting", nameAf: "Vraestel 1 - Financiële Rekeningkunde", totalMarks: 150, duration: 180, sections: "Financial Statements | Analysis | Ethics" },
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
      { id: "afrh-p2", name: "Paper 2 - Letterkunde", nameAf: "Vraestel 2 - Letterkunde", totalMarks: 80, duration: 120, sections: "Roman | Drama | Poësie" },
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
      { id: "life-p1", name: "Paper 1 - Molecular, Cell & Organ Level", nameAf: "Vraestel 1 - Molekulêre, Sel & Orgaanvlak", totalMarks: 150, duration: 150, sections: "4 Questions (150 marks)" },
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

// Comp gradient constants — mirror landing.tsx
const CTA_GRADIENT =
  "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const HEADLINE_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)";
const ACTION_GRADIENT = "linear-gradient(100deg,#9FF5E8,#C5B3FF)";

// Comp pastel accents cycled per subject card
const RAINBOW_ACCENTS: { hex: string; halo: string }[] = [
  { hex: "#9FF5E8", halo: "rgba(159,245,232,0.28)" },
  { hex: "#9FD8FF", halo: "rgba(159,216,255,0.28)" },
  { hex: "#FFB7E5", halo: "rgba(255,183,229,0.28)" },
  { hex: "#C5B3FF", halo: "rgba(197,179,255,0.28)" },
  { hex: "#FFE29A", halo: "rgba(255,226,154,0.28)" },
  { hex: "#94F7C5", halo: "rgba(148,247,197,0.28)" },
];

function getBandHex(band: string): { hex: string; halo: string; label: string } {
  switch (band) {
    case "star":  return { hex: "#FFE29A", halo: "rgba(255,226,154,0.28)", label: "STAR" };
    case "green": return { hex: "#94F7C5", halo: "rgba(148,247,197,0.28)", label: "GREEN" };
    case "amber": return { hex: "#FFB7E5", halo: "rgba(255,183,229,0.28)", label: "AMBER" };
    default:      return { hex: "#FF8DA1", halo: "rgba(255,141,161,0.28)", label: "RED" };
  }
}

function getBandIcon(band: string, hex: string) {
  const style = { color: hex, width: 16, height: 16 };
  switch (band) {
    case "star":  return <Trophy style={style} />;
    case "green": return <ShieldCheck style={style} />;
    case "amber": return <BarChart2 style={style} />;
    default:      return <AlertCircle style={style} />;
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
  // /api/subjects/:id/mastery returns localised band + topic labels, so the
  // language must be in both the URL and the queryKey. Without it this view
  // rendered English labels for Afrikaans learners and cached across a
  // language switch (subject-detail.tsx already passes lang for this endpoint).
  const lang = isAf ? "af" : "en";
  const { data: mastery } = useQuery<SubjectMastery>({
    queryKey: ["/api/subjects", subject.id.toString(), "mastery", lang],
    queryFn: async () => {
      const r = await fetch(`/api/subjects/${subject.id}/mastery?lang=${lang}`, { credentials: "include" });
      if (!r.ok) throw new Error(`mastery ${r.status}`);
      return (await r.json()) as SubjectMastery;
    },
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
      style={{
        position: "relative",
        background: "#0b0b12",
        border: `1.5px solid ${accent.hex}55`,
        borderRadius: 22,
        padding: 24,
        overflow: "hidden",
      }}
      data-testid={`subject-card-${subject.code}`}
    >
      {/* Accent top rule — comp card marker */}
      <span
        aria-hidden
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent.hex }}
      />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
          <span
            style={{
              width: 46, height: 46, borderRadius: 14, flex: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
              background: `${accent.hex}24`,
              border: `1.5px solid ${accent.hex}`,
            }}
          >
            {getSubjectIcon(subject.name)}
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              role="heading"
              aria-level={3}
              style={{ fontWeight: 800, fontSize: 16, color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {isAf ? (subject.nameAfrikaans || subject.name) : subject.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1.5px", color: "#fff", textTransform: "uppercase" }}>{subject.code}</span>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  borderRadius: 999, padding: "3px 10px",
                  fontSize: 10, fontWeight: 900, letterSpacing: "1.5px", textTransform: "uppercase",
                  color: isActive ? "#94F7C5" : "#FFE29A",
                  border: `1px solid ${isActive ? "#94F7C5" : "#FFE29A"}`,
                }}
              >
                {isActive ? t.liveLabel : t.soonLabel}
              </span>
            </div>
          </div>
        </div>
        {mastery && (
          <div
            title={getBandLabel(band, t)}
            style={{
              display: "flex", alignItems: "center", gap: 6, flex: "none",
              padding: "7px 11px", borderRadius: 12,
              background: "rgba(5,5,8,.6)",
              border: `1.5px solid ${bandMeta.hex}`,
            }}
          >
            {getBandIcon(band, bandMeta.hex)}
            <span style={{ fontWeight: 900, fontSize: 16, color: bandMeta.hex }}>
              {masteryPct}%
            </span>
          </div>
        )}
      </div>

      {/* Stat grid */}
      {mastery && (
        <div className="btx-stat4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { v: mastery.progress.papersCompleted, k: t.examsAbbr, hex: "#FFE29A" },
            { v: mastery.progress.questionsAttempted, k: t.questionsAbbr, hex: "#9FD8FF" },
            { v: `${mastery.progress.accuracy}%`, k: t.accuracyAbbr, hex: "#C5B3FF" },
            { v: `${readiness}%`, k: t.readyAbbr, hex: "#9FF5E8" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: "center", borderRadius: 12, padding: "8px 4px",
                background: "rgba(255,255,255,.03)",
                border: `1px solid ${s.hex}44`,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900, color: s.hex }}>{s.v}</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "#fff" }}>{s.k}</div>
            </div>
          ))}
        </div>
      )}

      {/* Papers list */}
      {examConfig && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", color: "#FFE29A" }}>
            {t.availablePapers}
          </div>
          {examConfig.papers.map((paper) => (
            <div
              key={paper.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "10px 12px", borderRadius: 12,
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.1)",
              }}
              data-testid={`paper-${paper.id}`}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {isAf ? paper.nameAf : paper.name}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#fff", opacity: 0.72 }}>
                  {paper.totalMarks} {t.marksUnit} · {paper.duration} min
                </div>
              </div>
              {isActive ? (
                <Link href={examConfig.route === "/bst-exam" ? examConfig.route : `${examConfig.route}?subject=${subject.code}&paper=${paper.id}`} style={{ flex: "none" }}>
                  <button
                    className="btx-action"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 11,
                      letterSpacing: "1.2px", textTransform: "uppercase",
                      color: "#050508", background: ACTION_GRADIENT,
                      border: "none", borderRadius: 10, padding: "8px 14px",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                    data-testid={`button-start-${paper.id}`}
                  >
                    <Zap style={{ width: 12, height: 12 }} />
                    {t.startBtn}
                  </button>
                </Link>
              ) : (
                <button
                  disabled
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5, flex: "none",
                    fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 11,
                    letterSpacing: "1.2px", textTransform: "uppercase",
                    color: "#fff", background: "transparent",
                    border: "2px solid rgba(255,255,255,.22)", borderRadius: 10, padding: "7px 13px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Clock style={{ width: 12, height: 12 }} />
                  {t.soonLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!examConfig && (
        <div
          style={{
            textAlign: "center", padding: "24px 12px", marginBottom: 16,
            borderRadius: 12, border: `1px dashed ${accent.hex}55`,
          }}
        >
          <Brain style={{ width: 32, height: 32, margin: "0 auto 8px", color: accent.hex }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
            {t.comingSoon}
          </div>
        </div>
      )}

      {/* Footer links */}
      <div style={{ display: "flex", gap: 8 }}>
        <Link href={`/subject/${subject.id}`} style={{ flex: 1 }}>
          <button
            className="btx-ghost"
            style={{
              width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 11,
              letterSpacing: "1.2px", textTransform: "uppercase",
              color: "#fff", background: "transparent",
              border: "2px solid rgba(255,255,255,.22)", borderRadius: 10, padding: "9px 12px",
              cursor: "pointer",
            }}
            data-testid={`button-view-${subject.code}`}
          >
            <Target style={{ width: 12, height: 12 }} />
            {t.masteryBtn}
          </button>
        </Link>
        <Link href={`/tutor?subject=${subject.id}`} style={{ flex: 1 }}>
          <button
            className="btx-ghost"
            style={{
              width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 11,
              letterSpacing: "1.2px", textTransform: "uppercase",
              color: "#fff", background: "transparent",
              border: "2px solid rgba(255,255,255,.22)", borderRadius: 10, padding: "9px 12px",
              cursor: "pointer",
            }}
            data-testid={`button-tutor-${subject.code}`}
          >
            <Brain style={{ width: 12, height: 12 }} />
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
    heroEyebrow: "exam mode · no shortcuts",
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
    heroEyebrow: "eksamenmode · geen kortpaaie",
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
  },
} as const;

export default function ExamModePage() {
  const { user } = useAuth();
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
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", overflowX: "hidden", position: "relative" }}>
      <GraffitiSplats variant="full" opacity={0.4} />
      <style>{`
        .btx-action { transition: transform .2s; }
        .btx-action:hover { transform: translateY(-2px); }
        .btx-ghost { transition: border-color .2s, transform .2s; }
        .btx-ghost:hover { border-color: rgba(255,255,255,.5) !important; transform: translateY(-1px); }
        .btx-mode { transition: transform .25s, border-color .25s; }
        .btx-mode:hover { transform: translateY(-6px); border-color: var(--c) !important; }
        @media (max-width: 860px) {
          .btx-grid2 { grid-template-columns: 1fr !important; }
          .btx-hero-head { font-size: 38px !important; letter-spacing: -1px !important; }
          .btx-stat4 { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* ── Sticky header ───────────────────────────────────── */}
      <LearnerHeader
        backHref="/dashboard"
        backLabel={t.homeTitle}
        title={t.pageTitle}
        titleColor="#FFB7E5"
        maxWidthClassName="max-w-[1100px]"
        titleExtra={<Timer style={{ width: 18, height: 18, color: "#FFB7E5" }} />}
        actions={<ThemeToggle />}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 80px", display: "flex", flexDirection: "column", gap: 32 }}>
        {/* ── Hero — exam rules card per comp ─────────────────── */}
        <div
          style={{
            position: "relative",
            background: "#0b0b12",
            border: "1.5px solid rgba(255,183,229,.3)",
            borderRadius: 22,
            padding: "38px 34px",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background:
                "radial-gradient(ellipse 60% 50% at 15% 0%, rgba(255,183,229,.08), transparent 60%)," +
                "radial-gradient(ellipse 60% 50% at 85% 100%, rgba(159,245,232,.07), transparent 60%)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", transform: "rotate(-2deg)", marginBottom: 10 }}>
              {t.heroEyebrow}
            </div>

            {/* HUD pills */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {[
                { icon: <Flame style={{ width: 12, height: 12, color: "#FFB7E5" }} />, label: t.examSimulation, hex: "#FFB7E5" },
                { icon: <span style={{ width: 6, height: 6, borderRadius: 999, background: "#9FF5E8", display: "inline-block" }} />, label: t.capsLabel, hex: "#9FF5E8" },
                { icon: <AlertCircle style={{ width: 12, height: 12, color: "#FFE29A" }} />, label: t.timedScored, hex: "#FFE29A" },
              ].map((p) => (
                <span
                  key={p.label}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    borderRadius: 999, padding: "5px 12px",
                    border: `1px solid ${p.hex}`,
                    fontSize: 10, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase",
                    color: p.hex,
                  }}
                >
                  {p.icon}
                  {p.label}
                </span>
              ))}
            </div>

            <div
              role="heading"
              aria-level={1}
              className="btx-hero-head"
              data-testid="text-crunch-time-title"
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontSize: 52, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px",
                background: HEADLINE_GRADIENT,
                WebkitBackgroundClip: "text", backgroundClip: "text",
                color: "transparent", WebkitTextFillColor: "transparent",
              }}
            >
              {t.pageTitle}
            </div>
            <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.65, color: "#fff", maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
              {t.examSimSubtitle}
            </div>

            {/* Stat ticker */}
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
              {[
                { k: t.subjectsLabel, v: learnerSubjects.length, hex: "#9FF5E8", glow: "rgba(159,245,232,.25)" },
                { k: t.liveLabel, v: liveCount, hex: "#FFE29A", glow: "rgba(255,226,154,.25)" },
                { k: t.papersLabel, v: totalPapers, hex: "#FFB7E5", glow: "rgba(255,183,229,.25)" },
              ].map((s) => (
                <div
                  key={s.k}
                  style={{
                    background: "rgba(5,5,8,.6)",
                    border: `1.5px solid ${s.hex}`,
                    borderRadius: 20, padding: "16px 24px",
                    textAlign: "center", minWidth: 104,
                  }}
                >
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.hex }}>{s.v}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", color: "#fff", textTransform: "uppercase" }}>{s.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Modes — Mini Mock + Full Exam ─────────────── */}
        <div className="btx-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} data-testid="section-exam-quick-modes">
          {[
            {
              href: "/exam/mini-mock",
              testid: "tile-mini-mock",
              hex: "#9FF5E8",
              glow: "rgba(159,245,232,.22)",
              chipBg: "rgba(159,245,232,.14)",
              icon: <Zap style={{ width: 26, height: 26, color: "#9FF5E8" }} />,
              title: t.miniMockTitle,
              tag: t.miniMockTag,
              sub: t.miniMockSub,
              cta: t.miniMockCta,
            },
            {
              href: "/exam/full",
              testid: "tile-full-exam",
              hex: "#C5B3FF",
              glow: "rgba(197,179,255,.22)",
              chipBg: "rgba(197,179,255,.14)",
              icon: <GraduationCap style={{ width: 26, height: 26, color: "#C5B3FF" }} />,
              title: t.fullExamTitle,
              tag: t.fullExamTag,
              sub: t.fullExamSub,
              cta: t.fullExamCta,
            },
          ].map(({ href, testid, hex, glow, chipBg, icon, title, tag, sub, cta }) => (
            <Link key={href} href={href} style={{ display: "block", height: "100%" }} data-testid={testid}>
              <div
                className="btx-mode"
                style={{
                  "--c": hex, "--glow": glow,
                  height: "100%",
                  background: "linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.015))",
                  border: `1.5px solid ${hex}55`,
                  borderRadius: 22, padding: 26, cursor: "pointer",
                } as React.CSSProperties}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div
                    style={{
                      width: 54, height: 54, borderRadius: 16, flex: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: chipBg,
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <div role="heading" aria-level={2} style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{title}</div>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 900, letterSpacing: "1.5px", textTransform: "uppercase",
                          color: hex, border: `1px solid ${hex}`, borderRadius: 999, padding: "3px 10px",
                        }}
                      >
                        {tag}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: "#fff" }}>{sub}</div>
                    <span
                      className="btx-action"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4, marginTop: 16,
                        fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 13,
                        color: "#050508", background: ACTION_GRADIENT,
                        borderRadius: 10, padding: "11px 20px", whiteSpace: "nowrap",
                      }}
                    >
                      {cta} <ChevronRight style={{ width: 15, height: 15 }} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Subjects grid ───────────────────────────────────── */}
        {subjectsLoading ? (
          <div className="btx-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : learnerSubjects.length > 0 ? (
          <div className="btx-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            {learnerSubjects.map((subject, idx) => (
              <SubjectExamCard key={subject.id} subject={subject} isAf={isAf} t={t} colorIndex={idx} />
            ))}
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              background: "#0b0b12",
              border: "1.5px solid rgba(255,226,154,.4)",
              borderRadius: 22,
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <GraduationCap style={{ width: 58, height: 58, margin: "0 auto 14px", color: "#FFE29A", filter: "drop-shadow(0 0 10px rgba(255,226,154,.5))" }} />
            <div role="heading" aria-level={2} style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
              {t.noSubjectsMsg}
            </div>
            <div style={{ fontSize: 14, color: "#fff", marginTop: 8, fontWeight: 500 }}>
              {t.noSubjectsDesc}
            </div>
            <Link href="/onboarding">
              <button
                className="btx-action"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, marginTop: 22,
                  fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 14,
                  color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                  animation: "bt-rainbow 5s linear infinite",
                  border: "none", borderRadius: 10, padding: "14px 28px",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
                data-testid="button-setup-profile"
              >
                {t.setupProfileBtn}
                <ChevronRight style={{ width: 15, height: 15 }} />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
