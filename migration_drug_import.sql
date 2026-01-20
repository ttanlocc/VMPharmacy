-- Migration to support drug import with additional fields
-- Run this migration before importing CSV data

-- Add new columns to drugs table
ALTER TABLE drugs ADD COLUMN IF NOT EXISTS legacy_id TEXT UNIQUE;
ALTER TABLE drugs ADD COLUMN IF NOT EXISTS purchase_price NUMERIC DEFAULT 0;
ALTER TABLE drugs ADD COLUMN IF NOT EXISTS supplier TEXT;
ALTER TABLE drugs ADD COLUMN IF NOT EXISTS parent_group TEXT;
ALTER TABLE drugs ADD COLUMN IF NOT EXISTS child_group TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_drugs_legacy_id ON drugs(legacy_id);
CREATE INDEX IF NOT EXISTS idx_drugs_parent_group ON drugs(parent_group);
CREATE INDEX IF NOT EXISTS idx_drugs_child_group ON drugs(child_group);
CREATE INDEX IF NOT EXISTS idx_drugs_supplier ON drugs(supplier);

-- Add comment for documentation
COMMENT ON COLUMN drugs.legacy_id IS 'Original drug ID from legacy system (e.g., VD-25530-16)';
COMMENT ON COLUMN drugs.purchase_price IS 'Purchase/import price from supplier';
COMMENT ON COLUMN drugs.supplier IS 'Supplier or manufacturer name';
COMMENT ON COLUMN drugs.parent_group IS 'Parent category (e.g., KHÁNG SINH, GIẢM ĐAU KHÁNG VIÊM)';
COMMENT ON COLUMN drugs.child_group IS 'Sub-category (e.g., A. Betalactam, Giảm đau hạ sốt)';
