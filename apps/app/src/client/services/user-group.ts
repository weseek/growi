import { IUserGroupHasId, IUserGroupRelationHasId } from '@growi/core';
import { SWRResponse } from 'swr';

import {
  useSWRxAncestorExternalUserGroups,
  useSWRxChildExternalUserGroupList,
  useSWRxExternalUserGroup,
  useSWRxExternalUserGroupRelationList,
  useSWRxExternalUserGroupRelations,
} from '~/features/external-user-group/client/stores/external-user-group';
import { IExternalUserGroupHasId, IExternalUserGroupRelationHasId } from '~/features/external-user-group/interfaces/external-user-group';
import { ChildUserGroupListResult, IUserGroupRelationHasIdPopulatedUser } from '~/interfaces/user-group-response';
import {
  useSWRxAncestorUserGroups,
  useSWRxChildUserGroupList, useSWRxUserGroup, useSWRxUserGroupRelationList, useSWRxUserGroupRelations,
} from '~/stores/user-group';

export const useUserGroup = (userGroupId: string, isExternalGroup: boolean):
SWRResponse<IUserGroupHasId, Error, any> | SWRResponse<IExternalUserGroupHasId, Error, any> => {
  const userGroupRes = useSWRxUserGroup(isExternalGroup ? null : userGroupId);
  const externalUserGroupRes = useSWRxExternalUserGroup(isExternalGroup ? userGroupId : null);
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};

export const useUserGroupRelations = (userGroupId: string, isExternalGroup: boolean):
SWRResponse<IUserGroupRelationHasIdPopulatedUser[], Error, any> => {
  const userGroupRes = useSWRxUserGroupRelations(isExternalGroup ? null : userGroupId);
  const externalUserGroupRes = useSWRxExternalUserGroupRelations(isExternalGroup ? userGroupId : null);
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};

export const useChildUserGroupList = (userGroupId: string, isExternalGroup: boolean):
SWRResponse<ChildUserGroupListResult, Error, any> | SWRResponse<ChildUserGroupListResult<IExternalUserGroupHasId>, Error, any> => {
  const userGroupRes = useSWRxChildUserGroupList(
    !isExternalGroup ? [userGroupId] : [], true,
  );
  const externalUserGroupRes = useSWRxChildExternalUserGroupList(
    isExternalGroup ? [userGroupId] : [], true,
  );
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};

export const useUserGroupRelationList = (userGroupIds: string[], isExternalGroup: boolean):
SWRResponse<IUserGroupRelationHasId[], Error, any> | SWRResponse<IExternalUserGroupRelationHasId[], Error, any> => {
  const userGroupRes = useSWRxUserGroupRelationList(isExternalGroup ? null : userGroupIds);
  const externalUserGroupRes = useSWRxExternalUserGroupRelationList(isExternalGroup ? userGroupIds : null);
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};

export const useAncestorUserGroups = (userGroupId: string, isExternalGroup: boolean):
SWRResponse<IUserGroupHasId[], Error, any> | SWRResponse<IExternalUserGroupHasId[], Error, any> => {
  const userGroupRes = useSWRxAncestorUserGroups(isExternalGroup ? null : userGroupId);
  const externalUserGroupRes = useSWRxAncestorExternalUserGroups(isExternalGroup ? userGroupId : null);
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};
