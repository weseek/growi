import uniqueValidator from '../util/unique-validator';
import Tag from './tag';

// disable no-return-await for model functions
/* eslint-disable no-return-await */

const flatMap = require('array.prototype.flatmap');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ObjectId = mongoose.Schema.Types.ObjectId;


/*
 * define schema
 */
const schema = new mongoose.Schema({
  relatedPage: {
    type: ObjectId,
    ref: 'Page',
    required: true,
    index: true,
  },
  relatedTag: {
    type: ObjectId,
    ref: 'Tag',
    required: true,
    index: true,
  },
  isPageTrashed: {
    type: Boolean,
    default: false,
    required: true,
    index: true,
  },
});
// define unique compound index
schema.index({ relatedPage: 1, relatedTag: 1 }, { unique: true });
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

/**
 * PageTagRelation Class
 *
 * @class PageTagRelation
 */
class PageTagRelation {

  static async createTagListWithCount(option) {
    const opt = option || {};
    const sortOpt = opt.sortOpt || {};
    const offset = opt.offset;
    const limit = opt.limit;

    const tags = await this.aggregate()
      .match({ isPageTrashed: false })
      .lookup({
        from: 'tags',
        localField: 'relatedTag',
        foreignField: '_id',
        as: 'tag',
      })
      .unwind('$tag')
      .group({ _id: '$relatedTag', count: { $sum: 1 }, name: { $first: '$tag.name' } })
      .sort(sortOpt)
      .skip(offset)
      .limit(limit);

    const totalCount = (await this.find({ isPageTrashed: false }).distinct('relatedTag')).length;

    return { data: tags, totalCount };
  }

  static async findByPageId(pageId, options = {}) {
    const isAcceptRelatedTagNull = options.nullable || null;
    const relations = await this.find({ relatedPage: pageId }).populate('relatedTag').select('relatedTag');
    return isAcceptRelatedTagNull ? relations : relations.filter((relation) => { return relation.relatedTag !== null });
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

    // TODO: set IdToNameMap type by 93933
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

    // get relations for this page
    const relations = await this.findByPageId(pageId, { nullable: true });

    const unlinkTagRelationIds = [];
    const relatedTagNames = [];

    relations.forEach((relation) => {
      if (relation.relatedTag == null) {
        unlinkTagRelationIds.push(relation._id);
      }
      else {
        relatedTagNames.push(relation.relatedTag.name);
        if (!tags.includes(relation.relatedTag.name)) {
          unlinkTagRelationIds.push(relation._id);
        }
      }
    });
    const bulkDeletePromise = this.deleteMany({ _id: { $in: unlinkTagRelationIds } });
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

module.exports = function () {
  schema.loadClass(PageTagRelation);
  const model = mongoose.model('PageTagRelation', schema);
  return model;
};
