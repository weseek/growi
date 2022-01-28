import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';

import { IPageHasId } from '~/interfaces/page';
import { IUserGroupHasId, IUserGroupRelationHasId } from '~/interfaces/user';
import {
  UserGroupListResult, ChildUserGroupListResult, UserGroupRelationListResult, UserGroupPagesResult,
} from '~/interfaces/user-group-response';


export const useSWRxUserGroupList = (initialData?: IUserGroupHasId[]): SWRResponse<IUserGroupHasId[], Error> => {
  return useSWRImmutable<IUserGroupHasId[], Error>(
    '/user-groups',
    endpoint => apiv3Get<UserGroupListResult>(endpoint, { pagination: false }).then(result => result.data.userGroups),
    {
      fallbackData: initialData,
    },
  );
};

export const useSWRxChildUserGroupList = (
    parentIds?: string[], includeGrandChildren?: boolean, initialData?: IUserGroupHasId[],
): SWRResponse<IUserGroupHasId[], Error> => {
  const shouldFetch = parentIds != null && parentIds.join() !== '';
  return useSWRImmutable<IUserGroupHasId[], Error>(
    shouldFetch ? ['/user-groups/children', parentIds, includeGrandChildren] : null,
    (endpoint, parentIds, includeGrandChildren) => apiv3Get<ChildUserGroupListResult>(
      endpoint, { parentIdsJoinedByComma: parentIds.join(','), includeGrandChildren },
    ).then(result => result.data.childUserGroups),
    {
      fallbackData: initialData,
    },
  );
};

export const useSWRxUserGroupRelations = (groupId: string): SWRResponse<IUserGroupRelationHasId[], Error> => {
  return useSWRImmutable(
    groupId != null ? [`/user-groups/${groupId}/user-group-relations`] : null,
    endpoint => apiv3Get<UserGroupRelationListResult>(endpoint).then(result => result.data.userGroupRelations),
  );
};

export const useSWRxUserGroupRelationList = (
    groupIds: string[] | undefined, childGroupIds?: string[], initialData?: IUserGroupRelationHasId[],
): SWRResponse<IUserGroupRelationHasId[], Error> => {
  return useSWRImmutable<IUserGroupRelationHasId[], Error>(
    groupIds != null ? ['/user-group-relations', groupIds, childGroupIds] : null,
    (endpoint, groupIds, childGroupIds) => apiv3Get<UserGroupRelationListResult>(
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
    endpoint => apiv3Get<UserGroupPagesResult>(endpoint, { limit, offset }).then(result => result.data.pages),
  );
};
