-- Soft delete for drugs table (SAFE-02)
-- Run this in Supabase SQL Editor before deploying the updated hooks/API routes.

-- Add soft delete column to drugs table
ALTER TABLE drugs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Partial index for efficient queries on active drugs
CREATE INDEX IF NOT EXISTS idx_drugs_deleted_at ON drugs(deleted_at) WHERE deleted_at IS NULL;
