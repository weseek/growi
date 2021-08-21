import { toArrayFromCsv } from '~/utils/to-array-from-csv';

import {
  prepareSlackMessageForPage,
  prepareSlackMessageForComment,
} from '../../util/slack';

/**
 * service class of UserNotification
 */
class UserNotificationService {

  constructor(crowi) {
    this.crowi = crowi;

    this.Page = this.crowi.model('Page');
  }

  /**
   * fire user notification
   *
   * @memberof UserNotificationService
   *
   * @param {Page} page
   * @param {User} user
   * @param {string} slackChannelsStr comma separated string. e.g. 'general,channel1,channel2'
   * @param {string} mode 'create' or 'update' or 'comment'
   * @param {string} previousRevision
   * @param {Comment} comment
   */
  async fire(page, user, slackChannelsStr, mode, option, comment = {}) {
    const {
      appService, slackIntegrationService,
    } = this.crowi;

    const opt = option || {};
    const previousRevision = opt.previousRevision || '';

    await page.updateSlackChannels(slackChannelsStr);

    if (!slackIntegrationService.isSlackConfigured) {
      throw new Error('slackIntegrationService has not been set up');
    }

    // "dev,slacktest" => [dev,slacktest]
    const slackChannels = toArrayFromCsv(slackChannelsStr);
    // insert null if empty to notify once
    if (slackChannels.length === 0) {
      slackChannels.push(null);
    }

    const appTitle = appService.getAppTitle();
    const siteUrl = appService.getSiteUrl();

    const promises = slackChannels.map(async(chan) => {
      let messageObj;
      if (mode === 'comment') {
        messageObj = prepareSlackMessageForComment(comment, user, appTitle, siteUrl, chan, page.path);
      }
      else {
        messageObj = prepareSlackMessageForPage(page, user, appTitle, siteUrl, chan, mode, previousRevision);
      }

      return slackIntegrationService.postMessage(messageObj);
    });

    return Promise.allSettled(promises);
  }

}

module.exports = UserNotificationService;
