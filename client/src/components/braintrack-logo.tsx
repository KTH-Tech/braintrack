import darkLogo from "@assets/Logo_Dark_1772463829173.png"
import lightLogo from "@assets/Logo_-_Main_1772430239985.png"
import { useTheme } from "@/hooks/use-theme"

const LIGHT_THEMES = ["dopamine", "vaporwave", "terracotta", "coastal", "blossom", "golden-hour", "holographic", "lemonade", "bubblegum", "coquette"]

interface BrainTrackLogoProps {
  className?: string
  alt?: string
  wordmark?: boolean
  wordmarkClassName?: string
}

export function BrainTrackLogo({
  className = "h-10 w-auto",
  alt = "BrainTrack",
  wordmark = false,
  wordmarkClassName = "text-lg",
}: BrainTrackLogoProps) {
  const { theme } = useTheme()
  const isDark = !LIGHT_THEMES.includes(theme)
  const src = isDark ? darkLogo : lightLogo

  const mark = (
    <span
      className={`${className} inline-block overflow-hidden relative bg-transparent`}
      style={{ lineHeight: 0 }}
      aria-label={alt}
      role="img"
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full select-none pointer-events-none"
        style={{
          objectFit: "cover",
          objectPosition: "center 28%",
          transform: "scale(1.6)",
          transformOrigin: "center 28%",
        }}
        draggable={false}
      />
    </span>
  )

  if (!wordmark) return mark

  return (
    <span className="inline-flex items-center gap-2">
      {mark}
      <span
        className={`gradient-text font-bold tracking-tight leading-none ${wordmarkClassName}`}
      >
        BrainTrack
      </span>
    </span>
  )
}
