// disable no-return-await for model functions
/* eslint-disable no-return-await */

const flatMap = require('array.prototype.flatmap');

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

const ObjectId = mongoose.Schema.Types.ObjectId;


/*
 * define schema
 */
const schema = new mongoose.Schema({
  relatedPage: {
    type: ObjectId,
    ref: 'Page',
    required: true,
  },
  relatedTag: {
    type: ObjectId,
    ref: 'Tag',
    required: true,
  },
});
// define unique compound index
schema.index({ page: 1, user: 1 }, { unique: true });
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

/**
 * PageTagRelation Class
 *
 * @class PageTagRelation
 */
class PageTagRelation {

  static async createTagListWithCount(option) {
    const Tag = mongoose.model('Tag');
    const opt = option || {};
    const sortOpt = opt.sortOpt || {};
    const offset = opt.offset || 0;
    const limit = opt.limit || 50;

    const existTagIds = await Tag.find().distinct('_id');
    const tags = await this.aggregate()
      .match({ relatedTag: { $in: existTagIds } })
      .group({ _id: '$relatedTag', count: { $sum: 1 } })
      .sort(sortOpt);

    const list = tags.slice(offset, offset + limit);
    const totalCount = tags.length;

    return { list, totalCount };
  }

  static async findByPageId(pageId) {
    const relations = await this.find({ relatedPage: pageId }).populate('relatedTag').select('-_id relatedTag');
    return relations.filter((relation) => { return relation.relatedTag !== null });
  }

  static async listTagNamesByPage(pageId) {
    const relations = await this.findByPageId(pageId);
    return relations.map((relation) => { return relation.relatedTag.name });
  }

  /**
   * @return {object} key: Page._id, value: array of tag names
   */
  static async getIdToTagNamesMap(pageIds) {
    /**
     * @see https://docs.mongodb.com/manual/reference/operator/aggregation/group/#pivot-data
     *
     * results will be:
     * [
     *   { _id: 58dca7b2c435b3480098dbbc, tagIds: [ 5da630f71a677515601e36d7, 5da77163ec786e4fe43e0e3e ]},
     *   { _id: 58dca7b2c435b3480098dbbd, tagIds: [ ... ]},
     *   ...
     * ]
     */
    const results = await this.aggregate()
      .match({ relatedPage: { $in: pageIds } })
      .group({ _id: '$relatedPage', tagIds: { $push: '$relatedTag' } });

    if (results.length === 0) {
      return {};
    }

    results.flatMap = flatMap.shim(); // TODO: remove after upgrading to node v12

    // extract distinct tag ids
    const allTagIds = results
      .flatMap(result => result.tagIds); // map + flatten
    const distinctTagIds = Array.from(new Set(allTagIds));

    // retrieve tag documents
    const Tag = mongoose.model('Tag');
    const tagIdToNameMap = await Tag.getIdToNameMap(distinctTagIds);

    // convert to map
    const idToTagNamesMap = {};
    results.forEach((result) => {
      const tagNames = result.tagIds
        .map(tagId => tagIdToNameMap[tagId])
        .filter(tagName => tagName != null); // filter null object

      idToTagNamesMap[result._id] = tagNames;
    });

    return idToTagNamesMap;
  }

  static async updatePageTags(pageId, tags) {
    if (pageId == null || tags == null) {
      throw new Error('args \'pageId\' and \'tags\' are required.');
    }

    // filter empty string
    // eslint-disable-next-line no-param-reassign
    tags = tags.filter((tag) => { return tag !== '' });

    const Tag = mongoose.model('Tag');

    // get relations for this page
    const relations = await this.findByPageId(pageId);

    // unlink relations
    const unlinkTagRelations = relations.filter((relation) => { return !tags.includes(relation.relatedTag.name) });
    const bulkDeletePromise = this.deleteMany({
      relatedPage: pageId,
      relatedTag: { $in: unlinkTagRelations.map((relation) => { return relation.relatedTag._id }) },
    });

    // filter tags to create
    const relatedTagNames = relations.map((relation) => { return relation.relatedTag.name });
    // find or create tags
    const tagsToCreate = tags.filter((tag) => { return !relatedTagNames.includes(tag) });
    const tagEntities = await Tag.findOrCreateMany(tagsToCreate);

    // create relations
    const bulkCreatePromise = this.insertMany(
      tagEntities.map((relatedTag) => {
        return {
          relatedPage: pageId,
          relatedTag,
        };
      }),
    );

    return Promise.all([bulkDeletePromise, bulkCreatePromise]);
  }

}

module.exports = function() {
  schema.loadClass(PageTagRelation);
  const model = mongoose.model('PageTagRelation', schema);
  return model;
};
