import React, { useState } from "react";
import { Check, CheckCircle2, CreditCard, Building2, Landmark, Globe, ChevronRight, AlertCircle, ArrowDown, Sparkles, Info } from "lucide-react";

export function Affordance() {
  const [lang, setLang] = useState<"EN" | "AF">("EN");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [ackChecked, setAckChecked] = useState(false);

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

  const paymentMethods = [
    { id: "paystack", name: "Paystack", desc: "Card, EFT, USSD", icon: CreditCard },
    { id: "ozow", name: "Ozow", desc: "Instant EFT (bank transfer)", icon: Landmark },
    { id: "yoco", name: "Yoco", desc: "Card payments", icon: Building2 },
  ];

  const emailValid = email.includes("@") && email.includes(".");
  const step = emailValid ? (paymentMethod ? (ackChecked ? 4 : 3) : 2) : 1;

  return (
    <div className="min-h-screen bg-[#050010] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050010]/90 backdrop-blur-xl border-b border-cyan-900/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">BrainTrack</span>
        </div>
        <button 
          onClick={() => setLang(lang === "EN" ? "AF" : "EN")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label="Toggle language"
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          {lang}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 pb-32 space-y-12">
        {/* Section 1: Plan Summary */}
        <section className="space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Activate your Trial</h1>
            <p className="text-slate-400 text-lg">Complete the steps below to start learning.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wide">
              Most Popular
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">BrainTrack™ Boost</h2>
                <div className="inline-flex items-center gap-1.5 mt-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  14-day free trial
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-4xl font-black text-white">R169</div>
                <div className="text-slate-400 font-medium">/ month</div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">What you get</h3>
              <ul className="grid sm:grid-cols-2 gap-y-3 gap-x-4">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Email */}
        <section className={`transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${emailValid ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              {emailValid ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <h2 className="text-xl font-bold text-white">Your email address</h2>
          </div>
          
          <div className="pl-12">
            <label htmlFor="email" className="sr-only">Email address for billing receipt</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-2xl h-16 px-6 text-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
            />
            <p className="text-slate-500 text-sm mt-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              For your billing receipt and account access
            </p>
          </div>
        </section>

        {/* Section 3: Payment Method */}
        <section className={`transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${paymentMethod ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              {paymentMethod ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <h2 className="text-xl font-bold text-white">Select payment method</h2>
          </div>
          
          <div className="pl-12 space-y-3">
            {paymentMethods.map((pm) => {
              const isSelected = paymentMethod === pm.id;
              const Icon = pm.icon;
              return (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all group focus:outline-none focus:ring-4 focus:ring-cyan-500/20 text-left
                    ${isSelected 
                      ? 'bg-cyan-500/10 border-cyan-500' 
                      : 'bg-slate-900/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mr-4 transition-colors ${isSelected ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {pm.name}
                    </div>
                    <div className={`text-sm ${isSelected ? 'text-cyan-200' : 'text-slate-400'}`}>
                      {pm.desc}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-cyan-500 bg-cyan-500 text-slate-900' : 'border-slate-600 bg-transparent'}`}>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 4: Acknowledgment */}
        <section className={`transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${ackChecked ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              {ackChecked ? <Check className="w-5 h-5" /> : '3'}
            </div>
            <h2 className="text-xl font-bold text-white">Cancellation policy</h2>
          </div>
          
          <div className="pl-12">
            <button
              onClick={() => setAckChecked(!ackChecked)}
              className={`w-full flex items-start sm:items-center p-5 rounded-2xl border-2 transition-all group focus:outline-none focus:ring-4 focus:ring-cyan-500/20 text-left
                ${ackChecked 
                  ? 'bg-emerald-500/10 border-emerald-500' 
                  : 'bg-slate-900/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 mr-4 mt-0.5 sm:mt-0 transition-colors ${ackChecked ? 'border-emerald-500 bg-emerald-500 text-slate-900' : 'border-slate-500 bg-slate-800 group-hover:border-slate-400'}`}>
                {ackChecked && <Check className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <span className={`text-lg font-medium leading-tight ${ackChecked ? 'text-emerald-100' : 'text-slate-300'}`}>
                  I understand that a 30-day cancellation notice is required.
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-8">
          <div className="pl-0 sm:pl-12 flex flex-col items-center sm:items-stretch">
            
            {/* Contextual hint for disabled state */}
            {(!emailValid || !paymentMethod || !ackChecked) && (
              <div className="mb-4 bg-slate-800/80 text-amber-200 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 w-full animate-in fade-in slide-in-from-bottom-4">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-400 mb-1">To enable the start button:</p>
                  <ul className="text-sm space-y-1">
                    {!emailValid && <li>• Enter a valid email address</li>}
                    {emailValid && !paymentMethod && <li>• Select a payment method</li>}
                    {emailValid && paymentMethod && !ackChecked && <li>• Accept the cancellation policy</li>}
                  </ul>
                </div>
              </div>
            )}

            <button
              disabled={!emailValid || !paymentMethod || !ackChecked}
              className="relative w-full h-16 sm:h-20 rounded-2xl font-black text-xl tracking-wide transition-all overflow-hidden group focus:outline-none focus:ring-4 focus:ring-cyan-500 disabled:cursor-not-allowed
                disabled:bg-slate-800 disabled:text-slate-500 disabled:opacity-50
                hover:not-disabled:scale-[1.02] active:not-disabled:scale-[0.98]"
              style={{
                backgroundColor: (emailValid && paymentMethod && ackChecked) ? "#06b6d4" : undefined,
                color: (emailValid && paymentMethod && ackChecked) ? "#020617" : undefined,
                boxShadow: (emailValid && paymentMethod && ackChecked) ? "0 0 40px rgba(6, 182, 212, 0.4)" : undefined
              }}
            >
              {(emailValid && paymentMethod && ackChecked) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start 14-day free trial
                {(emailValid && paymentMethod && ackChecked) && <ChevronRight className="w-6 h-6" />}
              </span>
            </button>

            <p className="text-center text-slate-500 text-sm mt-6 max-w-lg mx-auto">
              30-day cancellation notice required. To cancel, email <a href="mailto:enterprise@kth-tech.com" className="text-cyan-400 hover:underline">enterprise@kth-tech.com</a> at least 30 days before your next billing date.
            </p>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
