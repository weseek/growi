import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';
import { apiGet } from '../client/util/apiv1-client';

import { IPage } from '../interfaces/page';
import { IPagingResult } from '../interfaces/paging-result';
import { IPageTagsInfo } from '../interfaces/pageTagsInfo';


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


export const useSWRTagsInfo = (pageId: string) : SWRResponse<IPageTagsInfo, Error> => {
  // apiGet():Promise<unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useSWR(`/pages.getPageTag?pageId=${pageId}`, endpoint => apiGet(endpoint).then((response: any) => {
    return {
      tags: response.data.tags,
    };
  }));
};
