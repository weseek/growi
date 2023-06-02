import type { IPageHasId } from '@growi/core';
import axios from 'axios';
import useSWR, { SWRResponse } from 'swr';

import { LsxApiParams } from '../../interfaces/api';

import { parseNumOption } from './parse-num-option';

type LsxResponse = {
  pages: IPageHasId[],
  total: number,
  toppageViewersCount: number,
}

export const useSWRxLsx = (pagePath: string, options?: Record<string, string|undefined>, isImmutable?: boolean): SWRResponse<LsxResponse, Error> => {
  return useSWR(
    ['/_api/lsx', pagePath, options, isImmutable],
    async([endpoint, pagePath, options]) => {
      try {
        const offsetAndLimit = options?.num != null
          ? parseNumOption(options.num)
          : null;

        const params: LsxApiParams = {
          pagePath,
          offset: offsetAndLimit?.offset,
          limit: offsetAndLimit?.limit,
          options,
        };
        const res = await axios.get<LsxResponse>(endpoint, { params });
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
    },
  );
};
