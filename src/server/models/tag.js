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

}

module.exports = function(crowi) {
  Tag.crowi = crowi;
  schema.loadClass(Tag);
  const model = mongoose.model('Tag', schema);
  return model;
};
