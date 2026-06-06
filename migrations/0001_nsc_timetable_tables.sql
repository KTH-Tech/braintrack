-- Additive migration: adds nsc_timetable and timetable_subject_mapping tables
-- No existing tables are modified. Safe to run against any existing schema.

CREATE TABLE IF NOT EXISTS "nsc_timetable" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_year" integer DEFAULT 2026 NOT NULL,
	"week" integer NOT NULL,
	"exam_date" date NOT NULL,
	"session_time" text,
	"subject_name" text NOT NULL,
	"paper_number" integer,
	"duration_minutes" integer,
	"session_type" text DEFAULT 'exam' NOT NULL,
	"notes" text,
	"source_file" text DEFAULT 'NSC_2026_Oct_Nov_Timetable.pdf' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timetable_subject_mapping" (
	"id" serial PRIMARY KEY NOT NULL,
	"official_name" text NOT NULL,
	"paper_number" integer,
	"subject_id" integer,
	"level" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "timetable_subject_mapping_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nsc_timetable_week_idx" ON "nsc_timetable" USING btree ("week");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nsc_timetable_date_idx" ON "nsc_timetable" USING btree ("exam_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nsc_timetable_type_idx" ON "nsc_timetable" USING btree ("session_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timetable_mapping_official_idx" ON "timetable_subject_mapping" USING btree ("official_name");
