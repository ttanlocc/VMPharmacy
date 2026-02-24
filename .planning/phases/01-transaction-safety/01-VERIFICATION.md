---
phase: 01-transaction-safety
verified: 2026-02-24T11:30:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
---

# Phase 01: Transaction Safety Verification Report

**Phase Goal:** Database operations are reliable and preserve historical data
**Verified:** 2026-02-24T11:30:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Submitting an order either saves the order AND all items, or saves nothing | VERIFIED | `app/api/orders/route.ts` line 203 calls `supabase.rpc('create_order_atomic', ...)` — single transaction, no two-step insert |
| 2 | If order_items insert fails, no orphaned order row exists | VERIFIED | `create_order_atomic.sql` uses plpgsql BEGIN/END; PostgreSQL rolls back both INSERTs on any failure |
| 3 | Existing order creation flow (checkout submit) still works end-to-end | VERIFIED | GET handler at line 35 is completely unchanged; POST handler preserves all template price distribution logic before RPC call |
| 4 | Deleting a drug sets deleted_at instead of removing the row | VERIFIED | `hooks/useDrugs.ts` line 73–78: `deleteDrug` uses `.update({ deleted_at: new Date().toISOString() })`; no `.delete()` on drugs table |
| 5 | Soft-deleted drugs do not appear in drug search, drug list, or drug selection modals | VERIFIED | `hooks/useDrugs.ts` line 31: `.is('deleted_at', null)` in `fetchDrugs`; `app/api/drugs/route.ts` line 9: `.is('deleted_at', null)` in GET handler |
| 6 | Historical orders that reference a soft-deleted drug still display the drug name correctly | VERIFIED | `app/api/orders/route.ts` GET handler (lines 49–60) JOINs `drugs (name, unit, image_url)` with no deleted_at filter — soft-deleted drug rows remain in DB, JOIN returns name correctly |
| 7 | Order creation rejects soft-deleted drugs (treats them as non-existent) | VERIFIED | `app/api/orders/route.ts` lines 124–128: drug validation query includes `.is('deleted_at', null)`; soft-deleted drugs excluded from `existingDrugIds` set |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/create_order_atomic.sql` | PostgreSQL RPC function for atomic order+items creation | VERIFIED | Contains `CREATE OR REPLACE FUNCTION create_order_atomic`, SECURITY DEFINER, dual INSERT in plpgsql |
| `app/api/orders/route.ts` | POST handler using supabase.rpc instead of two separate inserts | VERIFIED | Single `supabase.rpc('create_order_atomic', ...)` call at line 203; no two-step insert remains |
| `supabase/migrations/soft_delete_drugs.sql` | Migration adding deleted_at column and partial index | VERIFIED | `ALTER TABLE drugs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`; partial index on `deleted_at IS NULL` |
| `hooks/useDrugs.ts` | Soft delete in deleteDrug, filtered fetch excluding deleted drugs | VERIFIED | fetchDrugs: `.is('deleted_at', null)` at line 31; deleteDrug: `.update({ deleted_at: ... })` at line 75 |
| `app/api/drugs/route.ts` | GET handler filtering out soft-deleted drugs | VERIFIED | Line 9: `.is('deleted_at', null)` on drugs query |
| `types/database.ts` | Updated drugs type with deleted_at field | VERIFIED | `deleted_at: string | null` present in drugs Row, Insert, and Update type definitions |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/api/orders/route.ts` | `create_order_atomic` | `supabase.rpc('create_order_atomic', ...)` | WIRED | Line 203 — exact pattern match; p_user_id, p_total_price, p_customer_id, p_template_id, p_items all passed |
| `hooks/useDrugs.ts` | supabase drugs table | `.update({ deleted_at: ... })` instead of `.delete()` | WIRED | Line 73–78 — update pattern confirmed; no hard delete on drugs table (only `.delete()` call is on `drug_import_prices` at line 99, a different table) |
| `app/api/drugs/route.ts` | supabase drugs table | `.is('deleted_at', null)` filter | WIRED | Line 9 — filter present before `.order('name')` |
| `app/api/orders/route.ts` POST | supabase drugs table | `.is('deleted_at', null)` in drug validation | WIRED | Line 128 — filter in drug ID existence check |

### Anti-Patterns Found

None detected. No TODOs, FIXMEs, placeholders, empty implementations, or stub handlers in any phase files.

### Human Verification Required

#### 1. Database Migration Applied

**Test:** In Supabase SQL Editor, confirm `create_order_atomic` function exists and `drugs.deleted_at` column exists.
**Expected:** `SELECT proname FROM pg_proc WHERE proname = 'create_order_atomic'` returns one row; `SELECT column_name FROM information_schema.columns WHERE table_name='drugs' AND column_name='deleted_at'` returns one row.
**Why human:** Migration files must be manually run in Supabase SQL Editor (no automated runner). Code changes are wired correctly but the DB schema change cannot be confirmed programmatically from this codebase.

#### 2. End-to-end Order Creation

**Test:** Submit a checkout order with 2+ items. Immediately check Supabase orders and order_items tables.
**Expected:** One order row and corresponding order_items rows created together; no orphaned order if a bad drug_id is forced.
**Why human:** RPC call correctness requires live Supabase DB with function applied.

#### 3. Deleted Drug Invisible in UI

**Test:** Delete a drug from the catalog, then open the drug picker in checkout.
**Expected:** Deleted drug does not appear in picker; but appears with its name in any historical order that contained it.
**Why human:** Visual UI behavior and order history display require live app testing.

## Gaps Summary

No gaps. All seven observable truths are verified against actual codebase. All artifacts are substantive and wired. All four task commits (65011a5, 0bb0fe4, 8818eea, 61bb6e8) exist in git history.

The only open item is human verification that the two migration SQL files have been applied in the Supabase SQL Editor — without this, the API routes will fail at runtime even though the code is correct.

---
_Verified: 2026-02-24T11:30:00Z_
_Verifier: Claude (gsd-verifier)_
