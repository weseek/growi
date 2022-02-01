import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

import { IPage, IPageHasId } from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';
import { apiGet } from '../client/util/apiv1-client';

import { IPageTagsInfo } from '../interfaces/pageTagsInfo';
import { IPageInfo } from '../interfaces/page-info';
import { useIsGuestUser } from './context';


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
export const useSWRxPageList = (
    path: string,
    pageNumber?: number,
): SWRResponse<IPagingResult<IPageHasId>, Error> => {
  const page = pageNumber || 1;
  return useSWR(
    `/pages/list?path=${path}&page=${page}`,
    endpoint => apiv3Get<{pages: IPageHasId[], totalCount: number, limit: number}>(endpoint).then((response) => {
      return {
        items: response.data.pages,
        totalCount: response.data.totalCount,
        limit: response.data.limit,
      };
    }),
  );
};

export const useSWRPageInfo = (pageId: string | null): SWRResponse<IPageInfo, Error> => {
  return useSWR(pageId != null ? `/page/info?pageId=${pageId}` : null, endpoint => apiv3Get(endpoint).then((response) => {
    return {
      sumOfLikers: response.data.sumOfLikers,
      likerIds: response.data.likerIds,
      seenUserIds: response.data.seenUserIds,
      sumOfSeenUsers: response.data.sumOfSeenUsers,
      isSeen: response.data.isSeen,
      isLiked: response.data?.isLiked,
    };
  }));
};

export const useSWRTagsInfo = (pageId: string): SWRResponse<IPageTagsInfo, Error> => {
  return useSWR(`/pages.getPageTag?pageId=${pageId}`, endpoint => apiGet(endpoint).then((response: IPageTagsInfo) => {
    return {
      tags: response.tags,
    };
  }));
};
type GetSubscriptionStatusResult = { subscribing: boolean };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxSubscriptionStatus = <Data, Error>(pageId: string): SWRResponse<{status: boolean | null}, Error> => {
  const { data: isGuestUser } = useIsGuestUser();
  const key = isGuestUser === false ? ['/page/subscribe', pageId] : null;
  return useSWR(
    key,
    (endpoint, pageId) => apiv3Get<GetSubscriptionStatusResult>(endpoint, { pageId }).then((response) => {
      return {
        status: response.data.subscribing,
      };
    }),
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxPageInfo = <Data, Error>(pageId: string | undefined): SWRResponse<IPageInfo, Error> => {
  return useSWR(
    pageId != null ? ['/page/info', pageId] : null,
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then(response => response.data),
  );
};
