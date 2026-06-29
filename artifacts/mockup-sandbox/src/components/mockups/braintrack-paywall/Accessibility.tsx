import React, { useState } from "react";
import { Check, CheckCircle, Circle, Globe, AlertCircle } from "lucide-react";

export function Accessibility() {
  const [language, setLanguage] = useState<"EN" | "AF">("EN");
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "ozow" | "yoco">("paystack");
  const [email, setEmail] = useState("");
  const [ackChecked, setAckChecked] = useState(false);

  const isEn = language === "EN";

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "EN" ? "AF" : "EN"));
  };

  const planInfo = {
    name: "BrainTrack™ Boost",
    price: "R169 / month",
    trial: "14-day free trial",
    badge: "Most Popular",
  };

  const features = [
    "NSC Past Papers + Memos (2015–2025)",
    "Rizz AI Tutor (CAPS-aligned)",
    "50 Tutor Questions / day",
    "10 Full Solutions / day",
    "English & Afrikaans Support",
    "Progress Tracking & Analytics",
    "Crunch Time Adaptive Drills",
    "Study Calendar & Planner",
    "Cancel anytime",
  ];

  const featuresAf = [
    "NSS Vorige Vraestelle + Memo's (2015–2025)",
    "Rizz KI-Tutor (KABV-belyn)",
    "50 Tutor-vrae / dag",
    "10 Volledige Oplossings / dag",
    "Engels & Afrikaans Ondersteuning",
    "Vorderingsopvolging & Analise",
    "Eksamentyd Aanpasbare Drille",
    "Studiekalender & Beplanner",
    "Kanselleer enige tyd",
  ];

  const paymentMethods = [
    { id: "paystack", name: "Paystack", description: "Card, EFT, USSD" },
    { id: "ozow", name: "Ozow", description: "Instant EFT (bank transfer)" },
    { id: "yoco", name: "Yoco", description: "Card payments" },
  ] as const;

  const currentFeatures = isEn ? features : featuresAf;

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] font-sans" style={{ fontSize: "18px", lineHeight: "1.6" }}>
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:p-4 focus:font-bold focus:rounded focus:outline-none focus:ring-4 focus:ring-blue-500">
        Skip to main content
      </a>

      <header className="border-b-2 border-[#333333] bg-[#0A0A0A] p-6 flex justify-between items-center max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">BrainTrack</h1>
        <div className="flex items-center gap-4">
          <span id="lang-label" className="sr-only">Language / Taal</span>
          <button
            onClick={toggleLanguage}
            aria-labelledby="lang-label"
            className="flex items-center gap-2 px-6 py-3 rounded-md border-2 border-[#555555] hover:bg-[#222222] focus:outline-none focus:ring-4 focus:ring-[#00E5FF] focus:border-[#00E5FF] transition-colors"
          >
            <Globe className="w-6 h-6" aria-hidden="true" />
            <span className="font-bold text-xl uppercase">{language}</span>
          </button>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto p-6 md:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left Column: Plan & Features */}
        <section aria-labelledby="plan-heading" className="flex flex-col gap-8">
          <div className="bg-[#111111] border-2 border-[#444444] rounded-xl p-8 shadow-sm">
            <div className="inline-block bg-[#005A66] text-[#00FFFF] font-bold px-4 py-2 rounded mb-6 text-lg border-2 border-[#00FFFF]">
              {planInfo.badge}
            </div>
            
            <h2 id="plan-heading" className="text-4xl font-extrabold mb-4">{planInfo.name}</h2>
            
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl font-black">{planInfo.price.split(' ')[0]}</span>
              <span className="text-2xl font-bold text-[#CCCCCC]">{planInfo.price.substring(planInfo.price.indexOf(' '))}</span>
            </div>
            
            <p className="text-xl font-bold text-[#00FFFF] mb-8">{planInfo.trial}</p>

            <h3 className="text-2xl font-bold mb-6 border-b-2 border-[#333333] pb-2">
              {isEn ? "What's included:" : "Wat ingesluit is:"}
            </h3>
            
            <ul className="space-y-4" aria-label={isEn ? "Features included in BrainTrack Boost" : "Kenmerke ingesluit in BrainTrack Boost"}>
              {currentFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <CheckCircle className="w-8 h-8 text-[#00E5FF] shrink-0 mt-1" aria-hidden="true" />
                  <span className="text-[19px] text-[#EEEEEE] font-medium leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Right Column: Checkout Form */}
        <section aria-labelledby="checkout-heading">
          <h2 id="checkout-heading" className="sr-only">Checkout</h2>
          
          <form className="bg-[#111111] border-2 border-[#444444] rounded-xl p-8 flex flex-col gap-10 shadow-sm" onSubmit={(e) => e.preventDefault()}>
            
            <div className="flex flex-col gap-4">
              <label htmlFor="email-input" className="text-2xl font-bold text-white">
                {isEn ? "Email address" : "E-posadres"}
              </label>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#222222] border-2 border-[#666666] text-white text-xl p-4 rounded-md focus:outline-none focus:ring-4 focus:ring-[#00E5FF] focus:border-[#00E5FF] placeholder-[#888888]"
                placeholder={isEn ? "name@example.com" : "naam@voorbeeld.com"}
                aria-required="true"
              />
            </div>

            <fieldset className="flex flex-col gap-6">
              <legend className="text-2xl font-bold text-white mb-2">
                {isEn ? "Payment method" : "Betalingsmetode"}
              </legend>
              <div className="flex flex-col gap-4" role="radiogroup" aria-required="true">
                {paymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`relative flex items-center justify-between p-6 rounded-lg border-4 cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-[#002233] border-[#00E5FF]" 
                          : "bg-[#222222] border-[#555555] hover:bg-[#333333]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={isSelected}
                          onChange={() => setPaymentMethod(method.id)}
                          className="sr-only"
                        />
                        <div className="w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shrink-0" aria-hidden="true">
                          {isSelected && <div className="w-4 h-4 bg-[#00E5FF] rounded-full" />}
                        </div>
                        <div>
                          <span className="block text-xl font-bold text-white mb-1">{method.name}</span>
                          <span className="block text-[#CCCCCC] text-lg">{method.description}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-2 text-[#00E5FF] font-bold bg-[#004455] px-3 py-1 rounded">
                          <Check className="w-5 h-5" aria-hidden="true" />
                          <span>{isEn ? "Selected" : "Gekies"}</span>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-6 mt-4 pt-8 border-t-2 border-[#333333]">
              <label 
                htmlFor="ack-checkbox" 
                className="flex items-start gap-5 cursor-pointer p-4 -ml-4 rounded-lg hover:bg-[#222222] transition-colors group focus-within:ring-4 focus-within:ring-[#00E5FF]"
              >
                <div className="relative flex items-center justify-center mt-1">
                  <input
                    id="ack-checkbox"
                    type="checkbox"
                    checked={ackChecked}
                    onChange={(e) => setAckChecked(e.target.checked)}
                    className="peer appearance-none w-8 h-8 border-4 border-white rounded bg-transparent checked:bg-[#00E5FF] checked:border-[#00E5FF] focus:outline-none"
                    aria-required="true"
                  />
                  <Check className="absolute w-6 h-6 text-black pointer-events-none opacity-0 peer-checked:opacity-100" aria-hidden="true" />
                </div>
                <span className="text-xl font-medium text-white leading-relaxed">
                  {isEn 
                    ? "I understand that a 30-day cancellation notice is required." 
                    : "Ek verstaan dat 'n 30-dae kansellasiekennisgewing vereis word."}
                </span>
              </label>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={!ackChecked}
                  className={`w-full py-5 px-8 rounded-lg text-2xl font-extrabold text-center transition-all focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-[#111111] focus:ring-[#00E5FF] ${
                    ackChecked 
                      ? "bg-[#00E5FF] text-black hover:bg-[#33EEFF] active:scale-[0.98]" 
                      : "bg-[#444444] text-[#999999] cursor-not-allowed"
                  }`}
                  aria-disabled={!ackChecked}
                >
                  {isEn ? "Start 14-day free trial" : "Begin 14-dae gratis proeftydperk"}
                </button>
                
                {!ackChecked && (
                  <div className="flex items-start gap-3 text-[#FF9999] bg-[#331111] p-4 rounded border-2 border-[#FF5555]" role="alert">
                    <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-[17px] font-medium">
                      {isEn 
                        ? "Please tick the acknowledgement above to continue." 
                        : "Merk asseblief die erkenning hierbo om voort te gaan."}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </form>

          <footer className="mt-8 text-[#BBBBBB] text-[17px] leading-relaxed border-t-2 border-[#333333] pt-6">
            <p>
              {isEn 
                ? "30-day cancellation notice required. To cancel, email enterprise@kth-tech.com at least 30 days before your next billing date." 
                : "30-dae kansellasiekennisgewing vereis. Om te kanselleer, e-pos enterprise@kth-tech.com ten minste 30 dae voor jou volgende faktureringsdatum."}
            </p>
          </footer>
        </section>

      </main>
    </div>
  );
}
