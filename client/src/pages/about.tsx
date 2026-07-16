import { PublicNav } from "@/components/public-nav";
import { FooterPageNav, FooterPageHomeButton } from "@/components/footer-page-nav";

import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  Target,
  Shield,
  ArrowRight,
  BarChart3,
  Users,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import { Link } from "wouter";

const t = {
  en: {
    title: "About BrainTrack",
    tagline: "South Africa's Grade 12 Platform",
    heroSub: "Smarter Learning. Real Results.",
    p1: "BrainTrack\u2122 is a South African Grade 12 Matric exam preparation platform designed for CAPS-aligned revision. It combines NSC past exam papers, official-style memos, and a structured weekly revision plan to help learners track progress, find content gaps, and improve exam technique.",
    p2: "Whether you\u2019re preparing for Matric prelims or final NSC exams, BrainTrack\u2122 provides a clear path from \u201cnot sure\u201d to \u201cexam-ready.\u201d Every question, every lesson, and every study plan is designed to prepare learners for exactly what they will face in their exams.",
    p3: "We believe every South African learner deserves access to smart, affordable exam preparation. That is why Brain Boost \u2014 our core learning engine \u2014 is available for just R169/month, with no long-term commitment. Parents can track their child\u2019s progress, and schools can partner with us through our Future Ready Schools programme.",
    missionTitle: "Our Mission",
    missionDesc: "To empower South African learners with strategic, science-backed study tools that turn effort into results. We are building the future of exam preparation — one learner at a time.",
    f1Title: "Learning Science",
    f1Desc: "Every feature is grounded in proven educational research. Spaced repetition, adaptive difficulty, and targeted revision — all working together.",
    f2Title: "Real Exam Patterns",
    f2Desc: "We study 10 years of NSC exam data to identify what gets tested, how it gets tested, and where learners commonly lose marks.",
    f3Title: "CAPS-Aligned Only",
    f3Desc: "100% curriculum coverage. No guessing, no off-topic content. Every question maps directly to CAPS assessment standards.",
    f4Title: "South African Focus",
    f4Desc: "Built specifically for the South African education system. Available in English and Afrikaans, designed for local learners.",
    whyTitle: "What Makes BrainTrack Different",
    why1: "Built on 10 years of real exam pattern data",
    why2: "Powered by learning science, not just content delivery",
    why3: "Personalised study plans that adapt daily",
    why4: "Instant marking with clear, actionable feedback",
    why5: "Gamified progress with XP, levels, and badges",
    why6: "Rizz — a smart support agent to keep learners on track",
    why7: "Mobile-first, teen-friendly design with theme options",
    why8: "Affordable at R169/month with optional power-ups",
    schoolsTitle: "Future Ready Schools",
    schoolsDesc: "We partner with schools across South Africa to boost exam performance, track learner progress digitally, and support targeted intervention. Smarter learners, stronger results.",
    popia: "Your data is protected under POPIA (Protection of Personal Information Act, 2013). We only collect information necessary for learning and never share it with third parties.",
    cta: "Start Learning Smarter",
    ctaLoggedIn: "Go to My Classroom",
  },
  af: {
    title: "Oor BrainTrack",
    tagline: "Suid-Afrika se Graad 12 Platform",
    heroSub: "Slimmer Leer. Regte Resultate.",
    p1: "BrainTrack\u2122 is 'n Suid-Afrikaanse Graad 12 Matriek eksamenvoorbereidingsplatform vir KABV-belynde hersiening. Dit kombineer NSC vorige eksamenvraestelle, memo-ondersteuning en 'n gestruktureerde weeklikse hersieningsplan om leerders te help om vordering te volg, inhoud-leemtes te identifiseer, en eksamentegniek te verbeter.",
    p2: "Of dit nou vir voorlopige eksamens of die finale NSC is \u2014 BrainTrack\u2122 gee 'n duidelike, praktiese pad na beter punte. Elke vraag, elke les, en elke studieplan is ontwerp om leerders voor te berei vir presies wat hulle in hul eksamens sal teekom.",
    p3: "Ons glo elke Suid-Afrikaanse leerder verdien toegang tot slim, bekostigbare eksamenvoorbereiding. Daarom is Brain Boost \u2014 ons kern leer-enjin \u2014 beskikbaar vir slegs R169/maand, sonder langtermyn-verpligting. Ouers kan hul kind se vordering volg, en skole kan met ons vennoot deur ons Future Ready Schools-program.",
    missionTitle: "Ons Missie",
    missionDesc: "Om Suid-Afrikaanse leerders te bemagtig met strategiese, wetenskaplik-ondersteunde studiegereedskap wat inspanning in resultate omskep. Ons bou die toekoms van eksamenvoorbereiding — een leerder op 'n slag.",
    f1Title: "Leerwetenskap",
    f1Desc: "Elke kenmerk is gegrond op bewese opvoedkundige navorsing. Gespasieerde herhaling, aanpasbare moeilikheidsgraad, en geteikende hersiening — alles werk saam.",
    f2Title: "Regte Eksamenpatrone",
    f2Desc: "Ons bestudeer 10 jaar se NSC-eksamendata om te identifiseer wat getoets word, hoe dit getoets word, en waar leerders algemeen punte verloor.",
    f3Title: "Slegs KABV-Belyn",
    f3Desc: "100% kurrikulum-dekking. Geen raaiwerk, geen irrelevante inhoud nie. Elke vraag karteer direk na KABV-assesseringstandaarde.",
    f4Title: "Suid-Afrikaanse Fokus",
    f4Desc: "Spesifiek gebou vir die Suid-Afrikaanse onderwysstelsel. Beskikbaar in Engels en Afrikaans, ontwerp vir plaaslike leerders.",
    whyTitle: "Wat Maak BrainTrack Anders",
    why1: "Gebou op 10 jaar se werklike eksamenpatroondata",
    why2: "Aangedryf deur leerwetenskap, nie net inhoudlewering nie",
    why3: "Persoonlike studieplanne wat daagliks aanpas",
    why4: "Onmiddellike nasien met duidelike, uitvoerbare terugvoer",
    why5: "Spelagtige vordering met XP, vlakke en kentekens",
    why6: "Rizz — 'n slim ondersteuningsagent om leerders op koers te hou",
    why7: "Mobiel-eerste, tienervriendelike ontwerp met tema-opsies",
    why8: "Bekostigbaar teen R169/maand met opsionele krag-opgradings",
    schoolsTitle: "Future Ready Schools",
    schoolsDesc: "Ons vennoot met skole regoor Suid-Afrika om eksamenprestasie te verhoog, leerdervordering digitaal te volg, en geteikende ingryping te ondersteun. Slimmer leerders, sterker resultate.",
    popia: "Jou data word beskerm volgens die POPIA-wet (Wet op Beskerming van Persoonlike Inligting, 2013). Ons versamel slegs inligting wat nodig is vir leer en deel dit nooit met derde partye nie.",
    cta: "Begin Slimmer Leer",
    ctaLoggedIn: "My Klaskamer",
  },
};

const pillars = [
  { icon: Brain, titleKey: "f1Title" as const, descKey: "f1Desc" as const, color: "text-cyan-600", bg: "bg-cyan-500/10" },
  { icon: BarChart3, titleKey: "f2Title" as const, descKey: "f2Desc" as const, color: "text-cyan-600", bg: "bg-cyan-500/10" },
  { icon: BookOpen, titleKey: "f3Title" as const, descKey: "f3Desc" as const, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  { icon: Target, titleKey: "f4Title" as const, descKey: "f4Desc" as const, color: "text-pink-600", bg: "bg-pink-500/10" },
];

const whyPoints = ["why1", "why2", "why3", "why4", "why5", "why6", "why7", "why8"] as const;

const aboutBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://braintrack.co.za/" },
    { "@type": "ListItem", "position": 2, "name": "About", "item": "https://braintrack.co.za/about" },
  ],
};

export default function AboutPage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  useSEO({
    title: "About BrainTrack™ | Grade 12 CAPS Matric Revision Platform",
    description: "BrainTrack™ is South Africa's Grade 12 Matric exam prep platform — CAPS-aligned weekly plans, 10 years of NSC past papers with memos, AI tutor, and progress tracking.",
    canonical: "https://braintrack.co.za/about",
    ogTitle: "About BrainTrack™ — South Africa's Grade 12 Matric Prep Platform",
    ogDescription: "BrainTrack™ combines CAPS-aligned weekly plans, 10 years of NSC past papers, AI tutor Rizz, and progress tracking to help Grade 12 learners improve Matric marks.",
    ogUrl: "https://braintrack.co.za/about",
    jsonLd: aboutBreadcrumb,
  });
  const c = t[language];

  const ctaHref = isAuthenticated ? "/classroom" : "/subscribe";
  const ctaLabel = isAuthenticated ? c.ctaLoggedIn : c.cta;

  return (
    <div className="dark min-h-screen bg-black text-white">
      <PublicNav />
      <main className="relative pt-14 pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.35), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 right-0 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,43,214,0.3), transparent 70%)" }}
        />
        <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "#7FEFFF", textShadow: "0 0 8px rgba(0,229,255,0.5)" }} data-testid="text-about-tagline">
              {c.tagline}
            </p>
            <h1 className="font-black text-3xl sm:text-4xl leading-tight text-white mb-4" data-testid="text-about-title">
              <span className="gradient-text">{c.title}</span>
            </h1>
            <p className="text-white font-medium max-w-2xl mx-auto" data-testid="text-about-hero-sub">
              {c.heroSub}
            </p>
          </div>

          <Card className="mb-8 shadow-sm rounded-2xl" data-testid="card-about-description">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-pink-500 rounded-t-2xl" />
            <CardContent className="p-5 space-y-4">
              <p className="text-white leading-relaxed font-medium" data-testid="text-about-p1">{c.p1}</p>
              <p className="text-white leading-relaxed font-medium" data-testid="text-about-p2">{c.p2}</p>
              <p className="text-white leading-relaxed font-medium" data-testid="text-about-p3">{c.p3}</p>
            </CardContent>
          </Card>

          <Card className="mb-8 shadow-sm rounded-2xl" data-testid="card-mission">
            <CardContent className="p-5 text-center">
              <GraduationCap className="h-8 w-8 text-cyan-600 mx-auto mb-3" />
              <h2 className="font-semibold mb-3 text-white" data-testid="text-mission-title">
                <span className="gradient-text">{c.missionTitle}</span>
              </h2>
              <p className="text-white font-medium leading-relaxed max-w-2xl mx-auto" data-testid="text-mission-desc">
                {c.missionDesc}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {pillars.map((f, i) => {
              const Icon = f.icon;
              return (
                <Card key={i} className="hover-elevate rounded-2xl" data-testid={`card-pillar-${i}`}>
                  <CardContent className="p-5 space-y-3">
                    <div className={`w-10 h-10 rounded-xl ${f.bg} border border-cyan-500/25 flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="font-semibold text-white" data-testid={`text-pillar-title-${i}`}>
                      {c[f.titleKey]}
                    </h3>
                    <p className="text-white font-medium leading-relaxed" data-testid={`text-pillar-desc-${i}`}>
                      {c[f.descKey]}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mb-8 shadow-sm rounded-2xl" data-testid="card-why-different">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-5 text-center text-white" data-testid="text-why-title">
                <span className="gradient-text">{c.whyTitle}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whyPoints.map((key, i) => (
                  <div key={i} className="flex items-start gap-3" data-testid={`text-why-point-${i}`}>
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-white font-medium">{c[key as keyof typeof c]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 shadow-sm rounded-2xl" data-testid="card-schools">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-cyan-500/25">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white" data-testid="text-schools-title">{c.schoolsTitle}</p>
                <p className="text-white font-medium leading-relaxed" data-testid="text-schools-desc">{c.schoolsDesc}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm mb-8 rounded-2xl" data-testid="card-popia-notice">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-cyan-500/25">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">Privacy & Security</p>
                <p className="text-white font-medium leading-relaxed" data-testid="text-popia-notice">{c.popia}</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href={ctaHref} data-testid="link-signup-child">
              <Button size="lg" className="px-8 font-semibold rounded-2xl shadow-lg">
                {ctaLabel}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <FooterPageHomeButton />

        </section>
      </main>
    </div>
  );
}
