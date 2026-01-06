-- Add image_url and total_price to templates
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS total_price numeric DEFAULT NULL;

-- Add template_id to order_items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.templates(id);

-- Ensure we don't have custom_price on template_items (if it existed)
-- We check if column exists before dropping to be safe, though typical SQL requires a DO block for conditional DROP COLUMN or just ignoring error.
-- PostgreSQL standard: ALTER TABLE ... DROP COLUMN IF EXISTS ...
ALTER TABLE public.template_items 
DROP COLUMN IF EXISTS custom_price;
