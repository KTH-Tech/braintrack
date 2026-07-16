import * as React from "react"
import { Sparkles, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "neon-tile shadcn-card text-card-foreground transition-all duration-300 hover:-translate-y-px",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader"

type CardTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: LucideIcon | null;
  iconColor?: string;
};

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, icon, iconColor, children, ...props }, ref) => {
    const Icon = icon ?? null;
    const tint = iconColor ?? "#7FEFFF";
    return (
      <div
        ref={ref}
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight font-heading flex items-center gap-2.5",
          className
        )}
        {...props}
      >
        {Icon && (
          <span
            aria-hidden
            className="inline-flex items-center justify-center shrink-0"
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: `linear-gradient(135deg, ${tint}33, ${tint}11)`,
              border: `1px solid ${tint}66`,
              boxShadow: `0 0 10px ${tint}55, inset 0 1px 0 rgba(255,255,255,0.18)`,
              color: tint,
            }}
          >
            <Icon style={{ width: 16, height: 16 }} />
          </span>
        )}
        <span className="min-w-0">{children}</span>
      </div>
    );
  }
);
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}
