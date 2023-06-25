import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IExternalUserGroupHasId, IExternalUserGroupRelationHasId, LdapGroupSyncSettings } from '~/interfaces/external-user-group';
import { ChildUserGroupListResult, UserGroupListResult, UserGroupRelationListResult } from '~/interfaces/user-group-response';

export const useSWRxLdapGroupSyncSettings = (): SWRResponse<LdapGroupSyncSettings, Error> => {
  return useSWR(
    '/external-user-groups/ldap/sync-settings',
    endpoint => apiv3Get(endpoint).then((response) => {
      return response.data;
    }),
  );
};

export const useSWRxExternalUserGroupList = (initialData?: IExternalUserGroupHasId[]): SWRResponse<IExternalUserGroupHasId[], Error> => {
  return useSWRImmutable(
    '/external-user-groups',
    endpoint => apiv3Get<UserGroupListResult<IExternalUserGroupHasId>>(endpoint, { pagination: false }).then(result => result.data.userGroups),
    {
      fallbackData: initialData,
    },
  );
};

export const useSWRxChildExternalUserGroupList = (
    parentIds?: string[], includeGrandChildren?: boolean,
): SWRResponse<ChildUserGroupListResult<IExternalUserGroupHasId>, Error> => {
  const shouldFetch = parentIds != null && parentIds.length > 0;
  return useSWRImmutable(
    shouldFetch ? ['/external-user-groups/children', parentIds, includeGrandChildren] : null,
    ([endpoint, parentIds, includeGrandChildren]) => apiv3Get<ChildUserGroupListResult<IExternalUserGroupHasId>>(
      endpoint, { parentIds, includeGrandChildren },
    ).then((result => result.data)),
  );
};

export const useSWRxExternalUserGroupRelationList = (
    groupIds: string[] | undefined, childGroupIds?: string[], initialData?: IExternalUserGroupRelationHasId[],
): SWRResponse<IExternalUserGroupRelationHasId[], Error> => {
  return useSWRImmutable(
    groupIds != null ? ['/external-user-group-relations', groupIds, childGroupIds] : null,
    ([endpoint, groupIds, childGroupIds]) => apiv3Get<UserGroupRelationListResult<IExternalUserGroupRelationHasId>>(
      endpoint, { groupIds, childGroupIds },
    ).then(result => result.data.userGroupRelations),
    {
      fallbackData: initialData,
    },
  );
};
