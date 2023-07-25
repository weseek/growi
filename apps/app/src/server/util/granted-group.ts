import { GrantedGroup, GroupType } from '@growi/core';

import { ObjectIdLike } from '../interfaces/mongoose-utils';

export const divideByType = (grantedGroups: GrantedGroup[]): {
  grantedUserGroups: ObjectIdLike[];
  grantedExternalUserGroups: ObjectIdLike[];
} => {
  const grantedUserGroups: ObjectIdLike[] = [];
  const grantedExternalUserGroups: ObjectIdLike[] = [];

  grantedGroups.forEach((group) => {
    if (group.type === GroupType.userGroup) {
      grantedUserGroups.push(group.item);
    }
    else {
      grantedExternalUserGroups.push(group.item);
    }
  });

  return { grantedUserGroups, grantedExternalUserGroups };
};
