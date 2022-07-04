import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite';

import { apiv3Get } from '~/client/util/apiv3-client';
import { HasObjectId } from '~/interfaces/has-object-id';
import {
  IPageInfo, IPageHasId, IPageInfoForOperation, IPageInfoForListing, IDataWithMeta, IPageInfoAll,
} from '~/interfaces/page';
import { IRecordApplicableGrant, IResIsGrantNormalized } from '~/interfaces/page-grant';
import { IPagingResult } from '~/interfaces/paging-result';
import { IRevisionsForPagination } from '~/interfaces/revision';

import { apiGet } from '../client/util/apiv1-client';
import { Nullable } from '../interfaces/common';
import { IPageTagsInfo } from '../interfaces/tag';

import { useCurrentPageId, useCurrentPagePath } from './context';
import { ITermNumberManagerUtil, useTermNumberManager } from './use-static-swr';


export const useSWRxPage = (pageId?: string, shareLinkId?: string, initialData?: IPageHasId): SWRResponse<IPageHasId, Error> => {
  return useSWR<IPageHasId, Error>(
    pageId != null ? ['/page', pageId, shareLinkId] : null,
    (endpoint, pageId, shareLinkId) => apiv3Get(endpoint, { pageId, shareLinkId }).then(result => result.data.page),
    { fallbackData: initialData },
  );
};

export const useSWRxPageByPath = (path?: string): SWRResponse<IPageHasId, Error> => {
  return useSWR<IPageHasId, Error>(
    path != null ? ['/page', path] : null,
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.page),
  );
};

export const useSWRxCurrentPage = (shareLinkId?: string, initialData?: IPageHasId): SWRResponse<IPageHasId, Error> => {
  const { data: currentPageId } = useCurrentPageId();

  return useSWRxPage(currentPageId ?? undefined, shareLinkId, initialData);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxRecentlyUpdated = (): SWRResponse<(IPageHasId)[], Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get<{ pages:(IPageHasId)[] }>(endpoint).then(response => response.data?.pages),
  );
};
export const useSWRInifinitexRecentlyUpdated = () : SWRInfiniteResponse<(IPageHasId)[], Error> => {
  const getKey = (page: number) => {
    return `/pages/recent?offset=${page + 1}`;
  };
  return useSWRInfinite(
    getKey,
    (endpoint: string) => apiv3Get<{ pages:(IPageHasId)[] }>(endpoint).then(response => response.data?.pages),
    {
      revalidateFirstPage: false,
      revalidateAll: false,
    },
  );
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxPageList = (path: string | null, pageNumber?: number, termNumber?: number): SWRResponse<IPagingResult<IPageHasId>, Error> => {

  const key = path != null
    ? [`/pages/list?path=${path}&page=${pageNumber ?? 1}`, termNumber]
    : null;

  return useSWR(
    key,
    (endpoint: string) => apiv3Get<{pages: IPageHasId[], totalCount: number, limit: number}>(endpoint).then((response) => {
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

export const useSWRxDescendantsPageListForCurrrentPath = (pageNumber?: number): SWRResponse<IPagingResult<IPageHasId>, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: termNumber } = useDescendantsPageListForCurrentPathTermManager();

  const path = currentPagePath == null || termNumber == null
    ? null
    : currentPagePath;

  return useSWRxPageList(path, pageNumber, termNumber);
};

export const useSWRxTagsInfo = (pageId: Nullable<string>): SWRResponse<IPageTagsInfo, Error> => {
  const key = pageId == null ? null : `/pages.getPageTag?pageId=${pageId}`;

  return useSWRImmutable(key, endpoint => apiGet(endpoint).then((response: IPageTagsInfo) => {
    return {
      tags: response.tags,
    };
  }));
};

export const useSWRxPageInfo = (
    pageId: string | null | undefined,
    shareLinkId?: string | null,
    initialData?: IPageInfoAll,
): SWRResponse<IPageInfo | IPageInfoForOperation, Error> => {

  // assign null if shareLinkId is undefined in order to identify SWR key only by pageId
  const fixedShareLinkId = shareLinkId ?? null;

  return useSWRImmutable<IPageInfo | IPageInfoForOperation, Error>(
    pageId != null ? ['/page/info', pageId, fixedShareLinkId] : null,
    (endpoint, pageId, shareLinkId) => apiv3Get(endpoint, { pageId, shareLinkId }).then(response => response.data),
    { fallbackData: initialData },
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
    attachBookmarkCount = false,
    attachShortBody = false,
): SWRResponse<Record<string, IPageInfoForListing>, Error> & PageInfoInjector => {

  const shouldFetch = pageIds != null && pageIds.length > 0;

  const swrResult = useSWRImmutable<Record<string, IPageInfoForListing>>(
    shouldFetch ? ['/page-listing/info', pageIds, attachBookmarkCount, attachShortBody] : null,
    (endpoint, pageIds, attachBookmarkCount, attachShortBody) => {
      return apiv3Get(endpoint, { pageIds, attachBookmarkCount, attachShortBody }).then(response => response.data);
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

export const useSWRxPageRevisions = (
    pageId: string,
    page: number, // page number of pagination
    limit: number, // max number of pages in one paginate
): SWRResponse<IRevisionsForPagination, Error> => {

  return useSWRImmutable<IRevisionsForPagination, Error>(
    ['/revisions/list', pageId, page, limit],
    (endpoint, pageId, page, limit) => {
      return apiv3Get(endpoint, { pageId, page, limit }).then((response) => {
        const revisions = {
          revisions: response.data.docs,
          totalCounts: response.data.totalDocs,
        };
        return revisions;
      });
    },
  );
};

/*
 * Grant normalization fetching hooks
 */
export const useSWRxIsGrantNormalized = (
    pageId: string | null | undefined,
): SWRResponse<IResIsGrantNormalized, Error> => {

  return useSWRImmutable(
    pageId != null ? ['/page/is-grant-normalized', pageId] : null,
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then(response => response.data),
  );
};

export const useSWRxApplicableGrant = (
    pageId: string | null | undefined,
): SWRResponse<IRecordApplicableGrant, Error> => {

  return useSWRImmutable(
    pageId != null ? ['/page/applicable-grant', pageId] : null,
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then(response => response.data),
  );
};
