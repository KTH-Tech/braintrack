// BrainTrack NSC Practice Centre — restyled to the "Permanent Marker Street
// Pastel" design system (docs/design-guidelines.md). #050508 ground, pastel
// accent cards, Permanent Marker eyebrows, rainbow hero, gradient action
// buttons, pure white text. RESTYLE ONLY — queries, SEO and data-testids
// preserved exactly.
import { useState, type CSSProperties } from "react";
import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraffitiSplats } from "@/components/graffiti-splats";
import {
  ExternalLink,
  FileText,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Calendar,
  GraduationCap,
  FlaskConical,
  Brain,
  TrendingUp,
  Clock,
  Repeat,
  Target,
  Check
} from "lucide-react";
import { Link } from "wouter";
import { PublicFooter } from "@/components/public-footer";

const DBE_BASE_URL = "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx";

const SUBJECTS = [
  { code: "MATH", name: "Mathematics", nameAf: "Wiskunde", papers: 2 },
  { code: "MATL", name: "Mathematical Literacy", nameAf: "Wiskundige Geletterdheid", papers: 2 },
  { code: "PHYS", name: "Physical Sciences", nameAf: "Fisiese Wetenskappe", papers: 2 },
  { code: "LIFE", name: "Life Sciences", nameAf: "Lewenswetenskappe", papers: 2 },
  { code: "ACC", name: "Accounting", nameAf: "Rekeningkunde", papers: 1 },
  { code: "BUS", name: "Business Studies", nameAf: "Besigheidstudies", papers: 1 },
  { code: "ECO", name: "Economics", nameAf: "Ekonomie", papers: 2 },
  { code: "GEO", name: "Geography", nameAf: "Geografie", papers: 2 },
  { code: "HIS", name: "History", nameAf: "Geskiedenis", papers: 2 },
  { code: "ENGH", name: "English HL", nameAf: "Engels Huistaal", papers: 3 },
  { code: "ENGF", name: "English FAL", nameAf: "Engels EAT", papers: 3 },
  { code: "AFRH", name: "Afrikaans HL", nameAf: "Afrikaans Huistaal", papers: 3 },
  { code: "AFRF", name: "Afrikaans FAL", nameAf: "Afrikaans EAT", papers: 3 },
  { code: "IT", name: "Information Technology", nameAf: "Inligtingstegnologie", papers: 2 },
  { code: "CAT", name: "Computer Applications Technology", nameAf: "Rekenaartoepassingstegnologie", papers: 2 },
];

const TEN_YEAR_PATTERNS = {
  MATH: {
    mustKnow: ["Calculus (100%)", "Functions & Graphs (100%)", "Trigonometry (95%)", "Financial Maths (90%)"],
    highFrequency: ["Sequences & Series", "Probability", "Analytical Geometry"],
    tips: "Paper 1: Algebra, Functions, Calculus. Paper 2: Geometry, Trig, Stats."
  },
  PHYS: {
    mustKnow: ["Mechanics (100%)", "Organic Chemistry (100%)", "Electricity (95%)", "Chemical Rates (90%)"],
    highFrequency: ["Waves & Sound", "Electrodynamics", "Chemical Equilibrium"],
    tips: "Paper 1: Mechanics, Waves, Electricity. Paper 2: Chemistry, Electrochemistry."
  },
  LIFE: {
    mustKnow: ["DNA & Genetics (100%)", "Evolution (95%)", "Human Impact (90%)", "Plant Responses (85%)"],
    highFrequency: ["Nervous System", "Endocrine System", "Population Ecology"],
    tips: "Paper 1: Life at Molecular Level, Diversity. Paper 2: Environmental Studies."
  },
  ACC: {
    mustKnow: ["Financial Statements (100%)", "Reconciliations (95%)", "Cost Accounting (90%)"],
    highFrequency: ["Budgets", "Interpretation of FS", "Inventory Systems"],
    tips: "Focus on formats, adjustments, and calculations. Show all workings."
  },
  ECO: {
    mustKnow: ["Markets (100%)", "Business Cycles (95%)", "Public Sector (90%)", "Globalisation (85%)"],
    highFrequency: ["Inflation", "Economic Growth", "Balance of Payments"],
    tips: "Paper 1: Microeconomics. Paper 2: Macroeconomics. Use graphs and examples."
  },
  BUS: {
    mustKnow: ["Business Environments (95%)", "Legislation (92%)", "Leadership & Management (90%)", "Business Operations (90%)", "Quality of Performance (88%)"],
    highFrequency: ["Business Strategies", "Human Resources", "Ethics & Corporate Governance"],
    tips: "Section A: MCQs. Section B: Case Studies - read scenarios carefully. Section C: Essays - use headings, intro, body, conclusion. Always include SA examples."
  }
};

// ── Street Pastel style constants ────────────────────────────────
const PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];
const RAINBOW_TEXT: CSSProperties = {
  backgroundImage:
    "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  color: "transparent",
};
const CARD: CSSProperties = {
  background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 20,
};
const PRIMARY_BTN: CSSProperties = {
  background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
  color: "#050508",
  border: "none",
  borderRadius: 10,
  fontWeight: 800,
};
const SECONDARY_BTN: CSSProperties = {
  background: "transparent",
  border: "1.5px solid rgba(255,255,255,.2)",
  color: "#fff",
  borderRadius: 10,
  fontWeight: 700,
};
const marker = (color: string, size = 15): CSSProperties => ({
  fontFamily: "'Permanent Marker',cursive",
  fontSize: size,
  color,
  transform: "rotate(-2deg)",
  display: "inline-block",
});
const accentCard = (hex: string): CSSProperties => ({
  background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
  border: `1.5px solid ${hex}55`,
  borderRadius: 20,
});
const pill = (hex: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  borderRadius: 999,
  padding: "4px 11px",
  fontSize: 11,
  fontWeight: 800,
  color: hex,
  border: `1px solid ${hex}`,
});

export default function PastPapersPage() {
  useSEO({
    title: "NSC Grade 12 Past Papers 2015–2025 | All Subjects | BrainTrack™",
    description: "Access 10 years of official DBE NSC Grade 12 past exam papers with memos for all CAPS subjects — Mathematics, Physical Sciences, English, Afrikaans, Life Sciences, Business Studies and more.",
    canonical: "https://braintrack.tech/past-papers",
    ogTitle: "NSC Grade 12 Past Papers 2015–2025 — All CAPS Subjects | BrainTrack™",
    ogDescription: "10 years of official DBE NSC past exam papers with memos for every Grade 12 CAPS subject. Free to browse — practise with real Matric-level questions.",
    ogUrl: "https://braintrack.tech/past-papers",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.tech/" },
          { "@type": "ListItem", "position": 2, "name": "NSC Past Papers", "item": "https://braintrack.tech/past-papers" },
        ],
      },
      // CollectionPage + ItemList of Course entries — one per Matric subject
      // we cover. This is the schema Google uses to surface subject-specific
      // "course carousels" for queries like "Grade 12 Mathematics past papers".
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Grade 12 NSC Past Papers — All Subjects",
        "url": "https://braintrack.tech/past-papers",
        "inLanguage": ["en-ZA", "af-ZA"],
        "about": {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "National Senior Certificate (NSC)",
          "educationalLevel": "Grade 12",
        },
        "mainEntity": {
          "@type": "ItemList",
          "name": "Grade 12 NSC Subjects on BrainTrack",
          "itemListElement": SUBJECTS.map((s, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "Course",
              "name": `Grade 12 ${s.name} — NSC Past Papers & Memos`,
              "alternateName": `Graad 12 ${s.nameAf}`,
              "description": `10 years of official DBE NSC Grade 12 ${s.name} past exam papers and memorandums (2015–2025) for CAPS-aligned Matric revision.`,
              "provider": {
                "@type": "EducationalOrganization",
                "name": "BrainTrack",
                "sameAs": "https://braintrack.tech",
              },
              "educationalLevel": "Grade 12",
              "inLanguage": ["en-ZA", "af-ZA"],
              "offers": {
                "@type": "Offer",
                "price": "169",
                "priceCurrency": "ZAR",
                "category": "subscription",
                "availability": "https://schema.org/InStock",
              },
              "hasCourseInstance": {
                "@type": "CourseInstance",
                "courseMode": "online",
                "inLanguage": ["en-ZA", "af-ZA"],
              },
            },
          })),
        },
      },
    ],
  });
  const { language, setLanguage } = useLanguage();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("official");

  const t = {
    en: {
      title: "NSC Practice Centre",
      subtitle: "10 Years of Exam Patterns",
      officialPapers: "Exam Patterns",
      patterns: "10-Year Trends",
      simulated: "Practice Exams",
      science: "The Science",
      backToApp: "Home",
      selectSubject: "Select a subject to view trends",
      viewOnDBE: "Visit DBE Website for Official Papers",
      disclaimer: "Official papers are available on the DBE website for reference.",
      mustKnow: "Must-Know Topics (appeared every year)",
      highFreq: "High Frequency Topics",
      examTips: "Exam Strategy",
      legalNote: "We provide simulated questions based on historical trends. Official content is linked externally.",
      years: "years of trends",
      heroHype: "Know the paper before you write it 🔥",
      comingSoonTitle: "Simulated exam papers are on the way",
      comingSoonBody: "We're replacing downloadable papers with original, CAPS-aligned questions in NSC style. You can practise a full exam right now.",
      comingSoonCta: "Practise a Full Exam",
    },
    af: {
      title: "NSC Oefensentrum",
      subtitle: "10 Jaar van Eksamenpatrone",
      officialPapers: "Eksamenpatrone",
      patterns: "10-Jaar Tendense",
      simulated: "Oefeneksamens",
      science: "Die Wetenskap",
      backToApp: "Tuis",
      selectSubject: "Kies 'n vak om tendense te sien",
      viewOnDBE: "Besoek DBO Webwerf vir Amptelike Vraestelle",
      disclaimer: "Amptelike vraestelle is beskikbaar op die DBO webwerf vir verwysing.",
      mustKnow: "Moet-Ken Onderwerpe (verskyn elke jaar)",
      highFreq: "Hoë Frekwensie Onderwerpe",
      examTips: "Eksamenstrategie",
      legalNote: "Ons verskaf gesimuleerde vrae gebaseer op historiese tendense. Amptelike inhoud word slegs ekstern geskakel.",
      years: "jaar van tendense",
      heroHype: "Ken die vraestel voor jy dit skryf 🔥",
      comingSoonTitle: "Gesimuleerde eksamenvraestelle is oppad",
      comingSoonBody: "Ons vervang aflaaibare vraestelle met oorspronklike, KABV-belynde vrae in NSC-styl. Jy kan nou 'n volledige eksamen oefen.",
      comingSoonCta: "Oefen 'n Volledige Eksamen",
    },
  };

  const text = t[language];

  const selectedSubjectData = SUBJECTS.find(s => s.code === selectedSubject);
  const patterns = selectedSubject ? TEN_YEAR_PATTERNS[selectedSubject as keyof typeof TEN_YEAR_PATTERNS] : null;

  type IngestedYear = { year: number; papers: number[]; memos: number[] };
  type IngestedSubject = { subject: string; years: IngestedYear[] };
  const { data: ingestedData } = useQuery<{ comingSoon?: boolean; subjects?: IngestedSubject[] }>({
    queryKey: ["/api/past-papers/list"],
  });
  // COPYRIGHT SAFETY: the server no longer serves verbatim DBE past papers.
  // When it responds with `comingSoon`, we replace the paper browser with a
  // friendly state that sends learners to the original simulated Full Exam.
  const comingSoon = ingestedData?.comingSoon === true;
  const ingestedSubjects = ingestedData?.subjects ?? [];

  // Filter SUBJECTS to only those the learner is enrolled in.
  // /api/subjects already returns only the learner's enrolled subjects.
  const { data: enrolledSubjectsRaw, isError: subjectsFailed } = useQuery<{ code: string }[]>({
    queryKey: ["/api/subjects"],
    // Guard the shape. /api/subjects returns an array on success but an
    // `{ error }` object on a 500 (e.g. a schema/column drift like the 0034
    // regression). Calling .map() on that object throws inside `select`,
    // which React Query surfaces as a render error and blanks the whole
    // page — the "error on past papers" learners were hitting. Anything
    // that isn't an array now degrades to "no enrolled subjects" instead.
    select: (data: any) =>
      Array.isArray(data)
        ? data.map((s) => ({ code: s?.code as string })).filter((s) => Boolean(s.code))
        : [],
  });
  const enrolledCodes = new Set<string>(enrolledSubjectsRaw?.map((s) => s.code) ?? []);
  // Only show subjects the learner is enrolled in — never fall back to all subjects
  // (that would show 15 unrelated subjects and waste the learner's time).
  const visibleSubjects = SUBJECTS.filter((s) => enrolledCodes.has(s.code));
  const hasNoEnrollment = enrolledSubjectsRaw !== undefined && enrolledCodes.size === 0;

  // Match an ingested subject row by fuzzy name (uploaded subjects use full names like "Mathematics")
  const findIngestedFor = (subjectName: string): IngestedSubject | undefined => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = norm(subjectName);
    return ingestedSubjects.find(
      s => norm(s.subject) === target || norm(s.subject).includes(target) || target.includes(norm(s.subject)),
    );
  };

  const selectedIngested = selectedSubjectData ? findIngestedFor(selectedSubjectData.name) : undefined;
  const fileUrl = (subject: string, year: number, paperNumber: number, isMemo: boolean) =>
    `/api/past-papers/file?subject=${encodeURIComponent(subject)}&year=${year}&paperNumber=${paperNumber}&isMemo=${isMemo}`;

  const tabs = [
    { value: "official", label: text.officialPapers, Icon: FileText, testid: "tab-official" },
    { value: "patterns", label: text.patterns, Icon: Sparkles, testid: "tab-patterns" },
    { value: "simulated", label: text.simulated, Icon: GraduationCap, testid: "tab-simulated" },
    { value: "science", label: text.science, Icon: FlaskConical, testid: "tab-science" },
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden relative text-white"
      style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}
    >
      <GraffitiSplats variant="corner" opacity={0.5} />

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,.08)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/dashboard">
                <button
                  data-testid="button-back-dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 shrink-0"
                  style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">{text.backToApp}</span>
                </button>
              </Link>
              <span className="hidden sm:inline truncate" style={marker("#9FF5E8", 16)}>
                {text.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage("en")}
                data-testid="button-lang-en"
                className="px-3 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-white/10"
                style={{
                  color: "#C5B3FF",
                  border: "1.5px solid #C5B3FF",
                  background: language === "en" ? "rgba(197,179,255,.16)" : "rgba(255,255,255,.03)",
                }}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("af")}
                data-testid="button-lang-af"
                className="px-3 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-white/10"
                style={{
                  color: "#C5B3FF",
                  border: "1.5px solid #C5B3FF",
                  background: language === "af" ? "rgba(197,179,255,.16)" : "rgba(255,255,255,.03)",
                }}
              >
                Afrikaans
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Ambient auras */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-40"
          style={{ background: "#9FD8FF" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-64 -right-24 w-[380px] h-[380px] rounded-full blur-[120px] opacity-30"
          style={{ background: "#FFB7E5" }}
        />

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative space-y-3 mb-8" style={{ animation: "bt-fadeup .5s both" }}>
          <div className="inline-flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: "#9FF5E8" }} />
            <span style={marker("#9FF5E8", 16)}>{text.heroHype}</span>
          </div>
          <div
            role="heading"
            aria-level={1}
            className="font-black leading-[0.95] tracking-tight text-3xl sm:text-4xl md:text-5xl"
            style={RAINBOW_TEXT}
          >
            {text.title}
          </div>
          <p className="text-white text-base sm:text-lg" style={{ opacity: 0.94 }}>
            {text.subtitle}
          </p>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList
            className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 p-1.5"
            style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16 }}
          >
            {tabs.map(({ value, label, Icon, testid }) => (
              <TabsTrigger
                key={value}
                value={value}
                data-testid={testid}
                className="py-2"
                style={
                  activeTab === value
                    ? { ...PRIMARY_BTN, borderRadius: 12, fontWeight: 800 }
                    : { background: "transparent", color: "#fff", borderRadius: 12, fontWeight: 700 }
                }
              >
                <Icon className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Official / Exam Patterns tab ────────────────────────── */}
          <TabsContent value="official" className="space-y-6">
            {comingSoon ? (
              /* COPYRIGHT SAFETY: verbatim DBE papers are no longer served.
                 Replace the whole paper browser with a friendly coming-soon
                 state that routes learners to the original simulated Full
                 Exam. No path here touches /api/past-papers/file. */
              <div
                className="p-8 sm:p-10 text-center flex flex-col items-center gap-4"
                style={accentCard("#C5B3FF")}
                data-testid="past-papers-coming-soon"
              >
                <GraduationCap className="w-12 h-12" style={{ color: "#C5B3FF" }} />
                <div role="heading" aria-level={2} className="text-xl sm:text-2xl font-black" style={RAINBOW_TEXT}>
                  {text.comingSoonTitle}
                </div>
                <p className="text-white max-w-xl" style={{ opacity: 0.94 }}>
                  {text.comingSoonBody}
                </p>
                <Link href="/exam/full">
                  <button
                    data-testid="link-to-full-exam"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm transition-all hover:-translate-y-0.5"
                    style={PRIMARY_BTN}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {text.comingSoonCta}
                  </button>
                </Link>
              </div>
            ) : (
            <>
            <div className="p-4 flex items-start gap-3" style={accentCard("#9FD8FF")}>
              <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#9FD8FF" }} />
              <div>
                <p className="text-sm text-white font-semibold">{text.disclaimer}</p>
                <p className="text-xs text-white mt-1" style={{ opacity: 0.9 }}>{text.legalNote}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="p-5" style={CARD}>
                  <div role="heading" aria-level={2} className="font-black text-base text-white">
                    {language === "af" ? "Vakke" : "Subjects"}
                  </div>
                  <p className="text-xs text-white mt-0.5 mb-3" style={{ opacity: 0.9 }}>10 {text.years}</p>
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                    {subjectsFailed ? (
                      /* Server-side failure — distinct from "you haven't picked
                         subjects yet", otherwise an outage reads as the learner's
                         fault and they get sent to re-do onboarding for nothing. */
                      <div className="py-6 text-center space-y-3" data-testid="past-papers-subjects-error">
                        <p className="text-sm text-white">
                          {language === "af"
                            ? "Ons kon nie jou vakke laai nie. Dis aan ons kant, nie joune nie."
                            : "We couldn't load your subjects. That's on our side, not yours."}
                        </p>
                        <button
                          onClick={() => window.location.reload()}
                          className="px-4 py-2 text-xs transition-all hover:bg-white/5"
                          style={SECONDARY_BTN}
                        >
                          {language === "af" ? "Probeer weer" : "Try again"}
                        </button>
                      </div>
                    ) : hasNoEnrollment ? (
                      <div className="py-6 text-center space-y-3">
                        <p className="text-sm text-white">
                          {language === "af"
                            ? "Voltooi jou vakkeuse om jou vraestelle te sien."
                            : "Complete your subject selection to see your past papers."}
                        </p>
                        <Link href="/onboarding">
                          <button
                            className="px-4 py-2 text-xs transition-all hover:bg-white/5"
                            style={SECONDARY_BTN}
                          >
                            {language === "af" ? "Kies vakke" : "Select subjects"}
                          </button>
                        </Link>
                      </div>
                    ) : visibleSubjects.map((subject, idx) => {
                      const hex = PASTELS[idx % PASTELS.length];
                      const isActive = selectedSubject === subject.code;
                      return (
                        <button
                          key={subject.code}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-bold transition-all hover:bg-white/5"
                          style={{
                            borderRadius: 12,
                            color: isActive ? hex : "#fff",
                            background: isActive ? `${hex}14` : "transparent",
                            border: isActive ? `1.5px solid ${hex}` : "1px solid rgba(255,255,255,.1)",
                          }}
                          onClick={() => setSelectedSubject(subject.code)}
                          data-testid={`button-subject-${subject.code}`}
                        >
                          <Target className="w-4 h-4 flex-shrink-0" style={{ color: hex }} />
                          <span className="truncate flex-1">
                            {language === "af" ? subject.nameAf : subject.name}
                          </span>
                          <span
                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0"
                            style={{ color: hex, border: `1px solid ${hex}66` }}
                          >
                            {language === "af" ? "Tendense" : "Trends"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                {selectedSubjectData ? (
                  <div className="p-6" style={CARD}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div role="heading" aria-level={2} className="font-black text-lg text-white">
                        {language === "af" ? selectedSubjectData.nameAf : selectedSubjectData.name}
                      </div>
                      <span style={pill("#FFB7E5")}>
                        {language === "af" ? "Historiese Tendense" : "Historical Trends"}
                      </span>
                    </div>
                    <p className="text-sm text-white mt-1 mb-4" style={{ opacity: 0.9 }}>{text.selectSubject}</p>
                    <div className="grid gap-3">
                      {selectedIngested && selectedIngested.years.length > 0 ? (
                        <div className="space-y-3">
                          {selectedIngested.years.map((y, yi) => {
                            const hex = PASTELS[yi % PASTELS.length];
                            return (
                              <div
                                key={y.year}
                                className="p-4"
                                style={{ background: `${hex}0a`, border: `1px solid ${hex}40`, borderRadius: 16 }}
                              >
                                <div className="flex items-center justify-between mb-2.5">
                                  <p className="font-black text-sm" style={{ color: hex }}>{y.year}</p>
                                  <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ color: "#fff", border: "1px solid rgba(255,255,255,.25)" }}
                                  >
                                    {y.papers.length} {language === "af" ? "vraestelle" : "papers"} · {y.memos.length} {language === "af" ? "memo's" : "memos"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {y.papers.map((p) => (
                                    <a
                                      key={`p${p}`}
                                      href={fileUrl(selectedIngested.subject, y.year, p, false)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      data-testid={`link-paper-${y.year}-p${p}`}
                                      className="inline-flex items-center px-3.5 py-2 text-xs transition-all hover:-translate-y-0.5"
                                      style={PRIMARY_BTN}
                                    >
                                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                                      {language === "af" ? `Vraestel ${p}` : `Paper ${p}`}
                                    </a>
                                  ))}
                                  {y.memos.map((m) => (
                                    <a
                                      key={`m${m}`}
                                      href={fileUrl(selectedIngested.subject, y.year, m, true)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      data-testid={`link-memo-${y.year}-p${m}`}
                                      className="inline-flex items-center px-3.5 py-2 text-xs transition-all hover:bg-white/5"
                                      style={SECONDARY_BTN}
                                    >
                                      <Check className="w-3.5 h-3.5 mr-1.5" style={{ color: "#94F7C5" }} />
                                      {language === "af" ? `Memo ${m}` : `Memo ${m}`}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          className="p-6 text-center"
                          style={{ border: "2px dashed rgba(159,216,255,.35)", borderRadius: 16, background: "rgba(159,216,255,.04)" }}
                        >
                          <p className="text-white mb-4">
                            {language === "af"
                              ? `Amptelike vraestelle vir ${selectedSubjectData.nameAf} is nog nie opgelaai nie. Besoek die DBO-webwerf.`
                              : `Official papers for ${selectedSubjectData.name} have not been uploaded yet. Visit the DBE website.`}
                          </p>
                          <a
                            href={DBE_BASE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="button-view-dbe"
                            className="inline-flex items-center px-5 py-2.5 text-sm transition-all hover:-translate-y-0.5"
                            style={PRIMARY_BTN}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {text.viewOnDBE}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-6" style={CARD}>
                    <div className="text-center py-12">
                      <Target className="w-12 h-12 mx-auto mb-4" style={{ color: "#9FD8FF" }} />
                      <span style={marker("#9FD8FF", 16)}>{text.selectSubject}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </>
            )}
          </TabsContent>

          {/* ── 10-Year Trends tab ──────────────────────────────────── */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="p-5" style={CARD}>
                  <div role="heading" aria-level={2} className="font-black text-base text-white">
                    {language === "af" ? "Vakke" : "Subjects"}
                  </div>
                  <p className="text-xs text-white mt-0.5 mb-3" style={{ opacity: 0.9 }}>
                    {language === "af" ? "Patroon-analise" : "Pattern Analysis"}
                  </p>
                  <div className="space-y-1.5">
                    {Object.keys(TEN_YEAR_PATTERNS).map((code, idx) => {
                      const subject = SUBJECTS.find(s => s.code === code);
                      const hex = PASTELS[idx % PASTELS.length];
                      const isActive = selectedSubject === code;
                      return (
                        <button
                          key={code}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-bold transition-all hover:bg-white/5"
                          style={{
                            borderRadius: 12,
                            color: isActive ? hex : "#fff",
                            background: isActive ? `${hex}14` : "transparent",
                            border: isActive ? `1.5px solid ${hex}` : "1px solid rgba(255,255,255,.1)",
                          }}
                          onClick={() => setSelectedSubject(code)}
                          data-testid={`button-pattern-${code}`}
                        >
                          <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: hex }} />
                          <span className="truncate">{language === "af" ? subject?.nameAf : subject?.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                {patterns ? (
                  <div className="space-y-4">
                    <div className="p-6" style={accentCard("#94F7C5")}>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5" style={{ color: "#94F7C5" }} />
                        <div role="heading" aria-level={2} className="font-black text-white">{text.mustKnow}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {patterns.mustKnow.map((topic, i) => (
                          <span key={i} style={pill("#94F7C5")}>{topic}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6" style={accentCard("#FFE29A")}>
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5" style={{ color: "#FFE29A" }} />
                        <div role="heading" aria-level={2} className="font-black text-white">{text.highFreq}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {patterns.highFrequency.map((topic, i) => (
                          <span key={i} style={pill("#FFE29A")}>{topic}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6" style={accentCard("#9FD8FF")}>
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="w-5 h-5" style={{ color: "#9FD8FF" }} />
                        <div role="heading" aria-level={2} className="font-black text-white">{text.examTips}</div>
                      </div>
                      <p className="text-white">{patterns.tips}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-6" style={CARD}>
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: "#FFB7E5" }} />
                      <span style={marker("#FFB7E5", 16)}>{text.selectSubject}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Practice Exams tab ──────────────────────────────────── */}
          <TabsContent value="simulated" className="space-y-6">
            <div className="text-center mb-6 space-y-2">
              <span style={marker("#C5B3FF", 16)}>
                {language === "af" ? "Oefen soos die regte ding 💯" : "Practice like the real thing 💯"}
              </span>
              <div role="heading" aria-level={2} className="text-xl sm:text-2xl font-black" style={RAINBOW_TEXT}>
                {language === "af" ? "Gesimuleerde NSC Eksamens" : "Simulated NSC Exams"}
              </div>
              <p className="text-white">
                {language === "af"
                  ? "Oorspronklike vrae in NSC-styl. 100% KABV-belyn. Nie gekopieer van DBE nie."
                  : "Original questions in NSC style. 100% CAPS-aligned. Not copied from DBE."}
              </p>
            </div>

            <div className="p-4 flex items-start gap-3 mb-6" style={accentCard("#94F7C5")}>
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#94F7C5" }} />
              <div>
                <p className="text-sm font-bold text-white">
                  {language === "af" ? "Wetlik Voldoen" : "Legally Compliant"}
                </p>
                <p className="text-xs text-white" style={{ opacity: 0.9 }}>
                  {language === "af"
                    ? "Alle vrae is OORSPRONKLIK en GESIMULEER. Amptelike DBE-inhoud word slegs via eksterne skakels verskaf."
                    : "All questions are ORIGINAL and SIMULATED. Official DBE content is only provided via external links."}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleSubjects.map((subject, idx) => {
                const ingested = findIngestedFor(subject.name);
                const available = subject.code === "BUS" || !!ingested;
                const hex = PASTELS[idx % PASTELS.length];
                const tilt = idx % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)";
                return (
                  <div
                    key={subject.code}
                    className="p-4 transition-all"
                    style={{
                      ...accentCard(hex),
                      transform: tilt,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "rotate(0deg) translateY(-6px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = tilt;
                    }}
                  >
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div role="heading" aria-level={3} className="font-black truncate" style={{ color: hex }}>
                        {language === "af" ? subject.nameAf : subject.name}
                      </div>
                      <span
                        className="text-[10px] uppercase tracking-wide font-black shrink-0 px-2 py-0.5 rounded-full"
                        style={
                          available
                            ? { color: "#94F7C5", border: "1px solid #94F7C5" }
                            : { color: "#FFE29A", border: "1px solid #FFE29A" }
                        }
                      >
                        {available
                          ? (language === "af" ? "Beskikbaar" : "Available")
                          : (language === "af" ? "Binnekort" : "Coming Soon")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#9FF5E8", border: "1px solid #9FF5E866" }}>
                        {language === "af" ? "KABV" : "CAPS"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#FFB7E5", border: "1px solid #FFB7E566" }}>
                        NSC-Style
                      </span>
                    </div>
                    <Link href={available ? "/bst-exam" : "#"}>
                      <button
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={available ? PRIMARY_BTN : SECONDARY_BTN}
                        disabled={!available}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {available
                          ? (language === "af" ? "Begin Eksamen" : "Start Exam")
                          : (language === "af" ? "Binnekort" : "Coming Soon")}
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-4" style={accentCard(PASTELS[0])}>
                <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: PASTELS[0] }}>
                  {language === "af" ? "Beskikbaar" : "Available now"}
                </div>
                <p className="text-2xl font-black text-white">
                  {visibleSubjects.filter(s => s.code === "BUS" || !!findIngestedFor(s.name)).length}
                  <span className="text-sm font-bold text-white">/{visibleSubjects.length}</span>
                </p>
                <p className="text-[11px] text-white mt-1" style={{ opacity: 0.9 }}>
                  {language === "af" ? "Vakke met simulasie" : "Subjects with simulator"}
                </p>
              </div>
              <div className="text-center p-4" style={accentCard(PASTELS[1])}>
                <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: PASTELS[1] }}>
                  {language === "af" ? "Belyning" : "Alignment"}
                </div>
                <p className="text-2xl font-black" style={RAINBOW_TEXT}>100%</p>
                <p className="text-[11px] text-white mt-1" style={{ opacity: 0.9 }}>
                  {language === "af" ? "KABV-belyn" : "CAPS aligned"}
                </p>
              </div>
              <div className="text-center p-4" style={accentCard(PASTELS[2])}>
                <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: PASTELS[2] }}>
                  {language === "af" ? "Nasien" : "Marking"}
                </div>
                <p className="text-2xl font-black text-white">
                  {language === "af" ? "Outomaties" : "Auto"}
                </p>
                <p className="text-[11px] text-white mt-1" style={{ opacity: 0.9 }}>
                  {language === "af" ? "Onmiddellike terugvoer" : "Instant feedback"}
                </p>
              </div>
              <div className="text-center p-4" style={accentCard(PASTELS[3])}>
                <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: PASTELS[3] }}>
                  {language === "af" ? "Memo's" : "Memos"}
                </div>
                <p className="text-2xl font-black text-white">
                  {language === "af" ? "Ingesluit" : "Included"}
                </p>
                <p className="text-[11px] text-white mt-1" style={{ opacity: 0.9 }}>
                  {language === "af" ? "Volledige verduidelikings" : "Full explanations"}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ── The Science tab ─────────────────────────────────────── */}
          <TabsContent value="science" className="space-y-6">
            <div className="text-center mb-8 space-y-2">
              <span style={marker("#94F7C5", 16)}>
                {language === "af" ? "Die wetenskap agter die wins 🧠" : "The science behind the gains 🧠"}
              </span>
              <div role="heading" aria-level={2} className="text-xl sm:text-2xl font-black" style={RAINBOW_TEXT}>
                {language === "af" ? "Bewese Leermetodes" : "Evidence-Based Learning"}
              </div>
              <p className="text-white">
                {language === "af"
                  ? "BrainTrack gebruik navorsing-gesteunde tegnieke wat bewys is om punte te verbeter"
                  : "BrainTrack uses research-backed techniques proven to improve exam scores"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  hex: "#94F7C5",
                  Icon: Brain,
                  InnerIcon: TrendingUp,
                  title: language === "af" ? "Die Toetseffek" : "The Testing Effect",
                  source: "Roediger & Karpicke, 2006",
                  body: language === "af"
                    ? "Navorsing toon dat leerders wat hulself toets 50% meer onthou as diegene wat net herlees."
                    : "Research shows students who test themselves retain 50% more than those who just re-read.",
                  how: language === "af"
                    ? "Rizz stel vrae in plaas van net inligting te gee. Elke vraag versterk jou geheue."
                    : "Rizz asks questions instead of just giving info. Every question strengthens your memory.",
                },
                {
                  hex: "#9FD8FF",
                  Icon: Repeat,
                  InnerIcon: Clock,
                  title: language === "af" ? "Gespasieerde Herhaling" : "Spaced Repetition",
                  source: "Ebbinghaus Forgetting Curve",
                  body: language === "af"
                    ? "Ons vergeet 70% binne 24 uur tensy ons dit op strategiese tye hersien."
                    : "We forget 70% within 24 hours unless we review at strategic intervals.",
                  how: language === "af"
                    ? "Ons skeduleer outomaties hersienings op optimale intervalle gebaseer op jou vordering."
                    : "We automatically schedule reviews at optimal intervals based on your mastery progress.",
                },
                {
                  hex: "#9FF5E8",
                  Icon: Target,
                  InnerIcon: Brain,
                  title: language === "af" ? "Aktiewe Herroeping" : "Active Recall",
                  source: "Cognitive Psychology Research",
                  body: language === "af"
                    ? "Om inligting aktief te herroep is 2-3x meer effektief as passiewe lees."
                    : "Actively retrieving information is 2-3x more effective than passive reading.",
                  how: language === "af"
                    ? "Vorige vraestelle dwing jou om antwoorde te herroep - nie net te herken nie."
                    : "Past papers force you to recall answers - not just recognize them.",
                },
                {
                  hex: "#FFE29A",
                  Icon: Sparkles,
                  InnerIcon: BookOpen,
                  title: language === "af" ? "Leerstvl-Aanpassing" : "Learning Style Adaptation",
                  source: "VARK Model (Fleming, 1987)",
                  body: language === "af"
                    ? "Leerders presteer beter wanneer inhoud by hul voorkeurstyl aangepas word."
                    : "Learners perform better when content is adapted to their preferred learning style.",
                  how: language === "af"
                    ? "Ons identifiseer jou styl (Visueel, Ouditief, Lees/Skryf, Kinesteties) en pas verduidelikings aan."
                    : "We identify your style (Visual, Auditory, Reading/Writing, Kinesthetic) and adapt explanations.",
                },
              ].map(({ hex, Icon, InnerIcon, title, source, body, how }, i) => (
                <div key={i} className="p-6" style={accentCard(hex)}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-6 h-6" style={{ color: hex }} />
                    <div role="heading" aria-level={3} className="font-black text-white">{title}</div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: hex }}>{source}</p>
                  <div className="space-y-4 mt-4">
                    <p className="text-sm text-white">{body}</p>
                    <div className="p-3" style={{ borderRadius: 12, border: `1px solid ${hex}45`, background: `${hex}0a` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <InnerIcon className="w-4 h-4" style={{ color: hex }} />
                        <span className="font-bold text-white text-sm">
                          {language === "af" ? "Hoe BrainTrack dit gebruik:" : "How BrainTrack uses this:"}
                        </span>
                      </div>
                      <p className="text-xs text-white" style={{ opacity: 0.92 }}>{how}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 relative overflow-hidden" style={CARD}>
              <span
                aria-hidden
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)" }}
              />
              <div className="py-8 px-6 text-center">
                <span style={marker("#FFB7E5", 16)}>{language === "af" ? "Die Resultaat?" : "The Result?"}</span>
                <p className="text-4xl font-black my-2" style={RAINBOW_TEXT}>2-3x</p>
                <p className="text-white">
                  {language === "af"
                    ? "Beter langtermyn retensie vs tradisionele studeermetodes"
                    : "Better long-term retention vs traditional study methods"}
                </p>
                <p className="text-xs text-white mt-4" style={{ opacity: 0.85 }}>
                  Sources: Roediger & Karpicke (2006), Psychological Science | Ebbinghaus (1885) | Fleming & Mills (1992)
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PublicFooter />
    </div>
  );
}
