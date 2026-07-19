# BrainTrack Design Guidelines — "Permanent Marker Street Pastel"

The canonical visual system for every BrainTrack surface. Derived from the
Claude Design handoff (`braintrack-tokens.css`) and the official Rizz brand
sheet. **All new UI must follow this document.**

## Ground & surfaces
| Token | Value | Use |
|---|---|---|
| App ground | `#050508` | every page background |
| Rizz ground | `#0D0D14` | Rizz-branded surfaces |
| Card | `rgba(255,255,255,.03)` on ground, or `#1C1C26` | panels |
| Card border | `1px rgba(255,255,255,.08)` (or 1.5px pastel accent) | radius 18–24 |

## Pastels (cycle in this order for repeated items)
`#9FF5E8` aqua · `#9FD8FF` sky · `#FFB7E5` pink · `#C5B3FF` purple ·
`#FFE29A` yellow · `#94F7C5` mint — alert `#FF8DA1`.
Rizz accents: `#FF7EC6` `#B388FF` `#6EE7F9` `#FFD166`.
Glows = the accent colour at `.25–.35` alpha as box-shadow.

## Type — two fonts only
- **Poppins** — every piece of UI text (400–900).
- **'Permanent Marker'** — small graffiti accents ONLY: eyebrows, hype lines,
  wordmarks. Usually rotated `-2deg`, sized 14–18px, in a pastel.
- Text is **always solid white**. Never grey, never faded below `.82` opacity,
  and then only for secondary lines.
- Avoid `<h1>` (global CSS forces a rainbow on it) — use `div role="heading"`.

## Signature elements
- **Rainbow**: `linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)`
  — wordmark (`.bt-wordmark`), top bars, hero CTAs. Animated via `bt-rainbow`.
- **Primary button**: `linear-gradient(100deg,#9FF5E8,#C5B3FF)`, `#050508` text,
  radius 10–12, weight 800, hover `translateY(-2px)`.
- **Secondary button**: transparent, `1.5–2px` white/20 border, white text,
  hover border→accent.
- **Inputs**: `rgba(5,5,8,.6)` bg, `1.5px rgba(255,255,255,.18)` border,
  focus `#9FF5E8`, white text, radius 10–12.
- **Neon card hover**: lift `-6/-8px`, accent border, deepened glow.

## Animation
`index.css` has a **global animation kill-switch**. Animations run ONLY when
declared as an inline style containing `bt-` (e.g.
`animation: "bt-fadeup .5s both"`) or on a `.bt-*` class. Existing keyframes:
`bt-rainbow · bt-float · bt-glowpulse · bt-wiggle · bt-marquee · bt-fadeup ·
bt-confetti`. Always respect `prefers-reduced-motion`.

## Energy by audience
- **Learner surfaces** — maximal: glows, confetti on wins, marker hype lines,
  XP pops, Rizz everywhere.
- **Parent / School reports** — restrained, executive: white-paper prints,
  pastel accents only, at most ONE marker accent per surface.
- **Admin** — professional first: badge chips, pill tabs, clean metric cards;
  no scatter, no confetti.

## Rizz (mascot)
Astronaut-helmet robot, purple "Rizz" hoodie, rainbow headphones, neon smile.
Voice: warm, hype, SA-teen appropriate, never childish. Brand lines:
"Let's get it!" · "Smarter study. Higher score. Brighter future." ·
"Progress not perfection" · "Small steps BIG results" ·
"I don't do easy. I make easy happen."
Assets: `client/src/assets/handoff/rizz-avatar.png`, `rizz-mascot.png`.

## Language
Every user-facing string ships in **EN and AF** (real Afrikaans, KABV not CAPS,
teen-appropriate). Copy structures per page: `T.en` / `T.af`.
