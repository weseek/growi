import useSWR, { type SWRConfiguration, type SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

import type { ICmsNamespace } from '../../interfaces';

type ListCmsNamespaceResults = {
  data: ICmsNamespace[],
}

export const useSWRxCmsNamespaces = (config?: SWRConfiguration): SWRResponse<ICmsNamespace[], Error> => {
  return useSWR(
    '/cms/namespace',
    async(endpoint) => {
      try {
        const res = await apiv3Get<ListCmsNamespaceResults>(endpoint);
        return res.data.data;
      }
      catch (err) {
        throw new Error(err);
      }
    },
    config,
  );
};
