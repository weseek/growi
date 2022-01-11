import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IUserGroupHasId, IUserGroupRelationHasId } from '~/interfaces/user';
import { UserGroupListResult, ChildUserGroupListResult, UserGroupRelationListResult } from '~/interfaces/user-group-response';
import { serializeKey } from './middlewares/serialize';


export const useSWRxUserGroupList = (initialData?: IUserGroupHasId[]): SWRResponse<UserGroupListResult, Error> => {
  return useSWRImmutable(
    '/user-groups',
    endpoint => apiv3Get(endpoint, { pagination: false }).then(result => result.data),
    {
      fallbackData: initialData,
    },
  );
};

export const useSWRxChildUserGroupList = (
    parentIds?: string[], includeGrandChildren?: boolean, initialData?: IUserGroupHasId[],
): SWRResponse<ChildUserGroupListResult, Error> => {
  return useSWRImmutable(
    parentIds != null ? ['/user-groups/children', parentIds, includeGrandChildren] : null,
    (endpoint, parentIds, includeGrandChildren) => apiv3Get(endpoint, { parentIds, includeGrandChildren }).then(result => result.data),
    {
      fallbackData: initialData,
      use: [serializeKey],
    },
  );
};

export const useSWRxUserGroupRelationList = (
    groupIds?: string[], childGroupIds?: string[], initialData?: IUserGroupRelationHasId[],
): SWRResponse<UserGroupRelationListResult, Error> => {
  return useSWRImmutable(
    groupIds != null && childGroupIds != null ? ['/user-group-relations', groupIds, childGroupIds] : null,
    (endpoint, parentIds, childGroupIds) => apiv3Get(endpoint, { parentIds, childGroupIds }).then(result => result.data),
    {
      fallbackData: initialData,
      use: [serializeKey],
    },
  );
};
