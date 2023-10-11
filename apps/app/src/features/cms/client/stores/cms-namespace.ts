import useSWR, { type SWRConfiguration, type SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

import type { ICmsNamespace } from '../../interfaces';

export const useSWRxCmsNamespaces = (config?: SWRConfiguration): SWRResponse<ICmsNamespace[], Error> => {
  return useSWR(
    '/cms-namespace',
    async(endpoint) => {
      return [] as ICmsNamespace[];
      // try {
      //   const res = await apiv3Get<ICmsNamespace[]>(endpoint);
      //   return res.data;
      // }
      // catch (err) {
      //   throw new Error(err);
      // }
    },
    config,
  );
};
