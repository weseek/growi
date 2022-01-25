import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IUserGroupHasId, IUserGroupRelationHasId } from '~/interfaces/user';
import { IPageHasId } from '~/interfaces/page';
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
    parentIds: string[] | undefined, includeGrandChildren?: boolean, initialData?: IUserGroupHasId[],
): SWRResponse<IUserGroupHasId[], Error> => {
  return useSWRImmutable<IUserGroupHasId[], Error>(
    parentIds != null ? ['/user-groups/children', parentIds, includeGrandChildren] : null,
    (endpoint, parentIds, includeGrandChildren) => apiv3Get<ChildUserGroupListResult>(
      endpoint, { parentIds, includeGrandChildren },
    ).then(result => result.data.childUserGroups),
    {
      fallbackData: initialData,
    },
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
    groupId != null ? [`/user-groups/${groupId}/pages`, { limit, offset }] : null,
    endpoint => apiv3Get<UserGroupPagesResult>(endpoint).then(result => result.data.userGroupPages),
  );
};
