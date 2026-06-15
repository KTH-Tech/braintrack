import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-wide" +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" +
  " disabled:pointer-events-none disabled:opacity-50" +
  " [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " border transition-colors duration-150 active:scale-[0.98]"

const buttonVariants = cva(base, {
  variants: {
    variant: {
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
        "bg-red-500 text-white border-transparent hover:bg-red-500/90",
      // Color variants kept for API compatibility — rendered as plain solid fills
      cyan: "bg-cyan-500 text-black border-transparent hover:bg-cyan-500/90",
      blue: "bg-blue-500 text-white border-transparent hover:bg-blue-500/90",
      pink: "bg-pink-500 text-white border-transparent hover:bg-pink-500/90",
      green: "bg-green-500 text-black border-transparent hover:bg-green-500/90",
      orange: "bg-orange-500 text-black border-transparent hover:bg-orange-500/90",
      gold: "bg-yellow-400 text-black border-transparent hover:bg-yellow-400/90",
      gradient:
        "bg-foreground text-background border-transparent hover:bg-foreground/90",
      neon:
        "bg-foreground text-background border-transparent hover:bg-foreground/90",
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
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
