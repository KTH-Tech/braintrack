import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTopNav } from "@/components/admin-top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, School, Handshake, TrendingUp, BarChart3, Search,
  Download, DollarSign, Heart, UserCheck, Clock,
  GraduationCap, Eye, Ear, Hand, FileText, Layers, Flame,
  Home, LogOut, Activity, MousePointerClick, PieChart, Zap,
  Award, BookOpen, AlertCircle, Plus, Copy, Link2, CheckCheck,
  Shield, Star, ChevronRight, Phone, Mail, MessageSquare,
  Calendar, X, CheckSquare, Square, Filter, ArrowUpDown,
  Building2, TrendingDown, AlertTriangle, CheckCircle2,
  Bell, BellOff, Send, RotateCcw, Loader2, Sparkles, Trash2,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Link } from "wouter";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { apiRequest } from "@/lib/queryClient";
import { formatSAPhone } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { formatDate, formatDateTime, formatNumber, formatCurrency } from "@/lib/formatters";

interface UserStat {
  totalUsers: number;
  learners: number;
  parents: number;
  admins: number;
  activeToday: number;
  activeThisWeek: number;
  trialUsers: number;
  subscribedUsers: number;
}

interface SchoolRow {
  id: number;
  schoolName: string;
  province: string;
  learnerCount: number;
  avgAccuracy: number;
  avgQuestionsAnswered: number;
  topSubject: string;
  earnings: number;
  isActive: boolean;
  endorsementStatus?: string;
  trialStartDate?: string;
  trialExpiryDate?: string;
  schoolType?: string;
  gradeRange?: string;
}

interface PartnerReport {
  partnerCode: string;
  partnerName: string;
  referrals: number;
  conversions: number;
  revenue: number;
  commission: number;
}

function MiniBar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function DonutChart({ learners, parents, admins }: { learners: number; parents: number; admins: number }) {
  const { language } = useLanguage();
  const isAf = language === "af";
  const total = learners + parents + admins;
  if (total === 0) return null;
  const lPct = (learners / total) * 100;
  const pPct = (parents / total) * 100;
  const aPct = (admins / total) * 100;
  const gradient = `conic-gradient(#3b82f6 0% ${lPct}%, #06b6d4 ${lPct}% ${lPct + pPct}%, #f59e0b ${lPct + pPct}% 100%)`;
  return (
    <div className="flex items-center gap-6">
      <div className="w-28 h-28 rounded-full flex-shrink-0 relative" style={{ background: gradient }}>
        <div className="absolute inset-3 rounded-full bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold">{total}</div>
            <div className="text-[9px] text-white">{isAf ? "Totaal" : "Total"}</div>
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-xs text-white">{isAf ? "Leerders" : "Learners"}</span>
          <span className="text-xs font-semibold ml-auto">{learners} ({Math.round(lPct)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-cyan-500" />
          <span className="text-xs text-white">{isAf ? "Ouers" : "Parents"}</span>
          <span className="text-xs font-semibold ml-auto">{parents} ({Math.round(pPct)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          <span className="text-xs text-white">{isAf ? "Admins" : "Admins"}</span>
          <span className="text-xs font-semibold ml-auto">{admins} ({Math.round(aPct)}%)</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-white text-center max-w-xs">{description}</p>
    </div>
  );
}

function GlowStatCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon?: any; accent?: string }) {
  const { language } = useLanguage();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black p-5 border border-white/20">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-white">{label}</div>
          <div className="text-3xl font-bold tabular-nums text-white">
            {typeof value === 'number' ? formatNumber(value, language) : value}
          </div>
          {sub && <div className="text-[10px] text-white">{sub}</div>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black border border-white/25 text-white">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

function EndorsementBadge({ status }: { status: string }) {
  const { language } = useLanguage();
  const isAf = language === "af";
  const cfg: Record<string, { label: string; cls: string }> = {
    none: { label: isAf ? "Geen" : "None", cls: "bg-muted/50 text-white border-muted" },
    interested: { label: isAf ? "Belangstellend" : "Interested", cls: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
    endorsed: { label: isAf ? "Onderskryf" : "Endorsed", cls: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
    champion: { label: isAf ? "Kampioen" : "Champion", cls: "bg-primary/10 text-primary border-primary/30" },
  };
  const c = cfg[status] ?? cfg.none;
  return <Badge variant="outline" className={`text-[10px] h-5 ${c.cls}`}>{c.label}</Badge>;
}

function TrialCountdown({ expiryDate }: { expiryDate?: string | null }) {
  const { language } = useLanguage();
  const isAf = language === "af";
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!expiryDate) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiryDate]);

  if (!expiryDate) return <span className="text-[10px] text-white font-mono">â€” : â€” : â€” : â€”</span>;
  const expiry = new Date(expiryDate).getTime();
  const diff = expiry - now;

  const expired = diff <= 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hrs = Math.floor((abs % 86400000) / 3600000);
  const mins = Math.floor((abs % 3600000) / 60000);
  const secs = Math.floor((abs % 60000) / 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");

  const totalHoursLeft = diff / 3600000;
  const hex =
    expired ? "#FF9FE5" :
    totalHoursLeft <= 24 ? "#FFC48F" :
    totalHoursLeft <= 24 * 7 ? "#FFF29E" :
    totalHoursLeft <= 24 * 30 ? "#7FEFFF" :
    "#C6A4FF";
  const pulse = expired || totalHoursLeft <= 24;

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-lg bg-black px-2 py-1 font-mono tabular-nums"
      style={{
        border: `1px solid ${hex}80`,
        boxShadow: `0 0 8px ${hex}66, inset 0 0 10px ${hex}22`,
      }}
      title={expired ? (isAf ? "Proeflopie verstryk" : "Trial expired") : (isAf ? "Proeflopie-aftelling" : "Trial countdown")}
    >
      {pulse && (
        <span
          aria-hidden
          className="w-1.5 h-1.5 rounded-full anicon-pulse"
          style={{ background: hex, boxShadow: `0 0 6px ${hex}` }}
        />
      )}
      <span
        className="text-[10px] font-bold leading-none"
        style={{ color: hex, textShadow: `0 0 6px ${hex}99` }}
      >
        {expired ? "â€“" : ""}{pad(days, 2)}<span className="opacity-60">d</span> {pad(hrs)}:{pad(mins)}:{pad(secs)}
      </span>
    </div>
  );
}

// ===============================
// MULTI-STEP SCHOOL ONBOARDING
// ===============================
const ONBOARD_STEPS_EN = ["School Info", "Contact & Size", "Trial Setup"];
const ONBOARD_STEPS_AF = ["Skoolinligting", "Kontak & Grootte", "Proefopstelling"];

function SchoolOnboardingForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { language } = useLanguage();
  const isAf = language === "af";
  const ONBOARD_STEPS = isAf ? ONBOARD_STEPS_AF : ONBOARD_STEPS_EN;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    schoolName: "",
    province: "",
    district: "",
    schoolType: "public",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    gradeRange: "10-12",
    expectedLearnerCount: "",
    endorsementStatus: "none",
    trialStartDate: "",
    trialExpiryDate: "",
    notes: "",
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.schoolName.trim(),
        province: form.province.trim(),
        district: form.district.trim(),
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        schoolType: form.schoolType,
        gradeRange: form.gradeRange,
        expectedLearnerCount: form.expectedLearnerCount ? parseInt(form.expectedLearnerCount) : null,
        endorsementStatus: form.endorsementStatus,
        trialStartDate: form.trialStartDate || null,
        trialExpiryDate: form.trialExpiryDate || null,
        notes: form.notes.trim(),
      };
      const r = await apiRequest("POST", "/api/admin/schools", payload);
      return r.json();
    },
    onSuccess: () => {
      toast({ title: isAf ? "Skool ingelyf" : "School onboarded", description: `${form.schoolName} ${isAf ? "is bygevoeg." : "has been added."}` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/schools"] });
      onSuccess();
    },
    onError: () => toast({ title: language === "af" ? "Fout" : "Error", description: language === "af" ? "Kon nie skool skep nie." : "Could not create school.", variant: "destructive" }),
  });

  const canNext = () => {
    if (step === 0) return form.schoolName.trim().length > 0;
    return true;
  };

  const A = "#7FEFFF";
  const iSty = { border: "1px solid rgba(255,255,255,0.12)" } as const;
  const iCls = "h-9 text-sm bg-black text-white placeholder:text-white";
  const lCls = "text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5 block text-white";

  return (
    <div className="space-y-5">
      {/* Step track */}
      <div className="flex items-center">
        {ONBOARD_STEPS.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none last:flex-initial">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-black shrink-0"
                  style={
                    done ? { color: "#000", background: A, border: `1.5px solid ${A}` }
                    : active ? { color: A, border: `1.5px solid ${A}`, boxShadow: `0 0 8px ${A}55` }
                    : { color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)" }
                  }
                >
                  {done ? "âœ“" : i + 1}
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap"
                  style={{ color: active ? "#fff" : done ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)" }}
                >
                  {s}
                </span>
              </div>
              {i < ONBOARD_STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2.5" style={{ background: done ? A : "rgba(255,255,255,0.1)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 0 â€” School Info */}
      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label className={lCls}>{isAf ? "Skoolnaam" : "School Name"} <span style={{ color: A }}>*</span></label>
            <Input
              autoFocus
              placeholder={isAf ? "bv. HoÃ«rskool Pretoria" : "e.g. Hoerskool Pretoria"}
              value={form.schoolName}
              onChange={e => update("schoolName", e.target.value)}
              className={iCls} style={iSty}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>{isAf ? "Provinsie" : "Province"}</label>
              <Select value={form.province} onValueChange={v => update("province", v)}>
                <SelectTrigger className={iCls} style={iSty}><SelectValue placeholder={isAf ? "Kiesâ€¦" : "Selectâ€¦"} /></SelectTrigger>
                <SelectContent>
                  {["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Free State","Limpopo","Mpumalanga","Northern Cape","North West"].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={lCls}>{isAf ? "Distrik" : "District"}</label>
              <Input placeholder={isAf ? "bv. Tshwane Suid" : "e.g. Tshwane South"} value={form.district} onChange={e => update("district", e.target.value)} className={iCls} style={iSty} />
            </div>
          </div>
          <div>
            <label className={lCls}>{isAf ? "Skooltipe" : "School Type"}</label>
            <Select value={form.schoolType} onValueChange={v => update("schoolType", v)}>
              <SelectTrigger className={iCls} style={iSty}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">{isAf ? "Openbaar" : "Public"}</SelectItem>
                <SelectItem value="private">{isAf ? "Privaat" : "Private"}</SelectItem>
                <SelectItem value="independent">{isAf ? "Onafhanklik" : "Independent"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Step 1 â€” Contact & Size */}
      {step === 1 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>{isAf ? "Kontaknaam" : "Contact Name"}</label>
              <Input autoFocus placeholder={isAf ? "Voornaam Van" : "First Last"} value={form.contactName} onChange={e => update("contactName", e.target.value)} className={iCls} style={iSty} />
            </div>
            <div>
              <label className={lCls}>{isAf ? "Kontak-e-pos" : "Contact Email"}</label>
              <Input type="email" placeholder="name@school.co.za" value={form.contactEmail} onChange={e => update("contactEmail", e.target.value)} className={iCls} style={iSty} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>{isAf ? "Telefoon" : "Phone"}</label>
              <Input placeholder="012 345 6789" value={form.contactPhone} onChange={e => update("contactPhone", e.target.value)} className={iCls} style={iSty} />
            </div>
            <div>
              <label className={lCls}>{isAf ? "Graadreeks" : "Grade Range"}</label>
              <Select value={form.gradeRange} onValueChange={v => update("gradeRange", v)}>
                <SelectTrigger className={iCls} style={iSty}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="8-12">{isAf ? "Gr 8â€“12" : "Gr 8â€“12"}</SelectItem>
                  <SelectItem value="10-12">{isAf ? "Gr 10â€“12" : "Gr 10â€“12"}</SelectItem>
                  <SelectItem value="11-12">{isAf ? "Gr 11â€“12" : "Gr 11â€“12"}</SelectItem>
                  <SelectItem value="12">{isAf ? "Slegs Gr 12" : "Gr 12 only"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>{isAf ? "Leerderaantal" : "Learner Count"}</label>
              <Input type="number" min={1} placeholder={isAf ? "bv. 250" : "e.g. 250"} value={form.expectedLearnerCount} onChange={e => update("expectedLearnerCount", e.target.value)} className={iCls} style={iSty} />
            </div>
            <div>
              <label className={lCls}>{isAf ? "Onderskrywing" : "Endorsement"}</label>
              <Select value={form.endorsementStatus} onValueChange={v => update("endorsementStatus", v)}>
                <SelectTrigger className={iCls} style={iSty}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{isAf ? "Geen" : "None"}</SelectItem>
                  <SelectItem value="interested">{isAf ? "Belangstellend" : "Interested"}</SelectItem>
                  <SelectItem value="endorsed">{isAf ? "Onderskryf" : "Endorsed"}</SelectItem>
                  <SelectItem value="champion">{isAf ? "Kampioen" : "Champion"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 â€” Trial Setup */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>{isAf ? "Proef-begindatum" : "Trial Start"}</label>
              <Input type="date" value={form.trialStartDate} onChange={e => update("trialStartDate", e.target.value)} className={iCls} style={iSty} />
            </div>
            <div>
              <label className={lCls}>{isAf ? "Proef-vervaldatum" : "Trial Expiry"}</label>
              <Input type="date" value={form.trialExpiryDate} onChange={e => update("trialExpiryDate", e.target.value)} className={iCls} style={iSty} />
            </div>
          </div>
          <div>
            <label className={lCls}>{isAf ? "Notas" : "Notes"}</label>
            <Textarea
              placeholder={isAf ? "Ooreengekome terme, opvolgstappe, ensâ€¦" : "Agreed terms, follow-up actions, etcâ€¦"}
              value={form.notes}
              onChange={e => update("notes", e.target.value)}
              className="text-sm min-h-[64px] bg-black text-white placeholder:text-white resize-none"
              style={iSty}
              rows={3}
            />
          </div>
          {/* Value projection */}
          {parseInt(form.expectedLearnerCount || "0") > 0 && (
            <div className="p-3 rounded-xl bg-black flex items-center justify-between gap-3" style={{ border: "1px solid rgba(255,242,158,0.3)" }}>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 shrink-0" style={{ color: "#FFF29E" }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "#FFF29E" }}>{isAf ? "Waardeprojeksie" : "Value Projection"}</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-black" style={{ color: "#FFF29E" }}>R{formatNumber((parseInt(form.expectedLearnerCount || "0") || 0) * 35, language)}<span className="text-xs font-semibold text-white">/{isAf ? "mo" : "mo"}</span></div>
                <div className="text-[10px] text-white">{form.expectedLearnerCount} Ã— R35</div>
              </div>
            </div>
          )}
          {/* Summary */}
          <div className="p-3 rounded-xl bg-black text-[11px] text-white space-y-1" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white mb-2">{isAf ? "Opsomming" : "Summary"}</div>
            <div className="font-semibold text-white">{form.schoolName || "â€”"}{form.province ? ` Â· ${form.province}` : ""}</div>
            <div>{form.schoolType} Â· {isAf ? "Grade" : "Grades"} {form.gradeRange}{form.contactEmail ? ` Â· ${form.contactEmail}` : ""}</div>
            {form.endorsementStatus !== "none" && <div>{isAf ? "Onderskrywing" : "Endorsement"}: {form.endorsementStatus}</div>}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-1 border-t border-white/[0.06]">
        <button
          onClick={onClose}
          className="text-xs text-white hover:text-white transition-colors"
        >
          {isAf ? "Kanselleer" : "Cancel"}
        </button>
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {isAf ? "Terug" : "Back"}
            </button>
          )}
          {step < ONBOARD_STEPS.length - 1 ? (
            <button
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-black uppercase tracking-[0.16em] disabled:opacity-35 transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg,${A},#6FA8FF)`, color: "#000", boxShadow: `0 0 18px ${A}55` }}
            >
              {isAf ? "Volgende" : "Next"} â†’
            </button>
          ) : (
            <button
              disabled={createMutation.isPending || !form.schoolName.trim()}
              onClick={() => createMutation.mutate()}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-black uppercase tracking-[0.16em] disabled:opacity-35 transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg,${A},#6FA8FF)`, color: "#000", boxShadow: `0 0 18px ${A}55` }}
            >
              {createMutation.isPending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {isAf ? "Skepâ€¦" : "Creatingâ€¦"}</>
                : <><School className="w-3.5 h-3.5" /> {isAf ? "Skool Inboord" : "Onboard School"}</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===============================
// SCHOOL DETAIL PANEL
// ===============================
function SchoolDetailPanel({ schoolId, onClose }: { schoolId: number; onClose: () => void }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logType, setLogType] = useState("call");
  const [logNotes, setLogNotes] = useState("");
  const [editingEndorsement, setEditingEndorsement] = useState(false);
  const [newEndorsement, setNewEndorsement] = useState("");
  const [newTrialExpiry, setNewTrialExpiry] = useState("");

  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/admin/schools/${schoolId}`],
  });

  const { data: activityData } = useQuery<{ weeks: Array<{ weekLabel: string; activeCount: number }> }>({
    queryKey: [`/api/admin/schools/${schoolId}/activity`],
  });

  const { data: contactLogData, refetch: refetchLog } = useQuery<{ entries: any[] }>({
    queryKey: [`/api/admin/schools/${schoolId}/contact-log`],
  });

  const addLogMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/admin/schools/${schoolId}/contact-log`, { type: logType, notes: logNotes }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: language === "af" ? "Kontak gelog" : "Contact logged" });
      setLogNotes("");
      refetchLog();
    },
    onError: () => toast({ title: language === "af" ? "Fout" : "Error", description: language === "af" ? "Kon nie loginskrywing stoor nie." : "Could not save log entry.", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => apiRequest("PUT", `/api/admin/schools/${schoolId}`, payload).then(r => r.json()),
    onSuccess: () => {
      toast({ title: language === "af" ? "Skool opgedateer" : "School updated" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/schools/${schoolId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/schools"] });
      setEditingEndorsement(false);
    },
    onError: () => toast({ title: language === "af" ? "Fout" : "Error", description: language === "af" ? "Opdatering misluk." : "Update failed.", variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-sm text-white">{language === "af" ? "Laai skooldataâ€¦" : "Loading school dataâ€¦"}</div>
      </div>
    );
  }

  const school = data?.school;
  const stats = data?.stats;
  const gradeSummaries = data?.gradeSummaries ?? [];

  if (!school) return null;

  const trendUp = (stats?.activeThisWeek ?? 0) >= (stats?.activeLastWeek ?? 0);
  const logTypeLabels: Record<string, string> = language === "af"
    ? { call: "ðŸ“ž Oproep", email: "ðŸ“§ E-pos", meeting: "ðŸ¤ Vergadering", demo: "ðŸŽ¯ Demo", follow_up: "ðŸ” Opvolg" }
    : { call: "ðŸ“ž Call", email: "ðŸ“§ Email", meeting: "ðŸ¤ Meeting", demo: "ðŸŽ¯ Demo", follow_up: "ðŸ” Follow-up" };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold">{school.schoolName}</h2>
            <EndorsementBadge status={school.endorsementStatus ?? "none"} />
          </div>
          <div className="text-xs text-white">{school.province} {school.district ? `Â· ${school.district}` : ""} Â· {school.schoolType}</div>
          {school.gradeRange && <div className="text-xs text-white">{language === "af" ? "Grade" : "Grades"} {school.gradeRange}</div>}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>

      {/* R35 Value Widget */}
      <div className="bg-black border border-white/20 rounded-2xl p-4">
        <div className="text-[10px] text-white uppercase tracking-widest font-medium mb-1">{language === "af" ? "Skoolwaarde â€” R35/leerder" : "School Value â€” R35/learner"}</div>
        <div className="text-3xl font-semibold font-heading text-primary">R{formatNumber(stats?.valueRands ?? 0, language)}<span className="text-base font-normal text-white">{language === "af" ? "/maand" : "/month"}</span></div>
        <div className="text-[11px] text-white mt-1">{stats?.learnerCount ?? 0} {language === "af" ? "aktiewe leerders Ã— R35" : "active learners Ã— R35"}</div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
          <div className="text-[10px] text-white uppercase tracking-widest mb-1">{language === "af" ? "Gem. Akkuraatheid" : "Avg Accuracy"}</div>
          <div className="text-xl font-semibold">{stats?.avgAccuracy ?? 0}%</div>
        </div>
        <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3">
          <div className="text-[10px] text-white uppercase tracking-widest mb-1">{language === "af" ? "Vraestelle Voltooi" : "Papers Completed"}</div>
          <div className="text-xl font-semibold">{stats?.totalPapersCompleted ?? 0}</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
          <div className="text-[10px] text-white uppercase tracking-widest mb-1">{language === "af" ? "Aktief Hierdie Week" : "Active This Week"}</div>
          <div className="text-xl font-semibold flex items-center gap-1.5">
            {stats?.activeThisWeek ?? 0}
            {trendUp
              ? <TrendingUp className="w-4 h-4 text-white" />
              : <TrendingDown className="w-4 h-4 text-red-500" />}
          </div>
        </div>
        <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3">
          <div className="text-[10px] text-white uppercase tracking-widest mb-1">{language === "af" ? "Gem. Vrae" : "Avg Questions"}</div>
          <div className="text-xl font-semibold">{stats?.avgQuestionsAnswered ?? 0}</div>
        </div>
      </div>

      {/* Engagement Trend â€” 8-week sparkline */}
      {(activityData?.weeks ?? []).length > 0 && (
        <div className="p-3 rounded-xl border border-border bg-muted/10">
          <div className="text-xs font-semibold mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-primary" /> {language === "af" ? "8-Week Betrokkenheid" : "8-Week Engagement"}</span>
            <span className="text-[10px] text-white font-normal">{language === "af" ? "aktiewe leerders / week" : "active learners / week"}</span>
          </div>
          <div className="flex items-end gap-1">
            {(activityData?.weeks ?? []).map((w, i) => {
              const maxCount = Math.max(...(activityData?.weeks ?? []).map(x => x.activeCount), 1);
              const heightPct = Math.max(8, Math.round((w.activeCount / maxCount) * 100));
              const isLatest = i === (activityData?.weeks?.length ?? 1) - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-sm transition-all ${isLatest ? "bg-primary" : "bg-primary/30"}`}
                    style={{ height: `${heightPct * 0.32}rem` }}
                    title={`${w.weekLabel}: ${w.activeCount} active`}
                  />
                  {i === 0 || i === (activityData?.weeks?.length ?? 1) - 1 ? (
                    <div className="text-[9px] text-white truncate">{w.weekLabel}</div>
                  ) : <div className="h-3" />}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-white mt-1">
            {language === "af" ? "Hoogtepunt" : "Peak"}: {Math.max(...(activityData?.weeks ?? []).map(w => w.activeCount), 0)} {language === "af" ? "leerders Â· Huidig" : "learners Â· Current"}: {activityData?.weeks?.[activityData.weeks.length - 1]?.activeCount ?? 0}
          </div>
        </div>
      )}

      {/* Trial status */}
      <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-white" /> {language === "af" ? "Proeflopie-status" : "Trial Status"}</div>
          <TrialCountdown expiryDate={school.trialExpiryDate} />
        </div>
        {school.trialStartDate && (
          <div className="text-[11px] text-white">
            {language === "af" ? "Begin" : "Started"}: {formatDate(school.trialStartDate, language, {})}
            {school.trialExpiryDate && ` Â· ${language === "af" ? "Verval" : "Expires"}: ${formatDate(school.trialExpiryDate, language, {})}`}
          </div>
        )}
        {!editingEndorsement ? (
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 w-full" onClick={() => { setEditingEndorsement(true); setNewEndorsement(school.endorsementStatus ?? "none"); setNewTrialExpiry(school.trialExpiryDate ? new Date(school.trialExpiryDate).toISOString().slice(0, 10) : ""); }}>
            {language === "af" ? "Wysig Onderskrywing & Proeflopie" : "Edit Endorsement & Trial"}
          </Button>
        ) : (
          <div className="space-y-2 pt-1">
            <Select value={newEndorsement} onValueChange={setNewEndorsement}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{language === "af" ? "Geen" : "None"}</SelectItem>
                <SelectItem value="interested">{language === "af" ? "Belangstellend" : "Interested"}</SelectItem>
                <SelectItem value="endorsed">{language === "af" ? "Onderskryf" : "Endorsed"}</SelectItem>
                <SelectItem value="champion">{language === "af" ? "Kampioen" : "Champion"}</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={newTrialExpiry} onChange={e => setNewTrialExpiry(e.target.value)} className="h-8 text-xs" placeholder={language === "af" ? "Proeflopie-vervaldatum" : "Trial expiry date"} />
            <div className="flex gap-1">
              <Button size="sm" className="flex-1 h-7 text-[11px]" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ endorsementStatus: newEndorsement, trialExpiryDate: newTrialExpiry || null })}>
                {language === "af" ? "Stoor" : "Save"}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 h-7 text-[11px]" onClick={() => setEditingEndorsement(false)}>
                {language === "af" ? "Kanselleer" : "Cancel"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grade/Class Summaries */}
      {gradeSummaries.length > 0 && (
        <div>
          <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-white" /> {language === "af" ? "Graad-opsommings" : "Grade Summaries"}
          </div>
          <div className="space-y-1.5">
            {gradeSummaries.map((g: any) => (
              <div key={g.grade} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-white/15">
                <div className="text-xs font-semibold w-14">{language === "af" ? "Gr" : "Gr"} {g.grade}</div>
                <div className="flex-1">
                  <MiniBar value={g.avgAccuracy} max={100} color={g.avgAccuracy >= 70 ? "bg-green-500" : "bg-amber-500"} />
                </div>
                <div className="text-xs text-white w-12 text-right">{g.avgAccuracy}%</div>
                <div className="text-[10px] text-white w-14 text-right">{g.learnerCount} {language === "af" ? "leerders" : "learners"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Log */}
      <div>
        <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-white" /> {language === "af" ? "Kontaklog" : "Contact Log"}
        </div>
        <div className="space-y-2 mb-3">
          <div className="flex gap-2">
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger className="h-8 text-xs w-32 flex-shrink-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(logTypeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={logNotes} onChange={e => setLogNotes(e.target.value)} placeholder={language === "af" ? "Notas oor hierdie interaksieâ€¦" : "Notes about this interactionâ€¦"} className="h-8 text-xs flex-1" onKeyDown={e => { if (e.key === "Enter" && logNotes.trim()) addLogMutation.mutate(); }} />
            <Button size="sm" className="h-8 text-xs px-3" disabled={!logNotes.trim() || addLogMutation.isPending} onClick={() => addLogMutation.mutate()}>
              {language === "af" ? "Voeg By" : "Add"}
            </Button>
          </div>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {(contactLogData?.entries ?? []).length === 0 ? (
            <div className="text-[11px] text-white text-center py-4">{language === "af" ? "Nog geen kontaklog-inskrywings nie" : "No contact log entries yet"}</div>
          ) : (
            (contactLogData?.entries ?? []).map((e: any) => (
              <div key={e.id} className="flex gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-white/15">
                <div className="text-[11px] flex-shrink-0 mt-0.5">{logTypeLabels[e.type] ?? e.type}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white leading-relaxed">{e.notes}</div>
                  <div className="text-[10px] text-white mt-0.5">{formatDate(e.createdAt, language, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Export */}
      <div className="pt-1">
        <a href={`/api/admin/schools/${schoolId}/export`} download>
          <Button variant="outline" size="sm" className="w-full h-9 gap-1.5 text-xs border-green-500/40 text-green-700 hover:bg-green-500/10">
            <Download className="w-3.5 h-3.5" /> {language === "af" ? "Voer Leerderverslag Uit (CSV)" : "Export Learner Report (CSV)"}
          </Button>
        </a>
      </div>
    </div>
  );
}

// â”€â”€ Send Test Email card â€” shown in Overview tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SendTestEmailCard({ language }: { language: string }) {
  const isAf = language === "af";
  const { toast } = useToast();
  const [lastResult, setLastResult] = useState<{ delivery: string; error?: string | null } | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/test-email", {});
      return res.json() as Promise<{ delivery: string; error?: string | null }>;
    },
    onSuccess: (data) => {
      setLastResult(data);
      if (data.delivery === "sent") {
        toast({
          title: isAf ? "Toets-e-pos gestuur!" : "Test email sent!",
          description: isAf ? "Kyk jou inkassie." : "Check your inbox.",
        });
      } else if (data.delivery === "not_configured") {
        toast({
          title: isAf ? "E-pos nie gekonfigureer nie" : "Email not configured",
          description: isAf
            ? "Koppel die Resend-integrasie om e-posse te stuur."
            : "Connect the Resend integration to enable email sending.",
          variant: "destructive",
        });
      } else {
        toast({
          title: isAf ? "Stuur misluk" : "Send failed",
          description: data.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    },
    onError: (err: any) => {
      toast({
        title: isAf ? "Fout" : "Error",
        description: err?.message ?? String(err),
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="rounded-2xl border-white/15">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Mail className="w-4 h-4" style={{ color: "#a78bfa", filter: "drop-shadow(0 0 6px #a78bfa)" }} />
          {isAf ? "E-pos Aflewering" : "Email Delivery"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-3">
        <p className="text-xs text-white leading-snug">
          {isAf
            ? "Stuur 'n vinnige toets-e-pos na jou eie adres om te bevestig dat transaksionele e-posse afgelewer word."
            : "Send a quick test email to your own address to confirm transactional emails are delivering correctly."}
        </p>
        <Button
          data-testid="send-test-email-btn"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => { setLastResult(null); mutation.mutate(); }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white"
        >
          {mutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          {isAf ? "Stuur Toets-E-pos" : "Send Test Email"}
        </Button>
        {lastResult && (
          <div
            data-testid="test-email-result"
            className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
              lastResult.delivery === "sent"
                ? "bg-emerald-900/30 border border-emerald-500/30 text-emerald-300"
                : lastResult.delivery === "not_configured"
                ? "bg-amber-900/30 border border-amber-500/30 text-amber-300"
                : "bg-red-900/30 border border-red-500/30 text-red-300"
            }`}
          >
            {lastResult.delivery === "sent" ? (
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            )}
            <span>
              {lastResult.delivery === "sent"
                ? isAf ? "E-pos afgelewer!" : "Email delivered!"
                : lastResult.delivery === "not_configured"
                ? isAf ? "Resend-integrasie nie gekoppel nie" : "Resend integration not connected"
                : lastResult.error ?? (isAf ? "Stuur misluk" : "Send failed")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===============================
// MAIN PAGE
// ===============================
export default function AdminReportsPage() {
  const { language, toggleLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showPartnerBulk, setShowPartnerBulk] = useState(false);
  const [partnerBulkText, setPartnerBulkText] = useState("");
  const [partnerBulkResult, setPartnerBulkResult] = useState<any>(null);
  const [partnerForm, setPartnerForm] = useState({
    schoolName: "", schoolCode: "", contactName: "", contactEmail: "", contactPhone: "",
    province: "", district: "", commissionRate: "10", notes: "",
  });
  const addPartnerMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        schoolName: partnerForm.schoolName.trim(),
        schoolCode: partnerForm.schoolCode.trim() || undefined,
        contactName: partnerForm.contactName.trim() || undefined,
        contactEmail: partnerForm.contactEmail.trim() || undefined,
        contactPhone: partnerForm.contactPhone.trim() || undefined,
        province: partnerForm.province.trim() || undefined,
        district: partnerForm.district.trim() || undefined,
        commissionRate: Number(partnerForm.commissionRate) || 10,
        notes: partnerForm.notes.trim() || undefined,
      };
      const r = await apiRequest("POST", "/api/partner-schools", payload);
      return r.json();
    },
    onSuccess: (data) => {
      toast({
        title: language === "af" ? "Vennoot bygevoeg" : "Partner added",
        description: data?.referralUrl
          ? `${language === "af" ? "Verwysingskakel" : "Referral link"}: ${data.referralUrl}`
          : `${language === "af" ? "Kode" : "Code"}: ${data?.schoolCode}`,
      });
      setShowAddPartner(false);
      setPartnerForm({ schoolName: "", schoolCode: "", contactName: "", contactEmail: "", contactPhone: "", province: "", district: "", commissionRate: "10", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner-schools"] });
    },
    onError: (e: any) => toast({ title: language === "af" ? "Kon nie vennoot byvoeg nie" : "Failed to add partner", description: e?.message ?? (language === "af" ? "Kon nie vennoot skep nie" : "Could not create partner"), variant: "destructive" }),
  });
  const partnerBulkMutation = useMutation({
    mutationFn: async (rows: any[]) => {
      const r = await apiRequest("POST", "/api/admin/partner-schools/bulk", { partners: rows });
      return r.json();
    },
    onSuccess: (data) => {
      setPartnerBulkResult(data);
      toast({
        title: language === "af" ? "Massa-invoer voltooi" : "Bulk import complete",
        description: language === "af"
          ? `${data.summary?.inserted ?? 0} bygevoeg Â· ${data.summary?.skipped ?? 0} oorgeslaan Â· ${data.summary?.failed ?? 0} misluk`
          : `${data.summary?.inserted ?? 0} added Â· ${data.summary?.skipped ?? 0} skipped Â· ${data.summary?.failed ?? 0} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner-schools"] });
    },
    onError: (e: any) => toast({ title: language === "af" ? "Invoer misluk" : "Import failed", description: e?.message ?? (language === "af" ? "Kon nie vennote invoer nie" : "Could not import partners"), variant: "destructive" }),
  });
  function parseBulkPartners(input: string): { rows: any[]; error?: string } {
    const text = input.trim();
    if (!text) return { rows: [], error: language === "af" ? "Plak ten minste een vennoot" : "Paste at least one partner" };
    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        const parsed = JSON.parse(text);
        return { rows: Array.isArray(parsed) ? parsed : [parsed] };
      } catch (e: any) {
        return { rows: [], error: `${language === "af" ? "Ongeldige JSON" : "Invalid JSON"}: ${e.message}` };
      }
    }
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { rows: [], error: language === "af" ? "Geen rye gevind nie" : "No rows found" };
    const first = lines[0].toLowerCase();
    const looksLikeHeader = /name|partner|school/.test(first) && first.includes(",");
    const headers = looksLikeHeader
      ? lines[0].split(",").map(h => h.trim().toLowerCase())
      : ["name", "contactemail", "contactphone", "schoolcode", "commissionrate", "province", "district", "notes"];
    const dataLines = looksLikeHeader ? lines.slice(1) : lines;
    const headerMap: Record<string, string> = {
      name: "schoolName", "partner name": "schoolName", partnername: "schoolName", "school name": "schoolName", schoolname: "schoolName",
      "contact email": "contactEmail", contactemail: "contactEmail", email: "contactEmail",
      "contact phone": "contactPhone", contactphone: "contactPhone", phone: "contactPhone",
      "contact name": "contactName", contactname: "contactName",
      "school code": "schoolCode", schoolcode: "schoolCode", code: "schoolCode", "partner code": "schoolCode", partnercode: "schoolCode",
      "commission rate": "commissionRate", commissionrate: "commissionRate", commission: "commissionRate", rate: "commissionRate",
      province: "province", district: "district", notes: "notes",
    };
    const rows = dataLines.map(line => {
      const cells = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      const row: any = {};
      headers.forEach((h, i) => {
        const key = headerMap[h] ?? h;
        if (cells[i] !== undefined && cells[i] !== "") row[key] = cells[i];
      });
      return row;
    });
    return { rows };
  }
  const bulkImportMutation = useMutation({
    mutationFn: async (rows: any[]) => {
      const r = await apiRequest("POST", "/api/admin/schools/bulk", { schools: rows });
      return r.json();
    },
    onSuccess: (data) => {
      setBulkResult(data);
      toast({
        title: language === "af" ? "Massa-invoer voltooi" : "Bulk import complete",
        description: language === "af"
          ? `${data.summary?.inserted ?? 0} bygevoeg Â· ${data.summary?.skipped ?? 0} oorgeslaan Â· ${data.summary?.failed ?? 0} misluk`
          : `${data.summary?.inserted ?? 0} added Â· ${data.summary?.skipped ?? 0} skipped Â· ${data.summary?.failed ?? 0} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/schools"] });
    },
    onError: (e: any) => toast({ title: language === "af" ? "Invoer misluk" : "Import failed", description: e?.message ?? (language === "af" ? "Kon nie skole invoer nie" : "Could not import schools"), variant: "destructive" }),
  });

  function parseBulkSchools(input: string): { rows: any[]; error?: string } {
    const text = input.trim();
    if (!text) return { rows: [], error: language === "af" ? "Plak ten minste een skool" : "Paste at least one school" };
    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        const parsed = JSON.parse(text);
        const rows = Array.isArray(parsed) ? parsed : [parsed];
        return { rows };
      } catch (e: any) {
        return { rows: [], error: `${language === "af" ? "Ongeldige JSON" : "Invalid JSON"}: ${e.message}` };
      }
    }
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { rows: [], error: language === "af" ? "Geen rye gevind nie" : "No rows found" };
    const first = lines[0].toLowerCase();
    const looksLikeHeader = /name|school/.test(first) && first.includes(",");
    const headers = looksLikeHeader
      ? lines[0].split(",").map(h => h.trim().toLowerCase())
      : ["name", "province", "district", "contactname", "contactemail", "contactphone", "schooltype", "graderange", "expectedlearnercount"];
    const dataLines = looksLikeHeader ? lines.slice(1) : lines;
    const headerMap: Record<string, string> = {
      name: "name", "school name": "name", "school_name": "name", schoolname: "name",
      province: "province", district: "district",
      "contact name": "contactName", contactname: "contactName", "contact_name": "contactName",
      "contact email": "contactEmail", contactemail: "contactEmail", "contact_email": "contactEmail", email: "contactEmail",
      "contact phone": "contactPhone", contactphone: "contactPhone", "contact_phone": "contactPhone", phone: "contactPhone",
      "school type": "schoolType", schooltype: "schoolType", type: "schoolType",
      "grade range": "gradeRange", graderange: "gradeRange", grades: "gradeRange",
      "expected learner count": "expectedLearnerCount", expectedlearnercount: "expectedLearnerCount", learners: "expectedLearnerCount",
      "school code": "schoolCode", schoolcode: "schoolCode", code: "schoolCode",
      notes: "notes",
    };
    const rows = dataLines.map(line => {
      const cells = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      const row: any = {};
      headers.forEach((h, i) => {
        const key = headerMap[h] ?? h;
        if (cells[i] !== undefined && cells[i] !== "") row[key] = cells[i];
      });
      return row;
    });
    return { rows };
  }
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);

  // Learner management state
  const [learnerSearch, setLearnerSearch] = useState("");
  const [learnerGrade, setLearnerGrade] = useState("all");
  const [learnerSubscription, setLearnerSubscription] = useState("all");
  const [selectedLearners, setSelectedLearners] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats } = useQuery<UserStat>({ queryKey: ["/api/admin/reports/stats"] });
  const { data: schoolsData } = useQuery<{ schools: SchoolRow[] }>({ queryKey: ["/api/admin/reports/schools"] });
  const { data: partnersData } = useQuery<{ partners: PartnerReport[] }>({ queryKey: ["/api/admin/reports/partners"] });
  const { data: parentReportsData } = useQuery<{ reports: any[] }>({ queryKey: ["/api/admin/reports/parents"] });
  const { data: learnersData } = useQuery<{ learners: any[] }>({ queryKey: ["/api/admin/reports/learners"] });
  const { data: learnersV2Data } = useQuery<{ learners: any[]; total: number }>({
    queryKey: ["/api/admin/reports/learners-v2", learnerSearch, learnerGrade, learnerSubscription],
    queryFn: () => {
      const params = new URLSearchParams();
      if (learnerSearch) params.set("search", learnerSearch);
      if (learnerGrade !== "all") params.set("grade", learnerGrade);
      if (learnerSubscription !== "all") params.set("subscription", learnerSubscription);
      return fetch(`/api/admin/reports/learners-v2?${params}`, { credentials: "include" }).then(r => r.json());
    },
    enabled: activeTab === "learners",
  });
  const { data: partnerStatsData } = useQuery<{ stats: any[]; totalClicks: number; totalTrials: number }>({ queryKey: ["/api/admin/reports/partner-stats"] });

  const bulkTrialMutation = useMutation({
    mutationFn: (learnerIds: string[]) =>
      apiRequest("POST", "/api/admin/learners/bulk-assign-trial", { learnerIds, daysFromNow: 30 }).then(r => r.json()),
    onSuccess: (data: any) => {
      toast({ title: language === "af" ? "Proeflopies toegewys" : "Trials assigned", description: data.message });
      setSelectedLearners(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/learners-v2"] });
    },
    onError: () => toast({ title: language === "af" ? "Fout" : "Error", description: language === "af" ? "Kon nie proeflopies toewys nie." : "Could not assign trials.", variant: "destructive" }),
  });

  // Delete-user state + mutation (admin only â€” excludes other admins via API)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null);
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest("DELETE", `/api/admin/users/${userId}`).then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || "Delete failed");
        }
        return r.json();
      }),
    onSuccess: () => {
      toast({ title: language === "af" ? "Gebruiker verwyder" : "User deleted" });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/learners-v2"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/learners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/parents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/stats"] });
    },
    onError: (err: any) => toast({
      title: language === "af" ? "Kon nie verwyder nie" : "Could not delete",
      description: err?.message || (language === "af" ? "Probeer weer." : "Try again."),
      variant: "destructive",
    }),
  });

  const conversionRate = stats && stats.totalUsers > 0 ? Math.round((stats.subscribedUsers / stats.totalUsers) * 100) : 0;
  const monthlyRevenue = (stats?.subscribedUsers ?? 0) * 169;

  const filteredLearners = useMemo(() => {
    const list = learnersV2Data?.learners ?? learnersData?.learners ?? [];
    return list.filter((l: any) => {
      const name = `${l.first_name || ''} ${l.last_name || ''} ${l.email || ''}`.toLowerCase();
      const matchSearch = !learnerSearch || name.includes(learnerSearch.toLowerCase());
      const matchGrade = learnerGrade === "all" || String(l.grade) === learnerGrade;
      const matchSub = learnerSubscription === "all" || l.subscription_status === learnerSubscription;
      return matchSearch && matchGrade && matchSub;
    });
  }, [learnersV2Data, learnersData, learnerSearch, learnerGrade, learnerSubscription]);

  const allLearnerIds = filteredLearners.map((l: any) => l.id);
  const allSelected = allLearnerIds.length > 0 && allLearnerIds.every((id: any) => selectedLearners.has(String(id)));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedLearners(new Set());
    } else {
      setSelectedLearners(new Set(allLearnerIds.map(String)));
    }
  };

  const toggleLearner = (id: string) => {
    setSelectedLearners(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif" }}>
      <AdminTopNav current="reports" />

      <div className="p-4 md:p-6 space-y-6 text-white">
        <div className="max-w-7xl mx-auto">
          <section className="relative overflow-hidden rounded-3xl bg-black p-6 sm:p-8 md:p-10 mb-6 border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-white" />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white">{language === "af" ? "Admin-konsole" : "Admin Console"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[0.98] text-white">
              {language === "af" ? "Admin-verslae" : "Admin Reports"}
            </h1>
            <p className="text-white text-sm mt-2">{language === "af" ? "Gebruikersanalise, skooloperasies en vennootopvolg" : "User analytics, school operations, and partner tracking"}</p>
          </section>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <GlowStatCard label={language === "af" ? "ðŸ‘¥ Totale Gebruikers" : "ðŸ‘¥ Total Users"} value={stats?.totalUsers ?? 0} icon={Users} accent="primary" />
            <GlowStatCard label={language === "af" ? "ðŸŽ“ Leerders" : "ðŸŽ“ Learners"} value={stats?.learners ?? 0} icon={UserCheck} accent="blue" />
            <GlowStatCard label={language === "af" ? "ðŸ‘ª Ouers" : "ðŸ‘ª Parents"} value={stats?.parents ?? 0} icon={Users} accent="cyan" />
            <GlowStatCard label={language === "af" ? "âš¡ Aktief Vandag" : "âš¡ Active Today"} value={stats?.activeToday ?? 0} icon={TrendingUp} accent="green" />
            <GlowStatCard label={language === "af" ? "ðŸ”“ Op Proeflopie" : "ðŸ”“ On Trial"} value={stats?.trialUsers ?? 0} icon={Clock} accent="amber" />
            <GlowStatCard label={language === "af" ? "ðŸ’° Ingeteken" : "ðŸ’° Subscribed"} value={stats?.subscribedUsers ?? 0} sub={language === "af" ? "R169/maand" : "R169/month"} icon={DollarSign} accent="cyan" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-5 p-1.5 rounded-2xl h-auto flex-wrap bg-black border border-[#7FEFFF]/30 shadow-[0_0_14px_rgba(127,239,255,0.18)]">
              <TabsTrigger value="overview" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors">
                <BarChart3 className="w-3.5 h-3.5" /> {language === "af" ? "Oorsig" : "Overview"}
              </TabsTrigger>
              <TabsTrigger value="learners" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors">
                <GraduationCap className="w-3.5 h-3.5" /> {language === "af" ? "Leerders" : "Learners"}
              </TabsTrigger>
              <TabsTrigger value="parents" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors">
                <Users className="w-3.5 h-3.5" /> {language === "af" ? "Ouers" : "Parents"}
              </TabsTrigger>
              <TabsTrigger value="schools" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors">
                <School className="w-3.5 h-3.5" /> {language === "af" ? "Skole" : "Schools"}
              </TabsTrigger>
              <TabsTrigger value="partners" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors">
                <Handshake className="w-3.5 h-3.5" /> {language === "af" ? "Vennote" : "Partners"}
              </TabsTrigger>
              <TabsTrigger value="clicks" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors">
                <MousePointerClick className="w-3.5 h-3.5" /> {language === "af" ? "Klikke & Proeflopies" : "Clicks & Trials"}
              </TabsTrigger>
              <TabsTrigger value="exam-pressure" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors" data-testid="tab-exam-pressure">
                <Calendar className="w-3.5 h-3.5" /> {language === "af" ? "Eksamendruk" : "Exam Pressure"}
              </TabsTrigger>
              <TabsTrigger value="gamification" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors">
                <Zap className="w-3.5 h-3.5" /> {language === "af" ? "Spelifisering" : "Gamification"}
              </TabsTrigger>
              <TabsTrigger value="reminders" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors">
                <Bell className="w-3.5 h-3.5" /> {language === "af" ? "Herinneringe" : "Reminders"}
              </TabsTrigger>
              <TabsTrigger value="focus-push" className="rounded-xl text-xs gap-1.5 px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#7FEFFF] data-[state=active]:border data-[state=active]:border-[#7FEFFF] data-[state=active]:shadow-[0_0_14px_rgba(127,239,255,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors">
                <Send className="w-3.5 h-3.5" /> {language === "af" ? "Daaglikse Stoot" : "Daily Push"}
              </TabsTrigger>
            </TabsList>

            {/* ===== OVERVIEW ===== */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-black border-white/20 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center"><Activity className="w-5 h-5 text-white" /></div>
                        <div className="text-xs text-white uppercase tracking-wider font-medium">{language === "af" ? "Aktief Hierdie Week" : "Active This Week"}</div>
                      </div>
                      <div className="text-3xl font-semibold font-heading">{stats?.activeThisWeek ?? 0}</div>
                      <div className="text-[10px] text-white mt-1">{language === "af" ? "gebruikers het hierdie week aangemeld" : "users logged in this week"}</div>
                      <MiniBar value={stats?.activeThisWeek ?? 0} max={stats?.totalUsers ?? 1} color="bg-blue-500" />
                    </CardContent>
                  </Card>
                  <Card className="bg-black border-white/20 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-white" /></div>
                        <div className="text-xs text-white uppercase tracking-wider font-medium">{language === "af" ? "Omskakelingstempo" : "Conversion Rate"}</div>
                      </div>
                      <div className="text-3xl font-semibold font-heading">{conversionRate}%</div>
                      <div className="text-[10px] text-white mt-1">{language === "af" ? "proeflopie â†’ ingeteken" : "trial â†’ subscribed"}</div>
                      <MiniBar value={conversionRate} max={100} color="bg-green-500" />
                    </CardContent>
                  </Card>
                  <Card className="bg-black border-white/20 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary" /></div>
                        <div className="text-xs text-white uppercase tracking-wider font-medium">{language === "af" ? "Maandelikse Inkomste" : "Monthly Revenue"}</div>
                      </div>
                      <div className="text-3xl font-semibold font-heading">R{formatNumber(monthlyRevenue, language)}</div>
                      <div className="text-[10px] text-white mt-1">{stats?.subscribedUsers ?? 0} Ã— R169</div>
                      <MiniBar value={monthlyRevenue} max={Math.max(monthlyRevenue, 10000)} color="bg-primary" />
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="rounded-2xl border-white/15">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><PieChart className="w-4 h-4" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 6px #7FEFFF)" }} /> {language === "af" ? "Gebruikeruitsplitsing" : "User Breakdown"}</CardTitle></CardHeader>
                    <CardContent className="p-6 pt-2">
                      <DonutChart learners={stats?.learners ?? 0} parents={stats?.parents ?? 0} admins={stats?.admins ?? 0} />
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-white/15">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4" style={{ color: "#FFF29E", filter: "drop-shadow(0 0 6px #FFF29E)" }} /> {language === "af" ? "Sleutel-insigte" : "Key Insights"}</CardTitle></CardHeader>
                    <CardContent className="p-6 pt-2 space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0"><Award className="w-4 h-4 text-white" /></div>
                        <div>
                          <div className="text-xs font-semibold">{language === "af" ? "Mees Aktief" : "Most Active"}</div>
                          <div className="text-[10px] text-white">{stats?.activeToday ?? 0} {language === "af" ? "leerders aktief vandag" : "learners active today"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                        <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0"><TrendingUp className="w-4 h-4 text-white" /></div>
                        <div>
                          <div className="text-xs font-semibold">{language === "af" ? "Omskakelingstregter" : "Conversion Funnel"}</div>
                          <div className="text-[10px] text-white">{stats?.trialUsers ?? 0} {language === "af" ? "proeflopie" : "trial"} â†’ {stats?.subscribedUsers ?? 0} {language === "af" ? "ingeteken" : "subscribed"} ({conversionRate}%)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-primary/10">
                        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0"><DollarSign className="w-4 h-4 text-primary" /></div>
                        <div>
                          <div className="text-xs font-semibold">{language === "af" ? "Inkomste-tendens" : "Revenue Trend"}</div>
                          <div className="text-[10px] text-white">{language === "af" ? `R${formatNumber(monthlyRevenue, language)}/maand van ${stats?.subscribedUsers ?? 0} intekenaars` : `R${formatNumber(monthlyRevenue, language)}/month from ${stats?.subscribedUsers ?? 0} subscribers`}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <SendTestEmailCard language={language} />
              </div>
            </TabsContent>

            {/* ===== LEARNERS ===== */}
            <TabsContent value="learners">
              <Card className="bg-black border-white/15 rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="w-4 h-4" style={{ color: "#6FA8FF", filter: "drop-shadow(0 0 6px #6FA8FF)" }} /> {language === "af" ? "Leerderbestuur" : "Learner Management"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="relative flex-1 min-w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                      <Input placeholder={language === "af" ? "Soek volgens naam, e-posâ€¦" : "Search by name, emailâ€¦"} className="pl-9 h-9 text-sm rounded-xl" value={learnerSearch} onChange={e => setLearnerSearch(e.target.value)} />
                    </div>
                    <Select value={learnerGrade} onValueChange={setLearnerGrade}>
                      <SelectTrigger className="h-9 w-32 text-sm rounded-xl"><SelectValue placeholder={language === "af" ? "Graad" : "Grade"} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === "af" ? "Alle Grade" : "All Grades"}</SelectItem>
                        {[8,9,10,11,12].map(g => <SelectItem key={g} value={String(g)}>{language === "af" ? "Graad" : "Grade"} {g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={learnerSubscription} onValueChange={setLearnerSubscription}>
                      <SelectTrigger className="h-9 w-36 text-sm rounded-xl"><SelectValue placeholder={language === "af" ? "Intekening" : "Subscription"} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === "af" ? "Alle Status" : "All Status"}</SelectItem>
                        <SelectItem value="active">{language === "af" ? "Ingeteken" : "Subscribed"}</SelectItem>
                        <SelectItem value="trial">{language === "af" ? "Proeflopie" : "Trial"}</SelectItem>
                        <SelectItem value="none">{language === "af" ? "Geen Plan" : "No Plan"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bulk actions */}
                  {selectedLearners.size > 0 && (
                    <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/20">
                      <span className="text-xs font-medium text-white">{selectedLearners.size} {language === "af" ? "gekies" : "selected"}</span>
                      <Button size="sm" className="h-7 text-[11px] gap-1 ml-2" onClick={() => bulkTrialMutation.mutate([...selectedLearners])} disabled={bulkTrialMutation.isPending}>
                        <Clock className="w-3 h-3" /> {language === "af" ? "Ken 30-dae Proeflopie Toe" : "Assign 30-day Trial"}
                      </Button>
                      <a href={`/api/admin/learners/export?ids=${[...selectedLearners].join(',')}`} download>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
                          <Download className="w-3 h-3" /> {language === "af" ? "Voer Gekose Uit" : "Export Selected"}
                        </Button>
                      </a>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] ml-auto" onClick={() => setSelectedLearners(new Set())}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-xl border border-white/15">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/[0.03] hover:bg-white/[0.03]">
                          <TableHead className="w-10">
                            <button onClick={toggleSelectAll} className="text-white hover:text-white">
                              {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-primary" /> : <Square className="w-3.5 h-3.5" />}
                            </button>
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Leerder" : "Learner"}</TableHead>
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Graad" : "Grade"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Status" : "Status"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Vrae" : "Questions"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Akkuraatheid" : "Accuracy"}</TableHead>
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Laaste Aktief" : "Last Active"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white w-12">{language === "af" ? "Aksie" : "Action"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLearners.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0">
                              <EmptyState icon={GraduationCap} title={language === "af" ? "Geen leerders gevind nie" : "No learners found"} description={language === "af" ? "Probeer jou filters of soekterm aanpas." : "Try adjusting your filters or search term."} />
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLearners.map((l: any, i: number) => {
                            const sid = String(l.id);
                            const isSelected = selectedLearners.has(sid);
                            return (
                              <TableRow key={l.id || i} className={`hover:bg-white/[0.04] even:bg-white/[0.02] ${isSelected ? "bg-white/[0.04]" : ""}`}>
                                <TableCell>
                                  <button onClick={() => toggleLearner(sid)} className="text-white hover:text-white">
                                    {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-primary" /> : <Square className="w-3.5 h-3.5" />}
                                  </button>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium text-sm">{l.first_name || ''} {l.last_name || ''}</div>
                                  <div className="text-[10px] text-white">{l.email}</div>
                                  {l.school_name && <div className="text-[10px] text-white">{l.school_name}</div>}
                                </TableCell>
                                <TableCell className="text-sm">{l.grade ? (language === "af" ? `Gr ${l.grade}` : `Gr ${l.grade}`) : "â€”"}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className={`text-[10px] h-5 ${l.subscription_status === 'active' ? "bg-white/10 border-white/30 text-white" : l.subscription_status === 'trial' ? "bg-white/10 border-white/30 text-white" : "bg-muted/50 text-white border-muted"}`}>
                                    {l.subscription_status === 'active' ? (language === "af" ? "Ingeteken" : "Subscribed") : l.subscription_status === 'trial' ? (language === "af" ? "Proeflopie" : "Trial") : (language === "af" ? "Geen" : "None")}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center text-sm">{formatNumber(Number(l.questions_attempted), language)}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className={`text-[10px] ${Number(l.accuracy) >= 70 ? "bg-white/10 border-white/30 text-white" : "bg-white/10 border-white/30 text-white"}`}>
                                    {l.accuracy}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-white">
                                  {l.last_active_at ? formatDate(l.last_active_at, language, {}) : "â€”"}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    onClick={() => setPendingDelete({
                                      id: sid,
                                      label: `${l.first_name || ''} ${l.last_name || ''}`.trim() || l.email || sid,
                                    })}
                                    title={language === "af" ? "Verwyder leerder" : "Delete learner"}
                                    data-testid={`button-delete-learner-${sid}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredLearners.length > 0 && (
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] text-white">{filteredLearners.length} {language === "af" ? "leerder(s)" : "learner(s)"}</span>
                      <a href="/api/admin/learners/export" download>
                        <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
                          <Download className="w-3 h-3" /> {language === "af" ? "Voer Alles Uit" : "Export All"}
                        </Button>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== PARENTS ===== */}
            <TabsContent value="parents">
              <Card className="bg-black border-white/15 rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" style={{ color: "#C6A4FF", filter: "drop-shadow(0 0 6px #C6A4FF)" }} /> {language === "af" ? "Ouerrekeninge" : "Parent Accounts"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    <Input placeholder={language === "af" ? "Soek ouersâ€¦" : "Search parentsâ€¦"} className="pl-9 h-9 text-sm rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/15">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/[0.03] hover:bg-white/[0.03]">
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Ouer" : "Parent"}</TableHead>
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Kinders" : "Children"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Vakke" : "Subjects"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Gem. Akkuraatheid" : "Avg Accuracy"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Vrae" : "Questions"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Intekening" : "Subscription"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white w-12">{language === "af" ? "Aksie" : "Action"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(parentReportsData?.reports ?? []).length === 0 ? (
                          <TableRow><TableCell colSpan={7} className="p-0"><EmptyState icon={Users} title={language === "af" ? "Nog geen ouerrekeninge nie" : "No parent accounts yet"} description={language === "af" ? "Ouerdata sal opdateer namate ouers registreer en hul kinders se rekeninge skakel." : "Parent data will populate as parents register and link their children's accounts."} /></TableCell></TableRow>
                        ) : (
                          (parentReportsData?.reports ?? []).filter(r => r.parentName?.toLowerCase().includes(search.toLowerCase())).map((r: any, i: number) => (
                            <TableRow key={i} className="hover:bg-white/[0.04] even:bg-white/[0.02]">
                              <TableCell className="font-medium text-sm">{r.parentName}</TableCell>
                              <TableCell className="text-sm">{r.childCount}</TableCell>
                              <TableCell className="text-center text-sm">{r.subjectCount}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className={`text-[10px] ${r.accuracy >= 70 ? "bg-white/10 border-white/30 text-white" : "bg-white/10 border-white/30 text-white"}`}>{r.accuracy}%</Badge>
                              </TableCell>
                              <TableCell className="text-center text-sm">{r.questionsAnswered}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className={`text-[10px] ${r.isSubscribed ? "bg-white/10 border-white/30 text-white" : "bg-white/10 border-white/30 text-white"}`}>
                                  {r.isSubscribed ? (language === "af" ? "Aktief" : "Active") : (language === "af" ? "Proeflopie" : "Trial")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {r.parentId ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    onClick={() => setPendingDelete({ id: r.parentId, label: r.parentName || r.parentEmail || r.parentId })}
                                    title={language === "af" ? "Verwyder ouer" : "Delete parent"}
                                    data-testid={`button-delete-parent-${r.parentId}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                ) : null}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== SCHOOLS ===== */}
            <TabsContent value="schools">
              <div className="flex gap-5">
                {/* Main schools list */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="bg-black rounded-2xl p-4 border border-white/20 flex items-center justify-between gap-3">
                    <p className="text-xs flex items-center gap-2">
                      <School className="w-4 h-4 text-white shrink-0" />
                      <span>{language === "af" ? <><strong>Skole verdien R35/maand per aktiewe ingetekende leerder.</strong> Klik op 'n skool om sy volle profiel te sien.</> : <><strong>Schools earn R35/month per active subscribed learner.</strong> Click a school to view its full profile.</>}</span>
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5 border-white/30 text-white hover:bg-white/10"
                        onClick={() => { setBulkResult(null); setBulkText(""); setShowBulkImport(true); }}
                        data-testid="button-bulk-import-schools"
                      >
                        <FileText className="w-3.5 h-3.5" /> {language === "af" ? "Massa-invoer" : "Bulk Import"}
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1.5 border-white/30 text-white hover:bg-white/10" onClick={() => setShowOnboarding(true)}>
                        <Plus className="w-3.5 h-3.5" /> {language === "af" ? "Voeg Skool By" : "Onboard School"}
                      </Button>
                    </div>
                  </div>

                  <Card className="bg-black border-white/15 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><School className="w-4 h-4" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 6px #7FEFFF)" }} /> {language === "af" ? "Skoolbedrywighede" : "School Operations"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto rounded-xl border border-white/15">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-white/[0.03] hover:bg-white/[0.03]">
                              <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Skool" : "School"}</TableHead>
                              <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Provinsie" : "Province"}</TableHead>
                              <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Onderskrywing" : "Endorsement"}</TableHead>
                              <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Proeflopie" : "Trial"}</TableHead>
                              <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Leerders" : "Learners"}</TableHead>
                              <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "R35 Waarde" : "R35 Value"}</TableHead>
                              <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Akkuraatheid" : "Accuracy"}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(schoolsData?.schools ?? []).length === 0 ? (
                              <TableRow><TableCell colSpan={7} className="p-0"><EmptyState icon={School} title={language === "af" ? "Nog geen skole nie" : "No schools yet"} description={language === "af" ? "Voeg jou eerste skool by met die knoppie hierbo." : "Onboard your first school using the button above."} /></TableCell></TableRow>
                            ) : (
                              (schoolsData?.schools ?? []).map((s, i) => (
                                <TableRow
                                  key={s.id ?? i}
                                  className={`hover:bg-white/[0.04] even:bg-white/[0.02] cursor-pointer transition-colors ${selectedSchoolId === s.id ? "bg-white/[0.04] border-l-2 border-l-primary" : ""}`}
                                  onClick={() => setSelectedSchoolId(selectedSchoolId === s.id ? null : (s.id ?? null))}
                                >
                                  <TableCell>
                                    <div className="font-medium text-sm">{s.schoolName}</div>
                                    {s.gradeRange && <div className="text-[10px] text-white">{language === "af" ? "Grade" : "Grades"} {s.gradeRange}</div>}
                                  </TableCell>
                                  <TableCell className="text-sm">{s.province}</TableCell>
                                  <TableCell className="text-center"><EndorsementBadge status={s.endorsementStatus ?? "none"} /></TableCell>
                                  <TableCell className="text-center"><TrialCountdown expiryDate={s.trialExpiryDate} /></TableCell>
                                  <TableCell className="text-center text-sm font-medium">{s.learnerCount}</TableCell>
                                  <TableCell className="text-center font-semibold text-white text-sm">R{formatNumber(s.learnerCount * 35, language)}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className={`text-[10px] ${s.avgAccuracy >= 70 ? "bg-white/10 border-white/30 text-white" : "bg-white/10 border-white/30 text-white"}`}>
                                      {s.avgAccuracy}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* School detail side panel */}
                {selectedSchoolId && (
                  <div className="w-96 flex-shrink-0">
                    <Card className="bg-black border-white/15 rounded-2xl sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
                      <CardContent className="p-4">
                        <SchoolDetailPanel schoolId={selectedSchoolId} onClose={() => setSelectedSchoolId(null)} />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ===== PARTNERS ===== */}
            <TabsContent value="partners">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
                <p className="text-xs flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-white shrink-0" />
                  <span>{language === "af" ? <><strong>Vennote verdien kommissie per omgeskakelde leerder.</strong> Elke vennoot kry 'n unieke verwysingskode + skakel.</> : <><strong>Partners earn commission per converted learner.</strong> Each partner gets a unique referral code + link.</>}</span>
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                    onClick={() => { setPartnerBulkResult(null); setPartnerBulkText(""); setShowPartnerBulk(true); }}
                    data-testid="button-bulk-import-partners"
                  >
                    <FileText className="w-3.5 h-3.5" /> {language === "af" ? "Massa-invoer" : "Bulk Import"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                    onClick={() => setShowAddPartner(true)}
                    data-testid="button-add-partner"
                  >
                    <Plus className="w-3.5 h-3.5" /> {language === "af" ? "Voeg Vennoot By" : "Add Partner"}
                  </Button>
                </div>
              </div>
              <Card className="bg-black border-white/15 rounded-2xl">
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Handshake className="w-4 h-4" style={{ color: "#FFC48F", filter: "drop-shadow(0 0 6px #FFC48F)" }} /> {language === "af" ? "Vennoot-verwysings & Kommissie" : "Partner Referrals & Commission"}</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-xl border border-white/15">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/[0.03] hover:bg-white/[0.03]">
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Vennoot" : "Partner"}</TableHead>
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Verwysingskode" : "Referral Code"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Verwysings" : "Referrals"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Omskakelings" : "Conversions"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Inkomste" : "Revenue"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Kommissie" : "Commission"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(partnersData?.partners ?? []).length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="p-0"><EmptyState icon={Handshake} title={language === "af" ? "Nog geen vennoot-verwysings nie" : "No partner referrals yet"} description={language === "af" ? "Vennote sal hier verskyn wanneer verwysingskodes deur leerders gebruik word." : "Partners will appear here when referral codes are used by learners."} /></TableCell></TableRow>
                        ) : (
                          (partnersData?.partners ?? []).map((p, i) => (
                            <TableRow key={i} className="hover:bg-white/[0.04] even:bg-white/[0.02]">
                              <TableCell className="font-medium text-sm">{p.partnerName}</TableCell>
                              <TableCell><code className="text-[10px] bg-muted/70 px-2 py-1 rounded-md font-mono">{p.partnerCode}</code></TableCell>
                              <TableCell className="text-center text-sm">{p.referrals}</TableCell>
                              <TableCell className="text-center text-sm">{p.conversions}</TableCell>
                              <TableCell className="text-center text-sm font-medium">R{formatNumber(p.revenue, language)}</TableCell>
                              <TableCell className="text-center font-semibold text-white text-sm">R{formatNumber(p.commission, language)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== CLICKS & TRIALS ===== */}
            <TabsContent value="clicks">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <GlowStatCard label={language === "af" ? "Totale Klikke" : "Total Clicks"} value={partnerStatsData?.totalClicks ?? 0} icon={MousePointerClick} accent="blue" />
                <GlowStatCard label={language === "af" ? "Proefbeginne" : "Trial Starts"} value={partnerStatsData?.totalTrials ?? 0} icon={UserCheck} accent="green" />
                <GlowStatCard
                  label={language === "af" ? "Klik â†’ Proeflopie %" : "Click â†’ Trial %"}
                  value={partnerStatsData && partnerStatsData.totalClicks > 0
                    ? `${Math.round((partnerStatsData.totalTrials / partnerStatsData.totalClicks) * 100)}%`
                    : "0%"}
                  icon={TrendingUp}
                  accent="amber"
                />
              </div>
              <Card className="bg-black border-white/15 rounded-2xl">
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MousePointerClick className="w-4 h-4" style={{ color: "#FF9FE5", filter: "drop-shadow(0 0 6px #FF9FE5)" }} /> {language === "af" ? "Vennootskakel-klikke & Proeflopie-toeskrywing" : "Partner Link Clicks & Trial Attribution"}</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-xl border border-white/15">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/[0.03] hover:bg-white/[0.03]">
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Bron" : "Source"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Klikke" : "Clicks"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Proefbeginne" : "Trial Starts"}</TableHead>
                          <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Omskakeling %" : "Conversion %"}</TableHead>
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Eerste Klik" : "First Click"}</TableHead>
                          <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Laaste Klik" : "Last Click"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(partnerStatsData?.stats ?? []).length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="p-0"><EmptyState icon={MousePointerClick} title={language === "af" ? "Nog geen vennootskakel-klikke nie" : "No partner link clicks yet"} description={language === "af" ? "Statistieke sal opdateer namate vennootskakels deur potensiÃ«le gebruikers besoek word." : "Stats will populate as partner links are visited by potential users."} /></TableCell></TableRow>
                        ) : (
                          (partnerStatsData?.stats ?? []).map((s: any, i: number) => {
                            const convPct = s.clicks > 0 ? Math.round((s.trialStarts / s.clicks) * 100) : 0;
                            return (
                              <TableRow key={i} className="hover:bg-white/[0.04] even:bg-white/[0.02]">
                                <TableCell><code className="text-[10px] bg-muted/70 px-2 py-1 rounded-md font-mono">{s.source}</code></TableCell>
                                <TableCell className="text-center text-sm font-medium">{s.clicks}</TableCell>
                                <TableCell className="text-center text-sm font-medium">{s.trialStarts}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className={`text-[10px] ${convPct >= 20 ? "bg-white/10 border-white/30 text-white" : convPct >= 5 ? "bg-white/10 border-white/30 text-white" : "bg-red-500/10 border-red-500/30 text-white"}`}>{convPct}%</Badge>
                                </TableCell>
                                <TableCell className="text-xs text-white">{s.firstClick ? formatDate(s.firstClick, language, {}) : 'â€”'}</TableCell>
                                <TableCell className="text-xs text-white">{s.lastClick ? formatDate(s.lastClick, language, {}) : 'â€”'}</TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Role-based attribution breakdown */}
              <Card className="bg-black border-white/15 rounded-2xl mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-white" /> {language === "af" ? "Rol-toeskrywingsuitsplitsing" : "Role Attribution Breakdown"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-white mb-4">
                    {language === "af" ? "Aanmeldings en klikke toegeskryf aan" : "Sign-ups and clicks attributed to"} <code className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">?ref=partner</code>,{" "}
                    <code className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">?ref=channel</code>, {language === "af" ? "en" : "and"}{" "}
                    <code className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">?ref=growth</code> {language === "af" ? "skakels." : "links."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["ref:partner", "ref:channel", "ref:growth"].map((source) => {
                      const stat = (partnerStatsData?.stats ?? []).find((s: any) => s.source === source);
                      const label = source === "ref:partner"
                        ? (language === "af" ? "Vennoot" : "Partner")
                        : source === "ref:channel"
                          ? (language === "af" ? "Kanaal-leier" : "Channel Lead")
                          : (language === "af" ? "Groei-leier" : "Growth Lead");
                      const accent = source === "ref:partner" ? "text-white bg-cyan-500/10 border-cyan-500/20" : source === "ref:channel" ? "text-white bg-cyan-500/10 border-cyan-500/20" : "text-white bg-emerald-500/10 border-emerald-500/20";
                      return (
                        <div key={source} className={`rounded-2xl border p-4 ${accent}`}>
                          <p className="text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-2xl font-bold">{stat?.clicks ?? 0}</p>
                          <p className="text-[10px] mt-0.5 opacity-80">{language === "af" ? "klikke" : "clicks"} Â· {stat?.trialStarts ?? 0} {language === "af" ? "proeflopies" : "trials"}</p>
                          <div className="mt-2">
                            <code className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded font-mono">{source}</code>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* ===== EXAM PRESSURE TAB (T114) ===== */}
            <TabsContent value="exam-pressure">
              <ExamPressureView />
            </TabsContent>

            <GamificationTab />

            <TabsContent value="reminders">
              <ReminderCampaignView />
            </TabsContent>

            <TabsContent value="focus-push">
              <DailyFocusPushView />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* School Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent
          className="w-[95vw] sm:w-auto sm:max-w-xl max-h-[90vh] overflow-y-auto bg-black text-white p-5 sm:p-6"
          style={{ border: "1px solid rgba(127,239,255,0.6)", boxShadow: "0 18px 50px -22px rgba(127,239,255,0.5)" }}
        >
          <DialogHeader className="pb-3 mb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <DialogTitle className="flex items-center gap-2.5 text-base font-black tracking-tight">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-black"
                style={{ border: "1px solid #7FEFFF", boxShadow: "0 0 8px rgba(127,239,255,0.4)" }}
              >
                <School className="w-3.5 h-3.5" style={{ color: "#7FEFFF" }} />
              </span>
              <span className="text-white">
                {language === "af" ? "Voeg Nuwe Skool By" : "Onboard New School"}
              </span>
            </DialogTitle>
            <p className="text-[11px] text-white mt-1.5 leading-relaxed">
              {language === "af" ? "Proeflopie, kontakte en waardeprojeksie in een vloei." : "Trial, contacts and value projection in one flow."}
            </p>
          </DialogHeader>
          <SchoolOnboardingForm
            onClose={() => setShowOnboarding(false)}
            onSuccess={() => setShowOnboarding(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School className="w-4 h-4" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 6px #7FEFFF)" }} /> {language === "af" ? "Massa-invoer Skole" : "Bulk Import Schools"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-xs text-white space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border">
              {language === "af" ? (
                <>
                  <p><strong>Twee formate ondersteun:</strong></p>
                  <p><strong>CSV</strong> â€” eerste ry opsionele opskrifte (name, province, district, contactName, contactEmail, contactPhone, schoolType, gradeRange, expectedLearnerCount, schoolCode, notes). Sonder opskrifte word kolomme in daardie volgorde gelees.</p>
                  <p><strong>JSON</strong> â€” plak 'n skikking van objekte bv. <code className="text-[10px]">[{`{"name":"Sandton High","province":"Gauteng"}`}]</code></p>
                  <p>Duplikate (dieselfde naam of schoolCode) word outomaties oorgeslaan. Ontbrekende schoolCode word outogenereer.</p>
                </>
              ) : (
                <>
                  <p><strong>Two formats supported:</strong></p>
                  <p><strong>CSV</strong> â€” first row optional headers (name, province, district, contactName, contactEmail, contactPhone, schoolType, gradeRange, expectedLearnerCount, schoolCode, notes). Without headers, columns are read in that order.</p>
                  <p><strong>JSON</strong> â€” paste an array of objects e.g. <code className="text-[10px]">[{`{"name":"Sandton High","province":"Gauteng"}`}]</code></p>
                  <p>Duplicates (same name or schoolCode) are skipped automatically. Missing schoolCode is auto-generated.</p>
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-white mb-1.5 block">{language === "af" ? "Plak skole" : "Paste schools"}</label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={language === "af"
                  ? "naam,provinsie,distrik,kontakEpos\nSandton HoÃ«r,Gauteng,Johannesburg Noord,office@sandtonhigh.co.za\nDurban Meisies,KwaZulu-Natal,Durban,info@durbangirls.org"
                  : "name,province,district,contactEmail\nSandton High,Gauteng,Johannesburg North,office@sandtonhigh.co.za\nDurban Girls,KwaZulu-Natal,Durban,info@durbangirls.org"}
                className="font-mono text-xs min-h-[200px]"
                data-testid="textarea-bulk-schools"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-white">
                  {(() => {
                    const { rows, error } = parseBulkSchools(bulkText);
                    if (error) return <span className="text-amber-600">{error}</span>;
                    return language === "af"
                      ? `${rows.length} skool${rows.length === 1 ? "" : "e"} gereed om in te voer`
                      : `${rows.length} school${rows.length === 1 ? "" : "s"} ready to import`;
                  })()}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setBulkText(""); setBulkResult(null); }}
                    data-testid="button-bulk-clear"
                  >
                    {language === "af" ? "Maak skoon" : "Clear"}
                  </Button>
                  <Button
                    size="sm"
                    disabled={bulkImportMutation.isPending}
                    onClick={() => {
                      const { rows, error } = parseBulkSchools(bulkText);
                      if (error || rows.length === 0) {
                        toast({ title: language === "af" ? "Kan nie invoer nie" : "Cannot import", description: error ?? (language === "af" ? "Niks om in te voer nie" : "Nothing to import"), variant: "destructive" });
                        return;
                      }
                      bulkImportMutation.mutate(rows);
                    }}
                    data-testid="button-bulk-submit"
                  >
                    {bulkImportMutation.isPending ? (language === "af" ? "Voer inâ€¦" : "Importingâ€¦") : (language === "af" ? "Voer in" : "Import")}
                  </Button>
                </div>
              </div>
            </div>

            {bulkResult && (
              <div className="space-y-2 border-t border-border pt-3">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-border p-2">
                    <p className="text-lg font-bold tabular-nums">{bulkResult.summary?.received ?? 0}</p>
                    <p className="text-[10px] text-white uppercase">{language === "af" ? "Ontvang" : "Received"}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2">
                    <p className="text-lg font-bold tabular-nums text-emerald-600">{bulkResult.summary?.inserted ?? 0}</p>
                    <p className="text-[10px] text-white uppercase">{language === "af" ? "Ingevoeg" : "Inserted"}</p>
                  </div>
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-2">
                    <p className="text-lg font-bold tabular-nums text-amber-600">{bulkResult.summary?.skipped ?? 0}</p>
                    <p className="text-[10px] text-white uppercase">{language === "af" ? "Oorgeslaan" : "Skipped"}</p>
                  </div>
                  <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-2">
                    <p className="text-lg font-bold tabular-nums text-red-600">{bulkResult.summary?.failed ?? 0}</p>
                    <p className="text-[10px] text-white uppercase">{language === "af" ? "Misluk" : "Failed"}</p>
                  </div>
                </div>
                {(bulkResult.skipped?.length > 0 || bulkResult.failed?.length > 0) && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-white">{language === "af" ? "Sien besonderhede" : "View details"}</summary>
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {bulkResult.skipped?.map((s: any, i: number) => (
                        <div key={`sk-${i}`} className="text-amber-700">{language === "af" ? "Ry" : "Row"} {s.row}: {s.name} â€” {s.reason}</div>
                      ))}
                      {bulkResult.failed?.map((f: any, i: number) => (
                        <div key={`fl-${i}`} className="text-red-700">{language === "af" ? "Ry" : "Row"} {f.row}: {f.name ?? (language === "af" ? "(geen naam)" : "(no name)")} â€” {f.reason}</div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Partner dialog */}
      <Dialog open={showAddPartner} onOpenChange={setShowAddPartner}>
        <DialogContent
          className="w-[95vw] sm:w-auto sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-black text-white p-5 sm:p-6"
          style={{ border: "1.5px solid #FFC48F", boxShadow: "0 0 0 1px rgba(255,196,143,0.3), 0 0 32px rgba(255,196,143,0.35), inset 0 0 24px rgba(0,0,0,0.6)" }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black tracking-tight">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-black"
                style={{ border: "1.5px solid #FFC48F", boxShadow: "0 0 12px rgba(255,196,143,0.5)" }}
              >
                <Handshake className="w-4 h-4" style={{ color: "#FFC48F", filter: "drop-shadow(0 0 4px #FFC48F)" }} />
              </span>
              <span
                style={{
                  background: "linear-gradient(90deg, #FFC48F, #FFC48F, #FFF29E, #FFF29E)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {language === "af" ? "Voeg Vennoot By" : "Add Partner"}
              </span>
            </DialogTitle>
            <p className="text-[11px] text-white mt-0.5">
              {language === "af" ? "Vennote verdien kommissie op elke proeflopie wat deur hul verwysingskakel omgeskakel word." : "Partners earn commission on every trial converted through their referral link."}
            </p>
          </DialogHeader>
          {(() => {
            const emailRaw = partnerForm.contactEmail.trim();
            const emailOk = !emailRaw || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw);
            const codeRaw = partnerForm.schoolCode.trim();
            const codeOk = !codeRaw || /^[A-Z0-9]{3,12}$/.test(codeRaw);
            const phoneDigits = partnerForm.contactPhone.replace(/\D+/g, "");
            const phoneOk = !partnerForm.contactPhone || phoneDigits.length === 0 || phoneDigits.length === 11;
            const commNum = Number(partnerForm.commissionRate);
            const commOk = Number.isFinite(commNum) && commNum >= 0 && commNum <= 100;
            const nameOk = partnerForm.schoolName.trim().length >= 2;
            const canSubmit = nameOk && emailOk && codeOk && phoneOk && commOk && !addPartnerMutation.isPending;
            const fieldBase = "w-full text-sm rounded-lg px-3 py-2 bg-black text-white placeholder:text-white focus:outline-none transition-none";
            const fieldStyle = (ok: boolean) => ({
              border: ok ? "1px solid rgba(255,196,143,0.35)" : "1px solid #ef4444",
              boxShadow: ok ? "inset 0 0 8px rgba(0,0,0,0.5)" : "0 0 10px rgba(239,68,68,0.4), inset 0 0 8px rgba(0,0,0,0.5)",
            });
            const labelCls = "text-[10px] font-black uppercase tracking-[0.1em] mb-1.5 block whitespace-nowrap";
            const provinces = [
              "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
              "Mpumalanga", "Northern Cape", "North West", "Western Cape",
            ];
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className={labelCls} style={{ color: "#FFF29E" }}>
                      {language === "af" ? "Vennoot / skool naam" : "Partner / school name"} <span style={{ color: "#FFC48F" }}>*</span>
                    </label>
                    <input
                      className={fieldBase}
                      style={fieldStyle(nameOk || !partnerForm.schoolName)}
                      value={partnerForm.schoolName}
                      onChange={e => setPartnerForm(f => ({ ...f, schoolName: e.target.value }))}
                      placeholder={language === "af" ? "bv. Bright Future Tutors" : "e.g. Bright Future Tutors"}
                      autoFocus
                      data-testid="input-partner-name"
                    />
                  </div>

                  <div>
                    <label className={labelCls} style={{ color: "#7FEFFF" }}>{language === "af" ? "Verwysingskode" : "Referral code"}</label>
                    <input
                      className={`${fieldBase} font-mono uppercase tracking-[0.12em]`}
                      style={fieldStyle(codeOk)}
                      value={partnerForm.schoolCode}
                      onChange={e => setPartnerForm(f => ({ ...f, schoolCode: e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12) }))}
                      placeholder={language === "af" ? "outomaties gegenereer" : "auto-generated"}
                      maxLength={12}
                      data-testid="input-partner-code"
                    />
                    <p className="text-[10px] mt-1" style={{ color: codeOk ? "rgba(255,255,255,0.5)" : "#ef4444" }}>
                      {codeOk ? (language === "af" ? "Laat leeg om outomaties te genereer Â· 3â€“12 letters/syfers" : "Leave blank to auto-generate Â· 3â€“12 letters/numbers") : (language === "af" ? "Slegs 3â€“12 letters/syfers" : "3â€“12 letters/numbers only")}
                    </p>
                  </div>

                  <div>
                    <label className={labelCls} style={{ color: "#FFF29E" }}>{language === "af" ? "Kommissie %" : "Commission %"}</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        className={`${fieldBase} pr-8`}
                        style={fieldStyle(commOk)}
                        value={partnerForm.commissionRate}
                        onChange={e => setPartnerForm(f => ({ ...f, commissionRate: e.target.value }))}
                        data-testid="input-partner-commission"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black" style={{ color: "#FFF29E" }}>%</span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: commOk ? "rgba(255,255,255,0.5)" : "#ef4444" }}>
                      {language === "af" ? "Per leerder Â· verstek 10%" : "Per learner Â· default 10%"}
                    </p>
                  </div>

                  <div>
                    <label className={labelCls} style={{ color: "#C6A4FF" }}>{language === "af" ? "Kontak naam" : "Contact name"}</label>
                    <input
                      className={fieldBase}
                      style={fieldStyle(true)}
                      value={partnerForm.contactName}
                      onChange={e => setPartnerForm(f => ({ ...f, contactName: e.target.value }))}
                      placeholder={language === "af" ? "Volle naam" : "Full name"}
                    />
                  </div>

                  <div>
                    <label className={labelCls} style={{ color: "#C6A4FF" }}>{language === "af" ? "Kontak e-pos" : "Contact email"}</label>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      className={fieldBase}
                      style={fieldStyle(emailOk)}
                      value={partnerForm.contactEmail}
                      onChange={e => setPartnerForm(f => ({ ...f, contactEmail: e.target.value }))}
                      placeholder="partner@example.co.za"
                    />
                    {!emailOk && <p className="text-[10px] mt-1" style={{ color: "#ef4444" }}>{language === "af" ? "Nie 'n geldige e-pos nie" : "Not a valid email"}</p>}
                  </div>

                  <div>
                    <label className={labelCls} style={{ color: "#7FEFFF" }}>{language === "af" ? "Kontak telefoon" : "Contact phone"}</label>
                    <input
                      className={fieldBase}
                      style={fieldStyle(phoneOk)}
                      value={partnerForm.contactPhone}
                      onChange={e => setPartnerForm(f => ({ ...f, contactPhone: formatSAPhone(e.target.value) }))}
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={17}
                      placeholder="+27 XX XXX XXXX"
                    />
                    {!phoneOk && <p className="text-[10px] mt-1" style={{ color: "#ef4444" }}>{language === "af" ? "Benodig 9 syfers na +27" : "Needs 9 digits after +27"}</p>}
                  </div>

                  <div>
                    <label className={labelCls} style={{ color: "#C6A4FF" }}>{language === "af" ? "Provinsie" : "Province"}</label>
                    <select
                      className={fieldBase}
                      style={fieldStyle(true)}
                      value={partnerForm.province}
                      onChange={e => setPartnerForm(f => ({ ...f, province: e.target.value }))}
                    >
                      <option value="">{language === "af" ? "Kiesâ€¦" : "Selectâ€¦"}</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls} style={{ color: "#C6A4FF" }}>{language === "af" ? "Distrik" : "District"}</label>
                    <input
                      className={fieldBase}
                      style={fieldStyle(true)}
                      value={partnerForm.district}
                      onChange={e => setPartnerForm(f => ({ ...f, district: e.target.value }))}
                      placeholder={language === "af" ? "bv. Johannesburg Sentraal" : "e.g. Johannesburg Central"}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls} style={{ color: "#FF9FE5" }}>{language === "af" ? "Notas" : "Notes"}</label>
                    <Textarea
                      value={partnerForm.notes}
                      onChange={e => setPartnerForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder={language === "af" ? "Enige nuttige inligting oor hierdie vennoot â€” ooreengekome voorwaardes, intro-bron, ens." : "Anything useful about this partner â€” agreed terms, intro source, etc."}
                      className="text-sm min-h-[70px] bg-black text-white placeholder:text-white"
                      style={{ border: "1px solid rgba(255,159,229,0.35)", boxShadow: "inset 0 0 8px rgba(0,0,0,0.5)" }}
                    />
                  </div>
                </div>

                <div
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-black"
                  style={{ border: "1px solid rgba(127,239,255,0.35)" }}
                >
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 3px #7FEFFF)" }} />
                  <p className="text-[11px] text-white leading-relaxed">
                    {language === "af" ? "Nadat ons geskep het, sal ons 'n unieke verwysings-URL genereer. Deel dit met die vennoot â€” elke proeflopie-aanmelding vanaf hul skakel verdien hulle die kommissie hierbo." : "After creating, we'll generate a unique referral URL. Share it with the partner â€” every trial signup from their link earns them the commission above."}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddPartner(false)}
                    className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition-none hover:text-white"
                    style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    {language === "af" ? "Kanselleer" : "Cancel"}
                  </button>
                  <button
                    disabled={!canSubmit}
                    onClick={() => addPartnerMutation.mutate()}
                    data-testid="button-create-partner"
                    className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-none disabled:opacity-40"
                    style={{ color: "#FFC48F", border: "1.5px solid #FFC48F", boxShadow: "0 0 18px rgba(255,196,143,0.5), inset 0 0 8px rgba(255,196,143,0.18)" }}
                  >
                    {addPartnerMutation.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {language === "af" ? "Skepâ€¦" : "Creatingâ€¦"}</> : <><Handshake className="w-3.5 h-3.5" /> {language === "af" ? "Skep vennoot" : "Create partner"}</>}
                  </button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Partners dialog */}
      <Dialog open={showPartnerBulk} onOpenChange={setShowPartnerBulk}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-4 h-4" style={{ color: "#FFC48F", filter: "drop-shadow(0 0 6px #FFC48F)" }} /> {language === "af" ? "Massa-invoer Vennote" : "Bulk Import Partners"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-xs text-white space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border">
              <p><strong>{language === "af" ? "Twee formate ondersteun:" : "Two formats supported:"}</strong></p>
              <p><strong>CSV</strong> â€” {language === "af"
                ? "eerste ry opsionele opskrifte (name, contactEmail, contactPhone, schoolCode, commissionRate, province, district, notes). Sonder opskrifte word kolomme in daardie volgorde gelees."
                : "first row optional headers (name, contactEmail, contactPhone, schoolCode, commissionRate, province, district, notes). Without headers, columns are read in that order."}</p>
              <p><strong>JSON</strong> â€” {language === "af" ? "plak 'n skikking van objekte, bv." : "paste an array of objects, e.g."} <code className="text-[10px]">[{`{"name":"Bright Future Tutors","contactEmail":"info@bft.co.za","commissionRate":15}`}]</code></p>
              <p>{language === "af"
                ? "Elke vennoot kry 'n unieke verwysingskode (outomaties gegenereer indien nie verskaf nie). Duplikate word oorgeslaan."
                : "Each partner gets a unique referral code (auto-generated if not supplied). Duplicates are skipped."}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-white mb-1.5 block">{language === "af" ? "Plak vennote" : "Paste partners"}</label>
              <Textarea
                value={partnerBulkText}
                onChange={(e) => setPartnerBulkText(e.target.value)}
                placeholder={language === "af"
                  ? "naam,kontakEpos,kommissieKoers\nBright Future Tutors,info@bft.co.za,15\nMatric Mentors,hello@matricmentors.co.za,12"
                  : "name,contactEmail,commissionRate\nBright Future Tutors,info@bft.co.za,15\nMatric Mentors,hello@matricmentors.co.za,12"}
                className="font-mono text-xs min-h-[200px]"
                data-testid="textarea-bulk-partners"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-white">
                  {(() => {
                    const { rows, error } = parseBulkPartners(partnerBulkText);
                    if (error) return <span className="text-amber-600">{error}</span>;
                    return language === "af"
                      ? `${rows.length} ${rows.length === 1 ? "vennoot" : "vennote"} gereed om in te voer`
                      : `${rows.length} partner${rows.length === 1 ? "" : "s"} ready to import`;
                  })()}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setPartnerBulkText(""); setPartnerBulkResult(null); }}>{language === "af" ? "Maak skoon" : "Clear"}</Button>
                  <Button
                    size="sm"
                    disabled={partnerBulkMutation.isPending}
                    onClick={() => {
                      const { rows, error } = parseBulkPartners(partnerBulkText);
                      if (error || rows.length === 0) {
                        toast({ title: language === "af" ? "Kan nie invoer nie" : "Cannot import", description: error ?? (language === "af" ? "Niks om in te voer nie" : "Nothing to import"), variant: "destructive" });
                        return;
                      }
                      partnerBulkMutation.mutate(rows);
                    }}
                    data-testid="button-bulk-partners-submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {partnerBulkMutation.isPending ? (language === "af" ? "Voer inâ€¦" : "Importingâ€¦") : (language === "af" ? "Voer in" : "Import")}
                  </Button>
                </div>
              </div>
            </div>
            {partnerBulkResult && (
              <div className="space-y-2 border-t border-border pt-3">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-border p-2">
                    <p className="text-lg font-bold tabular-nums">{partnerBulkResult.summary?.received ?? 0}</p>
                    <p className="text-[10px] text-white uppercase">{language === "af" ? "Ontvang" : "Received"}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2">
                    <p className="text-lg font-bold tabular-nums text-emerald-600">{partnerBulkResult.summary?.inserted ?? 0}</p>
                    <p className="text-[10px] text-white uppercase">{language === "af" ? "Ingevoeg" : "Inserted"}</p>
                  </div>
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-2">
                    <p className="text-lg font-bold tabular-nums text-amber-600">{partnerBulkResult.summary?.skipped ?? 0}</p>
                    <p className="text-[10px] text-white uppercase">{language === "af" ? "Oorgeslaan" : "Skipped"}</p>
                  </div>
                  <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-2">
                    <p className="text-lg font-bold tabular-nums text-red-600">{partnerBulkResult.summary?.failed ?? 0}</p>
                    <p className="text-[10px] text-white uppercase">{language === "af" ? "Misluk" : "Failed"}</p>
                  </div>
                </div>
                {partnerBulkResult.inserted?.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-white">{language === "af" ? "Sien bygevoegde vennote + kodes" : "View added partners + codes"}</summary>
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto font-mono">
                      {partnerBulkResult.inserted.map((p: any, i: number) => (
                        <div key={`in-${i}`} className="text-emerald-700">{p.name} â†’ <code className="bg-muted/60 px-1">{p.code}</code></div>
                      ))}
                    </div>
                  </details>
                )}
                {(partnerBulkResult.skipped?.length > 0 || partnerBulkResult.failed?.length > 0) && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-white">{language === "af" ? "Sien probleme" : "View issues"}</summary>
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {partnerBulkResult.skipped?.map((s: any, i: number) => (
                        <div key={`sk-${i}`} className="text-amber-700">{language === "af" ? "Ry" : "Row"} {s.row}: {s.name} â€” {s.reason}</div>
                      ))}
                      {partnerBulkResult.failed?.map((f: any, i: number) => (
                        <div key={`fl-${i}`} className="text-red-700">{language === "af" ? "Ry" : "Row"} {f.row}: {f.name ?? (language === "af" ? "(geen naam)" : "(no name)")} â€” {f.reason}</div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent className="bg-black/95 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              {language === "af" ? "Verwyder gebruiker?" : "Delete user?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white">
              {language === "af"
                ? `Hierdie sal ${pendingDelete?.label ?? "die gebruiker"} en al hul data permanent verwyder. Hierdie aksie kan nie ongedaan gemaak word nie.`
                : `This will permanently delete ${pendingDelete?.label ?? "the user"} and all of their data. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/20 text-white hover:bg-white/10" data-testid="button-cancel-delete-user">
              {language === "af" ? "Kanselleer" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500 text-white"
              disabled={deleteUserMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingDelete) deleteUserMutation.mutate(pendingDelete.id);
              }}
              data-testid="button-confirm-delete-user"
            >
              {deleteUserMutation.isPending
                ? (language === "af" ? "Besig om te verwyder..." : "Deleting...")
                : (language === "af" ? "Verwyder" : "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface CohortPressureRow {
  subjectName: string;
  subjectId: number | null;
  learnerCount: number;
  examDate: string;
  daysRemaining: number;
  urgencyState: string;
  paperNumber: number;
  lowReadinessCount: number;
}

// ============================================
// GAMIFICATION ANALYTICS TAB â€” T119
// ============================================

function GamificationTab() {
  const { language } = useLanguage();
  const { data: dauData } = useQuery<{ data: Array<{ date: string; activeUsers: number }>; from: string; to: string }>({
    queryKey: ["/api/admin/analytics/dau"],
  });
  const { data: quizData } = useQuery<{ total: number; completed: number; rate: number }>({
    queryKey: ["/api/admin/analytics/quiz-completion"],
  });
  const { data: badgeData } = useQuery<{ totalBadgesAwarded: number; uniqueUsers: number; avgPerUser: number }>({
    queryKey: ["/api/admin/analytics/badge-rate"],
  });
  const { data: readinessData } = useQuery<Array<{ schoolName: string; avgReadiness: number; learnerCount: number }>>({
    queryKey: ["/api/admin/analytics/readiness-by-school"],
  });

  const avgDau = dauData?.data?.length
    ? Math.round(dauData.data.reduce((s, d) => s + Number(d.activeUsers), 0) / dauData.data.length)
    : 0;
  const peakDau = dauData?.data?.length
    ? Math.max(...dauData.data.map((d) => Number(d.activeUsers)))
    : 0;

  return (
    <TabsContent value="gamification">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl bg-black border-white/20">
            <CardContent className="p-5 space-y-1">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">{language === "af" ? "Gem. Daaglikse Aktiewe Gebruikers" : "Avg Daily Active Users"}</p>
              <p className="text-3xl font-bold text-white">{avgDau}</p>
              <p className="text-[10px] text-white">{language === "af" ? "Hoogtepunt" : "Peak"}: {peakDau} {language === "af" ? "/ dag (laaste 30 dae)" : "/ day (last 30 days)"}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-black border-white/20">
            <CardContent className="p-5 space-y-1">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">{language === "af" ? "Vasvra-voltooiingskoers" : "Quiz Completion Rate"}</p>
              <p className="text-3xl font-bold text-white">{quizData?.rate ?? "â€”"}%</p>
              <p className="text-[10px] text-white">{quizData?.completed ?? 0} {language === "af" ? "van" : "of"} {quizData?.total ?? 0} {language === "af" ? "voltooi" : "completed"}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-black border-white/20">
            <CardContent className="p-5 space-y-1">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">{language === "af" ? "Kenteken-toekenningskoers" : "Badge Award Rate"}</p>
              <p className="text-3xl font-bold text-white">{badgeData?.avgPerUser?.toFixed(1) ?? "â€”"} <span className="text-sm font-normal">{language === "af" ? "gem." : "avg"}</span></p>
              <p className="text-[10px] text-white">{badgeData?.uniqueUsers ?? 0} {language === "af" ? "leerders met kentekens" : "learners with badges"}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-black border-white/20">
            <CardContent className="p-5 space-y-1">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">{language === "af" ? "Totale Kentekens Toegeken" : "Total Badges Awarded"}</p>
              <p className="text-3xl font-bold text-white">{badgeData?.totalBadgesAwarded ?? "â€”"}</p>
              <p className="text-[10px] text-white">{language === "af" ? "Oor alle leerders" : "Across all learners"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white">{language === "af" ? "Daaglikse Aktiewe Gebruikers (Laaste 30 Dae)" : "Daily Active Users (Last 30 Days)"}</h3>
              </div>
              {dauData?.data?.length ? (
                <div className="flex items-end gap-0.5 h-24">
                  {dauData.data.slice(-30).map((d, i) => {
                    const pct = peakDau > 0 ? (Number(d.activeUsers) / peakDau) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div
                          className="w-full rounded-t-sm bg-cyan-500/60 group-hover:bg-cyan-500 transition-colors"
                          style={{ height: `${Math.max(4, pct)}%` }}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-background border border-border rounded px-1 hidden group-hover:block whitespace-nowrap z-10">
                          {d.date}: {d.activeUsers}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center">
                  <p className="text-sm text-white">{language === "af" ? "Nog geen data nie" : "No data yet"}</p>
                </div>
              )}
              <div className="flex justify-between text-[10px] text-white">
                <span>{dauData?.from}</span>
                <span>{dauData?.to}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 6px #7FEFFF)" }} />
                <h3 className="font-bold text-sm text-white">{language === "af" ? "Gem. Eksamengereedheid per Skool" : "Avg Exam Readiness by School"}</h3>
              </div>
              {readinessData?.length ? (
                <div className="space-y-2">
                  {readinessData.slice(0, 8).map((row, i) => {
                    const pct = Math.min(100, row.avgReadiness);
                    const color = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-white truncate max-w-[60%]">{row.schoolName}</span>
                          <span className="text-white">{pct.toFixed(0)}% Â· {row.learnerCount} {language === "af" ? "leerders" : "learners"}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center">
                  <p className="text-sm text-white">{language === "af" ? "Nog geen skooldata nie" : "No school data yet"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}

// ============================================
// REMINDER CAMPAIGN VIEW â€” T148
// ============================================

interface CampaignSetting {
  id: number;
  cohortKey: string;
  enabled: boolean;
  milestones: number[];
  updatedAt: string | null;
  updatedBy: string | null;
}

interface ReminderRunResult {
  learnersScanned: number;
  notificationsSent: number;
  notificationsSkipped: number;
  errors: string[];
}

interface ReminderLogEntry {
  id: number;
  userId: string;
  subjectName: string;
  examDate: string;
  paperNumber: number;
  milestoneDay: number;
  channel: string;
  sentAt: string;
}

function ReminderCampaignView() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [runResult, setRunResult] = useState<ReminderRunResult | null>(null);
  const [milestonesInput, setMilestonesInput] = useState<string>("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const { data: campaignData, isLoading: campaignLoading } = useQuery<{ campaigns: CampaignSetting[] }>({
    queryKey: ["/api/admin/timetable/reminder-campaigns"],
    staleTime: 30000,
  });

  const { data: logData, isLoading: logLoading } = useQuery<{ log: ReminderLogEntry[] }>({
    queryKey: ["/api/admin/timetable/reminder-log"],
    staleTime: 30000,
  });

  const campaigns: CampaignSetting[] = campaignData?.campaigns || [];
  const log: ReminderLogEntry[] = logData?.log || [];

  const toggleMutation = useMutation({
    mutationFn: async ({ cohortKey, enabled }: { cohortKey: string; enabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/timetable/reminder-campaigns/${cohortKey}`, { enabled });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/timetable/reminder-campaigns"] });
      toast({ title: language === "af" ? "Veldtog-instelling gestoor" : "Campaign setting saved" });
    },
    onError: () => toast({ title: language === "af" ? "Kon nie instelling opdateer nie" : "Failed to update setting", variant: "destructive" }),
  });

  const milestonesMutation = useMutation({
    mutationFn: async ({ cohortKey, milestones }: { cohortKey: string; milestones: number[] }) => {
      const res = await apiRequest("PATCH", `/api/admin/timetable/reminder-campaigns/${cohortKey}`, { milestones });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/timetable/reminder-campaigns"] });
      setEditingKey(null);
      toast({ title: language === "af" ? "Mylpale opgedateer" : "Milestones updated" });
    },
    onError: () => toast({ title: language === "af" ? "Ongeldige mylpale â€” gebruik kommageskeide getalle (bv. 30,14,7)" : "Invalid milestones â€” use comma-separated numbers (e.g. 30,14,7)", variant: "destructive" }),
  });

  const sendMutation = useMutation({
    mutationFn: async (schoolId?: number) => {
      const res = await apiRequest("POST", "/api/admin/timetable/send-reminders", schoolId ? { schoolId } : {});
      return res.json() as Promise<ReminderRunResult>;
    },
    onSuccess: (data) => {
      setRunResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/timetable/reminder-log"] });
      toast({ title: language === "af" ? `Aflewering voltooi â€” ${data.notificationsSent} gestuur, ${data.notificationsSkipped} oorgeslaan` : `Dispatch complete â€” ${data.notificationsSent} sent, ${data.notificationsSkipped} skipped` });
    },
    onError: () => toast({ title: language === "af" ? "Aflewering misluk" : "Dispatch failed", variant: "destructive" }),
  });

  function saveMilestones(cohortKey: string) {
    const parts = milestonesInput.split(",").map(s => parseInt(s.trim(), 10));
    if (parts.some(isNaN) || parts.length === 0) {
      toast({ title: language === "af" ? "Tik kommageskeide getalle in, bv. 30,14,7" : "Enter comma-separated numbers, e.g. 30,14,7", variant: "destructive" });
      return;
    }
    milestonesMutation.mutate({ cohortKey, milestones: parts });
  }

  const cohortLabel = (key: string) =>
    key === "global"
      ? (language === "af" ? "Alle Leerders (Globaal)" : "All Learners (Global)")
      : key.startsWith("school:")
        ? `${language === "af" ? "Skool" : "School"} #${key.split(":")[1]}`
        : key;

  return (
    <div className="space-y-6">
      <Card className="bg-black border-white/15 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            {language === "af" ? "Eksamen-Aftel Herinnering-Veldtogte" : "Exam Countdown Reminder Campaigns"}
          </CardTitle>
          <p className="text-xs text-white">
            {language === "af" ? "Leerders ontvang stootkennisgewings by instelbare mylpale (verstek: 30, 14, 7 dae) voor hul eerste komende eksamen. Skakel 'n veldtog aan of af per kohort, of voer 'n handmatige aflewering uit." : "Learners receive push notifications at configurable milestones (default: 30, 14, 7 days) before their first upcoming exam. Toggle a campaign on or off per cohort, or run a manual dispatch."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaignLoading ? (
            <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />)}</div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <Bell className="w-8 h-8 text-white" />
              <p className="text-sm text-white">{language === "af" ? "Nog geen veldtogte opgestel nie. Klik â€œStuur Nouâ€ om die globale veldtog te begin." : "No campaigns configured yet. Click \"Send Now\" to initialise the global campaign."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.cohortKey} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/60 p-4 bg-muted/10">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{cohortLabel(c.cohortKey)}</p>
                    {editingKey === c.cohortKey ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          className="text-xs border border-border rounded px-2 py-1 bg-background w-32"
                          placeholder="30,14,7"
                          value={milestonesInput}
                          onChange={e => setMilestonesInput(e.target.value)}
                        />
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => saveMilestones(c.cohortKey)} disabled={milestonesMutation.isPending}>
                          {language === "af" ? "Stoor" : "Save"}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingKey(null)}>{language === "af" ? "Kanselleer" : "Cancel"}</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {(c.milestones || [30, 14, 7]).map(m => (
                          <Badge key={m} variant="outline" className="text-[10px] px-1.5 py-0.5">{m}d</Badge>
                        ))}
                        <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5 py-0.5 text-white" onClick={() => { setEditingKey(c.cohortKey); setMilestonesInput((c.milestones || [30,14,7]).join(",")); }}>
                          {language === "af" ? "Wysig dae" : "Edit days"}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={c.enabled ? "default" : "outline"}
                      className={`h-8 text-xs gap-1.5 ${c.enabled ? "bg-[#7FEFFF] hover:bg-[#7FEFFF]/90 text-black border-0" : "border-border/60"}`}
                      onClick={() => toggleMutation.mutate({ cohortKey: c.cohortKey, enabled: !c.enabled })}
                      disabled={toggleMutation.isPending}
                    >
                      {c.enabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                      {c.enabled ? (language === "af" ? "Geaktiveer" : "Enabled") : (language === "af" ? "Gedeaktiveer" : "Disabled")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
            <Button
              size="sm"
              variant="default"
              className="gap-1.5 h-8 text-xs"
              onClick={() => sendMutation.mutate(undefined)}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              {sendMutation.isPending ? (language === "af" ? "Stuur tansâ€¦" : "Dispatchingâ€¦") : (language === "af" ? "Stuur Herinneringe Nou" : "Send Reminders Now")}
            </Button>
          </div>

          {runResult && (
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4 text-xs space-y-1">
              <p className="font-semibold text-sm">{language === "af" ? "Laaste Aflewering Resultaat" : "Last Dispatch Result"}</p>
              <p>{language === "af" ? "Leerders geskandeer" : "Learners scanned"}: <span className="font-mono font-bold">{runResult.learnersScanned}</span></p>
              <p>{language === "af" ? "Kennisgewings gestuur" : "Notifications sent"}: <span className="font-mono font-bold text-[#7FEFFF]">{runResult.notificationsSent}</span></p>
              <p>{language === "af" ? "Oorgeslaan (reeds gestuur of veldtog af)" : "Skipped (already sent or campaign off)"}: <span className="font-mono font-bold text-white">{runResult.notificationsSkipped}</span></p>
              {runResult.errors.length > 0 && (
                <div className="pt-1">
                  <p className="font-semibold text-destructive">{language === "af" ? "Foute" : "Errors"} ({runResult.errors.length}):</p>
                  {runResult.errors.slice(0, 5).map((e, i) => <p key={i} className="text-destructive/80 font-mono truncate">{e}</p>)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomReminderCard />

      <ParentRatePromptCard />

      <Card className="bg-black border-white/15 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {language === "af" ? "Herinnering Stuur-Log" : "Reminder Send Log"}
          </CardTitle>
          <p className="text-xs text-white">
            {language === "af" ? "Mees onlangse herinnering-stuur. Elke ry = een dedup-beskermde kennisgewing-gebeurtenis." : "Most recent reminder sends. Each row = one dedup-protected notification event."}
          </p>
        </CardHeader>
        <CardContent>
          {logLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 rounded bg-muted/50 animate-pulse" />)}</div>
          ) : log.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center gap-2">
              <Bell className="w-8 h-8 text-white" />
              <p className="text-sm text-white">{language === "af" ? "Nog geen herinneringe gestuur nie." : "No reminders sent yet."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/15">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/[0.03] hover:bg-white/[0.03]">
                    <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Gebruiker-ID" : "User ID"}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Vak" : "Subject"}</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Vraestel" : "Paper"}</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Mylpaal" : "Milestone"}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Kanaal" : "Channel"}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Gestuur Om" : "Sent At"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.slice(0, 50).map(entry => (
                    <TableRow key={entry.id} className="hover:bg-white/[0.04] even:bg-white/[0.02]">
                      <TableCell className="text-[11px] font-mono max-w-[100px] truncate">{entry.userId}</TableCell>
                      <TableCell className="text-xs font-medium">{entry.subjectName}</TableCell>
                      <TableCell className="text-center text-xs">P{entry.paperNumber}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[10px] ${entry.milestoneDay <= 7 ? "border-[#FF9FE5]/50 text-[#FF9FE5]" : entry.milestoneDay <= 14 ? "border-[#FFF29E]/50 text-[#FFF29E]" : "border-[#7FEFFF]/50 text-[#7FEFFF]"}`}>
                          {entry.milestoneDay}d
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{entry.channel}</Badge>
                      </TableCell>
                      <TableCell className="text-[11px] text-white">
                        {formatDateTime(entry.sentAt, language, { dateStyle: "short", timeStyle: "short" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface CustomReminderResult {
  recipientsTargeted: number;
  pushSent: number;
  pushFailed: number;
  emailIntentLogged: number;
  errors: string[];
}

type ReminderTemplate = {
  id: string;
  labelEn: string; labelAf: string;
  titleEn: string; titleAf: string;
  bodyEn: string; bodyAf: string;
  tone: string;
};
const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: "mock-tomorrow",
    labelEn: "Mock exam tomorrow", labelAf: "Mock-eksamen mÃ´re",
    titleEn: "ðŸ“ Mock exam tomorrow", titleAf: "ðŸ“ Mock-eksamen mÃ´re",
    bodyEn: "Big day tomorrow! Quick revision, full night's sleep, and breakfast â€” you've got this.",
    bodyAf: "Groot dag mÃ´re! Vinnige hersiening, 'n volle nag se slaap en ontbyt â€” jy het dit.",
    tone: "border-[#FFF29E]/40 bg-[#FFF29E]/10 text-[#FFF29E]",
  },
  {
    id: "study-streak",
    labelEn: "Streak nudge", labelAf: "Reeks-stoot",
    titleEn: "ðŸ”¥ Don't break your streak", titleAf: "ðŸ”¥ Moenie jou reeks breek nie",
    bodyEn: "20 minutes of practice today keeps your streak alive. Open BrainTrack now.",
    bodyAf: "20 minute oefening vandag hou jou reeks aan die lewe. Open BrainTrack nou.",
    tone: "border-[#FFC48F]/40 bg-[#FFC48F]/10 text-[#FFC48F]",
  },
  {
    id: "pep-talk",
    labelEn: "Pep talk", labelAf: "Aanmoediging",
    titleEn: "ðŸ’ª You're closer than you think", titleAf: "ðŸ’ª Jy is nader as wat jy dink",
    bodyEn: "Every past paper, every flashcard â€” it's all adding up. Keep showing up. Rizz believes in you.",
    bodyAf: "Elke vorige vraestel, elke flitskaart â€” dit tel alles op. Bly opdaag. Rizz glo in jou.",
    tone: "border-[#FF9FE5]/40 bg-[#FF9FE5]/10 text-[#FF9FE5]",
  },
  {
    id: "weekly-plan",
    labelEn: "Weekly study plan", labelAf: "Weeklikse studieplan",
    titleEn: "ðŸ“… New week, new plan", titleAf: "ðŸ“… Nuwe week, nuwe plan",
    bodyEn: "Tap into your CAPS study plan for this week â€” three subjects, balanced and ready.",
    bodyAf: "Gebruik jou KABV-studieplan vir hierdie week â€” drie vakke, gebalanseerd en gereed.",
    tone: "border-[#6FA8FF]/40 bg-[#6FA8FF]/10 text-[#6FA8FF]",
  },
  {
    id: "trial-ending",
    labelEn: "Trial ending soon", labelAf: "Proeflopie eindig binnekort",
    titleEn: "â³ Your free trial ends soon", titleAf: "â³ Jou gratis proeflopie eindig binnekort",
    bodyEn: "Keep all of Brain Boost â€” past papers, AI tutor, gamified streaks â€” for just R169/month.",
    bodyAf: "Behou alles van Brain Boost â€” vorige vraestelle, KI-tutor, spelreekse â€” vir net R169/maand.",
    tone: "border-[#C6A4FF]/40 bg-[#C6A4FF]/10 text-[#C6A4FF]",
  },
  {
    id: "new-papers",
    labelEn: "New past papers", labelAf: "Nuwe vorige vraestelle",
    titleEn: "ðŸ“š Fresh DBE past papers added", titleAf: "ðŸ“š Nuwe DBO vorige vraestelle bygevoeg",
    bodyEn: "We've just loaded new verified past papers + memos. Open Practice to try one.",
    bodyAf: "Ons het pas nuwe geverifieerde vorige vraestelle + memos gelaai. Open Oefening om een te probeer.",
    tone: "border-[#7FEFFF]/40 bg-[#7FEFFF]/10 text-[#7FEFFF]",
  },
  {
    id: "holiday-close",
    labelEn: "Holiday motivation", labelAf: "Vakansie-motivering",
    titleEn: "ðŸŒž Holiday revision", titleAf: "ðŸŒž Vakansie-hersiening",
    bodyEn: "Even 30 minutes a day during the holiday compounds â€” your future self will thank you.",
    bodyAf: "Selfs 30 minute per dag tydens die vakansie tel op â€” jou toekomstige self sal jou bedank.",
    tone: "border-[#FFC48F]/40 bg-[#FFC48F]/10 text-[#FFC48F]",
  },
  {
    id: "weekend-challenge",
    labelEn: "Weekend challenge", labelAf: "Naweek-uitdaging",
    titleEn: "ðŸ† Weekend challenge unlocked", titleAf: "ðŸ† Naweek-uitdaging ontsluit",
    bodyEn: "Try today's Daily Challenge â€” bonus XP if you finish before Monday.",
    bodyAf: "Probeer vandag se Daaglikse Uitdaging â€” bonus XP as jy voor Maandag klaarmaak.",
    tone: "border-[#FFF29E]/40 bg-[#FFF29E]/10 text-[#FFF29E]",
  },
];

function CustomReminderCard() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "school" | "user">("all");
  const [schoolId, setSchoolId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [url, setUrl] = useState<string>("/dashboard");
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [result, setResult] = useState<CustomReminderResult | null>(null);

  const { data: schoolsData } = useQuery<{ schools: SchoolRow[] }>({ queryKey: ["/api/admin/reports/schools"] });
  const schools = schoolsData?.schools ?? [];

  const sendCustom = useMutation({
    mutationFn: async () => {
      const payload: any = { title: title.trim(), body: body.trim(), target, url: url.trim() || "/dashboard" };
      if (target === "school") payload.schoolId = Number(schoolId);
      if (target === "user") payload.userId = userId.trim();
      const res = await apiRequest("POST", "/api/admin/timetable/send-custom-reminder", payload);
      return res.json() as Promise<CustomReminderResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: language === "af" ? "Herinnering afgelewer" : "Reminder dispatched",
        description: language === "af" ? `${data.pushSent} stoot Â· ${data.emailIntentLogged} e-pos-bedoeling Â· ${data.pushFailed} misluk` : `${data.pushSent} push Â· ${data.emailIntentLogged} email-intent Â· ${data.pushFailed} failed`,
      });
    },
    onError: (e: any) => toast({ title: language === "af" ? "Stuur misluk" : "Send failed", description: e?.message ?? (language === "af" ? "Kon nie stuur nie" : "Could not send"), variant: "destructive" }),
  });

  function applyTemplate(t: ReminderTemplate) {
    setTitle(language === "af" ? t.titleAf : t.titleEn);
    setBody(language === "af" ? t.bodyAf : t.bodyEn);
    setActiveTemplate(t.id);
  }

  const valid = title.trim().length > 0 && body.trim().length > 0
    && (target === "all" || (target === "school" && schoolId) || (target === "user" && userId.trim()));

  return (
    <Card className="bg-black border-white/15 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#C6A4FF]" />
          {language === "af" ? "Stuur Pasgemaakte Herinnering" : "Send Custom Reminder"}
        </CardTitle>
        <p className="text-xs text-white">
          {language === "af" ? "Vuur enige tyd 'n ad hoc-stootkennisgewing af â€” na alle leerders, 'n spesifieke skool, of 'n enkele leerder. Kies hieronder 'n sjabloon, pas die woorde aan en stuur." : "Fire an ad-hoc push notification anytime â€” to all learners, a specific school, or a single learner. Pick a template below, tweak the wording, then send."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-white mb-2">{language === "af" ? "Voorafopgestelde sjablone" : "Predefined templates"}</p>
          <div className="flex flex-wrap gap-1.5">
            {REMINDER_TEMPLATES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${activeTemplate === t.id ? "ring-2 ring-offset-2 ring-offset-background ring-[#C6A4FF] " : ""}${t.tone} hover:opacity-80`}
                data-testid={`template-${t.id}`}
              >
                {language === "af" ? t.labelAf : t.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">{language === "af" ? "Titel" : "Title"}</label>
            <input
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background"
              value={title}
              onChange={e => { setTitle(e.target.value); setActiveTemplate(null); }}
              placeholder={language === "af" ? "bv. â° 7 dae oor" : "e.g. â° 7 days to go"}
              maxLength={120}
              data-testid="input-custom-title"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">{language === "af" ? "Deurkliek-URL" : "Click-through URL"}</label>
            <input
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="/dashboard"
              data-testid="input-custom-url"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block">{language === "af" ? "Boodskap" : "Message"}</label>
          <Textarea
            value={body}
            onChange={e => { setBody(e.target.value); setActiveTemplate(null); }}
            placeholder={language === "af" ? "Skryf 'n kort, motiverende boodskapâ€¦" : "Write a short, motivating messageâ€¦"}
            className="text-sm min-h-[90px]"
            maxLength={400}
            data-testid="input-custom-body"
          />
          <p className="text-[10px] text-white mt-1 text-right">{body.length}/400</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">{language === "af" ? "Stuur aan" : "Send to"}</label>
            <select
              value={target}
              onChange={e => setTarget(e.target.value as any)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background"
              data-testid="select-custom-target"
            >
              <option value="all">{language === "af" ? "Alle leerders" : "All learners"}</option>
              <option value="school">{language === "af" ? "Spesifieke skool" : "Specific school"}</option>
              <option value="user">{language === "af" ? "Spesifieke leerder (gebruiker-ID)" : "Specific learner (user ID)"}</option>
            </select>
          </div>
          {target === "school" && (
            <div className="md:col-span-2">
              <label className="text-xs font-semibold mb-1 block">{language === "af" ? "Skool" : "School"}</label>
              <select
                value={schoolId}
                onChange={e => setSchoolId(e.target.value)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background"
                data-testid="select-custom-school"
              >
                <option value="">{language === "af" ? "â€” Kies 'n skool â€”" : "â€” Choose a school â€”"}</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.schoolName} ({s.learnerCount} {language === "af" ? "leerders" : "learners"})</option>
                ))}
              </select>
            </div>
          )}
          {target === "user" && (
            <div className="md:col-span-2">
              <label className="text-xs font-semibold mb-1 block">{language === "af" ? "Leerder gebruiker-ID" : "Learner user ID"}</label>
              <input
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background font-mono"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="user_xxx"
                data-testid="input-custom-userid"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-white">
            {language === "af" ? "Stootkennisgewings word onmiddellik gestuur. Leerders sonder 'n stootintekening kry 'n e-pos-bedoelingslog." : "Push notifications go out instantly. Learners without a push subscription get an email-intent log."}
          </p>
          <Button
            size="sm"
            disabled={!valid || sendCustom.isPending}
            onClick={() => sendCustom.mutate()}
            data-testid="button-send-custom"
            className="bg-[#C6A4FF] hover:bg-[#C6A4FF]/90 text-white border-0"
          >
            {sendCustom.isPending ? (language === "af" ? "Stuurâ€¦" : "Sendingâ€¦") : (language === "af" ? "Stuur nou" : "Send now")}
          </Button>
        </div>

        {result && (
          <div className="grid grid-cols-4 gap-2 text-center text-xs border-t border-border pt-3">
            <div className="rounded-lg border border-border p-2">
              <p className="text-lg font-bold tabular-nums">{result.recipientsTargeted}</p>
              <p className="text-[10px] text-white uppercase">{language === "af" ? "Geteiken" : "Targeted"}</p>
            </div>
            <div className="rounded-lg border border-[#7FEFFF]/40 bg-[#7FEFFF]/10 p-2">
              <p className="text-lg font-bold tabular-nums text-[#7FEFFF]">{result.pushSent}</p>
              <p className="text-[10px] text-white uppercase">{language === "af" ? "Stoot gestuur" : "Push sent"}</p>
            </div>
            <div className="rounded-lg border border-[#6FA8FF]/40 bg-[#6FA8FF]/10 p-2">
              <p className="text-lg font-bold tabular-nums text-[#6FA8FF]">{result.emailIntentLogged}</p>
              <p className="text-[10px] text-white uppercase">{language === "af" ? "E-pos-bedoeling" : "Email-intent"}</p>
            </div>
            <div className="rounded-lg border border-[#FF9FE5]/40 bg-[#FF9FE5]/10 p-2">
              <p className="text-lg font-bold tabular-nums text-[#FF9FE5]">{result.pushFailed}</p>
              <p className="text-[10px] text-white uppercase">{language === "af" ? "Misluk" : "Failed"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ParentRatePromptCard() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [titleEn, setTitleEn] = useState("Enjoying BrainTrack? â­");
  const [titleAf, setTitleAf] = useState("Geniet jy BrainTrack? â­");
  const [messageEn, setMessageEn] = useState("Takes 30 seconds â€” tap to rate us and help other families find BrainTrack.");
  const [messageAf, setMessageAf] = useState("Dit neem 30 sekondes â€” tik om ons te gradeer en help ander gesinne BrainTrack vind.");
  const [ctaUrl, setCtaUrl] = useState("https://play.google.com/store/apps/details?id=com.braintrack");
  const [result, setResult] = useState<{ parents: number; inAppCreated: number; pushSent: number; pushFailed: number } | null>(null);

  const send = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/comms/parent-rate-prompt", {
        titleEn: titleEn.trim(), titleAf: titleAf.trim(),
        messageEn: messageEn.trim(), messageAf: messageAf.trim(),
        ctaUrl: ctaUrl.trim(),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: language === "af" ? "Graderingsversoek gestuur" : "Rate prompt sent",
        description: language === "af" ? `${data.parents} ouers Â· ${data.inAppCreated} in-app Â· ${data.pushSent} stoot` : `${data.parents} parents Â· ${data.inAppCreated} in-app Â· ${data.pushSent} push`,
      });
    },
    onError: (e: any) => toast({ title: language === "af" ? "Stuur misluk" : "Send failed", description: e?.message ?? (language === "af" ? "Kon nie stuur nie" : "Could not send"), variant: "destructive" }),
  });

  const valid = titleEn.trim() && messageEn.trim() && ctaUrl.trim();

  return (
    <Card
      className="rounded-2xl bg-black"
      style={{ border: "1.5px solid #FFF29E", boxShadow: "0 0 0 1px rgba(255,242,158,0.25), 0 0 28px rgba(255,242,158,0.25)" }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-black"
            style={{ border: "1.5px solid #FFF29E", boxShadow: "0 0 10px rgba(255,242,158,0.5)" }}
          >
            <Star className="w-3.5 h-3.5" style={{ color: "#FFF29E", filter: "drop-shadow(0 0 4px #FFF29E)" }} />
          </span>
          <span
            style={{
              background: "linear-gradient(90deg, #FFF29E, #FFC48F, #FF9FE5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {language === "af" ? "Ouer-graderingsversoek â€” Komms-uitsending" : "Parent Rate Prompt â€” Comms Blast"}
          </span>
        </CardTitle>
        <p className="text-[11px] text-white">
          {language === "af" ? "Stuur dinamies 'n \"gradeer ons\"-versoek na elke ouerrekening. Afgelewer as 'n in-app-kennisgewing en 'n inheemse stoot waar ingeteken. Ouers tik daarop om jou resensieskakel te open." : "Dynamically push a \"rate us\" prompt to every parent account. Delivered as an in-app notification and a native push where subscribed. Parents tap it to open your review link."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.18em] mb-1.5 block" style={{ color: "#FFF29E" }}>{language === "af" ? "Titel (EN)" : "Title (EN)"}</label>
            <input
              className="w-full text-sm rounded-lg px-3 py-2 bg-black text-white placeholder:text-white focus:outline-none"
              style={{ border: "1px solid rgba(255,242,158,0.35)" }}
              value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
              maxLength={120}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.18em] mb-1.5 block" style={{ color: "#FFC48F" }}>{language === "af" ? "Titel (AF)" : "Title (AF)"}</label>
            <input
              className="w-full text-sm rounded-lg px-3 py-2 bg-black text-white placeholder:text-white focus:outline-none"
              style={{ border: "1px solid rgba(255,196,143,0.35)" }}
              value={titleAf}
              onChange={e => setTitleAf(e.target.value)}
              maxLength={120}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.18em] mb-1.5 block" style={{ color: "#7FEFFF" }}>{language === "af" ? "Boodskap (EN)" : "Message (EN)"}</label>
            <Textarea
              value={messageEn}
              onChange={e => setMessageEn(e.target.value)}
              className="text-sm min-h-[80px] bg-black text-white"
              style={{ border: "1px solid rgba(127,239,255,0.35)" }}
              maxLength={400}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.18em] mb-1.5 block" style={{ color: "#C6A4FF" }}>{language === "af" ? "Boodskap (AF)" : "Message (AF)"}</label>
            <Textarea
              value={messageAf}
              onChange={e => setMessageAf(e.target.value)}
              className="text-sm min-h-[80px] bg-black text-white"
              style={{ border: "1px solid rgba(198,164,255,0.35)" }}
              maxLength={400}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.18em] mb-1.5 block" style={{ color: "#FF9FE5" }}>{language === "af" ? "Graderings-URL (CTA)" : "Rate URL (CTA)"}</label>
            <input
              className="w-full text-sm rounded-lg px-3 py-2 bg-black text-white placeholder:text-white focus:outline-none font-mono"
              style={{ border: "1px solid rgba(255,159,229,0.35)" }}
              value={ctaUrl}
              onChange={e => setCtaUrl(e.target.value)}
              placeholder="https://play.google.com/store/apps/details?id=â€¦"
            />
            <p className="text-[10px] text-white mt-1">{language === "af" ? "Absolute URL (Play Store / App Store / resensievorm) of interne pad soos" : "Absolute URL (Play Store / App Store / review form) or internal path like"} <code className="text-white">/parent-dashboard?rate=1</code></p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            disabled={!valid || send.isPending}
            onClick={() => send.mutate()}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-none disabled:opacity-40"
            style={{ color: "#FFF29E", border: "1.5px solid #FFF29E", boxShadow: "0 0 18px rgba(255,242,158,0.45), inset 0 0 8px rgba(255,242,158,0.15)" }}
          >
            {send.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {language === "af" ? "Stuurâ€¦" : "Sendingâ€¦"}</> : <><Send className="w-3.5 h-3.5" /> {language === "af" ? "Stuur na alle ouers" : "Blast to all parents"}</>}
          </button>
        </div>

        {result && (
          <div className="grid grid-cols-4 gap-2 text-center text-xs border-t border-white/10 pt-3">
            <div className="rounded-lg border border-white/15 p-2">
              <p className="text-lg font-bold tabular-nums text-white">{result.parents}</p>
              <p className="text-[10px] text-white uppercase">{language === "af" ? "Ouers" : "Parents"}</p>
            </div>
            <div className="rounded-lg border border-[#FFF29E]/40 bg-[#FFF29E]/10 p-2">
              <p className="text-lg font-bold tabular-nums text-[#FFF29E]">{result.inAppCreated}</p>
              <p className="text-[10px] text-white uppercase">{language === "af" ? "In-app" : "In-app"}</p>
            </div>
            <div className="rounded-lg border border-[#7FEFFF]/40 bg-[#7FEFFF]/10 p-2">
              <p className="text-lg font-bold tabular-nums text-[#7FEFFF]">{result.pushSent}</p>
              <p className="text-[10px] text-white uppercase">{language === "af" ? "Stoot gestuur" : "Push sent"}</p>
            </div>
            <div className="rounded-lg border border-[#FF9FE5]/40 bg-[#FF9FE5]/10 p-2">
              <p className="text-lg font-bold tabular-nums text-[#FF9FE5]">{result.pushFailed}</p>
              <p className="text-[10px] text-white uppercase">{language === "af" ? "Misluk" : "Failed"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExamPressureView() {
  const { language } = useLanguage();
  const { data, isLoading } = useQuery<{ cohort: CohortPressureRow[] }>({
    queryKey: ["/api/admin/timetable/cohort-pressure"],
    staleTime: 60000,
  });

  const cohort: CohortPressureRow[] = data?.cohort || [];

  const urgencyLabel: Record<string, string> = language === "af"
    ? { final_sprint: "Finale Sprong", exam_prep_mode: "Eksamen Voorb.", focused_revision: "Gefokus Hers.", build_mastery: "Bou Bemeestering" }
    : { final_sprint: "Final Sprint", exam_prep_mode: "Exam Prep", focused_revision: "Focused Rev.", build_mastery: "Build Mastery" };
  const urgencyColor: Record<string, string> = {
    final_sprint: "bg-red-100 border-red-200 text-red-800",
    exam_prep_mode: "bg-amber-100 border-amber-200 text-amber-800",
    focused_revision: "bg-blue-100 border-blue-200 text-blue-800",
    build_mastery: "bg-emerald-100 border-emerald-200 text-emerald-800",
  };

  return (
    <div className="space-y-6" data-testid="exam-pressure-view">
      <Card className="bg-black border-white/15 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {language === "af" ? "NSS 2026 â€” Kohort Eksamendruk Hitkaart" : "NSC 2026 â€” Cohort Exam Pressure Heatmap"}
          </CardTitle>
          <p className="text-xs text-white">
            {language === "af" ? "Vak + vraestel-kombinasies gerangskik volgens nabyheid aan eksamendatum. Wys hoeveel leerders hierdie eksamen in hul skedule het." : "Subject + paper combinations ordered by proximity to exam date. Shows how many learners have this exam in their schedule."}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-muted/50 animate-pulse" />)}
            </div>
          ) : cohort.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-10 h-10 text-white mb-3" />
              <p className="text-sm font-semibold text-white">{language === "af" ? "Nog geen eksamenroosters gegenereer nie" : "No exam schedules generated yet"}</p>
              <p className="text-xs text-white mt-1">
                {language === "af" ? "Leerderroosters word outomaties gebou wanneer leerders aanmeld. Gaan na DBO Admin â†’ Rooster om alles te hergenereer." : "Learner schedules are built automatically when learners log in. Go to DBE Admin â†’ Timetable to regenerate all."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/15">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/[0.03] hover:bg-white/[0.03]">
                    <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Vak" : "Subject"}</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Vraestel" : "Paper"}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Eksamendatum" : "Exam Date"}</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Dae Oor" : "Days Left"}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-white">{language === "af" ? "Dringendheid" : "Urgency"}</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Leerders" : "Learners"}</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold text-white">{language === "af" ? "Lae Gereedheid" : "Low Readiness"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohort.map((row, i) => (
                    <TableRow key={i} className={`hover:bg-white/[0.04] even:bg-white/[0.02] ${row.lowReadinessCount > 0 ? "border-l-2 border-red-300" : ""}`}>
                      <TableCell className="font-medium text-sm">{row.subjectName}</TableCell>
                      <TableCell className="text-center text-sm">P{row.paperNumber}</TableCell>
                      <TableCell className="text-xs text-white">
                        {formatDate(row.examDate + "T00:00:00", language, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-bold ${row.daysRemaining <= 14 ? "text-red-600" : row.daysRemaining <= 30 ? "text-amber-600" : "text-white"}`}>
                          {row.daysRemaining}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-semibold ${urgencyColor[row.urgencyState] || urgencyColor.build_mastery}`}>
                          {urgencyLabel[row.urgencyState] || row.urgencyState}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Users className="w-3 h-3 text-white" />
                          <span className="text-sm font-semibold">{row.learnerCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {row.lowReadinessCount > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            <span className="text-sm font-bold text-red-600">{row.lowReadinessCount}</span>
                          </div>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-white mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ===== DAILY FOCUS PUSH VIEW =====
interface DailyFocusPushSummary {
  sent_date: string;
  total_attempts: number;
  learner_attempts: number;
  parent_attempts: number;
  succeeded: number;
  failed: number;
  learners_reached: number;
  parents_reached: number;
}

interface DailyFocusPushRow {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  channel: string;
  payload_tag: string | null;
  success: boolean;
  error: string | null;
  created_at: string;
}

interface DailyFocusPushData {
  date: string;
  summary: DailyFocusPushSummary;
  rows: DailyFocusPushRow[];
}

interface DailyFocusTrendPoint {
  date: string;
  learners_reached: number;
  failed: number;
}

interface DailyFocusTrendData {
  days: number;
  trend: DailyFocusTrendPoint[];
}

function DailyFocusPushView() {
  const { language } = useLanguage();

  const todaySast = () => {
    const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;
    return new Date(Date.now() + SAST_OFFSET_MS).toISOString().slice(0, 10);
  };

  const [selectedDate, setSelectedDate] = useState<string>(todaySast);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const { data: trendData, isLoading: trendLoading } = useQuery<DailyFocusTrendData>({
    queryKey: ["/api/admin/push/daily-focus-log/trend"],
    queryFn: async () => {
      const res = await fetch("/api/admin/push/daily-focus-log/trend?days=7");
      if (!res.ok) throw new Error("Failed to fetch trend");
      return res.json();
    },
    staleTime: 60000,
  });

  const trendPoints = (trendData?.trend ?? []).map((p) => ({
    date: p.date.slice(5),
    learnersReached: Number(p.learners_reached),
    failed: Number(p.failed),
  }));

  const { data, isLoading, isError } = useQuery<DailyFocusPushData>({
    queryKey: ["/api/admin/push/daily-focus-log", selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/admin/push/daily-focus-log?date=${selectedDate}&limit=500`);
      if (!res.ok) throw new Error("Failed to fetch push log");
      return res.json();
    },
    staleTime: 30000,
  });

  const summary = data?.summary;
  const allRows = data?.rows ?? [];
  const totalPages = Math.ceil(allRows.length / PAGE_SIZE);
  const visibleRows = allRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setPage(0);
  };

  const skipped = summary
    ? Math.max(0, Number(summary.total_attempts) - Number(summary.succeeded) - Number(summary.failed))
    : 0;

  const t = {
    title: language === "af" ? "Daaglikse Fokus-Stoot Aflewering" : "Daily Focus Push Delivery",
    subtitle: language === "af"
      ? "Kies 'n datum om te sien hoeveel leerders en ouers bereik is en of aflewering geslaag het."
      : "Select a date to see how many learners and parents were reached and whether delivery succeeded.",
    date: language === "af" ? "Datum" : "Date",
    learnersReached: language === "af" ? "Leerders Bereik" : "Learners Reached",
    parentsReached: language === "af" ? "Ouers Bereik" : "Parents Reached",
    failed: language === "af" ? "Misluk" : "Failed",
    skipped: language === "af" ? "Oorgeslaan" : "Skipped",
    totalAttempts: language === "af" ? "Totaal Pogings" : "Total Attempts",
    user: language === "af" ? "Gebruiker" : "User",
    channel: language === "af" ? "Kanaal" : "Channel",
    tag: language === "af" ? "Tag" : "Tag",
    status: language === "af" ? "Status" : "Status",
    errorDetail: language === "af" ? "Foutbesonderhede" : "Error Detail",
    time: language === "af" ? "Tyd" : "Time",
    noData: language === "af" ? "Geen afleweringsrekords vir hierdie datum nie." : "No delivery records for this date.",
    prev: language === "af" ? "Vorige" : "Prev",
    next: language === "af" ? "Volgende" : "Next",
  };

  const trendLabels = {
    title: language === "af" ? "7-Dag Aflewer Tendens" : "7-Day Delivery Trend",
    learnersReached: language === "af" ? "Leerders Bereik" : "Learners Reached",
    failed: language === "af" ? "Misluk" : "Failed",
    noTrend: language === "af" ? "Geen trenddata beskikbaar nie." : "No trend data available.",
  };

  return (
    <div className="space-y-6">
      {/* 7-day trend chart */}
      <Card className="bg-black border-white/15 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 6px #7FEFFF)" }} />
            {trendLabels.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {trendLoading ? (
            <div className="h-48 rounded-xl bg-muted/40 animate-pulse" />
          ) : trendPoints.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <BellOff className="w-7 h-7 text-white" />
              <p className="text-sm text-white">{trendLabels.noTrend}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendPoints} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)", paddingTop: 8 }} />
                <Bar dataKey="learnersReached" name={trendLabels.learnersReached} fill="#7FEFFF" radius={[3, 3, 0, 0]} />
                <Bar dataKey="failed" name={trendLabels.failed} fill="#f87171" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Header + date picker */}
      <Card className="bg-black border-white/15 rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Send className="w-4 h-4" style={{ color: "#7FEFFF", filter: "drop-shadow(0 0 6px #7FEFFF)" }} />
                {t.title}
              </CardTitle>
              <p className="text-xs text-white mt-1">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs text-white font-medium">{t.date}</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="h-8 text-xs bg-black border-white/20 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Summary counters */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />)}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-red-500 text-sm py-4">
              <AlertCircle className="w-4 h-4" /> {language === "af" ? "Kon nie data laai nie." : "Could not load data."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-center">
                <div className="text-2xl font-black text-blue-400">{Number(summary?.learners_reached ?? 0)}</div>
                <div className="text-[10px] text-white mt-1 uppercase tracking-wide">{t.learnersReached}</div>
              </div>
              <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 text-center">
                <div className="text-2xl font-black text-purple-400">{Number(summary?.parents_reached ?? 0)}</div>
                <div className="text-[10px] text-white mt-1 uppercase tracking-wide">{t.parentsReached}</div>
              </div>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
                <div className="text-2xl font-black text-red-400">{Number(summary?.failed ?? 0)}</div>
                <div className="text-[10px] text-white mt-1 uppercase tracking-wide">{t.failed}</div>
              </div>
              <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-center">
                <div className="text-2xl font-black text-yellow-400">{skipped}</div>
                <div className="text-[10px] text-white mt-1 uppercase tracking-wide">{t.skipped}</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-2xl font-black text-white">{Number(summary?.total_attempts ?? 0)}</div>
                <div className="text-[10px] text-white mt-1 uppercase tracking-wide">{t.totalAttempts}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-user table */}
      <Card className="bg-black border-white/15 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            {language === "af" ? "Per-Gebruiker Rekords" : "Per-User Records"}
            {allRows.length > 0 && (
              <Badge variant="outline" className="ml-auto text-[10px]">{allRows.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />)}
            </div>
          ) : isError ? null : allRows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <BellOff className="w-8 h-8 text-white" />
              <p className="text-sm text-white">{t.noData}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-[11px] text-white font-medium">{t.user}</TableHead>
                      <TableHead className="text-[11px] text-white font-medium">{t.channel}</TableHead>
                      <TableHead className="text-[11px] text-white font-medium">{t.tag}</TableHead>
                      <TableHead className="text-[11px] text-white font-medium">{t.status}</TableHead>
                      <TableHead className="text-[11px] text-white font-medium">{t.errorDetail}</TableHead>
                      <TableHead className="text-[11px] text-white font-medium">{t.time}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.map((row, i) => (
                      <TableRow key={`${row.user_id}-${i}`} className="border-white/5 hover:bg-white/[0.03]">
                        <TableCell className="py-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-foreground">
                              {row.first_name || row.last_name
                                ? `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim()
                                : row.email ?? row.user_id}
                            </span>
                            {row.email && (row.first_name || row.last_name) && (
                              <span className="text-[10px] text-white">{row.email}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 capitalize ${
                              row.channel === "learner"
                                ? "border-blue-500/40 text-blue-400"
                                : "border-purple-500/40 text-purple-400"
                            }`}
                          >
                            {row.channel}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-[11px] text-white font-mono">{row.payload_tag ?? "â€”"}</span>
                        </TableCell>
                        <TableCell className="py-2">
                          {row.success ? (
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{language === "af" ? "Geslaag" : "Sent"}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{language === "af" ? "Misluk" : "Failed"}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-2 max-w-[200px]">
                          {row.error ? (
                            <span className="text-[10px] text-red-400/80 font-mono truncate block" title={row.error}>
                              {row.error}
                            </span>
                          ) : (
                            <span className="text-[10px] text-white">â€”</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 text-[10px] text-white whitespace-nowrap">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
                            : "â€”"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                  <span className="text-[11px] text-white">
                    {page * PAGE_SIZE + 1}â€“{Math.min((page + 1) * PAGE_SIZE, allRows.length)}{" "}
                    {language === "af" ? "van" : "of"} {allRows.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-white/15"
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                    >
                      {t.prev}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-white/15"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                    >
                      {t.next}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

