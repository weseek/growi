import Crowi from '../crowi';

import ActivityDefine from '../util/activityDefine';
import { getModelSafely } from '../util/mongoose-utils';


class ActivityService {

  crowi!: Crowi;

  inAppNotificationService!: any;

  activityEvent!: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.inAppNotificationService = crowi.inAppNotificationService;
    this.activityEvent = crowi.event('activity');
  }

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
    const savedActivity = await Activity.createByParameters(parameters);
    return savedActivity;
  };


}

module.exports = ActivityService;
