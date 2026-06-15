#!/bin/bash
set -e

npm install --legacy-peer-deps

# Use --force so drizzle-kit applies schema changes without prompting
# for interactive confirmation on data-loss statements. Rename prompts
# (which --force does not auto-answer) are pre-empted by ensuring the
# DB schema is kept in sync regularly so drizzle never sees an ambiguous
# add-vs-rename diff.
npm run db:push -- --force
