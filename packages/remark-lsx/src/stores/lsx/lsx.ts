import axios from 'axios';
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite';

import type { LsxApiParams, LsxApiResponseData } from '../../interfaces/api';

import { parseNumOption } from './parse-num-option';


export const useSWRxLsx = (
    pagePath: string, options?: Record<string, string|undefined>, isImmutable?: boolean,
): SWRInfiniteResponse<LsxApiResponseData, Error> => {

  // parse num option
  const initialOffsetAndLimit = options?.num != null
    ? parseNumOption(options.num)
    : null;
  delete options?.num;

  return useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData != null && previousPageData.pages.length === 0) return null;

      if (pageIndex === 0 || previousPageData == null) {
        return ['/_api/lsx', pagePath, options, initialOffsetAndLimit?.offset, initialOffsetAndLimit?.limit, isImmutable];
      }

      return ['/_api/lsx', pagePath, options, previousPageData.cursor, initialOffsetAndLimit?.limit, isImmutable];
    },
    async([endpoint, pagePath, options, offset, limit]) => {
      try {
        const params: LsxApiParams = {
          pagePath,
          offset,
          limit,
          options,
        };
        const res = await axios.get<LsxApiResponseData>(endpoint, { params });
        return res.data;
      }
      catch (err) {
        if (axios.isAxiosError(err)) {
          throw new Error(err.response?.data.message);
        }
        throw err;
      }
    },
    {
      keepPreviousData: true,
      revalidateIfStale: !isImmutable,
      revalidateOnFocus: !isImmutable,
      revalidateOnReconnect: !isImmutable,
      revalidateFirstPage: false,
      revalidateAll: false,
    },
  );
};
