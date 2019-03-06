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

  static async createIfNotExist(pageId, tagId) {
    if (!await this.findOne({relatedPage: pageId, relatedTag: tagId})) {
      this.create({relatedPage: pageId, relatedTag: tagId});
    }
  }

}

module.exports = function() {
  schema.loadClass(PageTagRelation);
  const model = mongoose.model('PageTagRelation', schema);
  return model;
};
