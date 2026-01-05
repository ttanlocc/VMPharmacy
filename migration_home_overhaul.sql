-- Migration for Home Screen Overhaul

-- 1. Updates to customers table
-- Add note column if it doesn't exist (using medical_history as note if preferred, but adding specific note column as requested)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS note TEXT;

-- Add unique constraint to phone
ALTER TABLE customers ADD CONSTRAINT customers_phone_key UNIQUE (phone);

-- 2. Updates to template_items table
-- Add custom_price for overriding drug unit_price in templates
ALTER TABLE template_items ADD COLUMN IF NOT EXISTS custom_price NUMERIC;

-- 3. Updates to orders table
-- Add template_id to track which template generated this order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES templates(id);

-- Add comment explaining usage
COMMENT ON COLUMN template_items.custom_price IS 'Override price for the drug in this template. If NULL, use current drug unit_price.';
COMMENT ON COLUMN orders.template_id IS 'Reference to the template used to create this order, if any.';
