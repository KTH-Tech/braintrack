import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ExternalLink, 
  FileText, 
  ChevronLeft, 
  Download, 
  BookOpen,
  Sparkles,
  AlertTriangle,
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

const DBE_BASE_URL = "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx";

const DBE_YEAR_URLS: Record<number, string> = {
  2024: "https://www.education.gov.za/2024NSCNovemberpastpapers.aspx",
  2023: "https://www.education.gov.za/2023NSCNovemberpastpapers.aspx",
  2022: "https://www.education.gov.za/2022NSCNovemberpastpapers.aspx",
  2021: "https://www.education.gov.za/2021NSCNovemberpastpapers.aspx",
  2020: "https://www.education.gov.za/2020NSCNovemberpastpapers.aspx",
  2019: "https://www.education.gov.za/2019NSCNovemberpastpapers.aspx",
  2018: "https://www.education.gov.za/2018NSCNovemberpastpapers.aspx",
  2017: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2017NSCNovExamPapers.aspx",
  2016: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2016NSCNovExamPapers.aspx",
  2015: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2015NSCNovExamPapers.aspx",
};

const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

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

export default function PastPapersPage() {
  useSEO({
    title: "NSC Grade 12 Past Papers 2015–2024 | All Subjects | BrainTrack™",
    description: "Access 10 years of official DBE NSC Grade 12 past exam papers with memos for all CAPS subjects — Mathematics, Physical Sciences, English, Afrikaans, Life Sciences, Business Studies and more.",
    canonical: "https://braintrack.app/past-papers",
    ogTitle: "NSC Grade 12 Past Papers 2015–2024 — All CAPS Subjects | BrainTrack™",
    ogDescription: "10 years of official DBE NSC past exam papers with memos for every Grade 12 CAPS subject. Free to browse — practise with real Matric-level questions.",
    ogUrl: "https://braintrack.app/past-papers",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.app/" },
          { "@type": "ListItem", "position": 2, "name": "NSC Past Papers", "item": "https://braintrack.app/past-papers" },
        ],
      },
      // CollectionPage + ItemList of Course entries — one per Matric subject
      // we cover. This is the schema Google uses to surface subject-specific
      // "course carousels" for queries like "Grade 12 Mathematics past papers".
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Grade 12 NSC Past Papers — All Subjects",
        "url": "https://braintrack.app/past-papers",
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
              "description": `10 years of official DBE NSC Grade 12 ${s.name} past exam papers and memorandums (2015–2024) for CAPS-aligned Matric revision.`,
              "provider": {
                "@type": "EducationalOrganization",
                "name": "BrainTrack",
                "sameAs": "https://braintrack.app",
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
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const t = {
    en: {
      title: "NSC Practice Centre",
      subtitle: "10 Years of Exam Patterns",
      officialPapers: "Exam Patterns",
      patterns: "10-Year Trends",
      simulated: "Practice Exams",
      science: "The Science",
      backToApp: "Back to Dashboard",
      selectSubject: "Select a subject to view trends",
      viewOnDBE: "Visit DBE Website for Official Papers",
      disclaimer: "Official papers are available on the DBE website for reference.",
      paperLabel: "Pattern",
      memo: "Memo Style",
      question: "Exam Simulation",
      mustKnow: "Must-Know Topics (appeared every year)",
      highFreq: "High Frequency Topics",
      examTips: "Exam Strategy",
      comingSoon: "Simulated exams coming soon",
      simulatedDesc: "Practice with original CAPS-aligned questions",
      legalNote: "We provide simulated questions based on historical trends. Official content is linked externally.",
      year: "Trend Year",
      years: "years of trends",
    },
    af: {
      title: "NSC Oefensentrum",
      subtitle: "10 Jaar van Eksamenpatrone",
      officialPapers: "Eksamenpatrone",
      patterns: "10-Jaar Tendense",
      simulated: "Oefeneksamens",
      science: "Die Wetenskap",
      backToApp: "Terug na Kontroleskerm",
      selectSubject: "Kies 'n vak om tendense te sien",
      viewOnDBE: "Besoek DBO Webwerf vir Amptelike Vraestelle",
      disclaimer: "Amptelike vraestelle is beskikbaar op die DBO webwerf vir verwysing.",
      paperLabel: "Patroon",
      memo: "Memo-styl",
      question: "Eksamen Simulasie",
      mustKnow: "Moet-Ken Onderwerpe (verskyn elke jaar)",
      highFreq: "Hoë Frekwensie Onderwerpe",
      examTips: "Eksamenstrategie",
      comingSoon: "Gesimuleerde eksamens kom binnekort",
      simulatedDesc: "Oefen met oorspronklike KABV-gerigte vrae",
      legalNote: "Ons verskaf gesimuleerde vrae gebaseer op historiese tendense. Amptelike inhoud word slegs ekstern geskakel.",
      year: "Tendens Jaar",
      years: "jaar van tendense",
    },
  };

  const text = t[language];

  const selectedSubjectData = SUBJECTS.find(s => s.code === selectedSubject);
  const patterns = selectedSubject ? TEN_YEAR_PATTERNS[selectedSubject as keyof typeof TEN_YEAR_PATTERNS] : null;

  type IngestedYear = { year: number; papers: number[]; memos: number[] };
  type IngestedSubject = { subject: string; years: IngestedYear[] };
  const { data: ingestedData, isLoading: ingestedLoading } = useQuery<{ subjects: IngestedSubject[] }>({
    queryKey: ["/api/past-papers/list"],
  });
  const ingestedSubjects = ingestedData?.subjects ?? [];

  // Filter SUBJECTS to only those the learner is enrolled in.
  // /api/subjects already returns only the learner's enrolled subjects.
  const { data: enrolledSubjectsRaw } = useQuery<{ code: string }[]>({
    queryKey: ["/api/subjects"],
    select: (data: any[]) => data.map((s) => ({ code: s.code as string })),
  });
  const enrolledCodes = new Set<string>(enrolledSubjectsRaw?.map((s) => s.code) ?? []);
  const visibleSubjects = enrolledCodes.size > 0
    ? SUBJECTS.filter((s) => enrolledCodes.has(s.code))
    : SUBJECTS;

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

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="p-4 border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" data-testid="button-back-dashboard">
                <ChevronLeft className="w-4 h-4 mr-1" />
                {text.backToApp}
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <h1 className="font-semibold text-lg">{text.title}</h1>
                <p className="text-xs text-white">{text.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <Tabs defaultValue="official" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="official" data-testid="tab-official">
              <FileText className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">{text.officialPapers}</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" data-testid="tab-patterns">
              <Sparkles className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">{text.patterns}</span>
            </TabsTrigger>
            <TabsTrigger value="simulated" data-testid="tab-simulated">
              <GraduationCap className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">{text.simulated}</span>
            </TabsTrigger>
            <TabsTrigger value="science" data-testid="tab-science">
              <FlaskConical className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">{text.science}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="official" className="space-y-6">
            <div className="p-4 rounded-lg border border-primary/35 bg-white/[0.08] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-primary-foreground/90">{text.disclaimer}</p>
                <p className="text-xs text-white mt-1">{text.legalNote}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Subjects</CardTitle>
                    <CardDescription>10 {text.years}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
                    {visibleSubjects.map((subject) => (
                      <Button
                        key={subject.code}
                        variant={selectedSubject === subject.code ? "default" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedSubject(subject.code)}
                        data-testid={`button-subject-${subject.code}`}
                      >
                        <Target className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {language === "af" ? subject.nameAf : subject.name}
                        </span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          Trends
                        </Badge>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                {selectedSubjectData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {language === "af" ? selectedSubjectData.nameAf : selectedSubjectData.name}
                        <Badge className="ml-2">
                          Historical Trends
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {text.selectSubject}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {selectedIngested && selectedIngested.years.length > 0 ? (
                          <div className="space-y-3">
                            {selectedIngested.years.map((y) => (
                              <div key={y.year} className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-sm">{y.year}</p>
                                  <Badge variant="outline" className="text-[10px]">
                                    {y.papers.length} {language === "af" ? "vraestelle" : "papers"} · {y.memos.length} {language === "af" ? "memo's" : "memos"}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {y.papers.map((p) => (
                                    <a
                                      key={`p${p}`}
                                      href={fileUrl(selectedIngested.subject, y.year, p, false)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      data-testid={`link-paper-${y.year}-p${p}`}
                                    >
                                      <Button size="sm" variant="default">
                                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                                        {language === "af" ? `Vraestel ${p}` : `Paper ${p}`}
                                      </Button>
                                    </a>
                                  ))}
                                  {y.memos.map((m) => (
                                    <a
                                      key={`m${m}`}
                                      href={fileUrl(selectedIngested.subject, y.year, m, true)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      data-testid={`link-memo-${y.year}-p${m}`}
                                    >
                                      <Button size="sm" variant="outline">
                                        <Check className="w-3.5 h-3.5 mr-1.5" />
                                        {language === "af" ? `Memo ${m}` : `Memo ${m}`}
                                      </Button>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 text-center">
                            <p className="text-white mb-4">
                              {language === "af"
                                ? `Amptelike vraestelle vir ${selectedSubjectData.nameAf} is nog nie opgelaai nie. Besoek die DBO-webwerf.`
                                : `Official papers for ${selectedSubjectData.name} have not been uploaded yet. Visit the DBE website.`}
                            </p>
                            <a
                              href={DBE_BASE_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex"
                            >
                              <Button variant="gradient" data-testid="button-view-dbe">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {text.viewOnDBE}
                              </Button>
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Target className="w-12 h-12 text-white mx-auto mb-4" />
                      <p className="text-white">{text.selectSubject}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Subjects</CardTitle>
                    <CardDescription>Pattern Analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {Object.keys(TEN_YEAR_PATTERNS).map((code) => {
                      const subject = SUBJECTS.find(s => s.code === code);
                      return (
                        <Button
                          key={code}
                          variant={selectedSubject === code ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedSubject(code)}
                          data-testid={`button-pattern-${code}`}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {language === "af" ? subject?.nameAf : subject?.name}
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                {patterns ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Sparkles className="w-5 h-5" />
                          {text.mustKnow}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {patterns.mustKnow.map((topic, i) => (
                            <Badge key={i} className="bg-green-500/20 text-white border-green-500/30">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Calendar className="w-5 h-5" />
                          {text.highFreq}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {patterns.highFrequency.map((topic, i) => (
                            <Badge key={i} variant="outline" className="border-amber-500/30 text-white">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5" />
                          {text.examTips}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white">{patterns.tips}</p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
                      <p className="text-white">{text.selectSubject}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="simulated" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                {language === "af" ? "Gesimuleerde NSC Eksamens" : "Simulated NSC Exams"}
              </h2>
              <p className="text-white">
                {language === "af" 
                  ? "Oorspronklike vrae in NSC-styl. 100% KABV-belyn. Nie gekopieer van DBE nie."
                  : "Original questions in NSC style. 100% CAPS-aligned. Not copied from DBE."}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-green-500/35 bg-white/[0.08] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-start gap-3 mb-6">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">
                  {language === "af" ? "Wetlik Voldoen" : "Legally Compliant"}
                </p>
                <p className="text-xs text-white">
                  {language === "af"
                    ? "Alle vrae is OORSPRONKLIK en GESIMULEER. Amptelike DBE-inhoud word slegs via eksterne skakels verskaf."
                    : "All questions are ORIGINAL and SIMULATED. Official DBE content is only provided via external links."}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleSubjects.map((subject) => {
                const ingested = findIngestedFor(subject.name);
                const available = subject.code === "BUS" || !!ingested;
                return (
                  <Card key={subject.code} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <h3 className="font-semibold truncate">
                          {language === "af" ? subject.nameAf : subject.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase tracking-wide font-bold shrink-0 ${
                            available
                              ? "border-green-500/40 text-green-600"
                              : "border-amber-500/40 text-amber-600"
                          }`}
                        >
                          {available
                            ? (language === "af" ? "Beskikbaar" : "Available")
                            : (language === "af" ? "Binnekort" : "Coming Soon")}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge className="text-xs bg-primary/20 text-primary">CAPS</Badge>
                        <Badge className="text-xs bg-amber-500/20 text-white">NSC-Style</Badge>
                      </div>
                      <Link href={available ? "/bst-exam" : "#"}>
                        <Button className="w-full" size="sm" variant={available ? "default" : "outline"} disabled={!available}>
                          <FileText className="w-4 h-4 mr-2" />
                          {available
                            ? (language === "af" ? "Begin Eksamen" : "Start Exam")
                            : (language === "af" ? "Binnekort" : "Coming Soon")}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="text-center p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-white mb-1">
                  {language === "af" ? "Beskikbaar" : "Available now"}
                </div>
                <p className="text-2xl font-semibold text-white">
                  {visibleSubjects.filter(s => s.code === "BUS" || !!findIngestedFor(s.name)).length}
                  <span className="text-sm font-medium text-white">/{visibleSubjects.length}</span>
                </p>
                <p className="text-[11px] text-white mt-1">
                  {language === "af" ? "Vakke met simulasie" : "Subjects with simulator"}
                </p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-white mb-1">
                  {language === "af" ? "Belyning" : "Alignment"}
                </div>
                <p className="text-2xl font-semibold gradient-text">100%</p>
                <p className="text-[11px] text-white mt-1">
                  {language === "af" ? "KABV-belyn" : "CAPS aligned"}
                </p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-white mb-1">
                  {language === "af" ? "Nasien" : "Marking"}
                </div>
                <p className="text-2xl font-semibold text-white">
                  {language === "af" ? "Outomaties" : "Auto"}
                </p>
                <p className="text-[11px] text-white mt-1">
                  {language === "af" ? "Onmiddellike terugvoer" : "Instant feedback"}
                </p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-white mb-1">
                  {language === "af" ? "Memo's" : "Memos"}
                </div>
                <p className="text-2xl font-semibold text-white">
                  {language === "af" ? "Ingesluit" : "Included"}
                </p>
                <p className="text-[11px] text-white mt-1">
                  {language === "af" ? "Volledige verduidelikings" : "Full explanations"}
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="science" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                {language === "af" ? "Bewese Leermetodes" : "Evidence-Based Learning"}
              </h2>
              <p className="text-white">
                {language === "af" 
                  ? "BrainTrack gebruik navorsing-gesteunde tegnieke wat bewys is om punte te verbeter"
                  : "BrainTrack uses research-backed techniques proven to improve exam scores"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-500/35 bg-white/[0.08]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-6 h-6" />
                    {language === "af" ? "Die Toetseffek" : "The Testing Effect"}
                  </CardTitle>
                  <CardDescription>Roediger & Karpicke, 2006</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    {language === "af"
                      ? "Navorsing toon dat leerders wat hulself toets 50% meer onthou as diegene wat net herlees."
                      : "Research shows students who test themselves retain 50% more than those who just re-read."}
                  </p>
                  <div className="p-3 rounded-lg border border-green-500/30 bg-white/[0.07] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-white" />
                      <span className="font-semibold text-white">
                        {language === "af" ? "Hoe BrainTrack dit gebruik:" : "How BrainTrack uses this:"}
                      </span>
                    </div>
                    <p className="text-xs text-white">
                      {language === "af"
                        ? "Rizz stel vrae in plaas van net inligting te gee. Elke vraag versterk jou geheue."
                        : "Rizz asks questions instead of just giving info. Every question strengthens your memory."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-500/35 bg-white/[0.08]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Repeat className="w-6 h-6" />
                    {language === "af" ? "Gespasieerde Herhaling" : "Spaced Repetition"}
                  </CardTitle>
                  <CardDescription>Ebbinghaus Forgetting Curve</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    {language === "af"
                      ? "Ons vergeet 70% binne 24 uur tensy ons dit op strategiese tye hersien."
                      : "We forget 70% within 24 hours unless we review at strategic intervals."}
                  </p>
                  <div className="p-3 rounded-lg border border-blue-500/30 bg-white/[0.07] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-white" />
                      <span className="font-semibold text-white">
                        {language === "af" ? "Hoe BrainTrack dit gebruik:" : "How BrainTrack uses this:"}
                      </span>
                    </div>
                    <p className="text-xs text-white">
                      {language === "af"
                        ? "Ons skeduleer outomaties hersienings op optimale intervalle gebaseer op jou vordering."
                        : "We automatically schedule reviews at optimal intervals based on your mastery progress."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/35 bg-white/[0.08]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-6 h-6" />
                    {language === "af" ? "Aktiewe Herroeping" : "Active Recall"}
                  </CardTitle>
                  <CardDescription>Cognitive Psychology Research</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    {language === "af"
                      ? "Om inligting aktief te herroep is 2-3x meer effektief as passiewe lees."
                      : "Actively retrieving information is 2-3x more effective than passive reading."}
                  </p>
                  <div className="p-3 rounded-lg border border-cyan-500/30 bg-white/[0.07] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-white" />
                      <span className="font-semibold text-white">
                        {language === "af" ? "Hoe BrainTrack dit gebruik:" : "How BrainTrack uses this:"}
                      </span>
                    </div>
                    <p className="text-xs text-white">
                      {language === "af"
                        ? "Vorige vraestelle dwing jou om antwoorde te herroep - nie net te herken nie."
                        : "Past papers force you to recall answers - not just recognize them."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-500/35 bg-white/[0.08]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-6 h-6" />
                    {language === "af" ? "Leerstvl-Aanpassing" : "Learning Style Adaptation"}
                  </CardTitle>
                  <CardDescription>VARK Model (Fleming, 1987)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    {language === "af"
                      ? "Leerders presteer beter wanneer inhoud by hul voorkeurstyl aangepas word."
                      : "Learners perform better when content is adapted to their preferred learning style."}
                  </p>
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-white/[0.07] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-white" />
                      <span className="font-semibold text-white">
                        {language === "af" ? "Hoe BrainTrack dit gebruik:" : "How BrainTrack uses this:"}
                      </span>
                    </div>
                    <p className="text-xs text-white">
                      {language === "af"
                        ? "Ons identifiseer jou styl (Visueel, Ouditief, Lees/Skryf, Kinesteties) en pas verduidelikings aan."
                        : "We identify your style (Visual, Auditory, Reading/Writing, Kinesthetic) and adapt explanations."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 border-primary/35 bg-white/[0.08]">
              <CardContent className="py-6">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {language === "af" ? "Die Resultaat?" : "The Result?"}
                  </h3>
                  <p className="text-3xl font-semibold gradient-text mb-2">2-3x</p>
                  <p className="text-white">
                    {language === "af"
                      ? "Beter langtermyn retensie vs tradisionele studeermetodes"
                      : "Better long-term retention vs traditional study methods"}
                  </p>
                  <p className="text-xs text-white mt-4">
                    Sources: Roediger & Karpicke (2006), Psychological Science | Ebbinghaus (1885) | Fleming & Mills (1992)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
