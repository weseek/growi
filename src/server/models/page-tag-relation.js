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

  static async createIfNotExist(pageId, tagId) {
    if (!await this.findOne({ relatedPage: pageId, relatedTag: tagId })) {
      await this.create({ relatedPage: pageId, relatedTag: tagId });
    }
  }

  static async createTagListWithCount(opt) {
    const Tag = PageTagRelation.crowi.model('Tag');

    // get objects contain id and count
    const list = await this.aggregate()
      .group({ _id: '$relatedTag', count: { $sum: 1 } })
      .sort(opt.sortOpt)
      .skip(opt.offset)
      .limit(opt.limit);

    // get tag document for add name data to the list
    const tags = await Tag.find({ _id: { $in: list.map((elm) => { return elm._id }) } });

    // add name data
    const result = list.map((elm) => {
      const tag = tags.find((tag) => { return (tag.id === String(elm._id)) });
      elm.name = tag.name;
      return elm;
    });

    return result;
  }

}

module.exports = function(crowi) {
  PageTagRelation.crowi = crowi;
  schema.loadClass(PageTagRelation);
  const model = mongoose.model('PageTagRelation', schema);
  return model;
};
