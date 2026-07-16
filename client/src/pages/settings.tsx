import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import { formatSAPhone } from "@/lib/utils";
import { 
  ArrowLeft, 
  Phone, 
  Shield, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  Save,
  Dumbbell,
  Plus,
  X,
  Gift,
  Copy,
  Check,
  Users,
  Globe,
  SlidersHorizontal,
  CalendarDays,
} from "lucide-react";
import type { Subject, OnboardingResult } from "@shared/schema";
import { SpraySmear } from "@/components/graffiti-splats";
import brainLogo from "@/assets/brain-logo.png";

type NeonHex = "#7FEFFF" | "#6FA8FF" | "#FFF29E" | "#FF9FE5" | "#C6A4FF";
function NeonCard({ color, icon: Icon, title, subtitle, children, testId }: {
  color: NeonHex;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  // Sections sit directly on the wall: marker+smear header, plain white content,
  // thin hairline separator between sections — no card boxes.
  return (
    <section
      className="relative pb-8"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
      data-testid={testId}
    >
      <div className="flex items-start gap-3 mb-2">
        <Icon className="w-5 h-5 shrink-0 mt-1.5" style={{ color, filter: `drop-shadow(0 0 5px ${color})` }} />
        <div className="min-w-0">
          <h3 className="text-xl text-white leading-tight graffiti-hand">
            <span className="spray-title graffiti-hand">
              <SpraySmear color={color} />
              {title}
            </span>
          </h3>
          {subtitle && <p className="text-xs text-white mt-1 leading-snug">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const T = {
  en: {
    pageTitle: "Settings",
    dashboardBtn: "Dashboard",
    yourAccount: "Your Account",
    secure: "Secure",
    heroHeading: "Settings",
    heroSubtitle: "Manage your account, phone number, subjects and commitments.",
    phoneNumber: "Phone Number",
    phoneLearnerSub: "Set by your parent — ask them to change it",
    phoneParentSub: "Update your number for account recovery",
    currentNumber: "Current Number",
    notSet: "Not set",
    managedByParent: "Managed by Parent",
    managedByParentDesc: "Your parent sets your phone number for account security. Ask them to update it from their parent dashboard.",
    newPhoneLabel: "New Phone Number",
    newPhoneHint: "Enter your new South African mobile number",
    verificationRequired: "Verification Required",
    verificationRequiredDesc: "For your security, we'll send a 6-digit code to verify your new number.",
    sendingCode: "Sending Code...",
    sendVerificationCode: "Send Verification Code",
    codeSentTo: "Code sent to",
    verificationCodeLabel: "Verification Code",
    verificationCodePlaceholder: "Enter 6-digit code",
    cancel: "Cancel",
    verifying: "Verifying...",
    verifyAndUpdate: "Verify & Update",
    resendCode: "Didn't receive the code? Resend",
    invalidNumber: "Invalid Number",
    invalidNumberDesc: "Please enter a valid South African phone number.",
    invalidCode: "Invalid Code",
    invalidCodeDesc: "Please enter the 6-digit verification code.",
    prelimScheduleUpdated: "Prelim Schedule Updated",
    prelimScheduleUpdatedDesc: "Your prelim schedule has been updated.",
    error: "Error",
    failedToSavePrelims: "Failed to save prelim dates.",
    linkCopied: "Link copied!",
    linkCopiedDesc: "Share it with your friends.",
    subjectsUpdated: "Subjects Updated",
    subjectsUpdatedDesc: "Your selected subjects have been saved.",
    failedToUpdateSubjects: "Failed to update subjects. Please try again.",
    subjectsChangeOncePerWeek: "You can only change your subjects once per week.",
    verificationCodeSent: "Verification Code Sent",
    verificationCodeSentDesc: "Please enter the 6-digit code sent to your new number.",
    failedToSendCode: "Failed to send verification code. Please try again.",
    smsNotConfigured: "SMS is not yet available. Please contact support.",
    tooManyRequests: "Too many requests. Please wait a few minutes before trying again.",
    phoneNumberUpdated: "Phone Number Updated",
    phoneNumberUpdatedDesc: "Your phone number has been successfully changed.",
    verificationFailed: "Verification Failed",
    verificationFailedDesc: "Invalid or expired code. Please try again.",
    profileCreated: "Profile Created!",
    profileCreatedDesc: "Your study profile has been saved.",
    yourSubjects: "Your Subjects",
    yourSubjectsSubtitle: "Tap to add or remove subjects (once per week)",
    loadingSubjects: "Loading subjects...",
    save: "Save",
    prelimDates: "Preliminary Exam Dates",
    prelimDatesSubtitle: "Enter your school's prelim dates (Aug–Sep). Schools differ — this is optional.",
    selectSubjectsFirst: "Select your subjects above first.",
    schoolPushedNotice: "Your school has pushed a prelim timetable. Change a date below to override it for yourself.",
    paper1: "Paper 1",
    paper2: "Paper 2",
    datesSet: "dates set",
    referAFriend: "Refer a Friend",
    referAFriendSubtitle: "Every friend who signs up earns you both coins (max 2/month)",
    yourReferralCode: "Your referral code",
    yourReferralLink: "Your referral link",
    loading: "Loading…",
    copied: "Copied!",
    copyLink: "Copy Link",
    thisMonth: "This month",
    slotsLeft: "Slots left",
    referralDisclaimer: "Your friends must activate their own subscription. Coins are awarded once their account is confirmed. The limit resets on the 1st of each month.",
    sportActivities: "Sport & Activities",
    sportActivitiesSubtitle: "Add commitments so your study plan works around your schedule",
    activityPlaceholder: "e.g. Rugby practice, Drama class...",
    noActivities: "No activities added yet",
    activitiesSaved: "Activities Saved",
    saveActivities: "Save Activities",
    selectAtLeast4: "Select at least 4 subjects",
    subjectsSelectedLabel: "subjects selected",
    activitiesSavedDesc: "activities saved.",
    subStartTrial: "Start Free Trial",
  },
  af: {
    pageTitle: "Instellings",
    dashboardBtn: "Tuis",
    yourAccount: "Jou Rekening",
    secure: "Veilig",
    heroHeading: "Instellings",
    heroSubtitle: "Pas jou rekening, foonnommer, vakke en verpligtinge na jou sin aan.",
    phoneNumber: "Foonnommer",
    phoneLearnerSub: "Deur jou ouer gestel — vra hulle om dit te verander",
    phoneParentSub: "Dateer jou nommer op vir rekeningherstel",
    currentNumber: "Huidige Nommer",
    notSet: "Nie gestel nie",
    managedByParent: "Deur Ouer Beheer",
    managedByParentDesc: "Jou ouer stel jou foonnommer in vir rekeningveiligheid. Vra hulle om dit in hul ouerbord op te dateer.",
    newPhoneLabel: "Nuwe Foonnommer",
    newPhoneHint: "Tik jou nuwe SA-selfoonnommer in",
    verificationRequired: "Verifikasie Vereis",
    verificationRequiredDesc: "Ons stuur 'n 6-syfer kode om jou nuwe nommer te bevestig — dit hou jou rekening veilig.",
    sendingCode: "Stuur Kode...",
    sendVerificationCode: "Stuur Verifikasiekode",
    codeSentTo: "Kode gestuur na",
    verificationCodeLabel: "Verifikasiekode",
    verificationCodePlaceholder: "Voer 6-syfer kode in",
    cancel: "Kanselleer",
    verifying: "Verifieer...",
    verifyAndUpdate: "Verifieer & Opdateer",
    resendCode: "Nie die kode ontvang nie? Herstuur",
    invalidNumber: "Ongeldige Nommer",
    invalidNumberDesc: "Voer asseblief 'n geldige Suid-Afrikaanse foonnommer in.",
    invalidCode: "Ongeldige Kode",
    invalidCodeDesc: "Voer asseblief die 6-syfer verifikasiekode in.",
    prelimScheduleUpdated: "Vooreksamen-skedule Opgedateer",
    prelimScheduleUpdatedDesc: "Jou vooreksamen-skedule is opgedateer.",
    error: "Fout",
    failedToSavePrelims: "Kon nie vooreksamendatums stoor nie.",
    linkCopied: "Skakel gekopieer!",
    linkCopiedDesc: "Deel dit met jou vriende.",
    subjectsUpdated: "Vakke Opgedateer",
    subjectsUpdatedDesc: "Jou gekose vakke is gestoor.",
    failedToUpdateSubjects: "Kon nie vakke opdateer nie. Probeer asseblief weer.",
    subjectsChangeOncePerWeek: "Jy kan net een keer per week jou vakke verander.",
    verificationCodeSent: "Verifikasiekode Gestuur",
    verificationCodeSentDesc: "Voer asseblief die 6-syfer kode in wat na jou nuwe nommer gestuur is.",
    failedToSendCode: "Kon nie verifikasiekode stuur nie. Probeer asseblief weer.",
    smsNotConfigured: "SMS is nog nie beskikbaar nie. Kontak asseblief ondersteuning.",
    tooManyRequests: "Te veel versoeke. Wag asseblief 'n paar minute voor jy weer probeer.",
    phoneNumberUpdated: "Foonnommer Opgedateer",
    phoneNumberUpdatedDesc: "Jou foonnommer is suksesvol verander.",
    verificationFailed: "Verifikasie Misluk",
    verificationFailedDesc: "Ongeldige of vervalde kode. Probeer asseblief weer.",
    profileCreated: "Profiel Geskep!",
    profileCreatedDesc: "Jou studieprofiel is gestoor.",
    yourSubjects: "Jou Vakke",
    yourSubjectsSubtitle: "Tik om vakke by te voeg of te verwyder (een keer per week)",
    loadingSubjects: "Vakke laai...",
    save: "Stoor",
    prelimDates: "Vooreksamendatums",
    prelimDatesSubtitle: "Vul jou skool se vooreksamendatums in (Aug–Sep). Skole se datums verskil — dit is opsioneel.",
    selectSubjectsFirst: "Kies eers jou vakke hierbo.",
    schoolPushedNotice: "Jou skool het 'n vooreksamen-skedule gestuur. Verander 'n datum hieronder om dit vir jou eie te oorskryf.",
    paper1: "Vraestel 1",
    paper2: "Vraestel 2",
    datesSet: "datums ingevul",
    referAFriend: "Verwys 'n Vriend",
    referAFriendSubtitle: "Elke vriend wat aansluit gee julle albei munte (max 2/maand)",
    yourReferralCode: "Jou verwysingskode",
    yourReferralLink: "Jou verwysingskakel",
    loading: "Laai…",
    copied: "Gekopieer!",
    copyLink: "Kopieer Skakel",
    thisMonth: "Hierdie maand",
    slotsLeft: "Slots oor",
    referralDisclaimer: "Jou vriende moet hul eie intekening aktiveer. Munte word toegeken sodra hul rekening bevestig word. Die grens stel terug op die 1ste van elke maand.",
    sportActivities: "Sport & Aktiwiteite",
    sportActivitiesSubtitle: "Voeg verpligtinge by sodat jou studieplan rondom jou skedule werk",
    activityPlaceholder: "bv. Rugby-oefening, Drama-klas...",
    noActivities: "Nog geen aktiwiteite bygevoeg nie",
    activitiesSaved: "Aktiwiteite Gestoor",
    saveActivities: "Stoor Aktiwiteite",
    selectAtLeast4: "Kies minstens 4 vakke",
    subjectsSelectedLabel: "vakke gekies",
    activitiesSavedDesc: "aktiwiteite gestoor.",
    subStartTrial: "Begin Gratis Proef",
  },
} as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const [newPhone, setNewPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [pendingPhone, setPendingPhone] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const hasLocalSubjectEdits = useRef(false);
  const [activities, setActivities] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  // Prelim exam dates (Task #359): keyed by `${subjectId}:${paperNumber}` → YYYY-MM-DD
  const [prelimDates, setPrelimDates] = useState<Record<string, string>>({});
  const [prelimDirty, setPrelimDirty] = useState(false);

  const { data: profile } = useQuery<{ phone?: string }>({
    queryKey: ["/api/user/profile"],
  });

  const { data: onboarding } = useQuery<OnboardingResult>({
    queryKey: ["/api/user/onboarding"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: referral } = useQuery<{ code: string; link: string; thisMonthCount: number; maxPerMonth: number }>({
    queryKey: ["/api/user/referral"],
    enabled: user?.role === "learner",
  });

  // Prelim exams (Task #359) — load effective dates (learner overrides school).
  const { data: prelimData } = useQuery<{
    exams: Array<{
      id: number;
      source: "learner" | "school";
      subjectId: number;
      subjectName: string;
      paperNumber: number;
      examDate: string;
      startTime: string;
    }>;
    count: number;
  }>({
    queryKey: ["/api/learner/prelim-exams"],
    retry: false,
  });

  useEffect(() => {
    if (!prelimData?.exams || prelimDirty) return;
    const map: Record<string, string> = {};
    for (const e of prelimData.exams) {
      map[`${e.subjectId}:${e.paperNumber}`] = e.examDate;
    }
    setPrelimDates(map);
  }, [prelimData, prelimDirty]);

  const updatePrelimsMutation = useMutation({
    mutationFn: async (entries: Array<{ subjectId: number; paperNumber: number; examDate: string }>) => {
      return apiRequest("PUT", "/api/learner/prelim-exams", { exams: entries });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learner/prelim-exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timetable/widgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timetable/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learner/exam-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learner/today-directive"] });
      setPrelimDirty(false);
      toast({
        title: t.prelimScheduleUpdated,
        description: t.prelimScheduleUpdatedDesc,
      });
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.failedToSavePrelims,
        variant: "destructive",
      });
    },
  });

  const setPrelimDate = (subjectId: number, paperNumber: number, examDate: string) => {
    setPrelimDirty(true);
    setPrelimDates(prev => {
      const next = { ...prev };
      const key = `${subjectId}:${paperNumber}`;
      if (examDate) next[key] = examDate;
      else delete next[key];
      return next;
    });
  };

  const savePrelims = () => {
    const entries = Object.entries(prelimDates)
      .filter(([, date]) => Boolean(date))
      .map(([key, examDate]) => {
        const [sid, pn] = key.split(":");
        return {
          subjectId: parseInt(sid, 10),
          paperNumber: parseInt(pn, 10),
          examDate,
        };
      });
    updatePrelimsMutation.mutate(entries);
  };


  const copyReferralLink = async () => {
    if (!referral?.link) return;
    await navigator.clipboard.writeText(referral.link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
    toast({ title: t.linkCopied, description: t.linkCopiedDesc });
  };

  const isDirty = useMemo(() => {
    const savedIds = (onboarding?.selectedSubjects || []).slice().sort().join(",");
    const currentIds = selectedSubjects.slice().sort().join(",");
    return savedIds !== currentIds;
  }, [onboarding, selectedSubjects]);

  useEffect(() => {
    if (onboarding?.selectedSubjects !== undefined && !hasLocalSubjectEdits.current) {
      setSelectedSubjects(onboarding.selectedSubjects);
    }
  }, [onboarding]);

  const updateSubjectsMutation = useMutation({
    mutationFn: async (subjectIds: number[]) => {
      return apiRequest("PATCH", "/api/user/onboarding", { selectedSubjects: subjectIds });
    },
    onSuccess: () => {
      hasLocalSubjectEdits.current = false;
      queryClient.invalidateQueries({ queryKey: ["/api/user/onboarding"] });
      toast({
        title: t.subjectsUpdated,
        description: t.subjectsUpdatedDesc,
      });
    },
    onError: (error: any) => {
      let message: string = t.failedToUpdateSubjects;
      try {
        const errMsg = error?.message || "";
        if (errMsg.includes("429")) {
          const jsonStr = errMsg.substring(errMsg.indexOf("{"));
          const data = JSON.parse(jsonStr);
          if (data?.daysRemaining) {
            message = isAf 
              ? `Jy kan net een keer per week jou vakke verander. Probeer weer oor ${data.daysRemaining} dag(e).`
              : `You can only change your subjects once per week. Try again in ${data.daysRemaining} day(s).`;
          } else {
            message = t.subjectsChangeOncePerWeek;
          }
        }
      } catch {}
      toast({
        title: t.error,
        description: message,
        variant: "destructive",
      });
    },
  });

  const toggleSubject = (subjectId: number) => {
    hasLocalSubjectEdits.current = true;
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const saveSubjects = () => {
    updateSubjectsMutation.mutate(selectedSubjects);
  };

  const parseOtpError = (error: any): string => {
    const msg: string = error?.message ?? "";
    if (msg.startsWith("503:")) return t.smsNotConfigured;
    if (msg.startsWith("429:")) return t.tooManyRequests;
    try {
      const jsonStart = msg.indexOf("{");
      if (jsonStart !== -1) {
        const parsed = JSON.parse(msg.slice(jsonStart));
        if (parsed?.message) return parsed.message;
      }
    } catch {}
    return t.failedToSendCode;
  };

  const parseVerifyError = (error: any): string => {
    const msg: string = error?.message ?? "";
    if (msg.startsWith("503:")) return t.smsNotConfigured;
    if (msg.startsWith("429:")) return t.tooManyRequests;
    // Map known server error codes to localized strings rather than surfacing
    // raw English server messages, so AF users see their own language.
    try {
      const jsonStart = msg.indexOf("{");
      if (jsonStart !== -1) {
        const parsed = JSON.parse(msg.slice(jsonStart));
        if (parsed?.error === "invalid_or_expired") return t.verificationFailedDesc;
      }
    } catch {}
    return t.verificationFailedDesc;
  };

  const requestOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      return apiRequest("POST", "/api/user/phone/request-otp", { phoneNumber: phone });
    },
    onSuccess: () => {
      setPendingPhone(newPhone);
      setStep("verify");
      toast({
        title: t.verificationCodeSent,
        description: t.verificationCodeSentDesc,
      });
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: parseOtpError(error),
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { newPhone: string; otpCode: string }) => {
      return apiRequest("POST", "/api/user/phone/verify-otp", { phoneNumber: data.newPhone, otp: data.otpCode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setStep("input");
      setNewPhone("");
      setOtpCode("");
      setPendingPhone("");
      setVerifyError("");
      toast({
        title: t.phoneNumberUpdated,
        description: t.phoneNumberUpdatedDesc,
      });
    },
    onError: (error: any) => {
      const msg = error?.message ?? "";
      if (msg.startsWith("503:") || msg.startsWith("429:")) {
        toast({
          title: t.verificationFailed,
          description: parseVerifyError(error),
          variant: "destructive",
        });
      } else {
        setVerifyError(parseVerifyError(error));
      }
    },
  });

  const handleRequestOtp = () => {
    if (!newPhone || newPhone.length < 10) {
      toast({
        title: t.invalidNumber,
        description: t.invalidNumberDesc,
        variant: "destructive",
      });
      return;
    }
    requestOtpMutation.mutate(newPhone);
  };

  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: t.invalidCode,
        description: t.invalidCodeDesc,
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate({ newPhone: pendingPhone, otpCode });
  };

  const formatPhone = (phone: string) => {
    if (!phone) return t.notSet;
    return phone.replace(/(\+27)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  };

  return (
    <div className="min-h-screen relative bg-black text-white">
      {/* Cosmic wordmark wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 12% 8%,  rgba(0,229,255,0.10) 0%, transparent 60%)," +
            "radial-gradient(ellipse 55% 45% at 88% 6%,  rgba(138,43,255,0.10) 0%, transparent 60%)," +
            "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(255,230,0,0.08) 0%, transparent 65%)," +
            "#000",
        }}
      />
      <div className="relative z-10">
        <header
          className="sticky top-0 z-50 bg-black/80"
          style={{ borderBottom: "1px solid rgba(0,229,255,0.35)" }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14 gap-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 4px #7FEFFF)" }} />
                <span className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: "#7FEFFF" }}>
                  {t.pageTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLanguage}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-black text-white hover:text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                  data-testid="button-language-toggle"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{language === "en" ? "EN" : "AF"}</span>
                </button>
                <Link href="/dashboard">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black font-black text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      color: "#7FEFFF",
                      border: "1px solid #7FEFFF",
                      boxShadow: "0 0 10px rgba(0,229,255,0.4)",
                    }}
                    data-testid="button-dashboard"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    {t.dashboardBtn}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          {/* ═══ Cinematic Hero ═══ */}
          <section
            className="relative overflow-hidden rounded-3xl bg-black p-6 sm:p-8"
            style={{
              border: "1.5px solid #7FEFFF",
              boxShadow:
                "0 0 0 1px rgba(0,229,255,0.32), 0 0 34px rgba(0,229,255,0.4), inset 0 0 28px rgba(0,0,0,0.6)",
            }}
          >
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, #FFC48F, #FFC48F, #FFF29E, #FFF29E, #7FEFFF, #6FA8FF, #C6A4FF, #C6A4FF, #FF9FE5)",
              }}
            />
            <div aria-hidden className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(0,229,255,0.28), transparent 70%)" }} />
            <div aria-hidden className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(138,43,255,0.22), transparent 70%)" }} />

            <span aria-hidden className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "#7FEFFF" }} />
            <span aria-hidden className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "#7FEFFF" }} />
            <span aria-hidden className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "#7FEFFF" }} />
            <span aria-hidden className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "#7FEFFF" }} />

            <div className="relative text-center space-y-4">
              <div className="relative mx-auto w-32 sm:w-40 aspect-square">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(0,229,255,0.55) 0%, rgba(138,43,255,0.35) 45%, transparent 75%)",
                  }}
                />
                <img
                  src={brainLogo}
                  alt="BrainTrack"
                  className="relative w-full h-full object-contain"
                  style={{ filter: "drop-shadow(0 0 22px rgba(0,229,255,0.5)) drop-shadow(0 0 12px rgba(255,43,214,0.45))" }}
                  data-testid="img-brain-logo"
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                  style={{ border: "1px solid #7FEFFF", boxShadow: "0 0 14px rgba(0,229,255,0.5)" }}
                >
                  <SlidersHorizontal className="w-3 h-3" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 4px #7FEFFF)" }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "#7FEFFF" }}>
                    {t.yourAccount}
                  </span>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-black"
                  style={{ border: "1px solid rgba(138,43,255,0.65)", boxShadow: "0 0 10px rgba(138,43,255,0.4)" }}
                >
                  <Shield className="w-3 h-3" style={{ color: "#C6A4FF", filter: "drop-shadow(0 0 4px #C6A4FF)" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#C6A4FF" }}>
                    {t.secure}
                  </span>
                </div>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-black tracking-tight leading-[0.98]"
                style={{
                  background:
                    "linear-gradient(90deg, #FFC48F, #FFF29E, #7FEFFF, #6FA8FF, #C6A4FF, #FF9FE5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 22px rgba(0,229,255,0.32))",
                }}
                data-testid="text-settings-title"
              >
                {t.heroHeading}
              </h1>
              <p className="text-white max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
                {t.heroSubtitle}
              </p>
            </div>
          </section>

        <div className="space-y-6">
          <NeonCard
            color="#7FEFFF"
            icon={Phone}
            title={t.phoneNumber}
            subtitle={user?.role === "learner" ? t.phoneLearnerSub : t.phoneParentSub}
          >
            <div className="space-y-4">
              <div
                className="p-3 rounded-xl bg-black"
                style={{ border: "1px solid rgba(0,229,255,0.35)" }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {t.currentNumber}
                </p>
                <p className="font-bold text-white mt-0.5" data-testid="text-current-phone">
                  {formatPhone(profile?.phone || "")}
                </p>
              </div>

              {user?.role === "learner" && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl bg-black"
                  style={{ border: "1px solid rgba(138,43,255,0.45)", boxShadow: "0 0 12px rgba(138,43,255,0.18)" }}
                  data-testid="phone-parent-lock"
                >
                  <Shield className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#C6A4FF", filter: "drop-shadow(0 0 4px rgba(138,43,255,0.7))" }} />
                  <div className="text-sm">
                    <p className="font-black uppercase tracking-[0.16em] text-[11px]" style={{ color: "#C6A4FF" }}>
                      {t.managedByParent}
                    </p>
                    <p className="text-white mt-0.5 leading-snug">
                      {t.managedByParentDesc}
                    </p>
                  </div>
                </div>
              )}

              {user?.role !== "learner" && step === "input" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPhone" className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      {t.newPhoneLabel}
                    </Label>
                    <Input
                      id="newPhone"
                      placeholder="+27 XX XXX XXXX"
                      value={newPhone}
                      onChange={(e) => setNewPhone(formatSAPhone(e.target.value))}
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={17}
                      className="bg-black text-white placeholder:text-white border-[#7FEFFF]/40 focus-visible:ring-[#7FEFFF]/50"
                      data-testid="input-new-phone"
                    />
                    <p className="text-[11px] text-white">
                      {t.newPhoneHint}
                    </p>
                  </div>

                  <div
                    className="flex items-start gap-3 p-3 rounded-xl bg-black"
                    style={{ border: "1px solid rgba(255,230,0,0.45)", boxShadow: "0 0 12px rgba(255,230,0,0.18)" }}
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#FFF29E", filter: "drop-shadow(0 0 4px rgba(255,230,0,0.7))" }} />
                    <div className="text-sm">
                      <p className="font-black uppercase tracking-[0.16em] text-[11px]" style={{ color: "#FFF29E" }}>
                        {t.verificationRequired}
                      </p>
                      <p className="text-white mt-0.5 leading-snug">
                        {t.verificationRequiredDesc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRequestOtp}
                    disabled={!newPhone || requestOtpMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black font-bold text-sm disabled:opacity-40"
                    style={{
                      color: "#7FEFFF",
                      border: "1.5px solid #7FEFFF",
                      boxShadow: "0 0 14px rgba(0,229,255,0.45)",
                      textShadow: "0 0 6px rgba(0,229,255,0.5)",
                    }}
                    data-testid="button-request-otp"
                  >
                    {requestOtpMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.sendingCode}
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        {t.sendVerificationCode}
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === "verify" && (
                <div className="space-y-4">
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl bg-black"
                    style={{ border: "1px solid rgba(0,229,255,0.45)", boxShadow: "0 0 12px rgba(0,229,255,0.22)" }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 4px rgba(0,229,255,0.7))" }} />
                    <p className="text-sm text-white">
                      {t.codeSentTo}{" "}
                      <strong style={{ color: "#7FEFFF" }}>{pendingPhone}</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otpCode" className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      {t.verificationCodeLabel}
                    </Label>
                    <Input
                      id="otpCode"
                      placeholder={t.verificationCodePlaceholder}
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                        if (verifyError) setVerifyError("");
                      }}
                      maxLength={6}
                      className={`text-center text-2xl tracking-[0.4em] bg-black text-white placeholder:text-white font-black focus-visible:ring-[#7FEFFF]/50 ${verifyError ? "border-red-500/70" : "border-[#7FEFFF]/50"}`}
                      data-testid="input-otp-code"
                    />
                    {verifyError && (
                      <p className="text-xs font-bold text-red-400 mt-1" role="alert" data-testid="otp-verify-error">
                        {verifyError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setStep("input");
                        setOtpCode("");
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-black font-bold text-sm text-white hover:text-white"
                      style={{ border: "1px solid #fff" }}
                      data-testid="button-cancel-verify"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={otpCode.length !== 6 || verifyOtpMutation.isPending}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black font-bold text-sm disabled:opacity-40"
                      style={{
                        color: "#7FEFFF",
                        border: "1.5px solid #7FEFFF",
                        boxShadow: "0 0 14px rgba(0,229,255,0.45)",
                        textShadow: "0 0 6px rgba(0,229,255,0.5)",
                      }}
                      data-testid="button-verify-otp"
                    >
                      {verifyOtpMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t.verifying}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {t.verifyAndUpdate}
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => requestOtpMutation.mutate(pendingPhone)}
                    disabled={requestOtpMutation.isPending}
                    className="w-full text-xs font-bold text-white hover:text-white py-2 disabled:opacity-40 underline underline-offset-2"
                    data-testid="button-resend-otp"
                  >
                    {t.resendCode}
                  </button>
                </div>
              )}
            </div>
          </NeonCard>

          <NeonCard
            color="#6FA8FF"
            icon={BookOpen}
            title={t.yourSubjects}
            subtitle={t.yourSubjectsSubtitle}
          >
              {(() => {
                const canSave = selectedSubjects.length >= 4 && isDirty && !updateSubjectsMutation.isPending;

                return (
                  <div className="space-y-3">
                    {(subjects || []).length === 0 ? (
                      <div className="text-center py-6">
                        <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: "#6FA8FF" }} />
                        <p className="text-sm text-white">
                          {t.loadingSubjects}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(subjects || []).map((subject) => {
                          const active = selectedSubjects.includes(subject.id);
                          return (
                            <button
                              key={subject.id}
                              type="button"
                              onClick={() => toggleSubject(subject.id)}
                              className="flex items-center gap-3 p-3 rounded-xl bg-black text-left transition-all"
                              style={{
                                border: active ? "1.5px solid #6FA8FF" : "1px solid rgba(255,255,255,0.12)",
                                boxShadow: active ? "0 0 14px rgba(0,107,255,0.35), inset 0 0 10px rgba(0,107,255,0.12)" : "none",
                              }}
                              data-testid={`subject-chip-${subject.id}`}
                            >
                              <div
                                className="w-7 h-7 rounded-lg bg-black flex items-center justify-center shrink-0"
                                style={{ border: active ? "1.5px solid #6FA8FF" : "1px solid rgba(255,255,255,0.18)" }}
                              >
                                {active ? (
                                  <Check className="w-3.5 h-3.5" style={{ color: "#6FA8FF" }} />
                                ) : (
                                  <span className="text-[11px] font-black text-white">
                                    {(isAf ? subject.nameAfrikaans : subject.name).charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-white truncate">
                                  {isAf ? subject.nameAfrikaans : subject.name}
                                </p>
                                <p className="text-[10px] text-white">{subject.category}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] text-white">
                        {selectedSubjects.length < 4
                          ? `${t.selectAtLeast4} (${selectedSubjects.length}/4)`
                          : `${selectedSubjects.length} ${t.subjectsSelectedLabel}`}
                      </p>
                      <Button
                        type="button"
                        onClick={() => updateSubjectsMutation.mutate(selectedSubjects)}
                        disabled={!canSave}
                        className="h-8 px-4 text-[11px] font-black uppercase tracking-[0.18em] bg-black border disabled:opacity-40"
                        style={{
                          color: canSave ? "#6FA8FF" : "#fff",
                          borderColor: canSave ? "#6FA8FF" : "rgba(255,255,255,0.18)",
                          boxShadow: canSave ? "0 0 12px rgba(0,107,255,0.4)" : "none",
                        }}
                        data-testid="button-save-subjects"
                      >
                        {updateSubjectsMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-3 h-3 mr-1.5" />
                            {t.save}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })()}
          </NeonCard>

          {/* Preliminary Exam Dates — Task #359 */}
          <NeonCard
            color="#7FEFFF"
            icon={CalendarDays}
            title={t.prelimDates}
            subtitle={t.prelimDatesSubtitle}
            testId="card-prelim-exams"
          >
            {(() => {
              const selectedSubjectsList = (subjects || []).filter(s =>
                (onboarding?.selectedSubjects || []).includes(s.id),
              );

              if (selectedSubjectsList.length === 0) {
                return (
                  <div className="text-center py-6">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2" style={{ color: "#7FEFFF" }} />
                    <p className="text-sm text-white">
                      {t.selectSubjectsFirst}
                    </p>
                  </div>
                );
              }

              const hasSchoolPushed = (prelimData?.exams || []).some(e => e.source === "school");

              return (
                <div className="space-y-3">
                  {hasSchoolPushed && (
                    <div
                      className="rounded-xl bg-black px-3 py-2 text-[11px] text-white"
                      style={{ border: "1px solid rgba(0,229,255,0.30)" }}
                    >
                      {t.schoolPushedNotice}
                    </div>
                  )}
                  <div className="space-y-3">
                    {selectedSubjectsList.map(subject => {
                      const p1Key = `${subject.id}:1`;
                      const p2Key = `${subject.id}:2`;
                      const p1 = prelimDates[p1Key] || "";
                      const p2 = prelimDates[p2Key] || "";
                      return (
                        <div
                          key={subject.id}
                          className="rounded-xl bg-black p-3"
                          style={{ border: "1px solid rgba(0,229,255,0.20)" }}
                          data-testid={`prelim-row-${subject.id}`}
                        >
                          <p className="text-sm font-bold text-white mb-2">
                            {isAf ? subject.nameAfrikaans : subject.name}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                                {t.paper1}
                              </span>
                              <Input
                                type="date"
                                min="2026-07-01"
                                max="2026-10-15"
                                value={p1}
                                onChange={(e) => setPrelimDate(subject.id, 1, e.target.value)}
                                className="mt-1 h-9 bg-black border-white/15 text-white text-xs"
                                data-testid={`prelim-${subject.id}-p1`}
                              />
                            </label>
                            <label className="block">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                                {t.paper2}
                              </span>
                              <Input
                                type="date"
                                min="2026-07-01"
                                max="2026-10-15"
                                value={p2}
                                onChange={(e) => setPrelimDate(subject.id, 2, e.target.value)}
                                className="mt-1 h-9 bg-black border-white/15 text-white text-xs"
                                data-testid={`prelim-${subject.id}-p2`}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-white">
                      {Object.values(prelimDates).filter(Boolean).length} {t.datesSet}
                    </p>
                    <Button
                      type="button"
                      onClick={savePrelims}
                      disabled={!prelimDirty || updatePrelimsMutation.isPending}
                      className="h-8 px-4 text-[11px] font-black uppercase tracking-[0.18em] bg-black border disabled:opacity-40"
                      style={{
                        color: prelimDirty ? "#7FEFFF" : "#fff",
                        borderColor: prelimDirty ? "#7FEFFF" : "rgba(255,255,255,0.18)",
                        boxShadow: prelimDirty ? "0 0 12px rgba(0,229,255,0.4)" : "none",
                      }}
                      data-testid="button-save-prelims"
                    >
                      {updatePrelimsMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-3 h-3 mr-1.5" />
                          {t.save}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </NeonCard>

          {/* Referral Link Card — learner only */}
          {user?.role === "learner" && (
            <NeonCard
              color="#FF9FE5"
              icon={Gift}
              title={t.referAFriend}
              subtitle={t.referAFriendSubtitle}
              testId="card-referral"
            >
              {/* Referral code hero */}
              <div
                className="relative rounded-2xl bg-black px-4 py-5 text-center overflow-hidden"
                style={{
                  border: "1.5px solid #FF9FE5",
                  boxShadow: "0 0 0 1px rgba(255,43,214,0.25), 0 0 22px rgba(255,43,214,0.35), inset 0 0 14px rgba(0,0,0,0.55)",
                }}
              >
                <span aria-hidden className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: "#FF9FE5" }} />
                <span aria-hidden className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: "#FF9FE5" }} />
                <span aria-hidden className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: "#FF9FE5" }} />
                <span aria-hidden className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: "#FF9FE5" }} />

                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white">
                  {t.yourReferralCode}
                </p>
                <p
                  className="mt-1.5 font-mono font-black text-2xl sm:text-3xl tracking-[0.18em]"
                  style={{ color: "#FF9FE5", textShadow: "0 0 12px rgba(255,43,214,0.75)" }}
                  data-testid="text-referral-code"
                >
                  {referral?.code ?? "········"}
                </p>
              </div>

              {/* Full link row */}
              <div
                className="rounded-xl bg-black px-3 py-2.5"
                style={{ border: "1px solid rgba(255,43,214,0.3)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-1">
                  {t.yourReferralLink}
                </p>
                <p
                  className="text-xs font-mono text-white truncate"
                  title={referral?.link ?? ""}
                  data-testid="text-referral-link"
                >
                  {referral?.link ?? t.loading}
                </p>
              </div>

              {/* Copy button — full width neon */}
              <button
                onClick={copyReferralLink}
                disabled={!referral}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black font-bold text-sm disabled:opacity-40"
                style={{
                  color: "#FF9FE5",
                  border: "1.5px solid #FF9FE5",
                  boxShadow: "0 0 14px rgba(255,43,214,0.45)",
                  textShadow: "0 0 6px rgba(255,43,214,0.5)",
                }}
                data-testid="button-copy-referral"
              >
                {linkCopied
                  ? <><Check className="w-4 h-4" />{t.copied}</>
                  : <><Copy className="w-4 h-4" />{t.copyLink}</>}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-black overflow-hidden" style={{ border: "1px solid rgba(255,43,214,0.3)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((referral?.thisMonthCount ?? 0) / (referral?.maxPerMonth ?? 2)) * 100}%`,
                      background: "#FF9FE5",
                      boxShadow: "0 0 10px rgba(255,43,214,0.6)",
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-white whitespace-nowrap" data-testid="text-referral-count">
                  {referral?.thisMonthCount ?? 0} / {referral?.maxPerMonth ?? 2}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black text-center" style={{ border: "1px solid rgba(255,43,214,0.3)" }}>
                  <Users className="w-5 h-5 mx-auto mb-1" style={{ color: "#FF9FE5" }} />
                  <p className="text-lg font-bold text-white">{referral?.thisMonthCount ?? 0}</p>
                  <p className="text-[10px] text-white">{t.thisMonth}</p>
                </div>
                <div className="p-3 rounded-xl bg-black text-center" style={{ border: "1px solid rgba(255,230,0,0.3)" }}>
                  <Gift className="w-5 h-5 mx-auto mb-1" style={{ color: "#FFF29E" }} />
                  <p className="text-lg font-bold text-white">{(referral?.maxPerMonth ?? 2) - (referral?.thisMonthCount ?? 0)}</p>
                  <p className="text-[10px] text-white">{t.slotsLeft}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/60 flex items-start gap-2" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <p className="text-xs text-white leading-snug">
                  {t.referralDisclaimer}
                </p>
              </div>
            </NeonCard>
          )}

          <NeonCard
            color="#FFF29E"
            icon={Dumbbell}
            title={t.sportActivities}
            subtitle={t.sportActivitiesSubtitle}
            testId="card-activities"
          >
            <div className="flex gap-2">
              <Input
                placeholder={t.activityPlaceholder}
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newActivity.trim()) {
                    setActivities([...activities, newActivity.trim()]);
                    setNewActivity("");
                  }
                }}
                className="bg-black border-[#FFF29E]/40 text-white placeholder:text-white focus-visible:ring-[#FFF29E]/50"
                data-testid="input-new-activity"
              />
              <button
                onClick={() => {
                  if (newActivity.trim()) {
                    setActivities([...activities, newActivity.trim()]);
                    setNewActivity("");
                  }
                }}
                disabled={!newActivity.trim()}
                className="shrink-0 w-10 h-10 rounded-md bg-black flex items-center justify-center disabled:opacity-50"
                style={{ color: "#FFF29E", border: "1.5px solid #FFF29E", boxShadow: "0 0 10px rgba(255,230,0,0.28)" }}
                data-testid="button-add-activity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {activities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activities.map((activity, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 py-1.5 px-3 text-sm rounded-full bg-black text-white"
                    style={{ border: "1px solid rgba(255,230,0,0.5)" }}
                    data-testid={`activity-badge-${idx}`}
                  >
                    <Dumbbell className="w-3 h-3" style={{ color: "#FFF29E" }} />
                    {activity}
                    <button
                      onClick={() => setActivities(activities.filter((_, i) => i !== idx))}
                      className="ml-1 text-white hover:text-white"
                      data-testid={`button-remove-activity-${idx}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {activities.length === 0 && (
              <div className="text-center py-4 text-white">
                <Dumbbell className="w-8 h-8 mx-auto mb-2" style={{ color: "#FFF29E" }} />
                <p className="text-sm">{t.noActivities}</p>
              </div>
            )}

            <button
              onClick={() => {
                toast({ title: t.activitiesSaved, description: `${activities.length} ${t.activitiesSavedDesc}` });
              }}
              disabled={activities.length === 0}
              className="px-4 py-2 rounded-xl bg-black font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ color: "#FFF29E", border: "1.5px solid #FFF29E", boxShadow: "0 0 12px rgba(255,230,0,0.28)" }}
              data-testid="button-save-activities"
            >
              <Save className="w-4 h-4" />
              {t.saveActivities} ({activities.length})
            </button>
          </NeonCard>
        </div>

        </main>
      </div>
    </div>
  );
}
