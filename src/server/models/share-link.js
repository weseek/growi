// disable no-return-await for model functions
/* eslint-disable no-return-await */

const mongoose = require('mongoose');
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
  expiration: { type: Date },
  description: { type: String },
  createdAt: { type: Date, default: Date.now, required: true },
});

schema.plugin(uniqueValidator);

module.exports = function(crowi) {
  const model = mongoose.model('ShareLink', schema);
  return model;
};
