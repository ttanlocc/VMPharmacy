-- Add deleted_at column to templates for soft delete support
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
