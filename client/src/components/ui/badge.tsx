import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Whitespace-nowrap: Badges should never wrap.
  "whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" +
  " hover-elevate " ,
  {
    variants: {
      variant: {
        default:
          "prismglass-btn border-white/30 text-white shadow-[0_1px_6px_rgba(6, 182, 212,0.12),inset_0_1px_0_rgba(255,255,255,0.2)]",
        secondary: "border-white/10  bg-white/[0.08] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        destructive:
          "prismglass-btn-destructive border-red-300/30 text-white shadow-[0_1px_6px_rgba(239,68,68,0.12),inset_0_1px_0_rgba(255,255,255,0.15)]",

        outline: " bg-white/[0.05] border border-white/10 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }
