# VMPharmacy — State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-24)

**Core value:** Pharmacy staff can complete a sale reliably — from selecting drugs to submitting an order — without data loss, errors, or crashes.
**Current focus:** v1.0 Production Hardening — Phase 2: Checkout Reliability

## Current Position

Phase: 2 of 3 (Checkout Reliability)
Plan: 1 of TBD in current phase
Status: In progress
Last activity: 2026-02-24 — Phase 2 Plan 1 complete

Progress: [████░░░░░░] 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 8 min
- Total execution time: 0.25 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-transaction-safety | 2 | 15 min | 8 min |
| 02-checkout-reliability | 1 | 6 min | 6 min |

**Recent Trend:**
- Last 5 plans: 7 min
- Trend: N/A (only 1 data point)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Used SECURITY DEFINER on create_order_atomic RPC function; auth checked in API route before RPC call — standard Supabase pattern for atomic writes bypassing RLS safely
- Created supabase/migrations/ directory for SQL migration files (previously loose files at project root)
- Soft delete via deleted_at TIMESTAMPTZ column — row preserved so order history JOIN still returns drug name
- Order GET handler intentionally left unchanged — historical orders JOIN deleted drugs by design
- loadInitialState effect deps reduced to URL params only — reads localStorage directly to compare customer state, avoiding React state dependency loops
- Duplicate drug_id merge happens after flatMap, before validItems filter — preserves items-without-drug-id for invalidCount reporting

### Pending Todos

None yet.

### Blockers/Concerns

- create_order_atomic SQL function must be applied manually in Supabase SQL Editor before deploying the updated /api/orders route. See 01-01-SUMMARY.md "User Setup Required" section.
- soft_delete_drugs.sql migration must be applied manually in Supabase SQL Editor before deploying updated routes. See 01-02-SUMMARY.md "User Setup Required" section.

## Session Continuity

Last session: 2026-02-24
Stopped at: Completed 02-01-PLAN.md (checkout flattening + customer persistence)
Resume file: None
