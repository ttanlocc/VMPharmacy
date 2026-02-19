# Codebase Structure

**Analysis Date:** 2026-02-19

## Directory Layout

```
project-root/
├── app/                           # Next.js App Router directory
│   ├── (dashboard)/              # Grouped dashboard routes with shared layout
│   │   ├── checkout/
│   │   │   └── new/page.tsx      # Template selection page
│   │   ├── customers/
│   │   │   └── select/page.tsx   # Customer selection/search page
│   │   ├── drugs/page.tsx        # Drug management page (CRUD)
│   │   ├── history/page.tsx      # Order history with filters
│   │   ├── settings/page.tsx     # Settings page
│   │   ├── templates/page.tsx    # Template list and management
│   │   ├── page.tsx              # Dashboard home page
│   │   └── layout.tsx            # Dashboard layout with AuthGuard and Navbar
│   ├── api/                      # API route handlers
│   │   ├── customers/route.ts    # GET/POST customers
│   │   ├── drug-groups/route.ts  # GET drug groups
│   │   ├── drugs/route.ts        # GET/POST drugs
│   │   ├── orders/route.ts       # GET/POST orders
│   │   ├── templates/route.ts    # GET/POST templates
│   │   └── upload/route.ts       # POST image uploads
│   ├── checkout/page.tsx         # Checkout cart editor (not in dashboard group)
│   ├── context/CheckoutContext.tsx
│   ├── layout.tsx                # Root layout with PWA, Checkout provider
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Registration page
│   └── globals.css               # Global Tailwind styles
├── components/                    # Reusable React components
│   ├── home/                     # Home/dashboard specific components
│   │   ├── HomeActions.tsx       # Quick action buttons
│   │   ├── QuickSaleButton.tsx   # Quick sale entry point
│   │   ├── RecentTemplates.tsx   # Template carousel
│   │   └── TodayStats.tsx        # Statistics cards
│   ├── ui/                       # Base UI components
│   │   ├── GlassCard.tsx         # Glass-morphism card container
│   │   ├── Input.tsx             # Styled input field
│   │   └── Textarea.tsx          # Styled textarea
│   ├── ActionMenu.tsx            # Dropdown menu for drug actions
│   ├── AddItemModal.tsx          # Add drug/template to checkout modal
│   ├── AuthGuard.tsx             # Auth verification wrapper
│   ├── CheckoutLineItem.tsx      # Single cart item row
│   ├── ConfirmDialog.tsx         # Confirmation modal
│   ├── Container.tsx             # Page content wrapper (padding, centering)
│   ├── CustomerOrderHistory.tsx  # Customer's past orders view
│   ├── CustomerPicker.tsx        # Customer selection/search
│   ├── DetailedDrugList.tsx      # Full drug list with details
│   ├── DrugCard.tsx              # Drug display card
│   ├── DrugGroupFilter.tsx       # Group selection filter
│   ├── DrugGroupManager.tsx      # Create/edit groups modal
│   ├── DrugItem.tsx              # Drug item in list
│   ├── DrugListItem.tsx          # Drug row with actions
│   ├── DrugPicker.tsx            # Drug selection modal
│   ├── ErrorBoundary.tsx         # React error boundary
│   ├── HistoryFilter.tsx         # Date/search filters for history
│   ├── IngredientInput.tsx       # Active ingredient input with autocomplete
│   ├── LoadingSpinner.tsx        # Loading state indicator
│   ├── Navbar.tsx                # Bottom navigation bar
│   ├── OrderHistory.tsx          # Orders list display
│   ├── PriceEditor.tsx           # Manual price adjustment component
│   ├── SaveTemplateModal.tsx     # Save current cart as template
│   ├── SwipeableItem.tsx         # Swipe-to-delete list item
│   └── TemplateCard.tsx          # Template display card
├── hooks/                        # Custom React hooks
│   ├── useCustomers.ts           # Fetch customers, search
│   ├── useDrugGroups.ts          # Load and organize drug groups
│   ├── useDrugs.ts               # Drug CRUD and import prices
│   ├── useHistory.ts             # Fetch filtered order history
│   ├── useOrders.ts              # Order fetching and creation
│   └── useTemplates.ts           # Fetch templates with items
├── lib/                          # Utility functions and constants
│   ├── constants.ts              # App-wide constants (drug units, etc)
│   ├── supabase.ts               # Client-side Supabase instance
│   ├── supabase-server.ts        # Server-side Supabase factory
│   ├── upload.ts                 # Image upload handler
│   └── utils.ts                  # Helper functions (cn, formatCurrency)
├── types/                        # TypeScript type definitions
│   └── database.ts               # Supabase auto-generated database types
├── public/                       # Static assets
│   ├── icons/                    # App icons and favicons
│   └── manifest.json             # PWA manifest
├── scripts/                      # Build and data scripts
│   └── import_drugs.ts           # Script to import drugs from file
├── .planning/codebase/           # Planning and analysis documents
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── eslint.config.mjs             # ESLint rules
└── README.md                     # Project documentation
```

## Directory Purposes

**`app/(dashboard)/`:**
- Purpose: Protected dashboard routes with consistent layout and navbar
- Contains: Main application pages (home, checkout selection, drug management, history, templates)
- Key files: `layout.tsx` with AuthGuard, shared bottom navbar

**`app/api/`:**
- Purpose: Backend route handlers that interface with Supabase
- Contains: RESTful endpoints for data operations (CRUD on drugs, customers, orders, templates)
- Pattern: Each resource gets a `route.ts` file with GET/POST handlers

**`components/`:**
- Purpose: Reusable React components organized by feature/type
- `home/`: Components used on dashboard home page
- `ui/`: Base/primitive components (cards, inputs, textareas)
- Root level: Feature-specific components (modals, pickers, lists)

**`hooks/`:**
- Purpose: Encapsulate data fetching and state management per domain
- Pattern: Each hook returns data + loading state + methods (add/update/delete/refresh)
- Usage: Hooks are used in pages and components to manage specific data domains

**`lib/`:**
- Purpose: Shared utilities, Supabase clients, constants
- Key responsibilities: Initialize Supabase clients, format data, handle uploads, define constants

**`types/`:**
- Purpose: TypeScript definitions, auto-generated from Supabase schema
- Ensures: Type-safe database operations throughout the app
- Update: Regenerate when database schema changes

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout with PWA and context setup
- `app/(dashboard)/layout.tsx`: Dashboard layout with auth and navbar
- `app/login/page.tsx`: Authentication entry point
- `app/checkout/page.tsx`: Checkout editor (main revenue flow)

**Configuration:**
- `next.config.ts`: PWA and Next.js settings
- `tsconfig.json`: TypeScript compiler options with `@/*` path alias
- `package.json`: Dependencies and npm scripts

**Core Logic:**
- `app/context/CheckoutContext.tsx`: Global checkout state with localStorage persistence
- `app/api/orders/route.ts`: Order creation with template pricing distribution
- `lib/supabase.ts`: Client-side Supabase initialization
- `lib/supabase-server.ts`: Server-side Supabase factory for API routes

**Testing/Scripting:**
- `scripts/import_drugs.ts`: CLI script to bulk import drugs

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Route handlers: `route.ts` (Next.js convention)
- Components: PascalCase (`DrugCard.tsx`, `CheckoutLineItem.tsx`)
- Hooks: camelCase starting with `use` (`useDrugs.ts`, `useOrders.ts`)
- Utilities: camelCase (`utils.ts`, `constants.ts`, `upload.ts`)

**Directories:**
- Feature/page routes: kebab-case (`/checkout/new`, `/drug-groups`, `/customers/select`)
- Component subdirectories: camelCase grouping by feature (`home/`, `ui/`)
- Hook directory: plural (`hooks/`)
- Config/static: kebab-case or conventional names (`.planning`, `public`, `scripts`)

**Variables/Functions:**
- React components: PascalCase
- Functions: camelCase (`formatCurrency`, `uploadDrugImage`, `cn`)
- Constants: UPPER_SNAKE_CASE (`DRUG_UNITS`, `STORAGE_KEY`)
- React hooks: camelCase starting with `use` (`useCheckout`, `useDrugs`)

## Where to Add New Code

**New Feature (e.g., analytics dashboard):**
- Primary code: Create new route under `app/(dashboard)/analytics/page.tsx`
- Components: Add feature-specific components to `components/` (e.g., `components/AnalyticsChart.tsx`)
- Hooks: If data fetching needed, add `hooks/useAnalytics.ts`
- API: If backend logic needed, add `app/api/analytics/route.ts`
- Tests: Would go in `__tests__/` or `.spec.ts` files (pattern TBD - see TESTING.md)

**New Component (e.g., DrugSearchBar):**
- Implementation: `components/DrugSearchBar.tsx` (or `components/home/DrugSearchBar.tsx` if home-specific)
- Export: Add to component directory, import in pages/other components
- No new directory needed unless organizing into feature subdirectory

**New API Endpoint (e.g., /api/reports):**
- Implementation: `app/api/reports/route.ts`
- Pattern: Match existing handlers (GET/POST exports, Supabase client creation, auth check)
- Data: Use types from `types/database.ts` for type safety

**New Utility Function (e.g., formatDate):**
- Implementation: Add to appropriate file in `lib/` or create new utility
- Location: `lib/utils.ts` for general utilities, or `lib/formatting.ts` if creating specialized module
- Export: Named export for tree-shaking

**New Data Hook (e.g., useReports):**
- Implementation: `hooks/useReports.ts`
- Pattern: useState for data/loading/error, useEffect for fetching, return object with data and methods
- Reuse: Leverage existing hook patterns from `useOrders.ts` or `useDrugs.ts`

## Special Directories

**`.planning/codebase/`:**
- Purpose: Architecture and planning documentation
- Generated: Via `/gsd:map-codebase` command
- Committed: Yes (version controlled)
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

**`public/`:**
- Purpose: Static assets served by Next.js
- Generated: No
- Committed: Yes
- Contains: Icons, favicons, PWA manifest

**`.next/`:**
- Purpose: Build output and Next.js cache
- Generated: Yes (by `npm run build`)
- Committed: No (.gitignored)

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (.gitignored)

**`scripts/`:**
- Purpose: Utility scripts for data import, setup, etc
- Generated: No
- Committed: Yes
- Run with: `npm run import:drugs` (defined in package.json)

---

*Structure analysis: 2026-02-19*
