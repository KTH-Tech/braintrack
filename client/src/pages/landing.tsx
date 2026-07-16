import { PublicNav } from "@/components/public-nav";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, Sparkles, Globe, Calculator, Leaf, Briefcase, Receipt, Atom, GraduationCap, RefreshCw, TrendingUp, Users, BookOpen, Target, Zap, Shield, CheckCircle, BarChart3, Calendar, Trophy, Flame, LineChart, ArrowRight, CreditCard, Star, Check, ChevronDown, HelpCircle, Lock } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

import { BrainTrackLogo } from "@/components/braintrack-logo";
import { ExamCountdown } from "@/components/exam-countdown";
import { AnimatedIcon, type AnimatedIconName } from "@/components/animated-icon";
import { SALandmarkScene } from "@/components/sa-landmark-scene";
import { GraffitiSplats } from "@/components/graffiti-splats";
import novaIcon from "@assets/ChatGPT_Image_Mar_5,_2026,_10_44_55_AM_1772701049699.png";
import { useRolePromptNav } from "@/components/role-prompt-modal";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const translations = {
  en: {
    hero: {
      title: "Matric prep that actually moves your marks.",
      titleBase: "Matric prep that actually moves your",
      titleAccent: "marks.",
      subtitle: "A weekly plan that maps to CAPS, 10 years of real NSC papers with memos, an AI tutor that actually gets you, and parent reports that don't collect dust. R169 a month.",
      secondary: "",
      subtext: "",
      tagline: "",
      cta: "Start my 14 free days",
      urgency: "Prelims are around the corner. Don't wing it.",
      trustBadges: ["CAPS-Aligned", "10 Years of Papers", "AI That Gets You", "Parent Loop-In", "Built in SA"],
      pills: ["PRACTISE", "IMPROVE", "ACHIEVE"],
    },
    nova: {
      badge: "Interactive demo",
      title: "Meet Rizz — Your Smart Tutor",
      subtitle: "Tap a subject below to see how Rizz helps learners",
      features: [
        "Guides you through the tough bits",
        "Breaks down the next step",
        "Keeps you moving, not guessing",
      ],
      studentQ: "Student question:",
      thinking: "Rizz thinking...",
      response: "Rizz response:",
      retry: "Let me try another way...",
      seeThinking: "See Rizz think",
      seeResponse: "See the answer",
      dontUnderstand: "Still not clicking",
      tryAnother: "Try another",
      tryAnotherQ: "Try another question",
    },
    facts: {
      title: "Made for Grade 12. Built for marks.",
      title2: "",
      items: [
        "A weekly CAPS plan so you stop asking 'what do I study tonight?'",
        "Real NSC papers with memos — you practise the exam, not the textbook",
        "A readiness tracker that flags weak topics before the exam does",
        "Prelims and finals loops that actually rep the work",
        "Exam technique drills so you stop leaving easy marks on the table",
        "Parents stay in the loop — without being 'that parent'",
      ],
      tagline: "You set it up. They do the work. Everyone sees the jump.",
    },
    everything: {
      title: "What's inside BrainTrack",
      cards: [
        {
          title: "Weekly Study Plan",
          items: ["A real Grade 12 roadmap", "Small daily reps that add up", "No more last-minute panic"],
        },
        {
          title: "Real NSC Papers + Memos",
          items: ["Practise the exam, not the textbook", "Build speed and confidence", "See exactly where marks leak"],
        },
        {
          title: "Weak-Spot Tracker",
          items: ["Flags the topics costing you marks", "Tells you what to do next", "Your Matric-readiness score at a glance"],
        },
        {
          title: "Smart Revision Loop",
          items: ["Study → practise → check memo", "Fix it → repeat → level up", "The loop top scorers actually use"],
        },
      ],
    },
    products: {
      title: "Two ways in. Same full access.",
      subtitle: "Monthly, or one payment that covers you to the final exam.",
      cta: "Start 14 days free",
      items: [
        {
          name: "Brain Boost",
          price: "R169",
          period: "/month",
          desc: "Full access — everything you need for Matric, month by month",
          badge: "Most Popular",
          highlight: true,
          trial: "14 days free",
          features: [
            "Real NSC papers + memos (2015–2025)",
            "Rizz — your AI tutor, CAPS-aligned",
            "Progress tracking that actually makes sense",
            "Crunch Time drills that adapt to you",
            "Study calendar that fits your week",
            "Cancel anytime",
          ],
        },
        {
          // PRICE PLACEHOLDER — confirm final Season Pass price before launch.
          name: "Season Pass",
          price: "R699",
          period: "once-off · to 30 Nov",
          desc: "One payment. Everything in Brain Boost, all the way to your final exam.",
          badge: "Best Value",
          highlight: false,
          features: [
            "Everything in Brain Boost",
            "Covers the full exam season — July to 30 November",
            "One payment, no monthly debits",
            "Locked-in price for the whole season",
          ],
        },
      ],
    },
    trial: {
      badge: "14 days free Brain Boost access",
      title: "14 days free. Card needed.",
      subtitle: "Drop in your card to unlock Brain Boost right now. You won't be charged for 14 days — cancel before Day 15 and it stays R0.",
      day1: "Day 1–14",
      day1Label: "Full Brain Boost access — R0 charged.",
      day15: "Day 15",
      day15Label: "First payment of R169 — cancel any time before.",
      price: "R169/month",
      priceNote: "after your 14 free days",
      cta: "Start 14 days free",
      included: [
        "Every subject and every CAPS topic",
        "Rizz — unlimited AI tutoring",
        "Crunch Time exam practice",
        "Progress tracking + XP",
        "Weekly parent reports",
      ],
    },
    howItWorks: {
      title: "How it works",
      steps: [
        "Drop your card in to unlock 14 free days of Brain Boost",
        "Pick your Grade 12 subjects",
        "Take a quick starter quiz so we know where you're at",
        "Get a study plan that fits your actual week",
        "Show up daily — even 20 minutes counts",
        "Day 15: R169/month kicks in. Cancel any time before then.",
      ],
      tagline: "No chaos. No guessing. Just steady progress.",
    },
    parents: {
      title: "Built for learners. Loved by parents.",
      items: [
        "Weekly progress reports — straight to your inbox",
        "See exactly where your child is losing marks",
        "Clear focus for the week, and what to do next",
        "Walk into prelims and finals without the panic",
      ],
      tagline: "Less stress. More control. Real results.",
    },
    schools: {
      title: "Your school earns. Your learners win.",
      items: [
        "R35 per active learner, every month — paid to your school",
        "Lift your NSC results, not your workload",
        "Learners get full Brain Boost access — zero cost to the school",
        "No setup fees, no lock-ins — just share your link",
      ],
      tagline: "Learners level up. Your school gets paid. Easy.",
    },
    faq: {
      title: "Things you probably want to ask",
      items: [
        { q: "So what is BrainTrack, exactly?", a: "It's a Grade 12 study app built for CAPS and the NSC exam. You get a weekly plan, 10 years of real past papers with memos, an AI tutor called Rizz, and weekly parent reports — all of it aimed at one thing: shifting your Matric marks." },
        { q: "What does it cost?", a: "Brain Boost is R169/month with 14 days free — cancel before Day 15 and you pay nothing. Or grab the Season Pass: one once-off payment that covers everything to 30 November, no monthly debits." },
        { q: "Are my subjects in there?", a: "If you're writing it, we've got it. Maths, Physical Sciences, Life Sciences, Accounting, Business Studies, Geography, History, English and Afrikaans — all the core Grade 12 CAPS subjects are live." },
        { q: "Are these real NSC papers?", a: "Yep — 10 years of actual NSC exam papers (2015–2025) with the official memos. You're practising the real thing, not a watered-down version." },
        { q: "How does Rizz actually work?", a: "Rizz is an AI tutor that breaks things down step by step in English or Afrikaans. It picks up where you're strong, where you're shaky, and explains it at your level — not generically." },
        { q: "Can parents see what's going on?", a: "Yes — weekly reports showing study time, accuracy, weak topics and what to focus on next. No spying, just clarity." },
        { q: "Is the whole thing in Afrikaans?", a: "Volledig. Switch between English and Afrikaans any time — even Rizz replies in both, fluently." },
        { q: "How do I cancel?", a: "From your account, two clicks. Cancel during the 14 free days and you're not charged a cent. No lock-ins, no drama." },
      ],
    },
    bottomCta: {
      title: "Close the gaps before prelims hit.",
      subtitle: "Real NSC papers, a CAPS plan that fits your week, and a tracker that shows exactly where marks are leaking. Walk into prelims knowing you're ready.",
      cta: "Start my 14 free days",
    },
    rating: {
      score: "4.9",
      outOf: "out of 5",
      source: "2025 Pilot Group",
      heading: "How learners rate us",
      subtitle: "Based on real feedback from our 2025 pilot group",
      features: [
        { name: "Past Papers & Memos", score: 4.9 },
        { name: "Study Plan Quality", score: 4.8 },
        { name: "Daily Challenges", score: 4.7 },
        { name: "Rizz (AI Tutor)", score: 4.8 },
        { name: "Progress Tracking", score: 4.6 },
        { name: "Ease of Use", score: 4.9 },
      ],
    },
    footer: {
      tagline: "Matric NSC preparation built on 10 years of real exam papers — built for South African learners.",
      copyright: "© 2026 BrainTrack™",
    },
  },
  af: {
    hero: {
      title: "Matriekvoorbereiding wat regtig punte skuif.",
      titleBase: "Matriekvoorbereiding wat regtig punte",
      titleAccent: "skuif.",
      subtitle: "'n Weekplan wat by KABV inpas, 10 jaar se regte NSS-vraestelle met memo's, 'n KI-tutor wat jou verstaan, en ouerverslae wat jy eintlik gaan lees. R169 per maand.",
      secondary: "",
      subtext: "",
      tagline: "",
      cta: "Begin my 14 gratis dae",
      urgency: "Voorlopige eksamens is om die draai. Moenie dit waag nie.",
      trustBadges: ["KABV-Belyn", "10 Jaar Vraestelle", "KI Wat Jou Ken", "Ouer-Inskakeling", "Trots SA"],
      pills: ["OEFEN", "VERBETER", "PRESTEER"],
    },
    nova: {
      badge: "Kyk hoe Rizz werk",
      title: "Ontmoet Rizz — Jou Slim Tutor",
      subtitle: "Tik op 'n vak hieronder en sien hoe Rizz help",
      features: [
        "Lei jou deur die moeilike stukke",
        "Wys die volgende stap",
        "Hou jou aan die beweeg, nie aan die raai",
      ],
      studentQ: "Leerder se vraag:",
      thinking: "Rizz dink...",
      response: "Rizz se antwoord:",
      retry: "Kom ons probeer dit anders...",
      seeThinking: "Sien Rizz dink",
      seeResponse: "Sien die antwoord",
      dontUnderstand: "Dit klik nog nie",
      tryAnother: "Probeer iets anders",
      tryAnotherQ: "Probeer nog 'n vraag",
    },
    facts: {
      title: "Gemaak vir Graad 12. Gebou vir punte.",
      title2: "",
      items: [
        "'n Weeklikse KABV-plan sodat jy ophou vra 'wat studeer ek vanaand?'",
        "Regte NSS-vraestelle met memo's — jy oefen die eksamen, nie die handboek",
        "'n Gereedheidsnaspoor wat swak onderwerpe uitlig voor die eksamen dit doen",
        "Voorlopige- en finale-eksamen lusse wat die werk regtig vasmaak",
        "Eksamentegniek-oefeninge sodat jy ophou om maklike punte weg te gee",
        "Ouers bly ingelig — sonder om 'daardie ouer' te wees",
      ],
      tagline: "Jy stel dit op. Hulle sit die werk in. Almal sien die sprong.",
    },
    everything: {
      title: "Wat's binne BrainTrack",
      cards: [
        {
          title: "Weeklikse Studieplan",
          items: ["'n Regte Graad 12 padkaart", "Klein daaglikse sessies wat optel", "Geen laaste-minuut paniek"],
        },
        {
          title: "Regte NSS-Vraestelle + Memo's",
          items: ["Oefen die eksamen, nie die handboek", "Bou spoed en selfvertroue", "Sien presies waar punte weglek"],
        },
        {
          title: "Swakpunt-Naspoor",
          items: ["Merk die onderwerpe wat jou punte kos", "Sê vir jou wat om volgende te doen", "Jou matriek-gereedheid met een kyk"],
        },
        {
          title: "Slim Hersieningslus",
          items: ["Leer → oefen → kyk memo", "Regstel → herhaal → gaan op", "Die lus wat top-presteerders regtig gebruik"],
        },
      ],
    },
    products: {
      title: "Twee maniere in. Dieselfde volle toegang.",
      subtitle: "Maandeliks, of een betaling wat jou tot die finale eksamen dek.",
      cta: "Begin 14 gratis dae",
      items: [
        {
          name: "Brain Boost",
          price: "R169",
          period: "/maand",
          desc: "Volle toegang — alles wat jy vir Matriek nodig het, maand vir maand",
          badge: "Gewildste",
          highlight: true,
          trial: "14 dae gratis",
          features: [
            "Regte NSS-vraestelle + memo's (2015–2025)",
            "Rizz — jou KI-tutor, KABV-belyn",
            "Vorderingsnaspoor wat sin maak",
            "Eksamentyd-drille wat by jou aanpas",
            "Studiekalender wat by jou week pas",
            "Kanselleer enige tyd",
          ],
        },
        {
          // PRYS-PLEKHOUER — bevestig finale Seisoenpas-prys voor bekendstelling.
          name: "Seisoenpas",
          price: "R699",
          period: "eenmalig · tot 30 Nov",
          desc: "Een betaling. Alles in Brain Boost, tot en met jou finale eksamen.",
          badge: "Beste Waarde",
          highlight: false,
          features: [
            "Alles in Brain Boost",
            "Dek die volle eksamenseisoen — Julie tot 30 November",
            "Een betaling, geen maandelikse debiete",
            "Vaste prys vir die hele seisoen",
          ],
        },
      ],
    },
    trial: {
      badge: "14 dae gratis Brain Boost-toegang",
      title: "14 dae gratis. Kaart nodig.",
      subtitle: "Laai jou kaart in en ontsluit Brain Boost nou. Geen heffing vir 14 dae — kanselleer voor Dag 15 en dit bly R0.",
      day1: "Dag 1–14",
      day1Label: "Volle Brain Boost-toegang — R0 gehef.",
      day15: "Dag 15",
      day15Label: "Eerste betaling van R169 — kanselleer enige tyd voor dan.",
      price: "R169/maand",
      priceNote: "ná jou 14 gratis dae",
      cta: "Begin 14 gratis dae",
      included: [
        "Elke vak en elke KABV-onderwerp",
        "Rizz — onbeperkte KI-tutor",
        "Eksamentyd eksamenpraktyk",
        "Vorderingsnaspoor + XP",
        "Weeklikse ouerverslae",
      ],
    },
    howItWorks: {
      title: "Hoe dit werk",
      steps: [
        "Laai jou kaart in om 14 gratis Brain Boost-dae te ontsluit",
        "Kies jou Graad 12-vakke",
        "Doen 'n vinnige basiese vasvra sodat ons weet waar jy is",
        "Kry 'n studieplan wat by jou werklike week pas",
        "Daag op, elke dag — selfs 20 minute tel",
        "Dag 15: R169/maand skop in. Kanselleer enige tyd voor dan.",
      ],
      tagline: "Geen chaos. Geen raaiwerk. Net bestendige vordering.",
    },
    parents: {
      title: "Gebou vir leerders. Geliefd deur ouers.",
      items: [
        "Weeklikse vorderingsverslae — reguit na jou inboks",
        "Sien presies waar jou kind punte verloor",
        "Duidelike fokus vir die week, en wat om volgende te doen",
        "Stap in voorlopige eksamens en finale in sonder die paniek",
      ],
      tagline: "Minder stres. Meer beheer. Regte resultate.",
    },
    schools: {
      title: "Jou skool verdien. Jou leerders wen.",
      items: [
        "R35 per aktiewe leerder, elke maand — uitbetaal aan jou skool",
        "Lig jou NSS-uitslae, nie jou werklading nie",
        "Leerders kry volle Brain Boost-toegang — nul koste vir die skool",
        "Geen opstelkoste, geen sluitings — deel net jou skakel",
      ],
      tagline: "Leerders groei. Jou skool word betaal. Maklik.",
    },
    faq: {
      title: "Goed wat jy waarskynlik wil vra",
      items: [
        { q: "So wat is BrainTrack presies?", a: "Dis 'n Graad 12-studie-app wat gebou is vir KABV en die NSS-eksamen. Jy kry 'n weekplan, 10 jaar se regte vorige vraestelle met memo's, 'n KI-tutor genaamd Rizz, en weeklikse ouerverslae — alles gerig op een ding: jou Matriekpunte skuif." },
        { q: "Wat kos dit?", a: "Brain Boost is R169/maand met 14 dae gratis — kanselleer voor Dag 15 en jy betaal niks. Of kry die Seisoenpas: een eenmalige betaling wat alles tot 30 November dek, geen maandelikse debiete nie." },
        { q: "Is my vakke daar in?", a: "As jy dit skryf, het ons dit. Wiskunde, Fisiese Wetenskappe, Lewenswetenskappe, Rekeningkunde, Besigheidstudies, Geografie, Geskiedenis, Engels en Afrikaans — al die kern Graad 12 KABV-vakke is lewend." },
        { q: "Is dit regte NSS-vraestelle?", a: "Ja — 10 jaar se egte NSS-eksamenvraestelle (2015–2025) met die amptelike memo's. Jy oefen die regte ding, nie 'n verwaterde weergawe nie." },
        { q: "Hoe werk Rizz eintlik?", a: "Rizz is 'n KI-tutor wat dinge stap vir stap afbreek in Engels of Afrikaans. Hy sien waar jy sterk is, waar jy bewe, en verduidelik op jou vlak — nie generies nie." },
        { q: "Kan ouers sien wat aangaan?", a: "Ja — weeklikse verslae wat studietyd, akkuraatheid, swak onderwerpe en die volgende fokus wys. Geen afloer, net helderheid." },
        { q: "Is dit ook in Afrikaans?", a: "Volledig. Wissel enige tyd tussen Engels en Afrikaans — selfs Rizz antwoord in albei, vlot." },
        { q: "Hoe kanselleer ek?", a: "Vanaf jou rekening, twee kliks. Kanselleer binne die 14 gratis dae en jy word nie 'n sent gehef nie. Geen sluitings, geen drama." },
      ],
    },
    bottomCta: {
      title: "Vul die gapings voor voorlopige eksamens slaan.",
      subtitle: "Regte NSS-vraestelle, 'n KABV-plan wat by jou week pas, en 'n naspoor wat presies wys waar punte weglek. Stap voorlopige eksamens in en weet jy's reg.",
      cta: "Begin my 14 gratis dae",
    },
    rating: {
      score: "4.9",
      outOf: "uit 5",
      source: "2025 Loodsgroep",
      heading: "Hoe leerders ons punt",
      subtitle: "Gebaseer op regte terugvoer van ons 2025 loodsgroep",
      features: [
        { name: "Vorige Vraestelle & Memo's", score: 4.9 },
        { name: "Studieplan Kwaliteit", score: 4.8 },
        { name: "Daaglikse Uitdagings", score: 4.7 },
        { name: "Rizz (KI-tutor)", score: 4.8 },
        { name: "Vorderingsnasporing", score: 4.6 },
        { name: "Gebruiksgemak", score: 4.9 },
      ],
    },
    footer: {
      tagline: "NSC-matriekvoorbereiding gebou op 10 jaar se werklike vraestelle — gemaak vir Suid-Afrikaanse leerders.",
      copyright: "© 2026 BrainTrack™",
    },
  },
};

const demoQuestions = {
  en: [
    {
      subject: "Maths",
      question: "I don't understand how to calculate the derivative of f(x) = 3x² + 2x - 5",
      thinking: "→ Identifying topic: Calculus - Differentiation (CAPS Term 1)\n→ Cognitive level: Routine procedure\n→ Checking student mastery: 62% (Amber band)\n→ Detecting learning style: Visual learner\n→ Adapting response: Step-by-step with diagrams",
      response: "Great question! Let's use the power rule for differentiation:\n\nFor xⁿ, the derivative is n·xⁿ⁻¹\n\nStep 1: 3x² → 3(2)x¹ = 6x\nStep 2: 2x → 2(1)x⁰ = 2\nStep 3: -5 → 0 (constants disappear)\n\n∴ f'(x) = 6x + 2",
      followUp: "Let me explain it even simpler!\n\nThink of the power rule like this:\n'Bring the power down, reduce by 1'\n\n3x² means '3 times x squared'\n• Bring the 2 down: 2 × 3 = 6\n• Reduce power: 2-1 = 1\n• Result: 6x¹ = 6x\n\nThe -5 has no x, so it vanishes!\n\nTry this one: What's the derivative of 4x³?"
    },
    {
      subject: "Physics",
      question: "How do I apply Newton's Second Law to calculate acceleration?",
      thinking: "→ Identifying topic: Physics - Newton's Laws (CAPS Term 2)\n→ Cognitive level: Application\n→ Checking student mastery: 74% (Amber band)\n→ Adapting response: Formula breakdown with notes",
      response: "Newton's Second Law states: F = ma\n\nWhere:\n• F = Net force (in Newtons, N)\n• m = Mass (in kg)\n• a = Acceleration (in m/s²)\n\nTo find acceleration: a = F/m\n\nExample: A 5kg object with 20N force:\na = 20N ÷ 5kg = 4 m/s²",
      followUp: "Let's make it super simple!\n\nThink of pushing a shopping trolley:\n• More force (push harder) = faster acceleration\n• More mass (heavier trolley) = slower acceleration\n\nThe formula a = F/m tells us:\nAcceleration = Force ÷ Mass\n\nReal example: You push with 10N on a 2kg ball\na = 10 ÷ 2 = 5 m/s²\n\nThe ball speeds up by 5 m/s every second!"
    },
    {
      subject: "Accounting",
      question: "What goes on a Balance Sheet and how do I balance it?",
      thinking: "→ Identifying topic: Accounting - Balance Sheet (CAPS Term 3)\n→ Cognitive level: Understanding\n→ Checking student mastery: 58% (Amber band)\n→ Adapting response: Hands-on practice format",
      response: "A Balance Sheet shows financial position at a specific date.\n\nStructure:\nASSETS = OWNER'S EQUITY + LIABILITIES\n\nAssets (what you own):\n• Non-current: Equipment, vehicles\n• Current: Cash, debtors, stock\n\nOwner's Equity: Capital + Retained income\nLiabilities: Creditors, loans\n\nIt MUST always balance!",
      followUp: "Think of it like a see-saw!\n\nLeft side: What you OWN (Assets)\nRight side: Where the money CAME FROM\n\nExample: You start a tuckshop\n• R5,000 your savings (Capital)\n• R2,000 borrowed from mom (Loan)\n• Total: R7,000\n\nWhat do you have?\n• R4,000 stock\n• R3,000 cash\n• Total: R7,000\n\nSee? Both sides = R7,000. It balances!"
    },
    {
      subject: "Life Sciences",
      question: "How does mitosis differ from meiosis?",
      thinking: "→ Identifying topic: Cell Division (CAPS Term 1)\n→ Cognitive level: Understanding\n→ Checking student mastery: 71% (Amber band)\n→ Adapting response: Comparison diagram format",
      response: "Great comparison question!\n\nMitosis (growth/repair):\n• 1 division → 2 identical cells\n• Diploid (2n) → Diploid (2n)\n• Body cells\n\nMeiosis (reproduction):\n• 2 divisions → 4 unique cells\n• Diploid (2n) → Haploid (n)\n• Sex cells (gametes)\n\nKey: Meiosis = genetic diversity!",
      followUp: "Easy memory trick!\n\nMitosis = 'My Twin Is Same'\nMakes copies of yourself - like photocopying!\nUsed for growing taller, healing wounds\n\nMeiosis = 'Makes Eggs/sperm, Inherits Only Some'\nMakes half-cells that mix genes\nUsed for making babies\n\nRemember: You need HALF (23) from mom + HALF (23) from dad = FULL (46 chromosomes)!"
    },
    {
      subject: "Geography",
      question: "What causes the formation of tropical cyclones?",
      thinking: "→ Identifying topic: Climatology - Tropical Cyclones (CAPS Term 2)\n→ Cognitive level: Application\n→ Checking student mastery: 65% (Amber band)\n→ Adapting response: Story-based explanation",
      response: "Tropical cyclones form when:\n\n1. Warm ocean water (>26°C)\n2. Coriolis effect (5° from equator)\n3. Low pressure system develops\n4. Moist air rises rapidly\n5. Condensation releases heat\n6. Spiral bands form around eye\n\nRemember: They rotate anti-clockwise in Southern Hemisphere!",
      followUp: "Think of it like a giant spinning top!\n\n1. The ocean is like a hot bath (>26°C)\n2. Steam rises (moist air goes up)\n3. As it rises, it spins (Coriolis effect)\n4. More steam joins = bigger spin\n5. The middle stays calm (the eye)\n\nIn SA, cyclones spin like water going down a drain - anti-clockwise!\n\nThey die when they hit land because there's no more warm water fuel."
    },
    {
      subject: "Business",
      question: "What's the difference between gross profit and net profit?",
      thinking: "→ Identifying topic: Income Statement (CAPS Term 2)\n→ Cognitive level: Understanding\n→ Checking student mastery: 68% (Amber band)\n→ Adapting response: Clear definitions with examples",
      response: "Simple breakdown:\n\nGross profit:\nSales - Cost of Sales = Gross Profit\n(Before operating expenses)\n\nNet profit:\nGross Profit - Operating Expenses = Net Profit\n(Final profit after ALL costs)\n\nExample: R100k sales, R60k cost, R25k expenses\nGross = R40k, Net = R15k",
      followUp: "Imagine you sell koeksisters!\n\nYou sell 100 for R10 each = R1,000\nIngredients cost R400\n\nGross profit = R1,000 - R400 = R600\n(Money left after making the product)\n\nBut wait! You also paid:\n• R100 for electricity\n• R50 for packaging\n\nNet profit = R600 - R150 = R450\n(What you actually keep in your pocket!)\n\nNet is your REAL profit after everything."
    }
  ],
  af: [
    {
      subject: "Wiskunde",
      question: "Ek verstaan nie hoe om die afgeleide van f(x) = 3x² + 2x - 5 te bereken nie",
      thinking: "→ Identifiseer onderwerp: Calculus - Differensiasie (KABV Kwartaal 1)\n→ Kognitiewe vlak: Roetine prosedure\n→ Kontroleer leerder bemeestering: 62% (Amber band)\n→ Kies verduidelikingstyl: Geleide metode met voorbeelde",
      response: "Goeie vraag! Kom ons gebruik die magreël vir differensiasie:\n\nVir xⁿ, is die afgeleide n·xⁿ⁻¹\n\nStap 1: 3x² → 3(2)x¹ = 6x\nStap 2: 2x → 2(1)x⁰ = 2\nStap 3: -5 → 0 (konstantes verdwyn)\n\n∴ f'(x) = 6x + 2",
      followUp: "Laat ek dit nog eenvoudiger verduidelik!\n\nDink aan die magreël so:\n'Bring die mag af, verminder met 1'\n\n3x² beteken '3 maal x kwadraat'\n• Bring 2 af: 2 × 3 = 6\n• Verminder mag: 2-1 = 1\n• Resultaat: 6x¹ = 6x\n\nDie -5 het geen x nie, so dit verdwyn!\n\nProbeer hierdie een: Wat is die afgeleide van 4x³?"
    },
    {
      subject: "Fisika",
      question: "Hoe pas ek Newton se Tweede Wet toe om versnelling te bereken?",
      thinking: "→ Identifiseer onderwerp: Fisika - Newton se Wette (KABV Kwartaal 2)\n→ Kognitiewe vlak: Toepassing\n→ Kontroleer leerder bemeestering: 74% (Amber band)\n→ Kies verduidelikingstyl: Formule verduideliking",
      response: "Newton se Tweede Wet lui: F = ma\n\nWaar:\n• F = Netto krag (in Newton, N)\n• m = Massa (in kg)\n• a = Versnelling (in m/s²)\n\nOm versnelling te vind: a = F/m\n\nVoorbeeld: 'n 5kg voorwerp met 20N krag:\na = 20N ÷ 5kg = 4 m/s²",
      followUp: "Kom ons maak dit super eenvoudig!\n\nDink aan 'n inkopietrollie stoot:\n• Meer krag (stoot harder) = vinniger versnelling\n• Meer massa (swaarder trollie) = stadiger versnelling\n\nDie formule a = F/m sê:\nVersnelling = Krag ÷ Massa\n\nRegte voorbeeld: Jy stoot met 10N op 'n 2kg bal\na = 10 ÷ 2 = 5 m/s²\n\nDie bal versnel met 5 m/s elke sekonde!"
    },
    {
      subject: "Rekeningkunde",
      question: "Wat gaan op 'n Balansstaat en hoe balanseer ek dit?",
      thinking: "→ Identifiseer onderwerp: Rekeningkunde - Balansstaat (KABV Kwartaal 3)\n→ Kognitiewe vlak: Begrip\n→ Kontroleer leerder bemeestering: 58% (Amber band)\n→ Kies verduidelikingstyl: Struktuur uiteensetting",
      response: "'n Balansstaat wys finansiële posisie op 'n spesifieke datum.\n\nStruktuur:\nBates = Eienaarsbelang + Laste\n\nBates (wat jy besit):\n• Nie-bedryfsbates: Toerusting, voertuie\n• Bedryfsbates: Kontant, debiteure, voorraad\n\nEienaarsbelang: Kapitaal + Behoue inkomste\nLaste: Krediteure, lenings\n\nDit MOET altyd balanseer!",
      followUp: "Dink daaraan soos 'n wipplank!\n\nLinker kant: Wat jy BESIT (Bates)\nRegter kant: Waar die geld VANDAAN kom\n\nVoorbeeld: Jy begin 'n snoepwinkel\n• R5,000 jou spaargeld (Kapitaal)\n• R2,000 geleen by ma (Lening)\n• Totaal: R7,000\n\nWat het jy?\n• R4,000 voorraad\n• R3,000 kontant\n• Totaal: R7,000\n\nSien jy? Beide kante = R7,000. Dit balanseer!"
    },
    {
      subject: "Lewenswetenskappe",
      question: "Hoe verskil mitose van meiose?",
      thinking: "→ Identifiseer onderwerp: Seldeling (KABV Kwartaal 1)\n→ Kognitiewe vlak: Begrip\n→ Kontroleer leerder bemeestering: 71% (Amber band)\n→ Kies verduidelikingstyl: Vergelykingstabel",
      response: "Goeie vergelykingsvraag!\n\nMitose (groei/herstel):\n• 1 verdeling → 2 identiese selle\n• Diploïed (2n) → Diploïed (2n)\n• Liggaamselle\n\nMeiose (voortplanting):\n• 2 verdelings → 4 unieke selle\n• Diploïed (2n) → Haploïed (n)\n• Geslagselle (gamete)\n\nSleutel: Meiose = genetiese diversiteit!",
      followUp: "Maklike geheuetruuk!\n\nMitose = 'My Tweeling Is Soortgelyk'\nMaak kopiëe van jouself - soos fotokopieer!\nGebruik vir groei, wonde genees\n\nMeiose = 'Maak Eiers/sperm, Inheriet Ongelyke Stof'\nMaak halfsselle wat gene meng\nGebruik vir babas maak\n\nOnthou: Jy nodig HELFTE (23) van ma + HELFTE (23) van pa = VOL (46 chromosome)!"
    },
    {
      subject: "Geografie",
      question: "Wat veroorsaak die vorming van tropiese siklone?",
      thinking: "→ Identifiseer onderwerp: Klimatologie - Tropiese Siklone (KABV Kwartaal 2)\n→ Kognitiewe vlak: Toepassing\n→ Kontroleer leerder bemeestering: 65% (Amber band)\n→ Kies verduidelikingstyl: Proses verduideliking",
      response: "Tropiese siklone vorm wanneer:\n\n1. Warm seewater (>26°C)\n2. Coriolis-effek (5° vanaf ewenaar)\n3. Laedrukstelsel ontwikkel\n4. Vogtige lug styg vinnig\n5. Kondensasie stel hitte vry\n6. Spiraal bande vorm om oog\n\nOnthou: Hulle draai anti-kloksgewys in Suidelike Halfrond!",
      followUp: "Dink daaraan soos 'n reuse tol!\n\n1. Die see is soos 'n warm bad (>26°C)\n2. Stoom styg (vogtige lug gaan op)\n3. Soos dit styg, draai dit (Coriolis-effek)\n4. Meer stoom sluit aan = groter draai\n5. Die middel bly kalm (die oog)\n\nIn SA draai siklone soos water wat afloop - anti-kloksgewys!\n\nHulle sterf wanneer hulle land tref want daar's geen warm water brandstof meer nie."
    },
    {
      subject: "Besigheid",
      question: "Wat is die verskil tussen bruto wins en netto wins?",
      thinking: "→ Identifiseer onderwerp: Inkomstestaat (KABV Kwartaal 2)\n→ Kognitiewe vlak: Begrip\n→ Kontroleer leerder bemeestering: 68% (Amber band)\n→ Kies verduidelikingstyl: Formule uiteensetting",
      response: "Eenvoudige uiteensetting:\n\nBruto wins:\nVerkope - Koste van Verkope = Bruto Wins\n(Voor bedryfsuitgawes)\n\nNetto wins:\nBruto Wins - Bedryfsuitgawes = Netto Wins\n(Finale wins na ALLE koste)\n\nVoorbeeld: R100k verkope, R60k koste, R25k uitgawes\nBruto = R40k, Netto = R15k",
      followUp: "Stel jou voor jy verkoop koeksisters!\n\nJy verkoop 100 vir R10 elk = R1,000\nBestanddele kos R400\n\nBruto wins = R1,000 - R400 = R600\n(Geld oor na die produk maak)\n\nMaar wag! Jy het ook betaal:\n• R100 vir elektrisiteit\n• R50 vir verpakking\n\nNetto wins = R600 - R150 = R450\n(Wat jy regtig in jou sak hou!)\n\nNetto is jou REGTE wins na alles."
    }
  ]
};

const everythingIcons: AnimatedIconName[] = ["book", "target", "calendar-check", "trophy"];

export default function LandingPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  useSEO({
    title: "BrainTrack™ | Grade 12 Matric Past Papers, Memos & AI Tutor — South Africa",
    description: "Pass Matric with confidence. 10 years of NSC past papers + memos, CAPS-aligned weekly study plan, AI tutor, NSC 2026 exam timetable and parent reports. Built for SA Grade 12. R169/month — 14 days free.",
    canonical: "https://braintrack.co.za/",
    ogTitle: "Matric Past Papers, Memos & AI Tutor for Grade 12 SA | BrainTrack™",
    ogDescription: "10 years of NSC past papers + memos, CAPS-aligned weekly revision, AI tutor and parent reports. Built for South African Matric learners. R169/month — 14 days free.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "BrainTrack",
        "url": "https://braintrack.co.za",
        "logo": "https://braintrack.co.za/favicon.png",
        "description":
          "Grade 12 Matric exam preparation platform — CAPS-aligned study plans, NSC past papers with memos, AI tutor, and progress tracking for South African learners.",
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "learn@kth-tech.com",
          "contactType": "customer support",
          "availableLanguage": ["English", "Afrikaans"],
        },
        "areaServed": { "@type": "Country", "name": "South Africa" },
        "sameAs": [],
      },
      // FAQPage rich-result schema — every question/answer below is keyword-
      // tuned for high-volume SA Matric searches ("matric past papers",
      // "NSC 2026", "matric rewrite", "Afrikaans matric"). Google promotes
      // these as collapsible answers in search results.
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Where can I download Grade 12 NSC past papers and memos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "BrainTrack gives you 10 years of official DBE NSC Grade 12 past exam papers (2015–2025) with memorandums for every CAPS subject — Mathematics, Physical Sciences, Life Sciences, English HL/FAL, Afrikaans Huistaal/EAT, Accounting, Business Studies, Geography, History and more. Browse them free at braintrack.co.za/past-papers.",
            },
          },
          {
            "@type": "Question",
            "name": "How much does BrainTrack cost for Matric learners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Brain Boost is R169 per month with a 14-day free trial. It unlocks every Grade 12 subject, the AI tutor, full past-paper practice, weekly parent reports and the CAPS-aligned study plan. Cancel anytime.",
            },
          },
          {
            "@type": "Question",
            "name": "Is BrainTrack CAPS-aligned for the South African NSC exams?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Yes. Every weekly study plan, topic note, flashcard and practice quiz is built around the official CAPS curriculum for the National Senior Certificate (NSC) — the same exams written nationally in October/November.",
            },
          },
          {
            "@type": "Question",
            "name": "Does BrainTrack work in Afrikaans?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Ja. BrainTrack is volledig tweetalig — alle vraestelle, memorandums, notas en die KI-tutor werk in Engels én Afrikaans. Skakel net die taal in instellings.",
            },
          },
          {
            "@type": "Question",
            "name": "Can BrainTrack help with Matric prelim and trial exam prep?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Yes. The same DBE NSC past papers your school uses for prelims and trials are available for practice, and the weekly study plan re-weights your time toward your weakest topics so prelim revision is focused, not scattered.",
            },
          },
          {
            "@type": "Question",
            "name": "Do parents get progress reports?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Yes. Linked parents receive a weekly progress email showing the learner's study minutes, mastered topics, weak topics, streak and overall Matric readiness — and a live parent dashboard inside the app.",
            },
          },
          {
            "@type": "Question",
            "name": "When are the NSC 2026 final exams?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "The Department of Basic Education writes the NSC final exams between late October and early December 2026. BrainTrack ships an in-app NSC exam timetable so learners can build a study plan that lands on the right date.",
            },
          },
        ],
      },
    ],
  });
  const [demoQuestion, setDemoQuestion] = useState(0);
  const [demoStep, setDemoStep] = useState(0);
  const t = translations[language];
  const { handleCta, modal } = useRolePromptNav();

  const heroAnim = useInView(0.1);
  const featuresAnim = useInView();
  const pricingAnim = useInView();
  const rizzAnim = useInView();
  const parentsAnim = useInView();
  const schoolsAnim = useInView();
  const faqAnim = useInView();
  const ctaAnim = useInView();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="pt-14 overflow-x-hidden">

        <section className="relative overflow-hidden py-8 sm:py-12 md:py-16 bg-background">
          <GraffitiSplats variant="hero" opacity={0.55} />
          <div ref={heroAnim.ref} className={`relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${heroAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div
              className="relative overflow-hidden rounded-[32px] bg-background p-4 sm:p-12 md:p-16"
              style={{
                border: "1.5px solid #00E5FF",
                boxShadow:
                  "0 0 0 1px rgba(0,229,255,0.35), 0 0 60px rgba(0,229,255,0.45), inset 0 0 50px rgba(0,0,0,0.7)",
              }}
            >
              <div
                aria-hidden
                className="absolute top-0 left-0 right-0 h-[4px]"
                style={{
                  background:
                    "linear-gradient(90deg, #FF8A00, #FF8A00, #FFE600, #FFE600, #00E5FF, #006BFF, #8A2BFF, #8A2BFF, #FF2BD6)",
                }}
              />
              <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(0,229,255,0.32), transparent 70%)" }} />
              <div aria-hidden className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(255,43,214,0.22), transparent 70%)" }} />
              <span aria-hidden className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: "#00E5FF" }} />
              <span aria-hidden className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: "#00E5FF" }} />
              <span aria-hidden className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: "#00E5FF" }} />
              <span aria-hidden className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: "#00E5FF" }} />

              <div className="relative grid md:grid-cols-[0.95fr_1.05fr] gap-8 md:gap-10 items-center">
              <div className="flex flex-col items-center text-center md:items-start md:text-left gap-6 sm:gap-7 min-w-0">

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                    style={{ border: "1px solid #00E5FF", boxShadow: "0 0 14px rgba(0,229,255,0.55)" }}
                  >
                    <Sparkles className="w-3 h-3" style={{ color: "#00E5FF", filter: "drop-shadow(0 0 4px #00E5FF)" }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "#00E5FF" }}>
                      {language === "af" ? "Graad 12 · KABV" : "Grade 12 · CAPS"}
                    </span>
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                    style={{ border: "1px solid rgba(255,230,0,0.65)", boxShadow: "0 0 12px rgba(255,230,0,0.4)" }}
                  >
                    <Flame className="w-3 h-3" style={{ color: "#FFE600", filter: "drop-shadow(0 0 4px #FFE600)" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#FFE600" }}>
                      {language === "af" ? "Proewe Kom Nader" : "Prelims Around the Corner"}
                    </span>
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                    style={{ border: "1px solid rgba(255,43,214,0.6)", boxShadow: "0 0 10px rgba(255,43,214,0.4)" }}
                  >
                    <Star className="w-3 h-3" style={{ color: "#FF2BD6", filter: "drop-shadow(0 0 4px #FF2BD6)" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#FF2BD6" }}>
                      R169/mo
                    </span>
                  </div>
                </div>

                <h1
                  data-testid="hero-title"
                  className="font-black tracking-tight leading-[0.95] max-w-4xl text-white text-[clamp(1.75rem,5vw+1rem,4.5rem)] max-[479px]:text-[1.55rem]"
                  style={{
                    filter: "drop-shadow(0 0 28px rgba(0,229,255,0.38))",
                  }}
                >
                  {t.hero.titleBase}{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, #FF8A00, #FF8A00, #FFE600, #FFE600, #00E5FF, #006BFF, #8A2BFF, #8A2BFF, #FF2BD6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {t.hero.titleAccent}
                  </span>
                </h1>

                <p className="text-white leading-relaxed max-w-2xl md:mx-0 mx-auto" style={{ fontSize: "clamp(1rem, 1.2vw + 0.6rem, 1.25rem)" }}>
                  {t.hero.subtitle}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 overflow-x-hidden">
                  {t.hero.pills.map((pill, idx) => {
                    const pillHexes = ["#FF8A00", "#00E5FF", "#FF2BD6"];
                    const hex = pillHexes[idx % pillHexes.length];
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full px-3 max-[479px]:px-2 py-1 bg-black text-xs font-black uppercase tracking-[0.18em] max-[479px]:tracking-[0.1em]"
                        style={{ color: hex, border: `1.5px solid ${hex}`, boxShadow: `0 0 12px ${hex}55` }}
                        data-testid={`pill-tagline-${idx}`}
                      >
                        {pill}
                      </span>
                    );
                  })}
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 overflow-x-hidden">
                  {t.hero.trustBadges.map((badge, idx) => {
                    const hexes = ["#00E5FF", "#FFE600", "#8A2BFF", "#FF2BD6", "#006BFF"];
                    const hex = hexes[idx % hexes.length];
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 max-[479px]:px-2 py-1 bg-black text-[9px] max-[479px]:text-[8px] font-bold uppercase tracking-[0.14em] max-[479px]:tracking-[0.1em]"
                        style={{ color: hex, border: `1px solid ${hex}66`, boxShadow: `0 0 8px ${hex}33` }}
                      >
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        {badge}
                      </span>
                    );
                  })}
                </div>

                <div
                  className="w-full max-w-xl rounded-2xl bg-black px-4 py-3"
                  style={{ border: "1px solid rgba(255,230,0,0.45)", boxShadow: "0 0 14px rgba(255,230,0,0.25)" }}
                >
                  <p className="text-sm sm:text-base font-bold text-center" style={{ color: "#FFE600", textShadow: "0 0 6px rgba(255,230,0,0.5)" }}>
                    {t.hero.urgency}
                  </p>
                </div>

                <div className="flex flex-col items-center md:items-start gap-3 pt-2">
                  <button
                    onClick={handleCta}
                    data-testid="button-hero-cta"
                    className="group relative inline-flex items-center gap-3 rounded-2xl bg-black font-black uppercase tracking-[0.14em] transition-transform hover:scale-[1.03]"
                    style={{
                      fontSize: "clamp(0.875rem, 1vw + 0.5rem, 1.125rem)",
                      padding: "clamp(0.875rem, 1.2vw + 0.4rem, 1.25rem) clamp(1.75rem, 2.5vw + 0.75rem, 2.5rem)",
                      color: "#00E5FF",
                      border: "1.5px solid #00E5FF",
                      boxShadow: "0 0 24px rgba(0,229,255,0.55), inset 0 0 20px rgba(0,229,255,0.08)",
                    }}
                  >
                    <AnimatedIcon name="brain" size={22} />
                    {t.hero.cta}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  {t.hero.tagline && (
                    <p className="text-xs text-white font-medium">
                      {t.hero.tagline}
                    </p>
                  )}
                </div>

                <div data-testid="stats-strip" className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full max-w-lg pt-2">
                  {[
                    { k: language === "af" ? "Vakke" : "Subjects", v: "24+", hex: "#00E5FF" },
                    { k: language === "af" ? "Vraestelle" : "Papers", v: "10y", hex: "#FFE600" },
                    { k: language === "af" ? "AI Tutor" : "AI Tutor", v: "24/7", hex: "#8A2BFF" },
                  ].map(({ k, v, hex }) => (
                    <div
                      key={k}
                      className="rounded-xl bg-black px-2 py-2 sm:px-3 sm:py-2.5"
                      style={{ border: `1px solid ${hex}55`, boxShadow: `0 0 10px ${hex}33` }}
                    >
                      <div className="text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.18em] text-white">{k}</div>
                      <div className="text-lg max-[479px]:text-base sm:text-2xl font-black tabular-nums" style={{ color: hex, textShadow: `0 0 8px ${hex}55` }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graffiti tag composition — brand board "THIS IS MATRIC." device.
                  Replaces the old animated brain PNG whose infinite filter
                  animations (3 stacked drop-shadows + margin-top float + spun
                  48px blur) repainted every frame and froze the renderer. */}
              <div
                className="relative mx-auto w-full max-w-[560px] min-h-[300px] sm:min-h-[420px] flex items-center justify-center"
                data-testid="hero-graffiti-tag"
              >
                <GraffitiSplats variant="corner" opacity={0.65} />

                {/* hand-drawn white crown */}
                <svg
                  aria-hidden
                  viewBox="0 0 100 100"
                  className="absolute top-0 right-4 w-16 h-16 sm:w-24 sm:h-24"
                  style={{ color: "#fff", transform: "rotate(14deg)", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.55))" }}
                >
                  <path d="M12 72 L20 34 L38 54 L50 22 L62 54 L80 34 L88 72" stroke="currentColor" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 82 L84 82" stroke="currentColor" strokeWidth={7} fill="none" strokeLinecap="round" />
                </svg>

                {/* hand-drawn cyan arrow pointing at the tag */}
                <svg
                  aria-hidden
                  viewBox="0 0 100 100"
                  className="absolute bottom-2 left-0 w-14 h-14 sm:w-20 sm:h-20"
                  style={{ color: "#00E5FF", transform: "rotate(-10deg)", filter: "drop-shadow(0 0 8px rgba(0,229,255,0.55))" }}
                >
                  <path d="M10 85 Q30 25 78 28" stroke="currentColor" strokeWidth={7} fill="none" strokeLinecap="round" />
                  <path d="M62 14 L80 28 L60 42" stroke="currentColor" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {/* pink star doodle */}
                <svg
                  aria-hidden
                  viewBox="0 0 100 100"
                  className="absolute top-6 left-2 w-10 h-10 sm:w-14 sm:h-14"
                  style={{ color: "#FF2BD6", transform: "rotate(-18deg)", filter: "drop-shadow(0 0 8px rgba(255,43,214,0.55))" }}
                >
                  <path d="M50 10 L60 38 L90 40 L66 58 L76 88 L50 70 L24 88 L34 58 L10 40 L40 38 Z" stroke="currentColor" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <div className="relative z-10 text-center -rotate-3 select-none px-4">
                  <p
                    className="graffiti-hand text-white leading-[0.95]"
                    style={{
                      fontSize: "clamp(2.4rem, 4.5vw + 1rem, 4.6rem)",
                      textShadow: "0 0 18px rgba(255,255,255,0.35), 0 4px 0 rgba(0,0,0,0.65)",
                    }}
                  >
                    {language === "af" ? "Dit is" : "This is"}
                  </p>
                  <p
                    className="graffiti-hand text-white leading-[0.95]"
                    style={{
                      fontSize: "clamp(3rem, 6vw + 1rem, 6rem)",
                      textShadow: "0 0 22px rgba(255,255,255,0.4), 0 4px 0 rgba(0,0,0,0.65)",
                    }}
                  >
                    {language === "af" ? "Matriek." : "Matric."}
                  </p>
                  <p className="graffiti-hand mt-3 leading-tight" style={{ fontSize: "clamp(1.25rem, 2.2vw + 0.5rem, 2.1rem)" }}>
                    <span style={{ color: "#FFE600", textShadow: "0 0 14px rgba(255,230,0,0.6)" }}>
                      {language === "af" ? "Elke punt " : "Every mark "}
                    </span>
                    <span style={{ color: "#FF2BD6", textShadow: "0 0 14px rgba(255,43,214,0.6)" }}>
                      {language === "af" ? "tel." : "counts."}
                    </span>
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>

        <section id="everything" ref={featuresAnim.ref} className={`relative overflow-hidden py-20 bg-background transition-all duration-700 ${featuresAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {featuresAnim.inView && <GraffitiSplats variant="band" opacity={0.42} />}
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-5 bg-black"
                style={{ border: "1px solid #00E5FF", boxShadow: "0 0 14px rgba(0,229,255,0.45)" }}
              >
                <Target className="w-3.5 h-3.5" style={{ color: "#00E5FF", filter: "drop-shadow(0 0 4px #00E5FF)" }} />
                <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: "#00E5FF" }}>
                  {language === "af" ? "Die Toolkit" : "The Toolkit"}
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] max-w-3xl mx-auto break-words"
                style={{
                  background: "linear-gradient(90deg, #FF8A00, #FFE600, #00E5FF, #8A2BFF, #FF2BD6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 22px rgba(0,229,255,0.32))",
                }}
              >
                {language === "en" ? "Everything you need to nail Matric" : "Alles wat jy nodig het om Matriek te klop"}
              </h2>
              <p className="mt-4 text-white max-w-2xl mx-auto text-sm sm:text-base">
                {language === "en"
                  ? "Every tool in here maps to how the NSC paper is actually set — not some generic textbook."
                  : "Elke instrument hier binne pas by hoe die NSS-vraestel werklik opgestel word — nie een of ander generiese handboek nie."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.everything.cards.map((card, idx) => {
                const Icon = everythingIcons[idx];
                const hexes = ["#00E5FF", "#FFE600", "#8A2BFF", "#FF2BD6"];
                const hex = hexes[idx % hexes.length];
                return (
                  <div
                    key={idx}
                    className={`relative overflow-hidden rounded-2xl bg-black p-5 transition-all duration-500 ${featuresAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      border: `1px solid ${hex}66`,
                      boxShadow: `0 0 18px ${hex}33, inset 0 0 20px rgba(0,0,0,0.4)`,
                      transitionDelay: featuresAnim.inView ? `${idx * 120}ms` : '0ms',
                    }}
                  >
                    <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: hex, boxShadow: `0 0 8px ${hex}` }} />
                    <div className="space-y-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-black"
                        style={{ border: `1px solid ${hex}88`, boxShadow: `0 0 10px ${hex}44`, color: hex }}
                      >
                        <AnimatedIcon name={Icon} size={22} data-testid={`icon-everything-${Icon}`} />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">{card.title}</h3>
                      <ul className="space-y-1.5">
                        {card.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white">
                            <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: hex }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section ref={pricingAnim.ref} className={`relative overflow-hidden py-20 bg-background transition-all duration-700 ${pricingAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} id="pricing">
          {pricingAnim.inView && <GraffitiSplats variant="corner" opacity={0.42} />}
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-5 bg-black"
                style={{ border: "1px solid #FFE600", boxShadow: "0 0 14px rgba(255,230,0,0.4)" }}
              >
                <CreditCard className="w-3.5 h-3.5" style={{ color: "#FFE600", filter: "drop-shadow(0 0 4px #FFE600)" }} />
                <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: "#FFE600" }}>
                  {language === "af" ? "Pryse" : "Pricing"}
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] max-w-3xl mx-auto break-words"
                style={{
                  background: "linear-gradient(90deg, #FFE600, #00E5FF, #8A2BFF, #FF2BD6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 22px rgba(255,230,0,0.3))",
                }}
              >
                {language === "en" ? "One plan. Real Matric marks." : "Een plan. Regte Matriekpunte."}
              </h2>
              <p className="mt-4 text-white max-w-xl mx-auto text-sm sm:text-base">{t.products.subtitle}</p>
            </div>

            <div className="flex justify-center">
              {t.products.items.filter(p => p.highlight).map((product, idx) => {
                const productIcons = [Sparkles, Brain, Target, BookOpen];
                const Icon = productIcons[idx];
                return (
                  <div
                    key={idx}
                    className={`relative overflow-hidden rounded-3xl bg-black p-6 sm:p-8 w-full max-w-md transition-all duration-500 ${pricingAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      border: "1.5px solid #00E5FF",
                      boxShadow: "0 0 0 1px rgba(0,229,255,0.32), 0 0 40px rgba(0,229,255,0.45), inset 0 0 30px rgba(0,0,0,0.55)",
                      transitionDelay: pricingAnim.inView ? `${idx * 100}ms` : '0ms',
                    }}
                    data-testid={`product-card-${idx}`}
                  >
                    <div
                      aria-hidden
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{
                        background:
                          "linear-gradient(90deg, #FF8A00, #FF8A00, #FFE600, #FFE600, #00E5FF, #006BFF, #8A2BFF, #8A2BFF, #FF2BD6)",
                      }}
                    />
                    <div aria-hidden className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none"
                      style={{ background: "radial-gradient(circle, rgba(0,229,255,0.28), transparent 70%)" }} />

                    {product.badge && (
                      <div
                        className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-black text-[9px] font-black uppercase tracking-[0.18em]"
                        style={{ color: "#FFE600", border: "1px solid #FFE600", boxShadow: "0 0 10px rgba(255,230,0,0.45)" }}
                      >
                        <Sparkles className="w-3 h-3" />
                        {product.badge}
                      </div>
                    )}

                    <div className="relative space-y-5">
                      <div className="flex items-center gap-3 pr-16 sm:pr-20">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-black"
                          style={{ border: "1px solid #00E5FF", boxShadow: "0 0 14px rgba(0,229,255,0.5)", color: "#00E5FF" }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-xl font-black text-white leading-tight">{product.name}</h3>
                          <p className="text-[11px] text-white leading-tight">{product.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-end gap-1.5">
                        <span
                          className="text-4xl sm:text-5xl font-black tabular-nums"
                          style={{
                            background: "linear-gradient(90deg, #FFE600, #00E5FF, #8A2BFF, #FF2BD6)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            filter: "drop-shadow(0 0 10px rgba(0,229,255,0.35))",
                          }}
                        >
                          {product.price}
                        </span>
                        <span className="text-xs text-white font-semibold mb-1.5">{product.period}</span>
                      </div>

                      {"trial" in product && product.trial && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-black text-[10px] font-bold uppercase tracking-[0.18em]"
                          style={{ color: "#FF2BD6", border: "1px solid rgba(255,43,214,0.6)", boxShadow: "0 0 10px rgba(255,43,214,0.35)" }}
                        >
                          <Sparkles className="w-3 h-3" />
                          {product.trial}
                        </span>
                      )}

                      <ul className="space-y-2 pt-1">
                        {product.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-white">
                            <div
                              className="mt-0.5 rounded-full p-0.5 shrink-0 bg-black"
                              style={{ border: "1px solid #00E5FF", boxShadow: "0 0 6px rgba(0,229,255,0.4)", color: "#00E5FF" }}
                            >
                              <Check className="w-2.5 h-2.5" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Pricing CTA — modern flat single-colour (brand blue) */}
                      <button
                        onClick={handleCta}
                        data-testid="button-pricing-cta"
                        className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-sm text-white bg-[#006BFF] hover:bg-[#0057D6] transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                        {t.hero.cta}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        <section ref={rizzAnim.ref} className={`py-20 scroll-mt-20 transition-all duration-700 ${rizzAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 bg-black"
                style={{
                  border: "1.5px solid #8A2BFF",
                  boxShadow: "0 0 14px rgba(138,43,255,0.45)",
                }}
              >
                <Brain className="w-4 h-4" style={{ color: "#8A2BFF", filter: "drop-shadow(0 0 6px rgba(138,43,255,0.8))" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8A2BFF" }}>{t.nova.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 text-white leading-[1.1] tracking-tight break-words">
                {language === "en" ? (
                  <>Meet Rizz — Your <span className="gradient-text">Smart Tutor</span></>
                ) : (
                  <>Ontmoet Rizz — Jou <span className="gradient-text">Slim Tutor</span></>
                )}
              </h2>
              <p className="text-sm sm:text-lg text-white mb-6 max-w-2xl mx-auto leading-relaxed">
                {t.nova.subtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-5 gap-y-2">
                {t.nova.features.map((feat, idx) => {
                  const hexes = ["#00E5FF", "#8A2BFF", "#FFE600"];
                  const hex = hexes[idx % hexes.length];
                  return (
                    <div key={idx} className="flex items-center gap-2 text-sm font-medium text-white">
                      <CheckCircle className="w-4 h-4" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex}99)` }} />
                      <span>{feat}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cosmic-neon chat console */}
            <div
              className="relative rounded-2xl bg-black overflow-hidden"
              style={{
                border: "1.5px solid #8A2BFF",
                boxShadow: "0 0 0 1px rgba(138,43,255,0.35), 0 0 40px rgba(138,43,255,0.35), inset 0 0 24px rgba(0,0,0,0.6)",
              }}
              data-testid="rizz-demo-console"
            >
              {/* corner brackets */}
              <span aria-hidden className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 z-10" style={{ borderColor: "#8A2BFF" }} />
              <span aria-hidden className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 z-10" style={{ borderColor: "#8A2BFF" }} />
              <span aria-hidden className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 z-10" style={{ borderColor: "#8A2BFF" }} />
              <span aria-hidden className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 z-10" style={{ borderColor: "#8A2BFF" }} />

              {/* Chat header */}
              <div
                className="p-4 sm:p-5 flex items-center gap-3 bg-black"
                style={{ borderBottom: "1px solid rgba(138,43,255,0.35)" }}
              >
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden shrink-0"
                    style={{
                      border: "1.5px solid #00E5FF",
                      boxShadow: "0 0 16px rgba(0,229,255,0.55), inset 0 0 8px rgba(0,229,255,0.25)",
                    }}
                  >
                    <img src={novaIcon} alt="Rizz AI tutor for Grade 12 Matric learners — step-by-step CAPS explanations" className="w-full h-full object-cover" loading="lazy" data-testid="img-nova-demo" />
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-black"
                    style={{ background: "#00E5FF", boxShadow: "0 0 10px rgba(0,229,255,0.9)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-white leading-tight">Rizz</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00E5FF", boxShadow: "0 0 6px #00E5FF" }} />
                    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#00E5FF" }}>{language === "af" ? "Aanlyn" : "Online"}</span>
                  </div>
                </div>
                <div
                  className="hidden sm:block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-black"
                  style={{ color: "#FFE600", border: "1px solid rgba(255,230,0,0.55)", boxShadow: "0 0 10px rgba(255,230,0,0.35)" }}
                >
                  {language === "af" ? "KABV-belyn" : "CAPS-aligned"}
                </div>
              </div>

              {/* Chat body */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Subject pills */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {demoQuestions[language].map((q, idx) => {
                    const active = demoQuestion === idx;
                    const SubjectIcon =
                      idx === 0 ? Calculator :
                      idx === 1 ? Atom :
                      idx === 2 ? Receipt :
                      idx === 3 ? Leaf :
                      idx === 4 ? Globe :
                      Briefcase;
                    return (
                      <button
                        key={idx}
                        onClick={() => { setDemoQuestion(idx); setDemoStep(0); }}
                        data-testid={`demo-q-${idx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-none bg-black"
                        style={
                          active
                            ? {
                                color: "#8A2BFF",
                                border: "1.5px solid #8A2BFF",
                                boxShadow: "0 0 14px rgba(138,43,255,0.6), inset 0 0 10px rgba(138,43,255,0.25)",
                              }
                            : {
                                color:"#ffffff",
                                border: "1px solid rgba(255,255,255,0.15)",
                              }
                        }
                      >
                        <SubjectIcon className="w-3.5 h-3.5" />
                        {q.subject}
                      </button>
                    );
                  })}
                </div>

                {/* Student question bubble */}
                <div
                  className="rounded-xl p-4 bg-black"
                  style={{
                    border: "1px solid rgba(255,43,214,0.45)",
                    boxShadow: "0 0 18px rgba(255,43,214,0.25)",
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#FF2BD6" }}>{t.nova.studentQ}</p>
                  <p className="text-base text-white leading-relaxed font-medium">
                    {demoQuestions[language][demoQuestion].question}
                  </p>
                </div>

                {demoStep >= 1 && (
                  <>
                    <div
                      className="rounded-xl p-4 bg-black animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ border: "1px solid rgba(0,107,255,0.5)", boxShadow: "0 0 18px rgba(0,107,255,0.25)" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4" style={{ color: "#006BFF", filter: "drop-shadow(0 0 4px #006BFF)" }} />
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#006BFF" }}>{t.nova.thinking}</p>
                      </div>
                      <p className="text-sm text-white italic whitespace-pre-line leading-relaxed">
                        {demoQuestions[language][demoQuestion].thinking}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 bg-black animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ border: "1px solid rgba(0,229,255,0.5)", boxShadow: "0 0 18px rgba(0,229,255,0.3)" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4" style={{ color: "#00E5FF", filter: "drop-shadow(0 0 4px #00E5FF)" }} />
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00E5FF" }}>{t.nova.response}</p>
                      </div>
                      <div className="text-sm sm:text-base text-white space-y-2 whitespace-pre-line leading-relaxed">
                        {demoQuestions[language][demoQuestion].response}
                      </div>
                    </div>
                  </>
                )}

                {demoStep === 0 ? (
                  <button
                    className="w-full rounded-xl py-3 bg-black font-bold text-sm transition-none"
                    onClick={() => setDemoStep(1)}
                    data-testid="demo-next-step"
                    style={{
                      color: "#00E5FF",
                      border: "1.5px solid #00E5FF",
                      boxShadow: "0 0 16px rgba(0,229,255,0.5)",
                    }}
                  >
                    {t.nova.seeResponse}
                  </button>
                ) : (
                  <button
                    className="w-full rounded-xl py-3 bg-black font-bold text-sm transition-none"
                    onClick={() => setDemoStep(0)}
                    data-testid="demo-reset"
                    style={{ color: "#8A2BFF", border: "1.5px solid #8A2BFF", boxShadow: "0 0 14px rgba(138,43,255,0.4)" }}
                  >
                    {t.nova.tryAnotherQ}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section ref={parentsAnim.ref} className={`py-20 bg-black transition-all duration-700 ${parentsAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-5 bg-black"
                style={{ border: "1px solid #8A2BFF", boxShadow: "0 0 14px rgba(138,43,255,0.4)" }}
              >
                <Users className="w-3.5 h-3.5" style={{ color: "#8A2BFF", filter: "drop-shadow(0 0 4px #8A2BFF)" }} />
                <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: "#8A2BFF" }}>
                  {language === "af" ? "Vir Ouers" : "For Parents"}
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] max-w-3xl mx-auto break-words"
                style={{
                  background: "linear-gradient(90deg, #8A2BFF, #8A2BFF, #FF2BD6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 22px rgba(138,43,255,0.32))",
                }}
              >
                {t.parents.title}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {t.parents.items.map((item, idx) => {
                const hexes = ["#8A2BFF", "#8A2BFF", "#FF2BD6", "#006BFF"];
                const hex = hexes[idx % hexes.length];
                return (
                  <div
                    key={idx}
                    className={`relative overflow-hidden rounded-2xl bg-black p-5 transition-all duration-500 ${parentsAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      border: `1px solid ${hex}66`,
                      boxShadow: `0 0 14px ${hex}28, inset 0 0 18px rgba(0,0,0,0.4)`,
                      transitionDelay: parentsAnim.inView ? `${idx * 100}ms` : '0ms',
                    }}
                  >
                    <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: hex, boxShadow: `0 0 6px ${hex}` }} />
                    <span aria-hidden className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: hex }} />
                    <span aria-hidden className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: hex }} />
                    <div className="relative flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-black"
                        style={{ border: `1px solid ${hex}`, boxShadow: `0 0 10px ${hex}55`, color: hex }}
                      >
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-white leading-relaxed pt-1">{item}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-white font-bold italic text-sm">
              {t.parents.tagline}
            </p>
          </div>
        </section>

        <section ref={schoolsAnim.ref} className={`py-20 bg-black transition-all duration-700 ${schoolsAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-5 bg-black"
                style={{ border: "1px solid #FF8A00", boxShadow: "0 0 14px rgba(255,138,0,0.4)" }}
              >
                <GraduationCap className="w-3.5 h-3.5" style={{ color: "#FF8A00", filter: "drop-shadow(0 0 4px #FF8A00)" }} />
                <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: "#FF8A00" }}>
                  {language === "af" ? "Vir Skole" : "For Schools"}
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] max-w-3xl mx-auto break-words"
                style={{
                  background: "linear-gradient(90deg, #FF8A00, #FF8A00, #FFE600, #FFE600)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 22px rgba(255,138,0,0.3))",
                }}
              >
                {t.schools.title}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {t.schools.items.map((item, idx) => {
                const hexes = ["#FF8A00", "#FFE600", "#FFE600", "#FF8A00"];
                const hex = hexes[idx % hexes.length];
                return (
                  <div
                    key={idx}
                    className={`relative overflow-hidden rounded-2xl bg-black p-5 transition-all duration-500 ${schoolsAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      border: `1px solid ${hex}66`,
                      boxShadow: `0 0 14px ${hex}28, inset 0 0 18px rgba(0,0,0,0.4)`,
                      transitionDelay: schoolsAnim.inView ? `${idx * 100}ms` : '0ms',
                    }}
                  >
                    <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: hex, boxShadow: `0 0 6px ${hex}` }} />
                    <span aria-hidden className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: hex }} />
                    <span aria-hidden className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: hex }} />
                    <div className="relative flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-black"
                        style={{ border: `1px solid ${hex}`, boxShadow: `0 0 10px ${hex}55`, color: hex }}
                      >
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-white leading-relaxed pt-1">{item}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-white font-bold italic text-sm">
              {t.schools.tagline}
            </p>
          </div>
        </section>

        <section ref={faqAnim.ref} className={`relative py-20 bg-black overflow-x-hidden transition-all duration-700 ${faqAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} id="faq-section">
          {/* funky floating blobs */}
          <div aria-hidden className="absolute top-16 -left-16 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #FF2BD6, transparent 70%)" }} />
          <div aria-hidden className="absolute bottom-10 -right-20 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: "radial-gradient(circle, #00E5FF, transparent 70%)" }} />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] px-3 py-1 rounded-full bg-black mb-4"
                style={{ color: "#FFE600", border: "1px solid #FFE600", boxShadow: "0 0 14px rgba(255,230,0,0.4)" }}
              >
                <Sparkles className="w-3 h-3" />
                {language === "af" ? "Vra Weg" : "Ask Away"}
                <Sparkles className="w-3 h-3" />
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight text-transparent bg-clip-text break-words"
                style={{ backgroundImage: "linear-gradient(90deg,#FF8A00,#FFE600,#00E5FF,#8A2BFF,#FF2BD6)" }}
              >
                {t.faq.title}
              </h2>
              <p className="mt-3 text-sm text-white italic">
                {language === "af" ? "Geen dom vrae nie — net dom om nie te vra nie." : "No dumb questions — only dumb to not ask."}
              </p>
            </div>

            <div className="space-y-4">
              {t.faq.items.map((faqItem, idx) => {
                const palette = [
                  { hex: "#FF8A00", halo: "rgba(255,138,0,0.45)", Icon: Flame,       rot: "-rotate-1" },
                  { hex: "#FFE600", halo: "rgba(255,230,0,0.45)", Icon: Zap,         rot: "rotate-1"  },
                  { hex: "#00E5FF", halo: "rgba(0,229,255,0.45)", Icon: Sparkles,    rot: "-rotate-1" },
                  { hex: "#006BFF", halo: "rgba(0,107,255,0.45)", Icon: Star,        rot: "rotate-1"  },
                  { hex: "#8A2BFF", halo: "rgba(138,43,255,0.45)",Icon: Brain,       rot: "-rotate-1" },
                  { hex: "#FF2BD6", halo: "rgba(255,43,214,0.45)", Icon: MessageSquare, rot: "rotate-1" },
                ];
                const { hex, halo, Icon, rot } = palette[idx % palette.length];
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`relative transition-all duration-500 ${faqAnim.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${isOpen ? 'rotate-0' : `${rot} hover:rotate-0 hover:-translate-y-0.5`}`}
                    style={{ transitionDelay: faqAnim.inView ? `${idx * 90}ms` : '0ms' }}
                  >
                    <div
                      className="relative overflow-hidden rounded-[22px] bg-black transition-all duration-300"
                      style={{
                        border: `1.5px solid ${isOpen ? hex : `${hex}66`}`,
                        boxShadow: isOpen
                          ? `0 14px 40px -10px ${halo}, 0 0 0 3px ${hex}22`
                          : `0 6px 20px -10px ${halo}`,
                      }}
                    >
                      {/* sticker-tape top ribbon */}
                      <div
                        aria-hidden
                        className="absolute top-0 left-0 right-0 h-[3px]"
                        style={{
                          background: `repeating-linear-gradient(90deg, ${hex} 0 14px, transparent 14px 24px)`,
                          boxShadow: `0 0 10px ${hex}`,
                        }}
                      />
                      {/* aura bloom */}
                      <div aria-hidden className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity duration-300"
                        style={{ background: `radial-gradient(circle, ${halo}, transparent 70%)`, opacity: isOpen ? 0.9 : 0.35 }}
                      />

                      <button
                        className="relative w-full text-left p-4 sm:p-5 lg:p-6 flex items-center gap-3 sm:gap-4 cursor-pointer group"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${idx}`}
                      >
                        {/* Q badge — big bold number + icon */}
                        <div className="relative shrink-0">
                          <div
                            className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
                            style={{ border: `2px solid ${hex}`, boxShadow: `0 0 16px ${halo}, inset 0 0 10px ${halo}` }}
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: hex, filter: `drop-shadow(0 0 6px ${hex})` }} />
                          </div>
                          <span
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black flex items-center justify-center text-[10px] font-black"
                            style={{ color: hex, border: `1.5px solid ${hex}`, boxShadow: `0 0 8px ${halo}` }}
                          >
                            Q{idx + 1}
                          </span>
                        </div>

                        <span className="text-sm sm:text-base font-extrabold text-white flex-1 min-w-0 leading-snug">
                          {faqItem.q}
                        </span>

                        <div
                          className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`}
                          style={{ border: `1.5px solid ${hex}`, boxShadow: `0 0 10px ${halo}` }}
                        >
                          <ChevronDown className="w-4 h-4" style={{ color: hex }} />
                        </div>
                      </button>

                      {/* answer panel */}
                      <div
                        className="grid transition-all duration-300 ease-out"
                        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                      >
                        <div className="overflow-hidden" id={`faq-answer-${idx}`} role="region">
                          <div className="relative px-4 sm:px-5 lg:px-6 pb-5 pl-[52px] sm:pl-[82px] lg:pl-[96px]">
                            <div className="flex items-start gap-3">
                              <span
                                className="shrink-0 text-[11px] font-black uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-black mt-0.5"
                                style={{ color: hex, border: `1px solid ${hex}`, boxShadow: `0 0 10px ${halo}` }}
                              >
                                A{idx + 1}
                              </span>
                              <p className="text-sm text-white leading-relaxed flex-1">
                                {faqItem.a}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cheeky footer chip */}
            <div className="mt-10 flex justify-center">
              <span
                className="inline-flex items-center gap-2 text-[11px] font-bold px-4 py-2 rounded-full bg-black"
                style={{ color: "#00E5FF", border: "1px solid #00E5FF55" }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ filter: "drop-shadow(0 0 4px #00E5FF)" }} />
                {language === "af" ? "Nog 'n vraag? Vra vir Rizz in die app." : "Still curious? Ask Rizz inside the app."}
              </span>
            </div>
          </div>
        </section>

      </main>
      {modal}
    </div>
  );
}
