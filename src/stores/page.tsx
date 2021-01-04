import useSWR, { mutate, responseInterface } from 'swr';
import { ConfigInterface } from 'swr/dist/types';
import { apiGet } from '~/client/js/util/apiv1-client';
import { apiv3Get } from '~/client/js/util/apiv3-client';

import { useCurrentPagePath } from './context';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const usePageSWR = <Data, Error>(path, initialData?: any): responseInterface<Data, Error> => {
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
export const useCurrentPageSWR = <Data, Error>(initialData?: any): responseInterface<Data, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();

  if (initialData != null) {
    mutate(['/pages.get', currentPagePath], initialData, false);
  }

  return usePageSWR(currentPagePath);
};

export const useRecentlyUpdatedSWR = <Data, Error>(config?: ConfigInterface): responseInterface<Data, Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get(endpoint).then(response => response.data),
    config,
  );
};

export const useIsBookmarkInfoSWR = <Data, Error>(pageId: string, initialData?: boolean): responseInterface<Data, Error> => {
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
