import type { IPageHasId } from '@growi/core';
import axios from 'axios';
import useSWR, { SWRResponse } from 'swr';

import { LsxContext } from '../components/lsx-context';

type LsxResponse = {
  pages: IPageHasId[],
  total: number,
  toppageViewersCount: number,
}

export const useSWRxLsx = (lsxContext: LsxContext, isImmutable?: boolean): SWRResponse<LsxResponse, Error> => {
  const { pagePath, options } = lsxContext;

  return useSWR(
    ['/_api/lsx', pagePath, options, isImmutable],
    async([endpoint, pagePath, options]) => {
      try {
        const res = await axios.get<LsxResponse>(endpoint, {
          params: {
            pagePath,
            options,
          },
        });
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
