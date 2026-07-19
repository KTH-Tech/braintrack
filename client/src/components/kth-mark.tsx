// Official KTH Tech roundel, inlined from the handoff SVG so `currentColor`
// resolves against the surrounding text colour (white in the dark footers).
// Imported as raw markup (vite `?raw`) and given explicit width/height so it
// sizes correctly regardless of the host element's CSS.
import kthMarkRaw from "@/assets/handoff/kth-tech-mark.svg?raw";

export function KthMark({ size = 40 }: { size?: number }) {
  const svg = kthMarkRaw.replace(
    "<svg ",
    `<svg width="${size}" height="${size}" `,
  );
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        color: "currentColor",
        flex: "none",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
