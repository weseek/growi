import useSWR, { mutate, responseInterface } from 'swr';
import { ConfigInterface } from 'swr/dist/types';
import { apiGet } from '~/client/js/util/apiv1-client';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import { Page } from '~/interfaces/page';

import { isTrashPage } from '../utils/path-utils';

import { useCurrentPagePath } from './context';
import { useStaticSWR } from './use-static-swr';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const usePageSWR = (path, initialData?: any): responseInterface<Page, Error> => {
  return useSWR(
    ['/pages.get', path],
    (endpoint, path) => apiGet(endpoint, { path }).then(result => result.page),
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
    mutate(['/pages.get', currentPagePath], initialData, false);
  }

  return usePageSWR(currentPagePath);
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

export const useDescendentsCount = (pagePath?: string): responseInterface<number, Error> => {
  if (pagePath == null) {
    throw new Error('pagePath should not be null.');
  }

  // TODO: implement by https://youtrack.weseek.co.jp/issue/GW-4871
  return useStaticSWR('descendentsCount', 10);
};
