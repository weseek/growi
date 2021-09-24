import loggerFactory from '../../utils/logger';

import { Activity } from '../models/activity';

import ActivityDefine from '../util/activityDefine';

// const InAppNotificationService = require('./in-app-notification');


const logger = loggerFactory('growi:service:ActivityService');

class ActivityService {

  crowi: any;

  inAppNotificationService: any;

  // commentEvent!: any;

  constructor(crowi) {
    this.crowi = crowi;
    this.inAppNotificationService = crowi.inAppNotificationService;
    // this.commentEvent = crowi.event('comment');

    // // init
    // this.initCommentEvent();
  }

  // initCommentEvent(): void {
  //   // create
  //   this.commentEvent.on('create', async(savedComment) => {
  //     this.commentEvent.onCreate();

  //     try {
  //       const activityLog = await Activity.createByPageComment(savedComment);
  //       logger.info('Activity created', activityLog);
  //     }
  //     catch (err) {
  //       throw err;
  //     }

  //   });

  //   // update
  //   this.commentEvent.on('update', (user) => {
  //     this.commentEvent.onUpdate();
  //     const inAppNotificationService = new InAppNotificationService(this.crowi);

  //     inAppNotificationService.emitSocketIo(user);
  //   });

  //   // remove
  //   this.commentEvent.on('remove', async(comment) => {
  //     this.commentEvent.onRemove();

  //     try {
  //       // TODO: Able to remove child activities of comment by GW-7510
  //       await this.removeByPageCommentDelete(comment);
  //     }
  //     catch (err) {
  //       logger.error(err);
  //     }
  //   });
  // }

  /**
   * @param {Comment} comment
   * @return {Promise}
   */
  removeByPageCommentDelete = async function(comment) {
    const parameters = await {
      user: comment.creator,
      targetModel: ActivityDefine.MODEL_PAGE,
      target: comment.page,
      eventModel: ActivityDefine.MODEL_COMMENT,
      event: comment._id,
      action: ActivityDefine.ACTION_COMMENT,
    };

    await Activity.removeByParameters(parameters);
    return;
  };

}

module.exports = ActivityService;
