import { getModelSafely } from '@growi/core';

import { IActivity, AllSupportedActionToNotifiedType } from '~/interfaces/activity';
import { IPage } from '~/interfaces/page';
import { stringifySnapshot } from '~/models/serializers/in-app-notification-snapshot/page';
import Activity from '~/server/models/activity';

import Crowi from '../crowi';


type ParameterType = Omit<IActivity, 'createdAt'>

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

  updateByParameters = async function(activityId: string, parameters: ParameterType, target?: IPage): Promise<void> {
    const activity = await Activity.findOneAndUpdate({ _id: activityId }, parameters, { new: true });

    // eslint-disable-next-line
    const shouldNotification = activity != null && target !== null && target !== undefined && (AllSupportedActionToNotifiedType as ReadonlyArray<string>).includes(activity.action);
    if (shouldNotification) {
      const notificationTargetUsers = await activity.getNotificationTargetUsers();
      const snapshotForInAppNotification = stringifySnapshot(target);
      await this.inAppNotificationService.upsertByActivity(notificationTargetUsers, activity, snapshotForInAppNotification);
      await this.inAppNotificationService.emitSocketIo(notificationTargetUsers);
    }
  };

  /**
   * @param {User} user
   * @return {Promise}
   */
  findByUser = function(user) {
    return this.find({ user }).sort({ createdAt: -1 }).exec();
  };

}

module.exports = ActivityService;
