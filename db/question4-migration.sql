-- Migration: Form 2 Question 4 (Missing Question Check & Conditional Suggestions)
-- Safe to run repeatedly on Neon PostgreSQL or local PostgreSQL.
-- Preserves all existing Form 2 responses without deleting or overwriting data.

ALTER TABLE form2_responses ADD COLUMN IF NOT EXISTS suggestion_choice text;
ALTER TABLE form2_responses ADD COLUMN IF NOT EXISTS suggested_question text;
ALTER TABLE form2_responses ADD COLUMN IF NOT EXISTS suggested_option_a text;
ALTER TABLE form2_responses ADD COLUMN IF NOT EXISTS suggested_option_b text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'form2_suggestion_choice_check') THEN
    ALTER TABLE form2_responses ADD CONSTRAINT form2_suggestion_choice_check
      CHECK (suggestion_choice IS NULL OR suggestion_choice IN ('yes', 'no'));
  END IF;
END $$;
