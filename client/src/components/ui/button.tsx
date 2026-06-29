import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-wide" +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" +
  " disabled:pointer-events-none disabled:opacity-50" +
  " [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " border transition-all duration-200 active:scale-[0.97]"

const buttonVariants = cva(base, {
  variants: {
    variant: {
      // ── Base ──────────────────────────────────────────────────────────
      default:
        "bg-foreground text-background border-transparent hover:bg-foreground/90",
      primary:
        "bg-primary text-primary-foreground border-transparent hover:bg-primary/90",
      secondary:
        "bg-white/[0.06] text-foreground border-white/15 hover:bg-white/[0.10] hover:border-white/25",
      outline:
        "bg-transparent text-foreground border-white/20 hover:bg-white/[0.06] hover:border-white/35",
      ghost:
        "bg-transparent text-foreground border-transparent hover:bg-white/[0.06]",
      link:
        "bg-transparent text-foreground border-transparent underline-offset-4 hover:underline",
      destructive:
        "bg-red-500 text-white border-transparent hover:bg-red-500/80",

      // ── CTA — primary action (cyan gradient + glow) ───────────────────
      // Used for "Start free trial" / main conversion buttons.
      cta:
        "relative bg-gradient-to-r from-[#28c9d6] to-[#4f8cd9] text-black font-black border-transparent" +
        " shadow-[0_0_22px_rgba(40,201,214,0.45)] hover:shadow-[0_0_36px_rgba(40,201,214,0.65)]" +
        " hover:scale-[1.02] hover:brightness-110 rounded-xl uppercase tracking-[0.1em]",

      // ── CTA outline — secondary action (neon cyan border) ────────────
      "cta-outline":
        "bg-black text-[#28c9d6] border-[#28c9d6]/80 font-black" +
        " shadow-[0_0_14px_rgba(40,201,214,0.3)] hover:shadow-[0_0_24px_rgba(40,201,214,0.55)]" +
        " hover:bg-[rgba(40,201,214,0.06)] hover:border-[#28c9d6] rounded-xl uppercase tracking-[0.1em]",

      // ── CTA gold — accent action (gold/orange gradient) ───────────────
      "cta-gold":
        "relative bg-gradient-to-r from-[#ffd83a] to-[#ff8a1f] text-black font-black border-transparent" +
        " shadow-[0_0_20px_rgba(255,216,58,0.4)] hover:shadow-[0_0_34px_rgba(255,216,58,0.65)]" +
        " hover:scale-[1.02] hover:brightness-110 rounded-xl uppercase tracking-[0.1em]",

      // ── Gradient — vibrant rainbow fill ───────────────────────────────
      gradient:
        "relative text-black font-black border-transparent rounded-xl uppercase tracking-[0.1em]" +
        " bg-[linear-gradient(135deg,#ff8a1f,#ffd83a,#28c9d6,#8e7cdc)]" +
        " shadow-[0_0_20px_rgba(142,124,220,0.35)] hover:shadow-[0_0_32px_rgba(142,124,220,0.55)]" +
        " hover:scale-[1.02] hover:brightness-110",

      // ── Neon — outline with animated pulse glow ───────────────────────
      neon:
        "bg-black font-black border-[#8e7cdc] text-[#8e7cdc] rounded-xl uppercase tracking-[0.1em]" +
        " shadow-[0_0_14px_rgba(142,124,220,0.35),inset_0_0_12px_rgba(142,124,220,0.06)]" +
        " hover:shadow-[0_0_28px_rgba(142,124,220,0.6),inset_0_0_18px_rgba(142,124,220,0.12)]" +
        " hover:bg-[rgba(142,124,220,0.08)] hover:border-[#8e7cdc]",

      // ── Solid colour fills (API compatibility) ────────────────────────
      cyan:   "bg-cyan-500 text-black border-transparent hover:bg-cyan-500/85 shadow-[0_0_14px_rgba(40,201,214,0.35)] hover:shadow-[0_0_22px_rgba(40,201,214,0.55)]",
      blue:   "bg-blue-500 text-white border-transparent hover:bg-blue-500/85",
      pink:   "bg-pink-500 text-white border-transparent hover:bg-pink-500/85",
      green:  "bg-green-500 text-black border-transparent hover:bg-green-500/85",
      orange: "bg-orange-500 text-black border-transparent hover:bg-orange-500/85",
      gold:   "bg-yellow-400 text-black border-transparent hover:bg-yellow-400/85 shadow-[0_0_14px_rgba(255,216,58,0.35)]",
    },
    size: {
      // WCAG 2.5.5: minimum 44 × 44 px tap target for school-procurement a11y.
      default: "h-11 px-4 py-2",
      sm:      "h-9 rounded-md px-3 text-xs",
      lg:      "h-12 rounded-md px-8 text-base",
      xl:      "h-14 rounded-xl px-10 text-base",
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
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
