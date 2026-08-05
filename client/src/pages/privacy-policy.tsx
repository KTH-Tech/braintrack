// BrainTrack privacy policy — logged-out legal page with branded pure-black
// street-graffiti chrome mounting the shared PublicNav + PublicFooter.
// All legal copy is preserved verbatim; only presentation changed.
import type { ReactNode, CSSProperties } from "react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

// ── Shared branded chrome for the four logged-out legal pages ───────────────
// Pure-black street-graffiti: Permanent Marker title, hard-offset accent cards,
// pure #fff body copy (no grey / no faded white), no glow/blur shadows.
const H1_STYLE: CSSProperties = {
  fontFamily: "'Permanent Marker',cursive",
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
                color: active ? "#000" : l.accent,
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

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  useSEO({
    title: "Privacy Policy & POPIA Compliance | BrainTrack",
    description: "BrainTrack privacy policy covering POPIA compliance, data protection, learner data security, and your rights as a South African user. Operated by KTH Projects (Pty) Ltd t/a KTH-Tech.",
    canonical: "https://braintrack.tech/privacy-policy",
  });

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#fff" }} data-testid="page-privacy-policy">
      <PublicNav />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "80px 20px 0" }}>
        <style>{LEGAL_BODY_CSS}</style>

        <h1 data-testid="text-privacy-title" style={H1_STYLE}>
          {isAf ? "Privaatheidsbeleid & POPIA-Nakoming" : "Privacy Policy & POPIA Compliance"}
        </h1>
        <div style={CHIP_STYLE}>
          KTH Tech (Pty) Ltd · {isAf ? "Laas opgedateer: 16 Julie 2026" : "Last updated: 16 July 2026"}
        </div>
        <LegalCrossNav isAf={isAf} activeHref="/privacy-policy" />

        <div className="bt-legal-body" style={{ marginBottom: 28 }}>
          <p>
            {isAf
              ? "BrainTrack is daartoe verbind om jou privaatheid te beskerm in ooreenstemming met die Wet op die Beskerming van Persoonlike Inligting (POPIA) van Suid-Afrika."
              : "BrainTrack is committed to protecting your privacy in accordance with the Protection of Personal Information Act (POPIA) of South Africa."}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Section accent="#9FD8FF" title={isAf ? "1. Inleiding" : "1. Introduction"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "In hierdie Privaatheidsbeleid verwys \"BrainTrack\", \"ons\" of \"ons s'n\" na KTH Projects (Edms) Bpk (registrasienommer 2025/627290/07), 'n Suid-Afrikaanse private maatskappy wat handel dryf as KTH-Tech. BrainTrack is ons matriek-eksamenvoorbereidingsproduk; kaartheffings verskyn op jou bankstaat as KTH-TECH. Hierdie Privaatheidsbeleid verduidelik hoe ons jou persoonlike inligting versamel, gebruik, openbaar en beskerm wanneer jy ons diens gebruik."
              : "In this Privacy Policy, \"BrainTrack\", \"we\", \"us\", or \"our\" refers to KTH Projects (Pty) Ltd (registration number 2025/627290/07), a South African private company trading as KTH-Tech. BrainTrack is our matric exam-preparation product; card charges appear on your bank statement as KTH-TECH. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our service."}
          </p>
          <p>
            {isAf
              ? "Ons voldoen aan die Wet op die Beskerming van Persoonlike Inligting 4 van 2013 (POPIA) en is daartoe verbind om te verseker dat jou privaatheid beskerm word. Hierdie beleid is van toepassing op alle gebruikers van ons platform, insluitend leerders (kinders onder 18) en hul ouers of voogde."
              : "We comply with the Protection of Personal Information Act 4 of 2013 (POPIA) and are committed to ensuring that your privacy is protected. This policy applies to all users of our platform, including learners (children under 18) and their parents or guardians."}
          </p>
        </div>
      </Section>

      <Section accent="#9FF5E8" title={isAf ? "2. Inligting Wat Ons Versamel" : "2. Information We Collect"}>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-1">{isAf ? "Persoonlike Inligting van Ouers/Voogde:" : "Personal Information from Parents/Guardians:"}</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>{isAf ? "Volle naam en van" : "Full name and surname"}</li>
              <li>{isAf ? "E-posadres" : "Email address"}</li>
              <li>{isAf ? "Telefoonnommer" : "Phone number"}</li>
            </ul>
            <div className="mt-3 pl-3 py-1" style={{ borderLeft: "3px solid #94F7C5" }}>
              <p className="font-medium">
                {isAf ? "Betalingsekuriteit: Ons stoor GEEN betaling- of bankinligting nie." : "Payment Security: We do NOT store any payment or banking information."}
              </p>
              <p className="mt-1">
                {isAf
                  ? "Alle betalings word veilig deur Paystack verwerk, 'n PCI-DSS-nakoming betalingsverskaffer. Jou kaart- of bankbesonderhede word direk op Paystack se veilige platform ingevoer en word nooit na BrainTrack oorgedra of deur BrainTrack gestoor nie."
                  : "All payments are processed securely through Paystack, a PCI-DSS compliant payment provider. Your card or banking details are entered directly on Paystack's secure platform and are never transmitted to or stored by BrainTrack."}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">{isAf ? "Persoonlike Inligting van Leerders:" : "Personal Information from Learners:"}</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>{isAf ? "Naam (slegs voornaam)" : "Name (first name only)"}</li>
              <li>{isAf ? "Telefoonnommer (vir aflewering van aktiveringsskakel)" : "Phone number (for activation link delivery)"}</li>
              <li>{isAf ? "Studieprofiel-antwoorde (leervoorkeure)" : "Study profile responses (learning preferences)"}</li>
              <li>{isAf ? "Vakkeuses en huidige punte" : "Subject selections and current marks"}</li>
              <li>{isAf ? "Gebruiksdata en vorderingopsporing" : "Usage data and progress tracking"}</li>
              <li>{isAf ? "Stemnote-opnames (wanneer die stemnota-funksie gebruik word — gestoor in veilige wolk-berging)" : "Voice note recordings (when the voice note feature is used — stored in secure cloud storage)"}</li>
              <li>{isAf ? "Stelkennisgewing-intekenbesonderhede (indien push-kennisgewings geaktiveer word)" : "Push notification subscription details (if push notifications are enabled)"}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">{isAf ? "Outomaties Versamelde Inligting:" : "Automatically Collected Information:"}</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>{isAf ? "Toestelinligting en blaaiertipe" : "Device information and browser type"}</li>
              <li>{isAf ? "IP-adres en benaderde ligging" : "IP address and approximate location"}</li>
              <li>{isAf ? "Platformgebruikpatrone en sessieduur" : "Platform usage patterns and session duration"}</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section accent="#94F7C5" title={isAf ? "3. Hoe Ons Jou Inligting Gebruik" : "3. How We Use Your Information"}>
        <div className="space-y-3">
          <p>{isAf ? "Ons gebruik persoonlike inligting vir die volgende doeleindes:" : "We use personal information for the following purposes:"}</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>{isAf ? "Dienslewering:" : "Service Delivery:"}</strong> {isAf ? "Om toegang te bied tot vorige vraestelle, Rizz-bystand en eksamenvoorbereidingshulpmiddels." : "To provide access to past papers, Rizz assistance, and exam preparation tools."}</li>
            <li><strong>{isAf ? "Personalisering:" : "Personalization:"}</strong> {isAf ? "Om gepersonaliseerde studie-aanbevelings te skep gebaseer op leerstyl en huidige punte." : "To create personalized study recommendations based on learning style and current marks."}</li>
            <li><strong>{isAf ? "Vorderingopsporing:" : "Progress Tracking:"}</strong> {isAf ? "Om leerdervordering te monitor en areas wat verbetering benodig te identifiseer." : "To monitor learner progress and identify areas needing improvement."}</li>
            <li><strong>{isAf ? "Kommunikasie:" : "Communication:"}</strong> {isAf ? "Om aktiveringskskakel, belangrike opdaterings en (met toestemming) vorderingsverslae aan ouers te stuur." : "To send activation links, important updates, and (with consent) progress reports to parents."}</li>
            <li><strong>{isAf ? "Betalingsverwerking:" : "Payment Processing:"}</strong> {isAf ? "Om intekeningbetalings veilig deur ons betalingsverskaffer te verwerk." : "To process subscription payments securely through our payment provider."}</li>
            <li><strong>{isAf ? "Platformverbetering:" : "Platform Improvement:"}</strong> {isAf ? "Om gebruikpatrone te ontleed en ons opvoedkundige inhoud en funksies te verbeter." : "To analyze usage patterns and improve our educational content and features."}</li>
            <li><strong>{isAf ? "Wetlike Nakoming:" : "Legal Compliance:"}</strong> {isAf ? "Om aan toepaslike wette en regulasies te voldoen." : "To comply with applicable laws and regulations."}</li>
          </ul>
        </div>
      </Section>

      <Section accent="#FFE29A" title={isAf ? "4. Kinders se Privaatheid (Onder 18)" : "4. Children's Privacy (Under 18)"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "BrainTrack is ontwerp vir Graad 12-leerders in Suid-Afrika. Ons neem spesiale sorg om die privaatheid van kinders te beskerm:"
              : "BrainTrack is designed for Grade 12 learners in South Africa. We take special care to protect the privacy of children:"}
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>{isAf ? "Ouerlike Toestemming:" : "Parental Consent:"}</strong> {isAf ? "'n Ouer of voog moet die intekening namens die leerder koop en daartoe instem." : "A parent or guardian must purchase and consent to the subscription on behalf of the learner."}</li>
            <li><strong>{isAf ? "Minimale Dataversameling:" : "Minimal Data Collection:"}</strong> {isAf ? "Ons versamel slegs inligting wat nodig is vir die opvoedkundige diens." : "We only collect information necessary for the educational service."}</li>
            <li><strong>{isAf ? "Geen Bemarking aan Kinders:" : "No Marketing to Children:"}</strong> {isAf ? "Ons stuur nie bemarkingskommunikasie direk aan leerders nie." : "We do not send marketing communications directly to learners."}</li>
            <li><strong>{isAf ? "Ouerlike Toegang:" : "Parental Access:"}</strong> {isAf ? "Ouers kan te eniger tyd versoek om toegang tot, regstelling van of skrapping van hul kind se inligting." : "Parents can request access to, correction of, or deletion of their child's information at any time."}</li>
            <li><strong>{isAf ? "Veilige Omgewing:" : "Safe Environment:"}</strong> {isAf ? "Ons platform bevat slegs opvoedkundige inhoud van amptelike Departement van Basiese Onderwys bronne." : "Our platform contains only educational content from official Department of Basic Education sources."}</li>
          </ul>
        </div>
      </Section>

      <Section accent="#FFB7E5" title={isAf ? "5. Databeskerming" : "5. Data Security"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Ons implementeer toepaslike tegniese en organisatoriese maatreëls om jou persoonlike inligting te beskerm:"
              : "We implement appropriate technical and organizational measures to protect your personal information:"}
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>{isAf ? "Alle data word met TLS/SSL-enkripsie oorgedra" : "All data is transmitted using TLS/SSL encryption"}</li>
            <li>{isAf ? "Wagwoorde word gehash en gesout met industrie-standaard algoritmes" : "Passwords are hashed and salted using industry-standard algorithms"}</li>
            <li>{isAf ? "Betalingsinligting word deur PCI-DSS-nakoming verskaffers (Paystack) verwerk" : "Payment information is processed by PCI-DSS compliant providers (Paystack)"}</li>
            <li>{isAf ? "Gereelde sekuriteitsbeoordelings en -opdaterings word uitgevoer" : "Regular security assessments and updates are performed"}</li>
            <li>{isAf ? "Toegang tot persoonlike inligting is beperk tot gemagtigde personeel alleen" : "Access to personal information is restricted to authorized personnel only"}</li>
            <li>{isAf ? "Data word gestoor op veilige wolkbedieners in die EU (Frankfurt) en VSA via Supabase en Render — beide volledig GDPR-nakoming en aanvaarbare derdeland vir POPIA-oordragte" : "Data is stored on secure cloud servers in the EU (Frankfurt) and USA via Supabase and Render — both fully GDPR-compliant and acceptable third countries for POPIA transfers"}</li>
          </ul>
        </div>
      </Section>

      <Section accent="#C5B3FF" title={isAf ? "6. Dataretensie" : "6. Data Retention"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Ons behou persoonlike inligting so lank as wat nodig is om ons dienste te lewer:"
              : "We retain personal information for as long as necessary to provide our services:"}
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>{isAf ? "Aktiewe Rekeninge:" : "Active Accounts:"}</strong> {isAf ? "Data word behou terwyl jou intekening aktief is." : "Data is retained while your subscription is active."}</li>
            <li><strong>{isAf ? "Vervalde Intekenings:" : "Expired Subscriptions:"}</strong> {isAf ? "Rekeningdata word vir 12 maande na die einde van die intekening behou, wat maklike heraktivering moontlik maak." : "Account data is retained for 12 months after subscription ends, allowing for easy reactivation."}</li>
            <li><strong>{isAf ? "Skrappingsversoeke:" : "Deletion Requests:"}</strong> {isAf ? "Op versoek sal ons persoonlike inligting binne 30 dae uitvee, behalwe waar dit deur die wet vereis word." : "Upon request, we will delete personal information within 30 days, except where required by law."}</li>
            <li><strong>{isAf ? "Geanonimiseerde Data:" : "Anonymized Data:"}</strong> {isAf ? "Ons mag geanonimiseerde, saamgestelde data vir navorsings- en verbeteringsdoeleindes behou." : "We may retain anonymized, aggregated data for research and improvement purposes."}</li>
          </ul>
        </div>
      </Section>

      <Section accent="#9FD8FF" title={isAf ? "7. Jou POPIA-Regte" : "7. Your POPIA Rights"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Onder POPIA het jy die volgende regte rakende jou persoonlike inligting:"
              : "Under POPIA, you have the following rights regarding your personal information:"}
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>{isAf ? "Reg op Toegang:" : "Right to Access:"}</strong> {isAf ? "Versoek bevestiging of ons jou inligting hou en verkry 'n afskrif." : "Request confirmation of whether we hold your information and obtain a copy."}</li>
            <li><strong>{isAf ? "Reg op Regstelling:" : "Right to Correction:"}</strong> {isAf ? "Versoek regstelling van onakkurate of onvolledige inligting." : "Request correction of inaccurate or incomplete information."}</li>
            <li><strong>{isAf ? "Reg op Skrapping:" : "Right to Deletion:"}</strong> {isAf ? "Versoek skrapping van jou persoonlike inligting in sekere omstandighede." : "Request deletion of your personal information in certain circumstances."}</li>
            <li><strong>{isAf ? "Reg om Beswaar te Maak:" : "Right to Object:"}</strong> {isAf ? "Maak beswaar teen verwerking van jou inligting vir direkte bemarking." : "Object to processing of your information for direct marketing."}</li>
            <li><strong>{isAf ? "Reg om Toestemming te Onttrek:" : "Right to Withdraw Consent:"}</strong> {isAf ? "Onttrek toestemming wat voorheen vir verwerking gegee is." : "Withdraw consent previously given for processing."}</li>
          </ul>
          <p className="mt-4">
            {isAf
              ? "Om hierdie regte uit te oefen, kontak ons Inligtingsbeampte by: "
              : "To exercise these rights, contact our Information Officer at: "}
            <strong>learn@kth-tech.com</strong>
          </p>
        </div>
      </Section>

      <Section accent="#94F7C5" title={isAf ? "8. Betalingsverwerking & Bankinligting" : "8. Payment Processing & Banking Information"}>
        <div className="space-y-3">
          <div className="pl-3 py-1" style={{ borderLeft: "3px solid #94F7C5" }}>
            <p className="font-semibold">
              {isAf
                ? "BrainTrack versamel, stoor of verwerk GEEN betaalkaart- of bankinligting nie."
                : "BrainTrack does NOT collect, store, or process any payment card or banking information."}
            </p>
          </div>
          <p>
            {isAf
              ? "Alle betalingsverwerking word veilig hanteer deur "
              : "All payment processing is handled securely by "}
            <strong>Paystack</strong>
            {isAf
              ? ", 'n geregistreerde Suid-Afrikaanse betalingsdiensverskaffer wat ten volle PCI-DSS-nakoming is."
              : ", a registered South African Payment Service Provider that is fully PCI-DSS compliant."}
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>{isAf ? "Betaling geskied via 'n herhalende kaartmagtiging wat veilig by Paystack gestoor word" : "Payment is made via a recurring card authorisation securely held by Paystack"}</li>
            <li>{isAf ? "Jou kaart- of bankbesonderhede word direk op Paystack se platform ingevoer, nooit op BrainTrack nie" : "Your card or banking details are entered directly on Paystack's platform, never on BrainTrack"}</li>
            <li>{isAf ? "Ons ontvang slegs 'n bevestiging van suksesvolle betaling — geen kaartnommers, CVV-kodes of rekeningnommers nie" : "We only receive a confirmation of successful payment — no card numbers, CVV codes, or account numbers"}</li>
            <li>{isAf ? "Paystack handhaaf bankvlak-sekuriteit en PCI-DSS-enkripsie vir alle transaksies" : "Paystack maintains bank-level security and PCI-DSS encryption for all transactions"}</li>
            <li>{isAf ? "Vir terugbetalings of betalingsgeskille, kontak ons by learn@kth-tech.com" : "For refunds or payment disputes, contact us at learn@kth-tech.com"}</li>
          </ul>
        </div>
      </Section>

      <Section accent="#9FD8FF" title={isAf ? "9. Derdeparty-deling" : "9. Third-Party Sharing"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Ons mag jou inligting met vertroude derde partye deel slegs soos nodig:"
              : "We may share your information with trusted third parties only as necessary:"}
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>{isAf ? "Betalingsverwerking:" : "Payment Processing:"}</strong> {isAf ? "Paystack (Suid-Afrika) — vir herhalende kaartmagtiging. Geen kaart- of bankdata word met BrainTrack gedeel nie." : "Paystack (South Africa) — for recurring card authorisation. No card or banking data is shared with BrainTrack."}</li>
            <li><strong>{isAf ? "KI-Tutor:" : "AI Tutor:"}</strong> {isAf ? "OpenAI (VSA) — jou KI-Tutor-boodskappe word na OpenAI gestuur vir verwerking. Geen identifiseerbare persoonlike inligting word saam met boodskappe gestuur nie." : "OpenAI (USA) — your AI Tutor messages are sent to OpenAI for processing. No identifiable personal information is sent alongside messages."}</li>
            <li><strong>{isAf ? "Databasis en Berging:" : "Database & Storage:"}</strong> {isAf ? "Supabase (VSA / EU) — jou leerdata, vorderingrekords en stemnote-opnames word op Supabase se veilige infrastruktuur gestoor." : "Supabase (USA / EU) — your learning data, progress records, and voice note recordings are stored on Supabase's secure infrastructure."}</li>
            <li><strong>{isAf ? "Bediener-hosting:" : "Server Hosting:"}</strong> {isAf ? "Render (Frankfurt, EU) — die BrainTrack-toepassing loop op Render se wolkbedieners in die EU." : "Render (Frankfurt, EU) — the BrainTrack application runs on Render's cloud servers in the EU."}</li>
            <li><strong>{isAf ? "E-poskommunikasie:" : "Email Communication:"}</strong> {isAf ? "Resend — vir die stuur van stelselkennisgewings en ouervorderingsverslae." : "Resend — for sending system notifications and parent progress reports."}</li>
            <li><strong>{isAf ? "SMS / WhatsApp:" : "SMS / WhatsApp:"}</strong> {isAf ? "Twilio — vir die stuur van aktiveringskakels en SMS-kennisgewings." : "Twilio — for sending activation links and SMS notifications."}</li>
          </ul>
          <p className="mt-4">
            {isAf
              ? "Ons verkoop, verhuur of verhandel nie jou persoonlike inligting aan derde partye vir bemarkingsdoeleindes nie."
              : "We do not sell, rent, or trade your personal information to third parties for marketing purposes."}
          </p>
        </div>
      </Section>

      <Section accent="#FFB7E5" title={isAf ? "10. Kontakbesonderhede" : "10. Contact Information"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Vir enige privaatheidsverwante vrae of om jou regte uit te oefen:"
              : "For any privacy-related questions or to exercise your rights:"}
          </p>
          <div className="pl-3 py-1 space-y-2" style={{ borderLeft: "3px solid #FFB7E5" }}>
            <p><strong>{isAf ? "Verantwoordelike Party:" : "Responsible Party:"}</strong> {isAf ? "KTH Projects (Edms) Bpk h/a KTH-Tech" : "KTH Projects (Pty) Ltd t/a KTH-Tech"}</p>
            <p><strong>{isAf ? "Registrasienommer:" : "Registration number:"}</strong> 2025/627290/07</p>
            <p><strong>{isAf ? "Inligtingsbeampte:" : "Information Officer:"}</strong> BrainTrack (KTH-Tech)</p>
            <p><strong>{isAf ? "E-pos:" : "Email:"}</strong> learn@kth-tech.com</p>
            <p><strong>{isAf ? "Adres:" : "Address:"}</strong> {isAf ? "Suid-Afrika" : "South Africa"}</p>
          </div>
        </div>
      </Section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
