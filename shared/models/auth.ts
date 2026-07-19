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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  check("users_preferred_language_short_form", sql`${table.preferredLanguage} IN ('en', 'af')`),
]);

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
