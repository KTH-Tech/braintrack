-- Task #558: Let parents opt out of scheduled report emails
ALTER TABLE parent_links
  ADD COLUMN IF NOT EXISTS report_email_opt_out boolean NOT NULL DEFAULT false;

ALTER TABLE parent_links
  ADD COLUMN IF NOT EXISTS report_email_opt_out_at timestamp;
