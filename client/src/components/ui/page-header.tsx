import * as React from "react";
import { cn } from "@/lib/utils";
import { NeonIcon, type NeonAccent } from "./neon-icon";

// Brand hex values (nearest match to the old Tailwind palette colors), glow
// text-shadows removed — the public/signed-in system uses flat solid ink,
// never neon bloom.
const ACCENT_TEXT: Record<NeonAccent, string> = {
  pink: "text-[#FFB7E5]",
  cyan: "text-[#6EE7F9]",
  blue: "text-[#9FD8FF]",
  green: "text-[#94F7C5]",
  orange: "text-[#FFE29A]",
  gold: "text-[#C5B3FF]",
};

interface BaseHeaderProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; size?: number | string }>;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  accent?: NeonAccent;
  shimmer?: boolean;
  clickable?: boolean;
  className?: string;
  right?: React.ReactNode;
}

export function PageHeader({
  icon,
  title,
  subtitle,
  accent = "cyan",
  shimmer = false,
  clickable = false,
  className,
  right,
}: BaseHeaderProps) {
  const titleAccent = shimmer ? "cosmic-text-shimmer" : ACCENT_TEXT[accent];
  return (
    <div className={cn("flex items-start gap-3 mb-4", className)}>
      <NeonIcon
        icon={icon}
        accent={accent}
        size={28}
        strokeWidth={1.75}
        className={cn(clickable && "header-press")}
      />
      <div className="flex-1 min-w-0">
        <h1
          className={cn(
            "header-bare text-3xl sm:text-4xl font-bold tracking-tight",
            titleAccent,
            clickable && "header-press header-shimmer-underline cursor-pointer select-none"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-white mt-1">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  accent = "cyan",
  shimmer = false,
  clickable = false,
  className,
  right,
}: BaseHeaderProps) {
  const titleAccent = shimmer ? "cosmic-text" : ACCENT_TEXT[accent];
  return (
    <div className={cn("flex items-center gap-2.5 mb-3", className)}>
      <NeonIcon
        icon={icon}
        accent={accent}
        size={20}
        strokeWidth={1.75}
        className={cn(clickable && "header-press")}
      />
      <h2
        className={cn(
          "header-bare text-xl sm:text-2xl font-semibold tracking-tight flex-1 min-w-0",
          titleAccent,
          clickable && "header-press header-shimmer-underline cursor-pointer select-none"
        )}
      >
        {title}
        {subtitle && (
          <span className="block text-xs font-normal text-white mt-0.5">
            {subtitle}
          </span>
        )}
      </h2>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
