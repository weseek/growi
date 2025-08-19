import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';
import { mockDeep } from 'vitest-mock-extended';

import { extractPageIdFromPathname } from './navigation-utils';
import { useSameRouteNavigation } from './use-same-route-navigation';

// Mock Next.js router first
const mockRouter = mockDeep<NextRouter>();
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => mockRouter),
}));

// Mock other dependencies
vi.mock('../../states/page');
vi.mock('../../stores/editor');
vi.mock('./navigation-utils');

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

describe('useSameRouteNavigation', () => {
  // Mock page state
  const mockCurrentPage = {
    path: '/current-page',
    revision: {
      _id: 'revision-id',
      body: 'page content',
    },
  };

  // Mock functions
  const mockSetCurrentPageId = vi.fn();
  const mockFetchCurrentPage = vi.fn();
  const mockMutateEditingMarkdown = vi.fn();

  // Simplified mock props that avoid complex type checking - focus on navigation behavior
  const createMockProps = (currentPathname: string) => {
    return {
      currentPathname,
      // Add minimal props to avoid type errors - the hook only uses currentPathname anyway
    } as unknown as Parameters<typeof useSameRouteNavigation>[0];
  };

  // Simple type predicate that always returns false (treating as same-route navigation)
  const isInitialProps = (_props: unknown): _props is never => false;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup router mock
    mockRouter.asPath = '/test-path';
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (extractPageIdFromPathname as ReturnType<typeof vi.fn>).mockReturnValue('test-page-id');

    mockUseCurrentPageData.mockReturnValue([mockCurrentPage]);
    mockUseCurrentPageId.mockReturnValue(['current-page-id', mockSetCurrentPageId]);
    mockUseFetchCurrentPage.mockReturnValue({ fetchCurrentPage: mockFetchCurrentPage });
    mockUseEditingMarkdown.mockReturnValue({ mutate: mockMutateEditingMarkdown });

    mockFetchCurrentPage.mockResolvedValue(mockCurrentPage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Browser Back/Forward Navigation - Core Behavior Test', () => {
    it('should use router.asPath when different from props.currentPathname', async() => {
      const props = createMockProps('/page-d');

      // Setup router.asPath to simulate browser back to page C
      mockRouter.asPath = '/page-c';

      renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Core fix verification: Should fetch using router.asPath (page C), not props.currentPathname (page D)
      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/page-c');
    });

    it('should trigger useEffect when router.asPath changes during browser navigation', async() => {
      const props = createMockProps('/page-d');

      const { rerender } = renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockFetchCurrentPage).toHaveBeenCalledTimes(1);

      // Simulate browser back - router.asPath changes from /test-path to /page-c
      mockRouter.asPath = '/page-c';
      rerender();

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should trigger another fetch when router.asPath changes
      expect(mockFetchCurrentPage).toHaveBeenCalledTimes(2);
      expect(mockFetchCurrentPage).toHaveBeenLastCalledWith('/page-c');
    });

    it('should prefer router.asPath over props.currentPathname for accurate navigation', async() => {
      const props = createMockProps('/stale-props-path');

      // Browser actually navigated to /actual-browser-path but props are stale
      mockRouter.asPath = '/actual-browser-path';

      renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should use the browser's actual path, not the stale props
      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/actual-browser-path');
    });
  });

  describe('State Management During Navigation', () => {
    it('should clear current page ID before setting new one', async() => {
      const props = createMockProps('/new-page');

      renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should clear first, then set new ID
      expect(mockSetCurrentPageId).toHaveBeenNthCalledWith(1, undefined);
      expect(mockSetCurrentPageId).toHaveBeenNthCalledWith(2, 'test-page-id');
    });

    it('should update editor content with fetched page data', async() => {
      const props = createMockProps('/new-page');

      renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should update editor with the fetched page content
      expect(mockMutateEditingMarkdown).toHaveBeenCalledWith('page content');
    });
  });

  describe('Race Condition Prevention', () => {
    it('should handle concurrent navigation attempts', async() => {
      const props = createMockProps('/new-page');

      // Make fetchCurrentPage slow to simulate race condition
      mockFetchCurrentPage.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockCurrentPage), 100)));

      const { rerender } = renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      // Start first navigation
      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Start second navigation while first is in progress
      rerender();
      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Should only call fetchCurrentPage once due to race condition prevention
      expect(mockFetchCurrentPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async() => {
      const props = createMockProps('/new-page');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetchCurrentPage.mockRejectedValue(new Error('Network error'));

      renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // The hook uses router.asPath || props.currentPathname, so it uses router.asPath (/test-path)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching page data for:',
        '/test-path',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Fetch Logic Conditions', () => {
    it('should fetch when no current page data exists', async() => {
      mockUseCurrentPageData.mockReturnValue([null]);

      const props = createMockProps('/new-page');

      renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // The hook uses router.asPath || props.currentPathname, so it uses router.asPath (/test-path)
      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/test-path');
    });

    it('should fetch when current pageId differs from target pageId', async() => {
      mockUseCurrentPageId.mockReturnValue(['different-page-id', mockSetCurrentPageId]);
      (extractPageIdFromPathname as ReturnType<typeof vi.fn>).mockReturnValue('target-page-id');

      const props = createMockProps('/new-page');

      renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // The hook uses router.asPath || props.currentPathname, so it uses router.asPath (/test-path)
      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/test-path');
    });

    it('should not fetch when all conditions are already satisfied', () => {
      // Setup matching conditions - page already loaded correctly
      const matchingCurrentPage = { ...mockCurrentPage, path: '/test-path' }; // Match router.asPath
      mockUseCurrentPageData.mockReturnValue([matchingCurrentPage]);
      mockUseCurrentPageId.mockReturnValue(['same-page-id', mockSetCurrentPageId]);
      (extractPageIdFromPathname as ReturnType<typeof vi.fn>).mockReturnValue('same-page-id');

      const props = createMockProps('/same-path');

      renderHook(() => useSameRouteNavigation(props, extractPageIdFromPathname, isInitialProps));

      // Should not fetch if everything is already in sync
      expect(mockFetchCurrentPage).not.toHaveBeenCalled();
    });
  });
});
