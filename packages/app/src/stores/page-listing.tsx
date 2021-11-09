import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';
import { SiblingsResult, AncestorsResult } from '../interfaces/page-listing-results';


export const useSWRxPageSiblings = (
    path: string,
): SWRResponse<SiblingsResult, Error> => {
  return useSWR(
    `/page-listing/siblings?path=${path}`,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        targetAndSiblings: response.data.targetAndSiblings,
      };
    }),
  );
};


export const useSWRxPageAncestors = (
    path: string,
    id: string,
): SWRResponse<AncestorsResult, Error> => {
  return useSWR(
    `/page-listing/ancestors?path=${path}&id=${id}`,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        ancestors: response.data.ancestors,
      };
    }),
  );
};
