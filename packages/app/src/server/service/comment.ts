import { getModelSafely } from '@growi/core';
import { Types } from 'mongoose';

import { SUPPORTED_TARGET_MODEL_TYPE, SUPPORTED_ACTION_TYPE, ISnapshot } from '~/interfaces/activity';
import { stringifySnapshot } from '~/models/serializers/in-app-notification-snapshot/page';

import loggerFactory from '../../utils/logger';
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
    this.commentEvent.on('create', async(user, savedComment) => {

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(savedComment.page);

        const page = await Page.findById(savedComment.page);
        if (page == null) {
          logger.error('Page is not found');
          return;
        }

        const activity = await this.createActivity(user, savedComment.page, SUPPORTED_ACTION_TYPE.ACTION_COMMENT_CREATE);
        await this.createAndSendNotifications(activity, page);
      }
      catch (err) {
        logger.error('Error occurred while handling the comment create event:\n', err);
      }

    });

    // update
    this.commentEvent.on('update', async(user, updatedComment) => {
      try {
        this.commentEvent.onUpdate();
        await this.createActivity(user, updatedComment.page, SUPPORTED_ACTION_TYPE.ACTION_COMMENT_UPDATE);
      }
      catch (err) {
        logger.error('Error occurred while handling the comment update event:\n', err);
      }
    });

    // remove
    this.commentEvent.on('delete', async(comment) => {
      this.commentEvent.onDelete();

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(comment.page);
      }
      catch (err) {
        logger.error('Error occurred while updating the comment count:\n', err);
      }
    });
  }

  private createActivity = async function(user, target, action) {
    const snapshot: ISnapshot = { username: user.username };
    const parameters = {
      user: user._id,
      targetModel: SUPPORTED_TARGET_MODEL_TYPE.MODEL_PAGE,
      target,
      action,
      snapshot,
    };
    const activity = await this.activityService.createByParameters(parameters);
    return activity;
  };

  private createAndSendNotifications = async function(activity, page) {

    // Get user to be notified
    let targetUsers: Types.ObjectId[] = [];
    targetUsers = await activity.getNotificationTargetUsers();

    // Create and send notifications
    const snapshot = stringifySnapshot(page);
    await this.inAppNotificationService.upsertByActivity(targetUsers, activity, snapshot);
    await this.inAppNotificationService.emitSocketIo(targetUsers);
  };

}

module.exports = CommentService;
