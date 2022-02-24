import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';

import {
  IPageInfo, IPageHasId, IPageInfoForOperation, IPageInfoForListing, IPageWithMeta, IPageWithAnyMeta,
} from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';
import { apiGet } from '../client/util/apiv1-client';
import { IPageTagsInfo } from '../interfaces/pageTagsInfo';

import { useCurrentPagePath } from './context';
import { ITermNumberManagerUtil, useTermNumberManager } from './use-static-swr';


export const useSWRxPageByPath = (path: string, initialData?: IPageHasId): SWRResponse<IPageHasId, Error> => {
  return useSWR(
    ['/page', path],
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.page),
    {
      fallbackData: initialData,
    },
  );
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxRecentlyUpdated = (): SWRResponse<(IPageHasId)[], Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get<{ pages:(IPageHasId)[] }>(endpoint).then(response => response.data?.pages),
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

export const useSWRTagsInfo = (pageId: string | null | undefined): SWRResponse<IPageTagsInfo, Error> => {
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
): SWRResponse<IPageInfo | IPageInfoForOperation, Error> => {

  // assign null if shareLinkId is undefined in order to identify SWR key only by pageId
  const fixedShareLinkId = shareLinkId ?? null;

  return useSWRImmutable(
    pageId != null ? ['/page/info', pageId, fixedShareLinkId] : null,
    (endpoint, pageId, shareLinkId) => apiv3Get(endpoint, { pageId, shareLinkId }).then(response => response.data),
  );
};

type PageInfoInjector = {
  injectTo: (pages: (IPageHasId | IPageWithAnyMeta)[]) => IPageWithMeta[],
}

const isIPageWithMeta = (page: IPageHasId | IPageWithAnyMeta): page is IPageWithAnyMeta => {
  return 'pageData' in page;
};

export const useSWRxPageInfoForList = (
    pageIds: string[] | null | undefined,
    attachShortBody = false,
): SWRResponse<Record<string, IPageInfo | IPageInfoForListing>, Error> & PageInfoInjector => {

  const shouldFetch = pageIds != null && pageIds.length > 0;

  const swrResult = useSWRImmutable<Record<string, IPageInfo | IPageInfoForListing>>(
    shouldFetch ? ['/page-listing/info', pageIds, attachShortBody] : null,
    (endpoint, pageIds, attachShortBody) => apiv3Get(endpoint, { pageIds, attachShortBody }).then(response => response.data),
  );

  return {
    ...swrResult,
    injectTo: (pages: (IPageHasId | IPageWithAnyMeta)[]) => {
      return pages.map((item) => {
        const page: IPageHasId = isIPageWithMeta(item) ? item.pageData : item;
        const orgPageMeta = isIPageWithMeta(item) ? item.pageMeta : undefined;

        // get an applicable IPageInfo
        const applicablePageInfo = (swrResult.data ?? {})[page._id];

        return {
          pageData: page,
          pageMeta: applicablePageInfo ?? orgPageMeta,
        };
      });
    },
  };
};
