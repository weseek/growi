// disable no-return-await for model functions
/* eslint-disable no-return-await */

const debug = require('debug')('growi:models:pageGroupRelation');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const ObjectId = mongoose.Schema.Types.ObjectId;

/*
 * define schema
 */
const schema = new mongoose.Schema({
  relatedGroup: { type: ObjectId, ref: 'UserGroup', required: true },
  targetPage: { type: ObjectId, ref: 'Page', required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { getters: true },
  toObject: { getters: true },
});
// apply plugins
schema.plugin(mongoosePaginate);


/**
 * PageGroupRelation Class
 *
 * @class PageGroupRelation
 */
class PageGroupRelation {
  /**
   * limit items num for pagination
   *
   * @readonly
   * @static
   * @memberof PageGroupRelation
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

  static init() {
    this.removeAllInvalidRelations();
  }

  /**
   * remove all invalid relations that has reference to unlinked document
   */
  static removeAllInvalidRelations() {
    return this.findAllRelation()
      .then((relations) => {
        // filter invalid documents
        return relations.filter((relation) => {
          return relation.targetPage == null || relation.relatedGroup == null;
        });
      })
      .then((invalidRelations) => {
        const ids = invalidRelations.map((relation) => { return relation._id });
        return this.deleteMany({ _id: { $in: ids } });
      });
  }

  /**
   * find all page and group relation
   *
   * @static
   * @returns {Promise<PageGroupRelation[]>}
   * @memberof PageGroupRelation
   */
  static findAllRelation() {
    return this
      .find()
      .populate('targetPage')
      .populate('relatedGroup')
      .exec();
  }

  /**
   * find all page and group relation for UserGroup
   *
   * @static
   * @param {UserGroup} userGroup
   * @returns {Promise<PageGroupRelation[]>}
   * @memberof PageGroupRelation
   */
  static findAllRelationForUserGroup(userGroup) {
    debug('findAllRelationForUserGroup is called', userGroup);

    return this
      .find({ relatedGroup: userGroup.id })
      .populate('targetPage')
      .exec();
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
  // static findPageGroupRelationsWithPagination(userGroup, opts) {
  //   const query = { relatedGroup: userGroup };
  //   const options = Object.assign({}, opts);
  //   if (options.page == null) {
  //     options.page = 1;
  //   }
  //   if (options.limit == null) {
  //     options.limit = UserGroupRelation.PAGE_ITEMS;
  //   }

  //   return this.paginate(query, options);
  // }

  /**
   * find the relation or create(if not exists) for page and group
   *
   * @static
   * @param {Page} page
   * @param {UserGroup} userGroup
   * @returns {Promise<PageGroupRelation>}
   * @memberof PageGroupRelation
   */
  static findOrCreateRelationForPageAndGroup(page, userGroup) {
    const query = { targetPage: page.id, relatedGroup: userGroup.id };

    return this
      .count(query)
      .then((count) => {
        // return (0 < count);
        if (count > 0) {
          return this.find(query).exec();
        }

        return this.createRelation(userGroup, page);
      });
  }

  /**
   * find page and group relation for Page
   *
   * @static
   * @param {Page} page
   * @returns {Promise<PageGroupRelation[]>}
   * @memberof PageGroupRelation
   */
  static findByPage(page) {
    if (page == null) {
      return null;
    }
    return this
      .findOne({ targetPage: page.id })
      .populate('relatedGroup')
      .exec();
  }

  /**
   * get is exists granted group for relatedPage and relatedUser
   *
   * @static
   * @param {any} pageData relatedPage
   * @param {any} userData relatedUser
   * @returns is exists granted group(or not)
   * @memberof PageGroupRelation
   */
  static async isExistsGrantedGroupForPageAndUser(pageData, userData) {
    const UserGroupRelation = PageGroupRelation.crowi.model('UserGroupRelation');

    const pageRelation = await this.findByPage(pageData);
    if (pageRelation == null) {
      return false;
    }
    return await UserGroupRelation.isRelatedUserForGroup(userData, pageRelation.relatedGroup);
  }

  /**
   * create page and group relation
   *
   * @static
   * @param {any} userGroup
   * @param {any} page
   * @returns
   * @memberof PageGroupRelation
   */
  static createRelation(userGroup, page) {
    return this.create({
      relatedGroup: userGroup.id,
      targetPage: page.id,
    });
  }

  /**
   * remove all relation for UserGroup
   *
   * @static
   * @param {UserGroup} userGroup related group for remove
   * @returns {Promise<any>}
   * @memberof PageGroupRelation
   */
  static removeAllByUserGroup(userGroup) {
    return this.deleteMany({ relatedGroup: userGroup });
  }

  /**
   * remove all relation for Page
   *
   * @static
   * @param {Page} page related page for remove
   * @returns {Promise<any>}
   * @memberof PageGroupRelation
   */
  static removeAllByPage(page) {
    return this.findByPage(page)
      .then((relation) => {
        if (relation != null) {
          relation.remove();
        }
      });
  }

  /**
   * remove relation by id
   *
   * @static
   * @param {ObjectId} id for remove
   * @returns {Promise<any>}
   * @memberof PageGroupRelation
   */
  static removeById(id) {
    return this.findById(id)
      .then((relationData) => {
        if (relationData == null) {
          throw new Error('PageGroupRelation data is not exists. id:', id);
        }
        else {
          relationData.remove();
        }
      });
  }
}

module.exports = function(crowi) {
  PageGroupRelation.crowi = crowi;
  schema.loadClass(PageGroupRelation);
  const model = mongoose.model('PageGroupRelation', schema);
  model.init();
  return model;
};
