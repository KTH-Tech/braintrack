import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, text, integer, boolean, check } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  // bcrypt hash for native email+password sign-in. Null for accounts created
  // through an external identity provider (Replit OIDC), which have no local
  // password. Never selected into API responses.
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  // South African ID number (13 digits) captured during learner onboarding.
  // SENSITIVE PERSONAL INFORMATION under POPIA — treat like passwordHash:
  // never select this into any client-facing API response. See
  // `toPublicUser()` below and its use in server/replit_integrations/auth/routes.ts.
  idNumber: varchar("id_number"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").default("learner"),
  schoolId: integer("school_id"),
  theme: text("theme").default("dark"),
  preferredLanguage: text("preferred_language").default("en"),
  isLocked: boolean("is_locked").default(false),
  lockReason: text("lock_reason"),
  lockedAt: timestamp("locked_at"),
  lockedUntil: timestamp("locked_until"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lastLoginAt: timestamp("last_login_at"),
  selectedSubjects: jsonb("selected_subjects"),
  preferencesJson: jsonb("preferences_json"),
  phone: varchar("phone"),
  // IMMUTABLE: Set once on signup, never overwritten by application layer.
  // Changes require admin-only endpoint + audit log entry.
  firstTouchSource: text("first_touch_source"),
  roleConfirmed: boolean("role_confirmed").default(false),
  varkPrimary: text("vark_primary"),
  varkSecondary: text("vark_secondary"),
  varkConfidence: jsonb("vark_confidence"),
  // Task #43 — Parent consent + free-form school + grade on the learner profile.
  parentEmail: varchar("parent_email"),
  parentConsentGranted: boolean("parent_consent_granted").default(false),
  parentConsentRequestedAt: timestamp("parent_consent_requested_at"),
  parentConsentGrantedAt: timestamp("parent_consent_granted_at"),
  schoolName: text("school_name"),
  grade: integer("grade"),
  // Date of birth is NEVER stored in plaintext. Only a salted SHA-256 of the
  // ISO date — sha256(SESSION_SECRET + ":" + "yyyy-mm-dd") — computed
  // server-side at onboarding. Used for identity checks without holding the
  // raw DOB (POPIA data minimisation).
  dobHash: varchar("dob_hash"),
  // Operational flag derived from DOB at onboarding submission: age < 18.
  // Drives the parent-consent + card-capture gate for trial activation.
  isMinor: boolean("is_minor"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  check("users_preferred_language_short_form", sql`${table.preferredLanguage} IN ('en', 'af')`),
]);

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

/**
 * Columns on `users` that must NEVER leave the server, even over an
 * authenticated channel.
 *  - passwordHash: bcrypt credential material.
 *  - idNumber: South African ID number — sensitive personal information
 *    under POPIA. Captured at onboarding for NSC/DBE identity matching and
 *    read server-side only.
 *  - dobHash: salted SHA-256 of the learner's date of birth. Never useful to
 *    a client and never returned — server-side identity checks only.
 * Add any new sensitive column here AND it is stripped everywhere
 * `toPublicUser()` is used.
 */
export const SENSITIVE_USER_FIELDS = ["passwordHash", "idNumber", "dobHash"] as const;

/** A `User` with all sensitive columns removed. */
export type PublicUser = Omit<User, typeof SENSITIVE_USER_FIELDS[number]>;

/**
 * Strip sensitive columns from a user row before it is serialised to a
 * client. Use this at every boundary that returns a full user row.
 */
export function toPublicUser<T extends Partial<User>>(
  user: T
): Omit<T, typeof SENSITIVE_USER_FIELDS[number]> {
  const rest: Record<string, unknown> = { ...(user as Record<string, unknown>) };
  for (const field of SENSITIVE_USER_FIELDS) {
    delete rest[field];
  }
  return rest as Omit<T, typeof SENSITIVE_USER_FIELDS[number]>;
}
