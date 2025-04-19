import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:non-null-granted-groups');

module.exports = {
  async up(db, _client) {
    logger.info('Apply migration');

    const pageCollection = await db.collection('pages');

    await pageCollection.updateMany(
      { grantedGroups: { $eq: null } },
      [
        {
          $set: {
            grantedGroups: [],
          },
        },
      ],
    );

    logger.info('Migration has successfully applied');
  },

  async down(_db, _client) {
    // No rollback
  },
};
