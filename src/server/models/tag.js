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
    unique: true,
  },
});
schema.plugin(mongoosePaginate);

/**
 * Tag Class
 *
 * @class Tag
 */
class Tag {

  static async getIdToNameMap(tagIds) {
    const tags = await this.find({ _id: { $in: tagIds } });

    const idToNameMap = {};
    tags.forEach((tag) => {
      idToNameMap[tag._id.toString()] = tag.name;
    });

    return idToNameMap;
  }

  static async findOrCreate(tagName) {
    const tag = await this.findOne({ name: tagName });
    if (!tag) {
      return this.create({ name: tagName });
    }
    return tag;
  }

  static async findOrCreateMany(tagNames) {
    const existTags = await this.find({ name: { $in: tagNames } });
    const existTagNames = existTags.map((tag) => { return tag.name });

    // bulk insert
    const tagsToCreate = tagNames.filter((tagName) => { return !existTagNames.includes(tagName) });
    await this.insertMany(
      tagsToCreate.map((tag) => {
        return { name: tag };
      }),
    );

    return this.find({ name: { $in: tagNames } });
  }

}

module.exports = function(crowi) {
  Tag.crowi = crowi;
  schema.loadClass(Tag);
  const model = mongoose.model('Tag', schema);
  return model;
};
