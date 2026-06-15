import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  GraduationCap, BookOpen, Calculator, FlaskConical, TrendingUp, TrendingDown, 
  AlertTriangle, Target, Sparkles, Download, Share2, Activity,
  Brain, Clock, CalendarDays, ArrowRight, UserCircle, Globe, CheckCircle2, ChevronRight
} from "lucide-react";

const BraintrackGradient = "linear-gradient(90deg, #FF6A00 0%, #FF00A8 33%, #6A00FF 66%, #00C2FF 100%)";

export function Editorial() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#1A1A1A] font-['Inter',sans-serif] relative overflow-hidden selection:bg-[#6A00FF]/20 selection:text-[#6A00FF]">
      {/* Fonts & Base Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600;700&display=swap');
        
        .font-fraunces { font-family: 'Fraunces', serif; }
        
        .gradient-border {
          position: relative;
          background: #FFFFFF;
          background-clip: padding-box;
          border: 1px solid transparent;
          border-radius: 1.5rem;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          z-index: -1;
          margin: -2px;
          border-radius: inherit;
          background: ${BraintrackGradient};
          opacity: 0.8;
        }
          
        .gradient-text {
          background: ${BraintrackGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-gradient {
          position: relative;
          z-index: 1;
        }
        .btn-gradient::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0.5rem;
          padding: 2px;
          background: ${BraintrackGradient};
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }
        .btn-gradient:hover::before {
          opacity: 1;
        }
      `}} />

      {/* Floating Background Icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-[0.03]">
         <div className="absolute top-[10%] left-[5%] transform -rotate-12"><BookOpen size={120} /></div>
         <div className="absolute top-[20%] right-[10%] transform rotate-12"><Calculator size={100} /></div>
         <div className="absolute top-[60%] left-[10%] transform rotate-6"><FlaskConical size={140} /></div>
         <div className="absolute bottom-[10%] right-[15%] transform -rotate-6"><GraduationCap size={160} /></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 relative z-10 space-y-16">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-fraunces text-4xl md:text-5xl font-light text-[#1A1A1A] tracking-tight">Parent Report</h1>
            <p className="text-[#6B7280] mt-2 text-lg font-light italic">Track progress. Spot risk. Support improvement.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="btn-gradient bg-white text-[#1A1A1A] hover:bg-gray-50 border-0 shadow-sm gap-2 rounded-lg font-medium">
              <Share2 size={16} /> Share Report
            </Button>
            <Button className="bg-[#1A1A1A] text-white hover:bg-black gap-2 shadow-xl shadow-black/10 rounded-lg font-medium">
              <Download size={16} /> Download PDF
            </Button>
          </div>
        </header>

        {/* 1. Learner Overview Hero Card */}
        <section>
          <div className="gradient-border p-8 md:p-12 shadow-2xl shadow-[#6A00FF]/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C2FF]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000 ease-out"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-[#FF6A00]/20 to-[#6A00FF]/20 flex items-center justify-center border border-white shadow-inner shrink-0">
                <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-[#6A00FF]" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-white/80 backdrop-blur border-[#E5E7EB] text-[#6B7280] font-normal uppercase tracking-wider text-xs">Grade 12 NSC / CAPS</Badge>
                  <span className="text-[#6B7280] text-sm">Pretoria Boys High School</span>
                </div>
                <h2 className="font-fraunces text-4xl md:text-5xl font-medium text-[#1A1A1A] mb-2 tracking-tight">Thabo Nkosi</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[#6B7280] text-sm font-medium mt-4">
                  <div className="flex items-center gap-1.5"><UserCircle size={16} className="text-[#00C2FF]"/> Linked to: Lerato Nkosi</div>
                  <div className="flex items-center gap-1.5"><BookOpen size={16} className="text-[#FF00A8]"/> 7 Subjects Active</div>
                  <div className="flex items-center gap-1.5"><Brain size={16} className="text-[#FF6A00]"/> VARK: Visual-Kinesthetic</div>
                  <div className="flex items-center gap-1.5"><Clock size={16} className="text-[#6B7280]"/> Last Active: Today, 14:30</div>
                </div>
              </div>
            </div>

            <Separator className="my-8 bg-[#E5E7EB]/50" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              <div>
                <p className="text-sm text-[#6B7280] mb-1 font-medium">Current Average</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-fraunces font-medium text-[#1A1A1A]">68%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1 font-medium">Trend Status</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-medium text-[#10B981] flex items-center gap-1">
                    <TrendingUp size={20} strokeWidth={2.5} /> Improving
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1 font-medium">Exam Readiness</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-medium text-[#F59E0B]">Borderline</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1 font-medium">Study Consistency</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-medium text-[#10B981]">Strong</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Performance Snapshot */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#F7F9FC] rounded-lg"><Target size={20} className="text-[#1A1A1A]" /></div>
                <Badge className="bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 font-medium">+4% this month</Badge>
              </div>
              <div>
                <p className="text-sm text-[#6B7280] font-medium">Current Average</p>
                <h3 className="text-3xl font-fraunces text-[#1A1A1A] mt-1">68%</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2 bg-[#F7F9FC] rounded-lg"><CheckCircle2 size={20} className="text-[#1A1A1A]" /></div>
              </div>
              <div className="relative z-10">
                <p className="text-sm text-[#6B7280] font-medium">Exam Readiness</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-fraunces text-[#1A1A1A]">62%</h3>
                  <span className="text-sm text-[#F59E0B] font-medium">Target: 75%</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-20">
                 <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="95.4" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF6A00" />
                        <stop offset="100%" stopColor="#FF00A8" />
                      </linearGradient>
                    </defs>
                 </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#F7F9FC] rounded-lg"><CalendarDays size={20} className="text-[#1A1A1A]" /></div>
                <Badge className="bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 font-medium">On Track</Badge>
              </div>
              <div>
                <p className="text-sm text-[#6B7280] font-medium">Weekly Study Sessions</p>
                <h3 className="text-3xl font-fraunces text-[#1A1A1A] mt-1">14</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A00]/5 to-[#00C2FF]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#F7F9FC] rounded-lg"><Sparkles size={20} className="text-[#FF00A8]" /></div>
              </div>
              <div>
                <p className="text-sm text-[#6B7280] font-medium">Monthly Improvement</p>
                <h3 className="text-3xl font-fraunces text-[#1A1A1A] mt-1">+12 hrs</h3>
                <p className="text-xs text-[#6B7280] mt-1">vs last month</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. Subject Performance */}
        <section className="space-y-6">
          <div>
            <h3 className="font-fraunces text-2xl text-[#1A1A1A]">Subject Performance</h3>
            <p className="text-[#6B7280]">Current academic standing across all active subjects.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="space-y-5">
                {[
                  { name: "Accounting", score: 82, trend: "up", status: "Strong", color: "#10B981" },
                  { name: "English HL", score: 75, trend: "up", status: "Stable", color: "#6A00FF" },
                  { name: "Mathematics", score: 58, trend: "down", status: "Needs Support", color: "#F59E0B" },
                  { name: "Physical Sciences", score: 54, trend: "flat", status: "At Risk", color: "#EF4444" },
                  { name: "Life Sciences", score: 70, trend: "up", status: "Stable", color: "#6A00FF" },
                  { name: "Geography", score: 68, trend: "flat", status: "Stable", color: "#6A00FF" },
                  { name: "Afrikaans FAL", score: 65, trend: "up", status: "Stable", color: "#6A00FF" }
                ].map((subject, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-36 text-sm font-medium text-[#1A1A1A] truncate">{subject.name}</div>
                    <div className="flex-1 h-2 bg-[#F7F9FC] rounded-full overflow-hidden relative">
                      <div 
                        className="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${subject.score}%`,
                          background: subject.status === "Strong" ? BraintrackGradient : subject.color
                        }}
                      ></div>
                    </div>
                    <div className="w-12 text-right font-fraunces font-medium text-[#1A1A1A]">{subject.score}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB] bg-[#F7F9FC]/50">
               {[
                 { name: "Accounting", score: 82, status: "Strong", icon: TrendingUp, iconColor: "text-[#10B981]" },
                 { name: "English HL", score: 75, status: "Stable", icon: TrendingUp, iconColor: "text-[#10B981]" },
                 { name: "Mathematics", score: 58, status: "Needs Support", icon: TrendingDown, iconColor: "text-[#F59E0B]" },
                 { name: "Physical Sci.", score: 54, status: "At Risk", icon: TrendingDown, iconColor: "text-[#EF4444]" }
               ].map((item, i) => (
                 <div key={i} className="p-4 flex flex-col justify-between">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-xs font-medium text-[#6B7280]">{item.name}</span>
                     <item.icon size={14} className={item.iconColor} />
                   </div>
                   <div className="flex items-end justify-between">
                     <span className="font-fraunces text-xl text-[#1A1A1A]">{item.score}%</span>
                     <span className={`text-[10px] uppercase font-bold tracking-wider ${
                        item.status === 'Strong' ? 'text-[#10B981]' : 
                        item.status === 'Needs Support' ? 'text-[#F59E0B]' :
                        item.status === 'At Risk' ? 'text-[#EF4444]' : 'text-[#6A00FF]'
                     }`}>{item.status}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Two Column Layout: Support Needed & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 4. Weak Spots / Support Needed */}
          <section className="space-y-6">
            <div>
              <h3 className="font-fraunces text-2xl text-[#1A1A1A]">Support Needed</h3>
              <p className="text-[#6B7280]">Key topics requiring focused attention this week.</p>
            </div>
            
            <div className="space-y-4">
              <Card className="border-[#F59E0B]/30 bg-[#F59E0B]/5 shadow-sm rounded-2xl">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Target className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-1">Mathematics — Algebra</h4>
                    <p className="text-sm text-[#6B7280] leading-relaxed">Score dropped 12% in the last assessment. Recommended to revisit core concepts.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#EF4444]/30 bg-[#EF4444]/5 shadow-sm rounded-2xl">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-1">Physical Sciences — Organic Chemistry</h4>
                    <p className="text-sm text-[#6B7280] leading-relaxed">Consistent difficulty detected across multiple practice papers.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#F59E0B]/30 bg-[#F59E0B]/5 shadow-sm rounded-2xl">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Target className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-1">Accounting — Cash Flow</h4>
                    <p className="text-sm text-[#6B7280] leading-relaxed">Struggling with time management on this specific topic.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 6. Alerts / Risk Panel */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-fraunces text-2xl text-[#1A1A1A]">Alerts</h3>
                <p className="text-[#6B7280]">Recent activity warnings.</p>
              </div>
              <Button variant="outline" size="sm" className="btn-gradient border-0 text-[#1A1A1A] rounded-lg">Review All</Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-white border-l-4 border-[#EF4444] rounded-r-xl shadow-sm">
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">Low Score Alert</h5>
                  <p className="text-sm text-[#6B7280]">Scored 45% on latest Physical Sciences mock exam.</p>
                </div>
                <Badge variant="secondary" className="bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 border-0">High Risk</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white border-l-4 border-[#F59E0B] rounded-r-xl shadow-sm">
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">Declining Trend</h5>
                  <p className="text-sm text-[#6B7280]">Mathematics has dropped for 2 consecutive weeks.</p>
                </div>
                <Badge variant="secondary" className="bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 border-0">Monitor</Badge>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white border-l-4 border-[#E5E7EB] rounded-r-xl shadow-sm opacity-70">
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">Inactivity</h5>
                  <p className="text-sm text-[#6B7280]">No activity recorded on Tuesday or Wednesday.</p>
                </div>
                <span className="text-xs text-[#6B7280]">Resolved</span>
              </div>
            </div>
          </section>

        </div>

        {/* 5. Study Activity & 7. Learning Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="col-span-1 md:col-span-2 border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2 border-b border-[#E5E7EB] mb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="font-fraunces text-2xl font-normal">Study Activity</CardTitle>
                <Badge variant="outline" className="bg-[#F7F9FC] text-[#6B7280] border-[#E5E7EB]">Last 7 Days</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-end">
              <div className="flex-1 w-full pt-4">
                <div className="flex items-end gap-2 h-32 w-full">
                  {[40, 20, 60, 80, 100, 30, 90].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-[#F7F9FC] rounded-sm flex-1 relative flex items-end overflow-hidden">
                        <div 
                           className="w-full rounded-sm"
                           style={{ 
                             height: `${h}%`,
                             background: h > 70 ? BraintrackGradient : '#E5E7EB'
                           }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-[#6B7280] font-medium">{"SMTWTFS"[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-48 space-y-4 shrink-0">
                <div>
                  <p className="text-sm text-[#6B7280] font-medium">Total Time</p>
                  <p className="text-2xl font-fraunces text-[#1A1A1A]">12h 45m</p>
                </div>
                <div>
                  <p className="text-sm text-[#6B7280] font-medium">Days Active</p>
                  <p className="text-2xl font-fraunces text-[#1A1A1A]">5 / 7</p>
                </div>
                <div className="p-3 bg-[#F7F9FC] rounded-xl">
                  <p className="text-xs text-[#1A1A1A] font-medium flex items-center gap-1.5"><Sparkles size={12} className="text-[#FF00A8]"/> Most active: Thursday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 border-0 shadow-sm bg-[#1A1A1A] text-white rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#6A00FF]/20 rounded-full blur-3xl"></div>
            
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="font-fraunces text-2xl font-normal text-white">Learning Style</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 flex flex-col h-[calc(100%-4rem)] justify-between">
              <div className="space-y-4 my-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Globe className="w-5 h-5 text-[#00C2FF]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Primary</p>
                    <p className="font-fraunces text-lg text-white">Visual</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Activity className="w-5 h-5 text-[#FF00A8]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Secondary</p>
                    <p className="font-fraunces text-lg text-white">Kinesthetic</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed mt-4 pt-4 border-t border-white/10">
                Thabo responds best to diagrams, visual examples, and active practice exercises rather than pure reading.
              </p>
            </CardContent>
          </Card>

        </div>

        {/* 8. Monthly Summary & 9. Recommendations */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#E5E7EB] flex flex-col justify-center">
              <h3 className="font-fraunces text-3xl text-[#1A1A1A] mb-2">This Month at a Glance</h3>
              <p className="text-[#6B7280] mb-8">A summary of overall progress and focus areas.</p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
                  <span className="text-[#6B7280] font-medium">Monthly Average Trend</span>
                  <span className="text-[#1A1A1A] font-fraunces text-xl flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#10B981]" /> +4.2%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
                  <span className="text-[#6B7280] font-medium">Total Active Days</span>
                  <span className="text-[#1A1A1A] font-fraunces text-xl">21 Days</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
                  <span className="text-[#6B7280] font-medium">Biggest Improvement</span>
                  <span className="text-[#1A1A1A] font-medium">Accounting</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280] font-medium">Recommended Focus</span>
                  <span className="text-[#1A1A1A] font-medium">Physical Sciences</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 md:p-12 bg-[#F7F9FC] flex flex-col justify-center">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-[#6A00FF]" />
              </div>
              <h4 className="font-fraunces text-2xl text-[#1A1A1A] mb-4">Suggested Support</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#FF6A00] shrink-0" />
                  <p className="text-[#1A1A1A] leading-relaxed"><strong>Encourage 20 minutes today.</strong> Small, consistent study sessions build better retention than cramming.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#FF00A8] shrink-0" />
                  <p className="text-[#1A1A1A] leading-relaxed"><strong>Focus on Math this week.</strong> With upcoming mocks, extra practice on Algebra will secure essential marks.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#6A00FF] shrink-0" />
                  <p className="text-[#1A1A1A] leading-relaxed"><strong>Celebrate the win.</strong> Accounting marks are up 12% this month. Acknowledge the hard work!</p>
                </li>
              </ul>
              <Button className="mt-8 bg-white text-[#1A1A1A] hover:bg-gray-50 border border-[#E5E7EB] shadow-sm w-fit btn-gradient rounded-lg font-medium group">
                View Full Insight Plan <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* 10. Subscription / Admin Footer */}
        <section className="pt-8 border-t border-[#E5E7EB] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#374151] flex items-center justify-center shrink-0">
               <span className="font-fraunces text-white font-bold tracking-tight text-sm">BT</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A1A]">BrainTrack ExamTrack™</p>
              <p className="text-xs text-[#6B7280]">Active Plan • Renews Oct 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6B7280]">1 Linked Learner</span>
            <Button variant="outline" size="sm" className="rounded-lg border-[#E5E7EB] text-[#1A1A1A]">Manage Plan</Button>
          </div>
        </section>

      </div>
    </div>
  );
}
