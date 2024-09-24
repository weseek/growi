import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:non-null-granted-groups');

module.exports = {
  async up(db) {
    logger.info('Apply migration');

    const unreadInAppnotifications = await await db.collection('inappnotifications');
    await unreadInAppnotifications.updateMany(
      { status: { $eq: 'UNREAD' } },
      [
        {
          $set: {
            status: 'UNOPENED',
          },
        },
      ],
    );

    logger.info('Migration has successfully applied');
  },

  async down() {
    // No rollback
  },
};
