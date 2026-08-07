// Logged-out legal page — branded pure-black street-graffiti chrome mounting
// the shared PublicNav + PublicFooter. Legal copy preserved verbatim.
import type { ReactNode, CSSProperties } from "react";
import { Undo2, CreditCard, AlertCircle, Clock, Scale } from "lucide-react";
import { Link } from "wouter";
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

export default function RefundPolicyPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  useSEO({
    title: "Refund Policy | BrainTrack",
    description: "BrainTrack refund and cancellation policy — subscription billing, cancellation terms, and how refunds are handled under South African consumer law.",
    canonical: "https://app.braintrack.tech/refund-policy",
  });

  const sections = {
    en: [
      {
        icon: CreditCard,
        title: "1. Subscription Billing",
        content: [
          "BrainTrack™ subscriptions are billed monthly at R169 per month from the date of activation.",
          "Billing is processed securely through Paystack using a tokenized recurring card. BrainTrack does not store any banking or card information — your card details are held by Paystack.",
          "Your subscription grants access to one learner account for the billing period."
        ],
      },
      {
        icon: Undo2,
        title: "2. Cancellation",
        content: [
          "You cancel your subscription directly in the app — Settings → Subscription → Cancel. It takes effect immediately and stops all future charges. No emails, no phone calls, no third-party portals needed.",
          "Cancellation takes effect at the end of the current paid billing cycle — you retain full access until that date.",
          "There are no long-term contracts or cancellation fees."
        ],
        bullets: [
          "Cancel in the app: Settings → Subscription → Cancel Subscription",
          "Access continues until end of the paid period",
          "No fee to cancel",
        ],
      },
      {
        icon: AlertCircle,
        title: "3. Refund Policy",
        content: [
          "BrainTrack™ does not issue refunds for partial months or unused days within a billing period.",
          "Once a billing period begins, the subscription fee for that period is non-refundable, except where a refund is required by these terms or by applicable South African consumer law.",
          "If you believe a charge was made in error, raise it within 7 days through your subscription settings in the app (Settings → Subscription) and it will be reviewed in line with these terms.",
          "The Exam Season Pass (once-off R550, access until 15 December 2026), the Prelim Sprint (once-off R250, 6 weeks of access) and the Finals Blitz (once-off R250, 6 weeks of access) are charged in full at signup and are single, non-recurring payments. They are final and non-refundable to the extent permitted by applicable South African law, and access continues until the end date regardless of how much of the service is used. Nothing in this policy limits any right you may have under consumer protection legislation that cannot lawfully be excluded."
        ],
        bullets: [
          "No refunds for partial months",
          "No refunds for unused access within a paid period",
          "Once-off passes are final and non-refundable (to the extent permitted by law)",
          "Disputed charges must be raised in the app within 7 days",
        ],
      },
      {
        icon: Scale,
        title: "4. Virtual Currency (Coins)",
        content: [
          "BrainTrack™ coins are virtual in-app currency with no monetary value.",
          "Coins cannot be exchanged for cash, transferred to other accounts, or refunded under any circumstances.",
          "Virtual store items (themes, power-ups, cosmetics) purchased with coins are final and non-refundable."
        ],
      },
      {
        icon: Clock,
        title: "5. Immediate Charge & Access",
        content: [
          "Subscriptions and once-off passes are charged in full at signup. BrainTrack™ does not offer a free trial.",
          "Digital access begins immediately, so payments are generally non-refundable once access is granted.",
          "For any billing issue, contact learn@kth-tech.com and we'll help."
        ],
      },
      {
        icon: AlertCircle,
        title: "6. Failed Payments",
        content: [
          "If a payment fails, BrainTrack™ will attempt to notify you via email or SMS.",
          "Access may be suspended if payment is not resolved within 5 business days.",
          "Your progress data is retained for 12 months after account suspension, allowing easy reactivation."
        ],
      },
      {
        icon: Scale,
        title: "7. How Refunds Are Handled",
        content: [
          "Cancellations and any refunds are handled in the app under your subscription settings (Settings → Subscription), in line with these terms and applicable South African consumer law.",
          "Nothing in this policy limits any right you may have under the Consumer Protection Act 68 of 2008 or, where it applies, the cooling-off provision of the Electronic Communications and Transactions Act 25 of 2002.",
        ],
        footer: "Billing queries raised in the app are typically resolved within 2 business days.",
      },
    ],
    af: [
      {
        icon: CreditCard,
        title: "1. Intekeningfakturering",
        content: [
          "BrainTrack™-intekenings word maandeliks gefaktureer teen R169 per maand vanaf die aktiveringsdatum.",
          "Fakturering word veilig deur Paystack verwerk met 'n getokeniseerde herhalende kaart. BrainTrack stoor geen bank- of kaartinligting nie — jou kaartbesonderhede word deur Paystack gehou.",
          "Jou intekening bied toegang tot een leerderrekening vir die faktureringstydperk."
        ],
      },
      {
        icon: Undo2,
        title: "2. Kansellasie",
        content: [
          "Jy kanselleer jou intekening direk in die app — Instellings → Intekening → Kanselleer. Dit tree onmiddellik in werking en stop alle toekomstige heffings. Geen e-posse, geen oproepe, geen derdeparty-portale nodig nie.",
          "Kansellasie tree in werking aan die einde van die huidige betaalde faktureringssiklus — jy behou volle toegang tot daardie datum.",
          "Daar is geen langtermynkontrakte of kansellasiegelde nie."
        ],
        bullets: [
          "Kanselleer via: Instellings → Intekening → Kanselleer Intekening",
          "Toegang duur voort tot die einde van die betaalde tydperk",
          "Geen geld om te kanselleer nie",
        ],
      },
      {
        icon: AlertCircle,
        title: "3. Terugbetalingsbeleid",
        content: [
          "BrainTrack™ reik nie terugbetalings uit vir gedeeltelike maande of ongebruikte dae binne 'n faktureringssiklus nie.",
          "Sodra 'n faktureringssiklus begin, is die intekeningsfooi vir daardie tydperk nie-terugbetaalbaar nie, behalwe waar 'n terugbetaling deur hierdie bepalings of deur toepaslike Suid-Afrikaanse verbruikersreg vereis word.",
          "As jy glo dat 'n heffing per abuis gemaak is, meld dit binne 7 dae aan via jou intekeninginstellings in die app (Instellings → Intekening), en dit sal in lyn met hierdie bepalings hersien word.",
          "Die Eksamen Seisoenkaart (eenmalig R550, toegang tot 15 Desember 2026), die Voorlopige Sprint (eenmalig R250, 6 weke toegang) en die Finale Blitz (eenmalig R250, 6 weke toegang) word ten volle by aanmelding gehef en is enkele, nie-herhalende betalings. Dit is finaal en nie-terugbetaalbaar in die mate wat toepaslike Suid-Afrikaanse reg toelaat, en toegang duur voort tot die einddatum ongeag hoeveel van die diens gebruik word. Niks in hierdie beleid beperk enige reg wat jy ingevolge verbruikersbeskermingswetgewing het wat nie wettiglik uitgesluit kan word nie."
        ],
        bullets: [
          "Geen terugbetalings vir gedeeltelike maande nie",
          "Geen terugbetalings vir ongebruikte toegang binne 'n betaalde tydperk nie",
          "Eenmalige kaarte is finaal en nie-terugbetaalbaar (in die mate wat die wet toelaat)",
          "Betwiste heffings moet binne 7 dae in die app aangemeld word",
        ],
      },
      {
        icon: Scale,
        title: "4. Virtuele Geldeenheid (Munte)",
        content: [
          "BrainTrack™-munte is virtuele in-toepassing-geldeenheid sonder monetêre waarde.",
          "Munte kan nie vir kontant ingeruil word, na ander rekeninge oorgedra word, of onder enige omstandighede terugbetaal word nie.",
          "Virtuele winkelitems (temas, hupstote, kosmetika) wat met munte gekoop word, is finaal en nie-terugbetaalbaar."
        ],
      },
      {
        icon: Clock,
        title: "5. Onmiddellike Heffing & Toegang",
        content: [
          "Intekeninge en eenmalige kaarte word ten volle by aanmelding gehef. BrainTrack™ bied nie 'n gratis proeftydperk aan nie.",
          "Digitale toegang begin dadelik, dus is betalings oor die algemeen nie-terugbetaalbaar sodra toegang verleen is.",
          "Vir enige faktureringskwessie, kontak learn@kth-tech.com en ons sal help."
        ],
      },
      {
        icon: AlertCircle,
        title: "6. Mislukte Betalings",
        content: [
          "As 'n betaling misluk, sal BrainTrack™ probeer om jou per e-pos of SMS in kennis te stel.",
          "Toegang kan gesuspendeer word as betaling nie binne 5 werksdae opgelos word nie.",
          "Jou vorderingsdata word vir 12 maande na rekeningsuspensie behou, wat maklike herinstelling moontlik maak."
        ],
      },
      {
        icon: Scale,
        title: "7. Hoe Terugbetalings Hanteer Word",
        content: [
          "Kansellasies en enige terugbetalings word in die app hanteer onder jou intekeninginstellings (Instellings → Intekening), in lyn met hierdie bepalings en toepaslike Suid-Afrikaanse verbruikersreg.",
          "Niks in hierdie beleid beperk enige reg wat jy mag hê onder die Wet op Verbruikersbeskerming 68 van 2008 of, waar dit van toepassing is, die afkoelbepaling van die Wet op Elektroniese Kommunikasie en Transaksies 25 van 2002 nie.",
        ],
        footer: "Faktureringsnavrae wat in die app aangemeld word, word gewoonlik binne 2 werksdae opgelos.",
      },
    ],
  };

  const currentSections = sections[isAf ? "af" : "en"];

  return (
    <div className="min-h-screen" style={{ background: "#050508", color: "#fff" }} data-testid="page-refund-policy">
      <PublicNav />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "80px 20px 0" }}>
        <style>{LEGAL_BODY_CSS}</style>

        <h1 data-testid="text-refund-title" style={H1_STYLE}>
          {isAf ? "Terugbetalingsbeleid" : "Refund Policy"}
        </h1>
        <div style={CHIP_STYLE}>
          KTH Tech (Pty) Ltd · {isAf ? "Laas opgedateer: 16 Julie 2026" : "Last updated: 16 July 2026"}
        </div>
        <LegalCrossNav isAf={isAf} activeHref="/refund-policy" />

        <div className="bt-legal-body space-y-3" style={{ marginBottom: 28 }}>
          <p>
            {isAf
              ? "Ons is deursigtig oor hoe fakturering, kansellasies en terugbetalings werk."
              : "We're transparent about how billing, cancellations, and refunds work."}
          </p>
          <p>
            {isAf ? (
              <>
                In hierdie Terugbetalingsbeleid verwys <strong>&ldquo;BrainTrack&rdquo;</strong>, <strong>&ldquo;ons&rdquo;</strong> of <strong>&ldquo;ons s&rsquo;n&rdquo;</strong> na <strong>KTH Projects (Edms) Bpk</strong> (registrasienommer 2025/627290/07), &rsquo;n Suid-Afrikaanse private maatskappy wat handel dryf as <strong>KTH-Tech</strong>. BrainTrack is ons matriek-eksamenvoorbereidingsproduk. Kaartheffings verskyn op jou bankstaat as <strong>KTH-TECH</strong>.
              </>
            ) : (
              <>
                In this Refund Policy, <strong>&ldquo;BrainTrack&rdquo;</strong>, <strong>&ldquo;we&rdquo;</strong>, <strong>&ldquo;us&rdquo;</strong>, or <strong>&ldquo;our&rdquo;</strong> refers to <strong>KTH Projects (Pty) Ltd</strong> (registration number 2025/627290/07), a South African private company trading as <strong>KTH-Tech</strong>. BrainTrack is our matric exam-preparation product. Card charges appear on your bank statement as <strong>KTH-TECH</strong>.
              </>
            )}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {currentSections.map((section, index) => {
            const hex = PASTELS[index % PASTELS.length];
            return (
              <Section key={index} accent={hex} title={section.title} testId={`refund-section-${index}`}>
                <div className="space-y-3">
                  {section.content.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  {(section as any).bullets && (
                    <ul className="space-y-2 mt-2">
                      {(section as any).bullets.map((b: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: hex }} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(section as any).footer && (
                    <p className="mt-2">
                      {(section as any).footer}
                    </p>
                  )}
                </div>
              </Section>
            );
          })}

          <div style={{ textAlign: "center", padding: "10px 0 0" }}>
            <Link href="/terms-of-service">
              <span style={{ fontSize: 13, fontWeight: 600, color: "#9FD8FF", cursor: "pointer" }}>
                {isAf ? "Volledige Diensbepalings bekyk →" : "View full Terms of Service →"}
              </span>
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
