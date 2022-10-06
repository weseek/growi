import useSWR, { SWRResponse } from 'swr';

import { SearchResult } from '../models/SearchResult';
import { SearchResultItem } from '../models/SearchResultItem';

const pluginFetcher = (owner: string, repo: string) => {
  return async() => {
    const reqUrl = `/api/fetch_repository?owner=${owner}&repo=${repo}`;
    const data = await fetch(reqUrl).then(res => res.json());
    return data.searchResultItem;
  };
};

export const useInstalledPlugin = (owner: string, repo: string): SWRResponse<SearchResultItem | null, Error> => {
  return useSWR(`${owner}/{repo}`, pluginFetcher(owner, repo));
};

const pluginsFetcher = () => {
  return async() => {
    const reqUrl = '/api/fetch_repositories';
    const data = await fetch(reqUrl).then(res => res.json());
    return data.searchResult;
  };
};

export const useInstalledPlugins = (): SWRResponse<SearchResult | null, Error> => {
  return useSWR('/api/fetch_repositories', pluginsFetcher());
};
