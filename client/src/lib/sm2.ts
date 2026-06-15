export interface SM2State {
  cardId: string;
  n: number;
  EF: number;
  I: number;
  due: number;
  lastReview: number | null;
  reviewCount: number;
}

const STORAGE_KEY = "braintrack-sm2-state";
const STATS_KEY = "braintrack-flashcard-stats";

export interface FlashcardStats {
  totalReviewed: number;
  sessionsCompleted: number;
  lastSessionDate: string | null;
}

function loadAllStates(): Record<string, SM2State> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllStates(states: Record<string, SM2State>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}

export function getCardState(cardId: string): SM2State {
  const states = loadAllStates();
  return states[cardId] || {
    cardId,
    n: 0,
    EF: 2.5,
    I: 0,
    due: 0,
    lastReview: null,
    reviewCount: 0,
  };
}

export function gradeCard(cardId: string, quality: number): SM2State {
  const states = loadAllStates();
  const prev = states[cardId] || {
    cardId,
    n: 0,
    EF: 2.5,
    I: 0,
    due: 0,
    lastReview: null,
    reviewCount: 0,
  };

  let { n, EF, I } = prev;

  const q = Math.max(0, Math.min(5, quality));

  EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (EF < 1.3) EF = 1.3;

  if (q < 3) {
    n = 0;
    I = 1;
  } else {
    if (n === 0) {
      I = 1;
    } else if (n === 1) {
      I = 6;
    } else {
      I = Math.round(I * EF);
    }
    n++;
  }

  const now = Date.now();
  const dueDate = now + I * 24 * 60 * 60 * 1000;

  const updated: SM2State = {
    cardId,
    n,
    EF: Math.round(EF * 100) / 100,
    I,
    due: dueDate,
    lastReview: now,
    reviewCount: prev.reviewCount + 1,
  };

  states[cardId] = updated;
  saveAllStates(states);

  enqueueCardForServer(updated);

  return updated;
}

export function getDueCards(cardIds: string[]): string[] {
  const states = loadAllStates();
  const now = Date.now();

  return cardIds.filter(id => {
    const state = states[id];
    if (!state) return true;
    return state.due <= now;
  });
}

export function sortByDueDate(cardIds: string[]): string[] {
  const states = loadAllStates();
  return [...cardIds].sort((a, b) => {
    const stateA = states[a];
    const stateB = states[b];
    const dueA = stateA ? stateA.due : 0;
    const dueB = stateB ? stateB.due : 0;
    return dueA - dueB;
  });
}

export function getCardsDueTomorrow(cardIds: string[]): number {
  const states = loadAllStates();
  const tomorrow = Date.now() + 24 * 60 * 60 * 1000;

  return cardIds.filter(id => {
    const state = states[id];
    if (!state) return false;
    return state.due > Date.now() && state.due <= tomorrow;
  }).length;
}

export function getStats(): FlashcardStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { totalReviewed: 0, sessionsCompleted: 0, lastSessionDate: null };
  } catch {
    return { totalReviewed: 0, sessionsCompleted: 0, lastSessionDate: null };
  }
}

export function incrementReviewCount(): void {
  const stats = getStats();
  stats.totalReviewed++;
  stats.lastSessionDate = new Date().toISOString().slice(0, 10);
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function completeSession(): void {
  const stats = getStats();
  stats.sessionsCompleted++;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// ── Server sync (Task #604) ─────────────────────────────────────────────────
// The server is the durable source of truth. On page load, call
// `syncProgressFromServer()` to fetch all saved states and merge them with
// localStorage — server wins when its lastReview is more recent than the local
// state (lastReview is always Date.now() at grade time, so it IS monotonic).
// On each grade action, `gradeCard()` enqueues the updated state via
// `enqueueCardForServer()` which debounces into batched POSTs. The batch is
// only cleared from the queue AFTER a successful response; on failure it is
// re-merged so nothing is lost across retries.

let pendingQueue: Record<string, SM2State> = {};
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;

function enqueueCardForServer(state: SM2State): void {
  pendingQueue[state.cardId] = state;
  scheduleFlushed();
}

function scheduleFlushed(): void {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushQueue, 2000);
}

async function flushQueue(): Promise<void> {
  if (isFlushing || Object.keys(pendingQueue).length === 0) return;

  isFlushing = true;
  flushTimer = null;

  const batch = { ...pendingQueue };

  try {
    const res = await fetch("/api/flashcards/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        cards: Object.values(batch).map(s => ({
          cardId: s.cardId,
          n: s.n,
          ef: s.EF,
          interval: s.I,
          due: s.due,
          lastReview: s.lastReview,
          reviewCount: s.reviewCount,
        })),
      }),
    });

    if (res.ok) {
      retryCount = 0;
      for (const cardId of Object.keys(batch)) {
        if (pendingQueue[cardId] === batch[cardId]) {
          delete pendingQueue[cardId];
        }
      }
    } else {
      scheduleRetry();
    }
  } catch {
    scheduleRetry();
  } finally {
    isFlushing = false;
  }
}

let retryCount = 0;
function scheduleRetry(): void {
  retryCount = Math.min(retryCount + 1, 5);
  const delay = Math.min(30000, 2000 * Math.pow(2, retryCount));
  flushTimer = setTimeout(flushQueue, delay);
}

export async function syncProgressFromServer(): Promise<void> {
  try {
    const res = await fetch("/api/flashcards/progress", {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json() as {
      progress: Array<{
        cardId: string;
        n: number;
        ef: number;
        interval: number;
        due: number;
        lastReview: number | null;
        reviewCount: number;
      }>;
    };
    if (!Array.isArray(data.progress) || data.progress.length === 0) return;

    const local = loadAllStates();
    let changed = false;

    for (const row of data.progress) {
      const localState = local[row.cardId];
      // Use lastReview as the monotonic freshness indicator:
      // lastReview is always Date.now() at grading time so higher = more recent.
      // A card with lastReview=null has never been graded (freshness = 0).
      const serverFreshness = row.lastReview ?? 0;
      const localFreshness = localState?.lastReview ?? 0;

      if (!localState || serverFreshness > localFreshness) {
        local[row.cardId] = {
          cardId: row.cardId,
          n: row.n,
          EF: row.ef / 100,
          I: row.interval,
          due: row.due,
          lastReview: row.lastReview ?? null,
          reviewCount: row.reviewCount,
        };
        changed = true;
      }
    }

    if (changed) saveAllStates(local);
  } catch {
    // Silently ignore — localStorage remains the fallback
  }
}

// Flush any pending writes immediately when the page is hidden or unloaded.
// beforeunload uses keepalive:true so the request survives the page teardown.
function flushWithKeepalive(): void {
  const batch = Object.values(pendingQueue);
  if (batch.length === 0) return;
  try {
    fetch("/api/flashcards/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({
        cards: batch.map(s => ({
          cardId: s.cardId,
          n: s.n,
          ef: s.EF,
          interval: s.I,
          due: s.due,
          lastReview: s.lastReview,
          reviewCount: s.reviewCount,
        })),
      }),
    });
  } catch {
    // best-effort only
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushWithKeepalive();
  });
  window.addEventListener("beforeunload", () => {
    flushWithKeepalive();
  });
}
