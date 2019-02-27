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
    return this.find()
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
   * find all tag related to the page
   *
   * @static
   * @param {ObjectId} pageId
   * @returns {Promise<ObjectId[]>}
   * @memberof PageTagRelation
   */
  static findAllTagIdForPage(pageId) {
    return this
      .find({
        relatedPage: pageId
      })
      .select('-_id relatedTag');
  }

  /**
   * find all page related to the tag
   *
   * @static
   * @param {tag} tag
   * @returns {Promise<ObjectId[]>}
   * @memberof PageTagRelation
   */
  static findAllPageIdForTag(tag) {
    return new Promise((resolve, reject) => {
      this.find({
        relatedTag: tag._id
      }, function(err, relations) {
        if (err) {
          reject(err);
        }
        resolve(relations.map(rel => rel.relatedPage));
      });
    });
  }

  /**
   * create a page tag relation
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
   * remove relation by id
   *
   * @static
   * @param {ObjectId} id
   * @returns {Promise<PageTagRelation>}
   * @memberof PageTagRelation
   */
  static removeByEachId(pageId, tagId) {
    return new Promise((resolve, reject) => {
      this.remove({relatedPage: pageId, relatedTag: tagId}, function(err, removedData) {
        if (err) {
          reject(err);
        }
        resolve(removedData);
      });
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
