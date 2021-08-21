import mongoose from 'mongoose';

import { UpdatePostDocument, UpdatePostModel } from '~/server/models/update-post';
import { toArrayFromCsv } from '~/utils/to-array-from-csv';


import {
  prepareSlackMessageForPage,
  prepareSlackMessageForComment,
} from '../../util/slack';

/**
 * service class of UserNotification
 */
export class UserNotificationService {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crowi!: any;

  constructor(crowi) {
    this.crowi = crowi;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async fire(page, user, slackChannelsStr, mode, option, comment = {}): Promise<PromiseSettledResult<any>[]> {
    const {
      appService, slackIntegrationService,
    } = this.crowi;

    if (!slackIntegrationService.isSlackConfigured) {
      throw new Error('slackIntegrationService has not been set up');
    }

    // update slackChannels attribute asynchronously
    page.updateSlackChannels(slackChannelsStr);

    const opt = option || {};
    const previousRevision = opt.previousRevision || '';

    // "dev,slacktest" => [dev,slacktest]
    const slackChannels: (string|null)[] = toArrayFromCsv(slackChannelsStr);
    await this.putDefaultChannelIfEmpty(page.path, slackChannels);

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

  private async putDefaultChannelIfEmpty(pagePath:string, slackChannels: (string|null)[]): Promise<void> {
    const UpdatePost = mongoose.model<UpdatePostDocument, UpdatePostModel>('UpdatePost');

    const updatePosts = await UpdatePost.findSettingsByPath(pagePath);
    slackChannels.push(...(updatePosts).map(up => up.channel));

    // insert null if empty to notify once
    if (slackChannels.length === 0) {
      slackChannels.push(null);
    }
  }

}
