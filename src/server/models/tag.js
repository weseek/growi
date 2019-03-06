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
  async findOrCreate(tagName) {

  }
}

module.exports = function() {
  schema.loadClass(Tag);
  const model = mongoose.model('Tag', schema);
  return model;
};
