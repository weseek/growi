// eslint-disable-next-line import/no-named-as-default
import Config from '~/server/models/config';
import { getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:remove-basic-auth-related-config');

const mongoose = require('mongoose');

module.exports = {
  async up() {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    await Config.findOneAndDelete({ key: 'security:passport-basic:isEnabled' });
    await Config.findOneAndDelete({ key: 'security:passport-basic:isSameUsernameTreatedAsIdenticalUser' });

    logger.info('Migration has successfully applied');
  },

  async down() {
    // No rollback
  },
};
