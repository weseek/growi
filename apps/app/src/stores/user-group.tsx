import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiGet } from '~/client/util/apiv1-client';
import { apiv3Get } from '~/client/util/apiv3-client';
import { IPageHasId } from '~/interfaces/page';
import { IUserGroupHasId, IUserGroupRelationHasId } from '~/interfaces/user';
import {
  IUserGroupRelationHasIdPopulatedUser,
  UserGroupResult, UserGroupListResult, ChildUserGroupListResult, UserGroupRelationListResult, UserGroupRelationsResult,
  UserGroupPagesResult, SelectableParentUserGroupsResult, SelectableUserChildGroupsResult, AncestorUserGroupsResult,
} from '~/interfaces/user-group-response';


type MyUserGroupRelationsResult = {
  userGroupRelations: IUserGroupRelationHasId[],
}

export const useSWRxMyUserGroupRelations = (shouldFetch: boolean): SWRResponse<IUserGroupRelationHasId[], Error> => {
  return useSWR(
    shouldFetch ? '/me/user-group-relations' : null,
    endpoint => apiGet(endpoint).then(result => (result as MyUserGroupRelationsResult).userGroupRelations),
  );
};

export const useSWRxUserGroup = (groupId: string | undefined, isExternalGroup = false): SWRResponse<IUserGroupHasId, Error> => {
  const url = isExternalGroup ? `/external-user-groups/${groupId}` : `/user-groups/${groupId}`;
  return useSWRImmutable(
    groupId != null ? url : null,
    endpoint => apiv3Get<UserGroupResult>(endpoint).then(result => result.data.userGroup),
  );
};

export const useSWRxUserGroupList = (initialData?: IUserGroupHasId[], isExternalGroup = false): SWRResponse<IUserGroupHasId[], Error> => {
  const url = isExternalGroup ? '/external-user-groups' : '/user-groups';
  return useSWRImmutable(
    url,
    endpoint => apiv3Get<UserGroupListResult>(endpoint, { pagination: false }).then(result => result.data.userGroups),
    {
      fallbackData: initialData,
    },
  );
};

export const useSWRxChildUserGroupList = (
    parentIds?: string[], includeGrandChildren?: boolean, isExternalGroup = false,
): SWRResponse<ChildUserGroupListResult, Error> => {
  const shouldFetch = parentIds != null && parentIds.length > 0;
  const url = isExternalGroup ? '/external-user-groups/children' : '/user-groups/children';
  return useSWRImmutable(
    shouldFetch ? [url, parentIds, includeGrandChildren] : null,
    ([endpoint, parentIds, includeGrandChildren]) => apiv3Get<ChildUserGroupListResult>(
      endpoint, { parentIds, includeGrandChildren },
    ).then((result => result.data)),
  );
};

export const useSWRxUserGroupRelations = (groupId: string, isExternalGroup = false): SWRResponse<IUserGroupRelationHasIdPopulatedUser[], Error> => {
  const url = isExternalGroup ? `/external-user-groups/${groupId}/external-user-group-relations` : `/user-groups/${groupId}/user-group-relations`;
  return useSWRImmutable(
    groupId != null ? url : null,
    endpoint => apiv3Get<UserGroupRelationsResult>(endpoint).then(result => result.data.userGroupRelations),
  );
};

export const useSWRxUserGroupRelationList = (
    groupIds: string[] | undefined, childGroupIds?: string[], initialData?: IUserGroupRelationHasId[], isExternalGroup = false,
): SWRResponse<IUserGroupRelationHasId[], Error> => {
  const url = isExternalGroup ? '/external-user-group-relations' : '/user-group-relations';
  return useSWRImmutable(
    groupIds != null ? [url, groupIds, childGroupIds] : null,
    ([endpoint, groupIds, childGroupIds]) => apiv3Get<UserGroupRelationListResult>(
      endpoint, { groupIds, childGroupIds },
    ).then(result => result.data.userGroupRelations),
    {
      fallbackData: initialData,
    },
  );
};

export const useSWRxUserGroupPages = (groupId: string | undefined, limit: number, offset: number): SWRResponse<IPageHasId[], Error> => {
  return useSWRImmutable(
    groupId != null ? [`/user-groups/${groupId}/pages`, limit, offset] : null,
    ([endpoint, limit, offset]) => apiv3Get<UserGroupPagesResult>(endpoint, { limit, offset }).then(result => result.data.pages),
  );
};

export const useSWRxSelectableParentUserGroups = (groupId: string | undefined): SWRResponse<IUserGroupHasId[], Error> => {
  return useSWRImmutable(
    groupId != null ? ['/user-groups/selectable-parent-groups', groupId] : null,
    ([endpoint, groupId]) => apiv3Get<SelectableParentUserGroupsResult>(endpoint, { groupId }).then(result => result.data.selectableParentGroups),
  );
};

export const useSWRxSelectableChildUserGroups = (groupId: string | undefined): SWRResponse<IUserGroupHasId[], Error> => {
  return useSWRImmutable(
    groupId != null ? ['/user-groups/selectable-child-groups', groupId] : null,
    ([endpoint, groupId]) => apiv3Get<SelectableUserChildGroupsResult>(endpoint, { groupId }).then(result => result.data.selectableChildGroups),
  );
};

export const useSWRxAncestorUserGroups = (groupId: string | undefined, isExternalGroup = false): SWRResponse<IUserGroupHasId[], Error> => {
  const url = isExternalGroup ? '/external-user-groups/ancestors' : '/user-groups/ancestors';
  return useSWRImmutable(
    groupId != null ? [url, groupId] : null,
    ([endpoint, groupId]) => apiv3Get<AncestorUserGroupsResult>(endpoint, { groupId }).then(result => result.data.ancestorUserGroups),
  );
};
