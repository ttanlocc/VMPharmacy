# Roadmap: VMPharmacy v1.0 Production Hardening

## Overview

This roadmap hardens the existing VMPharmacy MVP for production use. We fix database-level transaction safety first (atomic orders, soft delete), then ensure checkout flow reliability (template flattening, customer persistence), and finally polish with visible errors and performance optimizations. Three phases deliver a stable app for pharmacy staff.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Transaction Safety** - Atomic orders and soft delete for data integrity
- [ ] **Phase 2: Checkout Reliability** - Template flattening and customer persistence fixes
- [ ] **Phase 3: Polish & Performance** - Visible errors, caching, and pagination

## Phase Details

### Phase 1: Transaction Safety
**Goal**: Database operations are reliable and preserve historical data
**Depends on**: Nothing (first phase)
**Requirements**: SAFE-01, SAFE-02
**Success Criteria** (what must be TRUE):
  1. Staff can submit an order and either all items save or nothing saves (no orphaned orders)
  2. Staff can delete a drug from the catalog without losing drug names in historical orders
  3. Deleted drugs no longer appear in drug search/selection but remain visible in past order details
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: Checkout Reliability
**Goal**: Checkout flow works correctly without data loss or state issues
**Depends on**: Phase 1
**Requirements**: DATA-01, UX-01
**Success Criteria** (what must be TRUE):
  1. Staff can apply a template with mixed quantities and see correct item totals in cart
  2. Staff can apply a template where one drug appears multiple times and see properly merged quantities
  3. Staff can select a customer, navigate away, return to checkout, and still see the same customer selected
  4. Staff can refresh the checkout page and customer selection persists
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Polish & Performance
**Goal**: App is fast and errors are visible to users
**Depends on**: Phase 2
**Requirements**: UX-02, PERF-01, PERF-02
**Success Criteria** (what must be TRUE):
  1. Staff sees a visible error message when order creation fails (not a silent failure)
  2. Staff sees a visible error message when checkout encounters an issue
  3. Staff can add/edit a drug without the entire drug list refetching
  4. Staff can add/edit a template without the entire template list refetching
  5. Staff can view order history for a high-volume customer without noticeable delay
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Transaction Safety | 0/TBD | Not started | - |
| 2. Checkout Reliability | 0/TBD | Not started | - |
| 3. Polish & Performance | 0/TBD | Not started | - |
