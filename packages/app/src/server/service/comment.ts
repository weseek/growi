import { Types } from 'mongoose';

import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';
import { getModelSafely } from '../util/mongoose-utils';

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
    this.commentEvent.on('create', async(savedComment) => {

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(savedComment.page);
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
    this.commentEvent.on('delete', async(removedComment) => {
      this.commentEvent.onDelete();

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(removedComment.page);
      }
      catch (err) {
        logger.error('Error occurred while updating the comment count:\n', err);
      }
    });
  }

  getMentionedUsers = async(commentId: Types.ObjectId): Promise<Types.ObjectId[]> => {
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
  };

}


module.exports = CommentService;
