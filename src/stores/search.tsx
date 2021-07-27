import useSWR, { SWRResponse } from 'swr';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import { SearchIndicesInfo as ISearchIndicesInfo } from '~/interfaces/search';

export const useSearchIndicesInfoSWR = (): SWRResponse<ISearchIndicesInfo, Error> => {

  const fetcher = async (endpoint) => {
    try {
      return await apiv3Get(endpoint)
    }
    catch (error) {
      if (error[0].code === 'search-service-unconfigured') {
        return { isConfigured: false }
      }
      throw error
    }
  }

  return useSWR(
    '/search/indices', fetcher, { revalidateOnFocus: false },
  );
};
