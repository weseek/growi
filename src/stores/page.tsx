import useSWR, { responseInterface } from 'swr';
import { apiv3Get } from '~/client/js/util/apiv3-client';

export const useRecentlyUpdatedSWR = <Data, Error>(): responseInterface<Data, Error> => {
  const endpoint = '/pages/recent';
  return useSWR(
    endpoint,
    () => apiv3Get(endpoint).then(response => response.data),
  );
};
