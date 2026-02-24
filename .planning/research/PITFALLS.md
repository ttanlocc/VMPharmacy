# Domain Pitfalls

**Domain:** Pharmacy management app (Next.js + Supabase) — production hardening
**Researched:** 2026-02-19
**Confidence:** HIGH — all findings derived from direct codebase analysis (route.ts, hooks, schema, migrations, context)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or staff trust collapse.

---

### Pitfall 1: Orphaned Orders from Non-Atomic Creation

**What goes wrong:**
`app/api/orders/route.ts` creates an order record (line 201) and then inserts order items (line 228) as two separate Supabase calls. If the second call fails — network blip, RLS violation, constraint error on `order_items` — a real `orders` row exists with no items. The staff member sees an error toast, retries, and a second order may or may not succeed. The original ghost order is invisible to the UI but persists in the database, corrupting revenue reporting.

**Why it happens:**
Supabase JS client has no built-in multi-statement transaction API on the surface. The obvious fix — "insert order, check error, insert items" — looks correct but is not atomic. Developers unfamiliar with Supabase reach for `rpc()` with a stored procedure or Supabase's `BEGIN/COMMIT` via raw SQL, but both require schema changes and are non-obvious.

**Evidence in codebase:**
```typescript
// app/api/orders/route.ts line 233 — the comment is an admission
// "In a real app we might want to rollback the order here"
if (itemsError) {
    console.error("API POST /api/orders (create items) Error:", itemsError);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
}
```

**Consequences:**
- Orders with zero items accumulate in the database
- Revenue totals overcount (the ghost order's `total_price` is already committed)
- Staff get an error and retry, potentially creating a duplicate real order
- No way to detect or clean up orphans without a manual DB query

**Prevention:**
Move order + items creation into a single PostgreSQL function called via `supabase.rpc('create_order_atomic', {...})`. The function uses a transaction internally; if items insert fails, the order insert rolls back automatically. The API route becomes a thin wrapper that calls one RPC and handles one error path.

**Warning signs:**
- Any `orders` row where a subsequent `order_items` count query returns 0
- Staff reporting "I got an error but the order showed up in history later"
- The comment at line 233 is itself a warning sign — it was known and deferred

**Phase:** Atomic Order Creation (Phase 1 — must fix before any staff use)

---

### Pitfall 2: Soft Delete That Only Filters the List, Not the RLS Policy

**What goes wrong:**
`migration_soft_delete.sql` adds `deleted_at TIMESTAMPTZ` to `templates`. `useTemplates.ts` filters with `.is('deleted_at', null)` in client queries. But the RLS `SELECT` policy on `templates` (from `supabase_schema.sql` line 81) reads:

```sql
create policy "Users can view their own templates"
  on public.templates for select
  using (auth.uid() = user_id);
```

There is no `deleted_at IS NULL` condition in the RLS policy. This means:
1. A deleted template is invisible in the normal list (good)
2. But any query that bypasses the `.is('deleted_at', null)` client filter — direct Supabase query, a future hook written without the filter, the `AddItemModal` if it queries templates independently — will return soft-deleted templates
3. `order_items` can still reference a `drug_id` on drugs that have no soft delete at all (drugs are hard-deleted per `useDrugs.ts` line 72), causing the "Thuốc" placeholder bug

**Evidence in codebase:**
- `migration_soft_delete.sql` only adds the column to `templates`, not `drugs`
- `useDrugs.ts` `deleteDrug()` calls `.delete()` (hard delete), not a soft update
- RLS policies in `supabase_schema.sql` have no `deleted_at IS NULL` guard
- `useTemplates.ts` applies the filter client-side, but `CheckoutContext.tsx` `saveAsTemplate()` does not check for name conflicts with soft-deleted templates

**Consequences:**
- Hard-deleted drugs break all historical order_items that reference them — `oi.drugs` becomes null, UI falls back to "Thuốc" placeholder
- Soft-deleted templates may resurface in any new query path added during hardening
- If a drug is deleted that is referenced in a template_item, the template silently has a broken item — staff will apply the template and see one drug missing with no error

**Prevention:**
1. For drugs: change `deleteDrug()` to a soft-delete update (`deleted_at = now()`), not a hard `.delete()`. Update the `drugs` RLS `SELECT` policy to add `AND deleted_at IS NULL`.
2. For both tables: add `deleted_at IS NULL` to the RLS SELECT policy so it is enforced at the database layer, not just the client layer. Client filters become a secondary safety net, not the primary gate.
3. Add a `NOT NULL` FK constraint annotation note: `order_items.drug_id` references `drugs.id` — if drugs are hard-deleted, this FK either cascades (destroying history) or blocks deletion (silent failure). Both are wrong.

**Warning signs:**
- "Thuốc" placeholder appearing in order history — that is a hard-deleted drug surfacing
- A future hook that fetches templates without `.is('deleted_at', null)` — easy to miss in code review
- Templates visible in `AddItemModal` that the user believed were deleted

**Phase:** Soft Delete Implementation (Phase 1 — prerequisite for drug catalog cleanup)

---

### Pitfall 3: Refactoring a 618-Line Component by Extracting Without Isolating State

**What goes wrong:**
`app/checkout/page.tsx` has 13+ `useState` calls managing tightly coupled concerns: modal open/close flags (`isAddItemModalOpen`, `isSaveModalOpen`, `isCustomerPickerOpen`), transient UI state (`editingItemIndex`, `editPriceValue`), async flags (`isSubmitting`, `isSuccess`, `isLoadingHistory`), and cached remote data (`reorderHistory`, `activeTemplate`). The temptation during refactoring is to extract components — e.g., pull `PriceEditModal` out — while leaving `editingItemIndex` and `editPriceValue` state in the parent. This creates prop-drilling from parent → extracted component → handler callbacks, which looks cleaner but introduces a subtle regression: the parent still re-renders on every keystroke in the price input because `editPriceValue` state lives there.

The deeper trap: the `loadInitialState` useEffect (lines 59–104) has `customer` and `items.length` in its dependency array. Any refactoring that changes when `customer` or `items` references change (e.g., moving `setCustomer` into a child) will cause this effect to re-fire on every render where customer is set, re-fetching the customer from Supabase repeatedly.

**Evidence in codebase:**
```typescript
// app/checkout/page.tsx line 104 — fragile dependency array
}, [templateIdParam, customerIdParam, isGuestParam, customer, items.length]);
// "customer" here is an object reference from context — unstable across renders
// Adding it to deps means the effect re-runs whenever context re-renders
```

**Consequences:**
- Extracting price edit modal but keeping state in parent causes double renders during price editing
- Moving the history fetch `useEffect` into a sub-component causes it to fire on modal open/close cycles
- The `clearCheckout()` → `setCustomer(customer)` pattern in `handleReorder` (line 152–153) is a clear bug: clearing the checkout sets customer to null, then immediately re-setting it works only because both are synchronous state updates batched by React 18+; any async gap between them loses the customer

**Prevention:**
- Extract one concern at a time, with no behavior change per extraction
- Move `editingItemIndex` + `editPriceValue` into the extracted `PriceEditModal` as internal state — the parent only needs `onPriceChange(index, price)` callback
- Replace the `customer` object reference in the `loadInitialState` dependency array with `customer?.id` (a stable primitive) to prevent repeated re-fetches
- Keep `handleReorder` as a two-step: first capture the customer reference, then `clearCheckout()`, then restore with the captured reference — do not rely on closure over `customer` that may change mid-execution
- Test each extraction against the full checkout flow manually before moving to the next

**Warning signs:**
- Console logs showing `loadInitialState` running more than once after customer is selected
- Price editor input lagging or triggering unexpected re-renders
- Reorder function occasionally dropping the customer (test by reordering after navigating back)

**Phase:** Checkout Page Refactor (Phase 2 — after atomic fix is stable)

---

### Pitfall 4: Optimistic Updates That Diverge from Server State on Error

**What goes wrong:**
`useDrugs.ts` has partial optimistic updates: `addDrug()` appends to local state immediately, `updateDrug()` merges into local state, `deleteImportPrice()` filters local state. But these updates are applied *after* the server call succeeds (no rollback path). When a server call fails and throws, the hook throws but does not reset the local state — because the state was only mutated on success. This is correct for that hook.

The regression risk is in the *opposite direction*: when adding optimistic UI (applying the state change before the server call, rolling back on error), developers commonly forget to snapshot the previous state before mutation. Without a snapshot, the rollback has nothing to restore.

**Concrete risk in this codebase:**
`useOrders.ts` `createOrder()` currently does a full `fetchOrders()` after success (line 50). If this is changed to an optimistic "append new order to list" pattern, the optimistic item must be built client-side — but the server response (line 48, `newOrder`) only contains the `orders` row without the nested `order_items` and `customers` join that `Order` type requires. Appending the partial `newOrder` will cause TypeScript errors or runtime crashes when the order history list tries to render `order.order_items.map(...)`.

**Evidence in codebase:**
```typescript
// useOrders.ts — the Order type requires nested relations
export type Order = Database['...']['orders']['Row'] & {
    order_items: (... & { drugs: { name, unit, image_url } | null })[];
};
// But createOrder returns only the bare orders row — no order_items
const newOrder = await response.json(); // Missing: customers, order_items
await fetchOrders(); // Full refetch is the safe path; optimistic is risky here
```

**Consequences:**
- Optimistic update with the bare `order` object causes `order.order_items` to be undefined
- `order.order_items.map(...)` crashes in `CheckoutLineItem` or `OrderHistory`
- Staff see a success toast but then a broken order history, requiring a page refresh to recover
- The optimistic order item lingers in state until the refetch completes, showing stale data in the UI

**Prevention:**
- For `useOrders`: keep full refetch on create — it is safe and correct. The perceived slowness is a pagination problem (too many orders fetched), not an optimistic update problem. Fix the root cause: add `limit(50)` to the GET endpoint.
- For `useDrugs` and `useTemplates`: the current pattern (update after success, full refresh on add) is acceptable for the current scale. Only move to optimistic updates if the refetch latency becomes measurable (>300ms on fast connection).
- If optimistic updates are added: always snapshot `const previous = [...state]` before mutation, and restore in the catch block.

**Warning signs:**
- `cannot read properties of undefined (reading 'map')` errors in order history after checkout
- Order history shows an item without drugs listed
- Staff reporting "I see the success message but the history looks wrong"

**Phase:** Hook Refactor / Performance (Phase 2 — do not conflate with atomic fix in Phase 1)

---

### Pitfall 5: Checkout Flow Errors That Are Silent to Non-Technical Staff

**What goes wrong:**
The checkout flow has multiple error paths that either log to console only, show a generic toast, or swallow the error entirely. Non-technical pharmacy staff cannot open DevTools. Their only signal is a button that stops spinning. They will tap the button again. Double-tapping the checkout button while `isSubmitting` is true is blocked by the `disabled` prop — but only if React has processed the first click and set `isSubmitting` before the second tap fires.

On slow mobile connections (which a PWA in a pharmacy may encounter), the button disabling may lag behind the tap. The result: two simultaneous POST `/api/orders` calls. Both may succeed, creating two identical orders.

**Evidence in codebase:**
```typescript
// app/checkout/page.tsx lines 195–241
setIsSubmitting(true);
try {
    // ...
    await createOrder(validItems, total, customer?.id, primaryTemplateId);
    setIsSuccess(true);
    clearCheckout();
    // ...
} catch (error) {
    console.error(error);
    toast.error('Có lỗi xảy ra khi tạo đơn hàng'); // Generic, untranslated for the real error
} finally {
    setIsSubmitting(false);
}
```

The error toast "Có lỗi xảy ra khi tạo đơn hàng" is the same for all failures: network error, RLS violation, invalid drug ID, orphaned order recovery. Staff have no way to know if they should retry, wait, or call for help.

**Also:**
- `handleReorder` (line 130) uses a loading toast, but if `clearCheckout()` runs and then `addItems` fails, the cart is now empty with no items added. The error toast says "Không thể tải đơn" but the cart is already cleared — data is lost.
- Customer history fetch (line 108–127) silently fails with only a `console.error`. Staff see the reorder section disappear if it was loading and then fails — no indication of what happened.

**Consequences:**
- Double-submitted orders creating duplicate sales records
- Staff retry loops: "it didn't work, I'll try again" → multiple orders
- Staff unable to distinguish "network was slow, order went through" from "order failed, try again"
- Cart data loss on failed reorder (clearCheckout called before addItems succeeds)

**Prevention:**
1. Add an idempotency key to POST `/api/orders`: generate a UUID client-side, send in the request body, use a `UNIQUE` constraint on `orders(idempotency_key)`. Duplicate submits return a 409 with the existing order — no ghost orders, no duplicates.
2. Show specific, actionable error messages differentiated by failure type. "Mất kết nối — đơn chưa được lưu, thử lại" is more useful than the current generic message.
3. Fix `handleReorder`: capture the customer reference, snapshot the current items, call `clearCheckout()`, then call `addItems()` — if `addItems` fails, restore snapshot via `addItems(snapshotItems)` and restore customer.
4. Show a persistent error state (not just a 3-second toast) when checkout submission fails, so staff know not to navigate away.

**Warning signs:**
- Duplicate orders in history with same customer, same drugs, seconds apart
- Staff reporting "I pressed it twice because nothing happened"
- Error toast appearing but staff asking "did it go through?"

**Phase:** Error Hardening (Phase 1, alongside atomic fix — silent errors and double-submit are production blockers)

---

## Moderate Pitfalls

---

### Pitfall 6: The localStorage Race Between Tabs Corrupts Cart State

**What goes wrong:**
`CheckoutContext.tsx` saves to `localStorage` on every state change (line 76–82). On every mount, it loads from `localStorage` (line 60–73). If two browser tabs are open (e.g., a staff member accidentally opens the PWA twice on mobile), both tabs share the same `vmp_checkout_state` key. Tab A adds a drug → writes to localStorage. Tab B was already loaded → its in-memory state is stale. Tab B user modifies quantity → overwrites Tab A's addition. The last writer wins and Tab A's drug is silently lost.

**Evidence in codebase:**
```typescript
// CheckoutContext.tsx line 78 — no version, no merge, no conflict detection
localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customer }));
```

**Prevention:**
This is acceptable for the current launch scope IF communicated as a usage constraint. The practical fix for pharmacy staff is: only one tab at a time. For a more robust fix, use `storage` event listeners to detect cross-tab writes and show a "Another tab changed your cart — reload?" warning. Do not attempt a full merge strategy; it is complex and error-prone.

**Warning signs:**
- Staff reporting "items disappear from the cart"
- Hard to reproduce — only happens with multiple tabs open

**Phase:** Post-launch improvement. Document as known limitation for v1.

---

### Pitfall 7: Template Flattening Produces Fractional Drug Quantities

**What goes wrong:**
`CheckoutContext.tsx` `saveAsTemplate()` flattens template items by multiplying `sub.quantity * item.quantity`. When a template contains quantity 1 of Drug A and the user adds the template with quantity 3, the flat result is Drug A qty 3. This is correct. But the `handleCheckout` flattening in `checkout/page.tsx` (line 197–211) does the same calculation client-side before sending to the API. The API route then applies the template price distribution on top. If a template has items with quantities that don't distribute evenly into the manual price, the `newUnitPrice = lineTotal / item.quantity` calculation on line 189 produces a floating-point unit price (e.g., 33333.333...).

This unit price is stored directly in `order_items.unit_price`. PostgreSQL stores it as `numeric` with full precision. The issue is presentation — `formatCurrency` will show "33,333.33 VNĐ" rather than a round number — and the rounding adjustment only fixes the last item's total, not intermediate items.

**Evidence in codebase:**
```typescript
// app/api/orders/route.ts line 189
const newUnitPrice = lineTotal / item.quantity;
// No rounding here — stored as floating point
```

**Prevention:**
Round `newUnitPrice` to the nearest whole number: `Math.round(lineTotal / item.quantity)`. Verify the total still reconciles. Add a test case: 3-item template, total price 100,000 VNĐ, quantities 1/1/1. Expected: prices 33,333 + 33,333 + 33,334 = 100,000.

**Warning signs:**
- Order history shows prices like "33,333.33" instead of round numbers
- Staff notice the displayed total doesn't match the sum of items

**Phase:** Template Pricing Fix (Phase 1 — impacts every template-based sale)

---

### Pitfall 8: RLS on order_items Checks the Parent Order's user_id, Not the Drug's Visibility

**What goes wrong:**
The `order_items` SELECT policy (schema line 105–107) checks `exists (select 1 from orders where id = order_items.order_id and user_id = auth.uid())`. This is correct for access control. But when drugs are hard-deleted, `order_items.drug_id` still points to the deleted drug. Since the FK in the schema (`drug_id uuid references public.drugs(id) not null`) has no `ON DELETE` action specified (defaults to RESTRICT), attempting to hard-delete a drug that is referenced in any `order_items` will fail with a FK violation error.

The current `deleteDrug()` in `useDrugs.ts` does not catch this specific error or show a meaningful message to the user.

**Evidence in codebase:**
```typescript
// useDrugs.ts line 71–74
const deleteDrug = async (id: string) => {
    const { error } = await supabase.from('drugs').delete().eq('id', id);
    if (error) throw error; // FK violation thrown here, no specific message
    setDrugs(drugs.filter(d => d.id !== id));
};
```

**Consequences:**
- Attempt to delete a drug that has been sold → silent failure from the UI perspective (generic error)
- If FK is set to CASCADE (a "fix" someone might apply): all historical order_items referencing that drug are deleted, destroying sales history
- If FK is set to SET NULL: drug_id becomes null, breaking the `order_items` schema (`not null` constraint would reject this)

**Prevention:**
Switch to soft delete for drugs (set `deleted_at`). This sidesteps the FK problem entirely — the drug row remains, FK integrity is preserved, and historical orders display correctly. The soft-delete RLS filter hides it from the active drug catalog.

**Warning signs:**
- Staff attempt to delete an old drug and see a generic error with no explanation
- Any attempt to handle this with `ON DELETE CASCADE` — that destroys history

**Phase:** Soft Delete Implementation (Phase 1 — part of the same migration as templates)

---

## Minor Pitfalls

---

### Pitfall 9: useEffect Dependency Arrays with Object References Cause Infinite Loops

**What goes wrong:**
`checkout/page.tsx` line 104 includes `customer` (a full object from context) in the `loadInitialState` useEffect dependency array. React compares dependencies by reference. Every time `CheckoutContext` re-renders (e.g., any state change in the context), it creates a new `customer` object reference even if the customer data is identical. This causes `loadInitialState` to re-fire, which fetches the customer from Supabase again, which sets state, which triggers a re-render, which may loop.

**Prevention:**
Replace `customer` in the dependency array with `customer?.id`. A string UUID is a stable primitive that React can compare by value.

**Warning signs:**
- Network tab shows repeated GET requests to Supabase's `customers` table while on the checkout page
- Checkout page feels sluggish or has a loading flash when interacting with items

**Phase:** Checkout Refactor (Phase 2)

---

### Pitfall 10: saveAsTemplate in Context Uses the Browser-Side Supabase Client Without user_id

**What goes wrong:**
`CheckoutContext.tsx` `saveAsTemplate()` (line 132–185) inserts directly into `templates` using the browser-side `supabase` client. The `templates` table RLS INSERT policy checks `auth.uid() = user_id`. But the insert payload (line 137–143) does not include `user_id` — it is expected to be injected by the client-side auth context automatically. This works when the user is logged in. However, if the session expires mid-checkout (Supabase sessions expire after 1 hour by default), the insert will fail with an RLS violation, not an authentication error, because the anon key can still connect but `auth.uid()` returns null.

**Prevention:**
Before the insert, call `const { data: { user } } = await supabase.auth.getUser()` and include `user_id: user?.id` explicitly in the insert payload. If `user` is null, redirect to login before attempting the save.

**Warning signs:**
- Staff report "Lưu mẫu thất bại" (save template failed) after the app has been open for a long time
- The error surfaces as a generic template save failure, not a session expiry message

**Phase:** Auth Hardening (Phase 2 — not blocking for launch, but will cause confusion for long sessions)

---

### Pitfall 11: The "Success Then Clear" Pattern Loses Cart on Network Timeout

**What goes wrong:**
In `handleCheckout` (page.tsx line 231–235):

```typescript
await createOrder(validItems, total, customer?.id, primaryTemplateId);
setIsSuccess(true);
clearCheckout();
```

If `createOrder` times out (the fetch hangs for >30s), it will eventually throw. The `catch` block will fire, `setIsSuccess` will not be called, and `clearCheckout` will not be called — cart is preserved. This is correct behavior. But if the network timeout is long and the server actually processed the request, the staff member will see an error, retry, and create a duplicate order. The cart is still full (correct) but the order was already created (problem).

This is a variant of Pitfall 5 (silent errors), but from the server-side timeout angle.

**Prevention:**
Idempotency key (as recommended in Pitfall 5) is the correct solution. Do not add a client-side timeout to clear the cart — that would worsen the problem.

**Warning signs:**
- Orders created successfully but staff getting error toasts on slow connections

**Phase:** Error Hardening (Phase 1, same as Pitfall 5)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Atomic order creation via Supabase RPC | RPC function must handle FK validation and return the full order shape the client expects, not just the orders row | Define return type of the stored procedure explicitly; test the response shape before updating useOrders |
| Soft delete for drugs | Hard deleting drugs with existing order_items will throw FK violation, not a soft error | Implement soft delete first; add migration to set `deleted_at` column; update RLS to filter on `deleted_at IS NULL` |
| Soft delete RLS policies | Adding `deleted_at IS NULL` to existing policies requires `ALTER POLICY` or `DROP + CREATE` — cannot use Supabase dashboard policy editor for complex conditions | Write and test SQL directly in Supabase SQL editor; verify with `.is('deleted_at', null)` in a test query |
| Checkout page refactor | Moving state down into child components without isolating the `loadInitialState` effect will cause it to re-fire | Stabilize `customer?.id` in deps before any structural refactor |
| Optimistic updates in hooks | Replacing `fetchOrders()` call after create with an optimistic append requires building a complete `Order` type object client-side, including nested `order_items` and `customers` | Do not add optimistic updates to `useOrders`; fix pagination instead |
| Error message hardening | Translating API error codes into Vietnamese staff-friendly messages requires knowing which errors map to which codes (Supabase uses PostgreSQL error codes: 23503 = FK violation, 23505 = unique violation) | Map known codes explicitly; fall back to a generic "contact admin" message for unmapped codes |
| Checkout double-submit prevention | `disabled` prop on a button does not prevent rapid double-tap on mobile if React hasn't committed the state update yet | Add idempotency key on the request, not just a UI disabled flag |
| Template item flattening edge cases | Template with qty=2 containing Drug A(1) and Drug B(1) should produce A(2) B(2) — verify the client-side flatten in `handleCheckout` and the API-side price distribution agree on final quantities | Add a manual test case: template qty=2, 3 drugs, verify total = 2x template price |

---

## Sources

All findings are HIGH confidence, derived directly from:
- `app/api/orders/route.ts` — order creation logic, line 200–238 (orphaned order pattern confirmed by comment at line 233)
- `app/context/CheckoutContext.tsx` — localStorage race, saveAsTemplate RLS gap, clearCheckout ordering
- `app/checkout/page.tsx` — 618 lines, 13+ useState, double-submit risk, handleReorder cart-clear bug
- `hooks/useDrugs.ts` — hard delete FK collision, optimistic update pattern
- `hooks/useOrders.ts` — full refetch pattern, Order type shape mismatch for optimistic updates
- `hooks/useTemplates.ts` — soft delete implementation (templates only, not drugs)
- `supabase_schema.sql` — RLS policies without `deleted_at IS NULL`, FK constraints
- `migration_soft_delete.sql` — incomplete: only adds column to `templates`, not `drugs`
- `.planning/codebase/CONCERNS.md` — corroborating analysis for all major areas

No web search was available during research. Confidence in pitfall descriptions is HIGH because they are derived from reading the live production code, not general advice.
