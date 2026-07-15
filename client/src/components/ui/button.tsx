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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold" +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" +
  " disabled:pointer-events-none disabled:opacity-50" +
  " [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " transition-colors duration-150 active:scale-[0.98]"

const buttonVariants = cva(base, {
  variants: {
    variant: {
      // ── Base ──────────────────────────────────────────────────────────
      default:
        "bg-foreground text-background hover:bg-foreground/90",
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary:
        "bg-muted text-foreground border border-border hover:bg-muted/70",
      outline:
        "bg-transparent text-foreground border border-border hover:bg-muted",
      ghost:
        "bg-transparent text-foreground hover:bg-muted",
      link:
        "bg-transparent text-foreground underline-offset-4 hover:underline",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",

      // ── CTA — primary conversion action (single flat brand blue) ──────
      cta:
        "bg-[#006BFF] text-white font-bold hover:bg-[#0057D6]",

      // ── CTA outline — secondary action next to a cta ──────────────────
      "cta-outline":
        "bg-transparent text-[#006BFF] border border-[#006BFF] font-bold hover:bg-[#006BFF]/10" +
        " dark:text-[#00E5FF] dark:border-[#00E5FF] dark:hover:bg-[#00E5FF]/10",

      // ── CTA gold — accent action (flat brand yellow) ──────────────────
      "cta-gold":
        "bg-[#FFE600] text-[#02040A] font-bold hover:bg-[#E6CF00]",

      // ── Legacy names, restyled flat (no gradients / no pulse glow) ─────
      gradient:
        "bg-[#8A2BFF] text-white font-bold hover:bg-[#7522DB]",
      neon:
        "bg-transparent text-[#8A2BFF] border border-[#8A2BFF] font-bold hover:bg-[#8A2BFF]/10" +
        " dark:text-[#00E5FF] dark:border-[#00E5FF] dark:hover:bg-[#00E5FF]/10",

      // ── Solid brand colour fills ───────────────────────────────────────
      cyan:   "bg-[#00E5FF] text-[#02040A] hover:bg-[#00CBE2]",
      blue:   "bg-[#006BFF] text-white hover:bg-[#0057D6]",
      pink:   "bg-[#FF2BD6] text-white hover:bg-[#E01FBB]",
      green:  "bg-[#22FF66] text-[#02040A] hover:bg-[#1DE25A]",
      orange: "bg-[#FF8A00] text-[#02040A] hover:bg-[#E37B00]",
      gold:   "bg-[#FFE600] text-[#02040A] hover:bg-[#E6CF00]",
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
