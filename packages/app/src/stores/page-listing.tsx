import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';
import { AncestorsChildrenResult, ChildrenResult, V5MigrationStatus } from '../interfaces/page-listing-results';


export const useSWRxPageAncestorsChildren = (
    path: string | null,
): SWRResponse<AncestorsChildrenResult, Error> => {
  return useSWR(
    path ? `/page-listing/ancestors-children?path=${path}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        ancestorsChildren: response.data.ancestorsChildren,
      };
    }),
    { revalidateOnFocus: false },
  );
};

export const useSWRxPageChildren = (
    id?: string | null,
): SWRResponse<ChildrenResult, Error> => {
  return useSWR(
    id ? `/page-listing/children?id=${id}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        children: response.data.children,
      };
    }),
  );
};

export const useSWRxV5MigrationStatus = (): SWRResponse<V5MigrationStatus, Error> => {
  return useSWR(
    '/pages/v5-migration-status',
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        migratablePagesCount: response.data.migratablePagesCount,
      };
    }),
  );
};
