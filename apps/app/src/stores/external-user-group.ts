import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { LDAPGroupSyncSettings } from '~/interfaces/external-user-group';

export const useSWRxLDAPGroupSyncSettings = (): SWRResponse<LDAPGroupSyncSettings, Error> => {
  return useSWR(
    '/external-user-groups/ldap/sync-settings',
    endpoint => apiv3Get(endpoint).then((response) => {
      return response.data;
    }),
  );
};
