import {
  type GrantedGroup, GroupType, isPopulated, type IUserGroupHasId,
} from '@growi/core';

import {
  useSWRxAncestorExternalUserGroups,
  useSWRxChildExternalUserGroupList,
  useSWRxExternalUserGroup,
  useSWRxExternalUserGroupRelationList,
  useSWRxExternalUserGroupRelations,
  useSWRxMyExternalUserGroupRelations,
} from '~/features/external-user-group/client/stores/external-user-group';
import { IExternalUserGroupHasId } from '~/features/external-user-group/interfaces/external-user-group';
import {
  useSWRxAncestorUserGroups,
  useSWRxChildUserGroupList, useSWRxMyUserGroupRelations, useSWRxUserGroup, useSWRxUserGroupRelationList, useSWRxUserGroupRelations,
} from '~/stores/user-group';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useUserGroup = (userGroupId: string, isExternalGroup: boolean) => {
  const userGroupRes = useSWRxUserGroup(isExternalGroup ? null : userGroupId);
  const externalUserGroupRes = useSWRxExternalUserGroup(isExternalGroup ? userGroupId : null);
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useUserGroupRelations = (userGroupId: string, isExternalGroup: boolean) => {
  const userGroupRes = useSWRxUserGroupRelations(isExternalGroup ? null : userGroupId);
  const externalUserGroupRes = useSWRxExternalUserGroupRelations(isExternalGroup ? userGroupId : null);
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useChildUserGroupList = (userGroupId: string, isExternalGroup: boolean) => {
  const userGroupRes = useSWRxChildUserGroupList(
    !isExternalGroup ? [userGroupId] : [], true,
  );
  const externalUserGroupRes = useSWRxChildExternalUserGroupList(
    isExternalGroup ? [userGroupId] : [], true,
  );
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useUserGroupRelationList = (userGroupIds: string[], isExternalGroup: boolean) => {
  const userGroupRes = useSWRxUserGroupRelationList(isExternalGroup ? null : userGroupIds);
  const externalUserGroupRes = useSWRxExternalUserGroupRelationList(isExternalGroup ? userGroupIds : null);
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAncestorUserGroups = (userGroupId: string, isExternalGroup: boolean) => {
  const userGroupRes = useSWRxAncestorUserGroups(isExternalGroup ? null : userGroupId);
  const externalUserGroupRes = useSWRxAncestorExternalUserGroups(isExternalGroup ? userGroupId : null);
  return isExternalGroup ? externalUserGroupRes : userGroupRes;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useMyUserGroups = (shouldFetch: boolean) => {
  const { data: myUserGroupRelations, mutate: mutateMyUserGroupRelations } = useSWRxMyUserGroupRelations(shouldFetch);
  const { data: myExternalUserGroupRelations, mutate: mutateMyExternalUserGroupRelations } = useSWRxMyExternalUserGroupRelations(shouldFetch);

  const mutate = () => {
    mutateMyUserGroupRelations();
    mutateMyExternalUserGroupRelations();
  };

  if (myUserGroupRelations == null || myExternalUserGroupRelations == null) {
    return { data: null, mutate };
  }

  const myUserGroups = myUserGroupRelations
    .map((relation) => {
      // relation.relatedGroup should be populated by server
      return isPopulated(relation.relatedGroup) ? relation.relatedGroup : undefined;
    })
    // exclude undefined elements
    .filter((elem): elem is IUserGroupHasId => elem != null)
    .map((group) => {
      return {
        item: group,
        type: GroupType.userGroup,
      };
    });
  const myExternalUserGroups = myExternalUserGroupRelations
    .map((relation) => {
    // relation.relatedGroup should be populated by server
      return isPopulated(relation.relatedGroup) ? relation.relatedGroup : undefined;
    })
    // exclude undefined elements
    .filter((elem): elem is IExternalUserGroupHasId => elem != null)
    .map((group) => {
      return {
        item: group,
        type: GroupType.externalUserGroup,
      };
    });

  const data = [...myUserGroups, ...myExternalUserGroups];

  return { data, mutate };
};
