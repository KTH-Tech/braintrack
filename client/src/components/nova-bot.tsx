import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, User, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isSafeInternalPath } from "@/lib/safe-path";
import rizzAvatar from "@assets/rizz-nav-transparent.png";

interface NextAction {
  title: string;
  titleAf: string;
  description: string;
  descriptionAf: string;
  href: string;
  meta?: { vark?: string; daysToExam?: number; masteryBand?: string };
}

type TsCategoryKey =
  | "login_session"
  | "subscription_billing"
  | "content_not_loading"
  | "smart_tutor"
  | "push_notifications"
  | "performance"
  | "other";

interface TroubleshootPrompt {
  kind: "category-list" | "post-steps" | "escalate-done";
  categories?: TsCategoryKey[];
  category?: TsCategoryKey;
}

interface Message {
  role: "rizz" | "user";
  content: string;
  action?: NextAction;
  troubleshoot?: TroubleshootPrompt;
}

interface TsCategory {
  key: TsCategoryKey;
  labelEn: string;
  labelAf: string;
  introEn: string;
  introAf: string;
  stepsEn: string[];
  stepsAf: string[];
  stillStuckEn: string;
  stillStuckAf: string;
  // If true, the category needs an authenticated account to act on.
  // Visitors picking it will be guided to log in first.
  requiresAuth?: boolean;
}

const TROUBLESHOOT_CATEGORIES: TsCategory[] = [
  {
    key: "login_session",
    labelEn: "Login / Session",
    labelAf: "Aanmeld / Sessie",
    introEn: "Trouble signing in or your session keeps dropping? Try these in order:",
    introAf: "Sukkel om aan te meld of jou sessie val gedurig uit? Probeer hierdie in volgorde:",
    stepsEn: [
      "Hard refresh this page: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac).",
      "Sign out fully, close the tab, then open BrainTrack again and sign in.",
      "Make sure third-party cookies are allowed for braintrack.co.za in your browser settings.",
      "Try a different browser (Chrome, Edge, Safari) — your saved progress is on our servers, not the device.",
      "Check your internet connection — open any other site to confirm it's working.",
    ],
    stepsAf: [
      "Herlaai die bladsy: Ctrl+Shift+R (Windows) of Cmd+Shift+R (Mac).",
      "Meld heeltemal af, maak die oortjie toe, en open BrainTrack weer en meld aan.",
      "Maak seker derdeparty-koekies is toegelaat vir braintrack.co.za in jou blaaier-instellings.",
      "Probeer 'n ander blaaier (Chrome, Edge, Safari) — jou vordering is op ons bedieners, nie op die toestel nie.",
      "Kyk jou internetverbinding — open enige ander webwerf om te bevestig dit werk.",
    ],
    stillStuckEn: "If you still can't get in, send us your account email and we'll restore access manually.",
    stillStuckAf: "As jy nog steeds nie kan inkom nie, stuur jou rekening-e-pos en ons herstel toegang handmatig.",
  },
  {
    key: "subscription_billing",
    labelEn: "Subscription & Billing",
    labelAf: "Intekening & Fakturering",
    introEn: "Question about your plan, trial, or a payment? Check these first:",
    introAf: "Vraag oor jou plan, proeftydperk, of 'n betaling? Kyk eers hierna:",
    stepsEn: [
      "Brain Boost is R169/month with a 14-day free trial — no charge during the trial, and you can cancel anytime with no fees.",
      "Open Settings → Subscription to see your current plan and any trial dates.",
      "If you started a trial, your conversion reminders are sent on Days 13 and 14.",
      "For a billing dispute or refund question, our support team is the right place — escalate below.",
    ],
    stepsAf: [
      "Brain Boost kos R169/maand met 'n 14-dae gratis proeftydperk — geen heffing tydens die proef nie, en jy kan enige tyd sonder fooie kanselleer.",
      "Open Instellings → Intekening om jou huidige plan en proefdatums te sien.",
      "As jy 'n proef begin het, kry jy herinneringe op Dag 13 en 14.",
      "Vir 'n faktureringsgeskil of terugbetaling, eskaleer hieronder na ons ondersteuningspan.",
    ],
    stillStuckEn: "Send us your account email and a short description and we'll respond within 24 hours.",
    stillStuckAf: "Stuur jou rekening-e-pos en 'n kort beskrywing en ons reageer binne 24 uur.",
    requiresAuth: true,
  },
  {
    key: "content_not_loading",
    labelEn: "Content Not Loading",
    labelAf: "Inhoud Laai Nie",
    introEn: "Pages, papers, or images not loading? Run through these:",
    introAf: "Bladsye, vraestelle, of beelde laai nie? Werk hierdeur:",
    stepsEn: [
      "Hard refresh this page: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac).",
      "Check your internet connection by opening another website.",
      "Disable browser extensions or ad blockers for braintrack.co.za — they can block our images and PDFs.",
      "Try in an incognito / private window to rule out a cached corruption.",
      "If only one subject or paper is empty, it may not be released yet — try another and let us know which one is missing below.",
    ],
    stepsAf: [
      "Herlaai die bladsy: Ctrl+Shift+R (Windows) of Cmd+Shift+R (Mac).",
      "Kyk jou internetverbinding deur 'n ander webwerf te open.",
      "Skakel blaaier-uitbreidings of advertensie-blokkeerders vir braintrack.co.za af — hulle blokkeer soms ons beelde en PDF's.",
      "Probeer in 'n privaat venster om 'n korrupte kas uit te skakel.",
      "As net een vak of vraestel leeg is, is dit dalk nog nie vrygestel nie — probeer 'n ander en laat weet hieronder watter een ontbreek.",
    ],
    stillStuckEn: "Tell us exactly which page, subject, or paper isn't loading and we'll investigate.",
    stillStuckAf: "Laat ons weet presies watter bladsy, vak, of vraestel nie laai nie en ons ondersoek dit.",
  },
  {
    key: "smart_tutor",
    labelEn: "Smart Tutor",
    labelAf: "Slim Tutor",
    introEn: "Rizz Tutor not responding or feeling slow? Try this:",
    introAf: "Rizz Tutor reageer nie of voel stadig? Probeer dit:",
    stepsEn: [
      "Wait 10 seconds and re-send — peak times can be a little slower.",
      "You may have hit your daily tutor limit. Limits reset at midnight (SAST).",
      "Switch to Hint mode instead of Full Solution — it returns faster.",
      "Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R) and try again.",
      "If you see an error message, copy the exact wording and include it below — it helps us debug fast.",
    ],
    stepsAf: [
      "Wag 10 sekondes en stuur weer — spitsure kan effens stadiger wees.",
      "Jy het dalk jou daaglikse tutor-limiet bereik. Limiete herstel om middernag (SAST).",
      "Skakel oor na Wenk-modus in plaas van Volledige Oplossing — dit kom vinniger terug.",
      "Herlaai die bladsy (Ctrl+Shift+R / Cmd+Shift+R) en probeer weer.",
      "As jy 'n foutboodskap sien, kopieer die presiese woorde en sit dit hieronder by — dit help ons om vinnig te ontfout.",
    ],
    stillStuckEn: "Share the question or topic you were on, the exact error, and we'll look it up in our logs.",
    stillStuckAf: "Deel die vraag of onderwerp waarop jy was, die presiese fout, en ons soek dit in ons logs op.",
  },
  {
    key: "push_notifications",
    labelEn: "Push Notifications",
    labelAf: "Push-kennisgewings",
    introEn: "Not getting BrainTrack notifications on your phone or laptop? Check these:",
    introAf: "Kry jy nie BrainTrack-kennisgewings op jou foon of skootrekenaar nie? Kyk hierna:",
    stepsEn: [
      "Open Settings → Notifications and confirm push is enabled.",
      "In your browser, check the lock icon next to the URL and make sure Notifications is set to Allow for braintrack.co.za.",
      "On your phone, check your system notification settings for your browser app.",
      "Daily focus reminders go out around 06:00 SAST — make sure your device is online at that time.",
      "If you blocked notifications by mistake, you'll need to clear that block in your browser before BrainTrack can ask again.",
    ],
    stepsAf: [
      "Open Instellings → Kennisgewings en bevestig dat push aan is.",
      "In jou blaaier: klik die slot-ikoon langs die URL en maak seker Kennisgewings is op Toelaat vir braintrack.co.za.",
      "Op jou foon: kyk jou stelsel-kennisgewing-instellings vir die blaaier-app.",
      "Daaglikse fokus-herinneringe gaan uit ongeveer 06:00 SAST — maak seker jou toestel is dan aanlyn.",
      "As jy kennisgewings per ongeluk geblokkeer het, moet jy daardie blokkering in jou blaaier opklaar voordat BrainTrack weer kan vra.",
    ],
    stillStuckEn: "Tell us your device and browser and we'll help you get push working.",
    stillStuckAf: "Laat weet jou toestel en blaaier en ons help jou om push te laat werk.",
    requiresAuth: true,
  },
  {
    key: "performance",
    labelEn: "App Performance",
    labelAf: "App-werkverrigting",
    introEn: "BrainTrack feeling slow or laggy? Try these in order:",
    introAf: "Voel BrainTrack stadig of skerflerig? Probeer hierdie in volgorde:",
    stepsEn: [
      "Close other browser tabs — many open tabs share memory with BrainTrack.",
      "Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R) to drop any stale cached scripts.",
      "Check your connection speed — slow Wi-Fi or mobile data makes everything feel laggy.",
      "Restart your browser (close and re-open) and try BrainTrack again.",
      "On older phones, try the same page on a laptop to see if it's a device-specific issue.",
    ],
    stepsAf: [
      "Maak ander blaaier-oortjies toe — baie oop oortjies deel geheue met BrainTrack.",
      "Herlaai die bladsy (Ctrl+Shift+R / Cmd+Shift+R) om ou kas-skripte te los.",
      "Kyk jou verbindingspoed — stadige Wi-Fi of mobiele data maak alles voel skerflerig.",
      "Begin jou blaaier oor (maak toe en weer oop) en probeer BrainTrack weer.",
      "Op ouer fone: probeer dieselfde bladsy op 'n skootrekenaar om te sien of dit 'n toestel-spesifieke probleem is.",
    ],
    stillStuckEn: "Tell us which page is slow and your device + browser and we'll look into it.",
    stillStuckAf: "Laat weet watter bladsy stadig is en jou toestel + blaaier en ons ondersoek dit.",
  },
  {
    key: "other",
    labelEn: "Other",
    labelAf: "Ander",
    introEn: "Something else? Try these general fixes first:",
    introAf: "Iets anders? Probeer eers hierdie algemene oplossings:",
    stepsEn: [
      "Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R).",
      "Sign out, close the tab, sign back in.",
      "Try a different browser or device to rule out a local issue.",
    ],
    stepsAf: [
      "Herlaai die bladsy (Ctrl+Shift+R / Cmd+Shift+R).",
      "Meld af, maak die oortjie toe, en meld weer aan.",
      "Probeer 'n ander blaaier of toestel om 'n plaaslike probleem uit te skakel.",
    ],
    stillStuckEn: "Describe what's happening and what you expected — we'll take it from there.",
    stillStuckAf: "Beskryf wat gebeur en wat jy verwag het — ons vat dit daarvandaan.",
  },
];

const TS_LABELS = {
  troubleshoot: { en: "Troubleshoot", af: "Foutsoek" },
  pickCategory: {
    en: "What kind of problem are you running into? Pick the closest match:",
    af: "Watter soort probleem ondervind jy? Kies die naaste passing:",
  },
  fixedIt: { en: "That fixed it", af: "Dit het gewerk" },
  stillStuck: { en: "Still stuck", af: "Nog vas" },
  glad: {
    en: "Awesome — glad that sorted it out! If anything else comes up, just open the Troubleshoot menu again.",
    af: "Lekker — bly dit is uitgesorteer! As iets anders opduik, open net weer die Foutsoek-menu.",
  },
  visitorLoginRequired: {
    en: "For account-specific help, please sign in first — then the bot can check your subscription status, push setup, and notifications.",
    af: "Vir rekening-spesifieke hulp, meld eers aan — dan kan die bot jou intekenstatus, push-opstelling, en kennisgewings nagaan.",
  },
  signInCta: { en: "Sign in", af: "Meld aan" },
  escalating: { en: "Sending your details to our support team…", af: "Stuur jou besonderhede na ons ondersteuningspan…" },
  escalateFailed: {
    en: "I couldn't reach our support inbox. Please email learn@kth-tech.com directly and we'll respond within 24 hours.",
    af: "Ek kon nie ons ondersteuningsboks bereik nie. Stuur asseblief direk e-pos na learn@kth-tech.com en ons reageer binne 24 uur.",
  },
};

interface KnowledgeEntry {
  keywords: string[];
  en: string;
  af: string;
}

const knowledge: KnowledgeEntry[] = [
  {
    keywords: ["what", "braintrack", "wat is", "tell me", "about", "vertel"],
    en: "BrainTrack helps Grade 12 learners prepare for matric exams using 10 years of real NSC exam data and memos, combined with smart study plans and instant feedback. Think of it as your personal exam coach!",
    af: "BrainTrack help Graad 12-leerders om vir hul matriekeksamens voor te berei met 10 jaar se regte NSC-eksamendata en memo's, gekombineer met slim studieplanne en onmiddellike terugvoer.",
  },
  {
    keywords: ["price", "cost", "much", "prys", "kos", "pay", "betaal", "afford", "bekostig", "money", "geld", "r169", "169", "subscription", "plan", "free", "gratis"],
    en: "Brain Boost is R169/month with a 14-day free trial — full access to study plans, instant marking, progress tracking, and Rizz (AI tutor). No charge during the trial, and you can cancel anytime with no fees. Billing questions? Email learn@kth-tech.com.",
    af: "Brain Boost kos R169/maand met 'n 14-dae gratis proeftydperk — volle toegang tot studieplanne, onmiddellike nasien, vorderingsopsporing, en Rizz (KI-tutor). Geen heffing tydens die proeftydperk nie, en jy kan enige tyd kanselleer sonder fooie. Faktureringsvrae? E-pos learn@kth-tech.com.",
  },
  {
    keywords: ["subject", "vak", "vakke", "maths", "wiskunde", "science", "wetenskap", "english", "accounting", "rekening", "geography", "geografie", "business", "besigheid", "life", "lewens", "cover", "dek"],
    en: "We cover all major NSC subjects: Mathematics, Physical Science, Life Sciences, Accounting, Business Studies, Geography, English, Economics, History, and more. Every question is 100% CAPS-aligned.",
    af: "Ons dek al die groot NSC-vakke: Wiskunde, Fisiese Wetenskap, Lewenswetenskappe, Rekeningkunde, Besigheidstudies, Geografie, Engels, Ekonomie, Geskiedenis, en meer. 100% KABV-belyn.",
  },
  {
    keywords: ["parent", "ouer", "mom", "dad", "ma", "pa", "guardian", "voog", "child", "kind", "track", "monitor"],
    en: "Parents get their own dashboard! See your child's weekly progress, which subjects need attention, study streaks, and improvement trends. Peace of mind for any parent.",
    af: "Ouers kry hul eie dashboard! Sien jou kind se weeklikse vordering, watter vakke aandag nodig het, studie-reekse, en verbeteringstendense.",
  },
  {
    keywords: ["sign", "register", "join", "start", "begin", "aansluit", "registreer", "signup", "aan", "how do i", "hoe"],
    en: "Just click Sign In and start your 14-day free trial — no charge during the trial. Pick whether you're a learner or a parent, finish the quick onboarding, and you're in. Takes about 2 minutes.",
    af: "Klik net Aanmeld en begin jou 14-dae gratis proeftydperk — geen heffing tydens die proef nie. Kies of jy 'n leerder of 'n ouer is, voltooi die kort aanboord, en jy's binne. Dit neem sowat 2 minute.",
  },
  {
    keywords: ["school", "skool", "skole", "teacher", "onderwyser", "partner", "vennoot"],
    en: "Schools can partner with BrainTrack — we give your school a unique sign-up link. Every learner who subscribes earns the school R35/month. No cost, no risk.",
    af: "Skole kan met BrainTrack vennoot. Ons gee jou skool 'n unieke aanmeldskakel. Elke leerder wat inteken verdien die skool R35/maand. Geen koste, geen risiko.",
  },
  {
    keywords: ["tutor", "smart", "slim", "help", "explain", "verduidelik", "stuck", "vas", "understand", "verstaan", "hint", "answer", "antwoord"],
    en: "Rizz, our AI tutor, is trained on real exam memos. It teaches you step by step — hints, method breakdowns, memo explanations, or full worked solutions. Like a patient teacher available 24/7.",
    af: "Rizz, ons KI-tutor, is opgelei met regte eksamenmemo's. Dit leer jou stap vir stap — wenke, metode-uiteensettings, memo-verduidelikings, of volle uitgewerkte oplossings.",
  },
  {
    keywords: ["xp", "level", "badge", "kenteken", "vlak", "points", "punte", "streak", "game", "speel", "reward", "beloning", "achievement", "superstar"],
    en: "Earn XP every time you study. Level up from Starter to SuperStar! Collect badges, keep streaks alive, and make learning feel rewarding.",
    af: "Verdien XP elke keer as jy studeer. Vlak op van Starter na SuperStar! Versamel kentekens, hou reekse lewendig, en maak leer belonend.",
  },
  {
    keywords: ["language", "taal", "afrikaans", "english", "engels", "switch", "wissel"],
    en: "Everything works in both English and Afrikaans! Switch anytime using the language toggle at the top of any page.",
    af: "Alles werk in beide Engels en Afrikaans! Wissel enige tyd met die taalskakelaar bo-aan enige bladsy.",
  },
  {
    keywords: ["safe", "veilig", "data", "privacy", "popia", "secure", "information", "inligting"],
    en: "Your data is 100% safe. Fully POPIA compliant. We never share your info with third parties and never store card details.",
    af: "Jou data is 100% veilig. Ten volle POPIA-nakomend. Ons deel nooit jou inligting nie en stoor nooit kaartbesonderhede nie.",
  },
  {
    keywords: ["device", "toestel", "phone", "foon", "tablet", "laptop", "app", "download", "aflaai", "mobile", "mobiel"],
    en: "BrainTrack works on any device with a web browser — phone, tablet, laptop. No download needed! Designed mobile-first.",
    af: "BrainTrack werk op enige toestel met 'n webblaaier — foon, tablet, skootrekenaar. Geen aflaai nodig nie!",
  },
  {
    keywords: ["exam", "eksamen", "mode", "mock", "toets", "practice", "oefen", "past paper", "ou vraestel", "paper"],
    en: "Brain Boost includes real exam-style questions from 10 years of past papers. Full mock exams with timed conditions, score breakdowns by topic, and smart revision suggestions.",
    af: "Brain Boost sluit regte eksamen-styl vrae in uit 10 jaar se ou vraestelle. Volle proefeksamens met tydsbeperkings, puntetelling per onderwerp, en slim hersieningsvoorstelle.",
  },
  {
    keywords: ["rizz", "you", "jy", "who", "wie", "bot", "chat"],
    en: "I'm Rizz, your BrainTrack guide! I help you find your way around and answer questions about the platform. For subject help, use Rizz Tutor inside your Classroom.",
    af: "Ek is Rizz, jou BrainTrack-gids! Ek help jou om jou weg te vind en beantwoord vrae oor die platform. Vir vakhulp, gebruik Rizz Tutor in jou Klaskamer.",
  },
  {
    keywords: ["hello", "hi", "hey", "hallo", "howzit", "sup", "yo", "good", "goeie", "morning", "more", "afternoon", "middag", "evening", "aand"],
    en: "Hey! I'm Rizz — ask me anything about BrainTrack, pricing, subjects, how to sign up, or how it all works.",
    af: "Hallo! Ek is Rizz — vra my enigiets oor BrainTrack, pryse, vakke, hoe om aan te sluit, of hoe dit werk.",
  },
  {
    keywords: ["thanks", "thank", "dankie", "baie", "cool", "great", "awesome", "nice", "lekker", "sharp"],
    en: "Anytime! If you have more questions, I'm right here. Good luck with your studies!",
    af: "Plesier! As jy nog vrae het, ek is reg hier. Sterkte met jou studies!",
  },
  {
    keywords: ["cancel", "kanselleer", "billing", "fakturering", "payment", "betaling", "refund", "terugbetaling"],
    en: "There's nothing to cancel — BrainTrack is free for everyone right now. If you have a billing question for later, email learn@kth-tech.com.",
    af: "Jy kan enige tyd direk in die app kanselleer — Instellings → Intekening → Kanselleer. Dit stop alle toekomstige heffings onmiddellik. Faktureringsvrae? E-pos learn@kth-tech.com.",
  },
];

const parentKnowledge: KnowledgeEntry[] = [
  {
    keywords: ["progress", "vordering", "how", "doing", "marks", "punte", "score", "results", "accuracy", "streak", "performance"],
    en: "Check your Parent Dashboard for your child's weekly progress — study days, accuracy, streaks, and which subjects need the most attention.",
    af: "Kyk na jou Ouer-dashboard vir jou kind se weeklikse vordering — studiedae, akkuraatheid, reekse, en watter vakke aandag nodig het.",
  },
  {
    keywords: ["subject", "vak", "weak", "swak", "improve", "verbeter", "struggle", "sukkel", "behind", "agter"],
    en: "Your dashboard highlights subjects needing improvement. Encourage consistent daily practice — even 20 minutes helps build strong recall.",
    af: "Jou dashboard wys vakke wat verbetering nodig het. Moedig konsekwente daaglikse oefening aan — selfs 20 minute help.",
  },
  {
    keywords: ["study", "studeer", "time", "tyd", "daily", "daagliks", "schedule", "skedule", "plan", "routine"],
    en: "Study time is tracked automatically. The dashboard shows days studied and total minutes. Consistent daily practice builds stronger recall than cramming.",
    af: "Studietyd word outomaties opgespoor. Die dashboard wys studiedae en totale minute. Konsekwente daaglikse oefening bou sterker herroeping as inkramming.",
  },
];

const fallback = {
  en: "I can help with info about BrainTrack, pricing, subjects, signing up, Rizz (our AI tutor), or how parents can track progress. What would you like to know?",
  af: "Ek kan help met inligting oor BrainTrack, pryse, vakke, aanmelding, Rizz (ons KI-tutor), of hoe ouers vordering kan volg. Wat wil jy weet?",
};

const parentFallback = {
  en: "I can help you understand your child's progress, study habits, subjects, billing, or anything about how BrainTrack works. What would you like to know?",
  af: "Ek kan jou help om jou kind se vordering, studiegewoontes, vakke, fakturering, of enigiets oor BrainTrack te verstaan. Wat wil jy weet?",
};

function getGreeting(lang: "en" | "af", userType: "learner" | "parent" | "visitor"): string {
  const h = new Date().getHours();
  const time = lang === "en"
    ? (h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening")
    : (h < 12 ? "Môre" : h < 17 ? "Middag" : "Aand");

  const greetings = {
    visitor: {
      en: [
        `${time}! I'm Rizz. Ask me anything about BrainTrack — pricing, subjects, or how to get started.`,
        `${time}! Want to know how BrainTrack can help you ace matric? I've got answers.`,
      ],
      af: [
        `${time}! Ek is Rizz — vra my enigiets oor BrainTrack. Pryse, vakke, of hoe om in te sluit!`,
        `Heita! Wil jy weet hoe BrainTrack jou help om matriek te slaan? Vra maar — ek is reg hier.`,
      ],
    },
    learner: {
      en: [
        `${time}! Ready to level up? Ask me anything about BrainTrack.`,
        `${time}! Another day closer to matric. How can I help?`,
      ],
      af: [
        `${time}! Gereed om te vlak? Vra my enigiets oor die platform!`,
        `Howzit! Nog 'n dag nader aan matriek. Watse hulp soek jy?`,
      ],
    },
    parent: {
      en: [
        `${time}! I can help you check on your child's progress or answer any questions.`,
        `${time}! Need help understanding your child's dashboard? I'm here.`,
      ],
      af: [
        `${time}! Ek kan jou help om jou kind se vordering na te gaan. Vra gerus.`,
        `${time}! Sukkel om die dashboard te verstaan? Ek help jou deur dit. Vra maar!`,
      ],
    },
  };

  const options = greetings[userType][lang];
  return options[Math.floor(Math.random() * options.length)];
}

function findBestResponse(input: string, lang: "en" | "af", userType: string, routeCtx?: RouteContext | null): string {
  const lower = input.toLowerCase();
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  const kb = userType === "parent" ? [...parentKnowledge, ...knowledge] : knowledge;

  for (const entry of kb) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch[lang];
  }

  if (routeCtx) {
    return lang === "af"
      ? `${routeCtx.af} Vra my enigiets oor hierdie bladsy of die platform!`
      : `${routeCtx.en} Ask me anything about this page or the platform!`;
  }

  return userType === "parent" ? parentFallback[lang] : fallback[lang];
}

const quickActions = {
  en: {
    visitor: [
      { label: "What is BrainTrack?", query: "What is BrainTrack?" },
      { label: "How much?", query: "How much does it cost?" },
      { label: "Which subjects?", query: "What subjects do you cover?" },
      { label: "How to sign up", query: "How do I sign up?" },
    ],
    learner: [
      { label: "Rizz Tutor", query: "Tell me about Rizz the AI tutor" },
      { label: "Exam mode", query: "How does exam mode work?" },
      { label: "My subjects", query: "What subjects do you cover?" },
      { label: "Earn XP", query: "How do I earn XP and badges?" },
    ],
    parent: [
      { label: "Child's progress", query: "How is my child doing?" },
      { label: "Billing help", query: "I have a billing question" },
      { label: "Is data safe?", query: "Is my child's data safe?" },
      { label: "Study time", query: "How much is my child studying?" },
    ],
  },
  af: {
    visitor: [
      { label: "Wat is BrainTrack?", query: "Wat is BrainTrack?" },
      { label: "Hoeveel kos dit?", query: "Hoeveel kos dit?" },
      { label: "Watter vakke?", query: "Watter vakke dek julle?" },
      { label: "Hoe sluit ek aan?", query: "Hoe sluit ek aan?" },
    ],
    learner: [
      { label: "Rizz Tutor", query: "Vertel my van Rizz die KI-tutor" },
      { label: "Eksamen-modus", query: "Hoe werk eksamen-modus?" },
      { label: "My vakke", query: "Watter vakke dek julle?" },
      { label: "Verdien XP", query: "Hoe verdien ek XP en kentekens?" },
    ],
    parent: [
      { label: "Kind se vordering", query: "Hoe doen my kind?" },
      { label: "Fakturering", query: "Ek het 'n faktureringsvraag" },
      { label: "Is data veilig?", query: "Is my kind se data veilig?" },
      { label: "Studietyd", query: "Hoeveel studeer my kind?" },
    ],
  },
};

interface RouteContext {
  greetingKey: "visitor" | "learner" | "parent" | "tutor" | "papers" | "subjects" | "pricing";
  en: string;
  af: string;
  quickEn: { label: string; query: string }[];
  quickAf: { label: string; query: string }[];
}

const routeContextMap: { pattern: RegExp; ctx: RouteContext }[] = [
  {
    pattern: /^\/smart-tutor/,
    ctx: {
      greetingKey: "tutor",
      en: "Need help with a question? Ask me anything — I can explain concepts step by step or help you find the right hint!",
      af: "Het jy hulp nodig met 'n vraag? Vra my enigiets — ek kan konsepte stap vir stap verduidelik!",
      quickEn: [
        { label: "How do I get a hint?", query: "How do I get a hint for a question?" },
        { label: "Explain a concept", query: "Can you explain how to use Rizz?" },
        { label: "Which subjects?", query: "Which subjects does Rizz cover?" },
      ],
      quickAf: [
        { label: "Hoe kry ek 'n wenk?", query: "Hoe kry ek 'n wenk vir 'n vraag?" },
        { label: "Verduidelik 'n konsep", query: "Hoe gebruik ek Rizz?" },
        { label: "Watter vakke?", query: "Watter vakke dek Rizz?" },
      ],
    },
  },
  {
    pattern: /^\/past-papers/,
    ctx: {
      greetingKey: "papers",
      en: "Working through past papers? I can help you understand how the paper system works and what to focus on!",
      af: "Werk jy deur ou vraestelle? Ek kan jou help verstaan hoe die vraestelstelsel werk!",
      quickEn: [
        { label: "How do papers work?", query: "How do past papers work on BrainTrack?" },
        { label: "Which years are available?", query: "Which years of past papers do you have?" },
        { label: "Memo help", query: "How do I access the memo for a question?" },
      ],
      quickAf: [
        { label: "Hoe werk vraestelle?", query: "Hoe werk ou vraestelle op BrainTrack?" },
        { label: "Watter jare?", query: "Watter jare se vraestelle het julle?" },
        { label: "Memo hulp", query: "Hoe kry ek toegang tot die memo?" },
      ],
    },
  },
  {
    pattern: /^\/subjects/,
    ctx: {
      greetingKey: "subjects",
      en: "Looking for subjects? I can tell you which subjects are covered and help you pick the right ones!",
      af: "Soek jy vakke? Ek kan jou vertel watter vakke gedek word en help om die regte te kies!",
      quickEn: [
        { label: "All subjects covered", query: "What subjects do you cover?" },
        { label: "How to choose subjects", query: "How do I choose my subjects?" },
        { label: "Switch subjects", query: "Can I change my subjects later?" },
      ],
      quickAf: [
        { label: "Alle vakke", query: "Watter vakke dek julle?" },
        { label: "Hoe kies ek vakke", query: "Hoe kies ek my vakke?" },
        { label: "Verander vakke", query: "Kan ek later my vakke verander?" },
      ],
    },
  },
  {
    pattern: /^\/(subscribe|parent-purchase)/,
    ctx: {
      greetingKey: "pricing",
      en: "Questions about pricing or the plan? I can break it all down — no surprises!",
      af: "Vrae oor pryse of die plan? Ek kan dit alles uiteensit — geen verrassings nie!",
      quickEn: [
        { label: "What's included?", query: "What is included in Brain Boost?" },
        { label: "How much?", query: "How much does Brain Boost cost?" },
        { label: "Cancel anytime?", query: "Can I cancel at any time?" },
      ],
      quickAf: [
        { label: "Wat is ingesluit?", query: "Wat is in Brain Boost ingesluit?" },
        { label: "Hoeveel kos dit?", query: "Hoeveel kos Brain Boost?" },
        { label: "Kanselleer enige tyd?", query: "Kan ek enige tyd kanselleer?" },
      ],
    },
  },
  {
    pattern: /^\/dashboard/,
    ctx: {
      greetingKey: "learner",
      en: "Welcome back! Need help understanding your dashboard or what to study next?",
      af: "Welkom terug! Het jy hulp nodig om jou dashboard te verstaan of wat om volgende te studeer?",
      quickEn: [
        { label: "Study plan help", query: "How does my study plan work?" },
        { label: "Earn XP", query: "How do I earn XP and badges?" },
        { label: "Rizz Tutor", query: "Tell me about Rizz the AI tutor" },
      ],
      quickAf: [
        { label: "Studieplan hulp", query: "Hoe werk my studieplan?" },
        { label: "Verdien XP", query: "Hoe verdien ek XP en kentekens?" },
        { label: "Rizz Tutor", query: "Vertel my van Rizz die KI-tutor" },
      ],
    },
  },
];

function getRouteContext(location: string): RouteContext | null {
  for (const { pattern, ctx } of routeContextMap) {
    if (pattern.test(location)) return ctx;
  }
  return null;
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center py-2 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full rizz-typing-dot"
          style={{
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

export function NovaBot({ userType = "visitor" }: { userType?: "learner" | "parent" | "visitor" }) {
  const { language } = useLanguage();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLangRef = useRef(language);
  const prevLocationRef = useRef(location);
  const studySessionIdRef = useRef<number | null>(null);
  const qc = useQueryClient();

  const routeCtx = getRouteContext(location);
  const [tsEscalating, setTsEscalating] = useState(false);

  const getContextualGreeting = useCallback(() => {
    if (routeCtx) return routeCtx[language as "en" | "af"] ?? routeCtx.en;
    return getGreeting(language as "en" | "af", userType);
  }, [routeCtx, language, userType]);

  const getContextualActions = useCallback(() => {
    if (routeCtx) return language === "af" ? routeCtx.quickAf : routeCtx.quickEn;
    return quickActions[language as "en" | "af"][userType];
  }, [routeCtx, language, userType]);

  // ── Troubleshoot mode ──────────────────────────────────────
  const visibleTsCategories = useCallback((): TsCategoryKey[] => {
    // Visitors see every category but those marked requiresAuth are gated
    // post-selection with a "sign in first" message rather than steps.
    return TROUBLESHOOT_CATEGORIES.map((c) => c.key);
  }, []);

  const startTroubleshoot = useCallback(() => {
    setHasInteracted(true);
    const lang = language as "en" | "af";
    const userMsg: Message = { role: "user", content: TS_LABELS.troubleshoot[lang] };
    const botMsg: Message = {
      role: "rizz",
      content: TS_LABELS.pickCategory[lang],
      troubleshoot: { kind: "category-list", categories: visibleTsCategories() },
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  }, [language, visibleTsCategories]);

  const handleSelectCategory = useCallback((key: TsCategoryKey) => {
    const cat = TROUBLESHOOT_CATEGORIES.find((c) => c.key === key);
    if (!cat) return;
    const lang = language as "en" | "af";
    const isVisitor = userType === "visitor";
    const userMsg: Message = { role: "user", content: lang === "af" ? cat.labelAf : cat.labelEn };

    if (isVisitor && cat.requiresAuth) {
      const gateMsg: Message = {
        role: "rizz",
        content: TS_LABELS.visitorLoginRequired[lang],
        troubleshoot: { kind: "post-steps", category: key },
        action: {
          title: TS_LABELS.signInCta.en,
          titleAf: TS_LABELS.signInCta.af,
          description: "",
          descriptionAf: "",
          href: "/api/login",
        },
      };
      setMessages((prev) => [...prev, userMsg, gateMsg]);
      return;
    }

    const intro = lang === "af" ? cat.introAf : cat.introEn;
    const steps = lang === "af" ? cat.stepsAf : cat.stepsEn;
    const stepsBlock = steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
    const botMsg: Message = {
      role: "rizz",
      content: `${intro}\n\n${stepsBlock}`,
      troubleshoot: { kind: "post-steps", category: key },
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  }, [language, userType]);

  const handleStepsResolved = useCallback(() => {
    const lang = language as "en" | "af";
    const userMsg: Message = { role: "user", content: TS_LABELS.fixedIt[lang] };
    const botMsg: Message = { role: "rizz", content: TS_LABELS.glad[lang] };
    setMessages((prev) => [
      ...prev.map((m) => (m.troubleshoot?.kind === "post-steps" ? { ...m, troubleshoot: undefined } : m)),
      userMsg,
      botMsg,
    ]);
  }, [language]);

  const handleStillStuck = useCallback(async (category: TsCategoryKey) => {
    if (tsEscalating) return;
    const lang = language as "en" | "af";
    const cat = TROUBLESHOOT_CATEGORIES.find((c) => c.key === category);
    const userMsg: Message = { role: "user", content: TS_LABELS.stillStuck[lang] };
    const sendingMsg: Message = { role: "rizz", content: TS_LABELS.escalating[lang] };
    setMessages((prev) => [
      ...prev.map((m) => (m.troubleshoot?.kind === "post-steps" ? { ...m, troubleshoot: undefined } : m)),
      userMsg,
      sendingMsg,
    ]);
    setTsEscalating(true);

    const stepsTried = cat ? (lang === "af" ? cat.stepsAf : cat.stepsEn) : [];
    try {
      const res = await apiRequest("POST", "/api/support/troubleshoot-email", {
        category,
        stepsTried,
        pagePath: location,
        language: lang,
      });
      const data = await res.json().catch(() => ({}));
      const confirmText: string = (typeof data?.message === "string" && data.message.length)
        ? data.message
        : (lang === "af"
            ? "Dankie — ons ondersteuningspan het jou probleem ontvang en sal binne 24 uur reageer."
            : "Thanks — our support team has received your issue and will reply within 24 hours.");
      const confirmMsg: Message = {
        role: "rizz",
        content: confirmText,
        troubleshoot: { kind: "escalate-done", category },
      };
      setMessages((prev) => [...prev.slice(0, -1), confirmMsg]);
    } catch (_err) {
      const failMsg: Message = { role: "rizz", content: TS_LABELS.escalateFailed[lang] };
      setMessages((prev) => [...prev.slice(0, -1), failMsg]);
    } finally {
      setTsEscalating(false);
    }
  }, [language, location, tsEscalating]);

  useEffect(() => {
    setMessages([{ role: "rizz", content: getContextualGreeting() }]);
  }, [userType]);

  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;
      setMessages([{ role: "rizz", content: getContextualGreeting() }]);
      setHasInteracted(false);
    }
  }, [language, userType]);

  useEffect(() => {
    if (prevLocationRef.current !== location) {
      prevLocationRef.current = location;
      setMessages([{ role: "rizz", content: getContextualGreeting() }]);
      setHasInteracted(false);
    }
  }, [location]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-rizz", handler);
    return () => window.removeEventListener("open-rizz", handler);
  }, []);

  // Adaptive opener: when a learner opens the bot, fetch their next-best action
  // (mastery + days-to-exam + VARK) and prepend a tailored nudge with a CTA.
  // Re-fetches when the tab becomes visible again, so the nudge updates as
  // mastery / days-to-exam change.
  const fetchNextAction = useCallback(() => {
    if (userType !== "learner") return () => {};
    let cancelled = false;
    const isAf = language === "af";
    const lead = isAf ? "Hier is jou volgende beste skuif:" : "Here's your next best move:";
    apiRequest("GET", "/api/learner/next-action")
      .then((r) => r.json())
      .then((data: { action?: NextAction }) => {
        if (cancelled || !data?.action) return;
        const a = data.action;
        const content = `${lead}\n\n**${isAf ? a.titleAf : a.title}**\n${isAf ? a.descriptionAf : a.description}`;
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.action);
          return [{ role: "rizz", content, action: a }, ...filtered];
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userType, language]);

  useEffect(() => {
    if (!isOpen) return;
    const cleanup = fetchNextAction();
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchNextAction();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cleanup();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isOpen, fetchNextAction]);

  const handleActionCta = useCallback((action: NextAction) => {
    setIsOpen(false);
    setMessages((prev) => prev.filter((m) => !m.action));
    if (/^https?:\/\//i.test(action.href)) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else if (isSafeInternalPath(action.href)) {
      setLocation(action.href);
    }
  }, [setLocation]);

  useEffect(() => {
    if (userType !== "learner" || !isOpen) return;

    let cancelled = false;

    const endSession = (id: number) => {
      const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["/api/learner/readiness"] });
        qc.invalidateQueries({ queryKey: ["/api/learner/goals"] });
      };
      apiRequest("PATCH", `/api/study-sessions/${id}/end`, {})
        .then(invalidate)
        .catch(invalidate);
    };

    apiRequest("POST", "/api/study-sessions/start", { context: "rizz_chat" })
      .then(r => r.json())
      .then((s: { sessionId: number }) => {
        if (cancelled) {
          endSession(s.sessionId);
        } else {
          studySessionIdRef.current = s.sessionId;
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (studySessionIdRef.current !== null) {
        const id = studySessionIdRef.current;
        studySessionIdRef.current = null;
        endSession(id);
      }
    };
  }, [isOpen, userType]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setHasInteracted(true);

    const response = findBestResponse(text, language, userType, routeCtx);
    const delay = 400 + Math.min(response.length * 2, 800);

    setTimeout(() => {
      setMessages(prev => [...prev, { role: "rizz", content: response }]);
      setIsTyping(false);
    }, delay);
  }, [language, userType, routeCtx]);

  const handleSend = () => sendMessage(input);

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const actions = getContextualActions();

  return (
    <>
      {!isOpen && (
        <div
          className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[120] pointer-events-none"
          data-testid="rizz-float-trigger-wrap"
        >
          <button
            type="button"
            className="pointer-events-auto rizz-flash-icon relative w-16 h-16 rounded-full hover:scale-[1.05] active:scale-[0.96] transition-transform"
            onClick={() => setIsOpen(true)}
            data-testid="button-rizz-float-trigger"
            aria-label="Chat with Rizz"
          >
            <img src={rizzAvatar} alt="Rizz" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-[100]" data-testid="rizz-bot-container">
          <div
            className="prismglass-panel rizz-chat-panel flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
            style={{ width: "min(92vw, 380px)", height: "min(78vh, 540px)" }}
            data-testid="rizz-chat-panel"
          >
            <div className="rizz-chat-header flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rizz-avatar-ring-wrap">
                  <img src={rizzAvatar} alt="Rizz" className="w-10 h-10 rounded-xl object-cover relative z-10" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight text-white">Rizz</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 rizz-pulse-dot" />
                    <p className="text-[11px] text-white leading-tight font-medium">
                      {language === "en" ? "Online now" : "Nou aanlyn"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rizz-close-btn"
                data-testid="button-nova-close"
                aria-label="Close Rizz"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth rizz-messages-area">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2 max-w-[88%] animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
                    m.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  {m.role === "rizz" && (
                    <img src={rizzAvatar} alt="Rizz" className="w-7 h-7 rounded-lg object-cover flex-shrink-0 mt-0.5" />
                  )}
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap",
                      m.role === "rizz"
                        ? "rizz-bubble-bot rounded-tl-md"
                        : "rizz-bubble-user rounded-tr-md text-white"
                    )}
                  >
                    {m.content}
                    {m.troubleshoot?.kind === "category-list" && m.troubleshoot.categories && (
                      <div className="mt-3 flex flex-col gap-1.5" data-testid="rizz-ts-categories">
                        {m.troubleshoot.categories.map((key) => {
                          const cat = TROUBLESHOOT_CATEGORIES.find((c) => c.key === key);
                          if (!cat) return null;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleSelectCategory(key)}
                              className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-foreground text-left transition-colors"
                              data-testid={`button-rizz-ts-cat-${key}`}
                            >
                              <span>{language === "af" ? cat.labelAf : cat.labelEn}</span>
                              <ArrowRight className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {m.troubleshoot?.kind === "post-steps" && m.troubleshoot.category && (
                      <div className="mt-3 flex flex-wrap gap-2" data-testid="rizz-ts-post-steps">
                        <button
                          type="button"
                          onClick={handleStepsResolved}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-foreground transition-colors"
                          data-testid="button-rizz-ts-fixed"
                        >
                          {TS_LABELS.fixedIt[language as "en" | "af"]}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStillStuck(m.troubleshoot!.category!)}
                          disabled={tsEscalating}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold bg-white/15 hover:bg-white/25 border border-white/30 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-rizz-ts-stuck"
                        >
                          {TS_LABELS.stillStuck[language as "en" | "af"]}
                        </button>
                      </div>
                    )}
                    {m.action && (
                      <div className="mt-3 space-y-2" data-testid="rizz-next-action">
                        {m.action.meta && (m.action.meta.vark || m.action.meta.daysToExam !== undefined || m.action.meta.masteryBand) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {m.action.meta.vark && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full border border-white/20 text-white">
                                <Sparkles className="w-2.5 h-2.5" />
                                {m.action.meta.vark}
                              </span>
                            )}
                            {m.action.meta.masteryBand && (
                              <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full border border-white/20 text-white">
                                {m.action.meta.masteryBand}
                              </span>
                            )}
                            {m.action.meta.daysToExam !== undefined && (
                              <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full border border-white/20 text-white">
                                {m.action.meta.daysToExam}d {language === "af" ? "tot eksamen" : "to exam"}
                              </span>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleActionCta(m.action!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold bg-white/15 hover:bg-white/25 border border-white/30 text-white transition-colors"
                          data-testid="button-rizz-next-action-cta"
                        >
                          {language === "af" ? "Doen dit" : "Do it"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full rizz-user-avatar flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 max-w-[88%] animate-in fade-in-0 duration-200">
                  <img src={rizzAvatar} alt="Rizz" className="w-7 h-7 rounded-lg object-cover flex-shrink-0 mt-0.5" />
                  <div className="px-3.5 py-1 rounded-2xl rounded-tl-md rizz-bubble-bot">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {!hasInteracted && actions.length > 0 && !messages.some((m) => m.action || m.troubleshoot) && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.query)}
                    className="rizz-chip"
                    data-testid={`button-quick-action-${i}`}
                  >
                    {action.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={startTroubleshoot}
                  className="rizz-chip"
                  data-testid="button-quick-action-troubleshoot"
                >
                  {TS_LABELS.troubleshoot[language as "en" | "af"]}
                </button>
              </div>
            )}

            <div className="px-3 pb-3 pt-2 rizz-input-border-top">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2 items-center"
                data-testid="form-nova-chat"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={language === "en" ? "Type a message..." : "Tik 'n boodskap..."}
                  className="rizz-input flex-1"
                  data-testid="input-nova-message"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="rizz-send-btn"
                  data-testid="button-nova-send"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
