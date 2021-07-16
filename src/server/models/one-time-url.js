const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

/*
 * define schema
 */
const schema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: String,
});
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

/**
 * Tag Class
 *
 * @class Tag
 */
class OneTimeUrl {

  static generateToken() {
    // TODO generate token
  }

}

module.exports = function(crowi) {
  OneTimeUrl.crowi = crowi;
  schema.loadClass(OneTimeUrl);
  const model = mongoose.model('OneTimeUrl', schema);
  return model;
};
