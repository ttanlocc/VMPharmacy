# Testing Patterns

**Analysis Date:** 2026-02-19

## Test Framework

**Status:** Not detected

**Current State:**
- No test framework installed (Jest, Vitest, etc. not in `package.json`)
- No test configuration files found (jest.config.js, vitest.config.ts, etc.)
- No test files exist (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`)
- No test runner scripts in `package.json` (`test`, `test:watch`, `test:coverage`)

**Available dev tools:**
- ESLint v9 (linting only)
- TypeScript v5 (type checking)
- TSX v4.21.0 (TypeScript execution)

## Quality Assurance Approach

**Current QA Method:**
Instead of automated testing, the codebase uses manual browser-based testing. Several QA reports exist in repository root:
- `QA_BROWSER_TEST_REPORT.md`
- `QA_REPORT.md`
- `QA_REPORT_FINAL.md`
- `QA_REPORT_VERIFIED.md`
- `qa-automated-test.js` (JavaScript test runner file for manual execution)

**Manual Testing Evidence:**
- QA reports document test cases and results
- No continuous integration for tests (no CI/CD pipeline detected)
- Browser-based testing appears to be primary validation method

## Code Quality Controls

**Type Safety (Primary):**
- TypeScript strict mode enabled in `tsconfig.json`
- Type checking catches errors at compile time
- Interfaces defined for all props: `CustomerPickerProps`, `CheckoutItem`, etc.
- Database schema types auto-generated from Supabase

**Linting:**
- ESLint with Next.js configuration enforces code quality
- Run command: `npm run lint` (from `package.json`)
- Configuration in `eslint.config.mjs` (flat config format)

**Error Boundaries:**
- `ErrorBoundary` component (`components/ErrorBoundary.tsx`) catches React render errors
- Prevents full page crashes; shows fallback UI with retry button
- Logs uncaught errors: `console.error('Uncaught error:', error, errorInfo);`

## Testing Recommendations

**For Unit Testing:**
To implement unit tests, would require:
```bash
# Install test framework
npm install -D vitest @vitest/ui @testing-library/react @testing-library/dom

# Add test scripts to package.json
"test": "vitest run"
"test:watch": "vitest"
"test:coverage": "vitest run --coverage"
```

**Recommended Test Coverage Areas:**
- Hooks (`hooks/*.ts`): Pure logic for data fetching and state management
- Utilities (`lib/utils.ts`): Helper functions like `formatCurrency()`, `cn()`
- Context logic (`app/context/CheckoutContext.tsx`): State management and persistence
- API routes (`app/api/**/*.ts`): Request handling, validation, error codes

**Low Priority for Testing (UI-heavy):**
- React components with heavy JSX rendering
- Animation components (Framer Motion)
- UI state (modals, dropdowns, forms)

## Development Testing Approach

**Manual Testing Pattern:**
1. Run dev server: `npm run dev` (Next.js on port 3001)
2. Test UI interactions in browser
3. Check Network tab for API responses
4. Verify database state in Supabase console
5. Document test results in QA reports

**Type Safety Workflow:**
1. TypeScript catches type errors during development
2. ESLint flags code quality issues: `npm run lint`
3. Browser console shows runtime errors and warnings
4. Supabase query results indicate data layer issues

## Debugging Support

**Available Tools:**
- `console.error()` used throughout for error logging
- React DevTools browser extension support (React 19)
- Next.js built-in error overlay in development
- Browser DevTools for network inspection
- TypeScript inline errors in IDE

**Error Logging Pattern:**
```typescript
// Async operation error handling
catch (err: any) {
    console.error('Failed to load checkout state:', error);
    setError(err.message);
}
```

## Testing Gaps

**Critical Gaps:**
- No unit test coverage for hooks (useCustomers, useDrugs, etc.)
- No API route validation tests
- No context state management tests
- No integration tests for checkout flow
- No E2E test automation

**Data Persistence Testing:**
- Checkout state persists to localStorage (`STORAGE_KEY = 'vmp_checkout_state'`)
- Persistence tested manually via page reload
- No automated tests verify serialization/deserialization

**Component Testing:**
- Complex components not tested: `DrugGroupManager.tsx`, `CustomerPicker.tsx`, `TemplatePicker.tsx`
- Event handlers verified manually in browser
- No accessibility (a11y) testing

## Next Steps for Testing Implementation

**Phase 1: Unit Tests (Hooks & Utils)**
- Test `formatCurrency()` utility with various inputs
- Test `cn()` utility with class combinations
- Test hook state updates and API calls

**Phase 2: API Route Tests**
- Test request validation for POST/PUT routes
- Test error handling (409 duplicate, 401 unauthorized, 500 server error)
- Test query parameters parsing

**Phase 3: Context & State**
- Test CheckoutContext persistence to localStorage
- Test item add/remove/update operations
- Test customer selection and persistence

**Phase 4: E2E Tests**
- Test complete checkout flow
- Test customer creation and selection
- Test template and drug selection workflows

---

*Testing analysis: 2026-02-19*
