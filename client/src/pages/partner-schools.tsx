import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Building2,
  MapPin,
  Users,
  GraduationCap,
  Mail,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle2,
  TrendingUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";
import { apiRequest } from "@/lib/queryClient";

// ──────────────────────────────────────────────────────────────────────────────
// Bilingual copy
// ──────────────────────────────────────────────────────────────────────────────
const T = {
  en: {
    seoTitle: "Partner Schools | BrainTrack — Bring AI tutoring to your classroom",
    seoDesc:
      "Join South African schools partnering with BrainTrack to give every Grade 12 learner an AI tutor, DBE past papers and real exam readiness. Apply for the school programme.",
    heroEyebrow: "For Principals & Heads of Department",
    heroTitle: "Bring AI exam-prep into every Grade 12 classroom",
    heroSubtitle:
      "BrainTrack partners with South African schools to give every learner a personal AI tutor, official DBE past papers and live progress tracking — fully aligned to the NSC CAPS curriculum.",
    heroCtaPrimary: "Apply for partnership",
    heroCtaSecondary: "See partner schools",
    trustStripTitle: "Built for South African classrooms",
    trustItems: [
      "NSC CAPS-aligned",
      "DBE past papers 2015–2025",
      "English & Afrikaans",
      "POPIA-compliant",
    ],
    statsTitle: "The BrainTrack school network",
    statSchools: "Partner schools",
    statProvinces: "Provinces represented",
    statLearners: "Learners supported",
    whyTitle: "Why schools partner with BrainTrack",
    whyItems: [
      {
        icon: "tutor",
        title: "A 24/7 tutor for every learner",
        body:
          "Personalised hints, memo explanations and full worked solutions on every NSC topic — even after the bell rings.",
      },
      {
        icon: "papers",
        title: "Official DBE papers, ready to practise",
        body:
          "Every released NSC paper from 2015–2025, with marking memos and instant feedback. No more chasing PDFs.",
      },
      {
        icon: "insights",
        title: "Class & cohort insights",
        body:
          "See readiness, mastery and engagement per subject — so you can intervene before the prelims, not after.",
      },
      {
        icon: "safe",
        title: "Safe, private, ad-free",
        body:
          "POPIA-compliant data handling. No advertising, no data resale. Learner data stays with the school.",
      },
    ],
    showcaseTitle: "Schools already on the journey",
    showcaseSubtitle:
      "A growing network of South African schools using BrainTrack with their Grade 12 cohort.",
    filterAll: "All provinces",
    filterLabel: "Filter by province",
    searchPlaceholder: "Search by school name…",
    showcaseEmpty: "No partner schools to show yet — yours could be the first.",
    showcaseError: "We couldn't load the partner schools just now. Please try again in a moment.",
    showcaseRetry: "Try again",
    loadMore: "Show more",
    endorsedBadge: "Endorsed",
    learnersLabel: "learners",
    testimonialsTitle: "What partner schools say",
    testimonials: [
      {
        quote:
          "Our Maths and Sciences learners practise official DBE papers every week. The AI tutor explains memos in plain language — it's like having an extra teacher in every subject.",
        name: "HOD, Western Cape high school",
      },
      {
        quote:
          "We can finally see which topics the cohort is struggling with before the prelims. That alone changed how we plan revision week.",
        name: "Principal, Gauteng high school",
      },
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        q: "What does it cost the school?",
        a: "There is no setup or licence fee for the school. Families subscribe directly — schools receive a referral code and a free admin dashboard with cohort progress.",
      },
      {
        q: "Is BrainTrack aligned to the CAPS curriculum?",
        a: "Yes. Every subject, topic and past paper follows the official NSC CAPS document. Content is curated from DBE-released material.",
      },
      {
        q: "Which languages are supported?",
        a: "The full learner experience is available in English and Afrikaans. Additional official languages are on the roadmap.",
      },
      {
        q: "How is learner data protected?",
        a: "BrainTrack is POPIA-compliant. Data is stored in South Africa-relevant infrastructure, never sold, and access is restricted to authenticated school admins.",
      },
      {
        q: "How long does onboarding take?",
        a: "Once we receive your application a member of our team reaches out within two business days to schedule a 30-minute walkthrough.",
      },
    ],
    formTitle: "Apply for the school programme",
    formSubtitle:
      "Tell us a little about your school and we'll be in touch within two business days.",
    formSchool: "School name",
    formContact: "Your full name",
    formEmail: "Work email",
    formPhone: "Phone (optional)",
    formLearners: "Grade 12 learners (optional)",
    errSchool: "Please enter your school name (at least 2 characters).",
    errContact: "Please enter your full name (at least 2 characters).",
    errEmail: "Please enter a valid email address.",
    errFix: "Please check the highlighted fields.",
    formSubmit: "Submit application",
    formSubmitting: "Submitting…",
    formSuccessTitle: "Thank you!",
    formSuccessBody:
      "Your application has been received. We'll be in touch within two business days.",
    formErrorTitle: "We couldn't submit your application",
    formErrorBody: "Please check your details and try again.",
    formPrivacy:
      "By submitting you agree to be contacted about the BrainTrack school programme. We never share your details.",
    footerTitle: "Ready to give every learner an AI tutor?",
    footerSubtitle:
      "Join the partner programme — or explore the platform first as a learner or parent.",
    footerCtaPrimary: "Apply for partnership",
    footerCtaSecondary: "Explore BrainTrack",
  },
  af: {
    seoTitle: "Vennootskole | BrainTrack — Bring AI-tutorskap na jou klaskamer",
    seoDesc:
      "Sluit aan by Suid-Afrikaanse skole wat met BrainTrack saamwerk om elke Graad 12-leerder 'n AI-tutor, DBO vraestelle en regte eksamengereedheid te gee.",
    heroEyebrow: "Vir Skoolhoofde & Departementshoofde",
    heroTitle: "Bring AI-eksamenvoorbereiding na elke Graad 12-klaskamer",
    heroSubtitle:
      "BrainTrack werk saam met Suid-Afrikaanse skole om elke leerder 'n persoonlike AI-tutor, amptelike DBO vraestelle en lewendige vorderingsdop te gee — heeltemal in lyn met die NSS CAPS-kurrikulum.",
    heroCtaPrimary: "Doen aansoek vir vennootskap",
    heroCtaSecondary: "Sien vennootskole",
    trustStripTitle: "Gebou vir Suid-Afrikaanse klaskamers",
    trustItems: [
      "NSS CAPS-belyn",
      "DBO vraestelle 2015–2025",
      "Engels & Afrikaans",
      "POPIA-voldoende",
    ],
    statsTitle: "Die BrainTrack-skoolnetwerk",
    statSchools: "Vennootskole",
    statProvinces: "Provinsies verteenwoordig",
    statLearners: "Leerders ondersteun",
    whyTitle: "Hoekom skole met BrainTrack vennoot",
    whyItems: [
      {
        icon: "tutor",
        title: "'n 24/7 tutor vir elke leerder",
        body:
          "Persoonlike wenke, memo-verduidelikings en volledige oplossings op elke NSS-onderwerp — selfs ná die skoolklok.",
      },
      {
        icon: "papers",
        title: "Amptelike DBO vraestelle, gereed om te oefen",
        body:
          "Elke vrygestelde NSS-vraestel van 2015–2025, met memo's en onmiddellike terugvoer.",
      },
      {
        icon: "insights",
        title: "Klas- en kohort-insig",
        body:
          "Sien gereedheid, bemeestering en betrokkenheid per vak — sodat jy voor die voorlopiges kan intree.",
      },
      {
        icon: "safe",
        title: "Veilig, privaat, advertensie-vry",
        body:
          "POPIA-voldoende databehandeling. Geen advertensies, geen herverkoping. Leerderdata bly by die skool.",
      },
    ],
    showcaseTitle: "Skole wat reeds saamreis",
    showcaseSubtitle:
      "'n Groeiende netwerk van Suid-Afrikaanse skole wat BrainTrack met hul Graad 12-kohort gebruik.",
    filterAll: "Alle provinsies",
    filterLabel: "Filtreer per provinsie",
    searchPlaceholder: "Soek volgens skoolnaam…",
    showcaseEmpty: "Nog geen vennootskole nie — joune kan die eerste wees.",
    showcaseError: "Ons kon nie nou die vennootskole laai nie. Probeer asseblief 'n oomblik later.",
    showcaseRetry: "Probeer weer",
    loadMore: "Wys meer",
    endorsedBadge: "Onderskryf",
    learnersLabel: "leerders",
    testimonialsTitle: "Wat vennootskole sê",
    testimonials: [
      {
        quote:
          "Ons Wiskunde- en Wetenskap-leerders oefen elke week amptelike DBO vraestelle. Die AI-tutor verduidelik memo's in eenvoudige taal — dis soos 'n ekstra onderwyser in elke vak.",
        name: "Departementshoof, Wes-Kaap hoërskool",
      },
      {
        quote:
          "Ons kan uiteindelik sien met watter onderwerpe die kohort sukkel vóór die voorlopiges. Net dit alleen het ons hersieningsweek verander.",
        name: "Skoolhoof, Gauteng hoërskool",
      },
    ],
    faqTitle: "Algemene vrae",
    faqs: [
      {
        q: "Wat kos dit die skool?",
        a: "Daar is geen opstel- of lisensiefooi vir die skool nie. Gesinne teken direk in — skole kry 'n verwysingskode en 'n gratis administrasie-dashboard met kohortvordering.",
      },
      {
        q: "Is BrainTrack in lyn met die CAPS-kurrikulum?",
        a: "Ja. Elke vak, onderwerp en vraestel volg die amptelike NSS CAPS-dokument. Inhoud word uit DBO-materiaal saamgestel.",
      },
      {
        q: "Watter tale word ondersteun?",
        a: "Die volledige leerder-ervaring is in Engels en Afrikaans beskikbaar. Bykomende amptelike tale is op die padkaart.",
      },
      {
        q: "Hoe word leerderdata beskerm?",
        a: "BrainTrack is POPIA-voldoende. Data word in Suid-Afrika-relevante infrastruktuur gestoor, nooit verkoop nie, en toegang is beperk tot geverifieerde skooladministrateurs.",
      },
      {
        q: "Hoe lank neem dit om aan boord te kom?",
        a: "Sodra ons jou aansoek ontvang, kontak 'n spanlid jou binne twee werksdae om 'n 30-minute deurloop te skeduleer.",
      },
    ],
    formTitle: "Doen aansoek vir die skoolprogram",
    formSubtitle:
      "Vertel ons 'n bietjie meer oor jou skool en ons kom binne twee werksdae terug na jou.",
    formSchool: "Skoolnaam",
    formContact: "Jou volle naam",
    formEmail: "Werks-e-pos",
    formPhone: "Telefoon (opsioneel)",
    formLearners: "Graad 12-leerders (opsioneel)",
    errSchool: "Voer asseblief jou skoolnaam in (ten minste 2 karakters).",
    errContact: "Voer asseblief jou volle naam in (ten minste 2 karakters).",
    errEmail: "Voer asseblief 'n geldige e-posadres in.",
    errFix: "Kontroleer asseblief die uitgelig velde.",
    formSubmit: "Dien aansoek in",
    formSubmitting: "Stuur tans…",
    formSuccessTitle: "Dankie!",
    formSuccessBody:
      "Ons het jou aansoek ontvang. Ons kom binne twee werksdae terug na jou.",
    formErrorTitle: "Ons kon nie jou aansoek indien nie",
    formErrorBody: "Kontroleer asseblief jou besonderhede en probeer weer.",
    formPrivacy:
      "Deur in te dien stem jy in om gekontak te word oor die BrainTrack-skoolprogram. Ons deel nooit jou besonderhede nie.",
    footerTitle: "Gereed om elke leerder 'n AI-tutor te gee?",
    footerSubtitle:
      "Sluit aan by die vennootprogram — of verken die platform eers as 'n leerder of ouer.",
    footerCtaPrimary: "Doen aansoek vir vennootskap",
    footerCtaSecondary: "Verken BrainTrack",
  },
} as const;

const PAGE_SIZE = 12;

interface PublicSchool {
  id: number;
  name: string;
  province: string | null;
  district: string | null;
  schoolType: string;
  learnerCount: number | null;
  endorsed: boolean;
}

interface PublicPayload {
  schools: PublicSchool[];
  stats: {
    totalSchools: number;
    totalProvinces: number;
    totalLearners: number;
  };
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "S";
}

function whyIcon(key: string) {
  const cls = "h-6 w-6 text-primary";
  switch (key) {
    case "tutor":
      return <Sparkles className={cls} aria-hidden="true" />;
    case "papers":
      return <GraduationCap className={cls} aria-hidden="true" />;
    case "insights":
      return <TrendingUp className={cls} aria-hidden="true" />;
    case "safe":
      return <Shield className={cls} aria-hidden="true" />;
    default:
      return <CheckCircle2 className={cls} aria-hidden="true" />;
  }
}

export default function PartnerSchools() {
  const { language } = useLanguage();
  const t = T[language];
  const { toast } = useToast();

  useSEO({
    title: t.seoTitle,
    description: t.seoDesc,
    canonical: "https://braintrack.co.za/partner-schools",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "BrainTrack",
      url: "https://braintrack.co.za",
      description: t.seoDesc,
      offers: {
        "@type": "Offer",
        name: "BrainTrack School Partnership Programme",
        category: "Education",
        availability: "https://schema.org/InStock",
      },
    },
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery<PublicPayload>({
    queryKey: ["/api/partner-schools/public"],
    staleTime: 60_000,
  });

  const [province, setProvince] = useState<string>("__all__");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const list = data?.schools ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((s) => {
      if (province !== "__all__" && s.province !== province) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, province, search]);

  const shown = filtered.slice(0, visible);
  const canShowMore = visible < filtered.length;

  // ── Form state ─────────────────────────────────────────────────────────────
  // The server endpoint /api/school/onboarding only accepts schoolName,
  // contactPerson, email, phone?, numLearners? — we mirror that shape exactly
  // rather than overloading existing fields with extra data.
  const [schoolName, setSchoolName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [numLearners, setNumLearners] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    schoolName?: string;
    contactPerson?: string;
    email?: string;
  }>({});

  const submitMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        schoolName: schoolName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
      };
      if (phone.trim()) body.phone = phone.trim();
      const learners = parseInt(numLearners, 10);
      if (!Number.isNaN(learners) && learners > 0) body.numLearners = learners;
      const res = await apiRequest("POST", "/api/school/onboarding", body);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: t.formSuccessTitle, description: t.formSuccessBody });
    },
    onError: (err: any) => {
      toast({
        title: t.formErrorTitle,
        description: err?.message?.includes(":")
          ? err.message.split(":").slice(1).join(":").trim()
          : t.formErrorBody,
        variant: "destructive",
      });
    },
  });

  const validate = (): boolean => {
    const errs: typeof formErrors = {};
    if (!schoolName.trim() || schoolName.trim().length < 2) errs.schoolName = t.errSchool;
    if (!contactPerson.trim() || contactPerson.trim().length < 2) errs.contactPerson = t.errContact;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!email.trim() || !emailOk) errs.email = t.errEmail;
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitMutation.isPending) return;
    if (!validate()) {
      toast({
        title: t.formErrorTitle,
        description: t.errFix,
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate();
  };

  const provincesAvailable = useMemo(() => {
    const set = new Set<string>();
    (data?.schools ?? []).forEach((s) => {
      if (s.province) set.add(s.province);
    });
    return Array.from(set).sort();
  }, [data]);

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="page-partner-schools">
      <PublicNav />

      {/* HERO */}
      <section className="relative px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p
            className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary"
            data-testid="hero-eyebrow"
          >
            {t.heroEyebrow}
          </p>
          <h1
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            data-testid="hero-title"
          >
            {t.heroTitle}
          </h1>
          <p
            className="mx-auto mb-10 max-w-3xl text-lg text-muted-foreground sm:text-xl"
            data-testid="hero-subtitle"
          >
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="prismglass-btn min-h-[44px] w-full sm:w-auto"
              onClick={() => {
                document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              data-testid="button-hero-apply"
            >
              {t.heroCtaPrimary}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-[44px] w-full sm:w-auto"
              onClick={() => {
                document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              data-testid="button-hero-showcase"
            >
              {t.heroCtaSecondary}
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8" aria-label={t.trustStripTitle}>
        <div className="mx-auto max-w-5xl">
          <div className="prismglass-panel flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl p-5">
            {t.trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground/90">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="sr-only">{t.statsTitle}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Building2 className="h-5 w-5 text-primary" aria-hidden="true" />}
              label={t.statSchools}
              value={stats?.totalSchools ?? null}
              isLoading={isLoading}
              testId="stat-schools"
            />
            <StatCard
              icon={<MapPin className="h-5 w-5 text-primary" aria-hidden="true" />}
              label={t.statProvinces}
              value={stats?.totalProvinces ?? null}
              isLoading={isLoading}
              testId="stat-provinces"
            />
            <StatCard
              icon={<Users className="h-5 w-5 text-primary" aria-hidden="true" />}
              label={t.statLearners}
              value={stats?.totalLearners ?? null}
              isLoading={isLoading}
              testId="stat-learners"
            />
          </div>
        </div>
      </section>

      {/* WHY PARTNER */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-10 text-center text-3xl font-bold sm:text-4xl"
            data-testid="why-title"
          >
            {t.whyTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {t.whyItems.map((item) => (
              <div
                key={item.title}
                className="prismglass-panel rounded-2xl p-6"
                data-testid={`why-item-${item.icon}`}
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  {whyIcon(item.icon)}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE SHOWCASE */}
      <section id="showcase" className="px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="showcase-title">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2
              id="showcase-title"
              className="mb-3 text-3xl font-bold sm:text-4xl"
            >
              {t.showcaseTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">{t.showcaseSubtitle}</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Label htmlFor="school-search" className="sr-only">
                {t.searchPlaceholder}
              </Label>
              <Input
                id="school-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(PAGE_SIZE);
                }}
                placeholder={t.searchPlaceholder}
                className="pl-9"
                data-testid="input-school-search"
              />
            </div>
            <div className="w-full sm:w-64">
              <Label htmlFor="province-filter" className="sr-only">
                {t.filterLabel}
              </Label>
              <Select
                value={province}
                onValueChange={(v) => {
                  setProvince(v);
                  setVisible(PAGE_SIZE);
                }}
              >
                <SelectTrigger id="province-filter" data-testid="select-province">
                  <SelectValue placeholder={t.filterAll} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t.filterAll}</SelectItem>
                  {provincesAvailable.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* States */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="prismglass-panel flex flex-col items-center gap-4 rounded-2xl p-10 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
              <p className="text-muted-foreground">{t.showcaseError}</p>
              <Button onClick={() => refetch()} disabled={isFetching} data-testid="button-retry-schools">
                {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {t.showcaseRetry}
              </Button>
            </div>
          ) : shown.length === 0 ? (
            <div className="prismglass-panel rounded-2xl p-10 text-center text-muted-foreground">
              {t.showcaseEmpty}
            </div>
          ) : (
            <>
              <ul
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                data-testid="schools-grid"
              >
                {shown.map((s) => (
                  <li
                    key={s.id}
                    className="prismglass-panel flex h-full flex-col rounded-2xl p-5"
                    data-testid={`school-card-${s.id}`}
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-base font-semibold text-primary">
                        {initialsOf(s.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-foreground">{s.name}</h3>
                        {s.province ? (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            <span className="truncate">
                              {s.district ? `${s.district}, ${s.province}` : s.province}
                            </span>
                          </p>
                        ) : null}
                      </div>
                      {s.endorsed ? (
                        <span
                          className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                          aria-label={t.endorsedBadge}
                        >
                          {t.endorsedBadge}
                        </span>
                      ) : null}
                    </div>
                    {s.learnerCount ? (
                      <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        {s.learnerCount.toLocaleString()} {t.learnersLabel}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>

              {canShowMore ? (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    data-testid="button-load-more"
                  >
                    {t.loadMore}
                    <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">
            {t.testimonialsTitle}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {t.testimonials.map((tm, i) => (
              <figure
                key={i}
                className="prismglass-panel rounded-2xl p-6"
                data-testid={`testimonial-${i}`}
              >
                <blockquote className="mb-4 text-base leading-relaxed text-foreground">
                  &ldquo;{tm.quote}&rdquo;
                </blockquote>
                <figcaption className="text-sm text-muted-foreground">— {tm.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">
            {t.faqTitle}
          </h2>
          <div className="space-y-3">
            {t.faqs.map((f, i) => (
              <details
                key={i}
                className="prismglass-panel group rounded-2xl p-5"
                data-testid={`faq-${i}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground">
                  {f.q}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* APPLY FORM */}
      <section id="apply" className="px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="apply-title">
        <div className="mx-auto max-w-3xl">
          <div className="prismglass-panel rounded-2xl p-6 sm:p-10">
            <div className="mb-6 text-center">
              <h2
                id="apply-title"
                className="mb-2 text-3xl font-bold sm:text-4xl"
              >
                {t.formTitle}
              </h2>
              <p className="text-muted-foreground">{t.formSubtitle}</p>
            </div>

            {submitted ? (
              <div
                className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center"
                role="status"
                aria-live="polite"
                data-testid="apply-success"
              >
                <CheckCircle2
                  className="mx-auto mb-3 h-10 w-10 text-primary"
                  aria-hidden="true"
                />
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  {t.formSuccessTitle}
                </h3>
                <p className="text-sm text-muted-foreground">{t.formSuccessBody}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="apply-school" className="mb-1.5 block">
                      {t.formSchool} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="apply-school"
                      value={schoolName}
                      onChange={(e) => {
                        setSchoolName(e.target.value);
                        if (formErrors.schoolName) setFormErrors((x) => ({ ...x, schoolName: undefined }));
                      }}
                      required
                      autoComplete="organization"
                      maxLength={200}
                      aria-invalid={!!formErrors.schoolName}
                      aria-describedby={formErrors.schoolName ? "err-school" : undefined}
                      data-testid="input-school-name"
                    />
                    {formErrors.schoolName ? (
                      <p id="err-school" className="mt-1 text-xs text-destructive" data-testid="err-school">
                        {formErrors.schoolName}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="apply-contact" className="mb-1.5 block">
                      {t.formContact} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="apply-contact"
                      value={contactPerson}
                      onChange={(e) => {
                        setContactPerson(e.target.value);
                        if (formErrors.contactPerson) setFormErrors((x) => ({ ...x, contactPerson: undefined }));
                      }}
                      required
                      autoComplete="name"
                      maxLength={200}
                      aria-invalid={!!formErrors.contactPerson}
                      aria-describedby={formErrors.contactPerson ? "err-contact" : undefined}
                      data-testid="input-contact-person"
                    />
                    {formErrors.contactPerson ? (
                      <p id="err-contact" className="mt-1 text-xs text-destructive" data-testid="err-contact">
                        {formErrors.contactPerson}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="apply-email" className="mb-1.5 block">
                      {t.formEmail} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="apply-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) setFormErrors((x) => ({ ...x, email: undefined }));
                      }}
                      required
                      autoComplete="email"
                      maxLength={200}
                      aria-invalid={!!formErrors.email}
                      aria-describedby={formErrors.email ? "err-email" : undefined}
                      data-testid="input-email"
                    />
                    {formErrors.email ? (
                      <p id="err-email" className="mt-1 text-xs text-destructive" data-testid="err-email">
                        {formErrors.email}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="apply-phone" className="mb-1.5 block">
                      {t.formPhone}
                    </Label>
                    <Input
                      id="apply-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      maxLength={50}
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apply-learners" className="mb-1.5 block">
                      {t.formLearners}
                    </Label>
                    <Input
                      id="apply-learners"
                      type="number"
                      min={1}
                      max={100000}
                      value={numLearners}
                      onChange={(e) => setNumLearners(e.target.value)}
                      data-testid="input-num-learners"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">{t.formPrivacy}</p>

                <Button
                  type="submit"
                  size="lg"
                  className="prismglass-btn min-h-[44px] w-full"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      {t.formSubmitting}
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t.formSubmit}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="prismglass-panel rounded-2xl p-8 text-center sm:p-12">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
              {t.footerTitle}
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">{t.footerSubtitle}</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="prismglass-btn min-h-[44px] w-full sm:w-auto"
                onClick={() => {
                  document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                data-testid="button-footer-apply"
              >
                {t.footerCtaPrimary}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-[44px] w-full sm:w-auto"
                data-testid="button-footer-explore"
              >
                <Link href="/">{t.footerCtaSecondary}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  isLoading,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  isLoading: boolean;
  testId: string;
}) {
  return (
    <div className="prismglass-panel rounded-2xl p-6 text-center" data-testid={testId}>
      <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <div className="text-3xl font-bold text-foreground sm:text-4xl">
        {isLoading ? (
          <Skeleton className="mx-auto h-9 w-20" />
        ) : value === null ? (
          "—"
        ) : (
          value.toLocaleString()
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
