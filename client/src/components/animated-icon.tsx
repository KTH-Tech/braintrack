import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export type AnimatedIconName =
  | "book"
  | "pencil"
  | "bolt"
  | "target"
  | "calendar-check"
  | "trophy"
  | "brain"
  | "atom"
  | "graduation-cap"
  | "sparkles"
  | "flame"
  | "rocket";

export interface AnimatedIconProps {
  name: AnimatedIconName;
  className?: string;
  size?: number | string;
  strokeWidth?: number;
  title?: string;
  "data-testid"?: string;
}

const ICON_STROKE = 1.6;

export const AnimatedIcon = forwardRef<SVGSVGElement, AnimatedIconProps>(
  ({ name, className, size, strokeWidth = ICON_STROKE, title, ...rest }, ref) => {
    const uid = useId().replace(/[:]/g, "");
    const dim = size ?? "1em";
    const common = {
      ref,
      width: dim,
      height: dim,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      "aria-hidden": title ? undefined : true,
      role: title ? "img" : undefined,
      className: cn("anicon", `anicon-${name}`, className),
      "data-testid": rest["data-testid"],
    };

    return (
      <svg {...common}>
        {title ? <title>{title}</title> : null}
        {renderIcon(name, uid)}
      </svg>
    );
  }
);
AnimatedIcon.displayName = "AnimatedIcon";

function renderIcon(name: AnimatedIconName, uid: string) {
  switch (name) {
    case "book":
      return (
        <g>
          <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 1 4 18.5z" />
          <path d="M4 18.5A1.5 1.5 0 0 1 5.5 17H20" />
          <g className="anicon-book-pages">
            <path d="M8 7h7" />
            <path d="M8 10h7" />
            <path d="M8 13h5" />
          </g>
        </g>
      );
    case "pencil":
      return (
        <g>
          <path d="M4 20l1-4L16 5l4 4L9 20z" />
          <path d="M14 7l4 4" />
          <g className="anicon-pencil-spark">
            <path d="M19 4l.6 1.4L21 6l-1.4.6L19 8l-.6-1.4L17 6l1.4-.6z" strokeWidth={1.2} />
          </g>
        </g>
      );
    case "bolt":
      return (
        <g>
          <path d="M13 2 4 14h6l-1 8 9-12h-6z" className="anicon-bolt-shape" />
        </g>
      );
    case "target":
      return (
        <g>
          <circle cx="12" cy="12" r="9" className="anicon-target-ring r1" />
          <circle cx="12" cy="12" r="6" className="anicon-target-ring r2" />
          <circle cx="12" cy="12" r="3" className="anicon-target-ring r3" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </g>
      );
    case "calendar-check":
      return (
        <g>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
          <path d="M8 3v4M16 3v4" />
          <path d="M8.5 14.5l2.5 2.5 4.5-5" className="anicon-calendar-check" pathLength={1} />
        </g>
      );
    case "trophy":
      return (
        <g>
          <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
          <path d="M7 6H4v2a3 3 0 0 0 3 3" />
          <path d="M17 6h3v2a3 3 0 0 1-3 3" />
          <path d="M9 14h6l-.5 4h-5z" />
          <path d="M8 21h8" />
          <g className="anicon-trophy-shine" stroke="none" fill="currentColor">
            <circle cx="12" cy="7" r=".7" />
            <circle cx="9" cy="9" r=".5" />
            <circle cx="15" cy="9" r=".5" />
          </g>
        </g>
      );
    case "brain":
      return (
        <g>
          <path d="M9 4.5A2.5 2.5 0 0 0 6.5 7 2.5 2.5 0 0 0 4 9.5a2.5 2.5 0 0 0 1.5 2.3A2.5 2.5 0 0 0 4 14.5 2.5 2.5 0 0 0 6.5 17 2.5 2.5 0 0 0 9 19.5a2.5 2.5 0 0 0 3-2.5V5a2.5 2.5 0 0 0-3-.5z" />
          <path d="M15 4.5A2.5 2.5 0 0 1 17.5 7 2.5 2.5 0 0 1 20 9.5a2.5 2.5 0 0 1-1.5 2.3A2.5 2.5 0 0 1 20 14.5 2.5 2.5 0 0 1 17.5 17 2.5 2.5 0 0 1 15 19.5a2.5 2.5 0 0 1-3-2.5V5a2.5 2.5 0 0 1 3-.5z" />
          <g className="anicon-brain-spark" stroke="none" fill="currentColor">
            <circle cx="12" cy="9" r=".8" />
            <circle cx="9" cy="13" r=".6" />
            <circle cx="15" cy="13" r=".6" />
          </g>
        </g>
      );
    case "atom":
      return (
        <g>
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <g className="anicon-atom-orbit">
            <ellipse cx="12" cy="12" rx="9" ry="3.5" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
          </g>
        </g>
      );
    case "graduation-cap":
      return (
        <g>
          <path d="M2 9l10-4 10 4-10 4z" />
          <path d="M6 11v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4" />
          <path d="M22 9v5" className="anicon-grad-tassel" />
        </g>
      );
    case "sparkles":
      return (
        <g className="anicon-sparkles">
          <path d="M12 3l1.5 4 4 1.5-4 1.5L12 14l-1.5-4-4-1.5 4-1.5z" />
          <path d="M19 14l.8 2 2 .8-2 .8L19 19.6 18.2 17.6l-2-.8 2-.8z" />
          <path d="M5 16l.6 1.4L7 18l-1.4.6L5 20l-.6-1.4L3 18l1.4-.6z" />
        </g>
      );
    case "flame":
      return (
        <g>
          <path d="M12 3s-1 4-4 6c-2.2 1.5-3 3.5-3 5.5A6.5 6.5 0 0 0 18.5 14c0-3-2-5-3.5-6 0 2-1 3-1 3s-1-2-2-3-1 .5-1 .5z" className="anicon-flame-shape" />
        </g>
      );
    case "rocket":
      return (
        <g>
          <path d="M14 4c4 0 6 2 6 6 0 5-7 11-7 11s-2-2-3-3l-3 1 1-3c-1-1-3-3-3-3s6-7 11-7z" />
          <circle cx="14" cy="9" r="1.6" />
          <path d="M6 16c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5" className="anicon-rocket-flame" />
        </g>
      );
  }
}
