import React from "react";
import { 
  GraduationCap, BookOpen, Calculator, FlaskConical, TrendingUp, 
  TrendingDown, AlertTriangle, Target, Sparkles, Download, Share2, 
  ChevronRight, Calendar, Clock, Activity, BrainCircuit, Lightbulb,
  CheckCircle2, CreditCard, ChevronDown, User, Heart, ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Gradient constants
const BRAND_GRADIENT = "bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] to-[#6A00FF] bg-[length:200%_auto]";
const BRAND_GRADIENT_BORDER = "bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] to-[#00C2FF]";
const POSITIVE_GREEN = "text-emerald-600";
const WARNING_AMBER = "text-amber-600";
const ALERT_RED = "text-rose-600";

const MOCK_DATA = {
  learner: {
    name: "Thabo Nkosi",
    grade: "12",
    school: "Pretoria Boys High School",
    parent: "Lerato Nkosi",
    average: 68,
    trend: "Improving",
    readiness: 72,
    subjectCount: 7,
    varkPrimary: "Visual",
    varkSecondary: "Kinesthetic",
    lastActive: "Today, 14:30",
  },
  subjects: [
    { name: "Mathematics", score: 54, trend: "up", status: "Needs Support", icon: Calculator },
    { name: "Physical Sciences", score: 61, trend: "up", status: "Stable", icon: FlaskConical },
    { name: "Life Sciences", score: 76, trend: "flat", status: "Strong", icon: BrainCircuit },
    { name: "Accounting", score: 48, trend: "down", status: "At Risk", icon: BookOpen },
    { name: "English HL", score: 82, trend: "up", status: "Strong", icon: BookOpen },
    { name: "Afrikaans FAL", score: 70, trend: "flat", status: "Stable", icon: BookOpen },
    { name: "Geography", score: 85, trend: "up", status: "Strong", icon: BookOpen },
  ],
  supportNeeded: [
    { subject: "Accounting", topic: "Cash Flow Statements", priority: "High", icon: Target },
    { subject: "Mathematics", topic: "Calculus", priority: "High", icon: Target },
    { subject: "Physical Sciences", topic: "Organic Chemistry", priority: "Medium", icon: Target },
  ],
  activity: {
    daysActive: 5,
    timeSpent: "8h 45m",
    sessions: 12,
    mostActive: "Wednesday",
    dailyMinutes: [45, 120, 180, 90, 0, 60, 30] // Mon-Sun
  },
  alerts: [
    { type: "risk", message: "Accounting average dropped below 50%.", level: "high" },
    { type: "inactivity", message: "No study activity logged on Friday.", level: "medium" }
  ],
  monthSummary: {
    trend: "+4.2%",
    activeDays: 22,
    biggestImprovement: "Mathematics (+8%)",
    biggestRisk: "Accounting (-5%)",
    focus: "Accounting & Physical Sciences"
  }
};

export function Narrative() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] font-['Inter',sans-serif] text-slate-800 pb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'DM Serif Display', serif; }
      `}} />

      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            B
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">BrainTrack</h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Parent Insight Report</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-12">

        {/* 1. LEARNER OVERVIEW HERO CARD */}
        <section className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] to-[#00C2FF] rounded-[2rem] opacity-20 blur-xl"></div>
          <Card className="relative overflow-hidden border-0 rounded-[1.5rem] shadow-xl bg-white">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] to-[#00C2FF]"></div>
            
            <div className="p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-slate-100">
                    <AvatarImage src="https://i.pravatar.cc/300?u=thabo" />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-2xl font-serif">TN</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
                    <GraduationCap className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 leading-tight">
                    {MOCK_DATA.learner.name}
                  </h2>
                  <p className="text-slate-500 font-medium text-lg">
                    Grade {MOCK_DATA.learner.grade} • {MOCK_DATA.learner.school}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium border-0 hover:bg-slate-100">
                      Parent: {MOCK_DATA.learner.parent}
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      Active {MOCK_DATA.learner.lastActive}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Avg</p>
                  <p className="text-2xl font-bold text-slate-800">{MOCK_DATA.learner.average}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trend</p>
                  <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    {MOCK_DATA.learner.trend}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Readiness</p>
                  <p className="text-2xl font-bold text-slate-800">{MOCK_DATA.learner.readiness}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects</p>
                  <p className="text-2xl font-bold text-slate-800">{MOCK_DATA.learner.subjectCount}</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 2. PERFORMANCE SNAPSHOT & NARRATIVE OPENER */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-3xl font-serif text-slate-900 leading-snug mb-3">
              Thabo is making solid progress, with strong improvements in Life Sciences and Geography.
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed">
              His overall average sits at <strong className="text-slate-800">68%</strong>, up 4.2% from last month. Exam readiness is building steadily, though we've identified a few key topics that need attention this week.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-2 h-full">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                    <circle cx="40" cy="40" r="36" className="stroke-slate-100" strokeWidth="8" fill="none" />
                    <circle cx="40" cy="40" r="36" className="stroke-indigo-500" strokeWidth="8" fill="none" strokeDasharray="226.2" strokeDashoffset={226.2 - (226.2 * 72) / 100} strokeLinecap="round" />
                  </svg>
                  <span className="text-xl font-bold text-slate-800 absolute">72%</span>
                </div>
                <h4 className="font-semibold text-slate-700 mt-2">Exam Readiness</h4>
                <p className="text-sm text-slate-500">Target: 80%</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-5 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-slate-700">Weekly Study</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900 my-1">12 <span className="text-lg font-medium text-slate-500">sessions</span></p>
                <p className="text-sm text-slate-500">8h 45m total time</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="h-24 w-24 text-emerald-600" />
              </div>
              <CardContent className="p-5 flex flex-col justify-center h-full relative z-10">
                <h4 className="font-semibold text-slate-700 mb-2">Monthly Growth</h4>
                <p className="text-3xl font-bold text-emerald-600 my-1">+4.2%</p>
                <p className="text-sm text-slate-500">Across all subjects</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. SUBJECT PERFORMANCE */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-serif text-slate-900 leading-snug mb-2">
              Language subjects remain his strongest pillar, while Accounting requires immediate intervention.
            </h3>
          </div>

          <div className="space-y-4">
            {MOCK_DATA.subjects.map((subject, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-48 shrink-0">
                  <div className={`p-2 rounded-lg ${
                    subject.status === "Strong" ? "bg-indigo-50 text-indigo-600" :
                    subject.status === "At Risk" ? "bg-rose-50 text-rose-600" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    <subject.icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-slate-800">{subject.name}</span>
                </div>
                
                <div className="flex-1 w-full flex items-center gap-4">
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        subject.status === 'Strong' ? 'bg-gradient-to-r from-indigo-400 to-indigo-600' :
                        subject.status === 'At Risk' ? 'bg-rose-500' :
                        subject.status === 'Needs Support' ? 'bg-amber-400' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${subject.score}%` }}
                    />
                  </div>
                  <div className="w-12 text-right font-bold text-slate-700">
                    {subject.score}%
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-32 gap-3 shrink-0">
                  {subject.trend === 'up' ? <TrendingUp className="h-4 w-4 text-emerald-500" /> :
                   subject.trend === 'down' ? <TrendingDown className="h-4 w-4 text-rose-500" /> :
                   <Activity className="h-4 w-4 text-slate-400" />}
                  
                  <Badge variant="outline" className={`w-24 justify-center ${
                    subject.status === 'Strong' ? 'text-indigo-700 border-indigo-200 bg-indigo-50' :
                    subject.status === 'At Risk' ? 'text-rose-700 border-rose-200 bg-rose-50' :
                    subject.status === 'Needs Support' ? 'text-amber-700 border-amber-200 bg-amber-50' :
                    'text-slate-600 border-slate-200 bg-slate-50'
                  }`}>
                    {subject.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. SUPPORT NEEDED */}
        <section className="space-y-6 pt-6">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-serif text-slate-900 leading-snug mb-2">
              Let's focus on these specific topics this week.
            </h3>
            <p className="text-slate-600">
              Mastering these 3 areas will have the biggest impact on Thabo's overall average and exam readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_DATA.supportNeeded.map((item, idx) => (
              <Card key={idx} className="border-rose-100 bg-rose-50/30 shadow-sm rounded-xl">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-white rounded-lg text-rose-500 shadow-sm border border-rose-100">
                      <Target className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 text-[10px] uppercase font-bold tracking-wider">
                      {item.priority} Priority
                    </Badge>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{item.subject}</h4>
                  <p className="text-sm font-medium text-rose-700">{item.topic}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 5. STUDY ACTIVITY & 6. ALERTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <section className="space-y-6">
            <h3 className="text-2xl font-serif text-slate-900 leading-snug">
              Study Rhythm
            </h3>
            
            <Card className="border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Time This Week</p>
                    <p className="text-3xl font-bold text-slate-900">{MOCK_DATA.activity.timeSpent}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 mb-1">
                    Good Consistency
                  </Badge>
                </div>
                
                {/* Custom SVG Bar Chart */}
                <div className="h-32 w-full flex items-end justify-between gap-2">
                  {MOCK_DATA.activity.dailyMinutes.map((mins, idx) => {
                    const days = ['M','T','W','T','F','S','S'];
                    const height = Math.max((mins / 180) * 100, 4); // 4% min height for visibility
                    const isToday = idx === 5; // Assuming Saturday is "today" for mockup
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                        <div className="w-full bg-slate-100 rounded-t-sm rounded-b-sm relative group">
                          <div 
                            className={`absolute bottom-0 w-full rounded-t-sm rounded-b-sm transition-all ${isToday ? 'bg-indigo-500' : 'bg-indigo-300'}`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{days[idx]}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-serif text-slate-900 leading-snug flex items-center gap-2">
              Attention Needed
            </h3>
            
            <div className="space-y-3">
              {MOCK_DATA.alerts.map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex gap-4 ${
                  alert.level === 'high' ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`shrink-0 mt-0.5 ${
                    alert.level === 'high' ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${
                      alert.level === 'high' ? 'text-rose-800' : 'text-amber-800'
                    }`}>
                      {alert.type === 'risk' ? 'Performance Alert' : 'Activity Notice'}
                    </h4>
                    <p className={`text-sm mt-0.5 ${
                      alert.level === 'high' ? 'text-rose-600' : 'text-amber-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex gap-4 items-center">
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Lightbulb className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-sm font-medium text-slate-700">Encourage Thabo to log at least 20 minutes of Accounting today to keep momentum.</p>
                 </div>
              </div>
            </div>
          </section>
        </div>

        <Separator className="bg-slate-200 my-8" />

        {/* 7. LEARNING STYLE & 8. MONTH AT A GLANCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-xl font-serif text-slate-900">How Thabo Learns Best</h3>
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
              <div className="p-5 flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 rounded-full border-4 border-indigo-50 flex items-center justify-center bg-white shadow-sm">
                  <div className="w-full h-full rounded-full border-4 border-indigo-400 border-t-transparent border-r-transparent rotate-45"></div>
                  <Sparkles className="h-6 w-6 text-indigo-500 absolute" />
                </div>
                <div>
                  <div className="flex gap-2 mb-1">
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50">Visual</Badge>
                    <Badge variant="outline" className="text-slate-500 border-slate-200">Kinesthetic</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Thabo responds best to diagrams, color-coding, and active practice rather than just reading text.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-serif text-slate-900">This Month</h3>
            <Card className="border-slate-200 shadow-sm rounded-xl bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
              <div className="p-5 relative z-10 flex items-center justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Active Days</p>
                    <p className="text-2xl font-bold">{MOCK_DATA.monthSummary.activeDays}/30</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Biggest Win</p>
                    <p className="text-sm font-medium text-emerald-400">{MOCK_DATA.monthSummary.biggestImprovement}</p>
                  </div>
                </div>
                <div className="w-px h-16 bg-slate-700 mx-4"></div>
                <div className="flex-1">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    A solid month overall. Keep focusing on <span className="text-white font-medium">{MOCK_DATA.monthSummary.focus}</span> to reach the 75% target average.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </div>

        {/* 9. SUGGESTED SUPPORT CTA */}
        <section className="mt-12 flex justify-center">
          <Button className="h-14 px-8 rounded-xl bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-xl shadow-indigo-500/10 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] to-[#00C2FF] opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#FF6A00] via-[#FF00A8] to-[#00C2FF]"></div>
            <span className="font-semibold text-base mr-2">View Full Interactive Insights</span>
            <ChevronRight className="h-5 w-5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
          </Button>
        </section>

        {/* 10. SUBSCRIPTION FOOTER */}
        <section className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">B</div>
              <span className="font-medium text-slate-700">BrainTrack Premium</span>
              <span>• Active Plan</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Renews Oct 12, 2026</span>
              <a href="#" className="font-medium text-indigo-600 hover:underline">Manage Subscription</a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
