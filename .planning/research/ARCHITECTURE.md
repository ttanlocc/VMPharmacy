# Architecture Patterns

**Domain:** Pharmacy POS — Next.js 16 + Supabase hardening
**Researched:** 2026-02-19
**Confidence:** HIGH (all findings based on direct source-code inspection)

---

## Current Architecture Map

The app is a single-user pharmacy POS with the following boundaries:

```
Browser (React 19)
  ├── CheckoutContext (localStorage-persisted cart state)
  ├── Page components (app/checkout/page.tsx — 618 lines)
  ├── Hooks (useOrders, useDrugs, useTemplates, useCustomers, useHistory, useDrugGroups)
  └── Direct Supabase calls (client-side, from hooks and CheckoutContext)

Next.js API Routes (Edge-adjacent server functions)
  ├── /api/orders    — GET + POST (order + order_items, two separate inserts)
  ├── /api/drugs     — GET + POST (no auth check on GET)
  ├── /api/customers — GET + POST + PUT
  ├── /api/templates — GET + POST (template + template_items, two separate inserts)
  └── /api/drug-groups — GET + POST + PATCH + DELETE

Supabase (PostgreSQL + Auth)
  ├── Tables: orders, order_items, drugs, drug_groups, drug_import_prices
  ├── Tables: templates, template_items, customers, ingredients
  └── Auth: cookie-based via @supabase/ssr
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `CheckoutContext` | Cart state, localStorage persistence, saveAsTemplate | Supabase client directly, any consumer |
| `app/checkout/page.tsx` | UI orchestration, 13 useState hooks, order submission | CheckoutContext, useOrders, Supabase client |
| `useOrders` | Fetch order list + createOrder (triggers refetch) | `/api/orders` |
| `useDrugs` | Drug CRUD + import prices, partial optimistic updates | Supabase client directly |
| `useCustomers` | Customer search/create/update, partial optimistic | `/api/customers` |
| `useTemplates` | Template CRUD, full refetch after every mutation | Supabase client directly |
| `useHistory` | Filtered order history with debounced search | `/api/orders` |
| `/api/orders POST` | Order creation: drug validation + two sequential inserts | Supabase server client |
| `/api/templates POST` | Template creation: two sequential inserts | Supabase server client |

### Data Flow Direction

```
User Action
  → CheckoutContext (local state mutation)
  → handleCheckout() in page.tsx
  → useOrders.createOrder()
  → POST /api/orders
    → supabase.from('orders').insert()   [insert 1]
    → supabase.from('order_items').insert() [insert 2 — NOT atomic]
  → useOrders.fetchOrders() [full list refetch]
  → clearCheckout() + router.push('/')
```

---

## Gap 1: Non-Atomic Order Creation

### Current State

`app/api/orders/route.ts` lines 200–236 perform two sequential inserts with no transaction:

```
1. supabase.from('orders').insert([...]).select().single()  → order record created
2. supabase.from('order_items').insert(orderItems)          → items appended
```

If step 2 fails, step 1 has already committed. The comment at line 234 acknowledges this:
`// In a real app we might want to rollback the order here`.

The same pattern exists in `app/api/templates/route.ts` (lines 37–69) and
`app/context/CheckoutContext.tsx` `saveAsTemplate` function (lines 135–177).

### Recommended Approach: Supabase RPC (PostgreSQL stored procedure)

Use a PostgreSQL function invoked via `supabase.rpc()`. This is the correct approach for this stack for the following reasons:

- Supabase's client and server SDKs do not expose BEGIN/COMMIT/ROLLBACK directly. There is no "transaction wrapper" in the JS client.
- The Supabase REST API (PostgREST) wraps each RPC call in a single database transaction automatically. All-or-nothing semantics are guaranteed by PostgreSQL.
- The API route stays thin: it validates inputs, calls `supabase.rpc('create_order', {...})`, and returns.
- No application-level rollback code is needed, which eliminates an entire class of bugs.
- The stored procedure runs server-side in the database, not in Node.js, so it avoids the network round-trip between the two inserts.

**SQL function to create (in Supabase SQL editor or migration):**

```sql
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_total_price NUMERIC,
  p_customer_id UUID DEFAULT NULL,
  p_template_id UUID DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders;
BEGIN
  INSERT INTO orders (user_id, total_price, status, customer_id, template_id)
  VALUES (p_user_id, p_total_price, 'completed', p_customer_id, p_template_id)
  RETURNING * INTO v_order;

  INSERT INTO order_items (order_id, drug_id, quantity, unit_price, note)
  SELECT
    v_order.id,
    (item->>'drug_id')::UUID,
    (item->>'quantity')::INTEGER,
    (item->>'unit_price')::NUMERIC,
    item->>'note'
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_order;
END;
$$;
```

**API route call becomes:**

```typescript
const { data: order, error } = await supabase.rpc('create_order', {
  p_user_id: user.id,
  p_total_price: finalTotalPrice,
  p_customer_id: customer_id || null,
  p_template_id: template_id || null,
  p_items: finalItems
});
```

The same RPC pattern should be applied to `templates` creation (`create_template` function) to remove the second non-atomic pair in `app/api/templates/route.ts`.

**What NOT to do:**
- Do not attempt manual rollback in application code (call `orders.delete()` on failure). Race conditions and network errors make this unreliable.
- Do not restructure CheckoutContext.saveAsTemplate to also go through the API route just yet — fix the API route first, then migrate CheckoutContext to use the API endpoint rather than the Supabase client directly.

---

## Gap 2: Checkout Page Refactor (618 lines, 13+ useState hooks)

### Current State

`app/checkout/page.tsx` (`CheckoutContent` component) contains:

| useState | Purpose |
|---|---|
| `isAddItemModalOpen` | Controls AddItemModal visibility |
| `addItemInitialTab` | Tab selection inside AddItemModal |
| `isSaveModalOpen` | Controls SaveTemplateModal visibility |
| `isSuccess` | Post-checkout success screen |
| `isSubmitting` | Button loading state |
| `isCustomerPickerOpen` | Controls CustomerPicker modal |
| `activeTemplate` | Tracks active template metadata |
| `isReorderOpen` | Quick reorder accordion state |
| `reorderHistory` | Last 5 orders for returning customer |
| `isLoadingHistory` | Loading state for history fetch |
| `editingItemIndex` | Price edit modal target |
| `editPriceValue` | Price edit modal input value |

The component also handles: URL param parsing, customer loading side effects, order history fetching, quick reorder logic, price editing logic, checkout submission, template save delegation, and all modal orchestration.

### Recommended Approach: Extract Custom Hooks + UI Decomposition

**Do NOT rewrite the JSX structure.** The visual layout is working. The risk is in the logic layer.

Extract behavior into focused hooks first, then validate each hook in isolation before touching the JSX.

#### Step 1: Extract `useCheckoutModals` hook

Groups all boolean modal states with no side effects. Zero regression risk.

```typescript
// hooks/useCheckoutModals.ts
function useCheckoutModals() {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [addItemInitialTab, setAddItemInitialTab] = useState<'drug' | 'template'>('drug');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');

  const openDrugPicker = () => { setAddItemInitialTab('drug'); setIsAddItemModalOpen(true); };
  const openTemplatePicker = () => { setAddItemInitialTab('template'); setIsAddItemModalOpen(true); };
  const openPriceEditor = (index: number, currentPrice: number) => {
    setEditingItemIndex(index);
    setEditPriceValue(currentPrice.toString());
  };

  return {
    isAddItemModalOpen, setIsAddItemModalOpen, addItemInitialTab,
    isSaveModalOpen, setIsSaveModalOpen,
    isCustomerPickerOpen, setIsCustomerPickerOpen,
    editingItemIndex, setEditingItemIndex,
    editPriceValue, setEditPriceValue,
    openDrugPicker, openTemplatePicker, openPriceEditor
  };
}
```

#### Step 2: Extract `useQuickReorder` hook

Encapsulates reorderHistory, isLoadingHistory, isReorderOpen, and handleReorder logic.
The `useEffect` for history fetching moves here. Reduces page.tsx by ~50 lines.

```typescript
// hooks/useQuickReorder.ts
function useQuickReorder(customerId: string | undefined, addItems: ..., clearCheckout: ...) {
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [reorderHistory, setReorderHistory] = useState<Order[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  // ... fetch effect and handleReorder live here
  return { isReorderOpen, setIsReorderOpen, reorderHistory, isLoadingHistory, handleReorder };
}
```

#### Step 3: Extract `useCheckoutSubmit` hook

Encapsulates isSubmitting, isSuccess, and the entire handleCheckout function.

```typescript
// hooks/useCheckoutSubmit.ts
function useCheckoutSubmit(items: CheckoutItem[], customer: Customer | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { createOrder } = useOrders();

  const handleCheckout = async () => { ... };
  return { isSubmitting, isSuccess, handleCheckout };
}
```

#### Step 4: Move activeTemplate state into CheckoutContext

`activeTemplate` tracks metadata about a loaded template. It belongs with cart state, not with page-level UI state. Adding it to `CheckoutContext` alongside `items` and `customer` makes it accessible without prop drilling.

**Refactor sequence: hooks first, JSX last.** Each extracted hook can be tested independently by grepping for the state variable names it consumed. Only after all hooks are extracted should the JSX imports be updated in `page.tsx`.

**What NOT to touch during this refactor:**
- `CheckoutContext` internals (except adding `activeTemplate`)
- The localStorage persistence logic
- The `clearCheckout` / `router.push` flow at the end of `handleCheckout`
- The `Suspense` + `CheckoutContent` split at the bottom — this is required for `useSearchParams`

---

## Gap 3: Full-Refetch Pattern in Data Hooks

### Current State

| Hook | Mutation Behavior |
|------|------------------|
| `useOrders` | `createOrder()` calls `fetchOrders()` after success — full list refetch |
| `useTemplates` | `addTemplate()`, `updateTemplate()` both call `fetchTemplates()` after success |
| `useDrugs` | `addDrug()` appends to state without refetch; `updateDrug()` patches in-place |
| `useCustomers` | `createCustomer()` prepends new record; `updateCustomer()` patches in-place |
| `useDrugGroups` | All mutations do local state updates (no refetch) |

`useDrugs` and `useCustomers` already demonstrate the correct pattern. The problem is isolated to `useOrders` and `useTemplates`.

### Recommended Approach: Append/Patch Without Refetch

**`useOrders.createOrder`**: After a successful POST, the server returns the new order record. Prepend it to the orders list. Do not call `fetchOrders()`.

```typescript
const newOrder = await response.json();
// The server returns the order row; order_items are not included in this response.
// For the history list, prepend a synthetic record:
setOrders(prev => [newOrder, ...prev]);
return newOrder;
```

The caveat: the API currently returns only the order row (not with joined order_items). If the orders list requires items for display, either:
a) Update the POST handler to return a full order with items using `.select('*, order_items(*)')` after the RPC call, or
b) Accept that the new item shows in the list with no order_items until the next natural refresh.

Option (a) is preferred and requires only changing the RPC return or adding a SELECT after the RPC call in the API route.

**`useTemplates.addTemplate` and `updateTemplate`**: Both call `fetchTemplates()` after mutation. Replace with local state patch:

```typescript
// addTemplate: after successful insert
const fullTemplate = { ...template, items: insertedItems };
setTemplates(prev => [fullTemplate, ...prev]);

// updateTemplate: after successful update
setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates, items: newItems } : t));
```

**Priority order**: Fix `useOrders` first (it's on the critical path — every checkout triggers it). `useTemplates` is used less frequently and has lower blast radius.

**What NOT to touch**: `useHistory`'s debounced search/filter pattern is correct for its use case (the full list is always filtered by params, so optimistic updates make no sense there).

---

## Gap 4: Error Handling Standardization

### Current State

Error handling is inconsistent across routes:

| Route | Pattern |
|-------|---------|
| `GET /api/orders` | `console.error` + `NextResponse.json({ error })` — consistent |
| `POST /api/orders` | Two error branches with manual `console.error` each |
| `GET /api/drugs` | Returns `{ error: error.message }` with 500, no logging |
| `GET /api/customers` | Returns `{ error }` with 500, no logging |
| `POST /api/customers` | Handles `23505` unique constraint — only route with typed error codes |
| `GET /api/templates` | Returns `{ error: error.message }` with 500, no logging |
| `/api/drug-groups` | Not yet read — likely similar pattern |

Client hooks also handle errors inconsistently:
- `useOrders.createOrder`: reads `errorData.error` from response JSON, re-throws
- `useHistory.fetchOrders`: reads `data.error` from response JSON, shows toast, does NOT re-throw
- `useDrugGroups.createGroup`: shows toast inline within the hook (mixed concern)
- `useTemplates`: throws from mutations, caller must handle

### Recommended Approach: Shared Error Response Utility + Typed Error Codes

**Step 1: Create `lib/api-error.ts`**

```typescript
// lib/api-error.ts
import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export function apiError(
  message: string,
  status: number,
  code?: ApiErrorCode
): NextResponse {
  return NextResponse.json({ error: message, code }, { status });
}

export function unauthorized() {
  return apiError('Unauthorized', 401, 'UNAUTHORIZED');
}

export function internalError(err: unknown, context?: string): NextResponse {
  const message = err instanceof Error ? err.message : 'Internal server error';
  if (context) console.error(`[${context}]`, err);
  return apiError(message, 500, 'INTERNAL_ERROR');
}
```

**Step 2: Replace per-route error returns with utility calls**

Before: `return NextResponse.json({ error: error.message }, { status: 500 });`
After: `return internalError(error, 'POST /api/orders');`

**Step 3: Standardize auth check**

Every authenticated route currently duplicates the auth check pattern. Extract:

```typescript
// lib/require-auth.ts
export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, response: unauthorized() };
  return { user, response: null };
}
```

**Rollout strategy**: Apply to one route at a time. Start with `/api/orders` (most complex). Validate the full checkout flow before moving to other routes. `/api/drugs` is lowest risk (no auth on GET currently, which is a separate issue).

**Do NOT change client-side error handling in this pass.** Hooks already show toast on error. Standardizing server responses makes client parsing simpler in a future pass.

---

## Gap 5: Soft Delete Implementation

### Current State

`templates` table already has a `deleted_at TIMESTAMP NULL` column (confirmed in `types/database.ts` line 89). `useTemplates.fetchTemplates` already filters: `.is('deleted_at', null)` (line 32 of `hooks/useTemplates.ts`). `deleteTemplate` sets `deleted_at` to current ISO timestamp (lines 83–90).

The soft delete pattern is **already implemented for templates and working correctly**.

The `drugs` table has NO `deleted_at` column in the current schema. `useDrugs.deleteDrug` does a hard delete: `supabase.from('drugs').delete().eq('id', id)`.

### Recommended Approach: Add Soft Delete to Drugs Table Only

**Why drugs need soft delete:** Order history stores `drug_id` as a foreign key in `order_items`. Hard deleting a drug that appears in historical orders creates orphaned references (or would fail if there is a FK constraint). The checkout page already guards against this with the "invalid item" warning at lines 213–225 of `page.tsx`, but this is treating the symptom.

**Migration required (add column):**

```sql
ALTER TABLE drugs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
CREATE INDEX IF NOT EXISTS drugs_deleted_at_idx ON drugs (deleted_at) WHERE deleted_at IS NULL;
```

**Existing queries that must be updated after migration:**

1. `hooks/useDrugs.ts` `fetchDrugs()`: add `.is('deleted_at', null)` to the query
2. `app/api/drugs/route.ts` `GET`: add `.is('deleted_at', null)` to the query
3. `app/api/orders/route.ts` drug validation (lines 124–130): the `.in('id', drugIds)` check also needs `.is('deleted_at', null)` so soft-deleted drugs are treated as invalid

**Do NOT add soft delete to `order_items` or `orders`.** Orders are financial records. Hard deletes of orders should never be possible from the UI. Soft delete on orders is out of scope for hardening.

**Do NOT add soft delete to `customers`.** Customers have a unique constraint on phone. If you soft-delete and allow re-creation, you'll hit the constraint. This needs a separate design decision.

**Existing queries NOT affected by the drugs migration:**

- `useTemplates.fetchTemplates` — already filters `deleted_at IS NULL` on templates, independent
- `useCustomers` — no `deleted_at` column, no change needed
- `useOrders` / `useHistory` — these JOIN `drugs` for display only; soft-deleted drug names will still be visible in historical orders through the snapshot stored in `order_items.unit_price` (name is fetched via JOIN from `drugs`). To handle this edge case, the display layer should show `oi.drugs?.name || 'Đã xóa'` — this is already partially done in `handleReorder` at line 141 of `page.tsx`: `oi.drugs?.name || 'Thuốc'`.

---

## Recommended Fix Order (Dependencies)

This is the order that minimizes regression risk. Each fix is independent except where noted.

```
Phase A — Database & API (no UI changes, low regression risk)
  A1. Add create_order() stored procedure (RPC) → most critical, unblocks all else
  A2. Add create_template() stored procedure (RPC) → same pattern, do together
  A3. Add deleted_at column to drugs table (migration)
  A4. Add lib/api-error.ts utility
  A5. Apply api-error.ts to /api/orders route (first route, validate fully)
  A6. Apply api-error.ts to remaining routes

Phase B — Hook Fixes (no UI changes, medium regression risk)
  B1. Update useDrugs.fetchDrugs to filter deleted_at IS NULL  [depends on A3]
  B2. Update useOrders.createOrder to append instead of refetch [depends on A1]
  B3. Update useTemplates to append/patch instead of refetch    [depends on A2]

Phase C — Checkout Page Decomposition (UI changes, highest regression risk — do last)
  C1. Extract useCheckoutModals hook
  C2. Extract useQuickReorder hook
  C3. Extract useCheckoutSubmit hook
  C4. Move activeTemplate to CheckoutContext
  C5. Update page.tsx to use extracted hooks
```

**Why this order:**
- A1/A2 fix the data integrity problem without touching the UI at all. If something breaks, the blast radius is limited to the API route.
- A3 requires a DB migration before any code change — migrations are irreversible, do them first.
- B-phase changes are isolated to hooks that are tested via the UI flows that use them.
- C-phase is purely a refactor with no behavior change. Do it last because it has the most surface area for introducing bugs.

---

## What NOT to Touch

These areas are working correctly and should be left alone during hardening:

| Area | Reason to Leave Alone |
|------|----------------------|
| `CheckoutContext` localStorage persistence | Complex logic, working correctly, not causing bugs |
| `useCheckout` hook structure | Consumers depend on its exact API shape |
| `Suspense` + `CheckoutContent` split | Required for `useSearchParams` in App Router |
| `useHistory` debounced filter pattern | Correct for its use case; optimistic updates don't apply |
| `useCustomers` optimistic updates | Already implemented correctly |
| `useDrugGroups` local state updates | Already implemented correctly |
| Customer unique constraint handling in `/api/customers` | Correctly returns 409 for `23505` error code |
| Template `deleted_at` soft delete | Already implemented and working |
| Auth cookie handling in `lib/supabase-server.ts` | Correct `@supabase/ssr` pattern |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Application-Level Transaction Rollback

**What:** Attempting to compensate for failed `order_items` insert by calling `orders.delete()` in the catch block.
**Why bad:** Network failures between the delete attempt and the original insert mean the compensation can also fail. You end up with more orphaned data, not less. The code also cannot distinguish "insert failed before commit" from "insert failed after commit."
**Instead:** Use the Supabase RPC / PostgreSQL transaction approach described in Gap 1.

### Anti-Pattern 2: Using `useEffect` with Mutable Dependency Arrays in Page Components

**What:** The `loadInitialState` useEffect in `page.tsx` (lines 59–104) includes `customer` and `items.length` in its dependency array. `customer` is an object from context, so its reference changes on every render if not memoized.
**Why bad:** This can cause the effect to re-run in a loop if setCustomer is called inside the effect (which it is on line 95). The current code avoids the loop only by accident (the `isGuestParam` condition rarely triggers).
**Instead:** When extracting the checkout page hooks, split URL-param effects (run once on mount with `[]`) from reactive effects (run when specific primitive values change).

### Anti-Pattern 3: Mixing Toast Calls Into Hooks

**What:** `useDrugGroups` calls `toast.success()` and `toast.error()` inside `createGroup`, `updateGroup`, `deleteGroup`. `useOrders.createOrder` calls `toast.error()` on failure.
**Why bad:** Hooks should return data and errors; UI feedback belongs in the component that calls the hook. This makes hooks impossible to reuse in contexts where different toast behavior is needed (e.g., a bulk operation that only toasts at the end).
**Instead:** Return error state from hooks; let components decide whether to toast. This is a low-priority cleanup — do not change it during hardening (it works, just not ideal).

### Anti-Pattern 4: Two Supabase Client Factories

**What:** `app/api/orders/route.ts` defines its own `createClient()` function inline (lines 5–33). `lib/supabase-server.ts` also exports a `createClient()`. `app/api/drugs/route.ts` imports from `lib/supabase-server.ts`. `app/api/customers/route.ts` creates its own inline server client.
**Why bad:** Two different client factories means inconsistent cookie handling. The `orders` route uses `get(name)` while `lib/supabase-server.ts` uses `getAll()`. The `getAll()` form is the current recommended pattern.
**Instead:** Standardize all API routes to import from `lib/supabase-server.ts`. Delete the inline `createClient` in `orders/route.ts` and `customers/route.ts`.

---

## Scalability Considerations

This is a single-user pharmacy POS. Scale concerns are about data volume (years of order history), not concurrent users.

| Concern | Current (< 1K orders) | Future (10K+ orders) |
|---------|----------------------|---------------------|
| Order history load | Full table scan with JOINs, no pagination | Add `.range(offset, limit)` to `/api/orders` GET |
| Drug list in AddItemModal | Fetches all drugs at once | Acceptable for < 500 drugs; add server-side search if > 1K |
| Template list | Full fetch, no pagination | Acceptable for < 200 templates |
| RPC performance | Single DB call, fast | Add index on `orders.user_id, created_at DESC` if not present |

No immediate action needed on scalability. The hardening work (RPC, soft delete, error standardization) does not worsen scale characteristics.

---

## Sources

All findings are based on direct code inspection at HIGH confidence:

- `app/checkout/page.tsx` — 618 lines, 13 useState hooks enumerated
- `app/api/orders/route.ts` — non-atomic insert pattern at lines 200–236
- `app/api/templates/route.ts` — same non-atomic pattern at lines 37–69
- `app/context/CheckoutContext.tsx` — saveAsTemplate non-atomic at lines 135–177
- `hooks/useOrders.ts` — full refetch after createOrder at line 50
- `hooks/useTemplates.ts` — full refetch after addTemplate (line 78) and updateTemplate (line 131)
- `hooks/useDrugs.ts` — partial optimistic updates already in place
- `hooks/useCustomers.ts` — optimistic prepend/patch already in place
- `types/database.ts` — `templates.deleted_at` confirmed at line 89; `drugs` table has no `deleted_at`
- `lib/supabase-server.ts` — `getAll()` cookie pattern (correct)
- `app/api/orders/route.ts` lines 5–33 — duplicate inline client factory using old `get()` pattern
- `app/api/customers/route.ts` — third client factory variant (inline, `get()` pattern)
