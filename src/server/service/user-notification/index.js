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
   * fire user notification for page
   *
   * @memberof UserNotificationService
   *
   * @param {Page} page
   * @param {User} user
   * @param {string} slackChannelsStr comma separated string. e.g. 'general,channel1,channel2'
   * @param {string} updateOrCreate 'create' or 'update'
   * @param {string} previousRevision
   */
  async fireForPage(page, user, slackChannelsStr, updateOrCreate, previousRevision = '') {
    const { slackNotificationService, slack } = this.crowi;

    await page.updateSlackChannels(slackChannelsStr);

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

  /**
   * fire user notification for comment
   *
   * @memberof UserNotificationService
   *
   * @param {Comment} Comment
   * @param {User} user
   * @param {string} slackChannelsStr comma separated string. e.g. 'general,channel1,channel2'
   * @param {Page} page
   */
  async fireForComment(comment, user, slackChannelsStr, page) {
    const { slackNotificationService, slack } = this.crowi;

    await page.updateSlackChannels(slackChannelsStr);

    if (!slackNotificationService.hasSlackConfig()) {
      throw new Error('slackNotificationService has not been set up');
    }

    // "dev,slacktest" => [dev,slacktest]
    const slackChannels = toArrayFromCsv(slackChannelsStr);

    const promises = slackChannels.map(async(chan) => {
      const res = await slack.postComment(comment, user, chan, page.path);
      if (res.status !== 'ok') {
        throw new Error(`fail to send slack notification to #${chan} channel`);
      }
      return res;
    });

    return Promise.allSettled(promises);
  }

}

module.exports = UserNotificationService;
