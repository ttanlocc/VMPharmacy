-- =============================================================================
-- Migration: create_order_atomic
-- Purpose:   Atomic order + order_items creation in a single transaction.
--            If either INSERT fails, the entire function rolls back automatically,
--            preventing orphaned order rows without their items (SAFE-01).
--
-- HOW TO APPLY:
--   This file is intended to be run manually in the Supabase SQL Editor.
--   (This project does not use an automated migration runner — Supabase is used directly.)
--   1. Open your Supabase project dashboard
--   2. Go to SQL Editor
--   3. Paste the contents of this file and click "Run"
--
-- After applying, the API route at /api/orders will use supabase.rpc('create_order_atomic')
-- instead of two separate inserts.
-- =============================================================================

CREATE OR REPLACE FUNCTION create_order_atomic(
  p_user_id     UUID,
  p_total_price NUMERIC,
  p_customer_id UUID DEFAULT NULL,
  p_template_id UUID DEFAULT NULL,
  p_items       JSONB   -- array of objects: [{drug_id, quantity, unit_price, note, template_id}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  -- 1. Insert the order row and capture the full row into v_order
  INSERT INTO orders (user_id, total_price, status, customer_id, template_id)
  VALUES (p_user_id, p_total_price, 'completed', p_customer_id, p_template_id)
  RETURNING * INTO v_order;

  -- 2. Insert all order items in a single bulk INSERT from the JSONB array.
  --    jsonb_array_elements unnests the p_items array into individual rows.
  --    If this INSERT fails for any reason, PostgreSQL automatically rolls back
  --    the entire transaction, including the order INSERT above.
  INSERT INTO order_items (order_id, drug_id, quantity, unit_price, note, template_id)
  SELECT
    v_order.id,
    (item->>'drug_id')::UUID,
    (item->>'quantity')::INTEGER,
    (item->>'unit_price')::NUMERIC,
    item->>'note',
    NULLIF(item->>'template_id', '')::UUID
  FROM jsonb_array_elements(p_items) AS item;

  -- 3. Return the created order as JSONB so the API route can return it to the client
  RETURN row_to_json(v_order)::JSONB;
END;
$$;
