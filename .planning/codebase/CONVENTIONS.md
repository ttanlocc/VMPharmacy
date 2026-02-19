# Coding Conventions

**Analysis Date:** 2026-02-19

## Naming Patterns

**Files:**
- React components use PascalCase: `CustomerPicker.tsx`, `DrugGroupManager.tsx`, `CheckoutLineItem.tsx`
- Hooks use camelCase with `use` prefix: `useCustomers.ts`, `useDrugs.ts`, `useTemplates.ts`
- Utility/helper files use camelCase: `utils.ts`, `constants.ts`, `upload.ts`
- API routes use `route.ts`: `app/api/customers/route.ts`, `app/api/drugs/route.ts`

**Functions:**
- React components and functions use PascalCase for export: `export default function CustomerPicker()`
- Hook functions use camelCase with `use` prefix: `export function useCustomers()`
- Utility functions use camelCase: `formatCurrency()`, `cn()`
- Event handlers use camelCase with `handle` prefix: `handleCreateWrapper()`, `handleSelect()`
- Internal state setters use camelCase: `setQuery()`, `setIsOpen()`, `setCustomer()`

**Variables:**
- State variables use camelCase: `query`, `isOpen`, `loading`, `selectedCustomer`, `customers`
- Boolean flags use `is`/`has` prefix: `isLoading`, `isOpen`, `isCreating`, `hasError`
- Derived/computed variables from database types use consistent casing: `newCustomer`, `editingId`
- Constants use UPPER_SNAKE_CASE: `STORAGE_KEY` (`vmp_checkout_state`)

**Types:**
- TypeScript interfaces use PascalCase: `CustomerPickerProps`, `CheckoutItem`, `CheckoutContextType`
- Type imports use PascalCase: `type Customer`, `type NewCustomer`
- Database-derived types extracted to alias variables: `type Customer = Database['public']['Tables']['customers']['Row'];`

## Code Style

**Formatting:**
- No explicit Prettier config found, but code uses consistent formatting patterns
- Line length appears flexible with no hard limit enforced
- Template literals used for style strings and multi-line JSX

**Linting:**
- ESLint enabled with Next.js configuration: `eslint.config.mjs`
- Uses `eslint-config-next` for core web vitals and TypeScript support
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- No custom rule overrides beyond Next.js defaults

**Comments:**
- Minimal commenting in production code; code intent is clear from structure
- No JSDoc/TSDoc annotations in observed code (focus on self-documenting code)
- Inline comments used for non-obvious logic: see `CheckoutContext.tsx` line 47 comment about optimistic updates
- Disabled ESLint rules added in comments: `/* eslint-disable @next/next/no-img-element */`

**Language Configuration:**
- TypeScript target: ES2017
- Strict mode: `true` (strict type checking enabled)
- JSX mode: `react-jsx` (automatic runtime)
- Module resolution: bundler

## Import Organization

**Order:**
1. React imports: `import React, { ... } from 'react';`
2. Next.js imports: `import { useRouter, useEffect } from 'next/navigation';`
3. External libraries (alphabetical): `import { motion, AnimatePresence } from 'framer-motion';`
4. Icons from lucide-react: `import { Search, Plus, User, Phone, ... } from 'lucide-react';`
5. Relative imports from project: `import { useCustomers } from '@/hooks/useCustomers';`
6. Component imports: `import CustomerPicker from './CustomerPicker';`
7. Type imports: `import type { Metadata } from 'next';`

**Path Aliases:**
- `@/*` maps to root directory
- All absolute imports use `@/` prefix: `@/hooks/`, `@/components/`, `@/lib/`, `@/types/`, `@/app/`
- No relative import paths (../) in observed code outside of same directory

## Error Handling

**Patterns:**
- Try-catch blocks wrap async operations in hooks and API routes
- Error state stored in component state: `const [error, setError] = useState<string | null>(null);`
- Promise rejections rethrown after state updates: `throw err;` in catch blocks
- API error responses checked via `!res.ok` status code check
- Database errors checked on Supabase query results: `if (error) { return NextResponse.json(...) }`

**Error Messages:**
- User-facing Vietnamese error messages: `"Số điện thoại này đã tồn tại"`
- Database constraint violations (error.code === '23505') mapped to specific user messages
- Fallback error messages for unexpected errors: `error.message || 'Failed to create customer'`
- Console errors logged in catch blocks: `console.error('Failed to load checkout state:', error);`

**Error UI:**
- `ErrorBoundary` component catches React render errors and displays fallback UI
- Error states prevent operations: `disabled={loading}` on buttons during async operations
- Loading spinners show pending state: `<Loader2 className="animate-spin" />`
- Toasts display operation results: `react-hot-toast` positioned top-center

## Logging

**Framework:** `console` (standard JavaScript)

**Patterns:**
- `console.error()` used for exceptions: `console.error('Uncaught error:', error, errorInfo);`
- Minimal logging in production; error tracking not implemented
- Database errors logged before returning: implicit via error handling
- No structured logging or service-level logging detected

## Function Design

**Size:** Functions average 20-50 lines; larger components break logic into helpers

**Parameters:**
- Component props use TypeScript interfaces: `CustomerPickerProps extends { onSelect, selectedCustomer, forceOpen }`
- Props destructured in function signature
- Optional props use `?` syntax: `forceOpen?: boolean`
- Event handler parameters typed: `e: React.FormEvent` for form submissions

**Return Values:**
- React components return JSX elements
- Hooks return object with named properties: `{ customers, loading, error, searchCustomers, createCustomer }`
- API handlers return `NextResponse.json()` with appropriate status codes
- Async functions return promises that resolve to data or throw errors

## Module Design

**Exports:**
- Components export as default: `export default function ComponentName()`
- Hooks export as named: `export function useHookName()`
- Utility functions export as named: `export function formatCurrency()`
- Context exported as named: `export const CheckoutContext = createContext<>()`

**Barrel Files:**
- No barrel exports observed (`index.ts` files)
- Each component file is standalone
- Imports are explicit from specific files

## Type Safety

**TypeScript Configuration:**
- Strict type checking enabled
- Database schema types auto-generated: `Database` type from Supabase
- Type extraction pattern: `type Customer = Database['public']['Tables']['customers']['Row'];`
- Any types suppressed with `@ts-ignore` comments when necessary: `// @ts-ignore` on line 127 of `app/api/customers/route.ts`

**Prop Types:**
- Props fully typed with interfaces
- `Readonly` wrapper used for layout children: `Readonly<{ children: React.ReactNode }>`
- Optional callbacks typed: `onSelect?: (customer: Customer) => void`

---

*Convention analysis: 2026-02-19*
