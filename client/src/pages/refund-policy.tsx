import { Undo2, CreditCard, AlertCircle, Clock, Mail, ArrowLeft, Globe, Scale } from "lucide-react";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

const NEON_PALETTE = [
  "#00E5FF", "#006BFF", "#8A2BFF", "#8A2BFF", "#FF2BD6",
  "#FF8A00", "#FFE600", "#FF8A00", "#00E5FF",
];

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function RefundPolicyPage() {
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  useSEO({
    title: "Refund Policy | BrainTrack",
    description: "BrainTrack refund and cancellation policy — subscription billing, cancellation terms, and how to contact support for billing queries.",
    canonical: "https://app.braintrack.co.za/refund-policy",
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
          "Once a billing period begins, the subscription fee for that period is non-refundable.",
          "If you believe a charge was made in error, contact us within 7 days at learn@kth-tech.com and we will investigate promptly."
        ],
        bullets: [
          "No refunds for partial months",
          "No refunds for unused access within a paid period",
          "Disputed charges must be raised within 7 days",
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
        icon: Mail,
        title: "7. Billing Support",
        content: [
          "For billing queries, disputed charges, or refund requests, contact us at:",
        ],
        contact: "learn@kth-tech.com",
        footer: "Please include your account email address and the date of the charge in your message. We aim to respond within 2 business days.",
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
          "Sodra 'n faktureringssiklus begin, is die intekeningsfooi vir daardie tydperk nie-terugbetaalbaar.",
          "As jy glo dat 'n heffing per abuis gemaak is, kontak ons binne 7 dae by learn@kth-tech.com en ons sal onmiddellik ondersoek instel."
        ],
        bullets: [
          "Geen terugbetalings vir gedeeltelike maande nie",
          "Geen terugbetalings vir ongebruikte toegang binne 'n betaalde tydperk nie",
          "Betwiste heffings moet binne 7 dae aangemeld word",
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
        icon: Mail,
        title: "7. Faktureringsondersteuning",
        content: [
          "Vir faktureringsnavrae, betwiste heffings of terugbetalingsversoeke, kontak ons by:",
        ],
        contact: "learn@kth-tech.com",
        footer: "Sluit asseblief jou rekeningse e-posadres en die datum van die heffing in jou boodskap in. Ons beoog om binne 2 werksdae te reageer.",
      },
    ],
  };

  const currentSections = sections[isAf ? "af" : "en"];

  return (
    <div className="relative min-h-screen bg-background text-white overflow-hidden">
      <GraffitiSplats variant="full" opacity={0.4} />
      <header
        className="sticky top-0 z-50 bg-background/95"
        style={{ borderBottom: "2px solid rgba(0,229,255,0.4)", boxShadow: "0 0 20px rgba(0,229,255,0.15)" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black text-xs font-bold"
                style={{ color: "#00E5FF", border: "1.5px solid #00E5FF", boxShadow: "0 0 12px rgba(0,229,255,0.4)" }}
                data-testid="refund-nav-back"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {isAf ? "Terug" : "Back"}
              </button>
            </Link>
            <span className="graffiti-hand text-base hidden sm:inline tracking-tight" style={{ color: "#FFE600", textShadow: "0 0 8px rgba(255,230,0,0.4)" }}>
              {isAf ? "Terugbetalingsbeleid" : "Refund Policy"}
            </span>
          </div>
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-[11px] font-black"
            style={{ color: "#8A2BFF", border: "1px solid rgba(138,43,255,0.55)", boxShadow: "0 0 10px rgba(138,43,255,0.35)" }}
            data-testid="button-language-toggle"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{language === "en" ? "EN" : "AF"}</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10 space-y-6">

        <div className="relative text-center space-y-4 py-6">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] px-4 py-1.5 rounded-full bg-black"
            style={{ color: "#00E5FF", border: "1px solid rgba(0,229,255,0.55)", boxShadow: "0 0 14px rgba(0,229,255,0.35)" }}
          >
            <Undo2 className="w-3.5 h-3.5" style={{ filter: "drop-shadow(0 0 4px #00E5FF)" }} />
            {isAf ? "Terugbetalings en Kansellasies" : "Refunds & Cancellations"}
          </span>
          <h1
            className="graffiti-hand text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.05]"
            data-testid="text-refund-title"
            style={{
              background: "linear-gradient(90deg, #00E5FF, #8A2BFF, #FF2BD6, #FFE600)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 22px rgba(0,229,255,0.28))",
            }}
          >
            {isAf ? "Terugbetalingsbeleid" : "Refund Policy"}
          </h1>
          <p className="text-sm sm:text-base text-white max-w-2xl mx-auto">
            {isAf
              ? "Ons is deursigtig oor hoe fakturering, kansellasies en terugbetalings werk."
              : "We're transparent about how billing, cancellations, and refunds work."}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#FFE600" }}>
            {isAf ? "Laas opgedateer: 29 Junie 2026" : "Last updated: 29 June 2026"}
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
                data-testid={`refund-section-${index}`}
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
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: hex }} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(section as any).contact && (
                    <div
                      className="mt-3 p-3 rounded-xl"
                      style={{ background: hexToRgba(hex, 0.08), border: `1px solid ${hexToRgba(hex, 0.3)}` }}
                    >
                      <a
                        href={`mailto:${(section as any).contact}`}
                        className="font-bold text-sm"
                        style={{ color: hex }}
                      >
                        {(section as any).contact}
                      </a>
                    </div>
                  )}
                  {(section as any).footer && (
                    <p className="text-sm mt-2 text-white">
                      {(section as any).footer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <Link href="/terms-of-service">
            <button className="text-xs text-white hover:text-[#00E5FF] transition-colors underline underline-offset-2">
              {isAf ? "Volledige Diensbepalings bekyk" : "View full Terms of Service"}
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
