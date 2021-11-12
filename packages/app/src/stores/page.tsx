import useSWR, { SWRResponse } from 'swr';

import { Types } from 'mongoose';

import { apiv3Get } from '~/client/util/apiv3-client';
import { SubscribeStatuses } from '~/interfaces/in-app-notification-settings';

import { IPage } from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';


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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxSubscribeButton = <Data, Error>(
  pageId: Types.ObjectId,

): SWRResponse<{status: boolean | null}, Error> => {
  return useSWR(
    'page/subscribe',
    endpoint => apiv3Get(endpoint, { pageId }).then((response) => {
      return {
        status: response.data.subscribing,
      };
    }),
  );
};
