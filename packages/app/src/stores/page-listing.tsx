import { Nullable, HasObjectId } from '@growi/core';
import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite';

import {
  IDataWithMeta, IPageHasId, IPageInfoForListing, IPageInfoForOperation,
} from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';

import { apiv3Get } from '../client/util/apiv3-client';
import {
  AncestorsChildrenResult, ChildrenResult, V5MigrationStatus, RootPageResult,
} from '../interfaces/page-listing-results';

import { useCurrentPagePath } from './page';
import { ITermNumberManagerUtil, useTermNumberManager } from './use-static-swr';

export const useSWRxPagesByPath = (path?: Nullable<string>): SWRResponse<IPageHasId[], Error> => {
  const findAll = true;
  return useSWR<IPageHasId[], Error>(
    path != null ? ['/page', path, findAll] : null,
    ([endpoint, path, findAll]) => apiv3Get(endpoint, { path, findAll }).then(result => result.data.pages),
  );
};

export const useSWRxRecentlyUpdated = (): SWRResponse<(IPageHasId)[], Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get<{ pages:(IPageHasId)[] }>(endpoint).then(response => response.data?.pages),
  );
};
export const useSWRInifinitexRecentlyUpdated = () : SWRInfiniteResponse<(IPageHasId)[], Error> => {
  const getKey = (page: number): string => {
    return `/pages/recent?offset=${page + 1}`;
  };
  return useSWRInfinite(
    getKey,
    endpoint => apiv3Get<{ pages:(IPageHasId)[] }>(endpoint).then(response => response.data?.pages),
    {
      revalidateFirstPage: false,
      revalidateAll: false,
    },
  );
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxPageList = (
    path: string | null, pageNumber?: number, termNumber?: number, limit?: number,
): SWRResponse<IPagingResult<IPageHasId>, Error> => {

  let key: [string, number|undefined] | null;
  // if path not exist then the key is null
  if (path == null) {
    key = null;
  }
  else {
    const pageListPath = `/pages/list?path=${path}&page=${pageNumber ?? 1}`;
    // if limit exist then add it as query string
    const requestPath = limit == null ? pageListPath : `${pageListPath}&limit=${limit}`;
    key = [requestPath, termNumber];
  }

  return useSWR(
    key,
    ([endpoint]) => apiv3Get<{pages: IPageHasId[], totalCount: number, limit: number}>(endpoint).then((response) => {
      return {
        items: response.data.pages,
        totalCount: response.data.totalCount,
        limit: response.data.limit,
      };
    }),
  );
};

export const useDescendantsPageListForCurrentPathTermManager = (isDisabled?: boolean) : SWRResponse<number, Error> & ITermNumberManagerUtil => {
  return useTermNumberManager(isDisabled === true ? null : 'descendantsPageListForCurrentPathTermNumber');
};

export const useSWRxDescendantsPageListForCurrrentPath = (pageNumber?: number, limit?:number): SWRResponse<IPagingResult<IPageHasId>, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: termNumber } = useDescendantsPageListForCurrentPathTermManager();

  const path = currentPagePath == null || termNumber == null
    ? null
    : currentPagePath;

  return useSWRxPageList(path, pageNumber, termNumber, limit);
};


type PageInfoInjector = {
  injectTo: <D extends HasObjectId>(pages: (D | IDataWithMeta<D>)[]) => IDataWithMeta<D, IPageInfoForOperation>[],
}

const isIDataWithMeta = (item: HasObjectId | IDataWithMeta): item is IDataWithMeta => {
  return 'data' in item;
};

export const useSWRxPageInfoForList = (
    pageIds: string[] | null | undefined,
    path: string | null | undefined = null,
    attachBookmarkCount = false,
    attachShortBody = false,
): SWRResponse<Record<string, IPageInfoForListing>, Error> & PageInfoInjector => {

  const shouldFetch = (pageIds != null && pageIds.length > 0) || path != null;

  const swrResult = useSWRImmutable<Record<string, IPageInfoForListing>>(
    shouldFetch ? ['/page-listing/info', pageIds, path, attachBookmarkCount, attachShortBody] : null,
    ([endpoint, pageIds, path, attachBookmarkCount, attachShortBody]) => {
      return apiv3Get(endpoint, {
        pageIds, path, attachBookmarkCount, attachShortBody,
      }).then(response => response.data);
    },
  );

  return {
    ...swrResult,
    injectTo: <D extends HasObjectId>(pages: (D | IDataWithMeta<D>)[]) => {
      return pages.map((item) => {
        const page = isIDataWithMeta(item) ? item.data : item;
        const orgPageMeta = isIDataWithMeta(item) ? item.meta : undefined;

        // get an applicable IPageInfo
        const applicablePageInfo = (swrResult.data ?? {})[page._id];

        return {
          data: page,
          meta: applicablePageInfo ?? orgPageMeta,
        };
      });
    },
  };
};

export const usePageTreeTermManager = (isDisabled?: boolean) : SWRResponse<number, Error> & ITermNumberManagerUtil => {
  return useTermNumberManager(isDisabled === true ? null : 'pageTreeTermManager');
};

export const useSWRxRootPage = (): SWRResponse<RootPageResult, Error> => {
  return useSWRImmutable(
    '/page-listing/root',
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        rootPage: response.data.rootPage,
      };
    }),
  );
};

export const useSWRxPageAncestorsChildren = (
    path: string | null,
): SWRResponse<AncestorsChildrenResult, Error> => {
  const { data: termNumber } = usePageTreeTermManager();

  // HACKME: Consider using global mutation from useSWRConfig and not to use term number -- 2022/12/08 @hakumizuki
  const prevTermNumber = termNumber ? termNumber - 1 : 0;
  const prevSWRRes = useSWRImmutable(path ? [`/page-listing/ancestors-children?path=${path}`, prevTermNumber] : null);

  return useSWRImmutable(
    path ? [`/page-listing/ancestors-children?path=${path}`, termNumber] : null,
    ([endpoint]) => apiv3Get(endpoint).then((response) => {
      return {
        ancestorsChildren: response.data.ancestorsChildren,
      };
    }),
    {
      fallbackData: prevSWRRes.data, // avoid data to be undefined due to the termNumber to change
    },
  );
};

export const useSWRxPageChildren = (
    id?: string | null,
): SWRResponse<ChildrenResult, Error> => {
  const { data: termNumber } = usePageTreeTermManager();

  return useSWR(
    id ? [`/page-listing/children?id=${id}`, termNumber] : null,
    ([endpoint]) => apiv3Get(endpoint).then((response) => {
      return {
        children: response.data.children,
      };
    }),
  );
};

export const useSWRxV5MigrationStatus = (
): SWRResponse<V5MigrationStatus, Error> => {
  return useSWR(
    '/pages/v5-migration-status',
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        isV5Compatible: response.data.isV5Compatible,
        migratablePagesCount: response.data.migratablePagesCount,
      };
    }),
  );
};
