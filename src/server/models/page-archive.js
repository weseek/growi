module.exports = function(crowi) {
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;

  const pageArchiveSchema = new mongoose.Schema({
    owner: { type: ObjectId, ref: 'User', index: true },
    rootPagePath: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'markdown'] },
    numOfPages: { type: Number },
    hasComment: { type: Boolean },
    hasAttachment: { type: Boolean },
  }, {
    timestamps: true,
  });

  return mongoose.model('PageArchive', pageArchiveSchema);
};
