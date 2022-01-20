import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { HasObjectId } from '~/interfaces/has-object-id';

import { IPage, IPageInfo } from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';

import { useIsGuestUser } from './context';
import { checkAndUpdateImageUrlCached } from './middlewares/user';


export const useSWRxPageByPath = (path: string, initialData?: IPage): SWRResponse<IPage & HasObjectId, Error> => {
  return useSWR(
    ['/page', path],
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.page),
    {
      fallbackData: initialData,
    },
  );
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxRecentlyUpdated = (): SWRResponse<(IPage & HasObjectId)[], Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get<{ pages:(IPage & HasObjectId)[] }>(endpoint).then(response => response.data?.pages),
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
export const useSWRxPageInfo = <Data, Error>(pageId: string): SWRResponse<IPageInfo, Error> => {
  return useSWR(
    ['/page/info', pageId],
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then(response => response.data),
    { use: [checkAndUpdateImageUrlCached] },
  );
};
