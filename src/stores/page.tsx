import useSWR, { responseInterface } from 'swr';
import { ConfigInterface } from 'swr/dist/types';
import { apiGet } from '~/client/js/util/apiv1-client';
import { apiv3Get } from '~/client/js/util/apiv3-client';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const usePageSWR = <Data, Error>(path, initialData?: any): responseInterface<Data, Error> => {
  return useSWR(
    ['/pages.get', path],
    (endpoint, path) => apiGet(endpoint, { path }).then(result => result.page),
    {
      initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useRecentlyUpdatedSWR = <Data, Error>(config?: ConfigInterface): responseInterface<Data, Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get(endpoint).then(response => response.data),
    config,
  );
};
