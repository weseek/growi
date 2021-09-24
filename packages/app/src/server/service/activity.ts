import loggerFactory from '../../utils/logger';

import { Activity } from '../models/activity';

import ActivityDefine from '../util/activityDefine';


const logger = loggerFactory('growi:service:ActivityService');

class ActivityService {

  crowi: any;

  inAppNotificationService: any;

  // commentEvent!: any;

  constructor(crowi) {
    this.crowi = crowi;
    this.inAppNotificationService = crowi.inAppNotificationService;
  }

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
