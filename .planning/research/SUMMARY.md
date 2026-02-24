# Project Research Summary

**Project:** VMPharmacy — Production Hardening
**Domain:** Pharmacy POS / order management system (internal staff tool, daily use)
**Researched:** 2026-02-19
**Confidence:** HIGH

## Executive Summary

VMPharmacy is a working pharmacy point-of-sale system used daily by non-technical staff to process drug sales. The production hardening milestone is not a feature build — it is fixing confirmed data integrity bugs, silent failure modes, and architectural gaps that are actively dangerous in a live pharmacy context. Three problems are severe enough to cause unrecoverable damage before any additional load: non-atomic order creation creates ghost orders that corrupt revenue reporting, hard deletion of drugs breaks all historical order line items, and silent checkout failures leave staff unable to distinguish "try again" from "order went through." These three must be addressed in Phase 1 before anything else.

The existing stack (Next.js 16, Supabase, React 19, TypeScript) is entirely appropriate and requires no new dependencies. Every fix identified in research can be implemented using the existing versions of Supabase JS, PostgreSQL stored procedures, and standard React patterns. The hardening work is concentrated in four areas: database-layer atomicity (PostgreSQL RPC functions), schema completeness (soft delete for drugs), API consistency (shared error response utility), and client correctness (sessionStorage, hook state management, checkout page decomposition).

The key risk during this milestone is scope creep into refactoring work during the critical data-integrity fixes. Research is explicit: Phase 1 should touch only the database layer and API routes (no UI changes), Phase 2 addresses hook patterns and checkout page decomposition, and Phase 3 handles performance and polish. Mixing these phases risks introducing regressions in the checkout flow while the data-integrity fixes are still being validated.

---

## Key Findings

### Recommended Stack

The existing stack requires no changes. All hardening is implemented on top of the current foundation via SQL migrations (Supabase dashboard or migration files), a shared utility module (`lib/api-error.ts`), and targeted hook fixes. No new npm packages are needed.

**Core technologies (unchanged, verified against package.json):**
- **PostgreSQL via Supabase RPC** — atomic order/template creation using `supabase.rpc()` with plpgsql stored procedures; this is the only correct way to achieve multi-statement atomicity in the Supabase JS client
- **@supabase/supabase-js v2.89.0** — supports `.rpc()`, `.select()` chaining, `onAuthStateChange`; all hardening patterns are stable in this version
- **Next.js 16 Route Handlers** — `Response.json()` used for standardized error responses via shared `lib/api-error.ts` utility
- **React 19 / useState** — in-place state mutation after mutations (no new caching library); React Query deferred to a future phase if background revalidation becomes needed
- **sessionStorage (browser built-in)** — replaces localStorage for checkout persistence; tab-scoped, cleared on tab close, no new dependency

**No alternatives recommended at this time.** React Query/SWR, Zustand, client-side encryption, and manual transaction rollback were all evaluated and rejected — either too large a refactor scope for a hardening milestone or fundamentally incorrect approaches for the problem.

### Expected Features

This is a hardening milestone. "Features" in this context are broken capabilities that must be restored to working state.

**Must have (table stakes — currently broken, blocks staff trust):**
- Atomic order creation — two separate inserts with no rollback; ghost orders corrupt revenue reporting
- Drug soft delete + name snapshot — hard delete breaks all historical order line items; "Thuốc" fallback is visible to staff
- Template flattening correctness — incorrect drug quantities represent a dispensing error, not a UX issue
- Error visibility on failure — 12+ silent `console.error` calls; non-technical staff have no recovery path
- API error response standardization — prerequisite for meaningful user-facing error messages
- Customer selection persistence — cart restarts on refresh waste staff time and erode trust
- Order history bounded fetch — unbounded query will degrade proportional to data accumulation
- Checkout submit double-tap prevention — idempotency key needed; UI `disabled` prop alone is insufficient on mobile

**Should have (differentiators — improve reliability, not blocking):**
- Full-refetch elimination in hooks — noticeable on mobile networks; `useDrugs` already demonstrates the correct pattern
- Confirm dialog before order submit — reduces misfires on mobile; low complexity
- Per-drug quantity validation (min=1 guard on keyboard entry) — currently only enforced on button increment/decrement
- Loading states audit across all async operations — partial coverage is inconsistent and confusing

**Defer (confirmed out of scope):**
- Inventory / stock tracking — separate product initiative requiring schema redesign
- Order status workflow (pending / cancelled / refund) — no validated use case yet
- Pagination on history page — medium complexity; needed before scale, not for launch
- Full TypeScript `any` cleanup — 97+ occurrences; sweeping change risks regressions with no test coverage
- Multi-user / roles / permissions — single-role system is correct for this pharmacy
- Barcode scanning, CSV import, rate limiting, real-time multi-tab sync — all explicitly out of scope

### Architecture Approach

The architecture is a thin client-heavy Next.js app with direct Supabase calls from both API routes and browser-side hooks. The primary structural gaps are: non-atomic multi-step operations in API routes, inconsistent error contracts between routes, a 618-line checkout page with 13+ useState hooks managing unrelated concerns, and duplicate Supabase client factory code in individual route files. The recommended fix sequence moves from database outward — stored procedures first, then API route standardization, then hook cleanup, then UI decomposition.

**Major components:**
1. **PostgreSQL stored procedures** (new) — `create_order_atomic`, `create_template_atomic`, `update_template_atomic`; all multi-insert operations move here; API routes become thin wrappers
2. **lib/api-error.ts** (new) — shared error response utility with typed error codes; eliminates per-route copy-paste and enables client-side error branching
3. **useCheckoutModals / useQuickReorder / useCheckoutSubmit** (new hooks extracted from page.tsx) — decompose 618-line component into focused hooks; no JSX changes during extraction
4. **CheckoutContext** (modified) — switch from localStorage to sessionStorage; add auth-event clearing on SIGNED_OUT; store only customer_id not full customer object
5. **useDrugs / useOrders / useTemplates** (modified) — soft delete for drugs, bounded history fetch, in-place state mutation after mutations

**Component boundaries to leave unchanged:** `useHistory` debounced search pattern, `useCustomers` optimistic updates, `useDrugGroups` local state updates, auth cookie handling in `lib/supabase-server.ts`, template soft delete (already correct), `Suspense` + `CheckoutContent` split.

### Critical Pitfalls

1. **Orphaned orders from non-atomic creation** — use `supabase.rpc('create_order_atomic')` exclusively; never attempt application-level compensating transactions (deleting the order row on failure); race conditions and network errors make compensation unreliable and non-atomic
2. **Hard-deleting drugs with FK references** — FK constraint will either block the delete silently or, if changed to CASCADE, destroy order history; soft delete via `deleted_at` column is the only correct resolution; add `deleted_at IS NULL` to the RLS SELECT policy, not just the client-side query filter
3. **Optimistic updates with incomplete Order type** — `useOrders.createOrder` returns only the bare `orders` row; appending it to state causes `order.order_items.map(...)` to crash; keep full refetch for `useOrders` and fix bounded fetch instead; only apply optimistic updates to `useDrugs` and `useTemplates` where the full object is available
4. **Checkout page refactor with unstable useEffect deps** — `loadInitialState` has `customer` (object reference) in its dependency array; any refactoring that changes context render cadence will cause infinite re-fetch loops; stabilize to `customer?.id` before any structural refactor
5. **Double-submit on mobile** — `disabled` prop does not prevent rapid double-tap before React commits state; idempotency key (UUID sent in request body, UNIQUE constraint in DB) is the correct solution; UI guard is a secondary defense only

---

## Implications for Roadmap

Based on combined research, a 3-phase structure emerges naturally from dependency ordering. Each phase is independently deployable with clear blast-radius boundaries.

### Phase 1: Data Integrity and Safety

**Rationale:** All Phase 1 items are database-layer and API-route changes with no UI changes. This minimizes regression risk. The three most severe bugs (ghost orders, broken history, silent failures) must be fixed before any staff use accumulates data that becomes difficult to clean up. Phase 1 items are prerequisites for Phase 2 — you cannot safely refactor hooks that call non-atomic endpoints.

**Delivers:** A system where data written to the database is always consistent, errors are always surfaced to users with actionable messages, and the drug catalog can be safely managed without breaking history.

**Addresses from FEATURES.md:**
- Atomic order creation (currently broken — two separate inserts)
- Drug soft delete + name snapshot in order_items
- Template save atomicity (same RPC pattern as order)
- API error response standardization
- Error visibility on failure (toast for every catch block)
- Checkout submit idempotency key (duplicate order prevention)
- Template flattening fractional price rounding fix

**Avoids from PITFALLS.md:**
- Pitfall 1 (orphaned orders) — via RPC functions
- Pitfall 2 (soft delete only at client layer) — via RLS policy update
- Pitfall 5 (silent errors + double-submit) — via error standardization + idempotency key
- Pitfall 7 (fractional drug prices) — via `Math.round()` in price distribution
- Pitfall 8 (FK violation on hard delete) — via soft delete migration

**Research flag:** Standard patterns — skip `/gsd:research-phase`. RPC pattern, soft delete, and error standardization are all well-documented and verified against the actual codebase.

### Phase 2: Hook Correctness and Checkout Stability

**Rationale:** Hook fixes depend on Phase 1 being stable (can't switch `useOrders` to use the RPC return value until the RPC exists). Checkout page decomposition is pure refactoring with no behavior change — it is highest regression risk and must come after data integrity is confirmed. This phase has no DB migrations.

**Delivers:** Hooks that manage state correctly without full refetches, a decomposed checkout page with testable units, and a checkout context that clears correctly on session end.

**Addresses from FEATURES.md:**
- Full-refetch elimination in useDrugs, useTemplates (not useOrders — see Pitfall 4)
- Customer selection persistence hardening
- Loading states audit completion
- Checkout sessionStorage switch + auth-event clearing
- Order history bounded fetch (add limit=5 param server-side)

**Implements from ARCHITECTURE.md:**
- Extract `useCheckoutModals`, `useQuickReorder`, `useCheckoutSubmit` hooks
- Move `activeTemplate` into CheckoutContext
- Stabilize `customer?.id` in loadInitialState dependency array
- Standardize all API routes to import from `lib/supabase-server.ts` (eliminate inline client factories)

**Avoids from PITFALLS.md:**
- Pitfall 3 (refactoring without isolating state) — hooks-first, JSX-last extraction sequence
- Pitfall 4 (optimistic update type mismatch in useOrders) — keep full refetch for useOrders; fix pagination instead
- Pitfall 9 (useEffect infinite loop) — stabilize object reference in dependency array
- Pitfall 10 (saveAsTemplate without explicit user_id) — add `getUser()` check before template insert

**Research flag:** Standard React patterns — skip `/gsd:research-phase`. Hook extraction and sessionStorage switch are well-established techniques with no novel integration challenges.

### Phase 3: Performance and UX Polish

**Rationale:** Phase 3 items are improvements on a now-correct foundation. None are blocking for staff use. Order by user-visible impact.

**Delivers:** Snappier perceived performance on mobile, clearer feedback before high-stakes actions, and a history page that scales as order volume grows.

**Addresses from FEATURES.md:**
- Per-drug quantity validation (min=1 keyboard guard)
- Confirm dialog before order submit
- Quick reorder UI polish
- Pagination on order history page (cursor-based, "Load more")
- Duplicate order detection warning (cart hash vs. recent orders)

**Research flag:** History pagination may benefit from `/gsd:research-phase` to evaluate cursor vs. offset pagination tradeoffs at Supabase/PostgREST layer. Other items are standard patterns.

### Phase Ordering Rationale

- Phase 1 before Phase 2 because hooks (`useOrders`, `useTemplates`) must call the RPC-based API to benefit from atomic returns; the refetch elimination in Phase 2 depends on the RPC returning full data
- Phase 2 before Phase 3 because a decomposed, correct checkout page is a safer base to add UX enhancements to; UX polish on a 618-line component with unstable effects is risky
- Database migrations always precede code changes (Phase 1 starts with SQL, then TypeScript)
- Within Phase 1: API route changes before hook changes; apply `api-error.ts` to `/api/orders` first, validate the full checkout flow, then roll out to remaining routes

### Research Flags

Phases needing deeper research during planning:
- **Phase 3 (history pagination):** Supabase/PostgREST cursor pagination behavior with complex JOINs (orders + order_items + customers) has edge cases; deserves a short research spike before implementation

Phases with standard patterns (skip research-phase):
- **Phase 1:** RPC functions, soft delete, error standardization — all verified against actual codebase and confirmed stable in current package versions
- **Phase 2:** Hook extraction, sessionStorage, dependency array stabilization — standard React 19 patterns with no novel integrations

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified directly against `package.json`; no new dependencies; all patterns confirmed stable in current versions |
| Features | HIGH | All table-stakes items grounded in specific file and line number references from direct codebase read; differentiators are domain inference (MEDIUM) but deferred |
| Architecture | HIGH | All gaps identified from direct source-code inspection of all API routes, hooks, and context; component boundaries are explicit |
| Pitfalls | HIGH | All 11 pitfalls derived from live production code with specific line citations; no general advice used |

**Overall confidence: HIGH**

All four research files are grounded in direct codebase analysis rather than general domain research. The project is not speculative — the bugs are confirmed, the file paths are known, and the fix patterns are documented in the codebase itself (the soft delete pattern for templates is already correct and can be replicated for drugs).

### Gaps to Address

- **Supabase RPC return shape:** The stored procedure should return the full order with joined `order_items` and `customers` to enable correct list prepending in hooks. The exact return type (JSONB vs. composite type) should be confirmed during Phase 1 implementation by testing the RPC in Supabase's SQL editor before writing the hook integration.
- **RLS policy ALTER syntax:** Adding `deleted_at IS NULL` to existing RLS policies requires `DROP POLICY + CREATE POLICY` (Supabase dashboard policy editor does not support complex conditions via UI). The migration SQL for this must be written and tested in Supabase SQL editor, not applied through the dashboard.
- **Idempotency key schema:** Adding a UNIQUE constraint on `orders(idempotency_key)` requires a migration decision on column type (UUID, default null for old rows). The nullability strategy for existing rows must be decided before the migration is written.
- **useOrders optimistic update decision:** Research confirms keeping full refetch for `useOrders.createOrder` is safer than optimistic append (due to the Order type requiring nested relations). This is the correct call. However, if the refetch proves slow in practice, the correct resolution is adding `limit=50` to the GET endpoint, not adding optimistic updates.

---

## Sources

### Primary (HIGH confidence — direct codebase analysis)
- `app/api/orders/route.ts` — non-atomic insert at lines 200–236; inline client factory at lines 5–33; error handling patterns
- `app/api/templates/route.ts` — same non-atomic pattern at lines 37–69
- `app/context/CheckoutContext.tsx` — localStorage persistence at lines 62, 78; saveAsTemplate non-atomic at lines 132–184
- `app/checkout/page.tsx` — 13 useState hooks enumerated; fragile useEffect dependency at line 104; handleCheckout at lines 195–241
- `hooks/useDrugs.ts` — hard delete at line 72; partial optimistic updates at lines 62–68
- `hooks/useOrders.ts` — full refetch after createOrder at line 50; Order type shape
- `hooks/useTemplates.ts` — soft delete (templates only) at lines 31, 78, 130; full refetch pattern
- `hooks/useCustomers.ts` — correct optimistic prepend/patch pattern (reference implementation)
- `supabase_schema.sql` — RLS policies; FK constraints on order_items.drug_id; no `deleted_at` on drugs table
- `migration_soft_delete.sql` — confirmed incomplete: templates only, not drugs
- `types/database.ts` — templates.deleted_at confirmed at line 89; drugs table has no deleted_at
- `lib/supabase-server.ts` — `getAll()` cookie pattern (correct reference implementation)
- `package.json` — all version pins confirmed

### Secondary (domain inference, MEDIUM confidence)
- Pharmacy POS reliability patterns: correctness-first priority (staff daily use, non-technical operators, mobile-first context)
- PostgreSQL soft delete via deleted_at: standard e-commerce pattern; confirmed replicable from templates implementation already in codebase

### Notes on Research Tooling
- Web search and web fetch were unavailable during research sessions
- All findings are HIGH confidence because they are derived from the live production codebase, not external documentation
- Supabase RPC/plpgsql API stability flagged for verification against https://supabase.com/docs/reference/javascript/rpc if needed, but HIGH confidence from training data (stable API since Supabase GA)

---
*Research completed: 2026-02-19*
*Ready for roadmap: yes*
