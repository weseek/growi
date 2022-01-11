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
    if (parentIds == null) {
      throw Error('parentIds must not be null.');
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

  // Check if registerable
  static isRegisterableName(name) {
    const query = { name };

    return this.findOne(query)
      .then((userGroupData) => {
        return (userGroupData == null);
      });
  }

  // Delete completely
  static async removeCompletelyById(deleteGroupId, action, transferToUserGroupId, user) {
    const UserGroupRelation = mongoose.model('UserGroupRelation');

    const groupToDelete = await this.findById(deleteGroupId);
    if (groupToDelete == null) {
      throw new Error('UserGroup data is not exists. id:', deleteGroupId);
    }
    const deletedGroup = await groupToDelete.remove();

    await Promise.all([
      UserGroupRelation.removeAllByUserGroup(deletedGroup),
      UserGroup.crowi.pageService.handlePrivatePagesForDeletedGroup(deletedGroup, action, transferToUserGroupId, user),
    ]);

    return deletedGroup;
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

  async updateName(name) {
    this.name = name;
    await this.save();
  }

}


module.exports = function(crowi) {
  UserGroup.crowi = crowi;
  schema.loadClass(UserGroup);
  return mongoose.model('UserGroup', schema);
};
