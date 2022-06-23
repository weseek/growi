import useSWR, { SWRResponse } from 'swr';

import { IExternalAccount } from '~/interfaces/external-account';

import { apiv3Get } from '../client/util/apiv3-client';


export const useSWRxPersonalExternalAccounts = (): SWRResponse<IExternalAccount[], Error> => {
  return useSWR(
    '/personal-setting/external-accounts',
    endpoint => apiv3Get(endpoint).then(response => response.data.externalAccounts),
  );
};
