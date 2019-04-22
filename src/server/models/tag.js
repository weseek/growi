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

  static async findList(opt) {
    const PageTagRelation = Tag.crowi.model('PageTagRelation');
    const list = await PageTagRelation.createTagListWithCount(opt);

    // get tag document for add name data to the list
    const tags = await this.find({ _id: { $in: list } });

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
  Tag.crowi = crowi;
  schema.loadClass(Tag);
  const model = mongoose.model('Tag', schema);
  return model;
};
