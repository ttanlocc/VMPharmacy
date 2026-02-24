# Feature Landscape: VMPharmacy Production Readiness

**Domain:** Pharmacy POS / order management system — daily staff use
**Researched:** 2026-02-19
**Research type:** Production-hardening a working MVP — NOT new feature design
**Confidence:** HIGH (based on direct codebase analysis + domain knowledge of POS reliability patterns)

---

## Context: What "Production Ready" Means Here

VMPharmacy is used by pharmacy staff every day to process sales. Staff are non-technical. The trust bar is:

> "If this breaks during a sale, I lose money and customer trust."

That means: **correctness first, visibility second, performance third**. Every table-stakes item below is tied to a real failure mode identified in the codebase.

---

## Table Stakes

Features users expect. Missing or broken = staff cannot do their job or the system cannot be trusted.

| Feature | Why Expected | Complexity | Current Status | Notes |
|---------|--------------|------------|----------------|-------|
| **Atomic order creation** | Order row without items = phantom sale, incorrect totals | Medium | BROKEN — two separate inserts, no rollback on item failure (`route.ts` lines 200–236) | Use Supabase RPC or PostgreSQL transaction |
| **Error visibility on failure** | Non-technical staff have no recovery path if they don't know what failed | Low | BROKEN — 12+ `console.error` calls with no user-facing feedback; silent failures in checkout and order creation | Consistent toast + descriptive message for every catch block |
| **Customer selection persistence** | Staff select customer before adding drugs; losing that selection mid-flow requires restarting the sale | Low | PARTIAL — URL param loading has edge cases on refresh; `customer` state can desync from `customerId` param | Harden the useEffect dependency chain and localStorage sync |
| **Drug names preserved in order history** | Staff look up "what did Mrs. Nguyen buy last time?" — deleted drug names must still show | Medium | BROKEN — hard delete on drugs; order history shows "Thuốc" fallback; `migration_soft_delete.sql` exists but incomplete for drugs table | Add `deleted_at` column to `drugs` table; change `deleteDrug` to soft-delete |
| **Correct quantity calculation in templates** | Template with qty=2 applied twice must produce correct drug quantities for each line item | Medium | BROKEN — edge cases documented: mixed templates + direct drugs produce incorrect merged quantities in `CheckoutContext` lines 149–163 | Rewrite flattening logic with explicit test cases for each edge |
| **Typed, consistent API error responses** | Staff-facing error messages must be actionable, not "Internal Server Error" | Low | BROKEN — mixed `console.error` + generic 500s in order and customer routes | Standardize all API routes to return `{ error: string, code?: string }` with appropriate HTTP status |
| **Order history not broken by volume** | A busy customer with 200 orders must not make the checkout page hang | Medium | BROKEN — unbounded fetch in `checkout/page.tsx` line 112: fetches all orders per customer, slices to 5 on client side | Add server-side `limit=5` param to the orders API when used for quick-reorder display |
| **Drug list stable after mutations** | Adding/editing a drug should not trigger full re-fetch of all drugs (visible lag on mobile networks) | Medium | BROKEN — `fetchDrugs()` called on every create/update in hooks; same pattern in `useTemplates` | Optimistic local state update post-mutation; only full-fetch on initial load |
| **Checkout submit button disabled while submitting** | Double-tap on a mobile submit button must not create duplicate orders | Low | PARTIAL — `isSubmitting` state guards the button, but the success screen redirect has a 2500ms delay where re-entry is possible | Verify guard is airtight; add server-side idempotency check (duplicate detection by user_id + timestamp proximity) |
| **Template save is atomic** | If template_items insert fails after template row created, staff have a corrupt template | Low | BROKEN — `saveAsTemplate` in `CheckoutContext` lines 132–184 has same two-step non-atomic pattern as order creation | Use a single Supabase RPC call or wrap in a stored procedure |
| **Form validation with clear messages** | Staff mistyping a phone number must get "Phone number already exists" not a generic crash | Low | PARTIAL — customer API handles error code 23505 but most routes return generic errors | Surface database constraint errors as human-readable messages in all forms |
| **Loading states on all async operations** | Without loading indicators, staff tap buttons multiple times thinking nothing happened | Low | PARTIAL — exists in some places (drug form `uploading` state) but missing in others (template operations, some customer ops) | Audit every async operation for loading state coverage |

---

## Differentiators

Features that add value but are not blockers for basic staff use. Build after table stakes are solid.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Pagination on order history** | History page loads all orders — will degrade as database grows | Medium | Server-side cursor pagination; show "Load more" or infinite scroll; required before scale, not before launch |
| **Optimistic UI for add/remove items** | Faster perceived performance on mobile; cart feels snappy even on slow connections | Medium | Already partially implemented in `useDrugs.updateDrug`; extend pattern to all mutations |
| **Per-drug quantity validation** | Prevent submitting quantity=0 or negative quantity through keyboard entry | Low | Add min=1 guard on quantity inputs; currently `Math.max(1, ...)` only applied on increment/decrement buttons |
| **Duplicate order detection warning** | Alert staff if submitting an identical order for same customer within N minutes | Medium | Compare current cart hash against last N orders for this customer; prevent accidental double billing |
| **Offline/PWA resilience** | Service worker already installed; checkout state already in localStorage — bridge the gap so a brief connectivity drop does not lose a sale in progress | High | Queue order submission when offline; retry on reconnect; requires complex state machine |
| **Confirm dialog before order submit** | "You're about to bill Mrs. Nguyen 250,000 VND for 3 items — confirm?" reduces misfires | Low | Simple modal before `handleCheckout`; especially valuable on mobile where accidental taps happen |
| **Bulk price update on drugs** | Update all drugs in a group by percentage at once (e.g., supplier price increase) | High | Not blocking; useful for pharmacy management, but this is catalog admin work |
| **Quick reorder enhancements** | Show drug images and totals more clearly in the quick reorder panel | Low | UI polish on existing feature; already functional |

---

## Anti-Features

Features to explicitly NOT build now, with reasoning.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full inventory / stock tracking** | Requires redesign of the drug model, stock movement events, reorder triggers — a separate initiative | Mark as out-of-scope in PROJECT.md; do not prototype |
| **Order status workflow (pending / cancelled / refund)** | All orders are `completed`; adding workflow states requires UI for state transitions, staff training, and API changes | Keep hardcoded `completed` until actual refund use-case is validated |
| **Batch CSV import of customers/drugs** | Useful eventually but requires parsing, validation UI, conflict resolution — disproportionate effort to value at this stage | One-at-a-time CRUD is sufficient for launch |
| **Full TypeScript `any` cleanup** | 97+ occurrences across hooks and components — fixing all at once risks regressions with no tests to catch them | Fix only in files being modified for other reasons; do not do a sweep |
| **Full E2E test suite** | Ambitious scope for a hardening milestone; would take more time than the fixes themselves | Write targeted unit tests for the two most dangerous business logic functions: price distribution and template flattening |
| **Multi-user / roles / permissions** | Only pharmacy staff use this; no concept of manager vs. cashier yet | Single-role system is fine; auth is already per-user via Supabase |
| **Real-time sync across tabs** | LocalStorage race condition is a known issue but multi-tab checkout is not a real staff use case | Add a comment/warning in code; don't solve with complex realtime subscriptions |
| **Rate limiting implementation** | Supabase tier handles this at current scale; adding custom rate limiting is over-engineering | Defer until traffic metrics show a problem |
| **Barcode scanning** | Pharmacy staff in this context use touch-based search; barcode infrastructure not present | Not in scope; adds hardware dependency |

---

## Feature Dependencies

```
Soft-delete drugs (drugs.deleted_at column + migration)
    → Accurate order history display (drug names preserved)
    → Safe "delete drug" UX (staff can delete without fear of breaking history)

Atomic order creation (Supabase RPC)
    → Template save atomicity (same RPC pattern reused)
    → Trust in the checkout flow

Error visibility standardization (API error response contract)
    → Form validation messages (surface constraint errors to users)
    → Consistent toast messages across all flows

Customer selection persistence (harden localStorage + URL param sync)
    → Checkout flow correctness (customer assigned correctly to order)

Template flattening fix
    → Correct order items when templates used
    → Correct saveAsTemplate behavior (uses same flattening logic)

Order history API limit param
    → Quick reorder panel performance (checkout page does not hang on customer switch)
```

---

## MVP Recommendation for This Milestone

This is a hardening milestone, not a feature build. The work is fixing what is broken, not adding.

**Fix in this order (priority sequence):**

1. **Atomic order creation** — highest severity; creates unrecoverable data inconsistency
2. **Drug soft delete** — history is broken for every deleted drug; easy migration + code change
3. **Template flattening correctness** — incorrect quantities are a drug dispensing error
4. **Customer selection persistence** — sale restarts waste staff time and erode trust
5. **Error visibility** — staff have no recovery path without feedback; sweeping change across all catch blocks
6. **API error response standardization** — enables meaningful error messages in step 5
7. **Order history unbounded fetch** — performance degrades proportional to order volume; fix before real use accumulates data
8. **Full-refetch elimination** — performance, noticeable on mobile networks

**Defer (confirmed not in this milestone):**
- Pagination on history page (medium complexity, not blocking launch)
- Duplicate order detection (nice-to-have, not critical for staff trust)
- All anti-features listed above

---

## Sources

- Direct codebase analysis: `app/api/orders/route.ts`, `app/context/CheckoutContext.tsx`, `app/checkout/page.tsx`, `hooks/useDrugs.ts`, `hooks/useTemplates.ts`, `hooks/useOrders.ts`, `hooks/useHistory.ts`
- `.planning/codebase/CONCERNS.md` — comprehensive bug and tech debt catalogue
- `.planning/PROJECT.md` — validated requirements and out-of-scope list
- `supabase_schema.sql` — database structure, constraint definitions
- `migration_soft_delete.sql` — existing (incomplete) soft-delete migration for templates only
- Domain knowledge: pharmacy POS reliability patterns (staff daily use, non-technical operators, mobile-first context)
- Confidence: HIGH for table stakes (all grounded in specific code lines); MEDIUM for differentiators (domain inference, not code-verified)
