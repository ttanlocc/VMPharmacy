# Technology Stack

**Project:** VMPharmacy — Production Hardening
**Researched:** 2026-02-19
**Scope:** What is missing from the existing Next.js 16 + Supabase stack to be production-ready

---

## Existing Stack (Do Not Change)

| Technology | Version (Actual) | Role |
|------------|-----------------|------|
| Next.js | 16.1.1 | Framework, API routes, SSR |
| React | 19.2.3 | UI runtime |
| TypeScript | ^5 | Type safety |
| Supabase JS | ^2.89.0 | DB client, auth, storage |
| @supabase/ssr | ^0.8.0 | SSR cookie handling |
| Tailwind CSS | ^4 | Styling |
| Framer Motion | ^12 | Animations |
| react-hot-toast | ^2.6.0 | Toast notifications |
| Vercel | (deployment) | Hosting, edge functions |

These are established and working. The hardening milestone adds patterns and tooling on top of this stack — not new frameworks.

---

## Hardening Gaps and Recommended Additions

### 1. Atomic Database Operations — PostgreSQL RPC Functions

**Problem (confirmed in code):**
`/app/api/orders/route.ts` lines 201-236 and `/app/api/templates/route.ts` create parent records first, then child records in separate round-trips. If the second insert fails, the parent record is orphaned. The code even contains the comment "In a real app we might want to rollback the order here" on line 233.

**Recommendation: PostgreSQL plpgsql functions called via `supabase.rpc()`**

Supabase's `.rpc()` method calls a PostgreSQL stored procedure that runs entirely within a single database transaction. Any error inside the function triggers an automatic ROLLBACK — no orphan records can be created.

**Confidence: HIGH** — This is the standard PostgreSQL/Supabase pattern documented since Supabase GA. The `supabase.rpc()` method is stable in @supabase/supabase-js v2.x.

```sql
-- Migration: create_order_atomic function
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_user_id     UUID,
  p_total_price NUMERIC,
  p_customer_id UUID,
  p_template_id UUID,
  p_items       JSONB   -- [{drug_id, quantity, unit_price, note, template_id}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  -- 1. Insert order
  INSERT INTO orders (user_id, total_price, status, customer_id, template_id)
  VALUES (p_user_id, p_total_price, 'completed', p_customer_id, p_template_id)
  RETURNING * INTO v_order;

  -- 2. Insert items (bulk from JSONB array)
  INSERT INTO order_items (order_id, drug_id, quantity, unit_price, note, template_id)
  SELECT
    v_order.id,
    (item->>'drug_id')::UUID,
    (item->>'quantity')::INTEGER,
    (item->>'unit_price')::NUMERIC,
    item->>'note',
    (item->>'template_id')::UUID
  FROM jsonb_array_elements(p_items) AS item;

  -- If either INSERT fails, the entire transaction rolls back automatically.
  RETURN row_to_json(v_order)::JSONB;
END;
$$;
```

```typescript
// Client call in /app/api/orders/route.ts
const { data, error } = await supabase.rpc('create_order_atomic', {
  p_user_id:     user.id,
  p_total_price: finalTotalPrice,
  p_customer_id: customer_id ?? null,
  p_template_id: template_id ?? null,
  p_items:       JSON.stringify(finalItems)
});
```

**Why not a client-side transaction?** Supabase JS does not expose `BEGIN`/`COMMIT` on the HTTP API. The only way to get atomicity is a server-side function. This is intentional — it also keeps business logic out of the client and away from RLS bypass risks.

**Apply same pattern to:**
- `create_template_atomic` (templates + template_items)
- `update_template_atomic` (delete-old-items + insert-new-items)
- `save_checkout_as_template` (the `saveAsTemplate` path in CheckoutContext.tsx)

---

### 2. Soft Delete for Drugs — Name Snapshot Pattern

**Problem (confirmed in code):**
`useDrugs.ts` line 72: `deleteDrug` calls a hard delete. `supabase_schema.sql` shows `order_items.drug_id` is a FK to `drugs(id)` with NO `ON DELETE SET NULL` — so deleting a drug either fails (FK violation) or, if FK is disabled, leaves `order_items.drug_id` pointing to a non-existent row. The UI then shows "Thuốc" (placeholder) for the drug name.

**Recommendation: Two-part fix**

**Part A — Soft delete on `drugs` table:**

```sql
-- Migration
ALTER TABLE drugs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_drugs_deleted_at ON drugs(deleted_at);

-- RLS policy update: active drugs visible to all
-- (existing "Enable read access for all users" policy stays but queries filter deleted_at IS NULL)
```

Soft delete in the hook:
```typescript
// useDrugs.ts — replace hard delete
const deleteDrug = async (id: string) => {
  const { error } = await supabase
    .from('drugs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  setDrugs(prev => prev.filter(d => d.id !== id));
};
```

Active drug queries must always add `.is('deleted_at', null)` — same pattern already used in `useTemplates.ts` line 31.

**Part B — Snapshot drug name on order_items:**

Soft delete alone still fails if you later hard-purge or the drug name changes. The correct production pattern is to snapshot the display name at order creation time.

```sql
-- Migration: add name snapshot columns to order_items
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS drug_name TEXT,
  ADD COLUMN IF NOT EXISTS drug_unit TEXT;
```

At order creation time (inside the RPC function), populate these from the drugs table. When rendering history, use `order_items.drug_name` with `order_items.drugs.name` as a fallback.

**Confidence: HIGH** — Snapshot pattern is standard e-commerce/pharmacy practice. Soft delete via `deleted_at` is already used in the codebase for templates, confirming the team understands it. The extension to drugs is a direct parallel.

---

### 3. Optimistic UI Updates — In-Place State Mutation

**Problem (confirmed in code):**
- `useOrders.ts` line 50: `createOrder` calls `await fetchOrders()` — full network round-trip after every order.
- `useTemplates.ts` lines 78, 130: `addTemplate` and `updateTemplate` both call `await fetchTemplates()`.
- `useDrugs.ts` has some optimistic updates (lines 62-68 for `updateDrug`) but they are inconsistent.

**Recommendation: Return-value based optimistic update — no new libraries needed**

The Supabase client already returns the created/updated record via `.select()`. Use it to patch local state instead of refetching.

```typescript
// useOrders.ts — optimistic create
const createOrder = async (...) => {
  const { data: newOrder, error } = await supabase
    .from('orders')
    .insert({ ... })
    .select(`*, customers(name, phone), order_items(*, drugs(name, unit))`)
    .single();

  if (error) throw error;

  // In-place: prepend the new order without refetching
  setOrders(prev => [newOrder, ...prev]);
  return newOrder;
};
```

For templates, where a POST creates the header but items are inserted separately (until the atomic RPC is in place), the RPC return value can be used to reload only the affected record:

```typescript
// useTemplates.ts — targeted reload after RPC
const { data: updatedTemplate } = await supabase
  .from('templates')
  .select('*, template_items(*, drugs(*))')
  .eq('id', id)
  .single();

setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
```

**Why no React Query / SWR?** The project currently uses raw `useState` + `useEffect` hooks with no caching layer. Introducing React Query at this stage is a significant DX improvement but also a large refactor scope. The immediate fix — using returned data instead of full refetches — is zero-dependency and correct. If the project grows to need background revalidation, React Query (v5) is the recommended next step.

**Confidence: HIGH** — This pattern is inherent to how Supabase's `.select()` chaining works; it is not a third-party opinion.

---

### 4. Standardized Error Response Format

**Problem (confirmed in code):**
Error responses across API routes are inconsistent:
- `/api/orders/route.ts`: returns `{ error: error.message }` (string)
- `/api/customers/route.ts`: returns `{ error: 'Số điện thoại này đã tồn tại' }` for a known constraint, raw `error.message` for unknowns — no error code
- `/api/drugs/route.ts`: returns `{ error: error.message }` with no auth check on GET

No consistent HTTP status code mapping and no `code` field for client-side error branching.

**Recommendation: Standardized error response shape + shared utility**

No new packages are needed. Create a shared error utility in `lib/`:

```typescript
// lib/api-response.ts
export type ApiError = {
  error: string;        // human-readable message
  code?: string;        // machine-readable code for client branching (e.g., 'DUPLICATE_PHONE')
  details?: unknown;    // dev-only context (strip in production or gate behind env)
};

export type ApiSuccess<T> = {
  data: T;
};

// Convenience helpers
export function apiError(message: string, status: number, code?: string): Response {
  const body: ApiError = { error: message, ...(code ? { code } : {}) };
  return Response.json(body, { status });
}

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}
```

Map PostgreSQL error codes to typed codes:

| Postgres Code | Meaning | HTTP Status | API Code |
|---------------|---------|-------------|----------|
| `23505` | Unique violation | 409 | `DUPLICATE` |
| `23503` | FK violation | 409 | `REFERENCE_VIOLATION` |
| `42501` | Insufficient privilege | 403 | `FORBIDDEN` |
| `PGRST116` | Not found (PostgREST) | 404 | `NOT_FOUND` |

Client hooks read `error.code` to show the right UI message rather than relying on fuzzy string matching.

**Confidence: HIGH** — Standard REST practice. No library dependency, no version risk.

---

### 5. localStorage Security for Checkout State

**Problem (confirmed in code):**
`CheckoutContext.tsx` lines 62, 78: Stores full customer object (name, phone, medical history from `customers` table) and cart items unencrypted in `localStorage` under key `vmp_checkout_state`.

`localStorage` is:
- Persistent across browser sessions
- Accessible to any JS running on the same origin (XSS risk)
- Not cleared on logout

**Assessment of actual risk:**
This is an internal staff-facing tool. The threat model is:
1. A staff member leaves the browser open (session leak) — HIGH likelihood
2. A cross-site scripting attack — LOW likelihood (no UGC)
3. Another user on the same machine inspecting DevTools — MEDIUM likelihood in a pharmacy where multiple staff share workstations

**Recommendation: sessionStorage + logout clearing — not encryption**

Encrypting `localStorage` with a client-side key stored in `sessionStorage` provides no real security (the key is equally accessible). The correct mitigation is:

**A. Switch to `sessionStorage`:**
```typescript
// CheckoutContext.tsx — replace all localStorage calls
const STORAGE_KEY = 'vmp_checkout_state';

// Load
const saved = sessionStorage.getItem(STORAGE_KEY);

// Save
sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customer }));

// Clear
sessionStorage.removeItem(STORAGE_KEY);
```

`sessionStorage` is tab-scoped and cleared when the tab/window closes. A staff member closing the browser session loses the cart, which is acceptable for a checkout flow.

**B. Clear on auth state change:**
Subscribe to `supabase.auth.onAuthStateChange` and call `clearCheckout()` when `event === 'SIGNED_OUT'`.

```typescript
// app/layout.tsx or CheckoutProvider
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') clearCheckout();
  });
  return () => subscription.unsubscribe();
}, []);
```

**C. Scope sensitive fields:** Store only `customer_id` (UUID) in session storage, not the full customer object. Fetch customer details from the API on rehydration using the ID. This limits what an attacker reading storage actually gets.

**Why not `httpOnly` cookies?** Cart state is client-managed UI state, not a server secret. Cookies add complexity without solving the shared-workstation threat. The real solution is OS-level session management (locking the workstation), but `sessionStorage` + auth-event clearing is the correct application-layer mitigation.

**Confidence: HIGH** — This is browser security fundamentals, not an emerging pattern.

---

## Summary of Recommended Additions

| Addition | Where It Lives | Zero New Deps? |
|---------|---------------|----------------|
| `create_order_atomic` plpgsql function | Supabase migration SQL | Yes |
| `create_template_atomic` plpgsql function | Supabase migration SQL | Yes |
| `update_template_atomic` plpgsql function | Supabase migration SQL | Yes |
| `drugs.deleted_at` column | Supabase migration SQL | Yes |
| `order_items.drug_name` + `drug_unit` snapshot columns | Supabase migration SQL | Yes |
| In-place state mutation in hooks | `hooks/` | Yes |
| `lib/api-response.ts` error utility | `lib/` | Yes |
| `sessionStorage` checkout + auth-event clearing | `app/context/CheckoutContext.tsx` | Yes |

**No new npm packages are required.** All five hardening areas can be addressed using existing versions of Supabase JS, Next.js, and React.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Atomic inserts | PostgreSQL RPC (plpgsql) | Client-side with manual rollback (delete order if items fail) | Race conditions, compensating transactions are error-prone and not truly atomic |
| Atomic inserts | PostgreSQL RPC | Supabase Edge Functions | Edge Functions are JS — still HTTP calls to the DB, no native transaction control |
| Optimistic UI | In-place state update from returned data | React Query / SWR | Correct immediate fix with zero refactor cost; RQ is a future phase improvement |
| Optimistic UI | In-place state update | Zustand global store | Overkill for this app's scale; adds complexity without solving the core refetch issue |
| Checkout security | sessionStorage + auth-event clear | client-side AES encryption (e.g., crypto-js) | False security — encryption key stored in same JS context is accessible to the same attacker |
| Checkout security | sessionStorage | Remove persistence entirely (in-memory only) | Users lose cart on accidental page refresh, poor UX for pharmacy workflows |
| Error format | Shared utility in `lib/` | Zod error schema validation | Zod adds build complexity; a typed helper is sufficient for this API surface |

---

## No-Install Verification

Current package versions confirmed from `package.json` (read directly):
- `@supabase/supabase-js`: `^2.89.0` — supports `.rpc()`, `.select()` chaining, `onAuthStateChange`
- `@supabase/ssr`: `^0.8.0` — server-side client creation pattern already in use
- `next`: `16.1.1` — `Response.json()` available in Route Handlers
- `react`: `19.2.3` — `useState`, `useEffect` stable

All recommended patterns are compatible with these exact versions.

**Confidence: HIGH** — Verified against actual `package.json` in the repository, not assumed.

---

## Sources

- Codebase analysis: `/app/api/orders/route.ts`, `/app/api/templates/route.ts`, `/hooks/useDrugs.ts`, `/hooks/useOrders.ts`, `/hooks/useTemplates.ts`, `/app/context/CheckoutContext.tsx`, `/supabase_schema.sql` (read directly 2026-02-19)
- `package.json` version pinning confirmed by direct read (2026-02-19)
- Supabase RPC/plpgsql pattern: HIGH confidence from training data (supabase-js v2 stable API); WebSearch/WebFetch unavailable in this session — flag for verification against https://supabase.com/docs/reference/javascript/rpc
- PostgreSQL error codes (`23505`, `23503`): HIGH confidence — these are stable ANSI SQL standard codes
- `sessionStorage` vs `localStorage` browser security: HIGH confidence — MDN-level browser fundamentals
- Optimistic update via `.select()` return value: HIGH confidence — standard JS async pattern, no library-specific behavior
