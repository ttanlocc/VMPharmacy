# Drug Data Import Guide

This guide explains how to import the drug inventory data into your Supabase database.

## Prerequisites

- Node.js installed
- Access to Supabase dashboard
- Service role key from Supabase

## Step 1: Run Database Migration

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Copy the contents of `migration_drug_import.sql`
4. Paste and run the SQL migration

This adds the following columns to the `drugs` table:
- `legacy_id` - Original drug ID (unique)
- `purchase_price` - Import/purchase price
- `supplier` - Supplier name
- `parent_group` - Parent category
- `child_group` - Sub-category

## Step 2: Get Supabase Service Key

1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy the **service_role** key (not the anon key!)
3. Add it to your `.env.local` file:

```bash
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

> ⚠️ **Warning**: The service role key bypasses Row Level Security. Never commit it to git or expose it in client-side code.

## Step 3: Run the Import Script

```bash
npm run import:drugs
```

The script will:
- Read `drugs_import.csv`
- Check for existing drugs by `legacy_id`
- Insert new drugs or update existing ones
- Show progress for each drug
- Display a summary at the end

## Expected Output

```
🚀 Starting drug import...

📊 Found 42 drugs to import

✅ Inserted: AMEFLU (Day) (VD-25530-16)
✅ Inserted: TRAVICOL FLU (VD-32115-19)
...

📊 Import Summary:
   ✅ Success: 42
   ✏️  Updated: 0
   ❌ Errors: 0
   📦 Total: 42

✨ Import completed!
```

## Troubleshooting

### Error: Missing environment variables
Make sure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are in your `.env.local` file.

### Error: CSV file not found
The script looks for `drugs_import.csv` in the project root. Make sure it exists.

### Error: Permission denied
Verify your service role key is correct and has admin permissions.

### Error: Duplicate key value
If you see duplicate key errors, there may already be drugs with the same `legacy_id`. The script will update them instead of inserting.

## Data Validation

After import, verify the data:

```sql
-- Check total count
SELECT COUNT(*) FROM drugs;

-- View imported drugs with legacy IDs
SELECT legacy_id, name, parent_group, child_group, supplier 
FROM drugs 
WHERE legacy_id IS NOT NULL
ORDER BY legacy_id;

-- Check price distribution
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN unit_price > 0 THEN 1 END) as with_price,
  COUNT(CASE WHEN supplier IS NOT NULL THEN 1 END) as with_supplier
FROM drugs;
```

## Re-running the Import

The script is **idempotent** - you can run it multiple times safely. It will:
- Update existing drugs (matched by `legacy_id`)
- Insert new drugs
- Skip duplicates

## Next Steps

After successful import:
1. Update your UI components to display the new fields (parent_group, child_group, supplier)
2. Add filters for hierarchical categories
3. Consider adding drug group management features
