import useSWR, { SWRResponse } from 'swr';

import { IExternalAccount } from '~/interfaces/external-account';
import { IUser } from '~/interfaces/user';

import { apiv3Get } from '../client/util/apiv3-client';


export const useSWRxPersonalSettings = (): SWRResponse<IUser, Error> => {
  return useSWR(
    '/personal-setting',
    endpoint => apiv3Get(endpoint).then(response => response.data.currentUser),
  );
};


export const useSWRxPersonalExternalAccounts = (): SWRResponse<IExternalAccount[], Error> => {
  return useSWR(
    '/personal-setting/external-accounts',
    endpoint => apiv3Get(endpoint).then(response => response.data.externalAccounts),
  );
};
