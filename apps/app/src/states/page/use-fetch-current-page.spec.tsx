import type {
  IPagePopulatedToShowRevision, IRevisionHasId, IUserHasId, Lang, PageGrant, PageStatus,
} from '@growi/core';
import { renderHook, waitFor } from '@testing-library/react';
// eslint-disable-next-line no-restricted-imports
import type { AxiosResponse } from 'axios';
import { Provider, createStore } from 'jotai';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

// eslint-disable-next-line no-restricted-imports
import * as apiv3Client from '~/client/util/apiv3-client';
import { useFetchCurrentPage } from '~/states/page';
import {
  currentPageDataAtom, currentPageIdAtom, pageErrorAtom, pageLoadingAtom, pageNotFoundAtom,
} from '~/states/page/internal-atoms';

// Mock Next.js router
const mockRouter = mockDeep<NextRouter>();
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => mockRouter),
}));

// Mock API client
vi.mock('~/client/util/apiv3-client');
const mockedApiv3Get = vi.spyOn(apiv3Client, 'apiv3Get');

const mockUser: IUserHasId = {
  _id: 'user1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  password: 'password',
  introduction: '',
  lang: 'en-US' as Lang,
  status: 1,
  admin: false,
  readOnly: false,
  isInvitationEmailSended: false,
  isEmailPublished: false,
  createdAt: new Date(),
  imageUrlCached: '',
  isGravatarEnabled: false,
};

// This is a minimal mock to satisfy the IPagePopulatedToShowRevision type.
// It is based on the type definition in packages/core/src/interfaces/page.ts
const createPageDataMock = (pageId: string, path: string, body: string): IPagePopulatedToShowRevision => {
  const revision: IRevisionHasId = {
    _id: `rev_${pageId}`,
    pageId,
    body,
    format: 'markdown',
    author: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    _id: pageId,
    path,
    revision,
    tags: [],
    creator: mockUser,
    lastUpdateUser: mockUser,
    deleteUser: mockUser,
    author: mockUser,
    grant: 1 as PageGrant,
    grantedUsers: [],
    grantedGroups: [],
    parent: null,
    descendantCount: 0,
    isEmpty: false,
    status: 'published' as PageStatus,
    wip: false,
    commentCount: 0,
    seenUsers: [],
    liker: [],
    expandContentWidth: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    slackChannels: '',
    deletedAt: new Date(),
  };
};


describe('useFetchCurrentPage - Integration Test', () => {

  let store: ReturnType<typeof createStore>;

  // Helper to render the hook with Jotai provider
  const renderHookWithProvider = () => {
    return renderHook(() => useFetchCurrentPage(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
  };

  const mockApiResponse = (page: IPagePopulatedToShowRevision): AxiosResponse<{ page: IPagePopulatedToShowRevision }> => {
    return {
      data: { page },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  };

  beforeEach(() => {
    store = createStore();
    vi.clearAllMocks();

    // Base router setup
    mockRouter.asPath = '/initial/path';
    mockRouter.pathname = '/[[...path]]';
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);

    // Default API response
    const defaultPageData = createPageDataMock('defaultPageId', '/initial/path', 'default content');
    mockedApiv3Get.mockResolvedValue(mockApiResponse(defaultPageData));
  });

  it('should fetch data and update atoms when called with a new path', async() => {
    // Arrange: Start at an initial page
    const initialPageData = createPageDataMock('initialPageId', '/initial/path', 'initial content');
    store.set(currentPageIdAtom, initialPageData._id);
    store.set(currentPageDataAtom, initialPageData);

    // Arrange: Navigate to a new page
    const newPageData = createPageDataMock('newPageId', '/new/page', 'new content');
    mockedApiv3Get.mockResolvedValue(mockApiResponse(newPageData));

    // Act
    const { result } = renderHookWithProvider();
    await result.current.fetchCurrentPage({ path: '/new/page' });

    // Assert: Wait for state updates
    await waitFor(() => {
      // 1. API was called correctly
      expect(mockedApiv3Get).toHaveBeenCalledWith('/page', expect.objectContaining({ path: '/new/page' }));

      // 2. Atoms were updated
      expect(store.get(currentPageIdAtom)).toBe(newPageData._id);
      expect(store.get(currentPageDataAtom)).toEqual(newPageData);
      expect(store.get(pageLoadingAtom)).toBe(false);
      expect(store.get(pageNotFoundAtom)).toBe(false);
      expect(store.get(pageErrorAtom)).toBeNull();
    });
  });

  it('should not re-fetch if target path is the same as current', async() => {
    // Arrange: Current state is set
    const currentPageData = createPageDataMock('page1', '/same/path', 'current content');
    store.set(currentPageIdAtom, currentPageData._id);
    store.set(currentPageDataAtom, currentPageData);

    // Act
    const { result } = renderHookWithProvider();
    await result.current.fetchCurrentPage({ path: '/same/path' });

    // Assert
    // Use a short timeout to ensure no fetch is initiated
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockedApiv3Get).not.toHaveBeenCalled();
  });


  it('should handle fetching the root page', async() => {
    // Arrange: Start on a regular page
    const regularPageData = createPageDataMock('regularPageId', '/some/page', 'Regular page content');
    mockedApiv3Get.mockResolvedValue(mockApiResponse(regularPageData));

    const { result } = renderHookWithProvider();
    await result.current.fetchCurrentPage({ path: '/some/page' });

    await waitFor(() => {
      expect(store.get(currentPageIdAtom)).toBe('regularPageId');
    });

    // Arrange: Navigate to the root page
    mockedApiv3Get.mockClear();
    const rootPageData = createPageDataMock('rootPageId', '/', 'Root page content');
    mockedApiv3Get.mockResolvedValue(mockApiResponse(rootPageData));

    // Act
    await result.current.fetchCurrentPage({ path: '/' });

    // Assert: Navigation to root works
    await waitFor(() => {
      expect(mockedApiv3Get).toHaveBeenCalledWith('/page', expect.objectContaining({ path: '/' }));
      expect(store.get(currentPageIdAtom)).toBe('rootPageId');
    });
  });

});
