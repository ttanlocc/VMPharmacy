---
phase: 01-transaction-safety
plan: 02
subsystem: database
tags: [supabase, soft-delete, drugs, typescript]

requires:
  - phase: 01-transaction-safety plan 01
    provides: atomic order creation RPC which already preserves order_items rows

provides:
  - Soft delete for drugs table (deleted_at column + partial index migration)
  - Drug listings and selection UI always exclude soft-deleted rows
  - Order creation rejects soft-deleted drugs
  - Historical orders continue to show original drug names via existing JOIN

affects:
  - Any future UI or API that queries drugs table must keep .is('deleted_at', null) filter

tech-stack:
  added: []
  patterns:
    - Supabase .is('deleted_at', null) filter pattern on all active-drug queries
    - Soft delete via .update({ deleted_at: new Date().toISOString() }) instead of .delete()

key-files:
  created:
    - supabase/migrations/soft_delete_drugs.sql
  modified:
    - types/database.ts
    - hooks/useDrugs.ts
    - app/api/drugs/route.ts
    - app/api/orders/route.ts

key-decisions:
  - "Soft delete via deleted_at TIMESTAMPTZ column — row preserved, order history JOIN still returns drug name"
  - "Partial index WHERE deleted_at IS NULL for efficient active-drug queries"
  - "Order GET handler intentionally left unchanged — historical orders JOIN deleted drugs by design"

patterns-established:
  - "Soft delete pattern: add deleted_at column, filter with .is('deleted_at', null), matches templates table pattern"

duration: 8min
completed: 2026-02-24
---

# Phase 1 Plan 02: Soft Delete Drugs Summary

**Soft delete for drugs table using deleted_at timestamp — preserves FK integrity with order_items and fixes the "Thuoc" placeholder bug in order history**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-24T00:00:00Z
- **Completed:** 2026-02-24T00:08:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added `deleted_at TIMESTAMPTZ` column and partial index to drugs table via migration SQL
- Updated TypeScript types to include `deleted_at` in drugs Row, Insert, Update
- Converted `deleteDrug` in useDrugs.ts from hard delete to soft delete
- All drug listing queries (hook and API) filter out soft-deleted rows with `.is('deleted_at', null)`
- Order creation validation excludes soft-deleted drugs so they are treated as non-existent
- Order history GET intentionally unchanged — existing JOIN on drugs table returns name for soft-deleted rows correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Create soft delete migration and update TypeScript types** - `8818eea` (feat)
2. **Task 2: Update hooks and API routes to use soft delete** - `61bb6e8` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `supabase/migrations/soft_delete_drugs.sql` - Migration adding deleted_at column and partial index
- `types/database.ts` - Added deleted_at to drugs Row, Insert, Update types
- `hooks/useDrugs.ts` - fetchDrugs filters deleted_at IS NULL; deleteDrug uses soft delete
- `app/api/drugs/route.ts` - GET handler filters deleted_at IS NULL
- `app/api/orders/route.ts` - POST drug validation filters deleted_at IS NULL

## Decisions Made
- Kept Order GET handler unchanged — historical orders must still show original drug names via the existing `drugs (name, unit, image_url)` JOIN. The row still exists (just marked deleted), so no special handling needed.
- Followed the same pattern already established by the templates table (which also has `deleted_at`).

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
**Migration must be applied manually in Supabase SQL Editor before deploying.**

Run `supabase/migrations/soft_delete_drugs.sql` in the Supabase SQL Editor. This adds the `deleted_at` column and partial index to the `drugs` table. Without this migration, the updated API routes will fail when filtering on `deleted_at`.

## Next Phase Readiness
- Soft delete fully implemented — drugs are now safely deletable without breaking order history
- Ready for 01-03

---
*Phase: 01-transaction-safety*
*Completed: 2026-02-24*
