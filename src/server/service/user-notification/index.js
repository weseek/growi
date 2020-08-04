const logger = require('@alias/logger')('growi:service:UserNotificationService');

const toArrayFromCsv = require('@commons/util/to-array-from-csv');

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
   * @param {boolean} updateOrCreate
   * @param {string} previousRevision
   */
  async fire(page, user, slackChannelsStr, updateOrCreate, previousRevision) {
    const { slackNotificationService, slack } = this.crowi;

    try {
      await page.updateSlackChannel(slackChannelsStr);
    }
    catch (err) {
      throw new Error(err);
    }

    if (!slackNotificationService.hasSlackConfig()) {
      throw new Error('slackNotificationService has not been set up');
    }

    // "dev,slacktest" => [dev,slacktest]
    const slackChannels = toArrayFromCsv(slackChannelsStr);

    const promises = slackChannels.map((chan) => {
      return slack.postPage(page, user, chan, updateOrCreate, previousRevision);
    });

    Promise.allSettled(promises)
      .catch((err) => {
        logger.error('Error occured in sending slack notification: ', err);
      });
  }

}

module.exports = UserNotificationService;
