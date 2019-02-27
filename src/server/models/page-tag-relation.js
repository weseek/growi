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

  static init() {
    this.removeAllInvalidRelations();
  }

  /**
   * remove all invalid relations that has reference to unlinked document
   */
  static removeAllInvalidRelations() {
    const self = this;
    self.find(function(err, relations) {
      // filter invalid documents
      const invalidRelations = relations.filter(function(relation) {
        return relation.relatedTag == null || relation.relatedPage == null;
      });
      const ids = invalidRelations.map(relation => relation._id);
      self.deleteMany({
        _id: {
          $in: ids
        }
      });
    });
  }
}

module.exports = function() {
  schema.loadClass(PageTagRelation);
  const model = mongoose.model('PageTagRelation', schema);
  model.init();
  return model;
};
