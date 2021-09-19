import loggerFactory from '../../utils/logger';

import { ActivityDocument } from '../models/activity';

const InAppNotificationService = require('./in-app-notification');


const logger = loggerFactory('growi:service:ActivityService');

class ActivityService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * TODO: improve removeActivity that decleard in InAppNotificationService by GW-7481
   */

  // because mongoose's 'remove' hook fired only when remove by a method of Document (not by a Model method)
  // move 'save' hook from mongoose's events to activityEvent if I have a time.

  onRemoveActivity = async(): Promise<void> => {
    const ActivityEvent = this.crowi.event('activity');

    const activityEvent = new ActivityEvent();

    const inAppNotificationService = new InAppNotificationService(this.crowi);

    activityEvent.on('remove', async(activity: ActivityDocument) => {

      try {
        await inAppNotificationService.removeActivity(activity);
      }
      catch (err) {
        logger.error(err);
      }
    });
  }


}

module.exports = ActivityService;
