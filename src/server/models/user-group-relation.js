const debug = require('debug')('growi:models:userGroupRelation');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ObjectId = mongoose.Schema.Types.ObjectId;


/*
 * define schema
 */
const schema = new mongoose.Schema({
  relatedGroup: { type: ObjectId, ref: 'UserGroup', required: true },
  relatedUser: { type: ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});
schema.plugin(mongoosePaginate);

/**
 * UserGroupRelation Class
 *
 * @class UserGroupRelation
 */
class UserGroupRelation {

  /**
   * limit items num for pagination
   *
   * @readonly
   * @static
   * @memberof UserGroupRelation
   */
  static get PAGE_ITEMS() {
    return 50;
  }

  static set crowi(crowi) {
    this._crowi = crowi;
  }

  static get crowi() {
    return this._crowi;
  }

  /**
   * remove all invalid relations that has reference to unlinked document
   */
  static removeAllInvalidRelations() {
    return this.findAllRelation()
      .then((relations) => {
        // filter invalid documents
        return relations.filter((relation) => {
          return relation.relatedUser == null || relation.relatedGroup == null;
        });
      })
      .then((invalidRelations) => {
        const ids = invalidRelations.map((relation) => { return relation._id });
        return this.deleteMany({ _id: { $in: ids } });
      });
  }

  /**
   * find all user and group relation
   *
   * @static
   * @returns {Promise<UserGroupRelation[]>}
   * @memberof UserGroupRelation
   */
  static findAllRelation() {
    return this
      .find()
      .populate('relatedUser')
      .populate('relatedGroup')
      .exec();
  }

  /**
   * find all user and group relation of UserGroup
   *
   * @static
   * @param {UserGroup} userGroup
   * @returns {Promise<UserGroupRelation[]>}
   * @memberof UserGroupRelation
   */
  static findAllRelationForUserGroup(userGroup) {
    debug('findAllRelationForUserGroup is called', userGroup);
    return this
      .find({ relatedGroup: userGroup })
      .populate('relatedUser')
      .exec();
  }

  /**
   * find all user and group relation of UserGroups
   *
   * @static
   * @param {UserGroup[]} userGroups
   * @returns {Promise<UserGroupRelation[]>}
   * @memberof UserGroupRelation
   */
  static findAllRelationForUserGroups(userGroups) {
    return this
      .find({ relatedGroup: { $in: userGroups } })
      .populate('relatedUser')
      .exec();
  }

  /**
   * find all user and group relation of User
   *
   * @static
   * @param {User} user
   * @returns {Promise<UserGroupRelation[]>}
   * @memberof UserGroupRelation
   */
  static findAllRelationForUser(user) {
    return this
      .find({ relatedUser: user.id })
      .populate('relatedGroup')
      // filter documents only relatedGroup is not null
      .then((userGroupRelations) => {
        return userGroupRelations.filter((relation) => {
          return relation.relatedGroup != null;
        });
      });
  }

  /**
   * find all UserGroup IDs that related to specified User
   *
   * @static
   * @param {User} user
   * @returns {Promise<ObjectId[]>}
   */
  static async findAllUserGroupIdsRelatedToUser(user) {
    const relations = await this.find({ relatedUser: user.id })
      .select('relatedGroup')
      .exec();

    return relations.map((relation) => { return relation.relatedGroup });
  }

  /**
   * find all entities with pagination
   *
   * @see https://github.com/edwardhotchkiss/mongoose-paginate
   *
   * @static
   * @param {UserGroup} userGroup
   * @param {any} opts mongoose-paginate options object
   * @returns {Promise<any>} mongoose-paginate result object
   * @memberof UserGroupRelation
   */
  static findUserGroupRelationsWithPagination(userGroup, opts) {
    const query = { relatedGroup: userGroup };
    const options = Object.assign({}, opts);
    if (options.page == null) {
      options.page = 1;
    }
    if (options.limit == null) {
      options.limit = UserGroupRelation.PAGE_ITEMS;
    }

    return this.paginate(query, options)
      .catch((err) => {
        debug('Error on pagination:', err);
      });
  }

  /**
   * count by related group id and related user
   *
   * @static
   * @param {string} userGroupId find query param for relatedGroup
   * @param {User} userData find query param for relatedUser
   * @returns {Promise<number>}
   */
  static async countByGroupIdAndUser(userGroupId, userData) {
    const query = {
      relatedGroup: userGroupId,
      relatedUser: userData.id,
    };

    return this.count(query);
  }

  /**
   * find all "not" related user for UserGroup
   *
   * @static
   * @param {UserGroup} userGroup for find users not related
   * @returns {Promise<User>}
   * @memberof UserGroupRelation
   */
  static findUserByNotRelatedGroup(userGroup) {
    const User = UserGroupRelation.crowi.model('User');

    return this.findAllRelationForUserGroup(userGroup)
      .then((relations) => {
        const relatedUserIds = relations.map((relation) => {
          return relation.relatedUser.id;
        });
        const query = { _id: { $nin: relatedUserIds }, status: User.STATUS_ACTIVE };

        debug('findUserByNotRelatedGroup ', query);
        return User.find(query).exec();
      });
  }

  /**
   * get if the user has relation for group
   *
   * @static
   * @param {User} userData
   * @param {UserGroup} userGroup
   * @returns {Promise<boolean>} is user related for group(or not)
   * @memberof UserGroupRelation
   */
  static isRelatedUserForGroup(userData, userGroup) {
    const query = {
      relatedGroup: userGroup.id,
      relatedUser: userData.id,
    };

    return this
      .count(query)
      .exec()
      .then((count) => {
        // return true or false of the relation is exists(not count)
        return (count > 0);
      });
  }

  /**
   * create user and group relation
   *
   * @static
   * @param {UserGroup} userGroup
   * @param {User} user
   * @returns {Promise<UserGroupRelation>} created relation
   * @memberof UserGroupRelation
   */
  static createRelation(userGroup, user) {
    return this.create({
      relatedGroup: userGroup.id,
      relatedUser: user.id,
    });
  }

  /**
   * remove all relation for UserGroup
   *
   * @static
   * @param {UserGroup} userGroup related group for remove
   * @returns {Promise<any>}
   * @memberof UserGroupRelation
   */
  static removeAllByUserGroup(userGroup) {
    return this.deleteMany({ relatedGroup: userGroup });
  }

  /**
   * remove relation by id
   *
   * @static
   * @param {ObjectId} id
   * @returns {Promise<any>}
   * @memberof UserGroupRelation
   */
  static removeById(id) {
    return this.findById(id)
      .then((relationData) => {
        if (relationData == null) {
          throw new Error('UserGroupRelation data is not exists. id:', id);
        }
        else {
          relationData.remove();
        }
      });
  }

}

module.exports = function(crowi) {
  UserGroupRelation.crowi = crowi;
  schema.loadClass(UserGroupRelation);
  const model = mongoose.model('UserGroupRelation', schema);
  return model;
};
