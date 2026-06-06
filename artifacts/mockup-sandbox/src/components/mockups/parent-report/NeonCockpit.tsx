import React from "react";
import { 
  GraduationCap, BookOpen, Calculator, FlaskConical, TrendingUp, TrendingDown, 
  AlertTriangle, Target, Sparkles, Download, Share2, Activity,
  Brain, CheckCircle2, Clock, Calendar, Settings, ChevronRight
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Gradient definition for SVG
const BrainTrackGradient = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="braintrack-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6A00" />
        <stop offset="33%" stopColor="#FF00A8" />
        <stop offset="66%" stopColor="#6A00FF" />
        <stop offset="100%" stopColor="#00C2FF" />
      </linearGradient>
    </defs>
  </svg>
);

// Custom UI Components for Neon Cockpit
const NeonCard = ({ children, className = "", glowing = false }: { children: React.ReactNode, className?: string, glowing?: boolean }) => (
  <div className={`relative group ${className}`}>
    {glowing && (
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] via-[#6A00FF] to-[#00C2FF] rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
    )}
    <div className={`relative bg-[#0F172A] border border-[#1F2937] rounded-xl overflow-hidden h-full flex flex-col ${glowing ? 'border-transparent' : ''}`}>
      {children}
    </div>
  </div>
);

const NeonButton = ({ children, onClick, icon, variant = "primary", className = "" }: any) => {
  if (variant === "primary") {
    return (
      <button 
        onClick={onClick}
        className={`relative inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all duration-200 bg-[#070B17] rounded-lg group ${className}`}
      >
        <div className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] via-[#6A00FF] to-[#00C2FF] p-[2px]">
          <div className="absolute inset-0 bg-[#070B17] rounded-lg"></div>
        </div>
        <div className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] via-[#6A00FF] to-[#00C2FF] opacity-0 group-hover:opacity-20 blur-md transition-opacity"></div>
        <span className="relative flex items-center gap-2">
          {icon}
          {children}
        </span>
      </button>
    );
  }
  
  return (
    <button 
      onClick={onClick}
      className={`relative inline-flex items-center justify-center px-4 py-2 font-medium text-[#F8FAFC] transition-colors duration-200 bg-[#1F2937] hover:bg-[#334155] rounded-lg border border-[#334155] ${className}`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  );
};

const ProgressRing = ({ value, label, sublabel, size = 120, strokeWidth = 10 }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full blur-md opacity-20" style={{ background: 'linear-gradient(135deg, #FF6A00, #00C2FF)' }}></div>
        <svg className="transform -rotate-90 relative z-10" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1F2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#braintrack-grad)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {value}%
          </span>
        </div>
      </div>
      {(label || sublabel) && (
        <div className="mt-4 text-center">
          {label && <div className="font-semibold text-[#F8FAFC]">{label}</div>}
          {sublabel && <div className="text-sm text-[#94A3B8]">{sublabel}</div>}
        </div>
      )}
    </div>
  );
};

// Data
const learner = {
  name: "Thabo Nkosi",
  grade: 12,
  school: "Pretoria Boys High School",
  parent: "Lerato Nkosi",
  average: 74,
  trend: "Improving",
  readiness: 78,
  subjectCount: 7,
  lastActive: "Today, 14:30",
  varkPrimary: "Visual",
  varkSecondary: "Kinesthetic",
  activeDays: 5,
  timeSpent: "14h 20m",
  sessionsCompleted: 18,
  bestDay: "Tuesday",
  monthlyImprovement: "+4.2%",
  plan: "ExamTrack Premium",
  renewal: "15 Oct 2026",
};

const subjects = [
  { name: "Mathematics", score: 68, trend: "up", status: "Stable", weak: false },
  { name: "Physical Sciences", score: 54, trend: "down", status: "At Risk", weak: true },
  { name: "Life Sciences", score: 82, trend: "up", status: "Strong", weak: false },
  { name: "Accounting", score: 61, trend: "down", status: "Needs Support", weak: true },
  { name: "English HL", score: 79, trend: "flat", status: "Stable", weak: false },
  { name: "Afrikaans FAL", score: 75, trend: "up", status: "Strong", weak: false },
  { name: "Geography", score: 88, trend: "up", status: "Strong", weak: false },
];

const weakTopics = [
  { subject: "Physical Sciences", topic: "Organic Chemistry", icon: <FlaskConical className="w-5 h-5 text-amber-500" /> },
  { subject: "Mathematics", topic: "Calculus & Algebra", icon: <Calculator className="w-5 h-5 text-red-500" /> },
  { subject: "Accounting", topic: "Cash Flow Statements", icon: <Activity className="w-5 h-5 text-amber-500" /> },
];

const alerts = [
  { type: "risk", title: "Physical Sciences Score Drop", desc: "Average dropped by 5% over the last two weeks.", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { type: "warning", title: "Missed Math Practice", desc: "No Mathematics practice sessions completed since Monday.", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

const activityData = [
  { day: "M", hours: 2.5, active: true },
  { day: "T", hours: 3.5, active: true },
  { day: "W", hours: 1.5, active: true },
  { day: "T", hours: 4.0, active: true },
  { day: "F", hours: 0, active: false },
  { day: "S", hours: 2.0, active: true },
  { day: "S", hours: 0.5, active: true },
];

// Main Component
export function NeonCockpit() {
  return (
    <div className="min-h-[100dvh] bg-[#070B17] text-[#F8FAFC] font-['Space_Grotesk',sans-serif] selection:bg-[#FF00A8] selection:text-white pb-24 overflow-x-hidden relative">
      <BrainTrackGradient />
      
      {/* Ambient background glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#6A00FF] opacity-10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#00C2FF] opacity-5 blur-[150px]"></div>
        
        {/* Floating Icons (subtle) */}
        <GraduationCap className="absolute top-[15%] left-[10%] w-32 h-32 text-white/5 rotate-12 blur-[2px]" />
        <Calculator className="absolute bottom-[30%] right-[10%] w-40 h-40 text-white/5 -rotate-12 blur-[2px]" />
        <BookOpen className="absolute top-[40%] left-[80%] w-24 h-24 text-white/5 rotate-45 blur-[1px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] to-[#6A00FF] font-bold text-xl tracking-tight mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF00A8]" />
              BrainTrack
            </div>
            <h1 className="text-3xl font-bold">Parent Report</h1>
            <p className="text-[#94A3B8]">Track progress. Spot risk. Support improvement.</p>
          </div>
          <div className="flex items-center gap-3">
            <NeonButton icon={<Download className="w-4 h-4" />} variant="secondary">Export PDF</NeonButton>
            <NeonButton icon={<Share2 className="w-4 h-4" />} variant="secondary">Share</NeonButton>
          </div>
        </header>

        {/* 1. Learner Overview hero card */}
        <section>
          <NeonCard glowing className="p-[2px]">
            <div className="bg-[#0B1120] rounded-[10px] p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8">
              <div className="flex-shrink-0 flex flex-col items-center gap-4 border-b md:border-b-0 md:border-r border-[#1F2937] pb-6 md:pb-0 md:pr-8 text-center md:text-left">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#101828] to-[#1E293B] border border-[#334155] flex items-center justify-center shadow-[0_0_30px_rgba(106,0,255,0.3)]">
                    <GraduationCap className="w-12 h-12 text-[#00C2FF]" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#101828] border border-[#334155] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{learner.name}</h2>
                  <p className="text-[#00C2FF] font-medium">Grade {learner.grade}</p>
                </div>
              </div>
              
              <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                <div className="col-span-2 sm:col-span-4 flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="bg-[#1E293B]/50 border-[#334155] text-[#CBD5E1]"><BookOpen className="w-3 h-3 mr-1"/> {learner.school}</Badge>
                  <Badge variant="outline" className="bg-[#1E293B]/50 border-[#334155] text-[#CBD5E1]"><Settings className="w-3 h-3 mr-1"/> Linked: {learner.parent}</Badge>
                  <Badge variant="outline" className="bg-[#1E293B]/50 border-[#334155] text-[#CBD5E1]"><Clock className="w-3 h-3 mr-1"/> Last active: {learner.lastActive}</Badge>
                </div>
                
                <div className="bg-[#101828] rounded-lg p-4 border border-[#1F2937]">
                  <div className="text-sm text-[#94A3B8] mb-1">Current Avg</div>
                  <div className="text-3xl font-bold text-white">{learner.average}%</div>
                  <div className="text-sm text-green-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> {learner.trend}</div>
                </div>
                
                <div className="bg-[#101828] rounded-lg p-4 border border-[#1F2937]">
                  <div className="text-sm text-[#94A3B8] mb-1">Readiness</div>
                  <div className="text-3xl font-bold text-white">{learner.readiness}%</div>
                  <div className="text-sm text-[#00C2FF] mt-1 flex items-center gap-1">On Track</div>
                </div>
                
                <div className="bg-[#101828] rounded-lg p-4 border border-[#1F2937]">
                  <div className="text-sm text-[#94A3B8] mb-1">Subjects</div>
                  <div className="text-3xl font-bold text-white">{learner.subjectCount}</div>
                  <div className="text-sm text-[#94A3B8] mt-1">CAPS Active</div>
                </div>

                <div className="bg-[#101828] rounded-lg p-4 border border-[#1F2937]">
                  <div className="text-sm text-[#94A3B8] mb-1">VARK Style</div>
                  <div className="text-lg font-bold text-white">{learner.varkPrimary}</div>
                  <div className="text-sm text-[#94A3B8] mt-1">{learner.varkSecondary}</div>
                </div>
              </div>
            </div>
          </NeonCard>
        </section>

        {/* Top Split: Snapshot & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. Performance Snapshot */}
          <section className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF00A8]" />
              Performance Snapshot
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NeonCard className="p-6 col-span-1 sm:col-span-1 flex flex-col items-center justify-center">
                <ProgressRing value={learner.readiness} label="Exam Readiness" sublabel="Target: 80%" size={140} strokeWidth={8} />
              </NeonCard>
              
              <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
                <NeonCard className="p-5 justify-center">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center mb-3">
                    <Calendar className="w-5 h-5 text-[#FF6A00]" />
                  </div>
                  <div className="text-2xl font-bold text-white">{learner.activeDays} Days</div>
                  <div className="text-sm text-[#94A3B8]">Active this week</div>
                </NeonCard>
                
                <NeonCard className="p-5 justify-center">
                  <div className="w-10 h-10 rounded-lg bg-[#00C2FF]/10 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-[#00C2FF]" />
                  </div>
                  <div className="text-2xl font-bold text-white">{learner.monthlyImprovement}</div>
                  <div className="text-sm text-[#94A3B8]">Improvement this month</div>
                </NeonCard>
                
                <NeonCard className="p-5 justify-center col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-[#6A00FF]/10 flex items-center justify-center mb-3">
                        <Clock className="w-5 h-5 text-[#6A00FF]" />
                      </div>
                      <div className="text-2xl font-bold text-white">{learner.timeSpent}</div>
                      <div className="text-sm text-[#94A3B8]">Total study time this week</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white mb-1">{learner.sessionsCompleted}</div>
                      <div className="text-sm text-[#94A3B8]">Sessions completed</div>
                    </div>
                  </div>
                </NeonCard>
              </div>
            </div>
          </section>

          {/* 6. Alerts / Risk Panel */}
          <section className="space-y-4">
             <h3 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alerts & Risks
            </h3>
            <div className="space-y-3 h-full">
              {alerts.map((alert, i) => (
                <NeonCard key={i} className={`p-5 ${alert.border} border`}>
                  <div className="flex gap-3">
                    <div className={`mt-0.5 p-1.5 rounded-md ${alert.bg} h-fit`}>
                      <AlertTriangle className={`w-4 h-4 ${alert.color}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${alert.color} mb-1`}>{alert.title}</h4>
                      <p className="text-sm text-[#94A3B8] leading-relaxed">{alert.desc}</p>
                    </div>
                  </div>
                </NeonCard>
              ))}
              <NeonCard className="p-5 border-[#1F2937] border border-dashed flex items-center justify-center bg-transparent">
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#334155] mx-auto mb-2" />
                  <p className="text-sm text-[#64748B]">No other alerts</p>
                </div>
              </NeonCard>
            </div>
          </section>
        </div>

        {/* Middle Split: Subjects & Weak Spots */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 3. Subject Performance */}
          <section className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-[#6A00FF]" />
              Subject Performance
            </h3>
            <NeonCard className="p-6">
              <div className="space-y-6">
                {subjects.map((sub, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-1/3 sm:w-1/4 font-medium text-sm sm:text-base truncate" title={sub.name}>
                      {sub.name}
                    </div>
                    <div className="w-1/2 sm:w-1/2">
                      <div className="h-3 w-full bg-[#1E293B] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full relative ${sub.weak ? 'bg-amber-500' : 'bg-gradient-to-r from-[#6A00FF] to-[#00C2FF]'}`}
                          style={{ width: `${sub.score}%` }}
                        >
                          {/* Inner glow for bars */}
                          <div className="absolute inset-0 w-full h-full bg-white opacity-20" style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-1/6 sm:w-1/4 flex justify-between items-center text-right">
                      <div className="font-bold flex items-center gap-1 sm:gap-2">
                        {sub.score}%
                        {sub.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400 hidden sm:block" />}
                        {sub.trend === 'down' && <TrendingDown className="w-3 h-3 text-amber-500 hidden sm:block" />}
                        {sub.trend === 'flat' && <TrendingUp className="w-3 h-3 text-[#64748B] hidden sm:block" />}
                      </div>
                      <Badge variant="outline" className={`hidden sm:flex text-xs ${
                        sub.status === 'Strong' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                        sub.status === 'At Risk' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                        sub.status === 'Needs Support' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                        'border-[#334155] text-[#94A3B8] bg-[#1E293B]'
                      }`}>
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>
          </section>

          {/* 4. Support Needed */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#FF00A8]" />
              Support Needed
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-[#94A3B8] mb-2">Focus areas based on recent assessments.</p>
              {weakTopics.map((item, i) => (
                <NeonCard key={i} className="p-4 border-l-2 border-l-[#FF00A8] bg-[#0F172A]/80">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-[#1E293B] p-2 rounded-md">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#00C2FF] uppercase tracking-wider mb-1">{item.subject}</div>
                      <div className="font-medium text-white mb-2">{item.topic}</div>
                      <div className="text-xs text-[#94A3B8]">Scores in this topic are 15% below average.</div>
                    </div>
                  </div>
                </NeonCard>
              ))}
            </div>
          </section>

        </div>

        {/* Bottom Three Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 5. Study Activity */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Study Activity</h3>
            <NeonCard className="p-5 flex flex-col justify-between">
              <div className="flex items-end justify-between h-32 mb-4 px-2">
                {activityData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-[#1F2937] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#334155] whitespace-nowrap z-20">
                      {d.hours} hrs
                    </div>
                    <div className="w-6 sm:w-8 bg-[#1E293B] rounded-t-sm h-[100px] flex items-end justify-center relative overflow-hidden">
                      <div 
                        className={`w-full rounded-t-sm transition-all duration-500 ${d.active ? 'bg-gradient-to-t from-[#6A00FF] to-[#00C2FF]' : 'bg-transparent'}`}
                        style={{ height: `${(d.hours / 4) * 100}%` }}
                      >
                         {/* Glow at top of bar */}
                         {d.active && <div className="absolute top-0 w-full h-2 bg-white/40 blur-[1px]"></div>}
                      </div>
                    </div>
                    <div className="text-xs text-[#64748B] font-medium">{d.day}</div>
                  </div>
                ))}
              </div>
              <Separator className="bg-[#1F2937] my-4" />
              <div>
                <div className="text-sm text-[#94A3B8] mb-1">Most Active Day</div>
                <div className="text-lg font-bold text-white">{learner.bestDay}</div>
                <div className="text-xs text-[#64748B] mt-1">Consistency builds retention.</div>
              </div>
            </NeonCard>
          </section>

          {/* 7. Learning Style */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Learning Style</h3>
            <NeonCard className="p-5">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  {/* Split Donut Mock */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Primary - Visual */}
                    <circle cx="50" cy="50" r="40" stroke="url(#braintrack-grad)" strokeWidth="12" fill="transparent" strokeDasharray="160 251" strokeDashoffset="0" className="opacity-90"/>
                    {/* Secondary - Kinesthetic */}
                    <circle cx="50" cy="50" r="40" stroke="#FF6A00" strokeWidth="12" fill="transparent" strokeDasharray="60 251" strokeDashoffset="-170" className="opacity-70"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-[#00C2FF]"></div>
                    <span className="text-sm font-medium text-white">Primary: {learner.varkPrimary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF6A00]"></div>
                    <span className="text-sm font-medium text-[#94A3B8]">Secondary: {learner.varkSecondary}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#1E293B]/30 p-4 rounded-lg border border-[#1E293B]">
                <p className="text-sm text-[#CBD5E1] leading-relaxed">
                  Thabo responds best to diagrams, color-coded notes, and hands-on examples. Lengthy text explanations are less effective.
                </p>
              </div>
            </NeonCard>
          </section>

          {/* 8. This Month / 9. Suggested Support */}
          <section className="space-y-4 flex flex-col">
            <h3 className="text-lg font-semibold text-white">Month at a Glance</h3>
            <NeonCard className="p-5 flex-grow flex flex-col">
              <div className="space-y-4 mb-6 flex-grow">
                 <div className="flex justify-between items-center border-b border-[#1F2937] pb-3">
                  <span className="text-sm text-[#94A3B8]">Biggest Improvement</span>
                  <span className="font-semibold text-white flex items-center gap-1">Life Sciences <TrendingUp className="w-3 h-3 text-green-400"/></span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1F2937] pb-3">
                  <span className="text-sm text-[#94A3B8]">Biggest Risk</span>
                  <span className="font-semibold text-amber-400">Physical Sciences</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-4 rounded-lg border border-[#334155] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF00A8]"></div>
                <h4 className="text-sm font-semibold text-white mb-2">Suggested Support</h4>
                <ul className="text-sm text-[#CBD5E1] space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00C2FF] mt-1.5 flex-shrink-0"></div>
                    Encourage 20 minutes of Physical Sciences daily.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00C2FF] mt-1.5 flex-shrink-0"></div>
                    Praise the strong momentum in Life Sciences.
                  </li>
                </ul>
              </div>
            </NeonCard>
          </section>
        </div>

        {/* 10. Subscription / Actions */}
        <section className="pt-8 mt-4 border-t border-[#1F2937] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#101828] to-[#1E293B] border border-[#334155] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#FF00A8]" />
            </div>
            <div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                {learner.plan} <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">Active</Badge>
              </div>
              <div className="text-sm text-[#94A3B8]">Renews: {learner.renewal} • 1 Learner Linked</div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <NeonButton variant="secondary" className="w-full sm:w-auto">Manage Plan</NeonButton>
            <NeonButton variant="primary" className="w-full sm:w-auto">View Full Insights <ChevronRight className="w-4 h-4" /></NeonButton>
          </div>
        </section>

      </div>
    </div>
  );
}
