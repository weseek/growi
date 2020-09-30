import useSWR, { responseInterface } from 'swr';
import { ConfigInterface } from 'swr/dist/types';
import { apiv3Get } from '~/client/js/util/apiv3-client';

export const useCheckUsernameSWR = <Data, Error>(username?: string, config?: ConfigInterface): responseInterface<Data, Error> => {
  const endpoint = '/_api/check_username';
  return useSWR(
    username != null ? endpoint : null,
    () => apiv3Get(endpoint, { username }).then(response => response.data),
    config,
  );
};
