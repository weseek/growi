module.exports = function(crowi) {
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;

  const pageArchiveSchema = new mongoose.Schema({
    filePath: { type: String, required: true },
    creator: { type: ObjectId, ref: 'User', index: true },
    basePagePath: { type: String, required: true },
  }, {
    timestamps: true,
  });

  return mongoose.model('PageArchive', pageArchiveSchema);
};
