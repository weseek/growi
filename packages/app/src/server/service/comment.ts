import loggerFactory from '../../utils/logger';
import { getModelSafely } from '../util/mongoose-utils';
import Crowi from '../crowi';

const logger = loggerFactory('growi:service:CommentService');


class CommentService {

  crowi!: Crowi;

  commentEvent!: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;

    this.commentEvent = crowi.event('comment');

    // init
    this.initCommentEvent();
  }


  initCommentEvent(): void {
    // create
    this.commentEvent.on('create', async(savedComment) => {

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(savedComment.page);

        const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);
        const activityLog = await Activity.createByPageComment(savedComment);

        logger.info('Activity created', activityLog);
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

      const { activityService } = this.crowi;

      try {
        const Page = getModelSafely('Page') || require('../models/page')(this.crowi);
        await Page.updateCommentCount(comment.page);
      }
      catch (err) {
        throw err;
      }

      try {
        // TODO: Able to remove child activities of comment by GW-7510
        await activityService.removeByPageCommentDelete(comment);
      }
      catch (err) {
        logger.error(err);
      }
    });
  }

}

module.exports = CommentService;
