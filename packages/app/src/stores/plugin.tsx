
import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { GrowiPluginHasId } from '~/interfaces/plugin';

type plugins = {
  plugins: GrowiPluginHasId[][]
}

type pluginIsEnalbed = {
  isEnabled: boolean
}

const pluginsFetcher = () => {
  return async() => {
    const reqUrl = '/plugins';

    try {
      const res = await apiv3Get(reqUrl);
      return res.data;
    }
    catch (err) {
      throw new Error(err);
    }
  };
};

export const useSWRxPlugins = (): SWRResponse<plugins | null, Error> => {
  return useSWR('/plugins', pluginsFetcher());
};

const pluginFetcher = (id: string) => {
  return async() => {
    const reqUrl = `/plugins/${id}`;

    try {
      const res = await apiv3Get(reqUrl);
      return res.data;
    }
    catch (err) {
      throw new Error(err);
    }
  };
};

export const useSWRxPlugin = (_id: string): SWRResponse<pluginIsEnalbed | null, Error> => {
  return useSWR(`/plugin-${_id}`, pluginFetcher(_id));
};
