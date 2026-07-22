// BrainTrack cookie policy — chrome restyled to the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (LEGAL PAGES section) via LegalShell.
// All legal copy is preserved verbatim; only presentation changed.
import { Link } from "wouter";
import { LegalShell, LegalSection } from "@/components/legal-shell";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

export default function CookiePolicyPage() {
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  useSEO({
    title: "Cookie Policy | BrainTrack",
    description: "BrainTrack cookie policy — how we use essential, analytics and marketing cookies in compliance with POPIA. Manage your cookie preferences by category.",
    canonical: "https://braintrack.tech/cookie-policy",
  });

  return (
    <LegalShell
      title={isAf ? "Koekiebeleid" : "Cookie Policy"}
      updated={isAf ? "Laas opgedateer: 16 Julie 2026" : "Last updated: 16 July 2026"}
      language={language}
      onToggleLanguage={toggleLanguage}
      activeHref="/cookie-policy"
      backTestId="cookie-nav-back"
      lead={
        <p>
          {isAf
            ? "BrainTrack gebruik noodsaaklike koekies en opsionele koekies per kategorie — Analise en Bemarking. Jy kan elke kategorie afsonderlik bestuur via ons koekievoorkeure-paneel."
            : "BrainTrack uses essential cookies and optional cookies by category — Analytics and Marketing. You can manage each category separately via our cookie preferences panel."}
        </p>
      }
    >
      <LegalSection accent="#9FF5E8" title={isAf ? "1. Wat is Koekies?" : "1. What Are Cookies?"}>
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
      </LegalSection>

      <LegalSection accent="#9FD8FF" title={isAf ? "2. Koekiekategorieë" : "2. Cookie Categories"}>
        <div className="space-y-5">
          <p>
            {isAf
              ? "Ons groepeer koekies en plaaslike stoor in drie kategorieë. Noodsaaklike items is altyd aan; Analise en Bemarking vereis jou toestemming."
              : "We group cookies and local storage into three categories. Essential items are always on; Analytics and Marketing require your consent."}
          </p>

          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,.12)" }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(159,245,232,.1)" }}>
                <span className="text-xs font-bold" style={{ color: "#9FF5E8" }}>
                  {isAf ? "Noodsaaklik (altyd aan)" : "Essential (always on)"}
                </span>
                <span className="text-xs" style={{ color: "#fff", opacity: 0.94 }}>
                  {isAf ? "— Kan nie gedeaktiveer word nie" : "— Cannot be disabled"}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,.05)" }}>
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

            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,.12)" }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(159,216,255,.1)" }}>
                <span className="text-xs font-bold" style={{ color: "#9FD8FF" }}>
                  {isAf ? "Analise (opsioneel)" : "Analytics (optional)"}
                </span>
                <span className="text-xs" style={{ color: "#fff", opacity: 0.94 }}>
                  {isAf ? "— Vereis jou toestemming" : "— Requires your consent"}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,.05)" }}>
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

            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,.12)" }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(255,226,154,.1)" }}>
                <span className="text-xs font-bold" style={{ color: "#FFE29A" }}>
                  {isAf ? "Bemarking (opsioneel)" : "Marketing (optional)"}
                </span>
                <span className="text-xs" style={{ color: "#fff", opacity: 0.94 }}>
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
      </LegalSection>

      <LegalSection accent="#FFB7E5" title={isAf ? "3. Bestuur Jou Koekievoorkeure" : "3. Manage Your Cookie Preferences"}>
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
            <code className="font-mono px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,.06)", color: "#9FF5E8" }}>btk_cookie_consent</code>
            {isAf
              ? " uit jou blaaier se plaaslike stoor — die banner sal dan weer verskyn."
              : " from your browser's local storage — the banner will then reappear."}
          </p>
        </div>
      </LegalSection>

      <LegalSection accent="#C5B3FF" title={isAf ? "4. Jou Regte Onder POPIA" : "4. Your Rights Under POPIA"}>
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
      </LegalSection>

      <LegalSection accent="#FFE29A" title={isAf ? "5. Hoe Om Koekies te Beheer" : "5. How to Control Cookies"}>
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
      </LegalSection>

      <LegalSection accent="#94F7C5" title={isAf ? "6. Kontak" : "6. Contact"}>
        <div className="space-y-3">
          <p>
            {isAf
              ? "Vir enige vrae oor ons gebruik van koekies of hierdie beleid:"
              : "For any questions about our use of cookies or this policy:"}
          </p>
          <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)" }}>
            <p><strong>{isAf ? "Inligtingsbeampte:" : "Information Officer:"}</strong> KTH Tech</p>
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
      </LegalSection>

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
    </LegalShell>
  );
}
