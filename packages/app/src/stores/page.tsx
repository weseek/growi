import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

import { IPage } from '~/interfaces/page';

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
    number: number,
): SWRResponse<IPage[], Error> => {
  return useSWR(
    `/pages/list?path=${path}&page=${number}`,
    endpoint => apiv3Get<{ pages: IPage[] }>(endpoint).then(response => response.data?.pages),
  );
};
