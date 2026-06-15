-- Task #815: Audit log of parent report-email opt-out / re-subscribe events
CREATE TABLE IF NOT EXISTS report_email_preference_log (
  id serial PRIMARY KEY,
  parent_user_id varchar NOT NULL,
  learner_user_id varchar,
  learner_name text,
  parent_email text,
  action text NOT NULL, -- "opted_out" | "resubscribed"
  source text NOT NULL DEFAULT 'parent_dashboard', -- "parent_dashboard" | "unsubscribe_link"
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS repl_parent_idx ON report_email_preference_log (parent_user_id);
CREATE INDEX IF NOT EXISTS repl_created_at_idx ON report_email_preference_log (created_at);
