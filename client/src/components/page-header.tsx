import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedIcon, type AnimatedIconName } from "@/components/animated-icon";

interface PageHeaderProps {
  icon: LucideIcon;
  animatedIcon?: AnimatedIconName;
  title: string;
  subtitle?: string;
  testId?: string;
  className?: string;
  actions?: React.ReactNode;
  sticky?: boolean;
}

export function PageHeader({
  icon: Icon,
  animatedIcon,
  title,
  subtitle,
  testId,
  className,
  actions,
  sticky,
}: PageHeaderProps) {
  const inner = (
    <div className={cn("flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row", !sticky && "mb-6", className)}>
      <div className="flex items-center gap-3 min-w-0">
        <span
          aria-hidden="true"
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-500/15 via-pink-500/12 to-emerald-500/12 border border-white/10 text-primary"
        >
          {animatedIcon ? (
            <AnimatedIcon name={animatedIcon} size={22} />
          ) : (
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </span>
        <div className="min-w-0">
          <h1
            data-testid={testId}
            className="font-heading text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-foreground truncate"
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-white mt-1 truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">{actions}</div> : null}
    </div>
  );

  if (!sticky) return inner;

  return (
    <header className="sticky top-0 z-50 bg-card/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3">{inner}</div>
    </header>
  );
}
