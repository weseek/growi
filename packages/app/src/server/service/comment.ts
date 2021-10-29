import { Types } from 'mongoose';
import loggerFactory from '../../utils/logger';
import { getModelSafely } from '../util/mongoose-utils';
import ActivityDefine from '../util/activityDefine';
import Crowi from '../crowi';

const logger = loggerFactory('growi:service:CommentService');

class CommentService {

  crowi!: Crowi;

  activityService!: any;

  inAppNotificationService!: any;

  commentEvent!: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.activityService = crowi.activityService;
    this.inAppNotificationService = crowi.inAppNotificationService;

    this.commentEvent = crowi.event('comment');

    // init
    this.initCommentEventListeners();
  }

  initCommentEventListeners(): void {
    // create
    this.commentEvent.on('create', async(savedComment) => {

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(savedComment.page);

        await this.createAndSendNotifications(savedComment);
      }
      catch (err) {
        logger.error('Error occurred while handling the comment create event:\n', err);
      }

    });

    // update
    this.commentEvent.on('update', async() => {
      try {
        this.commentEvent.onUpdate();
      }
      catch (err) {
        logger.error('Error occurred while handling the comment update event:\n', err);
      }
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

  private createAndSendNotifications = async function(comment) {

    // Create activity
    const parameters = {
      user: comment.creator,
      targetModel: ActivityDefine.MODEL_PAGE,
      target: comment.page,
      eventModel: ActivityDefine.MODEL_COMMENT,
      event: comment._id,
      action: ActivityDefine.ACTION_COMMENT,
    };
    const activity = await this.activityService.createByParameters(parameters);

    // Get user to be notified
    let targetUsers: Types.ObjectId[] = [];
    targetUsers = await activity.getNotificationTargetUsers();

    // Create and send notifications
    await this.inAppNotificationService.upsertByActivity(targetUsers, activity);
    await this.inAppNotificationService.emitSocketIo(targetUsers);
  };

}

module.exports = CommentService;
