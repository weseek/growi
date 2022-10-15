
import useSWR, { SWRResponse } from 'swr';

import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';

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


// const repositoryFetcher = (owner: string, repo: string) => {
//   return async () => {
//     const reqUrl = `/api/fetch_repository?owner=${owner}&repo=${repo}`
//     const data = await fetch(reqUrl).then(res => res.json())
//     return data.searchResultItem
//   }
// }

// export const useGitHubRepository = (owner: string, repo: string): SWRResponse<SearchResultItem | null, Error> => {
//   return useSWR(`${owner}/{repo}`, repositoryFetcher(owner, repo))
// }

const pluginFetcher = (id: string) => {
  console.log('featcher', id);
  return async() => {
    const reqUrl = '/plugins-extension/swrplugin';
    try {
      const data = await apiv3Post(reqUrl, { _id: id });
      console.log('fetcher');
      return data;
    }
    catch (err) {
      // TODO: Error handling
      console.log('aa');
      console.log('err', err);
    }
  };
};

export const useSWRxPlugin = (_id: string): SWRResponse<any | null, Error> => {
  return useSWR(`/plugin-${_id}`, pluginFetcher(_id));
};
