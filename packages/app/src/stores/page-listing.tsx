import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';
import { AncestorsChildrenResult } from '../interfaces/page-listing-results';


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
  );
};
