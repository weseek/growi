import { InAppNotificationStatuses } from '~/interfaces/in-app-notification';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:changed-status-in-inappnotifications-from-unread-to-unopened');

module.exports = {
  async up(db) {
    logger.info('Apply migration');

    const unreadInAppnotifications = await db.collection('inappnotifications');
    await unreadInAppnotifications.updateMany(
      { status: { $eq: InAppNotificationStatuses.STATUS_UNREAD } },
      [
        {
          $set: {
            status: InAppNotificationStatuses.STATUS_UNOPENED,
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
