import useSWR, { SWRResponse } from 'swr';
import { apiv3Get } from '~/client/util/apiv3-client';
import { IUserGroupHasId, IUserGroupRelationHasId } from '~/interfaces/user';
import { UserGroupListResult, ChildUserGroupListResult, UserGroupRelationListResult } from '~/interfaces/user-group-response';


export const useSWRxUserGroupList = (initialData?: IUserGroupHasId[]): SWRResponse<UserGroupListResult, Error> => {
  return useSWR(
    '/user-groups',
    endpoint => apiv3Get(endpoint, { pagination: false }).then(result => result.data.userGroups),
    {
      fallbackData: initialData,
    },
  );
};

export const useSWRxChildUserGroupList = (parentIds: string[], initialData?: IUserGroupHasId[]): SWRResponse<ChildUserGroupListResult, Error> => {
  return useSWR(
    ['/user-groups/children', parentIds],
    (endpoint, parentIds) => apiv3Get(endpoint, { parentIds }).then(result => result.data.childUserGroups),
    {
      fallbackData: initialData,
    },
  );
};

export const useSWRxUserGroupRelationList = (groupIds: string[], initialData?: IUserGroupRelationHasId[]): SWRResponse<UserGroupRelationListResult, Error> => {
  return useSWR(
    ['/user-group-relations', groupIds],
    (endpoint, parentIds) => apiv3Get(endpoint, { parentIds }).then(result => result.data.userGroupRelations),
    {
      fallbackData: initialData,
    },
  );
};
