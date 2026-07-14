import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, Users, Clock, Globe, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { FooterPageNav, FooterPageHomeButton } from "@/components/footer-page-nav";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

export default function PrivacyPolicyPage() {
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  useSEO({
    title: "Privacy Policy & POPIA Compliance | BrainTrack",
    description: "BrainTrack privacy policy covering POPIA compliance, data protection, learner data security, and your rights as a South African user. Powered by KTH Tech.",
    canonical: "https://braintrack.app/privacy-policy",
  });

  return (
    <div className="dark min-h-screen bg-black text-white">
      <header
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg"
        style={{ borderBottom: "1px solid rgba(142,124,220,0.35)" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black text-xs font-semibold"
                style={{ color: "#28c9d6", border: "1.5px solid #28c9d6", boxShadow: "0 0 10px rgba(40,201,214,0.3)" }}
                data-testid="privacy-nav-back"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {isAf ? "Terug" : "Back"}
              </button>
            </Link>
            <span className="font-black text-sm hidden sm:inline tracking-tight" style={{ color: "#ffd83a", textShadow: "0 0 8px rgba(255,216,58,0.4)" }}>{isAf ? "Privaatheidsbeleid" : "Privacy Policy"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
        <div className="relative text-center space-y-3 py-6">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black mx-auto"
            style={{ border: "1.5px solid #28c9d6", boxShadow: "0 0 20px rgba(40,201,214,0.4), inset 0 0 14px rgba(40,201,214,0.15)" }}
          >
            <Shield className="w-6 h-6" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 6px rgba(40,201,214,0.7))" }} />
          </div>
          <h1 className="text-2xl font-black text-white" style={{ textShadow: "0 0 10px rgba(40,201,214,0.4)" }}>{isAf ? "Privaatheidsbeleid & POPIA-Nakoming" : "Privacy Policy & POPIA Compliance"}</h1>
          <p className="text-sm text-white">
            {isAf
              ? "BrainTrack is daartoe verbind om jou privaatheid te beskerm in ooreenstemming met die Wet op die Beskerming van Persoonlike Inligting (POPIA) van Suid-Afrika."
              : "BrainTrack is committed to protecting your privacy in accordance with the Protection of Personal Information Act (POPIA) of South Africa."}
          </p>
          <p className="text-sm text-white">{isAf ? "Laas opgedateer: 29 Junie 2026" : "Last updated: 29 June 2026"}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-primary" />
              {isAf ? "1. Inleiding" : "1. Introduction"}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-xs dark:prose-invert max-w-none space-y-3 text-sm">
            <p>
              {isAf
                ? "BrainTrack (\"ons\" of \"ons s'n\") bedryf die BrainTrack opvoedkundige platform. Hierdie Privaatheidsbeleid verduidelik hoe ons jou persoonlike inligting versamel, gebruik, openbaar en beskerm wanneer jy ons diens gebruik."
                : "BrainTrack (\"we\", \"us\", or \"our\") operates the BrainTrack educational platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our service."}
            </p>
            <p>
              {isAf
                ? "Ons voldoen aan die Wet op die Beskerming van Persoonlike Inligting 4 van 2013 (POPIA) en is daartoe verbind om te verseker dat jou privaatheid beskerm word. Hierdie beleid is van toepassing op alle gebruikers van ons platform, insluitend leerders (kinders onder 18) en hul ouers of voogde."
                : "We comply with the Protection of Personal Information Act 4 of 2013 (POPIA) and are committed to ensuring that your privacy is protected. This policy applies to all users of our platform, including learners (children under 18) and their parents or guardians."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4 text-primary" />
              {isAf ? "2. Inligting Wat Ons Versamel" : "2. Information We Collect"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-sm mb-1">{isAf ? "Persoonlike Inligting van Ouers/Voogde:" : "Personal Information from Parents/Guardians:"}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-white">
                <li>{isAf ? "Volle naam en van" : "Full name and surname"}</li>
                <li>{isAf ? "E-posadres" : "Email address"}</li>
                <li>{isAf ? "Telefoonnommer" : "Phone number"}</li>
              </ul>
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm font-medium text-white">
                  {isAf ? "Betalingsekuriteit: Ons stoor GEEN betaling- of bankinligting nie." : "Payment Security: We do NOT store any payment or banking information."}
                </p>
                <p className="text-sm text-white mt-1">
                  {isAf
                    ? "Alle betalings word veilig deur Paystack verwerk, 'n PCI-DSS-nakoming betalingsverskaffer. Jou kaart- of bankbesonderhede word direk op Paystack se veilige platform ingevoer en word nooit na BrainTrack oorgedra of deur BrainTrack gestoor nie."
                    : "All payments are processed securely through Paystack, a PCI-DSS compliant payment provider. Your card or banking details are entered directly on Paystack's secure platform and are never transmitted to or stored by BrainTrack."}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{isAf ? "Persoonlike Inligting van Leerders:" : "Personal Information from Learners:"}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-white">
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
              <h4 className="font-semibold text-sm mb-1">{isAf ? "Outomaties Versamelde Inligting:" : "Automatically Collected Information:"}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-white">
                <li>{isAf ? "Toestelinligting en blaaiertipe" : "Device information and browser type"}</li>
                <li>{isAf ? "IP-adres en benaderde ligging" : "IP address and approximate location"}</li>
                <li>{isAf ? "Platformgebruikpatrone en sessieduur" : "Platform usage patterns and session duration"}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-primary" />
              {isAf ? "3. Hoe Ons Jou Inligting Gebruik" : "3. How We Use Your Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-sm text-white">{isAf ? "Ons gebruik persoonlike inligting vir die volgende doeleindes:" : "We use personal information for the following purposes:"}</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-white">
              <li><strong>{isAf ? "Dienslewering:" : "Service Delivery:"}</strong> {isAf ? "Om toegang te bied tot vorige vraestelle, Rizz-bystand en eksamenvoorbereidingshulpmiddels." : "To provide access to past papers, Rizz assistance, and exam preparation tools."}</li>
              <li><strong>{isAf ? "Personalisering:" : "Personalization:"}</strong> {isAf ? "Om gepersonaliseerde studie-aanbevelings te skep gebaseer op leerstyl en huidige punte." : "To create personalized study recommendations based on learning style and current marks."}</li>
              <li><strong>{isAf ? "Vorderingopsporing:" : "Progress Tracking:"}</strong> {isAf ? "Om leerdervordering te monitor en areas wat verbetering benodig te identifiseer." : "To monitor learner progress and identify areas needing improvement."}</li>
              <li><strong>{isAf ? "Kommunikasie:" : "Communication:"}</strong> {isAf ? "Om aktiveringskskakel, belangrike opdaterings en (met toestemming) vorderingsverslae aan ouers te stuur." : "To send activation links, important updates, and (with consent) progress reports to parents."}</li>
              <li><strong>{isAf ? "Betalingsverwerking:" : "Payment Processing:"}</strong> {isAf ? "Om intekeningbetalings veilig deur ons betalingsverskaffer te verwerk." : "To process subscription payments securely through our payment provider."}</li>
              <li><strong>{isAf ? "Platformverbetering:" : "Platform Improvement:"}</strong> {isAf ? "Om gebruikpatrone te ontleed en ons opvoedkundige inhoud en funksies te verbeter." : "To analyze usage patterns and improve our educational content and features."}</li>
              <li><strong>{isAf ? "Wetlike Nakoming:" : "Legal Compliance:"}</strong> {isAf ? "Om aan toepaslike wette en regulasies te voldoen." : "To comply with applicable laws and regulations."}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              {isAf ? "4. Kinders se Privaatheid (Onder 18)" : "4. Children's Privacy (Under 18)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-sm text-white">
              {isAf
                ? "BrainTrack is ontwerp vir Graad 12-leerders in Suid-Afrika. Ons neem spesiale sorg om die privaatheid van kinders te beskerm:"
                : "BrainTrack is designed for Grade 12 learners in South Africa. We take special care to protect the privacy of children:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-white">
              <li><strong>{isAf ? "Ouerlike Toestemming:" : "Parental Consent:"}</strong> {isAf ? "'n Ouer of voog moet die intekening namens die leerder koop en daartoe instem." : "A parent or guardian must purchase and consent to the subscription on behalf of the learner."}</li>
              <li><strong>{isAf ? "Minimale Dataversameling:" : "Minimal Data Collection:"}</strong> {isAf ? "Ons versamel slegs inligting wat nodig is vir die opvoedkundige diens." : "We only collect information necessary for the educational service."}</li>
              <li><strong>{isAf ? "Geen Bemarking aan Kinders:" : "No Marketing to Children:"}</strong> {isAf ? "Ons stuur nie bemarkingskommunikasie direk aan leerders nie." : "We do not send marketing communications directly to learners."}</li>
              <li><strong>{isAf ? "Ouerlike Toegang:" : "Parental Access:"}</strong> {isAf ? "Ouers kan te eniger tyd versoek om toegang tot, regstelling van of skrapping van hul kind se inligting." : "Parents can request access to, correction of, or deletion of their child's information at any time."}</li>
              <li><strong>{isAf ? "Veilige Omgewing:" : "Safe Environment:"}</strong> {isAf ? "Ons platform bevat slegs opvoedkundige inhoud van amptelike Departement van Basiese Onderwys bronne." : "Our platform contains only educational content from official Department of Basic Education sources."}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              {isAf ? "5. Databeskerming" : "5. Data Security"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-sm text-white">
              {isAf
                ? "Ons implementeer toepaslike tegniese en organisatoriese maatreëls om jou persoonlike inligting te beskerm:"
                : "We implement appropriate technical and organizational measures to protect your personal information:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-white">
              <li>{isAf ? "Alle data word met TLS/SSL-enkripsie oorgedra" : "All data is transmitted using TLS/SSL encryption"}</li>
              <li>{isAf ? "Wagwoorde word gehash en gesout met industrie-standaard algoritmes" : "Passwords are hashed and salted using industry-standard algorithms"}</li>
              <li>{isAf ? "Betalingsinligting word deur PCI-DSS-nakoming verskaffers (Netcash) verwerk" : "Payment information is processed by PCI-DSS compliant providers (Netcash)"}</li>
              <li>{isAf ? "Gereelde sekuriteitsbeoordelings en -opdaterings word uitgevoer" : "Regular security assessments and updates are performed"}</li>
              <li>{isAf ? "Toegang tot persoonlike inligting is beperk tot gemagtigde personeel alleen" : "Access to personal information is restricted to authorized personnel only"}</li>
              <li>{isAf ? "Data word gestoor op veilige wolkbedieners in die EU (Frankfurt) en VSA via Supabase en Render — beide volledig GDPR-nakoming en aanvaarbare derdeland vir POPIA-oordragte" : "Data is stored on secure cloud servers in the EU (Frankfurt) and USA via Supabase and Render — both fully GDPR-compliant and acceptable third countries for POPIA transfers"}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              {isAf ? "6. Dataretensie" : "6. Data Retention"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-sm text-white">
              {isAf
                ? "Ons behou persoonlike inligting so lank as wat nodig is om ons dienste te lewer:"
                : "We retain personal information for as long as necessary to provide our services:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-white">
              <li><strong>{isAf ? "Aktiewe Rekeninge:" : "Active Accounts:"}</strong> {isAf ? "Data word behou terwyl jou intekening aktief is." : "Data is retained while your subscription is active."}</li>
              <li><strong>{isAf ? "Vervalde Intekenings:" : "Expired Subscriptions:"}</strong> {isAf ? "Rekeningdata word vir 12 maande na die einde van die intekening behou, wat maklike heraktivering moontlik maak." : "Account data is retained for 12 months after subscription ends, allowing for easy reactivation."}</li>
              <li><strong>{isAf ? "Skrappingsversoeke:" : "Deletion Requests:"}</strong> {isAf ? "Op versoek sal ons persoonlike inligting binne 30 dae uitvee, behalwe waar dit deur die wet vereis word." : "Upon request, we will delete personal information within 30 days, except where required by law."}</li>
              <li><strong>{isAf ? "Geanonimiseerde Data:" : "Anonymized Data:"}</strong> {isAf ? "Ons mag geanonimiseerde, saamgestelde data vir navorsings- en verbeteringsdoeleindes behou." : "We may retain anonymized, aggregated data for research and improvement purposes."}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-primary" />
              {isAf ? "7. Jou POPIA-Regte" : "7. Your POPIA Rights"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-sm text-white">
              {isAf
                ? "Onder POPIA het jy die volgende regte rakende jou persoonlike inligting:"
                : "Under POPIA, you have the following rights regarding your personal information:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-white">
              <li><strong>{isAf ? "Reg op Toegang:" : "Right to Access:"}</strong> {isAf ? "Versoek bevestiging of ons jou inligting hou en verkry 'n afskrif." : "Request confirmation of whether we hold your information and obtain a copy."}</li>
              <li><strong>{isAf ? "Reg op Regstelling:" : "Right to Correction:"}</strong> {isAf ? "Versoek regstelling van onakkurate of onvolledige inligting." : "Request correction of inaccurate or incomplete information."}</li>
              <li><strong>{isAf ? "Reg op Skrapping:" : "Right to Deletion:"}</strong> {isAf ? "Versoek skrapping van jou persoonlike inligting in sekere omstandighede." : "Request deletion of your personal information in certain circumstances."}</li>
              <li><strong>{isAf ? "Reg om Beswaar te Maak:" : "Right to Object:"}</strong> {isAf ? "Maak beswaar teen verwerking van jou inligting vir direkte bemarking." : "Object to processing of your information for direct marketing."}</li>
              <li><strong>{isAf ? "Reg om Toestemming te Onttrek:" : "Right to Withdraw Consent:"}</strong> {isAf ? "Onttrek toestemming wat voorheen vir verwerking gegee is." : "Withdraw consent previously given for processing."}</li>
            </ul>
            <p className="text-sm text-white mt-4">
              {isAf
                ? "Om hierdie regte uit te oefen, kontak ons Inligtingsbeampte by: "
                : "To exercise these rights, contact our Information Officer at: "}
              <strong>learn@kth-tech.com</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4 text-green-500" />
              {isAf ? "8. Betalingsverwerking & Bankinligting" : "8. Payment Processing & Banking Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="font-semibold text-white">
                {isAf
                  ? "BrainTrack versamel, stoor of verwerk GEEN betaalkaart- of bankinligting nie."
                  : "BrainTrack does NOT collect, store, or process any payment card or banking information."}
              </p>
            </div>
            <p className="text-sm text-white">
              {isAf
                ? "Alle betalingsverwerking word veilig hanteer deur "
                : "All payment processing is handled securely by "}
              <strong>Netcash</strong>
              {isAf
                ? ", 'n geregistreerde Suid-Afrikaanse betalingsdiensverskaffer wat ten volle PCI-DSS-nakoming is."
                : ", a registered South African Payment Service Provider that is fully PCI-DSS compliant."}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-white">
              <li>{isAf ? "Betaling geskied via DebiCheck-mandaat of 'n herhalende kaarttoken wat veilig by Netcash gestoor word" : "Payment is made via DebiCheck mandate or a recurring card token securely held by Netcash"}</li>
              <li>{isAf ? "Jou kaart- of bankbesonderhede word direk op Netcash se platform ingevoer, nooit op BrainTrack nie" : "Your card or banking details are entered directly on Netcash's platform, never on BrainTrack"}</li>
              <li>{isAf ? "Ons ontvang slegs 'n bevestiging van suksesvolle betaling — geen kaartnommers, CVV-kodes of rekeningnommers nie" : "We only receive a confirmation of successful payment — no card numbers, CVV codes, or account numbers"}</li>
              <li>{isAf ? "Netcash handhaaf bankvlak-sekuriteit en PCI-DSS-enkripsie vir alle transaksies" : "Netcash maintains bank-level security and PCI-DSS encryption for all transactions"}</li>
              <li>{isAf ? "Vir terugbetalings of betalingsgeskille, kontak ons by learn@kth-tech.com" : "For refunds or payment disputes, contact us at learn@kth-tech.com"}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              {isAf ? "9. Derdeparty-deling" : "9. Third-Party Sharing"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-sm text-white">
              {isAf
                ? "Ons mag jou inligting met vertroude derde partye deel slegs soos nodig:"
                : "We may share your information with trusted third parties only as necessary:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-white">
              <li><strong>{isAf ? "Betalingsverwerking:" : "Payment Processing:"}</strong> {isAf ? "Netcash (Suid-Afrika) — vir DebiCheck-mandaat of herhalende kaarttoken. Geen kaart- of bankdata word met BrainTrack gedeel nie." : "Netcash (South Africa) — for DebiCheck mandate or recurring card token. No card or banking data is shared with BrainTrack."}</li>
              <li><strong>{isAf ? "KI-Tutor:" : "AI Tutor:"}</strong> {isAf ? "OpenAI (VSA) — jou KI-Tutor-boodskappe word na OpenAI gestuur vir verwerking. Geen identifiseerbare persoonlike inligting word saam met boodskappe gestuur nie." : "OpenAI (USA) — your AI Tutor messages are sent to OpenAI for processing. No identifiable personal information is sent alongside messages."}</li>
              <li><strong>{isAf ? "Databasis en Berging:" : "Database & Storage:"}</strong> {isAf ? "Supabase (VSA / EU) — jou leerdata, vorderingrekords en stemnote-opnames word op Supabase se veilige infrastruktuur gestoor." : "Supabase (USA / EU) — your learning data, progress records, and voice note recordings are stored on Supabase's secure infrastructure."}</li>
              <li><strong>{isAf ? "Bediener-hosting:" : "Server Hosting:"}</strong> {isAf ? "Render (Frankfurt, EU) — die BrainTrack-toepassing loop op Render se wolkbedieners in die EU." : "Render (Frankfurt, EU) — the BrainTrack application runs on Render's cloud servers in the EU."}</li>
              <li><strong>{isAf ? "E-poskommunikasie:" : "Email Communication:"}</strong> {isAf ? "Resend — vir die stuur van stelselkennisgewings en ouervorderingsverslae." : "Resend — for sending system notifications and parent progress reports."}</li>
              <li><strong>{isAf ? "SMS / WhatsApp:" : "SMS / WhatsApp:"}</strong> {isAf ? "Twilio — vir die stuur van aktiveringskakels en SMS-kennisgewings." : "Twilio — for sending activation links and SMS notifications."}</li>
            </ul>
            <p className="text-sm text-white mt-4">
              {isAf
                ? "Ons verkoop, verhuur of verhandel nie jou persoonlike inligting aan derde partye vir bemarkingsdoeleindes nie."
                : "We do not sell, rent, or trade your personal information to third parties for marketing purposes."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{isAf ? "10. Kontakbesonderhede" : "10. Contact Information"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-sm text-white">
              {isAf
                ? "Vir enige privaatheidsverwante vrae of om jou regte uit te oefen:"
                : "For any privacy-related questions or to exercise your rights:"}
            </p>
            <div className="bg-white/5 p-4 rounded-lg space-y-2">
              <p><strong>{isAf ? "Inligtingsbeampte:" : "Information Officer:"}</strong> KTH Tech</p>
              <p><strong>{isAf ? "E-pos:" : "Email:"}</strong> learn@kth-tech.com</p>
              <p><strong>{isAf ? "Adres:" : "Address:"}</strong> {isAf ? "Suid-Afrika" : "South Africa"}</p>
            </div>
          </CardContent>
        </Card>

        <FooterPageHomeButton />
      </main>
    </div>
  );
}
