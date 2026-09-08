import { PageGrant } from '@growi/core';
import type { IUser } from '@growi/core/dist/interfaces';
import urljoin from 'url-join';

import {
  buildNotificationContent,
  type NotificationEventName,
} from '~/features/chat-integration/server/content';
import {
  createGen2NotificationDispatcher,
  DestinationRegistry,
  findGen2DestinationsForPathAndEvent,
} from '~/features/chat-integration/server/notification';
import type Crowi from '~/server/crowi';
import type { PageDocument } from '~/server/models/page';
import loggerFactory from '~/utils/logger';

import { growiInfoService } from '../growi-info';
import { GlobalNotificationMailService } from './global-notification-mail';
import { GlobalNotificationSlackService } from './global-notification-slack';
import type { GlobalNotificationEventVars } from './types';

const logger = loggerFactory('growi:service:GlobalNotificationService');

/**
 * `IPage.revision` is `Ref<IRevision> | undefined` -- either a populated
 * document or a bare ObjectId-like reference, depending on how the page was
 * fetched. This call site has no guarantee it is populated (unlike
 * `UserNotificationService`'s, which always receives a document with
 * `.revision.body` already available), so read the body defensively rather
 * than assuming a shape.
 */
const extractRevisionBody = (page: PageDocument): string => {
  const { revision } = page;
  if (revision != null && typeof revision === 'object' && 'body' in revision) {
    return (revision as { body: string }).body;
  }
  return '';
};

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
    await this.fireGen2Destinations(event, page, triggeredBy, vars);
  }

  /**
   * Dispatches to whichever Gen 2 destinations an admin configured for this
   * path + event (Requirement 2.1, 12.2, 12.3) -- 書き留める契機1
   * ("管理者がパス条件ごとに設定した通知", tasks.md 8.1). `DestinationRegistry`
   * iterates the resulting set generically -- this method never branches on
   * destination platform. The actual write to `chat_notification_outbox`
   * happens inside `createGen2NotificationDispatcher` (task 8.1's
   * `NotificationOutbox` boundary), not here.
   */
  private async fireGen2Destinations(
    event: string,
    page: PageDocument,
    triggeredBy: IUser,
    vars: GlobalNotificationEventVars,
  ): Promise<void> {
    try {
      const destinations = await findGen2DestinationsForPathAndEvent(
        page.path,
        event,
      );
      if (destinations.length === 0) {
        return;
      }

      // Markdown is built here, not inside the dispatcher: `enqueue` takes
      // an already-finished `markdown` because dropping a restricted page's
      // body must happen before the outbox ever sees it (design.md "文面は
      // NotificationContent が作る"). Built once per event/page, then reused
      // for every matched destination below.
      const siteUrl = growiInfoService.getSiteUrl();
      const pageId = page.id ?? page._id?.toString() ?? '';
      const { markdown, containsRestrictedPage } = buildNotificationContent({
        event: event as NotificationEventName,
        page: {
          grant: page.grant,
          path: page.path,
          // pageDelete/pageMove/pageLike never render a body (content/
          // notification-content.ts), so an empty fallback there is safe.
          body: extractRevisionBody(page),
        },
        pageUrl: urljoin(siteUrl, pageId),
        triggeredByUsername: triggeredBy.username,
        oldPath: vars.oldPath,
        commentBody: (vars.comment as { comment?: string } | undefined)
          ?.comment,
      });

      const registry = new DestinationRegistry(destinations);
      await registry.dispatchAll(
        createGen2NotificationDispatcher(markdown, containsRestrictedPage),
      );
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
