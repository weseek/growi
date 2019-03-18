// disable no-return-await for model functions
/* eslint-disable no-return-await */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

/*
 * define schema
 */
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
schema.plugin(mongoosePaginate);

/**
 * Tag Class
 *
 * @class Tag
 */
class Tag {

  static async findOrCreate(tagName) {
    const tag = await this.findOne({ name: tagName });
    if (!tag) {
      return await this.create({ name: tagName });
    }
    return tag;
  }

  // return all page id related  at least one tag (tagNames param is list)
  static async getRelatedPageIds(tagNames) {
    const PageTagRelation = mongoose.model('PageTagRelation');

    const tag = await this.findOne({ name: { $in: tagNames } });
    if (tag) {
      const pages = await PageTagRelation.find({ relatedTag: tag._id }).populate('relatedPage').select('-_id relatedPage');
      return pages.map((relation) => { return relation.relatedPage.id });
    }
    return;
  }

}

module.exports = function() {
  schema.loadClass(Tag);
  const model = mongoose.model('Tag', schema);
  return model;
};
