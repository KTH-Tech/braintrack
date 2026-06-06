-- Task #359: school-set & learner-set preliminary exam dates
-- Additive migration. Safe to run against any existing schema.

CREATE TABLE IF NOT EXISTS "prelim_exams" (
        "id" serial PRIMARY KEY NOT NULL,
        "source" text NOT NULL,
        "user_id" varchar,
        "school_id" integer,
        "subject_id" integer NOT NULL,
        "subject_name" text NOT NULL,
        "paper_number" integer DEFAULT 1 NOT NULL,
        "exam_date" date NOT NULL,
        "start_time" text DEFAULT '09:00' NOT NULL,
        "duration_minutes" integer DEFAULT 180 NOT NULL,
        "created_by" varchar,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "prelim_exams_subject_id_subjects_id_fk"
                FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id")
                ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prelim_exams_user_idx" ON "prelim_exams" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prelim_exams_school_idx" ON "prelim_exams" USING btree ("school_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prelim_exams_subject_idx" ON "prelim_exams" USING btree ("subject_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "prelim_exams_learner_unique_idx"
        ON "prelim_exams" USING btree ("user_id", "subject_id", "paper_number");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "prelim_exams_school_unique_idx"
        ON "prelim_exams" USING btree ("school_id", "subject_id", "paper_number");
