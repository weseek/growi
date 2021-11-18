import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

import { IPage } from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';
import { IConflictRevisions } from '~/interfaces/revision';


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

export const useSWRxConflictedRevision = (pagePath: string): SWRResponse<IConflictRevisions, Error> => {
  return useSWR(
    `/page/conflict-revisions?pagePath=${pagePath}`,
    endpoint => apiv3Get<{ revisions: IConflictRevisions }>(endpoint).then((response) => {
      return response.data.revisions;
    }),
  );
};
