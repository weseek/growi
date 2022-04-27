import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '../client/util/apiv3-client';
import {
  AncestorsChildrenResult, ChildrenResult, V5MigrationStatus, RootPageResult,
} from '../interfaces/page-listing-results';
import { ITermNumberManagerUtil, useTermNumberManager } from './use-static-swr';


export const usePageTreeTermManager = (isDisabled?: boolean) : SWRResponse<number, Error> & ITermNumberManagerUtil => {
  return useTermNumberManager(isDisabled === true ? null : 'fullTextSearchTermNumber');
};

export const useSWRxRootPage = (): SWRResponse<RootPageResult, Error> => {
  return useSWR(
    '/page-listing/root',
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        rootPage: response.data.rootPage,
      };
    }),
    { revalidateOnFocus: false },
  );
};

export const useSWRxPageAncestorsChildren = (
    path: string | null,
): SWRResponse<AncestorsChildrenResult, Error> => {
  const { data: termNumber } = usePageTreeTermManager();

  return useSWR(
    path ? [`/page-listing/ancestors-children?path=${path}`, termNumber] : null,
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
  const { data: termNumber } = usePageTreeTermManager();

  return useSWR(
    id ? [`/page-listing/children?id=${id}`, termNumber] : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        children: response.data.children,
      };
    }),
  );
};

export const useSWRxV5MigrationStatus = (
): SWRResponse<V5MigrationStatus, Error> => {
  return useSWR(
    '/pages/v5-migration-status',
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        isV5Compatible: response.data.isV5Compatible,
        migratablePagesCount: response.data.migratablePagesCount,
      };
    }),
  );
};
