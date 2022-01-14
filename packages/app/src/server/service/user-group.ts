import mongoose from 'mongoose';

import loggerFactory from '~/utils/logger';
import UserGroup from '~/server/models/user-group';
<<<<<<< HEAD
import { compareObjectId, includesObjectId } from '~/server/util/compare-objectId';
=======
>>>>>>> feat/user-group-v5

const logger = loggerFactory('growi:service:UserGroupService'); // eslint-disable-line no-unused-vars


const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model

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

  // TODO 85062: write test code
  // ref: https://dev.growi.org/61b2cdabaa330ce7d8152844
<<<<<<< HEAD
  async updateGroup(id, name: string, description: string, parentId?: string, forceUpdateParents = false) {
=======
  async updateGroup(id, name, description, parentId, forceUpdateParents = false) {
>>>>>>> feat/user-group-v5
    const userGroup = await UserGroup.findById(id);
    if (userGroup == null) {
      throw new Error('The group does not exist');
    }

    // check if the new group name is available
    const isExist = (await UserGroup.countDocuments({ name })) > 0;
    if (userGroup.name !== name && isExist) {
      throw new Error('The group name is already taken');
    }

    userGroup.name = name;
    userGroup.description = description;

    // return when not update parent
    if (userGroup.parent === parentId) {
      return userGroup.save();
    }
    // set parent to null and return when parentId is null
    if (parentId == null) {
      userGroup.parent = null;
      return userGroup.save();
    }

    const parent = await UserGroup.findById(parentId);

    if (parent == null) { // it should not be null
      throw Error('parent does not exist.');
    }


    // throw if parent was in its descendants
    const descendantsWithTarget = await UserGroup.findGroupsWithDescendantsRecursively([userGroup]);
    const descendants = descendantsWithTarget.filter(d => compareObjectId(d._id, userGroup._id));
    if (includesObjectId(descendants, parent._id)) {
      throw Error('It is not allowed to choose parent from descendant groups.');
    }

    // find users for comparison
    const [targetGroupUsers, parentGroupUsers] = await Promise.all(
      [UserGroupRelation.findUserIdsByGroupId(userGroup._id), UserGroupRelation.findUserIdsByGroupId(parent?._id)], // TODO 85062: consider when parent is null to update the group as the root
    );

    const usersBelongsToTargetButNotParent = targetGroupUsers.filter(user => !parentGroupUsers.includes(user));
    // add the target group's users to all ancestors
    if (forceUpdateParents) {
      const ancestorGroups = await UserGroup.findGroupsWithAncestorsRecursively(parent);
      const ancestorGroupIds = ancestorGroups.map(group => group._id);

      await UserGroupRelation.createByGroupIdsAndUserIds(ancestorGroupIds, usersBelongsToTargetButNotParent);

      userGroup.parent = parent?._id; // TODO 85062: consider when parent is null to update the group as the root
    }
    // validate related users
    else {
      const isUpdatable = usersBelongsToTargetButNotParent.length === 0;
      if (!isUpdatable) {
        throw Error('The parent group does not contain the users in this group.');
      }
    }

    return userGroup.save();
  }

  async removeCompletelyByRootGroupId(deleteRootGroupId, action, transferToUserGroupId, user) {
    const rootGroup = await UserGroup.findById(deleteRootGroupId);
    if (rootGroup == null) {
      throw new Error(`UserGroup data does not exist. id: ${deleteRootGroupId}`);
    }

    const groupsToDelete = await UserGroup.findGroupsWithDescendantsRecursively([rootGroup]);

    // 1. update page & remove all groups
    await this.crowi.pageService.handlePrivatePagesForGroupsToDelete(groupsToDelete, action, transferToUserGroupId, user);
    // 2. remove all groups
    const deletedGroups = await UserGroup.deleteMany({ _id: { $in: groupsToDelete.map(g => g._id) } });
    // 3. remove all relations
    await UserGroupRelation.removeAllByUserGroups(groupsToDelete);

    return deletedGroups;
  }

}

module.exports = UserGroupService;
