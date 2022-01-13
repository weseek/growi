const debug = require('debug')('growi:models:userGroup');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


/*
 * define schema
 */
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new mongoose.Schema({
  userGroupId: String,
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  parent: { type: ObjectId, ref: 'UserGroup', index: true },
  description: { type: String, default: '' },
});
schema.plugin(mongoosePaginate);

class UserGroup {

  /**
   * public fields for UserGroup model
   *
   * @readonly
   * @static
   * @memberof UserGroup
   */
  static get USER_GROUP_PUBLIC_FIELDS() {
    return '_id name createdAt parent description';
  }

  /**
   * limit items num for pagination
   *
   * @readonly
   * @static
   * @memberof UserGroup
   */
  static get PAGE_ITEMS() {
    return 10;
  }

  /*
   * model static methods
   */

  // Generate image path
  static createUserGroupPictureFilePath(userGroup, name) {
    const ext = `.${name.match(/(.*)(?:\.([^.]+$))/)[2]}`;

    return `userGroup/${userGroup._id}${ext}`;
  }

  /**
   * find all entities with pagination
   *
   * @see https://github.com/edwardhotchkiss/mongoose-paginate
   *
   * @static
   * @param {any} opts mongoose-paginate options object
   * @returns {Promise<any>} mongoose-paginate result object
   * @memberof UserGroup
   */
  static findUserGroupsWithPagination(opts) {
    const query = { parent: null };
    const options = Object.assign({}, opts);
    if (options.page == null) {
      options.page = 1;
    }
    if (options.limit == null) {
      options.limit = UserGroup.PAGE_ITEMS;
    }

    return this.paginate(query, options)
      .catch((err) => {
        debug('Error on pagination:', err);
      });
  }

  static async findChildUserGroupsByParentIds(parentIds, includeGrandChildren = false) {
    if (!Array.isArray(parentIds)) {
      throw Error('parentIds must be an array.');
    }

    const childUserGroups = await this.find({ parent: { $in: parentIds } });

    let grandChildUserGroups = null;
    if (includeGrandChildren) {
      const childUserGroupIds = childUserGroups.map(group => group._id);
      grandChildUserGroups = await this.find({ parent: { $in: childUserGroupIds } });
    }

    return {
      childUserGroups,
      grandChildUserGroups,
    };
  }

  static async findGroupsWithDescendantsRecursively(groups, descendants = groups) {
    const nextGroups = await this.find({ parent: { $in: groups.map(g => g._id) } });

    if (nextGroups.length === 0) {
      return descendants;
    }

    return this.findAllAncestorGroups(nextGroups, descendants.concat(nextGroups));
  }

  // Delete completely
  static async removeCompletelyByRootGroupId(deleteRootGroupId, action, transferToUserGroupId, user) {
    const UserGroupRelation = mongoose.model('UserGroupRelation');

    const rootGroup = await this.findById(deleteRootGroupId);
    if (rootGroup == null) {
      throw new Error('UserGroup data is not exists. id:', rootGroup._id);
    }

    const groupsToDelete = await this.findGroupsWithDescendantsRecursively([rootGroup]);

    // 1. update page & remove all groups
    await UserGroup.crowi.pageService.handlePrivatePagesForGroupsToDelete(groupsToDelete, action, transferToUserGroupId, user);
    // 2. remove all groups
    const deletedGroups = await this.deleteMany({ _id: { $in: groupsToDelete.map(g => g._id) } });
    // 3. remove all relations
    await UserGroupRelation.removeAllByUserGroups(groupsToDelete);

    return deletedGroups;
  }

  static countUserGroups() {
    return this.estimatedDocumentCount();
  }

  static async createGroup(name, description, parentId) {
    // create without parent
    if (parentId == null) {
      return this.create({ name, description });
    }

    // create with parent
    const parent = await this.findOne({ _id: parentId });
    if (parent == null) {
      throw Error('Parent does not exist.');
    }
    return this.create({ name, description, parent });
  }

  static async findAllAncestorGroups(parent, ancestors = [parent]) {
    if (parent == null) {
      return ancestors;
    }

    const nextParent = await this.findOne({ _id: parent.parent });
    if (nextParent == null) {
      return ancestors;
    }

    ancestors.push(nextParent);

    return this.findAllAncestorGroups(nextParent, ancestors);
  }

  // TODO 85062: write test code
  static async updateGroup(id, name, description, parentId, forceUpdateParents = false) {
    const userGroup = await this.findById(id);
    if (userGroup == null) {
      throw new Error('The group does not exist');
    }

    // check if the new group name is available
    const isExist = (await this.countDocuments({ name })) > 0;
    if (userGroup.name !== name && isExist) {
      throw new Error('The group name is already taken');
    }

    userGroup.name = name;
    userGroup.description = description;

    // return when not update parent
    if (userGroup.parent === parentId) {
      return userGroup.save();
    }

    const parent = await this.findById(parentId);

    // find users for comparison
    const UserGroupRelation = mongoose.model('UserGroupRelation');
    const [targetGroupUsers, parentGroupUsers] = await Promise.all(
      [UserGroupRelation.findUserIdsByGroupId(userGroup._id), UserGroupRelation.findUserIdsByGroupId(parent._id)],
    );

    const usersBelongsToTargetButNotParent = targetGroupUsers.filter(user => !parentGroupUsers.includes(user));
    // add the target group's users to all ancestors
    if (forceUpdateParents) {
      const ancestorGroups = await this.findAllAncestorGroups(parent);
      const ancestorGroupIds = ancestorGroups.map(group => group._id);

      await UserGroupRelation.createByGroupIdsAndUserIds(ancestorGroupIds, usersBelongsToTargetButNotParent);

      userGroup.parent = parent._id;
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

}


module.exports = function(crowi) {
  UserGroup.crowi = crowi;
  schema.loadClass(UserGroup);
  return mongoose.model('UserGroup', schema);
};
