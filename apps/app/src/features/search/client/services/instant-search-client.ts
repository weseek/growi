import type { MultipleQueriesQuery, SearchResponse } from '@algolia/client-search';

import { apiGet } from '~/client/util/apiv1-client';
import { IFormattedSearchResult } from '~/interfaces/search';


const search = async <T = Record<string, any>>(requests: readonly MultipleQueriesQuery[]): Promise<{ results: Array<SearchResponse<T>> }> => {

  for await (const request of requests) {
    const response = await apiGet('/search', { q: request.params?.query }) as IFormattedSearchResult;
  }

  const dummyResponse = { results: [] } as any;
  return dummyResponse;
};

export const InstantSearchClient = {
  search,
};
