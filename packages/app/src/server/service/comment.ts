import { getModelSafely } from '@growi/core';
import { Types } from 'mongoose';

import { SUPPORTED_TARGET_MODEL_TYPE, SUPPORTED_EVENT_MODEL_TYPE, SUPPORTED_ACTION_TYPE } from '~/interfaces/activity';
import { stringifySnapshot } from '~/models/serializers/in-app-notification-snapshot/page';

import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';
import { prepareSlackMessageForComment } from '../util/slack';


// https://regex101.com/r/Ztxj2j/1
const USERNAME_PATTERN = new RegExp(/\B@[\w@.-]+/g);

const logger = loggerFactory('growi:service:CommentService');

class CommentService {

  crowi!: Crowi;

  activityService!: any;

  inAppNotificationService!: any;

  commentEvent!: any;

  slackIntegrationService;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.activityService = crowi.activityService;
    this.inAppNotificationService = crowi.inAppNotificationService;

    this.commentEvent = crowi.event('comment');
    this.slackIntegrationService = crowi.slackIntegrationService;

    // init
    this.initCommentEventListeners();
  }

  initCommentEventListeners(): void {
    // create
    this.commentEvent.on('create', async(savedComment) => {

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(savedComment.page);

        const page = await Page.findById(savedComment.page);
        if (page == null) {
          logger.error('Page is not found');
          return;
        }

        const activity = await this.createActivity(savedComment, SUPPORTED_ACTION_TYPE.ACTION_COMMENT_CREATE);
        await this.createAndSendNotifications(activity, page);
      }
      catch (err) {
        logger.error('Error occurred while handling the comment create event:\n', err);
      }

    });

    // update
    this.commentEvent.on('update', async(updatedComment) => {
      try {
        this.commentEvent.onUpdate();
        await this.createActivity(updatedComment, SUPPORTED_ACTION_TYPE.ACTION_COMMENT_UPDATE);
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

  private createActivity = async function(comment, action) {
    const parameters = {
      user: comment.creator,
      targetModel: SUPPORTED_TARGET_MODEL_TYPE.MODEL_PAGE,
      target: comment.page,
      eventModel: SUPPORTED_EVENT_MODEL_TYPE.MODEL_COMMENT,
      event: comment._id,
      action,
    };
    const activity = await this.activityService.createByParameters(parameters);
    return activity;
  };

  private createAndSendNotifications = async function(activity, page) {
    const snapshot = stringifySnapshot(page);

    // Get user to be notified
    let targetUsers: Types.ObjectId[] = [];
    targetUsers = await activity.getNotificationTargetUsers();

    const commentObject = await this.getComment(activity.event);
    const { comment } = commentObject;
    const mentionedUsers = await this.getMentionedUsers(comment);
    const usersForInAppNotification = mentionedUsers.map((user) => {
      return user._id;
    });

    // Add mentioned users to targetUsers (for inAppNotification)
    targetUsers = targetUsers.concat(usersForInAppNotification);

    await this.inAppNotificationService.upsertByActivity(targetUsers, activity, snapshot);
    await this.inAppNotificationService.emitSocketIo(targetUsers);

    // Send notification to slack users
    await this.sendNotificationToSlackUsers(mentionedUsers, commentObject, page);
  };

  getMentionedUsers = async(comment: string): Promise<Types.ObjectId[]> => {
    const User = this.getUserModel();
    const usernamesFromComment = comment.match(USERNAME_PATTERN);

    // Get username from comment and remove duplicate username
    const mentionedUsernames = [...new Set(usernamesFromComment?.map((username) => {
      return username.slice(1);
    }))];

    // Get mentioned users ID
    const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } });
    return mentionedUsers?.map((user) => {
      return user;
    });
  }

  getComment = async(commentId: Types.ObjectId): Promise<any> => {
    const Comment = getModelSafely('Comment') || require('../models/comment')(this.crowi);
    const comment = await Comment.findOne({ _id: commentId });
    return comment;
  }


  sendNotificationToSlackUsers = async(users: any[], comment: any, page:any) : Promise<void> => {
    const User = this.getUserModel();
    const { creator } = comment;

    const appTitle = this.crowi.appService?.getAppTitle();
    const siteUrl = this.crowi.appService?.getSiteUrl();
    const commentCreator = await User.findOne({ _id: creator });

    users.map(async(user) => {
      if (user.slackMemberId !== undefined) {
        const messageObj = prepareSlackMessageForComment(comment, commentCreator, appTitle, siteUrl, user.slackMemberId, page.path);
        return this.slackIntegrationService.postMessage(messageObj);
      }
      return;
    });
  }

  getUserModel = () => {
    return getModelSafely('User') || require('../models/user')(this.crowi);
  }

}


module.exports = CommentService;
