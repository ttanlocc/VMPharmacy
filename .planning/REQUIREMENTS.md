# Requirements: VMPharmacy

**Defined:** 2026-02-24
**Core Value:** Pharmacy staff can complete a sale reliably — from selecting drugs to submitting an order — without data loss, errors, or crashes.

## v1.0 Requirements

Requirements for production hardening. Each maps to roadmap phases.

### Transaction Safety

- [ ] **SAFE-01**: Order creation is atomic — no orphaned orders if items insert fails
- [ ] **SAFE-02**: Deleted drugs are soft-deleted — historical orders show original drug names

### User Experience

- [ ] **UX-01**: Customer selection persists reliably through page refresh and navigation
- [ ] **UX-02**: Core flow errors are visible to users — no silent failures in checkout or order creation

### Performance

- [ ] **PERF-01**: Drug list and template list don't trigger full refetch on every mutation
- [ ] **PERF-02**: Order history load is fast even for customers with many past orders

### Data Integrity

- [ ] **DATA-01**: Template items flatten correctly for all quantity/mix edge cases

## v1.1 Requirements

Deferred to next milestone. Tracked but not in current roadmap.

### Code Quality

- **QUAL-01**: API routes return consistent, typed error responses
- **QUAL-02**: Checkout page complexity is manageable — refactor 618-line page
- **QUAL-03**: Checkout state is stable under high item counts and multi-tab usage

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Inventory tracking | Not yet designed, separate initiative |
| Order status workflow | Hardcoded "completed" acceptable for v1 |
| Batch import | Not blocking staff use |
| Full test suite | Too broad; cover critical paths only |
| TypeScript `any` cleanup | 38+ occurrences, defer to post-launch |
| Rate limiting | Supabase tier handles current scale |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SAFE-01 | Phase 1: Transaction Safety | Pending |
| SAFE-02 | Phase 1: Transaction Safety | Pending |
| UX-01 | Phase 2: Checkout Reliability | Pending |
| UX-02 | Phase 3: Polish & Performance | Pending |
| PERF-01 | Phase 3: Polish & Performance | Pending |
| PERF-02 | Phase 3: Polish & Performance | Pending |
| DATA-01 | Phase 2: Checkout Reliability | Pending |

**Coverage:**
- v1.0 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0

---
*Requirements defined: 2026-02-24*
*Last updated: 2026-02-24 — Traceability updated after roadmap creation*
