// disable no-return-await for model functions
/* eslint-disable no-return-await */

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
    required: true,
  },
  relatedTag: {
    type: ObjectId,
    ref: 'Tag',
    required: true,
  },
});
schema.plugin(mongoosePaginate);

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
