import { GrantedGroup, GroupType } from '@growi/core';

import { ObjectIdLike } from '../interfaces/mongoose-utils';

export const divideByType = (grantedGroups: GrantedGroup[]): {
  grantedUserGroups: ObjectIdLike[];
  grantedExternalUserGroups: ObjectIdLike[];
} => {
  const grantedUserGroups: ObjectIdLike[] = [];
  const grantedExternalUserGroups: ObjectIdLike[] = [];

  grantedGroups.forEach((group) => {
    const id = typeof group.item === 'string' ? group.item : group.item._id;
    if (group.type === GroupType.userGroup) {
      grantedUserGroups.push(id);
    }
    else {
      grantedExternalUserGroups.push(id);
    }
  });

  return { grantedUserGroups, grantedExternalUserGroups };
};
