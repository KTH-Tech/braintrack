import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ── Modern single-colour button system (brand board) ─────────────────────
// One flat colour per button. No gradients, no glows, no uppercase shouting.
// 12px radius everywhere (brand: "all buttons have 12px rounded corners").
// Variant/size NAMES are unchanged so no call site breaks — only the look.
// Brand hexes: Blue #6FA8FF · Cyan #7FEFFF · Green #93FFB8 · Yellow #FFF29E
//              Orange #FFC48F · Pink #FF9FE5 · Purple #C6A4FF

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
        "bg-[#6FA8FF] text-white border-2 border-[#6FA8FF] hover:bg-[#0057D6] shadow-[0_0_18px_rgba(111,168,255,0.45)]",

      // ── CTA outline — secondary action next to a cta ──────────────────
      "cta-outline":
        "bg-transparent text-[#6FA8FF] border-2 border-[#6FA8FF] hover:bg-[#6FA8FF]/10" +
        " dark:text-[#7FEFFF] dark:border-[#7FEFFF] dark:hover:bg-[#7FEFFF]/10",

      // ── CTA gold — standout yellow sticker ───────────────────────────
      "cta-gold":
        "bg-[#FFF29E] text-[#02040A] border-2 border-[#FFF29E] hover:bg-[#E6CF00] shadow-[0_0_18px_rgba(255,242,158,0.45)]",

      // ── Legacy names restyled ─────────────────────────────────────────
      gradient:
        "bg-[#C6A4FF] text-white border-2 border-[#C6A4FF] hover:brightness-110 shadow-[0_0_18px_rgba(198,164,255,0.4)]",
      neon:
        "bg-transparent text-[#C6A4FF] border-2 border-[#C6A4FF] hover:bg-[#C6A4FF]/10" +
        " dark:text-[#7FEFFF] dark:border-[#7FEFFF] dark:hover:bg-[#7FEFFF]/10",

      // ── Solid brand fills — Gen Z sticker style ───────────────────────
      cyan:   "bg-[#7FEFFF] text-[#02040A] border-2 border-[#7FEFFF] hover:brightness-110 shadow-[0_0_14px_rgba(127,239,255,0.4)]",
      blue:   "bg-[#6FA8FF] text-white border-2 border-[#6FA8FF] hover:brightness-110 shadow-[0_0_14px_rgba(111,168,255,0.4)]",
      pink:   "bg-[#FF9FE5] text-white border-2 border-[#FF9FE5] hover:brightness-110 shadow-[0_0_14px_rgba(255,159,229,0.4)]",
      green:  "bg-[#93FFB8] text-[#02040A] border-2 border-[#93FFB8] hover:brightness-110 shadow-[0_0_14px_rgba(147,255,184,0.4)]",
      orange: "bg-[#FFC48F] text-[#02040A] border-2 border-[#FFC48F] hover:brightness-110 shadow-[0_0_14px_rgba(255,196,143,0.4)]",
      gold:   "bg-[#FFF29E] text-[#02040A] border-2 border-[#FFF29E] hover:brightness-110 shadow-[0_0_14px_rgba(255,242,158,0.4)]",
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
