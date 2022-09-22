// disable no-return-await for model functions
/* eslint-disable no-return-await */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

const ObjectId = mongoose.Schema.Types.ObjectId;

/*
 * define schema
 */
const schema = new mongoose.Schema({
  relatedPage: {
    type: ObjectId,
    ref: 'Page',
    required: true,
    index: true,
  },
  expiredAt: { type: Date },
  description: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

module.exports = function(crowi) {

  schema.methods.isExpired = function() {
    if (this.expiredAt == null) {
      return false;
    }
    return this.expiredAt.getTime() < new Date().getTime();
  };

  const model = mongoose.model('ShareLink', schema);
  return model;
};
