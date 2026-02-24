---
phase: 01-transaction-safety
plan: 01
subsystem: database
tags: [postgres, plpgsql, rpc, supabase, atomic-transactions, order-creation]

requires: []
provides:
  - "create_order_atomic PostgreSQL RPC function (supabase/migrations/create_order_atomic.sql)"
  - "POST /api/orders using single atomic RPC call"
affects:
  - "02-transaction-safety (template atomicity — same pattern)"
  - "order-related features"

tech-stack:
  added: []
  patterns:
    - "Atomic DB writes via supabase.rpc() calling a plpgsql SECURITY DEFINER function"
    - "JSONB array parameter for bulk child-record insertion inside a function"

key-files:
  created:
    - "supabase/migrations/create_order_atomic.sql"
  modified:
    - "app/api/orders/route.ts"

key-decisions:
  - "Used SECURITY DEFINER on the RPC function so it runs with function-owner privileges, bypassing RLS for the insert; auth is validated in the API route before calling the RPC"
  - "supabase/migrations/ directory created to hold SQL migration files, replacing the project's previous pattern of loose SQL files at project root"

patterns-established:
  - "RPC atomicity: parent + children inserted inside plpgsql function; failure in either rolls back entire transaction"
  - "JSONB p_items array: pass item arrays as JSONB, unnest with jsonb_array_elements inside the function"

duration: 7min
completed: 2026-02-24
---

# Phase 1 Plan 01: Transaction Safety — Atomic Order Creation Summary

**PostgreSQL RPC function `create_order_atomic` eliminates orphaned orders by inserting order + order_items in a single database transaction, replacing the previous two-step insert pattern.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-02-24T10:48:08Z
- **Completed:** 2026-02-24T10:55:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `supabase/migrations/create_order_atomic.sql` with a valid plpgsql RPC function that atomically inserts an order row and all its items
- Refactored `POST /api/orders` to use `supabase.rpc('create_order_atomic', ...)` — no two-step insert remains
- Template price distribution logic (proportional unit_price calculation) preserved exactly as before the RPC call
- TypeScript compiles without source errors

## Task Commits

1. **Task 1: Create PostgreSQL RPC function** - `65011a5` (feat)
2. **Task 2: Refactor POST /api/orders to RPC** - `0bb0fe4` (feat)

## Files Created/Modified
- `supabase/migrations/create_order_atomic.sql` - plpgsql function, inserts order + order_items atomically; includes SQL Editor usage instructions
- `app/api/orders/route.ts` - POST handler replaced two inserts with single `supabase.rpc('create_order_atomic', ...)` call; GET handler untouched

## Decisions Made
- Used `SECURITY DEFINER` on the function: auth is checked in the API route before calling RPC, so bypassing RLS inside the function is safe and is the standard Supabase pattern for atomic writes
- Created `supabase/migrations/` directory (Rule 3 - Blocking): project previously stored loose SQL files at root; a directory provides structure for future migration files

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created supabase/migrations/ directory**
- **Found during:** Task 1 (creating migration SQL file)
- **Issue:** Plan specified path `supabase/migrations/create_order_atomic.sql` but `supabase/` directory did not exist; project used loose SQL files at root
- **Fix:** Created `supabase/migrations/` directory, placed migration file there as specified in plan frontmatter
- **Files modified:** (directory creation only)
- **Verification:** File exists at specified path
- **Committed in:** 65011a5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (blocking — missing directory)
**Impact on plan:** Required for plan execution. No scope change.

## Issues Encountered
- `.next/dev/types/routes.d.ts` showed 3 auto-generated TS errors — these are from the Next.js dev server cache, not source files. All source TypeScript compiles cleanly (`npx tsc --noEmit` with `.next/` errors filtered shows zero errors).

## User Setup Required

**Database function must be applied manually.** The `create_order_atomic` function does not auto-deploy — apply it in the Supabase SQL Editor before the API route change goes live:

1. Open Supabase project dashboard
2. Go to SQL Editor
3. Paste contents of `supabase/migrations/create_order_atomic.sql`
4. Click Run

Until this is applied, calls to `POST /api/orders` will fail with a "function create_order_atomic does not exist" error.

## Next Phase Readiness
- Atomic order creation complete; same RPC pattern is ready to be applied to templates (Phase 1 Plan 02)
- No blockers; template atomicity follows the identical approach

---
*Phase: 01-transaction-safety*
*Completed: 2026-02-24*
