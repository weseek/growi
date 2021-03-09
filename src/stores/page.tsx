import useSWR, { mutate, responseInterface } from 'swr';
import { ConfigInterface } from 'swr/dist/types';
import { apiGet } from '~/client/js/util/apiv1-client';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import {
  Page, Tag, Comment, PaginationResult, Revision,
} from '~/interfaces/page';
import { User } from '~/interfaces/user';

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
    ['/pages.getPageTag', currentPage],
    (endpoint, page) => apiGet(endpoint, { pageId: page.id }).then(response => response.tags),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useCurrentPageHistorySWR = (selectedPage?:number, limit?:number): responseInterface<PaginationResult<Revision>, Error> => {
  const { data: currentPage } = useCurrentPageSWR();

  return useSWR(
    ['/revisions/list', currentPage, selectedPage, limit],
    (endpoint, page, selectedPage, limit) => apiv3Get(endpoint, { pageId: page.id, page: selectedPage, limit }).then(response => response.data),
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
    [endpoint, currentPage, shareLinkId],
    (endpoint, page, shareLinkId) => apiv3Get(endpoint, { pageId: page.id, shareLinkId }).then(response => response.data.revision),
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
    ['/revisions/list', currentPage, shareLinkId],
    (endpoint, page, shareLinkId) => apiv3Get(endpoint, {
      pageId: page.id, shareLinkId, page: 1, limit: 1,
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
    ['/comments', currentPage],
    (endpoint, page) => apiv3Get(endpoint, { pageId: page.id }).then(response => response.data.comments),
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
  if (currentPage == null) {
    throw new Error('currentPage should not be null.');
  }

  const isDeleted = isTrashPage(currentPagePath) || (currentPage != null && currentPage.status === 'deleted');

  return useStaticSWR('currentPageDeleted', isDeleted);
};

export const useRecentlyUpdatedSWR = <Data, Error>(config?: ConfigInterface): responseInterface<Data, Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get(endpoint).then(response => response.data),
    config,
  );
};

export const useBookmarkInfoSWR = <Data, Error>(pageId: string, initialData?: boolean): responseInterface<Data, Error> => {
  return useSWR(
    '/bookmarks/info',
    endpoint => apiv3Get(endpoint, { pageId }).then(response => response.data),
    {
      initialData: initialData || false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useSeenUsersSWR = (limit?: number):responseInterface<User[], Error> => {
  const { data: currentPage } = useCurrentPageSWR();
  return useSWR(
    ['/users.list', currentPage, limit],
    endpoint => apiGet(endpoint, { user_ids: currentPage?.seenUsers }).then(response => response.users.slice(limit)),
    {
      revalidateOnFocus: false,
    },
  );
};

export const useLikeInfoSWR = <Data, Error>(pageId: string, initialData?: boolean): responseInterface<Data, Error> => {
  return useSWR(
    '/page/like-info',
    endpoint => apiv3Get(endpoint, { _id: pageId }).then(response => response.data),
    {
      initialData: initialData || false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useDescendantsCount = (pagePath?: string): responseInterface<number, Error> => {
  const endpoint = '/pages/descendents-count';
  const key = pagePath != null ? endpoint : null;
  return useSWR(
    key,
    endpoint => apiv3Get(endpoint, { path: pagePath }).then(response => response.data.descendantsCount),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
