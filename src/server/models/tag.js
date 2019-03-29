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

  /**
   * create tag if the tag is not exist
   * @param {String} tagName
   */
  static async findOrCreate(tagName) {
    const tag = await this.findOne({ name: tagName });
    if (!tag) {
      return await this.create({ name: tagName });
    }
    return tag;
  }

  /**
   * return all page id related all tag of tagList
   * @param {String[]} tagList
   */
  static async getRelatedPageIds(tagList) {
    const PageTagRelation = mongoose.model('PageTagRelation');

    const tag = await this.findOne({ name: tagList[0] });
    if (tag) {
      const pageRelations = await PageTagRelation.find({ relatedTag: tag._id }).populate('relatedPage').select('-_id relatedPage');
      return pageRelations.map((relation) => { return relation.relatedPage.id });
    }
    return;
  }

}

module.exports = function() {
  schema.loadClass(Tag);
  const model = mongoose.model('Tag', schema);
  return model;
};
