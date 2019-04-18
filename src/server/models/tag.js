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

class TagQueryBuilder {

  constructor(query) {
    this.query = query;
  }

  addConditionToPagenate(offset, limit, sortOpt) {
    this.query = this.query
      .sort(sortOpt).skip(offset).limit(limit); // eslint-disable-line newline-per-chained-call

    return this;
  }

}

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

  static async findList(option) {
    const opt = Object.assign({ sort: 'count', desc: -1 }, option);
    const builder = new TagQueryBuilder(this.find({}));
    const sortOpt = {};
    sortOpt[opt.sort] = opt.desc;

    // count
    const totalCount = await builder.query.exec('count');

    // find
    builder.addConditionToPagenate(opt.offset, opt.limit, sortOpt);
    const tags = await builder.query.exec('find');
    const result = {
      tags, totalCount, offset: opt.offset, limit: opt.limit,
    };
    return result;
  }

}

module.exports = function() {
  schema.loadClass(Tag);
  const model = mongoose.model('Tag', schema);
  return model;
};
