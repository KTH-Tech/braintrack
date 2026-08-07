import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ── Modern single-colour button system (brand board) ─────────────────────
// One flat colour per button. No gradients, no glows, no uppercase shouting.
// 12px radius everywhere (brand: "all buttons have 12px rounded corners").
// Variant/size NAMES are unchanged so no call site breaks — only the look.
// Brand hexes: Blue #9FD8FF · Cyan #6EE7F9 · Green #94F7C5 · Yellow #FFE29A
//              Orange #FFE29A · Pink #FFB7E5 · Purple #C5B3FF

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-black uppercase tracking-wide" +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" +
  " disabled:pointer-events-none disabled:opacity-50" +
  " [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " transition-all duration-150 hover:scale-[1.04] active:scale-[0.97]"

const buttonVariants = cva(base, {
  variants: {
    variant: {
      // ── ONE consistent system ─────────────────────────────────────────
      // Every "filled/action" variant renders the SAME primary sticker so the
      // app has ONE button look; every "outline/secondary" variant renders the
      // SAME outline. Variant NAMES kept so no call site breaks — only the look
      // is unified. Change PRIMARY / OUTLINE below to restyle every button at
      // once. Primary = solid sky #9FD8FF, near-black ink + border (pastel is
      // light, so dark ink for contrast).
      // Rainbow graffiti sticker — matches the hero CTA (.pub-btn) end-to-end.
      default:      "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      primary:      "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      cta:          "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      "cta-gold":   "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      gradient:     "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      cyan:         "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      blue:         "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      pink:         "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      green:        "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      orange:       "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",
      gold:         "text-[#050508] border-2 border-[#050508] [background-image:var(--bt-rainbow)] [background-size:200%_100%] hover:brightness-105",

      // Secondary / outline — identical everywhere.
      secondary:    "bg-transparent text-white border-2 border-[#9FD8FF] hover:bg-[#9FD8FF]/10",
      outline:      "bg-transparent text-white border-2 border-[#9FD8FF] hover:bg-[#9FD8FF]/10",
      "cta-outline":"bg-transparent text-white border-2 border-[#9FD8FF] hover:bg-[#9FD8FF]/10",
      neon:         "bg-transparent text-white border-2 border-[#9FD8FF] hover:bg-[#9FD8FF]/10",

      // Quiet + destructive kept functional (destructive stays red for safety).
      ghost:        "bg-transparent text-white hover:bg-[#0e0d12]",
      link:         "bg-transparent text-[#9FD8FF] underline-offset-4 hover:underline normal-case tracking-normal",
      destructive:  "bg-[#FF6B6B] text-[#050508] border-2 border-[#050508] hover:brightness-105",
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
