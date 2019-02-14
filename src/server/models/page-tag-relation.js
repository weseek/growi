const debug = require('debug')('growi:models:pageTagRelation');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const ObjectId = mongoose.Schema.Types.ObjectId;


/*
 * define schema
 */
const schema = new mongoose.Schema({
  relatedPage: {
    type: ObjectId,
    ref: 'Page',
    required: true
  },
  relatedTag: {
    type: ObjectId,
    ref: 'Tag',
    required: true
  },
});
schema.plugin(mongoosePaginate);

/**
 * PageTagRelation Class
 *
 * @class PageTagRelation
 */
class PageTagRelation {

  // /**
  //  * limit items num for pagination
  //  *
  //  * @readonly
  //  * @static
  //  * @memberof UserGroupRelation
  //  */
  // static get PAGE_ITEMS() {
  //   return 50;
  // }

  static set crowi(crowi) {
    this._crowi = crowi;
  }

  static get crowi() {
    return this._crowi;
  }

  static init() {
    this.removeAllInvalidRelations();
  }

  /**
   * remove all invalid relations that has reference to unlinked document
   */
  static removeAllInvalidRelations() {
    return this.findAllRelation()
      .then(relations => {
        // filter invalid documents
        return relations.filter(relation => {
          return relation.relatedTag == null || relation.relatedPage == null;
        });
      })
      .then(invalidRelations => {
        const ids = invalidRelations.map(relation => relation._id);
        return this.deleteMany({
          _id: {
            $in: ids
          }
        });
      });
  }

  /**
   * find all page and tag relation
   *
   * @static
   * @returns {Promise<PageTagRelation[]>}
   * @memberof UserGroupRelation
   */
  static findAllRelation() {
    return this
      .find()
      .populate('relatedPage')
      .populate('relatedTag')
      .exec();
  }

  /**
   * find all tag of page
   *
   * @static
   * @param {page} page
   * @returns {Tag[]}
   * @memberof PageTagRelation
   */
  static findAllTagForPage(page) {
    return new Promise((resolve, reject) => {
      this.find({relatedPage: page._id}, function(err, tags) {
        if (err) {
          reject(err);
        }
        resolve(tags);
      });
    });
  }

  // /**
  //  * find all user and group relation of UserGroups
  //  *
  //  * @static
  //  * @param {UserGroup[]} userGroups
  //  * @returns {Promise<UserGroupRelation[]>}
  //  * @memberof UserGroupRelation
  //  */
  // static findAllRelationForUserGroups(userGroups) {
  //   return this
  //     .find({
  //       relatedGroup: {
  //         $in: userGroups
  //       }
  //     })
  //     .populate('relatedUser')
  //     .exec();
  // }

  // /**
  //  * find all user and group relation of User
  //  *
  //  * @static
  //  * @param {User} user
  //  * @returns {Promise<UserGroupRelation[]>}
  //  * @memberof UserGroupRelation
  //  */
  // static findAllRelationForUser(user) {
  //   return this
  //     .find({
  //       relatedUser: user.id
  //     })
  //     .populate('relatedGroup')
  //     // filter documents only relatedGroup is not null
  //     .then(userGroupRelations => {
  //       return userGroupRelations.filter(relation => {
  //         return relation.relatedGroup != null;
  //       });
  //     });
  // }

  // /**
  //  * find all UserGroup IDs that related to specified User
  //  *
  //  * @static
  //  * @param {User} user
  //  * @returns {Promise<ObjectId[]>}
  //  */
  // static async findAllUserGroupIdsRelatedToUser(user) {
  //   const relations = await this.find({
  //       relatedUser: user.id
  //     })
  //     .select('relatedGroup')
  //     .exec();

  //   return relations.map(relation => relation.relatedGroup);
  // }

  // /**
  //  * find all entities with pagination
  //  *
  //  * @see https://github.com/edwardhotchkiss/mongoose-paginate
  //  *
  //  * @static
  //  * @param {UserGroup} userGroup
  //  * @param {any} opts mongoose-paginate options object
  //  * @returns {Promise<any>} mongoose-paginate result object
  //  * @memberof UserGroupRelation
  //  */
  // static findUserGroupRelationsWithPagination(userGroup, opts) {
  //   const query = {
  //     relatedGroup: userGroup
  //   };
  //   const options = Object.assign({}, opts);
  //   if (options.page == null) {
  //     options.page = 1;
  //   }
  //   if (options.limit == null) {
  //     options.limit = UserGroupRelation.PAGE_ITEMS;
  //   }

  //   return this.paginate(query, options)
  //     .catch((err) => {
  //       debug('Error on pagination:', err);
  //     });
  // }

  // /**
  //  * count by related page id and related tag
  //  *
  //  * @static
  //  * @param {string} userPageId find query param for relatedPage
  //  * @param {User} tagId find query param for relatedTag
  //  * @returns {Promise<number>}
  //  */
  // static async countByPageIdAndTag(pageId, tagId) {
  //   const query = {
  //     relatedPage: pageId,
  //     relatedTag: tagId
  //   };

  //   return this.count(query);
  // }

  // /**
  //  * find all "not" related user for UserGroup
  //  *
  //  * @static
  //  * @param {UserGroup} userGroup for find users not related
  //  * @returns {Promise<User>}
  //  * @memberof UserGroupRelation
  //  */
  // static findUserByNotRelatedGroup(userGroup) {
  //   const User = UserGroupRelation.crowi.model('User');

  //   return this.findAllRelationForUserGroup(userGroup)
  //     .then((relations) => {
  //       const relatedUserIds = relations.map((relation) => {
  //         return relation.relatedUser.id;
  //       });
  //       const query = {
  //         _id: {
  //           $nin: relatedUserIds
  //         },
  //         status: User.STATUS_ACTIVE
  //       };

  //       debug('findUserByNotRelatedGroup ', query);
  //       return User.find(query).exec();
  //     });
  // }

  // /**
  //  * get if the user has relation for group
  //  *
  //  * @static
  //  * @param {User} userData
  //  * @param {UserGroup} userGroup
  //  * @returns {Promise<boolean>} is user related for group(or not)
  //  * @memberof UserGroupRelation
  //  */
  // static isRelatedUserForGroup(userData, userGroup) {
  //   const query = {
  //     relatedGroup: userGroup.id,
  //     relatedUser: userData.id
  //   };

  //   return this
  //     .count(query)
  //     .exec()
  //     .then((count) => {
  //       // return true or false of the relation is exists(not count)
  //       return (0 < count);
  //     });
  // }

  /**
   * create tag and page relation
   *
   * @static
   * @param {Page} page
   * @param {Tag} tag
   * @returns {Promise<PageTagRelation>} created relation
   * @memberof PageTagRelation
   */
  static createRelation(page, tag) {
    return this.create({
      relatedPage: page._id,
      relatedTag: tag._id
    });
  }

  /**
   * remove all relation for Page
   *
   * @static
   * @param {Page} page related page for remove
   * @returns {Promise<any>}
   * @memberof PageTagRelation
   */
  static removeAllByPage(page) {
    return this.deleteMany({
      relatedPage: page
    });
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
          throw new Error('PageTagRelation data is not exists. id:', id);
        }
        else {
          relationData.remove();
        }
      });
  }

}

module.exports = function(crowi) {
  PageTagRelation.crowi = crowi;
  schema.loadClass(PageTagRelation);
  const model = mongoose.model('PageTagRelation', schema);
  model.init();
  return model;
};
