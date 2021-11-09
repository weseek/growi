import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';
import { TargetAndAncestorsResult, AncestorsChildrenResult } from '../interfaces/page-listing-results';


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

export const useSWRxPageAncestors = (
    path: string,
    id: string,
): SWRResponse<TargetAndAncestorsResult, Error> => {
  return useSWR(
    `/page-listing/target-ancestors?path=${path}&id=${id}`,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        targetAndAncestors: response.data.targetAndAncestors,
      };
    }),
  );
};

