# VMPharmacy

## What This Is

A pharmacy management system for pharmacy staff to process sales orders, manage drug inventory, and track customers. Staff use it daily to look up drugs, add items to a checkout cart (individually or via saved prescription templates), assign to a customer, and complete orders. The app runs as a mobile-first PWA on top of Next.js + Supabase.

## Core Value

Pharmacy staff can complete a sale reliably — from selecting drugs to submitting an order — without data loss, errors, or crashes.

## Requirements

### Validated

<!-- Capabilities confirmed to exist in the codebase. -->

- ✓ User authentication (email/password login/register via Supabase) — existing
- ✓ Drug catalog with CRUD, image upload, drug group filtering — existing
- ✓ Customer management (create, search, view profiles with medical history) — existing
- ✓ Order creation via checkout flow (select drugs, quantities, prices, assign customer) — existing
- ✓ Prescription templates (create, apply, save from checkout) — existing
- ✓ Template-based checkout (navigate `/checkout/new`, pick template, proceed to cart) — existing
- ✓ Drug import price tracking per supplier — existing
- ✓ Order history view with per-customer and global filters — existing
- ✓ PWA support (installable, service worker) — existing
- ✓ Mobile-first responsive UI — existing

### Active

<!-- Production readiness gaps to fix before real staff use. -->

- [ ] Order creation is atomic — no orphaned orders if items insert fails
- [ ] Template items flatten correctly for all quantity/mix edge cases
- [ ] Customer selection persists reliably through page refresh and navigation
- [ ] Deleted drugs are soft-deleted — historical orders show original drug names
- [ ] Core flow errors are visible to users — no silent failures in checkout or order creation
- [ ] API routes return consistent, typed error responses
- [ ] Checkout state is stable under high item counts and multi-tab usage
- [ ] Order history load is fast even for customers with many past orders
- [ ] Drug list and template list don't trigger full refetch on every mutation
- [ ] Checkout page complexity is manageable — no state coupling bugs

### Out of Scope

- Inventory / stock level tracking — not yet designed, separate initiative
- Order status workflow (pending/cancelled/refund) — hardcoded "completed" is acceptable for v1 launch
- Batch import of customers/drugs — not blocking staff use
- Full unit/integration/E2E test suite — too broad; cover critical paths only
- Full TypeScript `any` cleanup — 38+ occurrences, defer to post-launch refactor
- Rate limiting — Supabase tier handles this for current scale

## Context

- **Stack:** Next.js 16 + React 19 + TypeScript + Supabase (PostgreSQL + Auth + Storage) + Tailwind CSS 4
- **Codebase state:** Working MVP, limited internal testing revealed bugs in core flows and performance lag
- **Key concerns identified:** Order transaction consistency, template flattening edge cases, full-refetch performance, checkout state complexity (618-line page with 13+ useState), no soft delete for drugs
- **Deployment target:** Vercel + Supabase cloud (already configured)
- **Codebase map:** `.planning/codebase/` — ARCHITECTURE.md, CONCERNS.md, STACK.md, etc.

## Constraints

- **Tech stack:** Next.js + Supabase — no new databases or backend frameworks
- **Scope:** Fix and harden existing features only — no new major features before launch
- **Target users:** Pharmacy staff (internal), not patients — security bar is high but not healthcare-compliance level yet

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix core flows before adding features | Bugs in checkout/orders would erode trust immediately | — Pending |
| Soft delete drugs instead of hard delete | Preserves order history accuracy | — Pending |
| Atomic order creation via Supabase transaction | Prevents orphaned orders | — Pending |
| Paginate/limit order history fetches | Prevents slow customer-switching in checkout | — Pending |

---
*Last updated: 2026-02-19 after initialization*
