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

    const promises = slackChannels.map(async(chan) => {
      const res = await slack.postPage(page, user, chan, updateOrCreate, previousRevision);
      if (res.status !== 'ok') {
        throw new Error(`fail to send slack notification to #${chan} channel`);
      }
      return res;
    });

    return Promise.allSettled(promises);
  }

}

module.exports = UserNotificationService;
