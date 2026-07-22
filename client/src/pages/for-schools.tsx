// BrainTrack "For Schools" — public partnership FAQ page answering the due-
// diligence questions principals, HODs and governing bodies ask before
// bringing BrainTrack to their learners. Same "Luxury Street Graffiti EdTech"
// visual language as research.tsx: sticky blur nav, floating radial orbs,
// graffiti scatter, rainbow headline. Content-dense by nature (10 Q&A) so it's
// presented as a grouped, collapsed-by-default accordion rather than a wall
// of text. Bilingual EN/AF.
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { GraffitiSplats } from "@/components/graffiti-splats";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

const CTA_GRADIENT =
  "linear-gradient(100deg,#FFB7E5,#FFE29A,#9FF5E8,#C5B3FF,#FFB7E5)";
const HEADLINE_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)";
const RAINBOW_ANIM =
  "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5,#FFE29A)";

// A FAQ answer is a sequence of plain paragraphs and/or labelled bullet
// blocks — richer than a single string (the source material is itself listy
// in places) without turning the whole page into bullet soup, since the
// question itself stays collapsed until the visitor opens it.
type FaqParagraph = string | { label: string; bullets: readonly string[] };
type FaqItem = { q: string; paragraphs: readonly FaqParagraph[] };
type FaqGroup = {
  tag: string;
  title: string;
  emoji: string;
  color: string;
  chipBg: string;
  glow: string;
  items: readonly FaqItem[];
};

const COPY = {
  en: {
    tFeatures: "Features",
    tPartner: "Partner Schools",
    tEnter: "Enter the app →",
    badge: "🏫 For principals, HODs & governing bodies",
    eyebrow: "answers for schools",
    head1: "Answers for schools ",
    headAccent: "considering a BrainTrack partnership",
    sub: "Straight, transparent answers to the questions principals, HODs and governing bodies ask before bringing BrainTrack to their learners — how it works, what it costs, and how we handle POPIA.",
    heroCtaPrimary: "Apply for partnership →",
    heroCtaSecondary: "Email our team",
    facts: [
      "No cost to schools",
      "5 NSC subjects — growing",
      "10+ years of DBE data",
      "POPIA-aligned by design",
      "Zero admin burden",
    ],
    faqEyebrow: "the details",
    faqHead1: "Frequently asked by ",
    faqHeadAccent: "school leadership",
    faqSub: "Ten questions we get asked most often — grouped so you can jump straight to what matters to you. Tap a question to expand it.",
    groups: [
      {
        tag: "For Learners & Schools",
        title: "What learners and staff actually get",
        emoji: "🎓",
        color: "#9FF5E8",
        chipBg: "rgba(159,245,232,.14)",
        glow: "rgba(159,245,232,.18)",
        items: [
          {
            q: "How does BrainTrack work, day to day, for learners and staff?",
            paragraphs: [
              {
                label: "For learners",
                bullets: [
                  "Diagnostic assessments that pinpoint strengths and weaknesses, topic by topic",
                  "Fully CAPS-aligned content across every supported subject",
                  "A dynamic study plan built around subject choices, prelim performance, the NSC exam schedule and current readiness",
                  "Personalised revision recommendations and continuous exam-readiness feedback",
                  "Motivation and engagement mechanics, plus support for different (VARK) learning styles",
                ],
              },
              {
                label: "For schools (optional)",
                bullets: [
                  "Anonymised class and cohort insights",
                  "Trends in common learning challenges",
                  "Engagement reports",
                  "Academic readiness insights per subject area",
                ],
              },
              "All of this comes with minimal administrative burden and no extra infrastructure required.",
            ],
          },
          {
            q: "Why is BrainTrack different from traditional revision methods?",
            paragraphs: [
              "Traditional methods lean on general revision, memorisation and simply putting in more hours. BrainTrack takes a different approach: targeted intervention, academic readiness and data-driven support.",
              "It helps learners understand exactly what they don't understand yet, where their biggest risk areas are, and where to focus their limited study time for the greatest impact.",
            ],
          },
        ],
      },
      {
        tag: "Research & Quality",
        title: "The science and the quality control",
        emoji: "🔬",
        color: "#9FD8FF",
        chipBg: "rgba(159,216,255,.14)",
        glow: "rgba(159,216,255,.18)",
        items: [
          {
            q: "What research and methodology sit behind the platform?",
            paragraphs: [
              "BrainTrack is built on CAPS guidelines, NSC exam patterns, and more than 10 years of historical assessment and exam data — combined with learner-engagement and behavioural-reinforcement principles, diagnostic intervention models, and personalised learning-support theory.",
              "The consistent focus across all of it: early risk identification, consistent study habits, learner motivation and exam readiness — building academic discipline, preparation, confidence and consistency.",
            ],
          },
          {
            q: "Which subjects are supported?",
            paragraphs: [
              "Currently the highest-impact NSC subjects: Mathematics, Mathematical Literacy, Physical Sciences, Life Sciences and Accounting.",
              "Subject coverage is continuously expanding to more CAPS subjects.",
            ],
          },
          {
            q: "How is quality and accuracy assured?",
            paragraphs: [
              "All content is CAPS-aligned and regularly updated in line with DBE guidelines. Every piece is moderated and reviewed, then analysed against real performance patterns and exam trends.",
              "Quality control is continuous — for accuracy, relevance and academic standard, not a once-off check.",
            ],
          },
        ],
      },
      {
        tag: "Partnership & Funding",
        title: "How the partnership works",
        emoji: "🤝",
        color: "#FFB7E5",
        chipBg: "rgba(255,183,229,.14)",
        glow: "rgba(255,183,229,.18)",
        items: [
          {
            q: "Does this create any administrative or technical burden for staff?",
            paragraphs: [
              "No. The BrainTrack team handles technical support, user support, onboarding, communication support and platform management centrally.",
              {
                label: "School involvement can be as light as",
                bullets: [
                  "Approving communication to parents",
                  "Sharing information with parents",
                  "Optional collaboration on academic support",
                ],
              },
            ],
          },
          {
            q: "How does the fundraising / contribution model work?",
            paragraphs: [
              "A transparent partnership model: schools receive a monthly contribution for active, paying learners who joined via the school.",
              {
                label: "What that means for the school",
                bullets: [
                  "No financial risk to the school",
                  "No purchase requirement",
                  "No infrastructure cost",
                  "Full transparency on participation and reporting",
                ],
              },
              {
                label: "What schools receive",
                bullets: [
                  "Monthly summaries",
                  "Anonymised engagement data",
                  "Financial reporting on referrals and participation",
                ],
              },
            ],
          },
          {
            q: "Why would a school get involved?",
            paragraphs: [
              "This isn't aggressive marketing aimed at learners — the focus is academic support, learner readiness and access to structured tools.",
              "Many schools are under growing pressure around matric results, learner wellbeing, exam preparation and parent expectations. BrainTrack is built to supplement existing academic support, not replace it.",
            ],
          },
        ],
      },
      {
        tag: "Trust & Compliance",
        title: "POPIA, cost and obligations",
        emoji: "🔒",
        color: "#C5B3FF",
        chipBg: "rgba(197,179,255,.14)",
        glow: "rgba(197,179,255,.18)",
        items: [
          {
            q: "How is POPIA and data protection handled?",
            paragraphs: [
              "A secure-by-design approach: responsible data management, POPIA awareness built into every feature, anonymised school-level reporting, limited access to sensitive data, and secure platform architecture.",
              "Schools never receive sensitive individual learner data without appropriate consent.",
            ],
          },
          {
            q: "Is there any cost or contractual obligation for schools?",
            paragraphs: [
              {
                label: "In short",
                bullets: ["No cost to participate", "No exclusivity", "No long-term obligations"],
              },
              "Participation stays voluntary and flexible, for as long as it makes sense for your school.",
            ],
          },
        ],
      },
    ],
    closingEyebrow: "one core focus",
    closingHead: "Ready to partner with BrainTrack?",
    closingBody:
      "BrainTrack was built on one core focus: helping South African matric learners prepare in a more structured, purposeful and academically ready way for the NSC exam — through early intervention, personalised support, learner engagement and data-driven preparation. It's not a replacement for schools or teachers, but a supplementary academic-support ecosystem working alongside schools, learners and parents.",
    closingCtaPrimary: "Apply for partnership →",
    closingCtaSecondary: "Email our team",
  },
  af: {
    tFeatures: "Funksies",
    tPartner: "Vennootskole",
    tEnter: "Betree die app →",
    badge: "🏫 Vir skoolhoofde, departementshoofde & beheerliggame",
    eyebrow: "antwoorde vir skole",
    head1: "Antwoorde vir skole ",
    headAccent: "wat 'n BrainTrack-vennootskap oorweeg",
    sub: "Reguit, deursigtige antwoorde op die vrae wat skoolhoofde, departementshoofde en beheerliggame vra voordat hulle BrainTrack na hul leerders bring — hoe dit werk, wat dit kos, en hoe ons POPIA hanteer.",
    heroCtaPrimary: "Doen aansoek vir vennootskap →",
    heroCtaSecondary: "E-pos ons span",
    facts: [
      "Geen koste vir skole nie",
      "5 NSS-vakke — groeiend",
      "10+ jaar se DBE-data",
      "POPIA-belyn per ontwerp",
      "Geen administratiewe las nie",
    ],
    faqEyebrow: "die besonderhede",
    faqHead1: "Gereeld gevra deur ",
    faqHeadAccent: "skoolleierskap",
    faqSub: "Tien vrae wat ons die meeste gevra word — gegroepeer sodat jy reguit kan spring na wat vir jou saak maak. Tik op 'n vraag om dit oop te maak.",
    groups: [
      {
        tag: "Vir Leerders & Skole",
        title: "Wat leerders en personeel werklik kry",
        emoji: "🎓",
        color: "#9FF5E8",
        chipBg: "rgba(159,245,232,.14)",
        glow: "rgba(159,245,232,.18)",
        items: [
          {
            q: "Hoe funksioneer BrainTrack prakties vir leerders en personeel?",
            paragraphs: [
              {
                label: "Vir leerders",
                bullets: [
                  "Diagnostiese assesserings wat sterk- en swakpunte per onderwerp identifiseer",
                  "Volledig KABV-belynde inhoud oor elke ondersteunde vak",
                  "'n Dinamiese studieplan gebou rondom vakkeuses, voorlopige uitslae, die NSS-eksamenrooster en huidige gereedheid",
                  "Gepersonaliseerde hersieningsaanbevelings en deurlopende terugvoer oor eksamengereedheid",
                  "Motivering- en betrokkenheidsmeganika, plus ondersteuning vir verskillende (VARK) leerstyle",
                ],
              },
              {
                label: "Vir skole (opsioneel)",
                bullets: [
                  "Geanonimiseerde klas- en kohort-insigte",
                  "Neigings in algemene leeruitdagings",
                  "Betrokkenheidsverslae",
                  "Akademiese gereedheidsinsigte per vakgebied",
                ],
              },
              "Dit alles kom met minimale administratiewe las en geen ekstra infrastruktuur is nodig nie.",
            ],
          },
          {
            q: "Waarom is BrainTrack anders as tradisionele hersieningsmetodes?",
            paragraphs: [
              "Tradisionele metodes steun op algemene hersiening, memorisering en bloot meer ure insit. BrainTrack volg 'n ander benadering: geteikende ingryping, akademiese gereedheid en datagedrewe ondersteuning.",
              "Dit help leerders presies verstaan wat hulle nog nie verstaan nie, waar hul grootste risiko-areas lê, en waar om hul beperkte studietyd te fokus vir die grootste impak.",
            ],
          },
        ],
      },
      {
        tag: "Navorsing & Gehalte",
        title: "Die wetenskap en gehaltebeheer",
        emoji: "🔬",
        color: "#9FD8FF",
        chipBg: "rgba(159,216,255,.14)",
        glow: "rgba(159,216,255,.18)",
        items: [
          {
            q: "Watter navorsing en metodologie ondersteun die platform?",
            paragraphs: [
              "BrainTrack is gebou op KABV-riglyne, NSS-eksamenpatrone, en meer as 10 jaar se historiese assesserings- en eksamendata — gekombineer met leerder-betrokkenheid- en gedragsversterkingsbeginsels, diagnostiese ingrypingsmodelle, en gepersonaliseerde leerondersteuningsteorie.",
              "Die deurlopende fokus regoor alles: vroeë risiko-identifisering, konsekwente studiegewoontes, leerdermotivering en eksamengereedheid — wat akademiese dissipline, voorbereiding, selfvertroue en konsekwentheid bou.",
            ],
          },
          {
            q: "Watter vakke word ondersteun?",
            paragraphs: [
              "Tans die hoë-impak NSS-vakke: Wiskunde, Wiskundige Geletterdheid, Fisiese Wetenskappe, Lewenswetenskappe en Rekeningkunde.",
              "Vakdekking brei deurlopend uit na meer KABV-vakke.",
            ],
          },
          {
            q: "Hoe word kwaliteit en akkuraatheid verseker?",
            paragraphs: [
              "Alle inhoud is KABV-belyn en word gereeld opgedateer in lyn met DBO-riglyne. Elke stuk word gemodereer en hersien, en dan ontleed teen werklike prestasiepatrone en eksamenneigings.",
              "Gehaltebeheer is deurlopend — vir akkuraatheid, relevansie en akademiese standaard, nie 'n eenmalige toets nie.",
            ],
          },
        ],
      },
      {
        tag: "Vennootskap & Befondsing",
        title: "Hoe die vennootskap werk",
        emoji: "🤝",
        color: "#FFB7E5",
        chipBg: "rgba(255,183,229,.14)",
        glow: "rgba(255,183,229,.18)",
        items: [
          {
            q: "Is daar enige administratiewe of tegniese las op personeel?",
            paragraphs: [
              "Nee. Die BrainTrack-span hanteer tegniese ondersteuning, gebruikersondersteuning, aanboord, kommunikasie-ondersteuning en platformbestuur sentraal.",
              {
                label: "Skoolbetrokkenheid kan so beperk wees soos",
                bullets: [
                  "Goedkeuring van kommunikasie aan ouers",
                  "Deel van inligting met ouers",
                  "Opsionele samewerking oor akademiese ondersteuning",
                ],
              },
            ],
          },
          {
            q: "Hoe werk die fondsinsamelingsmodel?",
            paragraphs: [
              "'n Deursigtige vennootskapsmodel: skole ontvang 'n maandelikse bydrae vir aktiewe, betalende leerders wat via die skool aangesluit het.",
              {
                label: "Wat dit vir die skool beteken",
                bullets: [
                  "Geen finansiële risiko vir die skool nie",
                  "Geen aankoopvereiste nie",
                  "Geen infrastruktuurkoste nie",
                  "Volle deursigtigheid oor deelname en verslagdoening",
                ],
              },
              {
                label: "Wat skole ontvang",
                bullets: [
                  "Maandelikse opsommings",
                  "Geanonimiseerde betrokkenheidsdata",
                  "Finansiële verslagdoening oor verwysings en deelname",
                ],
              },
            ],
          },
          {
            q: "Waarom sou 'n skool betrokke wees?",
            paragraphs: [
              "Dit is nie aggressiewe bemarking op leerders gemik nie — die fokus is akademiese ondersteuning, leerdergereedheid en toegang tot gestruktureerde hulpmiddels.",
              "Baie skole staar toenemende druk in die gesig rondom matriekuitslae, leerderwelstand, eksamenvoorbereiding en ouerverwagtinge. BrainTrack is gebou om bestaande akademiese ondersteuning aan te vul, nie te vervang nie.",
            ],
          },
        ],
      },
      {
        tag: "Vertroue & Nakoming",
        title: "POPIA, koste en verpligtinge",
        emoji: "🔒",
        color: "#C5B3FF",
        chipBg: "rgba(197,179,255,.14)",
        glow: "rgba(197,179,255,.18)",
        items: [
          {
            q: "Hoe word POPIA en databeskerming hanteer?",
            paragraphs: [
              "'n Veilig-per-ontwerp benadering: verantwoordelike databestuur, POPIA-bewustheid ingebou in elke funksie, geanonimiseerde skoolvlak-verslagdoening, beperkte toegang tot sensitiewe data, en veilige platformargitektuur.",
              "Skole ontvang nooit sensitiewe individuele leerderdata sonder toepaslike toestemming nie.",
            ],
          },
          {
            q: "Is daar enige koste of kontraktuele verpligtinge vir skole?",
            paragraphs: [
              {
                label: "Kortom",
                bullets: ["Geen koste om deel te neem nie", "Geen eksklusiwiteit nie", "Geen langtermynverpligtinge nie"],
              },
              "Deelname bly vrywillig en buigsaam, so lank as wat dit vir jou skool sin maak.",
            ],
          },
        ],
      },
    ],
    closingEyebrow: "een kernfokus",
    closingHead: "Gereed om saam met BrainTrack te vennoot?",
    closingBody:
      "BrainTrack is gebou op een kernfokus: om Suid-Afrikaanse matriekleerders te help om op 'n meer gestruktureerde, doelgerigte en akademies gereed manier vir die NSS-eksamen voor te berei — deur vroeë ingryping, gepersonaliseerde ondersteuning, leerderbetrokkenheid en datagedrewe voorbereiding. Dit is nie 'n vervanging vir skole of onderwysers nie, maar 'n aanvullende akademiese-ondersteuningsekosisteem wat saam met skole, leerders en ouers werk.",
    closingCtaPrimary: "Doen aansoek vir vennootskap →",
    closingCtaSecondary: "E-pos ons span",
  },
} as const;

const CONTACT_EMAIL = "learn@kth-tech.com";

function flattenParagraphs(paragraphs: readonly FaqParagraph[]): string {
  return paragraphs
    .map((p) => (typeof p === "string" ? p : `${p.label}: ${p.bullets.join("; ")}.`))
    .join(" ");
}

export default function ForSchoolsPage() {
  const { language, toggleLanguage } = useLanguage();
  const t = COPY[language];
  const en = language === "en";

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.groups.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: flattenParagraphs(item.paragraphs),
        },
      })),
    ),
  };

  useSEO({
    title: "For Schools | BrainTrack — Partnership FAQ for Principals & HODs",
    description:
      "Everything South African schools need to know about partnering with BrainTrack: how it works, the research behind it, POPIA compliance, subjects covered, cost and the fundraising model.",
    canonical: "https://braintrack.tech/for-schools",
    ogTitle: "For Schools — Partner With BrainTrack™",
    ogDescription:
      "Answers for principals, HODs and governing bodies considering a BrainTrack partnership — how it works, POPIA compliance, cost and the fundraising model.",
    ogUrl: "https://braintrack.tech/for-schools",
    locale: en ? "en_ZA" : "af_ZA",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://braintrack.tech/" },
          { "@type": "ListItem", position: 2, name: "For Schools", item: "https://braintrack.tech/for-schools" },
        ],
      },
      faqJsonLd,
    ],
  });

  return (
    <div style={{ minHeight: "100vh", background: "#050508", overflowX: "hidden", color: "#fff" }}>
      <style>{`
        .btfs-nav-link { color:#fff; cursor:pointer; transition:color .2s; }
        .btfs-nav-link:hover { color:#9FF5E8; }
        .btfs-nav-cta { transition: transform .2s; }
        .btfs-nav-cta:hover { transform: translateY(-2px); }
        .btfs-logo-img { transition: transform .25s; }
        .btfs-logo-img:hover { transform: scale(1.15) rotate(-4deg); }
        .btfs-chip { transition: transform .2s; }
        .btfs-chip:hover { transform: translateY(-3px); }
        .btfs-btn-primary { transition: transform .2s; }
        .btfs-btn-primary:hover { transform: translateY(-2px); }
        .btfs-btn-outline { transition: border-color .2s, transform .2s; }
        .btfs-btn-outline:hover { border-color: rgba(255,255,255,.7); transform: translateY(-2px); }
        .btfs-faq { border-top: 1px solid rgba(255,255,255,.1); }
        .btfs-faq:first-of-type { border-top: none; }
        .btfs-faq summary { list-style: none; cursor: pointer; }
        .btfs-faq summary::-webkit-details-marker { display: none; }
        .btfs-faq summary::marker { content: ""; }
        .btfs-chevron { transition: transform .25s; }
        .btfs-faq[open] .btfs-chevron { transform: rotate(180deg); }
        .btfs-faq-body { animation: bt-fadeup .35s ease-out both; }
        @media (max-width: 860px) {
          .btfs-nav-links { display: none !important; }
          .btfs-head { font-size: 38px !important; letter-spacing: -1.5px !important; }
          .btfs-hero-ctas { flex-direction: column !important; align-items: stretch !important; }
        }
        @media (max-width: 480px) {
          .btfs-nav { padding: 12px 10px !important; gap: 6px !important; }
          .btfs-nav-left { gap: 6px !important; }
          .btfs-nav-left img { width: 34px !important; height: 34px !important; }
          .btfs-nav-left .bt-wordmark { font-size: 17px !important; }
          .btfs-nav-right { gap: 6px !important; }
          .btfs-nav-right [data-testid="lang-toggle"] span { padding: 5px 7px !important; }
          .btfs-nav-cta { padding: 8px 12px !important; font-size: 12px !important; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <div
        className="btfs-nav"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, padding: "16px 48px", position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,5,8,.82)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Link href="/">
          <div className="btfs-nav-left" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", minWidth: 0, flex: "none" }}>
            <img src={iconTransparent} alt="BrainTrack" className="btfs-logo-img" style={{ width: 56, height: 56, objectFit: "contain", flex: "none" }} />
            <span className="bt-wordmark" style={{ fontSize: 22, letterSpacing: "-.5px" }}>BrainTrack</span>
          </div>
        </Link>
        <div className="btfs-nav-right" style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 14, fontWeight: 600, flex: "none" }}>
          <span className="btfs-nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Link href="/features"><span className="btfs-nav-link">{t.tFeatures}</span></Link>
            <Link href="/partner-schools"><span className="btfs-nav-link">{t.tPartner}</span></Link>
          </span>
          <span
            onClick={toggleLanguage}
            data-testid="lang-toggle"
            style={{
              display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 800,
              border: "1.5px solid rgba(255,255,255,.2)", borderRadius: 8,
              overflow: "hidden", cursor: "pointer", userSelect: "none", flex: "none",
            }}
          >
            <span style={{ padding: "6px 10px", background: en ? "#9FF5E8" : "transparent", color: en ? "#050508" : "#fff" }}>EN</span>
            <span style={{ padding: "6px 10px", background: en ? "transparent" : "#9FF5E8", color: en ? "#fff" : "#050508" }}>AF</span>
          </span>
          <a href="/signin" style={{ flex: "none" }}>
            <button
              className="btfs-nav-cta"
              data-testid="button-nav-enter"
              style={{
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14,
                color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                animation: "bt-rainbow 6s linear infinite", border: "none",
                borderRadius: 10, padding: "11px 24px", whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {t.tEnter}
            </button>
          </a>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 32px 100px", position: "relative" }}>
        <GraffitiSplats variant="hero" opacity={0.45} />

        {/* Floating orbs */}
        <div aria-hidden style={{ position: "absolute", top: -40, left: "8%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(159,216,255,.35),transparent 70%)", filter: "blur(50px)", pointerEvents: "none", animation: "bt-float 9s ease-in-out infinite" }} />
        <div aria-hidden style={{ position: "absolute", top: 120, right: "4%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,183,229,.3),transparent 70%)", filter: "blur(55px)", pointerEvents: "none", animation: "bt-float 11s ease-in-out infinite reverse" }} />
        <div aria-hidden style={{ position: "absolute", top: 60, left: "44%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(197,179,255,.28),transparent 70%)", filter: "blur(50px)", pointerEvents: "none", animation: "bt-glowpulse 6s ease-in-out infinite" }} />

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40, position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9FF5E8", border: "1.5px solid rgba(159,245,232,.4)", borderRadius: 999, padding: "8px 18px", marginBottom: 18 }}>
            {t.badge}
          </div>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#9FD8FF", fontSize: 18, transform: "rotate(-2deg)" }}>{t.eyebrow}</div>
          <div
            role="heading"
            aria-level={1}
            className="btfs-head"
            data-testid="text-forschools-title"
            style={{ fontSize: 54, fontWeight: 900, letterSpacing: "-2.5px", lineHeight: 1.06, margin: "8px 0 16px", fontFamily: "'Poppins',sans-serif", color: "#fff" }}
          >
            {t.head1}
            <span
              style={{
                background: RAINBOW_ANIM, backgroundSize: "200% 100%",
                animation: "bt-rainbow 5s linear infinite",
                WebkitBackgroundClip: "text", backgroundClip: "text",
                color: "transparent", WebkitTextFillColor: "transparent",
              }}
            >
              {t.headAccent}
            </span>
          </div>
          <div data-testid="text-forschools-subtitle" style={{ fontSize: 18, color: "#fff", opacity: 0.94, maxWidth: 660, margin: "0 auto", lineHeight: 1.6 }}>
            {t.sub}
          </div>

          <div className="btfs-hero-ctas" style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
            <Link href="/partner-schools">
              <button
                className="btfs-btn-primary"
                data-testid="button-hero-apply"
                style={{
                  fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15,
                  color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                  animation: "bt-rainbow 6s linear infinite", border: "none",
                  borderRadius: 12, padding: "15px 28px", whiteSpace: "nowrap", cursor: "pointer",
                }}
              >
                {t.heroCtaPrimary}
              </button>
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ textDecoration: "none" }}>
              <button
                className="btfs-btn-outline"
                data-testid="button-hero-email"
                style={{
                  fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15,
                  color: "#fff", background: "transparent", border: "1.5px solid rgba(255,255,255,.35)",
                  borderRadius: 12, padding: "15px 28px", whiteSpace: "nowrap", cursor: "pointer",
                }}
              >
                {t.heroCtaSecondary}
              </button>
            </a>
          </div>
        </div>

        {/* Quick facts strip */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 56, position: "relative", zIndex: 2 }}>
          {t.facts.map((fact, i) => {
            const palette = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A"];
            const color = palette[i % palette.length];
            return (
              <span
                key={fact}
                className="btfs-chip"
                data-testid={`chip-quickfact-${i}`}
                style={{ fontSize: 13, fontWeight: 800, color, border: `1.5px solid ${color}`, borderRadius: 999, padding: "9px 16px" }}
              >
                {fact}
              </span>
            );
          })}
        </div>

        {/* FAQ header */}
        <div style={{ textAlign: "center", marginBottom: 40, position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFB7E5", fontSize: 18, transform: "rotate(-2deg)" }}>{t.faqEyebrow}</div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1.2px", color: "#fff", margin: "6px 0 12px" }}>
            {t.faqHead1}
            <span style={{ background: HEADLINE_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
              {t.faqHeadAccent}
            </span>
          </div>
          <div style={{ fontSize: 15, color: "#fff", opacity: 0.94, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>{t.faqSub}</div>
        </div>

        {/* FAQ groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, position: "relative", zIndex: 2 }}>
          {t.groups.map((group, gi) => (
            <div
              key={group.tag}
              data-testid={`card-faq-group-${gi}`}
              style={{
                background: "linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.015))",
                border: `1px solid ${group.color}`, borderRadius: 22, padding: "28px 30px",
                boxShadow: `0 10px 34px ${group.glow}`, position: "relative", overflow: "hidden",
              }}
            >
              <div aria-hidden style={{ position: "absolute", top: -30, right: -10, fontSize: 120, fontWeight: 900, color: group.color, opacity: 0.08, lineHeight: 1, pointerEvents: "none" }}>
                {group.emoji}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, position: "relative" }}>
                <div style={{ width: 52, height: 52, flex: "none", borderRadius: 16, background: group.chipBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                  {group.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: group.color }}>{group.tag}</div>
                  <div style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-.4px", color: "#fff" }}>{group.title}</div>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                {group.items.map((item, ii) => (
                  <details key={item.q} className="btfs-faq" data-testid={`faq-${gi}-${ii}`}>
                    <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0", fontWeight: 700, fontSize: 15.5, color: "#fff" }}>
                      <span>{item.q}</span>
                      <span className="btfs-chevron" aria-hidden style={{ flex: "none", color: group.color, fontSize: 14, fontWeight: 900 }}>▾</span>
                    </summary>
                    <div className="btfs-faq-body" style={{ paddingBottom: 20 }}>
                      {item.paragraphs.map((p, pi) =>
                        typeof p === "string" ? (
                          <p key={pi} style={{ fontSize: 15, lineHeight: 1.7, color: "#fff", opacity: 0.92, margin: pi === 0 ? "0 0 12px" : "12px 0" }}>
                            {p}
                          </p>
                        ) : (
                          <div key={pi} style={{ margin: "12px 0" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: group.color, marginBottom: 8 }}>{p.label}</div>
                            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                              {p.bullets.map((b) => (
                                <li key={b} style={{ fontSize: 14.5, lineHeight: 1.6, color: "#fff", opacity: 0.92 }}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ),
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Closing CTA */}
        <div style={{ marginTop: 64, background: "linear-gradient(160deg,rgba(255,255,255,.06),rgba(5,5,8,.5))", border: "1.5px solid rgba(255,255,255,.14)", borderRadius: 24, padding: "44px 36px", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: "#94F7C5", fontSize: 18, transform: "rotate(-2deg)", marginBottom: 6 }}>{t.closingEyebrow}</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-1px", color: "#fff", marginBottom: 16 }}>{t.closingHead}</div>
          <div style={{ fontSize: 15.5, color: "#fff", opacity: 0.94, maxWidth: 680, margin: "0 auto 28px", lineHeight: 1.75 }}>
            {t.closingBody}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/partner-schools">
              <button
                className="btfs-btn-primary"
                data-testid="button-cta-apply"
                style={{
                  fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15,
                  color: "#050508", background: CTA_GRADIENT, backgroundSize: "200% 100%",
                  animation: "bt-rainbow 6s linear infinite", border: "none",
                  borderRadius: 12, padding: "15px 28px", whiteSpace: "nowrap", cursor: "pointer",
                }}
              >
                {t.closingCtaPrimary}
              </button>
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ textDecoration: "none" }}>
              <button
                className="btfs-btn-outline"
                data-testid="button-cta-email"
                style={{
                  fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15,
                  color: "#fff", background: "transparent", border: "1.5px solid rgba(255,255,255,.35)",
                  borderRadius: 12, padding: "15px 28px", whiteSpace: "nowrap", cursor: "pointer",
                }}
              >
                {t.closingCtaSecondary}
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
