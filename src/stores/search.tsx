import useSWR, { SWRResponse } from 'swr';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import { SearchIndicesInfo as ISearchIndicesInfo } from '~/interfaces/search';
interface SearchIndicesInfoError {
  name: string;
  message: string;
  stack?: string;
  isConfigured?: boolean;
}

export const useSearchIndicesInfoSWR = (): SWRResponse<ISearchIndicesInfo, SearchIndicesInfoError> => {

  const fetcher = async (endpoint) => {
    try {
      return await apiv3Get(endpoint)
    }
    catch (error) {
      const searchIndicesInfoError: SearchIndicesInfoError = new Error(error[0].code);
      if (error[0].code === 'search-service-unconfigured') {
        searchIndicesInfoError.isConfigured = false;
      }
      else {
        searchIndicesInfoError.isConfigured = true;
      }
      throw searchIndicesInfoError;
    }
  }

  return useSWR(
    '/search/indices', fetcher, { revalidateOnFocus: false },
  );
};
