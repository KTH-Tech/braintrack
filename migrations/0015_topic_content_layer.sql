-- Task #428 — Per-Topic Content Layer (Notes, Flashcards & Literature)

CREATE TABLE IF NOT EXISTS topic_notes (
  id            serial PRIMARY KEY,
  topic_id      integer NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  language      varchar(8) NOT NULL DEFAULT 'en',
  summary       text NOT NULL DEFAULT '',
  key_concepts  jsonb NOT NULL DEFAULT '[]'::jsonb,
  worked_examples jsonb NOT NULL DEFAULT '[]'::jsonb,
  source        varchar(64) NOT NULL DEFAULT 'caps_seed',
  created_at    timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now(),
  CONSTRAINT topic_notes_topic_lang_unique UNIQUE (topic_id, language)
);
CREATE INDEX IF NOT EXISTS topic_notes_topic_idx ON topic_notes(topic_id);

CREATE TABLE IF NOT EXISTS topic_flashcards (
  id            serial PRIMARY KEY,
  topic_id      integer NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  language      varchar(8) NOT NULL DEFAULT 'en',
  front         text NOT NULL,
  back          text NOT NULL,
  card_type     varchar(32) NOT NULL DEFAULT 'concept',
  order_index   integer NOT NULL DEFAULT 0,
  source        varchar(64) NOT NULL DEFAULT 'caps_seed',
  created_at    timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS topic_flashcards_topic_lang_idx ON topic_flashcards(topic_id, language);

CREATE TABLE IF NOT EXISTS literature_works (
  id            serial PRIMARY KEY,
  subject_id    integer NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  external_id   varchar(64) NOT NULL,
  title         text NOT NULL,
  title_afrikaans text,
  author        text NOT NULL,
  work_type     varchar(32) NOT NULL,
  year_published integer,
  created_at    timestamp NOT NULL DEFAULT now(),
  CONSTRAINT literature_works_subject_extid_unique UNIQUE (subject_id, external_id)
);
CREATE INDEX IF NOT EXISTS literature_works_subject_idx ON literature_works(subject_id);

CREATE TABLE IF NOT EXISTS literature_notes (
  id            serial PRIMARY KEY,
  work_id       integer NOT NULL REFERENCES literature_works(id) ON DELETE CASCADE,
  language      varchar(8) NOT NULL DEFAULT 'en',
  themes        jsonb NOT NULL DEFAULT '[]'::jsonb,
  characters    jsonb NOT NULL DEFAULT '[]'::jsonb,
  literary_devices jsonb NOT NULL DEFAULT '[]'::jsonb,
  essay_frameworks jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary       text NOT NULL DEFAULT '',
  source        varchar(64) NOT NULL DEFAULT 'caps_seed',
  created_at    timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now(),
  CONSTRAINT literature_notes_work_lang_unique UNIQUE (work_id, language)
);
CREATE INDEX IF NOT EXISTS literature_notes_work_idx ON literature_notes(work_id);
