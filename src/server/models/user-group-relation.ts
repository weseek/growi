import { Schema, Types, Model } from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import Debug from 'debug';
import { getOrCreateModel } from '../util/mongoose-utils';
// import User, { USER_PUBLIC_FIELDS, STATUS_ACTIVE } from '~/server/models/user';
import { UserGroupRelation as IUserGroupRelation } from '~/interfaces/user';

const debug = Debug('growi:models:userGroupRelation');

/*
 * define methods type
 */
interface ModelMethods {
  removeById(id:string): void;
}

/*
 * define schema
 */
const schema = new Schema<IUserGroupRelation>({
  relatedGroup: { type: Types.ObjectId, ref: 'UserGroup', required: true },
  relatedUser: { type: Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);


/**
 * UserGroupRelation Class
 *
 * @class UserGroupRelation
 */
class UserGroupRelation extends Model {

  static paginate: any;

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
    // let searchWord = new RegExp(`${queryOptions.searchWord}`);
    // switch (queryOptions.searchType) {
    //   case 'forward':
    //     searchWord = new RegExp(`^${queryOptions.searchWord}`);
    //     break;
    //   case 'backword':
    //     searchWord = new RegExp(`${queryOptions.searchWord}$`);
    //     break;
    // }
    // const searthField:Array<{[key:string]:RegExp}> = [
    //   { username: searchWord },
    // ];
    // if (queryOptions.isAlsoMailSearched === 'true') { searthField.push({ email: searchWord }) }
    // if (queryOptions.isAlsoNameSearched === 'true') { searthField.push({ name: searchWord }) }

    // return this.findAllRelationForUserGroup(userGroup)
    //   .then((relations) => {
    //     const relatedUserIds = relations.map((relation) => {
    //       return relation.relatedUser.id;
    //     });
    //     const query = {
    //       _id: { $nin: relatedUserIds },
    //       status: STATUS_ACTIVE,
    //       $or: searthField,
    //     };

    //     debug('findUserByNotRelatedGroup ', query);
    //     return User.find(query).exec();
    //   });
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
          throw new Error(`UserGroupRelation data is not exists. id: ${id}`);
        }
        else {
          relationData.remove();
        }
      });
  }

}
schema.loadClass(UserGroupRelation);
export default getOrCreateModel<IUserGroupRelation, ModelMethods>('UserGroupRelation', schema);
