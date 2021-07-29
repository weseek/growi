import useSWR, { SWRResponse } from 'swr';
import { apiv3Get } from '~/client/js/util/apiv3-client';
import { slackIntegrationParams as ISlackIntegrationParams } from '~/interfaces/admin';

export const useSlackIntegrationSWR = (): SWRResponse<ISlackIntegrationParams, Error> => {
  return useSWR(
    '/slack-integration-settings',
    (endpoint) => apiv3Get(endpoint).then(result => result),
    { revalidateOnFocus: false },
  );
};
