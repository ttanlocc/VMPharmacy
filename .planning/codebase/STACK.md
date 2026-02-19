# Technology Stack

**Analysis Date:** 2026-02-19

## Languages

**Primary:**
- TypeScript 5.x - All source code, API routes, and configuration files (`app/**/*.ts`, `app/**/*.tsx`, `lib/**/*.ts`)
- JavaScript/JSX - React components with `'use client'` directives for client-side code

**Secondary:**
- SQL - Database schema and migrations (`migration_*.sql` files)
- CSS - Via Tailwind CSS PostCSS integration

## Runtime

**Environment:**
- Node.js (version not explicitly specified, but implied by Next.js 16.1.1 requirement)

**Package Manager:**
- npm - Uses package-lock.json for dependency locking

## Frameworks

**Core:**
- Next.js 16.1.1 - Full-stack React framework with App Router, Server Components, and middleware
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework via `@tailwindcss/postcss` 4
- Framer Motion 12.23.26 - Animation library for UI transitions

**UI Components & Icons:**
- Lucide React 0.562.0 - Icon library (`components/**/*.tsx` uses Pill, Mail, Lock, AlertCircle, etc.)
- Tailwind Merge 3.4.0 - Utility for merging Tailwind class names

**Toast Notifications:**
- React Hot Toast 2.6.0 - Toast/notification system

**Utilities:**
- Date-fns 4.1.0 - Date manipulation library
- clsx 2.1.1 - Conditional className builder

**Progressive Web App:**
- next-pwa 5.6.0 - PWA plugin for Next.js with service worker registration (configured in `next.config.ts`)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.89.0 - Supabase client for direct browser access
- @supabase/ssr 0.8.0 - Supabase SSR helper for server-side session management and cookie handling

**Backend Database:**
- Supabase (PostgreSQL) - Database is Supabase-hosted PostgreSQL with RLS (Row Level Security)

**Build/Development:**
- TypeScript 5.x - Type checking
- @types/node 20.x - Node.js type definitions
- @types/react 19.x - React type definitions
- @types/react-dom 19.x - React DOM type definitions
- ESLint 9.x - Code linting with Next.js rules
- eslint-config-next 16.1.1 - Next.js ESLint configuration
- Babel 7.28.5 - JavaScript transpilation
- tsx 4.21.0 - TypeScript execution for scripts (used in `scripts/import_drugs.ts`)

## Configuration

**Environment:**
- Environment variables configured via `.env.local` (local) and Vercel environment variables (production)
- Required public variables:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous public key
- Optional variables:
  - `SUPABASE_SERVICE_KEY` - Service role key for admin operations (used in import scripts)
- Configuration pattern: Next.js uses `process.env.NEXT_PUBLIC_*` for public client-side variables, `process.env.*` for server-side only

**Build:**
- `next.config.ts` - Next.js configuration with PWA integration
- `tsconfig.json` - TypeScript compiler options with path alias `@/*` mapping to project root
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS
- `eslint.config.mjs` - ESLint configuration with Next.js core-web-vitals and TypeScript plugins
- `.env.example` - Template for environment variables
- `.env.local` - Local environment configuration (exists, contents not analyzed)

## Platform Requirements

**Development:**
- Node.js runtime
- npm package manager
- Windows/macOS/Linux with bash shell support
- Vercel CLI (optional, for deployment)

**Production:**
- Vercel platform (recommended per `DEPLOYMENT.md`)
- HTTPS enabled (automatically provided by Vercel)
- Environment variables configured in Vercel dashboard
- Supabase project (external database service)

## Scripts

**Development:**
- `npm run dev` - Starts Next.js dev server on port 3001 with webpack bundler and host 0.0.0.0
- `npm run build` - Builds Next.js application with webpack bundler
- `npm start` - Runs Next.js production server
- `npm run lint` - Runs ESLint for code quality
- `npm run import:drugs` - Runs `scripts/import_drugs.ts` via tsx to import drug data from CSV

## Database

**Type:** PostgreSQL via Supabase

**ORM/Client:** Direct Supabase JS client (no traditional ORM)

**Tables:** (inferred from API usage)
- `drugs` - Drug catalog with fields: id, legacy_id, name, active_ingredient, parent_group, child_group, unit, unit_price, purchase_price, supplier, image_url, group_id
- `customers` - Customer data with fields: id, name, phone, birth_year, medical_history, note, created_at
- `orders` - Purchase orders with fields: id, user_id, customer_id, template_id, total_price, status, created_at
- `order_items` - Line items in orders with fields: order_id, drug_id, quantity, unit_price, note, template_id
- `templates` - Saved order templates with fields: id, user_id, name, image_url, total_price, note, created_at
- `template_items` - Line items in templates with fields: template_id, drug_id, quantity, note
- `drug_groups` - Drug category groupings

**File Storage:** Supabase Storage bucket `drug-images` for drug and template images

---

*Stack analysis: 2026-02-19*
