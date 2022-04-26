import { getModelSafely } from '@growi/core';

import Crowi from '../crowi';

class ActivityService {

  crowi!: Crowi;

  inAppNotificationService!: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.inAppNotificationService = crowi.inAppNotificationService;
  }


  /**
     * @param {object} parameters
     * @return {Promise}
     */
  createByParameters = function(parameters) {
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

  /**
   * @param {number} limit
   * @param {number} offset
   */
  getPaginatedActivity = async(limit: number, offset: number) => {
    const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);
    const paginateResult = await Activity.paginate(
      {},
      {
        limit,
        offset,
        sort: { createdAt: -1 },
      },
    );
    return paginateResult;
  }

}

module.exports = ActivityService;
