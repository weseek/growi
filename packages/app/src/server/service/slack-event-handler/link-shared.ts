import { parseISO, format } from 'date-fns';
import {
  MessageAttachment, LinkUnfurls, WebClient,
} from '@slack/web-api';
import { GrowiBotEvent } from '@growi/slack';
import { SlackEventHandler } from './base-event-handler';
import {
  DataForUnfurl, PublicData, UnfurlEventLink, UnfurlRequestEvent,
} from '../../interfaces/slack-integration/unfurl-event';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:SlackEventHandler:link-shared');

export class LinkSharedEventHandler implements SlackEventHandler<UnfurlRequestEvent> {

  crowi!: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  shouldHandle(eventType: string): boolean {
    return eventType === 'link_shared';
  }

  async handleEvent(client: WebClient, growiBotEvent: GrowiBotEvent<UnfurlRequestEvent>, data: {origin: string}): Promise<void> {
    const { event } = growiBotEvent;
    const { origin } = data;
    const { channel, message_ts: ts, links } = event;

    const unfurlData = await this.generateUnfurlsObject(links);

    // unfurl
    const unfurlResults = await Promise.allSettled(unfurlData.map(async(data: DataForUnfurl) => {
      // datum determines the unfurl appearance for each link
      const targetUrl = `${origin}${data.path}`;

      let unfurls;

      if (data.isPublic === false) {
        unfurls = {
          [targetUrl]: {
            text: 'Page is not public.',
          },
        };
      }
      else {
        unfurls = this.generateLinkUnfurls(data as PublicData, targetUrl);
      }

      await client.chat.unfurl({
        channel,
        ts,
        unfurls,
      });
    }));

    this.logErrorRejectedResults(unfurlResults);
  }

  // builder method for unfurl parameter
  generateLinkUnfurls(body: PublicData, growiTargetUrl: string): LinkUnfurls {
    const { pageBody: text, updatedAt, commentCount } = body;

    const updatedAtFormatted = format(parseISO(updatedAt), 'yyyy-MM-dd HH:mm');
    const footer = `updated at: ${updatedAtFormatted}  comments: ${commentCount}`;

    const attachment: MessageAttachment = {
      text,
      footer,
      // TODO: consider whether to keep these buttons
      actions: [
        {
          type: 'button',
          text: 'View',
          url: growiTargetUrl,
        },
        {
          type: 'button',
          text: 'Edit',
          url: `${growiTargetUrl}#edit`,
        },
      ],
    };
    const unfurls: LinkUnfurls = {
      [growiTargetUrl]: attachment,
    };
    return unfurls;
  }

  async generateUnfurlsObject(links: UnfurlEventLink[]): Promise<DataForUnfurl[]> {
    // generate paths array
    const paths: string[] = links.map((link) => {
      const { url: growiTargetUrl } = link;
      const urlObject = new URL(growiTargetUrl);
      return urlObject.pathname;
    });

    // get pages with revision
    const Page = this.crowi.model('Page');
    const { PageQueryBuilder } = Page;
    const pageQueryBuilder = new PageQueryBuilder(Page.find());
    const pages = await pageQueryBuilder
      .addConditionToListByPathsArray(paths)
      .query
      .populate('revision')
      .lean()
      .exec();

    const unfurlData: DataForUnfurl[] = [];
    pages.forEach((page) => {
      // not send non-public page
      if (page.grant !== Page.GRANT_PUBLIC) {
        return unfurlData.push({ isPublic: false, path: page.path });
      }

      // send the public page data with isPrivate: false
      const { updatedAt, commentCount } = page;
      const { body } = page.revision;
      unfurlData.push({
        isPublic: true, path: page.path, pageBody: body, updatedAt, commentCount,
      });
    });

    return unfurlData;
  }

  // Promise util method to output rejected results
  logErrorRejectedResults<T>(results: PromiseSettledResult<T>[]): void {
    const rejectedResults: PromiseRejectedResult[] = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    rejectedResults.forEach((rejected, i) => {
      logger.error(`Error occurred (count: ${i}): `, rejected.reason.toString());
    });
  }

}
