import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import { formatSAPhone } from "@/lib/utils";
import {
  Phone,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Save,
  Gift,
  Copy,
  Check,
  Users,
  Globe,
  SlidersHorizontal,
  CalendarDays,
  UserRound,
  LogOut,
  GraduationCap,
  KeyRound,
} from "lucide-react";
import { LearnerHeader } from "@/components/learner-header";
import { GraffitiSplats } from "@/components/graffiti-splats";
import type { Subject, OnboardingResult } from "@shared/schema";

/* ── Street-pastel section card ──────────────────────────────────────────
   Executive card on the #050508 wall: soft glass body, pastel accent bar,
   icon chip and a Permanent Marker eyebrow. Poppins everywhere else. */
type PastelHex = "#9FF5E8" | "#9FD8FF" | "#FFB7E5" | "#C5B3FF" | "#FFE29A" | "#94F7C5";

function SectionCard({ color, icon: Icon, eyebrow, title, subtitle, children, testId, delay = 0 }: {
  color: PastelHex;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  testId?: string;
  delay?: number;
}) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 22,
        animation: `bt-fadeup .5s cubic-bezier(.22,1,.36,1) ${delay}s both`,
      }}
      data-testid={testId}
    >
      {/* Pastel accent bar */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} />
      {/* Soft aura */}
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-20" style={{ background: color }} />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start gap-3.5 mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(5,5,8,.6)", border: `1px solid ${color}` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="min-w-0">
            <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color, transform: "rotate(-1.5deg)", display: "inline-block" }}>
              {eyebrow}
            </div>
            <div role="heading" aria-level={2} className="text-lg font-black text-white leading-tight">
              {title}
            </div>
            {subtitle && <p className="text-xs text-white mt-0.5 leading-snug" style={{ opacity: 0.85 }}>{subtitle}</p>}
          </div>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </section>
  );
}

/* Shared field styling — guideline inputs */
const fieldClass =
  "text-white placeholder:text-white rounded-xl focus-visible:ring-[#9FF5E8]/40 focus-visible:border-[#9FF5E8]";
const fieldStyle: React.CSSProperties = {
  background: "rgba(5,5,8,.6)",
  border: "1.5px solid rgba(255,255,255,.18)",
};

function PrimaryButton({ children, testId, onClick, disabled, full }: {
  children: React.ReactNode;
  testId?: string;
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`${full ? "w-full " : ""}inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40`}
      style={{
        background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
        color: "#050508",
        border: "none",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, testId, onClick, disabled, color = "#ffffff", full }: {
  children: React.ReactNode;
  testId?: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`${full ? "w-full " : ""}inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-40`}
      style={{
        background: "transparent",
        color,
        border: color === "#ffffff" ? "1.5px solid rgba(255,255,255,.2)" : `1.5px solid ${color}`,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
    >
      {children}
    </button>
  );
}

const T = {
  en: {
    pageTitle: "Settings",
    dashboardBtn: "Home",
    yourAccount: "Your Account",
    secure: "Secure",
    heroEyebrow: "Your space, your rules",
    heroHeading: "Settings",
    heroSubtitle: "Your profile, subjects, prelim dates and account — all in one place.",
    profileEyebrow: "This is you",
    profileTitle: "Profile",
    profileSubtitle: "Your details on BrainTrack",
    nameLabel: "Name",
    gradeLabel: "Grade",
    schoolLabel: "School",
    learnerRole: "Learner",
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
    subjectsEyebrow: "Your line-up",
    yourSubjects: "Your Subjects",
    yourSubjectsSubtitle: "Tap to add or remove subjects (once per week)",
    loadingSubjects: "Loading subjects...",
    save: "Save",
    prelimEyebrow: "Big dates",
    prelimDates: "Preliminary Exam Dates",
    prelimDatesSubtitle: "Enter your school's prelim dates (Aug–Sep). Schools differ — this is optional.",
    selectSubjectsFirst: "Select your subjects above first.",
    schoolPushedNotice: "Your school has pushed a prelim timetable. Change a date below to override it for yourself.",
    paper1: "Paper 1",
    paper2: "Paper 2",
    datesSet: "dates set",
    languageEyebrow: "Praat jou taal",
    languageTitle: "Language",
    languageSubtitle: "Choose the language BrainTrack speaks to you in",
    langEnglish: "English",
    langAfrikaans: "Afrikaans",
    langActive: "Active",
    referralEyebrow: "Squad goals",
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
    accountEyebrow: "Locked in",
    accountTitle: "Account",
    accountSubtitle: "Sign-in details and session",
    emailLabel: "Email",
    roleLabel: "Role",
    signOut: "Sign Out",
    changePassword: "Change Password",
    currentPasswordLabel: "Current password",
    newPasswordLabel: "New password",
    confirmPasswordLabel: "Confirm new password",
    newPasswordHint: "At least 10 characters.",
    passwordMismatch: "Passwords don't match",
    passwordMismatchDesc: "Your new password and the confirmation must be the same.",
    savePassword: "Update Password",
    savingPassword: "Updating…",
    passwordChanged: "Password Updated",
    passwordChangedDesc: "Use your new password next time you sign in.",
    passwordChangeFailed: "Could Not Update Password",
    cancelPassword: "Cancel",
    selectAtLeast4: "Select at least 4 subjects",
    subjectsSelectedLabel: "subjects selected",
  },
  af: {
    pageTitle: "Instellings",
    dashboardBtn: "Tuis",
    yourAccount: "Jou Rekening",
    secure: "Veilig",
    heroEyebrow: "Jou spasie, jou reëls",
    heroHeading: "Instellings",
    heroSubtitle: "Jou profiel, vakke, vooreksamendatums en rekening — alles op een plek.",
    profileEyebrow: "Dis jy dié",
    profileTitle: "Profiel",
    profileSubtitle: "Jou besonderhede op BrainTrack",
    nameLabel: "Naam",
    gradeLabel: "Graad",
    schoolLabel: "Skool",
    learnerRole: "Leerder",
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
    subjectsEyebrow: "Jou span",
    yourSubjects: "Jou Vakke",
    yourSubjectsSubtitle: "Tik om vakke by te voeg of te verwyder (een keer per week)",
    loadingSubjects: "Vakke laai...",
    save: "Stoor",
    prelimEyebrow: "Groot datums",
    prelimDates: "Vooreksamendatums",
    prelimDatesSubtitle: "Vul jou skool se vooreksamendatums in (Aug–Sep). Skole se datums verskil — dit is opsioneel.",
    selectSubjectsFirst: "Kies eers jou vakke hierbo.",
    schoolPushedNotice: "Jou skool het 'n vooreksamen-skedule gestuur. Verander 'n datum hieronder om dit vir jou eie te oorskryf.",
    paper1: "Vraestel 1",
    paper2: "Vraestel 2",
    datesSet: "datums ingevul",
    languageEyebrow: "Speak your language",
    languageTitle: "Taal",
    languageSubtitle: "Kies die taal waarin BrainTrack met jou praat",
    langEnglish: "Engels",
    langAfrikaans: "Afrikaans",
    langActive: "Aktief",
    referralEyebrow: "Bring jou tjommies",
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
    accountEyebrow: "Veilig gebêre",
    accountTitle: "Rekening",
    accountSubtitle: "Aanmeldbesonderhede en sessie",
    emailLabel: "E-pos",
    roleLabel: "Rol",
    signOut: "Teken Uit",
    changePassword: "Verander Wagwoord",
    currentPasswordLabel: "Huidige wagwoord",
    newPasswordLabel: "Nuwe wagwoord",
    confirmPasswordLabel: "Bevestig nuwe wagwoord",
    newPasswordHint: "Ten minste 10 karakters.",
    passwordMismatch: "Wagwoorde stem nie ooreen nie",
    passwordMismatchDesc: "Jou nuwe wagwoord en die bevestiging moet dieselfde wees.",
    savePassword: "Dateer Wagwoord Op",
    savingPassword: "Dateer op…",
    passwordChanged: "Wagwoord Opgedateer",
    passwordChangedDesc: "Gebruik jou nuwe wagwoord wanneer jy weer aanmeld.",
    passwordChangeFailed: "Kon Nie Wagwoord Opdateer Nie",
    cancelPassword: "Kanselleer",
    selectAtLeast4: "Kies minstens 4 vakke",
    subjectsSelectedLabel: "vakke gekies",
  },
} as const;

export default function SettingsPage() {
  const { user, logout } = useAuth();
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
  const [linkCopied, setLinkCopied] = useState(false);
  // Prelim exam dates (Task #359): keyed by `${subjectId}:${paperNumber}` → YYYY-MM-DD
  const [prelimDates, setPrelimDates] = useState<Record<string, string>>({});
  const [prelimDirty, setPrelimDirty] = useState(false);
  // Change password (launch flow — parent-created learners rotate their
  // handed-over starter password here; any local-auth account can use it).
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || "Could not change the password.");
      return body;
    },
    onSuccess: () => {
      toast({ title: t.passwordChanged, description: t.passwordChangedDesc });
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => {
      toast({ title: t.passwordChangeFailed, description: err.message, variant: "destructive" });
    },
  });

  const canSubmitPassword =
    currentPassword.length >= 1 &&
    newPassword.length >= 10 &&
    confirmPassword.length >= 10 &&
    !changePasswordMutation.isPending;

  const submitPasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: t.passwordMismatch, description: t.passwordMismatchDesc, variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate();
  };

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

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "—";

  return (
    <div className="min-h-screen relative text-white overflow-x-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      {/* Ambient pastel auras on the wall */}
      <div aria-hidden className="pointer-events-none fixed -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-30" style={{ background: "#9FF5E8" }} />
      <div aria-hidden className="pointer-events-none fixed top-1/3 -right-24 w-[380px] h-[380px] rounded-full blur-[120px] opacity-25" style={{ background: "#C5B3FF" }} />
      <div aria-hidden className="pointer-events-none fixed -bottom-24 left-1/4 w-[360px] h-[360px] rounded-full blur-[120px] opacity-20" style={{ background: "#FFB7E5" }} />
      <GraffitiSplats variant="full" opacity={0.5} />

      <div className="relative z-10">
        {/* ── Sticky street header ── */}
        <LearnerHeader
          backLabel={t.dashboardBtn}
          title={t.pageTitle}
          maxWidthClassName="max-w-3xl"
        />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          {/* ── Hero ── */}
          <section className="relative mb-2" style={{ animation: "bt-fadeup .5s cubic-bezier(.22,1,.36,1) both" }}>
            <div className="inline-flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4" style={{ color: "#9FF5E8" }} />
              <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#9FF5E8", transform: "rotate(-2deg)", display: "inline-block" }}>
                {t.heroEyebrow}
              </span>
            </div>
            <div
              role="heading"
              aria-level={1}
              className="font-black leading-[0.95] tracking-tight text-4xl sm:text-5xl"
              style={{
                backgroundImage: "linear-gradient(90deg, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
              data-testid="text-settings-title"
            >
              {t.heroHeading}
            </div>
            <p className="text-white text-sm sm:text-base mt-3 max-w-xl" style={{ opacity: 0.9 }}>
              {t.heroSubtitle}
            </p>
          </section>

          {/* ── Profile ── */}
          <SectionCard
            color="#9FF5E8"
            icon={UserRound}
            eyebrow={t.profileEyebrow}
            title={t.profileTitle}
            subtitle={t.profileSubtitle}
            testId="card-profile"
            delay={0.05}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl" style={{ background: "rgba(5,5,8,.6)", border: "1px solid rgba(255,255,255,.1)" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ opacity: 0.82 }}>{t.nameLabel}</p>
                <p className="font-bold text-white mt-0.5 truncate" data-testid="text-profile-name">{displayName}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(5,5,8,.6)", border: "1px solid rgba(255,255,255,.1)" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ opacity: 0.82 }}>{t.gradeLabel}</p>
                <p className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" style={{ color: "#9FF5E8" }} />
                  {user?.grade ? `${isAf ? "Graad" : "Grade"} ${user.grade}` : "Matric"}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(5,5,8,.6)", border: "1px solid rgba(255,255,255,.1)" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ opacity: 0.82 }}>{t.schoolLabel}</p>
                <p className="font-bold text-white mt-0.5 truncate">{user?.schoolName || "—"}</p>
              </div>
            </div>

            {/* Phone number block */}
            <div className="pt-1 space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: "#9FF5E8" }} />
                <p className="text-sm font-black text-white">{t.phoneNumber}</p>
                <p className="text-[11px] text-white" style={{ opacity: 0.82 }}>
                  · {user?.role === "learner" ? t.phoneLearnerSub : t.phoneParentSub}
                </p>
              </div>

              <div className="p-3 rounded-xl" style={{ background: "rgba(5,5,8,.6)", border: "1px solid rgba(159,245,232,.35)" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ opacity: 0.82 }}>
                  {t.currentNumber}
                </p>
                <p className="font-bold text-white mt-0.5" data-testid="text-current-phone">
                  {formatPhone(profile?.phone || "")}
                </p>
              </div>

              {user?.role === "learner" && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(197,179,255,.06)", border: "1px solid rgba(197,179,255,.4)" }}
                  data-testid="phone-parent-lock"
                >
                  <Shield className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#C5B3FF" }} />
                  <div className="text-sm">
                    <p className="font-black uppercase tracking-[0.16em] text-[11px]" style={{ color: "#C5B3FF" }}>
                      {t.managedByParent}
                    </p>
                    <p className="text-white mt-0.5 leading-snug" style={{ opacity: 0.9 }}>
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
                      className={fieldClass}
                      style={fieldStyle}
                      data-testid="input-new-phone"
                    />
                    <p className="text-[11px] text-white" style={{ opacity: 0.82 }}>
                      {t.newPhoneHint}
                    </p>
                  </div>

                  <div
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,226,154,.06)", border: "1px solid rgba(255,226,154,.4)" }}
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#FFE29A" }} />
                    <div className="text-sm">
                      <p className="font-black uppercase tracking-[0.16em] text-[11px]" style={{ color: "#FFE29A" }}>
                        {t.verificationRequired}
                      </p>
                      <p className="text-white mt-0.5 leading-snug" style={{ opacity: 0.9 }}>
                        {t.verificationRequiredDesc}
                      </p>
                    </div>
                  </div>

                  <PrimaryButton
                    onClick={handleRequestOtp}
                    disabled={!newPhone || requestOtpMutation.isPending}
                    testId="button-request-otp"
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
                  </PrimaryButton>
                </div>
              )}

              {step === "verify" && (
                <div className="space-y-4">
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: "rgba(159,245,232,.06)", border: "1px solid rgba(159,245,232,.4)" }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: "#9FF5E8" }} />
                    <p className="text-sm text-white">
                      {t.codeSentTo}{" "}
                      <strong style={{ color: "#9FF5E8" }}>{pendingPhone}</strong>
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
                      className={`text-center text-2xl tracking-[0.4em] font-black ${fieldClass}`}
                      style={{ ...fieldStyle, borderColor: verifyError ? "rgba(255,141,161,.7)" : "rgba(255,255,255,.18)" }}
                      data-testid="input-otp-code"
                    />
                    {verifyError && (
                      <p className="text-xs font-bold mt-1" style={{ color: "#FF8DA1" }} role="alert" data-testid="otp-verify-error">
                        {verifyError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <GhostButton
                      onClick={() => {
                        setStep("input");
                        setOtpCode("");
                      }}
                      color="#C5B3FF"
                      testId="button-cancel-verify"
                    >
                      {t.cancel}
                    </GhostButton>
                    <PrimaryButton
                      onClick={handleVerifyOtp}
                      disabled={otpCode.length !== 6 || verifyOtpMutation.isPending}
                      testId="button-verify-otp"
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
                    </PrimaryButton>
                  </div>

                  <GhostButton
                    onClick={() => requestOtpMutation.mutate(pendingPhone)}
                    disabled={requestOtpMutation.isPending}
                    color="#9FF5E8"
                    full
                    testId="button-resend-otp"
                  >
                    {t.resendCode}
                  </GhostButton>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Subjects ── */}
          <SectionCard
            color="#9FD8FF"
            icon={BookOpen}
            eyebrow={t.subjectsEyebrow}
            title={t.yourSubjects}
            subtitle={t.yourSubjectsSubtitle}
            testId="card-subjects"
            delay={0.1}
          >
            {(() => {
              const canSave = selectedSubjects.length >= 4 && isDirty && !updateSubjectsMutation.isPending;

              return (
                <div className="space-y-3">
                  {(subjects || []).length === 0 ? (
                    <div className="text-center py-6">
                      <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: "#9FD8FF" }} />
                      <p className="text-sm text-white" style={{ opacity: 0.85 }}>
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
                            className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                            style={{
                              background: active ? "rgba(159,216,255,.08)" : "rgba(255,255,255,.03)",
                              border: active ? "1.5px solid #9FD8FF" : "1px solid rgba(255,255,255,.1)",
                            }}
                            data-testid={`subject-chip-${subject.id}`}
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background: "rgba(5,5,8,.6)",
                                border: active ? "1.5px solid #9FD8FF" : "1px solid rgba(255,255,255,.18)",
                              }}
                            >
                              {active ? (
                                <Check className="w-3.5 h-3.5" style={{ color: "#9FD8FF" }} />
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
                              <p className="text-[10px] text-white" style={{ opacity: 0.82 }}>{subject.category}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-white" style={{ opacity: 0.85 }}>
                      {selectedSubjects.length < 4
                        ? `${t.selectAtLeast4} (${selectedSubjects.length}/4)`
                        : `${selectedSubjects.length} ${t.subjectsSelectedLabel}`}
                    </p>
                    <PrimaryButton
                      onClick={() => updateSubjectsMutation.mutate(selectedSubjects)}
                      disabled={!canSave}
                      testId="button-save-subjects"
                    >
                      {updateSubjectsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {t.save}
                        </>
                      )}
                    </PrimaryButton>
                  </div>
                </div>
              );
            })()}
          </SectionCard>

          {/* ── Preliminary Exam Dates — Task #359 ── */}
          <SectionCard
            color="#C5B3FF"
            icon={CalendarDays}
            eyebrow={t.prelimEyebrow}
            title={t.prelimDates}
            subtitle={t.prelimDatesSubtitle}
            testId="card-prelim-exams"
            delay={0.15}
          >
            {(() => {
              const selectedSubjectsList = (subjects || []).filter(s =>
                (onboarding?.selectedSubjects || []).includes(s.id),
              );

              if (selectedSubjectsList.length === 0) {
                return (
                  <div className="text-center py-6">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2" style={{ color: "#C5B3FF" }} />
                    <p className="text-sm text-white" style={{ opacity: 0.85 }}>
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
                      className="rounded-xl px-3 py-2 text-[11px] text-white"
                      style={{ background: "rgba(197,179,255,.06)", border: "1px solid rgba(197,179,255,.3)" }}
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
                          className="rounded-xl p-3"
                          style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(197,179,255,.22)" }}
                          data-testid={`prelim-row-${subject.id}`}
                        >
                          <p className="text-sm font-bold text-white mb-2">
                            {isAf ? subject.nameAfrikaans : subject.name}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white" style={{ opacity: 0.85 }}>
                                {t.paper1}
                              </span>
                              <Input
                                type="date"
                                min="2026-07-01"
                                max="2026-10-15"
                                value={p1}
                                onChange={(e) => setPrelimDate(subject.id, 1, e.target.value)}
                                className={`mt-1 h-11 text-sm ${fieldClass}`}
                                style={fieldStyle}
                                data-testid={`prelim-${subject.id}-p1`}
                              />
                            </label>
                            <label className="block">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white" style={{ opacity: 0.85 }}>
                                {t.paper2}
                              </span>
                              <Input
                                type="date"
                                min="2026-07-01"
                                max="2026-10-15"
                                value={p2}
                                onChange={(e) => setPrelimDate(subject.id, 2, e.target.value)}
                                className={`mt-1 h-11 text-sm ${fieldClass}`}
                                style={fieldStyle}
                                data-testid={`prelim-${subject.id}-p2`}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-white" style={{ opacity: 0.85 }}>
                      {Object.values(prelimDates).filter(Boolean).length} {t.datesSet}
                    </p>
                    <PrimaryButton
                      onClick={savePrelims}
                      disabled={!prelimDirty || updatePrelimsMutation.isPending}
                      testId="button-save-prelims"
                    >
                      {updatePrelimsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {t.save}
                        </>
                      )}
                    </PrimaryButton>
                  </div>
                </div>
              );
            })()}
          </SectionCard>

          {/* ── Language ── */}
          <SectionCard
            color="#FFE29A"
            icon={Globe}
            eyebrow={t.languageEyebrow}
            title={t.languageTitle}
            subtitle={t.languageSubtitle}
            testId="card-language"
            delay={0.2}
          >
            <div className="grid grid-cols-2 gap-3">
              {([
                { code: "en" as const, label: t.langEnglish, flagLetters: "EN" },
                { code: "af" as const, label: t.langAfrikaans, flagLetters: "AF" },
              ]).map(opt => {
                const active = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => { if (!active) toggleLanguage(); }}
                    className="relative p-4 rounded-xl text-left transition-all"
                    style={{
                      background: active ? "rgba(255,226,154,.08)" : "rgba(255,255,255,.03)",
                      border: active ? "1.5px solid #FFE29A" : "1px solid rgba(255,255,255,.1)",
                    }}
                    data-testid={`language-option-${opt.code}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{
                          background: "rgba(5,5,8,.6)",
                          border: active ? "1.5px solid #FFE29A" : "1px solid rgba(255,255,255,.18)",
                          color: active ? "#FFE29A" : "#ffffff",
                        }}
                      >
                        {opt.flagLetters}
                      </span>
                      {active && (
                        <span
                          className="text-[9px] font-black uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                          style={{ color: "#FFE29A", border: "1px solid rgba(255,226,154,.55)", background: "rgba(255,226,154,.1)" }}
                        >
                          {t.langActive}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-white mt-2.5">{opt.label}</p>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Refer a Friend — learner only ── */}
          {user?.role === "learner" && (
            <SectionCard
              color="#FFB7E5"
              icon={Gift}
              eyebrow={t.referralEyebrow}
              title={t.referAFriend}
              subtitle={t.referAFriendSubtitle}
              testId="card-referral"
              delay={0.25}
            >
              {/* Referral code hero */}
              <div
                className="relative rounded-2xl px-4 py-5 text-center overflow-hidden"
                style={{
                  background: "rgba(5,5,8,.6)",
                  border: "1.5px solid #FFB7E5",
                }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white" style={{ opacity: 0.85 }}>
                  {t.yourReferralCode}
                </p>
                <p
                  className="mt-1.5 font-mono font-black text-2xl sm:text-3xl tracking-[0.18em]"
                  style={{ color: "#FFB7E5" }}
                  data-testid="text-referral-code"
                >
                  {referral?.code ?? "········"}
                </p>
              </div>

              {/* Full link row */}
              <div
                className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,183,229,.3)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-1" style={{ opacity: 0.85 }}>
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

              <GhostButton
                onClick={copyReferralLink}
                disabled={!referral}
                color="#FFB7E5"
                full
                testId="button-copy-referral"
              >
                {linkCopied
                  ? <><Check className="w-4 h-4" />{t.copied}</>
                  : <><Copy className="w-4 h-4" />{t.copyLink}</>}
              </GhostButton>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,183,229,.3)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((referral?.thisMonthCount ?? 0) / (referral?.maxPerMonth ?? 2)) * 100}%`,
                      background: "#FFB7E5",
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-white whitespace-nowrap" data-testid="text-referral-count">
                  {referral?.thisMonthCount ?? 0} / {referral?.maxPerMonth ?? 2}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,183,229,.3)" }}>
                  <Users className="w-5 h-5 mx-auto mb-1" style={{ color: "#FFB7E5" }} />
                  <p className="text-lg font-bold text-white">{referral?.thisMonthCount ?? 0}</p>
                  <p className="text-[10px] text-white" style={{ opacity: 0.82 }}>{t.thisMonth}</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,226,154,.3)" }}>
                  <Gift className="w-5 h-5 mx-auto mb-1" style={{ color: "#FFE29A" }} />
                  <p className="text-lg font-bold text-white">{(referral?.maxPerMonth ?? 2) - (referral?.thisMonthCount ?? 0)}</p>
                  <p className="text-[10px] text-white" style={{ opacity: 0.82 }}>{t.slotsLeft}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.08)" }}>
                <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <p className="text-xs text-white leading-snug" style={{ opacity: 0.85 }}>
                  {t.referralDisclaimer}
                </p>
              </div>
            </SectionCard>
          )}

          {/* ── Account ── */}
          <SectionCard
            color="#94F7C5"
            icon={Shield}
            eyebrow={t.accountEyebrow}
            title={t.accountTitle}
            subtitle={t.accountSubtitle}
            testId="card-account"
            delay={0.3}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl" style={{ background: "rgba(5,5,8,.6)", border: "1px solid rgba(255,255,255,.1)" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ opacity: 0.82 }}>{t.emailLabel}</p>
                <p className="font-bold text-white mt-0.5 truncate" data-testid="text-account-email">{user?.email || "—"}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(5,5,8,.6)", border: "1px solid rgba(255,255,255,.1)" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ opacity: 0.82 }}>{t.roleLabel}</p>
                <p className="font-bold mt-0.5" style={{ color: "#94F7C5" }}>
                  {user?.role === "learner" ? t.learnerRole : (user?.role ?? "—")}
                </p>
              </div>
            </div>

            {/* ── Change password ─────────────────────────────────────── */}
            {!showPasswordForm ? (
              <GhostButton
                onClick={() => setShowPasswordForm(true)}
                color="#9FF5E8"
                testId="button-show-change-password"
              >
                <KeyRound className="w-4 h-4" />
                {t.changePassword}
              </GhostButton>
            ) : (
              <div
                className="p-4 rounded-xl space-y-3"
                style={{ background: "rgba(5,5,8,.6)", border: "1px solid rgba(159,245,232,.35)" }}
                data-testid="change-password-form"
              >
                <div className="space-y-1.5">
                  <Label className="text-white text-xs">{t.currentPasswordLabel}</Label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={fieldClass}
                    style={fieldStyle}
                    data-testid="input-current-password"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs">{t.newPasswordLabel}</Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={fieldClass}
                    style={fieldStyle}
                    data-testid="input-new-password"
                  />
                  <p className="text-[11px] text-white" style={{ opacity: 0.8 }}>{t.newPasswordHint}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs">{t.confirmPasswordLabel}</Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={fieldClass}
                    style={fieldStyle}
                    data-testid="input-confirm-password"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <PrimaryButton
                    onClick={submitPasswordChange}
                    disabled={!canSubmitPassword}
                    testId="button-save-password"
                  >
                    {changePasswordMutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" />{t.savingPassword}</>
                      : <><KeyRound className="w-4 h-4" />{t.savePassword}</>}
                  </PrimaryButton>
                  <GhostButton
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    testId="button-cancel-password"
                  >
                    {t.cancelPassword}
                  </GhostButton>
                </div>
              </div>
            )}

            <GhostButton
              onClick={() => logout()}
              color="#FF8DA1"
              testId="button-sign-out"
            >
              <LogOut className="w-4 h-4" />
              {t.signOut}
            </GhostButton>
          </SectionCard>
        </main>
      </div>
    </div>
  );
}
