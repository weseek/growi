import assert from 'assert';

import type {
  Nullable, HasObjectId,
  IDataWithMeta, IPageHasId, IPageInfoForListing, IPageInfoForOperation,
} from '@growi/core/dist/interfaces';
import useSWR, { Arguments, mutate, SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite';

import { IPagingResult } from '~/interfaces/paging-result';

import { apiv3Get } from '../client/util/apiv3-client';
import {
  AncestorsChildrenResult, ChildrenResult, V5MigrationStatus, RootPageResult,
} from '../interfaces/page-listing-results';


export const useSWRxPagesByPath = (path?: Nullable<string>): SWRResponse<IPageHasId[], Error> => {
  const findAll = true;
  return useSWR(
    path != null ? ['/page', path, findAll] : null,
    ([endpoint, path, findAll]) => apiv3Get(endpoint, { path, findAll }).then(result => result.data.pages),
  );
};


type RecentApiResult = {
  pages: IPageHasId[],
  totalCount: number,
  offset: number,
}
export const useSWRINFxRecentlyUpdated = (limit: number) : SWRInfiniteResponse<RecentApiResult, Error> => {
  return useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData != null && previousPageData.pages.length === 0) return null;

      if (pageIndex === 0 || previousPageData == null) {
        return ['/pages/recent', undefined, limit];
      }

      const offset = previousPageData.offset + limit;
      return ['/pages/recent', offset, limit];
    },
    ([endpoint, offset, limit]) => apiv3Get<RecentApiResult>(endpoint, { offset, limit }).then(response => response.data),
    {
      revalidateFirstPage: false,
      revalidateAll: false,
    },
  );
};

export const mutatePageList = async(): Promise<void[]> => {
  return mutate(
    key => Array.isArray(key) && key[0] === '/pages/list',
  );
};

export const useSWRxPageList = (
    path: string | null, pageNumber?: number, limit?: number,
): SWRResponse<IPagingResult<IPageHasId>, Error> => {
  return useSWR(
    path == null
      ? null
      : ['/pages/list', path, pageNumber, limit],
    ([endpoint, path, pageNumber, limit]) => {
      const args = Object.assign(
        { path, page: pageNumber ?? 1 },
        // if limit exist then add it as query string
        (limit != null) ? { limit } : {},
      );

      return apiv3Get<{pages: IPageHasId[], totalCount: number, limit: number}>(endpoint, args)
        .then((response) => {
          return {
            items: response.data.pages,
            totalCount: response.data.totalCount,
            limit: response.data.limit,
          };
        });
    },
    {
      keepPreviousData: true,
    },
  );
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

  const swrResult = useSWRImmutable(
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

export const useSWRxRootPage = (): SWRResponse<RootPageResult, Error> => {
  return useSWRImmutable(
    '/page-listing/root',
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        rootPage: response.data.rootPage,
      };
    }),
    {
      keepPreviousData: true,
    },
  );
};

const MUTATION_ID_FOR_PAGETREE = 'pageTree';
const keyMatcherForPageTree = (key: Arguments): boolean => {
  return Array.isArray(key) && key[0] === MUTATION_ID_FOR_PAGETREE;
};
export const mutatePageTree = async(): Promise<undefined[]> => {
  return mutate(keyMatcherForPageTree);
};

export const useSWRxPageAncestorsChildren = (
    path: string | null,
): SWRResponse<AncestorsChildrenResult, Error> => {
  const key = path ? [MUTATION_ID_FOR_PAGETREE, '/page-listing/ancestors-children', path] : null;

  // take care of the degration
  // see: https://github.com/weseek/growi/pull/7038

  if (key != null) {
    assert(keyMatcherForPageTree(key));
  }

  return useSWRImmutable(
    key,
    ([, endpoint, path]) => apiv3Get(endpoint, { path }).then((response) => {
      return {
        ancestorsChildren: response.data.ancestorsChildren,
      };
    }),
    {
      keepPreviousData: true,
    },
  );
};

export const useSWRxPageChildren = (
    id?: string | null,
): SWRResponse<ChildrenResult, Error> => {
  const key = id ? [MUTATION_ID_FOR_PAGETREE, '/page-listing/children', id] : null;

  if (key != null) {
    assert(keyMatcherForPageTree(key));
  }

  return useSWR(
    key,
    ([, endpoint, id]) => apiv3Get(endpoint, { id }).then((response) => {
      return {
        children: response.data.children,
      };
    }),
    {
      keepPreviousData: true,
    },
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
