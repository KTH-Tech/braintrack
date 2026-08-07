// BrainTrack cookie policy — logged-out legal page with branded pure-black
// street-graffiti chrome mounting the shared PublicNav + PublicFooter.
// All legal copy is preserved verbatim; only presentation changed.
import type { ReactNode, CSSProperties } from "react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

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

export default function CookiePolicyPage() {
  const { language } = useLanguage();
  const isAf = language === "af";

  useSEO({
    title: "Cookie Policy | BrainTrack",
    description: "BrainTrack cookie policy — how we use essential, analytics and marketing cookies in compliance with POPIA. Manage your cookie preferences by category.",
    canonical: "https://braintrack.tech/cookie-policy",
  });

  return (
    <div className="min-h-screen" style={{ background: "#050508", color: "#fff" }} data-testid="page-cookie-policy">
      <PublicNav />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "80px 20px 0" }}>
        <style>{LEGAL_BODY_CSS}</style>

        <h1 data-testid="text-cookie-title" style={H1_STYLE}>
          {isAf ? "Koekiebeleid" : "Cookie Policy"}
        </h1>
        <div style={CHIP_STYLE}>
          KTH Tech (Pty) Ltd · {isAf ? "Laas opgedateer: 16 Julie 2026" : "Last updated: 16 July 2026"}
        </div>
        <LegalCrossNav isAf={isAf} activeHref="/cookie-policy" />

        <div className="bt-legal-body space-y-3" style={{ marginBottom: 28 }}>
          <p>
            {isAf
              ? "BrainTrack gebruik noodsaaklike koekies en opsionele koekies per kategorie — Analise en Bemarking. Jy kan elke kategorie afsonderlik bestuur via ons koekievoorkeure-paneel."
              : "BrainTrack uses essential cookies and optional cookies by category — Analytics and Marketing. You can manage each category separately via our cookie preferences panel."}
          </p>
          <p>
            {isAf ? (
              <>
                In hierdie Koekiebeleid verwys <strong>&ldquo;BrainTrack&rdquo;</strong>, <strong>&ldquo;ons&rdquo;</strong> of <strong>&ldquo;ons s&rsquo;n&rdquo;</strong> na <strong>KTH Projects (Edms) Bpk</strong> (registrasienommer 2025/627290/07), &rsquo;n Suid-Afrikaanse private maatskappy wat handel dryf as <strong>KTH-Tech</strong>. BrainTrack is ons matriek-eksamenvoorbereidingsproduk. Kaartheffings verskyn op jou bankstaat as <strong>KTH-TECH</strong>.
              </>
            ) : (
              <>
                In this Cookie Policy, <strong>&ldquo;BrainTrack&rdquo;</strong>, <strong>&ldquo;we&rdquo;</strong>, <strong>&ldquo;us&rdquo;</strong>, or <strong>&ldquo;our&rdquo;</strong> refers to <strong>KTH Projects (Pty) Ltd</strong> (registration number 2025/627290/07), a South African private company trading as <strong>KTH-Tech</strong>. BrainTrack is our matric exam-preparation product. Card charges appear on your bank statement as <strong>KTH-TECH</strong>.
              </>
            )}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Section accent="#9FF5E8" title={isAf ? "1. Wat is Koekies?" : "1. What Are Cookies?"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Koekies is klein tekslêers wat op jou toestel gestoor word wanneer jy 'n webwerf besoek. Hulle help die webwerf om jou voorkeure te onthou en sekere funksies te laat werk."
              : "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and enable certain features to work."}
          </p>
          <p>
            {isAf
              ? "BrainTrack gebruik ook plaaslike stoor (localStorage) — 'n soortgelyke tegnologie wat data in jou blaaier stoor sonder 'n vervaldatum."
              : "BrainTrack also uses local storage (localStorage) — a similar technology that stores data in your browser without an expiry date."}
          </p>
        </div>
      </Section>

      <Section accent="#9FD8FF" title={isAf ? "2. Koekiekategorieë" : "2. Cookie Categories"}>
        <div className="space-y-5">
          <p>
            {isAf
              ? "Ons groepeer koekies en plaaslike stoor in drie kategorieë. Noodsaaklike items is altyd aan; Analise en Bemarking vereis jou toestemming."
              : "We group cookies and local storage into three categories. Essential items are always on; Analytics and Marketing require your consent."}
          </p>

          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1b1922" }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(159,245,232,.1)" }}>
                <span className="text-xs font-bold" style={{ color: "#9FF5E8" }}>
                  {isAf ? "Noodsaaklik (altyd aan)" : "Essential (always on)"}
                </span>
                <span className="text-xs" style={{ color: "#fff" }}>
                  {isAf ? "— Kan nie gedeaktiveer word nie" : "— Cannot be disabled"}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#0e0d12" }}>
                      <th className="text-left p-3 font-semibold">{isAf ? "Naam" : "Name"}</th>
                      <th className="text-left p-3 font-semibold">{isAf ? "Tipe" : "Type"}</th>
                      <th className="text-left p-3 font-semibold">{isAf ? "Doel" : "Purpose"}</th>
                      <th className="text-left p-3 font-semibold">{isAf ? "Duur" : "Duration"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <td className="p-3 font-mono" style={{ color: "#9FF5E8" }}>connect.sid</td>
                      <td className="p-3">{isAf ? "Koekie" : "Cookie"}</td>
                      <td className="p-3">
                        {isAf
                          ? "Sessie-verifikasie — hou jou aangemeld"
                          : "Session authentication — keeps you logged in"}
                      </td>
                      <td className="p-3">{isAf ? "Sessie" : "Session"}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono" style={{ color: "#9FF5E8" }}>btk_cookie_consent</td>
                      <td className="p-3">localStorage</td>
                      <td className="p-3">
                        {isAf
                          ? "Stoor jou koekievoorkeure per kategorie"
                          : "Stores your cookie preferences per category"}
                      </td>
                      <td className="p-3">{isAf ? "Permanent" : "Persistent"}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono" style={{ color: "#9FF5E8" }}>btk_theme</td>
                      <td className="p-3">localStorage</td>
                      <td className="p-3">
                        {isAf
                          ? "Stoor jou voorkeur-kleurskema (lig/donker)"
                          : "Stores your preferred colour theme (light/dark)"}
                      </td>
                      <td className="p-3">{isAf ? "Permanent" : "Persistent"}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono" style={{ color: "#9FF5E8" }}>btk_lang</td>
                      <td className="p-3">localStorage</td>
                      <td className="p-3">
                        {isAf
                          ? "Stoor jou taalvoorkeur (Engels/Afrikaans)"
                          : "Stores your language preference (English/Afrikaans)"}
                      </td>
                      <td className="p-3">{isAf ? "Permanent" : "Persistent"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1b1922" }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(159,216,255,.1)" }}>
                <span className="text-xs font-bold" style={{ color: "#9FD8FF" }}>
                  {isAf ? "Analise (opsioneel)" : "Analytics (optional)"}
                </span>
                <span className="text-xs" style={{ color: "#fff" }}>
                  {isAf ? "— Vereis jou toestemming" : "— Requires your consent"}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#0e0d12" }}>
                      <th className="text-left p-3 font-semibold">{isAf ? "Naam" : "Name"}</th>
                      <th className="text-left p-3 font-semibold">{isAf ? "Tipe" : "Type"}</th>
                      <th className="text-left p-3 font-semibold">{isAf ? "Doel" : "Purpose"}</th>
                      <th className="text-left p-3 font-semibold">{isAf ? "Duur" : "Duration"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <td className="p-3 font-mono" style={{ color: "#9FD8FF" }}>btk_src / btk_ref</td>
                      <td className="p-3">localStorage</td>
                      <td className="p-3">
                        {isAf
                          ? "Opsporing van verwysingskanaal vir platformanalise"
                          : "Referral channel tracking for platform analytics"}
                      </td>
                      <td className="p-3">{isAf ? "Permanent" : "Persistent"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1b1922" }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(255,226,154,.1)" }}>
                <span className="text-xs font-bold" style={{ color: "#FFE29A" }}>
                  {isAf ? "Bemarking (opsioneel)" : "Marketing (optional)"}
                </span>
                <span className="text-xs" style={{ color: "#fff" }}>
                  {isAf ? "— Vereis jou toestemming" : "— Requires your consent"}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs" style={{ color: "#fff" }}>
                  {isAf
                    ? "Geen bemarkingskoekies word tans gebruik nie. Hierdie kategorie is beskikbaar vir toekomstige gepersonaliseerde kommunikasie indien jy instem."
                    : "No marketing cookies are currently in use. This category is available for future personalised communications if you consent."}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl" style={{ background: "rgba(148,247,197,.08)", border: "1.5px solid #94F7C5" }}>
            <strong style={{ color: "#94F7C5" }}>
              {isAf ? "Geen derdeparty-koekies nie." : "No third-party cookies."}
            </strong>{" "}
            {isAf
              ? "BrainTrack gebruik geen Google Analytics, Facebook Pixel, advertensie-netwerke of enige ander derdeparty-opsporingsinstrumente nie."
              : "BrainTrack does not use Google Analytics, Facebook Pixel, advertising networks, or any other third-party tracking tools."}
          </div>
        </div>
      </Section>

      <Section accent="#FFB7E5" title={isAf ? "3. Bestuur Jou Koekievoorkeure" : "3. Manage Your Cookie Preferences"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Wanneer jy BrainTrack vir die eerste keer besoek, sal 'n koekiebanner verskyn met drie opsies:"
              : "When you first visit BrainTrack, a cookie banner appears with three options:"}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong>{isAf ? "Aanvaar alles" : "Accept all"}</strong>
              {isAf
                ? " — laat alle koekiekategorieë toe."
                : " — allows all cookie categories."}
            </li>
            <li>
              <strong>{isAf ? "Weier" : "Decline"}</strong>
              {isAf
                ? " — laat slegs noodsaaklike koekies toe."
                : " — allows essential cookies only."}
            </li>
            <li>
              <strong>{isAf ? "Voorkeure" : "Manage preferences"}</strong>
              {isAf
                ? " — maak 'n paneel oop met afsonderlike wissels vir Analise en Bemarking."
                : " — opens a panel with individual toggles for Analytics and Marketing."}
            </li>
          </ul>
          <p>
            {isAf
              ? "Jou keuses word in plaaslike stoor gestoor as 'n JSON-objek per kategorie. Noodsaaklike koekies is altyd aan en kan nie gedeaktiveer word nie."
              : "Your choices are stored in local storage as a JSON object per category. Essential cookies are always on and cannot be disabled."}
          </p>
          <p>
            {isAf
              ? "Om jou voorkeure te verander, verwyder die sleutel "
              : "To change your preferences, clear the key "}
            <code className="font-mono px-1 py-0.5 rounded" style={{ background: "#0e0d12", color: "#9FF5E8" }}>btk_cookie_consent</code>
            {isAf
              ? " uit jou blaaier se plaaslike stoor — die banner sal dan weer verskyn."
              : " from your browser's local storage — the banner will then reappear."}
          </p>
        </div>
      </Section>

      <Section accent="#C5B3FF" title={isAf ? "4. Jou Regte Onder POPIA" : "4. Your Rights Under POPIA"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Ingevolge die Wet op die Beskerming van Persoonlike Inligting (POPIA) van Suid-Afrika het jy die reg om:"
              : "Under South Africa's Protection of Personal Information Act (POPIA), you have the right to:"}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              {isAf
                ? "Te weet watter inligting ons van jou versamel"
                : "Know what information we collect about you"}
            </li>
            <li>
              {isAf
                ? "Toegang tot jou persoonlike inligting te versoek"
                : "Request access to your personal information"}
            </li>
            <li>
              {isAf
                ? "Versoek dat jou inligting uitgevee word"
                : "Request that your information be deleted"}
            </li>
            <li>
              {isAf
                ? "Jou koekietoestemming per kategorie te herroep deur jou voorkeure te bestuur of die plaaslike stoor te verwyder"
                : "Withdraw your cookie consent per category by managing your preferences or clearing local storage"}
            </li>
          </ul>
          <p>
            {isAf
              ? "Om jou toestemming te herroep of jou regte uit te oefen, kontak ons by "
              : "To withdraw consent or exercise your rights, contact us at "}
            <strong>learn@kth-tech.com</strong>
            {isAf
              ? ", of verwyder plaaslike stoor in jou blaaier se privaatheidsinstellings."
              : ", or clear local storage in your browser's privacy settings."}
          </p>
        </div>
      </Section>

      <Section accent="#FFE29A" title={isAf ? "5. Hoe Om Koekies te Beheer" : "5. How to Control Cookies"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Jy kan jou blaaier se instellings gebruik om koekies te beheer of te verwyder. Let wel: as jy die sessiekoekie blokkeer, sal jy nie op BrainTrack kan aanmeld nie."
              : "You can use your browser settings to control or delete cookies. Note: if you block the session cookie, you will not be able to log in to BrainTrack."}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong>Chrome:</strong>{" "}
              {isAf ? "Instellings → Privaatheid en sekuriteit → Koekies" : "Settings → Privacy and security → Cookies"}
            </li>
            <li>
              <strong>Firefox:</strong>{" "}
              {isAf ? "Instellings → Privaatheid en sekuriteit → Koekies en webwerfinligting" : "Settings → Privacy & Security → Cookies and Site Data"}
            </li>
            <li>
              <strong>Safari:</strong>{" "}
              {isAf ? "Instellings → Privaatheid → Koekies beheer" : "Settings → Privacy → Manage Cookies"}
            </li>
          </ul>
          <p>
            {isAf
              ? "Om spesifiek plaaslike stoor te verwyder, gebruik jou blaaier se Ontwikkelaarsinstrumente (F12) → Toepassing → Plaaslike stoor."
              : "To clear local storage specifically, use your browser's Developer Tools (F12) → Application → Local Storage."}
          </p>
        </div>
      </Section>

      <Section accent="#94F7C5" title={isAf ? "6. Kontak" : "6. Contact"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Vir enige vrae oor ons gebruik van koekies of hierdie beleid:"
              : "For any questions about our use of cookies or this policy:"}
          </p>
          <div className="p-4 rounded-xl space-y-2" style={{ background: "#0e0d12", border: "1px solid #1b1922" }}>
            <p><strong>{isAf ? "Verantwoordelike Party:" : "Responsible Party:"}</strong> {isAf ? "KTH Projects (Edms) Bpk h/a KTH-Tech" : "KTH Projects (Pty) Ltd t/a KTH-Tech"}</p>
            <p><strong>{isAf ? "Registrasienommer:" : "Registration number:"}</strong> 2025/627290/07</p>
            <p><strong>{isAf ? "Inligtingsbeampte:" : "Information Officer:"}</strong> BrainTrack (KTH-Tech)</p>
            <p><strong>{isAf ? "E-pos:" : "Email:"}</strong> learn@kth-tech.com</p>
            <p>
              <strong>{isAf ? "Privaatheidsbeleid:" : "Privacy Policy:"}</strong>{" "}
              <Link href="/privacy-policy">
                <span style={{ color: "#9FD8FF", cursor: "pointer", fontWeight: 600 }}>
                  {isAf ? "Sien ons volledige Privaatheidsbeleid" : "See our full Privacy Policy"}
                </span>
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <div style={{ textAlign: "center", padding: "10px 0 0" }}>
        <Link href="/">
          <span
            data-testid="button-back-home-bottom"
            style={{ fontSize: 13, fontWeight: 600, color: "#9FD8FF", cursor: "pointer" }}
          >
            {isAf ? "Terug na Tuisblad →" : "Back to Home →"}
          </span>
        </Link>
      </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
