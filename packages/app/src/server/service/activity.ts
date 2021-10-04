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

    const savedActivity = await this.createByParameters(parameters);
    return savedActivity;
  };

  /**
     * @param {object} parameters
     * @return {Promise}
     */
  createByParameters = function(parameters) {
    const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);
    return Activity.create(parameters);
  };

  /**
   * @param {Comment} comment
   * @return {Promise}
   */
  createByPageComment = function(comment) {
    const parameters = {
      user: comment.creator,
      targetModel: ActivityDefine.MODEL_PAGE,
      target: comment.page,
      eventModel: ActivityDefine.MODEL_COMMENT,
      event: comment._id,
      action: ActivityDefine.ACTION_COMMENT,
    };

    return this.createByParameters(parameters);
  };

  /**
   * @param {User} user
   * @return {Promise}
   */
  findByUser = function(user) {
    return this.find({ user }).sort({ createdAt: -1 }).exec();
  };

  getActionUsersFromActivities = function(activities) {
    return activities.map(({ user }) => user).filter((user, i, self) => self.indexOf(user) === i);
  };

}

module.exports = ActivityService;
