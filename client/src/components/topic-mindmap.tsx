import type { Topic } from "@shared/schema";
import brandLogo from "@assets/Logo_01_1779989960628.jpeg";

interface TopicMindmapProps {
  subject: string;
  topics: Topic[];
  isAf?: boolean;
  className?: string;
}

const weightColor: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  high:   { border: "border-rose-400/70",    bg: "bg-rose-50/80 dark:bg-rose-950/30",    text: "text-rose-700 dark:text-rose-300",   dot: "bg-rose-400" },
  medium: { border: "border-amber-400/70",   bg: "bg-amber-50/80 dark:bg-amber-950/30",  text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-400" },
  low:    { border: "border-emerald-400/70", bg: "bg-emerald-50/80 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-400" },
};

export function TopicMindmap({ subject, topics, isAf = false, className = "" }: TopicMindmapProps) {
  const high   = topics.filter(t => t.capsWeighting === "high");
  const medium = topics.filter(t => t.capsWeighting === "medium");
  const low    = topics.filter(t => t.capsWeighting === "low" || !t.capsWeighting);

  const grouped = [
    { weight: "high"   as const, items: high,   label: isAf ? "Hoë gewig ★"  : "High weight ★"  },
    { weight: "medium" as const, items: medium, label: isAf ? "Medium gewig"  : "Medium weight"  },
    { weight: "low"    as const, items: low,    label: isAf ? "Lae gewig"     : "Lower weight"   },
  ].filter(g => g.items.length > 0);

  return (
    <div className={`w-full ${className}`}>
      <img
        src={brandLogo}
        alt="BrainTrack"
        className="hidden print:block mx-auto mb-4 w-[180px] h-auto"
        style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500 text-white font-bold text-sm shadow-md text-center max-w-[200px]">
          {subject}
        </div>

        <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-400 to-transparent mx-auto" />

        <div className="w-full grid grid-cols-1 gap-3">
          {grouped.map(({ weight, items, label }) => {
            const c = weightColor[weight];
            return (
              <div key={weight} className="relative">
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 ${c.text}`}>
                  <span className={`w-2 h-2 rounded-full inline-block ${c.dot}`} />
                  {label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map(topic => (
                    <div
                      key={topic.id}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium ${c.bg} ${c.border} ${c.text} shadow-sm leading-tight max-w-[180px]`}
                      title={isAf ? topic.nameAfrikaans : topic.name}
                    >
                      {isAf ? topic.nameAfrikaans : topic.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50 w-full flex-wrap">
          {Object.entries(weightColor).map(([w, c]) => (
            <div key={w} className="flex items-center gap-1.5 text-[10px]">
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <span className="text-white capitalize">{isAf ? (w === "high" ? "Hoë gewig" : w === "medium" ? "Medium" : "Laag") : w}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
