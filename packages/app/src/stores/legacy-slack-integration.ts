import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '../client/util/apiv3-client';


export const useSWRxLegacySlackIntegrationSetting = (): SWRResponse<any, Error> => {
  return useSWR<any, Error>(
    apiv3Get('/slack-integration-legacy-settings/').then(response => response.data),
  );
};
