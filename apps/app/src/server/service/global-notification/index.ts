import { PageGrant } from '@growi/core';
import type { IUser } from '@growi/core/dist/interfaces';

import {
  DestinationRegistry,
  dispatchGen2Destination,
  findGen2DestinationsForPathAndEvent,
} from '~/features/chat-integration/server/notification';
import type Crowi from '~/server/crowi';
import type { PageDocument } from '~/server/models/page';
import loggerFactory from '~/utils/logger';

import { GlobalNotificationMailService } from './global-notification-mail';
import { GlobalNotificationSlackService } from './global-notification-slack';
import type { GlobalNotificationEventVars } from './types';

const logger = loggerFactory('growi:service:GlobalNotificationService');

/**
 * service class of GlobalNotificationSetting
 */
class GlobalNotificationService {
  crowi: Crowi;

  defaultLang: string;

  globalNotificationMailService: GlobalNotificationMailService;

  globalNotificationSlackService: GlobalNotificationSlackService;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.defaultLang = 'en_US'; // TODO: get defaultLang from app global config

    this.globalNotificationMailService = new GlobalNotificationMailService(
      crowi,
    );
    this.globalNotificationSlackService = new GlobalNotificationSlackService(
      crowi,
    );
  }

  /**
   * fire global notification
   *
   * @memberof GlobalNotificationService
   *
   * @param event event name triggered
   * @param page page triggered the event
   * @param triggeredBy user who triggered the event
   * @param vars event specific vars
   */
  async fire(
    event: string,
    page: PageDocument,
    triggeredBy: IUser,
    vars: GlobalNotificationEventVars = {},
  ): Promise<void> {
    logger.debug(`global notficatoin event ${event} was triggered`);

    // validation
    if (event == null || page.path == null || triggeredBy == null) {
      throw new Error(
        `invalid vars supplied to GlobalNotificationSlackService.generateOption for event ${event}`,
      );
    }

    if (!this.isSendNotification(page.grant)) {
      logger.info('this page does not send notifications');
      return;
    }

    // Gen 1's two existing destinations -- untouched call shape (Requirement
    // 12.2: setting up Gen 2 must not change Gen 1's behavior).
    await Promise.all([
      this.globalNotificationMailService.fire(event, page, triggeredBy, vars),
      this.globalNotificationSlackService.fire(
        event,
        page.id ?? page._id?.toString(),
        page.path,
        triggeredBy,
        vars,
      ),
    ]);

    // Gen 2's destinations are dispatched as a separate, additional step
    // OUTSIDE the Promise.all above -- never merged into Gen 1's fan-out
    // (Requirement 12.2, 12.3; design.md "既存の Promise.all の外に足す").
    // A failure here must not affect the Gen 1 sends that already completed.
    await this.fireGen2Destinations(event, page.path);
  }

  /**
   * Dispatches to whichever Gen 2 destinations an admin configured for this
   * path + event (Requirement 2.1, 12.2, 12.3). `DestinationRegistry`
   * iterates the resulting set generically -- this method never branches on
   * destination platform.
   */
  private async fireGen2Destinations(
    event: string,
    path: string,
  ): Promise<void> {
    try {
      const destinations = await findGen2DestinationsForPathAndEvent(
        path,
        event,
      );
      const registry = new DestinationRegistry(destinations);
      await registry.dispatchAll(dispatchGen2Destination);
    } catch (err) {
      logger.error('Gen 2 global notification dispatch failed', err);
    }
  }

  /**
   * fire global notification
   *
   * @memberof GlobalNotificationService
   *
   * @param grant page grant
   * @return isSendNotification
   */
  isSendNotification(grant: number): boolean {
    switch (grant) {
      case PageGrant.GRANT_PUBLIC:
        return true;
      case PageGrant.GRANT_RESTRICTED:
        return false;
      case PageGrant.GRANT_SPECIFIED:
        return false;
      case PageGrant.GRANT_OWNER:
        return (
          this.crowi.configManager.getConfig(
            'notification:owner-page:isEnabled',
          ) ?? false
        );
      case PageGrant.GRANT_USER_GROUP:
        return (
          this.crowi.configManager.getConfig(
            'notification:group-page:isEnabled',
          ) ?? false
        );
      default:
        return false;
    }
  }
}

export { GlobalNotificationService };
