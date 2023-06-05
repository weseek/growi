import axios from 'axios';
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite';

import type { LsxApiOptions, LsxApiParams, LsxApiResponseData } from '../../interfaces/api';

import { parseNumOption } from './parse-num-option';


const LOADMORE_PAGES_NUM = 10;


export const useSWRxLsx = (
    pagePath: string, options?: Record<string, string|undefined>, isImmutable?: boolean,
): SWRInfiniteResponse<LsxApiResponseData, Error> => {

  // parse num option
  const initialOffsetAndLimit = options?.num != null
    ? parseNumOption(options.num)
    : null;

  return useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData != null && previousPageData.pages.length === 0) return null;

      // the first loading
      if (pageIndex === 0 || previousPageData == null) {
        return ['/_api/lsx', pagePath, options, initialOffsetAndLimit?.offset, initialOffsetAndLimit?.limit, isImmutable];
      }

      // loading more
      return ['/_api/lsx', pagePath, options, previousPageData.cursor, LOADMORE_PAGES_NUM, isImmutable];
    },
    async([endpoint, pagePath, options, offset, limit]) => {
      const apiOptions = Object.assign({}, options, { num: undefined }) as LsxApiOptions;
      const params: LsxApiParams = {
        pagePath,
        offset,
        limit,
        options: apiOptions,
      };
      try {
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
