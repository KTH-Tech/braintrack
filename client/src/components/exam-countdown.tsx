import { useEffect, useState } from "react";
import { Rocket, GraduationCap } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const PRELIMS_DATE = new Date("2026-08-24T08:00:00+02:00");
export const FINALS_DATE = new Date("2026-10-26T08:00:00+02:00");

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function calc(target: Date): Countdown {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Cell({ value, unit }: { value: string | number; unit: string }) {
  return (
    <div className="flex flex-col items-center min-w-[3.25rem] px-2 py-1.5 rounded-lg bg-background/80 backdrop-blur border border-border shadow-sm">
      <span className="text-xl sm:text-2xl font-bold tabular-nums text-foreground leading-none">{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-white mt-0.5">{unit}</span>
    </div>
  );
}

function Block({
  label,
  icon: Icon,
  iconColor,
  cd,
  isAf,
  testid,
}: {
  label: string;
  icon: any;
  iconColor: string;
  cd: Countdown;
  isAf: boolean;
  testid: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2" data-testid={testid}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        <Cell value={cd.days} unit={isAf ? "Dae" : "Days"} />
        <span className="text-white text-sm">:</span>
        <Cell value={String(cd.hours).padStart(2, "0")} unit={isAf ? "Ure" : "Hrs"} />
        <span className="text-white text-sm">:</span>
        <Cell value={String(cd.minutes).padStart(2, "0")} unit="Min" />
        <span className="text-white text-sm">:</span>
        <Cell value={String(cd.seconds).padStart(2, "0")} unit="Sec" />
      </div>
    </div>
  );
}

export function ExamCountdown({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const isAf = language === "af";
  const [prelims, setPrelims] = useState<Countdown>(() => calc(PRELIMS_DATE));
  const [finals, setFinals] = useState<Countdown>(() => calc(FINALS_DATE));

  useEffect(() => {
    const id = setInterval(() => {
      setPrelims(calc(PRELIMS_DATE));
      setFinals(calc(FINALS_DATE));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-5 py-4 rounded-2xl border border-border/60 bg-gradient-to-br from-cyan-500/5 via-background to-orange-500/5 shadow-md ${className}`}
      data-testid="exam-countdown"
    >
      <Block
        label={isAf ? "Vooreksamens" : "Prelims"}
        icon={Rocket}
        iconColor="text-cyan-500"
        cd={prelims}
        isAf={isAf}
        testid="countdown-prelims"
      />
      <div className="hidden sm:block w-px h-14 bg-border" />
      <Block
        label={isAf ? "Finale" : "Finals"}
        icon={GraduationCap}
        iconColor="text-orange-500"
        cd={finals}
        isAf={isAf}
        testid="countdown-finals"
      />
    </div>
  );
}
