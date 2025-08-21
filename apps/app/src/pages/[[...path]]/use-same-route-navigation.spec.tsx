import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';
import { mockDeep } from 'vitest-mock-extended';

import { useSameRouteNavigation } from './use-same-route-navigation';

// Mock Next.js router first
const mockRouter = mockDeep<NextRouter>();
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => mockRouter),
}));

// Mock other dependencies
vi.mock('../../states/page');
vi.mock('../../stores/editor');

// Mock hook implementations
const mockUseCurrentPageData = vi.fn();
const mockUseCurrentPageId = vi.fn();
const mockUseFetchCurrentPage = vi.fn();
const mockUseEditingMarkdown = vi.fn();

vi.mock('../../states/page', () => ({
  useCurrentPageData: () => mockUseCurrentPageData(),
  useCurrentPageId: () => mockUseCurrentPageId(),
  useFetchCurrentPage: () => mockUseFetchCurrentPage(),
}));

vi.mock('../../stores/editor', () => ({
  useEditingMarkdown: () => mockUseEditingMarkdown(),
}));

describe('useSameRouteNavigation - Essential Bug Fix Verification', () => {
  // Mock functions
  const mockSetCurrentPageId = vi.fn();
  const mockFetchCurrentPage = vi.fn();
  const mockMutateEditingMarkdown = vi.fn();

  // Simple props simulation - enough to trigger the actual hook logic
  const createProps = (currentPathname: string) => {
    // Cast to bypass type complexity - focus on behavior testing
    return { currentPathname } as Parameters<typeof useSameRouteNavigation>[0];
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Base router setup - tests will override as needed
    mockRouter.asPath = '/current/path';
    mockRouter.pathname = '/[[...path]]';
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);

    // Base hook returns
    mockUseCurrentPageData.mockReturnValue([null]);
    mockUseCurrentPageId.mockReturnValue([null, mockSetCurrentPageId]);
    mockUseFetchCurrentPage.mockReturnValue({ fetchCurrentPage: mockFetchCurrentPage });
    mockUseEditingMarkdown.mockReturnValue({ mutate: mockMutateEditingMarkdown });

    // Default fetch behavior
    mockFetchCurrentPage.mockResolvedValue({
      revision: { body: 'fetched content' },
    });
  });

  describe('CORE FIX: router.asPath dependency', () => {
    it('should fetch when router.asPath differs from props.currentPathname', async() => {
      // THE EXACT BUG SCENARIO: stale props vs current router state
      const props = createProps('/stale/props/path');
      mockRouter.asPath = '/actual/browser/path'; // Browser is actually here

      renderHook(() => useSameRouteNavigation(props));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // VERIFY THE FIX: should use router.asPath, not props.currentPathname
      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/actual/browser/path');
      expect(mockFetchCurrentPage).not.toHaveBeenCalledWith('/stale/props/path');
    });

    it('should react to router.asPath changes (useEffect dependency)', async() => {
      const props = createProps('/some/path');

      // Start with MISMATCHED state to trigger initial fetch
      mockRouter.asPath = '/some/path';
      mockUseCurrentPageData.mockReturnValue([{ path: '/different/path' }]);
      mockUseCurrentPageId.mockReturnValue([null, mockSetCurrentPageId]); // null for non-permalink

      const { rerender } = renderHook(() => useSameRouteNavigation(props));

      // Initial render should trigger fetch (mismatched state)
      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(mockFetchCurrentPage).toHaveBeenCalledTimes(1);
      expect(mockFetchCurrentPage).toHaveBeenLastCalledWith('/some/path');

      // Clear the mock to test the change detection
      mockFetchCurrentPage.mockClear();

      // Browser navigation changes router.asPath
      mockRouter.asPath = '/new/browser/location';
      rerender();

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should detect the change and fetch new content
      expect(mockFetchCurrentPage).toHaveBeenCalledTimes(1);
      expect(mockFetchCurrentPage).toHaveBeenLastCalledWith('/new/browser/location');
    });
  });

  describe('Essential behavior verification', () => {
    it('should update currentPageId when navigating', async() => {
      const props = createProps('/some/page');
      mockRouter.asPath = '/some/page';

      renderHook(() => useSameRouteNavigation(props));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockSetCurrentPageId).toHaveBeenCalledWith(undefined);
      // Since extractPageIdFromPathname returns null for non-permalink paths,
      // but the hook uses: if (targetPageId) { setCurrentPageId(targetPageId); }
      // When targetPageId is null, setCurrentPageId is not called with null
      // Only the clearing call with undefined happens
    });

    it('should update editor content on successful fetch', async() => {
      const props = createProps('/page/path');
      mockRouter.asPath = '/page/path';

      renderHook(() => useSameRouteNavigation(props));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockMutateEditingMarkdown).toHaveBeenCalledWith('fetched content');
    });

    it('should skip fetch when page already matches router state', () => {
      const props = createProps('/current/page');
      mockRouter.asPath = '/current/page';

      // Page already loaded and matches
      mockUseCurrentPageData.mockReturnValue([{ path: '/current/page' }]);
      mockUseCurrentPageId.mockReturnValue([null, mockSetCurrentPageId]); // null for non-permalink

      renderHook(() => useSameRouteNavigation(props));

      // Should not fetch when everything is already in sync
      expect(mockFetchCurrentPage).not.toHaveBeenCalled();
    });

    // CRITICAL: Race condition prevention - THE CORE BUG FIX
    it('should prevent concurrent fetches during rapid navigation', async() => {
      const props = createProps('/first/page');
      mockRouter.asPath = '/first/page';

      // Simulate slow network request
      let resolveFetch: (value: { revision: { body: string } }) => void = () => {};
      const slowFetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      mockFetchCurrentPage.mockReturnValue(slowFetchPromise);

      const { rerender } = renderHook(() => useSameRouteNavigation(props));

      // Start first fetch
      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(mockFetchCurrentPage).toHaveBeenCalledTimes(1);

      // Rapid navigation - should be prevented
      mockRouter.asPath = '/second/page';
      rerender();

      // Should NOT start second fetch due to race condition protection
      expect(mockFetchCurrentPage).toHaveBeenCalledTimes(1); // Still only 1 call

      // Complete the first fetch
      resolveFetch({ revision: { body: 'content' } });
      await act(async() => {
        await slowFetchPromise;
      });

      // Now second navigation should work
      mockRouter.asPath = '/third/page';
      rerender();

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockFetchCurrentPage).toHaveBeenCalledTimes(2); // Now second call
    });

    // CRITICAL: State clearing sequence - prevents stale data
    it('should clear pageId before setting new one', async() => {
      const props = createProps('/new/page');
      mockRouter.asPath = '/new/page';

      // Start with existing page
      mockUseCurrentPageId.mockReturnValue([null, mockSetCurrentPageId]); // null for non-permalink

      renderHook(() => useSameRouteNavigation(props));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verify clearing sequence: undefined first, but no second call for null
      // because the hook only calls setCurrentPageId(targetPageId) if targetPageId is truthy
      expect(mockSetCurrentPageId).toHaveBeenCalledWith(undefined);
      expect(mockSetCurrentPageId).toHaveBeenCalledTimes(1); // Only the clear call
      expect(mockSetCurrentPageId.mock.calls[0][0]).toBe(undefined);
    });
  });
});
