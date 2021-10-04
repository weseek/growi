import { Types } from 'mongoose';
import loggerFactory from '../../utils/logger';
import { getModelSafely } from '../util/mongoose-utils';
import { ActivityDocument } from '../models/activity';
import Crowi from '../crowi';

const logger = loggerFactory('growi:service:CommentService');


class CommentService {

  crowi!: Crowi;

  inAppNotificationService!: any;

  commentEvent!: any;

  activityEvent!: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.inAppNotificationService = crowi.inAppNotificationService;

    this.commentEvent = crowi.event('comment');
    this.activityEvent = crowi.event('activity');

    // init
    this.initCommentEventListeners();
  }


  initCommentEventListeners(): void {
    // create
    this.commentEvent.on('create', async(savedComment) => {
      const { activityService } = this.crowi;
      console.log('activityServiceHoge', activityService);

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(savedComment.page);


        // const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);
        const savedActivity = await activityService.createByPageComment(savedComment);

        let targetUsers: Types.ObjectId[] = [];
        targetUsers = await savedActivity.getNotificationTargetUsers();

        await this.inAppNotificationService.upsertByActivity(targetUsers, savedActivity);
      }
      catch (err) {
        logger.error('Error occurred while handling the comment create event:\n', err);
      }

    });

    // update
    this.commentEvent.on('update', (user) => {
      this.commentEvent.onUpdate();
      const { inAppNotificationService } = this.crowi;

      inAppNotificationService.emitSocketIo(user);
    });

    // remove
    this.commentEvent.on('remove', async(comment) => {
      this.commentEvent.onRemove();

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(comment.page);
      }
      catch (err) {
        logger.error('Error occurred while updating the comment count:\n', err);
      }
    });
  }

}

module.exports = CommentService;
