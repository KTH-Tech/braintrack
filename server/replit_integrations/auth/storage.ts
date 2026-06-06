import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  incrementLoginFailures(userId: string): Promise<{ locked: boolean; lockedUntil: Date | null }>;
  resetLoginFailures(userId: string): Promise<void>;
  isAccountLocked(userId: string): Promise<{ locked: boolean; lockedUntil: Date | null }>;
}

// Exponential backoff lock durations per failure threshold (in minutes)
const LOCK_DURATIONS_MINUTES: Record<number, number> = {
  5: 15,
  6: 30,
  7: 60,
  8: 120,
  9: 240,
  10: 480,
};

function getLockDurationMinutes(failureCount: number): number {
  const thresholds = Object.keys(LOCK_DURATIONS_MINUTES)
    .map(Number)
    .sort((a, b) => b - a);
  for (const threshold of thresholds) {
    if (failureCount >= threshold) return LOCK_DURATIONS_MINUTES[threshold];
  }
  return 15;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Exclude firstTouchSource from conflict updates — it is immutable after initial insert.
    // Any change to firstTouchSource must go through the admin-only endpoint with audit logging.
    const { firstTouchSource, ...updateableFields } = userData;
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...updateableFields,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async incrementLoginFailures(userId: string): Promise<{ locked: boolean; lockedUntil: Date | null }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return { locked: false, lockedUntil: null };

    const newFailureCount = (user.failedLoginAttempts ?? 0) + 1;
    const shouldLock = newFailureCount >= 5;
    const lockDurationMs = shouldLock ? getLockDurationMinutes(newFailureCount) * 60 * 1000 : 0;
    const lockedUntil = shouldLock ? new Date(Date.now() + lockDurationMs) : null;

    await db.update(users)
      .set({
        failedLoginAttempts: newFailureCount,
        isLocked: shouldLock,
        lockedAt: shouldLock ? new Date() : user.lockedAt,
        lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { locked: shouldLock, lockedUntil };
  }

  async resetLoginFailures(userId: string): Promise<void> {
    await db.update(users)
      .set({
        failedLoginAttempts: 0,
        isLocked: false,
        lockedAt: null,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async isAccountLocked(userId: string): Promise<{ locked: boolean; lockedUntil: Date | null }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return { locked: false, lockedUntil: null };

    if (!user.isLocked) return { locked: false, lockedUntil: null };

    // Auto-unlock if the lock period has expired
    if (user.lockedUntil && new Date() > user.lockedUntil) {
      await db.update(users)
        .set({
          isLocked: false,
          lockedUntil: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      return { locked: false, lockedUntil: null };
    }

    return { locked: true, lockedUntil: user.lockedUntil ?? null };
  }
}

export const authStorage = new AuthStorage();
