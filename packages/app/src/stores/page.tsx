import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

import { IPage } from '~/interfaces/page';
import { IPageListResult } from '~/interfaces/page-list-result';

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
): SWRResponse<IPage[], Error> => {
  const page = pageNumber || 1;
  return useSWR(
    `/pages/list?path=${path}&page=${page}`,
    endpoint => apiv3Get<{ pageListResult: IPageListResult<IPage> }>(endpoint).then(response => response.data),
  );
};
