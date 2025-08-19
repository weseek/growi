# Navigation Bug Fix Refactoring Plan

## Background
Successfully fixed the browser back/forward navigation bug where page content wasn't updating correctly. The fix involved:
- Adding `useRouter` to monitor `router.asPath` 
- Using `router.asPath || props.currentPathname` for correct path detection
- Adding `router.asPath` to useEffect dependencies

## Current State Analysis

### Problems to Address
1. **Debug logs scattered throughout the code** - Need to remove console.debug/console.error statements
2. **Logic concentration in use-same-route-navigation.ts** - Single large useEffect with complex logic
3. **navigation-utils.ts redundancy** - Only contains `extractPageIdFromPathname` function
4. **Code readability** - Complex conditional logic and state management in one place

### Core Functionality to Preserve
- Browser back/forward navigation support via `router.asPath` monitoring
- Race condition prevention with `isFetchingRef` and `lastProcessedPathnameRef`
- Initial data skip logic for SSR optimization
- Proper state clearing and updating sequence
- Error handling during fetch operations

## Refactoring Plan

### Phase 1: Test Coverage
**Objective**: Create comprehensive tests to prevent regressions

#### Test Scenarios
1. **Normal Navigation Flow**
   - A→B→C→D transitions trigger correct fetches
   - Page data updates correctly
   - No duplicate fetches for same path

2. **Browser Back/Forward Navigation**
   - Browser back from D→C displays correct content
   - Browser forward navigation works correctly
   - URL and content stay synchronized

3. **Edge Cases**
   - Initial load with SSR data (skipSSR scenarios)
   - Concurrent navigation attempts
   - Network errors during fetch
   - Empty/null page data handling

4. **State Management**
   - pageId updates correctly
   - currentPage state synchronization
   - editing markdown updates

#### Test Implementation Strategy
- Use Jest + React Testing Library
- Mock `useRouter`, `useFetchCurrentPage`, page state hooks
- Create helper functions for navigation simulation
- Focus on behavior assertions rather than implementation details

### Phase 2: Code Refactoring

#### Option A: Keep Separation (Recommended)
**navigation-utils.ts** - Pure utility functions
```typescript
// Path processing utilities
export const extractPageIdFromPathname = (pathname: string): string | null
export const shouldFetchPage = (params: ShouldFetchParams): boolean
export const createNavigationTarget = (router: NextRouter, props: Props): string
```

**use-same-route-navigation.ts** - Hook with extracted functions
```typescript
// Private helper functions
const useNavigationRefs = () => ({ lastProcessedRef, isFetchingRef })
const useNavigationTarget = (router, props) => string
const usePageDataUpdater = () => (targetPathname: string) => Promise<void>

// Main hook with clean useEffect
export const useSameRouteNavigation = (props, ...) => void
```

#### Option B: Consolidation
Merge navigation-utils.ts into use-same-route-navigation.ts if utilities are only used there.

#### Refactoring Steps
1. **Extract pure functions** from useEffect logic
2. **Create custom sub-hooks** for related functionality
3. **Remove debug logging** throughout codebase
4. **Simplify conditional logic** with extracted functions
5. **Improve error handling** with consistent patterns
6. **Add comprehensive JSDoc** documentation

### Phase 3: Validation
1. **Run comprehensive test suite** - All tests must pass
2. **Manual testing** of navigation scenarios
3. **Performance verification** - No regressions in render frequency
4. **Code review** - Ensure readability improvements

## Success Criteria
- [ ] All tests pass (100% coverage of critical paths)
- [ ] No debug logs in production code
- [ ] Functions are single-responsibility and testable
- [ ] Code is self-documenting with clear naming
- [ ] Browser navigation bug remains fixed
- [ ] No performance regressions

## Implementation Notes
- Preserve the core fix: `router.asPath` monitoring
- Maintain backward compatibility with existing API
- Keep useEffect dependencies minimal and clear
- Ensure error boundaries don't break navigation flow