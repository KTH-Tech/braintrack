/**
 * isSafeInternalPath — guards against open-redirect attacks on server-delivered
 * URL strings that will be used with window.location.href or a client-side
 * router.
 *
 * A path is considered safe only when:
 *   - it starts with "/" (relative to the current origin), AND
 *   - it does NOT start with "//" (protocol-relative, treated as external), AND
 *   - it does NOT begin with a scheme that can execute code (javascript:, data:,
 *     vbscript:, etc.).
 *
 * External http/https links must be opened with window.open(..., "_blank",
 * "noopener,noreferrer") instead; this helper intentionally rejects them so
 * callers are forced to make that choice explicitly.
 */
export function isSafeInternalPath(url: string): boolean {
  if (typeof url !== "string" || url.length === 0) return false;
  if (!url.startsWith("/")) return false;
  if (url.startsWith("//")) return false;
  const lower = url.toLowerCase().trimStart();
  const dangerousSchemes = ["javascript:", "data:", "vbscript:", "file:"];
  if (dangerousSchemes.some((s) => lower.startsWith(s))) return false;
  return true;
}
