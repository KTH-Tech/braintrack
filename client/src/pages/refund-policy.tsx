// Chrome restyled to the Claude Design handoff "Luxury Street Graffiti
// EdTech" comp (LEGAL PAGES section) via LegalShell. Legal copy verbatim.
import { Undo2, CreditCard, AlertCircle, Clock, Scale } from "lucide-react";
import { LegalShell, LegalSection } from "@/components/legal-shell";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

// Handoff pastel accents, cycled per section.
const PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];

export default function RefundPolicyPage() {
  const { language, toggleLanguage } = useLanguage();
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
          "If you believe a charge was made in error, raise it within 7 days through your subscription settings in the app (Settings → Subscription) and it will be reviewed in line with these terms."
        ],
        bullets: [
          "No refunds for partial months",
          "No refunds for unused access within a paid period",
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
        title: "5. Trial Period",
        content: [
          "New subscribers may be offered a free trial period. No charge is made during the trial.",
          "If you cancel before the trial ends, no payment is taken.",
          "If you do not cancel before the trial ends, billing begins automatically at R169/month."
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
          "As jy glo dat 'n heffing per abuis gemaak is, meld dit binne 7 dae aan via jou intekeninginstellings in die app (Instellings → Intekening), en dit sal in lyn met hierdie bepalings hersien word."
        ],
        bullets: [
          "Geen terugbetalings vir gedeeltelike maande nie",
          "Geen terugbetalings vir ongebruikte toegang binne 'n betaalde tydperk nie",
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
        title: "5. Proeftydperk",
        content: [
          "Nuwe intekenaars kan 'n gratis proeftydperk aangebied word. Geen heffing word gedurende die proeftydperk gemaak nie.",
          "As jy voor die einde van die proeftydperk kanselleer, word geen betaling geneem nie.",
          "As jy nie voor die einde van die proeftydperk kanselleer nie, begin fakturering outomaties teen R169/maand."
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
    <LegalShell
      title={isAf ? "Terugbetalingsbeleid" : "Refund Policy"}
      titleTestId="text-refund-title"
      updated={isAf ? "Laas opgedateer: 16 Julie 2026" : "Last updated: 16 July 2026"}
      language={language}
      onToggleLanguage={toggleLanguage}
      activeHref="/refund-policy"
      backTestId="refund-nav-back"
      lead={
        <p>
          {isAf
            ? "Ons is deursigtig oor hoe fakturering, kansellasies en terugbetalings werk."
            : "We're transparent about how billing, cancellations, and refunds work."}
        </p>
      }
    >
      {currentSections.map((section, index) => {
        const hex = PASTELS[index % PASTELS.length];
        return (
          <LegalSection key={index} accent={hex} title={section.title} testId={`refund-section-${index}`}>
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
          </LegalSection>
        );
      })}

      <div style={{ textAlign: "center", padding: "10px 0 0" }}>
        <Link href="/terms-of-service">
          <span style={{ fontSize: 13, fontWeight: 600, color: "#9FD8FF", cursor: "pointer" }}>
            {isAf ? "Volledige Diensbepalings bekyk →" : "View full Terms of Service →"}
          </span>
        </Link>
      </div>
    </LegalShell>
  );
}
