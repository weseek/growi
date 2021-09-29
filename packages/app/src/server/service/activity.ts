import { Types } from 'mongoose';
import Crowi from '../crowi';
import loggerFactory from '../../utils/logger';

import { ActivityDocument } from '../models/activity';

import ActivityDefine from '../util/activityDefine';
import { getModelSafely } from '../util/mongoose-utils';


const logger = loggerFactory('growi:service:ActivityService');

class ActivityService {

  crowi!: Crowi;

  inAppNotificationService!: any;

  activityEvent!: any;

  // commentEvent!: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.inAppNotificationService = crowi.inAppNotificationService;
    this.activityEvent = crowi.event('activity');

    this.setUpEventListeners();
  }

  setUpEventListeners() {
    this.initActivityEventListeners();
  }

  initActivityEventListeners() {
    this.activityEvent.on('create', async(targetUsers: Types.ObjectId[], activity: ActivityDocument) => {
      try {
        await this.inAppNotificationService.upsertByActivity(targetUsers, activity);
      }
      catch (err) {
        logger.error('Error occurred while saving InAppNotification');
        throw err;
      }
    });
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

    const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);
    await Activity.removeByParameters(parameters);
    return;
  };

    /**
     * @param {Page} page
     * @param {User} user
     * @return {Promise}
     */
    createByPageUpdate = async function(page, user) {
      const parameters = {
        user: user._id,
        targetModel: ActivityDefine.MODEL_PAGE,
        target: page,
        action: ActivityDefine.ACTION_UPDATE,
      };
      const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);
      await Activity.createByParameters(parameters);
      return;
    };


}

module.exports = ActivityService;
