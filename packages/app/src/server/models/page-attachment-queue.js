module.exports = function(crowi) {
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;

  const pageAttachmentQueue = new mongoose.Schema({
    owner: {
      type: ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    rootPagePath: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'markdown'], required: true },
    // status: { type: String, enum: ['pending', 'success'], require: true },
    // numOfPages: { type: Number, required: true },
  }, {
    timestamps: true,
  });

  return mongoose.model('PageAttachmentQueue', pageAttachmentQueue);
};
