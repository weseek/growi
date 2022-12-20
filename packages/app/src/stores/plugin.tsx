
import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { GrowiPluginHasId } from '~/interfaces/plugin';

type Plugins = {
  plugins: GrowiPluginHasId[]
}

type Plugin = {
  plugin: GrowiPluginHasId
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

export const useSWRxPlugins = (): SWRResponse<Plugins | null, Error> => {
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

export const useSWRxPlugin = (_id: string): SWRResponse<Plugin | null, Error> => {
  return useSWR(`/plugin-${_id}`, pluginFetcher(_id));
};
