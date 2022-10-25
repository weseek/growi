import { PageGrant } from '~/interfaces/page';

import type { ObjectIdLike } from '../interfaces/mongoose-utils';


import { excludeTestIdsFromTargetIds, isIncludesObjectId } from './compare-objectId';

export type ComparableTarget = {
  grant: number,
  grantedUserIds?: ObjectIdLike[],
  grantedGroupId?: ObjectIdLike,
  applicableUserIds?: ObjectIdLike[],
  applicableGroupIds?: ObjectIdLike[],
};

export type ComparableAncestor = {
  grant: number,
  grantedUserIds: ObjectIdLike[],
  applicableUserIds?: ObjectIdLike[],
  applicableGroupIds?: ObjectIdLike[],
};

export type ComparableDescendants = {
  isPublicExist: boolean,
  grantedUserIds: ObjectIdLike[],
  grantedGroupIds: ObjectIdLike[],
};

export const validateComparableTarget = (comparable: ComparableTarget): void => {
  const { grant, grantedUserIds, grantedGroupId } = comparable;

  if (grant === PageGrant.GRANT_OWNER && (grantedUserIds == null || grantedUserIds.length !== 1)) {
    throw Error('grantedUserIds must not be null and must have 1 length');
  }
  if (grant === PageGrant.GRANT_USER_GROUP && grantedGroupId == null) {
    throw Error('grantedGroupId is not specified');
  }
};

export const processValidation = (target: ComparableTarget, ancestor: ComparableAncestor, descendants?: ComparableDescendants): boolean => {
  validateComparableTarget(target);

  /*
   * ancestor side
   */
  // GRANT_PUBLIC
  if (ancestor.grant === PageGrant.GRANT_PUBLIC) { // any page can exist under public page
    // do nothing
  }
  // GRANT_OWNER
  else if (ancestor.grant === PageGrant.GRANT_OWNER) {
    if (target.grantedUserIds?.length !== 1) {
      return false;
    }

    if (target.grant !== PageGrant.GRANT_OWNER) { // only GRANT_OWNER page can exist under GRANT_OWNER page
      return false;
    }

    if (ancestor.grantedUserIds[0].toString() !== target.grantedUserIds[0].toString()) { // the grantedUser must be the same as parent's under the GRANT_OWNER page
      return false;
    }
  }
  // GRANT_USER_GROUP
  else if (ancestor.grant === PageGrant.GRANT_USER_GROUP) {
    if (ancestor.applicableGroupIds == null || ancestor.applicableUserIds == null) {
      throw Error('applicableGroupIds and applicableUserIds are not specified');
    }

    if (target.grant === PageGrant.GRANT_PUBLIC) { // public page must not exist under GRANT_USER_GROUP page
      return false;
    }

    if (target.grant === PageGrant.GRANT_OWNER) {
      if (target.grantedUserIds?.length !== 1) {
        throw Error('grantedUserIds must have one user');
      }

      if (!isIncludesObjectId(ancestor.applicableUserIds, target.grantedUserIds[0])) { // GRANT_OWNER pages under GRAND_USER_GROUP page must be owned by the member of the grantedGroup of the GRAND_USER_GROUP page
        return false;
      }
    }

    if (target.grant === PageGrant.GRANT_USER_GROUP) {
      if (target.grantedGroupId == null) {
        throw Error('grantedGroupId must not be null');
      }

      if (!isIncludesObjectId(ancestor.applicableGroupIds, target.grantedGroupId)) { // only child groups or the same group can exist under GRANT_USER_GROUP page
        return false;
      }
    }
  }

  if (descendants == null) {
    return true;
  }
  /*
   * descendant side
   */

  // GRANT_PUBLIC
  if (target.grant === PageGrant.GRANT_PUBLIC) { // any page can exist under public page
    // do nothing
  }
  // GRANT_OWNER
  else if (target.grant === PageGrant.GRANT_OWNER) {
    if (target.grantedUserIds?.length !== 1) {
      throw Error('grantedUserIds must have one user');
    }

    if (descendants.isPublicExist) { // public page must not exist under GRANT_OWNER page
      return false;
    }

    if (descendants.grantedGroupIds.length !== 0 || descendants.grantedUserIds.length > 1) { // groups or more than 2 grantedUsers must not be in descendants
      return false;
    }

    if (descendants.grantedUserIds.length === 1 && descendants.grantedUserIds[0].toString() !== target.grantedUserIds[0].toString()) { // if Only me page exists, then all of them must be owned by the same user as the target page
      return false;
    }
  }
  // GRANT_USER_GROUP
  else if (target.grant === PageGrant.GRANT_USER_GROUP) {
    if (target.applicableGroupIds == null || target.applicableUserIds == null) {
      throw Error('applicableGroupIds and applicableUserIds must not be null');
    }

    if (descendants.isPublicExist) { // public page must not exist under GRANT_USER_GROUP page
      return false;
    }

    const shouldNotExistGroupIds = excludeTestIdsFromTargetIds(descendants.grantedGroupIds, target.applicableGroupIds);
    const shouldNotExistUserIds = excludeTestIdsFromTargetIds(descendants.grantedUserIds, target.applicableUserIds);
    if (shouldNotExistGroupIds.length !== 0 || shouldNotExistUserIds.length !== 0) {
      return false;
    }
  }

  return true;
};
