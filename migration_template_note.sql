-- Add note to templates table
ALTER TABLE templates ADD COLUMN IF NOT EXISTS note TEXT;
