// Logged-out legal page — branded pure-black street-graffiti chrome mounting
// the shared PublicNav + PublicFooter. Legal copy preserved verbatim.
import type { ReactNode, CSSProperties } from "react";
import { Link } from "wouter";
import { FileText, Shield, Users, Scale, BookOpen, Lock, RefreshCw, Globe, CreditCard, Undo2, Sparkles } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

// Handoff pastel accents, cycled per section.
const PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];

// ── Shared branded chrome for the four logged-out legal pages ───────────────
// Pure-black street-graffiti: Bebas display title, hard-offset accent cards,
// pure #fff body copy (no grey / no faded white), no glow/blur shadows.
const H1_STYLE: CSSProperties = {
  fontFamily: "'Bebas Neue', system-ui, sans-serif",
  fontSize: 40,
  lineHeight: 1.15,
  letterSpacing: "-0.5px",
  margin: "8px 0 14px",
  color: "#fff",
};
const CHIP_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12.5,
  fontWeight: 700,
  color: "#fff",
  border: "2px solid #9FD8FF",
  borderRadius: 999,
  padding: "6px 14px",
  marginBottom: 22,
};
const LEGAL_BODY_CSS = `
  .bt-legal-body { font-size: 15px; line-height: 1.7; color: #fff; }
  .bt-legal-body p, .bt-legal-body li, .bt-legal-body td, .bt-legal-body th, .bt-legal-body h4, .bt-legal-body strong, .bt-legal-body code { color: #fff; }
  .bt-legal-body table { font-size: 13px; }
  .bt-legal-body td, .bt-legal-body th { font-size: 13px; line-height: 1.6; }
  .bt-legal-body a { color: #9FD8FF; font-weight: 600; }
  .bt-legal-cross-pill { transition: transform .15s; }
  .bt-legal-cross-pill:hover { transform: translateY(-1px); }
`;
const LEGAL_LINKS = [
  { href: "/privacy-policy", en: "Privacy", af: "Privaatheid", accent: "#9FD8FF" },
  { href: "/terms-of-service", en: "Terms", af: "Bepalings", accent: "#FFB7E5" },
  { href: "/cookie-policy", en: "Cookies", af: "Koekies", accent: "#FFE29A" },
  { href: "/refund-policy", en: "Refunds", af: "Terugbetalings", accent: "#94F7C5" },
];

function LegalCrossNav({ isAf, activeHref }: { isAf: boolean; activeHref: string }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
      {LEGAL_LINKS.map((l) => {
        const active = l.href === activeHref;
        return (
          <Link key={l.href} href={l.href}>
            <span
              className="bt-legal-cross-pill"
              style={{
                display: "inline-block", fontSize: 12.5, fontWeight: 700,
                padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                color: active ? "#050508" : l.accent,
                background: active ? l.accent : "transparent",
                border: `2px solid ${l.accent}`,
              }}
            >
              {isAf ? l.af : l.en}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function Section({ accent, title, testId, children }: { accent: string; title: ReactNode; testId?: string; children: ReactNode }) {
  return (
    <section
      data-testid={testId}
      style={{
        background: "#050508",
        border: `2.5px solid ${accent}`,
        borderRadius: 16,
        padding: "22px 26px",
        boxShadow: `6px 6px 0 0 ${accent}`,
      }}
    >
      <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 12, color: accent }}>{title}</h2>
      <div className="bt-legal-body">{children}</div>
    </section>
  );
}

export default function TermsOfServicePage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  useSEO({
    title: "Terms & Conditions | BrainTrack",
    description: "BrainTrack terms and conditions — platform usage, CAPS alignment, intellectual property, data protection and learner responsibilities.",
    canonical: "https://braintrack.tech/terms-of-service",
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
          "Payment is processed securely through Paystack, our third-party payment provider, via recurring card authorisation. BrainTrack does not store any banking or card information."
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
        footer: "Manage your subscription in Settings → Subscription. For billing queries only, email learn@kth-tech.com."
      },
      {
        icon: Sparkles,
        title: "13. AI Tutor (Rizz) Usage",
        content: [
          "BrainTrack™ includes an AI-powered tutoring assistant called Rizz, powered by OpenAI technology.",
          "When you use the AI Tutor, your message content is transmitted to OpenAI's API for processing. We do not send your name, contact details or payment information to OpenAI.",
          "AI Tutor responses are generated automatically and may be inaccurate. They do not constitute professional advice of any kind.",
          "The AI Tutor is not a substitute for qualified medical, psychological or educational professionals. If you are in distress, contact SADAG at 0800 456 789 or a trusted adult."
        ]
      },
      {
        icon: CreditCard,
        title: "14. Virtual Currency & Store",
        content: [
          "BrainTrack™ includes a virtual coin system. Coins are earned through learning activity and awarded for streaks, badges and correct answers.",
          "Coins have no monetary value, cannot be exchanged for cash or real-world goods, are non-transferable between accounts, and are not refundable under any circumstances.",
          "Virtual store items (themes, power-ups, cosmetics) purchased with coins are non-refundable. All coin awards and store purchases are final.",
          "Power-ups have usage limitations: Streak Freeze protects one missed day and is consumed on use; Double Coins applies for 24 hours from purchase; Mystery Box delivers a random reward immediately upon purchase."
        ]
      },
      {
        icon: Users,
        title: "15. School & Institutional Accounts",
        content: [
          "Partner schools and educational institutions may access a school dashboard to monitor aggregated (non-personal) learner progress metrics.",
          "School administrators may not access individual learner messages, AI Tutor conversations, or voice notes.",
          "Schools that enrol learners under a group agreement remain responsible for obtaining parental consent for learners under 18."
        ]
      },
      {
        icon: Scale,
        title: "16. Governing Law",
        content: [
          "These Terms are governed by the laws of the Republic of South Africa.",
          "Any disputes arising from the use of BrainTrack™ shall be subject to the exclusive jurisdiction of the South African courts.",
          "BrainTrack™ is a product of KTH Projects (Pty) Ltd (registration number 2025/627290/07), a South African private company trading as KTH-Tech. Card charges appear on your bank statement as KTH-TECH."
        ]
      },
      {
        icon: RefreshCw,
        title: "17. Platform Updates",
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
          "Betaling word veilig deur Paystack, ons derdeparty-betalingsverskaffer, verwerk via herhalende kaartmagtiging. BrainTrack stoor geen bank- of kaartinligting nie."
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
        footer: "Bestuur jou intekening in Instellings → Intekening. Slegs vir faktureringsnavrae, e-pos learn@kth-tech.com."
      },
      {
        icon: Sparkles,
        title: "13. KI-Tutor (Rizz) Gebruik",
        content: [
          "BrainTrack™ sluit 'n KI-aangedrewe tutorbystandige genaamd Rizz in, aangedryf deur OpenAI-tegnologie.",
          "Wanneer jy die KI-Tutor gebruik, word jou boodskapinhoud na OpenAI se API gestuur vir verwerking. Ons stuur nie jou naam, kontakbesonderhede of betalingsinligting na OpenAI nie.",
          "KI-Tutor-antwoorde word outomaties gegenereer en kan onakkuraat wees. Hulle stel geen professionele advies van enige aard voor nie.",
          "Die KI-Tutor is nie 'n plaasvervanger vir gekwalifiseerde mediese, sielkundige of opvoedkundige professionele persone nie. As jy in nood is, kontak SADAG by 0800 456 789 of 'n vertroude volwassene."
        ]
      },
      {
        icon: CreditCard,
        title: "14. Virtuele Geldeenheid en Winkel",
        content: [
          "BrainTrack™ sluit 'n virtuele muntstelsel in. Munte word verdien deur leeraktiwiteit en toegeken vir reekse, kentekens en korrekte antwoorde.",
          "Munte het geen monetêre waarde nie, kan nie vir kontant of regte-wêreld-goedere ingeruil word nie, is nie oordraagbaar tussen rekeninge nie en is onder geen omstandighede terugbetaalbaar nie.",
          "Virtuele winkelitems (temas, hupstote, kosmetika) wat met munte gekoop word, is nie terugbetaalbaar nie. Alle munttoekenninge en winkelaankope is finaal.",
          "Hupstote het gebruiksbeperkings: Reeks Vries beskerm een gemiste dag en word met gebruik verbruik; 2x Munte geld vir 24 uur vanaf aankoop; Raaiselkas lewer onmiddellik 'n ewekansige beloning na aankoop."
        ]
      },
      {
        icon: Users,
        title: "15. Skool- en Institusionele Rekeninge",
        content: [
          "Vennootskole en opvoedkundige instellings kan toegang kry tot 'n skoolinstrumentbord om geaggregeerde (nie-persoonlike) leerder-vordering-statistieke te monitor.",
          "Skooladministrateurs kan nie toegang kry tot individuele leerder-boodskappe, KI-Tutor-gesprekke of stemnote nie.",
          "Skole wat leerders onder 'n groepsooreenkoms inskryf, bly verantwoordelik vir die verkryging van ouertoestemming vir leerders onder 18."
        ]
      },
      {
        icon: Scale,
        title: "16. Beherende Reg",
        content: [
          "Hierdie Voorwaardes word beheer deur die wette van die Republiek van Suid-Afrika.",
          "Enige geskille wat spruit uit die gebruik van BrainTrack™ sal onderhewig wees aan die eksklusiewe jurisdiksie van die Suid-Afrikaanse howe.",
          "BrainTrack™ is 'n produk van KTH Projects (Edms) Bpk (registrasienommer 2025/627290/07), 'n Suid-Afrikaanse private maatskappy wat handel dryf as KTH-Tech. Kaartheffings verskyn op jou bankstaat as KTH-TECH."
        ]
      },
      {
        icon: RefreshCw,
        title: "17. Platformwysigings",
        content: [
          "BrainTrack™ kan funksies, inhoud en beleide opdateer om kwaliteit en kurrikulum-belyning te handhaaf."
        ]
      }
    ]
  };

  const currentSections = sections[isAf ? "af" : "en"];

  return (
    <div className="min-h-screen" style={{ background: "#050508", color: "#fff" }} data-testid="page-terms-of-service">
      <PublicNav />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "80px 20px 0" }}>
        <style>{LEGAL_BODY_CSS}</style>

        <h1 data-testid="text-terms-title" style={H1_STYLE}>
          {isAf ? "Diensvoorwaardes" : "Terms & Conditions"}
        </h1>
        <div style={CHIP_STYLE}>
          KTH Tech (Pty) Ltd · {isAf ? "Laas opgedateer: 16 Julie 2026" : "Last updated: 16 July 2026"}
        </div>
        <LegalCrossNav isAf={isAf} activeHref="/terms-of-service" />

        <div className="bt-legal-body space-y-3" style={{ marginBottom: 28 }}>
          <p>
            {isAf
              ? "Alles wat jy moet weet voor jy BrainTrack™ gebruik — reguit en sonder raaisels."
              : "Everything you need to know before using BrainTrack™ — straight up, no small print games."}
          </p>
          <p>
            {isAf ? (
              <>
                In hierdie Voorwaardes verwys <strong>&ldquo;BrainTrack&rdquo;</strong>, <strong>&ldquo;ons&rdquo;</strong> of <strong>&ldquo;ons s&rsquo;n&rdquo;</strong> na <strong>KTH Projects (Edms) Bpk</strong> (registrasienommer 2025/627290/07), &rsquo;n Suid-Afrikaanse private maatskappy wat handel dryf as <strong>KTH-Tech</strong>. BrainTrack is ons matriek-eksamenvoorbereidingsproduk. Kaartheffings verskyn op jou bankstaat as <strong>KTH-TECH</strong>.
              </>
            ) : (
              <>
                In these Terms, <strong>&ldquo;BrainTrack&rdquo;</strong>, <strong>&ldquo;we&rdquo;</strong>, <strong>&ldquo;us&rdquo;</strong>, or <strong>&ldquo;our&rdquo;</strong> refers to <strong>KTH Projects (Pty) Ltd</strong> (registration number 2025/627290/07), a South African private company trading as <strong>KTH-Tech</strong>. BrainTrack is our matric exam-preparation product. Card charges appear on your bank statement as <strong>KTH-TECH</strong>.
              </>
            )}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {currentSections.map((section, index) => {
            const hex = PASTELS[index % PASTELS.length];
            return (
              <Section key={index} accent={hex} title={section.title} testId={`terms-section-${index}`}>
                <div className="space-y-3">
                  {section.content.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  {(section as any).bullets && (
                    <ul className="space-y-2 mt-2">
                      {(section as any).bullets.map((b: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: hex }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(section as any).footer && (
                    <p
                      className="mt-3 pt-3 font-semibold"
                      style={{ borderTop: `1px dashed ${hex}`, color: hex }}
                    >
                      {(section as any).footer}
                    </p>
                  )}
                </div>
              </Section>
            );
          })}

          <div style={{ textAlign: "center", padding: "10px 0 0" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>BrainTrack™</div>
            <div style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>
              {isAf ? "Alle regte voorbehou. Suid-Afrika." : "All rights reserved. South Africa."}
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
