import pg from "pg";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`CREATE TABLE IF NOT EXISTS examiner_profiles (
  id SERIAL PRIMARY KEY, subject TEXT NOT NULL, paper_number INTEGER NOT NULL,
  profile JSONB NOT NULL, question_sample_size INTEGER NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE (subject, paper_number))`);
await c.query(`CREATE TABLE IF NOT EXISTS generated_questions (
  id SERIAL PRIMARY KEY, subject TEXT NOT NULL, paper_number INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'English', question_number TEXT,
  question_text TEXT NOT NULL, answer_text TEXT NOT NULL, marking_rubric JSONB,
  marks INTEGER, topic TEXT, cognitive_level TEXT, mcq_options JSONB, correct_option TEXT,
  examiner_profile_id INTEGER REFERENCES examiner_profiles(id), grounding_question_ids INTEGER[],
  generation_model TEXT, solver_verified BOOLEAN DEFAULT FALSE, solver_answer_match NUMERIC,
  similarity_max NUMERIC, human_approved BOOLEAN, released_at TIMESTAMPTZ,
  content_hash TEXT UNIQUE, created_at TIMESTAMPTZ DEFAULT NOW())`);
await c.query(`CREATE TABLE IF NOT EXISTS simulated_paper_bank (
  id SERIAL PRIMARY KEY, subject TEXT NOT NULL, paper_number INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'English', title TEXT NOT NULL, total_marks INTEGER NOT NULL,
  duration_minutes INTEGER, question_ids INTEGER[] NOT NULL, blueprint JSONB,
  released_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW())`);
await c.query(`CREATE TABLE IF NOT EXISTS learner_paper_allocations (
  id SERIAL PRIMARY KEY, learner_user_id VARCHAR NOT NULL, subject TEXT NOT NULL,
  paper_bank_id INTEGER NOT NULL REFERENCES simulated_paper_bank(id),
  status TEXT NOT NULL DEFAULT 'assigned', assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, score_pct NUMERIC,
  UNIQUE (learner_user_id, paper_bank_id))`);
await c.query(`CREATE INDEX IF NOT EXISTS idx_lpa_learner_subject ON learner_paper_allocations (learner_user_id, subject)`);
await c.query(`CREATE INDEX IF NOT EXISTS idx_genq_subject_released ON generated_questions (subject, released_at)`);
console.log("custom tables created");
await c.end();
