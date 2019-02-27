module.exports = function(crowi) {
  var debug = require('debug')('growi:models:tag'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    USER_PUBLIC_FIELDS = '_id name',
    tagSchema;

  tagSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
  });

  return mongoose.model('Tag', tagSchema);
};
