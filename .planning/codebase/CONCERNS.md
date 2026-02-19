# Codebase Concerns

**Analysis Date:** 2026-02-19

## Tech Debt

**Type Safety Issues - Widespread use of `any` type:**
- Issue: 38 occurrences of `any` type in hooks, 59 occurrences in components, and multiple `@ts-ignore` comments bypass TypeScript checks
- Files: `app/api/templates/route.ts`, `app/api/orders/route.ts`, `hooks/useDrugs.ts` (8 occurrences), `hooks/useTemplates.ts` (10 occurrences), `components/AddItemModal.tsx` (8 occurrences), `app/context/CheckoutContext.tsx` (2 occurrences), `app/api/customers/route.ts` (2 uses of `as any`)
- Impact: Reduced type safety, harder to catch bugs at compile time, harder refactoring, unpredictable behavior with unknown object shapes
- Fix approach: Replace `any` with proper typed interfaces. Create explicit type definitions for API responses and component props. Run `tsc --noImplicitAny` to find all violations

**Inconsistent Error Handling:**
- Issue: Console.error calls throughout codebase (12+ in app routes alone) log errors but don't always provide user-facing feedback or proper error boundaries
- Files: `app/checkout/page.tsx` (line 76), `app/api/orders/route.ts` (line 98, 214, 234), `hooks/useOrders.ts` (line 28, 53), `app/(dashboard)/customers/select/page.tsx` (line 74)
- Impact: Silent failures possible, users unaware of errors, poor debugging experience, inconsistent error messages
- Fix approach: Create unified error handling layer. All errors should: (1) log to console, (2) show user toast, (3) track in monitoring service. Use Error Boundary wrapper for React components

**Potential Transaction Consistency in Order Creation:**
- Issue: Order and order_items are created in two separate API calls in `app/api/orders/route.ts` (lines 200-238). If order_items insert fails, orphaned order exists
- Files: `app/api/orders/route.ts` (POST handler)
- Impact: Data inconsistency, orders without items, incomplete transaction handling
- Fix approach: Use database transaction or implement rollback logic. Consider using Supabase triggers or stored procedures to atomically create order + items

**Race Condition in Checkout Context:**
- Issue: `CheckoutContext.tsx` saves to localStorage on every item change (lines 76-82), but simultaneous loads could cause out-of-sync state between browser tabs/windows
- Files: `app/context/CheckoutContext.tsx`
- Impact: Multi-tab checkout confusion, lost items if switching between windows during checkout
- Fix approach: Use versioning in localStorage or implement proper session-based state management with debouncing

## Known Bugs

**Customer Selection Not Persisting Across New Checkout:**
- Symptoms: When navigating from customer select to checkout via URL parameter, customer selection may be lost if page reloads
- Files: `app/checkout/page.tsx` (lines 59-104), `app/(dashboard)/checkout/new/page.tsx`
- Trigger: User selects customer, gets redirected to `/checkout?customerId={id}`, then refreshes page mid-checkout
- Status: Partially addressed with legacy support in checkout (lines 26-104), but edge cases remain

**Template Items Flattening Logic Complexity:**
- Symptoms: When saving template with quantity > 1 and nested template items, the flattening calculation (line 149-159 in CheckoutContext.tsx) may produce unexpected quantities
- Files: `app/context/CheckoutContext.tsx` (lines 132-185)
- Trigger: User adds template with qty=2, each template has item A(qty=1) and B(qty=1). Expected final: A(qty=2), B(qty=2). Current logic multiplies correctly but merging with direct drugs creates edge cases
- Workaround: Avoid mixing templates with high quantities and direct drug items in same checkout

**Deleted Drugs Still Appear in Order History:**
- Symptoms: Order history shows "Thuốc" placeholder for drugs that were deleted from database but orders still reference them
- Files: `app/checkout/page.tsx` (lines 138-150) handles this with `currentDrug?.name || oi.drugs?.name || 'Thuốc'`
- Impact: Poor user experience, confusing product names in history, hard to trace what was actually sold
- Workaround: Check if drug_id exists before checkout; current system provides fallback

## Security Considerations

**Insufficient Input Validation:**
- Risk: SQL injection through search parameters in API routes is mitigated by Supabase client, but client-side validation is minimal
- Files: `app/api/customers/route.ts` (line 36), `app/api/orders/route.ts` (line 92) - rely on Supabase's built-in parameterization
- Current mitigation: Supabase SSR client uses prepared statements automatically
- Recommendations: Add explicit input sanitization for phone numbers and customer names. Add maximum length checks. Implement rate limiting on POST endpoints

**Public Drug Data Exposure:**
- Risk: All drugs visible to unauthenticated users due to RLS policy `Enable read access for all users` on drug_groups and drugs tables (supabase_schema.sql lines 69, 75)
- Files: `supabase_schema.sql` (lines 69, 75)
- Current mitigation: Only edit requires authentication; read is public by design
- Recommendations: Evaluate if drug catalog should be truly public or limited to authenticated users. If public is required, monitor for data scraping

**Unencrypted Customer Medical History:**
- Risk: Medical history stored in plaintext in `customers.medical_history` field
- Files: Database schema, `app/api/customers/route.ts`
- Current mitigation: Only authenticated users can see customer data (RLS policy on customers table is authenticated-only for read)
- Recommendations: Consider encryption at rest, PII masking in logs, audit trail for access

**localStorage Exposure:**
- Risk: Checkout state including customer ID persists in localStorage unencrypted, could be read by injected scripts
- Files: `app/context/CheckoutContext.tsx` (lines 62-82)
- Current mitigation: None - standard localStorage
- Recommendations: Use sessionStorage for sensitive data only, implement CSP headers, consider encrypting localStorage data

## Performance Bottlenecks

**Full Data Refetch on Every State Change:**
- Problem: `fetchDrugs()`, `fetchTemplates()`, `fetchOrders()` re-fetch entire dataset even when only creating/updating one item
- Files: `hooks/useDrugs.ts` (line 43), `hooks/useTemplates.ts` (lines 78, 115, 148), `hooks/useOrders.ts` (line 60)
- Cause: Optimistic updates are partial; full refresh used as safety measure
- Impact: N+1 requests on bulk operations, slow UI on slow networks
- Improvement path: Implement proper optimistic updates that don't require full refetch. Use Supabase realtime subscriptions to sync state

**Inefficient Drug Group Hierarchies Traversal:**
- Problem: `getGroupIdsUnderParent()` likely traverses entire hierarchy on every filter change
- Files: `components/AddItemModal.tsx` (line 51), `components/DrugGroupFilter.tsx`
- Impact: Slow filtering on large hierarchies (1000+ groups)
- Improvement path: Memoize hierarchy calculations, use denormalized ancestor paths in database

**Image Upload Without Compression:**
- Problem: Direct file upload to Supabase without client-side compression
- Files: `lib/upload.ts` (line 12), `app/(dashboard)/drugs/page.tsx` (line 118)
- Impact: Large image files, slow uploads, high storage costs
- Improvement path: Add `sharp` or browser-based compression before upload, implement progressive images

**Order History Fetched on Every Customer Selection:**
- Problem: `app/checkout/page.tsx` (line 112) fetches full order history when customer selected
- Files: `app/checkout/page.tsx` (lines 107-127)
- Impact: Slow customer switching, large response for busy customers with 1000+ orders
- Improvement path: Paginate order history, use cursor-based pagination, fetch only last 5 orders (already limited at line 115 but endpoint returns all)

## Fragile Areas

**Template Price Distribution Logic:**
- Files: `app/api/orders/route.ts` (lines 139-196)
- Why fragile: Complex ratio-based distribution with rounding adjustments. Edge cases: all free drugs, floating-point precision errors, edge-case ratios
- Safe modification: Add comprehensive test suite for edge cases (zero prices, single item, many items, large price ranges)
- Test coverage: No visible unit tests for this logic. Lines 165-195 are complex but untested

**Checkout State Management with Multiple Modals:**
- Files: `app/checkout/page.tsx` (lines 23-608)
- Why fragile: 618 lines with 13+ useState calls managing overlapping modal states, item operations, price editing, reordering, customer selection
- Safe modification: Extract modal management to separate component, reduce state coupling, add integration tests
- Test coverage: No tests visible; manual testing only appears sufficient currently

**API Route Error Handling:**
- Files: `app/api/orders/route.ts` (lines 200-238)
- Why fragile: No transaction rollback if items insert fails after order created. Mixed error codes (23505 for duplicate phone in customers route but order route just returns generic 500)
- Safe modification: Implement error recovery, standardize error responses, add Sentry/error logging
- Test coverage: No visible test coverage for error paths

**Drug Import Price Management:**
- Files: `app/(dashboard)/drugs/page.tsx` (lines 46-49), `hooks/useDrugs.ts` (lines 77-107)
- Why fragile: Temp import prices state and final save separated, UI doesn't enforce unique supplier per drug, deletion not validated
- Safe modification: Add validation for duplicate suppliers, implement optimistic UI, add confirmation dialogs
- Test coverage: None visible

## Scaling Limits

**Single API Endpoint for Orders:**
- Current capacity: Assumes Supabase query performance, likely 1000+ orders/second
- Limit: Unbounded result set when using `in()` operator with large drug ID arrays (app/api/orders/route.ts line 127)
- Scaling path: Add pagination, implement cursor-based pagination, batch large queries, add database indexes on user_id + created_at

**LocalStorage Size Limits:**
- Current capacity: Typical browser limit 5-10MB
- Limit: Checkout state grows with items; large template with 100+ items could approach limits
- Scaling path: Move to sessionStorage or backend session management for large checkouts, implement cleanup on logout

**Image Storage Unbounded:**
- Current capacity: Supabase default storage limits vary
- Limit: No cleanup of old images, no compression, no deduplication
- Scaling path: Implement image cleanup jobs, add compression, deduplicate using hash, implement CDN caching

**No Rate Limiting:**
- Current capacity: Depends on Supabase tier
- Limit: No client-side or server-side rate limiting visible
- Scaling path: Implement Supabase rate limiting rules, add exponential backoff in hooks, use service-level rate limiting

## Dependencies at Risk

**Raw Supabase Client Usage:**
- Risk: Direct Supabase queries throughout codebase with minimal abstraction make client lib upgrade/changes high impact
- Impact: Breaking changes in future Supabase versions affect 20+ files
- Migration plan: Create data access layer (DAL) to abstract Supabase calls, consolidate in `lib/` directory, version lock supabase packages

**React Hot Toast for All Notifications:**
- Risk: Single point of failure for user feedback; no error boundary around toast provider
- Impact: If toast crashes, all user feedback breaks
- Migration plan: Implement custom notification system or add error boundary around Toaster

**Framer Motion Animations Tight Coupling:**
- Risk: Animation logic mixed with business logic in pages
- Impact: Hard to remove/modify animations, visual regression testing needed
- Migration plan: Extract animation configs to separate files, use composition pattern

## Missing Critical Features

**No Soft Delete for Drugs:**
- Problem: When drug is deleted, historical references break (order items show "Thuốc" placeholder)
- Blocks: Maintaining historical accuracy, audit trails
- Note: Migration file `migration_soft_delete.sql` exists but appears incomplete or not fully implemented

**No Inventory Management:**
- Problem: No tracking of drug stock levels, no low-stock alerts
- Blocks: Preventing overselling, stock forecasting, automated reordering

**No Order Status Workflow:**
- Problem: All orders hardcoded to `status: 'completed'` (app/api/orders/route.ts line 206)
- Blocks: Pending orders, refunds, order cancellation workflows

**No Refund/Return Handling:**
- Problem: No way to mark orders as partially refunded or returned
- Blocks: Customer service operations, financial reconciliation

**No Batch Operations:**
- Problem: Creating multiple customers/drugs requires individual API calls
- Blocks: Bulk import workflows, CSV data import

## Test Coverage Gaps

**No Unit Tests for Core Business Logic:**
- What's not tested: Order creation, price distribution, template flattening, drug group hierarchy, checkout calculations
- Files: `app/api/orders/route.ts`, `app/context/CheckoutContext.tsx`, `hooks/useDrugs.ts`, `hooks/useTemplates.ts`
- Risk: Regressions in critical features go undetected, refactoring is risky
- Priority: HIGH - These are revenue-impacting operations

**No Integration Tests for Checkout Flow:**
- What's not tested: Full checkout flow (select customer → add items → modify prices → save template → submit order)
- Files: `app/checkout/page.tsx`, `AddItemModal.tsx`, `SaveTemplateModal.tsx`
- Risk: Customer-facing flow breaks without detection
- Priority: HIGH

**No E2E Tests:**
- What's not tested: User workflows from login through checkout
- Risk: Deployment issues only caught by manual testing
- Priority: MEDIUM - QA reports exist but no automated E2E suite visible

**No Error Boundary Tests:**
- What's not tested: Component error recovery, graceful degradation
- Files: `components/ErrorBoundary.tsx`
- Risk: Error states untested, UI crashes possible
- Priority: MEDIUM

**No API Route Tests:**
- What's not tested: Input validation, error responses, RLS enforcement, edge cases
- Files: All `app/api/**/route.ts` files
- Risk: API vulnerabilities or breaking changes go undetected
- Priority: HIGH - Security-critical

---

*Concerns audit: 2026-02-19*
