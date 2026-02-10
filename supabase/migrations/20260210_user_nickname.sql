-- Add nickname column to user table
-- Used for display in mentions and quick references
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Default: null (component falls back to first_name.toLowerCase())
