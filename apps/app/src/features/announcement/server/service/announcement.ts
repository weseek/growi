import type { IPage } from '@growi/core';

import { Announcement, AnnouncementStatuses } from '~/features/announcement';
import loggerFactory from '~/utils/logger';

import type Crowi from '../../../../server/crowi';
import type { ActivityDocument } from '../../../../server/models/activity';
import type { PreNotifyProps } from '../../../../server/service/pre-notify';
import type { IAnnouncement, ParamsForAnnouncement } from '../../interfaces/announcement';

const logger = loggerFactory('growi:service:inAppNotification');

export default class AnnouncementService {

  crowi!: Crowi;

  activityEvent: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');

    this.getReadRate = this.getReadRate.bind(this);
    this.insertAnnouncement = this.insertAnnouncement.bind(this);
    this.doAnnounce = this.doAnnounce.bind(this);

  }

  getReadRate = async() => { };

  private insertAnnouncement = async(
      params: ParamsForAnnouncement,
  ): Promise<void> => {

    const {
      sender, comment, emoji, isReadReceiptTrackingEnabled, pageId, receivers,
    } = params;

    const announcement: IAnnouncement = {
      sender,
      comment,
      emoji,
      isReadReceiptTrackingEnabled,
      pageId,
      receivers: receivers.map((receiver) => {
        return {
          receiver,
          readStatus: AnnouncementStatuses.STATUS_UNREAD,
        };
      }),
    };

    const operation = [{
      insertOne: {
        document: announcement,
      },
    }];

    await Announcement.bulkWrite(operation);
    logger.info('Announcement bulkWrite has run');

    return;

  };

  doAnnounce = async(activity: ActivityDocument, target: IPage, params: ParamsForAnnouncement): Promise<void> => {

    this.insertAnnouncement(params);

    const preNotify = async(props: PreNotifyProps) => {

      const { notificationTargetUsers } = props;

      notificationTargetUsers?.push(...params.receivers);
    };

    this.activityEvent.emit('updated', activity, target, preNotify);

  };

}

module.exports = AnnouncementService;
