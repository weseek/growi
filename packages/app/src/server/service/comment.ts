import { getModelSafely } from '@growi/core';
import { Types } from 'mongoose';

import {
  SUPPORTED_TARGET_MODEL_TYPE, SUPPORTED_ACTION_TYPE, SupportedActionType, ISnapshot,
} from '~/interfaces/activity';
import { IPage } from '~/interfaces/page';
import { IUserHasId } from '~/interfaces/user';
import { stringifySnapshot } from '~/models/serializers/in-app-notification-snapshot/page';

import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';

// https://regex101.com/r/Ztxj2j/1
const USERNAME_PATTERN = new RegExp(/\B@[\w@.-]+/g);

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
      }
      catch (err) {
        logger.error('Error occurred while handling the comment create event:\n', err);
      }

    });

    // update
    this.commentEvent.on('update', async(user, updatedComment) => {
      try {
        this.commentEvent.onUpdate();
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

  private createActivity = async function(user: IUserHasId, target: IPage, action: SupportedActionType) {
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

  private createAndSendNotifications = async function(activity, page: IPage) {

    // Get user to be notified
    let targetUsers: Types.ObjectId[] = [];
    targetUsers = await activity.getNotificationTargetUsers();

    // Create and send notifications
    const snapshot = stringifySnapshot(page);
    // Add mentioned users to targetUsers
    const mentionedUsers = await this.getMentionedUsers(activity.event);
    targetUsers = targetUsers.concat(mentionedUsers);

    await this.inAppNotificationService.upsertByActivity(targetUsers, activity, snapshot);
    await this.inAppNotificationService.emitSocketIo(targetUsers);
  };

  getMentionedUsers = async function(commentId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const Comment = getModelSafely('Comment') || require('../models/comment')(this.crowi);
    const User = getModelSafely('User') || require('../models/user')(this.crowi);

    // Get comment by comment ID
    const commentData = await Comment.findOne({ _id: commentId });
    const { comment } = commentData;

    const usernamesFromComment = comment.match(USERNAME_PATTERN);

    // Get username from comment and remove duplicate username
    const mentionedUsernames = [...new Set(usernamesFromComment?.map((username) => {
      return username.slice(1);
    }))];

    // Get mentioned users ID
    const mentionedUserIDs = await User.find({ username: { $in: mentionedUsernames } });
    return mentionedUserIDs?.map((user) => {
      return user._id;
    });
  }

}


module.exports = CommentService;
