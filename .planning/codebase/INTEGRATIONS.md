# External Integrations

**Analysis Date:** 2026-02-19

## APIs & External Services

**Supabase (Primary Backend):**
- Supabase - Unified backend service providing PostgreSQL database, authentication, and storage
  - SDK/Client: `@supabase/supabase-js` 2.89.0 (browser client) and `@supabase/ssr` 0.8.0 (server-side sessions)
  - Auth: `NEXT_PUBLIC_SUPABASE_URL` (project URL), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public anonymous key)
  - Implementation:
    - Browser client in `lib/supabase.ts` using `createBrowserClient`
    - Server client in `lib/supabase-server.ts` using `createServerClient` with cookie-based session management
    - Middleware session refresh in `middleware.ts` for automatic token refresh

## Data Storage

**Databases:**
- PostgreSQL via Supabase
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` environment variable
  - Client: Supabase JS SDK (no ORM)
  - Tables managed in Supabase dashboard
  - RLS (Row Level Security) policies enforced at database level for user isolation
  - Migrations tracked in `migration_*.sql` files

**File Storage:**
- Supabase Storage
  - Bucket: `drug-images` - Stores drug and template images
  - Access: Public URLs generated via `supabase.storage.from('drug-images').getPublicUrl()`
  - Upload path: `lib/upload.ts` contains `uploadImage()` function with folder structure `drugs/` and `templates/`
  - File naming: Random string generation with original extension preservation

**Caching:**
- Not detected - No explicit caching layer (Redis, Memcached, etc.)
- Browser caching via PWA service worker managed by `next-pwa`

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in with Supabase)
  - Implementation: Email/password authentication via `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`
  - Session management: Cookie-based via `@supabase/ssr` helper
  - Protected routes: Enforced in `middleware.ts` with route list:
    - `/management`, `/checkout`, `/templates`, `/drugs`, `/settings` require authentication
  - User context: Retrieved via `supabase.auth.getUser()` in server-side API routes
  - Components:
    - Login page: `app/login/page.tsx` with email/password form
    - Register page: `app/register/page.tsx` with signup form
    - Auth guard: `components/AuthGuard.tsx` for client-side protection

## Monitoring & Observability

**Error Tracking:**
- Not detected - No external error tracking service (Sentry, LogRocket, etc.)
- Console logging used in API routes (e.g., `console.error()` in `app/api/orders/route.ts`)

**Logs:**
- Console-based logging in server components
- Vercel deployment provides access to function logs via dashboard

## CI/CD & Deployment

**Hosting:**
- Vercel - Recommended deployment platform (documented in `DEPLOYMENT.md`)
- Alternative: Local Next.js deployment with `npm start`

**CI Pipeline:**
- Vercel's built-in CI (optional) - Automatic deployment on git push to configured branch
- Manual deployment via:
  - Vercel CLI: `vercel deploy` or `vercel --prod`
  - GitHub integration: Auto-deploy on push to main branch (documented approach)

**Build Process:**
- Vercel automatically detects Next.js and uses standard build settings
- Build command: `next build --webpack`
- Start command: `next start`
- Node.js version: Auto-detected (Vercel default)

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public, used in browser)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous public key (public, used in browser)

**Optional/Admin env vars:**
- `SUPABASE_SERVICE_KEY` - Service role key for admin operations (server-side only, used in `scripts/import_drugs.ts`)
- `NODE_ENV` - Auto-managed by Next.js/Vercel (development vs production)

**Secrets location:**
- `.env.local` - Local development (git-ignored)
- Vercel Dashboard → Settings → Environment Variables (for staging/production)
- `.env.example` - Template file showing required variable names

**Local setup:**
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints for external services

**Outgoing:**
- Not detected - No external webhook notifications

## Data Import/Export

**Bulk Import:**
- CSV import script: `scripts/import_drugs.ts`
  - Parses CSV file `drugs_import.csv` with custom CSV parser handling quoted fields
  - Uses Supabase service role key for admin insert/update operations
  - Upsert logic: Checks `legacy_id` to determine insert vs update
  - Runs via: `npm run import:drugs`
  - Environment requirement: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

**Data Export:**
- Not detected - No built-in data export functionality

## API Endpoints (Internal)

**Drugs:**
- `GET /api/drugs` - List drugs, optional filter by `group_id`
- `POST /api/drugs` - Create new drug

**Drug Groups:**
- `GET /api/drug-groups` - List drug groups

**Customers:**
- `GET /api/customers?search=query` - List customers with optional search by name/phone
- `POST /api/customers` - Create new customer
- `PUT /api/customers` - Update existing customer (unique constraint on phone)

**Orders:**
- `GET /api/orders?dateFrom=X&dateTo=Y&search=X&customerId=X` - List orders with filters
- `POST /api/orders` - Create new order with line items and template pricing distribution

**Templates:**
- `GET /api/templates` - List user's saved templates
- `POST /api/templates` - Create new template with items

**File Upload:**
- `POST /api/upload` - Upload image to Supabase Storage (implementation in `lib/upload.ts`)

## Third-Party Service Integration Summary

| Service | Purpose | Integration Type | Auth Method | Status |
|---------|---------|-------------------|------------|--------|
| Supabase | Backend (DB, Auth, Storage) | SDK (@supabase/supabase-js, @supabase/ssr) | API Keys | Active |
| Vercel | Deployment/Hosting | Git integration + CLI | OAuth (GitHub) | Active |
| Tailwind CSS | Styling | Framework + PostCSS plugin | Built-in | Active |

---

*Integration audit: 2026-02-19*
