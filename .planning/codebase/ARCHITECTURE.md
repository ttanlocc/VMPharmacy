# Architecture

**Analysis Date:** 2026-02-19

## Pattern Overview

**Overall:** Client-Server Monolith with Next.js App Router and Client-Side State Management

**Key Characteristics:**
- Next.js 16 with App Router supporting both server and client components
- Supabase as backend for authentication, database, and real-time capabilities
- React Context API for global client-side state (checkout cart)
- Isolated API routes for order, drug, customer, and template operations
- Mobile-first responsive design with PWA support

## Layers

**Presentation Layer:**
- Purpose: Render UI and handle user interactions
- Location: `app/(dashboard)/**` and `app/checkout/**` (pages), `components/**` (reusable components)
- Contains: React components (TSX), pages, layouts, modals, cards, filters
- Depends on: React hooks, Context API, utility functions, icons (lucide-react), animations (framer-motion)
- Used by: Browser client

**API Layer (Backend Integration):**
- Purpose: Server-side request handlers that interface with Supabase and business logic
- Location: `app/api/**` (route handlers)
- Contains: GET/POST handlers for orders, drugs, customers, templates, drug groups, and uploads
- Key files: `app/api/orders/route.ts`, `app/api/drugs/route.ts`, `app/api/customers/route.ts`, `app/api/templates/route.ts`
- Depends on: Supabase server client, Next.js request/response utilities
- Used by: Client-side components via fetch calls

**Data Layer:**
- Purpose: Manage database schema, types, and authentication
- Location: `types/database.ts` (Supabase generated types), `lib/supabase.ts`, `lib/supabase-server.ts`
- Contains: TypeScript interfaces for all tables (drugs, customers, orders, templates, etc.), Supabase client initialization
- Key tables: drugs, customers, orders, order_items, templates, template_items, drug_groups, ingredients, drug_import_prices
- Depends on: Supabase SDK (@supabase/ssr, @supabase/supabase-js)
- Used by: API routes and client-side hooks

**State Management:**
- Purpose: Persist and manage shopping cart state across the app
- Location: `app/context/CheckoutContext.tsx`
- Contains: React Context provider with localStorage persistence for items and customer selection
- Key functionality: Add/remove items, update quantities, manage customer selection, flatten template items, saveAsTemplate
- Used by: All checkout-related pages and components

**Hooks Layer:**
- Purpose: Encapsulate data fetching and mutations for specific domains
- Location: `hooks/**`
- Key hooks:
  - `useOrders.ts`: Fetch orders by customer or globally, create orders
  - `useDrugs.ts`: CRUD operations on drugs, manage import prices
  - `useDrugGroups.ts`: Load and organize drug groups hierarchically
  - `useCustomers.ts`: Fetch customer list, search
  - `useTemplates.ts`: Fetch templates with item details
  - `useHistory.ts`: Fetch order history with filters
- Used by: Page components and feature components

**Utilities:**
- Purpose: Shared helper functions for formatting, styling, uploads, constants
- Location: `lib/utils.ts`, `lib/constants.ts`, `lib/upload.ts`
- Key functions:
  - `cn()`: Merge Tailwind classes with clsx + tailwind-merge
  - `formatCurrency()`: Format numbers as Vietnamese Dong
  - `uploadDrugImage()`: Handle image uploads to Supabase storage
- Used by: Throughout the app

## Data Flow

**Order Creation Flow:**

1. User navigates to `/checkout` (or `/checkout/new` for template selection)
2. `CheckoutContext` loads persisted cart items from localStorage
3. User selects drugs/templates via `AddItemModal` → calls `useCheckout.addItem()`
4. Items stored in context state and persisted to localStorage automatically
5. User selects customer via `CustomerPicker` → calls `useCheckout.setCustomer()`
6. User submits checkout form → calls `useOrders.createOrder()`
7. POST `/api/orders` validates items, fetches drug prices, distributes template prices
8. API creates order record and order_items records in Supabase
9. Context clears on success, user navigated to home

**Drug Management Flow:**

1. User navigates to `/drugs`
2. `useDrugs.fetchDrugs()` fetches all drugs with relations (groups, import prices)
3. Drugs filtered by search term and selected group
4. User creates/edits drug → shows modal with form
5. Submit calls `useDrugs.addDrug()` or `useDrugs.updateDrug()`
6. POST/PATCH `/api/drugs` creates or updates record
7. Hook's local state updates optimistically or on success
8. Image upload handled separately via `uploadDrugImage()` to Supabase storage

**Template Selection Flow:**

1. User navigates to `/checkout/new?customerId=X`
2. Page loads templates with `useTemplates()`
3. User selects template or empty order
4. Template items flattened (nested structure → flat drug quantities)
5. Item added to checkout context
6. User redirected to `/checkout` with context items ready

**State Management:**

- **Checkout Items**: Persisted in localStorage with key `vmp_checkout_state`, includes both drug and template items
- **Customer Selection**: Stored in context and localStorage, persists across page navigation
- **Drug/Template Data**: Fetched on-demand via hooks, cached in component state until refresh
- **Auth State**: Managed by Supabase, checked via `AuthGuard` component on protected routes

## Key Abstractions

**CheckoutItem:**
- Purpose: Unified representation of line items in cart (drugs or templates)
- Location: `app/context/CheckoutContext.tsx`
- Pattern: Discriminated union with `type: 'drug' | 'template'`
- Shape: Common fields (name, price, quantity, note) + type-specific fields (drug_id/unit or template_id/items)

**Order:**
- Purpose: Typed order data with nested items and related customer/drug details
- Location: `hooks/useOrders.ts`
- Pattern: Supabase row extended with nested order_items relation
- Contains: Order metadata (id, user_id, total_price, created_at) + array of order_items with drug details

**Drug:**
- Purpose: Extend basic drug table row with optional relations
- Location: `hooks/useDrugs.ts`
- Pattern: Database row with optional fields for group name and import prices
- Used for: Display, filtering, and import price management

**Template Processing:**
- Purpose: Handle pricing distribution and item flattening
- Location: `app/api/orders/route.ts` (POST handler)
- Pattern: Calculate price ratios based on drug standard prices, distribute manual template price proportionally
- Ensures: Template items maintain relative pricing when applying manual price override

## Entry Points

**Root Entry (`app/layout.tsx`):**
- Location: `app/layout.tsx`
- Triggers: Browser load of any route under `/`
- Responsibilities: Initialize PWA, set up Checkout context provider, configure global toast notifications, load fonts

**Dashboard Layout (`app/(dashboard)/layout.tsx`):**
- Location: `app/(dashboard)/layout.tsx`
- Triggers: Navigation to routes under `/` (protected by AuthGuard)
- Responsibilities: Enforce authentication, render bottom navbar, provide consistent dashboard background

**Checkout Flow:**
- Entry 1: `/checkout/new` → Template selection page
- Entry 2: `/checkout` → Active checkout cart editor
- Both load from `CheckoutContext` and manage items/customer selection

**Authentication Pages:**
- `/login` → Login form with Supabase auth
- `/register` → Registration form with Supabase auth

## Error Handling

**Strategy:** Try-catch with user-facing toast notifications and fallback error messages

**Patterns:**
- API errors logged to console with `console.error()`, NextResponse returned with 401/500 status
- Client-side fetch errors caught and displayed via `react-hot-toast`
- Validation errors (missing drug_ids, non-existent records) returned as descriptive error messages
- Auth errors redirect to login automatically via `AuthGuard` or manual `router.push('/login')`

**Examples:**
- Order creation validates items exist before insert (`app/api/orders/route.ts` lines 123-134)
- Customer fetch wrapped in try-catch with loading state fallback (`app/(dashboard)/checkout/new/page.tsx` lines 30-47)
- Authentication checked on every protected page with `AuthGuard` component

## Cross-Cutting Concerns

**Logging:**
- Approach: Console logs for errors and debug info, no centralized logging service
- Usage: Errors in API handlers, hook failures, auth verification failures

**Validation:**
- Approach: Database validation via Supabase constraints, API-level validation for business rules, client-side validation for UX
- Key validations: Order items exist, customer IDs valid, drug prices numeric, template pricing calculations accurate

**Authentication:**
- Approach: Supabase Auth (email/password), session managed via cookies
- Protection: `AuthGuard` wraps dashboard routes, API routes check `supabase.auth.getUser()`
- Row-level security (RLS): Implied for user-specific data (orders by user_id, templates by user_id)

**Styling:**
- Approach: Tailwind CSS with custom configuration, clsx for conditional classes, framer-motion for animations
- Patterns: Responsive design with mobile-first approach, gradient backgrounds, glass-morphism cards

---

*Architecture analysis: 2026-02-19*
