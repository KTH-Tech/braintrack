import { FileText, Shield, Users, Scale, BookOpen, Lock, RefreshCw, Globe, CreditCard, Undo2, ArrowLeft, Sparkles } from "lucide-react";
import { FooterPageHomeButton } from "@/components/footer-page-nav";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

const NEON_PALETTE = [
  "#ff6a1f", "#ff8a1f", "#ffb020", "#ffd83a",
  "#28c9d6", "#4f8cd9", "#8e7cdc", "#b066d6", "#e6519c"
];

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function TermsOfServicePage() {
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  useSEO({
    title: "Terms & Conditions | BrainTrack",
    description: "BrainTrack terms and conditions covering platform usage, CAPS alignment, intellectual property, data protection and learner responsibilities. Powered by BrainTrack.",
    canonical: "https://braintrack.app/terms-of-service",
  });

  const sections = {
    en: [
      {
        icon: BookOpen,
        title: "1. Purpose of the Platform",
        content: [
          "BrainTrack™ provides CAPS-aligned learning content, practice assessments and exam-style mock tests to support learners in their studies.",
          "The platform is an educational support tool and does not replace school teaching or official examinations."
        ]
      },
      {
        icon: Globe,
        title: "2. Curriculum Alignment",
        content: [
          "All content on BrainTrack™ is aligned to the CAPS curriculum and informed by historical NSC examination patterns.",
          "BrainTrack™ operates independently and is not affiliated with the Department of Basic Education."
        ]
      },
      {
        icon: RefreshCw,
        title: "3. Predictive & Adaptive Learning",
        content: [
          "BrainTrack™ uses analysis of past examination trends to guide learning focus and create realistic exam-style practice.",
          "These tools do not predict exact examination questions and do not guarantee academic results."
        ]
      },
      {
        icon: Shield,
        title: "4. No Guarantee of Results",
        content: [
          "Learner progress depends on individual effort, engagement and study consistency.",
          "BrainTrack™ does not guarantee passes, marks or distinctions."
        ]
      },
      {
        icon: FileText,
        title: "5. Automated Marking",
        content: [
          "Automated marking provides immediate feedback based on structured marking logic.",
          "Results are indicative and may differ from teacher or examiner marking, particularly for written responses."
        ]
      },
      {
        icon: Users,
        title: "6. User Responsibilities",
        content: [
          "Users agree to:",
        ],
        bullets: [
          "Use the platform honestly",
          "Not attempt to bypass exam controls",
          "Not share content without permission"
        ]
      },
      {
        icon: Lock,
        title: "7. Intellectual Property",
        content: [
          "All content, systems, assessments, branding and software on BrainTrack™ are the intellectual property of BrainTrack.",
          "No material may be copied, distributed or sold without written consent."
        ]
      },
      {
        icon: Scale,
        title: "8. Limitation of Liability",
        content: [
          "BrainTrack™ is not responsible for:",
        ],
        bullets: [
          "Examination outcomes",
          "Academic decisions",
          "System interruptions"
        ],
        footer: "Use is at the learner\u2019s own risk."
      },
      {
        icon: Lock,
        title: "9. Privacy & Data Protection",
        content: [
          "All learner data is processed securely and in accordance with South Africa\u2019s Protection of Personal Information Act (POPIA).",
          "Data is used only to support learning progress and platform functionality.",
          "No data is sold or shared without consent."
        ]
      },
      {
        icon: CreditCard,
        title: "10. Subscriptions & Billing",
        content: [
          "Access to BrainTrack\u2122 requires a paid subscription at R169 per month.",
          "Subscriptions are purchased by a parent or guardian on behalf of the learner.",
          "Payment is processed securely through Netcash, our third-party payment provider, via DebiCheck mandate or recurring card token. BrainTrack does not store any banking or card information."
        ],
        bullets: [
          "Subscriptions grant access for one learner account",
          "Billing occurs monthly from the date of purchase",
          "No long-term contracts — cancel anytime"
        ]
      },
      {
        icon: Undo2,
        title: "11. Cancellations & Refunds",
        content: [
          "Users may cancel their subscription at any time directly in the app under Settings → Subscription. Cancellation takes effect at the end of the current billing cycle.",
        ],
        bullets: [
          "Cancellation takes effect at the end of the current billing cycle",
          "No refunds are issued for partial months",
          "Access continues until the end of the paid period after cancellation"
        ],
        footer: "Manage your subscription in Settings → Subscription. For billing queries only, email brain-support@kthtech.co.za."
      },
      {
        icon: RefreshCw,
        title: "12. Platform Updates",
        content: [
          "BrainTrack™ may update features, content and policies to maintain quality and curriculum alignment."
        ]
      }
    ],
    af: [
      {
        icon: BookOpen,
        title: "1. Doel van die Platform",
        content: [
          "BrainTrack™ bied KABV-gebaseerde leerinhoud, oefentoetse en eksamenstyl-toetse om leerders in hul studies te ondersteun.",
          "Die platform is \u2019n opvoedkundige hulpmiddel en vervang nie skoolonderrig of amptelike eksamens nie."
        ]
      },
      {
        icon: Globe,
        title: "2. Kurrikulum-belyning",
        content: [
          "Alle inhoud op BrainTrack™ is in lyn met die KABV-kurrikulum en gebaseer op vorige Departement van Basiese Onderwys (DBO) eksamenstrukture.",
          "BrainTrack™ funksioneer onafhanklik en is nie aan die DBO gekoppel nie."
        ]
      },
      {
        icon: RefreshCw,
        title: "3. Voorspellende en Aanpasbare Leer",
        content: [
          "BrainTrack™ gebruik ontleding van vorige eksamens om leerfokus te verbeter en realistiese oefentoetse te skep.",
          "Hierdie hulpmiddels voorspel nie presiese vrae nie en waarborg geen akademiese uitslae nie."
        ]
      },
      {
        icon: Shield,
        title: "4. Geen Waarborg van Resultate",
        content: [
          "Leerderprestasie hang af van individuele inspanning, betrokkenheid en volgehoue studiekonsekwentheid.",
          "BrainTrack™ waarborg geen slaag, punte of onderskeidings nie."
        ]
      },
      {
        icon: FileText,
        title: "5. Outomatiese Nasien",
        content: [
          "Outomatiese nasien verskaf onmiddellike terugvoer gebaseer op gestruktureerde nasienlogika.",
          "Resultate is aanduidend en kan van onderwyser- of eksaminator-nasien verskil, veral vir geskrewe antwoorde."
        ]
      },
      {
        icon: Users,
        title: "6. Gebruikersverantwoordelikhede",
        content: [
          "Gebruikers stem in om:",
        ],
        bullets: [
          "Die platform eerlik te gebruik",
          "Nie eksamenbeheer te omseil nie",
          "Nie inhoud sonder toestemming te versprei nie"
        ]
      },
      {
        icon: Lock,
        title: "7. Intellektuele Eiendom",
        content: [
          "Alle inhoud, stelsels, assesserings, handelsmerke en sagteware op BrainTrack™ is die intellektuele eiendom van BrainTrack.",
          "Geen materiaal mag sonder skriftelike toestemming gekopieer, versprei of verkoop word nie."
        ]
      },
      {
        icon: Scale,
        title: "8. Beperking van Aanspreeklikheid",
        content: [
          "BrainTrack™ is nie aanspreeklik vir:",
        ],
        bullets: [
          "Eksamenuitslae",
          "Akademiese besluite",
          "Tegniese probleme"
        ],
        footer: "Gebruik geskied op eie risiko."
      },
      {
        icon: Lock,
        title: "9. Privaatheid en Databeskerming",
        content: [
          "Alle leerderdata word veilig verwerk in ooreenstemming met Suid-Afrika se Wet op die Beskerming van Persoonlike Inligting (POPIA).",
          "Data word slegs gebruik om leervordering en platformfunksionaliteit te ondersteun.",
          "Geen data word sonder toestemming verkoop of gedeel nie."
        ]
      },
      {
        icon: CreditCard,
        title: "10. Intekenings en Fakturering",
        content: [
          "Toegang tot BrainTrack\u2122 vereis 'n betaalde intekening teen R169 per maand.",
          "Intekenings word deur 'n ouer of voog namens die leerder aangekoop.",
          "Betaling word veilig deur Netcash, ons derdeparty-betalingsverskaffer, verwerk via DebiCheck-mandaat of herhalende kaarttoken. BrainTrack stoor geen bank- of kaartinligting nie."
        ],
        bullets: [
          "Intekenings verleen toegang vir een leerderrekening",
          "Fakturering geskied maandeliks vanaf die aankoopdatum",
          "Geen langtermynkontrakte — kanselleer enige tyd"
        ]
      },
      {
        icon: Undo2,
        title: "11. Kansellasies en Terugbetalings",
        content: [
          "Gebruikers kan hul intekening enige tyd direk in die app kanselleer onder Instellings → Intekening. Kansellasie tree in werking aan die einde van die huidige faktuursiklus.",
        ],
        bullets: [
          "Kansellasie tree in werking aan die einde van die huidige faktureringssiklus",
          "Geen terugbetalings word vir gedeeltelike maande uitgereik nie",
          "Toegang duur voort tot die einde van die betaalde tydperk na kansellasie"
        ],
        footer: "Bestuur jou intekening in Instellings → Intekening. Slegs vir faktureringsnavrae, e-pos brain-support@kthtech.co.za."
      },
      {
        icon: RefreshCw,
        title: "12. Platformwysigings",
        content: [
          "BrainTrack™ kan funksies, inhoud en beleide opdateer om kwaliteit en kurrikulum-belyning te handhaaf."
        ]
      }
    ]
  };

  const currentSections = sections[isAf ? "af" : "en"];

  return (
    <div className="min-h-screen bg-black text-white">
      <header
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg"
        style={{ borderBottom: "1px solid rgba(142,124,220,0.35)" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black text-xs font-bold"
                style={{ color: "#28c9d6", border: "1.5px solid #28c9d6", boxShadow: "0 0 12px rgba(40,201,214,0.4)" }}
                data-testid="terms-nav-back"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {isAf ? "Terug" : "Back"}
              </button>
            </Link>
            <span className="font-black text-sm hidden sm:inline tracking-tight" style={{ color: "#ffd83a", textShadow: "0 0 8px rgba(255,216,58,0.4)" }}>
              {isAf ? "Diensvoorwaardes" : "Terms & Conditions"}
            </span>
          </div>
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-[11px] font-black"
            style={{ color: "#8e7cdc", border: "1px solid rgba(142,124,220,0.55)", boxShadow: "0 0 10px rgba(142,124,220,0.35)" }}
            data-testid="button-language-toggle"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{language === "en" ? "EN" : "AF"}</span>
          </button>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(40,201,214,0.35), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 right-0 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(230,81,156,0.3), transparent 70%)" }}
        />

        <div className="relative text-center space-y-4 py-6">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] px-4 py-1.5 rounded-full bg-black"
            style={{ color: "#28c9d6", border: "1px solid rgba(40,201,214,0.55)", boxShadow: "0 0 14px rgba(40,201,214,0.35)" }}
          >
            <Scale className="w-3.5 h-3.5" style={{ filter: "drop-shadow(0 0 4px #28c9d6)" }} />
            {isAf ? "Die Kleingedrukte" : "The Fine Print"}
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.05]"
            data-testid="text-terms-title"
            style={{
              background: "linear-gradient(90deg, #ff6a1f, #ffd83a, #28c9d6, #8e7cdc, #e6519c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 22px rgba(40,201,214,0.28))",
            }}
          >
            {isAf ? "Diensvoorwaardes" : "Terms & Conditions"}
          </h1>
          <p className="text-sm sm:text-base text-white max-w-2xl mx-auto">
            {isAf
              ? "Alles wat jy moet weet voor jy BrainTrack™ gebruik — reguit en sonder raaisels."
              : "Everything you need to know before using BrainTrack™ — straight up, no small print games."}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#ffd83a" }}>
            {isAf ? "Laas opgedateer: 15 Mei 2026" : "Last updated: 15 May 2026"}
          </p>
        </div>

        <div className="relative space-y-4">
          {currentSections.map((section, index) => {
            const Icon = section.icon;
            const hex = NEON_PALETTE[index % NEON_PALETTE.length];
            return (
              <div
                key={index}
                className="relative rounded-2xl bg-black p-5 sm:p-6"
                style={{
                  border: `1.5px solid ${hex}`,
                  boxShadow: `0 0 0 1px ${hexToRgba(hex, 0.25)}, 0 0 28px ${hexToRgba(hex, 0.3)}, inset 0 0 20px rgba(0,0,0,0.6)`,
                }}
                data-testid={`terms-section-${index}`}
              >
                <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-2xl" style={{ borderColor: hex }} />
                <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-2xl" style={{ borderColor: hex }} />
                <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-2xl" style={{ borderColor: hex }} />
                <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-2xl" style={{ borderColor: hex }} />

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0"
                    style={{ border: `1.5px solid ${hex}`, boxShadow: `0 0 14px ${hexToRgba(hex, 0.5)}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex})` }} />
                  </div>
                  <h2
                    className="text-base sm:text-lg font-black tracking-tight"
                    style={{ color: hex, textShadow: `0 0 10px ${hexToRgba(hex, 0.4)}` }}
                  >
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-white">
                  {section.content.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  {(section as any).bullets && (
                    <ul className="space-y-2 mt-2">
                      {(section as any).bullets.map((b: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: hex, boxShadow: `0 0 6px ${hex}` }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(section as any).footer && (
                    <p
                      className="mt-3 pt-3 text-xs sm:text-sm font-semibold"
                      style={{ borderTop: `1px dashed ${hexToRgba(hex, 0.4)}`, color: hex }}
                    >
                      {(section as any).footer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="relative rounded-2xl bg-black p-6 text-center space-y-2 mt-8"
          style={{
            border: "1.5px solid #ffd83a",
            boxShadow: "0 0 0 1px rgba(255,216,58,0.25), 0 0 32px rgba(255,216,58,0.35), inset 0 0 24px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: "#ffd83a", filter: "drop-shadow(0 0 4px #ffd83a)" }} />
            <p className="text-base font-black tracking-tight" style={{ color: "#ffd83a", textShadow: "0 0 10px rgba(255,216,58,0.45)" }}>
              BrainTrack™
            </p>
            <Sparkles className="w-4 h-4" style={{ color: "#ffd83a", filter: "drop-shadow(0 0 4px #ffd83a)" }} />
          </div>
          <p className="text-sm text-white">
            {isAf ? "Alle regte voorbehou. Suid-Afrika." : "All rights reserved. South Africa."}
          </p>
        </div>

        <div className="text-center pt-4">
          <FooterPageHomeButton />
        </div>
      </main>
    </div>
  );
}
