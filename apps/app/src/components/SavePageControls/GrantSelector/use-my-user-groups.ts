import { GroupType } from '@growi/core';

import { useSWRxMyExternalUserGroups } from '~/features/external-user-group/client/stores/external-user-group';
import { useSWRxMyUserGroups } from '~/stores/user-group';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useMyUserGroups = (shouldFetch: boolean, path: string) => {
  const { data: myUserGroups, mutate: mutateMyUserGroups } = useSWRxMyUserGroups(shouldFetch, path);
  const { data: myExternalUserGroups, mutate: mutateMyExternalUserGroups } = useSWRxMyExternalUserGroups(shouldFetch, path);

  const update = () => {
    mutateMyUserGroups();
    mutateMyExternalUserGroups();
  };

  if (myUserGroups == null || myExternalUserGroups == null) {
    return { data: null, update };
  }

  const myUserGroupsData = myUserGroups
    .map((groupData) => {
      return {
        item: groupData.userGroup,
        type: GroupType.userGroup,
        canGrantPage: groupData.canGrantPage,
      };
    });
  const myExternalUserGroupsData = myExternalUserGroups
    .map((groupData) => {
      return {
        item: groupData.userGroup,
        type: GroupType.externalUserGroup,
        canGrantPage: groupData.canGrantPage,
      };
    });

  const data = [...myUserGroupsData, ...myExternalUserGroupsData];

  return { data, update };
};
