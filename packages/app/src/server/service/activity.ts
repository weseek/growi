import {
  Types,
} from 'mongoose';
import Crowi from '../crowi';


import { getModelSafely } from '../util/mongoose-utils';

import loggerFactory from '../../utils/logger';

const logger = loggerFactory('growi:service:activity');

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
     * @param {object} parameters
     * @return {Promise}
     */
  createByParameters = async function(parameters) {
    const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);

    return Activity.create(parameters);
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
