import useSWR, { mutate, responseInterface } from 'swr';
import { apiGet } from '~/client/js/util/apiv1-client';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import {
  Page, Tag, Comment, PaginationResult, PaginationResultByQueryBuilder, Revision, Attachment, ShareLink,
} from '~/interfaces/page';

import { isTrashPage } from '../utils/path-utils';

import { useCurrentPagePath, useShareLinkId } from './context';

import { useStaticSWR } from './use-static-swr';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const usePageSWR = (path, initialData?: any): responseInterface<Page, Error> => {
  return useSWR(
    ['/page', path],
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.page),
    {
      initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCurrentPageSWR = (initialData?: any): responseInterface<Page, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();

  if (initialData != null) {
    mutate(['/page', currentPagePath], initialData, false);
  }

  return usePageSWR(currentPagePath);
};

export const useCurrentPageTagsSWR = (): responseInterface<Tag[], Error> => {
  const { data: currentPage } = useCurrentPageSWR();

  return useSWR(
    currentPage == null ? null : ['/pages.getPageTag', currentPage._id],
    (endpoint, pageId) => apiGet(endpoint, { pageId }).then(response => response.tags),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useCurrentPageHistorySWR = (selectedPage?:number, limit?:number): responseInterface<PaginationResult<Revision>, Error> => {
  const { data: currentPage } = useCurrentPageSWR();

  return useSWR(
    currentPage == null ? null : ['/revisions/list', currentPage._id, selectedPage, limit],
    (endpoint, pageId, selectedPage, limit) => apiv3Get(endpoint, { pageId, page: selectedPage, limit }).then(response => response.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useRevisionById = (revisionId?:string): responseInterface<Revision, Error> => {
  const { data: currentPage } = useCurrentPageSWR();
  const { data: shareLinkId } = useShareLinkId();
  const endpoint = revisionId != null ? `/revisions/${revisionId}` : null;

  return useSWR(
    currentPage == null ? null : [endpoint, currentPage._id, shareLinkId],
    (endpoint, pageId, shareLinkId) => apiv3Get(endpoint, { pageId, shareLinkId }).then(response => response.data.revision),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useLatestRevision = (): responseInterface<Revision, Error> => {
  const { data: currentPage } = useCurrentPageSWR();
  const { data: shareLinkId } = useShareLinkId();

  return useSWR(
    currentPage == null ? null : ['/revisions/list', currentPage._id, shareLinkId],
    (endpoint, pageId, shareLinkId) => apiv3Get(endpoint, {
      pageId, shareLinkId, page: 1, limit: 1,
    }).then(response => response.data.docs[0]),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useCurrentPageCommentsSWR = (): responseInterface<Comment[], Error> => {
  const { data: currentPage } = useCurrentPageSWR();

  return useSWR(
    currentPage == null ? null : ['/comments', currentPage._id],
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then(response => response.data.comments),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCurrentPageDeleted = (): responseInterface<boolean, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPage } = useCurrentPageSWR();

  if (currentPagePath == null) {
    throw new Error('currentPagePath should not be null.');
  }

  const isDeleted = currentPage != null && (isTrashPage(currentPagePath) || currentPage.status === 'deleted');

  return useStaticSWR('currentPageDeleted', isDeleted);
};

export const useRecentlyUpdatedSWR = <Data, Error>(): responseInterface<Page[], Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get(endpoint).then(response => response.data?.pages),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useCurrentPageList = (activePage: number): responseInterface<PaginationResultByQueryBuilder, Error> => {
  const { data: currentPage } = useCurrentPageSWR();

  return useSWR(
    currentPage == null ? null : ['/pages/list', currentPage.path, activePage],
    (endpoint, path, activePage) => apiv3Get(endpoint, { path, page: activePage }).then(response => response.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useCurrentPageAttachment = (activePage: number): responseInterface<PaginationResult<Attachment>, Error> => {
  const { data: currentPage } = useCurrentPageSWR();

  return useSWR(
    currentPage == null ? null : ['/attachment/list', currentPage._id, activePage],
    (endpoint, pageId, activePage) => apiv3Get(endpoint, { pageId, page: activePage }).then(response => response.data.paginateResult),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useCurrentPageShareLinks = (): responseInterface<ShareLink[], Error> => {
  const { data: currentPage } = useCurrentPageSWR();

  return useSWR(
    currentPage == null ? null : ['/share-links', currentPage._id],
    (endpoint, pageId) => apiv3Get(endpoint, { relatedPage: pageId }).then(response => response.data.shareLinksResult),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useBookmarkInfoSWR = <Data, Error>(pageId: string, initialData?: boolean): responseInterface<Data, Error> => {
  return useSWR(
    ['/bookmarks/info', pageId],
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then(response => response.data),
    {
      initialData: initialData || false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useCurrentPageSeenUsersSWR = (limit?: number):responseInterface<string[], Error> => {
  const { data: currentPage } = useCurrentPageSWR();

  const isSeenUsersExist = currentPage != null && currentPage.seenUsers.length > 0;

  return useSWR(
    // key
    currentPage == null ? null : ['/users.list', currentPage.seenUsers, limit],
    // fetcher
    isSeenUsersExist
      ? (endpoint, seenUsers) => apiGet(endpoint, { user_ids: seenUsers }).then(response => response.users.slice(limit).reverse())
      : () => [],
    // option
    {
      revalidateOnFocus: false,
    },
  );
};

export const useLikeInfoSWR = <Data, Error>(pageId: string, initialData?: boolean): responseInterface<Data, Error> => {
  return useSWR(
    ['/page/like-info', pageId],
    (endpoint, pageId) => apiv3Get(endpoint, { _id: pageId }).then(response => response.data),
    {
      initialData: initialData || false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useDescendantsCount = (pagePath: string): responseInterface<number, Error> => {
  return useSWR(
    ['/pages/descendents-count', pagePath],
    (endpoint, pagePath) => apiv3Get(endpoint, { path: pagePath }).then(response => response.data.descendantsCount),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useSubordinatedList = (pagePath: string): responseInterface<Page[], Error> => {
  return useSWR(
    ['/pages/subordinated-list', pagePath],
    (endpoint, pagePath) => apiv3Get(endpoint, { path: pagePath }).then(response => response.data.subordinatedPaths),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useExistingPaths = (pagePath: string, newParentPath:string): responseInterface<string[], Error> => {
  return useSWR(
    ['/page/exist-paths', newParentPath],
    (endpoint, toPath) => apiv3Get(endpoint, { fromPath: pagePath, toPath }).then(response => response.data.existPaths),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
