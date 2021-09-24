import loggerFactory from '../../utils/logger';

import { Activity } from '~/server/models/activity';

const InAppNotificationService = require('./in-app-notification');


const logger = loggerFactory('growi:service:ActivityService');

class ActivityService {

  crowi: any;

  inAppNotificationService: any;

  commentEvent!: any;

  constructor(crowi) {
    this.crowi = crowi;
    this.inAppNotificationService = crowi.inAppNotificationService;
    this.commentEvent = crowi.event('comment');

    // init
    this.initCommentEvent();
  }

  initCommentEvent(): void {
    // create
    this.commentEvent.on('create', async(savedComment) => {
      this.commentEvent.onCreate();

      try {
        const activityLog = await Activity.createByPageComment(savedComment);
        logger.info('Activity created', activityLog);
      }
      catch (err) {
        throw err;
      }

    });

    // update
    this.commentEvent.on('update', (user) => {
      this.commentEvent.onUpdate();
      const inAppNotificationService = new InAppNotificationService(this.crowi);

      inAppNotificationService.emitSocketIo(user);
    });

    // remove
    this.commentEvent.on('remove', async(comment) => {
      this.commentEvent.onRemove();

      try {
        // TODO: Able to remove child activities of comment by GW-7510
        await Activity.removeByPageCommentDelete(comment);
      }
      catch (err) {
        logger.error(err);
      }
    });

  }

}

module.exports = ActivityService;
