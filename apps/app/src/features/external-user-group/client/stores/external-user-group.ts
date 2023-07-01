import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IExternalUserGroupHasId, IExternalUserGroupRelationHasId, LdapGroupSyncSettings } from '~/features/external-user-group/interfaces/external-user-group';
import { ChildUserGroupListResult, IUserGroupRelationHasIdPopulatedUser, UserGroupRelationListResult } from '~/interfaces/user-group-response';

export const useSWRxLdapGroupSyncSettings = (): SWRResponse<LdapGroupSyncSettings, Error> => {
  return useSWR(
    '/external-user-groups/ldap/sync-settings',
    endpoint => apiv3Get(endpoint).then((response) => {
      return response.data;
    }),
  );
};

export const useSWRxExternalUserGroup = (groupId: string): SWRResponse<IExternalUserGroupHasId, Error> => {
  return useSWRImmutable(
    `/external-user-groups/${groupId}`,
    endpoint => apiv3Get(endpoint).then(result => result.data.externalUserGroup),
  );
};

export const useSWRxExternalUserGroupList = (initialData?: IExternalUserGroupHasId[]): SWRResponse<IExternalUserGroupHasId[], Error> => {
  return useSWRImmutable(
    '/external-user-groups',
    endpoint => apiv3Get(endpoint, { pagination: false }).then(result => result.data.externalUserGroups),
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

export const useSWRxExternalUserGroupRelations = (groupId: string): SWRResponse<IUserGroupRelationHasIdPopulatedUser[], Error> => {
  return useSWRImmutable(
    groupId != null ? `/external-user-groups/${groupId}/external-user-group-relations` : null,
    endpoint => apiv3Get(endpoint).then(result => result.data.userGroupRelations),
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

export const useSWRxAncestorExternalUserGroups = (groupId: string | undefined): SWRResponse<IExternalUserGroupHasId[], Error> => {
  return useSWRImmutable(
    groupId != null ? ['/external-user-groups/ancestors', groupId] : null,
    ([endpoint, groupId]) => apiv3Get(endpoint, { groupId }).then(result => result.data.ancestorExternalUserGroups),
  );
};
