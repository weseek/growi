import { Model } from 'mongoose';

import { IUser } from '~/interfaces/user';
import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import UserGroup, { UserGroupDocument, UserGroupModel } from '~/server/models/user-group';
import { excludeTestIdsFromTargetIds, isIncludesObjectId } from '~/server/util/compare-objectId';
import loggerFactory from '~/utils/logger';

import UserGroupRelation, { UserGroupRelationDocument, UserGroupRelationModel } from '../models/user-group-relation';


const logger = loggerFactory('growi:service:UserGroupService'); // eslint-disable-line no-unused-vars

/**
 * the service class of UserGroupService
 */
class UserGroupService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  async init() {
    logger.debug('removing all invalid relations');
    return UserGroupRelation.removeAllInvalidRelations();
  }

  // ref: https://dev.growi.org/61b2cdabaa330ce7d8152844
  async updateGroup(id, name?: string, description?: string, parentId?: string | null, forceUpdateParents = false) {
    const userGroup = await UserGroup.findById(id);
    if (userGroup == null) {
      throw new Error('The group does not exist');
    }

    // check if the new group name is available
    const isExist = (await UserGroup.countDocuments({ name })) > 0;
    if (userGroup.name !== name && isExist) {
      throw new Error('The group name is already taken');
    }

    if (name != null) {
      userGroup.name = name;
    }
    if (description != null) {
      userGroup.description = description;
    }

    // return when not update parent
    if (userGroup.parent === parentId) {
      return userGroup.save();
    }

    /*
     * Update parent
     */
    if (parentId === undefined) { // undefined will be ignored
      return userGroup.save();
    }

    // set parent to null and return when parentId is null
    if (parentId == null) {
      userGroup.parent = undefined;
      return userGroup.save();
    }


    const parent = await UserGroup.findById(parentId);

    if (parent == null) { // it should not be null
      throw Error('Parent group does not exist.');
    }

    /*
     * check if able to update parent or not
     */

    // throw if parent was in self and its descendants
    const descendantsWithTarget = await UserGroup.findGroupsWithDescendantsRecursively([userGroup]);
    if (isIncludesObjectId(descendantsWithTarget.map(d => d._id), parent._id)) {
      throw Error('It is not allowed to choose parent from descendant groups.');
    }

    // find users for comparison
    const [targetGroupUsers, parentGroupUsers] = await Promise.all(
      [UserGroupRelation.findUserIdsByGroupId(userGroup._id), UserGroupRelation.findUserIdsByGroupId(parent._id)],
    );
    const usersBelongsToTargetButNotParent = excludeTestIdsFromTargetIds(targetGroupUsers, parentGroupUsers);

    // save if no users exist in both target and parent groups
    if (targetGroupUsers.length === 0 && parentGroupUsers.length === 0) {
      userGroup.parent = parent._id;
      return userGroup.save();
    }

    // add the target group's users to all ancestors
    if (forceUpdateParents) {
      const ancestorGroups = await UserGroup.findGroupsWithAncestorsRecursively(parent);
      const ancestorGroupIds = ancestorGroups.map(group => group._id);

      await UserGroupRelation.createByGroupIdsAndUserIds(ancestorGroupIds, usersBelongsToTargetButNotParent);
    }
    // throw if any of users in the target group is NOT included in the parent group
    else {
      const isUpdatable = usersBelongsToTargetButNotParent.length === 0;
      if (!isUpdatable) {
        throw Error('The parent group does not contain the users in this group.');
      }
    }

    userGroup.parent = parent._id;
    return userGroup.save();
  }

  async removeCompletelyByRootGroupId(
      deleteRootGroupId, action, transferToUserGroupId, user,
      userGroupModel: Model<UserGroupDocument> & UserGroupModel = UserGroup,
      userGroupRelationModel: Model<UserGroupRelationDocument> & UserGroupRelationModel = UserGroupRelation,
  ) {
    const rootGroup = await userGroupModel.findById(deleteRootGroupId);
    if (rootGroup == null) {
      throw new Error(`UserGroup data does not exist. id: ${deleteRootGroupId}`);
    }

    const groupsToDelete = await userGroupModel.findGroupsWithDescendantsRecursively([rootGroup]);

    // 1. update page & remove all groups
    // TODO: update pageService logic to handle external user groups (https://redmine.weseek.co.jp/issues/124385)
    await this.crowi.pageService.handlePrivatePagesForGroupsToDelete(groupsToDelete, action, transferToUserGroupId, user);
    // 2. remove all groups
    const deletedGroups = await userGroupModel.deleteMany({ _id: { $in: groupsToDelete.map(g => g._id) } });
    // 3. remove all relations
    await userGroupRelationModel.removeAllByUserGroups(groupsToDelete);

    return deletedGroups;
  }

  async removeUserByUsername(userGroupId: ObjectIdLike, username: string): Promise<{user: IUser, deletedGroupsCount: number}> {
    const User = this.crowi.model('User');

    const [userGroup, user] = await Promise.all([
      UserGroup.findById(userGroupId),
      User.findUserByUsername(username),
    ]);

    const groupsOfRelationsToDelete = await UserGroup.findGroupsWithDescendantsRecursively([userGroup]);
    const relatedGroupIdsToDelete = groupsOfRelationsToDelete.map(g => g._id);

    const deleteManyRes = await UserGroupRelation.deleteMany({ relatedUser: user._id, relatedGroup: { $in: relatedGroupIdsToDelete } });

    return { user, deletedGroupsCount: deleteManyRes.deletedCount };
  }

}

export default UserGroupService;
