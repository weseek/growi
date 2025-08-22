import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';
import { mockDeep } from 'vitest-mock-extended';

import { useSameRouteNavigation } from './use-same-route-navigation';

// Mock Next.js router
const mockRouter = mockDeep<NextRouter>();
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => mockRouter),
}));

// Mock dependencies - only mock fetchCurrentPage to test the integration
const mockFetchCurrentPage = vi.fn();
const mockMutateEditingMarkdown = vi.fn();

vi.mock('~/states/page', async() => ({
  // Use real implementations for state hooks to get closer to actual behavior
  ...(await vi.importActual('~/states/page')),
  // Only mock the fetch function since that's what we want to test
  useFetchCurrentPage: () => ({ fetchCurrentPage: mockFetchCurrentPage }),
}));

vi.mock('~/stores/editor', () => ({
  useEditingMarkdown: () => ({ mutate: mockMutateEditingMarkdown }),
}));

describe('useSameRouteNavigation - Essential Bug Fix Verification', () => {
  // Create realistic page data mock
  const createPageDataMock = (pageId: string, path: string, body: string) => ({
    _id: pageId,
    path,
    revision: {
      _id: `rev_${pageId}`,
      body,
      author: { _id: 'user1', name: 'Test User' },
      createdAt: new Date(),
    },
    creator: { _id: 'user1', name: 'Test User' },
    lastUpdateUser: { _id: 'user1', name: 'Test User' },
    grant: 1, // GRANT_PUBLIC
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Test helper to create props
  const createProps = (currentPathname: string) => {
    return { currentPathname } as Parameters<typeof useSameRouteNavigation>[0];
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Base router setup
    mockRouter.asPath = '/current/path';
    mockRouter.pathname = '/[[...path]]';
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);

    // Default fetch behavior with realistic page data
    const defaultPageData = createPageDataMock('page123', '/current/path', 'fetched content');
    mockFetchCurrentPage.mockResolvedValue(defaultPageData);
  });

  describe('CORE FIX: router.asPath dependency', () => {
    it('should fetch when router.asPath differs from props.currentPathname', async() => {
      // Bug scenario: stale props vs current router state
      const props = createProps('/stale/props/path');
      mockRouter.asPath = '/actual/browser/path';

      renderHook(() => useSameRouteNavigation(props));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verify fix: should use router.asPath, not props.currentPathname
      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/actual/browser/path');
      expect(mockFetchCurrentPage).not.toHaveBeenCalledWith('/stale/props/path');
    });

    it('should always fetch when navigating to check for content changes', async() => {
      // This test exposes the core bug: not fetching when we should
      const props = createProps('/same/path');
      mockRouter.asPath = '/same/path';

      // Set up different page data to simulate the scenario where:
      // - Current loaded page has different content than what should be loaded
      // - Same path but different page ID/content

      const currentPageData = createPageDataMock('oldPageId', '/same/path', 'Old content');
      const newPageData = createPageDataMock('newPageId', '/same/path', 'New content');

      mockFetchCurrentPage.mockResolvedValue(newPageData);

      renderHook(() => useSameRouteNavigation(props));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // CRITICAL: Should always fetch to ensure we have the latest content
      // This will currently fail because the implementation doesn't fetch
      // when it thinks the page is already loaded for the same path
      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/same/path');
      expect(mockMutateEditingMarkdown).toHaveBeenCalledWith('New content');
    });
  });

  describe('Essential behavior verification', () => {
    it('should fetch and update editor content', async() => {
      const props = createProps('/some/page');
      mockRouter.asPath = '/some/page';

      const pageData = createPageDataMock('page456', '/some/page', 'page content');
      mockFetchCurrentPage.mockResolvedValue(pageData);

      renderHook(() => useSameRouteNavigation(props));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/some/page');
      expect(mockMutateEditingMarkdown).toHaveBeenCalledWith('page content');
    });

    it('should handle navigation between different pages', async() => {
      const props = createProps('/first/page');
      mockRouter.asPath = '/first/page';

      // First page data
      const firstPageData = createPageDataMock('page1', '/first/page', 'First page content');
      mockFetchCurrentPage.mockResolvedValue(firstPageData);

      const { rerender } = renderHook(() => useSameRouteNavigation(props));

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/first/page');
      expect(mockMutateEditingMarkdown).toHaveBeenCalledWith('First page content');

      // Clear mocks and navigate to second page
      mockFetchCurrentPage.mockClear();
      mockMutateEditingMarkdown.mockClear();

      // Second page data - different ID and content
      const secondPageData = createPageDataMock('page2', '/second/page', 'Second page content');
      mockFetchCurrentPage.mockResolvedValue(secondPageData);

      // Simulate navigation to different page
      mockRouter.asPath = '/second/page';
      rerender();

      await act(async() => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should fetch new page and update content
      expect(mockFetchCurrentPage).toHaveBeenCalledWith('/second/page');
      expect(mockMutateEditingMarkdown).toHaveBeenCalledWith('Second page content');
    });
  });
});
