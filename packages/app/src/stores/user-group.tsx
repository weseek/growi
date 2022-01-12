import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IUserGroupHasId, IUserGroupRelationHasId } from '~/interfaces/user';
import { UserGroupListResult, ChildUserGroupListResult, UserGroupRelationListResult } from '~/interfaces/user-group-response';


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
    parentIds: string[] | undefined, initialData?: IUserGroupHasId[],
): SWRResponse<IUserGroupHasId[], Error> => {
  return useSWRImmutable<IUserGroupHasId[], Error>(
    parentIds != null ? ['/user-groups/children', parentIds] : null,
    (endpoint, parentIds) => apiv3Get<ChildUserGroupListResult>(endpoint, { parentIds }).then(result => result.data.childUserGroups),
    {
      fallbackData: initialData,
    },
  );
};

export const useSWRxUserGroupRelationList = (
    groupIds: string[] | undefined, initialData?: IUserGroupRelationHasId[],
): SWRResponse<IUserGroupRelationHasId[], Error> => {
  return useSWRImmutable<IUserGroupRelationHasId[], Error>(
    groupIds != null ? ['/user-group-relations', groupIds] : null,
    (endpoint, parentIds) => apiv3Get<UserGroupRelationListResult>(endpoint, { parentIds }).then(result => result.data.userGroupRelations),
    {
      fallbackData: initialData,
    },
  );
};
