import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ── Modern single-colour button system (brand board) ─────────────────────
// One flat colour per button. No gradients, no glows, no uppercase shouting.
// 12px radius everywhere (brand: "all buttons have 12px rounded corners").
// Variant/size NAMES are unchanged so no call site breaks — only the look.
// Brand hexes: Blue #006BFF · Cyan #00E5FF · Green #22FF66 · Yellow #FFE600
//              Orange #FF8A00 · Pink #FF2BD6 · Purple #8A2BFF

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-black uppercase tracking-wide" +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" +
  " disabled:pointer-events-none disabled:opacity-50" +
  " [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " transition-all duration-150 hover:scale-[1.04] active:scale-[0.97]"

const buttonVariants = cva(base, {
  variants: {
    variant: {
      // ── Base ──────────────────────────────────────────────────────────
      default:
        "bg-foreground text-background hover:bg-foreground/90",
      primary:
        "bg-primary text-primary-foreground hover:brightness-110",
      secondary:
        "bg-muted text-foreground border-2 border-border hover:bg-muted/70",
      outline:
        "bg-transparent text-foreground border-2 border-border hover:bg-muted",
      ghost:
        "bg-transparent text-foreground hover:bg-muted",
      link:
        "bg-transparent text-foreground underline-offset-4 hover:underline normal-case tracking-normal",
      destructive:
        "bg-destructive text-destructive-foreground hover:brightness-110",

      // ── CTA — electric blue sticker ───────────────────────────────────
      cta:
        "bg-[#006BFF] text-white border-2 border-[#006BFF] hover:bg-[#0057D6] shadow-[0_0_18px_rgba(0,107,255,0.45)]",

      // ── CTA outline — secondary action next to a cta ──────────────────
      "cta-outline":
        "bg-transparent text-[#006BFF] border-2 border-[#006BFF] hover:bg-[#006BFF]/10" +
        " dark:text-[#00E5FF] dark:border-[#00E5FF] dark:hover:bg-[#00E5FF]/10",

      // ── CTA gold — standout yellow sticker ───────────────────────────
      "cta-gold":
        "bg-[#FFE600] text-[#02040A] border-2 border-[#FFE600] hover:bg-[#E6CF00] shadow-[0_0_18px_rgba(255,230,0,0.45)]",

      // ── Legacy names restyled ─────────────────────────────────────────
      gradient:
        "bg-[#8A2BFF] text-white border-2 border-[#8A2BFF] hover:brightness-110 shadow-[0_0_18px_rgba(138,43,255,0.4)]",
      neon:
        "bg-transparent text-[#8A2BFF] border-2 border-[#8A2BFF] hover:bg-[#8A2BFF]/10" +
        " dark:text-[#00E5FF] dark:border-[#00E5FF] dark:hover:bg-[#00E5FF]/10",

      // ── Solid brand fills — Gen Z sticker style ───────────────────────
      cyan:   "bg-[#00E5FF] text-[#02040A] border-2 border-[#00E5FF] hover:brightness-110 shadow-[0_0_14px_rgba(0,229,255,0.4)]",
      blue:   "bg-[#006BFF] text-white border-2 border-[#006BFF] hover:brightness-110 shadow-[0_0_14px_rgba(0,107,255,0.4)]",
      pink:   "bg-[#FF2BD6] text-white border-2 border-[#FF2BD6] hover:brightness-110 shadow-[0_0_14px_rgba(255,43,214,0.4)]",
      green:  "bg-[#22FF66] text-[#02040A] border-2 border-[#22FF66] hover:brightness-110 shadow-[0_0_14px_rgba(34,255,102,0.4)]",
      orange: "bg-[#FF8A00] text-[#02040A] border-2 border-[#FF8A00] hover:brightness-110 shadow-[0_0_14px_rgba(255,138,0,0.4)]",
      gold:   "bg-[#FFE600] text-[#02040A] border-2 border-[#FFE600] hover:brightness-110 shadow-[0_0_14px_rgba(255,230,0,0.4)]",
    },
    size: {
      // WCAG 2.5.5: minimum 44 × 44 px tap target for school-procurement a11y.
      default: "h-11 px-5",
      sm:      "h-9 px-3.5 text-xs",
      lg:      "h-12 px-7 text-base",
      xl:      "h-14 px-9 text-base",
      icon:    "h-11 w-11",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
