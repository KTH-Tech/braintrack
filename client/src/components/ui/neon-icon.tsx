import * as React from "react";
import { cn } from "@/lib/utils";

export type NeonAccent =
  | "pink"
  | "cyan"
  | "blue"
  | "green"
  | "orange"
  | "gold";

const ACCENT_CLASS: Record<NeonAccent, string> = {
  pink: "text-pink-400 [filter:drop-shadow(0_0_6px_rgba(236,72,153,0.7))_drop-shadow(0_0_12px_rgba(236,72,153,0.35))]",
  cyan: "text-cyan-300 [filter:drop-shadow(0_0_6px_rgba(6,182,212,0.7))_drop-shadow(0_0_12px_rgba(6,182,212,0.35))]",
  blue: "text-blue-400 [filter:drop-shadow(0_0_6px_rgba(59,130,246,0.7))_drop-shadow(0_0_12px_rgba(59,130,246,0.35))]",
  green: "text-emerald-400 [filter:drop-shadow(0_0_6px_rgba(34,197,94,0.7))_drop-shadow(0_0_12px_rgba(34,197,94,0.35))]",
  orange: "text-orange-400 [filter:drop-shadow(0_0_6px_rgba(249,115,22,0.7))_drop-shadow(0_0_12px_rgba(249,115,22,0.35))]",
  gold: "text-yellow-300 [filter:drop-shadow(0_0_6px_rgba(250,204,21,0.7))_drop-shadow(0_0_12px_rgba(250,204,21,0.35))]",
};

export interface NeonIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** A lucide-react icon component (or any SVG component accepting size + strokeWidth). */
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; size?: number | string }>;
  accent?: NeonAccent;
  size?: number;
  strokeWidth?: number;
  /** Accessible label — required when icon stands alone without nearby text. */
  label?: string;
}

export const NeonIcon = React.forwardRef<HTMLSpanElement, NeonIconProps>(
  ({ icon: Icon, accent = "cyan", size = 18, strokeWidth = 1.75, label, className, ...rest }, ref) => {
    const aria = label
      ? { role: "img" as const, "aria-label": label }
      : { "aria-hidden": true as const };
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center justify-center", ACCENT_CLASS[accent], className)}
        {...aria}
        {...rest}
      >
        <Icon size={size} strokeWidth={strokeWidth} />
      </span>
    );
  }
);
NeonIcon.displayName = "NeonIcon";
