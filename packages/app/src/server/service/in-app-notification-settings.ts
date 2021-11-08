import InAppNotificationSettings from '~/server/models/in-app-notification-settings';
import Subscription, { STATUS_SUBSCRIBE } from '~/server/models/subscription';

import Crowi from '../crowi';

export default class InAppNotificationSettingsService {

  crowi!: Crowi;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
  }

  createSubscription = async(userId, pageId, targetRuleName) => {
    const inAppNotificationSettings = await InAppNotificationSettings.findOne({ userId });
    if (inAppNotificationSettings != null) {
      const subscribeRule = inAppNotificationSettings.subscribeRules.find(subscribeRule => subscribeRule.name === targetRuleName);
      if (subscribeRule !== undefined && subscribeRule.isEnabled) {
        await Subscription.subscribeByPageId(userId, pageId, STATUS_SUBSCRIBE);
      }
    }
  };

}

module.exports = InAppNotificationSettingsService;
