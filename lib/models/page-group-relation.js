const debug = require('debug')('crowi:models:pageGroupRelation');
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
  toObject: { getters: true }
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
  static findPageGroupRelationsWithPagination(userGroup, opts) {
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
        if (0 < count) {
          return this.find(query).exec();
        }
        else {
          return this.createRelation(userGroup, page);
        }
      })
      .catch((err) => {
        debug('An Error occured.', err);
        return reject(err);
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

    return this
      .find({ targetPage: page.id })
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
  static isExistsGrantedGroupForPageAndUser(pageData, userData) {
    var UserGroupRelation = PageGroupRelation.crowi.model('UserGroupRelation');

    return this.findByPage(pageData)
      .then((pageRelations) => {
        return pageRelations.map((pageRelation) => {
          return UserGroupRelation.isRelatedUserForGroup(userData, pageRelation.relatedGroup)
        });
      })
      .then((checkPromises) => {
        return Promise.all(checkPromises)
      })
      .then((checkResults) => {
        var checkResult = false;
        checkResults.map((result) => {
          if (result) {
            checkResult = true;
          }
        });
        return checkResult;
      })
      .catch((err) => {
        return reject(err);
      });
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
  };

  /**
   * remove all relation for UserGroup
   *
   * @static
   * @param {UserGroup} userGroup related group for remove
   * @returns {Promise<any>}
   * @memberof PageGroupRelation
   */
  static removeAllByUserGroup(userGroup) {

    return this.findAllRelationForUserGroup(userGroup)
      .then((relations) => {
        if (relations == null) {
          return;
        }
        else {
          relations.map((relation) => {
            relation.remove();
          });
        }
      });
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
      .then((relations) => {
        debug('remove relations are ', relations);
        if (relations == null) {
          return;
        }
        else {
          relations.map((relation) => {
            relation.remove();
          });
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
          throw new Exception('PageGroupRelation data is not exists. id:', id);
        }
        else {
          relationData.remove();
        }
      })
      .catch((err) => {
        debug('Error on find a removing page-group-relation', err);
        return reject(err);
      });
  }
}

module.exports = function (crowi) {
  PageGroupRelation.crowi = crowi;
  schema.loadClass(PageGroupRelation);
  return mongoose.model('PageGroupRelation', schema);
}
