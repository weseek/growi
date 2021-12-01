import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';
import { apiGet } from '../client/util/apiv1-client';

import { IPage } from '../interfaces/page';
import { IPagingResult } from '../interfaces/paging-result';
import { IPageTagsInfo } from '../interfaces/pageTagsInfo';
import { IPageInfo } from '../interfaces/page-info';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxRecentlyUpdated = <Data, Error>(): SWRResponse<IPage[], Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get<{ pages: IPage[] }>(endpoint).then(response => response.data?.pages),
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxPageList = (
    path: string,
    pageNumber?: number,
): SWRResponse<IPagingResult<IPage>, Error> => {
  const page = pageNumber || 1;
  return useSWR(
    `/pages/list?path=${path}&page=${page}`,
    endpoint => apiv3Get<{pages: IPage[], totalCount: number, limit: number}>(endpoint).then((response) => {
      return {
        items: response.data.pages,
        totalCount: response.data.totalCount,
        limit: response.data.limit,
      };
    }),
  );
};

export const useSWRPageInfo = (pageId: string): SWRResponse<IPageInfo, Error> => {
  return useSWR(`/page/info?pageId=${pageId}`, endpoint => apiv3Get(endpoint).then((response) => {
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
