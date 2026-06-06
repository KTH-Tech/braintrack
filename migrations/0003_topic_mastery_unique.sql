-- Migration: add unique constraint on (user_id, topic_id) to topic_mastery
-- De-duplicate first: keep the row with the highest mastery_score per (user_id, topic_id)
-- No data loss — only lower-score duplicates are removed.

DELETE FROM "topic_mastery"
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, topic_id) id
  FROM "topic_mastery"
  ORDER BY user_id, topic_id, mastery_score DESC, id ASC
);

-- Add the unique constraint now that duplicates are gone
ALTER TABLE "topic_mastery"
  ADD CONSTRAINT "topic_mastery_user_id_topic_id_unique" UNIQUE (user_id, topic_id);
