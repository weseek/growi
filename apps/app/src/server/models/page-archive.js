module.exports = function(crowi) {
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;

  const pageArchiveSchema = new mongoose.Schema({
    owner: {
      type: ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    rootPagePath: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'markdown'], required: true },
    numOfPages: { type: Number, required: true },
    hasComment: { type: Boolean, required: true },
    hasAttachment: { type: Boolean, required: true },
  }, {
    timestamps: true,
  });

  return mongoose.model('PageArchive', pageArchiveSchema);
};
