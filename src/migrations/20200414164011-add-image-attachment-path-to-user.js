require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:add-image-attachment-parh-to-user');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {

  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const User = getModelSafely('User') || require('@server/models/user')();
    require('@server/models/attachment')(); // for populating imageAttachment

    const users = await User.find({ imageAttachment: { $exists: true } })
      .populate({
        path: 'imageAttachment',
      })
      .select('imageAttachment');

    const requests = users.filter(user => user.imageAttachment).map((user) => {
      return {
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { imageAttachmentPathCache: user.imageAttachment.filePathProxied } },
        },
      };
    });

    if (requests.length > 0) {
      await db.collection('users').bulkWrite(requests);
    }

    logger.info('Migration has successfully applied');
  },

  down(db) {
    db.collection('users').update({}, { $unset: 'imageAttachmentPathCache' });
  },
};
