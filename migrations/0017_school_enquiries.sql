CREATE TABLE IF NOT EXISTS "school_enquiries" (
  "id" serial PRIMARY KEY NOT NULL,
  "school_name" text NOT NULL,
  "contact_person" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "num_learners" integer,
  "status" text NOT NULL DEFAULT 'new',
  "admin_notes" text,
  "reviewed_at" timestamp,
  "reviewed_by" varchar,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "school_enquiries_status_idx" ON "school_enquiries" ("status");
CREATE INDEX IF NOT EXISTS "school_enquiries_created_at_idx" ON "school_enquiries" ("created_at");
