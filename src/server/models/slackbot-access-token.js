const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  accessTokenForGrowi: { type: String, required: true, unique: true },
  accessTokenForProxy: { type: String, required: true, unique: true },
});

module.exports = function(crowi) {
  const model = mongoose.model('', schema);
  return model;
};
