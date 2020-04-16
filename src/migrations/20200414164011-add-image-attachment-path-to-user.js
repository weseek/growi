require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:add-image-attachment-parh-to-user');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

module.exports = {

  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);
    const User = require('@server/models/user')();
    require('@server/models/attachment')();

    const users = await User.find({ imageAttachment: { $exists: true } })
      .populate({
        path: 'imageAttachment',
      })
      .select('imageAttachment');

    const requests = users.filter(user => user.imageAttachment).map((user) => {
      return {
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { imageAttachmentPath: user.imageAttachment.filePathProxied } },
        },
      };
    });

    if (requests.length > 0) {
      await db.collection('users').bulkWrite(requests);
    }

    logger.info('Migration has successfully applied');
  },

  down(db) {
    db.collection('users').update({}, { $unset: 'imageAttachmentPath' });
  },
};
