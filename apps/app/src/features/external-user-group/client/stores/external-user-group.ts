import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { LdapGroupSyncSettings } from '~/features/external-user-group/interfaces/external-user-group';

export const useSWRxLdapGroupSyncSettings = (): SWRResponse<LdapGroupSyncSettings, Error> => {
  return useSWR(
    '/external-user-groups/ldap/sync-settings',
    endpoint => apiv3Get(endpoint).then((response) => {
      return response.data;
    }),
  );
};
