require('module-alias/register');
const logger = require('@alias/logger')('growi:migrate:remove-layout-setting');

const mongoose = require('mongoose');
const config = require('@root/config/migrate');

const { getModelSafely } = require('@commons/util/mongoose-utils');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    const layoutType = await Config.findOneAndDelete({ key: 'customize:layout' });

    const promise = [
      // remove layout
      Config.findOneAndDelete({ key: 'customize:layout' }),
    ];

    if (layoutType.value === '"kibela"') {
      promise.push(
        Config.update(
          { key: 'customize:theme' },
          { value: JSON.stringify('kibela') },
        ),
      );
    }

    await Promise.all(promise);

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    logger.info('Rollback migration');
    mongoose.connect(config.mongoUri, config.mongodb.options);

    const Config = getModelSafely('Config') || require('@server/models/config')();

    const insertConfig = new Config({
      ns: 'crowi',
      key: 'customize:layout',
      value: JSON.stringify('kibela'),
    });

    await Promise.all([
      insertConfig.save(),

      Config.update(
        { key: 'customize:theme', value: JSON.stringify('kibela') },
        { value: JSON.stringify('default') },
      ),
    ]);

    logger.info('Migration has been successfully rollbacked');
  },
};
