
import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

// TODO: Correct types
const pluginsFetcher = () => {
  return async() => {
    const reqUrl = '/plugins-extension';
    try {
      const data = await apiv3Get(reqUrl);
      return data;
    }
    catch (err) {
      // TODO: Error handling
      console.log('err', err);
    }
  };
};

export const useSWRxPlugins = (): SWRResponse<any | null, Error> => {
  return useSWR('/pluginsExtension', pluginsFetcher());
};
