import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';
import { AncestorsChildrenResult, ChildrenResult } from '../interfaces/page-listing-results';


export const useSWRxPageAncestorsChildren = (
    path: string,
): SWRResponse<AncestorsChildrenResult, Error> => {
  return useSWR(
    `/page-listing/ancestors-children?path=${path}`,
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
