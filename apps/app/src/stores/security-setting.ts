import type { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';


// const response = await apiv3Get('/security-setting/');
// const { generalSetting, shareLinkSetting, generalAuth } = response.data.securityParams;

export const useSecuritySettings = (): SWRResponse => {
  const swrResponse = useSWRImmutable(
    '/security-setting/',
    (endpoint) => {
      return apiv3Get(endpoint).then(response => response.data.securityParams);
    },
  );

  return {
    ...swrResponse,
  };
};
