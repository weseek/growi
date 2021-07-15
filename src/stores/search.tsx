import useSWR, { responseInterface } from 'swr';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import { SearchIndicesInfo as ISearchIndicesInfo } from '~/interfaces/search';

export const useIndicesSWR = (): responseInterface<ISearchIndicesInfo, Error> => {
  return useSWR(
    '/search/indices',
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result),
    { revalidateOnFocus: false },
  );
};
