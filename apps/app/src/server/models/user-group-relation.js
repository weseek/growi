const debug = require('debug')('growi:models:userGroupRelation');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { default: uniqueValidator } = require('../util/unique-validator');

const ObjectId = mongoose.Schema.Types.ObjectId;


/*
 * define schema
 */
const schema = new mongoose.Schema({
  relatedGroup: { type: ObjectId, ref: 'UserGroup', required: true },
  relatedUser: { type: ObjectId, ref: 'User', required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);


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

  static async findAllUserIdsForUserGroup(userGroup) {
    const relations = await this
      .find({ relatedGroup: userGroup })
      .select('relatedUser')
      .exec();

    return relations.map(r => r.relatedUser);
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
    const relations = await this.find({ relatedUser: user._id })
      .select('relatedGroup')
      .exec();

    return relations.map((relation) => { return relation.relatedGroup });
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
  static findUserByNotRelatedGroup(userGroup, queryOptions) {
    const User = UserGroupRelation.crowi.model('User');
    let searchWord = new RegExp(`${queryOptions.searchWord}`);
    switch (queryOptions.searchType) {
      case 'forward':
        searchWord = new RegExp(`^${queryOptions.searchWord}`);
        break;
      case 'backword':
        searchWord = new RegExp(`${queryOptions.searchWord}$`);
        break;
    }
    const searthField = [
      { username: searchWord },
    ];
    if (queryOptions.isAlsoMailSearched === 'true') { searthField.push({ email: searchWord }) }
    if (queryOptions.isAlsoNameSearched === 'true') { searthField.push({ name: searchWord }) }

    return this.findAllRelationForUserGroup(userGroup)
      .then((relations) => {
        const relatedUserIds = relations.map((relation) => {
          return relation.relatedUser.id;
        });
        const query = {
          _id: { $nin: relatedUserIds },
          status: User.STATUS_ACTIVE,
          $or: searthField,
        };

        debug('findUserByNotRelatedGroup ', query);
        return User.find(query).exec();
      });
  }

  /**
   * get if the user has relation for group
   *
   * @static
   * @param {UserGroup} userGroup
   * @param {User} user
   * @returns {Promise<boolean>} is user related for group(or not)
   * @memberof UserGroupRelation
   */
  static isRelatedUserForGroup(userGroup, user) {
    const query = {
      relatedGroup: userGroup.id,
      relatedUser: user.id,
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

  static async createRelations(userGroupIds, user) {
    const documentsToInsertMany = userGroupIds.map((groupId) => {
      return {
        relatedGroup: groupId,
        relatedUser: user._id,
        createdAt: new Date(),
      };
    });

    return this.insertMany(documentsToInsertMany);
  }

  /**
   * remove all relation for UserGroup
   *
   * @static
   * @param {UserGroup} userGroup related group for remove
   * @returns {Promise<any>}
   * @memberof UserGroupRelation
   */
  static removeAllByUserGroups(groupsToDelete) {
    if (!Array.isArray(groupsToDelete)) {
      throw Error('groupsToDelete must be an array.');
    }

    return this.deleteMany({ relatedGroup: { $in: groupsToDelete } });
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
          relationData.deleteOne();
        }
      });
  }

  static async findUserIdsByGroupId(groupId) {
    const relations = await this.find({ relatedGroup: groupId }, { _id: 0, relatedUser: 1 }).lean().exec(); // .lean() to get not ObjectId but string

    return relations.map(relation => relation.relatedUser);
  }

  static async createByGroupIdsAndUserIds(groupIds, userIds) {
    const insertOperations = [];

    groupIds.forEach((groupId) => {
      userIds.forEach((userId) => {
        insertOperations.push({
          insertOne: {
            document: {
              relatedGroup: groupId,
              relatedUser: userId,
            },
          },
        });
      });
    });

    await this.bulkWrite(insertOperations);
  }

  /**
   * Recursively finds descendant groups by populating relations.
   * @static
   * @param {UserGroupDocument[]} groups
   * @param {UserDocument} user
   * @returns UserGroupDocument[]
   */
  static async findGroupsWithDescendantsByGroupAndUser(group, user) {
    const descendantGroups = [group];

    const incrementGroupsRecursively = async (groups, user) => {
      const groupIds = groups.map(g => g._id);

      const populatedRelations = await this.aggregate([
        {
          $match: {
            relatedUser: user._id,
          },
        },
        {
          $lookup: {
            from: 'usergroups',
            localField: 'relatedGroup',
            foreignField: '_id',
            as: 'relatedGroup',
          },
        },
        {
          $unwind: {
            path: '$relatedGroup',
          },
        },
        {
          $match: {
            'relatedGroup.parent': { $in: groupIds },
          },
        },
      ]);

      const nextGroups = populatedRelations.map(d => d.relatedGroup);

      // End
      const shouldEnd = nextGroups.length === 0;
      if (shouldEnd) {
        return;
      }

      // Increment
      descendantGroups.push(...nextGroups);

      return incrementGroupsRecursively(nextGroups, user);
    };

    await incrementGroupsRecursively([group], user);

    return descendantGroups;
  }

}

module.exports = function (crowi) {
  UserGroupRelation.crowi = crowi;
  schema.loadClass(UserGroupRelation);
  const model = mongoose.model('UserGroupRelation', schema);
  return model;
};
