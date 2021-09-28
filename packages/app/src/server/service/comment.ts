import loggerFactory from '../../utils/logger';

import { Activity } from '../models/activity';

const InAppNotificationService = require('./in-app-notification');
const ActivityService = require('./activity');

const logger = loggerFactory('growi:service:CommentService');


class CommentService {

  crowi!: any;

  commentEvent!: any;

  constructor(crowi: any) {
    this.crowi = crowi;

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
      const { inAppNotificationService } = this.crowi;

      inAppNotificationService.emitSocketIo(user);
    });

    // remove
    this.commentEvent.on('remove', async(comments) => {
      this.commentEvent.onRemove();

      const { activityService } = this.crowi;

      try {
        await activityService.removeByPageCommentDeleteWithReplies(comments);
      }
      catch (err) {
        logger.error(err);
      }
    });
  }

}

module.exports = CommentService;
