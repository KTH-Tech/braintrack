import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Shield, Database, Clock, ArrowLeft, Globe, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

export default function CookiePolicyPage() {
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  useSEO({
    title: "Cookie Policy | BrainTrack",
    description: "BrainTrack cookie policy — how we use essential, analytics and marketing cookies in compliance with POPIA. Manage your cookie preferences by category.",
    canonical: "https://braintrack.co.za/cookie-policy",
  });

  return (
    <div className="dark min-h-screen bg-black text-white">
      <header
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg"
        style={{ borderBottom: "1px solid rgba(138,43,255,0.35)" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black text-xs font-bold"
                style={{ color: "#00E5FF", border: "1.5px solid #00E5FF", boxShadow: "0 0 12px rgba(0,229,255,0.4)" }}
                data-testid="cookie-nav-back"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {isAf ? "Terug" : "Back"}
              </button>
            </Link>
            <span className="font-black text-sm hidden sm:inline tracking-tight" style={{ color: "#FFE600", textShadow: "0 0 8px rgba(255,230,0,0.4)" }}>
              {isAf ? "Koekiebeleid" : "Cookie Policy"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.35), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 right-0 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,43,214,0.3), transparent 70%)" }}
        />
        <div className="relative text-center space-y-3 py-6">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black mx-auto"
            style={{ border: "1.5px solid #00E5FF", boxShadow: "0 0 20px rgba(0,229,255,0.4), inset 0 0 14px rgba(0,229,255,0.15)" }}
          >
            <Cookie className="w-6 h-6" style={{ color: "#00E5FF", filter: "drop-shadow(0 0 6px rgba(0,229,255,0.7))" }} />
          </div>
          <h1 className="text-2xl font-black text-white" style={{ textShadow: "0 0 10px rgba(0,229,255,0.4)" }}>
            {isAf ? "Koekiebeleid" : "Cookie Policy"}
          </h1>
          <p className="text-sm text-white max-w-xl mx-auto">
            {isAf
              ? "BrainTrack gebruik noodsaaklike koekies en opsionele koekies per kategorie — Analise en Bemarking. Jy kan elke kategorie afsonderlik bestuur via ons koekievoorkeure-paneel."
              : "BrainTrack uses essential cookies and optional cookies by category — Analytics and Marketing. You can manage each category separately via our cookie preferences panel."}
          </p>
          <p className="text-sm text-white">
            {isAf ? "Laas opgedateer: 15 Mei 2026" : "Last updated: 15 May 2026"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Cookie className="w-4 h-4 text-primary" />
              {isAf ? "1. Wat is Koekies?" : "1. What Are Cookies?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-primary" />
              {isAf ? "2. Koekiekategorieë" : "2. Cookie Categories"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <p className="text-white">
              {isAf
                ? "Ons groepeer koekies en plaaslike stoor in drie kategorieë. Noodsaaklike items is altyd aan; Analise en Bemarking vereis jou toestemming."
                : "We group cookies and local storage into three categories. Essential items are always on; Analytics and Marketing require your consent."}
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border border-cyan-500/25 overflow-hidden">
                <div className="bg-primary/10 px-4 py-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">
                    {isAf ? "Noodsaaklik (altyd aan)" : "Essential (always on)"}
                  </span>
                  <span className="text-xs text-white">
                    {isAf ? "— Kan nie gedeaktiveer word nie" : "— Cannot be disabled"}
                  </span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="text-left p-3 font-semibold text-white">{isAf ? "Naam" : "Name"}</th>
                      <th className="text-left p-3 font-semibold text-white">{isAf ? "Tipe" : "Type"}</th>
                      <th className="text-left p-3 font-semibold text-white">{isAf ? "Doel" : "Purpose"}</th>
                      <th className="text-left p-3 font-semibold text-white">{isAf ? "Duur" : "Duration"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-mono text-primary">connect.sid</td>
                      <td className="p-3 text-white">{isAf ? "Koekie" : "Cookie"}</td>
                      <td className="p-3 text-white">
                        {isAf
                          ? "Sessie-verifikasie — hou jou aangemeld"
                          : "Session authentication — keeps you logged in"}
                      </td>
                      <td className="p-3 text-white">{isAf ? "Sessie" : "Session"}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary">btk_cookie_consent</td>
                      <td className="p-3 text-white">localStorage</td>
                      <td className="p-3 text-white">
                        {isAf
                          ? "Stoor jou koekievoorkeure per kategorie"
                          : "Stores your cookie preferences per category"}
                      </td>
                      <td className="p-3 text-white">{isAf ? "Permanent" : "Persistent"}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary">btk_theme</td>
                      <td className="p-3 text-white">localStorage</td>
                      <td className="p-3 text-white">
                        {isAf
                          ? "Stoor jou voorkeur-kleurskema (lig/donker)"
                          : "Stores your preferred colour theme (light/dark)"}
                      </td>
                      <td className="p-3 text-white">{isAf ? "Permanent" : "Persistent"}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary">btk_lang</td>
                      <td className="p-3 text-white">localStorage</td>
                      <td className="p-3 text-white">
                        {isAf
                          ? "Stoor jou taalvoorkeur (Engels/Afrikaans)"
                          : "Stores your language preference (English/Afrikaans)"}
                      </td>
                      <td className="p-3 text-white">{isAf ? "Permanent" : "Persistent"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-cyan-500/25 overflow-hidden">
                <div className="bg-blue-500/10 px-4 py-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {isAf ? "Analise (opsioneel)" : "Analytics (optional)"}
                  </span>
                  <span className="text-xs text-white">
                    {isAf ? "— Vereis jou toestemming" : "— Requires your consent"}
                  </span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="text-left p-3 font-semibold text-white">{isAf ? "Naam" : "Name"}</th>
                      <th className="text-left p-3 font-semibold text-white">{isAf ? "Tipe" : "Type"}</th>
                      <th className="text-left p-3 font-semibold text-white">{isAf ? "Doel" : "Purpose"}</th>
                      <th className="text-left p-3 font-semibold text-white">{isAf ? "Duur" : "Duration"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-mono text-blue-600 dark:text-blue-400">btk_src / btk_ref</td>
                      <td className="p-3 text-white">localStorage</td>
                      <td className="p-3 text-white">
                        {isAf
                          ? "Opsporing van verwysingskanaal vir platformanalise"
                          : "Referral channel tracking for platform analytics"}
                      </td>
                      <td className="p-3 text-white">{isAf ? "Permanent" : "Persistent"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-cyan-500/25 overflow-hidden">
                <div className="bg-orange-500/10 px-4 py-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                    {isAf ? "Bemarking (opsioneel)" : "Marketing (optional)"}
                  </span>
                  <span className="text-xs text-white">
                    {isAf ? "— Vereis jou toestemming" : "— Requires your consent"}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-white">
                    {isAf
                      ? "Geen bemarkingskoekies word tans gebruik nie. Hierdie kategorie is beskikbaar vir toekomstige gepersonaliseerde kommunikasie indien jy instem."
                      : "No marketing cookies are currently in use. This category is available for future personalised communications if you consent."}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-white">
              <strong className="text-white">
                {isAf ? "Geen derdeparty-koekies nie." : "No third-party cookies."}
              </strong>{" "}
              {isAf
                ? "BrainTrack gebruik geen Google Analytics, Facebook Pixel, advertensie-netwerke of enige ander derdeparty-opsporingsinstrumente nie."
                : "BrainTrack does not use Google Analytics, Facebook Pixel, advertising networks, or any other third-party tracking tools."}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              {isAf ? "3. Bestuur Jou Koekievoorkeure" : "3. Manage Your Cookie Preferences"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white">
            <p>
              {isAf
                ? "Wanneer jy BrainTrack vir die eerste keer besoek, sal 'n koekiebanner verskyn met drie opsies:"
                : "When you first visit BrainTrack, a cookie banner appears with three options:"}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-white">{isAf ? "Aanvaar alles" : "Accept all"}</strong>
                {isAf
                  ? " — laat alle koekiekategorieë toe."
                  : " — allows all cookie categories."}
              </li>
              <li>
                <strong className="text-white">{isAf ? "Weier" : "Decline"}</strong>
                {isAf
                  ? " — laat slegs noodsaaklike koekies toe."
                  : " — allows essential cookies only."}
              </li>
              <li>
                <strong className="text-white">{isAf ? "Voorkeure" : "Manage preferences"}</strong>
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
            <p className="text-xs">
              {isAf
                ? "Om jou voorkeure te verander, verwyder die sleutel "
                : "To change your preferences, clear the key "}
              <code className="font-mono text-white bg-white/5 px-1 py-0.5 rounded">btk_cookie_consent</code>
              {isAf
                ? " uit jou blaaier se plaaslike stoor — die banner sal dan weer verskyn."
                : " from your browser's local storage — the banner will then reappear."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              {isAf ? "4. Jou Regte Onder POPIA" : "4. Your Rights Under POPIA"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white">
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
            <p className="text-xs">
              {isAf
                ? "Om jou toestemming te herroep of jou regte uit te oefen, kontak ons by "
                : "To withdraw consent or exercise your rights, contact us at "}
              <strong className="text-white">learn@kth-tech.com</strong>
              {isAf
                ? ", of verwyder plaaslike stoor in jou blaaier se privaatheidsinstellings."
                : ", or clear local storage in your browser's privacy settings."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              {isAf ? "5. Hoe Om Koekies te Beheer" : "5. How to Control Cookies"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white">
            <p>
              {isAf
                ? "Jy kan jou blaaier se instellings gebruik om koekies te beheer of te verwyder. Let wel: as jy die sessiekoekie blokkeer, sal jy nie op BrainTrack kan aanmeld nie."
                : "You can use your browser settings to control or delete cookies. Note: if you block the session cookie, you will not be able to log in to BrainTrack."}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-white">Chrome:</strong>{" "}
                {isAf ? "Instellings → Privaatheid en sekuriteit → Koekies" : "Settings → Privacy and security → Cookies"}
              </li>
              <li>
                <strong className="text-white">Firefox:</strong>{" "}
                {isAf ? "Instellings → Privaatheid en sekuriteit → Koekies en webwerfinligting" : "Settings → Privacy & Security → Cookies and Site Data"}
              </li>
              <li>
                <strong className="text-white">Safari:</strong>{" "}
                {isAf ? "Instellings → Privaatheid → Koekies beheer" : "Settings → Privacy → Manage Cookies"}
              </li>
            </ul>
            <p className="text-xs">
              {isAf
                ? "Om spesifiek plaaslike stoor te verwyder, gebruik jou blaaier se Ontwikkelaarsinstrumente (F12) → Toepassing → Plaaslike stoor."
                : "To clear local storage specifically, use your browser's Developer Tools (F12) → Application → Local Storage."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {isAf ? "6. Kontak" : "6. Contact"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white">
            <p>
              {isAf
                ? "Vir enige vrae oor ons gebruik van koekies of hierdie beleid:"
                : "For any questions about our use of cookies or this policy:"}
            </p>
            <div className="bg-white/5 p-4 rounded-lg space-y-2 text-sm">
              <p><strong>{isAf ? "Inligtingsbeampte:" : "Information Officer:"}</strong> KTH Tech</p>
              <p><strong>{isAf ? "E-pos:" : "Email:"}</strong> learn@kth-tech.com</p>
              <p>
                <strong>{isAf ? "Privaatheidsbeleid:" : "Privacy Policy:"}</strong>{" "}
                <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-white transition-colors">
                  {isAf ? "Sien ons volledige Privaatheidsbeleid" : "See our full Privacy Policy"}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <Link href="/">
            <Button variant="outline" data-testid="button-back-home-bottom">
              {isAf ? "Terug na Tuisblad" : "Back to Home"}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
