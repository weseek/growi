
import useSWR, { SWRResponse } from 'swr';

import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';

// TODO: Correct types
const pluginsFetcher = () => {
  return async() => {
    const reqUrl = '/plugins';
    try {
      const data = await apiv3Get(reqUrl);
      return data;
    }
    catch (err) {
      throw new Error(err);
    }
  };
};

export const useSWRxPlugins = (): SWRResponse<any | null, Error> => {
  return useSWR('/pluginsExtension', pluginsFetcher());
};

const pluginFetcher = (id: string) => {
  return async() => {
    const reqUrl = '/plugins/get-isenabled';
    try {
      const data = await apiv3Post(reqUrl, { _id: id });
      return data;
    }
    catch (err) {
      throw new Error(err);
    }
  };
};

export const useSWRxPlugin = (_id: string): SWRResponse<any | null, Error> => {
  return useSWR(`/plugin-${_id}`, pluginFetcher(_id));
};
