/**
 * client/src/lib/onboarding-preview.ts — admin-only, WRITE-SAFE preview of the
 * learner onboarding flow (`/onboarding?preview=1`).
 *
 * WHY THIS EXISTS
 * ---------------
 * The parent-dashboard preview (server/parent-preview.ts) only had to swap
 * READS for sample data. Onboarding is different: it is a WRITE flow. Walking
 * through it saves the study profile, records identity (SA ID / DOB →
 * is_minor), stores VARK results, seeds subjects and can send a parental
 * consent email. An admin stepping through it "just to look" would corrupt
 * their own account. So the preview's contract is the inverse of the parent
 * one: render every phase, but guarantee that NO mutation can reach the
 * network while preview is active.
 *
 * HOW THE GUARANTEE IS CENTRALISED — two layers, both in this file
 * ----------------------------------------------------------------
 *   1. `createPreviewGate(inPreview)` — every mutationFn on the onboarding
 *      page is created through `gate.mutation(real, simulated)`. Live, the
 *      real function runs untouched. In preview, the real function is NEVER
 *      invoked — the gate resolves the simulated result after a short delay so
 *      pending/loading UI still renders exactly as it would for a learner.
 *   2. `installPreviewWriteTripwire(window)` — while the preview is mounted,
 *      `window.fetch` refuses any non-GET/HEAD/OPTIONS request to `/api/*`
 *      (rejected with PreviewWriteBlockedError before the network is touched).
 *      This is the backstop for any future call site added without layer 1.
 *
 * Reads (e.g. the school autocomplete GET /api/schools/search) intentionally
 * pass through both layers — they are harmless and keep the preview realistic.
 */

/** True only when the signed-in user is an admin AND ?preview=1 is present.
 *  Non-admins with the flag get `false` and therefore the normal live flow. */
export function isOnboardingPreview(
  role: string | null | undefined,
  search: string,
): boolean {
  if (role !== "admin") return false;
  try {
    return new URLSearchParams(search).get("preview") === "1";
  } catch {
    return false;
  }
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Anything that isn't a plain read counts as a write (POST/PUT/PATCH/DELETE…). */
export function isWriteMethod(method: string | null | undefined): boolean {
  return !SAFE_METHODS.has((method ?? "GET").toUpperCase());
}

/** Does this URL (relative or absolute) target an /api path? */
export function isApiUrl(url: string): boolean {
  try {
    const u = new URL(url, "http://preview.invalid");
    return u.pathname === "/api" || u.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

export class PreviewWriteBlockedError extends Error {
  readonly method: string;
  readonly url: string;
  constructor(method: string, url: string) {
    super(
      `[OnboardingPreview] Blocked ${method} ${url} — preview mode never writes. ` +
        `Route the mutation through createPreviewGate().mutation(real, simulated).`,
    );
    this.name = "PreviewWriteBlockedError";
    this.method = method;
    this.url = url;
  }
}

export interface PreviewGate {
  readonly inPreview: boolean;
  /**
   * Wrap a mutationFn. Live: `real` runs untouched. Preview: `real` is never
   * invoked — `simulated` resolves after `delayMs` (default 600ms) so pending
   * states (spinners, the "Preparing your classroom" overlay) still render.
   * The wrapper keeps `real`'s exact function type (`F`), so callers such as
   * TanStack's `useMutation` infer the same data/variables types they would
   * from the unwrapped function, and the simulated branch is forced to return
   * a payload the live code path could have produced.
   */
  mutation<F extends (...args: any[]) => Promise<any>>(
    real: F,
    simulated: (
      ...args: Parameters<F>
    ) => Awaited<ReturnType<F>> | Promise<Awaited<ReturnType<F>>>,
    opts?: { delayMs?: number },
  ): F;
}

export function createPreviewGate(inPreview: boolean): PreviewGate {
  return {
    inPreview,
    mutation(real, simulated, opts) {
      if (!inPreview) return real;
      const delayMs = opts?.delayMs ?? 600;
      const wrapped = async (...args: unknown[]) => {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        return (simulated as (...a: unknown[]) => unknown)(...args);
      };
      return wrapped as typeof real;
    },
  };
}

/** Extract the effective HTTP method from fetch() arguments. */
export function resolveRequestMethod(
  input: unknown,
  init?: { method?: string },
): string {
  if (init?.method) return init.method.toUpperCase();
  if (
    input &&
    typeof input === "object" &&
    typeof (input as { method?: unknown }).method === "string"
  ) {
    return ((input as { method: string }).method).toUpperCase();
  }
  return "GET";
}

/** Extract the target URL from fetch() arguments (string, URL, or Request). */
export function resolveRequestUrl(input: unknown): string {
  if (typeof input === "string") return input;
  if (input && typeof input === "object") {
    const o = input as { url?: unknown; href?: unknown };
    if (typeof o.url === "string") return o.url; // Request
    if (typeof o.href === "string") return o.href; // URL
  }
  return String(input);
}

type FetchLike = (input: any, init?: any) => Promise<any>;

/**
 * Wrap `win.fetch` so that, while installed, any write request to /api/* is
 * rejected before it touches the network. Returns an uninstaller that restores
 * the original fetch. Reads and non-API requests pass through untouched.
 */
export function installPreviewWriteTripwire(win: { fetch: FetchLike }): () => void {
  const original = win.fetch;
  const realFetch = original.bind(win);
  const guarded: FetchLike = (input, init) => {
    const method = resolveRequestMethod(input, init);
    const url = resolveRequestUrl(input);
    if (isWriteMethod(method) && isApiUrl(url)) {
      const err = new PreviewWriteBlockedError(method, url);
      // Loud on purpose — a blocked call here means a mutation call site was
      // added without going through the preview gate.
      console.error(err.message);
      return Promise.reject(err);
    }
    return realFetch(input, init);
  };
  win.fetch = guarded;
  return () => {
    if (win.fetch === guarded) win.fetch = original;
  };
}

/**
 * Obviously-synthetic values seeded when the admin jumps ahead of phases they
 * have not filled in, so later screens render with representative content
 * instead of empty placeholders. The ID number is Luhn-valid (so the page's
 * SA-ID validator accepts it) and its YYMMDD prefix matches the sample DOB —
 * 15 Jan 2009, i.e. currently a minor, so the parental-consent branch is the
 * one the preview showcases. None of this can persist: every mutation is
 * disarmed by the gate above.
 */
export const ONBOARDING_PREVIEW_SAMPLE = {
  firstName: "Amahle",
  lastName: "Dlamini (SAMPLE)",
  schoolName: "Sample High School (PREVIEW)",
  idNumber: "0901155009086",
  dobDay: "15",
  dobMonth: "01",
  dobYear: "2009",
  varkPrimary: "visual",
  subjectMark: 65,
  /** Deliberately self-describing — shown in the consent link block. */
  consentUrl:
    "https://braintrack.co.za/parent-consent?token=preview-sample-token-not-real",
  subjects: [
    { code: "MATH", name: "Mathematics" },
    { code: "PHYS", name: "Physical Sciences" },
    { code: "LIFE", name: "Life Sciences" },
    { code: "ENGH", name: "English Home Language" },
    { code: "ACC", name: "Accounting" },
    { code: "GEO", name: "Geography" },
  ],
} as const;
