/**
 * Custom hooks and utilities for [[...path]].page.tsx component
 *
 * This module exports navigation and routing hooks that were extracted
 * from the main page component to improve maintainability and testability.
 * Also includes optimized utility functions for common navigation operations.
 */

export { useSameRouteNavigation } from '../use-same-route-navigation';
export { useShallowRouting } from '../use-shallow-routing';
export { extractPageIdFromPathname, createNavigationState, isSamePage } from '../navigation-utils';
